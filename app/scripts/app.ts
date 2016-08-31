/// <reference path="_all.ts" />

'use strict';
var app = angular.module('auroraApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'mwl.confirm',
    'ui.bootstrap',
    'angular-svg-round-progressbar',
    'xeditable',
    'sticky',
    'yaru22.angular-timeago',
    'ui.select'
]);
app.config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
    .state('login', {
      url: "/",
      templateUrl: 'views/sections/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'login'
    })
    .state('vm-list', {
      url: "/vm/list",
      templateUrl: 'views/sections/main.html',
      controller: 'ComputeCtrl',
      controllerAs: 'vm',
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('vm-create', {
      url: "/vm/create",
      params: {
        type: 'create'
      },
      views: {
        '': {
          templateUrl: "views/sections/vm-create.html",
          controller: 'ComputeCtrl',
          controllerAs: 'vmCreate'
        },
        'flavors@vm-create': {
          templateUrl: 'views/partials/vm_view.size.html',
          controller: 'FlavorsCtrl',
          controllerAs: 'flavorView' 
        },
        'sidebar@vm-create': {
          templateUrl: "views/partials/project_costs.html",
          controller: "ProjectCtrl",
          controllerAs: "view",
        }
      },
      resolve: {
        project: ['ApiService', (apiService) => {
          this.apiService = apiService
          return apiService.queryServers().then(()=>{
            angular.forEach(this.apiService.vmImages, (flavor) => {
                flavor.selected = false;
            })
            this.apiService.vmImages[0].selected = true
            angular.forEach(this.apiService.vmFlavors, (flavor) => {
                flavor.selected = false;
            })
            this.apiService.vmFlavors[0].selected = true
            this.apiService.project.additional_cost = this.apiService.vmFlavors[0].price 

            this.apiService.vmNetworks[0].selected = true
          })
        }]
      }
    })
    .state('vm-view', {
      abstract: true,
      url: "/vm/view/:vm_id",
      templateUrl: 'views/sections/vm_view.html',
      controller: 'VmCtrl',
      controllerAs: 'vmView',
      params: {
        type: 'edit'
      },
      resolve: {
        project: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('vm-view-overview', {
      parent: 'vm-view',
      url: "/overview",
      templateUrl: "views/partials/vm_view.overview.html",
      controller: 'VmCtrl',
      controllerAs: 'vmView'
    })
    .state('vm-view-size', {
      parent: 'vm-view',
      url: "/size",
      views: {
        '': {
          templateUrl: "views/templates/partial-with-sidebar.html",
          controller: 'VmCtrl',
          controllerAs: 'vmView'
        },
        'main@vm-view-size': {
          templateUrl: 'views/partials/vm_view.size.html',
          controller: 'FlavorsCtrl',
          controllerAs: 'flavorView'
        },
        'sidebar@vm-view-size': {
          templateUrl: "views/partials/project_costs.html",
          controller: "ProjectCtrl",
          controllerAs: "view"
        }
      }
    })
    .state('vm-view-snapshot', {
      parent: 'vm-view',
      url: "/snapshot",
      templateUrl: 'views/partials/vm_view.snapshots.html',
      controller: 'VmCtrl',
      controllerAs: 'vmView'
    })
    .state('vm-view-networking', {
      parent: 'vm-view',
      url: "/networking",
      templateUrl: 'views/partials/vm_view.networking.html',
      controller: 'VmCtrl',
      controllerAs: 'vmView'
    })
    .state('vm-view-volumes', {
      parent: 'vm-view',
      url: "/volumes",
      templateUrl: 'views/partials/vm_view.snapshots.html',
      controller: 'VmCtrl',
      controllerAs: 'vmView'
    })
    /*.state('state1.list', {
      url: "/list",
      templateUrl: "partials/state1.list.html",
      controller: function($scope) {
        $scope.items = ["A", "List", "Of", "Items"];
      }
    })
    .state('state2', {
      url: "/state2",
      templateUrl: "partials/state2.html"
    })
    .state('state2.list', {
      url: "/list",
      templateUrl: "partials/state2.list.html",
      controller: function($scope) {
        $scope.things = ["A", "Set", "Of", "Things"];
      }
    });*/
}]); 

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
// TODO: Add constants to config

/*.when('/vm/:id_vm', {
 templateUrl: 'views/vm_details.html',
 controller: 'VmDetailsCtrl',
 controllerAs: 'vmDetails'
 })*/