#CanteenClient

The front-end client JavaScript for a Canteen site. This uses the HTML5 History API and jQuery to interact with the Canteen Framework to create an easy-to-build stateless website.

For documentation of the codebase, please see [Canteen Client docs](http://canteen.github.io/CanteenClient/).

##Usage

```js
$(function(){
	var site = Canteen.Site.instance;
	site.on('ready', function(){
		// Site is ready!
	});
});
```

##Dependencies

+ jQuery
+ History.js
+ CanteenFramework

##License##

Copyright (c) 2014 [Matt Karl](http://github.com/bigtimebuddy)

Released under the MIT License.