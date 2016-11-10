/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class MainCtrl {
		static $inject = [
			"$rootScope",
			"$state",
			"ApiService",
			"$stateParams"
		]
		
		constructor(public $rootScope:ng.IScope,
		            public $state:any,
		            public apiService:Services.IApiService,
		            public $stateParams) {
			if (!this.apiService.loggedIn && this.$state.current.name != "login") {
				// TODO: Remove redirect comment when needed
				//this.$state.go("login")
			}
			$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
				console.log(toState.name)
				if (toState.name == "main") {
					event.preventDefault()
					this.redirect()
				}
			})
		}
		
		redirect()
		{
			if (this.apiService.loggedIn) {
				this.$state.go("dashboard")
			} else {
				this.$state.go("login")
			}
		}
	}
}

angular.module('auroraApp')
	.controller('MainCtrl', auroraApp.MainCtrl)