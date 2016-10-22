/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	import IApiService = auroraApp.Services.IApiService;
	export class graph {
		static $inject = [
			"$scope",
			"ApiService"
		]
		constructor($scope: ng.IScope, apiService:IApiService)
		{
			console.log('hereeee')
		}
	}
}


angular.module('auroraApp')
	.controller('graph', auroraApp.graph)