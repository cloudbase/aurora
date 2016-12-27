/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IVmProperty {
		name:string
		value:string
	}
	
	interface IPasswordCredentials {
		username:string
		password:string
	}
	
	interface IAuthCredentials {
		tenantName?:string
		passwordCredentials:IPasswordCredentials
	}
	interface IToken {
		id:string
	}
	interface IAuthTokenRequest {
		tenantName?:string
		token:IToken
	}
	interface IAuth {
		auth:IAuthCredentials | IAuthTokenRequest
	}
	
	interface IApiService {
		authCredentials(user:string, pass:string):ng.IPromise< string >
		queryServers(useCache?:boolean):ng.IPromise< any >
		processData():ng.IPromise< any >
		serverAction(id:string, action:string):ng.IPromise< any >
		setVmProperty(id:string, properties:IVmProperty[]):ng.IPromise< any >
		insertVm(obj:IVmItem)
		listItems:IVmItem[]
		vmFlavors:IVmFlavor[]
		vmImages:IVmImage[]
		vmVolumes:VmVolume[]
		vmNetworks:IVmNetwork[]
		vmSnapshots:IVmSnapshot[]
		networkList:IVmNetwork[]
		project:Project
		loggedIn: boolean
		//handlerResponded(response: any, params: any): any
		//_wrapUrl(url: string, type: string): string
		//_get(url: string): ng.IPromise< any >
		//_post(url: string, payload: any): ng.IPromise< any >
	}
	
	interface ICookiesService {
		get(key:string):string;
		getObject(key:string):any;
		getAll():any;
		put(key:string, value:string, options?:any):void;
		putObject(key:string, value:any, options?:any):void;
		remove(key:string, options?:any):void;
	}
}