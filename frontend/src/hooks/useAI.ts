import { useState, useCallback } from 'react';
import { Message, SplitParticipant } from '../types';

const FINANCIAL_PROMPT_PREFIX = `You are a helpful financial assistant for ShardPay. 
Provide concise, actionable financial advice. If the query is not financial, politely decline.
Focus on: budgeting, saving, investments, and personal finance. Your responses should have 
no * characters in them. Ask follow up questions and keep the conversations interesting
Current date: ${new Date().toISOString().split('T')[0]}

User: `;

export const useAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hi! I'm your Shard, your AI assistant. I can help with spending insights, savings tips, and payment suggestions. What would you like to know? 🚀",
      timestamp: new Date(Date.now() - 300000),
      reactions: ['👍', '🔥','❤'],
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: FINANCIAL_PROMPT_PREFIX + prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process your request at the moment. Please try again later.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      return aiResponse;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "There's trouble connecting to the financial assistant. Please check your connection and try again.",
        timestamp: new Date(),
       // isError: true
      };
      
      setMessages(prev => [...prev, errorResponse]);
      return errorResponse;
    } finally {
      setIsTyping(false);
    }
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        return {
          ...msg,
          reactions: reactions.includes(emoji) 
            ? reactions.filter(r => r !== emoji)
            : [...reactions, emoji]
        };
      }
      return msg;
    }));
  }, []);

  const parseReceipt = useCallback(async (receiptText: string, participantNames: string[]) => {
    try {
      setIsTyping(true);
      const prompt = `Parse this receipt and split the bill fairly based on who had what. 
      Receipt: ${receiptText}
      
      People splitting the bill: ${participantNames.join(', ')}
      
      Return a JSON object with this structure:
      {
        "totalAmount": number,
        "participants": [
          {
            "name": string,
            "share": number,
            "reasoning": string
          }
        ]
      }
      
      Rules:
      - If someone had multiple items/rounds, their share should reflect that (e.g., if Sule had 2 drinks and others had 1, Sule's share should be 2)
      - The total of all shares should equal the total number of items/rounds
      - If the receipt mentions specific items for specific people, account for that
      - If the receipt mentions a tip or tax, include it in the total amount
      - If any information is unclear, make reasonable assumptions and explain in the reasoning
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Try to parse the AI response as JSON
      try {
        const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || 
                        aiText.match(/```\n([\s\S]*?)\n```/) || 
                        [null, aiText];
        
        const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return {
          totalAmount: parsedData.totalAmount,
          participants: parsedData.participants
        };
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('Could not parse the receipt. Please try again or enter the details manually.');
      }
    } catch (error) {
      console.error('Error parsing receipt:', error);
      throw error;
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    setIsTyping, // Expose the setter directly
    sendMessage,
    addReaction,
    parseReceipt,
  };
};