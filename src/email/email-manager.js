/**
 * Email Manager
 * Handles email sending, templates, and automation for the AI agent
 */

const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');

class EmailManager {
  constructor() {
    this.logger = new Logger('EmailManager');
    this.transporter = null;
    this.initialized = false;
    
    // Email statistics
    this.stats = {
      sent: 0,
      failed: 0,
      daily_sent: 0,
      last_reset: new Date().toDateString()
    };
    
    // Rate limiting
    this.maxDailyEmails = parseInt(process.env.MAX_DAILY_EMAILS) || 50;
    
    // Business info
    this.businessInfo = {
      name: process.env.BUSINESS_NAME || 'Forward Horizon',
      phone: process.env.BUSINESS_PHONE || '(310) 488-5280',
      email: process.env.BUSINESS_EMAIL || 'info@forwardhorizon.com',
      website: process.env.BUSINESS_WEBSITE || 'https://www.theforwardhorizon.com'
    };
  }

  async initialize() {
    this.logger.info('📧 Initializing Email Manager...');
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.warn('⚠️ Email credentials not configured - running in simulation mode');
      this.initialized = false;
      return true; // Return true to not block agent startup
    }
    
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      
      this.initialized = true;
      this.logger.info('✅ Email Manager initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize email manager:', error);
      
      // Continue without email if not configured properly
      this.logger.warn('⚠️ Email functionality disabled - check EMAIL_* environment variables');
      this.initialized = false;
      return true; // Don't block agent startup
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options) {
    if (!this.initialized) {
      this.logger.warn('Email manager not initialized - cannot send email');
      return { success: false, error: 'Email not configured' };
    }

    if (!this.checkDailyLimit()) {
      const error = 'Daily email limit reached';
      this.logger.warn(error);
      return { success: false, error };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"${this.businessInfo.name}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo || process.env.EMAIL_USER
      };

      // Add attachments if provided
      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      this.stats.sent++;
      this.stats.daily_sent++;
      
      this.logger.info(`📤 Email sent to ${options.to}: ${options.subject}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
      
    } catch (error) {
      this.stats.failed++;
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email to new leads
   */
  async sendWelcomeEmail(lead) {
    const subject = `Welcome to ${this.businessInfo.name} - Thank you for your interest!`;
    
    const html = this.generateWelcomeEmailHTML(lead);
    const text = this.generateWelcomeEmailText(lead);

    return await this.sendEmail({
      to: lead.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send follow-up email to leads
   */
  async sendFollowUpEmail(lead, followUpType = 'general') {
    const templates = this.getFollowUpTemplates();
    const template = templates[followUpType] || templates.general;
    
    const subject = template.subject.replace('{name}', lead.name || 'there');
    const html = this.generateFollowUpEmailHTML(lead, template);
    const text = this.generateFollowUpEmailText(lead, template);

    return await this.sendEmail({
      to: lead.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(lead, appointment) {
    const subject = `Appointment Confirmed - ${appointment.date} at ${appointment.time}`;
    
    const html = this.generateAppointmentEmailHTML(lead, appointment);
    const text = this.generateAppointmentEmailText(lead, appointment);

    return await this.sendEmail({
      to: lead.email,
      subject,
      html,
      text
    });
  }

  /**
   * Send business report via email
   */
  async sendBusinessReport(recipient, reportData, reportType = 'weekly') {
    const subject = `${this.businessInfo.name} ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    
    const html = this.generateReportEmailHTML(reportData, reportType);
    const text = this.generateReportEmailText(reportData, reportType);

    return await this.sendEmail({
      to: recipient,
      subject,
      html,
      text
    });
  }

  // Template Generation Methods
  generateWelcomeEmailHTML(lead) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to ${this.businessInfo.name}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">${this.businessInfo.name}</h1>
            <div style="width: 50px; height: 3px; background: #3498db; margin: 0 auto;"></div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Hello ${lead.name || 'there'}! 👋</h2>
            <p>Thank you for your interest in ${this.businessInfo.name}. We're excited to help you achieve your goals.</p>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll reach out to schedule a personalized consultation</li>
              <li>We'll discuss how we can best help you succeed</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.businessInfo.website}" 
               style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
          
          <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p><strong>${this.businessInfo.name}</strong></p>
            <p>📧 ${this.businessInfo.email} | 📞 ${this.businessInfo.phone}</p>
            <p>🌐 <a href="${this.businessInfo.website}" style="color: #3498db;">${this.businessInfo.website}</a></p>
          </div>
        </body>
      </html>
    `;
  }

  generateWelcomeEmailText(lead) {
    return `
Hello ${lead.name || 'there'}!

Thank you for your interest in ${this.businessInfo.name}. We're excited to help you achieve your goals.

What happens next?
- Our team will review your inquiry within 24 hours
- We'll reach out to schedule a personalized consultation  
- We'll discuss how we can best help you succeed

Contact Information:
${this.businessInfo.name}
Email: ${this.businessInfo.email}
Phone: ${this.businessInfo.phone}
Website: ${this.businessInfo.website}

Best regards,
The ${this.businessInfo.name} Team
    `.trim();
  }

  generateFollowUpEmailHTML(lead, template) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${template.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50;">${this.businessInfo.name}</h1>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Hi ${lead.name || 'there'},</p>
            
            <p>${template.content}</p>
            
            <p>We'd love to discuss how ${this.businessInfo.name} can help you achieve your goals.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:${this.businessInfo.phone.replace(/[^0-9+]/g, '')}" 
               style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 10px;">
              📞 Call ${this.businessInfo.phone}
            </a>
            <br>
            <a href="mailto:${this.businessInfo.email}" 
               style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 10px;">
              📧 Reply to this Email
            </a>
          </div>
          
          <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p><strong>${this.businessInfo.name}</strong></p>
            <p>📧 ${this.businessInfo.email} | 📞 ${this.businessInfo.phone}</p>
          </div>
        </body>
      </html>
    `;
  }

  generateFollowUpEmailText(lead, template) {
    return `
Hi ${lead.name || 'there'},

${template.content}

We'd love to discuss how ${this.businessInfo.name} can help you achieve your goals.

Contact us:
Phone: ${this.businessInfo.phone}
Email: ${this.businessInfo.email}

Best regards,
The ${this.businessInfo.name} Team
    `.trim();
  }

  generateAppointmentEmailHTML(lead, appointment) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="margin: 0;">✅ Appointment Confirmed!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <p><strong>Hello ${lead.name || 'there'},</strong></p>
            
            <p>Your appointment with ${this.businessInfo.name} has been confirmed!</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">📅 Appointment Details</h3>
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <p><strong>Duration:</strong> ${appointment.duration || '1 hour'}</p>
              <p><strong>Type:</strong> ${appointment.type || 'Consultation'}</p>
              ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
              ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>
            
            <p>We look forward to speaking with you!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${this.businessInfo.email}?subject=Appointment Question" 
               style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Need to Reschedule?
            </a>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>${this.businessInfo.name} | ${this.businessInfo.phone}</p>
          </div>
        </body>
      </html>
    `;
  }

  generateAppointmentEmailText(lead, appointment) {
    return `
