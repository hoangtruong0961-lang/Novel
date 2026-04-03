import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, Activity, Network } from 'lucide-react';
import { ChatMessage, StoryBible, AgentType } from '../types';
import { callReasoningModelStream, parseReasoningOutput, extractStoryBible } from '../lib/ai';
import { NovelAlgorithms } from '../lib/algorithms';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  storyBible: StoryBible;
  setStoryBible: React.Dispatch<React.SetStateAction<StoryBible>>;
  setAiState: (isThinking: boolean, reasoning: string, activeAgents: AgentType[], actionGuidance: string) => void;
}

const QUICK_PROMPTS = [
  "Lên ý tưởng cho một cú twist",
  "Phát triển nhân vật phản diện",
  "Viết cảnh mở đầu",
  "Kiểm tra lỗ hổng cốt truyện"
];

export function ChatView({ messages, setMessages, storyBible, setStoryBible, setAiState }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isGenerating) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    const assistantMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);
    
    // Determine active agents based on input (simple heuristic)
    const lowerInput = text.toLowerCase();
    let activeAgents: AgentType[] = ['Orchestrator'];
    if (lowerInput.includes('cốt truyện') || lowerInput.includes('dàn ý')) activeAgents.push('Plot Planner');
    if (lowerInput.includes('nhân vật') || lowerInput.includes('phản diện')) activeAgents.push('Character Writer');
    if (lowerInput.includes('đối thoại') || lowerInput.includes('nói')) activeAgents.push('Dialogue Engine');
    if (lowerInput.includes('đánh giá') || lowerInput.includes('nhận xét')) activeAgents.push('Critic');
    if (activeAgents.length === 1) activeAgents.push('Plot Planner', 'Character Writer'); // Default team

    const actionGuidance = NovelAlgorithms.suggestActionGuidance(text);
    setAiState(true, '', activeAgents, actionGuidance);

    const historyContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    
    const systemInstruction = `You are a Multi-Agent Novel Writing System (simulating DeepSeek R1).
Always think step-by-step about narrative structure, character voice, and pacing before answering.
You MUST ALWAYS respond in Vietnamese.

CURRENT STORY BIBLE (Auto-extracted context):
${JSON.stringify(storyBible, null, 2)}

ACTION GUIDANCE (SWAG Framework):
${actionGuidance}

Use this context to inform all your suggestions, prose generation, and plot planning.`;

    const prompt = `
      Context of conversation:
      ${historyContext}
      User: ${text}
      Assistant:
    `;

    let fullResponse = '';
    try {
      for await (const chunk of callReasoningModelStream(prompt, systemInstruction, activeAgents)) {
        fullResponse += chunk;
        const { reasoning, output } = parseReasoningOutput(fullResponse);
        setAiState(true, reasoning, activeAgents, actionGuidance);
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: output, reasoning } : m));
      }
      
      const { reasoning, output } = parseReasoningOutput(fullResponse);
      const metrics = NovelAlgorithms.analyzeText(output);
      
      setAiState(false, reasoning, activeAgents, actionGuidance);
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: output, reasoning, metrics } : m));

      // Trigger background story bible extraction every few messages or on long outputs
      if (messages.length % 3 === 0 || output.length > 500) {
        const newHistory = `${historyContext}\nUser: ${text}\nAssistant: ${output}`;
        extractStoryBible(newHistory, storyBible).then(newBible => {
          setStoryBible(newBible);
        });
      }

    } catch (error) {
      console.error(error);
      setAiState(false, 'Lỗi khi tạo phản hồi.', ['Orchestrator'], '');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
        {messages.length === 1 && messages[0].role === 'assistant' && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 md:space-y-6 opacity-90 px-2 md:px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-indigo-400/30 shadow-lg shadow-indigo-500/10 shrink-0">
              <Network className="w-6 h-6 md:w-8 md:h-8 text-indigo-300" />
            </div>
            <div className="max-w-md">
              <h2 className="text-lg md:text-2xl font-semibold text-white mb-2 drop-shadow-md">Hệ thống Đa tác nhân DeepNovel</h2>
              <p className="text-slate-300 text-xs md:text-sm mb-6 md:mb-8 drop-shadow-sm">
                Tôi là trợ lý viết lách ưu tiên suy luận, được hỗ trợ bởi Kiến trúc Đa tác nhân. Tôi sử dụng Lập kế hoạch Phân cấp, Bộ nhớ Thời gian và Hướng dẫn Hành động.
              </p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 rounded-full text-[11px] md:text-sm transition-all flex items-center gap-1.5 md:gap-2 shadow-sm hover:shadow-md"
                  >
                    <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (messages.length === 1 && idx === 0) return null;
          return (
            <div key={msg.id} className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-indigo-400/30 mt-1 shadow-sm">
                  <Bot className="w-3 h-3 md:w-4 md:h-4 text-indigo-300" />
                </div>
              )}
              
              <div className={`max-w-[92%] md:max-w-[85%] rounded-2xl px-3 py-2.5 md:px-5 md:py-4 backdrop-blur-md border shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-indigo-600/80 border-indigo-500/50 text-white rounded-tr-sm shadow-indigo-900/20' 
                  : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-sm shadow-black/20'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none break-words overflow-hidden">
                  <p className="whitespace-pre-wrap leading-relaxed m-0">{msg.content || (isGenerating && msg.role === 'assistant' ? '...' : '')}</p>
                </div>
                
                {msg.metrics && (
                  <div className="mt-3 pt-2 md:mt-4 md:pt-3 border-t border-white/10 flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-slate-300">
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <Activity className="w-3 h-3 text-indigo-400 shrink-0" />
                      Nhịp độ: <span className="text-white font-medium">{msg.metrics.pacing}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      Cảm xúc: <span className="text-white font-medium">{msg.metrics.sentiment}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5" title="Điểm Mạch lạc">
                      <Network className="w-3 h-3 text-emerald-400 shrink-0" />
                      Mạch lạc: <span className="text-white font-medium">{msg.metrics.coherenceScore}%</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5" title="Chỉ số Đa dạng">
                      <Bot className="w-3 h-3 text-purple-400 shrink-0" />
                      Đa dạng: <span className="text-white font-medium">{msg.metrics.diversityIndex}%</span>
                    </div>
                    {msg.metrics.styleDrift !== undefined && (
                      <div className="flex items-center gap-1 md:gap-1.5" title="Độ lệch Văn phong">
                        <Zap className="w-3 h-3 text-rose-400 shrink-0" />
                        Lệch: <span className="text-white font-medium">{msg.metrics.styleDrift}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                      Từ: <span className="text-white font-medium">{msg.metrics.wordCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <User className="w-3 h-3 md:w-4 md:h-4 text-slate-200" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0.75rem)] md:pb-6 shrink-0">
        <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (messages.length / 20) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Tiến độ Phiên: {messages.length}/20</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {messages.reduce((acc, m) => acc + (m.metrics?.wordCount || 0), 0)} từ
            </span>
          </div>
        </div>
        <div className="relative max-w-4xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về cốt truyện, ý tưởng nhân vật..."
            className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl pl-3 pr-10 md:pl-4 md:pr-12 py-2.5 md:py-4 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none min-h-[44px] max-h-32 md:max-h-48 custom-scrollbar text-sm shadow-inner"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isGenerating || !input.trim()}
            className="absolute right-1.5 bottom-1.5 md:right-3 md:bottom-3 p-1.5 md:p-2 bg-indigo-500/80 hover:bg-indigo-500 backdrop-blur-md border border-indigo-400/50 disabled:bg-white/5 disabled:border-white/5 disabled:text-slate-500 text-white rounded-lg transition-all shadow-md shrink-0"
          >
            {isGenerating ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-[10px] md:text-xs text-slate-400 mt-2 drop-shadow-sm px-2">
          Trợ lý DeepNovel tự động điều phối các tác nhân và trích xuất ngữ cảnh ở chế độ nền.
        </p>
      </div>
    </div>
  );
}




