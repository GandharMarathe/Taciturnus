# Collaborative AI Chat Space

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-blue.svg)](https://nextjs.org/)

A real-time collaborative chatroom with AI assistant integration.

![Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Collaborative+AI+Chat+Demo)

## 🌟 Overview

Build meaningful conversations with AI assistance. This application combines real-time chat with intelligent AI features to enhance group discussions and productivity.

## Features

- **Multi-user real-time chat** with Socket.io
- **AI Assistant** with 4 modes: Summarizer, Brainstorm, Moderator, Research
- **AI Commands**: @AI summarize, @AI next steps, @AI explain
- **Auto-summaries** every 10 minutes
- **Export chat** to text file
- **Room system** with unique codes
- **Discord-like UI** with participant sidebar

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. **Setup environment:**
```bash
# In server/.env
MONGODB_URI=mongodb://localhost:27017/collaborative-chat
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Start MongoDB:**
```bash
mongod
```

4. **Run the app:**
```bash
npm run dev
```

- Server: http://localhost:3001
- Client: http://localhost:3000

## 🤖 AI Commands

- `@AI summarize` - Summarize recent discussion
- `@AI next steps` - Suggest action items
- `@AI explain [topic]` - Research and explain

## 🛠️ Tech Stack

**Backend:** Node.js, Express, Socket.io, MongoDB, OpenAI API
**Frontend:** Next.js, React, Tailwind CSS, Zustand

## 📁 Project Structure

```
├── server/
│   ├── models/Room.js      # MongoDB schema
│   ├── services/aiService.js # AI integration
│   └── server.js           # Main server
└── client/
    ├── app/                # Next.js app router
    ├── components/         # React components
    └── stores/             # Zustand state
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/yourusername/collaborative-ai-chat/issues).

## ⭐ Support

If you find this project helpful, please give it a star on GitHub!