# WhatsApp Clone

A modern, responsive WhatsApp clone built with vanilla HTML, CSS, and JavaScript. This project replicates the core features and design of WhatsApp Web with a clean, intuitive interface.

## 🌟 Features

- **Real-time Messaging**: Send and receive messages with instant updates
- **Contact Management**: View and search through your contact list
- **Message Status**: See delivery and read receipts (✓ sent, ✓✓ delivered/read)
- **Emoji Picker**: Express yourself with a built-in emoji selector
- **Typing Indicators**: See when someone is typing
- **Online/Offline Status**: Track contact availability
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Search Functionality**: Find contacts and messages quickly
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Keyboard Shortcuts**: Enhanced productivity with hotkeys
- **Touch Gestures**: Swipe navigation for mobile users
- **Notification Sounds**: Audio feedback for new messages

## 🚀 Quick Start

### Option 1: Using Node.js (Recommended)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Using Python
```bash
# Start a simple HTTP server
npm run serve
# or directly:
python3 -m http.server 3000
```

### Option 3: Using http-server
```bash
# Install http-server globally
npm install -g http-server

# Start the server
npm start
```

Then open your browser and navigate to `http://localhost:3000`

## 📱 Usage

1. **Select a Contact**: Click on any contact in the sidebar to start a conversation
2. **Send Messages**: Type your message and press Enter or click the send button
3. **Use Emojis**: Click the emoji button to open the emoji picker
4. **Search Contacts**: Use the search bar to find specific contacts or messages
5. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + K`: Focus search bar
   - `Enter`: Send message
   - `Escape`: Close emoji picker

## 🏗️ Project Structure

```
whatsapp-clone/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Core JavaScript functionality
├── package.json        # Project configuration and dependencies
└── README.md          # This file
```

## 🎨 Design Features

- **Authentic WhatsApp UI**: Pixel-perfect recreation of WhatsApp's design
- **Green Theme**: Uses WhatsApp's signature green color scheme (#00a884)
- **Smooth Animations**: Message animations and hover effects
- **Custom Scrollbars**: Styled scrollbars for better visual consistency
- **Mobile-First**: Responsive design that works on all screen sizes

## 🔧 Technical Details

### Core Technologies
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Flexbox, Grid, animations, and media queries
- **Vanilla JavaScript**: ES6+ features, classes, and modern APIs

### Key JavaScript Features
- Object-oriented design with ES6 classes
- Event-driven architecture
- Local state management
- Web Audio API for notifications
- Touch gesture support
- Service Worker ready (basic implementation)

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔮 Demo Features

The app includes several demo features to showcase functionality:

- **Auto-replies**: Contacts automatically respond to your messages
- **Simulated Typing**: See typing indicators in action
- **Random Messages**: Periodic incoming messages for demonstration
- **Multiple Contacts**: Pre-loaded with sample contacts and conversation history

## 🛠️ Customization

### Adding New Contacts
```javascript
// Access the app instance
window.whatsapp.addContact("New Contact Name", "avatar-url");
```

### Simulating Incoming Messages
```javascript
// Send a message from a specific contact
window.whatsapp.receiveMessage(contactId, "Hello there!");
```

### Customizing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
  --whatsapp-green: #00a884;
  --whatsapp-green-dark: #017561;
  --background-light: #f0f2f5;
  --text-primary: #111b21;
}
```

## 🔐 Security Considerations

This is a frontend-only demo application. For production use, consider:

- Implementing proper authentication
- Adding end-to-end encryption
- Setting up a secure backend API
- Implementing rate limiting
- Adding input sanitization
- Using HTTPS in production

## 🌐 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `https://yourusername.github.io/whatsapp-clone`

### Netlify
1. Connect your GitHub repository to Netlify
2. Deploy with default settings
3. Your app will be live with a custom URL

### Vercel
1. Import your GitHub repository to Vercel
2. Deploy with zero configuration
3. Get automatic deployments on every push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WhatsApp for the inspiration and design reference
- Font Awesome for the icons
- Pravatar for placeholder avatars
- The open-source community for tools and libraries

## 📞 Support

If you have any questions or need help, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

---

**Note**: This is a demonstration project and is not affiliated with WhatsApp Inc. or Meta Platforms Inc.