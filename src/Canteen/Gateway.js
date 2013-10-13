/**
* @module Canteen 
*/
(function(undefined){
	
	"use strict";
	
	/**
	*  The Gateway object is responsible for connecting
	*  to the json gateway for site data
	*  @class Canteen.Gateway
	*  @constructor
	*  @param {String} gatewayUrl The url to the gateway
	*  @param {function} callback The callback function when server is read
	*  @author Matt Karl <matt@cloudkid.com>
	*/
	var Gateway = function(gatewayUrl, callback)
	{
		this.initialize(gatewayUrl, callback);
	},
	
	// Save a reference to the prototype
	p = Gateway.prototype;
	
	/**
	*  The url of the gateway service 
	*  @property {String} gatewayUrl
	*/
	p.gatewayUrl = null;
	
	/**
	*  Estable a connection to the gatewayUrl
	*  @method initialize
	*  @param {String} gatewayUrl The url to the gateway
	*  @param {function} callback The callback function when server is read
	*/
	p.initialize = function(gatewayUrl, callback)
	{
		this.gatewayUrl = gatewayUrl;
		
		if (gatewayUrl.charAt(gatewayUrl.length -1) != '/')
		{
			this.gatewayUrl += '/';
		}
		
		this.get(function(data){
			var ifError = (data === null || data.type == 'error');
			if (ifError)
			{
				throw "Couldn't connect to gateway";
			}
			callback(!ifError);
		}, 'time', 'get-server-time');
	};
	
	/**
	*  Main call for the service
	*  @method get
	*  @param {function} callback The callback when we're done
	*  @param {String} service The service to call from
	*  @param {String} method The service method name
	*  @param {mixed} [parameters] Optional, additional parameters to pass to service call
	*/
	p.get = function(callback, service, method, parameters)
	{
		var url = this.gatewayUrl + service + "/" + method;
		if (parameters !== undefined)
		{
			url += "/"+($.isArray(parameters) ? parameters.join('/') : String(parameters));
		}
		if (DEBUG) 
		{
			Debug.log(url);
		}
		$.get(url, function(response){
			if (!response || response == 'null')
			{
				callback(null);
				return;
			}
			if (response.search(/^{.*}$/) == -1)
			{
				Debug.error(response);
				callback(null);
				return;
			}
			var data = JSON.parse(response);
			if (data.type == 'fatalError')
			{
				Debug.fatalError(data.errors);
				callback(null);
				return;
			}
			callback(data);		
		});
	};
	
	/**
	*  Destroy the Gateway and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		p = null;
	};
	
	// Assign to the window for global access
	namespace('Canteen').Gateway = Gateway;
	
}());