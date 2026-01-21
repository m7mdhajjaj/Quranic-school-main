const OpenAI = require('openai');

let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    openai = new OpenAI({ 
      apiKey,
      timeout: 30000 // 30 seconds timeout
    });
  }
  return openai;
};

module.exports = getOpenAIClient;
