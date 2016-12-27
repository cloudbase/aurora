/// <reference path="../_all.ts" />

module auroraApp.Services {
	
	export class IdentityService {
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
			"$timeout",
			"LocalStorage"
		]
		
		constructor(private config,
								private http:Services.IHttpWrapperService,
		            private $q:ng.IQService,
		            private $cookies:Services.ICookiesService,
		            private $location:ng.ILocationService,
		            private $timeout:ng.ITimeoutService,
		            public localStorage: LocalStorage
		) {
			this.auth_url = config.AUTH_URL
			this.os_url = config.OS_URL
			this.bridge_url = config.BRIDGE_URL
		}
		
		init():ng.IPromise< any >
		{
			
			let deferred = this.$q.defer()
			// if there is token, attempt to login
			this.token = this.$cookies.get('token')
			if (this.token) {
				this.authWithToken(this.token).then(authenticated => {
					console.log(authenticated)
					if (authenticated) {
						this.getTenants().then(tenant => {
							if (tenant) {
								this.handleUserData(tenant).then(response => deferred.resolve(response))
							}
						})
					}
				}, (reason) => {
					if (reason.code == 401) {
						this.$cookies.remove('token')
					}
					deferred.resolve(false)
				})
			} else {
				deferred.resolve(false)
			}
			return deferred.promise
		}
		
		isAuthenticated():ng.IPromise< any >
		{
			let deferred = this.$q.defer()
			let self = this
			if (!this.authenticated) {
				// check if there is token
				let token:string = this.$cookies.get("token")
				if (angular.isDefined(token)) {
					this.authWithToken(token).then(response => {
						self.authenticated = true
						this.handleServices(response)
						this.getTenants().then(response => {
							deferred.resolve(true)
						})
					}, (reason:any) => {
						deferred.reject(reason)
					});
				} else {
					deferred.resolve(false)
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
			
			let credentials:IPasswordCredentials = {
				username: user,
				password: pass
			}
			
			let authObj:IAuthCredentials
			
			if (this.$cookies.get('tenantName')) {
				authObj = {
					tenantName: this.$cookies.get('tenantName'),
					passwordCredentials: credentials
				}
			} else {
				authObj = {
					passwordCredentials: credentials
				}
			}
			
			let url:string = this.auth_url + "/tokens"
			
			this.http.post(url, credentials).then((response) => {
				if (response.access) {
					this.handleAuthSuccess(response)
					deferred.resolve(true)
					/*this.getTenants().then(tenant => {
						this.handleUserData(tenant, false).then(response => {
							deferred.resolve(true)
						})
					})*/
					
				} else {
					console.log("ERROR HERE", response)
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error.message)
					} else {
						deferred.reject("Something went wrong..")
					}
				}
			});
			
			return deferred.promise
		}
		
		authWithToken(token:string)
		{
			console.log('authWithToken', token)
			let deferred = this.$q.defer()
			deferred.notify("Loging in..")
			
			let tokenObj:IToken = {id: token}
			
			let authObj:IAuthTokenRequest = {
				tenantName: this.tenant_name,
				token: tokenObj
			}
			
			let url:string = this.auth_url + "/tokens"
			
			this.http.post(url, {auth: authObj}).then((response) => {
				if (angular.isDefined(response.access)) {
					this.handleAuthSuccess(response)
					deferred.resolve(response)
				} else {
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error)
					} else {
						deferred.reject(false)
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
			this.loggedIn = true
			this.handleServices(response)
			
			this.http.setToken(this.token)
			this.$cookies.put("token", this.token)
			
			this.authenticated = true
		}
		
		logout()
		{
			this.loggedIn = false;
			this.$cookies.remove("token")
		}
		
		private getTenants():ng.IPromise< string >
		{
			let deferred = this.$q.defer()
			// get tenants and get links for available services
			this.http.get(this.os_url + "/tenants").then((response) => {
				this.tenants = response.tenants
				this.tenant_id = this.tenants[0].id
				this.tenant_name = this.tenants[0].name
				this.$cookies.put("tenantName", this.tenant_name)
				
				deferred.resolve(this.tenant_name)
				/*this.authWithToken(this.token).then(response => {
					deferred.resolve(response)
				})*/
			})
			return deferred.promise
		}
		
		/**
		 * Sets the data necessary for the specified tenant. Function should be called after authentication and tenant query
		 * @param tenant
		 */
		private handleUserData(tenant: string, cache = true):ng.IPromise< any >
		{
			let deferred = this.$q.defer()
			
			if (!this.localStorage.get("endpoints") || !cache) {
				let tokenObj:IToken = {id: this.token}
				
				let authObj:IAuthTokenRequest = {
					tenantName: tenant,
					token: tokenObj
				}
				
				let url:string = this.auth_url + "/tokens"
				
				this.http.post(url, {auth: authObj}).then(response => {
					this.handleServices(response)
					this.handleAuthSuccess(response)
					deferred.resolve(this.localStorage.get("endpoints"))
				})
			} else {
				deferred.resolve(this.localStorage.get("endpoints"))
			}
			
			return deferred.promise
		}
		
		private handleServices (response)
		{
			this.endpoints = {}
			
			this.services = response.access.serviceCatalog
			
			response.access.serviceCatalog.forEach(service => {
				this.endpoints[service.type] = service.endpoints[0]
			})
			console.log(this.endpoints);
			this.localStorage.set('endpoints', angular.copy(this.endpoints))
			console.log(this.endpoints)
		}
		
		/**
		 * Getter for endpoints
		 * @param service
		 */
		getEndpoint(service: string)
		{
			return this.endpoints[service].internalURL
		}
		
		
	}
}

angular.module('auroraApp')
	.service('IdentityService', auroraApp.Services.IdentityService);