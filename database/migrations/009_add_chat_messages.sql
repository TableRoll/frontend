-- D&D Campaign Management System - Chat Messages
-- PostgreSQL Migration 009

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================

-- Chat messages table for storing campaign chat history
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for system messages
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'dice_roll', 'action')),
    metadata JSONB, -- Additional data like dice results, action details, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Index for querying messages by campaign (most common query)
CREATE INDEX idx_chat_messages_campaign ON chat_messages(campaign_id);

-- Index for querying messages by sender
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- Index for querying messages by campaign and time (for loading chat history)
CREATE INDEX idx_chat_messages_campaign_time ON chat_messages(campaign_id, created_at DESC);

-- Index for message type filtering
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Apply updated_at trigger to chat_messages table
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VERIFICATION
-- =============================================

-- Display summary
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_messages'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Migration complete! Chat messages table created successfully.';
        RAISE NOTICE 'Table: chat_messages';
        RAISE NOTICE 'Indexes: campaign, sender, campaign_time, type';
    ELSE
        RAISE EXCEPTION 'Failed to create chat_messages table';
    END IF;
END $$;






