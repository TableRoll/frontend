# Monitoring Verification - Quick Test

## ✅ Datasource Successfully Provisioned!

The logs show:
```
inserting datasource from configuration name=Prometheus uid=prometheus
```

Your monitoring system is ready!

---

## 🧪 Quick Verification Steps

### Step 1: Access Grafana
```
http://localhost:3002
```

### Step 2: Login
- Username: `admin`  
- Password: `admin`

### Step 3: Test Prometheus Connection

1. Click hamburger menu (≡) → "Connections" → "Data sources"
2. Click "Prometheus"
3. Scroll to bottom
4. Click "Save & test"
5. **Expected:** ✅ "Data source is working"

If you see ✅ "Successfully queried the Prometheus API" - **You're all set!**

---

## 📊 View Metrics Immediately

### Option 1: Use Explore (Easiest)

1. Click "Explore" icon (compass) in left menu
2. Make sure "Prometheus" is selected
3. Try these queries:

#### See All Containers
```promql
up{job="cadvisor"}
```

#### Container CPU Usage
```promql
rate(container_cpu_usage_seconds_total{name=~"dnd-.+"}[5m]) * 100
```

#### Container Memory
```promql
container_memory_usage_bytes{name=~"dnd-.+"}
```

Click "Run query" and you should see graphs!

---

### Option 2: Create Simple Dashboard

1. Click "+" → "Create Dashboard"
2. Click "Add visualization"
3. Select "Prometheus" datasource
4. **Query 1 - API CPU:**
   ```promql
   rate(container_cpu_usage_seconds_total{name="dnd-api"}[5m]) * 100
   ```
5. **Panel title:** "API CPU Usage"
6. **Unit:** Percent (0-100)
7. Click "Apply"

8. Click "Add visualization" again
9. **Query 2 - API Memory:**
   ```promql
   container_memory_usage_bytes{name="dnd-api"}
   ```
10. **Panel title:** "API Memory Usage"
11. **Unit:** Bytes
12. Click "Apply"

13. Click "Save dashboard" (disk icon top-right)
14. Name it "My Monitoring Dashboard"
15. Click "Save"

---

### Option 3: Import Pre-built Dashboard

If the automatic dashboard didn't load:

1. Click "Dashboards" → "New" → "Import"
2. Enter Dashboard ID: `193` (Docker Containers)
3. Click "Load"
4. Select "Prometheus" as datasource
5. Click "Import"

**Popular Dashboard IDs:**
- `193` - Docker Container & Host Metrics
- `14282` - Docker and System Monitoring
- `10619` - Docker Prometheus Monitoring

---

## 🎨 What You Can See

### Container Metrics
```promql
# CPU per container
rate(container_cpu_usage_seconds_total{name=~"dnd-.+"}[5m])

# Memory per container
container_memory_usage_bytes{name=~"dnd-.+"}

# Network RX
rate(container_network_receive_bytes_total{name=~"dnd-.+"}[5m])

# Network TX
rate(container_network_transmit_bytes_total{name=~"dnd-.+"}[5m])

# Filesystem usage
container_fs_usage_bytes{name=~"dnd-.+"}
```

### Database Metrics
```promql
# Active connections
pg_stat_database_numbackends{datname="dnd_campaign_db"}

# Database size
pg_database_size_bytes{datname="dnd_campaign_db"}

# Transactions per second
rate(pg_stat_database_xact_commit{datname="dnd_campaign_db"}[5m])

# Cache hit ratio
rate(pg_stat_database_blks_hit{datname="dnd_campaign_db"}[5m]) / 
(rate(pg_stat_database_blks_hit{datname="dnd_campaign_db"}[5m]) + 
 rate(pg_stat_database_blks_read{datname="dnd_campaign_db"}[5m]))
```

---

## 🔍 Troubleshooting

### Still See "Datasource not found"

**Try this:**

1. Go to: Connections → Data sources
2. Click "Add data source"
3. Select "Prometheus"
4. Configure:
   - **Name:** `Prometheus`
   - **URL:** `http://prometheus:9090`
   - Click "Save & test"

If you see ✅ success, the datasource is working!

### "No data" in panels

**Check:**

1. Open Prometheus directly: http://localhost:9090
2. Go to "Status" → "Targets"
3. All should show "UP" (green)
4. If any are down, check:
   ```bash
   docker ps
   docker logs dnd-cadvisor
   docker logs dnd-postgres-exporter
   ```

### Grafana won't load

```bash
# Check container
docker ps | findstr grafana

# Restart if needed
docker-compose restart grafana

# Check logs
docker logs dnd-grafana --tail 50
```

---

## 🎯 Quick Win - Simple Stats

Once Prometheus datasource is connected, try this in Explore:

### Container Count
```promql
count(container_last_seen{name=~"dnd-.+"})
```

### Total Memory Used
```promql
sum(container_memory_usage_bytes{name=~"dnd-.+"})
```

### Total CPU Usage
```promql
sum(rate(container_cpu_usage_seconds_total{name=~"dnd-.+"}[5m])) * 100
```

---

## ✨ Success Checklist

- [ ] Open Grafana (http://localhost:3002)
- [ ] Login with admin/admin
- [ ] See Prometheus in Data Sources
- [ ] Test connection shows ✅
- [ ] Run a query in Explore
- [ ] See metrics data
- [ ] Create or import dashboard
- [ ] See live graphs updating

Once all checked ✅ - **You have full monitoring!** 🎉

---

## 📚 Next Steps

Once working:
1. Create custom dashboards for your needs
2. Set up alerts (CPU > 90%, Memory > 80%, etc.)
3. Add more metrics (API response times, error rates)
4. Explore community dashboards
5. Configure email/Slack notifications

See `MONITORING_SETUP.md` and `MONITORING_QUICK_START.md` for more details!

