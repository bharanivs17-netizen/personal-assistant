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
        
        if (!response.ok) {
          let errMsg = `Server error: ${response.status}`;
          try {
            const errData = await response.json();
            if (response.status === 429 && errData.error?.code === 'QUOTA_EXCEEDED') {
              errMsg = 'Partner is temporarily unavailable because the Gemini API quota has been reached. Please try again later.';
            } else if (errData.error?.message) {
              errMsg = `API ERROR HTTP ${response.status}: ${errData.error.message}`;
            } else if (errData.error) {
              errMsg = `API ERROR HTTP ${response.status}: ${errData.error}`;
            }
          } catch(e) {}
          throw new Error(errMsg);
        }
        
        const data = await response.json();
        const responseText = data.text;

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
      console.error('[Partner] Chat request failed:', err);
      setIsGenerating(false);
      
      let friendlyError = err instanceof Error ? err : new Error(String(err));
      
      // Handle network 'Failed to fetch' errors specifically
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        friendlyError = new Error('Unable to connect to the Partner backend.');
      } else if (err.name === 'AbortError') {
        friendlyError = new Error("Partner AI service timed out.");
      }
      
      // Update the AI message to show the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, content: friendlyError.message } 
            : msg
        )
      );
      
      if (onError) {
        onError(friendlyError);
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
