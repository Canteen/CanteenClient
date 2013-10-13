/**
*  @module global 
*/
(function(global){
	
	"use strict";
	
	/**
	*  Create the namespace and assing to the window.
	* 
	*	namespace('cloudkid.utils').SpriteUtils = function(){};
	*  
	*  @class namespace
	*  @constructor
	*  @param {String} namespaceString Name space, for instance 'cloudkid.utils'
	*  @return {Object} Return the namespace
	*/
	var namespace = function(namespaceString) {
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '',
			i = 0,
			length = 0;

		for(i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	};
	
	// Assign to the global namespace
	global.namespace = namespace;
	
}(window));

