/**
*  @module global 
*/
(function(){
	
	"use strict";
	
	// If there's already a bind, ignore
	if (Function.prototype.bind) return;
	
	/**
	*  Designed to provide utility related to functions, the
	*  most important of which is the Bind function, used to properly scope callbacks.
	*  Add the bind functionality to the Function prototype
	*  this allows passing a reference in the function callback
	*  
	*	callback.bind(this)
	*	callback.bind(this, arg1)
	*  
	*  @class Function.prototype.bind
	*  @constructor
	*  @param {Object} that The reference to the function.
	*  @param {mixed} [args*] Additional arguments
	*  @return {Function} The new function binding.
	*/
	Function.prototype.bind = function(that) 
	{
		var target = this, 
			args,
			bound;

		if (typeof target != "function") 
		{
			throw new TypeError();
		}

		args = Array.prototype.slice.call(arguments, 1);
		bound = function()
		{
			if (this instanceof bound) 
			{
				var F, self, result;
				F = function(){};
				F.prototype = target.prototype;
				self = new F();

				result = target.apply(self, args.concat(Array.prototype.slice.call(arguments)));
				
				if (Object(result) === result)
				{
					return result;
				}
				return self;
			}
			else 
			{
				return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
			}
		};
		return bound;
	};
	
}());
/**
*  @module global 
*/
(function(global){
	
	"use strict";
	
	/**
	*  Create the namespace and assing to the window.
	* 
	*	namespace('cloudkid.utils').SpriteUtils = function(){};
	*  
	*  @class namespace
	*  @constructor
	*  @param {String} namespaceString Name space, for instance 'cloudkid.utils'
	*  @return {Object} Return the namespace
	*/
	var namespace = function(namespaceString) {
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '',
			i = 0,
			length = 0;

		for(i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	};
	
	// Assign to the global namespace
	global.namespace = namespace;
	
}(window));

/**
*  @module Canteen 
*/
(function(global, undefined){
	
	"use strict";
	
	/**
	*  The EventDispatcher mirrors the functionality of AS3 and CreateJS's EventDispatcher, 
	*  but is more robust in terms of inputs for the `on()` and `off()` methods.
	*  
	*  @class Canteen.EventDispatcher
	*/
	var EventDispatcher = function(){},
	
	// Reference to the prototype 
	p = EventDispatcher.prototype;
	
	/**
	* The collection of listeners
	* @property {Array} _listeners
	* @private
	*/
	p._listeners = [];
	
	/**
	*  Dispatch an event
	*  @method trigger
	*  @param {String} type The event string name, 
	*  @param {*} params Additional parameters
	*/
	p.trigger = function(type, params)
	{
		if (this._listeners[type] !== undefined) 
		{	
			var listeners = this._listeners[type];
			
			for(var i = 0; i < listeners.length; i++) 
			{
				listeners[i](params);
			}
		}
	};
	
	/**
	*  Add an event listener
	*  
	*  @method on
	*  @param {String|object} name The type of event (can be multiple events separated by spaces), 
	*          or a map of events to handlers
	*  @param {Function|Array*} callback The callback function when event is fired or an array of callbacks.
	*  @return {cloudkid.EventDispatcher} Return this EventDispatcher
	*/
	p.on = function(name, callback)
	{
		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key]);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				if (this._callbackIndex(n, callback) === -1)
				{
					this._listeners[n].push(callback);
				}
			}
		}
		// Callbacks array
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f]);
			}
		}
		return this;
	};
	
	/**
	*  Remove the event listener
	*  
	*  @method off
	*  @param {String*} name The type of event string separated by spaces, if no name is specifed remove all listeners.
	*  @param {function|Array*} callback The listener function or collection of callback functions
	*/
	p.off = function(name, callback)
	{	
		// remove all 
		if (name === undefined)
		{
			this._listeners = [];
		}
		// remove multiple callbacks
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++) 
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				// remove all by time
				if (callback === undefined)
				{
					this._listeners[n].length = 0;
				}
				else
				{
					var index = this._callbackIndex(n, callback);
					if (index !== -1)
					{
						this._listeners[name].splice(index, 1);
					}
				}
			}
		}
		return this;
	};
	
	/**
	* Return type of the value.
	*
	* @private
	* @method type
	* @param  {*} value
	* @return {String} The type
	*/
	function type(value)
	{
		if (value === null)
		{
			return String(value);
		}
		if (typeof value === 'object' || typeof value === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeof value;
	}
	
	/**
	 * Returns callback array index.
	 *
	 * @method _callbackIndex
	 * @private
	 * @param  {String}   name Event name.
	 * @param  {Function} callback   Function
	 * @return {Int} Callback array index, or -1 if isn't registered.
	 */
	p._callbackIndex = function(name, callback)
	{		
		for (var i = 0, l = this._listeners[name].length; i < l; i++)
		{
			if (this._listeners[name][i] === callback)
			{
				return i;
			}
		}
		return -1;
	};
	
	// Assign to the global spacing
	namespace('Canteen').EventDispatcher = EventDispatcher;
	
}(window));
/**
*  @module global 
*/
(function(global, undefined){
	
	"use strict";
	
	/**
	*  A static closure to provide easy access to the console
	*  without having errors if the console doesn't exist
	*  to use call:
	*  
	*	Debug.log('Your log here')
	*  
	*  @class Debug
	*/
	var Debug = function(){},
	
	/**
	*  If we have a console
	*  @private
	*  @static
	*  @property {Boolean} _hasConsole
	*/
	_hasConsole = (global.console !== undefined);
	
	/**
	*  The most general, default log level
	*  @property {int} GENERAL
	*  @static
	*  @final
	*  @default 0
	*/
	Debug.GENERAL = 0;
	
	/**
	*  The log level for debug statements
	*  @property {int} DEBUG
	*  @static
	*  @final
	*  @default 1
	*/
	Debug.DEBUG = 1;
	
	/**
	*  The log level for info statements
	*  @property {int} INFO
	*  @static
	*  @final
	*  @default 2
	*/
	Debug.INFO = 2;
	
	/**
	*  The log level for warn statements
	*  @property {int} WARN
	*  @static
	*  @final
	*  @default 3
	*/
	Debug.WARN = 3;
	
	/**
	*  The log level for error statements
	*  @property {int} ERROR
	*  @static
	*  @final
	*  @default 4
	*/
	Debug.ERROR = 4;
	
	/**
	*  The minimum log level to show, by default it's set to
	*  show all levels of logging. 
	*  @static
	*  @property {int} minLogLevel
	*  @default Debug.GENERAL
	*/
	Debug.minLogLevel = Debug.GENERAL;
	
	/** 
	*  Boolean to turn on or off the debugging
	*  @static
	*  @property {Boolean} enabled
	*  @default true
	*/
	Debug.enabled = true;
	
	/**
	*  The output jQuery element
	*  @static
	*  @property {jQuery} output
	*/
	Debug.output = null;
	
	/**
	*  Sent to the output on the page
	*  @private
	*  @static
	*  @method output
	*  @param {String} level The output level name
	*  @param {mixed} args The arguments to output
	*/
	function output(level, args)
	{
		if (Debug.output) 
		{
			Debug.output.append("<div class=\""+level+"\">" + args + "</div>");
		}
	}
	
	/**
	*  Log something in the console
	*  @method log
	*  @static
	*  @param {mixed} params The statement or objects to log
	*/
	Debug.log = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled) 
		{
			console.log(params);
			output("general", params);
		}	
	};
	
	/**
	*  Debug something in the console
	*  @static
	*  @method debug
	*  @param {mixed} params The statement or objects to debug
	*/
	Debug.debug = function(params)
	{
		if (Debug.minLogLevel <= Debug.DEBUG && _hasConsole && Debug.enabled) 
		{
			console.debug(params);
			output("debug", params);
		}
	};
	
	/**
	*  Info something in the console
	*  @static
	*  @method info
	*  @param {mixed} params The statement or objects to info
	*/
	Debug.info = function(params)
	{
		if (Debug.minLogLevel <= Debug.INFO && _hasConsole && Debug.enabled) 
		{
			console.info(params);
			output("info", params);
		}	
	};
	
	/**
	*  Warn something in the console
	*  @static
	*  @method warn
	*  @param {mixed} params The statement or objects to warn
	*/
	Debug.warn = function(params)
	{
		if (Debug.minLogLevel <= Debug.WARN && _hasConsole && Debug.enabled) 
		{
			console.warn(params);
			output("warn", params);
		}	
	};
	
	/**
	*  Error something in the console
	*  @static
	*  @method error
	*  @param {mixed} params The statement or objects to error
	*/
	Debug.error = function(params)
	{
		if (_hasConsole && Debug.enabled) 
		{
			console.error(params);
			output("error", params);
		}	
	};
	
	/**
	*  Prepare the fatal error and show the stack trace
	*  @static
	*  @method fatalError
	*  @param {Object} error The fatal error from the server
	*/
	Debug.fatalError = function(error)
	{		
		var result = error.message + "\non " + error.file + " (code: " + error.code + ")\n";
		if (error.stackTrace)
		{
			for(var j=0; j < error.stackTrace.length; j++)
			{
				result += "\n\t #" + (j+1) + ". " + error.stackTrace[j];
			}
		}
		Debug.error(result);
	};
	
	/**
	*  Assert that something is true
	*  @static
	*  @method assert
	*  @param {Boolean} truth As statement that is assumed true
	*  @param {mixed} params The addition parameters
	*/
	Debug.assert = function(truth, params)
	{
		if (_hasConsole && Debug.enabled && console.assert !== undefined) 
		{
			console.assert(truth, params);
			if (!truth) 
			{
				output("error", params);
			}
		}	
	};
	
	
	/**
	*  Method to describe an object in the console
	*  @static
	*  @method dir
	*  @param {mixed} params The object to describe
	*/
	Debug.dir = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled) 
		{
			console.dir(params);
		}	
	};
	
	/**
	*  Method to clear the console
	*  @static
	*  @method clear
	*  @param {mixed} [params] Optional parameters
	*/
	Debug.clear = function(params)
	{
		if (_hasConsole && Debug.enabled) 
		{
			console.clear(params);
			if (Debug.output) Debug.output.html("");
		}	
	};
	
	/**
	*  Generate a stack track in the output
	*  @static
	*  @method trace
	*  @param {mixed} [params] Optional parameters
	*/
	Debug.trace = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled) 
		{
			console.trace(params);
		}	
	};
	
	// Make the debug class globally accessible
	// If the console doesn't exist, use the dummy to prevent errors
	global.Debug = Debug;
	
}(window));
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
			if (uri == state || state.indexOf(uri) === 0 || (uri == index && state === ''))
				link.addClass('selected');
		});
	};
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
			if (true) 
			{
				Debug.log(myVar[0] + " -> " + myVar[1]);
			}
			output[myVar[0]] = myVar[1];
		}
		return output;
	};
	
	namespace('Canteen').LocationUtils = LocationUtils;
	
}());

