# Google Chat Translator Bot

A self-hosted Google Chat bot that provides real-time translation services using Google Cloud Translation API.

## Features

- Real-time message translation in Google Chat
- Support for 30+ languages
- Auto-detect source language
- Specify target language with `to:` prefix
- Works in both direct messages and group chats
- Secure webhook authentication
- Docker support for easy deployment

## Architecture

This bot uses:
- **Node.js/Express** for the web server
- **Google Cloud Translation API** for translation services
- **Google Chat API** for bot interactions
- **JWT verification** for secure webhook authentication

## Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Google Chat API
   - Cloud Translation API

2. **Service Account** with necessary permissions:
   - Chat Bot role
   - Cloud Translation API User role

3. **Node.js** 16+ (for local development)

4. **Docker** (optional, for containerized deployment)

## Setup Instructions

### 1. Create Google Cloud Resources

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Enable required APIs
gcloud services enable chat.googleapis.com translate.googleapis.com

# Create service account
gcloud iam service-accounts create chat-translator-bot \
  --display-name="Chat Translator Bot"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chat-translator-bot@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudtranslate.user"

# Create and download service account key
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=chat-translator-bot@$PROJECT_ID.iam.gserviceaccount.com
```

### 2. Configure Google Chat Bot

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Google Chat API** > **Configuration**
3. Create a new configuration:
   - **Bot name**: translator (or your preferred name)
   - **Avatar URL**: (optional)
   - **Description**: Translation bot for Google Chat
   - **Functionality**: Enable "Bot works in direct messages" and "Bot works in spaces"
   - **Connection settings**:
     - Select "HTTP endpoint URL"
     - Enter: `https://your-domain.com/chat`
   - **Permissions**: Add bot to spaces where needed

### 3. Set Up the Application

Clone the repository:
```bash
git clone https://github.com/yourusername/selfhost-googlechat-translator.git
cd selfhost-googlechat-translator
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
SERVICE_ACCOUNT_EMAIL=chat-translator-bot@your-project-id.iam.gserviceaccount.com
BOT_NAME=translator
DEFAULT_TARGET_LANGUAGE=ja
PORT=8080
LOG_LEVEL=info
```

### 4. Run the Bot

#### Local Development

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

#### Docker Deployment

Build and run with Docker:
```bash
docker-compose up -d
```

With Nginx reverse proxy (SSL):
```bash
# Copy and configure nginx.conf
cp nginx.conf.example nginx.conf
# Edit nginx.conf with your domain and SSL certificates

# Run with nginx profile
docker-compose --profile with-nginx up -d
```

### 5. SSL/TLS Setup (Production)

For production deployment, you need HTTPS. Options:

1. **Using Nginx with Let's Encrypt**:
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bot.yourdomain.com
```

2. **Using a reverse proxy service** (Cloudflare, etc.)

3. **Using a cloud load balancer** (GCP, AWS, etc.)

## Usage

### In Direct Messages
Simply send a message to the bot:
```
Hello, how are you?
```

Bot responds with:
```
Translation (English → Japanese):
こんにちは、元気ですか？
```

### In Group Chats
Mention the bot:
```
@translator Hello, how are you?
```

### Specify Target Language
Use the `to:` prefix:
```
@translator to:es Hello, how are you?
```

Bot responds with:
```
Translation (English → Spanish):
Hola, ¿cómo estás?
```

### Supported Languages

Major languages include:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ar` - Arabic
- `hi` - Hindi
- `ru` - Russian

And many more! See the full list in `translator.js`.

## API Rate Limits

- Google Chat: No specific limits for bots
- Cloud Translation API:
  - Free tier: 500,000 characters/month
  - Paid: $20 per million characters

## Monitoring

View logs:
```bash
# Local
npm start

# Docker
docker-compose logs -f translator-bot
```

## Troubleshooting

### Bot not responding
1. Check webhook URL is correctly configured in Google Chat API
2. Verify service account email in `.env` matches the bot's service account
3. Check logs for authentication errors

### Translation errors
1. Verify Cloud Translation API is enabled
2. Check service account has necessary permissions
3. Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### SSL/Certificate issues
1. Ensure your domain has valid SSL certificates
2. Check Nginx configuration if using reverse proxy
3. Verify Google Chat can reach your webhook URL

## Security Considerations

1. **Never commit** `service-account-key.json` or `.env` files
2. Use environment variables for sensitive data
3. Implement rate limiting for production use
4. Regularly rotate service account keys
5. Monitor usage and logs for anomalies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details