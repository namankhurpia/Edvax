#!/bin/bash
# Runs once on first boot. Installs Docker + compose plugin and opens the host
# firewall so EDVAX can be deployed and served immediately.
set -e

# Detect Ubuntu vs Oracle Linux (free tier images can be either).
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y ca-certificates curl git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  usermod -aG docker ubuntu || true
else
  # Oracle Linux / RHEL family
  dnf install -y dnf-utils git
  dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  usermod -aG docker opc || true
fi

systemctl enable --now docker

# Oracle Linux uses firewalld; Ubuntu images usually rely on the OCI security list,
# but the default iptables can still block 80/443. Open them at the host level too.
if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-port=80/tcp
  firewall-cmd --permanent --add-port=443/tcp
  firewall-cmd --reload
else
  # Insert ACCEPT rules ahead of the default REJECT that Oracle's Ubuntu images ship.
  iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT || true
  iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT || true
  # Persist if netfilter-persistent is available.
  command -v netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save || true
fi

echo "cloud-init: Docker installed and ports 80/443 opened." > /var/log/edvax-cloud-init.done