/**
* @module Canteen 
*/
(function(undefined){
	
	"use strict";
	
	/**
	*  Override all the basic form submission to process
	*  forms using Ajax and stateless behavior.
	*  @class Canteen.Forms
	*  @author Matt Karl <matt@cloudkid.com>
	*/
	var Forms = function(){};
	
	/** 
	*  The constant for the error class 
	*  @property {String} ERROR
	*  @final
	*  @static
	*  @default error
	*/
	Forms.ERROR = "error";
	
	/** 
	*  The constant For the disabled class 
	*  @property {String} DISABLED
	*  @final
	*  @static
	*  @default disabled
	*/
	Forms.DISABLED = "disabled";
	
	/** 
	*  The constant for the selected class 
	*  @property {String} SELECTED
	*  @final
	*  @static
	*  @default selected
	*/
	Forms.SELECTED = "selected";
	
	/** 
	*  The constant for the over class 
	*  @property {String} OVER
	*  @final
	*  @static
	*  @default over
	*/
	Forms.OVER = "over";
	
	/** 
	*  The constant for the required class 
	*  @property {String} REQUIRED
	*  @final
	*  @static
	*  @default required
	*/
	Forms.REQUIRED = "required";
	
	/** 
	*  Form feedback when errored 
	*  @property {String} FEEDBACK_ERROR
	*  @final
	*  @static
	*  @default formError
	*/
	Forms.FEEDBACK_ERROR = 'formError';
	
	/** 
	*  Form feedback when successful 
	*  @property {String} FEEDBACK_SUCCESS
	*  @final
	*  @static
	*  @default formSuccess
	*/
	Forms.FEEDBACK_SUCCESS = 'formSuccess';
	
	/**
	*  Setup form with helper javascript
	*  @method setup
	*  @static
	*  @param {Canteen.Site} site The instance of the site
	*/
	Forms.setup = function(site)
	{
		// Check for form elements with input and attach class
		var types = new Array(
			'text','button','reset','submit','checkbox','image',
			'radio','file','password','date'), 
			i, 
			len=types.length;
		
		var onRollOut =	function()
		{
			if (!$(this).attr("disabled"))
			{
				$(this).addClass(Canteen.OVER);
			}
		},
		
		onRollOver = function()
		{
			$(this).removeClass(Canteen.OVER);
		},
		
		onKeyDown = function(e){
			var form = $(this).closest('form'),
				firstButton = form.find(':submit, :button').eq(0);
			if (e.keyCode == 13 && form.length > 0){
				e.preventDefault();
				if (firstButton)
					form.data('clicked', firstButton);
				form.submit();
			}
		};
		
		for(i=0; i < len; i++)
		{
			var elements = $("input[type='"+types[i]+"']")
				.removeClass(types[i])
				.addClass(types[i])
				.hover(onRollOver, onRollOut)
				.keydown(onKeyDown);
			
			// Save the original disabled state
			// of the element
			if (elements.prop('disabled')) 
			{
				elements.data('disabled', true);
			}
		}
		
		// Add required field for form processing
		$("form").each(function(){
			var form = $(this);
			
			// Setup submission buttons
			form.find(':submit, :button').touch(function(){
				var button = $(this);
				
				// Save which button we clicked on
				form.data('clicked', button);
				
				if (button.hasClass('confirm'))
				{
					var title = button.data('confirm') || "Are you sure you wish to continue?",
						result = confirm(title);
					if (!result) return;
				}
				// Submit the form
				form.submit();
			});
			
			// Create the submit handling
			form.submit(function(e){
				var form = $(this),
					required = form.find("."+Forms.REQUIRED),
					errors;

				required.removeClass(Forms.ERROR);
				
				// Add filter to required element without data
				errors = required.filter(function(){
					return !this.value;
				}).addClass(Forms.ERROR);

				// If there are errors
				if (errors.length > 0)
				{
					errors.untouch().touch(function(){
						$(this).removeClass(Forms.ERROR);
					});
				}
				else
				{
					if (true) 
					{
						if (site.parameters.debugForms === "true")
						{
							return;
						}
					}
					// Handle the form submission
					Forms.handleSubmit(site, form);
				}
				// Ignore the submission
				e.preventDefault();
			});
		});
	};
	
	/**
	*  Handler when a form is submitted
	*  @method handleSubmit
	*  @static
	*  @param {Canteen.Site} site The instance of the current site
	*  @param {jQuery} form The jQuery node for the form
	*/
	Forms.handleSubmit = function(site, form)
	{
		var name, 
			el, 
			params = {},
			formElements = form.find('input,textarea,select');
		
		// Add the button clicked on
		if (form.data('clicked'))
		{
			el = form.data('clicked');
			params[el.attr('name')] = el.val();
		}
		
		// Capture all of the values
		formElements.each(function(){
			el = $(this);
			name = el.attr("name");
			
			// Ignore non-named inputs and the form session
			if (name === undefined || name == 'formSession') return;
			
			// Do a check for checkboxes
			if (el.is(":checkbox"))
			{
				if (el.is(":checked"))
				{
					// If it's an array of checkboxes
					if (name.substr(-2) == "[]")
					{
						name = name.replace("[]", "");
						if (params[name] === undefined)
						{
							params[name] = [el.val()];
						}
						else
						{
							params[name].push(el.val());
						}
					}
					else
					{
						params[name] = el.val();
					}
				}				
			}
			else if (el.is(":submit") || el.is(":button"))
			{
				// ignore
			}
			// Radio buttons, only grab the selected on
			else if (el.is(":radio"))
			{
				if (el.is(":checked"))
				{
					params[name] = el.val();
				}
			}
			// All other elements
			else
			{
				params[name] = el.val();
			}
		}).enabled(false);
		
		// If there is not form to post to specified,
		// then we'll pass the variables directly to an
		// async refresh
		if (params.form === undefined)
		{
			site.refresh(true, params);
		}
		else
		{
			Forms.async(
				params, 
				function(response){
					if (response.redirect)
					{
						site.redirect(response.redirect, false, true);
						return;
					}
					if (true) 
					{
						Debug.log(response.messages.join("\n"));
					}
					// Custom param can redirect upon success
					if (params.refresh == 'true') {
						site.refresh();
					} else {
						Forms.formFeedback(form, response.messages, false);
						form.trigger({
							type: Forms.FEEDBACK_SUCCESS,
							params: params,
							feedback: response.messages
						});
						formElements.enabled(true);
					}
				}, function(response){
					if (response.redirect)
					{
						site.redirect(response.redirect, false, true);
						return;
					}
					if (true) 
					{
						Debug.error(response.messages.join("\n"));
					}
					Forms.formFeedback(form, response.messages, true);
					form.trigger({
						type: Forms.FEEDBACK_ERROR,
						params: params,
						feedback: response.messages
					});
					formElements.enabled(true);
				}
			);
		}
	};
	
	/**
	*  Show the form feedback
	*  @method formFeedback
	*  @static
	*  @param {jQuery} form The form to display feedback form
	*  @param {Array} feedback The feedback list of string messages
	*  @param {Boolean} error If the feedback is error
	*/
	Forms.formFeedback = function(form, feedback, error)
	{
		// Remove any existing feedback
		$("ul."+Forms.FEEDBACK_ERROR+", ul."+Forms.FEEDBACK_SUCCESS).remove();
		
		var i = 0, 
			len = feedback.length, 
			ul = $('<ul></ul>'), 
			li,
			legend;
			
		ul.addClass(error ? Forms.FEEDBACK_ERROR : Forms.FEEDBACK_SUCCESS);
		for(i = 0; i < len; i++)
		{
			li = $('<li></li>').text(feedback[i]);
			ul.append(li);
		}
		
		legend = form.find('legend');
		
		if (legend.length)
		{
			legend.after(ul);
		}
		else
		{
			form.prepend(ul);
		}
	};

	/**
	*  Make an ajax form request to Canteen
	*  @method async
	*  @static
	*  @param {Dictionary} params The object of parameters to pass
	*  @param {Function} [successCallback] The optional function to callback if successful
	*  @param {Function} [errorCallback] The optional function to callback if errored
	*/
	Forms.async = function(params, successCallback, errorCallback){
		params.async = 'true';
		if (true) 
		{
			Debug.log(params);
		}
		$.post(
			window.location.href, 
			params,
			function(response)
			{
				if (response.search(/^{.*}$/) == -1)
				{
					Debug.error(response);
					return;
				}
				response = JSON.parse(response);
				if (response.type == 'fatalError')
				{
					Debug.fatalError(response);
					return;
				}
				if (response.ifError)
				{
					if (errorCallback !== undefined)
					{
						errorCallback(response);
					}
				} 
				else 
				{
					if (successCallback !== undefined)
					{
						successCallback(response);
					} 
				}
			}
		);
	};
	
	// Disable the selection
	$.fn.enabled = function(enabled) {
		return this.each(function() {
			var el = $(this),
				orig = el.data('disabled');
			
			el.prop('disabled', !enabled);
			
			if (!enabled)
				el.addClass(Forms.DISABLED);
			else if (!orig)
				el.removeClass(Forms.DISABLED);
		});
	};
	
	namespace('Canteen').Forms = Forms;
	
}());
/**
* @module Canteen 
*/
(function(undefined){
	
	"use strict";
	
	/**
	*  The Gateway object is responsible for connecting
	*  to the json gateway for site data
	*  @class Canteen.Gateway
	*  @constructor
	*  @param {String} gatewayUrl The url to the gateway
	*  @param {function} callback The callback function when server is read
	*  @author Matt Karl <matt@cloudkid.com>
	*/
	var Gateway = function(gatewayUrl, callback)
	{
		this.initialize(gatewayUrl, callback);
	},
	
	// Save a reference to the prototype
	p = Gateway.prototype;
	
	/**
	*  The url of the gateway service 
	*  @property {String} gatewayUrl
	*/
	p.gatewayUrl = null;
	
	/**
	*  Estable a connection to the gatewayUrl
	*  @method initialize
	*  @param {String} gatewayUrl The url to the gateway
	*  @param {function} callback The callback function when server is read
	*/
	p.initialize = function(gatewayUrl, callback)
	{
		this.gatewayUrl = gatewayUrl;
		
		if (gatewayUrl.charAt(gatewayUrl.length -1) != '/')
		{
			this.gatewayUrl += '/';
		}
		
		this.get(function(data){
			var ifError = (data === null || data.type == 'error');
			if (ifError)
			{
				throw "Couldn't connect to gateway";
			}
			callback(!ifError);
		}, 'time', 'get-server-time');
	};
	
	/**
	*  Main call for the service
	*  @method get
	*  @param {function} callback The callback when we're done
	*  @param {String} service The service to call from
	*  @param {String} method The service method name
	*  @param {mixed} [parameters] Optional, additional parameters to pass to service call
	*/
	p.get = function(callback, service, method, parameters)
	{
		var url = this.gatewayUrl + service + "/" + method;
		if (parameters !== undefined)
		{
			url += "/"+($.isArray(parameters) ? parameters.join('/') : String(parameters));
		}
		if (true) 
		{
			Debug.log(url);
		}
		$.get(url, function(response){
			if (!response || response == 'null')
			{
				callback(null);
				return;
			}
			if (response.search(/^{.*}$/) == -1)
			{
				Debug.error(response);
				callback(null);
				return;
			}
			var data = JSON.parse(response);
			if (data.type == 'fatalError')
			{
				Debug.fatalError(data);
				callback(null);
				return;
			}
			callback(data);		
		});
	};
	
	/**
	*  Destroy the Gateway and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		p = null;
	};
	
	// Assign to the window for global access
	namespace('Canteen').Gateway = Gateway;
	
}());
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
/**
* @module Canteen 
*/
(function(global, undefined){
	
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
		var site = new Canteen.Site({
			contentId : "#content",
			pageTitleId : "#pageTitle"
		});
		site.on('ready', function(){
			// Site is ready!
		});
	});

	*  @class Canteen.Site
	*  @extends Canteen.EventDispatcher
	*  @constructor
	*  @param {Dictionary} [options] The customization options
	*  @param {String} [options.contentId] The jQuery selector for target of the page content 
	*  @param {String} [options.pageTitleId] The jquery selector for the target of the page title 
	*  @param {String} [options.pageLoadingId] The jQuery selector to add loading class for page loading 
	*  @param {String} [options.siteLoadingId] The jQuery selector to add loading class for site 
	*  @param {String} [options.loadingClass] The name of the class to show page or site loading 
	*/
	var Site = function(options)
	{
		this.initialize(options);
	},
	
	// Reference to the prototype
	p = Site.prototype = new EventDispatcher(),
	
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
		*  @default #content
		*/
		contentId : "#content",

		/** 
		*  The jquery selector for the target of the page title 
		*  @property {String} options.pageTitleId
		*  @default h1
		*/
		pageTitleId : "h1",

		/** 
		*  The jQuery selector to add loading class for page loading 
		*  @property {String} options.pageLoadingId
		*  @default article
		*/
		pageLoadingId : "article",

		/** 
		*  The jQuery selector to add loading class for site  
		*  @property {String} options.siteLoadingId
		*  @default body
		*/
		siteLoadingId : "body",

		/** 
		*  The name of the class to show page or site loading 
		*  @property {String} options.loadingClass
		*  @default loading
		*/
		loadingClass : 'loading'
	};
	
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
	*  @property {String} VERSION
	*  @readOnly 
	*/
	Site.VERSION = "1.0.0";
	
	/**
	*  Constructor for the site
	*/
	p.initialize = function(options)
	{
		var opts = $.extend(this.options, _defaultOptions, options);
		
		// Show the loading on the body
		$(opts.siteLoadingId).addClass(opts.loadingClass);
		
		// Setup history
		_currentId = 1;
		_currentState = Canteen.settings.uriRequest;
		this._enableHistory(true);
		this._fixInternalLinks();
		
		// Enable the debug base on the settings
		Debug.enabled = Canteen.settings.debug;
		
		// Get the query string parameters
		this.parameters = LocationUtils.getParameters();
		
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
	*/
	p.redirect = function(uri, replaceInHistory, allowRefresh)
	{
		var state = Canteen.settings.basePath,
			siteTitle = $('title').html();
			
		replaceInHistory = replaceInHistory === undefined ? false : replaceInHistory;
		allowRefresh = allowRefresh === undefined ? false : allowRefresh;
			
		// If the uri is not the default one, add it to the base path
		if (Canteen.settings.siteIndex != uri)
		{
			state += uri;
		}
		
		// Don't go to the page if we're already there
		if (_currentState == uri)
		{
			if (true) 
			{
				Debug.log("Already on this page! (current: "+_currentState+", request: "+uri+")");
			}
			if (allowRefresh) this.refresh();
			return;
		}
		
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
	};
	
	/**
	*  The current state URI
	*  @property {String} currentState
	*  @readOnly
	*/
	Object.defineProperty(p, "currentState", {
		get: function()
		{
			return _currentState;
		}
	});
	
	/**
	*  Get the current page object 
	*  @property {Canteen.Page} currentPage
	*  @readOnly
	*/
	Object.defineProperty(p, "currentPage", {
		get: function()
		{
			return _currentPage;
		}
	});
	
	/**
	*  Do a refresh of the page content
	*  @method refresh
	*  @param {Boolean} [async=true] If the refresh should be asyncronous
	*  @param {mixed} [params] If async, some optional post parameters
	*/
	p.refresh = function(async, params)
	{
		async = async === undefined ? true : async;
		if (async)
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
		$('a').internalLink(this);
		Forms.setup(this);
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
			if (true) 
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
			if (true) 
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
		if (_currentPage)
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
			_currentPage = page.content;
			_currentPage.uri = _currentState;
			_currentPage.enter();
			_currentPage.resize();
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
		_currentState = uri;
		
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
			_currentPage = null;
		}
		
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
			
		if (true) 
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
			if (response == 'null')
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
			document.title = data.fullTitle;
			$("meta[name='keywords']").attr('content', data.keywords);
			$("meta[name='description']").attr('content', data.description);
			site._fixInternalLinks();
			site._enterPage();
		});
	};
	
	// Assign to the global space
	namespace('Canteen').Site = Site;
	
}(window));
