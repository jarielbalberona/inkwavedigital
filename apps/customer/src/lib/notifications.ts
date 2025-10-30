/* eslint-disable */
/**
 * Notification utilities with sound and vibration support
 */

// Sound notification using Web Audio API
class NotificationSound {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      // Initialize AudioContext on user interaction
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new AudioContext();
      }
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  }

  /**
   * Enable or disable sound notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Play a notification sound
   * @param type - Type of notification (order-ready, order-update, error)
   */
  async play(type: 'order-ready' | 'order-update' | 'error' = 'order-ready'): Promise<void> {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Resume audio context if suspended (required for autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different sounds for different notification types
      switch (type) {
        case 'order-ready':
          // Cheerful sound for order ready
          this.playOrderReadySound(oscillator, gainNode);
          break;
        case 'order-update':
          // Single pleasant tone for updates
          this.playUpdateSound(oscillator, gainNode);
          break;
        case 'error':
          // Lower tone for errors
          this.playErrorSound(oscillator, gainNode);
          break;
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  private playOrderReadySound(oscillator: OscillatorNode, gainNode: GainNode): void {
    const now = this.audioContext!.currentTime;
    
    // Happy ascending chime: G5 -> B5 -> D6
    const frequencies = [783.99, 987.77, 1174.66];
    const noteDuration = 0.15;
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0, now);
    
    frequencies.forEach((freq, index) => {
      const startTime = now + (index * noteDuration);
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);
    });
    
    oscillator.start(now);
    oscillator.stop(now + (frequencies.length * noteDuration));
  }

  private playUpdateSound(oscillator: OscillatorNode, gainNode: GainNode): void {
    const now = this.audioContext!.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(659.25, now); // E5
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.setValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  private playErrorSound(oscillator: OscillatorNode, gainNode: GainNode): void {
    const now = this.audioContext!.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(329.63, now); // E4 (lower tone)
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.setValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }
}

// Vibration notification
class NotificationVibration {
  private enabled: boolean = true;

  /**
   * Enable or disable vibration notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Trigger vibration pattern
   * @param type - Type of notification
   */
  vibrate(type: 'order-ready' | 'order-update' | 'error' = 'order-ready'): void {
    if (!this.enabled || !('vibrate' in navigator)) return;

    try {
      switch (type) {
        case 'order-ready':
          // Strong pattern for order ready: vibrate-pause-vibrate-pause-vibrate-pause-vibrate
          navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
          break;
        case 'order-update':
          // Single medium vibration for updates
          navigator.vibrate(200);
          break;
        case 'error':
          // Long single vibration for errors
          navigator.vibrate(400);
          break;
      }
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }
}

// Combined notification manager
export class NotificationManager {
  private sound: NotificationSound;
  private vibration: NotificationVibration;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private pushEnabled: boolean = true;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  constructor() {
    this.sound = new NotificationSound();
    this.vibration = new NotificationVibration();
    
    // Load preferences from localStorage
    this.loadPreferences();
    
    // Register service worker
    this.registerServiceWorker();
  }

  /**
   * Register service worker for push notifications
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[NotificationManager] Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      this.serviceWorkerRegistration = registration;
      console.log('[NotificationManager] Service worker registered');
      
      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.pushSubscription = existingSubscription;
        console.log('[NotificationManager] Existing push subscription found');
      }
    } catch (error) {
      console.error('[NotificationManager] Service worker registration failed:', error);
    }
  }

  /**
   * Load notification preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const soundPref = localStorage.getItem('notifications_sound_enabled');
      const vibrationPref = localStorage.getItem('notifications_vibration_enabled');
      const pushPref = localStorage.getItem('notifications_push_enabled');
      
      if (soundPref !== null) {
        this.soundEnabled = soundPref === 'true';
        this.sound.setEnabled(this.soundEnabled);
      }
      
      if (vibrationPref !== null) {
        this.vibrationEnabled = vibrationPref === 'true';
        this.vibration.setEnabled(this.vibrationEnabled);
      }

      if (pushPref !== null) {
        this.pushEnabled = pushPref === 'true';
      }
    } catch (e) {
      console.error('Failed to load notification preferences', e);
    }
  }

  /**
   * Save notification preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('notifications_sound_enabled', String(this.soundEnabled));
      localStorage.setItem('notifications_vibration_enabled', String(this.vibrationEnabled));
      localStorage.setItem('notifications_push_enabled', String(this.pushEnabled));
    } catch (e) {
      console.error('Failed to save notification preferences', e);
    }
  }

  /**
   * Enable or disable sound notifications
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.sound.setEnabled(enabled);
    this.savePreferences();
  }

  /**
   * Enable or disable vibration notifications
   */
  setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
    this.vibration.setEnabled(enabled);
    this.savePreferences();
  }

  /**
   * Get current sound enabled state
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Get current vibration enabled state
   */
  isVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }

  /**
   * Trigger a notification with sound and vibration
   */
  async notify(type: 'order-ready' | 'order-update' | 'error' = 'order-ready'): Promise<void> {
    await this.sound.play(type);
    this.vibration.vibrate(type);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(deviceId: string, venueId?: string): Promise<boolean> {
    if (!this.serviceWorkerRegistration || !this.pushEnabled) {
      console.warn('[NotificationManager] Service worker not registered or push disabled');
      return false;
    }

    try {
      // Get VAPID public key from API
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/push/vapid-public-key`);
      const { publicKey } = await response.json();

      // Subscribe to push
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey),
      });

      this.pushSubscription = subscription;

      // Send subscription to server
      await fetch(`${apiUrl}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          venueId,
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      console.log('[NotificationManager] Push subscription successful');
      return true;
    } catch (error) {
      console.error('[NotificationManager] Push subscription failed:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.pushSubscription) {
      return true;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/api/v1/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: this.pushSubscription.endpoint,
        }),
      });

      await this.pushSubscription.unsubscribe();
      this.pushSubscription = null;

      console.log('[NotificationManager] Push unsubscription successful');
      return true;
    } catch (error) {
      console.error('[NotificationManager] Push unsubscription failed:', error);
      return false;
    }
  }

  /**
   * Enable or disable push notifications
   */
  setPushEnabled(enabled: boolean): void {
    this.pushEnabled = enabled;
    this.savePreferences();
  }

  /**
   * Get current push enabled state
   */
  isPushEnabled(): boolean {
    return this.pushEnabled;
  }

  /**
   * Check if push is supported
   */
  isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Request notification permissions (browser, audio, and push)
   */
  async requestPermissions(deviceId?: string, venueId?: string): Promise<void> {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Initialize audio context on user interaction (required for autoplay policies)
    if (this.sound['audioContext'] && this.sound['audioContext'].state === 'suspended') {
      try {
        await this.sound['audioContext'].resume();
      } catch (e) {
        console.warn('Failed to resume audio context', e);
      }
    }

    // Subscribe to push notifications if permission granted and we have deviceId
    if (Notification.permission === 'granted' && deviceId && this.pushEnabled) {
      await this.subscribeToPush(deviceId, venueId);
    }
  }

  /**
   * Convert base64 VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

