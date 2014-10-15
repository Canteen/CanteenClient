/**
* @module Canteen 
*/
(function(){
	"use strict";
	
	/**
	*   Utility class for saving data to JavaScript cookies
	*   @class Canteen.SavedData
	*   @static
	*   @author Matt Karl <matt@cloudkid.com>
	*/
	var SavedData = function(){},
	
	// Only compute the days to milliseconds once 
	_daysToMS = 24*60*60*1000;
	
	/** 
	*  Use this value in place of 'days' to save data that expires 
	*  when the Date object no longer functions (more than 270 
	*  thousand years from now) 
	*  @property {String} NEVER_EXPIRE
	*  @static
	*  @final
	*  @default neverExpire
	*/
	SavedData.NEVER_EXPIRE = "neverExpire";
	
	/** 
	*  Clear a cookie value by name
	*  @method clear
	*  @static
	*  @param {String} name The name of the cooie property
	*/
	SavedData.clear = function(name)
	{
		SavedData.write(name,"",-1);
	};
	
	/**
	*  Create a cookie variable
	*  @method write
	*  @static
	*  @param {String} name The name of the cookie to create
	*  @param {mixed} value The value to save
	*  @param {int} days The number of days to keep - omit this to have the data 
	*         cleared when the browser is closed
	*/
	SavedData.write = function(name,value,days)
	{
		var expires, date;
		if (days)
		{
			if(days == SavedData.NEVER_EXPIRE)
			{
				date = new Date(2147483646000);//THE END OF (32bit UNIX) TIME!
			}
			else
			{
				date = new Date();
				date.setTime(date.getTime()+(days*_daysToMS));
			}
			expires = "; expires="+date.toGMTString();
		}
		else
			expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	};
	
	/**
	*  Read the value of the cookie
	*  @method read
	*  @static
	*  @param {String} name The name of the cookie
	*  @return {mixed} The value or null if it doesn't exist
	*/
	SavedData.read = function(name)
	{
		var nameEQ = name + "=",
			ca = document.cookie.split(';'),
			i = 0, c;
			
		for(i=0;i < ca.length;i++)
		{
			c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};
	
	// Assign to the global space
	namespace('Canteen').SavedData = SavedData;
	
}());