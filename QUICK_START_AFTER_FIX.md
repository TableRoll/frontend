# Quick Start Guide - Data Flow Fixed! ✅

## What Was Fixed

Your D&D Campaign Management System can now properly upload and retrieve data from the database!

### Issues Resolved:
1. ✅ Mock development user ID is now a valid UUID
2. ✅ Development user exists in the database
3. ✅ Data can be uploaded to PostgreSQL
4. ✅ Data can be retrieved from the API

## How to Use the System

### 1. Start the Application

```bash
# Start database and API
docker-compose up -d database api

# Wait a moment for services to start, then verify
docker ps
```

### 2. Set Up Development User (First Time Only)

Run this script once to create the development user:

```bash
setup-dev-user.bat
```

Or manually:
```bash
docker exec -it dnd-database psql -U postgres -d dnd_campaign_db -c "INSERT INTO users (id, email, username, display_name, password_hash, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000001', 'dev@example.com', 'developer', 'Development User', 'mock-password-hash', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"
```

### 3. Test API Endpoints

#### Using PowerShell:

**Create a Campaign:**
```powershell
$headers = @{ "Authorization" = "Bearer mock-token-for-development"; "Content-Type" = "application/json" }
$body = @{ name = "My Campaign"; description = "My Description" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/campaigns" -Method POST -Headers $headers -Body $body
```

**Get All Campaigns:**
```powershell
$headers = @{ "Authorization" = "Bearer mock-token-for-development" }
Invoke-RestMethod -Uri "http://localhost:3001/api/campaigns" -Method GET -Headers $headers
```

**Get Reference Data (Races):**
```powershell
$headers = @{ "Authorization" = "Bearer mock-token-for-development" }
Invoke-RestMethod -Uri "http://localhost:3001/api/characters/reference/races" -Method GET -Headers $headers
```

### 4. Use the Frontend

1. Start the frontend:
   ```bash
   docker-compose up -d frontend
   ```

2. Open your browser: http://localhost:3000

3. The frontend will now be able to:
   - Create campaigns, characters, and maps
   - Save them to the database
   - Retrieve and display them

## Development Token

For development and testing, use this token:
```
mock-token-for-development
```

This token is automatically recognized by the API when `ALLOW_DEV_TOKEN=true` (set in docker-compose.yml).

**User Details:**
- ID: `00000000-0000-0000-0000-000000000001`
- Email: `dev@example.com`
- Username: `developer`

## API Endpoints

All endpoints require the `Authorization: Bearer mock-token-for-development` header.

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get specific campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get specific character
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character
- `GET /api/characters/reference/races` - Get all races
- `GET /api/characters/reference/classes` - Get all classes
- `GET /api/characters/reference/backgrounds` - Get all backgrounds

### Maps
- `GET /api/maps` - List all maps
- `GET /api/maps/:id` - Get specific map
- `POST /api/maps` - Create map
- `PUT /api/maps/:id` - Update map
- `DELETE /api/maps/:id` - Delete map

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets/upload` - Upload asset
- `GET /api/assets/file/:id` - Get asset file
- `DELETE /api/assets/:id` - Delete asset

## Checking the Database Directly

View campaigns in the database:
```bash
docker exec -it dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT * FROM campaigns;"
```

View characters:
```bash
docker exec -it dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, race_id, class_id, level FROM characters;"
```

View users:
```bash
docker exec -it dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, username, email FROM users;"
```

## Frontend Integration Notes

### Current Behavior
The frontend uses a dual-state system:
1. **Zustand Store** - Contains sample data and manages UI state
2. **API Calls** - Fetches real data from the database

The Dashboard component loads API data separately from the store, which can cause some disconnection.

### Recommended Improvements
See `DATA_FLOW_ANALYSIS.md` for detailed recommendations on integrating the API data with the Zustand store.

## Troubleshooting

### "Cannot connect to API"
- Make sure Docker is running
- Check if containers are up: `docker ps`
- Restart API: `docker-compose restart api`

### "Invalid UUID" errors
- The fix has been applied to `api/middleware/auth.js`
- Make sure you rebuilt the container: `docker-compose up -d --build api`

### "User not found in database"
- Run `setup-dev-user.bat` to create the development user
- Or manually insert the user using the SQL command above

### Data not appearing in frontend
- Check browser console for errors
- Verify API is returning data: Use PowerShell commands above
- The frontend may be showing sample data from the store instead of API data

## Next Steps

1. **For Development:**
   - Continue using the mock token for testing
   - Data will be saved to and loaded from the database
   - Use the PowerShell commands to test API directly

2. **For Frontend Integration:**
   - Review `DATA_FLOW_ANALYSIS.md` for improvement suggestions
   - Consider unifying the state management approach
   - Remove sample data once API integration is complete

3. **For Production:**
   - Disable `ALLOW_DEV_TOKEN` in environment
   - Implement proper user authentication (JWT)
   - Add user registration and login flows
   - Remove the mock development user

## Files Modified

1. `api/middleware/auth.js` - Fixed mock user UUID format
2. Database `users` table - Added mock development user
3. `setup-dev-user.bat` - Helper script to set up dev user
4. `DATA_FLOW_ANALYSIS.md` - Detailed analysis and recommendations

## Summary

✅ **Your system is now working!**

You can:
- Upload data to the database via API ✅
- Retrieve data from the database via API ✅
- Use the mock token for development ✅
- Create campaigns, characters, and maps ✅

The frontend may need some integration work to fully utilize the API data in all components, but the core data flow is functioning correctly.

Happy developing! 🎲










