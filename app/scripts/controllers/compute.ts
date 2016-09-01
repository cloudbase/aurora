/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    
    export class ComputeCtrl implements IComputeCtrl {
        filterStatuses: string[] = []
        search: ISearchFilter = {name: "", status: ""}
        filter: ng.IFilterProvider
        endpoints: string[] = []
        newVmName: string
        sortType: string = ""
        sortReverse = false
        selected: any
        currentFilters: any = []
        filters: ISearchField[] = [
            {id: 'host_status', name: "Status", type: "options", options: [], term: ""},
            {id: 'name', name: "Name", type: "text", options: false, term: ""}
        ]

        static $inject = [
            "$scope",
            "ApiService",
            "$state",
            "$timeout"
        ];

        constructor(
            isolateScope: Directives.IVmListScope,
            public apiService: Services.IApiService,
            private $state: any,
            private $timeout: ng.ITimeoutService)
        {
            let rand = Math.floor((Math.random() * 100) + 1)
            this.newVmName = "machine-" + rand;

            // populate filter with terms
            this.filters.forEach((filterItem) => {
                switch (filterItem.id) {
                    case "host_status": 
                        this.apiService.listItems.forEach((vm: VmItem) => {
                            let found = false
                            filterItem.options.forEach((option) => {
                                if (option.term == vm.host_status)
                                    found = true
                            })
                            if (!found) 
                                filterItem.options.push({term: vm.host_status, selected: true})
                        })
                        break
                }
                    
            })
            
        }

        pauseVm(obj: VmItem)
        {
            console.log(obj);
            if (obj.host_status == "paused" || obj.host_status == "stopped") {
                obj.host_status = "running";
            } else {
                obj.host_status = "paused";
            }

        }

        startVm(obj: VmItem)
        {

        }

        restartVm(obj: VmItem)
        {
            obj.host_status = "restarting";
            this.$timeout(() => {
                obj.host_status = "running"
            }, 7000)

        }
        
        editName(obj: VmItem)
        {
            obj.edit_state = true
            obj.prev_name = obj.name
        }
        
        saveName(obj:VmItem)
        {
            let vmProperty: Services.IVmProperty = {
                name: 'name',
                value: obj.name
            }
            this.apiService.setVmProperty(obj.id, [vmProperty]).then(() => {
                obj.edit_state = false  
            })
        }

        sortTable(column: string) {
            if (this.sortType != column) {
                this.sortType = column;
            } else {
                if (this.sortReverse == false) {
                    this.sortReverse = true
                } else {
                    this.sortType = "";
                    this.sortReverse = false;
                }
            }
        }

        filterTable(option, filterField: ISearchField) {
            option.selected = !option.selected
        }
        
        cancelEdit(obj: VmItem) {
            obj.edit_state = false
            obj.name = obj.prev_name
        }

        selectFilter(item) {
            let exists = false
            this.currentFilters.forEach((filter) => {
                if (filter.id == item.id)
                    exists = true
            })
            if (exists) 
                return
            
            this.currentFilters.push(item);
            if (item.type == "options") {
                if (item.id == "status") {
                    
                }
            }
        }

        removeFilter(item) {
            console.log(item)
            let index = this.currentFilters.indexOf(item)
            this.currentFilters.splice(index, 1)
        }

        createVm() {
            let image = this.apiService.vmImages.filter((vmImage:IVmImage):boolean => {
                return vmImage.selected == true
            })[0]

            let flavor = this.apiService.vmFlavors.filter((vmFlavor:IVmFlavor):boolean => {
                return vmFlavor.selected == true
            })[0]

            let networks = this.apiService.networkList.filter((vmNetwork:IVmNetwork):boolean => {
                return vmNetwork.selected == true
            })

            let network_interfaces: INetworkInterface[] = []
            
            networks.forEach((network) => {
                network_interfaces.push({
                    network: network,
                    ip_addr: network.allocateIp()
                })
            })

            let rand = Math.floor((Math.random() * 100) + 1)

            let newVm = new VmItem(
                "machine-" + rand,
                 this.newVmName, //image.name + "-" + flavor.name + "-" + rand,
                "deploying",
                new Date(),
                image,
                networks,
                flavor,
                [],
                network_interfaces
            );

            this.$timeout(() => {
                newVm.host_status = "running"
            }, 10000)

            this.apiService.insertVm(newVm);

            this.$state.go("vm-list");

        }

        newVm() {
            angular.forEach(this.apiService.vmImages, (flavor:IVmImage) => {
                flavor.selected = false;
            })
            this.apiService.vmImages[0].selected = true
            angular.forEach(this.apiService.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.apiService.vmFlavors[0].selected = true
            this.apiService.project.additional_cost = this.apiService.vmFlavors[0].price 

            this.apiService.vmNetworks[Object.keys(this.apiService.vmNetworks)[0]].selected = true

            this.$state.go("vm-create");
        }

        deleteVm(vm: VmItem) {
            let index = this.apiService.listItems.indexOf(vm);
            console.log(index)
            this.apiService.listItems.splice(index, 1); 
            
            //this.apiService.updateVm(this.item)
        }

        selectImage(obj: IVmImage) {
            angular.forEach(this.apiService.vmImages, (flavor:IVmImage) => {
                flavor.selected = false;
            })
            obj.selected = true
        }

        selectFlavor(obj: IVmFlavor) {
            angular.forEach(this.apiService.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.apiService.project.additional_cost = obj.price
            obj.selected = true
        }
        
        selectNetwork(obj: IVmNetwork) {
            obj.selected = !obj.selected
        }

        /**
         * Goes to the VM details page
         */
        selectVm(vm: VmItem = null):void 
        {
            this.$state.go('vm-view-overview', {vm_id: vm.id});
        }
    }
}

angular.module('auroraApp')
  .controller('ComputeCtrl', auroraApp.ComputeCtrl)