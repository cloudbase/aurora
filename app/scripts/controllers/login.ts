/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class LoginCtrl {
		username:string
		password:string
		status:string = "Not logged"
		state:any
		// @ngInject
		static $inject = [
			"$scope",
			"IdentityService",
			"$state"
		];
		
		constructor(private $scope:ng.IScope, private identity:Services.IIdentityService, private $state:any) {
			this.identity.isAuthenticated().then(authenticated => {
				if (authenticated) {
					this.$state.go('dashboard')
				}
			})
		}
		
		/**
		 * Used to call the service for auth
		 */
		auth() {
			this.identity.authCredentials(this.username, this.password).then((response:any) => {
				this.$state.go("dashboard")
			}, (reason:any) => {
				console.log("ERROR : " + reason);
				this.status = "Login failed"
			}, (msg:string) => {
				console.log(msg)
				this.status = msg
			});
		}
	}
}

angular.module('auroraApp')
	.controller('LoginCtrl', auroraApp.LoginCtrl);
