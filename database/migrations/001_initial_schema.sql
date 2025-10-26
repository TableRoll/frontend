-- D&D Campaign Management System - Initial Database Schema
-- PostgreSQL Migration 001

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- REFERENCE DATA (RACES, CLASSES, BACKGROUNDS)
-- =============================================

-- Races table
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    ability_score_bonuses JSONB, -- {str: 1, dex: 0, con: 0, int: 0, wis: 0, cha: 0}
    racial_traits JSONB, -- Array of racial abilities
    speed INTEGER DEFAULT 30,
    size VARCHAR(10) DEFAULT 'medium' CHECK (size IN ('tiny', 'small', 'medium', 'large', 'huge')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    hit_die INTEGER DEFAULT 8 CHECK (hit_die IN (6, 8, 10, 12)),
    primary_ability VARCHAR(10) CHECK (primary_ability IN ('str', 'dex', 'con', 'int', 'wis', 'cha')),
    saving_throw_proficiencies JSONB, -- Array of ability scores
    skill_proficiencies JSONB, -- Array of skill names
    starting_equipment JSONB, -- Starting gear
    class_features JSONB, -- Level-based features
    spellcasting_ability VARCHAR(10) CHECK (spellcasting_ability IN ('str', 'dex', 'con', 'int', 'wis', 'cha')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backgrounds table
CREATE TABLE backgrounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    skill_proficiencies JSONB, -- Array of skill names
    tool_proficiencies JSONB, -- Array of tool names
    languages JSONB, -- Array of language names
    equipment JSONB, -- Starting equipment
    feature_name VARCHAR(100),
    feature_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS AND SESSIONS
-- =============================================

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_map_id UUID, -- Will reference maps table when created
    session_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for real-time room management)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    max_players INTEGER DEFAULT 6,
    current_players INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants (users in sessions)
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('gm', 'player')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- =============================================
-- CHARACTERS AND INVENTORY
-- =============================================

-- Characters table
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    race_id UUID REFERENCES races(id),
    class_id UUID REFERENCES classes(id),
    background_id UUID REFERENCES backgrounds(id),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 20),
    
    -- Core stats
    hp_current INTEGER DEFAULT 10,
    hp_max INTEGER DEFAULT 10,
    hp_temporary INTEGER DEFAULT 0,
    armor_class INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 30,
    size VARCHAR(10) DEFAULT 'medium' CHECK (size IN ('tiny', 'small', 'medium', 'large', 'huge')),
    
    -- Ability scores
    strength INTEGER DEFAULT 10 CHECK (strength >= 1 AND strength <= 30),
    dexterity INTEGER DEFAULT 10 CHECK (dexterity >= 1 AND dexterity <= 30),
    constitution INTEGER DEFAULT 10 CHECK (constitution >= 1 AND constitution <= 30),
    intelligence INTEGER DEFAULT 10 CHECK (intelligence >= 1 AND intelligence <= 30),
    wisdom INTEGER DEFAULT 10 CHECK (wisdom >= 1 AND wisdom <= 30),
    charisma INTEGER DEFAULT 10 CHECK (charisma >= 1 AND charisma <= 30),
    
    -- Calculated modifiers (computed from ability scores)
    str_modifier INTEGER GENERATED ALWAYS AS (FLOOR((strength - 10) / 2)) STORED,
    dex_modifier INTEGER GENERATED ALWAYS AS (FLOOR((dexterity - 10) / 2)) STORED,
    con_modifier INTEGER GENERATED ALWAYS AS (FLOOR((constitution - 10) / 2)) STORED,
    int_modifier INTEGER GENERATED ALWAYS AS (FLOOR((intelligence - 10) / 2)) STORED,
    wis_modifier INTEGER GENERATED ALWAYS AS (FLOOR((wisdom - 10) / 2)) STORED,
    cha_modifier INTEGER GENERATED ALWAYS AS (FLOOR((charisma - 10) / 2)) STORED,
    
    -- Proficiencies and skills
    proficiency_bonus INTEGER GENERATED ALWAYS AS (2 + FLOOR((level - 1) / 4)) STORED,
    saving_throw_proficiencies JSONB DEFAULT '[]',
    skill_proficiencies JSONB DEFAULT '[]',
    tool_proficiencies JSONB DEFAULT '[]',
    language_proficiencies JSONB DEFAULT '[]',
    
    -- Spells and abilities
    spells_known JSONB DEFAULT '[]', -- Array of spell objects
    spell_slots JSONB DEFAULT '{}', -- {level_1: 2, level_2: 0, ...}
    class_features JSONB DEFAULT '[]', -- Array of class feature objects
    
    -- Gold and experience
    gold INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item types for inventory
