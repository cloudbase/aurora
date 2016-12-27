/// <reference path="../_all.ts" />

module auroraApp.Services {
	export class ComputeService {
		cache:VmItem[] = []
		url:string
		listItems:VmItem[] = []
		vmFlavors:VmFlavor[] = []
		vmFlavorsList:string[] = []
		vmImages:VmImage[] = []
		vmVolumes: VmVolume[] = []
		vmSnapshots: VmSnapshot[] = []
		vmImagesList:string[]
		vmNetworks:VmNetwork[] = []
		networkRouters:NetworkRouter[] = []
		networkList:VmNetwork[] = []
		project:Project
		queried:boolean = false
		
		private authenticated:boolean = false
		
		static $inject = [
			"HttpWrapService",
			"IdentityService",
			"$q",
			"$cookies",
			"$location",
			"$timeout",
			"LocalStorage"
		]
		
		constructor(private http:Services.IHttpWrapperService,
		            private identity: Services.IIdentityService,
		            private $q:ng.IQService,
		            private $cookies:Services.ICookiesService,
		            private $location:ng.ILocationService,
		            private $timeout:ng.ITimeoutService,
								public localStorage: LocalStorage) {
			
			this.loadFlavors()
			this.$q.all([this.loadImages(), this.loadFlavors()]).then(response => {
				this.loadServers()
			})
			this.loadImages()
			this.processData()
			console.log(this.vmImages, this.vmFlavors)
		}
		
		loadFlavors():ng.IPromise< VmFlavor[] >
		{
			let deferred = this.$q.defer()
			let endpoint = this.compute_url()
			let url = endpoint.url + "/flavors/detail"
			
			this.http.get(url, {"Enpoint-ID": endpoint.id}).then(response => {
				if (response.flavors) {
					angular.forEach(response.flavors, item => {
						let flavor = new VmFlavor(
							item.id,
							item.name,
							item.vcpus,
							item.ram,
							item.disk,
							0,
							item.tags
						)
						this.vmFlavors.push(flavor)
					});
					deferred.resolve(this.vmFlavors)
				} else {
					// TODO: Error handle
				}
			})
			return deferred.promise;
		}
		
		getFlavor(id: string): VmFlavor
		{
			let flavor: VmFlavor = null
			this.vmFlavors.forEach(item => {
				if (item.id == id)
					flavor = item
			})
			return flavor
		}
		
		loadImages():ng.IPromise< VmImage[] >
		{
			
			let url = this.images_url() + "/v2/images"
			let deferred = this.$q.defer()
			this.http.get(url).then(response => {
				if (response.images) {
					angular.forEach(response.images, item => {
						let image = new VmImage(
							item.id,
							item.name,
							'generic',
							'1.0',
							item.size,
							'image',
							item.created_at,
							item.tags
						)
						this.vmImages.push(image)
					})
					deferred.resolve(this.vmImages)
				}
			})
			return deferred.promise;
		}
		
		getImage(id: string): VmImage
		{
			let image: VmImage = null
			this.vmImages.forEach(item => {
				if (item.id == id)
					image = item
			})
			return image
		}
		
		loadServers():ng.IPromise< VmItem[] >
		{
			let deferred = this.$q.defer()
			
			let url:string = this.compute_url() + "/servers/detail"
			
			this.http.get(url).then((response):void => {
				this.cache = response
				
				if (response.servers) {
					angular.forEach(response.servers, server => {
						let started:Date = new Date(Date.parse(server.updated));
						let vm = new VmItem(
							server.id,
							server.name,
							server.status,
							server.created,
							this.getImage(server.image.id),
							[],
							this.getFlavor(server.flavor.id),
							server["OS-EXT-AZ:availability_zone"],
							[],
							[],
							started
						)
						
						this.listItems.push(vm)
					})
					console.log(this.listItems)
				}
				
				deferred.resolve(response)
			});
		
			
			return deferred.promise
		}
		
