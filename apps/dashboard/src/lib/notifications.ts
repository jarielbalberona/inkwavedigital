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
   * @param type - Type of notification (new-order, order-update, error)
   */
  async play(type: 'new-order' | 'order-update' | 'error' = 'new-order'): Promise<void> {
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
        case 'new-order':
          // Cheerful ascending chime for new orders
          this.playNewOrderSound(oscillator, gainNode);
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

  private playNewOrderSound(oscillator: OscillatorNode, gainNode: GainNode): void {
    const now = this.audioContext!.currentTime;
    
    // Ascending chime: C5 -> E5 -> G5
    const frequencies = [523.25, 659.25, 783.99];
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
  vibrate(type: 'new-order' | 'order-update' | 'error' = 'new-order'): void {
    if (!this.enabled || !('vibrate' in navigator)) return;

    try {
      switch (type) {
        case 'new-order':
          // Strong pattern for new orders: vibrate-pause-vibrate-pause-vibrate
          navigator.vibrate([200, 100, 200, 100, 200]);
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

  constructor() {
    this.sound = new NotificationSound();
    this.vibration = new NotificationVibration();
    
    // Load preferences from localStorage
    this.loadPreferences();
  }

  /**
   * Load notification preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const soundPref = localStorage.getItem('notifications_sound_enabled');
      const vibrationPref = localStorage.getItem('notifications_vibration_enabled');
      
      if (soundPref !== null) {
        this.soundEnabled = soundPref === 'true';
        this.sound.setEnabled(this.soundEnabled);
      }
      
      if (vibrationPref !== null) {
        this.vibrationEnabled = vibrationPref === 'true';
        this.vibration.setEnabled(this.vibrationEnabled);
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
  async notify(type: 'new-order' | 'order-update' | 'error' = 'new-order'): Promise<void> {
    await this.sound.play(type);
    this.vibration.vibrate(type);
  }

  /**
   * Request notification permissions (both browser and audio)
   */
  async requestPermissions(): Promise<void> {
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
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

