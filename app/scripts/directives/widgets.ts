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
             scope: {
                vm: "=",
                widgets: "=",
                sortable: "="
             }, 
             link: ($scope, $element) => {
                 let output = "<div class='sortable'>"
                 $scope.widgets.forEach((widget, index) => {
                     let generatedTemplate = '<div ' + widget.name
                     + '-widget vm="vm" widget="widgets[' + index + ']" dropFn="onDrop"></div>';
                     output += generatedTemplate
                 });
                 output += "</div>"
                 output += "<div class='empty-row'></div>"
                 $element.append($compile(output)($scope)) 
                 let el = <any> $($element).find('.sortable')
                 el.sortable()
                
             },
             
         }
     }
    
    /**
     * VM plugin to show VM field
     */
     export function vmFieldWidget() {
         return {
            restrict: "AE",
            replace: true,
            transclude: true,
            scope: {
                vm: "=",
                widget: "="
            },
            link: ($scope, $element) => {
                $scope.fieldValue = $scope.vm[$scope.widget.settings.field]
            },
            template: `
            <div class="vm-widget size-{{ widget.size }} vm-field-widget">
                <div class='vm-widget-content'>
                    <span>{{ widget.settings.label }}</span>
                    <span>{{ fieldValue }}</span>
                    <div ng-if="widget.settings.clipboard" class="clipboard" ><i class="glyphicon glyphicon-scissors"></i></div>
                </div>
            </div>
            `
         }
     }
}



angular.module('auroraApp')
    .directive('vmWidgets', auroraApp.Directives.vmWidgets)
    .directive('vmFieldWidget', auroraApp.Directives.vmFieldWidget)
    .directive('vmWidgetsEditable', auroraApp.Directives.vmWidgetsEditable)