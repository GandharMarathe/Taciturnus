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

    if (!messages || messages.length === 0) {
      return 'No messages to process.';
    }

    const context = messages
      .filter(m => m && m.sender && m.text)
      .map(m => `${m.sender}: ${m.text}`)
      .join('\n');
    
    if (!context) return 'No valid messages to process.';
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompts[mode] || prompts.summarizer },
          { role: 'user', content: context }
        ],
        max_tokens: 200,
        temperature: 0.7
      });
      
      return response.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('AI Service Error:', error.message);
      if (error.status === 429) return 'AI rate limit reached. Please try again later.';
      if (error.status === 401) return 'Invalid OpenAI API key.';
      return 'AI is currently unavailable.';
    }
  }

  async handleCommand(command, messages, mode) {
    try {
      if (!command || typeof command !== 'string') {
        return 'Invalid command.';
      }

      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('summarize')) {
        return await this.processMessage(messages, command, 'summarizer');
      }
      if (lowerCommand.includes('next steps')) {
        return await this.processMessage(messages, command, 'brainstorm');
      }
      if (lowerCommand.includes('explain')) {
        return await this.processMessage(messages, command, 'research');
      }
      return await this.processMessage(messages, command, mode);
    } catch (error) {
      console.error('Handle command error:', error);
      return 'Failed to process command.';
    }
  }
}

module.exports = new AIService();