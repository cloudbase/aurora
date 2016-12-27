/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IIdentityService {
		isAuthenticated():ng.IPromise< any >
		authCredentials(user:string, pass:string):ng.IPromise< string >
		authWithToken(token: string):ng.IPromise< any >
		getEndpoint(service: string)
		loggedIn: boolean
		endpoints: any
	}
}