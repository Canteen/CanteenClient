	/**
	* @module jQuery 
	*/
	
	/**
	*  Handle all of the internal site links
	*  @class jQuery.internalLink
	*  @constructor
	*  @param {Canteen.Site} site The reference to the site
	*/
	$.fn.internalLink = function(site)
	{
		var basePath = Canteen.settings.basePath,
			index = Canteen.settings.siteIndex,
			state = site.currentState,
			checkConfirm = function(element)
			{
				if (element.hasClass('confirm'))
				{
					var title = element.data('confirm') || "Are you sure you wish to continue?",
						result = confirm(title);
					return result;
				}
				return true;
			};
		
		return this.each(function(){
			var link = $(this),
				refresh = link.data('refresh'),
				href = link.attr('href'),
				uri;
		
			// If refresh is set
			if (typeof refresh !== 'undefined')
			{
				link.untouch()
					.touch(function(e){
						
						// Check for confirmation
						if (!checkConfirm(link)) return;
						
						// If we should do a soft or hard refresh
						if (refresh == "soft")
						{
							e.preventDefault();
							site.refresh();
							return;
						}
						
						// hard redirect
						if (href)
						{
							document.location.href = href;
						}
						// hard site refresh
						else
						{
							site.refresh(false);
						}
					});
				return;
			}
		
			// Make sure the link is valid and the path isn't
			// already set to the base path
			if (!href || href.indexOf(basePath) !== 0) return;

			// Get the raw uri, without the base path
			uri = href.substr(basePath.length);
		
			// Setup the internal click
			link.untouch()
				.touch(function(e){
					
					// Prevent the default behavior
					e.preventDefault();
					
					// Check for confirmation
					if (!checkConfirm(link)) return;
					
					// Redirect to the page uri
					site.redirect(uri);
				})
				.removeClass('selected');

			// The link is either the current or the base of the request
			// or the index page
			var parent = new RegExp("^"+uri.replace("/", "\/")+"(\/.*)?$");

			if (uri == state || (state !== '' && parent.test(state)) || (uri == index && state === ''))
				link.addClass('selected');
		});
	};