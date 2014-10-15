/**
* @module Canteen 
*/
(function(){
	
	"use strict";

	/**
	*   Utility function for parsing the location, address
	*   and query string parameters
	*  
	*   @class Canteen.LocationUtils
	*   @static
	*   @author Matt Karl <matt@cloudkid.com>
	*/
	var LocationUtils = function()
	{
		throw "Location Utils is a static class";
	};
	
	/**
	*  Define all of the query string parameters
	*  @static
	*  @method getParameters
	*  @return {Dictionary} The collection of query string parameters
	*/
	LocationUtils.getParameters = function()
	{
		var output = {},
			href = window.location.href,
			questionMark = href.indexOf("?"),
			vars = null,
			pound = null,
			splitVars = null,
			myVar = null,
			i = null;
		
		if (questionMark == -1) return output;
		
		vars = questionMark < 0 ? '' : href.substr(questionMark+1);
		pound = vars.indexOf('#');
		vars = pound < 0 ? vars : vars.substring(0, pound);
		splitVars = vars.split("&");
		
		for(i in splitVars )
		{
			myVar = splitVars[i].split("=");
			if (DEBUG) 
			{
				Debug.log(myVar[0] + " -> " + myVar[1]);
			}
			output[myVar[0]] = myVar[1];
		}
		return output;
	};
	
	namespace('Canteen').LocationUtils = LocationUtils;
	
}());