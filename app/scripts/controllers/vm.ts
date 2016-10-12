/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class VmCtrl  {
        item: VmItem
        static $inject = [
            "ApiService",
            "$state",
            "$stateParams",
            "$timeout",
        ]
        actions: IVmAction[] = [
            {id: "stop", name: "Stop", action: this.haltVm, available: true},
            {id: "start", name: "Start", action: this.startVm, available: true},
            {id: "restart", name: "Restart", action: this.restartVm, available: true}
        ]

        constructor(
            public apiService: Services.ApiService,
            private $state,
            private $stateParams,
            private $timeout: ng.ITimeoutService
        ) {
            this.item = <VmItem> apiService.getVm($stateParams.vm_id)
            apiService.vmFlavors.forEach((flavor) => {
                flavor.selected = false
                if (this.item.flavor == flavor)
                    flavor.selected = true
            })
            apiService.project.additional_cost = 0
            
        }

        // TODO: Put network functions in own controller

        addInterface(network_obj:IVmNetwork) {
            let network_interface: INetworkInterface
            network_interface = {
                network: network_obj,
                ip_addr: network_obj.allocateIp()
            }
            this.item.network_interfaces.push(network_interface)
        }

        removeInterface(networkInterface: INetworkInterface) {
            networkInterface.floating_ip.assigned_to = null

            let index = this.item.network_interfaces.indexOf(networkInterface)
            this.item.network_interfaces.splice(index, 1)
        }

        availableFloatingIps(floating_ip: IFloatingIp) {
            return floating_ip.assigned_to == null
        }

        selectFloatingIp(floatingIp: IFloatingIp, networkInterface:INetworkInterface) {
            networkInterface.floating_ip = floatingIp
            floatingIp.assigned_to = networkInterface
        }

        releaseFloatingIp(network_interface: INetworkInterface) {
            network_interface.floating_ip.assigned_to = null
            network_interface.floating_ip = null
        }

        createSnapshot() {
            let name = this.item.name + "_sp_" + (this.item.snapshots.length + 1)
            let id = Math.floor((Math.random() * 1000) + 1) + " " + Math.floor((Math.random() * 1000) + 1)
            let snapshot = new VmSnapshot(id, name, this.item.flavor.ssd, new Date())
            
            this.item.snapshots.push(snapshot)
            
            this.apiService.updateVm(this.item)
        }

        deleteSnapshot(obj: VmSnapshot) {
            let index = this.item.snapshots.indexOf(obj);
            this.item.snapshots.splice(index, 1); 

            this.apiService.updateVm(this.item)
        }

        haltVm() 
        {
            this.item.host_status = "stopped"
        }

        startVm()
        {
            this.item.host_status = "running"
        }

        restartVm()
        {
            console.log(this)
            this.item.host_status = "restarting"
            this.$timeout(() => {
                this.item.host_status = "running"
            }, 7000)
        }

        selectAction(action: IVmAction, vm: VmItem)
        {
            console.log(action, vm)
            action.action()
        }
    }
}

angular.module('auroraApp')
  .controller('VmCtrl', auroraApp.VmCtrl)