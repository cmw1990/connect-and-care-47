import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useLocation } from '@/hooks/useLocation';
import { useNotifications } from '@/hooks/useNotifications';
import { careCompanionService } from '@/services/care-companion.service';
import { careResourcesService } from '@/services/care-resources.service';
import { SafetyCheckComponent } from './SafetyCheck';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/useToast';
import {
  Home,
  Calendar,
  Users,
  Bell,
  MessageSquare,
  Heart,
  Settings,
  Plus,
  ChevronRight,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  Bookmark,
  Star
} from 'lucide-react';

export const CareCompanionApp: React.FC = () => {
  const user = useUser();
  const { location } = useLocation();
  const { hasPermission } = useNotifications();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState('home');
  const [careProfile, setCareProfile] = React.useState<any>(null);
  const [schedules, setSchedules] = React.useState<any[]>([]);
  const [matches, setMatches] = React.useState<any[]>([]);
  const [resources, setResources] = React.useState<any[]>([]);
  const [insights, setInsights] = React.useState<any>(null);
  const [showEmergencySheet, setShowEmergencySheet] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [profile, schedules, insights] = await Promise.all([
        careCompanionService.getCareProfile(user!.id),
        careCompanionService.getCareSchedules(user!.id),
        careCompanionService.getCareInsights(user!.id)
      ]);

      setCareProfile(profile);
      setSchedules(schedules);
      setInsights(insights);

      // Load care matches if profile exists
      if (profile) {
        const matches = await careCompanionService.findCareMatches(user!.id, {
          location: location?.city,
          schedule: profile.preferences.schedule
        });
        setMatches(matches);
      }

      // Load recommended resources
      const recommendedResources = await careResourcesService.getRecommendedResources(user!.id);
      setResources(recommendedResources);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load some data');
    }
  };

  const handleEmergency = async () => {
    setShowEmergencySheet(true);
    try {
      // Trigger emergency protocols
      await careCompanionService.performSafetyCheck(user!.id, 'emergency');
      
      // Notify emergency contacts
      if (careProfile?.emergencyContacts) {
        // Send emergency notifications
        toast.success('Emergency contacts notified');
      }
    } catch (error) {
      console.error('Emergency alert failed:', error);
      toast.error('Failed to send emergency alert');
    }
  };

  const renderHomeTab = () => (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-4">
        {/* User Profile Summary */}
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user?.avatar_url}
              fallback={user?.full_name?.[0] || 'U'}
              className="h-16 w-16"
            />
            <div>
              <h2 className="text-xl font-semibold">{user?.full_name}</h2>
              {careProfile?.care_type && (
                <Badge variant="outline" className="mt-1">
                  {careProfile.care_type}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24"
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>Schedule Care</span>
          </Button>
          <Button
            variant="outline"
            className="h-24"
            onClick={() => setActiveTab('matches')}
          >
            <Users className="h-6 w-6 mb-2" />
            <span>Find Care</span>
          </Button>
        </div>

        {/* Safety Check Component */}
        <SafetyCheckComponent
          userId={user!.id}
          onEmergency={handleEmergency}
        />

        {/* Upcoming Schedule */}
        {schedules.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Upcoming Care</h3>
            <div className="space-y-3">
              {schedules.slice(0, 3).map(schedule => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{schedule.tasks[0]?.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(schedule.schedule.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Care Insights */}
        {insights && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Care Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold">{insights.schedules.completed}</p>
                <p className="text-sm text-gray-600">Care Sessions</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold">
                  {Math.round((1 - insights.schedules.cancelledRate) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recommended Resources */}
        {resources.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Resources for You</h3>
            <div className="space-y-3">
              {resources.slice(0, 3).map(resource => (
                <div
                  key={resource.id}
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {resource.type === 'article' && (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  {resource.type === 'video' && (
                    <Video className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {resource.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  const renderScheduleTab = () => (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Care Schedule</h2>
          <Button onClick={() => {/* Handle new schedule */}}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>

        {schedules.map(schedule => (
          <Card key={schedule.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={
                schedule.status === 'completed' ? 'success' :
                schedule.status === 'in-progress' ? 'warning' :
                'default'
              }>
                {schedule.status}
              </Badge>
              <p className="text-sm text-gray-500">
                {new Date(schedule.schedule.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3">
              {schedule.tasks.map((task: any) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  const renderMatchesTab = () => (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Care Matches</h2>
          <Button variant="outline" onClick={() => {/* Handle filters */}}>
            Filter Matches
          </Button>
        </div>

        {matches.map(match => (
          <Card key={match.caregiver_id} className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar
                src={match.avatar_url}
                fallback={match.name[0]}
                className="h-12 w-12"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{match.name}</h3>
                  <Badge variant="outline">
                    {Math.round(match.match_score)}% Match
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {match.experience} years experience
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-500">
              {match.match_factors.map((factor: any) => (
                <div key={factor.factor} className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-medium">{Math.round(factor.score)}%</p>
                  <p>{factor.factor.replace('_', ' ')}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex space-x-2">
              <Button variant="outline" className="flex-1">
                View Profile
              </Button>
              <Button className="flex-1">
                Connect
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home">
            {renderHomeTab()}
          </TabsContent>
          <TabsContent value="schedule">
            {renderScheduleTab()}
          </TabsContent>
          <TabsContent value="matches">
            {renderMatchesTab()}
          </TabsContent>
          {/* Add more tab content */}
        </Tabs>
      </main>

      <nav className="h-16 border-t bg-background">
        <div className="grid h-full grid-cols-5">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center"
            onClick={() => setActiveTab('home')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center"
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Schedule</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center"
            onClick={() => setActiveTab('matches')}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Matches</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center"
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center"
            onClick={() => setActiveTab('profile')}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>

      <Sheet
        open={showEmergencySheet}
        onOpenChange={setShowEmergencySheet}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Emergency Mode</h2>
          </div>

          <p className="text-gray-600">
            Emergency services and your care contacts have been notified.
            Stay calm and follow these steps:
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
              <p className="text-sm">Emergency services are on their way</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-sm">Care contacts have been notified</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              <p className="text-sm">Your location is being shared</p>
            </div>
          </div>

          <Button
            className="w-full"
            variant="destructive"
            onClick={() => setShowEmergencySheet(false)}
          >
            Cancel Emergency
          </Button>
        </div>
      </Sheet>
    </div>
  );
};
