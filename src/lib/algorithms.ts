import { TextMetrics } from '../types';

/**
 * Algorithmic analysis of generated prose for novel writing.
 */
export const NovelAlgorithms = {
  /**
   * Analyzes the pacing of a given text based on sentence length and structure.
   * Shorter sentences generally indicate faster pacing (action, tension).
   * Longer sentences indicate slower pacing (description, introspection).
   */
  calculatePacing(text: string): 'Chậm' | 'Vừa' | 'Nhanh' {
    if (!text) return 'Vừa';
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 'Vừa';
    
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;

    if (avgWordsPerSentence < 10) return 'Nhanh';
    if (avgWordsPerSentence > 18) return 'Chậm';
    return 'Vừa';
  },

  /**
   * Basic heuristic sentiment analysis for emotional tracking.
   * In a production app, this would use a dedicated NLP model.
   */
  analyzeSentiment(text: string): 'Tiêu cực' | 'Trung tính' | 'Tích cực' {
    if (!text) return 'Trung tính';
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['vui', 'hạnh phúc', 'sáng', 'cười', 'yêu', 'hy vọng', 'chiến thắng', 'đẹp', 'ấm', 'thành công', 'ánh sáng'];
    const negativeWords = ['buồn', 'tối', 'khóc', 'chết', 'đau', 'sợ', 'giận', 'máu', 'lạnh', 'mất', 'tuyệt vọng', 'bóng tối', 'ghét'];
    
    let score = 0;
    const words = lowerText.split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score++;
      if (negativeWords.some(nw => word.includes(nw))) score--;
    });

    if (score > 1) return 'Tích cực';
    if (score < -1) return 'Tiêu cực';
    return 'Trung tính';
  },

  /**
   * Mock coherence scoring based on transition words
   */
  calculateCoherence(text: string): number {
    if (!text) return 0;
    const transitions = ['tuy nhiên', 'do đó', 'hơn nữa', 'trong khi đó', 'đột nhiên', 'bởi vì', 'mặc dù', 'ngoài ra', 'hậu quả là'];
    const lowerText = text.toLowerCase();
    let matches = 0;
    transitions.forEach(t => { if (lowerText.includes(t)) matches++; });
    return Math.min(100, 60 + (matches * 10));
  },

  /**
   * Mock diversity index based on unique words ratio
   */
  calculateDiversity(text: string): number {
    if (!text) return 0;
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words);
    return Math.round((uniqueWords.size / words.length) * 100);
  },

  /**
   * Analyzes the emotional valence of a text on a scale of -1 to 1.
   */
  calculateValence(text: string): number {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    const positiveWords = ['vui', 'hạnh phúc', 'sáng', 'cười', 'yêu', 'hy vọng', 'chiến thắng', 'đẹp', 'ấm', 'thành công', 'ánh sáng', 'tuyệt vời', 'may mắn'];
    const negativeWords = ['buồn', 'tối', 'khóc', 'chết', 'đau', 'sợ', 'giận', 'máu', 'lạnh', 'mất', 'tuyệt vọng', 'bóng tối', 'ghét', 'kinh hoàng', 'tồi tệ'];
    
    let score = 0;
    const words = lowerText.split(/\s+/);
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 0.1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 0.1;
    });
    return Math.max(-1, Math.min(1, score));
  },

  /**
   * Detects if the writing is "stuck" (generic or repetitive).
   */
  detectStuckState(text: string): boolean {
    if (!text) return false;
    const diversity = this.calculateDiversity(text);
    const coherence = this.calculateCoherence(text);
    // If diversity is low and coherence is unusually high/low, it might be "generic"
    return diversity < 30 || (coherence > 95 && text.length > 500);
  },

  /**
   * Generates comprehensive metrics for a piece of text.
   */
  analyzeText(text: string): TextMetrics {
    if (!text) {
      return {
        pacing: 'Vừa',
        sentiment: 'Trung tính',
        wordCount: 0,
        coherenceScore: 0,
        diversityIndex: 0,
        styleDrift: 0,
        emotionalValence: 0,
        readerTrustScore: 50
      };
    }
    const wordCount = text.split(/\s+/).filter(w => w.trim().length > 0).length;
    return {
      pacing: this.calculatePacing(text),
      sentiment: this.analyzeSentiment(text),
      wordCount,
      coherenceScore: this.calculateCoherence(text),
      diversityIndex: this.calculateDiversity(text),
      styleDrift: Math.floor(Math.random() * 20), // Mock style drift for now
      emotionalValence: this.calculateValence(text),
      readerTrustScore: Math.min(100, 40 + (wordCount / 10)) // Heuristic for trust
    };
  },

  /**
   * Knowledge Graph: Extracts entities and relationships from text.
   */
  updateKnowledgeGraph(text: string, currentGraph: any) {
    // In a real app, this would use NER and relationship extraction models.
    // For now, we simulate the logic.
    return currentGraph;
  },

  /**
   * CFPG: Mines foreshadowing triples.
   */
  mineForeshadowing(text: string) {
    // Logic to identify potential foreshadowing triggers
    return [];
  },

  /**
   * IF State Management: Updates flags and values based on narrative events.
   */
  updateIFState(text: string, currentState: any) {
    // Logic to detect state changes in the story
    return currentState;
  },

  /**
   * RLHF Simulation: Calculates a reward score for the generated text.
   */
  calculateReward(text: string, metrics: TextMetrics): number {
    let reward = 0;
    if (metrics.coherenceScore > 80) reward += 20;
    if (metrics.diversityIndex > 40) reward += 20;
    if (metrics.styleDrift < 10) reward += 30;
    if (text.length > 200) reward += 10;
    return reward;
  },

  /**
   * Suggests action guidance (SWAG Framework)
   */
  suggestActionGuidance(context: string): string {
    const actions = [
      "Tăng sự căng thẳng bằng một trở ngại bất ngờ",
      "Đào sâu động cơ của nhân vật thông qua độc thoại nội tâm",
      "Đưa vào một chi tiết dự báo tinh tế",
      "Chuyển nhịp độ sang nhịp điệu nhanh hơn, hướng tới hành động",
      "Tiết lộ một phần kiến thức thế giới một cách tự nhiên qua đối thoại",
      "Tạo ra một khoảnh khắc dễ bị tổn thương cho nhân vật chính",
      "Thêm các chi tiết cảm giác để làm bối cảnh chân thực hơn"
    ];
    return actions[context.length % actions.length];
  }
};
