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
        networks: IVmNetwork[]
        flavor: IVmFlavor
        zone: string
        snapshots: IVmSnapshot[]
        network_interfaces: INetworkInterface[]
        started: Date
        tags: string[]
    }
    export class VmItem implements IVmItem {
        prev_name: string
        checked = false
        detail_view = false
        edit_state = false
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
            public tags,
            public started = new Date()
        ) {}
    }

    export interface IFloatingIp {
        id: string
        ip: string
        assigned_to?: INetworkInterface
        assigned_vm?: VmItem
    }

    export interface INetworkInterface {
        network: IVmNetwork
        ip_addr: string
        floating_ip?: IFloatingIp
    }

    export interface IVmImage {
        id: string
        name: string
        os: string
        version: string
        selected: boolean
        type: string
        size: number
        tags: string[]
        dateCreated: Date
        extra ?: any
    }
    export class VmImage implements IVmImage {
        constructor(
            public id: string,
            public name: string,
            public os: string,
            public version: string,
            public size: number,
            public type: string,
            public dateCreated: Date,
            public tags: string[],
            public extra: any = null,
            public selected: boolean = false
        ) {

        }
    }
    
    export interface IVmSnapshot {
        id: string
        name: string
        size: number
        region: IZone
        dateCreated: Date
        selected: boolean
    }
    
    export class VmSnapshot implements IVmSnapshot {
        selected: boolean = false
        constructor(
          public id,
          public name,
          public size,
          public region,
          public dateCreated
        ) {}
    }
    
    export interface IVolumeAttachment {
        vm: VmItem
        path: string
    }
    
    export interface IVmVolume {
        id: string
        name: string
        description: string
        size: number
        attached_to: IVolumeAttachment
        status: string
        type: string
        region: IZone
        bootable: boolean
        encrypted: boolean
    }
    
    export class VmVolume implements IVmVolume {
        selected = false
        selectedVm = false
        constructor(
          public id,
          public name,
          public description,
          public size,
          public attached_to,
          public status,
          public type,
          public region,
          public bootable,
          public encrypted
        ) {}
        
        attachVm(vm:VmItem):void {
            this.attached_to= {
                vm: vm,
                path: "/dev/sdb"
            }
        }
        detachVm(vm:VmItem):void {
            let attachment:IVolumeAttachment = {
                vm: vm,
                path: "/dev/sdb"
            }
            let index = this.attached_to.indexOf(attachment)
            this.attached_to.splice(index, 1)
        }
    }

    export interface IVmFlavor {
        name: string
        vCpu: number
        ram: number
        ssd: number
        price: number
        tags: string[]
        selected: boolean
    }
    export class VmFlavor implements IVmFlavor {
        constructor(
            public name: string,
            public vCpu: number,
            public ram: number,
            public ssd: number,
            public price: number,
            public tags: string[],
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
        admin_state: boolean
        allocateIp: Function
    }
    export class VmNetwork implements IVmNetwork {
        allocated_ips: string[] = []
        admin_state = true
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
    
    export interface IRouterInterface {
        name: string
        ip: string
        route1: string
        route2: string
    }
    
    export interface IRouter {
        name: string
        interfaces: IRouterInterface[]
    }
    
    export class NetworkRouter implements IRouter {
        constructor(public name, public interfaces) {}
    }

    export interface IZone {
        id: string,
        name: string
    }
    
    export interface ISecurityGroup {
        name: string
        rules: any
        selected: boolean
    }

    export interface IProject {
        vm_limit: number
        vcpu_limit: number
        vram_limit: number
        storage_limit: number
        volumes_limit: number
        monthly_budget: number
        currency: string
        inital_cost: number
        zones: IZone[]
        floating_ips: IFloatingIp[]
        floating_ip_limit: number
        security_groups: ISecurityGroup[]
    }
    export class Project implements IProject {
        current_vm: number
        current_vcpu: number
        current_vram: number
        current_cost: number
        current_volumes: number
        current_storage: number
        additional_cost: number = 0
        inital_cost: number = 0
        constructor(
            public vm_limit,
            public vcpu_limit,
            public vram_limit,
            public storage_limit,
            public volumes_limit,
            public monthly_budget,
            public currency,
            public zones,
            public floating_ips,
            public floating_ip_limit,
            public security_groups
        ) {}
    }
    
    
} 