/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class VolumesCtrl {
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
		
		deleteVolume(volume: VmVolume)
		{
			let index = this.volumes.indexOf(volume)
			this.volumes.splice(index, 1)
			
			index = this.apiService.vmVolumes.indexOf(volume)
			this.apiService.vmVolumes.splice(index, 1)
		}
		
		manageAttachment(volume: VmVolume)
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
					$scope.selected = null
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
						$scope.selected = item
						console.log($scope.selected)
					}
					$scope.addAttachment = () => {
						if ($scope.selected != null) {
							let attachment:IVolumeAttachment = {
								vm: $scope.selected,
								path: "/dev/sdb"
							}
							
							if ($scope.volume.attached_to == null)
								$scope.volume.attached_to = []
							
							$scope.volume.attached_to.push(attachment)
							
							let index = $scope.vmList.indexOf($scope.selected)
							$scope.vmList.splice(index, 1)
							
							$scope.selected = null
						}
						
					}
					$scope.removeAttachment = (attachment: IVolumeAttachment) => {
						let index = $scope.volume.attached_to.indexOf(attachment)
						$scope.volume.attached_to.splice(index, 1)
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
	.controller('VolumesCtrl', auroraApp.VolumesCtrl)