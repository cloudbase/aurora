/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class UserCtrl  {
        newKeypair:IKeypair = {
            name: "new_keypair",
            public_key: "",
            user_id: null,
            type: "ssh"
        }
        static $inject = [
            "ComputeService",
            "IdentityService",
            "$state",
            "$stateParams",
            "Notification"
        ]

        constructor(
            public apiService: Services.ComputeService,
            public identity: Services.IdentityService,
            private $state,
            private $stateParams,
            private notification: any
        ) {
            this.newKeypair.user_id = identity.user.id
        }
        
        addKeypair() {
            this.apiService.createKeypair(this.newKeypair).then(response => {
                this.notification.success("Keypair added")
            })
        }
        
        deleteKeypair(keypair: IKeypair) {
            this.apiService.deleteKeypair(keypair).then(response => {
                this.notification.success("Keypair deleted")
            })
        }
    }
}

angular.module('auroraApp')
  .controller('UserCtrl', auroraApp.UserCtrl)