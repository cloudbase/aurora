/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class ProjectCtrl {
        additionalCostPercent: number = 0
        static $inject = [
            "$scope",
            "ApiService"
        ]
        constructor(isolateScope: ng.IScope, public apiService: Services.IApiService) {
            this.calculate_values()
        }

        calculate_values() {
            this.apiService.project.current_cost = 0
            this.apiService.project.current_vm = 0
            this.apiService.project.current_vcpu = 0
            this.apiService.project.current_vram = 0
            this.apiService.project.current_storage = 0
            
            this.apiService.listItems.forEach((item:VmItem) => {
                this.apiService.project.current_cost += item.flavor.price
                this.apiService.project.current_vm++
                this.apiService.project.current_vcpu += item.flavor.vCpu
                this.apiService.project.current_vram += item.flavor.ram
                this.apiService.project.current_storage += item.flavor.ssd
            })
            
        }
    }
}

angular.module('auroraApp')
  .controller('ProjectCtrl', auroraApp.ProjectCtrl)