-- D&D Campaign Management System - Seed Data
-- PostgreSQL Migration 002

-- =============================================
-- RACES DATA
-- =============================================

INSERT INTO races (name, description, ability_score_bonuses, racial_traits, speed, size) VALUES
('Human', 'Versatile and ambitious, humans are the most adaptable race.', 
 '{"str": 1, "dex": 1, "con": 1, "int": 1, "wis": 1, "cha": 1}',
 '["Extra Language", "Extra Skill Proficiency"]', 30, 'medium'),

('Elf', 'Graceful and long-lived, elves are known for their keen senses and magical affinity.',
 '{"dex": 2}',
 '["Darkvision", "Fey Ancestry", "Trance", "Keen Senses"]', 30, 'medium'),

('Dwarf', 'Hardy and traditional, dwarves are known for their craftsmanship and resistance to poison.',
 '{"con": 2}',
 '["Darkvision", "Dwarven Resilience", "Stonecunning"]', 25, 'medium'),

('Halfling', 'Small and nimble, halflings are known for their luck and stealth.',
 '{"dex": 2}',
 '["Lucky", "Brave", "Halfling Nimbleness"]', 25, 'small'),

('Gnome', 'Small and curious, gnomes are known for their intelligence and magical tinkering.',
 '{"int": 2}',
 '["Darkvision", "Gnome Cunning"]', 25, 'small'),

('Dragonborn', 'Proud and strong, dragonborn are known for their breath weapons and draconic heritage.',
 '{"str": 2, "cha": 1}',
 '["Draconic Ancestry", "Breath Weapon", "Damage Resistance"]', 30, 'medium'),

('Tiefling', 'Descendants of fiends, tieflings are known for their infernal heritage and magical abilities.',
 '{"int": 1, "cha": 2}',
 '["Darkvision", "Hellish Resistance", "Infernal Legacy"]', 30, 'medium'),

('Half-Elf', 'Combining human versatility with elven grace, half-elves are adaptable and charismatic.',
 '{"cha": 2}',
 '["Darkvision", "Fey Ancestry", "Two Skill Proficiencies"]', 30, 'medium'),

('Half-Orc', 'Combining human adaptability with orc strength, half-orcs are fierce and resilient.',
 '{"str": 2, "con": 1}',
 '["Darkvision", "Relentless Endurance", "Savage Attacks"]', 30, 'medium');

-- =============================================
-- CLASSES DATA
-- =============================================

INSERT INTO classes (name, description, hit_die, primary_ability, saving_throw_proficiencies, skill_proficiencies, starting_equipment, class_features, spellcasting_ability) VALUES
('Fighter', 'Masters of combat, fighters are versatile warriors who excel in battle.',
 10, 'str', '["str", "con"]', '["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"]',
 '{"armor": "Chain mail", "weapons": ["Longsword", "Shield"], "tools": ["Dungeoneer''s pack"]}',
 '{"level_1": ["Fighting Style", "Second Wind"]}', null),

('Wizard', 'Masters of arcane magic, wizards study and prepare spells from their spellbooks.',
 6, 'int', '["int", "wis"]', '["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]',
 '{"weapons": ["Quarterstaff", "Dagger"], "tools": ["Scholar''s pack", "Spellbook"]}',
 '{"level_1": ["Spellcasting", "Arcane Recovery"]}', 'int'),

('Rogue', 'Skilled in stealth and precision, rogues are masters of cunning and finesse.',
 8, 'dex', '["dex", "int"]', '["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]',
 '{"weapons": ["Rapier", "Shortbow"], "tools": ["Burglar''s pack", "Thieves'' tools"]}',
 '{"level_1": ["Expertise", "Sneak Attack", "Thieves'' Cant"]}', null),

('Cleric', 'Divine spellcasters who serve deities and channel divine power.',
 8, 'wis', '["wis", "cha"]', '["History", "Insight", "Medicine", "Persuasion", "Religion"]',
 '{"armor": "Scale mail", "weapons": ["Mace", "Shield"], "tools": ["Priest''s pack"]}',
 '{"level_1": ["Spellcasting", "Divine Domain"]}', 'wis'),

