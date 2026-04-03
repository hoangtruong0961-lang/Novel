import React from 'react';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: { deepseek: string; gemini: string };
  setApiKeys: React.Dispatch<React.SetStateAction<{ deepseek: string; gemini: string }>>;
  activeModel: 'deepseek' | 'gemini';
  setActiveModel: React.Dispatch<React.SetStateAction<'deepseek' | 'gemini'>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKeys,
  setApiKeys,
  activeModel,
  setActiveModel,
  zoomLevel,
  setZoomLevel
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-lg font-semibold text-white">Cài đặt</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200">Mô hình AI</label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModel('gemini')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  activeModel === 'gemini' 
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                Gemini
              </button>
              <button
                onClick={() => setActiveModel('deepseek')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  activeModel === 'deepseek' 
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                DeepSeek
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Gemini API Key</label>
              <input
                type="password"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="Nhập Gemini API Key..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">DeepSeek API Key</label>
              <input
                type="password"
                value={apiKeys.deepseek}
                onChange={(e) => setApiKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                placeholder="Nhập DeepSeek API Key..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              />
            </div>
          </div>

          {/* Zoom Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">Thu phóng giao diện</label>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">{zoomLevel}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
