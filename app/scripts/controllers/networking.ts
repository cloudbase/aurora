/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class NetworkingCtrl {
        static $inject = [
            "$scope",
            "ComputeService",
            "$state",
            "$uibModal",
            "$stateParams"
        ];

        constructor(
            public $scope: ng.IScope,
            public apiService: Services.ComputeService,
            private $state: any,
            public $uibModal: any,
            public $stateParams
        )
        {
            if ($stateParams.type == "map") {
                this.mapInit()
            }
            console.log("CONSTRUCTOR NETWORK", apiService.networks)
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

        reserveFloatingIp() {
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
    
        selectVm(item: VmItem, floatingIp: IFloatingIp)
        {
            console.log(item.network_interfaces)
            floatingIp.assigned_vm = item
        }
        
        selectNetwork(item: INetworkInterface, floating_ip: IFloatingIp) {
            floating_ip.assigned_to = item
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