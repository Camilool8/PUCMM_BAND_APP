#!/bin/sh

# Generate runtime config from environment variables
cat > /app/public/config.js << EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-}",
  NEXT_PUBLIC_SITE_URL: "${NEXT_PUBLIC_SITE_URL:-}",
  NEXT_PUBLIC_AZURE_AD_CLIENT_ID: "${NEXT_PUBLIC_AZURE_AD_CLIENT_ID:-}",
  NEXT_PUBLIC_AZURE_AD_TENANT_ID: "${NEXT_PUBLIC_AZURE_AD_TENANT_ID:-}",
};
EOF

echo "Runtime config generated:"
cat /app/public/config.js

# Start the application
exec node server.js
