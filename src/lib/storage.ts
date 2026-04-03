import { get, set, del } from 'idb-keyval';
import { ChatMessage, StoryBible, ChatSession, SessionSummary } from '../types';

const SESSIONS_LIST_KEY = 'deepnovel_sessions_list';

export const storage = {
  async getSessionsList(): Promise<SessionSummary[]> {
    return (await get(SESSIONS_LIST_KEY)) || [];
  },

  async saveSessionsList(list: SessionSummary[]) {
    await set(SESSIONS_LIST_KEY, list);
  },

  async getSession(id: string): Promise<ChatSession | undefined> {
    return await get(`session_${id}`);
  },

  async saveSession(session: ChatSession) {
    await set(`session_${session.id}`, session);
    const list = await this.getSessionsList();
    const existingIndex = list.findIndex(s => s.id === session.id);
    const summary: SessionSummary = { id: session.id, title: session.title, updatedAt: session.updatedAt };
    if (existingIndex >= 0) {
      list[existingIndex] = summary;
    } else {
      list.push(summary);
    }
    list.sort((a, b) => b.updatedAt - a.updatedAt);
    await this.saveSessionsList(list);
  },

  async deleteSession(id: string) {
    await del(`session_${id}`);
    const list = await this.getSessionsList();
    await this.saveSessionsList(list.filter(s => s.id !== id));
  },

  // Legacy methods for backward compatibility during migration
  async loadMessages(): Promise<ChatMessage[] | undefined> {
    return await get('deepnovel_messages');
  },
  async loadStoryBible(): Promise<StoryBible | undefined> {
    return await get('deepnovel_story_bible');
  },
  async clearLegacy() {
    await del('deepnovel_messages');
    await del('deepnovel_story_bible');
  }
};
