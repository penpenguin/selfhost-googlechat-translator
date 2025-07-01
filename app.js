const express = require('express');
const { GoogleChatBotHandler } = require('./botHandler');
const { Config } = require('./config');
const logger = require('./logger');

const app = express();
app.use(express.json());

const config = new Config();
const botHandler = new GoogleChatBotHandler(config);

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'Google Chat Translator Bot' });
});

app.post('/chat', async (req, res) => {
  try {
    const eventData = req.body;
    logger.info(`Received event: ${eventData.type || 'UNKNOWN'}`);
    
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    const isValid = await botHandler.verifyRequest(token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const response = await botHandler.handleEvent(eventData);
    res.json(response);
    
  } catch (error) {
    logger.error('Error handling chat event:', error);
    res.status(500).json({ 
      text: 'Sorry, an error occurred while processing your request.' 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Google Chat Translator Bot listening on port ${PORT}`);
});