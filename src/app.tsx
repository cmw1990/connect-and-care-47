
import React from 'react';
import { CareMetrics } from './components/analytics/CareMetrics';
import { DirectMessageChat } from './components/chat/DirectMessageChat';
import { createMockUserProfile } from './utils/mockDataHelper';
import { useToast } from './hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { WellnessDashboard } from './components/health-wellness/WellnessDashboard';
import { Button } from './components/ui/button';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  User, 
  Activity, 
  Home, 
  Users, 
  Settings 
} from 'lucide-react';
import { LegalDisclaimer } from './components/disclaimers/LegalDisclaimer';
import { Toaster } from './components/ui/toaster';

function App() {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    console.error('Error:', error);
    toast.error('An error occurred', error.message);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-primary">Care Platform</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back, John</h1>
            <p className="text-muted-foreground">Here's an overview of care activities</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Health & Wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WellnessDashboard userId="user-1" />
              </CardContent>
            </Card>
            
            <CareMetrics 
              groupId="group-1" 
            />

            <LegalDisclaimer type="all" />
          </div>
          
          <div className="space-y-6">
            <Card className="h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Care Team Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-64px)]">
                <DirectMessageChat 
                  recipientId="user-2" 
                  onSendMessage={(message) => console.log("Message sent:", message)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Care Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg`} alt={`Team Member ${i}`} />
                        <AvatarFallback>{`TM${i}`}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`Team Member ${i}`}</p>
                        <p className="text-sm text-muted-foreground">{i === 1 ? 'Primary Caregiver' : `Caregiver`}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">View All Team Members</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t py-2 md:hidden">
        <div className="container flex justify-around items-center">
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Schedule</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Users className="h-5 w-5" />
            <span className="text-xs">Team</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;
