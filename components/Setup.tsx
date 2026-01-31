
import React, { useState } from 'react';

interface SetupProps {
  myId: string;
  onConnect: (id: string) => void;
  isConnecting: boolean;
  error: string | null;
}

export const Setup: React.FC<SetupProps> = ({ myId, onConnect, isConnecting, error }) => {
  const [targetId, setTargetId] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(myId);
    alert('ID copiado!');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl shadow-xl border border-white/50 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Flash P2P Chat</h1>
          <p className="text-gray-500 mt-2">Mensagens diretas, sem servidores centrais.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Seu ID (Compartilhe este)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono truncate">{myId || 'Gerando...'}</code>
              <button 
                onClick={handleCopy}
                disabled={!myId}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gray-50 text-sm text-gray-400">Ou conecte-se a alguém</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ID do Amigo</label>
            <input 
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Cole o ID aqui..."
              className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

          <button 
            onClick={() => onConnect(targetId)}
            disabled={isConnecting || !targetId || !myId}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Conectando...
              </>
            ) : (
              'Iniciar Chat'
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            PeerJS Cloud Ativo
          </div>
          <p className="text-xs text-gray-400 font-medium">Privacidade em 1º lugar</p>
        </div>
      </div>
    </div>
  );
};
