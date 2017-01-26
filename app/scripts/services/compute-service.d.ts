/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IComputeService {
		init():ng.IPromise< any >
		project: Project
		listItems: VmItem[]
		vmFlavors: VmFlavor[]
		vmImages: VmImage[]
		networks: INetwork[]
	}
}