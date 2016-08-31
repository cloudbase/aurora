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
    
}