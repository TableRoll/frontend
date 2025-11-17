# D&D Campaign Management System

A comprehensive web application for managing D&D campaigns, maps, tokens, characters, and audio playlists. Built with React, TypeScript, Node.js, and PostgreSQL.

## 🐳 Docker Support

This application is fully containerized and can be run with Docker for easy deployment and development.

### Quick Start with Docker

```bash
# Production environment
docker-compose up -d

# Development environment
docker-compose -f docker-compose.dev.yml up -d
```

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

For detailed Docker instructions, see [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md).

### Alternative: Windows Batch Script

```cmd
# Start production
docker-start.bat prod

# Start development
docker-start.bat dev

# Stop all services
docker-start.bat stop
```

### Alternative: Make Commands

```bash
# Production
make prod

# Development
make dev

# View logs
make logs

# Check status
make status
```

## Features

### 🔐 Authentication
- User registration and login system
- Secure session management
- User profile management
- Demo account for testing
- Form validation and error handling

### 🗺️ Map Management
- Upload high-resolution maps (PNG, JPG, WebP)
- Support for tiled maps (Deep Zoom / DZI format)
- Smooth pan, zoom, and rotation controls
- Grid overlay with square and hex grid support
- Snap-to-grid functionality for precise token placement

### 🎯 Token System
- Drag and drop token placement and movement
- Multi-select and box-select tokens
- Token properties: HP, states, rotation, size
- Context menus for token actions
- Visual indicators for status effects and HP

### 🎵 Audio Management
- Playlist creation and management
- Audio track upload and playback
- Volume control and fade effects
- Loop and crossfade support
- Background music and ambient sounds

### 📁 Asset Library
- Upload and organize images, tokens, and audio files
- Thumbnail generation for quick preview
- Search and filter assets by type
- Drag and drop file uploads
- Asset categorization and tagging

### 💾 Data Management
- Export/import scenes as JSON
- Local storage with IndexedDB
- Offline capability with service workers
- Scene snapshots and versioning

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Mantine UI
- **State Management**: Zustand
- **Rendering**: PixiJS for high-performance canvas rendering
- **Drag & Drop**: dnd-kit
- **Audio**: Web Audio API with Howler.js fallback
- **File Upload**: tus-js-client for resumable uploads
- **Storage**: IndexedDB for local caching

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dnd-map-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Authentication

The app includes a complete authentication system with the following features:

- **Login**: Use your email and password to sign in
- **Registration**: Create a new account with email, username, and display name
- **Demo Account**: Use `demo@example.com` / `password` to try the app without registration
- **User Profile**: View and manage your account information
- **Session Management**: Automatic login persistence and logout functionality

**Note**: The current implementation uses mock authentication for demonstration purposes. In a production environment, you would integrate with a real authentication service.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── AppShell.tsx    # Main application layout
│   ├── Dashboard.tsx   # Scene and map management
│   ├── MapCanvas.tsx   # PixiJS-based map rendering
│   ├── TokenLayer.tsx  # Token interaction layer
│   ├── AssetPanel.tsx  # Asset management interface
│   └── AudioPlayer.tsx # Audio playback controls
├── hooks/              # Custom React hooks
│   ├── usePanZoom.ts   # Pan/zoom functionality
│   └── useAudio.ts     # Audio management
├── stores/             # Zustand state stores
│   └── mapStore.ts     # Main application state
├── types/              # TypeScript type definitions
│   └── models.ts       # Data models and interfaces
├── utils/              # Utility functions
│   ├── tileUtils.ts    # Map tile utilities
│   └── index.ts        # General utilities
└── App.tsx             # Main application component
```

## Usage

### Creating Maps
1. Navigate to the Dashboard
2. Click "New Map" to create a map
3. Upload a map image file
4. Set map dimensions and properties
5. Save the map

### Managing Scenes
1. Select a map from the Dashboard
2. Click "Create Scene" to make a new scene
3. Add tokens and configure scene settings
4. Save and load scenes as needed

### Placing Tokens
1. Open the Map View
2. Use the Asset Panel to select tokens
3. Drag tokens onto the map
4. Right-click tokens to edit properties
5. Use keyboard shortcuts for quick actions

### Audio Playback
1. Go to the Audio Player
2. Create playlists and add tracks
3. Upload audio files or use existing assets
4. Control playback with the player interface
5. Set volume and fade effects

## Keyboard Shortcuts

- **G**: Toggle grid visibility
- **S**: Toggle snap-to-grid
- **R**: Reset viewport
- **F**: Fit map to screen
- **+/-**: Zoom in/out
- **Ctrl/Cmd + Click**: Multi-select tokens
- **Shift + Click**: Box select tokens

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Large maps are automatically tiled for efficient rendering
- Tokens are rendered using WebGL for smooth performance
- Assets are cached locally using IndexedDB
- Lazy loading for off-screen content

## 📚 Documentation

All project documentation has been organized in the **[docs/](docs/)** folder:

- **Getting Started**: Setup guides, Docker instructions, and quick starts
- **Features**: Character creation, map management, token systems
- **Database**: Schema, migrations, and integration guides
- **Monitoring**: Grafana, Prometheus setup and configuration
- **Development**: Workflow guides, testing checklists, and fixes

📖 **[View Full Documentation Index](docs/README.md)**

### Quick Links

- 🗺️ [Map Management Guides](docs/MAP_UPLOAD_PREVIEW_GUIDE.md)
- 👥 [Character Creation Guide](docs/CHARACTER_CREATION_GUIDE.md)
- 🎭 [Token System Guide](docs/TOKEN_CREATION_GUIDE.md)
- 🐳 [Docker Guide](docs/DOCKER_GUIDE.md)
- 🗄️ [Database Status & Tests](docs/TEST_RESULTS_SUMMARY.md)
- 📊 [Monitoring Setup](docs/MONITORING_QUICK_START.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the D&D community
- Inspired by popular VTT applications
- Uses open-source libraries and tools
- Special thanks to contributors and testers

## Roadmap

- [ ] Real-time multiplayer support
- [ ] Advanced lighting and fog of war
- [ ] Dice rolling integration
- [ ] Character sheet integration
- [ ] Plugin system for extensions
- [ ] Mobile app version
- [ ] Cloud storage integration
