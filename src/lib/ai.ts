import { GoogleGenAI } from '@google/genai';
import { StoryBible, AgentType, MemoryNode } from '../types';

function getSettings() {
  try {
    const savedKeys = localStorage.getItem('deepnovel_api_keys');
    const savedModel = localStorage.getItem('deepnovel_active_model');
    const apiKeys = savedKeys ? JSON.parse(savedKeys) : { deepseek: '' };
    const activeModel = savedModel || 'deepseek-chat';
    return { apiKeys, activeModel };
  } catch (e) {
    return { apiKeys: { deepseek: '' }, activeModel: 'deepseek-chat' };
  }
}

/**
 * Fetches available DeepSeek models using the provided API key.
 */
export async function fetchDeepSeekModels(apiKey: string): Promise<string[]> {
  if (!apiKey) return [];
  try {
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.data.map((m: any) => m.id);
    }
    return ['deepseek-chat', 'deepseek-reasoner']; // Fallback
  } catch (e) {
    console.error("Error fetching models:", e);
    return ['deepseek-chat', 'deepseek-reasoner'];
  }
}

/**
 * Simulates DeepSeek R1 (Reasoning Model) with Multi-Agent Orchestration
 */
export async function* callReasoningModelStream(prompt: string, systemInstruction?: string, activeAgents: AgentType[] = ['Orchestrator']) {
  const { apiKeys, activeModel } = getSettings();
  const agentsStr = activeAgents.join(', ');
  const fullPrompt = `You are a Multi-Agent Novel Writing System (simulating DeepSeek R1). 
Active Agents: ${agentsStr}

CORE ENGINES TO SIMULATE:
1. Author Persona Engine: Maintain a consistent voice, quirks, and decision patterns. Use Stylistic DNA (syntax complexity, diction, punctuation).
2. Show, Don't Tell Engine: Convert direct descriptions into subtext, implications, and sensory details.
3. Human-like Writing Process: Simulate a Draft-Revise-Edit loop. Use [XXX] for research placeholders.
4. Deep Psychology Engine: Ensure characters act according to their MBTI, wounds, and unconscious patterns. Use Affective vs Cognitive Empathy.
5. Writer's Block Handler: If the scene feels generic, pivot creatively or refocus on sensory details.
6. Cultural Context Engine: Use localized idioms and customs; avoid Westernization.
7. Self-Editing Loop: Critique your own drafts for style drift and AI-isms.
8. Dynamic Emotional Arc: Track and balance the emotional valence of the scene.
9. Reader Trust Engine: Omit unnecessary explanations; trust the reader to infer.
10. Writing Ritual Simulation: Focus on session goals and warm-up routines.
11. Knowledge Graph (GraphRAG): Maintain entity-relationship graphs and semantic clusters for world-building.
12. CFPG (Foreshadowing-Payoff): Mine Foreshadow-Trigger-Payoff triples and use causal predicates.
13. IF State Management: Track plot flags, relationship values, resources, and qualities.
14. Diffusion-LM Simulation: Use non-autoregressive refinement for iterative denoising of prose.
15. RLHF Simulation: Optimize output based on a simulated Reward Model for narrative quality.

You MUST ALWAYS think step-by-step and enclose your entire reasoning process within <thinking> and </thinking> tags.
Inside the thinking tags, explicitly show how the different agents (Plot Planner, Character Writer, Graph Architect, State Manager, Foreshadowing Miner, etc.) are collaborating.
After the </thinking> tag, provide your final structured output.

${systemInstruction ? `System Instruction: ${systemInstruction}\n\n` : ''}
User Request:
${prompt}`;

  try {
    const apiKey = apiKeys.deepseek;
    if (!apiKey) throw new Error('DeepSeek API key is missing.');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemInstruction || 'You are a helpful assistant.' },
          { role: 'user', content: fullPrompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    
    if (reader) {
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              const reasoning = data.choices[0]?.delta?.reasoning_content || '';
              
              if (reasoning) {
                yield `<thinking>${reasoning}</thinking>`;
              } else if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error calling reasoning model:", error);
    yield "Lỗi khi tạo phản hồi. Vui lòng kiểm tra API key và thử lại.";
  }
}

export function parseReasoningOutput(text: string) {
  const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const reasoning = thinkingMatch ? thinkingMatch[1].trim() : '';
  
  let output = text;
  if (thinkingMatch) {
    output = text.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
  } else if (text.includes('<thinking>')) {
    // Handle incomplete thinking tags
    output = text.replace(/<thinking>[\s\S]*/, '').trim();
  }

  return { reasoning, output };
}

/**
 * Background Algorithm: Automatically extracts and updates the Story Bible and Memory Graph.
 * Implements Temporal Knowledge Graphs and Hierarchical Expansion.
 */
export async function extractStoryBible(chatHistory: string, currentBible: StoryBible): Promise<StoryBible> {
  const { apiKeys, activeModel } = getSettings();
  const prompt = `
    Analyze the following novel-writing chat history and the current Story Bible.
    Extract any NEW or UPDATED information to maintain a Memory-Augmented Architecture.
    
    Current Story Bible:
    ${JSON.stringify(currentBible, null, 2)}
    
    Recent Chat History:
    ${chatHistory}
    
    Return ONLY a raw JSON object matching this exact structure (no markdown, no explanations):
    {
      "authorPersona": { 
        "name": "string", 
        "voiceProfile": "string", 
        "writingQuirks": ["string"], 
        "decisionPatterns": "string", 
        "culturalBackground": "string",
        "stylisticDNA": { "syntaxComplexity": 0.7, "dictionLevel": "Formal", "punctuationDensity": { ".": 0.8 } }
      },
      "characters": { 
        "Character Name": { 
          "description": "string", 
          "psychology": { 
            "mbti": "string", 
            "emotionalWounds": ["string"], 
            "internalConflicts": ["string"], 
            "unconsciousPatterns": ["string"],
            "coreValues": ["string"],
            "affectiveEmpathy": 0.5,
            "cognitiveEmpathy": 0.5
          } 
        } 
      },
      "plotPoints": ["string"],
      "worldLore": ["string"],
      "culturalContext": { "customs": ["string"], "idioms": ["string"], "socialStructures": ["string"] },
      "knowledgeGraph": {
        "entities": [{ "id": "string", "name": "string", "type": "Character|Location|Item|Concept", "attributes": {} }],
        "relationships": [{ "source": "id", "target": "id", "type": "string", "strength": 0.5 }],
        "clusters": [{ "name": "string", "entities": ["id"] }]
      },
      "ifState": {
        "flags": { "flag_name": true },
        "relationshipValues": { "char_id": 50 },
        "resources": { "gold": 100 },
        "qualities": { "reputation": "Hero" },
        "inventory": ["item_id"],
        "currentTrajectory": "string"
      },
      "foreshadowing": [{ "id": "string", "foreshadow": "string", "trigger": "string", "payoff": "string", "status": "Pending", "causalPredicate": "string" }],
      "multimodalNodes": [{ "id": "string", "type": "Text|Audio|Image|Video", "content": "string", "metadata": {}, "connections": ["id"] }],
      "memoryGraph": [
        { "id": "unique_id", "type": "character|event|relationship|lore", "content": "fact", "importance": 1, "lastAccessed": 1234567890 }
      ],
      "plan": {
        "roughOutline": ["string"],
        "chapterSummaries": { "Chapter 1": "string" },
        "currentSceneGoal": "string",
        "emotionalArcGoal": "string",
        "bottlenecks": ["string"],
        "foldbackPoints": ["string"]
      },
      "emotionalHistory": [number],
      "rewardHistory": [number]
    }
  `;

  try {
    const apiKey = apiKeys.deepseek;
    if (!apiKey) throw new Error('DeepSeek API key is missing.');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: activeModel.includes('reasoner') ? 'deepseek-chat' : activeModel, // Use chat model for extraction as it's faster/cheaper
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content.trim());
        return {
          authorPersona: parsed.authorPersona || currentBible.authorPersona,
          characters: parsed.characters || currentBible.characters,
          plotPoints: parsed.plotPoints || currentBible.plotPoints,
          worldLore: parsed.worldLore || currentBible.worldLore,
          culturalContext: parsed.culturalContext || currentBible.culturalContext,
          knowledgeGraph: parsed.knowledgeGraph || currentBible.knowledgeGraph,
          ifState: parsed.ifState || currentBible.ifState,
          foreshadowing: parsed.foreshadowing || currentBible.foreshadowing,
          multimodalNodes: parsed.multimodalNodes || currentBible.multimodalNodes,
          memoryGraph: parsed.memoryGraph || currentBible.memoryGraph || [],
          plan: parsed.plan || currentBible.plan,
          emotionalHistory: parsed.emotionalHistory || currentBible.emotionalHistory || [],
          rewardHistory: parsed.rewardHistory || currentBible.rewardHistory || []
        } as StoryBible;
      }
    }
  } catch (error) {
    console.error("Error extracting story bible:", error);
  }
  
  return currentBible;
}
