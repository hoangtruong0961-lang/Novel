import React, { useState } from 'react';
import { BrainCircuit, ChevronRight, Loader2, Database, Activity, Users, Map, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIState, StoryBible } from '../types';

interface AIPanelProps {
  aiState: AIState;
  storyBible: StoryBible;
  onClose?: () => void;
}

export function AIPanel({ aiState, storyBible, onClose }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'reasoning' | 'memory' | 'author' | 'psychology' | 'graph' | 'state'>('reasoning');
  const { isThinking, reasoningText, activeAgents, currentActionGuidance } = aiState;

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-2xl border-l border-white/10 flex flex-col shrink-0 shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Động cơ Thuật toán</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-black/20 rounded-lg p-1 border border-white/5 overflow-x-auto no-scrollbar max-w-[200px]">
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                activeTab === 'reasoning' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suy luận
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1 shrink-0 ${
                activeTab === 'memory' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bộ nhớ
            </button>
            <button
              onClick={() => setActiveTab('author')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                activeTab === 'author' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tác giả
            </button>
            <button
              onClick={() => setActiveTab('psychology')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                activeTab === 'psychology' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tâm lý
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                activeTab === 'graph' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đồ thị
            </button>
            <button
              onClick={() => setActiveTab('state')}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                activeTab === 'state' ? 'bg-indigo-500/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trạng thái
            </button>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'reasoning' ? (
            <motion.div
              key="reasoning"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 h-full"
            >
              {(isThinking || reasoningText) ? (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {isThinking ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                          Đang xử lý Đa tác nhân...
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3 h-3 text-indigo-400" />
                          Hoàn thành Suy luận
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {activeAgents.map(agent => (
                        <span key={agent} className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[10px] text-indigo-200">
                          {agent}
                        </span>
                      ))}
                    </div>

                    {currentActionGuidance && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-[10px] text-amber-200 mt-1">
                        <span className="font-semibold">Hướng dẫn SWAG:</span> {currentActionGuidance}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words shadow-inner">
                    {reasoningText || (isThinking ? "Đang khởi tạo quá trình suy nghĩ thuật toán..." : "")}
                    {isThinking && <span className="animate-pulse inline-block ml-1 w-1.5 h-3 bg-indigo-400" />}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-60">
                  <Activity className="w-8 h-8 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300">
                    Thuật toán suy luận AI sẽ xuất hiện ở đây trong quá trình tạo.
                  </p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'memory' ? (
            <motion.div
              key="memory"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 shadow-sm">
                Thuật toán Bộ nhớ Ngữ nghĩa tự động trích xuất và cập nhật Story Bible này từ cuộc trò chuyện của bạn.
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Nhân vật
                </div>
                {Object.keys(storyBible.characters || {}).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(storyBible.characters || {}).map(([name, char]) => (
                      <div key={name} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-sm">
                        <span className="font-medium text-slate-200 text-sm block mb-1">{name}</span>
                        <span className="text-xs text-slate-400">{char?.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa có nhân vật nào được trích xuất.</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                  <Map className="w-4 h-4 text-amber-400" />
                  Cốt truyện
                </div>
                {(storyBible.plotPoints?.length || 0) > 0 ? (
                  <ul className="space-y-2">
                    {storyBible.plotPoints?.map((point, i) => (
                      <li key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-xs text-slate-300 shadow-sm">
                        • {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa có cốt truyện nào được trích xuất.</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                  <Database className="w-4 h-4 text-blue-400" />
                  Thế giới
                </div>
                {(storyBible.worldLore?.length || 0) > 0 ? (
                  <ul className="space-y-2">
                    {storyBible.worldLore?.map((lore, i) => (
                      <li key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-xs text-slate-300 shadow-sm">
                        • {lore}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa có thông tin thế giới nào được trích xuất.</p>
                )}
              </div>

              {(storyBible.emotionalHistory?.length || 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                    <Activity className="w-4 h-4 text-rose-400" />
                    Cung bậc Cảm xúc
                  </div>
                  <div className="h-24 w-full bg-black/20 rounded-xl border border-white/10 p-2 flex items-end gap-1">
                    {storyBible.emotionalHistory?.map((val, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-rose-500/50 rounded-t-sm transition-all hover:bg-rose-500"
                        style={{ height: `${(val + 1) * 50}%` }}
                        title={`Valence: ${val.toFixed(2)}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'author' ? (
            <motion.div
              key="author"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 shadow-sm">
                Cấu hình Persona Tác giả để duy trì sự nhất quán trong văn phong và hơi thở tác phẩm.
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    {storyBible.authorPersona?.name || 'Chưa xác định'}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-300"><span className="text-slate-500 font-medium">Văn phong:</span> {storyBible.authorPersona?.voiceProfile}</p>
                    <p className="text-[11px] text-slate-300"><span className="text-slate-500 font-medium">Quyết định:</span> {storyBible.authorPersona?.decisionPatterns}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {storyBible.authorPersona?.writingQuirks?.map(q => (
                        <span key={q} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 italic">
                          #{q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Map className="w-4 h-4 text-amber-400" />
                    Bối cảnh Văn hóa
                  </h3>
                  <p className="text-[11px] text-slate-300">{storyBible.authorPersona?.culturalBackground}</p>
                  <div className="space-y-2 mt-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Thành ngữ & Phong tục:</p>
                    <div className="flex flex-wrap gap-1">
                      {storyBible.culturalContext?.idioms?.map(i => (
                        <span key={i} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-200">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'graph' ? (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 shadow-sm">
                Đồ thị Tri thức (GraphRAG) theo dõi các thực thể và mối quan hệ phức tạp trong thế giới truyện.
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Thực thể & Phân cụm</h3>
                  <div className="flex flex-wrap gap-2">
                    {storyBible.knowledgeGraph?.entities?.map(e => (
                      <div key={e.id} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-300">
                        <span className="text-indigo-400 font-bold">{e.type[0]}:</span> {e.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Mối quan hệ</h3>
                  <div className="space-y-1">
                    {storyBible.knowledgeGraph?.relationships?.map((r, i) => (
                      <div key={i} className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="text-slate-200">{r.source}</span>
                        <ChevronRight className="w-2 h-2" />
                        <span className="text-indigo-300">[{r.type}]</span>
                        <ChevronRight className="w-2 h-2" />
                        <span className="text-slate-200">{r.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'state' ? (
            <motion.div
              key="state"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 shadow-sm">
                Quản lý Trạng thái Tương tác (IF State) theo dõi các biến số và quỹ đạo của câu chuyện.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Cờ Cốt truyện</h3>
                  <div className="space-y-1">
                    {Object.entries(storyBible.ifState?.flags || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{k}</span>
                        <span className={v ? 'text-emerald-400' : 'text-slate-600'}>{v ? 'ON' : 'OFF'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Quan hệ</h3>
                  <div className="space-y-1">
                    {Object.entries(storyBible.ifState?.relationshipValues || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{k}</span>
                        <span className="text-amber-400">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Gợi ý & Kết quả (CFPG)</h3>
                <div className="space-y-2">
                  {storyBible.foreshadowing?.map(f => (
                    <div key={f.id} className="p-2 bg-white/5 rounded border border-white/5 text-[10px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-indigo-300 font-bold">#{f.id}</span>
                        <span className={`px-1 rounded ${f.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-slate-400 italic">"{f.foreshadow}"</p>
                      {f.status === 'Resolved' && <p className="text-slate-200 mt-1">→ {f.payoff}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="psychology"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
               <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 shadow-sm">
                Phân tích tâm lý sâu giúp nhân vật phản ứng nhất quán với bản năng và vết thương tâm lý.
              </div>

              <div className="space-y-4">
                {Object.entries(storyBible.characters || {}).map(([name, char]) => (
                  <div key={name} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{name}</h3>
                      {char?.psychology?.mbti && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] text-emerald-200 font-mono">
                          {char.psychology.mbti}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Vết thương tâm lý:</p>
                        <div className="flex flex-wrap gap-1">
                          {char?.psychology?.emotionalWounds?.map(w => (
                            <span key={w} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] text-rose-200">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mâu thuẫn nội tâm:</p>
                        <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                          {char?.psychology?.internalConflicts?.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Hành vi vô thức:</p>
                        <div className="flex flex-wrap gap-1">
                          {char?.psychology?.unconsciousPatterns?.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-200 italic">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


