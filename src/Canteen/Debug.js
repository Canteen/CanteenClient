(function(){

	/**
	*  Extend the existing Debug plugin by having a special method to format stack traces
	*  @class Debug
	*/

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

}());