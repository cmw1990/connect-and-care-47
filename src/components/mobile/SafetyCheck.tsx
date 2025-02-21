import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import { useNotifications } from '@/hooks/useNotifications';
import { careCompanionService, SafetyCheck } from '@/services/care-companion.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/useToast';
import {
  Bell,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Users
} from 'lucide-react';

interface SafetyCheckProps {
  userId: string;
  onEmergency?: () => void;
}

export const SafetyCheckComponent: React.FC<SafetyCheckProps> = ({
  userId,
  onEmergency
}) => {
  const { location, error: locationError } = useGeolocation();
  const { motion: deviceMotion } = useDeviceMotion();
  const { requestPermission } = useNotifications();
  const { toast } = useToast();
  
  const [activeChecks, setActiveChecks] = React.useState<SafetyCheck[]>([]);
  const [lastCheckIn, setLastCheckIn] = React.useState<Date | null>(null);
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [emergencyMode, setEmergencyMode] = React.useState(false);

  React.useEffect(() => {
    loadSafetyChecks();
    requestPermission();
  }, []);

  const loadSafetyChecks = async () => {
    try {
      const { data } = await supabase
        .from('safety_checks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (data) {
        setActiveChecks(data);
        const lastCheck = data
          .map(check => new Date(check.last_check))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        setLastCheckIn(lastCheck || null);
      }
    } catch (error) {
      console.error('Error loading safety checks:', error);
      toast.error('Failed to load safety checks');
    }
  };

  const handleCheckIn = async (type: SafetyCheck['type']) => {
    setIsCheckingIn(true);
    try {
      const checkInData: any = {
        location: location,
        activity_data: deviceMotion,
        notes: 'Regular check-in'
      };

      await careCompanionService.performSafetyCheck(userId, type);
      setLastCheckIn(new Date());

      toast.success('Check-in successful');
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleEmergency = async () => {
    setEmergencyMode(true);
    try {
      // Perform emergency check-in
      await careCompanionService.performSafetyCheck(userId, 'emergency');

      // Notify emergency contacts
      const { data: profile } = await careCompanionService.getCareProfile(userId);
      if (profile?.emergencyContacts) {
        // Send emergency notifications
        // This would be implemented in your notification service
      }

      onEmergency?.();
    } catch (error) {
      console.error('Emergency alert failed:', error);
      toast.error('Failed to send emergency alert');
    } finally {
      setEmergencyMode(false);
    }
  };

  const getNextCheckTime = (check: SafetyCheck) => {
    if (!lastCheckIn) return new Date();
    
    const lastCheck = new Date(lastCheckIn);
    switch (check.schedule.frequency) {
      case 'hourly':
        return new Date(lastCheck.setHours(lastCheck.getHours() + 1));
      case 'daily':
        return new Date(lastCheck.setDate(lastCheck.getDate() + 1));
      case 'weekly':
        return new Date(lastCheck.setDate(lastCheck.getDate() + 7));
      default:
        return new Date();
    }
  };

  const getTimeUntilNext = (check: SafetyCheck) => {
    const now = new Date();
    const next = getNextCheckTime(check);
    const diff = next.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {emergencyMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Emergency Mode Active</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setEmergencyMode(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Safety Checks</h3>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-100 text-red-700 hover:bg-red-200"
            onClick={handleEmergency}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency
          </Button>
        </div>

        <div className="space-y-4">
          {activeChecks.map(check => (
            <div
              key={check.id}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {check.type === 'check-in' && <Bell className="h-4 w-4 text-blue-500" />}
                  {check.type === 'location' && <MapPin className="h-4 w-4 text-green-500" />}
                  {check.type === 'activity' && <Activity className="h-4 w-4 text-purple-500" />}
                  <span className="font-medium capitalize">{check.type} Check</span>
                </div>
                <Switch
                  checked={check.status === 'active'}
                  onCheckedChange={async (checked) => {
                    await careCompanionService.updateSafetyCheck(check.id, {
                      status: checked ? 'active' : 'paused'
                    });
                    loadSafetyChecks();
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Next: {getTimeUntilNext(check)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{check.contacts.length} contacts</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleCheckIn(check.type)}
                disabled={isCheckingIn}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In Now
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {lastCheckIn && (
        <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
          <Shield className="h-4 w-4" />
          <span>Last check-in: {new Date(lastCheckIn).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};
