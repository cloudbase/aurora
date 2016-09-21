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
        name: string
        position: IPositionXY
        size: string
        settings: any
    }
    
}