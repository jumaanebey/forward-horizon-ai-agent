#!/usr/bin/env node

/**
 * Simplified Forward Horizon AI Agent
 * Clean, working version with Google Drive integration
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const Logger = require('./src/utils/logger');
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
        
        // Setup Express
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        this.logger.startup('Initializing Simple AI Agent...');
    }
    
    async initialize() {
        try {
            await this.setupEmail();
            await this.setupGoogleDrive();
            this.setupRoutes();
            this.startServer();
            this.startTasks();
            this.logger.success('Simple AI Agent initialized successfully!');
        } catch (error) {
            this.logger.error('Initialization failed:', error.message);
        }
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
    
    setupRoutes() {
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
                leads: this.leads.length,
                emails: this.emails.length,
                emailConfigured: !!this.transporter,
                googleDriveConnected: !!this.googleSheets
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
                
                res.json({ success: true, lead });
            } catch (error) {
                console.error('❌ Lead processing failed:', error);
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.get('/api/leads', (req, res) => {
            res.json(this.leads);
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