		processData():ng.IPromise< any > {
			let deferred = this.$q.defer()
			var self = this
			
			window['mapDetails'] = {
				elements: {
					internet: {x: 1, y: 6, type: 'internet'},
					router: {x: 6, y: 6, type: 'router'}
				},
				links: [
					{from: "internet", to: "router", type: "uni"}
				]
			}
			// query the service for the list
			this.queryServers().then((response:any):void => {
				let projectData = response.project
				
				let zones:IZone[] = []
				projectData.zones.forEach((zone) => {
					zones.push({id: zone, name: zone})
				})
				
				let security_groups:ISecurityGroup[] = []
				
				angular.forEach(projectData.security_groups, (value: any) => {
					if (value == "default")
						security_groups.push({name: value, rules: null, selected: true})
					else
						security_groups.push({name: value, rules: null, selected: false})
				})
				
				this.project = new Project(
					projectData.vm_limit,
					projectData.vcpu_limit,
					projectData.vram_limit,
					projectData.storage_limit,
					projectData.volumes_limit,
					projectData.monthly_budget,
					projectData.currency,
					zones,
					projectData.floating_ips,
					projectData.floating_ip_limit,
					security_groups
				)
				
				// Images
				angular.forEach(response.images, (value:any):void => {
					self.addImage(value)
				});
				
				// Volumes
				angular.forEach(response.volumes, (value:any):void => {
					self.addVolume(value)
				});
				
				// Flavors
				angular.forEach(response.flavors, (value:any):void => {
					self.addFlavor(value)
				});
				
				// Networks
				let networkCount = 0;
				angular.forEach(response.networks, (value:any):void => {
					//self.addNetwork(value, response.networks.length, networkCount)
					networkCount++
				});
				
				// routers
				angular.forEach(response.routers, (value:any):void => {
					//self.addRouter(value)
				});
				
				// VMs
				let vmCount = 0;
				angular.forEach(response.servers, (value:any):void => {
					self.addVm(value, vmCount);
					vmCount++
				});
				deferred.resolve()
				
			});
			return deferred.promise
		}
		
		/**
		 * Adds or updates record in list
		 */
		addVm(obj:any, index) {
			let date:Date = new Date(Date.parse(obj.created));
			
			let started:Date = new Date(Date.parse(obj.updated));
			
			// search if VM already exists
			let searchVm = this.listItems.filter((vmItem):boolean => {
				return vmItem.id == obj.id
			})[0]
			
			// get the image object
			let searchImage = this.vmImages.filter((vmImage):boolean => {
				return vmImage.id == obj.os_type
			})[0]
			
			// get the flavor object
			let searchFlavor = this.vmFlavors.filter((vmFlavor):boolean => {
				return vmFlavor.name == obj.flavor
			})[0]
			
			let networkInterfaces:INetworkInterface[] = []
			
			obj.networks.forEach((item) => {
				let floatingIp:IFloatingIp = null
				if (item.floating_ip.length > 0) {
					floatingIp = this.project.floating_ips[item.floating_ip]
				}
				
				let newNetworkInterface = {
					network: this.vmNetworks[item.network],
					ip_addr: this.vmNetworks[item.network].allocateIp(),
					floating_ip: floatingIp
				}
				networkInterfaces.push(newNetworkInterface)
				
				if (floatingIp != null)
					floatingIp.assigned_to = newNetworkInterface
			})
			
			let snapshots:VmSnapshot[] = []
			
			// obj.snapshots.forEach((snapshot) => {
			// 	let date:Date = new Date(Date.parse(snapshot.created));
			// 	snapshots.push(new VmSnapshot(
			// 		snapshot.name,
			// 		date,
			// 		snapshot.size
			// 	))
			// })
			
			var newItem = new VmItem(
				obj.id,
				obj.name,
				obj.host_status,
				date,
				searchImage,
				obj.ip_addr,
				searchFlavor,
				obj["OS-EXT-AZ:availability_zone"],
				snapshots,
				networkInterfaces,
				obj.tags,
				started
			);
			
			
			// if exists, update, if not push into array
			if (angular.isUndefined(searchVm)) {
				this.insertVm(newItem)
				
				//window['mapDetails']['links'].push({from: "router", to: 'network' + '_' + obj.name, type: "uni"})
			} else {
				this.listItems[this.listItems.indexOf(searchVm)] = newItem
			}
			
			newItem.network_interfaces.forEach((item:INetworkInterface) => {
				if (item.floating_ip) {
					let index = this.project.floating_ips.indexOf(item.floating_ip)
					this.project.floating_ips[index].assigned_vm = newItem
				}
			});
			
		}
		
