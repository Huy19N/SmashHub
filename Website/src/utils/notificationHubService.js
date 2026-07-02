import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../config/axios';

class NotificationHubService {
  constructor() {
    this.connection = null;
    this.listeners = new Set();
    this.eventHandlers = []; // Queue for early listeners
    this.isConnecting = false;
    this.startPromise = null;
  }

  getHubUrl() {
    return import.meta.env.VITE_NOTIFICATION_HUB_URL || (import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/hub/notifications');
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

    // Attach all queued handlers BEFORE starting
    this.eventHandlers.forEach(h => {
      this.connection.on(h.eventName, h.callback);
    });

    this.startPromise = this.connection.start().catch(err => {
      console.error('NotificationHubService connection error:', err);
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
        console.error('Error stopping NotificationHubService:', err);
      }
      this.connection = null;
    }
  }

  // General event listeners
  on(eventName, callback) {
    this.eventHandlers.push({ eventName, callback });
    if (this.connection) {
      this.connection.on(eventName, callback);
    } else {
      this.startConnection();
    }
  }

  off(eventName, callback) {
    this.eventHandlers = this.eventHandlers.filter(
      h => !(h.eventName === eventName && h.callback === callback)
    );
    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }
}

export const notificationHubService = new NotificationHubService();

