/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/main.ts" />

'use strict';

describe('Controller: MainCtrl', () => {

  var mock: ng.IMockStatic,
    MainCtrl: auroraApp.MainCtrl,
    isolateScope: auroraApp.Directives.IVmListScope,
    $http: ng.IHttpService,
    apiService: auroraApp.Services.IApiService,
    $httpBackend: ng.IHttpBackendService,
    rootScopeFake: any,
    controller: any, location,
    $controller: ng.IControllerService,
    $q: ng.IQService
  
  mock = angular.mock
  // load the controller's module
  beforeEach(module('auroraApp'));  
    
  // Initialize the controller and a mock scope
  beforeEach(inject((
      _$httpBackend_, $injector, $rootScope, _$controller_, _$q_
  ) => {
    $httpBackend = _$httpBackend_
    rootScopeFake = $rootScope.$new()
    apiService = $injector.get('ApiService')    
    $controller = _$controller_
    $q = _$q_
  }));
  
  afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
  });
  /*
  it("Should Call API", function () {

        spyOn(apiService, "queryServers").and.callFake((response):ng.IPromise< any > => {
          var deferred = $q.defer();
          deferred.resolve('Remote call result');
          return deferred.promise;
        });
        
        controller = $controller('MainCtrl', {$scope: rootScopeFake,  ApiService: apiService });

        expect($httpBackend.expectGET('/data/servers.json').respond({
        "servers": [
            {
                "created": "2013-09-23T13:53:12Z",
                "hostId": "f1e160ad2bf07084f3d3e0dfdd0795d80da18a60825322c15775c0dd",
                "id": "5cbefc35-d372-7gj3-88e2-9fda1b6ea12c",
                "metadata": {
                    "My Server Name": "Apache1"
                },
                "name": "new-server-test",
                "progress": 0, 
                "security_groups": [
                    {
                        "name": "default"
                    }
                ],
                "status": "BUILDING",
                "host_status": "UP",
                "tenant_id": "openstack",
                "updated": "2013-10-31T06:32:32Z",
                "user_id": "fake"
            }
        ] 
        })).toHaveBeenCalled;

        expect(apiService.queryServers).toHaveBeenCalled(); 
        $httpBackend.flush(); 

    }); */
});
