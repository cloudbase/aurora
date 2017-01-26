/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class ProjectCtrl {
        additionalCostPercent: number = 0
        static $inject = [
            "$scope",
            "ComputeService"
        ]
        constructor(isolateScope: ng.IScope, public compute: Services.IComputeService) {
            this.calculate_values()
        }

        calculate_values() {
            this.compute.project.current_cost = 0
            this.compute.project.current_vm = 0
            this.compute.project.current_vcpu = 0
            this.compute.project.current_vram = 0
            this.compute.project.current_storage = 0
            
            this.compute.listItems.forEach((item:VmItem) => {
                this.compute.project.current_cost += item.flavor.price
                this.compute.project.current_vm++
                this.compute.project.current_vcpu += item.flavor.vCpu
                this.compute.project.current_vram += item.flavor.ram
                this.compute.project.current_storage += item.flavor.ssd
            })
            
        }
    }
}

angular.module('auroraApp')
  .controller('ProjectCtrl', auroraApp.ProjectCtrl)