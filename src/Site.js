/**
* @module Canteen 
*/
(function(global, $, undefined){
	
	"use strict";
	
	// Class imports
	var EventDispatcher = Canteen.EventDispatcher,
		LocationUtils = Canteen.LocationUtils,
		Gateway = Canteen.Gateway,
		Forms = Canteen.Forms,
		Page = Canteen.Page;
	
	/**
	*  The Canteen Site is the client wrapper for the server API. Here's an example
	*  of how to initialize on your site:
	
	$(function(){
		var site = Canteen.Site.instance;
		site.on('ready', function(){
			// Site is ready!
		});
	});

	*  @class Canteen.Site
	*  @extends Canteen.EventDispatcher
	*/
	var Site = function()
	{
		this.initialize();
	},
	
	// Reference to the prototype
	p = Site.prototype = new EventDispatcher(),
	
	/**
	*  The singleton instance of the site
	*  @property {Site} _instance
	*  @private
	*  @staticde
	*/
	_instance = null,

	/** 
	*  The last uri page request made, helps clear up traffic jams 
	*  @property {String} _lastRequest
	*  @private
	*/
	_lastRequest = null,
	
	/** 
	*  The current state count 
	*  @property {int} _currentId
	*  @private
	*/
	_currentId = null,
	
	/** 
	*  The string of the current state 
	*  @property {String} _currentState
	*  @private
	*/
	_currentState = null,

	/**
	*  If we should enable the HTML5 history
	*  @property {Boolean} _historyEnabled
	*  @private
	*/
	_historyEnabled = true,
	
	/** 
	*  An array of the pages 
	*  @property {Array} _pages
	*  @private
	*/
	_pages = [],
	
	/** 
	*  If there's a page for the current state 
	*  @property {Canteen.Page} _currentPage
	*  @private
	*/
	_currentPage = null,
	
	/**
	*  The current default options 
	*/
	_defaultOptions = {
		/** 
		*  The jQuery selector for target of the page content 
		*  @property {String} options.contentId
		*  @default "#content"
		*/
		contentId : "#content",

		/** 
		*  The jquery selector for the target of the page title 
		*  @property {String} options.pageTitleId
		*  @default "h1"
		*/
		pageTitleId : "h1",

		/** 
		*  The jQuery selector to add loading class for page loading 
		*  @property {String} options.pageLoadingId
		*  @default "article"
		*/
		pageLoadingId : "article",

		/** 
		*  The jQuery selector to add loading class for site  
		*  @property {String} options.siteLoadingId
		*  @default "body"
		*/
		siteLoadingId : "body",

		/** 
		*  The name of the class to show page or site loading 
		*  @property {String} options.loadingClass
		*  @default "loading"
		*/
		loadingClass : 'loading'
	};

	/**
	*  The current state URI
	*  @property {String} currentState
	*  @readOnly
	*/
	p.currentState = null;

	/**
	*  Get the current page object 
	*  @property {Canteen.Page} currentPage
	*  @readOnly
	*/
	p.currentPage = null;

	/**
	*  The instancee of the gateway 
	*  @property {Gateway} gateway
	*/
	p.gateway = null;
	
	/** 
	*  The collection of query string parameters 
	*  @property {Dictionary} parameters
	*/
	p.parameters = null;
	
	/**
	*  The current setup options 
	*  @property {Dictionary} options
	*/
	p.options = {};

	/**
	*  A Canteen Page has entered
	*  @event enter
	*  @param {String} uri The page URI being entered
	*/
	Site.ENTER = "enter";
	
	/**
	*  A Canteen Page has exited completed
	*  @event exit
	*  @param {String} uri The page URI being exited
	*/
	Site.EXIT = "exit";
	
	/**
	*  The entire site is ready
	*  @event ready 
	*/
	Site.READY = "ready";
	
	/**
	*  The page is starting load
	*  @event loading 
	*/
	Site.LOADING = "loading";
	
	/**
	*  The page loading is done 
	*  @event loadingDone
	*/
	Site.LOADING_DONE = "loadingDone";
	
	/**
	*  The current site version
	*  @property {String} version
	*  @readOnly 
	*/
	Site.version = VERSION;

	/**
	*  Get the singleton instance of the site
	*  @property {Site} instance
	*  @static
	*  @readOnly
	*/
	Site.instance = null;
	
	/**
	*  Constructor for the site
	*/
	p.initialize = function()
	{
		if (_instance)
		{
			throw "Site has already been created. Use Canteen.Site.instance";
		}

		Site.instance = _instance = this;

		var opts = this.options = _defaultOptions;
		
		// Disable the client
		if (Canteen.settings.clientEnabled !== undefined && !Canteen.settings.clientEnabled) return;
		
		// Show the loading on the body
		$(opts.siteLoadingId).addClass(opts.loadingClass);
		
		// Get the query string parameters
		this.parameters = LocationUtils.getParameters();
		
		// Enable the debug base on the settings
		Debug.enabled = Canteen.settings.debug;
		
		// Setup history
		_currentId = 1;
		this.currentState = _currentState = Canteen.settings.uriRequest;
		this._enableHistory(!!(global.history && history.pushState));
		
		if (_historyEnabled)
		{
			this._fixInternalLinks();
		}
		
		// Initialize the gateway
		this.gateway = new Gateway(
			Canteen.settings.gatewayPath, 
			this._gatewayReady.bind(this)
		);
	};
	
	/**
	*  Enable the history
	*  @method _enableHistory
	*  @private
	*  @param {Boolean} enable If the history state change should be on
	*/
	p._enableHistory = function(enable)
	{
		_historyEnabled = enable;
		$(global).off('statechange');
		if (enable)
			$(global).on('statechange', this._onStateChange.bind(this));
	};
	
	/**
	*  Redirect the page to a URI (about/overview)
	*  @method redirect
	*  @param {String} uri The site uri, without the base url
	*  @param {Boolean} [replaceInHistory=false] If we should replace the current page 
	*         in the history
	*  @param {Boolean} [allowRefresh=false] If we should allow page refreshes
	*         if the user redirects to the current page (default is false)
	*  @param {Boolean} [asyncRefresh=true] If the refresh should be asyncronous
	*/
	p.redirect = function(uri, replaceInHistory, allowRefresh, asyncRefresh)
	{
		var state = Canteen.settings.basePath,
			// Re-encode the title as plain text
			siteTitle = $('<div />').html($('title').html()).text();
			
		replaceInHistory = replaceInHistory === undefined ? false : replaceInHistory;
		allowRefresh = allowRefresh === undefined ? false : allowRefresh;
		asyncRefresh = asyncRefresh === undefined ? true : asyncRefresh;

		// If the uri is not the default one, add it to the base path
		if (Canteen.settings.siteIndex != uri)
		{
			state += uri;
		}
		
		// Don't go to the page if we're already there
		if (_currentState == uri)
		{
			if (allowRefresh) 
			{
				this.refresh(asyncRefresh);
			}
			else
			{
				if (DEBUG) 
				{
					Debug.log("Already on this page! (current: "+_currentState+", request: "+uri+")");
				}
			}
			return;
		}
		
		if (_historyEnabled)
		{
			// Change the history state
			if (replaceInHistory)
			{
				History.replaceState({state:_currentId}, siteTitle, state);
			}
			else
			{
				_currentId++;
				History.pushState({state:_currentId}, siteTitle, state);
			}
		}
		else
		{
			document.location.href = state;
		}
	};
	
	/**
	*  Do a refresh of the page content
	*  @method refresh
	*  @param {Boolean} [async=true] If the refresh should be asyncronous
	*  @param {mixed} [params] If async, some optional post parameters
	*/
	p.refresh = function(async, params)
	{
		async = async === undefined ? true : async;
		if (async && _historyEnabled)
			this._updatePageContent(_currentState, params);
		else
			document.location.reload(true);
	};
	
	/**
	*  Fix the page links, form element and anything that requires jQuery
	*  @method _fixInternalLinks
	*  @private
	*/
	p._fixInternalLinks = function()
	{
		$('button.confirm, a.confirm').confirmLink();
		$('a[data-internal]').internalLink(this);
		Forms.setup(this, (this.parameters.debugForms === "true"));
	};
	
	/**
	*  Handler for the history state change
	*  @method _onStateChanged
	*  @private
	*/
	p._onStateChange = function()
	{
		var state = History.getState(),	
			uri = state.url.split(Canteen.settings.baseUrl)[1];
		
		// Don't go to the page if we're already there
		if (_currentState == uri) 
		{
			if (DEBUG) 
			{
				Debug.log("Already on this page! ("+uri+")");
			}
			return;
		}
		this._updatePageContent(uri);
	};
	
	/**
	*  Callback when a gateway is finished setting up
	*  @method _gatewayReady
	*  @private
	*  @param {Boolean} succes If gateway initialization was successfully
	*/
	p._gatewayReady = function(success)
	{
		if (!success) 
		{
			Debug.error("Unable to setup gateway.");
		}
		else
		{
			if (DEBUG) 
			{
				Debug.log("Canteen is ready!");
			}
		}
		var options = this.options;
		$(options.siteLoadingId).removeClass(options.loadingClass);
		
		$(window).on('resize', this.resize.bind(this));
		this.resize();
		
		this.trigger(Site.READY);
		this._enterPage();
	};	
	
	/**
	*  Called whenever the window resizes, pass along to page
	*  @method resize
	*/
	p.resize = function()
	{
		if (_currentPage && _currentPage.active)
		{
			_currentPage.resize();
		}
	};
	
	/**
	*  Bind a uri to a page class
	*  @method addPage
	*  @param {String|RegExp} uriOrRegExp The page uri or regular expression of uri
	*  @param {Canteen.Page} pageInstance The Page object to use for uri
	*/
	p.addPage = function(uriOrRegExp, pageInstance)
	{
		if (pageInstance instanceof Page)
		{
			pageInstance.site = this;
			_pages.push({
				uri : uriOrRegExp,
				content : pageInstance
			});
		}
		else
		{
			Debug.warn("The page your trying to add needs to extend Canteen.Page");
		}
	};
	
	/**
	*  Get the page for the current state
	*  @method _enterPage
	*  @private
	*/
	p._enterPage = function()
	{		
		var page = this.getPageByUri(_currentState);
		if (page)
		{
			this.currentPage = _currentPage = page.content;
			_currentPage.uri = _currentState;
			_currentPage.active = true;
			_currentPage.enter();
			this.resize();
		}
		this.trigger(Site.ENTER, _currentState);
	};
	
	/**
	*  Get a specific page by a uri
	*  @method getPageByUri
	*  @param {String} uri The uri to fetch page for
	*  @return {Canteen.Page} The page object or null, if no page is found
	*/
	p.getPageByUri = function(uri)
	{
		var len = _pages.length, 
			i = 0, 
			pg = null;
		
		// Check for no pages
		if (len === 0) return null;
		
		for(i = 0; i < len; i++)
		{
			pg = _pages[i];
			// The URI can either be a string or a regular expression
			// check for both
			if ((pg.uri === uri) || 
				(pg.uri instanceof RegExp && pg.uri.test(uri)))
			{
				return pg;
			}
		}
		return null;
	};
	
	/**
	*  Update the page content
	*  @method _updatePageContent
	*  @private
	*  @param {String} uri The uri to request page for
	*  @param {Dictionary} [params] Post parameters to pass to the page
	*/
	p._updatePageContent = function(uri, params)
	{
		var site = this,
			options = this.options,
			page = this.getPageByUri(uri),
			url = Canteen.settings.baseUrl + uri;
		
		// Exit the old page
		this.trigger(Site.EXIT, _currentState);
		
		// Update the current uri
		this.currentState = _currentState = uri;
		
		// Special-case if we're already on the current page
		// but only the content needs to update
		// then don't make the loading request
		if (page && page.content === _currentPage && !page.content.refresh(uri))
		{
			page.content.uri = uri;
			return;
		}
		// If we're on a current page, let's exit before loading
		else if (_currentPage)
		{
			_currentPage.exit();
			_currentPage.active = false;
			this.currentPage = _currentPage = null;
		}
		
		// Form cleanup
		Forms.destroy();
		
		// Remember the last requestd page
		// to ignore delayed load requests
		_lastRequest = uri;		
		
		// Let termite know this is an asyncronous request
		params = params === undefined ? {} : params;
		params.async = true;
		
		// DOM event that we're laoding
		this.trigger(Site.LOADING);
		
		$(options.pageLoadingId)
			.removeClass(options.loadingClass)
			.addClass(options.loadingClass);
			
		if (DEBUG) 
		{
			Debug.log("Update Page Content : " + uri);
		}
		$.post(url, params, function(response)
		{
			if (uri != _lastRequest) return;
			_lastRequest = null;
			
			site.trigger(Site.LOADING_DONE);
			$(options.pageLoadingId).removeClass(options.loadingClass);
			
			// Check for data
			if (!response || response == 'null')
			{ 
				Debug.error('No data for ' + uri); 
				return; 
			}
			// Make sure the output isn't an error
			if (response.search(/^{.*}$/) == -1)
			{
				Debug.error(response);
				return;
			}
			var data =  JSON.parse(response);
			
			if (data.type == 'fatalError')
			{
				Debug.fatalError(data);
				return;
			}
			
			// Handle the internal redirect			
			if (data.redirect !== undefined)
			{
				site.redirect(data.redirect, true);
				return;
			}
			$('body').attr('id', data.pageId);
			$(options.pageTitleId).html(data.title);
			$(options.contentId).html(data.content);
			document.title = $('<div />').html(data.fullTitle).text();
			$("meta[name='keywords']").attr('content', data.keywords);
			$("meta[name='description']").attr('content', data.description);
			site._fixInternalLinks();
			site._enterPage();
		});
	};

	// Assign to the global space
	namespace('Canteen').Site = Site;

	// Initialize the sitle singleton
	$(function(){ new Site(); });
	
}(window, jQuery));