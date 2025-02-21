import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/useToast';
import { Brain, MessageSquare, Sparkles, Star, Heart } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const CareCompanionAI: React.FC = () => {
  const { user } = useUser();
  const { location } = useGeolocation();
  const { motion } = useDeviceMotion();
  const { hasPermission } = useNotifications();
  const { toast } = useToast();
  
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [userInput, setUserInput] = React.useState('');
  const [context, setContext] = React.useState<any>({});

  React.useEffect(() => {
    loadContext();
  }, [user]);

  const loadContext = async () => {
    if (!user) return;

    try {
      const [healthData, careProfile, schedule] = await Promise.all([
        healthService.getLatestData(user.id),
        careCompanionService.getCareProfile(user.id),
        careCompanionService.getCareSchedules(user.id, {
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
      ]);

      setContext({
        health: healthData,
        profile: careProfile,
        schedule: schedule
      });

      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello ${user.full_name}! I'm your Care AI Companion. I can help you with:
        • Daily care routines and reminders
        • Health monitoring and insights
        • Emergency assistance
        • Care resources and guidance
        • Emotional support and companionship
        
        How can I assist you today?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error loading context:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some data',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      setIsProcessing(true);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userInput,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');

      // Process with AI
      const response = await fetch('/api/care-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput,
          context: {
            location,
            healthData: context.health,
            careProfile: context.profile,
            schedule: context.schedule
          }
        })
      });

      if (!response.ok) throw new Error('AI processing failed');

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle any actions from AI
      if (data.actions) {
        await handleAIActions(data.actions);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process message',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIActions = async (actions: any[]) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'schedule':
            await careCompanionService.createCareSchedule(action.data);
            toast({
              title: 'Schedule Created',
              description: 'New care schedule has been created'
            });
            break;
          case 'emergency':
            await careCompanionService.performSafetyCheck(user!.id, 'emergency');
            toast({
              title: 'Emergency Alert',
              description: 'Emergency services have been notified',
              variant: 'destructive'
            });
            break;
          case 'reminder':
            await notificationService.scheduleReminder(action.data);
            toast({
              title: 'Reminder Set',
              description: 'You will be notified at the scheduled time'
            });
            break;
          // Add more action handlers
        }
      } catch (error) {
        console.error(`Error handling action ${action.type}:`, error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b bg-background">
        <div className="flex items-center space-x-4">
          <Avatar
            src="/ai-companion.png"
            fallback="AI"
            className="h-10 w-10"
          />
          <div>
            <h2 className="font-semibold">Care AI Companion</h2>
            <p className="text-sm text-muted-foreground">
              Your 24/7 care assistant
            </p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card className={`max-w-[80%] p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 text-sm rounded-md border bg-background resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !userInput.trim()}
          >
            Send
          </Button>
        </div>
      </div>

      <nav className="grid grid-cols-4 gap-1 p-2 border-t bg-background">
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          onClick={() => setUserInput('Help me with my daily care routine')}
        >
          <Star className="h-5 w-5" />
          <span className="text-xs mt-1">Routine</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          onClick={() => setUserInput('How am I doing health-wise?')}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Health</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          onClick={() => setUserInput('I need emotional support')}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Support</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          onClick={() => setUserInput('Give me care tips and resources')}
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs mt-1">Resources</span>
        </Button>
      </nav>
    </div>
  );
};
