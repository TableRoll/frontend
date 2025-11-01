# D&D Campaign Management System - Database Migration Guide

This guide will help you migrate from the current localStorage-based system to a PostgreSQL database with a proper API backend.

## 🗄️ Database Architecture

### **Core Features Implemented:**
- ✅ **User Management**: Complete authentication system with JWT tokens
- ✅ **Character System**: Full D&D character creation with races, classes, backgrounds
- ✅ **Inventory System**: Weapons, armor, shields, tools, and story items
- ✅ **Campaign Management**: Campaigns, sessions, and real-time room support
- ✅ **Asset Management**: File uploads tied to users and campaigns
- ✅ **Combat System**: Initiative tracking and combat sessions
- ✅ **Map System**: Interactive maps with tokens

### **Database Schema Highlights:**
- **UUID primary keys** for all tables
- **Generated columns** for ability score modifiers
- **JSONB fields** for flexible data storage (spells, features, properties)
- **Proper foreign key constraints** with cascade deletes
- **Audit trails** with created_at/updated_at timestamps
- **Performance indexes** on frequently queried columns

## 🚀 Quick Setup

### **1. Prerequisites**
```bash
# Install PostgreSQL 12+
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib

# Install Node.js 16+
# Download from nodejs.org
```

### **2. Database Setup**
```bash
# Navigate to database directory
cd database

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password_here
# DB_NAME=dnd_campaign_db

# Run complete setup
npm run setup
```

### **3. API Server Setup**
```bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Copy environment template
cp ../database/env.example .env

# Edit .env with your settings
# Add: FRONTEND_URL=http://localhost:3000

# Start the API server
npm run dev
```

## 📊 Database Schema Overview

### **User Management**
```sql
users                    -- User accounts and profiles
├── id (UUID, PK)
├── email (unique)
├── username (unique)
├── display_name
├── password_hash
├── role (user/admin)
└── timestamps
```

### **Character System**
```sql
races                    -- D&D races with ability bonuses
classes                  -- D&D classes with features
backgrounds              -- Character backgrounds
characters               -- Complete character data
├── Basic info (name, description, image)
├── Stats (hp, ac, speed, size)
├── Ability scores (str, dex, con, int, wis, cha)
├── Generated modifiers (computed from ability scores)
├── Proficiencies (saves, skills, tools, languages)
├── Spells and class features (JSONB)
└── Gold and experience
```

### **Inventory System**
```sql
item_types               -- Categorization (weapon, armor, tool, etc.)
inventory_items          -- All available items
├── Mechanical stats (damage, AC bonus, weight, value)
├── Properties (finesse, versatile, etc.)
└── Rarity system
character_inventory      -- Junction table
├── Quantity and equipped status
└── Personal notes
```

### **Campaign & Session Management**
```sql
campaigns                -- Game campaigns
├── Owner and basic info
├── Current map reference
└── Session tracking
sessions                 -- Real-time game rooms
├── Campaign association
├── Player limits
└── Active status
session_participants     -- Users in sessions
├── Role (GM/Player)
└── Join timestamps
```

### **Asset Management**
```sql
assets                   -- Uploaded files
├── File metadata (path, size, type)
├── Owner and campaign association
├── Public/private visibility
└── Thumbnail support
```

### **Combat System**
```sql
combat_sessions          -- Combat encounters
├── Session association
├── Round and turn tracking
└── Active status
combat_participants      -- Initiative tracking
├── Token association
├── Initiative order
├── Action tracking
└── Turn management
```

## 🔧 API Endpoints

### **Authentication** (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - User login with JWT token
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile

### **Characters** (`/api/characters`)
- `GET /` - Get all user's characters
- `GET /:id` - Get character by ID with full details
- `POST /` - Create new character
- `PUT /:id` - Update character
- `DELETE /:id` - Delete character
- `GET /reference/races` - Get available races
- `GET /reference/classes` - Get available classes
- `GET /reference/backgrounds` - Get available backgrounds

### **Campaigns** (`/api/campaigns`)
- `GET /` - Get all user's campaigns
- `GET /:id` - Get campaign by ID with details
- `POST /` - Create new campaign
- `PUT /:id` - Update campaign
- `DELETE /:id` - Delete campaign
- `POST /:id/sessions` - Create session for campaign

