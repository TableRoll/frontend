# D&D Campaign Management System - Database

This directory contains the PostgreSQL database schema and setup scripts for the D&D Campaign Management System.

## 🗄️ Database Schema

The database is designed to support:
- **User Management**: Authentication and user profiles
- **Character System**: Complete D&D character creation with races, classes, backgrounds
- **Inventory System**: Weapons, armor, shields, tools, and story items
- **Campaign Management**: Campaigns, sessions, and real-time room management
- **Asset Management**: File uploads tied to users and campaigns
- **Combat System**: Initiative tracking and combat sessions
- **Map System**: Interactive maps with tokens

## 🚀 Quick Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Node.js 16+ installed

### 1. Install Dependencies
```bash
cd database
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your database credentials
```

### 3. Run Setup
```bash
npm run setup
```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Seed initial data (races, classes, backgrounds, items)

## 📊 Database Structure

### Core Tables
- `users` - User accounts and profiles
- `campaigns` - Campaign management
- `sessions` - Real-time game sessions
- `characters` - D&D characters with full stats
- `inventory_items` - Weapons, armor, tools, etc.
- `character_inventory` - Character's owned items
- `assets` - Uploaded files (images, tokens, maps)
- `maps` - Campaign maps
- `tokens` - Objects placed on maps
- `combat_sessions` - Combat encounters
- `combat_participants` - Initiative tracking

### Reference Data
- `races` - D&D races with ability bonuses
- `classes` - D&D classes with features
- `backgrounds` - Character backgrounds
- `item_types` - Categorization of items

## 🔧 Available Scripts

- `npm run setup` - Complete database setup
- `npm run migrate` - Run migrations only
- `npm run seed` - Seed reference data only
- `npm run reset` - Drop and recreate database

## 📁 File Structure

```
database/
├── migrations/
│   ├── 001_initial_schema.sql    # Main database schema
│   └── 002_seed_data.sql         # Initial reference data
├── config.js                     # Database configuration
├── setup.js                      # Setup script
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔐 Security Features

- UUID primary keys for all tables
- Proper foreign key constraints
- Row-level security ready (can be enabled)
- Input validation at database level
- Audit trails with created_at/updated_at timestamps

## 🚀 Production Considerations

For production deployment:
1. Set up proper PostgreSQL user permissions
2. Enable SSL connections
3. Configure connection pooling
4. Set up database backups
5. Monitor performance with proper indexes
6. Consider read replicas for scaling

## 📈 Performance

The schema includes:
- Proper indexing on frequently queried columns
- Generated columns for calculated values (modifiers)
- JSONB for flexible data storage
- Efficient foreign key relationships

## 🔄 Future Enhancements

- Row-level security policies
- Database triggers for audit logging
- Materialized views for complex queries
- Full-text search on character descriptions
- Spatial indexing for map features
