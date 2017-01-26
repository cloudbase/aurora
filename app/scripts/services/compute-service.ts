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
		networks: INetwork[] = []
		networkRouters:NetworkRouter[] = []
		networkList:VmNetwork[] = []
		project: Project
		queried:boolean = false
		os_url: string
		initialized: boolean = false
		
		private authenticated:boolean = false
		
		static $inject = [
			"config",
			"HttpWrapService",
			"IdentityService",
			"$q",
			"$cookies",
			"$location",
			"$timeout",
			"LocalStorage"
		]
		
		constructor(private config,
		            private http:Services.IHttpWrapperService,
		            private identity: Services.IIdentityService,
		            private $q:ng.IQService,
		            private $cookies:Services.ICookiesService,
		            private $location:ng.ILocationService,
		            private $timeout:ng.ITimeoutService,
								public localStorage: LocalStorage) {
			
			this.os_url = config.OS_URL
		}
		
		init(force = false):ng.IPromise< any >
		{
			let deferred = this.$q.defer()
			if (this.initialized && !force){
				deferred.resolve(true)
			} else {
				this.$q.all([this.loadImages(), this.loadFlavors()]).then(response => {
					this.$q.all([this.loadServers(), this.getTenantQuota()]).then(res => {
						this.initialized = true
						deferred.resolve(true)
					})
				})
			}
			this.loadNetworks()
			return deferred.promise
		}
		
		loadFlavors():ng.IPromise< VmFlavor[] >
		{
			let deferred = this.$q.defer()
			
			let endpoint = this.compute_endpoint()
			let url = this.os_url + "/nova/flavors/detail"
			
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then(response => {
				if (response.flavors) {
					this.vmFlavors = []
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
		
		getTenantQuota():ng.IPromise< Project >
		{
			let deferred = this.$q.defer()
			
			let endpoint = this.compute_endpoint()
			let url = this.os_url + "/nova/os-quota-sets/" + this.identity.tenant_id
			
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then(response => {
				if (response.quota_set) {
					let quota = response.quota_set
					this.project = new Project(
						quota.id,
						quota.instances,
						quota.cores,
						quota.ram,
						-1,
						128000,
						12000,
						"EUR",
						[],
						[],
						quota.floating_ips,
						[],
						quota.security_groups,
						[],
						quota.server_groups
					)
					deferred.resolve(this.project)
					console.log("Project:", this.project)
				}
				
			})
			return deferred.promise
		}
		
		getZones():ng.IPromise< any >
		{
			let deferred = this.$q.defer()
			
			let endpoint = this.compute_endpoint()
			let url = this.os_url + "/os-availability-zone"
			
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then(response => {
				if (response.availabilityZoneInfo) {
					angular.forEach(response.availabilityZoneInfo, item => {
						this.project.zones.push({id: item.zoneName, name: item.zoneName})
					})
				}
			});
			
			return deferred.promise
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
			let endpoint = this.images_url()
			let url = this.os_url + "/glance/v2/images"
			let deferred = this.$q.defer()
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then(response => {
				if (response.images) {
					this.vmImages = []
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
			let endpoint = this.compute_endpoint()
			let url:string = this.os_url + "/nova/servers/detail"
			
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then((response):void => {
				this.cache = response
				
				if (response.servers) {
					this.listItems = []
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
		
		
		loadNetworks():ng.IPromise< any > {
			let deferred = this.$q.defer();
			
			let endpoint = this.network_endpoint()
			let url:string = this.os_url + "/neutron/v2.0/networks"
			
			this.http.get(url, {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}).then((response):void => {
				if (response.networks)
					this.networks = response.networks
			})
			
			return deferred.promise
		}
		
		processData():ng.IPromise< any > {
			console.log("PROCESS DATA")
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
		
		insertVm(vm:VmItem):ng.IPromise< boolean > {
			this.listItems.push(vm);
			let index = this.listItems.length
			
			let vm_pos_y = index * 2 - 1
			let vm_pos_x = 15
			/*window['mapDetails']['elements']['vm' + '_' + vm.id] = {x: vm_pos_x, y: vm_pos_y, type: 'vm'}
			vm.network_interfaces.forEach((networkInterface:INetworkInterface) => {
				let newLink = {from: "network_" + networkInterface.network.name, to: 'vm' + '_' + vm.id, type: "uni", connector: "metro"}
				if (window['mapDetails']['links'].indexOf(newLink) == -1)
					window['mapDetails']['links'].push(newLink)
			})*/
			
			var networks = []
			angular.forEach(vm.networks, network => networks.push({uuid: network.id}))
			
			var payload = {
				server: {
					name: vm.name,
					imageRef: vm.image.id,
					flavorRef: vm.flavor.id,
					networks: networks
				}
			}
			console.log("Payload", payload)
			
			let deferred = this.$q.defer()
			let endpoint = this.compute_endpoint()
			let url:string = this.os_url + "/nova/servers"
			
			this.http.post(
				url,
				payload,
				{"headers": {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}}
			).then((response):void => {
				deferred.resolve(true)
			});
			return deferred.promise
			
		}
		
		/**
		 * Returns the list of servers from API
		 */
		queryServers(useCache:boolean = true):ng.IPromise< any > {
			console.log('CALL: query servers')
			let deferred = this.$q.defer()
			deferred.resolve(true)
			
			return deferred.promise
		}
		
		/**
		 * Retrieves compute url
		 * @returns {any}
		 */
		private compute_endpoint():any
		{
			let endpoints = this.localStorage.get('endpoints')
			let url = endpoints.compute.publicURL
			let id = endpoints.compute.id
			
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
		private network_endpoint():any
		{
			let endpoints = this.localStorage.get('endpoints')
			let url = endpoints.network.publicURL
			let id = endpoints.network.id
			
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
		private images_url():any
		{
			let endpoints = this.localStorage.get('endpoints')
			let url = endpoints.image.publicURL
			let id = endpoints.image.id
			
			//return "http://10.7.12.21:8774/v2/2e811ac45e548959bed63f7fbe32804"
			if (!url) {
				console.log("Compute url not valid!", endpoints.compute.publicURL)
				return false
			}
			return {url: url, id: id}
		}
		
		/**
		 * Set state of VM
		 */
		setVmState(vm:VmItem, state:string):ng.IPromise< boolean > {
			let payload
			switch (state) {
				case "REBOOT":
					payload = {"reboot": {"type": "HARD"}}
					break;
				case "PAUSE":
					payload = {"pause": null}
					break;
				case "UNPAUSE":
					payload = {"unpause": null}
					break;
				case "START":
					payload = {"os-start" : null}
					break;
				case "RESET":
					payload = {"os-resetState": {"state": "active"}}
					break;
			}
			
			let deferred = this.$q.defer()
			let endpoint = this.compute_endpoint()
			let url:string = this.os_url + "/nova/servers/" + vm.id + "/action"
			
			this.http.post(
				url,
				payload,
				{"headers": {"Endpoint-ID": endpoint.id, "Tenant-ID": this.identity.tenant_id}}
			).then((response):void => {
				deferred.resolve(true)
			});
			return deferred.promise
		}
	}
}

angular.module('auroraApp')
	.service('ComputeService', auroraApp.Services.ComputeService);