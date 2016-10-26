/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    
    export class ComputeCtrl implements IComputeCtrl {
        filterStatuses: string[] = []
        search: ISearchFilter = {name: "", status: ""}
        filter: ng.IFilterProvider
        endpoints: string[] = []
        newVmName: string
        vmVolumes: VmVolume[]
        sortType: string = ""
        sortReverse = false
        selected: any
        count: number = 1
        zone: any
        currentFilters: any = []
        validation = {
            security_groups: true
        }
        reloadDirectives: boolean = true
        
        src_category_selected = "images"
        
        vmAvailableWidgets: IVmWidget[] = [
            {
                id: "vm-field",
                name: "vm-field",
                label: "Virtual Machine Information",
                position: {x:0, y:0}, 
                size: "3x2",
                default_settings: {
                    fields: [
                        {field: "id", label: "ID", clipboard: true},
                        {field: "zone", label: "Zone"},
                        {field: "created", label: "Created", type: "date"},
                        {field: "started", label: "Uptime", type: "time_since"}
                    ]
                }
            },
            {
                id: "resource-consumption",
                name: "resource-consumption",
                label: "Average Resource Consumption",
                position: {x:0, y:0}, 
                size: "2x2",
                default_settings: {}
            },
            {
                id: "security-groups",
                name: "security-groups",
                label: "Security Groups",
                position: {x:0, y:0}, 
                size: "2x2",
                default_settings: {}
            },
            {
                id: "vm-tags",
                name: "vm-tags",
                label: "Tags",
                position: {x:0, y:0},
                size: "3x2",
                default_settings: {}
            }
        ]
        vmWidgets: IVmWidget[] = []
        filters: ISearchField[] = [
            {id: 'host_status', name: "Status", type: "options", options: [], term: ""},
            {id: 'name', name: "Name", type: "text", options: false, term: ""},
            {id: 'zone', name: "Zone", type: "options", options: [], term: ""},
            {id: 'tags', name: "Tags", type: "tags", options: [], term: ""},
        ]
        bulkActions: IVmAction[] = [
            {id: "stop", name: "Stop", action: this.haltVm, available: true},
            {id: "start", name: "Start", action: this.startVm, available: true},
            {id: "restart", name: "Restart", action: this.haltVm, available: true}
        ]

        static $inject = [
            "$scope",
            "ApiService",
            "$state",
            "$timeout",
            "Notification",
            "NotificationService",
            "$uibModal"
        ];

        constructor(
            private $scope: ng.IScope,
            public apiService: Services.IApiService,
            private $state: any,
            private $timeout: ng.ITimeoutService,
            private Notification: any,
            private notificationService: Services.INotificationService,
            private $uibModal: any)
        {
            let rand = Math.floor((Math.random() * 100) + 1)
            this.newVmName = "machine-" + rand;

            this.zone = {}
            this.zone.value = this.apiService.project.zones[0]
    
            $scope.$on("select_image", () => {
                this.resetSourceSelection()
                this.src_category_selected = "images"
                
            })

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
                    case "zone":
                        this.apiService.project.zones.forEach((zone) => {
                            filterItem.options.push({term: zone.name, selected: true})
                        });
                }
                    
            })
            this.vmAvailableWidgets.forEach((widget) => {
                let newWidget: IVmWidget = widget
                newWidget.settings = newWidget.default_settings 
                this.vmWidgets.push(newWidget)
            })
            
        }

        manageWidgets(vm: VmItem) {
            let self = this

            var modalInstance = this.$uibModal.open({
                animation: true,
                size: "xl",
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/manage-vm-widgets.html',
                controller: ($scope, $uibModalInstance, vm, widgets, all_widgets) => {
                    $scope.vm = vm
                    $scope.widgets = widgets
                    $scope.show = true
                    $scope.selected = null
                    $scope.all_widgets = all_widgets
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.save = () => {
                        self.vmWidgets = widgets
                        self.reloadDirectives = !self.reloadDirectives
                        $uibModalInstance.close(true);
                    }
                    $scope.selectWidget = (item, model) => {
                        $scope.selected = item
                    }
                    $scope.addWidget = () => {
                        if ($scope.selected != null) {
                            $scope.show = !$scope.show
                            
                            let new_Item = angular.copy($scope.selected)
                            let rand = Math.floor((Math.random() * 100) + 1)
                            
                            new_Item.id = new_Item.id + "_" + rand
                            $scope.widgets.push(new_Item)
                        }
                    }
                },
                resolve: {
                    vm: () => {
                        return vm
                    },
                    widgets: () => {
                        return self.vmWidgets 
                    },
                    all_widgets: () => {
                        return self.vmAvailableWidgets
                    }
                }
            });
        
            modalInstance.result.then(function (selectedItem) {
                
            }, function () {
                
            });
        }

        pauseVm(obj: VmItem)
        {
            if (obj.host_status == "paused" || obj.host_status == "stopped") {
                obj.host_status = "running";
                this.Notification.info("VM: " + obj.name + " is running")
            } else {
                obj.host_status = "paused";
                this.Notification.info("VM: " + obj.name + " is paused")
            }

        }

        startVm(obj: VmItem)
        {
            obj.host_status = "running";
            this.Notification.info("Starting VM: " + obj.name)
        }

        restartVm(obj: VmItem)
        {
            obj.host_status = "restarting";
            this.$timeout(() => {
                obj.host_status = "running"
            }, 7000)

            this.Notification.info("Rebooting VM: " + obj.name)
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

        sortTable(column: string) 
        {
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

        filterTable(option, filterField: ISearchField) 
        {
            option.selected = !option.selected
        }
        
        cancelEdit(obj: VmItem) 
        {
            obj.edit_state = false
            obj.name = obj.prev_name
        }

        selectFilter(item) 
        {
            if (item.id == "tags") {
                this.apiService.listItems.forEach((vm: VmItem) => {
        
                    if (vm.tags.length) {
                        vm.tags.forEach((tag) => {
                            let found = false
                            item.options.forEach((option) => {
                    
                                if (option.term == tag)
                                    found = true
                            })
                            if (!found)
                                item.options.push({term: tag, selected: false})
                        })
                    }
        
                })
            }
            console.log(item)
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

        removeFilter(item) 
        {
            let index = this.currentFilters.indexOf(item)
            this.currentFilters.splice(index, 1)
        }

        createVm() 
        {
            let newVm: IVmItem
            let network_interfaces: INetworkInterface[]
            let rand: number

            for (let _i = 1; _i <= this.count; _i++) {
                let image = null
                switch (this.src_category_selected) {
                    case "images":
                        image = this.apiService.vmImages.filter((vmImage:IVmImage):boolean => {
                            return vmImage.selected == true
                        })[0]
                        break;
                    case "volumes":
                        let volume = this.apiService.vmVolumes.filter((vmVolume:VmVolume):boolean => {
                            return vmVolume.selected == true
                        })[0]
                        image = new VmImage(
                          volume.id,
                          volume.name,
                          "volume",
                          null,
                          volume.size,
                          "volume",
                          new Date(),
                          [],
                          {source: volume})
                        break;
                    case "snapshots":
                        let snapshot = this.apiService.vmSnapshots.filter((vmSnapshot:VmSnapshot):boolean => {
                            return vmSnapshot.selected == true
                        })[0]
                        image = new VmImage(
                          snapshot.id,
                          snapshot.name,
                          "snapshot",
                          null,
                          snapshot.size,
                          "snapshot",
                          new Date(),
                          [],
                          {source: snapshot})
                        break;
                }
                console.log(image)
    
                let flavor = this.apiService.vmFlavors.filter((vmFlavor:IVmFlavor):boolean => {
                    return vmFlavor.selected == true
                })[0]
    
                let networks = this.apiService.networkList.filter((vmNetwork:IVmNetwork):boolean => {
                    return vmNetwork.selected == true
                })
    
                network_interfaces = []
                
                networks.forEach((network) => {
                    network_interfaces.push({
                        network: network,
                        ip_addr: network.allocateIp()
                    })
                })
    
                rand = Math.floor((Math.random() * 100) + 1)
                
    
                newVm = new VmItem(
                    "machine-" + rand + _i,
                     this.newVmName, //image.name + "-" + flavor.name + "-" + rand,
                    "deploying",
                    new Date(),
                    image,
                    networks,
                    flavor,
                    this.zone.value.name,
                    [],
                    network_interfaces,
                    []
                )
    
                this.$timeout(() => {
                    newVm.host_status = "running"
                    this.Notification.success("VM '" + newVm.name +  "' is running")
                }, 10000)
    
                this.apiService.insertVm(newVm);

                this.Notification.primary("Deploying VM: " + "machine-" + rand + _i, " - status: deploying")
            }

            this.$state.go("vm-list");

        }

        newVm() 
        {
            angular.forEach(this.apiService.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.apiService.vmFlavors[0].selected = true
            
            this.apiService.project.additional_cost = this.apiService.vmFlavors[0].price 

            this.apiService.vmNetworks[Object.keys(this.apiService.vmNetworks)[0]].selected = true

            this.$state.go("vm-create");
        }

        deleteVm(vm: VmItem) 
        {
            let index = this.apiService.listItems.indexOf(vm);
            
            this.apiService.listItems.splice(index, 1); 
            
            this.Notification.info("Deleted VM: " + vm.name)
            //this.apiService.updateVm(this.item)
        }

        haltVm(vm: VmItem) 
        {
            if (vm.host_status != "stopped") {
                vm.host_status = "stopped"
                this.Notification.info("Stopped VM: " + vm.name)
            }
        } 

        selectImage(obj: IVmImage) {
            this.resetSourceSelection()
            obj.selected = true
            this.src_category_selected = "images"
        }
    
        selectVolume(volume:VmVolume)
        {
            this.resetSourceSelection()
            volume.selected = true
            this.src_category_selected = "volumes"
        }
    
        selectSnapshot(snapshot:VmSnapshot)
        {
            this.resetSourceSelection()
            snapshot.selected = true
            this.src_category_selected = "snapshots"
        }
        
        resetSourceSelection()
        {
            angular.forEach(this.apiService.vmSnapshots, snapshot => snapshot.selected = false)
            angular.forEach(this.apiService.vmVolumes, volume => volume.selected = false)
            angular.forEach(this.apiService.vmImages, flavor => flavor.selected = false)
        }

        selectFlavor(obj: IVmFlavor) 
        {
            angular.forEach(this.apiService.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.apiService.project.additional_cost = obj.price
            obj.selected = true
        }
        
        selectNetwork(obj: IVmNetwork) 
        {
            obj.selected = !obj.selected
        }

        /**
         * Goes to the VM details page
         */
        selectVm(vm: VmItem = null):void 
        {
            this.$state.go('vm-view-overview', {vm_id: vm.id});
        }
    
        selectSecurityGroup(group: ISecurityGroup)
        {
            group.selected = !group.selected
        }

        /**
         * Executes bulk actions on selected VMs
         */
        bulkAction(action: IVmAction) 
        {
            let selected = 0
            this.apiService.listItems.forEach((item: VmItem) => {
                if (item.checked) {
                    action.action(item)
                    item.checked = false
                    selected++
                }
            })
            if (selected == 0) {
                this.Notification.warning("Error: No VMs are selected.")
            } else {
                this.Notification.success("Performed " + action.name + " on " + selected + " VMs");
            }
        }
        
        checkVm(vm: VmItem) 
        {
            vm.checked = !vm.checked
        }

        detailVm(vm: VmItem) 
        {
            vm.detail_view = !vm.detail_view
        }
        

        /**
         * Calculates the number of ip's of vm. Used for templating.
         */
        numOfIps(vm: VmItem) 
        {
            let num = 0
            vm.network_interfaces.forEach((item:INetworkInterface) => {
                num++ // always has internal ip address assigned
                if (item.floating_ip)
                    num++ // if has floating ip, increment
            })

            return num
        }
    }
}

angular.module('auroraApp')
  .controller('ComputeCtrl', auroraApp.ComputeCtrl)