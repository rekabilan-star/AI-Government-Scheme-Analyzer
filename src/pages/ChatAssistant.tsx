import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  Compass,
  ArrowRight,
  RotateCcw,
  Building2,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  referencedSchemes?: string[];
  timestamp: string;
}

export const ChatAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste! I am your AI Government Scheme Assistant powered by Gemini 3.8 and official database records.\n\nYou can ask me about:\n• Welfare scheme eligibility conditions\n• Financial subsidies and entitlement limits\n• Mandatory documents and proof verification\n• Step-by-step application instructions\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSpeech = (msgId: string, textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToRead.replace(/[*#_•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // Build conversation history format for API
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await chatApi.sendMessage({
        message: textToSend.trim(),
        history
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.data.reply,
        referencedSchemes: res.data.referencedSchemes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the Gemini AI service. You can still browse all verified schemes in the directory.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickPrompts = [
    'Am I eligible for PM-KISAN farmer support?',
    'What are the income limits for Ayushman Bharat?',
    'How do street vendors get loans under PM SVANidhi?',
    'What documents are needed for Stand-Up India?',
    'Tell me about Sukanya Samriddhi Yojana for girl children'
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] min-h-[550px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">AI Scheme Advisor</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                Grounded Q&A
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Powered by Google Gemini 3.8 & Verified National Welfare Database
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-700 text-white rounded-tr-xs'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line font-normal">{msg.text}</div>

              {/* Referenced Scheme Tags */}
              {msg.referencedSchemes && msg.referencedSchemes.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Referenced Verified Schemes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.referencedSchemes.map((name, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                      >
                        <Building2 className="w-3 h-3 text-blue-500" />
                        <span>{name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 text-[10px]">
                {msg.sender === 'assistant' ? (
                  <button
                    onClick={() => toggleSpeech(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-700 transition-colors"
                    title={speakingMsgId === msg.id ? 'Stop voice' : 'Listen aloud'}
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3 h-3 text-rose-600 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                    <span>{speakingMsgId === msg.id ? 'Stop Voice' : 'Listen'}</span>
                  </button>
                ) : <span />}

                <span className={msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}>
                  {msg.timestamp}
                </span>
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium ml-1">Consulting official scheme criteria...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestion Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about scheme eligibility, application links, documents, benefits..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            className="absolute right-2 p-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            <span>AI responses are informational. Sanctions are governed by official authorities.</span>
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
