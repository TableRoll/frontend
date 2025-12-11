# Quick Deployment Checklist

Follow these steps to deploy your D&D Campaign Management System to your server.

## 📋 Pre-Deployment Checklist

### On Your Local Machine (Before Going to Server)

- [ ] **1. Generate Secrets**
  ```bash
  # Run the preparation script
  ./prepare-deployment.sh
  
  # Or on Windows:
  prepare-deployment.bat
  ```
  
  This creates:
  - `deployment-secrets.txt` (save this securely!)
  - `docker.env` (needs your domain)

- [ ] **2. Update Configuration Files**
  
  Edit `docker.env`:
  ```bash
  # Replace these with your actual domain
  FRONTEND_URL=https://yourdomain.com
  REACT_APP_API_URL=https://yourdomain.com/api
  ```
  
  Edit `docker-compose.yml`:
  - Replace `POSTGRES_PASSWORD` with generated password
  - Replace `JWT_SECRET` with generated secret
  - Replace `GF_SECURITY_ADMIN_PASSWORD` with generated password
  - Set `ALLOW_DEV_TOKEN: "false"`

- [ ] **3. Prepare Your Code**
  ```bash
  # Commit your changes
  git add .
  git commit -m "Prepare for deployment"
  git push
  ```

---

## 🖥️ On Your Server

### Step 1: Initial Server Setup

```bash
# Connect to your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Add your user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

### Step 2: Clone Your Repository

```bash
# Navigate to where you want the app
cd /opt  # or /home/youruser, or wherever you prefer

# Clone your repository
git clone <your-repository-url>
cd frontend

# Or if you have the code already, upload it via SCP:
# scp -r /path/to/frontend user@server:/opt/frontend
```

### Step 3: Set Up Environment

```bash
# Copy your prepared docker.env file to server
# (Upload it via SCP or recreate it)

# On server, create docker.env
nano docker.env
# Paste your configuration from local machine
```

Or upload it:
```bash
# From local machine
scp docker.env user@server:/opt/frontend/docker.env
```

### Step 4: Update docker-compose.yml

```bash
# Edit docker-compose.yml on server
nano docker-compose.yml

# Update these values:
# - POSTGRES_PASSWORD: (from deployment-secrets.txt)
# - JWT_SECRET: (from deployment-secrets.txt)
# - GF_SECURITY_ADMIN_PASSWORD: (from deployment-secrets.txt)
# - FRONTEND_URL: https://yourdomain.com
# - ALLOW_DEV_TOKEN: "false"
```

### Step 5: Set Up Domain and DNS

**If you have a domain:**

1. Point your domain to your server's IP:
   - Go to your domain registrar
   - Add A record: `@` → `your-server-ip`
   - Add A record: `www` → `your-server-ip`
   - Wait for DNS propagation (can take up to 48 hours, usually 5-30 minutes)

2. Verify DNS:
   ```bash
   # Check if DNS is working
   nslookup yourdomain.com
   dig yourdomain.com
   ```

**If you don't have a domain:**
- You can use your server's IP address directly
- Update `FRONTEND_URL` to `http://your-server-ip`
- Note: You won't be able to use HTTPS without a domain

### Step 6: Set Up SSL/HTTPS (Recommended)

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/dnd-app
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 100M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/dnd-app /etc/nginx/sites-enabled/
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Reload Nginx
sudo systemctl reload nginx
```

**Update docker-compose.yml** to bind to localhost only:

```yaml
frontend:
  ports:
    - "127.0.0.1:3000:80"  # Only localhost
api:
  ports:
    - "127.0.0.1:3001:3001"  # Only localhost
```

### Step 7: Configure Firewall

```bash
# Allow SSH (important!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 8: Deploy the Application

```bash
# Navigate to project directory
cd /opt/frontend  # or wherever you cloned it

# Build and start all services
docker-compose up -d

# Check if everything is running
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 9: Verify Deployment

1. **Check containers are running:**
   ```bash
   docker-compose ps
   # All services should show "Up"
   ```

2. **Check application health:**
   ```bash
   # API health check
   curl http://localhost:3001/health
   
   # Should return: {"status":"OK",...}
   ```

3. **Access your application:**
   - Open browser: `https://yourdomain.com`
   - Should see the login page

4. **Test functionality:**
   - Register a new account
   - Create a campaign
   - Upload a map
   - Create a character

### Step 10: Set Up Backups (Important!)

```bash
# Create backup directory
sudo mkdir -p /backups/dnd-db
sudo chown $USER:$USER /backups/dnd-db

# Create backup script
nano backup-db.sh
```

Paste this:

```bash
#!/bin/bash
BACKUP_DIR="/backups/dnd-db"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec dnd-database pg_dump -U postgres dnd_campaign_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x backup-db.sh

# Test it
./backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /opt/frontend/backup-db.sh >> /var/log/dnd-backup.log 2>&1
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at your domain
- [ ] HTTPS working (SSL certificate valid)
- [ ] Can register new account
- [ ] Can login
- [ ] Can create campaign
- [ ] Can upload files
- [ ] Database backups configured
- [ ] Firewall configured
- [ ] Default passwords changed
- [ ] Dev token disabled
- [ ] Delete `deployment-secrets.txt` from server
- [ ] Store secrets in password manager

---

## 🔄 Updating the Application

When you need to update:

```bash
# On server
cd /opt/frontend

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 🆘 Troubleshooting

### Application not accessible

```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Database connection issues

```bash
# Check database is running
docker exec dnd-database pg_isready -U postgres

# Check database logs
docker-compose logs database
```

### Port conflicts

```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :3001

# Change ports in docker-compose.yml if needed
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
```

---

## 📞 Need Help?

1. Check logs: `docker-compose logs -f [service-name]`
2. Verify environment variables in `docker.env`
3. Check firewall: `sudo ufw status`
4. Verify DNS: `nslookup yourdomain.com`
5. Check Nginx: `sudo nginx -t`

---

## 🎉 You're Done!

Your application should now be live at `https://yourdomain.com`

**Remember:**
- Keep your secrets secure
- Regular backups are important
- Monitor your application
- Keep Docker and system updated

