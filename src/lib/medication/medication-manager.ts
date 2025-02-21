import { supabase } from '@/lib/supabase/client';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { careAlertService } from '../care-coordination/care-alerts';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule: {
    times: string[];
    daysOfWeek: number[];
    startDate: Date;
    endDate?: Date;
  };
  instructions: string;
  sideEffects?: string[];
  interactions?: string[];
  status: 'active' | 'discontinued' | 'completed';
  adherenceRate?: number;
  prescribedBy: string;
  pharmacy?: {
    name: string;
    phone: string;
    address: string;
  };
  refills: {
    remaining: number;
    lastRefillDate?: Date;
    nextRefillDate?: Date;
  };
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  sideEffects?: string[];
}

export interface Prescription {
  id: string;
  medicationId: string;
  prescribedBy: string;
  prescriptionDate: Date;
  expirationDate: Date;
  refills: number;
  pharmacyId: string;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
}

export interface PharmacyOrder {
  id: string;
  prescriptionId: string;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  requestedDate: Date;
  estimatedReadyDate?: Date;
  completedDate?: Date;
  notificationPreference: 'sms' | 'email' | 'push' | 'none';
}

class MedicationManager {
  private subscriptions: Map<string, () => void> = new Map();
  private activeMedications: Map<string, Medication> = new Map();
  private scheduledReminders: Map<string, number> = new Map();

