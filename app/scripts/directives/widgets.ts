/// <reference path="../_all.ts" />

module auroraApp.Directives {
	
	
	import IApiService = auroraApp.Services.IApiService;
	/**
	 * Generates directive tags for vm widgets
	 */
	export function dashboardWidgets($compile) {
		return {
			restrict: "EA",
			scope: {
				vm: "=",
				widgets: "="
			},
			link: ($scope, $element, service) => {
				let output = "<div>"
				$scope.widgets.forEach((widget, index) => {
					let generatedTemplate = '<div ' + widget.id
						+ '-widget widget="widgets[' + index + ']"></div>';
					output += generatedTemplate
				});
				output += "</div>"
				
				
				$element.append($compile(output)($scope))
			},
			
		}
	}
	
	export function usageWidget($compile) {
		return {
			restrict: "EA",
			controller: ($scope, $element, widget) => {
				
			},
			link: ($scope, $element) => {
				console.log("link usageWidget")
			},
			templateUrl: "views/widgets/usageWidget.html"
		}
	}
	
	export function projectCostWidget($compile) {
		return {
			restrict: "EA",
			controller: ($scope, $element, widget) => {
				
			},
			link: ($scope, $element) => {
				console.log("link usageWidget")
			},
			templateUrl: "views/widgets/projectCostWidget.html"
		}
	}
	
	export function virtualMachinesWidget($compile) {
		return {
			restrict: "EA",
			controller: ["$scope", "$element", "ComputeService", ($scope, $element, apiService:IApiService) => {
				$scope.virtualMachines = apiService.listItems.slice(0, 5)
			}],
			templateUrl: "views/widgets/virtualMachinesWidget.html"
		}
	}
	
	export function projectLimitsWidget($compile) {
		return {
			restrict: "EA",
			controller: ["$scope", "$element", "ComputeService", "IdentityService", ($scope, $element, compute, identity) => {
				$scope.compute = compute
				$scope.identity = identity
				console.log("IDENTITY", identity)
				
				compute.project.current_cost = 0
				compute.project.current_vm = 0
				compute.project.current_vcpu = 0
				compute.project.current_vram = 0
				compute.project.current_storage = 0
				compute.project.current_volumes = compute.vmVolumes.length
				
				compute.listItems.forEach((item:VmItem) => {
					compute.project.current_cost += item.flavor.price
					compute.project.current_vm++
					compute.project.current_vcpu += item.flavor.vCpu
					compute.project.current_vram += item.flavor.ram
					compute.project.current_storage += item.flavor.ssd
				})
				compute.vmVolumes.forEach(volume => compute.project.current_storage += volume.size)
				
			}],
			link: ($scope, $element) => {
				console.log($scope.apiService)
				console.log("link usageWidget")
			},
			templateUrl: "views/widgets/projectLimitsWidget.html"
		}
	}
	
	export function newsFeedWidget($compile) {
		return {
			restrict: "EA",
			controller: ($scope, $element, widget) => {
				
			},
			link: ($scope, $element) => {
				console.log("what?")
			},
			templateUrl: "views/widgets/newsFeedWidget.html"
		}
	}
	
	/**
	 * Generates directive tags for vm widgets
	 */
	export function vmWidgets($compile) {
		return {
			restrict: "EA",
			scope: {
				vm: "=",
				widgets: "="
			},
			link: ($scope, $element) => {
				let renderWidgets = () => {
					let output = "<div>"
					$scope.widgets.forEach((widget, index) => {
						let generatedTemplate = '<div ' + widget.name
							+ '-widget vm="vm" widget="widgets[' + index + ']" dropFn="onDrop"></div>';
						output += generatedTemplate
					});
					output += "</div>"
					
					$element.html('')
					$element.append($compile(output)($scope))
				}
				renderWidgets()
				$scope.$watch('widgets', () => {
					renderWidgets()
				})
			},
			
		}
	}
	