		getVm(vmId:string):VmItem {
			let vm:VmItem
			this.listItems.forEach((item:VmItem) => {
				if (item.id == vmId) {
					vm = item
				}
			});
			return vm
		}
		
		addImage(obj:any) {
			var newImage = new VmImage(obj.id, obj.name, obj.os, obj.version, 2, "image", new Date(), obj.tags);
			
			this.vmImages.push(newImage)
			
		}
		
		addVolume(obj:any) {
			let region:IZone = null
			
			this.project.zones.forEach((zone:IZone) => {
				if (zone.name == obj.region)
					region = zone
			})
			let newVolume = new VmVolume(
				obj.id,
				obj.name,
				obj.description,
				obj.size,
				null,
				obj.status,
				obj.type,
				region,
				obj.bootable,
				obj.encrypted
			)
			
			this.vmVolumes.push(newVolume)
		}
		
		updateVm(obj:VmItem) {
			this.listItems.forEach((vm:VmItem) => {
				if (vm.id == obj.id)
					vm = obj
			})
		}
		
		addFlavor(obj:any) {
			/*var newFlavor = new VmFlavor(obj.name, obj.vCpu, obj.ram, obj.ssd, obj.price, obj.lists);
			obj.lists.forEach((item) => {
				if (this.vmFlavorsList.indexOf(item) == -1) {
					this.vmFlavorsList.push(item)
				}
			})
			
			this.vmFlavors.push(newFlavor)*/
		}
		
		insertVm(vm:VmItem) {
			this.listItems.push(vm);
			let index = this.listItems.length
			
			let vm_pos_y = index * 2 - 1
			let vm_pos_x = 15
			window['mapDetails']['elements']['vm' + '_' + vm.id] = {x: vm_pos_x, y: vm_pos_y, type: 'vm'}
			vm.network_interfaces.forEach((networkInterface:INetworkInterface) => {
				let newLink = {from: "network_" + networkInterface.network.name, to: 'vm' + '_' + vm.id, type: "uni", connector: "metro"}
				if (window['mapDetails']['links'].indexOf(newLink) == -1)
					window['mapDetails']['links'].push(newLink)
			})
		}
		
		
		setVmProperty(id:string, properties:IVmProperty[]):ng.IPromise< any > {
			//let url:string = this.compute_url + "/servers/" + id
			let deferred = this.$q.defer();
			this.identity.isAuthenticated().then(() => {
				deferred.notify("Starting request")
				let payload:{} = {}
				angular.forEach(properties, (property:IVmProperty) => {
					payload[property.name] = property.value
				})
				/*this.http.put(url, {server: payload}).then((response) => {
					deferred.resolve();
				});*/
			});
			return deferred.promise
		}
		
		/**
		 * Returns the list of servers from API
		 */
		queryServers(useCache:boolean = true):ng.IPromise< any > {
			let deferred = this.$q.defer()
			if (this.queried) {
				this.$timeout(() => {
					deferred.resolve(this.cache)
				}, 1000)
			}
			
			this.identity.isAuthenticated().then(() => {
				let url:string = this.compute_url() + "/servers/detail"
				
				if (this.cache.length == 0 || !useCache) {
					this.http.get(url).then((response):void => {
						this.cache = response
						deferred.resolve(response)
					});
				} else {
					console.log('cache');
					deferred.resolve(this.cache)
				}
			})
			
			return deferred.promise
		}
		
		/**
		 * Retrieves compute url
		 * @returns {any}
		 */
		private compute_url():any
		{
			let endpoints = this.localStorage.get('endpoints')
			let url = endpoints.compute.publicURL
			let id = endpoints.compute.publicURL
			
			if (!url) {
				console.log("Compute url not valid!", endpoints.compute.publicURL)
				return false
			}
			return {url: url, id: id}
		}
		
		/**
		 * Retrieves compute url
		 * @returns {any}
		 */
		private images_url():string|boolean
		{
			let endpoints = this.localStorage.get('endpoints')
			let url = endpoints.image.publicURL
			
			//return "http://10.7.12.21:8774/v2/2e811ac45e548959bed63f7fbe32804"
			if (!url) {
				console.log("Compute url not valid!", endpoints.compute.publicURL)
				return false
			}
			return url
		}
	}
}

angular.module('auroraApp')
	.service('ComputeService', auroraApp.Services.ComputeService);