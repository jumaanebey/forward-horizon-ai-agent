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
        
        // Send professional nurturing email demo
        console.log('\nSending DEMO: Professional Veteran Nurturing Email');
        console.log('To:', process.env.EMAIL_USER);
        
        const result = await transporter.sendMail({
            from: `"Forward Horizon AI Agent" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '🎖️ Welcome Home - Your Forward Horizon Housing Application',
            text: `
🎖️ WELCOME HOME - FORWARD HORIZON HOUSING

Thank you for your service and for choosing Forward Horizon for your housing needs.

✓ APPLICATION RECEIVED - PRIORITY PROCESSING ACTIVE
As a veteran, your application receives expedited review by our Veterans Housing Specialist within 24 hours.

YOUR NEXT STEPS:
1. Application Review - Veterans Liaison reviews your information (24-48 hours)
2. VA Benefits Optimization - We help maximize your housing benefits  
3. Personal Consultation - Schedule a call with our Veterans Specialist
4. Housing Placement - We find the perfect match for your needs

EXCLUSIVE VETERAN BENEFITS:
✓ Priority Placement - Fast-track access to available units
✓ VA Benefits Coordination - Maximize your housing allowances
✓ Career Services - Job placement and skill training
✓ Veteran Community - Connect with fellow veterans

📞 Veterans Hotline: (310) 488-5280 (Available 24/7)
📧 theforwardhorizon@gmail.com

Forward Horizon - Your Service Honored, Your Future Secured
            `.trim(),
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.12);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 50px 40px; text-align: center; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px); background-size: 50px 50px;"></div>
                        <div style="position: relative; z-index: 1;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎖️ Welcome Home</h1>
                            <p style="color: #e0e7ff; margin: 15px 0 0 0; font-size: 18px; font-weight: 400;">Your service honored. Your future secured.</p>
                        </div>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 10px 0;">Thank you for choosing Forward Horizon</h2>
                            <p style="color: #6b7280; font-size: 16px; margin: 0;">We're honored to support your housing journey</p>
                        </div>
                        
                        <!-- Status Box -->
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #1e3a8a; opacity: 0.1; border-radius: 50%;"></div>
                            <div style="position: relative; z-index: 1;">
                                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 12px;">
                                    <span style="background: #1e40af; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">✓</span>
                                    Application Received
                                </h3>
                                <p style="color: #1e40af; line-height: 1.7; margin: 0; font-size: 16px;">
                                    <strong>Priority Processing Active:</strong> As a veteran, your application receives expedited review by our Veterans Housing Specialist within 24 hours.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Steps -->
                        <div style="margin: 40px 0;">
                            <h3 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 25px;">Your Next Steps:</h3>
                            <div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 25px; gap: 15px;">
                                    <div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;">1</div>
                                    <div style="flex: 1;">
                                        <h4 style="color: #111827; margin: 0 0 8px 0; font-size: 17px; font-weight: 600;">Application Review</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.6;">Veterans Liaison reviews your information and housing needs (24-48 hours)</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 25px; gap: 15px;">
                                    <div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;">2</div>
                                    <div style="flex: 1;">
                                        <h4 style="color: #111827; margin: 0 0 8px 0; font-size: 17px; font-weight: 600;">VA Benefits Optimization</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.6;">We help maximize your housing benefits and coordinate with VA resources</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 25px; gap: 15px;">
                                    <div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;">3</div>
                                    <div style="flex: 1;">
                                        <h4 style="color: #111827; margin: 0 0 8px 0; font-size: 17px; font-weight: 600;">Personal Consultation</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.6;">Schedule a call with our Veterans Housing Specialist</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 0; gap: 15px;">
                                    <div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;">4</div>
                                    <div style="flex: 1;">
                                        <h4 style="color: #111827; margin: 0 0 8px 0; font-size: 17px; font-weight: 600;">Housing Placement</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.6;">We find the perfect housing match for your needs and timeline</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Benefits Grid -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; margin: 40px 0;">
                            <h3 style="color: #111827; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">🏆 Exclusive Veteran Benefits:</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #10b981; font-weight: 600; font-size: 15px;">✓ Priority Placement</p>
                                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.4;">Fast-track access to available units</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #10b981; font-weight: 600; font-size: 15px;">✓ VA Benefits Coordination</p>
                                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.4;">Maximize your housing allowances</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #10b981; font-weight: 600; font-size: 15px;">✓ Career Services</p>
                                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.4;">Job placement and skill training</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #10b981; font-weight: 600; font-size: 15px;">✓ Veteran Community</p>
                                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.4;">Connect with fellow veterans</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 50px 0;">
                            <a href="tel:+13104885280" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(30, 58, 138, 0.3);">
                                📞 Call Veterans Hotline: (310) 488-5280
                            </a>
                            <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">Available 24/7 for veteran housing emergencies</p>
                        </div>
                        
                        <!-- Success Stats -->
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 25px; border-radius: 10px; margin: 40px 0;">
                            <p style="color: #92400e; font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">💡 Success Story</p>
                            <p style="color: #78350f; margin: 0; line-height: 1.6;">Veterans at Forward Horizon have a 94% success rate in transitioning to permanent housing within 6 months. You're in excellent hands.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Need Immediate Support?</h4>
                            <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                                <div>
                                    <p style="color: #6b7280; margin: 0; font-size: 14px;">📞 Veterans Hotline</p>
                                    <p style="color: #111827; margin: 5px 0 0 0; font-weight: 600;">(310) 488-5280</p>
                                </div>
                                <div>
                                    <p style="color: #6b7280; margin: 0; font-size: 14px;">📧 Direct Email</p>
                                    <p style="color: #111827; margin: 5px 0 0 0; font-weight: 600;">theforwardhorizon@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                                <strong>Forward Horizon AI Agent</strong><br>
                                Professional Nurturing Campaign Demo<br>
                                <em>"Your Service Honored, Your Future Secured"</em>
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        
        console.log('✅ Professional nurturing email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('\n🎉 CHECK YOUR EMAIL TO SEE THE BEAUTIFUL CAMPAIGN!');
        
        console.log('\n📧 This email demonstrates:');
        console.log('   • Professional veteran-focused design');
        console.log('   • Clear next steps and timeline');
        console.log('   • Exclusive benefit highlights');
        console.log('   • Trust signals and success stats');
        console.log('   • Mobile-responsive HTML layout');
        console.log('   • Strong call-to-action');
        
        console.log('\n🎯 Your nurturing system is ready for live leads!');
        
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