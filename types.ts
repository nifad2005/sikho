
export enum MaterialType {
  TOPIC = 'topic',
  TEXT = 'text',
  FILE = 'file',
}

export interface LearningMaterial {
  id: string;
  type: MaterialType;
  content: string; // Topic name, pasted text, or file name
  data?: string; // Base64 content for files
  mimeType?: string; // Mime type for files
}

export interface RoadmapTopic {
  title: string;
  description: string;
  completed: boolean;
}

export interface RoadmapModule {
  title: string;
  topics: RoadmapTopic[];
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface LearningContent {
  explanation: string;
  examples: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
