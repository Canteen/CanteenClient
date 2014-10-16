	/**
	* @module jQuery 
	*/
	
	/**
	*  Add confirmation to link
	*  @class jQuery.confirmLink
	*  @constructor
	*  @param {string} [message="Are you sure you wish to continue?"] The confirmation message
	*/
	$.fn.confirmLink = function(message)
	{		
		var defaultTitle = "Are you sure you wish to continue?";
		return this.each(function(){
			var link = $(this),
				title = message || link.data('confirm') || defaultTitle;

			link.untouch().touch(function(e){
				if (!confirm(title))
				{
					e.preventDefault();
					return false;
				}
			});
		});
	};