	/**
	 * Generates directive tags for EDITING vm widgets
	 */
	export function vmWidgetsEditable($compile) {
		return {
			restrict: "EA",
			replace: true,
			transclude: true,
			scope: {
				vm: "=",
				widgets: "=",
				sortable: "="
			},
			controller: ($scope, $element) => {
			},
			link: ($scope, $element) => {
				$scope.tempWidgets = $scope.widgets
				let renderWidgets = () => {
					let output = "<div class='sortable'>"
					$scope.tempWidgets.forEach((widget, index) => {
						let generatedTemplate = '<div class="widget-container size-{{tempWidgets[' + index + '].size}}"><div ' + widget.name
							+ '-widget vm="vm" widget="tempWidgets[' + index + ']" dropFn="onDrop">'
						generatedTemplate += "</div><div class='widget-overlay'><div class='remove-widget' ng-click='removeWidget(tempWidgets[" + index + "])'>";
						generatedTemplate += `<a uib-tooltip="Remove Widget">
	                                        <svg width="16px" height="19px" viewBox="136 -1 16 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	                                            <path d="M149.147269,15.9402628 L149.260342,5.60498885 L145.778893,5.56571219 C145.690341,5.57467003 145.604514,5.59120757 145.513919,5.5905185 L143.470415,5.56777938 C143.3805,5.56640126 143.294673,5.54779652 143.206803,5.5367715 L139.724672,5.4981839 L139.611598,15.8334578 C139.607511,16.2131322 139.909268,16.5259673 140.285273,16.5301017 L148.458608,16.6217473 C148.833931,16.6258817 149.143182,16.3199371 149.147269,15.9402628 L149.147269,15.9402628 Z M142.506562,2.77293499 L146.539076,2.81772417 L146.542482,2.52280469 C146.548613,1.9412345 146.107897,1.46233489 145.559557,1.45613331 L143.516053,1.43339419 C142.967713,1.42719261 142.516098,1.89575627 142.509968,2.47732645 L142.506562,2.77293499 Z M151.985014,5.63530768 L150.622678,5.62014826 L150.509604,15.9554222 C150.497343,17.0951344 149.570274,18.0122788 148.443622,17.9998757 L140.270287,17.9082301 C139.142954,17.8951379 138.237001,16.9580106 138.249262,15.8182984 L138.362336,5.48302449 L137,5.46717601 L137.015667,4.08973668 L137.696835,4.09731638 L137.704328,3.40825218 C137.708415,3.02788875 138.016984,2.72263331 138.392989,2.72676769 L141.089733,2.75708652 L141.093138,2.46147797 C141.108124,1.08955115 142.20208,-0.0143296932 143.53172,0.000140654993 L145.575224,0.0228797736 C146.904864,0.0380391859 147.974297,1.16672634 147.95863,2.53865316 L147.955906,2.83357264 L150.653331,2.86389147 C151.028654,2.86802585 151.330412,3.180861 151.326325,3.56053537 L151.318832,4.24959957 L152,4.25717928 L151.985014,5.63530768 Z M146.430089,15.2208798 L147.792425,15.2360392 L147.883021,6.96795784 L146.520685,6.95210936 L146.430089,15.2208798 Z M142.434358,6.90663112 L141.072022,6.89147171 L140.981427,15.159553 L142.343763,15.1747124 L142.434358,6.90663112 Z M145.067754,15.2057203 L143.706099,15.1898719 L143.796694,6.92179054 L145.158349,6.93694995 L145.067754,15.2057203 Z" id="Fill-1" stroke="none" fill="#7F8FA4" fill-rule="evenodd"></path>
	                                        </svg>
	                                    </a>`
						generatedTemplate += "</div></div></div>"
						output += generatedTemplate
					});
					output += "</div>"
					
					$element.html('')
					$element.append($compile(output)($scope))
					
					let el = <any> $($element).find('.sortable')
					el.sortable()
				}
				renderWidgets()
				
				$scope.removeWidget = widget => {
					let index = $scope.tempWidgets.indexOf(widget)
					$scope.tempWidgets.splice(index, 1)
					console.log(index, $scope.tempWidgets)
					
					renderWidgets()
				}
			},
		}
	}
	
	/**
	 * VM plugin to show VM field
	 */
	export function vmFieldWidget() {
		return {
			restrict: "AE",
			transclude: true,
			replace: true,
			scope: {
				vm: "=",
				widget: "="
			},
			controller: ["$scope", "$filter", ($scope, $filter) => {
				$scope.widget.settings.fields.forEach(field => {
					if (field.type) {
						switch (field.type) {
							case "date":
								//field.value = $scope.vm[field.field].toISOString().substring(0, 19).replace("T", " ")
								break;
							case "time_since":
								//field.value = $filter("timeAgo")($scope.vm[field.field])
								break;
							
						}
					} else {
						field.value = $scope.vm[field.field]
					}
				})
			}],
			link: ($scope, $element) => {
				
			},
			template: `
            <div class="vm-widget size-{{ widget.size }} vm-field-widget">
                
                <div class='vm-widget-container'>
                    <div class='vm-widget-header'>{{ widget.label }}</div>
                    <div class='vm-widget-content'>
                        <div ng-repeat="field in widget.settings.fields" class='field-container'>
                            <span class='field-label'>{{ field.label }}</span>
                            <span class='field-value'>{{ field.value }}</span>
                            <div ng-if="field.clipboard" class="clipboard" ><i class="glyphicon glyphicon-scissors"></i></div>
                        </div>
                    </div>
                </div>
                <ng-transclude></ng-transclude>
            </div>
            `
		}
	}
	