('Ranger', 'Wilderness warriors who are skilled in tracking and survival.',
 10, 'dex', '["str", "dex"]', '["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"]',
 '{"armor": "Leather armor", "weapons": ["Longsword", "Longbow"], "tools": ["Explorer''s pack"]}',
 '{"level_1": ["Favored Enemy", "Natural Explorer"]}', 'wis'),

('Paladin', 'Divine warriors who combine martial prowess with divine magic.',
 10, 'str', '["wis", "cha"]', '["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"]',
 '{"armor": "Chain mail", "weapons": ["Longsword", "Shield"], "tools": ["Priest''s pack"]}',
 '{"level_1": ["Divine Sense", "Lay on Hands"]}', 'cha'),

('Barbarian', 'Fierce warriors who channel primal rage in battle.',
 12, 'str', '["str", "con"]', '["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]',
 '{"weapons": ["Greataxe", "Javelin"], "tools": ["Explorer''s pack"]}',
 '{"level_1": ["Rage", "Unarmored Defense"]}', null),

('Bard', 'Versatile performers who use magic and inspiration to aid their allies.',
 8, 'cha', '["dex", "cha"]', '["Athletics", "Acrobatics", "Sleight of Hand", "Stealth", "Animal Handling", "Insight", "Medicine", "Survival", "Deception", "Intimidation", "Performance", "Persuasion", "History", "Investigation", "Nature", "Religion"]',
 '{"weapons": ["Rapier", "Longbow"], "tools": ["Diplomat''s pack", "Lute"]}',
 '{"level_1": ["Spellcasting", "Bardic Inspiration", "Jack of All Trades"]}', 'cha'),

('Druid', 'Nature spellcasters who can transform into animals and wield natural magic.',
 8, 'wis', '["int", "wis"]', '["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"]',
 '{"weapons": ["Scimitar", "Shield"], "tools": ["Explorer''s pack", "Druidic focus"]}',
 '{"level_1": ["Spellcasting", "Druidic", "Wild Shape"]}', 'wis'),

('Monk', 'Martial artists who channel ki energy for supernatural abilities.',
 8, 'dex', '["str", "dex"]', '["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"]',
 '{"weapons": ["Shortsword", "Dart"], "tools": ["Dungeoneer''s pack"]}',
 '{"level_1": ["Unarmored Defense", "Martial Arts", "Ki"]}', null),

('Sorcerer', 'Natural spellcasters who draw power from their bloodline.',
 6, 'cha', '["con", "cha"]', '["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"]',
 '{"weapons": ["Dagger", "Dart"], "tools": ["Dungeoneer''s pack"]}',
 '{"level_1": ["Spellcasting", "Sorcerous Origin", "Spell Points"]}', 'cha'),

('Warlock', 'Spellcasters who gain power through pacts with otherworldly beings.',
 8, 'cha', '["wis", "cha"]', '["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"]',
 '{"weapons": ["Light crossbow", "Dagger"], "tools": ["Scholar''s pack"]}',
 '{"level_1": ["Spellcasting", "Otherworldly Patron", "Pact Magic"]}', 'cha');

-- =============================================
-- BACKGROUNDS DATA
-- =============================================

INSERT INTO backgrounds (name, description, skill_proficiencies, tool_proficiencies, languages, equipment, feature_name, feature_description) VALUES
('Acolyte', 'You have spent your life in the service of a temple, learning sacred texts and performing religious ceremonies.',
 '["Insight", "Religion"]', '[]', '["Two of your choice"]',
 '{"items": ["Holy symbol", "Prayer book", "Incense", "Common clothes", "Belt pouch with 15 gp"]}',
 'Shelter of the Faithful', 'You and your companions can expect to receive free healing and care at a temple of your faith.'),

