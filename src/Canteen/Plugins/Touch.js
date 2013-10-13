	/**
	* @module jQuery 
	*/
	
	/** 
	*  Use this instead of click, this will use the correct
	*  event for given touch type. Fallback to mouseup event
	*/
	$.event.special.touch = {
		setup: function() {
			// Use touch if the browser supports it
			var e = ("ontouchend" in document) ? "touchend" : "mouseup",
				// Check for jQuery 1.9.1+
				handler = $.event.handle === undefined ? $.event.dispatch : $.event.handle;
			$(this).on(e + ".touch", function(event) {
				event.type = "touch";
				handler.call(this, event);
			});
		},
		teardown: function() {
			$(this).off(".touch");
		}
	};

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
		return this.click(false).on('touch', handler);
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
		return this.off('touch');
	};