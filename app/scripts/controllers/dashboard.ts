/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
	import ComputeService = auroraApp.Services.ComputeService;
	export class DashboardCtrl {
		volumes:VmVolume[]
		size = 1
		reloadDirectives = true
		static $inject = [
			"$scope",
			"ComputeService",
			"$stateParams",
			"$uibModal"
		]
		availableWidgets: IVmWidget[] = [
			{
				id: "usage",
				name: "New Vm",
				label: "Adds a new vm widget button",
				position: {x:0, y:0},
				size: "3x2",
				default_settings: {}
			},
			{
				id: "project-cost",
				name: "New Vm",
				label: "Adds a new vm widget button",
				position: {x:0, y:0},
				size: "3x2",
				default_settings: {}
			},
			{
				id: "virtual-machines",
				name: "New Vm",
				label: "Adds a new vm widget button",
				position: {x:0, y:0},
				size: "3x2",
				default_settings: {}
			},
			{
				id: "project-limits",
				name: "New Vm",
				label: "Adds a new vm widget button",
				position: {x:0, y:0},
				size: "3x2",
				default_settings: {}
			}
		]
		widgets: IVmWidget[] = []
		
		constructor(isolateScope:Directives.IVmListScope, public computeService: ComputeService, public $stateParams, public $uibModal) {
			this.availableWidgets.forEach((widget) => {
				let newWidget: IVmWidget = widget
				newWidget.settings = newWidget.default_settings
				this.widgets.push(newWidget)
			})
			computeService.queryServers().then(response => {
				console.log("COMPUTE SERVICE RESPONSE:", response)
			})
		}
		
		
	}
}
	
angular.module('auroraApp')
	.controller('DashboardCtrl', auroraApp.DashboardCtrl)