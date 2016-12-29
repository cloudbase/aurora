/// <reference path="../_all.ts" />

declare module auroraApp.Services {
	interface IComputeService {
		init():ng.IPromise< any >
		project: Project
	}
}