/**
 * Forward Horizon AI Chat Widget
 * Embed this on any website with:
 * <script src="https://your-railway-url/embed.js"></script>
 */

(function() {
    // Configuration
    const WIDGET_URL = 'https://forward-horizon-ai-agent-production.up.railway.app';
    
    // Create and inject the chat widget iframe
    function injectChatWidget() {
        // Create container
        const container = document.createElement('div');
        container.id = 'forward-horizon-chat-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            width: 380px;
            height: 680px;
            pointer-events: none;
        `;
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${WIDGET_URL}/chat-widget.html`;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            pointer-events: auto;
            background: transparent;
        `;
        iframe.allow = 'autoplay; microphone';
        
        // Add to page
        container.appendChild(iframe);
        document.body.appendChild(container);
        
        // Handle responsive
        function handleResize() {
            if (window.innerWidth < 480) {
                container.style.width = '100vw';
                container.style.height = '100vh';
                container.style.bottom = '0';
                container.style.right = '0';
            } else {
                container.style.width = '380px';
                container.style.height = '680px';
                container.style.bottom = '20px';
                container.style.right = '20px';
            }
        }
        
        window.addEventListener('resize', handleResize);
        handleResize();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectChatWidget);
    } else {
        injectChatWidget();
    }
    
    // Expose API for controlling the widget
    window.ForwardHorizonChat = {
        open: function() {
            const iframe = document.querySelector('#forward-horizon-chat-container iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ action: 'open' }, '*');
            }
        },
        close: function() {
            const iframe = document.querySelector('#forward-horizon-chat-container iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ action: 'close' }, '*');
            }
        },
        sendMessage: function(message) {
            const iframe = document.querySelector('#forward-horizon-chat-container iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ action: 'send', message: message }, '*');
            }
        }
    };
})();