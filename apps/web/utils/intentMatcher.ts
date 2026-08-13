import { OFFLINE_KNOWLEDGE, OfflineIntent } from '../data/offlineKnowledge';
import { SYSTEM_TOOLS, ToolIntent } from '../data/systemTools';

/**
 * Normalizes speech for fuzzy matching
 */
export function normalizeSpeech(text: string): string {
  let normalized = text.toLowerCase().trim();
  
  // Remove punctuation
  normalized = normalized.replace(/[.,?!;:'"]/g, '');
  
  // Remove duplicate spaces
  normalized = normalized.replace(/\s+/g, ' ');

  // Common Tanglish variations mapping
  const variations: Record<string, string> = {
    'ipo': 'ippo',
    'epdi': 'eppadi',
    'kekuriya': 'kekutha',
    'enna': 'enna',
    'panra': 'panra',
    'innaiku': 'innaiki',
    'innaiki': 'innaiku',
    'kizhama': 'kizhamai',
    'yaaru': 'yaar',
    'peru': 'peyar',
    'unga': 'un',
    'mudiyum': 'mudiyum',
    'romba': 'romba',
    'nandri': 'nandri',
    'aprom': 'appuram',
    'pesalam': 'pesalaam',
    'pothum': 'podhum',
    'kekuratha': 'ketpadhai',
    'pesuratha': 'pesuvadhai',
    'vegama': 'fast ah',
    'medhuva': 'slow ah',
    'thirumba': 'again',
    'innoru': 'another',
    'evlo': 'evvalavu',
    'evalo': 'evvalavu',
    'ah': '', // Sometimes used as question tag in Tanglish (e.g., "ready ah")
  };

  // Apply variations (simple word replacement)
  let words = normalized.split(' ');
  words = words.map(w => variations[w] || w);
  normalized = words.join(' ').trim();
  
  return normalized;
}

export type MatchResult = {
  intent: string;
  responseParams?: any;
  isTool?: boolean;
  toolName?: string;
  toolArgs?: any;
} | null;

/**
 * Fuzzy matches normalized text against offline knowledge
 */
export function matchIntent(transcript: string): MatchResult {
  const normalized = normalizeSpeech(transcript);
  
  // 0. Regex-based Query Extraction for dynamic intents
  const youtubeRegexes = [
    /^open\s+youtube(?:\s+and)?(?:\s+(?:play|search(?:\s+for)?))?\s*(.*)$/i,
    /^play\s+(.+?)\s+on\s+youtube$/i,
    /^youtube\s+la\s+(.+?)\s+(?:play\s+)?pannu$/i,
    /^youtube\s+la\s+(.+?)\s+play\s+pannu$/i,
    /^யூடியூப்\s+திறந்து\s+(.+)$/i
  ];
  
  for (const regex of youtubeRegexes) {
    const m = transcript.match(regex) || normalized.match(regex);
    if (m) {
      let query = m[1] ? m[1].trim() : '';
      if (query) {
        query = query.replace(/\s+(play|play pannu|pannu|search|search for)$/i, '').trim();
      }
      return { intent: 'OPEN_YOUTUBE', isTool: true, toolName: 'open_youtube', toolArgs: { query } };
    }
  }

  const searchRegexes = [
    /search web for (.+)/i,
    /search google for (.+)/i,
    /google la (.+) search pannu/i,
    /(.+) பற்றி search pannu/i,
    /(.+) பற்றி தேடு/i
  ];
  for (const regex of searchRegexes) {
    const m = transcript.match(regex) || normalized.match(regex);
    if (m && m[1]) {
      return { intent: 'SEARCH_WEB', isTool: true, toolName: 'search_web', toolArgs: { query: m[1].trim() } };
    }
  }

  const alarmRegexes = [
    /set (?:an )?alarm for (.+)/i,
    /set alarm at (.+)/i,
    /wake me up at (.+)/i,
    /அலாரம் (.+) மணிக்கு வை/i,
    /(.+) மணிக்கு அலாரம் வை/i,
    /alarm (.+) ku vai/i,
    /(.+) ku alarm vai/i
  ];
  for (const regex of alarmRegexes) {
    const m = transcript.match(regex) || normalized.match(regex);
    if (m && m[1]) {
      return { intent: 'SET_ALARM', isTool: true, toolName: 'set_alarm', toolArgs: { time: m[1].trim() } };
    }
  }

  const reminderRegexes = [
    /set (?:a )?reminder to (.+) at (.+)/i,
    /remind me to (.+) at (.+)/i,
    /set (?:a )?reminder for (.+)/i,
    /remind me to (.+)/i
  ];
  for (const regex of reminderRegexes) {
    const m = transcript.match(regex) || normalized.match(regex);
    if (m) {
      if (m[1] && m[2]) {
        return { intent: 'SET_REMINDER', isTool: true, toolName: 'set_reminder', toolArgs: { text: m[1].trim(), time: m[2].trim() } };
      } else if (m[1]) {
        return { intent: 'SET_REMINDER', isTool: true, toolName: 'set_reminder', toolArgs: { text: m[1].trim() } };
      }
    }
  }

  const storyRegexes = [
    /tell me a (?:small |short |kutti )?story(?: in )?(tamil|english)?/i,
    /tell a (?:small |short |kutti )?story(?: in )?(tamil|english)?/i,
    /(?:tamilil |tamil la )?(?:oru )?(?:kutti |siriya )?kadhai sollu/i,
    /oru (?:kutti |siriya )?kadhai sollu/i,
    /(?:தமிழில் )?ஒரு (?:குட்டி|சிறிய|குட்டிக்)? ?கதை சொல்லு/i,
    /கதை சொல்லு/i
  ];
  for (const regex of storyRegexes) {
    const m = transcript.match(regex) || normalized.match(regex);
    if (m) {
      let lang = 'auto';
      if (m[1]) lang = m[1].toLowerCase();
      if (transcript.match(/tamil|தமிழ்|கதை|kadhai/i) || normalized.match(/tamil|kadhai/i)) lang = 'tamil';
      if (transcript.match(/english/i) || normalized.match(/english/i)) lang = 'english';
      return { intent: 'TELL_STORY', responseParams: { lang } };
    }
  }


  // 1. Exact Match - Tools
  for (const tool of SYSTEM_TOOLS) {
    const allPhrases = [
      ...tool.phrases.en,
      ...tool.phrases.ta,
      ...tool.phrases.tanglish,
      ...tool.phrases.mixed
    ].map(p => normalizeSpeech(p));

    if (allPhrases.includes(normalized)) {
      let args: any = {};
      if (tool.intent === 'OPEN_CALCULATOR') args = { appName: 'calculator' };
      if (tool.intent === 'OPEN_NOTEPAD') args = { appName: 'notepad' };
      if (tool.intent === 'OPEN_BROWSER') args = { appName: 'browser' };
      
      return { intent: tool.intent, isTool: true, toolName: tool.toolName, toolArgs: args };
    }
  }

  // 1.5. Exact Match - Offline Knowledge
  for (const knowledge of OFFLINE_KNOWLEDGE) {
    const allPhrases = [
      ...knowledge.phrases.en,
      ...knowledge.phrases.ta,
      ...knowledge.phrases.tanglish,
      ...knowledge.phrases.mixed
    ].map(p => normalizeSpeech(p));

    if (allPhrases.includes(normalized)) {
      return { intent: knowledge.intent };
    }
  }

  // 2. Inclusion / Keyword Match
  // Simple heuristic: If all words of a phrase exist in the transcript in any order, it's a match.
  // We prioritize longer phrases.
  let bestToolMatch: ToolIntent | null = null;
  let bestKnowledgeMatch: OfflineIntent | null = null;
  let maxMatchedWords = 0;

  for (const tool of SYSTEM_TOOLS) {
    const allPhrases = [
      ...tool.phrases.en, ...tool.phrases.ta, ...tool.phrases.tanglish, ...tool.phrases.mixed
    ].map(p => normalizeSpeech(p));

    for (const phrase of allPhrases) {
      const phraseWords = phrase.split(' ');
      const transcriptWords = normalized.split(' ');
      
      const allWordsPresent = phraseWords.every(pw => transcriptWords.includes(pw));
      if (allWordsPresent && phraseWords.length > maxMatchedWords) {
        maxMatchedWords = phraseWords.length;
        bestToolMatch = tool;
        bestKnowledgeMatch = null;
      }
    }
  }

  for (const knowledge of OFFLINE_KNOWLEDGE) {
    const allPhrases = [
      ...knowledge.phrases.en, ...knowledge.phrases.ta, ...knowledge.phrases.tanglish, ...knowledge.phrases.mixed
    ].map(p => normalizeSpeech(p));

    for (const phrase of allPhrases) {
      const phraseWords = phrase.split(' ');
      const transcriptWords = normalized.split(' ');
      
      const allWordsPresent = phraseWords.every(pw => transcriptWords.includes(pw));
      if (allWordsPresent && phraseWords.length > maxMatchedWords) {
        maxMatchedWords = phraseWords.length;
        bestKnowledgeMatch = knowledge;
        bestToolMatch = null;
      }
    }
  }

  if (bestToolMatch && maxMatchedWords >= 2) {
      let args: any = {};
      if (bestToolMatch.intent === 'OPEN_CALCULATOR') args = { appName: 'calculator' };
      if (bestToolMatch.intent === 'OPEN_NOTEPAD') args = { appName: 'notepad' };
      if (bestToolMatch.intent === 'OPEN_BROWSER') args = { appName: 'browser' };
      return { intent: bestToolMatch.intent, isTool: true, toolName: bestToolMatch.toolName, toolArgs: args };
  } else if (bestToolMatch && maxMatchedWords === 1) {
      if (['VOLUME_MUTE', 'VOLUME_UNMUTE'].includes(bestToolMatch.intent)) {
          return { intent: bestToolMatch.intent, isTool: true, toolName: bestToolMatch.toolName };
      }
  }

  if (bestKnowledgeMatch && maxMatchedWords >= 2) {
      return { intent: bestKnowledgeMatch.intent };
  } else if (bestKnowledgeMatch && maxMatchedWords === 1) {
      if (['GREETING', 'THANKS', 'GOODBYE', 'STOP_LISTENING'].includes(bestKnowledgeMatch.intent)) {
          return { intent: bestKnowledgeMatch.intent };
      }
  }
  
  // 3. Calculator check
  if (normalized.includes('plus') || normalized.includes('minus') || 
      normalized.includes('times') || normalized.includes('divided by') ||
      normalized.includes('கூட்டல்') || normalized.includes('கழித்தால்') ||
      normalized.includes('பெருக்கல்') || normalized.includes('வகுத்தால்')) {
      
      const calcResult = parseAndCalculate(normalized);
      if (calcResult !== null) {
          return { intent: 'CALCULATE', responseParams: { result: calcResult } };
      }
  }

  return null;
}

/**
 * Safe calculator
 */
function parseAndCalculate(text: string): number | null {
  // Extract numbers
  const nums = text.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  
  const a = parseFloat(nums[0]);
  const b = parseFloat(nums[1]);
  
  if (text.includes('plus') || text.includes('கூட்டல்')) return a + b;
  if (text.includes('minus') || text.includes('கழித்தால்')) return a - b;
  if (text.includes('times') || text.includes('multiplied by') || text.includes('பெருக்கல்')) return a * b;
  if (text.includes('divided by') || text.includes('divide') || text.includes('வகுத்தால்')) return b !== 0 ? a / b : null;
  
  return null;
}

/**
 * Generates response text for utility intents
 */
export function handleUtilityIntent(intent: string, responseLang: 'english' | 'tamil', params?: any): string {
  const now = new Date();
  
  switch (intent) {
    case 'GET_TIME':
      const timeStr = now.toLocaleTimeString(responseLang === 'tamil' ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      return responseLang === 'tamil' ? `இப்போது மணி ${timeStr}.` : `The current time is ${timeStr}.`;
      
    case 'GET_DATE':
      const dateStr = now.toLocaleDateString(responseLang === 'tamil' ? 'ta-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return responseLang === 'tamil' ? `இன்று ${dateStr}.` : `Today is ${dateStr}.`;
      
    case 'GET_DAY':
      const dayStr = now.toLocaleDateString(responseLang === 'tamil' ? 'ta-IN' : 'en-US', { weekday: 'long' });
      return responseLang === 'tamil' ? `இன்று ${dayStr}.` : `Today is ${dayStr}.`;
      
    case 'CALCULATE':
      const res = params?.result;
      return responseLang === 'tamil' ? `இதன் விடை ${res}.` : `The answer is ${res}.`;
      
    case 'ONLINE_STATUS':
      const isOnline = navigator.onLine;
      if (responseLang === 'tamil') {
        return isOnline ? 'ஆம், நான் ஆன்லைனில் இருக்கிறேன்.' : 'இல்லை, நான் ஆஃப்லைனில் இருக்கிறேன்.';
      }
      return isOnline ? 'Yes, I am online.' : 'No, I am currently offline.';
      
    case 'OFFLINE_STATUS':
      const offline = !navigator.onLine;
      if (responseLang === 'tamil') {
        return offline ? 'ஆம், நான் ஆஃப்லைனில் இருக்கிறேன்.' : 'இல்லை, நான் ஆன்லைனில் இருக்கிறேன்.';
      }
      return offline ? 'Yes, I am offline.' : 'No, I am currently online.';
      
    case 'REPEAT':
      // This will be handled upstream in page.tsx if possible, but fallback here
      return responseLang === 'tamil' ? 'மன்னிக்கவும், எதை திரும்ப சொல்ல வேண்டும் என்று தெரியவில்லை.' : 'I am not sure what to repeat.';
      
    default:
      return '';
  }
}

/**
 * Gets a random response from the knowledge base based on selected language
 */
export function getOfflineResponse(intentId: string, responseLang: 'auto' | 'english' | 'tamil', transcript: string): string | null {
  const knowledge = OFFLINE_KNOWLEDGE.find(k => k.intent === intentId);
  if (!knowledge) return null;

  // Determine actual response language if auto
  let actualLang: 'english' | 'tamil' = 'english';
  if (responseLang === 'auto') {
    // Basic heuristic: if transcript has Tamil chars or common tanglish, respond in Tamil
    const hasTamilChars = /[\u0B80-\u0BFF]/.test(transcript);
    const hasTanglish = ['vanakkam', 'ippo', 'enna', 'epdi', 'nandri', 'evlo', 'pannu'].some(w => transcript.toLowerCase().includes(w));
    actualLang = (hasTamilChars || hasTanglish) ? 'tamil' : 'english';
  } else {
    actualLang = responseLang;
  }

  // Handle utility/dynamic intents
  if (knowledge.category === 'utility' || knowledge.intent === 'REPEAT') {
    // (Wait, CALCULATE params need to be handled, but this function is just for static strings. 
    // We will call handleUtilityIntent directly for utility intents from page.tsx)
    return null; 
  }

  const responses = actualLang === 'tamil' ? knowledge.responses.ta : knowledge.responses.en;
  
  if (responses && responses.length > 0) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  return null;
}
