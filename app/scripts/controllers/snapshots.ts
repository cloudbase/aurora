/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class SnapshotsCtrl {
		volumes:VmVolume[]
		size = 1
		static $inject = [
			"$scope",
			"ApiService",
			"$stateParams",
			"$uibModal"
		]
		
		constructor(isolateScope:Directives.IVmListScope, public apiService:Services.IApiService, public $stateParams, public $uibModal) {
			this.volumes = apiService.vmVolumes
		}
		
		toggleSelection(obj:VmVolume)
		{
			obj.selected = !obj.selected
		}
		
		createSnapshot(obj:VmVolume)
		{
			let rand = Math.floor((Math.random() * 100) + 1)
			let name = obj.name + "_vol_sp_" + rand
			let id = Math.floor((Math.random() * 1000) + 1) + " " + Math.floor((Math.random() * 1000) + 1)
		}
		
		manageAttachment(volume: IVmVolume)
		{
			let self = this
			var modalInstance = this.$uibModal.open({
				animation: true,
				ariaLabelledBy: 'modal-title',
				ariaDescribedBy: 'modal-body',
				templateUrl: 'views/modals/manage-volumes-attachments.html',
				controller: ($scope, $uibModalInstance, apiService, volume) => {
					$scope.vmList = apiService.listItems
					$scope.volume = volume
					if (volume.attached_to != null) {
						volume.attached_to.forEach((attachment) => {
							let index = $scope.vmList.indexOf(attachment.vm)
							$scope.vmList.splice(index, 1)
						})
					}
					
					$scope.cancel = () => {
						$uibModalInstance.dismiss('cancel')
					}
					$scope.ok = () => {
						$uibModalInstance.close(true);
					}
					$scope.selectVm = (item:VmItem) => {
						let attachment:IVolumeAttachment = {
							vm: item,
							path: "/dev/sdb"
						}
						
						if ($scope.volume.attached_to == null)
							$scope.volume.attached_to = []
						
						$scope.volume.attached_to.push(attachment)
						
						let index = $scope.vmList.indexOf(item)
						$scope.vmList.splice(index, 1)
					}
				},
				resolve: {
					apiService: () => {
						return self.apiService
					},
					volume: () => {
						return volume
					}
				}
			});
			
			modalInstance.result.then(function (selectedItem) {
				
			}, function () {
				
			});
		}
	}
	
}

angular.module('auroraApp')
	.controller('SnapshotsCtrl', auroraApp.SnapshotsCtrl)