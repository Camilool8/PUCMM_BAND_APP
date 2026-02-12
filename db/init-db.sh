#!/bin/bash
set -e

# Create platform_admin database (pucmm_band is created automatically by POSTGRES_DB)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE platform_admin OWNER $POSTGRES_USER;
EOSQL

echo "Created platform_admin database"
