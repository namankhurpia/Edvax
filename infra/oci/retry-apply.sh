#!/usr/bin/env bash
# Keep trying `terraform apply` until Oracle has Always-Free capacity.
# Cycles through Mumbai's availability domains on each attempt to dodge the
# "Out of host capacity" / 500-InternalError that the free ARM shape throws.
#
# Prereqs on YOUR machine (not in this sandbox):
#   1. Terraform installed.
#   2. OCI auth configured — either ~/.oci/config + key, or env vars:
#        export TF_VAR_... as needed, and the standard OCI_* / provider auth.
#      The provider block reads your default OCI profile automatically.
#   3. Run `terraform init` once in this folder before starting the loop.
#
# Usage:
#   cd infra/oci
#   terraform init
#   ./retry-apply.sh            # retries forever, ~60s apart
#   ./retry-apply.sh 30 200     # 30s between tries, give up after 200 attempts
set -u

DELAY="${1:-60}"          # seconds between attempts
MAX_TRIES="${2:-0}"       # 0 = unlimited

# Mumbai availability domains. If your tenancy only has AD-1, the others simply
# fail fast and the loop moves on — harmless. Adjust the prefix (aBZL) if your
# tenancy shows a different AD name in the console.
ADS=(
  "aBZL:AP-MUMBAI-1-AD-1"
  "aBZL:AP-MUMBAI-1-AD-2"
  "aBZL:AP-MUMBAI-1-AD-3"
)

i=0
while :; do
  i=$((i + 1))
  ad="${ADS[$(( (i - 1) % ${#ADS[@]} ))]}"
  echo "──────────────────────────────────────────────"
  echo "Attempt #$i  →  availability_domain = $ad  ($(date '+%H:%M:%S'))"

  if terraform apply -auto-approve -var "availability_domain=$ad"; then
    echo "✅ SUCCESS on attempt #$i in $ad"
    echo "Public IP / SSH command:"
    terraform output
    exit 0
  fi

  echo "❌ Attempt #$i failed (likely out of capacity). Retrying in ${DELAY}s…"

  if [ "$MAX_TRIES" -ne 0 ] && [ "$i" -ge "$MAX_TRIES" ]; then
    echo "Reached MAX_TRIES=$MAX_TRIES without capacity. Stopping."
    exit 1
  fi
  sleep "$DELAY"
done
