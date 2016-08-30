/// <reference path="../_all.ts" />

declare module auroraApp {
    export interface IVmDetailsScope extends ng.IScope {
        vm: VmItem
        collection: VmItem[]
    }
  
    export interface IStoreParams extends ng.route.IRouteParamsService {
        id_vm: string 
    }
}