import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { fetchDeepSeekModels } from '../lib/ai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: { deepseek: string };
  setApiKeys: React.Dispatch<React.SetStateAction<{ deepseek: string }>>;
  activeModel: string;
  setActiveModel: React.Dispatch<React.SetStateAction<string>>;
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
  const [models, setModels] = useState<string[]>(['deepseek-chat', 'deepseek-reasoner']);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    if (isOpen && apiKeys.deepseek) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    if (!apiKeys.deepseek) return;
    setIsLoadingModels(true);
    const fetchedModels = await fetchDeepSeekModels(apiKeys.deepseek);
    if (fetchedModels.length > 0) {
      setModels(fetchedModels);
      if (!fetchedModels.includes(activeModel)) {
        setActiveModel(fetchedModels[0]);
      }
    }
    setIsLoadingModels(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-lg font-semibold text-white">Cài đặt DeepNovel</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* API Keys */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">DeepSeek API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys.deepseek}
                  onChange={(e) => setApiKeys({ deepseek: e.target.value })}
                  placeholder="Nhập DeepSeek API Key..."
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                />
                <button 
                  onClick={loadModels}
                  disabled={isLoadingModels || !apiKeys.deepseek}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
                  title="Tải danh sách mô hình"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200">Mô hình DeepSeek</label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none cursor-pointer"
            >
              {models.map(model => (
                <option key={model} value={model} className="bg-slate-900">
                  {model}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 italic">
              * deepseek-reasoner (R1) được khuyến nghị cho các tác vụ suy luận phức tạp.
            </p>
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
