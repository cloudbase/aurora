/// <reference path="../_all.ts" />

let constants = {
	'AUTH_URL': "http://10.7.12.17:35357/v2.0",
	'OS_URL': "http://10.7.12.17:5000/v2.0"
}

for (var constant in constants) {
	app.constant(constant, constants[constant])
}