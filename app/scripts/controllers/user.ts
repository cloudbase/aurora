/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class UserCtrl  {
        static $inject = [
            "ComputeService",
            "IdentityService",
            "$state",
            "$stateParams",
            "Notification",
            "keypairs"
        ]

        constructor(
            public apiService: Services.ComputeService,
            public identity: Services.IdentityService,
            private $state,
            private $stateParams,
            private notification: any,
            public keypairs
        ) {
        }
    }
}

angular.module('auroraApp')
  .controller('UserCtrl', auroraApp.UserCtrl)