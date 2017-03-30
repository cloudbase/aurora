/// <reference path="../_all.ts" />


declare module auroraApp {
	export interface IUserMenuItem {
		label: string
		action?()
		children ?: IUserMenuItem[]|any
	}
}