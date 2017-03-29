/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class MainCtrl {
		userMenuItems: IUserMenuItem[] = [
			{
				label: "Switch Project",
				children: [
					{
						label: "aurora",
						action: () => {
							alert('heyho')
						}
					},
					{
						label: "nova",
						action: () => {
							alert('heyho nova')
						}
					}
				]
			},
			{
				label: "Settings",
				action: () => {
					this.$state.go("user-overview")
				}
			},
			{
				label: "Log out",
				action: () => {
					this.identity.logout()
					this.$state.go("login")
				}
			}
		]
		static $inject = [
			"$rootScope",
			"$state",
			"IdentityService",
			"$stateParams",
			"ComputeService"
		]
		
		constructor(public $rootScope:ng.IScope,
		            public $state:any,
		            public identity:Services.IdentityService,
		            public $stateParams,
		            public compute: Services.ComputeService
		)
		{
			this.identity.isAuthenticated().then(authenticated => {
				if (!authenticated && $state.name != 'login') {
					this.$state.go("login")
				}
			})
			
			$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
				if (toState.name == "main") {
					event.preventDefault()
					this.redirect()
				}
			})
			
			
		}
		
		redirect()
		{
			if (this.identity.loggedIn) {
				this.$state.go("dashboard")
			} else {
				this.$state.go("login")
			}
		}
	}
}

angular.module('auroraApp')
	.controller('MainCtrl', auroraApp.MainCtrl)