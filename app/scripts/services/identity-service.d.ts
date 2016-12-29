/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IIdentityService {
		isAuthenticated():ng.IPromise< any >
		authCredentials(user:string, pass:string):ng.IPromise< string >
		authWithToken(token: string):ng.IPromise< any >
		getEndpoint(service: string)
		init():ng.IPromise< any >
		loggedIn: boolean
		tenant_id: string
		endpoints: any
	}
	
	interface ITenant {
		name: string
		id: string
	}
}