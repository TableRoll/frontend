#!/bin/bash
# D&D Campaign Management System - Pre-Deployment Preparation Script
# This script generates secure passwords and secrets for deployment

set -e  # Exit on error

echo "=== D&D Campaign Management System - Deployment Preparation ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: openssl is not installed${NC}"
    echo "Please install openssl: sudo apt install openssl"
    exit 1
fi

# Generate passwords
echo -e "${GREEN}Generating secure passwords and secrets...${NC}"
echo ""

DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
GRAFANA_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Create secrets file
SECRETS_FILE="deployment-secrets.txt"

cat > "$SECRETS_FILE" << EOF
# D&D Campaign Management System - Deployment Secrets
# Generated: $TIMESTAMP
# 
# ⚠️  IMPORTANT: Keep this file secure and delete after deployment!
# ⚠️  DO NOT commit this file to git!
# ⚠️  Store these secrets in a password manager after deployment

# ============================================
# DATABASE CONFIGURATION
# ============================================
Database Password: $DB_PASSWORD

# ============================================
# API CONFIGURATION
# ============================================
JWT Secret: $JWT_SECRET

# ============================================
# MONITORING CONFIGURATION
# ============================================
Grafana Admin Password: $GRAFANA_PASSWORD

# ============================================
# DEPLOYMENT INSTRUCTIONS
# ============================================
1. Copy these values to your docker-compose.yml:
   - POSTGRES_PASSWORD: $DB_PASSWORD
   - JWT_SECRET: $JWT_SECRET
   - GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD

2. Copy these values to your docker.env file:
   - DB_PASSWORD=$DB_PASSWORD
   - JWT_SECRET=$JWT_SECRET

3. After deployment:
   - Delete this file: rm $SECRETS_FILE
   - Store secrets in a secure password manager
   - Never commit secrets to git

# ============================================
# SECURITY NOTES
# ============================================
- Database Password: 32 characters, base64 encoded
- JWT Secret: 64 characters, base64 encoded
- Grafana Password: 32 characters, base64 encoded
- All secrets are cryptographically secure random values
EOF

echo -e "${GREEN}✓ Secrets generated successfully!${NC}"
echo ""
echo -e "${YELLOW}=== Generated Secrets (SAVE THESE SECURELY) ===${NC}"
echo ""
echo "Database Password:"
echo -e "${GREEN}$DB_PASSWORD${NC}"
echo ""
echo "JWT Secret:"
echo -e "${GREEN}$JWT_SECRET${NC}"
echo ""
echo "Grafana Admin Password:"
echo -e "${GREEN}$GRAFANA_PASSWORD${NC}"
echo ""
echo -e "${GREEN}Secrets saved to: $SECRETS_FILE${NC}"
echo ""

# Create docker.env template if it doesn't exist
if [ ! -f "docker.env" ]; then
    echo -e "${YELLOW}Creating docker.env template...${NC}"
    
    if [ -f "docker.env.example" ]; then
        cp docker.env.example docker.env
        echo -e "${GREEN}✓ Created docker.env from docker.env.example${NC}"
        echo -e "${YELLOW}  Please edit docker.env and add the generated secrets${NC}"
    else
        cat > docker.env << EOF
# D&D Campaign Management System - Environment Variables
# Generated: $TIMESTAMP

# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_NAME=dnd_campaign_db
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD

# API Configuration
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=https://yourdomain.com
ALLOW_DEV_TOKEN=false

# Frontend Configuration
REACT_APP_API_URL=https://yourdomain.com/api
EOF
        echo -e "${GREEN}✓ Created docker.env template${NC}"
        echo -e "${YELLOW}  Please update FRONTEND_URL and REACT_APP_API_URL with your domain${NC}"
    fi
    echo ""
fi

# Check if docker-compose.yml exists and needs updating
if [ -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Checking docker-compose.yml...${NC}"
    
    # Check if it still has default values
    if grep -q "dnd_password_2024" docker-compose.yml || grep -q "your_super_secret_jwt_key" docker-compose.yml; then
        echo -e "${RED}⚠️  WARNING: docker-compose.yml contains default passwords!${NC}"
        echo -e "${YELLOW}  Please update docker-compose.yml with the generated secrets${NC}"
        echo ""
        echo "  Replace in docker-compose.yml:"
        echo "    - POSTGRES_PASSWORD: dnd_password_2024"
        echo "      → POSTGRES_PASSWORD: $DB_PASSWORD"
        echo ""
        echo "    - JWT_SECRET: your_super_secret_jwt_key_change_in_production"
        echo "      → JWT_SECRET: $JWT_SECRET"
        echo ""
        echo "    - GF_SECURITY_ADMIN_PASSWORD: admin"
        echo "      → GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD"
        echo ""
    else
        echo -e "${GREEN}✓ docker-compose.yml appears to be configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
fi

echo ""
echo -e "${RED}⚠️  IMPORTANT SECURITY REMINDERS:${NC}"
echo ""
echo "  1. Review $SECRETS_FILE"
echo "  2. Copy values to your configuration files (docker-compose.yml, docker.env)"
echo "  3. Update FRONTEND_URL and REACT_APP_API_URL with your actual domain"
echo "  4. Delete $SECRETS_FILE after deployment"
echo "  5. Store secrets in a secure password manager"
echo "  6. Never commit secrets to git (check .gitignore)"
echo "  7. Set ALLOW_DEV_TOKEN=false in production"
echo ""
echo -e "${GREEN}✓ Preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and update docker.env with your domain"
echo "  2. Update docker-compose.yml with generated secrets"
echo "  3. Proceed with deployment: docker-compose up -d"
echo ""

