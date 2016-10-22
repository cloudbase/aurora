/// <reference path="../_all.ts" />

module auroraApp.Directives {
	import IApiService = auroraApp.Services.IApiService;
	
	export function networkingMap($compile):ng.IDirective {
		return {
			restrict: "E",
			template: "<li><strong>{{key}}:</strong> </li>",
			replace: true,
			controller: ["$scope", "ApiService", ($scope:any, apiService:IApiService) => {
				
				
				
			}]
		}
	}
}

angular.module('auroraApp')
	.directive('networkingMap', auroraApp.Directives.networkingMap)