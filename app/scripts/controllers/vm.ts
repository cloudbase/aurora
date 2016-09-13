/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class VmCtrl  {
        item: VmItem
        static $inject = [
            "ApiService",
            "$state",
            "$stateParams"
        ]

        constructor(
            public apiService: Services.ApiService,
            private $state,
            private $stateParams
        ) {
            this.item = apiService.getVm($stateParams.vm_id)
            apiService.vmFlavors.forEach((flavor) => {
                flavor.selected = false
                if (this.item.flavor == flavor)
                    flavor.selected = true
            })
            apiService.project.additional_cost = 0
            console.log(apiService.project.floating_ips)
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
            let snapshot = new VmSnapshot(
                name, new Date(), 4
            )
            this.item.snapshots.push(snapshot)
            
            this.apiService.updateVm(this.item)
        }

        deleteSnapshot(obj: VmSnapshot) {
            let index = this.item.snapshots.indexOf(obj);
            this.item.snapshots.splice(index, 1); 

            this.apiService.updateVm(this.item)
        }
    }
}

angular.module('auroraApp')
  .controller('VmCtrl', auroraApp.VmCtrl)