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
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          // Exclude the newly added placeholder AI message when sending history
          history: messages,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported by the browser.');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullResponseText = '';
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          // SSE data comes in as lines of "data: {...}\n\n"
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '');
              
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const data = JSON.parse(dataStr);
                
                if (data.error) {
                  throw new Error(data.error);
                }
                
                if (data.text) {
                  fullResponseText += data.text;
                  
                  // Update the AI message content
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMsgId 
                        ? { ...msg, content: fullResponseText } 
                        : msg
                    )
                  );
                  
                  if (onChunk) {
                    onChunk(data.text);
                  }
                }
              } catch (e) {
                // Not JSON, ignore or log
              }
            }
          }
        }
      }
      
      setIsGenerating(false);
      if (onComplete) {
        onComplete(fullResponseText);
      }
      
    } catch (err) {
      console.error('Chat generation error:', err);
      setIsGenerating(false);
      
      // Update the AI message to show the error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, content: "I'm having trouble connecting right now." } 
            : msg
        )
      );
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
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
