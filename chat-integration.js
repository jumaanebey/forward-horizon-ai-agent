/**
 * Chat Integration Handler
 * Connects the embeddable chat widget to the Forward Horizon AI backend
 */

const express = require('express');
const path = require('path');
const Logger = require('./src/utils/logger');

class ChatIntegration {
    constructor(aiAgent) {
        this.aiAgent = aiAgent;
        this.logger = new Logger('ChatIntegration');
        this.activeSessions = new Map();
        
        // Session settings
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxMessageLength = 1000;
    }

    setupRoutes(app) {
        // Serve the embeddable chat script
        app.get('/chat.js', (req, res) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.sendFile(path.join(__dirname, 'embeddable-chat.js'));
        });

        // Chat message API endpoint
        app.post('/api/chat/message', async (req, res) => {
            try {
                const { message, sessionId, userName } = req.body;
                
                if (!message || message.length > this.maxMessageLength) {
                    return res.status(400).json({
                        error: 'Invalid message length'
                    });
                }
                
                // Get or create session
                const session = this.getSession(sessionId, userName);
                
                // Add user message to session
                session.messages.push({
                    role: 'user',
                    content: message,
                    timestamp: new Date()
                });
                
                // Generate AI response
                const aiResponse = await this.generateResponse(message, session);
                
                // Add AI response to session
                session.messages.push({
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                });
                
                // Update session activity
                session.lastActivity = new Date();
                
                // Check if this looks like a lead
                if (this.shouldCreateLead(session)) {
                    await this.createLeadFromChat(session);
                    session.leadCreated = true;
                }
                
                res.json({
                    response: aiResponse,
                    sessionId: session.id
                });
                
            } catch (error) {
                this.logger.error('Chat message error:', error);
                res.status(500).json({
                    response: "I apologize, but I'm having trouble connecting right now. Please call us directly at (858) 299-2490 for immediate assistance."
                });
            }
        });

        // Chat session status
        app.get('/api/chat/session/:sessionId', (req, res) => {
            const session = this.activeSessions.get(req.params.sessionId);
            
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            
            res.json({
                sessionId: session.id,
                userName: session.userName,
                messageCount: session.messages.length,
                lastActivity: session.lastActivity,
                leadCreated: session.leadCreated
            });
        });

