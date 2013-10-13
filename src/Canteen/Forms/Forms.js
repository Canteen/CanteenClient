
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
			$("input[type='"+types[i]+"']")
				.removeClass(types[i])
				.addClass(types[i])
				.hover(onRollOver, onRollOut)
				.keydown(onKeyDown);
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
					if (DEBUG) 
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
					if (DEBUG) 
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
						formElements.enabled();
					}
				}, function(response){
					if (response.redirect)
					{
						site.redirect(response.redirect, false, true);
						return;
					}
					if (DEBUG) 
					{
						Debug.error(response.messages.join("\n"));
					}
					Forms.formFeedback(form, response.messages, true);
					form.trigger({
						type: Forms.FEEDBACK_ERROR,
						params: params,
						feedback: response.messages
					});
					formElements.enabled();
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
		if (DEBUG) 
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
					Debug.fatalError(response.errors);
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
		enabled = enabled === undefined ? true : enabled;
		return this.each(function() {         
			$(this).prop('disabled', !enabled)
				.removeClass(Forms.DISABLED);
			if (!enabled) 
				$(this).addClass(Forms.DISABLED);
		});
	};
	
	namespace('Canteen').Forms = Forms;
	
}());