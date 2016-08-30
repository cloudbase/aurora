/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
  export class VmDetailsCtrl {
    vm: VmItem
    collection: any
    apiService: Services.IApiService
    
    // @ngInject
    static $inject = [
      "$scope",
      "ApiService",
      "$rootScope",
      "$routeParams"
    ];
    constructor (private $scope: IVmDetailsScope, apiService: Services.IApiService, $rootScope: any, $routeParams: IStoreParams) 
    {
      let vmId = $routeParams.id_vm
      let self = this
      this.apiService = apiService
      
      apiService.queryServers().then(function(response) {
        let listItems: VmItem[] = response.servers;
        self.vm = listItems.filter((vmItem):boolean => {
          return vmItem.id == vmId
        })[0]
      });
    }
    
    startServer() 
    {
      this.apiService.serverAction(this.vm.id, "os-start").then(() => {

      })
      
    }
    
    stopServer()
    {
      this.apiService.serverAction(this.vm.id, "os-stop").then(() => {

      })
    }
  }
}

angular.module('auroraApp')
  .controller('VmDetailsCtrl', auroraApp.VmDetailsCtrl);
