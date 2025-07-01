const axios = require('axios');

// Test script to verify webhook is working
// Usage: node test-webhook.js

const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:8080/chat';

const testMessage = {
  type: 'MESSAGE',
  message: {
    name: 'spaces/TEST/messages/TEST123',
    text: 'Hello world',
    thread: {
      name: 'spaces/TEST/threads/TEST456'
    }
  },
  space: {
    name: 'spaces/TEST',
    type: 'ROOM'
  },
  user: {
    name: 'users/123456',
    displayName: 'Test User',
    type: 'HUMAN'
  }
};

async function testWebhook() {
  try {
    console.log(`Testing webhook at: ${webhookUrl}`);
    console.log('Sending test message:', JSON.stringify(testMessage, null, 2));
    
    const response = await axios.post(webhookUrl, testMessage, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Google-Dynamite',
        // Note: In production, this would include a valid JWT token
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\nError testing webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Health check test
async function testHealthCheck() {
  try {
    const healthUrl = webhookUrl.replace('/chat', '/');
    console.log(`\nTesting health check at: ${healthUrl}`);
    
    const response = await axios.get(healthUrl);
    console.log('Health check response:', response.data);
    
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Run tests
(async () => {
  await testHealthCheck();
  await testWebhook();
})();