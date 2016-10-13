/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class NetworkingCtrl {
        static $inject = [
            "ApiService",
            "$state",
            "$uibModal"
        ];

        constructor(
            public apiService: Services.IApiService,
            private $state: any,
            public $uibModal: any
        )
        {
            
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
                    assigned_to: null
                })
            }, function () {
        
            });
        }

        releaseFloatingIp(floating_ip: IFloatingIp) {
            console.log(floating_ip)
            floating_ip.assigned_to.floating_ip = null
            floating_ip.assigned_to = null
        }
        
    }
}


angular.module('auroraApp')
  .controller('NetworkingCtrl', auroraApp.NetworkingCtrl)