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

            console.log(this.notifications)
        }
    }
}

angular.module('auroraApp')
	.service('NotificationService', auroraApp.Services.NotificationService);