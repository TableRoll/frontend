-- D&D Campaign Management System - Base Assets, Characters with Inventory, and Tokens
-- PostgreSQL Migration 008

-- =============================================
-- BASE ASSETS (Sample Token Images and Assets)
-- =============================================

-- Note: These assets use placeholder file paths. In production, actual image files should be uploaded.
-- The file_path references placeholder files that should exist in the uploads directory.

-- Get the first user (dev user or any user) as the owner
DO $$
DECLARE
    first_user_id UUID;
    first_campaign_id UUID;
    first_map_id UUID;
BEGIN
    -- Get first user
    SELECT id INTO first_user_id FROM users LIMIT 1;
    
    IF first_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found. Please create a user first.';
    END IF;

    -- Get first campaign (or create one if none exists)
    SELECT id INTO first_campaign_id FROM campaigns LIMIT 1;
    
    IF first_campaign_id IS NULL THEN
        INSERT INTO campaigns (name, description, owner_id, is_active)
        VALUES ('Default Campaign', 'A default campaign for sample data', first_user_id, true)
        RETURNING id INTO first_campaign_id;
    END IF;

    -- Get first map (or create one if none exists)
    SELECT id INTO first_map_id FROM maps LIMIT 1;
    
    IF first_map_id IS NULL THEN
        -- Create a default map (without asset reference for now)
        INSERT INTO maps (name, description, campaign_id, width_px, height_px, grid_size, grid_type, is_active)
        VALUES ('Default Map', 'A default map for tokens', first_campaign_id, 2048, 1536, 50, 'square', true)
        RETURNING id INTO first_map_id;
    END IF;

    -- =============================================
    -- BASE TOKEN ASSETS
    -- =============================================
    
    INSERT INTO assets (name, file_path, file_size, mime_type, thumbnail_path, owner_id, campaign_id, asset_type, is_public) VALUES
    -- Monster Tokens
    ('Goblin Token', '/uploads/tokens/goblin.png', 50000, 'image/png', '/uploads/tokens/goblin-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Orc Token', '/uploads/tokens/orc.png', 55000, 'image/png', '/uploads/tokens/orc-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Dragon Token', '/uploads/tokens/dragon.png', 120000, 'image/png', '/uploads/tokens/dragon-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Skeleton Token', '/uploads/tokens/skeleton.png', 48000, 'image/png', '/uploads/tokens/skeleton-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Zombie Token', '/uploads/tokens/zombie.png', 52000, 'image/png', '/uploads/tokens/zombie-thumb.png', first_user_id, first_campaign_id, 'token', true),
    
    -- NPC Tokens
    ('NPC Merchant', '/uploads/tokens/merchant.png', 45000, 'image/png', '/uploads/tokens/merchant-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('NPC Guard', '/uploads/tokens/guard.png', 50000, 'image/png', '/uploads/tokens/guard-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('NPC Wizard', '/uploads/tokens/wizard.png', 48000, 'image/png', '/uploads/tokens/wizard-thumb.png', first_user_id, first_campaign_id, 'token', true),
    
    -- Generic Tokens
    ('Red Token', '/uploads/tokens/red-circle.png', 30000, 'image/png', '/uploads/tokens/red-circle-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Blue Token', '/uploads/tokens/blue-circle.png', 30000, 'image/png', '/uploads/tokens/blue-circle-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Green Token', '/uploads/tokens/green-circle.png', 30000, 'image/png', '/uploads/tokens/green-circle-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Yellow Token', '/uploads/tokens/yellow-circle.png', 30000, 'image/png', '/uploads/tokens/yellow-circle-thumb.png', first_user_id, first_campaign_id, 'token', true),
    
    -- Environment Tokens
    ('Tree Token', '/uploads/tokens/tree.png', 65000, 'image/png', '/uploads/tokens/tree-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Rock Token', '/uploads/tokens/rock.png', 40000, 'image/png', '/uploads/tokens/rock-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Chest Token', '/uploads/tokens/chest.png', 50000, 'image/png', '/uploads/tokens/chest-thumb.png', first_user_id, first_campaign_id, 'token', true),
    ('Barrel Token', '/uploads/tokens/barrel.png', 35000, 'image/png', '/uploads/tokens/barrel-thumb.png', first_user_id, first_campaign_id, 'token', true),
    
    -- Image Assets
    ('Battle Background', '/uploads/images/battle-bg.jpg', 250000, 'image/jpeg', '/uploads/images/battle-bg-thumb.jpg', first_user_id, first_campaign_id, 'image', true),
    ('Tavern Interior', '/uploads/images/tavern.jpg', 300000, 'image/jpeg', '/uploads/images/tavern-thumb.jpg', first_user_id, first_campaign_id, 'image', true),
    ('Dungeon Corridor', '/uploads/images/dungeon.jpg', 280000, 'image/jpeg', '/uploads/images/dungeon-thumb.jpg', first_user_id, first_campaign_id, 'image', true);

    -- =============================================
    -- SAMPLE CHARACTERS WITH INVENTORY
    -- =============================================

    -- Get race, class, and background IDs
    DECLARE
        human_race_id UUID;
        elf_race_id UUID;
        dwarf_race_id UUID;
        fighter_class_id UUID;
        wizard_class_id UUID;
        rogue_class_id UUID;
        noble_bg_id UUID;
        criminal_bg_id UUID;
        acolyte_bg_id UUID;
        char1_id UUID;
        char2_id UUID;
        char3_id UUID;
    BEGIN
        SELECT id INTO human_race_id FROM races WHERE name = 'Human' LIMIT 1;
        SELECT id INTO elf_race_id FROM races WHERE name = 'Elf' LIMIT 1;
        SELECT id INTO dwarf_race_id FROM races WHERE name = 'Dwarf' LIMIT 1;
        SELECT id INTO fighter_class_id FROM classes WHERE name = 'Fighter' LIMIT 1;
        SELECT id INTO wizard_class_id FROM classes WHERE name = 'Wizard' LIMIT 1;
        SELECT id INTO rogue_class_id FROM classes WHERE name = 'Rogue' LIMIT 1;
        SELECT id INTO noble_bg_id FROM backgrounds WHERE name = 'Noble' LIMIT 1;
        SELECT id INTO criminal_bg_id FROM backgrounds WHERE name = 'Criminal' LIMIT 1;
        SELECT id INTO acolyte_bg_id FROM backgrounds WHERE name = 'Acolyte' LIMIT 1;

        -- Character 1: Human Fighter
        INSERT INTO characters (
            name, description, campaign_id, owner_id, race_id, class_id, background_id, level,
            hp_current, hp_max, hp_temporary, armor_class, speed,
            strength, dexterity, constitution, intelligence, wisdom, charisma,
            gold, experience_points
        ) VALUES (
            'Sir Galahad the Brave', 
            'A noble knight dedicated to protecting the innocent. Wields a mighty longsword and wears gleaming plate armor.',
            first_campaign_id, first_user_id, human_race_id, fighter_class_id, noble_bg_id, 3,
            28, 28, 0, 18, 30,
            16, 12, 14, 10, 13, 11,
            150, 900
        ) RETURNING id INTO char1_id;

        -- Character 2: Elf Wizard
        INSERT INTO characters (
            name, description, campaign_id, owner_id, race_id, class_id, background_id, level,
            hp_current, hp_max, hp_temporary, armor_class, speed,
            strength, dexterity, constitution, intelligence, wisdom, charisma,
            gold, experience_points
        ) VALUES (
            'Lyra Moonwhisper',
            'A scholarly elf wizard who seeks knowledge of ancient magics. Carries a staff and numerous spell scrolls.',
            first_campaign_id, first_user_id, elf_race_id, wizard_class_id, acolyte_bg_id, 2,
            12, 12, 0, 11, 30,
            8, 14, 13, 16, 12, 10,
            50, 300
        ) RETURNING id INTO char2_id;

        -- Character 3: Dwarf Rogue
        INSERT INTO characters (
            name, description, campaign_id, owner_id, race_id, class_id, background_id, level,
            hp_current, hp_max, hp_temporary, armor_class, speed,
            strength, dexterity, constitution, intelligence, wisdom, charisma,
            gold, experience_points
        ) VALUES (
            'Thorin Ironfist',
            'A crafty dwarf rogue with a past in the criminal underworld. Skilled with daggers and lockpicks.',
            first_campaign_id, first_user_id, dwarf_race_id, rogue_class_id, criminal_bg_id, 4,
            32, 32, 0, 15, 25,
            12, 16, 15, 11, 13, 10,
            75, 1700
        ) RETURNING id INTO char3_id;

        -- =============================================
        -- ADD INVENTORY ITEMS TO CHARACTERS
        -- =============================================

        -- Sir Galahad's Inventory
        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char1_id, id, 1, true, 'Main weapon'
        FROM inventory_items WHERE name = 'Longsword' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char1_id, id, 1, true, 'Worn armor'
        FROM inventory_items WHERE name = 'Plate' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char1_id, id, 1, true, 'Equipped'
        FROM inventory_items WHERE name = 'Shield' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char1_id, id, 3, false, 'Spare rations'
        FROM inventory_items WHERE name = 'Potion of healing' LIMIT 1;

        -- Lyra Moonwhisper's Inventory
        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char2_id, id, 1, true, 'Arcane focus'
        FROM inventory_items WHERE name = 'Quarterstaff' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char2_id, id, 1, false, 'For close combat'
        FROM inventory_items WHERE name = 'Dagger' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char2_id, id, 1, true, 'Worn for protection'
        FROM inventory_items WHERE name = 'Leather' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char2_id, id, 2, false, 'Emergency healing'
        FROM inventory_items WHERE name = 'Potion of healing' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char2_id, id, 1, false, 'Research materials'
        FROM inventory_items WHERE name = 'Ancient scroll' LIMIT 1;

        -- Thorin Ironfist's Inventory
        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 2, true, 'Dual wielding'
        FROM inventory_items WHERE name = 'Dagger' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 1, true, 'Worn armor'
        FROM inventory_items WHERE name = 'Studded leather' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 1, false, 'For locks'
        FROM inventory_items WHERE name = 'Thieves'' tools' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 1, false, 'Backup weapon'
        FROM inventory_items WHERE name = 'Shortsword' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 1, false, 'Stolen from a noble'
        FROM inventory_items WHERE name = 'Mysterious key' LIMIT 1;

        INSERT INTO character_inventory (character_id, item_id, quantity, is_equipped, notes)
        SELECT char3_id, id, 5, false, 'Poisoned'
        FROM inventory_items WHERE name = 'Antitoxin' LIMIT 1;

        -- =============================================
        -- ADD TOKENS TO MAPS
        -- =============================================

        -- Get some asset IDs for tokens
        DECLARE
            goblin_asset_id UUID;
            orc_asset_id UUID;
            dragon_asset_id UUID;
            skeleton_asset_id UUID;
            merchant_asset_id UUID;
            guard_asset_id UUID;
            tree_asset_id UUID;
            chest_asset_id UUID;
        BEGIN
            SELECT id INTO goblin_asset_id FROM assets WHERE name = 'Goblin Token' LIMIT 1;
            SELECT id INTO orc_asset_id FROM assets WHERE name = 'Orc Token' LIMIT 1;
            SELECT id INTO dragon_asset_id FROM assets WHERE name = 'Dragon Token' LIMIT 1;
            SELECT id INTO skeleton_asset_id FROM assets WHERE name = 'Skeleton Token' LIMIT 1;
            SELECT id INTO merchant_asset_id FROM assets WHERE name = 'NPC Merchant' LIMIT 1;
            SELECT id INTO guard_asset_id FROM assets WHERE name = 'NPC Guard' LIMIT 1;
            SELECT id INTO tree_asset_id FROM assets WHERE name = 'Tree Token' LIMIT 1;
            SELECT id INTO chest_asset_id FROM assets WHERE name = 'Chest Token' LIMIT 1;

            -- Add tokens to the first map
            INSERT INTO tokens (name, map_id, character_id, asset_id, x_position, y_position, width, height, rotation, is_locked, is_visible, layer_order) VALUES
            -- Character tokens (linked to characters)
            ('Sir Galahad', first_map_id, char1_id, NULL, 500.0, 400.0, 50.0, 50.0, 0.0, false, true, 2),
            ('Lyra Moonwhisper', first_map_id, char2_id, NULL, 550.0, 450.0, 50.0, 50.0, 0.0, false, true, 2),
            ('Thorin Ironfist', first_map_id, char3_id, NULL, 450.0, 450.0, 50.0, 50.0, 0.0, false, true, 2),
            
            -- Monster tokens
            ('Goblin Scout', first_map_id, NULL, goblin_asset_id, 800.0, 500.0, 50.0, 50.0, 0.0, false, true, 2),
            ('Goblin Warrior', first_map_id, NULL, goblin_asset_id, 850.0, 550.0, 50.0, 50.0, 0.0, false, true, 2),
            ('Orc Chieftain', first_map_id, NULL, orc_asset_id, 1000.0, 600.0, 60.0, 60.0, 0.0, false, true, 2),
            ('Skeleton Guard', first_map_id, NULL, skeleton_asset_id, 1200.0, 700.0, 50.0, 50.0, 90.0, false, true, 2),
            ('Ancient Dragon', first_map_id, NULL, dragon_asset_id, 1500.0, 800.0, 100.0, 100.0, 0.0, true, true, 2),
            
            -- NPC tokens
            ('Merchant', first_map_id, NULL, merchant_asset_id, 200.0, 300.0, 50.0, 50.0, 0.0, false, true, 2),
            ('City Guard', first_map_id, NULL, guard_asset_id, 300.0, 350.0, 50.0, 50.0, 45.0, false, true, 2),
            
            -- Environment tokens
            ('Oak Tree', first_map_id, NULL, tree_asset_id, 400.0, 200.0, 80.0, 100.0, 0.0, true, true, 0),
            ('Treasure Chest', first_map_id, NULL, chest_asset_id, 600.0, 250.0, 40.0, 40.0, 0.0, false, true, 1),
            ('Ancient Oak', first_map_id, NULL, tree_asset_id, 900.0, 300.0, 80.0, 100.0, 0.0, true, true, 0),
            ('Locked Chest', first_map_id, NULL, chest_asset_id, 1100.0, 400.0, 40.0, 40.0, 0.0, false, true, 1);
        END;
    END;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Display summary
DO $$
DECLARE
    asset_count INTEGER;
    char_count INTEGER;
    inventory_count INTEGER;
    token_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO asset_count FROM assets;
    SELECT COUNT(*) INTO char_count FROM characters;
    SELECT COUNT(*) INTO inventory_count FROM character_inventory;
    SELECT COUNT(*) INTO token_count FROM tokens;
    
    RAISE NOTICE 'Migration complete!';
    RAISE NOTICE 'Assets created: %', asset_count;
    RAISE NOTICE 'Characters created: %', char_count;
    RAISE NOTICE 'Inventory items added: %', inventory_count;
    RAISE NOTICE 'Tokens placed: %', token_count;
END $$;
