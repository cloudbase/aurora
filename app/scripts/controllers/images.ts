/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class ImagesCtrl {
        initialCost = 0
        resize = false
        tags: string[] = []
        activeList: string = "recommended"
        images: IVmImage[]
        static $inject = [
            "$scope",
            "ApiService",
            "$stateParams"
        ]
        constructor(isolateScope: Directives.IVmListScope, public apiService: Services.IApiService, public $stateParams) {
            let flavor = this.apiService.vmImages.filter((vmFlavor:IVmImage):boolean => {
                return vmFlavor.selected == true
            })[0]

            apiService.vmImages.forEach((image:VmImage) => {
                image.tags.forEach((tag) => {
                    if (this.tags.indexOf(tag) == -1)
                        this.tags.push(tag)
                })
                if (this.tags.indexOf(image.os) == -1)
                    this.tags.push(image.os)
                image.tags.push(image.os)
            })
            
            this.images = this.apiService.vmImages
            
            apiService.listItems.forEach((vm:VmItem) => {
                vm.snapshots.forEach((snapshot:VmImage) => {
                    this.images.push(snapshot)
                })
            })
            
            this.tags.push("snapshots")
        }

        selectImage(obj: IVmImage) {
            angular.forEach(this.apiService.vmImages, (image:IVmFlavor) => {
                image.selected = false;
            })
            
            obj.selected = true
        }

        favoriteImage(obj:IVmImage) {
            let index = obj.tags.indexOf("favorites")
            if (index == -1) {
                obj.tags.push("favorites")
            } else {
                obj.tags.splice(index, 1)
            }
        }

        changeCategory(category) {
            this.activeList = category
        }
        
    }

}

angular.module('auroraApp')
  .controller('ImagesCtrl', auroraApp.ImagesCtrl)