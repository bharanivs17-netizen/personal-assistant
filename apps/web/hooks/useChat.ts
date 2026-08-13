import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@partner/shared';
import { getMemoryContextString } from '@/utils/memoryManager';

interface UseChatProps {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  onToolCall?: (toolName: string, args: any) => Promise<any>;
}

export function useChat({ onChunk, onComplete, onError, onToolCall }: UseChatProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 1. Cancellation Ref
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 3. Simple Safe Cache (Max 50 items)
  const responseCacheRef = useRef<Map<string, string>>(new Map());
  
  const generateResponse = useCallback(async (text: string, enableSearch: boolean = false) => {
    setIsGenerating(true);
    
    // Create the user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMsg]);
    
    // Create placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    let stepCount = 0;
    const MAX_TOOL_STEPS = 5;
    
    // Create a local history array that we can append to during the loop
    let currentHistory = [...messages];
    let latestMessage = text;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const cacheKey = enableSearch ? null : text.trim().toLowerCase();
      if (cacheKey && responseCacheRef.current.has(cacheKey)) {
         const cachedResponse = responseCacheRef.current.get(cacheKey)!;
         console.log(`[PARTNER][PERF] Cache hit for "${text}"`);
         
         const aiMsgId = Date.now().toString();
         setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text } as ChatMessage, { id: aiMsgId, role: 'assistant', content: cachedResponse } as ChatMessage]);
         
         if (onChunk) onChunk(cachedResponse);
         setIsGenerating(false);
         if (onComplete) onComplete(cachedResponse);
         return;
      }

      const reqStartTime = Date.now();
      const aiMsgId = (Date.now() + 1).toString();

      setMessages(prev => {
        currentHistory = [...prev, { id: Date.now().toString(), role: 'user', content: text } as ChatMessage];
        return [...currentHistory, { id: aiMsgId, role: 'assistant', content: '' } as ChatMessage];
      });
      
      while (stepCount < MAX_TOOL_STEPS) {
        stepCount++;
        if (stepCount > 1) {
           console.log(`[PARTNER][AGENT] Planning started (Step ${stepCount})`);
        }

        const trimmedHistory = currentHistory.slice(-6);

        const response = await fetch(`/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: latestMessage,
            history: trimmedHistory,
            enableSearch,
            memoryContext: getMemoryContextString()
          }),
          signal: controller.signal
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
        
        const normalizeAIResponse = (res: any) => {
          let text = '';
          if (res && res.text) {
            text = typeof res.text === 'string' ? res.text : String(res.text);
          }
          text = text.replace(/undefined/gi, '').replace(/null/gi, '').replace(/\[object Object\]/g, '').trim();
          return { text };
        };

        const answer = normalizeAIResponse(data);
        let toolCalls = data.toolCalls || [];
        
        if (!answer.text && toolCalls.length === 0) {
          throw new Error("Sorry, I couldn't generate a response. Please try again.");
        }
        
        const responseText = answer.text || "Executing action...";

        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, content: responseText } 
              : msg
          )
        );

        if (toolCalls.length > 0 && onToolCall) {
           console.log("[PARTNER][AGENT] Tool selected:", toolCalls[0].name);
           let toolResult = '';
           try {
              const startToolTime = Date.now();
              console.log("[PARTNER][AGENT] Tool execution started");
              
              const resultObj = await onToolCall(toolCalls[0].name, toolCalls[0].args);
              toolResult = JSON.stringify(resultObj || { success: true });
              
              console.log(`[PARTNER][AGENT] Tool execution completed: ${Date.now() - startToolTime} ms`);
           } catch (e: any) {
              console.log("[PARTNER][AGENT] Tool execution failed");
              toolResult = JSON.stringify({ success: false, error: e.message || 'Tool failed' });
           }
           
           currentHistory.push({ role: 'assistant', content: responseText, id: Date.now().toString() } as ChatMessage);
           latestMessage = `Tool result for ${toolCalls[0].name}: ${toolResult}`;
           
           continue; 
        }

        if (!enableSearch && toolCalls.length === 0 && stepCount === 1) {
           if (responseCacheRef.current.size >= 50) {
              const firstKey = responseCacheRef.current.keys().next().value;
              if (firstKey) responseCacheRef.current.delete(firstKey);
           }
           if (cacheKey) responseCacheRef.current.set(cacheKey, responseText);
        }

        if (onChunk) onChunk(responseText);
        setIsGenerating(false);
        
        if (abortControllerRef.current === controller) {
           abortControllerRef.current = null;
        }

        console.log(`[PARTNER][PERF] Response completed: ${Date.now() - reqStartTime} ms`);
        console.log("[PARTNER][AGENT] Final response generated");
        
        if (onComplete) {
          onComplete(responseText);
        }
        break; 
      }
      
      if (stepCount >= MAX_TOOL_STEPS) {
         throw new Error("Sorry, I couldn't complete that task in time.");
      }
      clearTimeout(timeoutId);
    } catch (err: any) {
      if (err.name === 'AbortError') {
         console.warn('[PARTNER] Request cancelled by newer command');
         // DO NOT call onError or setIsGenerating(false) globally since a new request is taking over.
         return;
      }
      
      const friendlyError = err instanceof Error ? err : new Error(String(err));
      // Log as a string to prevent Next.js dev overlay from capturing the Error object
      console.warn('[Partner] Chat request failed:', friendlyError.message);
      setIsGenerating(false);
      
      let finalError = friendlyError;
      
      // Handle network 'Failed to fetch' errors specifically
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        finalError = new Error('Unable to connect to the Partner backend.');
      } else if (err.name === 'AbortError') {
        finalError = new Error("Partner AI service timed out.");
      }
      
      // Update the AI message to show the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, content: finalError.message } 
            : msg
        )
      );
      
      if (abortControllerRef.current) {
         abortControllerRef.current = null;
      }
      
      if (onError) {
        onError(finalError);
      }
    }
  }, [messages, onChunk, onComplete, onError]);
  
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isGenerating,
    generateResponse,
    clearHistory
  };
}