### **Assets** (`/api/assets`)
- `GET /` - Get all user's assets
- `GET /:id` - Get asset by ID
- `POST /upload` - Upload new asset file
- `PUT /:id` - Update asset metadata
- `DELETE /:id` - Delete asset and file
- `GET /file/:id` - Serve asset file

### **Combat** (`/api/combat`)
- `GET /session/:sessionId` - Get combat state
- `POST /session/:sessionId/start` - Start combat
- `POST /session/:sessionId/end` - End combat
- `POST /session/:sessionId/next-turn` - Advance turn
- `POST /session/:sessionId/use-action` - Use action
- `POST /session/:sessionId/use-bonus-action` - Use bonus action

## 🔄 Migration Strategy

### **Phase 1: Database Setup** ✅
- [x] Create PostgreSQL schema
- [x] Seed reference data (races, classes, backgrounds, items)
- [x] Set up database connection and configuration

### **Phase 2: API Development** ✅
- [x] Create Express.js API server
- [x] Implement authentication with JWT
- [x] Build CRUD endpoints for all entities
- [x] Add file upload support for assets
- [x] Implement combat system endpoints

### **Phase 3: Frontend Integration** (Next Steps)
- [ ] Replace localStorage with API calls
- [ ] Update authentication flow
- [ ] Migrate character creation to use API
- [ ] Update campaign management
- [ ] Integrate asset upload system
- [ ] Connect combat system to API

### **Phase 4: Real-time Features** (Future)
- [ ] WebSocket integration for live sessions
- [ ] Real-time combat updates
- [ ] Live map collaboration
- [ ] Chat system integration

## 🛠️ Development Commands

### **Database Management**
```bash
cd database

# Complete setup (create DB + run migrations + seed data)
npm run setup

# Run migrations only
npm run migrate

# Seed reference data only
npm run seed

# Reset database (drop and recreate)
npm run reset
```

### **API Development**
```bash
cd api

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 🔐 Security Features

- **JWT Authentication** with 7-day expiration
- **Password Hashing** using bcryptjs (12 rounds)
- **Input Validation** with express-validator
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS Protection** with whitelisted origins
- **Helmet Security** headers
- **File Upload Validation** (type and size limits)
- **SQL Injection Protection** with parameterized queries

## 📈 Performance Optimizations

- **Connection Pooling** (max 20 connections)
- **Database Indexes** on frequently queried columns
- **Generated Columns** for computed values (modifiers)
- **Efficient Queries** with proper JOINs
- **File Serving** with proper MIME types
- **Thumbnail Generation** for images (placeholder)

## 🚀 Production Deployment

### **Environment Variables**
```bash
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dnd_campaign_db
DB_PASSWORD=secure_password
DB_PORT=5432

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Security
JWT_SECRET=your_super_secret_jwt_key

# File Upload
UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=10485760
```

### **Docker Setup** (Future)
```dockerfile
# Database service
FROM postgres:15
# API service
FROM node:18-alpine
# Frontend service
FROM nginx:alpine
```

## 🔍 Testing the Setup

### **1. Test Database Connection**
```bash
cd database
npm run setup
# Should show: ✅ Database connected successfully
```

### **2. Test API Server**
```bash
cd api
npm run dev
# Should show: 🚀 API server running on port 3001
```

### **3. Test API Endpoints**
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","displayName":"Test User","password":"password123","confirmPassword":"password123"}'

# Get races
curl http://localhost:3001/api/characters/reference/races
```

## 📋 Next Steps

1. **Test the database setup** using the commands above
2. **Start the API server** and verify all endpoints work
3. **Update the frontend** to use the API instead of localStorage
4. **Test the complete flow** from user registration to character creation
5. **Deploy to production** when ready

## 🆘 Troubleshooting

### **Database Connection Issues**
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials in `.env` file
- Ensure database exists: `psql -l`

### **API Server Issues**
- Check port 3001 is available
- Verify all dependencies installed: `npm install`
- Check environment variables are set

### **File Upload Issues**
- Ensure upload directory exists and is writable
- Check file size limits
- Verify file type restrictions

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document) - Reference for game data

---

**Ready to migrate?** Start with the database setup and let me know if you encounter any issues!
