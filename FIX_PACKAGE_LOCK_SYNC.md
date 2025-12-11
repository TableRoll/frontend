# Fix: package-lock.json Out of Sync Error

## 🔴 Problem

Docker build fails with:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: @dnd-kit/core@6.3.1 from lock file
```

## ✅ Solution Applied

### 1. Regenerated package-lock.json Files

Both lock files have been regenerated to match their respective `package.json` files:

```bash
# Frontend (root)
npm install --legacy-peer-deps --package-lock-only

# API
cd api
npm install --package-lock-only
```

### 2. Updated Dockerfiles

Both Dockerfiles now have fallback logic:

**Dockerfile.frontend:**
```dockerfile
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
```

**Dockerfile.api:**
```dockerfile
RUN npm ci --omit=dev || npm install --omit=dev
```

This means:
- First tries `npm ci` (faster, requires lock file)
- Falls back to `npm install` if lock file is out of sync

### 3. Removed from .gitignore

Both `package-lock.json` files are now tracked in git:
- `package-lock.json` (root)
- `api/package-lock.json`

## 🚀 Next Steps

### On Your Local Machine:

```bash
# Commit the updated lock files
git add package-lock.json api/package-lock.json .gitignore Dockerfile.frontend Dockerfile.api
git commit -m "Fix: Regenerate package-lock.json files and update Dockerfiles"
git push
```

### On Your Server:

```bash
# Pull the updated code
git pull

# Rebuild (should work now!)
docker-compose build

# Or rebuild everything
docker-compose up -d --build
```

## 🔍 Why This Happened

1. **Dependencies Updated**: Packages in `package.json` were updated, but `package-lock.json` wasn't regenerated
2. **Lock File Out of Sync**: The lock file had old versions that didn't match `package.json`
3. **npm ci Strict**: `npm ci` requires exact match between `package.json` and `package-lock.json`

## ✅ Verification

After pulling on server, verify files exist:

```bash
# Check frontend lock file
ls -la package-lock.json

# Check API lock file
ls -la api/package-lock.json

# Both should exist and be recent
```

## 🛡️ Prevention

To prevent this in the future:

1. **Always regenerate lock file** after updating `package.json`:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Commit lock files** to git (they're now tracked)

3. **Use npm ci in CI/CD** (faster, reproducible)

4. **Keep lock files in sync** - don't manually edit them

## 📝 Notes

- The Dockerfiles now have fallback logic, so builds are more resilient
- If `npm ci` fails, it automatically falls back to `npm install`
- This is slightly slower but ensures the build completes

The build should now work! 🎉

