/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	export class VolumesCtrl {
		volumes:VmVolume[]
		size = 1
		newVolumeName: string
		region: any
		volumeDescription: string
		category_selected = "empty"
		images: IVmImage[]
		static $inject = [
			"$scope",
			"$state",
			"ApiService",
			"$stateParams",
			"$uibModal",
			"Notification"
		]
		
		constructor(
			public $scope: ng.IScope,
			public $state: any,
			public apiService:Services.IApiService,
			public $stateParams,
			public $uibModal,
		  public notifications
		) {
			this.volumes = apiService.vmVolumes
			this.images = apiService.vmImages
			if ($stateParams.type == "create") {
				let rand = Math.floor((Math.random() * 100) + 1)
				
				this.newVolumeName = "volume-" + rand;
				this.volumeDescription = ""
				
				$scope.$on("select_image", () => this.category_selected = "images")
				this.clearSelections()
			}
			
			this.region = {}
			this.region.value = this.apiService.project.zones[0]
		}
		
		toggleSelection(obj:VmVolume)
		{
			obj.selected = !obj.selected
		}
		
		createSnapshot(obj:VmVolume)
		{
			let rand = Math.floor((Math.random() * 100) + 1)
			let name = obj.name + "_vol_" + rand
			let id = Math.floor((Math.random() * 1000) + 1) + " " + Math.floor((Math.random() * 1000) + 1)
			
			let newSnapshot = new VmSnapshot(id, name, obj.size, obj.region, new Date())
			
			this.apiService.vmSnapshots.push(newSnapshot)
			
			this.notifications.info("Created snapshot " + name)
			
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
					$scope.volume = volume
					$scope.selected = null
					
					let populateVmList = () => {
						$scope.vmList = apiService.listItems
						if (volume.attached_to != null) {
							volume.attached_to.forEach((attachment) => {
								let index = $scope.vmList.indexOf(attachment.vm)
								$scope.vmList.splice(index, 1)
							})
						}
					}
					
					populateVmList()
					
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
							
							console.log($scope.selected)
						}
						
					}
					$scope.removeAttachment = (attachment: IVolumeAttachment) => {
						let index = $scope.volume.attached_to.indexOf(attachment)
						$scope.volume.attached_to.splice(index, 1)
						$scope.vmList.push(attachment.vm)
						$scope.selected = null
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
		}
		
		clearSelections()
		{
			this.apiService.vmImages.forEach(image => image.selected = false)
			this.volumes.forEach(volume => volume.selected = false)
			this.$scope.$emit('clear_selection')
		}
		
		selectEmpty()
		{
			this.clearSelections()
			this.category_selected = "empty"
		}
		
		attachVm(volume)
		{
			volume.attachVm(volume.selectedVm.value)
			//this.notifications.info("Attached volume " + volume.name + " to VM:" + volume.selectedVm.value.name)
			console.log(volume, volume.selectedVm.value)
		}
		
		discardVm(volume:IVmVolume)
		{
			
			this.notifications.info("Discarded volume " + volume.name + " from VM:" + volume.attached_to.vm.name)
			volume.attached_to = null
		}
		
		selectVolume(volume:VmVolume)
		{
			this.clearSelections()
			this.category_selected = "volumes"
			volume.selected = true
		}
		
		editVolume(volume:VmVolume)
		{
			let self = this
			
			this.apiService.project.current_storage = 0
			this.apiService.listItems.forEach(item => this.apiService.project.current_storage += item.flavor.ssd)
			this.apiService.vmVolumes.forEach(volume => this.apiService.project.current_storage += volume.size)
			
			var modalInstance = this.$uibModal.open({
				animation: true,
				ariaLabelledBy: 'modal-title',
				ariaDescribedBy: 'modal-body',
				templateUrl: 'views/modals/edit-volume-details.html',
				controller: ($scope, $uibModalInstance, apiService, volume, project) => {
					$scope.project = project
					
					$scope.increaseStorage = 0
					$scope.volumeName = volume.name
					$scope.volumeDescription = volume.description
					
					$scope.cancel = () => {
						$uibModalInstance.dismiss('cancel')
					}
					$scope.ok = () => {
						volume.name = $scope.volumeName
						volume.description = $scope.volumeDescription
						volume.size += $scope.increaseStorage
						this.notifications.info("Saved changes")
						$uibModalInstance.close(true);
					}
				},
				resolve: {
					apiService: () => {
						return self.apiService
					},
					project: () => {
						return self.apiService.project
					},
					volume: () => {
						return volume
					}
				}
			});
		}
		
		createVolume()
		{
			let newVolume = new VmVolume(
				this.newVolumeName,
				this.newVolumeName,
				this.volumeDescription,
				this.size,
				null, "READY", "NFS", this.region.value, false, false
			)
			this.apiService.vmVolumes.push(newVolume)
			this.$state.go("volumes-list");
			this.notifications.info("Volume " + this.newVolumeName + " created")
		}
	}
	
	
	
}

angular.module('auroraApp')
	.controller('VolumesCtrl', auroraApp.VolumesCtrl)