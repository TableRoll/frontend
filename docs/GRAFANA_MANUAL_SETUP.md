# Grafana Manual Setup - Quick Fix

## Issue
Grafana datasource provisioning showing error. Here's the manual setup to get you running immediately!

## 🚀 Manual Setup (2 Minutes)

### Step 1: Add Prometheus Datasource

1. **Open Grafana**: http://localhost:3002
2. **Login**: 
   - Username: `admin`
   - Password: `admin`
   - (Change password or skip)

3. **Add Data Source**:
   - Click hamburger menu (≡) → "Connections" → "Data sources"
   - Click "Add data source" button
   - Select "Prometheus"

4. **Configure Prometheus**:
   ```
   Name: Prometheus
   URL: http://prometheus:9090
   ```
   - Scroll down
   - Click "Save & Test"
   - Should see: ✅ "Successfully queried the Prometheus API"

### Step 2: Import Dashboard

#### Option A: Quick Import (Recommended)

1. Click "Dashboards" (left menu, four squares icon)
2. Click "New" → "Import"
3. Paste this dashboard JSON: (see below)
4. Click "Load"
5. Select "Prometheus" as datasource
6. Click "Import"

#### Option B: Use Pre-configured File

1. Click "Dashboards" → "New" → "Import"
2. Upload file: `grafana/provisioning/dashboards/dnd-system-monitor.json`
3. Select "Prometheus" datasource
4. Click "Import"

---

## 📊 Simple Dashboard JSON (Copy & Paste)

```json
{
  "dashboard": {
    "title": "D&D System Monitor",
    "panels": [
      {
        "id": 1,
        "title": "Container CPU Usage",
        "type": "timeseries",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{name=~\"dnd-.+\"}[5m]) * 100",
            "legendFormat": "{{name}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Container Memory Usage",
        "type": "timeseries",
        "targets": [
          {
            "expr": "container_memory_usage_bytes{name=~\"dnd-.+\"}",
            "legendFormat": "{{name}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      }
    ],
    "refresh": "10s",
    "time": {"from": "now-1h", "to": "now"}
  }
}
```

---

## ✅ Verify Data Source

### Test Prometheus Connection

1. In Grafana, go to: Data Sources → Prometheus
2. Scroll to bottom
3. Click "Save & Test"
4. Should see: ✅ "Data source is working"

### Test in Explore

1. Click "Explore" (compass icon in left menu)
2. Make sure "Prometheus" is selected at top
3. In the query field, type:
   ```
   up
   ```
4. Click "Run query"
5. Should see metrics with value `1` for all services

---

## 🔍 Quick Queries to Test

Try these in Grafana Explore:

### All Running Containers
```promql
up
```

### Container CPU Usage
```promql
rate(container_cpu_usage_seconds_total{name=~"dnd-.+"}[5m])
```

### Container Memory
```promql
container_memory_usage_bytes{name=~"dnd-.+"}
```

### Database Connections
```promql
pg_stat_database_numbackends
```

---

## 🎨 Build Your Own Dashboard

### Create New Dashboard

1. Click "+" → "Create Dashboard"
2. Click "Add visualization"
3. Select "Prometheus" datasource
4. In Metric dropdown, choose a metric or type:
   ```promql
   container_memory_usage_bytes{name="dnd-api"}
   ```
5. Customize panel settings on right
6. Click "Apply"
7. Click "Save dashboard" (disk icon)

### Useful Panels to Add

**CPU Usage Gauge:**
- Visualization: Gauge
- Query: `100 - (avg(rate(container_cpu_usage_seconds_total{name="dnd-api", cpu="cpu0"}[5m])) * 100)`
- Unit: Percent (0-100)
- Thresholds: Green (0-70), Yellow (70-90), Red (90-100)

**Memory Usage Bar:**
- Visualization: Bar chart
- Query: `container_memory_usage_bytes{name=~"dnd-.+"}`
- Unit: Bytes
- Legend: {{name}}

**Network Traffic:**
- Visualization: Time series
- Query 1: `rate(container_network_receive_bytes_total{name=~"dnd-.+"}[5m])`
- Query 2: `rate(container_network_transmit_bytes_total{name=~"dnd-.+"}[5m])`
- Unit: Bytes/sec

---

## 🔧 Fix Automatic Provisioning (Optional)

If you want to fix the automatic provisioning for future restarts:

### Remove Old Dashboard Reference

The issue is the dashboard JSON references UID `prometheus` but Grafana might be assigning a different UID. 

**Solution:** After manually adding the datasource:

1. Go to Data Sources → Prometheus
2. Note the actual UID (shown in URL or settings)
3. Update the dashboard JSON file to use that UID
4. Restart Grafana

Or simply use the manual setup - it's just as good!

---

## 🎯 Summary

**Working Now:**
- ✅ Prometheus collecting metrics
- ✅ cAdvisor monitoring containers
- ✅ Postgres exporter tracking database
- ✅ Grafana running and accessible

**To Do:**
1. Open http://localhost:3002
2. Login (admin/admin)
3. Manually add Prometheus datasource (takes 30 seconds)
4. Import dashboard or create your own

**Result:** Full monitoring dashboard showing CPU, RAM, and storage! 📊

