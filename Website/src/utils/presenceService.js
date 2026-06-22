import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../config/axios';

class PresenceService {
  constructor() {
    this.connection = null;
    this.listeners = new Set();
    this.eventHandlers = []; // Queue for early listeners
    this.isConnecting = false;
    this.startPromise = null;
  }

  getHubUrl() {
    return import.meta.env.VITE_CHAT_HUB_URL || (import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/hub/chat');
  }

  async startConnection() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }
    if (this.startPromise) {
      return this.startPromise;
    }

    const token = getAccessToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => getAccessToken(),
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    const extractUserId = (arg) => {
      if (arg && typeof arg === 'object') {
        return arg.userId || arg.id || arg.UserId || arg.Id || arg.user_id;
      }
      return arg;
    };

    this.connection.on('useronline', (arg) => {
      this.notifyListeners(extractUserId(arg), true);
    });

    this.connection.on('UserOnline', (arg) => {
      this.notifyListeners(extractUserId(arg), true);
    });

    this.connection.on('useroffline', (arg) => {
      this.notifyListeners(extractUserId(arg), false);
    });

    this.connection.on('UserOffline', (arg) => {
      this.notifyListeners(extractUserId(arg), false);
    });

    // Attach all queued handlers BEFORE starting
    this.eventHandlers.forEach(h => {
      this.connection.on(h.eventName, h.callback);
    });
    // We don't clear eventHandlers, we keep them so if connection restarts/rebuilds we still have them.

    this.startPromise = this.connection.start().catch(err => {
      console.error('PresenceService connection error:', err);
    }).finally(() => {
      this.startPromise = null;
    });

    return this.startPromise;
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error('Error stopping PresenceService:', err);
      }
      this.connection = null;
    }
  }

  notifyListeners(userId, isOnline) {
    this.listeners.forEach(callback => callback(userId, isOnline));
  }

  subscribe(callback) {
    this.listeners.add(callback);
    
    // Start connection if this is the first listener
    if (this.listeners.size === 1) {
      this.startConnection();
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  // General event listeners
  on(eventName, callback) {
    // Add to our tracker
    this.eventHandlers.push({ eventName, callback });

    if (this.connection) {
      this.connection.on(eventName, callback);
    } else {
      this.startConnection();
    }
  }

  off(eventName, callback) {
    // Remove from our tracker
    this.eventHandlers = this.eventHandlers.filter(
      h => !(h.eventName === eventName && h.callback === callback)
    );

    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }
}

export const presenceService = new PresenceService();
