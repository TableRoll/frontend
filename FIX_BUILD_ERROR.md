# Fix: npm ci package-lock.json Error on Server Build

## 🔴 Problem

When building on the server, you get:
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

## ✅ Root Cause

The `api/package-lock.json` file was in `.gitignore`, so it wasn't committed to git. When you pull the code on the server, the file doesn't exist, causing the build to fail.

## 🛠️ Solution

### Step 1: Remove from .gitignore (Already Done)

I've removed `api/package-lock.json` from `.gitignore`. The file should now be tracked by git.

### Step 2: Commit package-lock.json

```bash
# Make sure the file is tracked
git add api/package-lock.json

# Commit it
git commit -m "Add API package-lock.json for Docker builds"

# Push to repository
git push
```

### Step 3: On Server - Pull and Rebuild

```bash
# Pull latest code (now includes package-lock.json)
git pull

# Rebuild with the updated Dockerfile
docker-compose build api

# Or rebuild everything
docker-compose up -d --build
```

## 🔧 What I Fixed

1. **Updated `.gitignore`**: Removed `api/package-lock.json` so it gets committed
2. **Updated `Dockerfile.api`**: 
   - Explicitly copies `package-lock.json`
   - Uses modern npm syntax (`--omit=dev`)
   - Falls back to `npm install` if `package-lock.json` is missing

## ✅ Verify Fix

On your server, after pulling:

```bash
# Check if file exists
ls -la api/package-lock.json

# Should show the file
```

## 📝 Why package-lock.json is Important

- **Reproducible builds**: Ensures same dependency versions everywhere
- **Faster installs**: `npm ci` is faster than `npm install`
- **Required for Docker**: `npm ci` needs this file to work

## 🚀 Next Steps

1. **On your local machine:**
   ```bash
   git add api/package-lock.json .gitignore Dockerfile.api
   git commit -m "Fix Docker build: include package-lock.json"
   git push
   ```

2. **On your server:**
   ```bash
   git pull
   docker-compose build api
   docker-compose up -d
   ```

The build should now work! 🎉

