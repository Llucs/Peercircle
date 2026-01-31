
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { askGemini } from '../services/geminiService';

interface ChatWindowProps {
  messages: Message[];
  remotePeerId: string | null;
  onSendMessage: (text: string) => void;
  onAddSystemMessage: (text: string, sender?: 'system' | 'ai') => void;
  onDisconnect: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  remotePeerId, 
  onSendMessage, 
  onAddSystemMessage,
  onDisconnect 
}) => {
  const [inputText, setInputText] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleAskAI = async () => {
    const lastContext = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
    setIsAskingAI(true);
    const aiResponse = await askGemini("O usuário quer ajuda no chat. Sugira uma resposta ou ajude com o assunto atual.", lastContext);
    onAddSystemMessage(aiResponse, 'ai');
    setIsAskingAI(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {remotePeerId?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 leading-tight">Chat P2P</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Conectado
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAskAI}
            disabled={isAskingAI}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative group"
            title="Assistente Gemini"
          >
            {isAskingAI ? (
               <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Gemini Assistant</span>
          </button>
          <button 
            onClick={onDisconnect}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 animate-pulse">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p>Sua conexão é segura e direta.<br/>Diga olá!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' || msg.sender === 'ai' ? 'justify-center' : 'justify-start'} animate-fade-in`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                msg.sender === 'me' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : msg.sender === 'ai'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-100 italic'
                  : msg.sender === 'system'
                  ? 'bg-gray-100 text-gray-500 text-xs italic border-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  IA Sugestão
                </div>
              )}
              {msg.text}
              <div className={`text-[10px] mt-1 opacity-60 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 sticky bottom-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm flex items-end">
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm outline-none resize-none max-h-32"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-11 h-11 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
          Conexão WebRTC direta. Nenhuma mensagem passa pelos nossos servidores.
        </p>
      </div>
    </div>
  );
};
