/// <reference path="../_all.ts" />

'use strict';
module auroraApp {
    export interface IVmItem {
        id: string
        name: string
        prev_name: string
        host_status: string
        compute: Services.ComputeService
        image: IVmImage
        created: Date
        networks: INetwork[]
        volumes: IVmVolume
        flavor: IVmFlavor
        zone: string
        snapshots: IVmSnapshot[]
        network_interfaces: any[]
        ports: any[]
        started: Date
        tags: string[]
    }
    export class VmItem implements IVmItem {
        prev_name: string
        checked = false
        detail_view = false
        edit_state = false
        ports = []
        constructor(
            public compute,
            public id,
            public name,
            public host_status,
            public created,
            public image,
            public networks,
            public volumes,
            public flavor,
            public zone,
            public snapshots,
            public network_interfaces,
            public tags,
            public started = new Date()
        ) {}
        
        canChangeState(state: string)
        {
            switch (state) {
                case "PAUSE":
                    break;
                case "UNPAUSE":
                    break;
            }
        }
        
        pause(callback = null)
        {
            this.compute.setVmState(this, "PAUSE").then(response => {
                this.host_status = "PAUSED"
                if (callback) callback()
            })
        }
        unpause(callback = null)
        {
            this.compute.setVmState(this, "UNPAUSE").then(response => {
                this.host_status = "ACTIVE"
                if (callback) callback()
            })
        }
        resume(callback = null)
        {
            this.compute.setVmState(this, "RESUME").then(response => {
                this.host_status = "ACTIVE"
                if (callback) callback()
            })
        }
        reboot(callback = null)
        {
            this.compute.setVmState(this, "REBOOT").then(response => {
                this.host_status = "STARTING"
                if (callback) callback()
            })
        }
        halt(callback = null)
        {
            this.compute.setVmState(this, "SHUTOFF").then(response => {
                this.host_status = "SHUTOFF"
                if (callback) callback()
            })
        }
        start(callback = null)
        {
            this.compute.setVmState(this, "START").then(response => {
                this.host_status = "STARTING"
                if (callback) callback()
            })
        }
    }

    export interface IFloatingIp {
        id: string
        floating_ip_address: string
        fixed_ip_address: string
        status: string
        port_id: string
        router_id: string
        assigned_to?: INetworkInterface
        assigned_vm?: VmItem
    }
    
    export interface IRouter {
        admin_state_up: boolean
        availability_zone_hints: any[]
        availability_zones: IZone
        description: string
        distributed: boolean
        external_gateway_info: any
        ha: boolean
        id: string
        name: string
        routes: any[]
        status: string
        tenant_id: string
        interfaces: IRouterInterface[]
    }

    export interface INetworkInterface {
        network: IVmNetwork|INetwork
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
        migration_status: string
        attachments: any[]
        links: any[]
        availability_zone: IZone
        snapshot_id: string
        metadata: any
        id: string
        name: string
        description: string
        size: number
        attached_to: IVolumeAttachment
        status: string
        volume_type: string
        bootable: boolean
        encrypted: boolean
        user_id: string,
        tags: string[]
    }
    
    export class VmVolume implements IVmVolume {
        selected = false
        selectedVm = false
        constructor(
          public id,
          public name,
          public description,
          public size,
          public snapshot_id,
          public user_id,
          public attachments,
          public attached_to,
          public status,
          public volume_type,
          public links,
          public migration_status,
          public region,
          public bootable,
          public encrypted,
          public availability_zone,
          public metadata,
          public tags
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
        id: string
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
            public id: string,
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
    
    export interface INetwork {
        admin_state_up: boolean
        availability_zone_hints: any
        availability_zones: any
        created_at: string
        description: string
        id: string
        ipv4_address_scope: string
        ipv6_address_scope: string
        mtu: number
        name: string
        "provider:network_type": number
        "provider:physical_network": string
        "provider:segmentation_id": number
        "router:external": boolean
        shared: boolean
        status: string
        subnets: any[]
        tags: any[]
        tenant_id: string
        updated_at: string
        selected: boolean
        subnetCollection: ISubnet[]
    }
    
    export interface ISubnet {
        allocation_pools: any[]
        cidr: string
        created_at: string
        description: string
        dns_nameservers: any[]
        enable_dhcp: boolean
        gateway_ip: string
        host_routes: any[]
        id: string
        ip_version: number
        ipv6_address_mode: any
        ipv6_ra_mode: any
        name: string
        network_id: string
        subnetpool_id: string
        tenant_id: string
        updated_at: string
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
        id: string
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
        security_group_limit: number
        server_groups: ISecurityGroup[]
        server_group_limit: number
    }
    export class Project implements IProject {
        current_vm: number = 0
        current_vcpu: number = 0
        current_vram: number = 0
        current_cost: number = 0
        current_volumes: number = 0
        current_storage: number = 0
        additional_cost: number = 0
        inital_cost: number = 0
        constructor(
            public id,
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
            public security_groups,
            public security_group_limit,
            public server_groups,
            public server_group_limit
        ) {}
    }
    
    
} 