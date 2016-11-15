/// <reference path="../_all.ts" />

module auroraApp.Services {
	
	export class ApiService implements IApiService {
		httpService:ng.IHttpService;
		cache:VmItem[] = []
		loggedIn = false // TODO: loggedIn - false
		token:string
		tenant_name:string = 'admin'
		tenant_id:string
		os_url:string = "http://192.168.0.103:35357/v2.0" //35357
		compute_url:string
		bridge_url:string = "http://localhost/bridge.php"
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
			"$http",
			"$q",
			"$cookies",
			"$location",
			"$timeout"
		]
		
		constructor(private $http:ng.IHttpService,
		            private $q:ng.IQService,
		            private $cookies:Services.ICookiesService,
		            private $location:ng.ILocationService,
								private $timeout:ng.ITimeoutService) {
				this.processData();
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
					self.addNetwork(value, response.networks.length, networkCount)
					networkCount++
				});
				
				// routers
				angular.forEach(response.routers, (value:any):void => {
					self.addRouter(value)
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
			var newFlavor = new VmFlavor(obj.name, obj.vCpu, obj.ram, obj.ssd, obj.price, obj.lists);
			obj.lists.forEach((item) => {
				if (this.vmFlavorsList.indexOf(item) == -1) {
					this.vmFlavorsList.push(item)
				}
			})
			
			this.vmFlavors.push(newFlavor)
		}
		
		addNetwork(obj:any, length: number, index: number) {
			var newNetwork = new VmNetwork(
				obj.name,
				obj.type,
				obj.subnet,
				obj.interface,
				obj.ip_address,
				obj.state,
				obj.shared,
				obj.allocation_pools
			);
			
			this.vmNetworks[obj.name] = newNetwork
			this.networkList.push(newNetwork)
			
			let network_start =  (12 - (12 % length)) / length
			let network_pos = network_start + index * 2
			window['mapDetails']['elements']['network' + '_' + obj.name] = {x: 10, y: network_pos, type: 'network'}
			window['mapDetails']['links'].push({from: "router", to: 'network' + '_' + obj.name, type: "uni"})
		}
		
		addRouter(obj:any) {
			let routerInterfaces:IRouterInterface[] = []
			obj.interfaces.forEach(routerInterface => {
				routerInterfaces.push({
					name: routerInterface.name,
					ip: routerInterface.ip,
					route1: routerInterface.route1,
					route2: routerInterface.route2
				})
			})
			var newRouter = new NetworkRouter(obj.name, routerInterfaces)
			this.networkRouters.push(newRouter)
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
		
		isAuthenticated():ng.IPromise< any > {
			let deferred = this.$q.defer()
			let self = this
			if (!this.authenticated) {
				// check if there is token
				let token:string = this.$cookies.get("token")
				if (angular.isDefined(token)) {
					this.authWithToken(token).then(() => {
						self.authenticated = true
						deferred.resolve(true)
					}, (reason:any) => {
						this.$location.url("/")
					});
				} else {
					this.$location.url("/")
				}
			} else {
				deferred.resolve(true)
			}
			
			return deferred.promise
		}
		
		authCredentials(user:string, pass:string):ng.IPromise< string > {
			let deferred = this.$q.defer()
			deferred.notify("Logging in..")
			
			// REMOVE
			this.authenticated = true;
			deferred.resolve("Success")
			return deferred.promise
			// END REMOVE
			
			let credentials:IPasswordCredentials = {
				username: user,
				password: pass
			}
			let authObj:IAuthCredentials = {
				tenantName: this.tenant_name,
				passwordCredentials: credentials
			}
			
			let url:string = this.os_url + "/tokens"
			
			this._post(url, {auth: authObj}).then((response) => {
				if (angular.isDefined(response.access)) {
					this.handleAuthSuccess(response)
					
					deferred.resolve("Success")
				} else {
					console.log("ERROR HERE", response)
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error.message)
					} else {
						deferred.reject("Something went wrong..")
					}
				}
			}, (reason) => {
				deferred.notify("No connection");
			});
			
			return deferred.promise
		}
		
		authWithToken(token:string) {
			let deferred = this.$q.defer()
			deferred.notify("Loging in..")
			
			let tokenObj:IToken = {id: token}
			
			let authObj:IAuthTokenRequest = {
				tenantName: this.tenant_name,
				token: tokenObj
			}
			
			let url:string = this.os_url + "/tokens"
			
			this._post(url, {auth: authObj}).then((response) => {
				if (angular.isDefined(response.access)) {
					this.handleAuthSuccess(response)
					deferred.resolve("Success")
				} else {
					if (angular.isDefined(response.error)) {
						deferred.reject(response.error.message)
					} else {
						deferred.reject("Something went wrong..")
					}
				}
			}, (reason) => {
				deferred.notify("No connection");
			});
			
			return deferred.promise
		}
		
		setVmProperty(id:string, properties:IVmProperty[]):ng.IPromise< any > {
			let url:string = this.compute_url + "/servers/" + id
			let deferred = this.$q.defer();
			this.isAuthenticated().then(() => {
				deferred.notify("Starting request")
				let payload:{} = {}
				angular.forEach(properties, (property:IVmProperty) => {
					payload[property.name] = property.value
				})
				this._put(url, {server: payload}).then((response) => {
					deferred.resolve();
				});
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
			// REMOVE
			this._get("data/servers.json").then((response) => {
				deferred.resolve(response)
				this.cache = response
				this.queried = true
			})
			
			return deferred.promise
			// END REMOVE
			
			this.isAuthenticated().then(() => {
				let url:string = this.compute_url + "/servers/detail"
				
				if (this.cache.length == 0 || !useCache) {
					this._get(url).then((response):void => {
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
		
		serverAction(id:string, action:string):ng.IPromise< any > {
			let deferred = this.$q.defer();
			this.isAuthenticated().then(() => {
				let url:string = this.compute_url + "/servers/detail"
				let actionObj:{} = {}
				actionObj[action] = null
				this._post(this.compute_url + "/servers/" + id + "/action", actionObj).then(() => {
					deferred.resolve()
				})
			});
			return deferred.promise
		}
		
		private handleAuthSuccess(response) {
			this.token = response.access.token.id
			this.tenant_id = response.access.token.tenant.id
			
			// we will just pick the compute url and ignore the rest
			this.compute_url = response.access.serviceCatalog[0].endpoints[0].adminURL;
			
			this.$cookies.put("token", this.token)
			this.$cookies.put("tenant_id", this.tenant_id)
			this.$cookies.put("compute_url", this.compute_url)
			
			this.$http.defaults.headers.common["X-Auth-Token"] = this.token
			this.$http.defaults.headers.put["X-Auth-Token"] = this.token
			
			this.authenticated = true
		}
		
		
		/**
		 * GET call function wrapper
		 */
		private _get(url:string):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "GET");
			
			var result:ng.IPromise< any > = this.$http.get(url)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * POST call function wrapper
		 */
		private _post(url, payload):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "POST");
			
			var result:ng.IPromise< any > = this.$http.post(url, payload)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * POST call function wrapper
		 */
		private _put(url, payload):ng.IPromise< any > {
			$("#loader").addClass('loading');
			url = this._wrapUrl(url, "PUT");
			// PUT request will be relayed:
			var result:ng.IPromise< any > = this.$http.post(url, payload)
				.then((response:any):ng.IPromise< any > => this.handleResponse(response, null))
			
			return result
		}
		
		/**
		 * Wrapper function for URL, here we change the url if we have to relay the request
		 */
		private _wrapUrl(url:string, type:string):string {
			//url = this.bridge_url + "?type=" + type + "&url=" + encodeURIComponent(url)
			return url
		}
		
		private handleResponse(response:any, params:any):any {
			// TODO: Add error cases
			response.data.requestParams = params
			$("#loader").removeClass('loading');
			return response.data
		}
	}
}

angular.module('auroraApp')
	.service('ApiService', auroraApp.Services.ApiService);