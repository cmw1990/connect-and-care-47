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
import { useToast } from '@/components/ui/use-toast';
import {
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  instructions: string;
  refillReminder: boolean;
  refillDate?: Date;
  status: 'active' | 'completed' | 'discontinued';
  adherence: number;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: Date;
  taken: boolean;
  note?: string;
}

export const MedicationManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = React.useState<MedicationLog[]>([]);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [newMedication, setNewMedication] = React.useState<Partial<Medication>>({
    status: 'active',
    adherence: 100,
  });

  // Mock data for demonstration
  React.useEffect(() => {
    const mockMedications: Medication[] = [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'daily',
        timeOfDay: ['morning'],
        startDate: new Date(),
        instructions: 'Take with food',
        refillReminder: true,
        refillDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        adherence: 95,
      },
      // Add more mock medications
    ];

    setMedications(mockMedications);
  }, []);

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: t('error.invalidMedication'),
        description: t('error.pleaseCompleteAllFields'),
        variant: 'destructive',
      });
      return;
    }

    const medication: Medication = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || 'daily',
      timeOfDay: newMedication.timeOfDay || ['morning'],
      startDate: newMedication.startDate || new Date(),
      instructions: newMedication.instructions || '',
      refillReminder: newMedication.refillReminder || false,
      status: 'active',
      adherence: 100,
    };

    setMedications([...medications, medication]);
    setIsAddingMedication(false);
    setNewMedication({
      status: 'active',
      adherence: 100,
    });

    toast({
      title: t('success.medicationAdded'),
      description: t('success.medicationAddedDescription'),
    });
  };

  const handleMedicationTaken = (medicationId: string) => {
    const log: MedicationLog = {
      id: Math.random().toString(36).substr(2, 9),
      medicationId,
      timestamp: new Date(),
      taken: true,
    };

    setMedicationLogs([...medicationLogs, log]);

    toast({
      title: t('success.medicationTaken'),
      description: t('success.medicationLoggedDescription'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('medicationManager.title')}</CardTitle>
            <CardDescription>{t('medicationManager.description')}</CardDescription>
          </div>
          <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('medicationManager.addMedication')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('medicationManager.newMedication')}</DialogTitle>
                <DialogDescription>
                  {t('medicationManager.newMedicationDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('medicationManager.medicationName')}</Label>
                  <Input
                    id="name"
                    value={newMedication.name || ''}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">{t('medicationManager.dosage')}</Label>
                  <Input
                    id="dosage"
                    value={newMedication.dosage || ''}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, dosage: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">{t('medicationManager.frequency')}</Label>
                  <Select
                    value={newMedication.frequency}
                    onValueChange={(value) =>
                      setNewMedication({ ...newMedication, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('frequency.daily')}</SelectItem>
                      <SelectItem value="twice-daily">
                        {t('frequency.twiceDaily')}
                      </SelectItem>
                      <SelectItem value="weekly">{t('frequency.weekly')}</SelectItem>
                      <SelectItem value="as-needed">
                        {t('frequency.asNeeded')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddMedication}>
                  {t('medicationManager.addMedication')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((medication) => (
              <Card key={medication.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{medication.name}</h4>
                          <p className="text-sm text-gray-500">{medication.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {medication.refillReminder && (
                          <Bell className="h-4 w-4 text-yellow-500" />
                        )}
                        <div
                          className={`h-2 w-2 rounded-full ${
                            medication.status === 'active'
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{medication.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {medication.startDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMedicationTaken(medication.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('medicationManager.markTaken')}
                      </Button>
                      {medication.refillReminder && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t('medicationManager.refill')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {medications.some((m) => m.refillReminder && m.refillDate) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">{t('medicationManager.refillsNeeded')}</h4>
                    <p className="text-sm">
                      {medications
                        .filter((m) => m.refillReminder && m.refillDate)
                        .map((m) => m.name)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
