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
            let _this = this
        
            var modalInstance = this.$uibModal.open({
                animation: true,
                size: "l",
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/modals/add-subnet.html',
                controller: ($scope, $uibModalInstance) => {
                    $scope.subnet = {
                        ipVersion: 4,
                        disableGateway: 0,
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
                            gateway_ip: $scope.subnet.gateway,
                            allocation_pools: $scope.subnet.allocationPools,
                            dns_nameservers: $scope.subnet.dnsNameservers,
                            host_routes: $scope.subnet.hostRoutes
                        }
                        // TODO: Add allocation pools, dhcp
                        _this.apiService.addSubnet(network, payload).then(() => {
                            _this.notification.success("Subnet has been added")
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
                controller: ($scope, $uibModalInstance, project) => {
                    $scope.project = project
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel')
                    }
                    $scope.ok = () => {
                        $uibModalInstance.close(true);
                    }
                },
                controllerAs: 'ctrl',
                resolve: {
                    project: function () {
                        return _this.apiService.project
                    }
                }
            });
    
            modalInstance.result.then(function (selectedItem) {
                let randomIp:string = Math.floor((Math.random() * 255) + 1) + "." +
                  Math.floor((Math.random() * 255) + 1) + "." +
                  Math.floor((Math.random() * 255) + 1) + "." +
                  Math.floor((Math.random() * 255) + 1)
        
                _this.apiService.project.floating_ips.push({
                    id: _this.apiService.project.floating_ips.length + 1,
                    ip: randomIp,
                    assigned_to: null,
                    assigned_vm: null
                })
            }, function () {
        
            });
        }

        releaseFloatingIp(floating_ip: IFloatingIp) {
            floating_ip.assigned_to.floating_ip = null
            floating_ip.assigned_to = null
            floating_ip.assigned_vm = null
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