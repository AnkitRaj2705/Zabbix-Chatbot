class WhatsAppClone {
    constructor() {
        this.currentChat = null;
        this.contacts = [
            {
                id: 1,
                name: "John Doe",
                avatar: "https://i.pravatar.cc/150?img=1",
                lastMessage: "Hey! How are you doing?",
                lastMessageTime: "10:30 AM",
                unreadCount: 2,
                online: true,
                messages: [
                    {
                        id: 1,
                        content: "Hi there!",
                        timestamp: "10:25 AM",
                        sent: false,
                        status: "read"
                    },
                    {
                        id: 2,
                        content: "Hey! How are you doing?",
                        timestamp: "10:30 AM",
                        sent: false,
                        status: "delivered"
                    }
                ]
            },
            {
                id: 2,
                name: "Jane Smith",
                avatar: "https://i.pravatar.cc/150?img=2",
                lastMessage: "Thanks for the help!",
                lastMessageTime: "Yesterday",
                unreadCount: 0,
                online: false,
                messages: [
                    {
                        id: 1,
                        content: "Could you help me with the project?",
                        timestamp: "Yesterday",
                        sent: false,
                        status: "read"
                    },
                    {
                        id: 2,
                        content: "Sure! I'll send you the files.",
                        timestamp: "Yesterday",
                        sent: true,
                        status: "read"
                    },
                    {
                        id: 3,
                        content: "Thanks for the help!",
                        timestamp: "Yesterday",
                        sent: false,
                        status: "read"
                    }
                ]
            },
            {
                id: 3,
                name: "Mike Johnson",
                avatar: "https://i.pravatar.cc/150?img=3",
                lastMessage: "Let's meet tomorrow",
                lastMessageTime: "2:15 PM",
                unreadCount: 1,
                online: true,
                messages: [
                    {
                        id: 1,
                        content: "Are you free tomorrow?",
                        timestamp: "2:10 PM",
                        sent: false,
                        status: "read"
                    },
                    {
                        id: 2,
                        content: "Yes, what time works for you?",
                        timestamp: "2:12 PM",
                        sent: true,
                        status: "read"
                    },
                    {
                        id: 3,
                        content: "Let's meet tomorrow",
                        timestamp: "2:15 PM",
                        sent: false,
                        status: "delivered"
                    }
                ]
            },
            {
                id: 4,
                name: "Sarah Wilson",
                avatar: "https://i.pravatar.cc/150?img=4",
                lastMessage: "Good morning! ☀️",
                lastMessageTime: "8:45 AM",
                unreadCount: 0,
                online: false,
                messages: [
                    {
                        id: 1,
                        content: "Good morning! ☀️",
                        timestamp: "8:45 AM",
                        sent: false,
                        status: "read"
                    },
                    {
                        id: 2,
                        content: "Morning! Have a great day!",
                        timestamp: "8:47 AM",
                        sent: true,
                        status: "read"
                    }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.renderContacts();
        this.bindEvents();
    }
    
    renderContacts() {
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '';
        
        this.contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            contactElement.dataset.contactId = contact.id;
            
            contactElement.innerHTML = `
                <div style="position: relative;">
                    <img src="${contact.avatar}" alt="${contact.name}" class="contact-pic">
                    <div class="status-indicator ${contact.online ? 'status-online' : 'status-offline'}"></div>
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="last-message">${contact.lastMessage}</div>
                </div>
                <div class="message-meta">
                    <div class="message-time">${contact.lastMessageTime}</div>
                    ${contact.unreadCount > 0 ? `<div class="unread-count">${contact.unreadCount}</div>` : ''}
                </div>
            `;
            
            contactElement.addEventListener('click', () => this.selectChat(contact.id));
            contactsList.appendChild(contactElement);
        });
    }
    
    selectChat(contactId) {
        // Remove active class from all contacts
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected contact
        document.querySelector(`[data-contact-id="${contactId}"]`).classList.add('active');
        
        this.currentChat = this.contacts.find(contact => contact.id === contactId);
        this.renderChatHeader();
        this.renderMessages();
        this.showChatInput();
        
        // Mark messages as read
        this.currentChat.unreadCount = 0;
        this.renderContacts();
    }
    
    renderChatHeader() {
        const chatHeader = document.getElementById('chatHeader');
        chatHeader.innerHTML = `
            <div class="chat-info">
                <img src="${this.currentChat.avatar}" alt="${this.currentChat.name}" class="contact-pic">
                <div class="contact-details">
                    <h3 class="contact-name">${this.currentChat.name}</h3>
                    <span class="contact-status">${this.currentChat.online ? 'Online' : 'Last seen recently'}</span>
                </div>
            </div>
            <div class="chat-actions">
                <i class="fas fa-search"></i>
                <i class="fas fa-paperclip"></i>
                <i class="fas fa-ellipsis-v"></i>
            </div>
        `;
    }
    
    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        this.currentChat.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sent ? 'sent' : 'received'}`;
        
        const statusIcon = message.sent ? this.getStatusIcon(message.status) : '';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">${message.content}</div>
                <div class="message-meta">
                    <span class="message-time">${message.timestamp}</span>
                    ${message.sent ? `<span class="message-status ${message.status}">${statusIcon}</span>` : ''}
                </div>
            </div>
        `;
        
        return messageDiv;
    }
    
    getStatusIcon(status) {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓';
            default: return '';
        }
    }
    
    showChatInput() {
        document.getElementById('chatInputContainer').style.display = 'block';
    }
    
    sendMessage(content) {
        if (!this.currentChat || !content.trim()) return;
        
        const newMessage = {
            id: Date.now(),
            content: content.trim(),
            timestamp: this.getCurrentTime(),
            sent: true,
            status: 'sent'
        };
        
        this.currentChat.messages.push(newMessage);
        this.currentChat.lastMessage = content.trim();
        this.currentChat.lastMessageTime = newMessage.timestamp;
        
        this.renderMessages();
        this.renderContacts();
        
        // Simulate message delivery
        setTimeout(() => {
            newMessage.status = 'delivered';
            this.renderMessages();
        }, 1000);
        
        // Simulate auto-reply (for demo purposes)
        setTimeout(() => {
            this.simulateReply();
        }, 2000);
    }
    
    simulateReply() {
        const replies = [
            "That sounds great! 👍",
            "I'll get back to you soon",
            "Thanks for letting me know",
            "Absolutely! 😊",
            "Sure thing!",
            "Got it, thanks!",
            "Perfect timing!",
            "I was just thinking about that",
            "Sounds like a plan",
            "Let me check and get back to you"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        // Show typing indicator
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const replyMessage = {
                id: Date.now(),
                content: randomReply,
                timestamp: this.getCurrentTime(),
                sent: false,
                status: 'delivered'
            };
            
            this.currentChat.messages.push(replyMessage);
            this.currentChat.lastMessage = randomReply;
            this.currentChat.lastMessageTime = replyMessage.timestamp;
            
            this.renderMessages();
            this.renderContacts();
        }, 2000);
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message received typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    bindEvents() {
        // Send message on Enter key
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(messageInput.value);
                messageInput.value = '';
            }
        });
        
        sendBtn.addEventListener('click', () => {
            this.sendMessage(messageInput.value);
            messageInput.value = '';
        });
        
        // Emoji picker toggle
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.style.display = 'none';
            }
        });
        
        // Emoji selection
        document.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', () => {
                messageInput.value += emoji.textContent;
                messageInput.focus();
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filterContacts(e.target.value);
        });
    }
    
    filterContacts(searchTerm) {
        const contactItems = document.querySelectorAll('.contact-item');
        
        contactItems.forEach(item => {
            const contactName = item.querySelector('.contact-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
            
            if (contactName.includes(searchTerm.toLowerCase()) || 
                lastMessage.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Simulate receiving a new message
    receiveMessage(contactId, content) {
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        const newMessage = {
            id: Date.now(),
            content: content,
            timestamp: this.getCurrentTime(),
            sent: false,
            status: 'delivered'
        };
        
        contact.messages.push(newMessage);
        contact.lastMessage = content;
        contact.lastMessageTime = newMessage.timestamp;
        
        if (this.currentChat && this.currentChat.id === contactId) {
            this.renderMessages();
        } else {
            contact.unreadCount = (contact.unreadCount || 0) + 1;
        }
        
        this.renderContacts();
        
        // Play notification sound (if supported)
        this.playNotificationSound();
    }
    
    playNotificationSound() {
        // Create a simple notification sound using Web Audio API
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }
    
    // Add a new contact
    addContact(name, avatar) {
        const newContact = {
            id: Date.now(),
            name: name,
            avatar: avatar || "https://i.pravatar.cc/150?img=" + (this.contacts.length + 1),
            lastMessage: "Say hello!",
            lastMessageTime: "Now",
            unreadCount: 0,
            online: Math.random() > 0.5,
            messages: []
        };
        
        this.contacts.unshift(newContact);
        this.renderContacts();
    }
    
    // Update message status
    updateMessageStatus(messageId, status) {
        if (!this.currentChat) return;
        
        const message = this.currentChat.messages.find(m => m.id === messageId);
        if (message && message.sent) {
            message.status = status;
            this.renderMessages();
        }
    }
    
    // Format timestamp for display
    formatTimestamp(timestamp) {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffInHours = (now - messageDate) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new WhatsAppClone();
    
    // Demo: Simulate receiving messages
    setTimeout(() => {
        app.receiveMessage(1, "This is a demo message! 🎉");
    }, 5000);
    
    setTimeout(() => {
        app.receiveMessage(2, "The WhatsApp clone is working great!");
    }, 10000);
    
    // Make app globally accessible for debugging
    window.whatsapp = app;
});

// Service Worker for offline functionality (basic)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to close emoji picker
    if (e.key === 'Escape') {
        document.getElementById('emojiPicker').style.display = 'none';
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const sidebar = document.querySelector('.sidebar');
        
        if (diff > 0) {
            // Swipe left - hide sidebar on mobile
            sidebar.classList.remove('active');
        } else {
            // Swipe right - show sidebar on mobile
            sidebar.classList.add('active');
        }
    }
}