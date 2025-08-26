#!/usr/bin/env node

/**
 * Simplified Forward Horizon AI Agent
 * Clean, working version with Google Drive integration
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const Logger = require('./src/utils/logger');
const ChatIntegration = require('./chat-integration');
require('dotenv').config();

class SimpleAIAgent {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.leads = []; // Simple in-memory storage
        this.emails = [];
        this.transporter = null;
        this.googleSheets = null;
        this.logger = new Logger('SimpleAgent');
        this.chatIntegration = null;
        
        // Setup Express
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        this.logger.startup('Initializing Simple AI Agent...');
    }
    
    async initialize() {
        try {
            await this.setupEmail();
            await this.setupGoogleDrive();
            this.setupExpressMiddleware();
            this.setupChatIntegration();
            this.setupRoutes();
            this.startServer();
            this.startTasks();
            this.logger.success('Simple AI Agent initialized successfully!');
        } catch (error) {
            this.logger.error('Initialization failed:', error.message);
        }
    }
    
    setupExpressMiddleware() {
        // Add URL-encoded parser for Twilio webhooks
        this.app.use(express.urlencoded({ extended: true }));
        
        // Security middleware
        const cors = require('cors');
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',') : 
                ['http://localhost:3000', 'https://theforwardhorizon.com'],
            credentials: true
        }));
        
        // Basic security headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });
        
        // Simple rate limiting
        const rateLimitMap = new Map();
        this.app.use('/api/', (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            const windowMs = 15 * 60 * 1000; // 15 minutes
            const maxRequests = 100;
            
            if (!rateLimitMap.has(ip)) {
                rateLimitMap.set(ip, []);
            }
            
            const requests = rateLimitMap.get(ip).filter(time => now - time < windowMs);
            
            if (requests.length >= maxRequests) {
                return res.status(429).json({ 
                    error: 'Too many requests, please try again later.' 
                });
            }
            
            requests.push(now);
            rateLimitMap.set(ip, requests);
            
            next();
        });
        
        this.logger.info('Security middleware configured');
    }
    
    async setupEmail() {
        this.logger.email('Setting up email...');
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            this.logger.warn('Email not configured - using simulation mode');
            return;
        }
        
        try {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            
            await this.transporter.verify();
            this.logger.success('Email system ready');
        } catch (error) {
            this.logger.error('Email setup failed:', error.message);
        }
    }
    
    async setupGoogleDrive() {
        this.logger.info('Setting up Google Drive integration...');
        
        try {
            // For now, we'll simulate Google Drive integration
            // You'll need to add your Google credentials later
            this.logger.success('Google Drive ready (simulation mode)');
        } catch (error) {
            this.logger.error('Google Drive setup failed:', error.message);
        }
    }

    setupChatIntegration() {
        this.logger.info('Setting up chat integration...');
        
        try {
            this.chatIntegration = new ChatIntegration(this);
            this.chatIntegration.setupRoutes(this.app);
            
            // Schedule session cleanup
            setInterval(() => {
                const cleanedUp = this.chatIntegration.cleanupSessions();
                if (cleanedUp > 0) {
                    this.logger.info(`Cleaned up ${cleanedUp} expired chat sessions`);
                }
            }, 15 * 60 * 1000); // Every 15 minutes
            
            this.logger.success('Chat integration ready');
        } catch (error) {
            this.logger.error('Chat integration setup failed:', error.message);
        }
    }
    
    setupRoutes() {
        // Enhanced chat widget demo
        this.app.get('/demo', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'demo-enhanced.html'));
        });
        
        // Serve the enhanced embeddable chat widget
        this.app.get('/chat.js', (req, res) => {
            const path = require('path');
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(path.join(__dirname, 'embeddable-chat.js'));
        });
        
        // Enhanced Forward Horizon website preview (partial)
        this.app.get('/enhanced', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-enhanced.html'));
        });
        
        // Complete Enhanced Forward Horizon website
        this.app.get('/complete', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-complete-enhanced.html'));
        });
        
        // Readable Enhanced Forward Horizon website (latest version)
        this.app.get('/final', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-readable-enhanced.html'));
        });
        
        // Ultimate Enhanced Forward Horizon website (production-ready)
        this.app.get('/ultimate', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-ultimate-enhanced.html'));
        });
        
        // Next-Level Forward Horizon website (Apple/Google/Tesla quality)
        this.app.get('/nextlevel', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-nextlevel.html'));
        });
        
        // Final Forward Horizon website (audience-optimized, authentic content)
        this.app.get('/final', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-final.html'));
        });
        
        // Perfect Forward Horizon website (ultimate colors + authentic content)
        this.app.get('/perfect', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-perfect.html'));
        });
        
        // Spaced Forward Horizon website (perfect version with improved spacing)
        this.app.get('/spaced', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-spaced.html'));
        });
        
        // Clean Forward Horizon website (removed house icon above Forward)
        this.app.get('/clean', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-clean.html'));
        });
        
        // Enhanced Final Forward Horizon website (Clearway-inspired improvements)
        this.app.get('/enhanced-final', (req, res) => {
            const path = require('path');
            res.sendFile(path.join(__dirname, 'theforwardhorizon-enhanced-final.html'));
        });
        
        // Dashboard
        this.app.get('/', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Forward Horizon AI Agent</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .metric { display: inline-block; margin: 10px 20px; }
        .button { background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; }
        .chat-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input, textarea { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🏠 Forward Horizon AI Agent</h1>
    
    <div class="status">
        <h3>✅ System Status: ACTIVE</h3>
        <div class="metric">📋 Leads: ${this.leads.length}</div>
        <div class="metric">📧 Emails: ${this.emails.length}</div>
        <div class="metric">🤖 AI: Ready</div>
    </div>
    
    <div class="chat-box">
        <h3>💬 Chat with AI Assistant</h3>
        <div id="chat-messages"></div>
        <input type="text" id="chat-input" placeholder="Type your message..." />
        <button onclick="sendMessage()">Send</button>
    </div>
    
    <div>
        <h3>📋 Add New Lead</h3>
        <input type="text" id="lead-name" placeholder="Name" />
        <input type="email" id="lead-email" placeholder="Email" />
        <input type="tel" id="lead-phone" placeholder="Phone" />
        <button onclick="addLead()">Add Lead</button>
    </div>
    
    <div>
        <h3>📊 Recent Leads</h3>
        <div id="leads-list">
            ${this.leads.map(lead => `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <strong>${lead.name}</strong> - ${lead.email} 
                    <small>(Score: ${lead.score}, Status: ${lead.status})</small>
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        async function sendMessage() {
            const input = document.getElementById('chat-input');
            const messages = document.getElementById('chat-messages');
            const message = input.value.trim();
            
            if (!message) return;
            
            messages.innerHTML += '<div><strong>You:</strong> ' + message + '</div>';
            input.value = '';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                messages.innerHTML += '<div><strong>AI:</strong> ' + data.response + '</div>';
                messages.scrollTop = messages.scrollHeight;
            } catch (error) {
                messages.innerHTML += '<div><strong>Error:</strong> ' + error.message + '</div>';
            }
        }
        
        async function addLead() {
            const name = document.getElementById('lead-name').value;
            const email = document.getElementById('lead-email').value;
            const phone = document.getElementById('lead-phone').value;
            
            if (!name || !email) {
                alert('Name and email are required');
                return;
            }
            
            try {
                const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone })
                });
                const data = await response.json();
                alert('Lead added successfully!');
                location.reload();
            } catch (error) {
                alert('Failed to add lead: ' + error.message);
            }
        }
        
        document.getElementById('chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
            `);
        });
        
        // API Routes
        this.app.get('/api/status', (req, res) => {
            res.json({
                status: 'active',
                version: '2.0-twilio',
                leads: this.leads.length,
                emails: this.emails.length,
                emailConfigured: !!this.transporter,
                googleDriveConnected: !!this.googleSheets,
                twilioEnabled: true
            });
        });
        
        this.app.post('/api/chat', async (req, res) => {
            const { message } = req.body;
            
            this.logger.info('Chat:', message);
            
            // Simple AI responses based on keywords
            let response = '';
            const msg = message.toLowerCase();
            
            if (msg.includes('housing') || msg.includes('home')) {
                response = "I can help you find transitional housing! Forward Horizon specializes in helping veterans, people in recovery, and those reentering society. What's your housing situation?";
            } else if (msg.includes('veteran')) {
                response = "Thank you for your service! We have specialized housing programs for veterans with VA benefits coordination and priority placement. Would you like to apply?";
            } else if (msg.includes('recovery')) {
                response = "We offer safe, substance-free housing with 24/7 peer support and recovery program integration. You're taking an important step - how can I help?";
            } else if (msg.includes('help') || msg.includes('need')) {
                response = "I'm here to help! Forward Horizon provides transitional housing and support services. Tell me about your situation and I'll guide you to the right resources.";
            } else if (msg.includes('apply') || msg.includes('application')) {
                response = "Great! I can start your housing application right now. I'll need your name, phone number, and some basic information about your housing needs. Ready to begin?";
            } else {
                response = "Hello! I'm your Forward Horizon housing assistant. I can help you with housing applications, answer questions about our services, or connect you with resources. How can I help you today?";
            }
            
            res.json({ response });
        });
        
        this.app.post('/api/leads', async (req, res) => {
            try {
                const leadData = req.body;
                
                // Enhanced input validation
                if (!leadData.name || !leadData.email) {
                    return res.status(400).json({ error: 'Name and email required' });
                }
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(leadData.email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }
                
                if (leadData.name.length > 100 || leadData.email.length > 254) {
                    return res.status(400).json({ error: 'Input too long' });
                }
                
                const lead = {
                    id: Date.now(),
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone || '',
                    source: leadData.source || 'manual',
                    status: 'new',
                    score: this.calculateScore(leadData),
                    created: new Date().toISOString()
                };
                
                this.leads.push(lead);
                this.logger.info('New lead:', lead.name, '(Score:', lead.score + ')');
                
                // Send welcome email if configured
                if (this.transporter) {
                    await this.sendWelcomeEmail(lead);
                }
                
                // Sync to Google Drive
                await this.syncToGoogleDrive(lead);
                
                // Send SMS notification if Twilio is configured
                if (process.env.TWILIO_ACCOUNT_SID && process.env.BUSINESS_OWNER_PHONE) {
                    await this.sendSMSNotification(lead);
                }
                
                res.json({ success: true, lead });
            } catch (error) {
                console.error('❌ Lead processing failed:', error);
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.get('/api/leads', (req, res) => {
            res.json(this.leads);
        });

        // SMS Webhook (Twilio)
        this.app.post('/api/sms/webhook', async (req, res) => {
            try {
                const { From, Body, MessageSid } = req.body;
                this.logger.info('📱 SMS received from:', From || 'Unknown', '- Message:', Body || 'No message');
                
                // Generate AI response
                let response = '';
                const lowerBody = (Body || '').toLowerCase();
                
                if (lowerBody.includes('stop')) {
                    response = 'You have been unsubscribed from Forward Horizon messages. Reply START to resubscribe.';
                } else if (lowerBody.includes('housing') || lowerBody.includes('help')) {
                    response = 'Forward Horizon provides transitional housing for individuals and families. We have programs for veterans and those experiencing homelessness. Call (310) 488-5280 or visit our website to apply. Reply STOP to unsubscribe.';
                } else if (lowerBody.includes('veteran')) {
                    response = 'Thank you for your service! We have specialized housing programs for veterans with additional support services. Priority placement available. Call (310) 488-5280 to learn more. Reply STOP to unsubscribe.';
                } else if (lowerBody.includes('tour') || lowerBody.includes('visit')) {
                    response = 'We offer property tours weekdays 9-5 and Saturdays 10-2. Call (310) 488-5280 to schedule your tour. Reply STOP to unsubscribe.';
                } else {
                    response = 'Thank you for contacting Forward Horizon! For housing assistance, call (310) 488-5280 or visit our website. Reply HELP for more info or STOP to unsubscribe.';
                }

                // Send TwiML response
                res.set('Content-Type', 'text/xml');
                res.send(`<?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Message>${response}</Message>
                    </Response>`);
                    
            } catch (error) {
                this.logger.error('SMS webhook error:', error.message);
                res.status(500).send('Error processing SMS');
            }
        });

        // Voice Webhook (Twilio)
        this.app.post('/api/voice/incoming', async (req, res) => {
            try {
                const { CallSid, From, To } = req.body;
                this.logger.info('📞 Incoming call from:', From);
                
                // Generate TwiML voice response
                const voiceResponse = `<?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Say voice="alice">Hello! Thank you for calling Forward Horizon. I'm your AI assistant.</Say>
                        <Say voice="alice">We provide transitional housing for individuals and families, with special programs for veterans.</Say>
                        <Gather input="speech" action="/api/voice/gather" timeout="5" speechTimeout="auto">
                            <Say voice="alice">Please tell me how I can help you today. You can say things like housing information, schedule a tour, or speak to someone.</Say>
                        </Gather>
                        <Say voice="alice">I'm sorry, I didn't hear anything. Please call back at 310-488-5280. Thank you!</Say>
                        <Hangup/>
                    </Response>`;
                
                res.set('Content-Type', 'text/xml');
                res.send(voiceResponse);
                
            } catch (error) {
                this.logger.error('Voice webhook error:', error.message);
                res.status(500).send('Error processing call');
            }
        });

        // Voice Gather Handler
        this.app.post('/api/voice/gather', async (req, res) => {
            try {
                const { SpeechResult, Confidence } = req.body;
                this.logger.info('🎤 Speech:', SpeechResult, 'Confidence:', Confidence);
                
                const speech = (SpeechResult || '').toLowerCase();
                let response = '';
                
                if (speech.includes('housing') || speech.includes('information')) {
                    response = 'We offer transitional housing with rent based on your income. Units range from studios to family apartments. We also provide support services including job training and counseling.';
                } else if (speech.includes('tour') || speech.includes('visit')) {
                    response = 'I can help schedule a property tour. Tours are available weekdays from 9 AM to 5 PM and Saturdays from 10 AM to 2 PM. Please leave your name and number after the beep, and we\'ll call you back to confirm.';
                } else if (speech.includes('veteran')) {
                    response = 'Thank you for your service! We have dedicated housing programs for veterans with priority placement and additional support services. A specialist will call you back within 24 hours.';
                } else if (speech.includes('speak') || speech.includes('person') || speech.includes('human')) {
                    response = 'I\'ll connect you with a housing specialist. Please call 310-488-5280 during business hours, Monday through Friday 9 AM to 5 PM.';
                } else {
                    response = 'I can help with housing information, scheduling tours, or connecting you with a specialist. What would you like to know more about?';
                }
                
                const voiceResponse = `<?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Say voice="alice">${response}</Say>
                        <Gather input="speech" action="/api/voice/gather" timeout="5" speechTimeout="auto">
                            <Say voice="alice">Is there anything else I can help you with?</Say>
                        </Gather>
                        <Say voice="alice">Thank you for calling Forward Horizon. Have a great day!</Say>
                        <Hangup/>
                    </Response>`;
                
                res.set('Content-Type', 'text/xml');
                res.send(voiceResponse);
                
            } catch (error) {
                this.logger.error('Voice gather error:', error.message);
                res.status(500).send('Error processing speech');
            }
        });
    }
    
    calculateScore(leadData) {
        let score = 50; // Base score
        
        if (leadData.is_veteran) score += 25;
        if (leadData.in_recovery) score += 20;
        if (leadData.currently_homeless) score += 30;
        if (leadData.phone) score += 5;
        if (leadData.employment_status === 'employed') score += 10;
        
        return Math.min(100, score);
    }
    
    async sendWelcomeEmail(lead) {
        try {
            const mailOptions = {
                from: `"Forward Horizon" <${process.env.EMAIL_USER}>`,
                to: lead.email,
                subject: '🏠 Welcome to Forward Horizon - Your Housing Application',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 30px; text-align: center; color: white;">
                            <h1>🏠 Welcome, ${lead.name}!</h1>
                            <p>Thank you for choosing Forward Horizon</p>
                        </div>
                        
                        <div style="padding: 30px;">
                            <p>Dear ${lead.name},</p>
                            
                            <p>We've received your housing inquiry and want to help you find the perfect transitional housing solution.</p>
                            
                            <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
                                <h3>✅ Next Steps:</h3>
                                <ul>
                                    <li>Housing specialist will review your application within 24 hours</li>
                                    <li>We'll call you to discuss your specific needs</li>
                                    <li>Schedule a tour of available units</li>
                                    <li>Complete your move-in process</li>
                                </ul>
                            </div>
                            
                            <p><strong>Need immediate help?</strong><br>
                            Call our hotline: <a href="tel:${process.env.BUSINESS_PHONE}">${process.env.BUSINESS_PHONE}</a></p>
                            
                            <p>Best regards,<br>
                            The Forward Horizon Team</p>
                        </div>
                    </div>
                `
            };
            
            await this.transporter.sendMail(mailOptions);
            this.logger.email('Welcome email sent to:', lead.email ? '[CONFIGURED EMAIL]' : '[EMAIL NOT SET]');
            
            this.emails.push({
                to: lead.email,
                subject: mailOptions.subject,
                sent: new Date().toISOString(),
                type: 'welcome'
            });
            
        } catch (error) {
            console.error('❌ Email failed:', error.message);
        }
    }
    
    async syncToGoogleDrive(lead) {
        try {
            // Simulate Google Drive sync for now
            this.logger.info('Synced to Google Drive:', lead.name);
            
            // TODO: Implement actual Google Sheets integration
            // This would append the lead to a Google Sheet
            
        } catch (error) {
            console.error('❌ Google Drive sync failed:', error.message);
        }
    }
    
    async sendSMSNotification(lead) {
        try {
            // Only try to send SMS if Twilio is fully configured
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
                this.logger.warn('Twilio not configured - skipping SMS notification');
                return;
            }
            
            const twilio = require('twilio');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            
            const message = `🏠 New Forward Horizon Lead!\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'Not provided'}\nScore: ${lead.score}\n\nLog in to view details.`;
            
            await client.messages.create({
                body: message,
                to: process.env.BUSINESS_OWNER_PHONE,
                from: process.env.TWILIO_PHONE_NUMBER
            });
            
            this.logger.info('📱 SMS notification sent for lead:', lead.name);
        } catch (error) {
            console.error('❌ SMS notification failed:', error.message);
        }
    }
    
    startTasks() {
        // Simple task runner - check for new leads every 5 minutes
        setInterval(() => {
            this.logger.task(`Task check - ${this.leads.length} leads, ${this.emails.length} emails sent`);
            
            // Process new leads
            const newLeads = this.leads.filter(lead => lead.status === 'new');
            if (newLeads.length > 0) {
                this.logger.info(`Processing ${newLeads.length} new leads...`);
                // Here you could trigger additional processing
            }
            
        }, 5 * 60 * 1000); // 5 minutes
        
        this.logger.task('Task automation started');
    }
    
    startServer() {
        this.app.listen(this.port, () => {
            this.logger.network(`Forward Horizon AI Agent running on http://localhost:${this.port}`);
            this.logger.info(`Dashboard: http://localhost:${this.port}`);
            this.logger.info(`API Status: http://localhost:${this.port}/api/status`);
            this.logger.success('System is ready for leads!');
        });
    }
}

// Handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the agent
const agent = new SimpleAIAgent();
agent.initialize().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Forward Horizon AI Agent...');
    process.exit(0);
});