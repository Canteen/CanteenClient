/**
* @module Canteen 
*/
(function(){
	
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
	*  The constant for the required class 
	*  @property {String} REQUIRED
	*  @final
	*  @static
	*  @default required
	*/
	Forms.REQUIRED = "required";
	
	/** 
	*  The constant class name to add a confirmation dialog to a button
	*  @property {String} CONFIRM
	*  @final
	*  @static
	*  @default confirm
	*/
	Forms.CONFIRM = "confirm";
	
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
	*  Clean up any form elements
	*  @method destroy
	*  @static
	*/
	Forms.destroy = function()
	{
		$("input."+Forms.CONFIRM+", button."+Forms.CONFIRM).untouch();
		$('form').resetForm().off('submit');
		$(':submit').untouch();
	};
	
	/**
	*  Setup form with helper javascript
	*  @method setup
	*  @static
	*  @param {Canteen.Site} site The instance of the site
	*  @param {Boolean} debugForms If we should use ajax for forms
	*/
	Forms.setup = function(site, debugForms)
	{
		// Check for form elements with input and attach class
		var types = new Array(
			'text',
			'button',
			'reset',
			'submit',
			'checkbox',
			'image',
			'radio',
			'file',
			'password',
			'date'
		);
		
		// When enter is press inside any item
		// we should trigger a form submission
		var onEnterKey = function(e){
			var f = $(e.target).closest('form'),
				submit = f.find(':submit').eq(0);
				
			// On enter key and there's a form and a button
			if (e.keyCode == 13 && submit)
			{
				e.stopImmediatePropagation();
				e.preventDefault();
				submit.trigger('touchclick');
			}
		};
		
		// Loop through all the form times and assign default classes
		for(var i=0, len=types.length; i < len; i++)
		{
			$("input[type='"+types[i]+"']")
				.removeClass(types[i])
				.addClass(types[i])
				.keyup(onEnterKey);
		}
		
		// Button that require confirmation
		// like for deleting something
		$("input."+Forms.CONFIRM+", button."+Forms.CONFIRM).untouch().touch(function(e){
			// Get the confirmation alert from the data-confirm attribute
			// or use the default
			var title = $(this).data(Forms.CONFIRM) || "Are you sure you wish to continue?",
				result = confirm(title);
				
			// If the confirm was false, return
			if (!result) 
			{
				e.stopImmediatePropagation();
				return false;
			}
		});
		
		// If a querystring of debugForms=true, then 
		// we won't do any ajax form submission, it will
		// all the default refresh submission
		if (DEBUG) 
		{
			if (debugForms) return;
		}
		
		// Remove formSession hidden inputs, this isn't needed
		// if we're going to be submitting ajax requests
		// the formSession is used to block multiple browser
		// requests while refreshing
		$('input[name="formSession"]').remove();
		
		// When the form is submitted check that 
		// required fields aren't empty
		var showRequest = function(formData, form)
		{		
			// Get all required items in the form
			var required = form.find("."+Forms.REQUIRED)
				.removeClass(Forms.ERROR);

			// Add filter to required element without data
			var errors = required.filter(function(){
				return !this.value;
			}).addClass(Forms.ERROR);

			// If there are errors
			if (errors.length > 0)
			{
				var removeError = function(){
					$(this).removeClass(Forms.ERROR).off('keydown');
				};
				errors.untouch().on('touchclick focus keydown', removeError);
				
				return false;
			}
			
			// The collection of parameters
			var params = {};
			
			// Check for a form and submit if we have one			
			for(var i = 0, len = formData.length; i < len; i++)
			{				
				// Collect all of the parameters
				params[formData[i].name] = formData[i].value;
			}
			
			// We have a valid form property, we should continue
			// with the ajax form submission
			if (params.form) return true;
			
			// If there's no form, let's refresh the current page
			// and maybe a controller can use the POST variable
			site.refresh(true, params);
			
			return false;
		};
		
		// Callback function for the ajax requests
		var showResponse = function(response, statusText, xhr, form)
		{ 
			// Make sure the response is a JSON string
			if (response.search(/^{.*}$/) == -1)
			{
				Debug.error(response);
				return;
			}
			// Parse as object
			response = JSON.parse(response);
			
			// If the response is a fatal error
			// format for the debug output
			if (response.type == 'fatalError')
			{
				Debug.fatalError(response);
				return;
			}
			
			// Check for site redirect
			if (response.redirect)
			{
				site.redirect(response.redirect, false, true);
				return;
			}
			
			if (DEBUG) 
			{
				Debug.log(response.messages.join("\n"));
			}
			
			// There's no error and we should refresh
			if (!response.ifError && form.refresh.value == 'true')
			{
				site.refresh();
				return;
			} 
			
			// Show the feedback
			Forms.formFeedback(form, response.messages, response.ifError);
		};
		
		var options = {
			data: { async: true },
			beforeSubmit : showRequest,
			success : showResponse
		};
		
		// bind submit handler to form
		$(':submit').touch(function(e){
			
			// Add the button clicked to the data
			if (this.name && this.value)
			{
				options.data = { async: true };
				options.data[this.name] = this.value;
			}
			
			// Find the closest form
			var form = $(this).closest('form');
			
			// If we have a form, do an ajax submission
			if (form.length > 0)
			{
				// Stop the default submit
				e.preventDefault();
				form.ajaxSubmit(options);
			}			
		});
		
		// If the form is submitted by hitting enter key
		// on a field
		$('form').on('submit', function(e){
			
			// Stop the default submit
			e.preventDefault();

			$(this).ajaxSubmit(options);
		});
	};
	
	/**
	*  Show the form feedback
	*  @method formFeedback
	*  @static
	*  @param {jQuery} form The form to display feedback form
	*  @param {Array} message The message list of string feedback messages
	*  @param {Boolean} error If the feedback is error
	*/
	Forms.formFeedback = function(form, messages, error)
	{
		// Remove any existing feedback
		$("ul."+Forms.FEEDBACK_ERROR+", ul."+Forms.FEEDBACK_SUCCESS).remove();
		
		var c = error ? Forms.FEEDBACK_ERROR : Forms.FEEDBACK_SUCCESS, 
			ul = '<ul class="'+c+'">';
			
		for(var i = 0, len = messages.length; i < len; i++)
		{
			ul += '<li>' + messages[i] + '</li>';
		}
		ul += '</ul>';
		
		var legend = form.find('legend');
		
		if (legend.length)
		{
			legend.after(ul);
		}
		else
		{
			form.prepend(ul);
		}
	};
	
	namespace('Canteen').Forms = Forms;
	
}());