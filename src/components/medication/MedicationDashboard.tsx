import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { medicationManager, type Medication, type MedicationLog } from '@/lib/medication/medication-manager';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Calendar } from '@/components/ui/Calendar';
import { useToast } from '@/hooks/useToast';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface MedicationCardProps {
  medication: Medication;
  onTakeDose: () => Promise<void>;
  onSkipDose: () => Promise<void>;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onTakeDose, onSkipDose }) => {
  const isMobile = useMobileDetect();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = async () => {
    if (isMobile) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isExpanded ? 'shadow-lg' : 'shadow'
        }`}
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{medication.name}</h3>
            <p className="text-sm text-gray-600">{medication.dosage}</p>
          </div>
          <CircularProgress
            value={medication.adherenceRate || 0}
            size={50}
            strokeWidth={5}
            className={medication.adherenceRate >= 80 ? 'text-green-500' : 'text-red-500'}
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4"
            >
              <div className="space-y-2">
                <p><strong>Instructions:</strong> {medication.instructions}</p>
                {medication.sideEffects && (
                  <p><strong>Side Effects:</strong> {medication.sideEffects.join(', ')}</p>
                )}
                <p><strong>Prescribed By:</strong> {medication.prescribedBy}</p>
                <p><strong>Refills Remaining:</strong> {medication.refills.remaining}</p>
                {medication.refills.nextRefillDate && (
                  <p><strong>Next Refill:</strong> {format(new Date(medication.refills.nextRefillDate), 'PPP')}</p>
                )}
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onTakeDose();
                    }}
                  >
                    Take Dose
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onSkipDose();
                    }}
                  >
                    Skip Dose
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export const MedicationDashboard: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState<MedicationLog[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const isMobile = useMobileDetect();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const scheduleData = await medicationManager.getMedicationSchedule(
          'current-patient-id', // Replace with actual patient ID
          startDate,
          endDate
        );
        setSchedule(scheduleData);
        
        // Group medications by their IDs
        const medicationMap = new Map<string, Medication>();
        scheduleData.forEach(log => {
          if (log.medications) {
            medicationMap.set(log.medications.id, log.medications);
          }
        });
        setMedications(Array.from(medicationMap.values()));
      } catch (error) {
        console.error('Error fetching medication data:', error);
        showToast({
          title: 'Error',
          message: 'Failed to load medication data',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleTakeDose = async (medicationId: string) => {
    try {
      if (isMobile) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      await medicationManager.logMedication({
        medicationId,
        patientId: 'current-patient-id', // Replace with actual patient ID
        scheduledTime: new Date(),
        takenTime: new Date(),
        status: 'taken',
      });

      showToast({
        title: 'Success',
        message: 'Medication dose recorded',
        type: 'success',
      });
    } catch (error) {
      console.error('Error logging medication:', error);
      showToast({
        title: 'Error',
        message: 'Failed to record medication dose',
        type: 'error',
      });
    }
  };

  const handleSkipDose = async (medicationId: string) => {
    try {
      if (isMobile) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }

      await medicationManager.logMedication({
        medicationId,
        patientId: 'current-patient-id', // Replace with actual patient ID
        scheduledTime: new Date(),
        status: 'skipped',
        notes: 'Skipped by user',
      });

      showToast({
        title: 'Note',
        message: 'Medication dose skipped',
        type: 'info',
      });
    } catch (error) {
      console.error('Error logging skipped medication:', error);
      showToast({
        title: 'Error',
        message: 'Failed to record skipped dose',
        type: 'error',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medication Schedule</h2>
        <Button
          variant="outline"
          onClick={() => setShowCalendar(true)}
        >
          {format(selectedDate, 'PPP')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={40} className="text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {medications.length === 0 ? (
            <p className="text-center text-gray-500">No medications scheduled for today</p>
          ) : (
            medications.map(medication => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onTakeDose={() => handleTakeDose(medication.id)}
                onSkipDose={() => handleSkipDose(medication.id)}
              />
            ))
          )}
        </div>
      )}

      <Dialog
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Select Date"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date);
              setShowCalendar(false);
            }
          }}
          className="rounded-lg"
        />
      </Dialog>
    </div>
  );
};
