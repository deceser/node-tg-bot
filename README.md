# Personal Assistant Telegram Bot

A Node.js-based Telegram bot that serves as a personal assistant, built with Express.js and Telegraf framework. The bot supports basic commands and text message handling with a robust error handling system and logging capabilities.

## Features

- Command handling (/start, /help)
- Text message echo responses
- Webhook support for production
- Comprehensive logging system
- Rate limiting and security measures
- Docker support
- Error handling and graceful shutdown
- Health check endpoint

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd telegram-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
BOT_TOKEN=your_telegram_bot_token
PORT=3000
NODE_ENV=development
```

## Running the Bot

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Using Docker

1. Build the Docker image:

```bash
docker build -t telegram-bot .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env telegram-bot
```

## Project Structure

```
├── src/
│   ├── commands/         # Bot commands
│   ├── config/          # Configuration files
│   ├── server/          # Express server setup
│   ├── services/        # Business logic
│   └── utils/           # Utilities and constants
├── .env                 # Environment variables
├── Dockerfile          # Docker configuration
├── index.js            # Application entry point
└── package.json        # Project dependencies
```

## Available Commands

- `/start` - Start the bot and receive a welcome message
- `/help` - Get information about available commands
- Any text message will be echoed back to the user

## API Endpoints

- `POST /webhook/{BOT_TOKEN}` - Telegram webhook endpoint
- `GET /health` - Health check endpoint

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet security headers
- CORS protection
- Request compression
- Error handling middleware

## Development Tools

- ESLint for code linting
- Prettier for code formatting
- Nodemon for development auto-reload
- Winston for logging

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error level logs
- `combined.log` - All logs

In development mode, logs are also output to the console.

## Error Handling

The application includes comprehensive error handling:

- Graceful shutdown on SIGINT and SIGTERM
- Uncaught exception handling
- Unhandled promise rejection handling
- Request error handling
- Bot operation error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.
