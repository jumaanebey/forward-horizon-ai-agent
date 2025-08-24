/**
 * AI Core Module
 * Handles AI interactions, response generation, and decision making
 */

const Anthropic = require('@anthropic-ai/sdk');
const Logger = require('../utils/logger');

class AICore {
  constructor() {
    this.logger = new Logger('AICore');
    this.client = null;
    this.initialized = false;
    
    // AI configuration
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1000,
      temperature: 0.7
    };
    
    // Response statistics
    this.stats = {
      requests: 0,
      successful: 0,
      failed: 0,
      tokens_used: 0
    };
  }

  async initialize() {
    this.logger.info('🤖 Initializing AI Core...');
    
    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-anthropic-api-key-here' || apiKey.length < 20) {
      this.logger.error('❌ Anthropic API key not configured properly');
      this.logger.info('💡 Using key from env:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
      this.initialized = false;
      return true; // Return true to not block agent startup
    }
    
    try {
      this.client = new Anthropic({
        apiKey: apiKey
      });
      
      // Test the connection
      await this.testConnection();
      
      this.initialized = true;
      this.logger.info('✅ AI Core initialized');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize AI Core:', error);
      
      // Continue without AI if not configured properly
      this.logger.warn('⚠️ AI functionality disabled - check ANTHROPIC_API_KEY environment variable');
      this.initialized = false;
      return true; // Don't block agent startup
    }
  }

  async testConnection() {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      });
      
      if (response.content && response.content.length > 0) {
        this.logger.info('🔗 AI connection test successful');
        return true;
      }
      
      throw new Error('Invalid response from AI service');
    } catch (error) {
      this.logger.error('AI connection test failed:', error);
      throw error;
    }
  }

  /**
   * Generate AI response based on message and context
   */
  async generateResponse(message, context = {}) {
    if (!this.initialized) {
      this.logger.warn('AI Core not initialized - returning fallback response');
      return this.getFallbackResponse(message);
    }

    try {
      this.stats.requests++;
      
      const systemPrompt = this.buildSystemPrompt(context);
      const userMessage = this.buildUserMessage(message, context);
      
      this.logger.info(`🧠 Generating AI response for: ${message.substring(0, 50)}...`);
      
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('Empty response from AI service');
      }

      const aiResponse = response.content[0].text;
      
      this.stats.successful++;
      this.stats.tokens_used += response.usage?.input_tokens || 0;
      this.stats.tokens_used += response.usage?.output_tokens || 0;
      
      this.logger.info(`✅ AI response generated (${aiResponse.length} chars)`);
      
      return aiResponse;
      
    } catch (error) {
      this.stats.failed++;
      this.logger.error('Failed to generate AI response:', error);
      
      // Return fallback response
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Build system prompt with business context
   */
  buildSystemPrompt(context) {
    const { business, memories, working_hours } = context;
    
    const prompt = `You are Horizon AI, an intelligent business assistant for ${business?.name || 'Forward Horizon'}. 

BUSINESS INFORMATION:
- Company: ${business?.name || 'Forward Horizon'}
- Phone: ${business?.phone || '(310) 488-5280'}
- Email: ${business?.email || 'info@forwardhorizon.com'}
- Website: ${business?.website || 'https://www.theforwardhorizon.com'}

YOUR ROLE:
- You help manage business operations, leads, and customer interactions
- You have access to memory, internet research, and email capabilities
- You can schedule tasks, follow-ups, and generate reports
- You maintain a professional, helpful, and knowledgeable tone

CURRENT CONTEXT:
- Time: ${new Date().toLocaleString()}
- Working Hours: ${working_hours ? 'Yes' : 'No'}
${memories && memories.length > 0 ? `- Recent memories: ${memories.slice(0, 3).map(m => m.content).join('; ')}` : ''}

CAPABILITIES:
- Lead management and follow-up
- Email automation and responses  
- Web research and industry insights
- Task scheduling and automation
- Business reporting and analytics
- Customer service and support

GUIDELINES:
- Always be helpful and professional
- Provide actionable advice and solutions
- Use business knowledge to inform responses
- Suggest specific next steps when appropriate
- Keep responses concise but comprehensive
- Reference relevant memories when helpful`;

    return prompt;
  }

  /**
   * Build user message with context
   */
  buildUserMessage(message, context) {
    let userMessage = message;
    
    // Add relevant context if available
    if (context.lead_info) {
      userMessage += `\n\nContext: This is regarding lead ${context.lead_info.name} (${context.lead_info.email})`;
    }
    
    if (context.task_info) {
      userMessage += `\n\nTask Context: ${context.task_info.type} - ${context.task_info.description}`;
    }
    
    if (context.urgency) {
      userMessage += `\n\nUrgency Level: ${context.urgency}`;
    }
    
    return userMessage;
  }

  /**
   * Analyze lead and suggest actions
   */
  async analyzeLeadAndSuggestActions(lead) {
    const message = `Please analyze this new lead and suggest appropriate follow-up actions:

Lead Information:
- Name: ${lead.name}
- Email: ${lead.email || 'Not provided'}
- Phone: ${lead.phone || 'Not provided'}
- Source: ${lead.source || 'Unknown'}
- Inquiry Date: ${lead.created_at}

Please provide:
1. Lead assessment (quality, urgency, potential)
2. Recommended follow-up strategy
3. Specific next steps
4. Timeline for actions`;

    const context = {
      business: {
        name: process.env.BUSINESS_NAME || 'Forward Horizon',
        phone: process.env.BUSINESS_PHONE || '(310) 488-5280',
        email: process.env.BUSINESS_EMAIL || 'info@forwardhorizon.com'
      },
      lead_info: lead,
      urgency: 'high'
    };

    return await this.generateResponse(message, context);
  }

  /**
   * Generate email content
   */
  async generateEmailContent(type, recipient, context = {}) {
    let message = '';
    
    switch (type) {
      case 'welcome':
        message = `Generate a professional welcome email for a new lead named ${recipient.name}. The email should:
- Thank them for their inquiry
- Briefly introduce ${context.business?.name || 'our company'}
- Set expectations for follow-up
- Include a clear call-to-action
- Be warm but professional`;
        break;
        
      case 'follow_up':
        message = `Generate a follow-up email for ${recipient.name} who inquired about our services. The email should:
- Reference their initial inquiry
- Provide additional value or insights
- Suggest a next step (call, meeting, etc.)
- Be personalized and helpful`;
        break;
        
      case 'appointment_reminder':
        message = `Generate an appointment reminder email for ${recipient.name} with these details:
- Appointment: ${context.appointment?.date} at ${context.appointment?.time}
- Type: ${context.appointment?.type || 'Consultation'}
- Include any preparation instructions
- Provide contact information for changes`;
        break;
        
      default:
        message = `Generate a professional business email for ${recipient.name} regarding ${type}`;
    }

    return await this.generateResponse(message, context);
  }

  /**
   * Analyze business performance and provide insights
   */
  async analyzeBusinessPerformance(metrics) {
    const message = `Please analyze our business performance and provide insights:

METRICS:
- Total Leads: ${metrics.leads?.total || 0}
- New Leads: ${metrics.leads?.new || 0}
- Contacted Leads: ${metrics.leads?.contacted || 0}
- Converted Leads: ${metrics.leads?.converted || 0}
- Conversion Rate: ${metrics.leads?.conversion_rate || '0%'}

- Emails Sent: ${metrics.emails?.sent || 0}
- Email Open Rate: ${metrics.emails?.open_rate || 'N/A'}

Please provide:
1. Performance assessment
2. Key trends and patterns
3. Areas for improvement
4. Specific recommendations
5. Next steps to optimize results`;

    const context = {
      business: {
        name: process.env.BUSINESS_NAME || 'Forward Horizon'
      },
      urgency: 'medium'
    };

    return await this.generateResponse(message, context);
  }

  /**
   * Generate content for social media or marketing
   */
  async generateMarketingContent(type, topic, context = {}) {
    const message = `Generate ${type} content about ${topic} for ${context.business?.name || 'our business'}. 
    
Requirements:
- Professional and engaging tone
- Include relevant industry insights
- Add a call-to-action
- Keep it appropriate for business audience
- ${type === 'linkedin_post' ? 'Use LinkedIn best practices' : ''}
- ${type === 'email_newsletter' ? 'Include multiple sections' : ''}`;

    return await this.generateResponse(message, context);
  }

  /**
   * Make business decisions based on data
   */
  async makeBusinessDecision(decision_context) {
    const message = `Help me make a business decision based on this information:

CONTEXT: ${decision_context.situation}
OPTIONS: ${decision_context.options.join(', ')}
CONSTRAINTS: ${decision_context.constraints || 'None specified'}
GOALS: ${decision_context.goals || 'Maximize ROI and customer satisfaction'}

Please provide:
1. Analysis of each option
2. Recommended decision with reasoning
3. Potential risks and mitigation strategies
4. Implementation steps`;

    return await this.generateResponse(message, decision_context);
  }

  /**
   * Get fallback response when AI is unavailable
   */
  getFallbackResponse(message) {
    const fallbacks = [
      "I'm experiencing some technical difficulties right now, but I've noted your message and will get back to you shortly.",
      "Thank you for your message. I'm currently unable to provide a detailed response, but your inquiry is important to us.",
      "I apologize, but I'm having connectivity issues at the moment. Please try again in a few minutes, or contact us directly.",
      "Your message has been received. Due to technical issues, I'll have someone from our team respond to you personally.",
      "I'm currently offline for maintenance, but your inquiry is being logged for immediate follow-up."
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Get AI statistics
   */
  getStats() {
    return {
      ...this.stats,
      initialized: this.initialized,
      success_rate: this.stats.requests > 0 ? 
        ((this.stats.successful / this.stats.requests) * 100).toFixed(1) + '%' : '0%'
    };
  }
}

module.exports = AICore;