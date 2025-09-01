import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { useAI } from '../hooks/useAI';
import { MessageBubble } from '../components/Chat/MessageBubble';
import { TypingIndicator } from '../components/Chat/TypingIndicator';
import { LinePlaceholder } from '../components/Charts/LinePlaceholder';

export const Chat = () => {
  const { messages, isTyping, sendMessage, addReaction } = useAI();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const messageToSend = inputMessage;
    setInputMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Analyze my spending this month",
    "How can I save more money?",
    "Show me transaction trends",
    "Budget recommendations"
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-4 md:py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            {/* <Sparkles className="mr-3 h-8 w-8 text-primary" /> */}
            Shard AI ✨
          </h1>
          <p className="text-muted-foreground">
            Get personalized insights and spending advice
          </p>
        </div>

        {/* Chat Container */}
        <div className="md:block">
          <Card variant="elevated" className="h-[600px] flex flex-col md:block">
            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onReaction={(emoji) => addReaction(message.id, emoji)}
                />
              ))}
              
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="border-t border-border p-4 md:p-6">
              {/* Quick Prompts */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2 text-muted-foreground">
                  Quick prompts:
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInputMessage(prompt)}
                      className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-3">
                <MyInput
                  placeholder="Ask me anything about your finances..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  variant="glow"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Features */}
        <Card variant="glass" className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Capabilities</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Spending pattern analysis</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💡</span>
                <span>Personalized saving tips</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span>Budget optimization</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⚡</span>
                <span>Real-time transaction insights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};