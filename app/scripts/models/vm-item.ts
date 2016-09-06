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
        networks: IVmNetwork[]
        flavor: IVmFlavor
        zone: string
        snapshots: IVmSnapshot[]
        network_interfaces: INetworkInterface[]
    }
    export class VmItem implements IVmItem {
        prev_name: string
        constructor(
            public id,
            public name,
            public host_status,
            public created,
            public image,
            public networks,
            public flavor,
            public zone,
            public snapshots,
            public network_interfaces,
            public edit_state = false) {
        }
    }

    export interface IFloatingIp {
        id: string
        ip: string
        assigned_to?: INetworkInterface
    }

    export interface INetworkInterface {
        network: IVmNetwork
        ip_addr: string
        floating_ip?: IFloatingIp
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

    export interface IAllocationPool {
        start: string
        end: string
    }

    export interface IVmNetwork {
        name: string
        type: string
        subnet: string
        network_interface: string
        ip_address: string
        state: string
        shared: string
        allocation_pools: IAllocationPool[]
        selected: boolean
        allocateIp: Function
    }
    export class VmNetwork implements IVmNetwork {
        allocated_ips: string[] = []
        constructor(
            public name: string,
            public type: string,
            public subnet: string,
            public network_interface: string,
            public ip_address: string,
            public state: string,
            public shared: string,
            public allocation_pools: IAllocationPool[],
            public selected: boolean = false
        ) {}
        allocateIp():string {
            let ip = this.allocation_pools[0].start.split(".")
            let start = Number(ip[3])
            let end = Number(this.allocation_pools[0].end.split(".")[3])
            let ip_prefix = ip[0] + "." + ip[1] + "." + ip[2] + "." 
            for (let _i = start; _i <= end; _i++) {
                if (this.allocated_ips.indexOf(ip_prefix + _i) == -1) {
                    this.allocated_ips.push(ip_prefix + _i)
                    return ip_prefix + _i
                }
            }
        }
    }

    export interface IZone {
        id: string,
        name: string
    }

    export interface IProject {
        vm_limit: number
        vcpu_limit: number
        vram_limit: number
        storage_limit: number
        monthly_budget: number
        currency: string
        inital_cost: number
        zones: IZone[]
        floating_ips: IFloatingIp[]
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
            public currency,
            public zones,
            public floating_ips
        ) {}
    }
} 