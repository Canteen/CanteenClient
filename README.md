#CanteenClient

The front-end client JavaScript for a Canteen site. This uses the HTML5 History API and jQuery to interact with the Canteen Framework to create an easy-to-build stateless website.

##Usage

```js
$(function(){
	var site = new Canteen.Site({
		contentId : "#content",
		pageTitleId : "#pageTitle"
	});
	site.on('ready', function(){
		// Site is ready!
	});
});
```

##Dependencies

+ jQuery
+ History.js
+ CanteenFramework

##Documentation

For more information about how to interaction with the Site, please refer to the `docs` folder.