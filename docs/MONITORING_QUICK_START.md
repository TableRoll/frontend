# Monitoring Quick Start 🚀

## ✅ Services Running

All monitoring services are now active!

## 📊 Access Your Dashboards

| Service | URL | Purpose |
|---------|-----|---------|
| **🎨 Grafana** | http://localhost:3002 | **Main Dashboards** - CPU, RAM, Storage visualization |
| **📈 Prometheus** | http://localhost:9090 | Metrics database & query interface |
| **🐳 cAdvisor** | http://localhost:8080 | Container metrics web UI |
| **📊 Postgres Exporter** | http://localhost:9187/metrics | Database metrics |

## 🔑 Login Credentials

**Grafana:**
- Username: `admin`
- Password: `admin`
- ⚠️ You'll be prompted to change password on first login

## 🎯 Quick Steps

### 1. Open Grafana
```
http://localhost:3002
```

### 2. Login
- Username: `admin`
- Password: `admin`

### 3. View Dashboard
- Click "Dashboards" (left menu)
- Select "D&D Campaign System Monitor"

## 📊 What You'll See

### Gauges (Top Row)
- 🟢 **CPU Usage** - Real-time system CPU %
- 🟡 **Memory Usage** - Current RAM usage %
- 🔴 **Disk Usage** - Storage space used %
- 📦 **Running Containers** - Active container count

### Charts (Bottom Rows)
- **Container CPU** - Per-container CPU usage over time
- **Container Memory** - Per-container RAM usage
- **Network I/O** - Network traffic in/out
- **Storage Usage** - Disk space per container

## 🔧 Quick Commands

### View All Containers
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Stop Monitoring
```powershell
docker-compose stop grafana prometheus cadvisor postgres-exporter
```

### Restart Monitoring
```powershell
docker-compose restart grafana prometheus cadvisor postgres-exporter
```

### View Grafana Logs
```powershell
docker logs dnd-grafana
```

### View Prometheus Logs
```powershell
docker logs dnd-prometheus
```

## ⚡ Performance Tips

### Dashboard Auto-Refresh
- Current: Every 10 seconds
- Change: Top-right corner of Grafana → Click "10s" → Select different interval

### Time Range
- Current: Last 1 hour
- Change: Top-right corner → Select "Last 6 hours", "Last 24 hours", etc.

## 🎨 Customization

### Add Your Own Panel
1. In Grafana dashboard, click "Add panel"
2. Choose "Add visualization"
3. Select metric from dropdown
4. Customize appearance
5. Click "Apply"

### Example Custom Queries

**API Response Time** (if you add metrics to API):
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Database Query Rate**:
```promql
rate(pg_stat_database_xact_commit[5m])
```

## 🚨 Alerts Setup

Want email/Slack alerts when CPU > 90%?

1. Grafana → Alerting → Alert rules
2. Create new alert
3. Set condition: `CPU Usage > 90`
4. Add notification channel
5. Save

## 📱 Mobile Access

Grafana works great on mobile!
- Just open http://YOUR_SERVER_IP:3002 on your phone
- Login with same credentials
- Swipe through dashboards

## 🐛 Troubleshooting

### Grafana Shows "No Data"

**Check Prometheus:**
```powershell
# Is Prometheus running?
docker logs dnd-prometheus

# Check targets
Start-Process "http://localhost:9090/targets"
```

All targets should show "UP" (green).

### Can't Access Grafana

```powershell
# Check if container is running
docker ps | findstr grafana

# Check logs for errors
docker logs dnd-grafana --tail 50

# Restart if needed
docker-compose restart grafana
```

### High Memory Usage

Prometheus stores metrics in RAM. To limit:

```yaml
# In docker-compose.yml
command:
  - '--storage.tsdb.retention.time=7d'  # Keep only 7 days
  - '--storage.tsdb.retention.size=5GB'  # Max 5GB storage
```

## 📚 Full Documentation

See `MONITORING_SETUP.md` for complete details on:
- All available metrics
- Custom dashboard creation
- Alerting configuration
- Production deployment
- Advanced queries

## ✨ Summary

**You now have:**
- ✅ Real-time CPU, RAM, and disk monitoring
- ✅ Per-container resource tracking
- ✅ Network traffic visualization
- ✅ Database performance metrics
- ✅ Beautiful dashboards accessible from any device

**Access Grafana now:** http://localhost:3002 🎉

