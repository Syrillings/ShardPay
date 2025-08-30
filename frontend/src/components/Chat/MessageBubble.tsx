import { useState } from 'react';
import { User, Bot, ThumbsUp, Heart, Smile } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Message } from '../../types';
import { LinePlaceholder } from '../Charts/LinePlaceholder';

interface MessageBubbleProps {
  message: Message;
  onReaction: (emoji: string) => void;
}

export const MessageBubble = ({ message, onReaction }: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.role === 'user';

  const reactions = ['👍', '❤️', '😊', '🔥', '💯'];

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <Card 
          variant={isUser ? 'elevated' : 'default'}
          className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-card'} animate-fade-in`}
          padding="sm"
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Chart placeholder for AI messages */}
          {!isUser && message.chartData && (
            <div className="mt-4">
              <LinePlaceholder 
                title={message.chartData.title}
                description="AI-generated chart placeholder"
              />
            </div>
          )}
        </Card>

        {/* Timestamp and Reactions */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {!isUser && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReactions(!showReactions)}
                className="text-xs h-6 px-2"
              >
                <Smile className="w-3 h-3 mr-1" />
                React
              </Button>
              
              {showReactions && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg p-2 flex gap-1 shadow-elevated z-10 animate-fade-in">
                  {reactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(emoji);
                        setShowReactions(false);
                      }}
                      className="hover:bg-muted rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Existing Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((emoji, index) => (
              <span 
                key={index}
                className="text-xs bg-muted px-2 py-1 rounded-full hover:bg-muted/80 cursor-pointer transition-colors"
                onClick={() => onReaction(emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
