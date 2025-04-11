
import React, { useState, useEffect } from 'react';
import { Send, Bot, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from '@/types/chat';
import { mockCurrentUser } from '@/utils/supabaseHelpers';

export function CareAssistant() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Care Assistant. I can help you with information about patient care, tasks, routines, and updates. How can I assist you today?"
    }
  ]);
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch mock data for development
    fetchData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
    try {
      // Mock data instead of real API calls
      // This simulates fetching data from database
      
      // Mock patient info
      const mockPatientInfo = {
        name: "John Smith",
        age: 72,
        conditions: ["Parkinson's", "Hypertension"],
        medications: ["Levodopa", "Lisinopril"]
      };
      
      // Mock tasks
      const mockTasks = [
        { id: "1", title: "Morning medication", status: "completed" },
        { id: "2", title: "Physical therapy exercises", status: "pending" },
        { id: "3", title: "Doctor appointment", status: "scheduled" }
      ];
      
      // Mock updates
      const mockUpdates = [
        { id: "1", content: "Patient reports feeling better today" },
        { id: "2", content: "Blood pressure reading: 128/82" },
        { id: "3", content: "Completed all morning activities without assistance" }
      ];
      
      // Mock routines
      const mockRoutines = [
        { id: "1", title: "Morning routine", tasks: ["Wake up", "Medication", "Breakfast"] },
        { id: "2", title: "Evening routine", tasks: ["Dinner", "Medication", "Reading"] },
      ];
      
      setPatientInfo(mockPatientInfo);
      setTasks(mockTasks);
      setUpdates(mockUpdates);
      setRoutines(mockRoutines);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load care information",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: "user", content: input.trim() }
    ]);
    
    const userQuery = input.trim();
    setInput('');
    setIsLoading(true);
    
    try {
      // Process the query
      setTimeout(() => {
        let responseContent = "";
        
        // Simple pattern matching for the demo
        const lowerQuery = userQuery.toLowerCase();
        
        if (lowerQuery.includes("medication") || lowerQuery.includes("medicine")) {
          responseContent = `Based on the records, John is currently taking Levodopa for Parkinson's and Lisinopril for hypertension. The morning medication has been marked as completed today.`;
        } 
        else if (lowerQuery.includes("task") || lowerQuery.includes("todo")) {
          responseContent = `There are 3 tasks today: 
1. Morning medication (Completed)
2. Physical therapy exercises (Pending)
3. Doctor appointment at 2:00 PM (Scheduled)

Would you like me to provide more details on any of these?`;
        }
        else if (lowerQuery.includes("routine") || lowerQuery.includes("schedule")) {
          responseContent = `John has two main routines:
          
Morning Routine:
- Wake up (6:30 AM)
- Take medication (7:00 AM)
- Breakfast (7:30 AM)

Evening Routine:
- Dinner (6:00 PM)
- Take medication (7:00 PM)
- Reading (8:00 PM before bed)`;
        }
        else if (lowerQuery.includes("update") || lowerQuery.includes("status")) {
          responseContent = `Recent updates:
- Patient reports feeling better today
- Blood pressure reading was 128/82, which is within target range
- Patient completed all morning activities without assistance, showing improvement`;
        }
        else {
          responseContent = `I'm here to help with John's care plan. You can ask me about:
- Medications and treatments
- Tasks and appointments
- Daily routines
- Recent health updates
- Care recommendations

What would you like to know more about?`;
        }
        
        // Add assistant response
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: responseContent }
        ]);
        
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI Care Assistant. I can help you with information about patient care, tasks, routines, and updates. How can I assist you today?"
      }
    ]);
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Care Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[370px] px-4 py-2">
          <div className="space-y-4 pt-2">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                    {message.role === 'user' ? (
                      <>
                        <AvatarImage src={`https://avatar.vercel.sh/${mockCurrentUser.id}`} />
                        <AvatarFallback>
                          {`${mockCurrentUser.first_name.charAt(0)}${mockCurrentUser.last_name.charAt(0)}`}
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/ai-assistant.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/ai-assistant.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask something about patient care..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
