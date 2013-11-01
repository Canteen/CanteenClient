	/**
	* @module jQuery 
	*/

	/**
	*  Create a convenience function for the touch event which does a much better
	*  job at handling touch events responsively. The click event adds a delay
	*  but sometimes we want the touch to be immediate.
	*  
	*	$('a').touch(function(e){
	*		// Handle
	*	})
	*  
	*  @class jQuery.touch
	*  @constructor
	*  @param {Function} handler The touch handler
	*/
	$.fn.touch = function(handler)
	{
		return this.on('click', false).on('touchclick', handler);
	};

	/**
	*  Remove the touch handler that have been set using touch().
	*
	*	$('a').untouch();
	*
	*  @class jQuery.untouch
	*/
	$.fn.untouch = function()
	{
		return this.off('touchclick');
	};