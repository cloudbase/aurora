/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IComputeService {
		init():ng.IPromise< any >
		loadServerDetails(vm_id:string):ng.IPromise< VmItem >
		project: Project
		listItems: VmItem[]
		vmFlavors: VmFlavor[]
		vmImages: VmImage[]
		networks: INetwork[]
	}
}