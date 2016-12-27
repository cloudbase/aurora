/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/services/http-service.d.ts" />

'use strict';

describe("Service: ComputeService", () => {
	
	it ('should return true', () => {
		expect(true).toBeTruthy()
	})
	
	var $httpBackend : ng.IHttpBackendService
	var ComputeService: auroraApp.Services.ComputeService
	var LocalStorage: auroraApp.Services.LocalStorage
	
	beforeEach(module('auroraApp'));
	
	beforeEach(inject(function(_ComputeService_, _$httpBackend_, _LocalStorage_) {
		ComputeService = _ComputeService_
		$httpBackend = _$httpBackend_
		LocalStorage = _LocalStorage_
		
		
	}));
	
	it("should initialize correctly", () => {
		expect(ComputeService).toBeDefined();
	});
	
	LocalStorage.set("endpoints", {
		compute: { publicUrl: "http://test.compute.url" },
		images: { publicUrl: "http://test.images.url" },
	})
	
	describe("loadImages", () => {
		let url =  "http://test.images.url"
		$httpBackend
			.when('GET', url)
			.respond(200, {test: "call"})
		it ("should call the right url", () => {
			//ComputeService.compute
		})
	})
	
	/*
	describe("loadFlavors", () => {
		it ("should send GET call", () => {
			let url = "test_url"
			$httpBackend
				.when('GET', url)
				.respond(200, {test: "call"})
			
			HttpWrapService.get(url).then(response => {
				expect(response).toEqual({test: "call"})
			})
			$httpBackend.flush()
		})
	})
	
	describe("post", () => {
		it ("should send POST call", () => {
			let url = "test_url"
			let payload = {payload: "test"}
			$httpBackend
				.when('POST', url)
				.respond(200, {test: "call"})
			
			HttpWrapService.post(url, payload).then(response => {
				expect(response).toEqual({test: "call"})
			})
			$httpBackend.expectPOST(url, payload)
			$httpBackend.flush()
		})
	})
	
	describe("put", () => {
		it ("should send PUT call", () => {
			let url = "test_url"
			let payload = {payload: "test"}
			$httpBackend
				.when('POST', url)
				.respond(200, {test: "call"})
			
			HttpWrapService.put(url, payload).then(response => {
				expect(response).toEqual({test: "call"})
			})
			$httpBackend.expectPUT(url, payload)
			$httpBackend.flush()
		})
	})*/
	
})