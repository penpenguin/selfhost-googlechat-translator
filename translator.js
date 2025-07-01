const { TranslationServiceClient } = require('@google-cloud/translate').v3;
const logger = require('./logger');

class TranslatorService {
  constructor(config) {
    this.config = config;
    this.projectId = config.GCP_PROJECT_ID;
    this.location = 'global';
    this.parent = `projects/${this.projectId}/locations/${this.location}`;
    
    this.client = new TranslationServiceClient();
    
    this.supportedLanguages = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French',
      'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
      'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
      'ar': 'Arabic', 'hi': 'Hindi', 'ru': 'Russian',
      'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish',
      'vi': 'Vietnamese', 'th': 'Thai', 'id': 'Indonesian',
      'sv': 'Swedish', 'no': 'Norwegian', 'da': 'Danish',
      'fi': 'Finnish', 'cs': 'Czech', 'hu': 'Hungarian',
      'el': 'Greek', 'ro': 'Romanian', 'he': 'Hebrew',
      'uk': 'Ukrainian', 'bg': 'Bulgarian', 'hr': 'Croatian',
      'sr': 'Serbian', 'sk': 'Slovak', 'sl': 'Slovenian'
    };
  }
  
  async translate(text, targetLanguage) {
    if (!targetLanguage) {
      targetLanguage = this.config.DEFAULT_TARGET_LANGUAGE;
    }
    
    if (!this.supportedLanguages[targetLanguage]) {
      const supportedList = Object.keys(this.supportedLanguages).join(', ');
      throw new Error(`Unsupported language: ${targetLanguage}. Supported languages: ${supportedList}`);
    }
    
    try {
      const request = {
        parent: this.parent,
        contents: [text],
        targetLanguageCode: targetLanguage,
        mimeType: 'text/plain'
      };
      
      const [response] = await this.client.translateText(request);
      
      if (response.translations && response.translations.length > 0) {
        return response.translations[0].translatedText;
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      logger.error('Google Cloud Translation error:', error);
      throw new Error(`Translation service error: ${error.message}`);
    }
  }
  
  async detectLanguage(text) {
    try {
      const request = {
        parent: this.parent,
        content: text,
        mimeType: 'text/plain'
      };
      
      const [response] = await this.client.detectLanguage(request);
      
      if (response.languages && response.languages.length > 0) {
        const detectedLang = response.languages[0].languageCode;
        return this.supportedLanguages[detectedLang] || detectedLang;
      } else {
        return 'Unknown';
      }
    } catch (error) {
      logger.warn('Language detection failed:', error);
      return 'Unknown';
    }
  }
}

module.exports = { TranslatorService };