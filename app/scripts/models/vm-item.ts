/// <reference path="../_all.ts" />

'use strict';
module auroraApp {
    export interface IVmItem {
        id: string
        name: string
        prev_name: string
        host_status: string
        image: IVmImage
        created: Date
        edit_state: boolean
        flavor: IVmFlavor
        snapshots: IVmSnapshot[] 
    }
    export class VmItem implements IVmItem {
        prev_name: string
        constructor(
            public id: string,
            public name: string,
            public host_status: string,
            public created: Date,
            public image: IVmImage,
            public ip_addr: string[],
            public flavor: IVmFlavor,
            public snapshots: IVmSnapshot[],
            public edit_state:boolean = false) {
        }
    }

    export interface IVmSnapshot {
        name: string
        dateCreated: Date
        size: number
    }

    export class VmSnapshot {
        constructor(
            public name,
            public dateCreated,
            public size
        ) {}
    }

    export interface IVmImage {
        id: string
        name: string
        os: string
        version: string
        selected: boolean
    }
    export class VmImage implements IVmImage {
        constructor(
            public id: string,
            public name: string,
            public os: string,
            public version: string,
            public selected: boolean = false
        ) {

        }
    }

    export interface IVmFlavor {
        name: string
        vCpu: number
        ram: number
        ssd: number
        price: number
        lists: string[]
        selected: boolean
    }
    export class VmFlavor implements IVmFlavor {
        constructor(
            public name: string,
            public vCpu: number,
            public ram: number,
            public ssd: number,
            public price: number,
            public lists: string[],
            public selected: boolean = false
        ) {}
    }

    export interface IVmNetwork {
        name: string
        subnet: string
        state: string
        shared: string
        selected: boolean
    }
    export class VmNetwork implements IVmNetwork {
        constructor(
            public name: string,
            public subnet: string,
            public state: string,
            public shared: string,
            public selected: boolean = false
        ) {}
    }

    export interface IProject {
        vm_limit: number
        vcpu_limit: number
        vram_limit: number
        storage_limit: number
        monthly_budget: number
        currency: string
        inital_cost: number
    }
    export class Project implements IProject {
        current_vm: number
        current_vcpu: number
        current_vram: number
        current_cost: number
        current_storage: number
        additional_cost: number = 0
        inital_cost: number = 0
        constructor(
            public vm_limit,
            public vcpu_limit,
            public vram_limit,
            public storage_limit,
            public monthly_budget,
            public currency
        ) {}
    }
} 