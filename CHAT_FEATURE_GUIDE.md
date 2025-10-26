# Chat Feature Guide

## Overview
A real-time chat box is now available on the right side of the map view, allowing communication between players during game sessions. The chat is positioned as a fixed sidebar that doesn't interfere with map interaction.

## Features

### Current Features
- ✅ **Message Display**: Scrollable message history with timestamps
- ✅ **Send Messages**: Text input with send button or Enter key
- ✅ **User Identification**: Messages show sender name (GM or Player)
- ✅ **System Messages**: Special styling for system announcements
- ✅ **Collapsible**: Can collapse to save screen space
- ✅ **Message Counter**: Badge showing total messages
- ✅ **Auto-scroll**: Automatically scrolls to newest messages
- ✅ **Visual Distinction**: Different styling for GM vs Player messages

### Visual Design
- **Width**: 320px fixed sidebar
- **Position**: Right side of screen, below header
- **GM Messages**: Purple background (#f3f0ff)
- **Player Messages**: Light gray background (#f8f9fa)
- **System Messages**: Blue background with border
- **Collapsible**: Can hide to 40px width when collapsed

## How to Use

### Opening the Chat
The chat is automatically visible when you enter Map View. It appears as a fixed panel on the right side of the screen.

### Sending Messages
1. Type your message in the input field at the bottom
2. Press **Enter** or click the **Send** button
3. Your message appears in the chat with your name and timestamp

### Collapsing the Chat
1. Click the **chevron icon** (→) in the chat header
2. The chat collapses to a thin 40px sidebar
3. Click the collapsed sidebar to expand it again

### Message Types
- **Your Messages**: Appear with your role (GM or Player)
- **System Messages**: Blue highlighted messages for important info
- **Timestamps**: Each message shows the time it was sent

## Chat Interface

### Header
- **Title**: "Chat"
- **Message Counter**: Badge showing number of messages
- **Collapse Button**: Chevron icon to hide/show chat

### Message Area
- **Scrollable**: View all message history
- **Auto-scroll**: New messages automatically appear at bottom
- **Timestamps**: 12-hour format (HH:MM AM/PM)
- **Sender Names**: Shows who sent each message

### Input Area
- **Text Field**: Type messages here
- **Send Button**: Blue button with send icon
- **Keyboard Shortcut**: Press Enter to send
- **Helper Text**: Shows keyboard shortcut and future feature info

## Future Enhancements

The chat is designed to support real-time multiplayer communication. Planned features include:

### Phase 1: Local Chat (Current)
- ✅ Basic message display
- ✅ Send messages
- ✅ User identification
- ✅ Collapsible interface

### Phase 2: Real-time Communication
- 🔄 WebSocket integration
- 🔄 Multiple users in same session
- 🔄 Real-time message synchronization
- 🔄 User presence indicators (online/offline)
- 🔄 Typing indicators

### Phase 3: Enhanced Features
- 📋 Dice roll commands (e.g., `/roll 1d20`)
- 📋 Whisper/private messages to specific players
- 📋 Message reactions/emojis
- 📋 Rich text formatting (bold, italic)
- 📋 Link sharing and previews
- 📋 Image sharing
- 📋 Message history persistence
- 📋 Message search functionality

### Phase 4: Advanced Features
- 📋 Chat rooms/channels (party chat, GM channel, etc.)
- 📋 Voice chat integration
- 📋 Message notifications
- 📋 Customizable chat themes
- 📋 Chat logs export
- 📋 Moderation tools (for GMs)
- 📋 Message pinning
- 📋 @mentions for players

## Technical Details

### Component Structure
```typescript
<Chat isGM={boolean} />
```

### Props
- `isGM`: Boolean indicating if current user is the Game Master

### Message Format
```typescript
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isSystem?: boolean;
}
```

### Styling
- Fixed position on right side
- Z-index: 100 (above map, below modals)
- White background with border
- Responsive to screen height
- Smooth transitions for collapse/expand

### State Management
Currently uses local component state. Future versions will integrate with:
- Zustand store for state management
- WebSocket connection for real-time updates
- Local storage for message persistence

## Integration

### Map View
The chat is integrated into the MapCanvas component:
- Appears automatically when viewing a map
- Visible to all players in the session
- Positioned to not interfere with map controls
- Works alongside asset hotbar and token layer

### Screen Layout
```
┌─────────────────────────────────────────┐
│           Header (60px)                  │
├───────────────────────────┬──────────────┤
│                           │              │
│                           │    Chat      │
│        Map Canvas         │   (320px)    │
│                           │              │
│                           │              │
└───────────────────────────┴──────────────┘
```

## Best Practices

### For Players
1. Keep messages concise and relevant
2. Use chat for in-game communication
3. Respect other players' messages
4. Use system commands when available (future)

### For GMs
1. Use chat for announcements and clarifications
2. Monitor chat during game sessions
3. Use system messages for important info
4. Consider using whispers for private info (future)

### Performance
- Chat auto-scrolls to latest messages
- Old messages remain in history (currently in memory)
- Collapsible design saves screen space
- Minimal impact on map rendering performance

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: (Future) New line in message
- **Esc**: (Future) Close/minimize chat

## Accessibility

- Clear visual distinction between message types
- Readable font sizes and contrasts
- Keyboard navigation support
- Screen reader friendly structure

## Troubleshooting

### Chat Not Visible
- Ensure you're in Map View (not Dashboard)
- Check if chat is collapsed (look for thin sidebar on right)
- Refresh the page if chat doesn't appear

### Messages Not Sending
- Ensure message field is not empty
- Check for JavaScript errors in console
- Verify network connection (for future real-time features)

### Chat Overlapping Content
- Chat is fixed at 320px width
- Map canvas accounts for this width
- Use collapse feature if needed

## Related Features

- **Map Canvas**: Main game view where chat is displayed
- **Token Layer**: Drag tokens while chatting
- **Asset Hotbar**: Access assets while viewing chat
- **GM Mode**: Special privileges for Game Master

---

*The chat feature is designed to grow with the application, starting as a local communication tool and evolving into a full real-time multiplayer chat system.*