('Criminal', 'You are an experienced criminal with a history of breaking the law.',
 '["Deception", "Stealth"]', '["One type of gaming set", "Thieves'' tools"]', '[]',
 '{"items": ["Crowbar", "Dark common clothes with hood", "Belt pouch with 15 gp"]}',
 'Criminal Contact', 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals.'),

('Folk Hero', 'You come from a humble social rank, but something happened that made you a hero to the common folk.',
 '["Animal Handling", "Survival"]', '["One type of artisan''s tools", "Vehicles (land)"]', '[]',
 '{"items": ["Artisan''s tools", "Shovel", "Iron pot", "Common clothes", "Belt pouch with 10 gp"]}',
 'Rustic Hospitality', 'Since you come from the ranks of the common folk, you fit in among them with ease.'),

('Noble', 'You understand wealth, power, and privilege, and you carry yourself with the bearing of someone accustomed to respect.',
 '["History", "Persuasion"]', '["One type of gaming set"]', '["One of your choice"]',
 '{"items": ["Signet ring", "Scroll of pedigree", "Purse with 25 gp"]}',
 'Position of Privilege', 'Thanks to your noble birth, people are inclined to think the best of you.'),

('Sage', 'You spent years learning the lore of the multiverse, and you have a particular area of expertise.',
 '["Arcana", "History"]', '[]', '["Two of your choice"]',
 '{"items": ["Ink", "Quill", "Small knife", "Letter from a dead colleague", "Common clothes", "Belt pouch with 10 gp"]}',
 'Researcher', 'When you attempt to learn or recall a piece of lore, if you do not know the information, you often know where and from whom you can obtain it.'),

('Soldier', 'War has been your life for as long as you care to remember, and you have risen to become a leader of soldiers.',
 '["Athletics", "Intimidation"]', '["One type of gaming set", "Vehicles (land)"]', '[]',
 '{"items": ["Insignia of rank", "Trophy taken from a fallen enemy", "Playing cards", "Common clothes", "Belt pouch with 10 gp"]}',
 'Military Rank', 'You have a military rank from your career as a soldier.');

-- =============================================
-- ITEM TYPES DATA
-- =============================================

INSERT INTO item_types (name, category) VALUES
-- Weapons
('Dagger', 'weapon'),
('Shortsword', 'weapon'),
('Longsword', 'weapon'),
('Greatsword', 'weapon'),
('Rapier', 'weapon'),
('Scimitar', 'weapon'),
('Handaxe', 'weapon'),
('Battleaxe', 'weapon'),
('Greataxe', 'weapon'),
('Shortbow', 'weapon'),
('Longbow', 'weapon'),
('Crossbow, light', 'weapon'),
('Crossbow, heavy', 'weapon'),
('Javelin', 'weapon'),
('Spear', 'weapon'),
('Quarterstaff', 'weapon'),

-- Armor
('Padded', 'armor'),
('Leather', 'armor'),
('Studded leather', 'armor'),
('Hide', 'armor'),
('Chain shirt', 'armor'),
('Scale mail', 'armor'),
('Breastplate', 'armor'),
('Half plate', 'armor'),
('Ring mail', 'armor'),
('Chain mail', 'armor'),
('Splint', 'armor'),
('Plate', 'armor'),

-- Shields
('Shield', 'shield'),

-- Tools
('Thieves'' tools', 'tool'),
('Disguise kit', 'tool'),
('Forgery kit', 'tool'),
('Herbalism kit', 'tool'),
('Poisoner''s kit', 'tool'),
('Alchemist''s supplies', 'tool'),
('Brewer''s supplies', 'tool'),
('Calligrapher''s supplies', 'tool'),
('Carpenter''s tools', 'tool'),
('Cartographer''s tools', 'tool'),
('Cobbler''s tools', 'tool'),
('Cook''s utensils', 'tool'),
('Glassblower''s tools', 'tool'),
('Jeweler''s tools', 'tool'),
('Leatherworker''s tools', 'tool'),
('Mason''s tools', 'tool'),
('Painter''s supplies', 'tool'),
('Potter''s tools', 'tool'),
('Smith''s tools', 'tool'),
('Tinker''s tools', 'tool'),
('Weaver''s tools', 'tool'),
('Woodcarver''s tools', 'tool'),

-- Consumables
('Potion of healing', 'consumable'),
('Antitoxin', 'consumable'),
('Potion of greater healing', 'consumable'),
('Potion of superior healing', 'consumable'),
('Potion of supreme healing', 'consumable'),

-- Story items
('Mysterious key', 'story'),
('Ancient scroll', 'story'),
('Family heirloom', 'story'),
('Quest item', 'story');

-- =============================================
-- SAMPLE INVENTORY ITEMS
-- =============================================

INSERT INTO inventory_items (name, description, item_type_id, damage_dice, damage_type, armor_class_bonus, weight, value, properties, rarity) 
SELECT 
    it.name,
    CASE 
        WHEN it.category = 'weapon' THEN 'A ' || it.name || ' for combat.'
        WHEN it.category = 'armor' THEN 'Armor that provides protection in combat.'
        WHEN it.category = 'shield' THEN 'A shield that provides additional protection.'
        WHEN it.category = 'tool' THEN 'Tools for ' || LOWER(it.name) || '.'
        WHEN it.category = 'consumable' THEN 'A consumable item with magical properties.'
        ELSE 'A mysterious item of unknown origin.'
    END,
    it.id,
    CASE 
        WHEN it.name IN ('Dagger', 'Javelin') THEN '1d4'
        WHEN it.name IN ('Shortsword', 'Scimitar', 'Handaxe') THEN '1d6'
        WHEN it.name IN ('Longsword', 'Rapier', 'Battleaxe', 'Spear') THEN '1d8'
        WHEN it.name IN ('Greatsword', 'Greataxe') THEN '2d6'
        WHEN it.name IN ('Shortbow', 'Crossbow, light') THEN '1d6'
        WHEN it.name IN ('Longbow', 'Crossbow, heavy') THEN '1d8'
        ELSE NULL
    END,
    CASE 
        WHEN it.name LIKE '%sword%' OR it.name LIKE '%rapier%' OR it.name LIKE '%scimitar%' THEN 'slashing'
        WHEN it.name LIKE '%axe%' OR it.name LIKE '%spear%' OR it.name LIKE '%javelin%' THEN 'slashing'
        WHEN it.name LIKE '%bow%' OR it.name LIKE '%crossbow%' THEN 'piercing'
        WHEN it.name = 'Dagger' THEN 'piercing'
        WHEN it.name = 'Quarterstaff' THEN 'bludgeoning'
        ELSE NULL
    END,
    CASE 
        WHEN it.name = 'Shield' THEN 2
        WHEN it.category = 'armor' THEN 
            CASE 
                WHEN it.name = 'Padded' THEN 1
                WHEN it.name = 'Leather' THEN 1
                WHEN it.name = 'Studded leather' THEN 2
                WHEN it.name = 'Hide' THEN 2
                WHEN it.name = 'Chain shirt' THEN 3
                WHEN it.name = 'Scale mail' THEN 4
                WHEN it.name = 'Breastplate' THEN 4
                WHEN it.name = 'Half plate' THEN 5
                WHEN it.name = 'Ring mail' THEN 4
                WHEN it.name = 'Chain mail' THEN 6
                WHEN it.name = 'Splint' THEN 7
                WHEN it.name = 'Plate' THEN 8
                ELSE 0
            END
        ELSE 0
    END,
    CASE 
        WHEN it.name = 'Dagger' THEN 1
        WHEN it.name IN ('Shortsword', 'Rapier', 'Scimitar', 'Handaxe') THEN 2
        WHEN it.name IN ('Longsword', 'Battleaxe', 'Spear') THEN 3
        WHEN it.name = 'Greatsword' THEN 6
        WHEN it.name = 'Greataxe' THEN 7
        WHEN it.name IN ('Shortbow', 'Crossbow, light') THEN 2
        WHEN it.name IN ('Longbow', 'Crossbow, heavy') THEN 2
        WHEN it.name = 'Javelin' THEN 2
        WHEN it.name = 'Quarterstaff' THEN 4
        WHEN it.name = 'Shield' THEN 6
        WHEN it.category = 'armor' THEN 
            CASE 
                WHEN it.name = 'Padded' THEN 8
                WHEN it.name = 'Leather' THEN 10
                WHEN it.name = 'Studded leather' THEN 13
                WHEN it.name = 'Hide' THEN 12
                WHEN it.name = 'Chain shirt' THEN 20
                WHEN it.name = 'Scale mail' THEN 45
                WHEN it.name = 'Breastplate' THEN 20
                WHEN it.name = 'Half plate' THEN 40
                WHEN it.name = 'Ring mail' THEN 40
                WHEN it.name = 'Chain mail' THEN 55
                WHEN it.name = 'Splint' THEN 60
                WHEN it.name = 'Plate' THEN 65
                ELSE 0
            END
        ELSE 0
    END,
    CASE 
        WHEN it.name = 'Dagger' THEN 2
        WHEN it.name IN ('Shortsword', 'Rapier', 'Scimitar', 'Handaxe') THEN 10
        WHEN it.name IN ('Longsword', 'Battleaxe', 'Spear') THEN 15
        WHEN it.name = 'Greatsword' THEN 50
        WHEN it.name = 'Greataxe' THEN 30
        WHEN it.name IN ('Shortbow', 'Crossbow, light') THEN 25
        WHEN it.name IN ('Longbow', 'Crossbow, heavy') THEN 50
        WHEN it.name = 'Javelin' THEN 0.5
        WHEN it.name = 'Quarterstaff' THEN 2
        WHEN it.name = 'Shield' THEN 10
        WHEN it.category = 'armor' THEN 
            CASE 
                WHEN it.name = 'Padded' THEN 5
                WHEN it.name = 'Leather' THEN 10
                WHEN it.name = 'Studded leather' THEN 45
                WHEN it.name = 'Hide' THEN 10
                WHEN it.name = 'Chain shirt' THEN 50
                WHEN it.name = 'Scale mail' THEN 50
                WHEN it.name = 'Breastplate' THEN 400
                WHEN it.name = 'Half plate' THEN 750
                WHEN it.name = 'Ring mail' THEN 30
                WHEN it.name = 'Chain mail' THEN 75
                WHEN it.name = 'Splint' THEN 200
                WHEN it.name = 'Plate' THEN 1500
                ELSE 0
            END
        WHEN it.category = 'consumable' THEN 50
        ELSE 0
    END,
    (CASE 
        WHEN it.name = 'Dagger' THEN '["finesse", "light", "thrown"]'
        WHEN it.name IN ('Shortsword', 'Rapier', 'Scimitar') THEN '["finesse", "light"]'
        WHEN it.name = 'Handaxe' THEN '["light", "thrown"]'
        WHEN it.name = 'Battleaxe' THEN '["versatile"]'
        WHEN it.name = 'Spear' THEN '["thrown", "versatile"]'
        WHEN it.name = 'Quarterstaff' THEN '["versatile"]'
        WHEN it.name IN ('Shortbow', 'Longbow') THEN '["ammunition", "two-handed"]'
        WHEN it.name LIKE 'Crossbow%' THEN '["ammunition", "loading", "two-handed"]'
        WHEN it.name = 'Javelin' THEN '["thrown"]'
        WHEN it.name = 'Shield' THEN '["shield"]'
        ELSE '[]'
    END)::jsonb,
    CASE 
        WHEN it.category = 'story' THEN 'artifact'
        WHEN it.name IN ('Potion of healing', 'Antitoxin') THEN 'common'
        WHEN it.name IN ('Potion of greater healing') THEN 'uncommon'
        WHEN it.name IN ('Potion of superior healing') THEN 'rare'
        WHEN it.name IN ('Potion of supreme healing') THEN 'very_rare'
        ELSE 'common'
    END
FROM item_types it;
