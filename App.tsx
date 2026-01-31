
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Setup } from './components/Setup';
import { ChatWindow } from './components/ChatWindow';
import { AppScreen, Message, ChatState } from './types';

// Global declaration for PeerJS from script tag
declare var Peer: any;

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SETUP);
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Peer
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id: string) => {
      setPeerId(id);
    });

    peer.on('connection', (conn: any) => {
      connRef.current = conn;
      setupConnection(conn);
      setRemotePeerId(conn.peer);
      setIsConnected(true);
      setScreen(AppScreen.CHAT);
    });

    peer.on('error', (err: any) => {
      console.error(err);
      setError(`Erro no Peer: ${err.type}`);
      setIsConnecting(false);
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const setupConnection = (conn: any) => {
    conn.on('data', (data: any) => {
      if (typeof data === 'string') {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'peer',
          text: data,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    conn.on('open', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setScreen(AppScreen.CHAT);
    });

    conn.on('close', () => {
      setIsConnected(false);
      setError("Conexão encerrada pelo parceiro.");
      setScreen(AppScreen.SETUP);
    });
  };

  const connectToPeer = (id: string) => {
    if (!peerRef.current || !id) return;
    setIsConnecting(true);
    setError(null);
    const conn = peerRef.current.connect(id);
    connRef.current = conn;
    setupConnection(conn);
    setRemotePeerId(id);
  };

  const sendMessage = (text: string) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(text);
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const addSystemMessage = (text: string, sender: 'system' | 'ai' = 'system') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {screen === AppScreen.SETUP ? (
        <Setup 
          myId={peerId} 
          onConnect={connectToPeer} 
          isConnecting={isConnecting}
          error={error}
        />
      ) : (
        <ChatWindow 
          messages={messages} 
          remotePeerId={remotePeerId} 
          onSendMessage={sendMessage}
          onAddSystemMessage={addSystemMessage}
          onDisconnect={() => {
            connRef.current?.close();
            setScreen(AppScreen.SETUP);
          }}
        />
      )}
    </div>
  );
};

export default App;
