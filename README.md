# Nuxt4 + Janus WebRTC Demo

A modern WebRTC streaming application built with **Nuxt4**, **Janus Gateway**, and **Nuxt UI Pro**. This demo allows publishers to broadcast their webcam streams via VideoRoom and viewers to watch them through the Streaming plugin.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with WebRTC support
- Janus Gateway server (optional - uses demo server by default)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nuxt-janus-challenge

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🛠️ Technology Stack

- **Frontend**: Nuxt4 (Vue.js 3)
- **UI Framework**: Nuxt UI Pro + TailwindCSS
- **WebRTC**: Janus Gateway with typed_janus_js
- **Backend**: Nuxt Server API (H3)
- **TypeScript**: Full type safety

## 📁 Project Structure

```
nuxt-janus-challenge/
├── components/           # Reusable Vue components
│   ├── PublisherCard.vue    # Publisher interface
│   ├── ViewerCard.vue       # Viewer interface
│   └── StatusBadge.vue      # Status indicator
├── composables/          # Vue composables
│   ├── useJanus.ts          # Core Janus integration
│   ├── useVideoRoom.ts      # VideoRoom plugin logic
│   └── useStreaming.ts      # Streaming plugin logic
├── pages/               # Application pages
│   ├── index.vue            # Home page
│   ├── videoroom.vue        # Publisher page
│   └── streaming.vue        # Viewer page
├── server/api/          # Backend API
│   └── mountpoints.ts       # Mountpoint management
├── types/               # TypeScript definitions
│   └── janus.ts            # Janus-related types
└── assets/css/          # Stylesheets
    └── main.css            # Global styles
```

## 🎯 Features

### Publisher (VideoRoom)
- ✅ Join Janus VideoRoom
- ✅ Publish webcam + audio stream  
- ✅ Real-time video preview
- ✅ Automatic mountpoint registration
- ✅ Connection status monitoring

### Viewer (Streaming)
- ✅ Browse available streams
- ✅ Select and watch live streams
- ✅ Video playback controls
- ✅ Auto-refresh stream list
- ✅ Stream information display

### Backend API
- ✅ In-memory mountpoint storage
- ✅ RESTful API endpoints
- ✅ Real-time stream registry

## 🔧 Configuration

### Janus Server

By default, the app uses the demo Janus server:
```
wss://janus1.januscaler.com/janus/ws
```

To use your own Janus server, set the environment variable:
```bash
export JANUS_URL="ws://localhost:8188/janus"
```

Or update `nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    janusUrl: 'ws://your-janus-server:8188/janus'
  }
}
```

### Local Janus Setup (Optional)

If you want to run Janus locally:

```bash
# Using Docker
docker run -d \
  -p 8188:8188 \
  -p 8080:8080 \
  -p 7088:7088 \
  --name janus \
  januscaler/janus-gateway
```

Required Janus plugins:
- `janus.plugin.videoroom`
- `janus.plugin.streaming`

## 📖 Usage Guide

### 1. Publishing a Stream

1. Navigate to the **Publisher** page (`/videoroom`)
2. Click **"Join Room"** to connect to VideoRoom
3. Allow camera/microphone access when prompted
4. Click **"Start Publishing"** to broadcast your stream
5. Your stream will be automatically registered for viewers

### 2. Watching a Stream

1. Navigate to the **Viewer** page (`/streaming`)
2. Available streams will load automatically
3. Select a stream from the dropdown
4. Click **"Start Watching"** to begin playback
5. Use video controls for volume/fullscreen

## 🔌 API Reference

### GET `/api/mountpoints`
Retrieve all available mountpoints
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "description": "VideoRoom 1234 - Publisher 123",
      "roomId": 1234,
      "publisherId": 123,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST `/api/mountpoints`
Register a new mountpoint
```json
{
  "description": "My Stream",
  "roomId": 1234,
  "publisherId": 123
}
```

### DELETE `/api/mountpoints`
Remove a mountpoint
```json
{
  "id": 1
}
```

## 🛠️ Development

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

### Code Quality

The project follows these practices:
- TypeScript for type safety
- Vue 3 Composition API
- Modular composable architecture
- Clean component structure
- Responsive design

## 🔍 Troubleshooting

### Common Issues

**Browser not connecting to Janus:**
- Check if WebRTC is supported
- Verify Janus server URL
- Check browser console for errors

**Camera/Microphone access denied:**
- Allow permissions in browser settings
- Use HTTPS for production deployments
- Check privacy settings

**No streams available:**
- Ensure a publisher is active
- Check mountpoint registration
- Verify API connectivity

## 🎨 UI Components

Built with **Nuxt UI Pro** components:
- `UCard` - Content containers
- `UButton` - Interactive buttons  
- `USelect` - Dropdown selections
- `UBadge` - Status indicators
- `UAlert` - Error messages
- `UIcon` - Heroicons integration

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run preview
```

### Environment Variables

```bash
# .env
JANUS_URL=wss://your-janus-server/janus/ws
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Resources

- [Janus VideoRoom Documentation](https://janus.conf.meetecho.com/docs/videoroom.html)
- [Janus Streaming Documentation](https://janus.conf.meetecho.com/docs/streaming.html)
- [Nuxt UI Pro Documentation](https://ui.nuxt.com/pro)
- [Nuxt 4 Documentation](https://nuxt.com/)

## 📄 License

This project is for demonstration purposes. Check individual package licenses for production use.

---

**Built with ❤️ using Nuxt4, Janus WebRTC, and modern web technologies.**