  async initialize() {
    // Subscribe to medication updates
    const medicationSubscription = supabase
      .channel('medications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        this.handleMedicationUpdate
      )
      .subscribe();

    // Subscribe to medication logs
    const logSubscription = supabase
      .channel('medication_logs')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'medication_logs' },
        this.handleMedicationLogUpdate
      )
      .subscribe();

    this.subscriptions.set('medications', () => medicationSubscription.unsubscribe());
    this.subscriptions.set('logs', () => logSubscription.unsubscribe());

    // Load active medications and schedule reminders
    await this.loadActiveMedications();
  }

  private async loadActiveMedications() {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error loading medications:', error);
      return;
    }

    data.forEach(med => {
      this.activeMedications.set(med.id, med);
      this.scheduleReminders(med);
    });
  }

  private handleMedicationUpdate = async (payload: any) => {
    const medication = payload.new as Medication;
    
    if (medication.status === 'active') {
      this.activeMedications.set(medication.id, medication);
      this.scheduleReminders(medication);
      await Haptics.impact({ style: ImpactStyle.Light });
    } else {
      this.activeMedications.delete(medication.id);
      this.clearReminders(medication.id);
    }
  };

  private handleMedicationLogUpdate = async (payload: any) => {
    const log = payload.new as MedicationLog;
    
    if (log.status === 'taken') {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await this.updateAdherenceRate(log.medicationId);
    } else if (log.status === 'missed') {
      await this.createMissedDoseAlert(log);
    }
  };

  private async scheduleReminders(medication: Medication) {
    // Clear existing reminders
    this.clearReminders(medication.id);

    const today = new Date();
    const endDate = medication.schedule.endDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const time of medication.schedule.times) {
      const [hours, minutes] = time.split(':').map(Number);
      
      for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        if (medication.schedule.daysOfWeek.includes(date.getDay())) {
          const scheduledTime = new Date(date);
          scheduledTime.setHours(hours, minutes, 0, 0);

          if (scheduledTime > today) {
            const notificationId = await this.scheduleNotification(medication, scheduledTime, 'dose');
            this.scheduledReminders.set(`${medication.id}_${scheduledTime.toISOString()}`, notificationId);
          }
        }
      }
    }
  }

  private async scheduleNotification(
    medication: Medication,
    time: Date,
    type: 'dose' | 'refill_ready' | 'prescription_expiring' | 'interaction_alert'
  ): Promise<number> {
    const notificationId = Date.now();
    let title: string;
    let body: string;

    switch (type) {
      case 'dose':
        title = `Time to take ${medication.name}`;
        body = `${medication.dosage}\n${medication.instructions}`;
        break;
      case 'refill_ready':
        title = `Refill Ready for ${medication.name}`;
        body = 'Your prescription is ready for pickup at the pharmacy';
        break;
      case 'prescription_expiring':
        title = `Prescription Expiring Soon`;
        body = `Your prescription for ${medication.name} will expire in 7 days`;
        break;
      case 'interaction_alert':
        title = `Medication Interaction Alert`;
        body = `Potential interaction detected with ${medication.name}. Please consult your healthcare provider.`;
        break;
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: notificationId,
        title,
        body,
        schedule: { at: time },
        sound: type === 'interaction_alert' ? 'alert.wav' : 'medication.wav',
        attachments: null,
        actionTypeId: `medication_${type}`,
        extra: {
          medicationId: medication.id,
          type,
          scheduledTime: time.toISOString(),
        },
      }],
    });

    return notificationId;
  }

  private clearReminders(medicationId: string) {
    for (const [key, notificationId] of this.scheduledReminders.entries()) {
      if (key.startsWith(medicationId)) {
        LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
        this.scheduledReminders.delete(key);
      }
    }
  }

  private async updateAdherenceRate(medicationId: string) {
    const { data: logs, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('scheduled_time', { ascending: false })
      .limit(30);

    if (error || !logs.length) return;

    const total = logs.length;
    const taken = logs.filter(log => log.status === 'taken').length;
    const adherenceRate = (taken / total) * 100;

    await supabase
      .from('medications')
      .update({ adherence_rate: adherenceRate })
      .eq('id', medicationId);

    if (adherenceRate < 80) {
      await this.createLowAdherenceAlert(medicationId, adherenceRate);
    }
  }

  private async createMissedDoseAlert(log: MedicationLog) {
    const medication = this.activeMedications.get(log.medicationId);
    if (!medication) return;

    await careAlertService.createAlert({
      patientId: log.patientId,
      caregiverId: '', // Will be assigned by care team
      type: 'medication',
      priority: 'medium',
      title: 'Missed Medication Dose',
      description: `${medication.name} dose scheduled for ${new Date(log.scheduledTime).toLocaleTimeString()} was missed`,
      metadata: {
        medicationDetails: {
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
        },
      },
    });
  }

  private async createLowAdherenceAlert(medicationId: string, adherenceRate: number) {
    const medication = this.activeMedications.get(medicationId);
    if (!medication) return;

    await careAlertService.createAlert({
      patientId: medication.patientId,
      caregiverId: '', // Will be assigned by care team
      type: 'medication',
      priority: 'high',
      title: 'Low Medication Adherence',
      description: `Medication adherence rate for ${medication.name} has dropped to ${Math.round(adherenceRate)}%`,
      metadata: {
        medicationDetails: {
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
        },
      },
    });
  }

  async addMedication(medication: Omit<Medication, 'id' | 'adherenceRate'>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .insert({
        ...medication,
        adherence_rate: 100,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', medicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logMedication(log: Omit<MedicationLog, 'id'>): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMedicationSchedule(
    patientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicationLog[]> {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*, medications(*)')
      .eq('patient_id', patientId)
      .gte('scheduled_time', startDate.toISOString())
      .lte('scheduled_time', endDate.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getAdherenceReport(
    patientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    medicationId: string;
    name: string;
    total: number;
    taken: number;
    missed: number;
    adherenceRate: number;
  }[]> {
    const { data: logs, error } = await supabase
      .from('medication_logs')
      .select('*, medications(*)')
      .eq('patient_id', patientId)
      .gte('scheduled_time', startDate.toISOString())
      .lte('scheduled_time', endDate.toISOString());

    if (error) throw error;

    const report = new Map<string, {
      name: string;
      total: number;
      taken: number;
      missed: number;
    }>();

    logs.forEach(log => {
      const stats = report.get(log.medication_id) || {
        name: log.medications.name,
        total: 0,
        taken: 0,
        missed: 0,
      };

      stats.total++;
      if (log.status === 'taken') stats.taken++;
      if (log.status === 'missed') stats.missed++;

      report.set(log.medication_id, stats);
    });

    return Array.from(report.entries()).map(([medicationId, stats]) => ({
      medicationId,
      ...stats,
      adherenceRate: (stats.taken / stats.total) * 100,
    }));
  }

  // Prescription Management
  async createPrescription(prescription: Omit<Prescription, 'id'>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(prescription)
      .select()
      .single();

    if (error) throw error;
    
    // Schedule expiration reminder
    const expirationDate = new Date(prescription.expirationDate);
    const reminderDate = new Date(expirationDate);
    reminderDate.setDate(reminderDate.getDate() - 7); // Remind 7 days before expiration
    
    await this.scheduleNotification({
      id: prescription.medicationId,
      name: (await this.getMedicationById(prescription.medicationId))?.name || '',
      dosage: '',
      schedule: { times: [], daysOfWeek: [], startDate: new Date() },
      instructions: '',
      prescribedBy: prescription.prescribedBy,
      status: 'active',
      patientId: '',
    }, reminderDate, 'prescription_expiring');

    return data;
  }

  async checkDrugInteractions(medicationIds: string[]): Promise<{
    severity: 'none' | 'minor' | 'moderate' | 'severe';
    description: string;
    recommendations: string[];
  }[]> {
    // This would typically integrate with an external drug interaction API
    // For now, we'll use a mock implementation
    const medications = await Promise.all(
      medicationIds.map(id => this.getMedicationById(id))
    );

    const activeIngredients = medications
      .filter(Boolean)
      .map(med => med?.name || '')
      .join(',');

    // Mock API call to drug interaction service
    const interactions = await this.mockDrugInteractionCheck(activeIngredients);
    return interactions;
  }

  private async mockDrugInteractionCheck(ingredients: string) {
    // Mock implementation - replace with actual API integration
    return [{
      severity: 'moderate' as const,
      description: 'Potential interaction detected between medications',
      recommendations: [
        'Monitor blood pressure',
        'Take medications at different times',
        'Consult healthcare provider',
      ],
    }];
  }

  async getMedicationById(id: string): Promise<Medication | null> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Pharmacy Integration
  async requestRefill(prescriptionId: string): Promise<PharmacyOrder> {
    const { data: prescription } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId)
      .single();

    if (!prescription) throw new Error('Prescription not found');
    if (prescription.status !== 'active') throw new Error('Prescription is not active');
    if (prescription.refills <= 0) throw new Error('No refills remaining');

    const order: Omit<PharmacyOrder, 'id'> = {
      prescriptionId,
      status: 'pending',
      requestedDate: new Date(),
      estimatedReadyDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Est. 24 hours
      notificationPreference: 'push',
    };

    const { data, error } = await supabase
      .from('pharmacy_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;

    // Update prescription refills
    await supabase
      .from('prescriptions')
      .update({ refills: prescription.refills - 1 })
      .eq('id', prescriptionId);

    // Schedule notification for when order is estimated to be ready
    if (order.estimatedReadyDate) {
      const medication = await this.getMedicationById(prescription.medicationId);
      if (medication) {
        await this.scheduleNotification(
          medication,
          order.estimatedReadyDate,
          'refill_ready'
        );
      }
    }

    return data;
  }

  async trackPharmacyOrder(orderId: string): Promise<PharmacyOrder> {
    const { data, error } = await supabase
      .from('pharmacy_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  cleanup() {
    // Clean up subscriptions
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();

    // Clear all scheduled notifications
    const notificationIds = Array.from(this.scheduledReminders.values());
    if (notificationIds.length) {
      LocalNotifications.cancel({
        notifications: notificationIds.map(id => ({ id })),
      });
    }

    this.scheduledReminders.clear();
    this.activeMedications.clear();
  }
}

export const medicationManager = new MedicationManager();
