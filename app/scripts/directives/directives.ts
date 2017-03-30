/// <reference path="../_all.ts" />

module auroraApp.Directives {
	export interface IVmListScope {
		name:string
	}
	
	export function item($compile):ng.IDirective {
		return {
			restrict: "E",
			scope: {
				item: "=",
				key: "="
			},
			template: "<li><strong>{{key}}:</strong> </li>",
			replace: true,
			link: (scope:any, element:any, attrs:any) => {
				if (angular.isObject(scope.item)) {
					scope.item = [scope.item]
				}
				if (angular.isArray(scope.item)) {
					$compile("<collection ng-repeat='child in item track by $index' collection='child'></collection>")(scope, function (cloned, scope, attrs) {
						element.append(cloned);
						element.addClass('parent');
					});
				} else {
					element.append(scope.item)
				}
			}
		}
	}
	
	export function collection($compile):ng.IDirective {
		return {
			restrict: "E",
			scope: {
				collection: "="
			},
			template: "<ul><item ng-repeat='(key, item) in collection track by key' item='item' key='key'></item></ul>",
			replace: true,
			link: (scope:any, element:any, attrs:any) => {
				// TODO: Watch changes and update template
				/*
				 scope.$watch('collection.status', (val: any, oldVal: any, scope) => {
				 console.log(val, oldVal, scope)
				 if (val != oldVal)
				 oldScope.$apply()
				 })*/
			}
		}
	}
	
	
	export function collapse() {
		return {
			restrict: "E",
			replace: true,
			transclude: true,
			scope: {
				title: "@",
				opened: "@",
				valid: "="
			},
			link: ($scope, $element) => {
				$scope.toggle = () => {
					$scope.opened = !$scope.opened
				}
				
				$($element).find('header h2').click(() => {
					if ($scope.opened) {
						$element.addClass('collapsed')
					} else {
						$element.removeClass('collapsed')
					}
					
				})
				if ($scope.opened === "false") {
					$element.addClass('collapsed')
					$scope.opened = false
				} else if (angular.isUndefined($scope.opened)) {
					$scope.opened = true
				}
				//container = $(@).parents(".collapsible-jq:first").find(">section").css("height", "auto").slideToggle()
			},
			template: `
    <div class="collapsible">
        <header ng-click="toggle()">
            <h2><svg class='svg-caret' width="22px" height="13px" class='caret' viewBox="19 25 22 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <polyline id="Arrow" stroke="#354052" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" points="21 35.7167956 29.8567242 27 39 36"></polyline>
            </svg>
            {{title}}</h2>
            <div class='valid-icon status-{{valid}}'>
                <svg class='valid' width="18px" height="18px" viewBox="843 22 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Group" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(844.000000, 23.000000)">
                        <path d="M8,16 C12.418278,16 16,12.418278 16,8 C16,3.581722 12.418278,0 8,0 C3.581722,0 0,3.581722 0,8 C0,12.418278 3.581722,16 8,16 Z" id="Base-Copy" stroke="#30AD63" fill="#30AD63"></path>
                        <path d="M11.3135,5.29325 C10.9225,4.90225 10.2895,4.90225 9.8995,5.29325 L6.5355,8.65725 L5.7065,7.82925 C5.3165,7.43825 4.6835,7.43825 4.2925,7.82925 C3.9025,8.21925 3.9025,8.85225 4.2925,9.24325 L5.8285,10.77825 C6.2185,11.16925 6.8515,11.16925 7.2425,10.77825 L11.3135,6.70725 C11.7045,6.31725 11.7045,5.68425 11.3135,5.29325" id="Tick" fill="#FFFFFF"></path>
                    </g>
                </svg>
                <svg class='invalid' width="18px" height="18px" viewBox="843 22 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <path d="M852,39 C856.418278,39 860,35.418278 860,31 C860,26.581722 856.418278,23 852,23 C847.581722,23 844,26.581722 844,31 C844,35.418278 847.581722,39 852,39 Z" id="Base-Copy-4" stroke="#30AD63" stroke-width="1" fill="none"></path>
                </svg>
        </header>
        <section ng-transclude ng-class="{opened: opened}">
        </section>
    </div>`
		}
		
		
	}
	
	export function plusMinus() {
		return {
			restrict: "E",
			replace: true,
			transclude: true,
			scope: {
				value: "=",
				min: "@",
				max: "@",
				readonly: "@"
			},
			link: ($scope, $element) => {
				//if (angular.isUndefined($scope.min))
				$scope.checkLimits = () => {
					if (typeof $scope.min !== "undefined" && $scope.value - $scope.min == 0) {
						$($element).find('.btn-subtract').addClass('disabled')
					} else {
						$($element).find('.btn-subtract').removeClass('disabled')
					}
					if (typeof $scope.max !== "undefined" && $scope.value - $scope.max == 0) {
						$($element).find('.btn-add').addClass('disabled')
					} else {
						$($element).find('.btn-add').removeClass('disabled')
					}
				}
				$scope.checkLimits()
				
				$($element).find('.btn-add').click(() => {
					if (typeof $scope.max !== "undefined") {
						if ($scope.max - $scope.value > 0)
							$scope.value++
					} else {
						$scope.value++
					}
					$scope.$apply()
					$scope.checkLimits()
				})
				$($element).find('.btn-subtract').click(() => {
					if (typeof $scope.min !== "undefined") {
						if ($scope.value - $scope.min > 0)
							$scope.value--
					} else {
						$scope.value--
					}
					$scope.$apply()
					$scope.checkLimits()
				})
			},
			template: `
            <div class="input-group plusminus-wrapper">
              <span class="input-group-btn">
                  <button type="button" class="btn btn-default btn-number btn-subtract">
                      <i class="glyphicon glyphicon-minus"></i>
                  </button>
              </span>
              <input type="text" class="form-control input-number" ng-model="value" min="{{min}}" max="{{max}}" readonly="readonly">
              <span class="input-group-btn">
                  <button type="button" class="btn btn-default btn-number btn-add">
                      <i class="glyphicon glyphicon-plus"></i>
                  </button>
              </span>
          </div>
            `
			
		}
	}
	
