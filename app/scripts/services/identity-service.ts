/// <reference path="../_all.ts" />

module auroraApp.Services {
	
	export class IdentityService implements IIdentityService {
		cache:VmItem[] = []
		loggedIn = false // TODO: loggedIn - false
		token:string
		tenants: any[]
		tenant_name:string
		tenant_id:string
		user: any
		auth_url:string
		os_url:string
		bridge_url:string
		endpoints: any
		services: any
		
		private authenticated:boolean = false
		
		static $inject = [
			"config",
			"HttpWrapService",
			"$q",
			"$cookies",
			"$location",
			"$timeout"
		]
		
		constructor(private config,
								private http:Services.IHttpWrapperService,
		            private $q:ng.IQService,
		            private $cookies:Services.ICookiesService,
		            private $location:ng.ILocationService,
		            private $timeout:ng.ITimeoutService
		) {
			this.auth_url = config.AUTH_URL
			this.os_url = config.OS_URL
			this.bridge_url = config.BRIDGE_URL
		}
		
		isAuthenticated():ng.IPromise< any >
		{
			let deferred = this.$q.defer()
			let self = this
			if (!this.authenticated) {
				// check if there is token
				let token:string = this.$cookies.get("token")
				if (angular.isDefined(token)) {
					this.authWithToken(token).then(() => {
						self.authenticated = true
						deferred.resolve(true)
					}, (reason:any) => {
						this.$location.url("/")
					});
				} else {
					this.$location.url("/")
				}
			} else {
				deferred.resolve(true)
			}
			
			return deferred.promise
		}
		
		authCredentials(user:string, pass:string):ng.IPromise< string >
		{
			let deferred = this.$q.defer()
			deferred.notify("Logging in..")
			
			// REMOVE
			//this.authenticated = true;
			//deferred.resolve("Success")
			//return deferred.promise
			// END REMOVE
			
			let credentials:IPasswordCredentials = {
				username: user,
				password: pass
			}
			let authObj:IAuthCredentials = {
				
				passwordCredentials: credentials
			}
			
			let url:string = this.auth_url + "/tokens"
			
			this.http.post(url, {auth: authObj}).then((response) => {
				if (angular.isDefined(response.access)) {
					this.handleAuthSuccess(response)
					this.getTenants()
					deferred.resolve("Success")
				} else {
					console.log("ERROR HERE", response)
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error.message)
					} else {
						deferred.reject("Something went wrong..")
					}
				}
			}, (reason) => {
				deferred.notify("No connection");
			});
			
			return deferred.promise
		}
		
		authWithToken(token:string)
		{
			let deferred = this.$q.defer()
			deferred.notify("Loging in..")
			
			let tokenObj:IToken = {id: token}
			
			let authObj:IAuthTokenRequest = {
				tenantName: this.tenant_name,
				token: tokenObj
			}
			
			let url:string = this.auth_url + "/tokens"
			
			this.http.post(url, {auth: authObj}).then((response) => {
				console.log("WITH TOKEN", response);
				if (angular.isDefined(response.access)) {
					this.handleAuthSuccess(response)
					this.handleServices(response)
					deferred.resolve("Success")
				} else {
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error.message)
					} else {
						deferred.reject("Something went wrong..")
					}
				}
			}, (reason) => {
				deferred.notify("No connection");
			});
			
			return deferred.promise
		}
		
		
		private handleAuthSuccess(response)
		{
			this.token = response.access.token.id
			this.user = response.access.user
			
			// set x-auth headers
			this.http.setToken(this.token)
			this.$cookies.put("token", this.token)
			
			this.authenticated = true
		}
		
		private getTenants()
		{
			let deferred = this.$q.defer()
			// get tenants and get links for available services
			this.http.get(this.os_url + "/tenants").then((response) => {
				this.tenants = response.tenants
				this.tenant_id = this.tenants[0].id
				this.tenant_name = this.tenants[0].name
				
				this.$cookies.put("tenantName", this.tenant_name)
				
				this.authWithToken(this.token).then(() => {
					deferred.resolve("Success")
				})
			})
			return deferred.promise
		}
		
		private handleServices (response)
		{
			this.endpoints = {}
			this.services = response.access.serviceCatalog
			response.access.serviceCatalog.forEach(service => {
				this.endpoints[service.type] = service.endpoints[0]
			})
			console.log(this.endpoints)
		}
		
		/**
		 * Getter for endpoints
		 * @param service
		 */
		getEndpoint(service: string)
		{
			return this.endpoints[service].internalUrl
		}
		
	}
}

angular.module('auroraApp')
	.service('IdentityService', auroraApp.Services.IdentityService);