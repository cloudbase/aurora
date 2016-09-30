/// <reference path="../_all.ts" />

module auroraApp.Directives {

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
    .directive('vmWidgets', auroraApp.Directives.vmWidgets)
    .directive('vmFieldWidget', auroraApp.Directives.vmFieldWidget)
    .directive('resourceConsumptionWidget', auroraApp.Directives.resourceConsumptionWidget)
    .directive('securityGroupsWidget', auroraApp.Directives.securityGroupsWidget)
    .directive('vmWidgetsEditable', auroraApp.Directives.vmWidgetsEditable)