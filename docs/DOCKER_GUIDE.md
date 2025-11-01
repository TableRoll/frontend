# Docker Setup Guide for D&D Campaign Management System

This guide explains how to run the D&D Campaign Management System using Docker containers.

## 🐳 Architecture Overview

The application consists of three main components:

- **Frontend**: React application served by Nginx
- **API**: Node.js/Express backend server
- **Database**: PostgreSQL database

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB of available RAM
- Ports 3000, 3001, and 5432 available

## 🚀 Quick Start

### Production Setup

1. **Clone and navigate to the project directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: localhost:5432

### Development Setup

For development with hot reload:

1. **Start only the database and API:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run the frontend locally:**
   ```bash
   npm install
   npm start
   ```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `database` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `dnd_campaign_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `dnd_password_2024` |
| `JWT_SECRET` | JWT signing secret | `your_super_secret_jwt_key_change_in_production` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | API port | `3001` |

### Custom Configuration

To customize the setup:

1. **Copy the environment file:**
   ```bash
   cp docker.env .env
   ```

2. **Edit the values in `.env`**

3. **Update `docker-compose.yml` to use your `.env` file:**
   ```yaml
   services:
     api:
       env_file:
         - .env
   ```

## 📊 Service Management

### View Running Services
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs frontend
docker-compose logs database
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
```

## 🔍 Health Checks

The application includes health checks for monitoring:

- **API Health**: http://localhost:3001/health
- **Frontend Health**: http://localhost:3000/health
- **Database**: Automatic health check in Docker Compose

## 🗄️ Database Management

### Access Database
```bash
# Connect to PostgreSQL container
docker-compose exec database psql -U postgres -d dnd_campaign_db

# Or use external client
# Host: localhost
# Port: 5432
# Database: dnd_campaign_db
# User: postgres
# Password: dnd_password_2024
```

### Database Migrations
Migrations are automatically run when the database container starts. The migration files are located in `database/migrations/`.

### Backup Database
```bash
# Create backup
docker-compose exec database pg_dump -U postgres dnd_campaign_db > backup.sql

# Restore backup
docker-compose exec -T database psql -U postgres dnd_campaign_db < backup.sql
```

## 🚀 Production Deployment

### Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Enable HTTPS** with proper SSL certificates
4. **Configure firewall rules**
5. **Use Docker secrets** for sensitive data

### Production Environment File

Create a production-specific environment file:

```bash
# .env.production
DB_PASSWORD=your_strong_production_password
JWT_SECRET=your_very_strong_jwt_secret_key
NODE_ENV=production
```

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
  database:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection failed:**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Restart database
   docker-compose restart database
   ```

3. **API not responding:**
   ```bash
   # Check API logs
   docker-compose logs api
   
   # Check if database is healthy
   docker-compose ps
   ```

4. **Frontend build failed:**
   ```bash
   # Check build logs
   docker-compose logs frontend
   
   # Rebuild without cache
   docker-compose build --no-cache frontend
   ```

### Debug Mode

Run services in debug mode:

```bash
# Run with verbose logging
docker-compose up --verbose

# Run in foreground to see all logs
docker-compose up
```

### Clean Up

```bash
# Remove all containers and networks
docker-compose down

# Remove everything including volumes (WARNING: deletes data)
docker-compose down -v --remove-orphans

# Remove unused images
docker image prune

# Remove everything (nuclear option)
docker system prune -a
```

## 📈 Monitoring

### Container Stats
```bash
# Real-time stats
docker stats

# Specific container stats
docker stats dnd-api dnd-frontend dnd-database
```

### Log Monitoring
```bash
# Follow logs in real-time
docker-compose logs -f

# Follow specific service logs
docker-compose logs -f api
```

## 🔄 Updates

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Dependencies
```bash
# Rebuild specific service
docker-compose build --no-cache api
docker-compose up -d api
```

## 📝 Additional Commands

### Useful Docker Commands

```bash
# Execute command in running container
docker-compose exec api npm install

# View container details
docker inspect dnd-api

# Access container shell
docker-compose exec api sh

# Copy files to/from container
docker cp dnd-api:/app/uploads ./local-uploads
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Restart services: `docker-compose restart`

For additional help, refer to the main project documentation or create an issue in the project repository.
