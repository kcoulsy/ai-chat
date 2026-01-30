# Story AI Chat

A desktop chat application for writers and storytellers with advanced threading and navigation features.

## Features

- **Three-Panel Layout**: Chat list, main chat interface, and navigation hub
- **Thread System**: Select text from AI responses to spawn exploration threads
- **Markers**: Bookmark important sections with color-coded categories (Plot, Character, World, Note)
- **Minimap**: Visual overview of chat with markers and threads
- **Auto-Save**: All chats persist automatically
- **Streaming Responses**: Real-time AI responses with GPT-4o-mini

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Desktop**: Tauri v2
- **State Management**: Zustand
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (for Tauri)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Or build for production:
   ```bash
   npm run tauri build
   ```

### First Run

1. Click the settings icon (⚙️) in the top-left
2. Enter your OpenAI API key
3. Start a new chat and begin writing!

## Usage

### Creating Threads
1. Select text in any AI response
2. Click "Create Thread" in the floating toolbar
3. Enter what you'd like to explore
4. The thread appears as a bubble in the chat

### Adding Markers
1. Select text in any AI response
2. Click "Add Marker" in the floating toolbar
3. Enter a label and choose a category
4. Markers appear in the right panel

### Navigation
- Use the minimap to jump to any part of the chat
- Click markers or threads in the right panel
- Thread bubbles in the chat let you switch contexts

## License

MIT
