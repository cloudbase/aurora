/// <reference path="../_all.ts" />


declare module auroraApp {
    interface ISearchFilter {
        name: string
        status: string
    }
    interface IComputeCtrl {
        
    }
    interface ISearchField {
        id: string
        name: string
        type: string
        options: any
        term: string
    }
    interface IVmAction {
        id: string
        name: string
        action: any
        available: boolean
    }
    interface IPositionXY {
        x: number
        y: number
    }
    interface IVmWidget {
        id: string
        name: string
        label: string
        position: IPositionXY
        size: string
        default_settings: any
        settings?: any
    }
    
}