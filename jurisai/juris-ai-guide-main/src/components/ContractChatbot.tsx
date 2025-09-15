import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContractChatbotProps {
  extractedText: string;
}

interface ChatMessage {
  user: string;
  bot: string;
  id: string; // Unique ID for animation
}

const ContractChatbot: React.FC<ContractChatbotProps> = ({ extractedText }) => {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    const userMessage = prompt;
    setPrompt('');
    const messageId = generateUniqueId();

    try {
      // Add the user message to chat history immediately for better UX
      setChatHistory(prev => [...prev, { 
        user: userMessage, 
        bot: '...', 
        id: messageId 
      }]);
      
      setIsThinking(true);
      
      // Make API call to backend with context and history
      const response = await fetch('http://localhost:5000/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          context: extractedText,
          history: chatHistory.map(chat => ({
            user: chat.user,  
            bot: chat.bot
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Short delay to show the thinking animation
      setTimeout(() => {
        setIsThinking(false);
        
        // Update the last message with the real bot response
        setChatHistory(prev => [
          ...prev.slice(0, -1),
          { user: userMessage, bot: data.reply, id: messageId }
        ]);
      }, 500);
      
    } catch (err) {
      setIsThinking(false);
      // Update the last message with an error
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { user: userMessage, bot: 'Sorry, something went wrong. Please try again.', id: messageId }
      ]);
    } finally {
      setLoading(false);
      // Focus back on the input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Thinking animation component
  const ThinkingIndicator = () => (
    <div className="flex space-x-2 p-2">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="h-2 w-2 rounded-full bg-blue-500"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            delay: dot * 0.2 
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-8 p-4 border rounded-lg shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
        </svg>
        Ask About Your Contract
      </h3>
      
      <div 
        ref={chatContainerRef}
        className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100"
      >
        <AnimatePresence>
          {chatHistory.map((chat) => (
            <motion.div 
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <motion.div 
                className="bg-blue-50 p-3 rounded-lg rounded-bl-none mb-2 max-w-4/5 ml-auto mr-0 shadow-sm"
                whileHover={{ scale: 1.01 }}
              >
                <p className="font-medium text-blue-800">You:</p>
                <p className="text-gray-800">{chat.user}</p>
              </motion.div>
              
              {chat.bot === '...' ? (
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                    </svg>
                  </div>
                  <ThinkingIndicator />
                </div>
              ) : (
                <motion.div 
                  className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm max-w-4/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <p className="font-medium text-blue-700">Bot:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{chat.bot}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isThinking && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].bot !== '...' && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 shadow-md">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
              </svg>
            </div>
            <ThinkingIndicator />
          </div>
        )}
      </div>
      
      <div className="relative mt-4">
        <motion.div 
          className="flex"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the contract..."
            disabled={loading}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className={`px-6 py-3 rounded-r-lg flex items-center justify-center transition-all duration-200 ${
              loading || !prompt.trim() 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } text-white shadow-md hover:shadow-lg`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 transform transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            )}
          </button>
        </motion.div>
        
        {chatHistory.length === 0 && (
          <motion.div 
            className="absolute -top-10 left-0 right-0 text-center text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Type your first question about the contract above
          </motion.div>
        )}
      </div>
      
      {chatHistory.length > 2 && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={() => setChatHistory([])} 
            className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            Clear conversation
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ContractChatbot;