/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class SnapshotsCtrl {
		volumes:VmVolume[]
		snapshots:IVmSnapshot[]
		size = 1
		static $inject = [
			"$scope",
			"ApiService",
			"$stateParams",
			"$uibModal",
			"Notification"
		]
		
		constructor(isolateScope:Directives.IVmListScope,
		            public apiService:Services.IApiService,
		            public $stateParams,
		            public $uibModal,
		            public notification) {
			this.snapshots = apiService.vmSnapshots
		}
		
		deleteSnapshot(obj:IVmSnapshot) {
			let index = this.apiService.vmSnapshots.indexOf(obj)
			this.apiService.vmSnapshots.splice(index, 1)
			this.notification.info("Snapshot " + obj.name + " deleted")
		}
		
	}
	
}

angular.module('auroraApp')
	.controller('SnapshotsCtrl', auroraApp.SnapshotsCtrl)