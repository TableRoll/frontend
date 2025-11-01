# Monitoring Setup - Grafana & Prometheus

## Overview

Your D&D Campaign Management System now includes comprehensive monitoring with:
- **Grafana** - Beautiful dashboards for visualization
- **Prometheus** - Metrics collection and storage
- **Node Exporter** - System-level metrics (CPU, RAM, Disk)
- **cAdvisor** - Container-level metrics
- **Postgres Exporter** - Database metrics

---

## 🚀 Quick Start

### Start All Services Including Monitoring

```bash
docker-compose up -d
```

### Access the Monitoring Tools

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3002 | Username: `admin`<br>Password: `admin` |
| **Prometheus** | http://localhost:9090 | No auth required |
| **cAdvisor** | http://localhost:8080 | No auth required |
| **Node Exporter** | http://localhost:9100/metrics | No auth required |

---

## 📊 Grafana Dashboards

### Pre-configured Dashboard: "D&D Campaign System Monitor"

The dashboard includes:

1. **CPU Usage Gauge** - Overall system CPU usage
2. **Memory Usage Gauge** - System RAM usage
3. **Disk Usage Gauge** - Root filesystem usage
4. **Running Containers** - Count of active containers
5. **Container CPU Usage** - CPU per container over time
6. **Container Memory Usage** - RAM per container over time
7. **Network I/O** - Network traffic per container
8. **Container Storage Usage** - Disk space per container

### Accessing Dashboards

1. Open http://localhost:3002
2. Login with `admin` / `admin`
3. Change password when prompted (or skip)
4. Click "Dashboards" → "D&D Campaign System Monitor"

---

## 🔍 What's Being Monitored

### System Metrics (Node Exporter)
- ✅ CPU usage (total and per core)
- ✅ Memory usage (total, available, cached)
- ✅ Disk usage (capacity, I/O operations)
- ✅ Network traffic (bytes sent/received)
- ✅ System uptime
- ✅ Load average

### Container Metrics (cAdvisor)
- ✅ CPU usage per container
- ✅ Memory usage per container
- ✅ Network I/O per container
- ✅ Filesystem usage per container
- ✅ Container restart count

### Database Metrics (Postgres Exporter)
- ✅ Active connections
- ✅ Database size
- ✅ Query performance
- ✅ Transaction rate
- ✅ Cache hit ratio

### Application Containers Monitored:
- `dnd-database` (PostgreSQL)
- `dnd-api` (Node.js API)
- `dnd-frontend` (React/Nginx)

---

## 📈 Understanding the Metrics

