import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Activity, Clock, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { healthService } from '@/lib/supabase/health-service';
import { useUser } from '@supabase/auth-helpers-react';

export const SymptomTracker = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useUser();
  const [symptoms, setSymptoms] = React.useState<any[]>([]);
  const [isAddingSymptom, setIsAddingSymptom] = React.useState(false);
  const [newSymptom, setNewSymptom] = React.useState({
    symptom: '',
    severity: 5,
    duration: '',
    notes: '',
  });

  React.useEffect(() => {
    if (user) {
      loadSymptoms();
    }
  }, [user]);

  const loadSymptoms = async () => {
    try {
      const data = await healthService.getSymptoms(user!.id);
      setSymptoms(data);
    } catch (error) {
      console.error('Error loading symptoms:', error);
      toast({
        title: t('error.loadingSymptoms'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    }
  };

  const handleAddSymptom = async () => {
    if (!newSymptom.symptom) {
      toast({
        title: t('error.invalidSymptom'),
        description: t('error.pleaseCompleteAllFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await healthService.addSymptom({
        userId: user!.id,
        symptom: newSymptom.symptom,
        severity: newSymptom.severity,
        duration: newSymptom.duration,
        notes: newSymptom.notes,
      });

      setIsAddingSymptom(false);
      setNewSymptom({
        symptom: '',
        severity: 5,
        duration: '',
        notes: '',
      });

      loadSymptoms();

      toast({
        title: t('success.symptomAdded'),
        description: t('success.symptomAddedDescription'),
      });
    } catch (error) {
      console.error('Error adding symptom:', error);
      toast({
        title: t('error.addingSymptom'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('symptomTracker.title')}</CardTitle>
            <CardDescription>{t('symptomTracker.description')}</CardDescription>
          </div>
          <Dialog open={isAddingSymptom} onOpenChange={setIsAddingSymptom}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('symptomTracker.addSymptom')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('symptomTracker.newSymptom')}</DialogTitle>
                <DialogDescription>
                  {t('symptomTracker.newSymptomDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symptom">{t('symptomTracker.symptomName')}</Label>
                  <Input
                    id="symptom"
                    value={newSymptom.symptom}
                    onChange={(e) =>
                      setNewSymptom({ ...newSymptom, symptom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>{t('symptomTracker.severity')}</Label>
                  <Slider
                    value={[newSymptom.severity]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([value]) =>
                      setNewSymptom({ ...newSymptom, severity: value })
                    }
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{t('symptomTracker.mild')}</span>
                    <span>{t('symptomTracker.severe')}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">{t('symptomTracker.duration')}</Label>
                  <Select
                    value={newSymptom.duration}
                    onValueChange={(value) =>
                      setNewSymptom({ ...newSymptom, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">
                        {t('duration.minutes')}
                      </SelectItem>
                      <SelectItem value="hours">{t('duration.hours')}</SelectItem>
                      <SelectItem value="days">{t('duration.days')}</SelectItem>
                      <SelectItem value="weeks">{t('duration.weeks')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">{t('symptomTracker.notes')}</Label>
                  <Input
                    id="notes"
                    value={newSymptom.notes}
                    onChange={(e) =>
                      setNewSymptom({ ...newSymptom, notes: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddSymptom}>
                  {t('symptomTracker.addSymptom')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <Card key={symptom.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">{symptom.symptom}</h4>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {symptom.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{symptom.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(symptom.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">
                      {t('symptomTracker.severity')}:{' '}
                      <span className={`text-${getSeverityColor(symptom.severity)}`}>
                        {symptom.severity}/10
                      </span>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${getSeverityColor(
                        symptom.severity
                      )}`}
                    />
                  </div>
                </div>
                {symptom.notes && (
                  <p className="mt-2 text-sm text-gray-600">{symptom.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
