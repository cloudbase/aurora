/// <reference path="../_all.ts" />

module auroraApp.Services {
	
	export class HttpWrapService implements IHttpWrapperService{
		bridge_url:string = "http://localhost/bridge/bridge.php"
		
		static $inject = [
			"$http",
			"$q",
			"Notification",
		]
		
		constructor(public $http:ng.IHttpService,
		            private $q:ng.IQService,
		            private Notification:any
		) {
			$http.defaults.withCredentials = true;
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
		get(url:string, headers: any = null):ng.IPromise< any > {
			$("#loader").addClass('loading');
			
			url = this._wrapUrl(url, "GET");
			
			let req = {
				method: "GET",
				url: url,
				headers: headers
			}
			
			var result:ng.IPromise< any > = this.$http(req)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * POST call function wrapper
		 */
		post(url, payload, config = null):ng.IPromise< any > {
			$("#loader").addClass('loading');
			let deferred = this.$q.defer()
			url = this._wrapUrl(url, "POST");
			
			
			var result:ng.IPromise< any > = this.$http.post(url, payload, config)
				.then(
					(response:any) => deferred.resolve(this.handleResponse(response, null)),
					(response: any) => {
						this.handleResponse(response, null)
						deferred.reject(response)
					}
				)
			
			return deferred.promise
		}
		
		/**
		 * DELETE call function wrapper
		 */
		delete(url, config = null):ng.IPromise< any > {
			$("#loader").addClass('loading');
			let deferred = this.$q.defer()
			url = this._wrapUrl(url, "POST");
			
			
			var result:ng.IPromise< any > = this.$http.delete(url, config)
				.then(
					(response:any) => deferred.resolve(this.handleResponse(response, null)),
					(response: any) => {
						this.handleResponse(response, null)
						deferred.reject(response)
					})
			
			return deferred.promise
		}
		
		/**
		 * POST call function wrapper
		 */
		put(url, payload, config = null):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "PUT");
			// PUT request will be relayed:
			var result:ng.IPromise< any > = this.$http.put(url, payload, config)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * Wrapper function for URL, here we change the url if we have to relay the request
		 */
		private _wrapUrl(url:string, type:string):string {
			//url = this.bridge_url + "?type=" + type + "&url=" + encodeURIComponent(url)
			return url
		}
		
		private handleResponse(response:any, params:any):any {
			console.log("HANDLE RESPONSE", response)
			$("#loader").removeClass('loading');
			if (response.error) {
				if (response.error.code == 400) {
					this.Notification.error(response.error.message.badRequest.message)
				} else {
					this.Notification.error("Unhandled error")
				}
				return false
			} else {
				response.data.requestParams = params
				return response.data
			}
		}
	}
}

angular.module('auroraApp')
	.service('HttpWrapService', auroraApp.Services.HttpWrapService);
