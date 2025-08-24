#!/usr/bin/env node

async function testEmail() {
    // Clear any cached module
    delete require.cache[require.resolve('nodemailer')];
    
    // Load modules fresh
    require('dotenv').config();
    const nodemailer = require('nodemailer');
    
    console.log('Testing email configuration...');
    console.log('Email user:', process.env.EMAIL_USER);
    console.log('Email host:', process.env.EMAIL_HOST);
    
    try {
        const transporter = nodemailer.createTransport({
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

        console.log('\nVerifying connection...');
        await transporter.verify();
        console.log('✅ Email connection successful!');
        
        // Try sending a test email
        console.log('\nSending test email to:', process.env.EMAIL_USER);
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Forward Horizon" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email - Forward Horizon AI Agent',
            text: 'This is a test email from your AI agent. If you receive this, email is working correctly!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">✅ Email System Working!</h1>
                    </div>
                    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333;">This is a test email from your Forward Horizon AI Agent.</p>
                        <p style="font-size: 16px; color: #333;">If you're seeing this, your email configuration is correct and ready for lead nurturing!</p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">✨ System Status</h3>
                            <ul style="color: #666;">
                                <li>SMTP Connection: ✅ Active</li>
                                <li>Authentication: ✅ Verified</li>
                                <li>Send Capability: ✅ Ready</li>
                                <li>Daily Limit: 50 emails/day</li>
                            </ul>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">You can now:</p>
                        <ul style="color: #666; font-size: 14px;">
                            <li>Send automated welcome emails to new leads</li>
                            <li>Run email nurturing campaigns</li>
                            <li>Send appointment confirmations</li>
                            <li>Generate and send business reports</li>
                        </ul>
                    </div>
                    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Forward Horizon AI Agent v1.0<br>
                            Intelligent Business Assistant
                        </p>
                    </div>
                </div>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('\n🎉 Email system is fully operational!');
        
    } catch (error) {
        console.error('\n❌ Email test failed:', error.message);
        
        if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
            console.log('\n⚠️  Authentication Issue Detected!');
            console.log('\nTo fix this:');
            console.log('1. Go to: https://myaccount.google.com/security');
            console.log('2. Enable 2-Step Verification if not already enabled');
            console.log('3. Go to: https://myaccount.google.com/apppasswords');
            console.log('4. Generate a new app password for "Mail"');
            console.log('5. Update EMAIL_PASS in .env with the 16-character app password');
            console.log('   (remove any spaces from the app password)');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n⚠️  Connection refused - check your internet connection');
        } else if (error.message.includes('getaddrinfo')) {
            console.log('\n⚠️  DNS resolution failed - check EMAIL_HOST setting');
        }
        
        process.exit(1);
    }
}

// Run the test
testEmail().catch(console.error);