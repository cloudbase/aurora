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
            "ComputeService",
            "$state",
            "$timeout",
            "Notification",
            "$uibModal"
        ];

        constructor(
            private $scope: ng.IScope,
            public compute: Services.ComputeService,
            private $state: any,
            private $timeout: ng.ITimeoutService,
            private Notification: any,
            private $uibModal: any)
        {
            let rand = Math.floor((Math.random() * 100) + 1)
            this.newVmName = "machine-" + rand;

            /*this.zone = {}
            this.zone.value = this.compute.project.zones[0]*/
    
            $scope.$on("select_image", () => {
                this.resetSourceSelection()
                this.src_category_selected = "images"
            })

            // populate filter with terms
            this.filters.forEach((filterItem) => {
                switch (filterItem.id) {
                    case "host_status": 
                        this.compute.listItems.forEach((vm: VmItem) => {
                            let found = false
                            filterItem.options.forEach((option) => {
                                if (option.term == vm.host_status)
                                    found = true
                            })
                            if (!found) 
                                filterItem.options.push({term: vm.host_status, selected: true})
                        })
                        break
                    /*case "zone":
                        this.compute.project.zones.forEach((zone) => {
                            filterItem.options.push({term: zone.name, selected: true})
                        });
                        break*/
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
                    $scope.tempWidgets = angular.copy(widgets)
                    $scope.show = true
                    $scope.selected = null
                    $scope.all_widgets = all_widgets
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.save = () => {
                        self.vmWidgets = $scope.tempWidgets
                        
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
                            $scope.tempWidgets.push(new_Item)
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
        
        linesOfWidgets()
        {
            let widgetCols = 10
            let widthTotal = 0
            this.vmWidgets.forEach(widget => {
                let sizes = widget.size.split("x")
                widthTotal +=  parseInt(sizes[0])
            })
            let lines = ((widthTotal - (widthTotal % widgetCols)) / widgetCols) + 1
            
            if (widthTotal % widgetCols == widthTotal)
                lines = 1
            if (widthTotal % widgetCols == 0)
                lines--
            return lines
        }

        pauseVm(vm: VmItem)
        {
            vm.pause(() => {this.Notification.info("VM: " + vm.name + " is paused")})
        }

        startVm(vm: VmItem)
        {
            vm.start(() => {this.Notification.info("Starting VM: " + obj.name)})
        }

        restartVm(vm: VmItem)
        {
            vm.reboot(() => {this.Notification.info("Vm " + vm.name + " is rebooting")})
        }
        resetVm(vm: VmItem)
        {
            vm.reboot(() => {this.Notification.info("Vm " + vm.name + " reset signal sent")})
        }
        
        haltVm(vm: VmItem)
        {
            vm.halt(() => {this.Notification.info("Stopped VM: " + vm.name)})
        }
    
        unpauseVm(vm: VmItem)
        {
            vm.unpause(() => {this.Notification.info("Unpausing VM: " + vm.name)})
        }
    
        resumeVm(vm: VmItem)
        {
            vm.resume(() => {this.Notification.info("Resuming VM: " + vm.name)})
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
        
        

        selectFilter(item) 
        {
            if (item.id == "tags") {
                this.compute.listItems.forEach((vm: VmItem) => {
        
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
            let newVm: VmItem
            let network_interfaces: INetworkInterface[]
            let rand: number
            let _i = 1;
            for (_i = 1; _i <= this.count; _i++) {
                let image = null
                console.log(this.src_category_selected)
                switch (this.src_category_selected) {
                    case "images":
                        image = this.compute.vmImages.filter((vmImage:IVmImage):boolean => {
                            return vmImage.selected == true
                        })[0]
                        break;
                    case "volumes":
                        let volume = this.compute.vmVolumes.filter((vmVolume:VmVolume):boolean => {
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
                        let snapshot = this.compute.vmSnapshots.filter((vmSnapshot:VmSnapshot):boolean => {
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
    
                let flavor = this.compute.vmFlavors.filter((vmFlavor:IVmFlavor):boolean => {
                    return vmFlavor.selected == true
                })[0]
    
                let networks = this.compute.networks.filter((vmNetwork:INetwork):boolean => {
                    return vmNetwork.selected == true
                })
    
                network_interfaces = []
                
                networks.forEach((network) => {
                    network_interfaces.push({
                        network: network,
                        ip_addr: "127.0.0.1"
                    })
                })
    
                rand = Math.floor((Math.random() * 100) + 1)
                
    
                newVm = new VmItem(
                    this.compute,
                    "machine-" + rand + _i,
                     this.newVmName, //image.name + "-" + flavor.name + "-" + rand,
                    "BUILD",
                    new Date(),
                    image,
                    networks,
                    [],
                    flavor,
                    null,
                    [],
                    network_interfaces,
                    []
                )
                
                this.compute.insertVm(newVm).then((response:any) => {
                    if (!response.error) {
                        this.Notification.primary("Deploying VM: " + "machine-" + rand + _i, " - status: deploying")
                        this.$state.go("vm-list");
                    }
                });

            }
        }

        newVm() 
        {
            
            angular.forEach(this.compute.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.compute.vmFlavors[0].selected = true
            
            this.compute.project.additional_cost = this.compute.vmFlavors[0].price
            
            if (this.compute.networks.length) {
                this.compute.networks[Object.keys(this.compute.networks)[0]].selected = true
                console.log("NETWORKS", this.compute.networks)
            }
            
            this.$state.go("vm-create");
        }

        deleteVm(vm: VmItem) 
        {
            this.compute.deleteServer(vm).then(response => {
                this.Notification.info("Deleted VM: " + vm.name)
            }, response => {
                this.Notification.error("Could not delete VM: " + vm.name)
            })
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
            angular.forEach(this.compute.vmSnapshots, snapshot => snapshot.selected = false)
            angular.forEach(this.compute.vmVolumes, volume => volume.selected = false)
            angular.forEach(this.compute.vmImages, flavor => flavor.selected = false)
        }

        selectFlavor(obj: IVmFlavor) 
        {
            angular.forEach(this.compute.vmFlavors, (flavor:IVmFlavor) => {
                flavor.selected = false;
            })
            this.compute.project.additional_cost = obj.price
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
            this.compute.listItems.forEach((item: VmItem) => {
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