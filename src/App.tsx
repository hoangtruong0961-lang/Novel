import React, { useState, useEffect } from 'react';
import { BookOpen, BrainCircuit, Menu, Plus, Settings, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { AIPanel } from './components/AIPanel';
import { ChatView } from './views/ChatView';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage, AIState, StoryBible, AgentType, SessionSummary, ChatSession } from './types';
import { storage } from './lib/storage';

export default function App() {
  const [isMobileAIPanelOpen, setIsMobileAIPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Settings State
  const [apiKeys, setApiKeys] = useState({ deepseek: '' });
  const [activeModel, setActiveModel] = useState<string>('deepseek-chat');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sessions State
  const [sessionsList, setSessionsList] = useState<SessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('Không gian làm việc DeepNovel');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('deepnovel_api_keys');
    const savedModel = localStorage.getItem('deepnovel_active_model');
    const savedZoom = localStorage.getItem('deepnovel_zoom_level');
    
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      setApiKeys({ deepseek: keys.deepseek || '' });
    }
    if (savedModel) setActiveModel(savedModel);
    if (savedZoom) setZoomLevel(Number(savedZoom));
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('deepnovel_api_keys', JSON.stringify(apiKeys));
    localStorage.setItem('deepnovel_active_model', activeModel);
    localStorage.setItem('deepnovel_zoom_level', zoomLevel.toString());
  }, [apiKeys, activeModel, zoomLevel]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [storyBible, setStoryBible] = useState<StoryBible>({
    authorPersona: {
      name: 'Modernist Realist',
      voiceProfile: 'Câu văn ngắn gọn, súc tích, nhịp điệu dồn dập ở cao trào, chậm rãi ở mô tả nội tâm.',
      writingQuirks: ['Sử dụng dấu gạch ngang để ngắt nhịp', 'Liệt kê các chi tiết giác quan'],
      decisionPatterns: 'Tập trung vào hành động và biểu cảm thay vì giải thích cảm xúc trực tiếp. Bỏ qua các chi tiết thừa thãi.',
      culturalBackground: 'Việt Nam hiện đại, am hiểu phong tục và tâm lý người Việt.',
      stylisticDNA: {
        syntaxComplexity: 0.7,
        dictionLevel: 'Formal',
        punctuationDensity: { '.': 0.8, ',': 0.6, '-': 0.2 }
      }
    },
    characters: {},
    plotPoints: [],
    worldLore: [],
    culturalContext: {
      customs: [],
      idioms: [],
      socialStructures: []
    },
    memoryGraph: [],
    knowledgeGraph: { entities: [], relationships: [], clusters: [] },
    ifState: { flags: {}, relationshipValues: {}, resources: {}, qualities: {}, inventory: [], currentTrajectory: 'Normal' },
    foreshadowing: [],
    multimodalNodes: [],
    plan: { roughOutline: [], chapterSummaries: {}, currentSceneGoal: '', emotionalArcGoal: 'Rise', bottlenecks: [], foldbackPoints: [] },
    emotionalHistory: [],
    rewardHistory: []
  });

  const createNewSession = async () => {
    const newId = crypto.randomUUID();
    const initialMessages: ChatMessage[] = [{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Xin chào! Tôi là Trợ lý DeepNovel của bạn. Tôi đã sẵn sàng đồng hành cùng bạn trong hành trình sáng tạo này. Bạn muốn bắt đầu từ đâu?'
    }];
    const initialBible: StoryBible = {
      authorPersona: {
        name: 'Modernist Realist',
        voiceProfile: 'Câu văn ngắn gọn, súc tích, nhịp điệu dồn dập ở cao trào, chậm rãi ở mô tả nội tâm.',
        writingQuirks: ['Sử dụng dấu gạch ngang để ngắt nhịp', 'Liệt kê các chi tiết giác quan'],
        decisionPatterns: 'Tập trung vào hành động và biểu cảm thay vì giải thích cảm xúc trực tiếp. Bỏ qua các chi tiết thừa thãi.',
        culturalBackground: 'Việt Nam hiện đại, am hiểu phong tục và tâm lý người Việt.',
        stylisticDNA: {
          syntaxComplexity: 0.7,
          dictionLevel: 'Formal',
          punctuationDensity: { '.': 0.8, ',': 0.6, '-': 0.2 }
        }
      },
      characters: {},
      plotPoints: [],
      worldLore: [],
      culturalContext: {
        customs: [],
        idioms: [],
        socialStructures: []
      },
      memoryGraph: [],
      knowledgeGraph: { entities: [], relationships: [], clusters: [] },
      ifState: { flags: {}, relationshipValues: {}, resources: {}, qualities: {}, inventory: [], currentTrajectory: 'Normal' },
      foreshadowing: [],
      multimodalNodes: [],
      plan: { roughOutline: [], chapterSummaries: {}, currentSceneGoal: '', emotionalArcGoal: 'Rise', bottlenecks: [], foldbackPoints: [] },
      emotionalHistory: [],
      rewardHistory: []
    };

    const newSession: ChatSession = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      updatedAt: Date.now(),
      messages: initialMessages,
      storyBible: initialBible
    };

    await storage.saveSession(newSession);
    setSessionsList(await storage.getSessionsList());
    setCurrentSessionId(newId);
    setCurrentSessionTitle('Cuộc trò chuyện mới');
    setMessages(initialMessages);
    setStoryBible(initialBible);
  };

  // Load chat data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      // Migrate legacy data if exists
      const legacyMessages = await storage.loadMessages();
      const legacyBible = await storage.loadStoryBible();
      
      if (legacyMessages && legacyMessages.length > 0) {
        const legacySession: ChatSession = {
          id: crypto.randomUUID(),
          title: 'Cuộc trò chuyện cũ',
          updatedAt: Date.now(),
          messages: legacyMessages,
          storyBible: legacyBible || { 
            authorPersona: { 
              name: 'Default', 
              voiceProfile: '', 
              writingQuirks: [], 
              decisionPatterns: '', 
              culturalBackground: '',
              stylisticDNA: { syntaxComplexity: 0.5, dictionLevel: 'Casual', punctuationDensity: {} }
            },
            characters: {}, 
            plotPoints: [], 
            worldLore: [], 
            culturalContext: { customs: [], idioms: [], socialStructures: [] },
            memoryGraph: [], 
            knowledgeGraph: { entities: [], relationships: [], clusters: [] },
            ifState: { flags: {}, relationshipValues: {}, resources: {}, qualities: {}, inventory: [], currentTrajectory: 'Normal' },
            foreshadowing: [],
            multimodalNodes: [],
            plan: { roughOutline: [], chapterSummaries: {}, currentSceneGoal: '', emotionalArcGoal: '', bottlenecks: [], foldbackPoints: [] },
            emotionalHistory: [],
            rewardHistory: []
          }
        };
        await storage.saveSession(legacySession);
        await storage.clearLegacy();
      }

      const list = await storage.getSessionsList();
      setSessionsList(list);

      if (list.length > 0) {
        const mostRecent = list[0];
        const session = await storage.getSession(mostRecent.id);
        if (session) {
          setCurrentSessionId(session.id);
          setCurrentSessionTitle(session.title);
          setMessages(session.messages || []);
          setStoryBible(session.storyBible || {
            authorPersona: { 
              name: 'Default', 
              voiceProfile: '', 
              writingQuirks: [], 
              decisionPatterns: '', 
              culturalBackground: '',
              stylisticDNA: { syntaxComplexity: 0.5, dictionLevel: 'Casual', punctuationDensity: {} }
            },
            characters: {}, 
            plotPoints: [], 
            worldLore: [], 
            culturalContext: { customs: [], idioms: [], socialStructures: [] },
            memoryGraph: [], 
            knowledgeGraph: { entities: [], relationships: [], clusters: [] },
            ifState: { flags: {}, relationshipValues: {}, resources: {}, qualities: {}, inventory: [], currentTrajectory: 'Normal' },
            foreshadowing: [],
            multimodalNodes: [],
            plan: { roughOutline: [], chapterSummaries: {}, currentSceneGoal: '', emotionalArcGoal: '', bottlenecks: [], foldbackPoints: [] },
            emotionalHistory: [],
            rewardHistory: []
          });
        } else {
          await createNewSession();
        }
      } else {
        await createNewSession();
      }
      setIsInitialized(true);
    };
    loadData();
  }, []);

  // Save chat data to IndexedDB
  useEffect(() => {
    if (isInitialized && currentSessionId) {
      let titleToSave = currentSessionTitle;
      
      // Auto-generate title from first user message if it's default
      if (titleToSave === 'Cuộc trò chuyện mới' && messages.length > 1) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg) {
          titleToSave = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          setCurrentSessionTitle(titleToSave);
        }
      }

      const session: ChatSession = {
        id: currentSessionId,
        title: titleToSave,
        updatedAt: Date.now(),
        messages,
        storyBible
      };

      storage.saveSession(session).then(async () => {
        setSessionsList(await storage.getSessionsList());
      });
    }
  }, [messages, storyBible, isInitialized, currentSessionId, currentSessionTitle]);

  const [aiState, setAiState] = useState<AIState>({
    isThinking: false,
    reasoningText: '',
    activeAgents: ['Orchestrator'],
    currentActionGuidance: ''
  });

  const updateAiState = (isThinking: boolean, reasoningText: string, activeAgents: AgentType[], currentActionGuidance: string) => {
    setAiState({ isThinking, reasoningText, activeAgents, currentActionGuidance });
  };

  const handleNewChat = async () => {
    await createNewSession();
    setIsSidebarOpen(false);
  };

  const handleSelectSession = async (id: string) => {
    if (id === currentSessionId) return;
    const session = await storage.getSession(id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setStoryBible(session.storyBible);
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await storage.deleteSession(id);
    const newList = await storage.getSessionsList();
    setSessionsList(newList);
    
    if (currentSessionId === id) {
      if (newList.length > 0) {
        handleSelectSession(newList[0].id);
      } else {
        await createNewSession();
      }
    }
  };

  const startEditingSession = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const saveEditingSession = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editingSessionId && editingTitle.trim()) {
      const session = await storage.getSession(editingSessionId);
      if (session) {
        session.title = editingTitle.trim();
        session.updatedAt = Date.now();
        await storage.saveSession(session);
        setSessionsList(await storage.getSessionsList());
        if (editingSessionId === currentSessionId) {
          setCurrentSessionTitle(session.title);
        }
      }
    }
    setEditingSessionId(null);
  };

  return (
    <div 
      className="flex h-[100dvh] w-full max-w-[100vw] overflow-hidden font-sans selection:bg-indigo-500/30 relative bg-slate-950"
      style={{ zoom: `${zoomLevel}%` } as React.CSSProperties}
    >
      {/* Background Orbs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Left Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl
        md:relative md:transform-none md:flex md:w-64 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-500/80 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-slate-200">DeepNovel AI</h1>
        </div>
        
        <div className="p-3 shrink-0">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/20 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tạo cuộc trò chuyện mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {sessionsList.map(session => (
            <div 
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm ${
                currentSessionId === session.id 
                  ? 'bg-white/10 text-white' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <MessageSquare className="w-4 h-4 shrink-0" />
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditingSession()}
                      className="flex-1 bg-black/30 border border-indigo-500/50 rounded px-1.5 py-0.5 text-white text-sm outline-none w-full"
                      autoFocus
                    />
                    <button onClick={saveEditingSession} className="p-1 hover:text-emerald-400 text-slate-300">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingSessionId(null)} className="p-1 hover:text-rose-400 text-slate-300">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="truncate">{session.title}</span>
                )}
              </div>
              
              {editingSessionId !== session.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => startEditingSession(e, session.id, session.title)}
                    className="p-1 hover:text-indigo-400 text-slate-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="p-1 hover:text-rose-400 text-slate-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/10 shrink-0">
          <button 
            onClick={() => {
              setIsSettingsOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-slate-300 rounded-xl transition-colors text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            Cài đặt
          </button>
        </div>
      </div>

      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - Chat */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-white/5 backdrop-blur-md shrink-0 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white bg-transparent rounded-lg shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium text-slate-200 drop-shadow-sm truncate">{currentSessionTitle}</h1>
          </div>
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg border border-white/10 shadow-sm shrink-0"
            onClick={() => setIsMobileAIPanelOpen(!isMobileAIPanelOpen)}
          >
            <BrainCircuit className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-hidden relative">
          {isInitialized ? (
            <ChatView 
              messages={messages} 
              setMessages={setMessages} 
              storyBible={storyBible}
              setStoryBible={setStoryBible}
              setAiState={updateAiState} 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Đang tải...
            </div>
          )}
        </div>
      </main>

      {/* Right Panel - Responsive sliding drawer on mobile, fixed on desktop */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-[85%] sm:w-96 transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:flex md:w-96 shrink-0
        ${isMobileAIPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <AIPanel 
          aiState={aiState} 
          storyBible={storyBible} 
          onClose={() => setIsMobileAIPanelOpen(false)} 
        />
      </div>
      
      {/* Mobile Overlay for AI Panel */}
      {isMobileAIPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileAIPanelOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        setApiKeys={setApiKeys}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
    </div>
  );
}





