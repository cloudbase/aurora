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
  
  export function usageWidget ($compile) {
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
  export function projectCostWidget ($compile) {
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
  export function virtualMachinesWidget ($compile) {
    return {
      restrict: "EA",
      controller: ["$scope", "$element", "ApiService", ($scope, $element, apiService:IApiService) => {
        $scope.virtualMachines = apiService.listItems.slice(0, 5)
      }],
      templateUrl: "views/widgets/virtualMachinesWidget.html"
    }
  }
  export function projectLimitsWidget ($compile) {
    return {
      restrict: "EA",
      controller: ["$scope", "$element", "ApiService", ($scope, $element, apiService:IApiService) => {
        $scope.apiService = apiService
        
        apiService.project.current_cost = 0
        apiService.project.current_vm = 0
        apiService.project.current_vcpu = 0
        apiService.project.current_vram = 0
        apiService.project.current_storage = 0
        apiService.project.current_volumes = apiService.vmVolumes.length
  
        apiService.listItems.forEach((item:VmItem) => {
          apiService.project.current_cost += item.flavor.price
          apiService.project.current_vm++
          apiService.project.current_vcpu += item.flavor.vCpu
          apiService.project.current_vram += item.flavor.ram
          apiService.project.current_storage += item.flavor.ssd
        })
        apiService.vmVolumes.forEach(volume => apiService.project.current_storage += volume.size)
        
      }],
      link: ($scope, $element) => {
        console.log($scope.apiService)
        console.log("link usageWidget")
      },
      templateUrl: "views/widgets/projectLimitsWidget.html"
    }
  }
  
  export function newsFeedWidget ($compile) {
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
                 let output = "<div>"
                 $scope.widgets.forEach((widget, index) => {
                     let generatedTemplate = '<div ' + widget.name
                     + '-widget vm="vm" widget="widgets[' + index + ']" dropFn="onDrop"></div>';
                     output += generatedTemplate
                 });
                 output += "</div>"
               
                
                 $element.append($compile(output)($scope))
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
                $scope.removeWidget = widget => {
                    let index = $scope.widgets.indexOf(widget)
                    $scope.widgets.splice(index, 1)
                }
                $scope.save = () => {
                  
                }
            },
            link: ($scope, $element) => {
                let output = "<div class='sortable'>"
                $scope.widgets.forEach((widget, index) => {
                    let generatedTemplate = '<div ' + widget.name
                    + '-widget vm="vm" widget="widgets[' + index + ']" dropFn="onDrop">'
                    generatedTemplate += "<div class='remove-widget' ng-click='removeWidget(widgets[" + index + "])'><i class='glyphicon glyphicon-remove'></i></div></div>";
                    output += generatedTemplate
                });
                output += "</div>"
                
                $element.append($compile(output)($scope)) 

                let el = <any> $($element).find('.sortable')
                el.sortable()
  
                $scope.$watch('widgets',  () => {
                  
                })
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
                                field.value = $scope.vm[field.field].toISOString().substring(0, 19).replace("T", " ")
                            break;
                            case "time_since":
                                field.value = $filter("timeAgo")($scope.vm[field.field])
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
        $scope.addTag = (tagName: string) => {
          if ($scope.vm.tags.indexOf(tagName) == -1)
            $scope.vm.tags.push(tagName.toLowerCase())
          $scope.tag_name = ""
        }
        $scope.removeTag = (tagName: string) => {
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