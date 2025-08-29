
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface DoubtSolverProps {
  messages: ChatMessage[];
  onAsk: (doubt: string) => void;
  isLoading: boolean;
}

const DoubtSolver: React.FC<DoubtSolverProps> = ({ messages, onAsk, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onAsk(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-indigo-500"/>
                <span>Ask a Doubt</span>
            </h3>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex my-2 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex my-2 justify-start animate-fade-in">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-slate-200 text-slate-800">
                        <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        
        <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 placeholder:text-slate-400"
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:bg-slate-400 transition-colors">
                    Ask
                </button>
            </div>
        </div>
    </div>
  );
};

export default DoubtSolver;