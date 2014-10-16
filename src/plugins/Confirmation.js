	/**
	* @module jQuery 
	*/
	
	/**
	*  Add confirmation to link
	*  @class jQuery.confirmation
	*  @constructor
	*  @param {string} [message="Are you sure you wish to continue?"] The confirmation message
	*/
	$.fn.confirmation = function(message)
	{		
		var defaultTitle = "Are you sure you wish to continue?";
		return this.each(function(){
			var link = $(this),
				title = message || link.data('confirm') || defaultTitle;

			link.touch(function(e){
				if (!confirm(title))
				{
					e.stopImmediatePropagation();
				}
			});
		});
	};