        // Serve the standalone chat page
        app.get('/chat', (req, res) => {
            res.sendFile(path.join(__dirname, 'chat-widget.html'));
        });
    }

    getSession(sessionId, userName) {
        let session;
        
        if (sessionId && this.activeSessions.has(sessionId)) {
            session = this.activeSessions.get(sessionId);
            
            // Update userName if provided
            if (userName && !session.userName) {
                session.userName = userName;
            }
        } else {
            // Create new session
            session = {
                id: sessionId || this.generateSessionId(),
                userName: userName || null,
                messages: [],
                createdAt: new Date(),
                lastActivity: new Date(),
                leadCreated: false,
                ipAddress: null, // Would be set from req.ip
                userAgent: null  // Would be set from req.headers['user-agent']
            };
            
            this.activeSessions.set(session.id, session);
            this.logger.info(`New chat session created: ${session.id}`);
        }
        
        return session;
    }

    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async generateResponse(message, session) {
        // Build context for AI
        const context = {
            businessName: 'The Forward Horizon',
            businessPhone: '(858) 299-2490',
            businessEmail: 'admin@theforwardhorizon.com',
            services: [
                'Veterans Transitional Housing',
                'Sober Living After Detox',
                'Reentry Housing'
            ],
            conversationHistory: session.messages.slice(-6), // Last 6 messages for context
            userName: session.userName,
            isWebChat: true
        };
        
        // Use the AI agent if available, otherwise use built-in responses
        if (this.aiAgent && typeof this.aiAgent.processWebChatMessage === 'function') {
            return await this.aiAgent.processWebChatMessage(message, context);
        } else {
            return this.getBuiltInResponse(message, context);
        }
    }

    getBuiltInResponse(message, context) {
        const lowerMessage = message.toLowerCase();
        const userName = context.userName;
        
        // Name detection
        if (!userName && (lowerMessage.includes('i\'m') || lowerMessage.includes('my name') || /^[a-zA-Z\s]+$/.test(message.trim()))) {
            const extractedName = message.replace(/i'm|my name is|i am|hi|hello/gi, '').trim();
            if (extractedName && extractedName.length > 0 && extractedName.length < 50) {
                return `Nice to meet you, ${extractedName}! What brings you to The Forward Horizon today? Are you interested in our veterans program, recovery housing, or reentry support?`;
            }
        }
        
        // Program-specific responses
        if (lowerMessage.includes('veteran') || lowerMessage.includes('military')) {
            return `${userName ? userName + ', t' : 'T'}hank you for your service! Our Veterans Transitional Housing program is designed specifically for veterans transitioning to civilian life. I'd love to schedule you for a personalized video consultation where we can discuss the program details and see if it's a good fit. Would you like me to help you schedule that?`;
        }
        
        if (lowerMessage.includes('recovery') || lowerMessage.includes('sober') || lowerMessage.includes('addiction')) {
            return `Our Sober Living After Detox program is perfect for individuals with 30+ days of sobriety who are ready to take the next step. We provide a supportive environment with comprehensive services. I can schedule you for a video consultation to discuss the program requirements and available options. Would that be helpful?`;
        }
        
        if (lowerMessage.includes('reentry') || lowerMessage.includes('prison') || lowerMessage.includes('incarceration')) {
            return `Our Reentry Housing program helps returning citizens successfully transition back into the community. We understand the unique challenges you face and provide specialized support services. Let me schedule you for a personalized consultation to discuss your specific needs and timeline. Sound good?`;
        }
        
        if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('money') || lowerMessage.includes('payment')) {
            return `I'd love to discuss pricing with you, but since costs can vary based on your specific situation and the housing options available, we cover all the financial details in a personalized video consultation where we can give you exact numbers and payment options that work for your situation. Would you like to schedule that?`;
        }
        
        if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('consultation') || lowerMessage.includes('yes')) {
            return `Perfect! I can help you schedule a video consultation. These typically last 30-45 minutes and cover program details, costs, and next steps. What's the best phone number to reach you at, and do you prefer morning or afternoon appointments?`;
        }
        
        if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('homeless') || lowerMessage.includes('help')) {
            return `I understand you may be in a difficult situation right now. If this is an emergency, please call 911. For crisis support, the National Suicide Prevention Lifeline is available 24/7 at 988. For immediate housing assistance, please call our main line at (858) 299-2490. Our team can provide crisis support and resource referrals. How can I best help you right now?`;
        }
        
        // Default response
        return `${userName ? userName + ', i' : 'I'}'m here to help you learn about The Forward Horizon's transitional housing programs. I can explain our veterans, recovery, or reentry programs, and schedule you for a personalized video consultation. What specific information would be most helpful for you?`;
    }

    shouldCreateLead(session) {
        // Don't create duplicate leads
        if (session.leadCreated) return false;
        
        // Check for lead indicators in conversation
        const allMessages = session.messages
            .filter(m => m.role === 'user')
            .map(m => m.content.toLowerCase())
            .join(' ');
        
        const leadIndicators = [
            'schedule', 'appointment', 'consultation', 'interested',
            'need help', 'housing', 'tour', 'visit', 'apply',
            'application', 'qualify', 'contact', 'callback'
        ];
        
        return leadIndicators.some(indicator => allMessages.includes(indicator)) &&
               session.messages.length >= 3; // At least some engagement
    }

    async createLeadFromChat(session) {
        try {
            const lead = {
                name: session.userName || 'Web Chat Visitor',
                email: '', // Would be extracted if provided in conversation
                phone: '', // Would be extracted if provided in conversation
                source: 'website_chat',
                status: 'new',
                message: this.summarizeChatSession(session),
                chat_session_id: session.id,
                created_at: new Date()
            };
            
            // Create lead using the AI agent's method if available
            if (this.aiAgent && typeof this.aiAgent.createLead === 'function') {
                await this.aiAgent.createLead(lead);
                this.logger.success(`Lead created from chat session: ${session.id}`);
            } else {
                this.logger.info(`Lead would be created: ${JSON.stringify(lead, null, 2)}`);
            }
            
            return lead;
        } catch (error) {
            this.logger.error('Error creating lead from chat:', error);
        }
    }

    summarizeChatSession(session) {
        const userMessages = session.messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('. ');
        
        const topics = [];
        const content = userMessages.toLowerCase();
        
        if (content.includes('veteran') || content.includes('military')) topics.push('Veterans Program');
        if (content.includes('recovery') || content.includes('sober')) topics.push('Recovery Housing');
        if (content.includes('reentry') || content.includes('prison')) topics.push('Reentry Support');
        if (content.includes('schedule') || content.includes('appointment')) topics.push('Consultation Request');
        
        const summary = `Web chat inquiry${topics.length ? ` about: ${topics.join(', ')}` : ''}. ${userMessages.substring(0, 200)}${userMessages.length > 200 ? '...' : ''}`;
        
        return summary;
    }

    cleanupSessions() {
        const now = new Date();
        const expiredSessions = [];
        
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (now - session.lastActivity > this.sessionTimeout) {
                expiredSessions.push(sessionId);
            }
        }
        
        expiredSessions.forEach(sessionId => {
            this.activeSessions.delete(sessionId);
            this.logger.info(`Cleaned up expired session: ${sessionId}`);
        });
        
        return expiredSessions.length;
    }

    getStats() {
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        
        const sessions = Array.from(this.activeSessions.values());
        const recentSessions = sessions.filter(s => s.createdAt > oneDayAgo);
        
        return {
            activeSessions: sessions.length,
            sessionsLast24h: recentSessions.length,
            leadsGenerated: sessions.filter(s => s.leadCreated).length,
            averageMessagesPerSession: sessions.length > 0 
                ? Math.round(sessions.reduce((sum, s) => sum + s.messages.length, 0) / sessions.length)
                : 0
        };
    }
}

module.exports = ChatIntegration;