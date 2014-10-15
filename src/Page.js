/**
* @module Canteen 
*/
(function(){
	
	"use strict";
	
	/**
	*  The page object is extend by an page controllers
	*  @class Canteen.Page
	*/
	var Page = function(){},
	
	// Save an internal reference to the prototype
	p = Page.prototype;
	
	/** 
	*  The reference to the site 
	*  @property {Canteen.Site} site
	*/
	p.site = null;

	/** 
	*  If the page is currently active
	*  @property {Canteen.Site} active
	*  @readOnly
	*/
	p.active = false;
	
	/** 
	*  The current page stub 
	*  @property {String} uri
	*/
	p.uri = null;
	
	/**
	*  Called by the site. This enters the page.
	*  Any initialization should happen here
	*  @method enter
	*/
	p.enter = function()
	{
		// Implementation specific
	};
	
	/**
	*  Called by the site, exits this page
	*  any memory cleanup/unbind should happen here
	*  @method exit
	*/
	p.exit = function()
	{
		// Implementation specific
	};
	
	/**
	*  Called when the location has been updated, but not the page
	*  for instance, if a dynamic page changes.
	*  @method refresh
	*  @return {Boolean} If there should be a hard site refresh
	*/
	p.refresh = function()
	{
		// Implementation specific
		return true;
	};
	
	/**
	*  Resize function called by the site 
	*  @method resize
	*/
	p.resize = function()
	{
		// Implementation specific
	};
	
	// Attach to the namespace
	namespace('Canteen').Page = Page;
}());