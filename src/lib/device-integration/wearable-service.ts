import { supabase } from '@/lib/supabase/client';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';

export interface WearableDevice {
  id: string;
  userId: string;
  deviceId: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'medical_device';
  manufacturer: string;
  model: string;
  lastSync: Date;
  batteryLevel?: number;
  status: 'connected' | 'disconnected' | 'pairing' | 'error';
  metadata: Record<string, any>;
}

export interface HealthData {
  timestamp: Date;
  deviceId: string;
  type: 'heart_rate' | 'steps' | 'sleep' | 'blood_pressure' | 'blood_oxygen';
  value: number;
  unit: string;
  metadata: Record<string, any>;
}

class WearableService {
  private devices: Map<string, WearableDevice> = new Map();
  private subscriptions: Map<string, () => void> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize BLE
      await BleClient.initialize();

      // Set up real-time subscriptions for device updates
      const deviceSubscription = supabase
        .channel('wearable_devices')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wearable_devices' },
          this.handleDeviceUpdate
        )
        .subscribe();

      // Set up real-time subscriptions for health data
      const healthDataSubscription = supabase
        .channel('health_data')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'health_data' },
          this.handleHealthDataUpdate
        )
        .subscribe();

      this.subscriptions.set('devices', () => deviceSubscription.unsubscribe());
      this.subscriptions.set('health_data', () => healthDataSubscription.unsubscribe());

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing wearable service:', error);
      throw error;
    }
  }

  private handleDeviceUpdate = async (payload: any) => {
    const device = payload.new as WearableDevice;
    this.devices.set(device.id, device);

    try {
      // Trigger haptic feedback for device status changes
      await Haptics.impact({ style: ImpactStyle.Light });

      // Show notification for important device events
      if (device.status === 'disconnected' || device.status === 'error') {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Device Status Update',
            body: `${device.name} is ${device.status}`,
            id: Date.now(),
            schedule: { at: new Date() },
            sound: 'beep.wav',
            attachments: null,
            actionTypeId: '',
            extra: null,
          }],
        });
      }
    } catch (error) {
      console.error('Error handling device update:', error);
    }
  };

  private handleHealthDataUpdate = async (payload: any) => {
    const healthData = payload.new as HealthData;
    
    try {
      // Trigger haptic feedback for critical health data
      if (this.isHealthDataCritical(healthData)) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await this.notifyHealthAlert(healthData);
      }
    } catch (error) {
      console.error('Error handling health data update:', error);
    }
  };

  private isHealthDataCritical(data: HealthData): boolean {
    // Define thresholds for critical health data
    const thresholds = {
      heart_rate: { min: 40, max: 150 },
      blood_oxygen: { min: 90, max: 100 },
      blood_pressure: { min: 90, max: 140 },
    };

    const type = data.type as keyof typeof thresholds;
    if (!thresholds[type]) return false;

    return (
      data.value < thresholds[type].min || 
      data.value > thresholds[type].max
    );
  }

  private async notifyHealthAlert(data: HealthData) {
    const device = this.devices.get(data.deviceId);
    if (!device) return;

    await LocalNotifications.schedule({
      notifications: [{
        title: 'Health Alert',
        body: `Abnormal ${data.type} reading from ${device.name}: ${data.value}${data.unit}`,
        id: Date.now(),
        schedule: { at: new Date() },
        sound: 'alert.wav',
        attachments: null,
        actionTypeId: 'health_alert',
        extra: {
          deviceId: device.id,
          dataType: data.type,
          value: data.value,
        },
      }],
    });
  }

  async scanForDevices(): Promise<BleDevice[]> {
    try {
      await this.initialize();
      await Haptics.impact({ style: ImpactStyle.Light });

      const devices = await BleClient.scan([], 5000);
      return devices;
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    }
  }

  async connectDevice(device: BleDevice): Promise<WearableDevice> {
    try {
      await this.initialize();
      await Haptics.impact({ style: ImpactStyle.Medium });

      // Connect to the BLE device
      await BleClient.connect(device.deviceId);

      // Get device info
      const deviceInfo = await Device.getInfo();

      // Create wearable device record
      const { data, error } = await supabase
        .from('wearable_devices')
        .insert({
          deviceId: device.deviceId,
          name: device.name || 'Unknown Device',
          type: this.determineDeviceType(device),
          manufacturer: deviceInfo.manufacturer,
          model: deviceInfo.model,
          status: 'connected',
          lastSync: new Date(),
          metadata: {
            platform: deviceInfo.platform,
            operatingSystem: deviceInfo.operatingSystem,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Set up device-specific data listeners
      this.setupDeviceListeners(data);

      return data;
    } catch (error) {
      console.error('Error connecting device:', error);
      throw error;
    }
  }

  private determineDeviceType(device: BleDevice): WearableDevice['type'] {
    // Implement device type detection logic based on device characteristics
    return 'fitness_tracker';
  }

  private setupDeviceListeners(device: WearableDevice) {
    // Set up device-specific BLE characteristic notifications
    // This will vary based on the device type and capabilities
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await BleClient.disconnect(deviceId);

      const { error } = await supabase
        .from('wearable_devices')
        .update({ status: 'disconnected', lastSync: new Date() })
        .eq('deviceId', deviceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting device:', error);
      throw error;
    }
  }

  async getDevices(userId: string): Promise<WearableDevice[]> {
    try {
      const { data, error } = await supabase
        .from('wearable_devices')
        .select('*')
        .eq('userId', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting devices:', error);
      throw error;
    }
  }

  async getHealthData(
    deviceId: string,
    type: HealthData['type'],
    startTime: Date,
    endTime: Date
  ): Promise<HealthData[]> {
    try {
      const { data, error } = await supabase
        .from('health_data')
        .select('*')
        .eq('deviceId', deviceId)
        .eq('type', type)
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting health data:', error);
      throw error;
    }
  }

  cleanup() {
    // Clean up all subscriptions
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
    this.devices.clear();
    this.isInitialized = false;
  }
}

export const wearableService = new WearableService();
