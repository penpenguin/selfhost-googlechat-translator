class Config {
  constructor() {
    this.GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
    if (!this.GCP_PROJECT_ID) {
      throw new Error('GCP_PROJECT_ID environment variable is required');
    }
    
    this.SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL;
    if (!this.SERVICE_ACCOUNT_EMAIL) {
      throw new Error('SERVICE_ACCOUNT_EMAIL environment variable is required');
    }
    
    this.DEFAULT_TARGET_LANGUAGE = process.env.DEFAULT_TARGET_LANGUAGE || 'ja';
    
    this.BOT_NAME = process.env.BOT_NAME || 'translator';
    
    this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
    
    this.PORT = parseInt(process.env.PORT || '8080', 10);
    
    const googleCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!googleCreds) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
    }
  }
  
  toString() {
    return `Config(project=${this.GCP_PROJECT_ID}, bot=${this.BOT_NAME}, default_lang=${this.DEFAULT_TARGET_LANGUAGE})`;
  }
}

module.exports = { Config };