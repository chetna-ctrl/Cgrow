/**
 * Browser Notification Service
 * Handles web push notifications for reminders
 */

class NotificationService {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('Notifications not supported in this browser');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Show notification
     * @param {string} title 
     * @param {Object} options 
     */
    show(title, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            console.log('Notification blocked:', title);
            return null;
        }

        const defaultOptions = {
            icon: '/logo192.png',
            badge: '/logo192.png',
            vibrate: [200, 100, 200],
            requireInteraction: false
        };

        const notification = new Notification(title, {
            ...defaultOptions,
            ...options
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        return notification;
    }

    /**
     * Show task reminder
     * @param {string} taskName 
     * @param {string} urgency - 'low', 'medium', 'high', 'critical'
     */
    showTaskReminder(taskName, urgency = 'medium') {
        const urgencyConfig = {
            low: { icon: 'ℹ️', vibrate: [100] },
            medium: { icon: '⚠️', vibrate: [200, 100, 200] },
            high: { icon: '🔴', vibrate: [300, 100, 300, 100, 300] },
            critical: { icon: '🚨', vibrate: [500, 200, 500, 200, 500], requireInteraction: true }
        };

        const config = urgencyConfig[urgency] || urgencyConfig.medium;

        return this.show(`${config.icon} Agri-OS Reminder`, {
            body: taskName,
            tag: `task-${taskName}`,
            vibrate: config.vibrate,
            requireInteraction: config.requireInteraction
        });
    }

    /**
     * Show blackout mode alert
     * @param {number} daysRemaining 
     */
    showBlackoutAlert(daysRemaining) {
        if (daysRemaining === 0) {
            return this.show('🚨 BLACKOUT MODE ENDING!', {
                body: 'REMOVE COVERS NOW - Expose microgreens to light',
                tag: 'blackout-critical',
                vibrate: [500, 200, 500, 200, 500],
                requireInteraction: true,
                actions: [
                    { action: 'done', title: 'Covers Removed' }
                ]
            });
        } else {
            return this.show('⏱️ Blackout Mode Active', {
                body: `${daysRemaining} days remaining. Keep trays covered.`,
                tag: 'blackout-reminder',
                vibrate: [200, 100, 200]
            });
        }
    }

    /**
     * Schedule notification
     * @param {string} title 
     * @param {Object} options 
     * @param {number} delayMs - Milliseconds until notification
     */
    schedule(title, options, delayMs) {
        return setTimeout(() => {
            this.show(title, options);
        }, delayMs);
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default NotificationService;
