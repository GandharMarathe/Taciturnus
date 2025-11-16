# Collaborative AI Chat Space

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-blue.svg)](https://nextjs.org/)

A real-time collaborative chatroom application with integrated AI assistant capabilities.

## Overview

This application enables multiple users to engage in real-time conversations with intelligent AI assistance. The platform combines modern web technologies with AI features to enhance group discussions and productivity.

## Key Features

- Multi-user real-time chat powered by Socket.io
- AI Assistant with 4 operational modes: Summarizer, Brainstorm, Moderator, and Research
- Command-based AI interactions: @AI summarize, @AI next steps, @AI explain
- Automated conversation summaries generated every 10 minutes
- Chat export functionality to text files
- Room-based system with unique access codes
- Modern Discord-inspired user interface with participant sidebar

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Firebase project with Firestore enabled
- Firebase Admin SDK credentials
- OpenAI API key (optional for AI features)

### Installation

See [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md) for detailed setup guide.

**Quick Start:**

1. Clone and install:
```bash
git clone https://github.com/yourusername/collaborative-ai-chat.git
cd collaborative-ai-chat
npm install
cd server && npm install
cd ../client && npm install
```

2. Configure Firebase Admin SDK:
   - Get service account credentials from Firebase Console
   - Copy `server/.env.example` to `server/.env`
   - Add Firebase Admin credentials and OpenAI API key

3. Run:
```bash
npm run dev
```

Server: http://localhost:3001 | Client: http://localhost:3000

## AI Commands

Interact with the AI assistant using these commands:

- `@AI summarize` - Generate a summary of recent discussion
- `@AI next steps` - Get suggested action items based on conversation
- `@AI explain [topic]` - Request research and explanation on a specific topic

## Technology Stack

### Backend
- Node.js
- Express
- Socket.io
- Firebase Firestore
- OpenAI API

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Zustand (State Management)

## Project Structure

```
├── server/
│   ├── services/
│   │   ├── firebaseService.js    # Firebase database operations
│   │   └── aiService.js          # OpenAI integration
│   └── server.js                 # Express server and Socket.io setup
└── client/
    ├── app/                      # Next.js app router
    ├── components/               # React components
    └── stores/                   # Zustand state management
```

## Contributing

Contributions are welcome. Please review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and development workflow.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete details.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Issues and Support

For bug reports or feature requests, please open an issue on the GitHub Issues page.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

MIT License - see [LICENSE](LICENSE) file for details.