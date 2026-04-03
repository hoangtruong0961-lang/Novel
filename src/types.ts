export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  metrics?: TextMetrics;
  agent?: AgentType;
}

export type AgentType = 
  | 'Orchestrator' 
  | 'Plot Planner' 
  | 'Character Writer' 
  | 'Dialogue Engine' 
  | 'Critic' 
  | 'Consistency Checker' 
  | 'Critique Agent' 
  | 'Cultural Adapter'
  | 'Graph Architect'
  | 'State Manager'
  | 'Foreshadowing Miner'
  | 'Empathy Engine'
  | 'Style Cloner';

export interface TextMetrics {
  pacing: 'Chậm' | 'Vừa' | 'Nhanh';
  sentiment: 'Tiêu cực' | 'Trung tính' | 'Tích cực';
  wordCount: number;
  coherenceScore: number;
  diversityIndex: number;
  styleDrift: number; // 0-100
  emotionalValence: number; // -1 to 1
  readerTrustScore: number; // 0-100
}

export interface AuthorPersona {
  name: string;
  voiceProfile: string; // sentence length, vocabulary, rhythm
  writingQuirks: string[]; // dashes, lists, specific structures
  decisionPatterns: string; // what to describe vs skip
  culturalBackground: string;
  stylisticDNA: {
    syntaxComplexity: number;
    dictionLevel: 'Casual' | 'Formal' | 'Poetic';
    punctuationDensity: Record<string, number>;
  };
}

export interface CharacterPsychology {
  mbti?: string;
  zodiac?: string;
  emotionalWounds: string[];
  internalConflicts: string[];
  unconsciousPatterns: string[]; // behaviors under pressure
  coreValues: string[];
  affectiveEmpathy: number; // 0-1
  cognitiveEmpathy: number; // 0-1
}

export interface KnowledgeGraph {
  entities: Array<{
    id: string;
    name: string;
    type: 'Character' | 'Location' | 'Item' | 'Concept';
    attributes: Record<string, any>;
  }>;
  relationships: Array<{
    source: string;
    target: string;
    type: string;
    strength: number; // 0-1
  }>;
  clusters: Array<{
    name: string;
    entities: string[];
  }>;
}

export interface IFState {
  flags: Record<string, boolean>;
  relationshipValues: Record<string, number>;
  resources: Record<string, number>;
  qualities: Record<string, string>;
  inventory: string[];
  currentTrajectory: string; // Experience Manager output
}

export interface ForeshadowingPayoff {
  id: string;
  foreshadow: string;
  trigger: string;
  payoff: string;
  status: 'Pending' | 'Triggered' | 'Resolved';
  causalPredicate: string; // Executable causal logic
}

export interface MultimodalNode {
  id: string;
  type: 'Text' | 'Audio' | 'Image' | 'Video';
  content: string; // URL or text
  metadata: Record<string, any>;
  connections: string[]; // IDs of other nodes
}

export interface MemoryNode {
  id: string;
  type: 'character' | 'event' | 'relationship' | 'lore';
  content: string;
  importance: number; // 0-1, decays over time (Ebbinghaus)
  lastAccessed: number;
}

export interface HierarchicalPlan {
  roughOutline: string[];
  chapterSummaries: Record<string, string>;
  currentSceneGoal: string;
  emotionalArcGoal: string;
  bottlenecks: string[]; // Fixed plot points in IF
  foldbackPoints: string[]; // Convergence points
}

export interface StoryBible {
  authorPersona: AuthorPersona;
  characters: Record<string, { description: string; psychology: CharacterPsychology }>;
  plotPoints: string[];
  worldLore: string[];
  culturalContext: {
    customs: string[];
    idioms: string[];
    socialStructures: string[];
  };
  memoryGraph: MemoryNode[];
  knowledgeGraph: KnowledgeGraph;
  ifState: IFState;
  foreshadowing: ForeshadowingPayoff[];
  multimodalNodes: MultimodalNode[];
  plan: HierarchicalPlan;
  emotionalHistory: number[]; // sequence of valence scores
  rewardHistory: number[]; // RLHF simulation
}

export interface AIState {
  isThinking: boolean;
  reasoningText: string;
  activeAgents: AgentType[];
  currentActionGuidance: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
  storyBible: StoryBible;
}

export interface SessionSummary {
  id: string;
  title: string;
  updatedAt: number;
}




