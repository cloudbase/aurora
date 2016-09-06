/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class NetworkingCtrl {
        static $inject = [
            "ApiService",
            "$state"
        ];

        constructor(
            public apiService: Services.IApiService,
            private $state: any
        )
        {
            
        }

        getInterfaceVm(networkInterface: INetworkInterface) {
            let vm: IVmItem = null
            this.apiService.listItems.forEach((item) => {
                if (item.network_interfaces.indexOf(networkInterface) > -1) {
                    console.log(networkInterface)
                    vm = item
                }
                    
            })
            return vm
        }
    }
}


angular.module('auroraApp')
  .controller('NetworkingCtrl', auroraApp.NetworkingCtrl)