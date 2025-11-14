const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }

  async processMessage(messages, command, mode = 'summarizer') {
    if (!this.openai) {
      return 'AI is currently unavailable. Please add OPENAI_API_KEY to .env file.';
    }

    const prompts = {
      summarizer: 'Summarize the following chat messages concisely:',
      brainstorm: 'Based on these messages, suggest 3 creative ideas:',
      moderator: 'Keep this discussion on topic. Respond helpfully:',
      research: 'Answer the question based on these messages:'
    };

    const context = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompts[mode] },
          { role: 'user', content: context }
        ],
        max_tokens: 200
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'AI is currently unavailable.';
    }
  }

  async handleCommand(command, messages, mode) {
    if (command.includes('summarize')) {
      return await this.processMessage(messages, command, 'summarizer');
    }
    if (command.includes('next steps')) {
      return await this.processMessage(messages, command, 'brainstorm');
    }
    if (command.includes('explain')) {
      return await this.processMessage(messages, command, 'research');
    }
    return await this.processMessage(messages, command, mode);
  }
}

module.exports = new AIService();