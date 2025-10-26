import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextInput,
  Button,
  ScrollArea,
  Group,
  Text,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Textarea
} from '@mantine/core';
import {
  IconSend,
  IconMessage,
  IconDice,
  IconSettings,
  IconTrash,
  IconUser
} from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'roll' | 'system';
  rollResult?: {
    dice: string;
    result: number;
    rolls: number[];
  };
}

interface ChatProps {
  height?: number;
}

export const Chat: React.FC<ChatProps> = ({ height = 400 }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      username: 'System',
      message: 'Welcome to the chat! Use /roll to roll dice (e.g., /roll 1d20+5)',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const rollDice = (diceString: string): { dice: string; result: number; rolls: number[] } => {
    // Parse dice string (e.g., "1d20+5", "2d6", "1d4-1")
    const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) {
      throw new Error(`Invalid dice format: ${diceString}`);
    }
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const result = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    
    return { dice: diceString, result, rolls };
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    let messageType: 'message' | 'roll' | 'system' = 'message';
    let rollResult: ChatMessage['rollResult'] = undefined;

    // Check if it's a dice roll command
    if (newMessage.startsWith('/roll ')) {
      try {
        const diceString = newMessage.substring(6).trim();
        rollResult = rollDice(diceString);
        messageType = 'roll';
      } catch (error) {
        // If roll parsing fails, treat as regular message
        messageType = 'message';
      }
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.displayName,
      message: newMessage,
      timestamp: new Date(),
      type: messageType,
      rollResult
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        userId: 'system',
        username: 'System',
        message: 'Chat cleared',
        timestamp: new Date(),
        type: 'system'
      }
    ]);
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageColor = (messageType: string): string => {
    switch (messageType) {
      case 'roll': return 'blue';
      case 'system': return 'gray';
      default: return 'dark';
    }
  };

  return (
    <Paper withBorder p="md" h={height || '100%'} style={{ flex: 1 }}>
      <Stack gap="sm" h="100%">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconMessage size={20} />
            <Text fw={600}>Chat</Text>
            <Badge size="sm" color="green">
              {messages.length - 1} messages
            </Badge>
          </Group>
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconSettings size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={clearChat}
              >
                Clear Chat
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Messages */}
        <ScrollArea h="100%" ref={scrollAreaRef}>
          <Stack gap="xs">
            {messages.map((message) => (
              <Paper
                key={message.id}
                p="sm"
                withBorder
                style={{
                  backgroundColor: message.type === 'system' ? '#f8f9fa' : undefined
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconUser size={14} />
                    <Text size="sm" fw={500} c={getMessageColor(message.type)}>
                      {message.username}
                    </Text>
                    {message.type === 'roll' && (
                      <Badge size="xs" color="blue" leftSection={<IconDice size={10} />}>
                        Roll
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </Group>
                
                <Text size="sm">{message.message}</Text>
                
                {message.rollResult && (
                  <Group gap="xs" mt="xs">
                    <Badge color="blue" variant="light">
                      {message.rollResult.dice}
                    </Badge>
                    <Text size="sm" fw={600}>
                      = {message.rollResult.result}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({message.rollResult.rolls.join(', ')})
                    </Text>
                  </Group>
                )}
              </Paper>
            ))}
          </Stack>
        </ScrollArea>

        {/* Input */}
        <Group gap="xs">
          <TextInput
            placeholder="Type a message... (use /roll 1d20+5 for dice rolls)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            leftSection={<IconSend size={16} />}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};