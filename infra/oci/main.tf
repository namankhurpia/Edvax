# EDVAX — Oracle Cloud (Always Free) instance.
# Corrected from the console-generated config:
#  - public IP enabled (so you can SSH + serve the site)
#  - security list opening 22 (SSH), 80 (HTTP), 443 (HTTPS)
#  - availability_domain is a variable so the retry script can cycle AD-1/2/3
#  - cloud-init installs Docker + compose plugin and opens the host firewall
#
# Provider auth comes from your environment / ~/.oci/config (never hard-coded here).

provider "oci" {}

# ---- Variables ----
variable "availability_domain" {
  description = "AD to launch in. Cycled by the retry script to dodge 'out of host capacity'."
  type        = string
  default     = "aBZL:AP-MUMBAI-1-AD-1"
}

variable "compartment_id" {
  type    = string
  default = "ocid1.tenancy.oc1..aaaaaaaabjgrac6jp6oktlbjxeyyqixe4sukdyy4vivfgpex7altfgxo2ssq"
}

variable "ssh_public_key" {
  description = "SSH public key for the 'ubuntu'/'opc' login."
  type        = string
  default     = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDt9kE9LF2tPWHmuybLK0NKgonBSArg2hRAqc1IDOKlO8cPFwgHF6eJ8m1LnHe9axT3iRly9pb+75nRL1kOGuH1Rj9OMBKAJWHRDOqz3KXfb92VO9Y+bynmDJftajJprRuuqZck95gqJkYnw+Q/UfRr16Wlyx9JNs/B9iGFnfXFag9AugOBg3s01sqsRaSw1TTlF0IuBzhBaRc57JJ+fQ+oskAPNO5pEtIdFbKnvH473H+FBhoK3Y3KTGTg9wbG5unyZS+4/IZErySKdSldwLTMORRrFPcwGM9k5o9p9AK52p8tingIojqt0SWNT8BkpkMSsIe19CTPetP2EabBYtTx ssh-key-2026-06-22"
}

variable "instance_image_id" {
  description = "OS image OCID (Mumbai region). Keep the one from the console wizard."
  type        = string
  default     = "ocid1.image.oc1.ap-mumbai-1.aaaaaaaaadmdg6ba7uxnieefn7cxfik4ouqsbk4mpvm45vpmdkpa7ozgpjuq"
}

# ---- Compute instance ----
resource "oci_core_instance" "edvax" {
  availability_domain = var.availability_domain
  compartment_id      = var.compartment_id
  display_name        = "edvax-app"
  shape               = "VM.Standard.A1.Flex" # Always Free eligible (ARM)

  shape_config {
    ocpus         = 1
    memory_in_gbs = 6
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.edvax.id
    assign_public_ip = true # CHANGED: was false — required to reach the instance
  }

  source_details {
    source_type             = "image"
    source_id               = var.instance_image_id
    boot_volume_size_in_gbs = 50 # 50 GB is plenty; Always Free cap is 200 GB total
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    # Installs Docker so EDVAX deploys with ./deploy.sh and opens host firewall.
    user_data = base64encode(file("${path.module}/cloud-init.sh"))
  }

  agent_config {
    is_monitoring_disabled  = false
    is_management_disabled  = false
  }

  # Capacity errors are transient; don't let TF wait forever on a doomed try.
  timeouts {
    create = "10m"
  }
}

# ---- Network ----
resource "oci_core_vcn" "edvax" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.compartment_id
  display_name   = "edvax-vcn"
  dns_label      = "edvaxvcn"
}

resource "oci_core_internet_gateway" "edvax" {
  compartment_id = var.compartment_id
  display_name   = "edvax-igw"
  enabled        = true
  vcn_id         = oci_core_vcn.edvax.id
}

resource "oci_core_default_route_table" "edvax" {
  manage_default_resource_id = oci_core_vcn.edvax.default_route_table_id
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.edvax.id
  }
}

# Security list: open SSH (22), HTTP (80), HTTPS (443). CHANGED: none existed before.
resource "oci_core_security_list" "edvax" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.edvax.id
  display_name   = "edvax-seclist"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_subnet" "edvax" {
  cidr_block        = "10.0.1.0/24"
  compartment_id    = var.compartment_id
  vcn_id            = oci_core_vcn.edvax.id
  display_name      = "edvax-subnet"
  dns_label         = "edvaxsubnet"
  route_table_id    = oci_core_vcn.edvax.default_route_table_id
  security_list_ids = [oci_core_security_list.edvax.id]
}

# ---- Handy outputs ----
output "instance_public_ip" {
  value = oci_core_instance.edvax.public_ip
}

output "ssh_command" {
  value = "ssh ubuntu@${oci_core_instance.edvax.public_ip}"
}
