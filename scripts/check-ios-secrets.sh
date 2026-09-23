#!/usr/bin/env bash
# Fail before a macOS runner is used when TestFlight secrets are missing or malformed.
# Prints names and what to fix. Never prints secret values.
set -euo pipefail

required=(
  APP_STORE_CONNECT_API_KEY_ID
  APP_STORE_CONNECT_ISSUER_ID
  APP_STORE_CONNECT_API_KEY
  APPLE_TEAM_ID
)

missing=()
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "::error::Missing GitHub Actions secrets: ${missing[*]}. Add them under Settings → Secrets and variables → Actions. Exact names and the App Store Connect clicks are in docs/TESTFLIGHT.md."
  exit 1
fi

errors=()

key_id="$(printf '%s' "$APP_STORE_CONNECT_API_KEY_ID" | tr -d '[:space:]')"
if [[ ! "$key_id" =~ ^[A-Za-z0-9]{10}$ ]]; then
  errors+=("APP_STORE_CONNECT_API_KEY_ID must be the 10-character Key ID from App Store Connect → Users and Access → Integrations → App Store Connect API. It is not the Team ID and not the Issuer ID.")
fi

issuer="$(printf '%s' "$APP_STORE_CONNECT_ISSUER_ID" | tr -d '[:space:]')"
if [[ ! "$issuer" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
  errors+=("APP_STORE_CONNECT_ISSUER_ID must be the Issuer ID UUID at the top of the App Store Connect API keys page.")
fi

team="$(printf '%s' "$APPLE_TEAM_ID" | tr -d '[:space:]')"
if [[ ! "$team" =~ ^[A-Za-z0-9]{10}$ ]]; then
  errors+=("APPLE_TEAM_ID must be the 10-character Team ID from developer.apple.com/account → Membership. It is not the Key ID.")
fi

key_raw="$APP_STORE_CONNECT_API_KEY"
if [[ "$key_raw" == *"BEGIN PRIVATE KEY"* ]]; then
  if [[ "$key_raw" != *"END PRIVATE KEY"* ]]; then
    errors+=("APP_STORE_CONNECT_API_KEY contains BEGIN PRIVATE KEY but not END PRIVATE KEY. Paste the whole .p8, or store one-line base64 of the file. See docs/TESTFLIGHT.md.")
  fi
else
  compact="$(printf '%s' "$key_raw" | tr -d '[:space:]')"
  if [[ ! "$compact" =~ ^[A-Za-z0-9+/=]+$ ]] || [[ ${#compact} -lt 80 ]]; then
    errors+=("APP_STORE_CONNECT_API_KEY must be the AuthKey .p8 as one-line base64 (no BEGIN line). See docs/TESTFLIGHT.md.")
  fi
fi

if [[ ${#errors[@]} -gt 0 ]]; then
  for message in "${errors[@]}"; do
    echo "::error::$message"
  done
  exit 1
fi

echo "App Store Connect secrets are present and shaped correctly."
