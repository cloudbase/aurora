/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class NetworkingCtrl {
        static $inject = [
            "$scope",
            "ComputeService",
            "$state",
            "$uibModal",
            "$stateParams",
            "Notification"
        ];

        constructor(
            public $scope: ng.IScope,
            public apiService: Services.ComputeService,
            private $state: any,
            public $uibModal: any,
            public $stateParams,
            public notification
        )
        {
            if ($stateParams.type == "map") {
                this.mapInit()
            }
            console.log("APISERVICE", apiService)
        }

        getInterfaceVm(networkInterface: INetworkInterface) {
            let vm: IVmItem = null
            this.apiService.listItems.forEach((item) => {
                if (item.network_interfaces.indexOf(networkInterface) > -1) {
                    vm = item
                }      
            })
            return vm
        }
    
        addSubnetAction(network: INetwork) {
            let self = this
            
            var modalInstance = this.$uibModal.open({
                animation: true,
                size: "l",
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/add-subnet.html',
                controller: ($scope, $uibModalInstance) => {
                    $scope.subnet = {
                        ipVersion: 4,
                        enableGateway: true,
                        gateway: null,
                        allocationPools: null,
                        dnsNameservers: null,
                        hostRoutes: null
                    }
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.ok = () => {
                        let payload = {
                            network_id: network.id,
                            name: $scope.subnet.name,
                            ip_version: $scope.subnet.ipVersion,
                            cidr: $scope.subnet.cidr,
                            gateway_ip: $scope.enableGateway ? $scope.subnet.gateway : null,
                            dns_nameservers: $scope.subnet.dnsNameservers,
                            host_routes: $scope.subnet.hostRoutes
                        }
                        if ($scope.subnet.allocationPools) {
                            payload['allocation_pools'] = $scope.subnet.allocationPools
                        }
                            
                        self.apiService.addSubnet(network, payload).then(() => {
                            self.notification.success("Subnet has been added")
                        })
                        $uibModalInstance.close(true);
                    }
                },
                controllerAs: 'ctrl'
            });
        
            modalInstance.result.then(function (selectedItem) {
                
            }, function () {
            
            });
        }

        reserveFloatingIpAction() {
            let _this = this

            var modalInstance = this.$uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/reserve-floating-ip.html',
                controller: ($scope, $uibModalInstance, project, networks) => {
                    $scope.project = project
                    $scope.networks = networks
                    $scope.selectedNetwork = null
                    
                    // select first external network
                    networks.forEach(network => {
                        if (network['router:external'] && $scope.selectedNetwork == null) {
                            $scope.selectedNetwork = network
                        }
                    })
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.ok = () => {
                        _this.apiService.reserveFloatingIp($scope.selectedNetwork).then(response => {
                            _this.notification.success("Floating ip added!")
                            $uibModalInstance.close(true);
                        })
                    }
                },
                controllerAs: 'ctrl',
                resolve: {
                    project: function () {
                        return _this.apiService.project
                    },
                    networks: () => _this.apiService.networks
                }
            });
        }
    
        addNetworkAction() {
            let self = this
        
            var modalInstance = this.$uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                size: "s",
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/add-network.html',
                controller: ($scope, $uibModalInstance) => {
                    $scope.network = {
                        name: "",
                        adminState: true,
                        isShared: false
                    }
                    $scope.createSubnet = true
                
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.ok = () => {
                        self.apiService.createNetwork($scope.network).then((newNetwork:INetwork) => {
                            self.notification.success("Network added!")
                            if ($scope.createSubnet) {
                                this.addSubnetAction(newNetwork)
                            }
                            $uibModalInstance.close(true);
                        })
                    }
                },
                controllerAs: 'ctrl'
            });
        }
    
        editNetworkAction(network:INetwork) {
            let self = this
            
            console.log("EDIT NETWORK", network)
        
            var modalInstance = this.$uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/edit-network.html',
                controller: ($scope, $uibModalInstance) => {
                    $scope.network = {
                        name: network.name,
                        adminState: network.admin_state_up,
                        isShared: network.shared,
                        subnets: network.subnetCollection
                    }
                
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.ok = () => {
                        self.apiService.updateNetwork(network, {
                            name: $scope.network.name,
                            admin_state_up: $scope.network.adminState,
                            shared: $scope.network.isShared
                        }).then((newNetwork:INetwork) => {
                            self.notification.success("Network edited!")
                            $uibModalInstance.close(true);
                        })
                    }
                    $scope.deleteSubnet = (subnet:ISubnet) => {
                        self.apiService.deleteSubnet(subnet).then(response => {
                            let index = network.subnetCollection.indexOf(subnet)
                            network.subnetCollection.splice(index, 1)
                            
                            index = network.subnets.indexOf(subnet.id)
                            network.subnets.splice(index, 1)
                            
                            this.notification.success("Subnet deleted")
                        })
                    }
                    $scope.addSubnet = () => {
                        self.addSubnetAction(network)
                    }
                },
                controllerAs: 'ctrl'
            });
        }

        releaseFloatingIp(floating_ip: IFloatingIp) {
            floating_ip.assigned_to.floating_ip = null
            floating_ip.assigned_to = null
            floating_ip.assigned_vm = null
        }
        
        deleteFloatingIpAction(fip: IFloatingIp) {
            this.apiService.deleteFloatingIp(fip).then(response => {
                this.notification.success("Floating ip deleted")
            })
        }
    
        selectVm(item:IPort, floatingIp: IFloatingIp)
        {
            
            this.apiService.updateFloatingIp(floatingIp.id, {
                floatingip: { port_id: item.id }
            }).then(response => {
                floatingIp.port = item
                this.notification.success("Floating IP assigned succesfully")
            })
        }
    
        selectPort(item: INetworkInterface, floating_ip: IFloatingIp) {
            floating_ip.assigned_to = item
        }
        
        groupPorts(item) {
            return item.device.name
        }
        
        deleteNetwork(network:INetwork) {
            this.apiService.deleteNetwork(network).then(response => {
                this.notification.success("Network " + network.name + " has been deleted")
            })
        }
        
        mapInit()
        {
            let self = this
            
            /*
            
            let network_start =  (12 - (12 % data.vmNetworks.length)) / data.vmNetworks.length
            console.log(network_start)
            data.vmNetworks.forEach(network => {
                console.log('asdasdasd')
            })*/
        }
    }
}


angular.module('auroraApp')
  .controller('NetworkingCtrl', auroraApp.NetworkingCtrl)