### CPU Usage
```
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
- **Green**: < 70% (Normal)
- **Yellow**: 70-90% (Warning)
- **Red**: > 90% (Critical)

### Memory Usage
```
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```
- **Green**: < 70% (Normal)
- **Yellow**: 70-90% (Warning)
- **Red**: > 90% (Critical - may cause OOM)

### Disk Usage
```
100 - ((node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes)
```
- **Green**: < 70% (Normal)
- **Yellow**: 70-90% (Warning)
- **Red**: > 90% (Critical - clean up needed)

---

## 🛠️ Configuration

### Prometheus Configuration

File: `prometheus.yml`

```yaml
global:
  scrape_interval: 15s  # Scrape metrics every 15 seconds
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'    # System metrics
  - job_name: 'cadvisor'         # Container metrics
  - job_name: 'postgres'         # Database metrics
```

### Grafana Configuration

Files:
- `grafana/provisioning/datasources/prometheus.yml` - Auto-configure Prometheus
- `grafana/provisioning/dashboards/default.yml` - Auto-load dashboards
- `grafana/provisioning/dashboards/dnd-system-monitor.json` - Main dashboard

---

## 🔧 Customization

### Add More Dashboards

1. Create dashboard in Grafana UI
2. Export as JSON: Share → Export → Save to file
3. Copy JSON to `grafana/provisioning/dashboards/`
4. Restart Grafana: `docker-compose restart grafana`

### Change Refresh Rate

In `prometheus.yml`:
```yaml
global:
  scrape_interval: 30s  # Change from 15s to 30s
```

Then restart: `docker-compose restart prometheus`

### Add Alerts

Create `alerting_rules.yml`:
```yaml
groups:
  - name: system_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High CPU usage detected"
```

---

## 📦 Ports Reference

| Port | Service | Purpose |
|------|---------|---------|
| 3000 | Frontend | React app |
| 3001 | API | Node.js backend |
| 3002 | Grafana | Monitoring dashboards |
| 5432 | PostgreSQL | Database |
| 8080 | cAdvisor | Container metrics web UI |
| 9090 | Prometheus | Metrics database & UI |
| 9100 | Node Exporter | System metrics endpoint |
| 9187 | Postgres Exporter | DB metrics endpoint |

---

## 🐛 Troubleshooting

### Grafana Shows "No Data"

1. Check Prometheus is running:
   ```bash
   docker logs dnd-prometheus
   ```

2. Check Prometheus targets:
   - Open http://localhost:9090/targets
   - All targets should be "UP"

3. Check Grafana datasource:
   - Grafana → Configuration → Data Sources
   - Click "Test" on Prometheus datasource

### Container Metrics Not Showing

cAdvisor needs privileged access. Check:
```bash
docker logs dnd-cadvisor
```

If errors, the service needs:
```yaml
privileged: true
devices:
  - /dev/kmsg
```

### High Memory Usage by Prometheus

Prometheus stores all metrics in memory and on disk. To limit:

1. Reduce retention time in `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=7d'  # Keep only 7 days
```

2. Restart Prometheus:
```bash
docker-compose restart prometheus
```

### Can't Access Grafana

1. Check container is running:
```bash
docker ps | findstr grafana
```

2. Check logs:
```bash
docker logs dnd-grafana
```

3. Verify port is not in use:
```bash
netstat -an | findstr 3002
```

---

## 🔐 Security Notes

### Change Grafana Admin Password

1. Login to Grafana (http://localhost:3002)
2. Profile Icon → Change Password
3. Or set via environment variable:
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=YourStrongPassword
```

### Restrict Access in Production

Add to `docker-compose.yml`:
```yaml
grafana:
  environment:
    - GF_SERVER_ROOT_URL=https://your-domain.com
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
  # Remove port mapping, use reverse proxy
  # ports:
  #   - "3002:3000"
```

---

## 📊 Useful Prometheus Queries

### CPU Usage Per Container
```promql
rate(container_cpu_usage_seconds_total{name=~"dnd-.+"}[5m]) * 100
```

### Memory Usage Per Container
```promql
container_memory_usage_bytes{name=~"dnd-.+"}
```

### Network Traffic
```promql
rate(container_network_receive_bytes_total{name=~"dnd-.+"}[5m])
```

### Database Connections
```promql
pg_stat_database_numbackends{datname="dnd_campaign_db"}
```

### Container Restarts
```promql
sum(rate(container_last_seen{name=~"dnd-.+"}[5m])) by (name)
```

---

## 🗑️ Cleanup

### Remove Monitoring Services

```bash
# Stop and remove monitoring containers
docker-compose stop prometheus grafana node-exporter cadvisor postgres-exporter
docker-compose rm prometheus grafana node-exporter cadvisor postgres-exporter

# Remove volumes (deletes all metrics data)
docker volume rm frontend_prometheus_data
docker volume rm frontend_grafana_data
```

### Keep Services But Clean Data

```bash
# Stop services
docker-compose stop prometheus grafana

# Remove volumes
docker volume rm frontend_prometheus_data
docker volume rm frontend_grafana_data

# Start services (will create fresh volumes)
docker-compose up -d prometheus grafana
```

---

## 📚 Further Reading

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter Metrics](https://github.com/prometheus/node_exporter)
- [cAdvisor Metrics](https://github.com/google/cadvisor)
- [Postgres Exporter](https://github.com/prometheus-community/postgres_exporter)

---

## ✅ Quick Health Check

Run this command to check all monitoring services:

```bash
docker ps --filter "name=dnd-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected output:
```
NAMES                    STATUS         PORTS
dnd-grafana             Up X minutes   0.0.0.0:3002->3000/tcp
dnd-prometheus          Up X minutes   0.0.0.0:9090->9090/tcp
dnd-cadvisor            Up X minutes   0.0.0.0:8080->8080/tcp
dnd-node-exporter       Up X minutes   0.0.0.0:9100->9100/tcp
dnd-postgres-exporter   Up X minutes   0.0.0.0:9187->9187/tcp
dnd-api                 Up X minutes   0.0.0.0:3001->3001/tcp
dnd-frontend            Up X minutes   0.0.0.0:3000->80/tcp
dnd-database            Up X minutes   0.0.0.0:5432->5432/tcp
```

All services should show "Up" status! ✅

---

## 🎯 Summary

You now have a complete monitoring solution that shows:
- ✅ Real-time CPU, RAM, and disk usage
- ✅ Per-container resource consumption
- ✅ Network traffic and I/O operations
- ✅ Database performance metrics
- ✅ System health at a glance

Access Grafana at **http://localhost:3002** to view your dashboards! 📊

