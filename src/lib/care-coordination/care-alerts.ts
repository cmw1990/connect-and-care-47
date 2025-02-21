import { supabase } from '@/lib/supabase/client';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface CareAlert {
  id: string;
  patientId: string;
  caregiverId: string;
  type: 'emergency' | 'medication' | 'vital_signs' | 'appointment' | 'care_update';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  metadata: {
    location?: { lat: number; lng: number };
    vitalSigns?: Record<string, number>;
    medicationDetails?: {
      name: string;
      dosage: string;
      frequency: string;
    };
    appointmentDetails?: {
      time: Date;
      provider: string;
      location: string;
    };
  };
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

class CareAlertService {
  private subscription: any;
  private activeAlerts: Map<string, CareAlert> = new Map();

  async initialize() {
    // Subscribe to real-time alert updates
    this.subscription = supabase
      .channel('care_alerts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'care_alerts' },
        this.handleAlertUpdate
      )
      .subscribe();

    // Load existing active alerts
    await this.loadActiveAlerts();
  }

  private async loadActiveAlerts() {
    const { data, error } = await supabase
      .from('care_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading active alerts:', error);
      return;
    }

    data.forEach(alert => this.activeAlerts.set(alert.id, alert));
  }

  private handleAlertUpdate = async (payload: any) => {
    const alert = payload.new as CareAlert;
    
    if (alert.status === 'active') {
      this.activeAlerts.set(alert.id, alert);
      await this.notifyAlert(alert);
    } else {
      this.activeAlerts.delete(alert.id);
    }

    // Trigger appropriate haptic feedback
    if (alert.priority === 'high') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (alert.priority === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  private async notifyAlert(alert: CareAlert) {
    const notificationTitle = this.getNotificationTitle(alert);
    const notificationBody = this.getNotificationBody(alert);

    await LocalNotifications.schedule({
      notifications: [{
        title: notificationTitle,
        body: notificationBody,
        id: Date.now(),
        schedule: { at: new Date() },
        sound: alert.priority === 'high' ? 'emergency.wav' : 'notification.wav',
        attachments: null,
        actionTypeId: 'care_alert',
        extra: {
          alertId: alert.id,
          type: alert.type,
          priority: alert.priority,
        },
      }],
    });
  }

  private getNotificationTitle(alert: CareAlert): string {
    const priorityEmoji = {
      high: '🚨',
      medium: '⚠️',
      low: 'ℹ️',
    }[alert.priority];

    return `${priorityEmoji} ${alert.title}`;
  }

  private getNotificationBody(alert: CareAlert): string {
    let details = '';
    
    if (alert.metadata.vitalSigns) {
      const vitals = alert.metadata.vitalSigns;
      details = `Vitals - HR: ${vitals.heartRate || 'N/A'}, BP: ${vitals.bloodPressure || 'N/A'}, SpO2: ${vitals.oxygen || 'N/A'}`;
    } else if (alert.metadata.medicationDetails) {
      const med = alert.metadata.medicationDetails;
      details = `Medication: ${med.name} ${med.dosage}, ${med.frequency}`;
    } else if (alert.metadata.appointmentDetails) {
      const appt = alert.metadata.appointmentDetails;
      details = `Appointment with ${appt.provider} at ${new Date(appt.time).toLocaleTimeString()}`;
    }

    return `${alert.description}\n${details}`;
  }

  async createAlert(alert: Omit<CareAlert, 'id' | 'createdAt' | 'status'>): Promise<CareAlert> {
    const { data, error } = await supabase
      .from('care_alerts')
      .insert({
        ...alert,
        status: 'active',
        created_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acknowledgeAlert(alertId: string, caregiverId: string): Promise<void> {
    const { error } = await supabase
      .from('care_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date(),
        caregiver_id: caregiverId,
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    const { error } = await supabase
      .from('care_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date(),
        resolution,
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async getActiveAlerts(patientId?: string): Promise<CareAlert[]> {
    let query = supabase
      .from('care_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAlertHistory(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CareAlert[]> {
    let query = supabase
      .from('care_alerts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.activeAlerts.clear();
  }
}

export const careAlertService = new CareAlertService();
