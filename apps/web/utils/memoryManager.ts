export interface Memory {
  id: string;
  category: 'preference' | 'project' | 'learning' | 'fact';
  key: string;
  value: string;
  createdAt: string;
}

const MEMORY_KEY = 'partner_memory';
const MEMORY_ENABLED_KEY = 'partner_memory_enabled';
const MAX_MEMORIES = 50;

/**
 * Checks if memory is globally enabled
 */
export function isMemoryEnabled(): boolean {
  if (typeof window === 'undefined') return true; // Server-side default
  const val = localStorage.getItem(MEMORY_ENABLED_KEY);
  return val !== 'false';
}

export function setMemoryEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMORY_ENABLED_KEY, enabled ? 'true' : 'false');
  if (!enabled) {
    clearMemories();
  }
}

/**
 * Retrieves all stored memories
 */
export function getMemories(): Memory[] {
  if (typeof window === 'undefined' || !isMemoryEnabled()) return [];
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[PARTNER][MEMORY] Failed to parse memory', e);
    return [];
  }
}

/**
 * Stores a new memory, replacing existing keys
 */
export function saveMemory(category: Memory['category'], key: string, value: string): Memory | null {
  if (typeof window === 'undefined' || !isMemoryEnabled()) return null;
  
  const memories = getMemories();
  
  // Update if exists
  const existingIndex = memories.findIndex(m => m.category === category && m.key === key);
  
  const newMemory: Memory = {
    id: Date.now().toString(),
    category,
    key,
    value,
    createdAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    memories[existingIndex] = newMemory;
  } else {
    memories.push(newMemory);
  }
  
  // Size limit
  if (memories.length > MAX_MEMORIES) {
    memories.shift(); // Remove oldest
  }
  
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
  console.log(`[PARTNER][MEMORY] Saved: ${key} = ${value}`);
  return newMemory;
}

export function deleteMemory(id: string): void {
  if (typeof window === 'undefined') return;
  const memories = getMemories().filter(m => m.id !== id);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
}

export function clearMemories(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEMORY_KEY);
  console.log('[PARTNER][MEMORY] All memories cleared');
}

/**
 * Generates a concise string of relevant memories for the AI prompt
 */
export function getMemoryContextString(): string {
  const memories = getMemories();
  if (memories.length === 0) return '';
  
  return `\nUser Preferences and Memory Facts:\n` + 
         memories.map(m => `- ${m.key}: ${m.value}`).join('\n');
}
