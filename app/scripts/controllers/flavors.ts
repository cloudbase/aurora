/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class FlavorsCtrl {
        initialCost = 0
        resize = false
        tags: string[] = []
        activeList: string = "recommended"
        static $inject = [
            "$scope",
            "ComputeService",
            "$stateParams"
        ]
        constructor(isolateScope: Directives.IVmListScope, public compute: Services.IComputeService, public $stateParams) {
            let flavor = this.compute.vmFlavors.filter((vmFlavor:IVmFlavor):boolean => {
                return vmFlavor.selected == true
            })[0]
            console.log(this.compute)
            if ($stateParams.type == 'edit') {
                this.initialCost = flavor.price
                this.resize = true
            }

            this.compute.vmFlavors.forEach((flavor:VmFlavor) => {
                if (flavor.tags) {
                    flavor.tags.forEach((list) => {
                        if (this.tags.indexOf(list) == -1)
                            this.tags.push(list)
                    })
                }
            })
        }

        selectFlavor(obj: IVmFlavor) {
            angular.forEach(this.compute.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            // get the difference from the previously selected with the newly selected
            this.compute.project.additional_cost = obj.price - this.initialCost
            obj.selected = true
        }

        resizeFlavor() {
            let flavor: IVmFlavor = null
            this.compute.vmFlavors.forEach((vmFlavor:IVmFlavor) => {
                if (vmFlavor.selected == true)
                    flavor = vmFlavor
            })
            this.compute.listItems.forEach((vmItem:VmItem) => {
              if (vmItem.id == this.$stateParams.vm_id) {
                vmItem.flavor = flavor
              }
            })
        }

        favoriteFlavor(obj:VmFlavor) {
            let index = obj.tags.indexOf("favorites")
            if (index == -1) {
                obj.tags.push("favorites")
            } else {
                obj.tags.splice(index, 1)
            }
        }

        changeCategory(category) {
            this.activeList = category
        }
        
    }

}

angular.module('auroraApp')
  .controller('FlavorsCtrl', auroraApp.FlavorsCtrl)