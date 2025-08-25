/**
 * Forward Horizon AI Chat Widget - Embeddable Version
 * Add this script to any webpage to include 24/7 AI support
 * 
 * Usage: <script src="embeddable-chat.js"></script>
 */

(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.ForwardHorizonChat) return;
    
    class ForwardHorizonEmbeddableChat {
        constructor() {
            this.isOpen = false;
            this.isMinimized = false;
            this.conversationHistory = [];
            this.userName = null;
            this.chatButton = null;
            this.chatWidget = null;
            
            this.init();
        }
        
        init() {
            this.injectStyles();
            this.createChatButton();
            this.createChatWidget();
            this.bindEvents();
        }
        
        injectStyles() {
            const styles = `
                /* Chat Button Styles */
                .fh-chat-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    border: none;
                }
                
                .fh-chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
                }
                
                .fh-chat-button svg {
                    width: 24px;
                    height: 24px;
                    fill: white;
                }
                
                .fh-chat-button.active {
                    background: #ef4444;
                }
                
                /* Notification Badge */
                .fh-chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                
                /* Chat Widget Styles */
                .fh-chat-widget {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .fh-chat-widget.open {
                    display: flex;
                    animation: slideUp 0.3s ease-out;
                }
                
                .fh-chat-widget.minimized {
                    height: 60px;
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .fh-chat-header {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                
                .fh-chat-header-content h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .fh-chat-header-content p {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                .fh-chat-controls {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .fh-chat-minimize,
                .fh-chat-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 3px;
                    transition: background 0.2s;
                }
                
                .fh-chat-minimize:hover,
                .fh-chat-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .fh-chat-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                
                .fh-chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: #f8fafc;
                }
                
                .fh-message {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 15px;
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                }
                
                .fh-message.ai {
                    background: white;
                    color: #374151;
                    align-self: flex-start;
                    border-bottom-left-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .fh-message.user {
                    background: #2563eb;
                    color: white;
                    align-self: flex-end;
                    border-bottom-right-radius: 5px;
                }
                
                .fh-typing-indicator {
                    display: none;
                    padding: 10px 14px;
                    background: white;
                    border-radius: 15px;
                    max-width: 60px;
                    align-self: flex-start;
                    border-bottom-left-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .fh-typing-dots {
                    display: flex;
                    gap: 3px;
                }
                
                .fh-typing-dots span {
                    width: 6px;
                    height: 6px;
                    background: #94a3b8;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                
                .fh-typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .fh-typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-8px); }
                }
                
                .fh-chat-input-container {
                    padding: 15px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 10px;
                    background: white;
                }
                
                .fh-chat-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 20px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    resize: none;
                    max-height: 100px;
                    min-height: 40px;
                }
                
                .fh-chat-input:focus {
                    border-color: #2563eb;
                }
                
                .fh-send-button {
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                    flex-shrink: 0;
                }
                
                .fh-send-button:hover {
                    background: #1d4ed8;
                }
                
                .fh-send-button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }
                
                /* Mobile responsive */
                @media (max-width: 768px) {
                    .fh-chat-widget {
                        bottom: 0;
                        right: 0;
                        width: 100vw;
                        height: 100vh;
                        border-radius: 0;
                    }
                    
                    .fh-chat-widget.minimized {
                        display: none;
                    }
                    
                    .fh-chat-button {
                        bottom: 15px;
                        right: 15px;
                    }
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        createChatButton() {
            this.chatButton = document.createElement('button');
            this.chatButton.className = 'fh-chat-button';
            this.chatButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <span class="fh-chat-badge" style="display: none;">1</span>
            `;
            
            document.body.appendChild(this.chatButton);
            
            // Show notification badge after 3 seconds if not interacted
            setTimeout(() => {
                if (!this.isOpen) {
                    const badge = this.chatButton.querySelector('.fh-chat-badge');
                    badge.style.display = 'flex';
                }
            }, 3000);
        }
        
        createChatWidget() {
            this.chatWidget = document.createElement('div');
            this.chatWidget.className = 'fh-chat-widget';
            this.chatWidget.innerHTML = `
                <div class="fh-chat-header">
                    <div class="fh-chat-header-content">
                        <h3>🏠 The Forward Horizon</h3>
                        <p>AI Housing Specialist • Available 24/7</p>
                    </div>
                    <div class="fh-chat-controls">
                        <button class="fh-chat-minimize">–</button>
                        <button class="fh-chat-close">×</button>
                    </div>
                </div>
                <div class="fh-chat-body">
                    <div class="fh-chat-messages">
                        <div class="fh-message ai">
                            Hi there! I'm your AI housing specialist for The Forward Horizon. Before we dive into how I can help you, could you tell me your first name so I can personalize our conversation?
                        </div>
                    </div>
                    <div class="fh-typing-indicator">
                        <div class="fh-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="fh-chat-input-container">
                        <textarea class="fh-chat-input" placeholder="Type your message..." rows="1"></textarea>
                        <button class="fh-send-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.chatWidget);
        }
        
        bindEvents() {
            const chatButton = this.chatButton;
            const chatWidget = this.chatWidget;
            const minimizeBtn = chatWidget.querySelector('.fh-chat-minimize');
            const closeBtn = chatWidget.querySelector('.fh-chat-close');
            const header = chatWidget.querySelector('.fh-chat-header');
            const input = chatWidget.querySelector('.fh-chat-input');
            const sendBtn = chatWidget.querySelector('.fh-send-button');
            
            // Chat button click
            chatButton.addEventListener('click', () => {
                this.toggleChat();
            });
            
            // Close button
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeChat();
            });
            
            // Minimize button
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeChat();
            });
            
            // Header click to restore from minimized
            header.addEventListener('click', () => {
                if (this.isMinimized) {
                    this.restoreChat();
                }
            });
            
            // Send message
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // Input events
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            });
        }
        
        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }
        
        openChat() {
            this.isOpen = true;
            this.isMinimized = false;
            this.chatWidget.classList.add('open');
            this.chatWidget.classList.remove('minimized');
            this.chatButton.classList.add('active');
            
            // Hide notification badge
            const badge = this.chatButton.querySelector('.fh-chat-badge');
            badge.style.display = 'none';
            
            // Focus input
            setTimeout(() => {
                const input = this.chatWidget.querySelector('.fh-chat-input');
                input.focus();
            }, 100);
            
            // Update button icon to close
            this.chatButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            `;
        }
        
        closeChat() {
            this.isOpen = false;
            this.isMinimized = false;
            this.chatWidget.classList.remove('open', 'minimized');
            this.chatButton.classList.remove('active');
            
            // Reset button icon
            this.chatButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
            `;
        }
        
        minimizeChat() {
            this.isMinimized = true;
            this.chatWidget.classList.add('minimized');
        }
        
        restoreChat() {
            this.isMinimized = false;
            this.chatWidget.classList.remove('minimized');
        }
        
        async sendMessage() {
            const input = this.chatWidget.querySelector('.fh-chat-input');
            const sendBtn = this.chatWidget.querySelector('.fh-send-button');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            this.addMessage(message, 'user');
            input.value = '';
            input.style.height = 'auto';
            
            // Disable input while processing
            sendBtn.disabled = true;
            
            // Show typing indicator
            this.showTyping();
            
            try {
                // Get AI response
                const response = await this.getAIResponse(message);
                
                // Hide typing and show response
                this.hideTyping();
                this.addMessage(response, 'ai');
                
            } catch (error) {
                this.hideTyping();
                this.addMessage("I apologize, but I'm having trouble connecting right now. Please call us directly at (858) 299-2490 for immediate assistance.", 'ai');
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }
        
        async getAIResponse(message) {
            // Simulate AI thinking time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
            
            this.conversationHistory.push({role: 'user', content: message});
            
            const lowerMessage = message.toLowerCase();
            
            // Name detection and greeting
            if (!this.userName && (lowerMessage.includes('i\'m') || lowerMessage.includes('my name') || /^[a-zA-Z\s]+$/.test(message.trim()))) {
                this.userName = message.replace(/i'm|my name is|i am|hi|hello/gi, '').trim();
                if (this.userName) {
                    return `Nice to meet you, ${this.userName}! What brings you to The Forward Horizon today? Are you interested in our veterans program, recovery housing, or reentry support?`;
                }
            }
            
            // Program-specific responses
            if (lowerMessage.includes('veteran') || lowerMessage.includes('military')) {
                return `${this.userName ? this.userName + ', t' : 'T'}hank you for your service! Our Veterans Transitional Housing program is designed specifically for veterans transitioning to civilian life. I'd love to schedule you for a personalized video consultation where we can discuss the program details and see if it's a good fit. Would you like me to help you schedule that?`;
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
            return `${this.userName ? this.userName + ', i' : 'I'}'m here to help you learn about The Forward Horizon's transitional housing programs. I can explain our veterans, recovery, or reentry programs, and schedule you for a personalized video consultation. What specific information would be most helpful for you?`;
        }
        
        addMessage(text, sender) {
            const messagesContainer = this.chatWidget.querySelector('.fh-chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `fh-message ${sender}`;
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        showTyping() {
            const typing = this.chatWidget.querySelector('.fh-typing-indicator');
            const messages = this.chatWidget.querySelector('.fh-chat-messages');
            typing.style.display = 'block';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;
        }
        
        hideTyping() {
            const typing = this.chatWidget.querySelector('.fh-typing-indicator');
            typing.style.display = 'none';
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ForwardHorizonChat = new ForwardHorizonEmbeddableChat();
        });
    } else {
        window.ForwardHorizonChat = new ForwardHorizonEmbeddableChat();
    }
})();