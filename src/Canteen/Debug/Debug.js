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
		result = error.message + "\non " + error.file + " (code: " + error.code + ")\n";
		if (error.stackTrace)
		{
			for(var j=0; j < error.stackTrace.length; j++)
			{
				result += "\t #" + (j+1) + ". " + error.stackTrace[j];
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