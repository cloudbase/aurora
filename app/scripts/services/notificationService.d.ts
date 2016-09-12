/// <reference path="../_all.ts" />

declare module auroraApp.Services {
    export interface INotificationService {
        notifications: INotification[]
        addNotification(message: string, type: string)
    }

    export interface INotification {
        name: string
        message: string
        date: Date
        new: boolean
        seen: boolean
    }
}