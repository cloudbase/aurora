/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IHttpWrapperService {
		setToken(token: string)
		get(url:string, headers?: any):ng.IPromise< any >
		post(url:string, payload: any, config ?: any):ng.IPromise< any >
		put(url:string, payload: any):ng.IPromise< any >
	}
}