✅ APPOINTMENT CONFIRMED

Hello ${lead.name || 'there'},

Your appointment with ${this.businessInfo.name} has been confirmed!

📅 Appointment Details:
Date: ${appointment.date}
Time: ${appointment.time}
Duration: ${appointment.duration || '1 hour'}
Type: ${appointment.type || 'Consultation'}
${appointment.location ? `Location: ${appointment.location}` : ''}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}

We look forward to speaking with you!

Need to reschedule? Reply to this email or call ${this.businessInfo.phone}

Best regards,
${this.businessInfo.name}
    `.trim();
  }

  // Helper methods
  getFollowUpTemplates() {
    return {
      general: {
        subject: 'Following up on your inquiry with {name}',
        content: `I wanted to follow up on your recent inquiry with ${this.businessInfo.name}. We specialize in helping businesses like yours achieve their goals and would love to discuss how we can help you succeed.`
      },
      consultation: {
        subject: 'Free consultation available - {name}',
        content: `I wanted to reach out about your interest in our services. We're offering free consultations this month to help businesses understand their opportunities and create actionable growth strategies.`
      },
      resource: {
        subject: 'Helpful resources for {name}',
        content: `Based on your inquiry, I thought you might find some of our recent insights valuable. We've helped many businesses in similar situations achieve remarkable results.`
      }
    };
  }

  checkDailyLimit() {
    const today = new Date().toDateString();
    
    // Reset daily counter if it's a new day
    if (this.stats.last_reset !== today) {
      this.stats.daily_sent = 0;
      this.stats.last_reset = today;
    }
    
    return this.stats.daily_sent < this.maxDailyEmails;
  }

  getStats() {
    return {
      ...this.stats,
      daily_limit: this.maxDailyEmails,
      remaining_today: Math.max(0, this.maxDailyEmails - this.stats.daily_sent),
      initialized: this.initialized
    };
  }
}

module.exports = EmailManager;