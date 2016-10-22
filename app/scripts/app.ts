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
    'yaru22.angular-timeago',
    'ui.select',
    'ui-notification',
    'ui.router.modal'
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
    .state('dashboard', {
      url: "/dashboard",
      templateUrl: 'views/sections/dashboard.html',
      controller: 'DashboardCtrl',
      controllerAs: 'vm'
    })
    // COMPUTE
    .state('compute', {
      url: "/compute",
      abstract: true,
      templateUrl: "views/main.html",
      controller: "ComputeCtrl",
      controllerAs: 'vm'
    })
    .state('vm', {
      url: "/vm",
      parent: "compute",
      abstract: true,
      templateUrl: "views/abstract.html",
      controllerAs: 'vm'
    })
    .state('vm-list', {
      url: "",
      parent: "vm",
      templateUrl: 'views/sections/vm_list.html',
      controller: 'ComputeCtrl',
      controllerAs: 'vm',
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('vm-create', {
      url: "/create",
      parent: "vm",
      params: {
        type: 'create'
      },
      templateUrl: "views/sections/vm-create.html",
      views: {
        '': {
          templateUrl: "views/sections/vm-create.html",
          controller: 'ComputeCtrl',
          controllerAs: 'vm'
        },
        'images@vm-create': {
          templateUrl: 'views/partials/vm.images.html',
          controller: 'ImagesCtrl',
          controllerAs: 'imagesView'
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

            this.apiService.vmNetworks[Object.keys(this.apiService.vmNetworks)[0]].selected = true
          })
        }]
      }
    })
    .state('vm-view', {
      abstract: true,
      parent: "vm",
      url: "/view/:vm_id",
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
      params: {
        type: 'edit'
      },
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
          controllerAs: "view",
          
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
      templateUrl: 'views/partials/vm_view.volumes.html',
      controller: 'VmCtrl',
      controllerAs: 'vm'
    })
    .state('vm-view-log', {
      parent: 'vm-view',
      url: "/log",
      templateUrl: 'views/partials/vm_view.log.html',
      controller: 'VmCtrl',
      controllerAs: 'vmView'
    })
    .state('networking', {
      abstract: true,
      url: "/networking",
      templateUrl: "views/main.html",
      controller: "NetworkingCtrl",
      controllerAs: 'vm',
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('networking-map', {
      parent: "networking",
      url: "/map",
      params: {
        type: 'map'
      },
      views: {
        '': {
          templateUrl: "views/sections/networking.html",
          controller: 'NetworkingCtrl',
          controllerAs: 'vm'
        },
        'content@networking-map': {
          templateUrl: 'views/partials/networking.map.html',
          controller: 'NetworkingCtrl',
          controllerAs: 'vm'
        }
      },
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('networking-floating-ips', {
      parent: "networking",
      url: "/floating-ips",
      views: {
        '': {
          templateUrl: "views/sections/networking.html",
          controller: 'NetworkingCtrl',
          controllerAs: 'netView'
        },
        'content@networking-floating-ips': {
          templateUrl: 'views/partials/networking.floating-ips.html',
          controller: 'NetworkingCtrl',
          controllerAs: 'netView' 
        }
      }
    })
    .state('networking-list', {
      parent: "networking",
      url: "/list-networks",
      views: {
        '': {
          templateUrl: "views/sections/networking.html",
          controller: 'NetworkingCtrl',
          controllerAs: 'netView'
        },
        'content@networking-list': {
          templateUrl: 'views/partials/networking.list.html',
          controller: 'NetworkingCtrl',
          controllerAs: 'vm'
        }
      }
    })
    .state('networking-routers', {
      parent: "networking",
      url: "/routers",
      views: {
        '': {
          templateUrl: "views/sections/networking.html",
          controller: 'NetworkingCtrl',
          controllerAs: 'netView'
        },
        'content@networking-routers': {
          templateUrl: 'views/partials/networking.routers.html',
          controller: 'NetworkingCtrl',
          controllerAs: 'vm'
        }
      }
    })
    .state('volumes', {
      url: "/volumes",
      parent: "compute",
      abstract: true,
      templateUrl: "views/abstract.html",
      controllerAs: 'vm'
    })
    .state('volumes-list', {
      url: "/list",
      parent: "volumes",
      params: {
        type: 'list'
      },
      templateUrl: 'views/sections/volumes_list.html',
      controller: 'VolumesCtrl',
      controllerAs: 'vm',
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
    .state('volumes-create', {
      url: "/create",
      parent: "volumes",
      params: {
        type: 'create'
      },
      views: {
        '': {
          templateUrl: "views/sections/volumes_create.html",
          controller: 'VolumesCtrl',
          controllerAs: 'vm'
        },
        'images@volumes-create': {
          templateUrl: 'views/partials/vm.images.html',
          controller: 'ImagesCtrl',
          controllerAs: 'imagesView'
        },
        'sidebar@volumes-create': {
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
          
            this.apiService.vmNetworks[Object.keys(this.apiService.vmNetworks)[0]].selected = true
          })
        }]
      }
    })
    .state('snapshot', {
      url: "/snapshot",
      parent: "compute",
      abstract: true,
      templateUrl: "views/abstract.html",
      controllerAs: 'vm'
    })
    .state('snapshot-list', {
      url: "/list",
      parent: "snapshot",
      params: {
        type: 'list'
      },
      templateUrl: 'views/sections/snapshot_list.html',
      controller: 'SnapshotsCtrl',
      controllerAs: 'vm',
      resolve: {
        data: ['ApiService', (apiService) => {
          return apiService.queryServers()
        }]
      }
    })
}]).config(function(NotificationProvider) {
      NotificationProvider.setOptions({
          delay: 10000,
          startTop: 20,
          startRight: 20,
          verticalSpacing: 20,
          horizontalSpacing: 20,
          positionX: 'right',
          positionY: 'top'
      });
  }).config(['JointGraphConfigProvider',
  function(JointGraphConfigProvider) {
    JointGraphConfigProvider.init({
      entityModelProperties: {
        firstEntity: ['property1', 'property2'],
        secondEntity: ['property3', 'property4']
      },
      entityCreationCallbacks: {
        firstEntity: 'FirstEntityCallbacks',
        secondEntity: 'SecondEntityCallbacks'
      },
      modelIdKey: 'uuId',
      linkModelProperties: [],
      linkCreationCallbacks: 'LinkCallbacks',
      entityMarkupParams: 'EntityMarkup',
      linkMarkupParams: 'LinkMarkup'
    });
  }
]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
// TODO: Add constants to config