	/**
	 * VM plugin to show VM field
	 */
	export function vmTagsWidget() {
		return {
			restrict: "AE",
			transclude: true,
			replace: true,
			scope: {
				vm: "=",
				widget: "="
			},
			controller: ($scope, $element) => {
				$scope.tag_name = ""
				$scope.addTag = (tagName:string) => {
					if ($scope.vm.tags.indexOf(tagName) == -1)
						$scope.vm.tags.push(tagName.toLowerCase())
					$scope.tag_name = ""
				}
				$scope.removeTag = (tagName:string) => {
					let index = $scope.vm.tags.indexOf(tagName)
					if (index > -1)
						$scope.vm.tags.splice(index, 1)
				}
			},
			link: ($scope, $element) => {
				
			},
			template: `
            <div class="vm-widget size-{{ widget.size }} vm-tags-widget">
                <div class='vm-widget-container'>
                    <div class='vm-widget-header'>
                        {{ widget.label }}
                        <div class="add-tag">
                          <input type="text" ng-model="tag_name" on-enter="addTag(tag_name)"/> 
                          <a class="btn btn-sm btn-add" ng-click="addTag(tag_name)">Add</a>
                        </div>
                    </div>
                    <div class='vm-widget-content'>
                        <ul class="tags">
                            <li class='label label-success' ng-repeat="tag in vm.tags">
                                {{tag}}
                                <svg ng-click='removeTag(tag)' width="18px" height="18px" viewBox="570 3 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                  <path d="M578.10303,10.94248 L573.094004,10.94248 L573.094004,12.9320218 L578.10303,12.9320218 L578.10303,17.9410484 L580.092572,17.9410484 L580.092572,12.9320218 L585.101599,12.9320218 L585.101599,10.94248 L580.092572,10.94248 L580.092572,5.93345343 L578.10303,5.93345343 L578.10303,10.94248 Z" id="Close-Button" stroke="none" fill="#FFF" fill-rule="evenodd" transform="translate(579.097801, 11.937251) rotate(-315.000000) translate(-579.097801, -11.937251) "></path>
                              </svg>
                            </li>
                            <li ng-if="vm.tags.length == 0">No tags</li>
                        </ul>
                    </div>
                </div>
                <ng-transclude></ng-transclude>
            </div>
            `
		}
	}
	
	
	export function resourceConsumptionWidget() {
		return {
			restrict: "AE",
			replace: true,
			transclude: true,
			scope: {
				vm: "=",
				widget: "="
			},
			link: ($scope, $filter) => {
				
			},
			template: `
            <div class="vm-widget size-{{ widget.size }} resource-consumption-widget">    
                <div class='vm-widget-container'>
                    <div class='vm-widget-header'>{{ widget.label }}</div>
                    <div class='widget-content'>
                        <div class='col'>
                            <span class='resource-label'>CPU</span>
                            <span class='resource-value'>22%</span>
                        </div>
                        <div class='col'>
                            <span class='resource-label'>RAM</span>
                            <span class='resource-value'>55%</span>
                        </div>
                        <div class='col'>
                            <span class='resource-label'>HDD</span>
                            <span class='resource-value'>22.2/{{ vm.flavor.ssd }} GB</span>
                        </div>
                    </div>
                </div>
                <ng-transclude></ng-transclude>
            </div>
            `
		}
	}
	
	export function securityGroupsWidget() {
		return {
			restrict: "AE",
			replace: true,
			transclude: true,
			scope: {
				vm: "=",
				widget: "="
			},
			link: ($scope, $filter) => {
				
			},
			template: `
            <div class="vm-widget size-{{ widget.size }} security-groups-widget">    
                <div class='vm-widget-container'>
                    <div class='vm-widget-header'>{{ widget.label }}</div>
                    <div class='widget-content'>
                        <div class='field-container'>
                            <span class='field-label'>ALLOW</span>
                            <span class='field-value'>IPv6 from default</span>
                        </div>
                        <div class='field-container'>
                            <span class='field-label'>ALLOW</span>
                            <span class='field-value'>IPv4 from default</span>
                        </div>
                        <div class='field-container'>
                            <span class='field-label'>ALLOW</span>
                            <span class='field-value'>IPv6 to ::/0</span>
                        </div>
                        <div class='field-container'>
                            <span class='field-label'>ALLOW</span>
                            <span class='field-value'>IPv4 to 0.0.0.0/0</span>
                        </div>
                    </div>
                </div>
                <ng-transclude></ng-transclude>
            </div>
            `
		}
	}
}


angular.module('auroraApp')
	.directive('dashboardWidgets', auroraApp.Directives.dashboardWidgets)
	.directive('projectCostWidget', auroraApp.Directives.projectCostWidget)
	.directive('usageWidget', auroraApp.Directives.usageWidget)
	.directive('virtualMachinesWidget', auroraApp.Directives.virtualMachinesWidget)
	.directive('projectLimitsWidget', auroraApp.Directives.projectLimitsWidget)
	.directive('newsFeedWidget', auroraApp.Directives.newsFeedWidget)
	.directive('vmWidgets', auroraApp.Directives.vmWidgets)
	.directive('vmFieldWidget', auroraApp.Directives.vmFieldWidget)
	.directive('resourceConsumptionWidget', auroraApp.Directives.resourceConsumptionWidget)
	.directive('securityGroupsWidget', auroraApp.Directives.securityGroupsWidget)
	.directive('vmWidgetsEditable', auroraApp.Directives.vmWidgetsEditable)
	.directive('vmTagsWidget', auroraApp.Directives.vmTagsWidget)