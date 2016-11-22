/// <reference path="../_all.ts" />

module auroraApp.Services {
	
	export class HttpWrapService implements IHttpWrapperService{
		bridge_url:string = "http://localhost/bridge/bridge.php"
		
		static $inject = [
			"$http",
			"$q"
		]
		
		constructor(private $http:ng.IHttpService,
		            private $q:ng.IQService,
		            private $cookies
		) {
		}
		
		/**
		 * Sets X-Auth-Token header to token
		 * @param token
		 */
		setToken(token: string) {
			this.$http.defaults.headers.common["X-Auth-Token"] = token
			this.$http.defaults.headers.put["X-Auth-Token"] = token
		}
		
		/**
		 * GET call function wrapper
		 */
		get(url:string):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "GET");
			
			var result:ng.IPromise< any > = this.$http.get(url)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * POST call function wrapper
		 */
		post(url, payload):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "POST");
			
			var result:ng.IPromise< any > = this.$http.post(url, payload)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * POST call function wrapper
		 */
		put(url, payload):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "PUT");
			// PUT request will be relayed:
			var result:ng.IPromise< any > = this.$http.post(url, payload)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * Wrapper function for URL, here we change the url if we have to relay the request
		 */
		private _wrapUrl(url:string, type:string):string {
			url = this.bridge_url + "?type=" + type + "&url=" + encodeURIComponent(url)
			return url
		}
		
		private handleResponse(response:any, params:any):any {
			// TODO: Add error cases
			response.data.requestParams = params
			$("#loader").removeClass('loading');
			return response.data
		}
	}
}

angular.module('auroraApp')
	.service('HttpWrapService', auroraApp.Services.HttpWrapService);