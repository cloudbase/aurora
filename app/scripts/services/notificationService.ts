/// <reference path="../_all.ts" />

module auroraApp.Services {
	export class NotificationService implements INotificationService  
	{
        notifications: INotification[] = []

        addNotification(message: string, type: string) 
        {
            let notification: INotification = {
                name: "xxx",
                message: message,
                date: new Date(),
                new: true,
                seen: false
            }

            this.notifications.push(notification)

            this.notifyObservers()
        }

        observerCallbacks = []

        // Register an observer 
        registerObserverCallback(callback) 
        {
            this.observerCallbacks.push(callback);
        };
        
        // Notify observer function
        notifyObservers()
        {
            angular.forEach(this.observerCallbacks, (callback) => {
                callback()
            })
        };
    }
}

angular.module('auroraApp')
	.service('NotificationService', auroraApp.Services.NotificationService);