	export function vmDisplay() {
		return {
			restrict: "AE",
			replace: true,
			transclude: true,
			scope: {
				vm: "=",
				link: "@",
				iconSuffix: "@?",
				onIconClick: "&"
			},
			template: `
                <div class='vm-details status-{{ vm.host_status }}' >
            <span class="icon {{ vm.image.os }}" ng-click="onIconClick()">
                <svg class="icon-{{ vm.image.os }}">
                    <use xlink:href="" ng-attr-xlink:href="{{'images/icons.svg#logo-' + vm.image.os + iconSuffix}}" />
                </svg>
            </span>
            <div class="info" ui-sref="vm-view-overview({vm_id: vm.id})">
                <span class='vm-status status-circle'> </span>
                <span class="name">{{ vm.name }}</span>
                <span class="details">{{ vm.flavor.vCpu }} vCPU | {{vm.flavor.ram}} GB RAM | {{ vm.flavor.ssd}} GB SSD</span>
            </div>
        </div>
            `
		}
	}
	
	export function volumeDisplay() {
		return {
			restrict: "AE",
			replace: true,
			transclude: true,
			scope: {
				volume: "=",
				selectable: "@"
			},
			link: ($scope, $element) => {
				
			},
			template: `
                <div class='vm-details volume-details '>
            <span class="icon icon-volume">
                <div ng-if="volume.attachments.length" class="icon-table icon-volume"></div>
                <div ng-if="!volume.attachments.length" class="icon-table icon-volume-empty"></div>
            </span>
            <div class="info">
                <span class="name">{{ volume.name }}</span>
                <span class="details">Size: {{ volume.size }} GB | NSF</span>
            </div>
        </div>
            `
		}
	}
	
	export function snapshotDisplay() {
		return {
			restrict: "AE",
			replace: true,
			transclude: true,
			scope: {
				snapshot: "=",
				selectable: "@"
			},
			link: ($scope, $element) => {
				
			},
			template: `
                <div class='vm-details volume-details '>
                  <svg class='icon-snapshot' width="56px" height="56px" viewBox="0 0 56 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	                  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="images/icons.svg#logo-snapshot"></use>
	              </svg>
		            <div class="info">
		                <span class="name">{{ snapshot.name }}</span>
		                <span class="details">Size: {{ snapshot.size }} GB</span>
		            </div>
        </div>
            `
		}
	}
	
	export function onEnter() {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.onEnter)
					});
					
					event.preventDefault()
				}
			})
		}
	}
	
	export function userMenu() {
		return {
			restrict: "AE",
			scope: {
				menuItems: "="
			},
			controller: ["$scope", "$element", "IdentityService",($scope, $element, identity) => {
				$scope.projects = []
				console.log('identity.tenants', identity.tenants)
				identity.tenants.forEach(tenant => {
					$scope.projects.push({
						label: tenant.name,
						action: () => {
							alert(tenant.name)
						}
					})
				})
			}],
			templateUrl: 'views/directives/user-menu.html'
		}
	}
	
	export function searchBox() {
		return {
			restrict: "AE",
			scope: {
				searchTerm: "="
			},
			link: ($scope, $element) => {
				$scope.isOpen = false;
				$scope.toggle = () => {
					$scope.isOpen = !$scope.isOpen
					if ($scope.isOpen) {
						$element.find('.search-input').triggerHandler('focus');
					}
				}
			},
			templateUrl: 'views/directives/search-box.html'
		}
	}
	
	export function sticky() {
		return {
			restrict: "AE",
			scope: {
				offset: "@"
			},
			link: ($scope, $element, offset) => {
				$(window).scroll(() => {
					if ($(this).scrollTop() > 235) {
						$element.addClass('fixed')
					} else {
						$element.removeClass('fixed')
					}
					//console.log("Scroll", $scope.offset)
				})
			}
		}
	}
	
}


angular.module('auroraApp')
	.directive('collection', auroraApp.Directives.collection)
	.directive('item', auroraApp.Directives.item)
	.directive('collapse', auroraApp.Directives.collapse)
	.directive('plusMinus', auroraApp.Directives.plusMinus)
	.directive('vmDisplay', auroraApp.Directives.vmDisplay)
	.directive('volumeDisplay', auroraApp.Directives.volumeDisplay)
	.directive('snapshotDisplay', auroraApp.Directives.snapshotDisplay)
	.directive('sticky', auroraApp.Directives.sticky)
	.directive('onEnter', auroraApp.Directives.onEnter)
	.directive('userMenu', auroraApp.Directives.userMenu)
	.directive('searchBox', auroraApp.Directives.searchBox)
