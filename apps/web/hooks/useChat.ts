import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@partner/shared';

interface UseChatProps {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useChat({ onChunk, onComplete, onError }: UseChatProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateResponse = useCallback(async (text: string) => {
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
    
    setMessages(prev => [...prev, aiMsg]);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        console.log(`[PARTNER] Gemini request started`);
        const response = await fetch(`/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            // Exclude the newly added placeholder AI message when sending history
            history: messages,
          }),
          signal: controller.signal
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          console.log(`[PARTNER] Gemini error code:`, data.code || response.status);
          let errMsg = `Server error: ${response.status}`;
          
          if (data.code === 'GEMINI_QUOTA_ERROR') {
            errMsg = data.message || 'Gemini quota is currently exhausted. Local PARTNER commands are still available.';
          } else if (data.code === 'GEMINI_MODEL_ERROR') {
            errMsg = data.message || 'The configured Gemini model is unavailable. Please check the Gemini model configuration.';
          } else if (data.code === 'GEMINI_AUTH_ERROR') {
            errMsg = data.message || 'Gemini authentication failed. Please check the server API key.';
          } else if (data.code === 'GEMINI_NETWORK_ERROR') {
            errMsg = data.message || 'PARTNER could not connect to Gemini.';
          } else if (data.message) {
            errMsg = `API ERROR HTTP ${response.status}: ${data.message}`;
          }
          
          throw new Error(errMsg);
        }
        
        const responseText = data.text;
        console.log(`[PARTNER] Gemini response received`);

        if (!responseText || !responseText.trim()) {
          throw new Error("Empty Gemini response");
        }

        // Update the AI message content
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, content: responseText } 
              : msg
          )
        );

        if (onChunk) onChunk(responseText);
        setIsGenerating(false);

        if (onComplete) {
          onComplete(responseText);
        }
      } finally {
        clearTimeout(timeoutId);
      }
      
    } catch (err: any) {
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
