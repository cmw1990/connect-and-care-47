import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Send,
  Phone,
  Video,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { careTeamService } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';

export function MobileCareTeamDashboard() {
  const { user } = useUser();
  const [activeTeam, setActiveTeam] = React.useState<string | null>(null);
  const [teams, setTeams] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const messageEndRef = React.useRef<HTMLDivElement>(null);

  const loadTeamData = React.useCallback(async () => {
    if (!user || !activeTeam) return;

    try {
      const [tasksData, messagesData] = await Promise.all([
        careTeamService.getCareTasks(activeTeam),
        careTeamService.getTeamMessages(activeTeam),
      ]);

      setTasks(tasksData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }, [user, activeTeam]);

  React.useEffect(() => {
    const loadTeams = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const teamsData = await careTeamService.getCareTeams(user.id);
        setTeams(teamsData);
        if (teamsData.length > 0 && !activeTeam) {
          setActiveTeam(teamsData[0].id);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [user]);

  React.useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  React.useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !activeTeam || !newMessage.trim()) return;

    try {
      await careTeamService.sendTeamMessage({
        teamId: activeTeam,
        senderId: user.id,
        messageType: 'text',
        content: newMessage.trim(),
        readBy: [user.id],
      });
      setNewMessage('');
      await loadTeamData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please sign in to access care team features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team Selection */}
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex gap-2 p-1 min-w-full">
          {teams.map((team) => (
            <Button
              key={team.id}
              variant={activeTeam === team.id ? 'default' : 'outline'}
              className="min-w-[150px]"
              onClick={() => setActiveTeam(team.id)}
            >
              {team.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {activeTeam && (
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-[calc(100vh-16rem)]">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Team Chat</CardTitle>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-2 ${
                          message.senderId === user.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${message.senderId}`} />
                          <AvatarFallback>
                            {message.senderId.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-start gap-3">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : task.status === 'in_progress' ? (
                          <Clock className="w-5 h-5 text-blue-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'destructive'
                            : task.priority === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams
                    .find((team) => team.id === activeTeam)
                    ?.members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${member.id}`} />
                            <AvatarFallback>
                              {member.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Video className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
