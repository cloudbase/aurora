/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class VolumesCtrl {
		volumes:VmVolume[]
		static $inject = [
			"$scope",
			"ApiService",
			"$stateParams"
		]
		
		constructor(isolateScope:Directives.IVmListScope, public apiService:Services.IApiService, public $stateParams) {
			this.volumes = apiService.vmVolumes
		}
		
		toggleSelection(obj:VmVolume) {
			obj.selected = !obj.selected
		}
		
		createSnapshot(obj:VmVolume) {
			let rand = Math.floor((Math.random() * 100) + 1)
			let name = obj.name + "_vol_sp_" + rand
			let id = Math.floor((Math.random() * 1000) + 1) + " " + Math.floor((Math.random() * 1000) + 1)
		}
	}
	
}

angular.module('auroraApp')
	.controller('VolumesCtrl', auroraApp.VolumesCtrl)