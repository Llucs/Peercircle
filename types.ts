
export interface Message {
  id: string;
  sender: 'me' | 'peer' | 'system' | 'ai';
  text: string;
  timestamp: number;
}

export interface ChatState {
  peerId: string | null;
  remotePeerId: string | null;
  isConnected: boolean;
  messages: Message[];
}

export enum AppScreen {
  SETUP = 'setup',
  CHAT = 'chat'
}
