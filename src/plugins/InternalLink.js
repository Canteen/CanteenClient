	/**
	* @module jQuery 
	*/
	
	/**
	*  Handle all of the internal site links
	*  @class jQuery.internalLink
	*  @constructor
	*  @param {Canteen.Site} site The reference to the site
	*/
	$.fn.internalLink = function(site, undefined)
	{
		var basePath = Canteen.settings.basePath,
			index = Canteen.settings.siteIndex,
			state = site.currentState;
		
		return this.each(function(){
			var link = $(this),
				selectedClass = link.data('selected') || 'selected',
				href = link.attr('href'),
				uri = href.substr(basePath.length);
			
			// Make sure the link is valid and the path isn't
			// already set to the base path
			if (!href || href.indexOf(basePath) !== 0)
			{
				if (DEBUG)
				{
					Debug.info("No href or link doesn't start with basePath ('" +
						basePath + "') '" + href + "'");
				}
				return;
			}

			// Let's ignore anything that starts with a protocol ("http:")
			// these aren't properly formatted to be used with internal linking
			if (/^([a-z]{3,}\:)/i.test(href))
			{
				if (DEBUG)
				{
					Debug.info("Internal links cannot start with a protocol '" + href + "'");
				}
				return;
			}

			link.removeClass(selectedClass)
				.touch(function(e){					
					e.preventDefault();
					site.redirect(uri, false, true); // allow refresh
				});
			
			// Pattern 
			var parent = new RegExp("^"+uri.replace("/", "\/")+"(\/.*)?$");

			// Check the conditions to see if we should select the current page
			if (uri === state || // current page
				(state !== '' && parent.test(state)) || // child page
				(uri == index && state === '')) // home page
			{
				link.addClass(selectedClass);
			}	
		});
	};