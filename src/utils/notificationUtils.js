/**
 * Notification Utilities
 * Phase 5: Push Notifications Infrastructure
 */

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

/**
 * Show a local notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/logo192.png',
            badge: '/logo192.png',
            ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
    }
};

/**
 * Check if user should be reminded to log
 * @param {Date} lastLogDate - Date of last log entry
 * @returns {boolean} True if reminder should be shown
 */
export const shouldShowReminder = (lastLogDate) => {
    if (!lastLogDate) return true;

    const daysSinceLastLog = Math.floor(
        (Date.now() - new Date(lastLogDate)) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastLog >= 2;
};

/**
 * Schedule a reminder notification
 * @param {Date} lastLogDate - Date of last log entry
 */
export const scheduleReminder = (lastLogDate) => {
    if (!shouldShowReminder(lastLogDate)) return;

    const daysSinceLastLog = Math.floor(
        (Date.now() - new Date(lastLogDate)) / (1000 * 60 * 60 * 24)
    );

    showNotification('cGrow Reminder', {
        body: `It's been ${daysSinceLastLog} days since your last log. Your crops need attention! 🌱`,
        tag: 'daily-reminder',
        requireInteraction: false,
        actions: [
            { action: 'log', title: 'Log Now' },
            { action: 'dismiss', title: 'Later' }
        ]
    });
};

/**
 * Show harvest ready notification
 * @param {string} cropName - Name of the crop
 * @param {number} daysUntilHarvest - Days until harvest
 */
export const notifyHarvestReady = (cropName, daysUntilHarvest) => {
    const message = daysUntilHarvest === 0
        ? `${cropName} is ready to harvest today! 🎉`
        : `${cropName} will be ready to harvest in ${daysUntilHarvest} days`;

    showNotification('Harvest Alert', {
        body: message,
        tag: 'harvest-ready',
        requireInteraction: true
    });
};

/**
 * Show disease risk notification
 * @param {string} disease - Disease name
 * @param {string} severity - Risk severity (low/medium/high)
 */
export const notifyDiseaseRisk = (disease, severity) => {
    const urgency = severity === 'high' ? '🚨 URGENT' : '⚠️ Warning';

    showNotification(`${urgency}: Disease Risk`, {
        body: `${disease} risk detected. Check your farm immediately!`,
        tag: 'disease-risk',
        requireInteraction: severity === 'high'
    });
};

/**
 * Initialize notification system
 * Requests permission and sets up listeners
 */
export const initNotifications = async () => {
    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
        // Store permission status
        localStorage.setItem('notifications_enabled', 'true');

        // Show welcome notification
        showNotification('cGrow Notifications Enabled', {
            body: 'You\'ll now receive reminders and alerts for your farm! 🌱',
            tag: 'welcome'
        });
    }

    return hasPermission;
};

/**
 * Check if notifications are enabled
 * @returns {boolean}
 */
export const areNotificationsEnabled = () => {
    return Notification.permission === 'granted' &&
        localStorage.getItem('notifications_enabled') === 'true';
};
