const { OAuth2Client } = require('google-auth-library');
const { TranslatorService } = require('./translator');
const logger = require('./logger');

class GoogleChatBotHandler {
  constructor(config) {
    this.config = config;
    this.translator = new TranslatorService(config);
    this.serviceAccountEmail = config.SERVICE_ACCOUNT_EMAIL;
    this.audience = 'https://chat.googleapis.com';
    this.client = new OAuth2Client();
  }
  
  async verifyRequest(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.audience,
      });
      
      const payload = ticket.getPayload();
      
      if (payload.iss !== this.serviceAccountEmail) {
        logger.warn(`Invalid issuer: ${payload.iss}`);
        return false;
      }
      
      if (payload.aud !== this.audience) {
        logger.warn(`Invalid audience: ${payload.aud}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return false;
    }
  }
  
  async handleEvent(event) {
    const eventType = event.type;
    
    switch (eventType) {
      case 'MESSAGE':
        return await this.handleMessage(event);
      case 'ADDED_TO_SPACE':
        return this.handleAddedToSpace(event);
      case 'REMOVED_FROM_SPACE':
        logger.info('Bot removed from space');
        return {};
      default:
        logger.warn(`Unknown event type: ${eventType}`);
        return { text: "I don't understand this event type." };
    }
  }
  
  async handleMessage(event) {
    const message = event.message || {};
    let text = message.text || '';
    const thread = message.thread || {};
    
    const botName = `@${this.config.BOT_NAME}`;
    if (text.includes(botName)) {
      text = text.replace(botName, '').trim();
    }
    
    if (!text) {
      return {
        thread,
        text: `Please provide text to translate. Usage: \`@${this.config.BOT_NAME} <text>\` or \`@${this.config.BOT_NAME} to:<language> <text>\``
      };
    }
    
    const targetLanguage = this.extractTargetLanguage(text);
    if (targetLanguage) {
      text = text.replace(/to:\s*\w+\s*/i, '').trim();
    }
    
    try {
      const translatedText = await this.translator.translate(text, targetLanguage);
      const sourceLang = await this.translator.detectLanguage(text);
      const targetLang = targetLanguage || this.config.DEFAULT_TARGET_LANGUAGE;
      
      const responseText = `**Translation (${sourceLang} → ${targetLang}):**\n${translatedText}`;
      
      return {
        thread,
        text: responseText
      };
    } catch (error) {
      logger.error('Translation error:', error);
      return {
        thread,
        text: `Sorry, I couldn't translate that. Error: ${error.message}`
      };
    }
  }
  
  handleAddedToSpace(event) {
    const spaceType = event.space?.type;
    
    let welcomeText;
    if (spaceType === 'ROOM') {
      welcomeText = `Hello! I'm the Google Chat Translator Bot.\n\n` +
        `**How to use me:**\n` +
        `• \`@${this.config.BOT_NAME} <text>\` - Translate to ${this.config.DEFAULT_TARGET_LANGUAGE}\n` +
        `• \`@${this.config.BOT_NAME} to:es <text>\` - Translate to Spanish\n` +
        `• \`@${this.config.BOT_NAME} to:fr <text>\` - Translate to French\n\n` +
        `I support many languages including: en, es, fr, de, it, pt, ja, ko, zh, ar, hi, ru`;
    } else {
      welcomeText = `Hello! Send me any text and I'll translate it to ${this.config.DEFAULT_TARGET_LANGUAGE}. ` +
        `Use \`to:<language_code>\` to specify a target language.`;
    }
    
    return { text: welcomeText };
  }
  
  extractTargetLanguage(text) {
    const match = text.match(/to:\s*(\w+)/i);
    return match ? match[1].toLowerCase() : null;
  }
}

module.exports = { GoogleChatBotHandler };