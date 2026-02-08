import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Built to care, programmed to love",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'bot',
      content: "• Date ideas and planning\n• Conversation starters\n• Couple preferences\n• Relationship advice\n• Gift suggestions\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple keyword-based responses for the demo chatbot.
  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('date idea') || lowerMessage.includes('where should')) {
      return "Here are some great date ideas based on your preferences! 🌟\n\n1. **Rooftop dinner** - Perfect for a romantic evening with city views\n2. **Cooking class together** - Fun, interactive, and you get to eat!\n3. **Sunset picnic** - Pack some wine and snacks for a relaxed vibe\n4. **Art gallery hop** - Great for conversation starters\n5. **Adventure date** - Try rock climbing or kayaking!\n\nWould you like more specific suggestions based on your location or favorite dates?";
    }
    
    if (lowerMessage.includes('conversation') || lowerMessage.includes('talk about') || lowerMessage.includes('ice breaker')) {
      return "Great conversation starters for your date! 💬\n\n• \"What's the most spontaneous thing you've ever done?\"\n• \"If you could travel anywhere tomorrow, where would you go?\"\n• \"What's something you're really passionate about?\"\n• \"What's your favorite way to spend a lazy Sunday?\"\n• \"What's the best meal you've ever had?\"\n\nRemember: Listen actively and share your own stories too! Would you like more specific topics?";
    }
    
    if (lowerMessage.includes('profile') || lowerMessage.includes('bio') || lowerMessage.includes('preferences')) {
      return "Here are some tips for great couple preferences! ✨\n\n🧭 **Focus areas:**\n• Pick 3-5 shared favorite dates\n• Set a realistic budget range\n• Choose time windows that work for both\n• Rotate who picks the theme\n\nWant help crafting your next plan?";
    }
    
    if (lowerMessage.includes('gift') || lowerMessage.includes('present')) {
      return "Thoughtful gift ideas for your special someone! 🎁\n\n**Early Dating:**\n• Their favorite flowers\n• A book by an author they mentioned\n• Quality chocolate or wine\n\n**Established Relationship:**\n• Experience gifts (concert tickets, spa day)\n• Personalized items\n• Something related to their hobby\n\n**Pro tip:** Pay attention to things they mention wanting or enjoying!\n\nWhat's the occasion?";
    }
    
    if (lowerMessage.includes('nervous') || lowerMessage.includes('anxious') || lowerMessage.includes('scared')) {
      return "It's totally normal to feel nervous before a date! 🤗 Here's how to calm those butterflies:\n\n1. **Prepare ahead** - Plan your outfit the night before\n2. **Arrive early** - Rushing increases anxiety\n3. **Deep breaths** - Try the 4-7-8 breathing technique\n4. **Remember** - They're probably nervous too!\n5. **Focus on fun** - It's about enjoying yourself\n\nYou've got this! What specifically are you worried about?";
    }
    
    if (lowerMessage.includes('red flag') || lowerMessage.includes('warning')) {
      return "Important red flags to watch for: 🚩\n\n• They avoid answering direct questions\n• They're rude to service staff\n• They only talk about themselves\n• They pressure you to move too fast\n• They're constantly on their phone\n• They badmouth all their exes\n• They make you feel uncomfortable about your boundaries\n\nTrust your gut - if something feels off, it probably is. Want to discuss a specific situation?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 I'm always here to help with your date planning. Is there anything else you'd like to know?";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hey there! 👋 Great to chat with you! What can I help you with today? Whether it's date planning, conversation tips, or anything else - I'm here for you!";
    }

    return "That's a great question! 🤔 While I think about that, here are some things I can definitely help with:\n\n• Planning the perfect date\n• Pairing activities with your budget\n• Conversation tips\n• Cozy at-home ideas\n• Relationship advice\n\nCould you tell me more about what you're looking for? I want to give you the best advice possible!";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Give me a date idea",
    "Conversation starters",
    "Couple preferences",
    "I'm nervous about my date",
  ];

  return (
    <div className="chatbot-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">
              <span>🤖</span>
              <span className="online-indicator"></span>
            </div>
            <div className="bot-info">
              <h2>Datemaker AI</h2>
              <span className="bot-status">Always here to help 💕</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="header-btn" title="Clear chat">🗑️</button>
            <button className="header-btn" title="Settings">⚙️</button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {message.type === 'bot' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-prompts">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              className="quick-prompt-btn"
              onClick={() => setInputValue(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-input-container">
          <button className="attachment-btn">📎</button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="chat-input"
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <span>➤</span>
          </button>
        </div>
      </div>

      <div className="chat-sidebar">
        <div className="sidebar-section">
          <h3>💡 Popular Topics</h3>
          <ul className="topics-list">
            <li onClick={() => setInputValue("What are some unique date ideas for couples?")}>
              Couple Date Ideas
            </li>
            <li onClick={() => setInputValue("How do we choose date preferences together?")}>
              Date Preferences
            </li>
            <li onClick={() => setInputValue("What are some red flags to watch for?")}>
              Red Flags Guide
            </li>
            <li onClick={() => setInputValue("How do we avoid planning burnout?")}>
              Planning Burnout Tips
            </li>
            <li onClick={() => setInputValue("What gift should I get?")}>
              Gift Suggestions
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>🎯 AI Capabilities</h3>
          <div className="capabilities-list">
            <div className="capability-item">
              <span className="capability-icon">💬</span>
              <span>Natural Conversation</span>
            </div>
            <div className="capability-item">
              <span className="capability-icon">🎨</span>
              <span>Personalized Advice</span>
            </div>
            <div className="capability-item">
              <span className="capability-icon">📚</span>
              <span>Date Planning Knowledge</span>
            </div>
            <div className="capability-item">
              <span className="capability-icon">🔒</span>
              <span>Private & Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