CREATE TABLE item_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('weapon', 'armor', 'shield', 'tool', 'consumable', 'story')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory items (weapons, armor, shields, etc.)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type_id UUID REFERENCES item_types(id),
    is_story_item BOOLEAN DEFAULT FALSE,
    
    -- Mechanical stats (only for non-story items)
    damage_dice VARCHAR(10), -- e.g., "1d8", "2d6"
    damage_type VARCHAR(20), -- e.g., "slashing", "piercing"
    armor_class_bonus INTEGER DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0, -- in pounds
    value INTEGER DEFAULT 0, -- in gold pieces
    
    -- Properties
    properties JSONB DEFAULT '[]', -- Array of item properties
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character inventory (junction table)
CREATE TABLE character_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    is_equipped BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id, item_id)
);

-- =============================================
-- ASSETS AND MAPS
-- =============================================

-- Assets table (files uploaded by users)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Path to file on server
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    thumbnail_path TEXT, -- Path to thumbnail
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL, -- NULL for personal assets
    asset_type VARCHAR(20) DEFAULT 'image' CHECK (asset_type IN ('image', 'token', 'audio', 'map')),
    is_public BOOLEAN DEFAULT FALSE, -- Can be used by other players
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maps table
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id), -- Reference to map image asset
    width_px INTEGER NOT NULL,
    height_px INTEGER NOT NULL,
    grid_size INTEGER DEFAULT 50,
    grid_type VARCHAR(10) DEFAULT 'square' CHECK (grid_type IN ('square', 'hex')),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tokens table (characters/objects on maps)
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL, -- NULL for non-character tokens
    asset_id UUID REFERENCES assets(id), -- Token image
    x_position DECIMAL(10,2) NOT NULL,
    y_position DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) DEFAULT 50,
    height DECIMAL(10,2) DEFAULT 50,
    rotation DECIMAL(5,2) DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    layer_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMBAT SYSTEM
-- =============================================

-- Combat sessions
CREATE TABLE combat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    map_id UUID REFERENCES maps(id),
    is_active BOOLEAN DEFAULT FALSE,
    current_round INTEGER DEFAULT 1,
    current_turn_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combat participants
CREATE TABLE combat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combat_session_id UUID NOT NULL REFERENCES combat_sessions(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    initiative INTEGER NOT NULL,
    has_action BOOLEAN DEFAULT TRUE,
    has_bonus_action BOOLEAN DEFAULT TRUE,
    turn_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Character indexes
CREATE INDEX idx_characters_owner ON characters(owner_id);
CREATE INDEX idx_characters_campaign ON characters(campaign_id);
CREATE INDEX idx_characters_race ON characters(race_id);
CREATE INDEX idx_characters_class ON characters(class_id);

-- Session indexes
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);

-- Asset indexes
CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_assets_campaign ON assets(campaign_id);
CREATE INDEX idx_assets_type ON assets(asset_type);

-- Token indexes
CREATE INDEX idx_tokens_map ON tokens(map_id);
CREATE INDEX idx_tokens_character ON tokens(character_id);

-- Combat indexes
CREATE INDEX idx_combat_participants_session ON combat_participants(combat_session_id);
CREATE INDEX idx_combat_participants_token ON combat_participants(token_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maps_updated_at BEFORE UPDATE ON maps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combat_sessions_updated_at BEFORE UPDATE ON combat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
