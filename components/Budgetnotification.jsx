import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useBudgetNotifications = () => {
  const requestNotificationPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('budget-alerts', {
        name: 'Budget Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    requestNotificationPermissions();
  }, [requestNotificationPermissions]);

  const sendBudgetNotification = useCallback(async (budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    console.log('Sending notification for budget:', budget.title, 'with percentage:', percentage); // Debug log

    const getNotificationContent = () => {
      if (percentage >= 100) {
        return {
          title: '🚨 Budget Exceeded!',
          body: `Your ${budget.title} budget has been exceeded! (${percentage.toFixed(0)}% used)`,
          priority: 'high',
          sound: 'default',
          badge: 1,
          channelId: 'budget-alerts',
        };
      }
      if (percentage >= 90) {
        return {
          title: '⚠️ Critical Budget Alert',
          body: `Your ${budget.title} budget is nearly depleted! (${percentage.toFixed(0)}% used)`,
          priority: 'high',
          sound: 'default',
          badge: 1,
          channelId: 'budget-alerts',
        };
      }
      if (percentage >= 75) {
        return {
          title: '⚡ Budget Warning',
          body: `Your ${budget.title} budget is at ${percentage.toFixed(0)}% used`,
          priority: 'medium',
          sound: 'default',
          badge: 1,
          channelId: 'budget-alerts',
        };
      }
      return null;
    };

    const notificationContent = getNotificationContent();
    if (notificationContent) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            ...notificationContent,
            data: {
              category: budget.category,
              percentage: percentage,
              timestamp: new Date().toISOString(),
            },
          },
          trigger: null,
        });
        console.log('Notification scheduled successfully'); // Debug log
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    } else {
      console.log('No notification content to send'); // Debug log
    }
  }, []);

  const checkBudgetThresholds = useCallback((budgets) => {
    budgets.forEach((budget) => {
      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage >= 75) {
        sendBudgetNotification(budget);
      }
    });
  }, [sendBudgetNotification]);

  return {
    checkBudgetThresholds,
    sendBudgetNotification,
    requestNotificationPermissions,
  };
};

export const BudgetNotificationListener = ({ onNotificationReceived }) => {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification interaction:', response);
    });
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [onNotificationReceived]);
  return null;
};