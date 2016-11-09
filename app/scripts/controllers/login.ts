/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class LoginCtrl {
        username: string
        password: string
        status: string = "Not logged"
        state: any
        // @ngInject
        static $inject = [
            "$scope",
            "ApiService",
            "$state"
        ];
        constructor (private $scope: IVmDetailsScope, private apiService: Services.IApiService, private $state: any)
        { }
        
        /**
         * Used to call the service for auth
         */
        auth()
        {
           this.apiService.authCredentials(this.username, this.password).then((response: string) => {
               this.apiService.loggedIn = true
               this.$state.go("dashboard")
           }, (reason: any) => {
               console.log("ERROR : " + reason);
               this.status = "Login failed"
           }, (msg: string) => {
               console.log(msg)
               this.status = msg
           });
        }
    }
}

angular.module('auroraApp')
  .controller('LoginCtrl', auroraApp.LoginCtrl);
