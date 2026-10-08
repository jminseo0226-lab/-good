export interface DebateTopic {
  id: string;
  title: string;
  subtitle: string;
  curriculumRef: string;
  question: string;
  stanceA: {
    label: string;
    description: string;
    keyScholar: string;
    keyPaper: string;
  };
  stanceB: {
    label: string;
    description: string;
    keyScholar: string;
    keyPaper: string;
  };
  sources: HistoricalSource[];
}

export interface HistoricalSource {
  id: string;
  title: string;
  category: '사료 원문' | '고고학 유물' | '학술 논문';
  dateOrPeriod: string;
  content: string;
  significance: string;
  inquiryTip: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  stance: string;
  avatarText: string;
  shortDesc: string;
  keyArguments: string[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  personaId?: string;
  sourceNote?: string;
}

export interface DiagnosisResult {
  logicScore: number;
  strength: string;
  vulnerability: string;
  evidenceCheck: string;
  reflectionQuestion: string;
  metacognitionTip: string;
}

export interface DebateBrief {
  title: string;
  stanceSummary: string;
  arguments: {
    point: string;
    explanation: string;
  }[];
  anticipatedRebuttal: string;
  counterRebuttal: string;
  closing: string;
}

export interface TextbookPage {
  unitTitle: string;
  sectionTitle: string;
  bodyParagraphs: string[];
  sourceSpotlight: {
    title: string;
    content: string;
  };
  inquiryQuestion: string;
}

export interface PromptLogEntry {
  timestamp: string;
  module: string;
  prompt: string;
  response: string;
  userCritique?: string;
}
