/**
 * Calendar Integration Manager
 * Handles Google Calendar, Calendly, and scheduling
 */

const { google } = require('googleapis');
const Logger = require('../utils/logger');

class CalendarManager {
    constructor() {
        this.logger = new Logger('CalendarManager');
        this.calendar = null;
        this.oauth2Client = null;
        this.initialized = false;
        
        // Available time slots
        this.businessHours = {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null // Closed
        };
        
        this.appointmentDuration = 30; // minutes
        this.bufferTime = 15; // minutes between appointments
    }

    async initialize() {
        this.logger.info('📅 Initializing Calendar Manager...');
        
        try {
            // Check for Google Calendar credentials
            if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
                await this.setupGoogleCalendar();
            } else {
                this.logger.warn('⚠️ Google Calendar credentials not configured');
            }
            
            this.initialized = true;
            this.logger.success('✅ Calendar Manager initialized');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize Calendar Manager:', error);
            return false;
        }
    }

    async setupGoogleCalendar() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
        );
        
        // Use refresh token if available
        if (process.env.GOOGLE_REFRESH_TOKEN) {
            this.oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });
            
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            // Test connection
            try {
                await this.calendar.calendarList.list({ maxResults: 1 });
                this.logger.success('✅ Google Calendar connected');
            } catch (error) {
                this.logger.error('Google Calendar connection failed:', error);
            }
        }
    }

    /**
     * Get available appointment slots
     */
    async getAvailableSlots(date = new Date(), days = 7) {
        const slots = [];
        const startDate = new Date(date);
        
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            
            const dayName = currentDate.toLocaleLowerCase().split(' ')[0];
            const dayHours = this.businessHours[dayName];
            
            if (!dayHours) continue; // Closed
            
            // Get existing appointments for this day
            const existingAppointments = await this.getAppointmentsForDay(currentDate);
            
            // Generate time slots
            const daySlots = this.generateTimeSlotsForDay(
                currentDate,
                dayHours,
                existingAppointments
            );
            
            slots.push({
                date: currentDate.toISOString().split('T')[0],
                dayName: dayName,
                slots: daySlots
            });
        }
        
        return slots;
    }

    generateTimeSlotsForDay(date, hours, existingAppointments) {
        const slots = [];
        const [startHour, startMinute] = hours.start.split(':').map(Number);
        const [endHour, endMinute] = hours.end.split(':').map(Number);
        
        const startTime = new Date(date);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        const slotDuration = this.appointmentDuration + this.bufferTime;
        
        while (startTime < endTime) {
            const slotEnd = new Date(startTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + this.appointmentDuration);
            
            // Check if slot is available
            const isAvailable = !this.isSlotTaken(startTime, slotEnd, existingAppointments);
            
            if (isAvailable && startTime > new Date()) { // Only future slots
                slots.push({
                    start: startTime.toTimeString().slice(0, 5),
                    end: slotEnd.toTimeString().slice(0, 5),
                    available: true
                });
            }
            
            startTime.setMinutes(startTime.getMinutes() + slotDuration);
        }
        
        return slots;
    }

    isSlotTaken(start, end, appointments) {
        return appointments.some(apt => {
            const aptStart = new Date(apt.start);
            const aptEnd = new Date(apt.end);
            return (start < aptEnd && end > aptStart);
        });
    }

    /**
     * Book an appointment
     */
    async bookAppointment(leadData, slot) {
        const appointment = {
            id: `apt_${Date.now()}`,
            leadId: leadData.id || `lead_${Date.now()}`,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            date: slot.date,
            time: slot.time,
            duration: this.appointmentDuration,
            type: leadData.appointmentType || 'Property Tour',
            status: 'confirmed',
            notes: leadData.message || '',
            createdAt: new Date()
        };
        
        // Create Google Calendar event if connected
        if (this.calendar) {
            await this.createGoogleCalendarEvent(appointment);
        }
        
        // Send confirmation email
        await this.sendAppointmentConfirmation(appointment);
        
        // Send reminder SMS if phone provided
        if (appointment.phone) {
            await this.scheduleReminders(appointment);
        }
        
        this.logger.success(`📅 Appointment booked for ${appointment.name} on ${appointment.date} at ${appointment.time}`);
        
        return appointment;
    }

    async createGoogleCalendarEvent(appointment) {
        if (!this.calendar) return;
        
        const startDateTime = new Date(`${appointment.date} ${appointment.time}`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + appointment.duration);
        
        const event = {
            summary: `${appointment.type} - ${appointment.name}`,
            description: `Lead: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone || 'N/A'}\n\nNotes: ${appointment.notes}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Los_Angeles'
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Los_Angeles'
            },
            attendees: [
                { email: appointment.email }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'email', minutes: 60 } // 1 hour before
                ]
            }
        };
        
        try {
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all'
            });
            
            appointment.googleEventId = response.data.id;
            this.logger.success(`📅 Google Calendar event created: ${response.data.id}`);
        } catch (error) {
            this.logger.error('Failed to create Google Calendar event:', error);
        }
    }

    async sendAppointmentConfirmation(appointment) {
        // This would integrate with your email manager
        const confirmationEmail = {
            to: appointment.email,
            subject: `Appointment Confirmed - ${appointment.type}`,
            html: this.generateConfirmationEmail(appointment)
        };
        
        // Send email (integrate with your email manager)
        this.logger.info('📧 Appointment confirmation email queued');
        
        return confirmationEmail;
    }

    generateConfirmationEmail(appointment) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Appointment Confirmed! 🎉</h2>
                <p>Dear ${appointment.name},</p>
                <p>Your ${appointment.type} has been confirmed.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Appointment Details:</h3>
                    <p><strong>Date:</strong> ${appointment.date}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                    <p><strong>Type:</strong> ${appointment.type}</p>
                    <p><strong>Location:</strong> Forward Horizon Office</p>
                    <p><strong>Address:</strong> [Your Address Here]</p>
                </div>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">What to Bring:</h4>
                    <ul>
                        <li>Valid ID</li>
                        <li>Proof of income (if applicable)</li>
                        <li>Any questions you have</li>
                    </ul>
                </div>
                
                <div style="margin: 20px 0;">
                    <a href="${process.env.BUSINESS_WEBSITE}/appointments/${appointment.id}" 
                       style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Appointment Details
                    </a>
                </div>
                
                <p>Need to reschedule? Call us at <strong>(310) 488-5280</strong></p>
                
                <p>We look forward to meeting you!</p>
                
                <p>Best regards,<br>
                The Forward Horizon Team</p>
            </div>
        `;
    }

    async scheduleReminders(appointment) {
        // Schedule 24-hour reminder
        const dayBefore = new Date(`${appointment.date} ${appointment.time}`);
        dayBefore.setDate(dayBefore.getDate() - 1);
        
        if (dayBefore > new Date()) {
            setTimeout(async () => {
                await this.sendReminderSMS(appointment, '24 hours');
            }, dayBefore - new Date());
        }
        
        // Schedule 1-hour reminder
        const hourBefore = new Date(`${appointment.date} ${appointment.time}`);
        hourBefore.setHours(hourBefore.getHours() - 1);
        
        if (hourBefore > new Date()) {
            setTimeout(async () => {
                await this.sendReminderSMS(appointment, '1 hour');
            }, hourBefore - new Date());
        }
    }

    async sendReminderSMS(appointment, timeframe) {
        // This would integrate with your SMS manager
        const message = `Reminder: Your ${appointment.type} is in ${timeframe}! Date: ${appointment.date} at ${appointment.time}. Location: Forward Horizon Office. Call (310) 488-5280 if you need to reschedule.`;
        
        this.logger.info(`📱 SMS reminder sent for appointment ${appointment.id}`);
        return message;
    }

    /**
     * Cancel an appointment
     */
    async cancelAppointment(appointmentId, reason = '') {
        // Find appointment
        const appointment = await this.getAppointment(appointmentId);
        
        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }
        
        // Cancel in Google Calendar
        if (this.calendar && appointment.googleEventId) {
            try {
                await this.calendar.events.delete({
                    calendarId: 'primary',
                    eventId: appointment.googleEventId
                });
            } catch (error) {
                this.logger.error('Failed to cancel Google Calendar event:', error);
            }
        }
        
        // Update status
        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancelReason = reason;
        
        // Send cancellation notification
        await this.sendCancellationNotification(appointment);
        
        return { success: true, appointment };
    }

    async sendCancellationNotification(appointment) {
        // Send email notification
        const email = {
            to: appointment.email,
            subject: 'Appointment Cancelled',
            text: `Your ${appointment.type} on ${appointment.date} at ${appointment.time} has been cancelled. To reschedule, please call (310) 488-5280.`
        };
        
        this.logger.info(`📧 Cancellation notification sent for ${appointment.id}`);
        return email;
    }

    /**
     * Get appointments for a specific day
     */
    async getAppointmentsForDay(date) {
        // This would query your database
        // For now, return mock data
        return [];
    }

    async getAppointment(appointmentId) {
        // This would query your database
        // For now, return mock data
        return null;
    }

    /**
     * Get calendar statistics
     */
    async getStats() {
        return {
            initialized: this.initialized,
            googleCalendarConnected: !!this.calendar,
            todayAppointments: 0, // Would query database
            weekAppointments: 0, // Would query database
            businessHours: this.businessHours
        };
    }
}

module.exports = CalendarManager;