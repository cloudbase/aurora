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
        }

        removeInterface(networkInterface: INetworkInterface) {
            let index = this.item.network_interfaces.indexOf(networkInterface)
            this.item.network_interfaces.splice(index, 1)
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