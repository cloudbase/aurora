/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class FlavorsCtrl {
        initialCost = 0
        resize = false
        lists: string[] = []
        activeList: string = "recommended"
        static $inject = [
            "$scope",
            "ApiService",
            "$stateParams"
        ]
        constructor(isolateScope: Directives.IVmListScope, public apiService: Services.IApiService, public $stateParams) {
            let flavor = this.apiService.vmFlavors.filter((vmFlavor:IVmFlavor):boolean => {
                return vmFlavor.selected == true
            })[0]
            
            if ($stateParams.type == 'edit') {
                this.initialCost = flavor.price
                this.resize = true;
            }
            )

            apiService.vmFlavors.forEach((flavor:VmFlavor) => {
                flavor.lists.forEach((list) => {
                    if (this.lists.indexOf(list) == -1)
                        this.lists.push(list)
                })
            })
        }

        selectFlavor(obj: IVmFlavor) {
            angular.forEach(this.apiService.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            // get the difference from the previously selected with the newly selected
            this.apiService.project.additional_cost = obj.price - this.initialCost
            obj.selected = true
        }

        resizeFlavor() {
            let flavor: IVmFlavor = null
            this.apiService.vmFlavors.forEach((vmFlavor:IVmFlavor) => {
                if (vmFlavor.selected == true)
                    flavor = vmFlavor
            })
            this.apiService.listItems.forEach((vmItem:VmItem) => {
              if (vmItem.id == this.$stateParams.vm_id) {
                vmItem.flavor = flavor
              }
            })
        }

        favoriteFlavor(obj:VmFlavor) {
            let index = obj.lists.indexOf("favorites")
            if (index == -1) {
                obj.lists.push("favorites")
            } else {
                obj.lists.splice(index, 1)
            }
        }

        changeCategory(category) {
            this.activeList = category
        }
        
    }

}

angular.module('auroraApp')
  .controller('FlavorsCtrl', auroraApp.FlavorsCtrl)