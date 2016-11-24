/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/services/http-service.d.ts" />

'use strict';

describe("Service: HttpWrapService", () => {
	
	it ('should return true', () => {
		expect(true).toBeTruthy()
	})
	
	var $httpBackend : ng.IHttpBackendService
	var HttpWrapService: auroraApp.Services.HttpWrapService
	
	beforeEach(module('auroraApp'));
	
	beforeEach(inject(function(_HttpWrapService_, _$httpBackend_) {
		HttpWrapService = _HttpWrapService_
		$httpBackend = _$httpBackend_
	}));
	
	it("should initialize correctly", () => {
		expect(HttpWrapService).toBeDefined();
	});
	
	describe("setToken", () => {
		it("should set the http headers to the token", () => {
			HttpWrapService.setToken("token");
			expect(HttpWrapService.$http.defaults.headers.common['X-Auth-Token'] == "token" &&
				HttpWrapService.$http.defaults.headers.common['X-Auth-Token'] == "token").toBeTruthy()
		})
	})
	
	describe("get", () => {
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
	})
	
})