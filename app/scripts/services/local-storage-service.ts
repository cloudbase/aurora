/// <reference path="../_all.ts" />

module auroraApp.Services {
	export class LocalStorage {
		localStorage = {}
		
		constructor()
		{}
		
		get(key: string) {
			return this.localStorage[key]
		}
		set(key: string, value: any) {
			this.localStorage[key] =  value
		}
	}
}


angular.module('auroraApp')
	.service('LocalStorage', auroraApp.Services.LocalStorage);