import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Stack,
  TextInput,
  ScrollArea,
  Text,
  Group,
  ActionIcon,
  Badge,
  Divider,
  Paper,
  Tooltip
} from '@mantine/core';
import {
  IconSend,
  IconX,
  IconChevronRight,
  IconChevronLeft
} from '@tabler/icons-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatProps {
  isGM?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ isGM = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the game! Use this chat to communicate with other players.',
      sender: 'System',
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: inputValue.trim(),
        sender: isGM ? 'Game Master' : 'Player',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isCollapsed) {
    return (
      <Box
        style={{
          position: 'fixed',
          right: 0,
          top: '60px',
          bottom: 0,
          width: '40px',
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(false)}
      >
        <Tooltip label="Open Chat" position="left">
          <ActionIcon variant="subtle" size="lg">
            <IconChevronLeft size={20} />
          </ActionIcon>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: '60px',
        bottom: 0,
        width: '320px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}
    >
      {/* Chat Header */}
      <Box
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="sm" fw={600}>Chat</Text>
            <Badge size="sm" color="blue" variant="light">
              {messages.filter(m => !m.isSystem).length}
            </Badge>
          </Group>
          <Tooltip label="Collapse Chat">
            <ActionIcon 
              variant="subtle" 
              size="sm"
              onClick={() => setIsCollapsed(true)}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      {/* Messages Area */}
      <ScrollArea
        style={{ flex: 1 }}
        viewportRef={scrollRef}
        scrollbarSize={8}
      >
        <Stack gap="sm" p="md">
          {messages.map((message) => (
            <Box key={message.id}>
              {message.isSystem ? (
                <Paper
                  p="xs"
                  style={{
                    backgroundColor: '#e7f5ff',
                    border: '1px solid #339af0',
                    borderRadius: '8px'
                  }}
                >
                  <Text size="xs" c="blue" ta="center">
                    {message.text}
                  </Text>
                </Paper>
              ) : (
                <Box>
                  <Group gap="xs" mb={4}>
                    <Text size="xs" fw={600} c="dark">
                      {message.sender}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatTime(message.timestamp)}
                    </Text>
                  </Group>
                  <Paper
                    p="xs"
                    style={{
                      backgroundColor: message.sender === 'Game Master' ? '#f3f0ff' : '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Text size="sm" style={{ wordBreak: 'break-word' }}>
                      {message.text}
                    </Text>
                  </Paper>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      <Divider />

      {/* Input Area */}
      <Box p="md">
        <Group gap="xs" align="flex-end">
          <TextInput
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{ flex: 1 }}
            size="sm"
            styles={{
              input: {
                borderRadius: '8px'
              }
            }}
          />
          <Tooltip label="Send Message (Enter)">
            <ActionIcon
              size="lg"
              variant="filled"
              color="blue"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{ borderRadius: '8px' }}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">
          Press Enter to send • Future: Real-time multiplayer chat
        </Text>
      </Box>
    </Box>
  );
};


