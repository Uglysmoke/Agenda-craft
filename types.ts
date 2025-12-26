
export interface Stakeholder {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface AgendaTopic {
  title: string;
  description: string;
  durationMinutes: number;
  presenter: string;
  audioNoteUrl?: string;
}

export interface MeetingAgenda {
  title: string;
  date: string;
  startTime: string;
  stakeholders: Stakeholder[];
  topics: AgendaTopic[];
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FileData {
  name: string;
  type: string;
  content: string; // Base64 or plain text
}

export interface User {
  email: string;
  password?: string;
}

export interface AuthSession {
  user: User;
  rememberMe: boolean;
}
