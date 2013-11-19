(function() {
    "use strict";
    Function.prototype.bind || (Function.prototype.bind = function(that) {
        var args, bound, target = this;
        if ("function" != typeof target) throw new TypeError();
        return args = Array.prototype.slice.call(arguments, 1), bound = function() {
            if (this instanceof bound) {
                var F, self, result;
                return F = function() {}, F.prototype = target.prototype, self = new F(), result = target.apply(self, args.concat(Array.prototype.slice.call(arguments))), 
                Object(result) === result ? result : self;
            }
            return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
        };
    });
})(), function(global) {
    "use strict";
    var namespace = function(namespaceString) {
        var parts = namespaceString.split("."), parent = window, currentPart = "", i = 0, length = 0;
        for (i = 0, length = parts.length; length > i; i++) currentPart = parts[i], parent[currentPart] = parent[currentPart] || {}, 
        parent = parent[currentPart];
        return parent;
    };
    global.namespace = namespace;
}(window), function(global, undefined) {
    "use strict";
    function output(level, args) {
        Debug.output && Debug.output.append('<div class="' + level + '">' + args + "</div>");
    }
    var Debug = function() {}, _hasConsole = global.console !== undefined;
    Debug.GENERAL = 0, Debug.DEBUG = 1, Debug.INFO = 2, Debug.WARN = 3, Debug.ERROR = 4, 
    Debug.minLogLevel = Debug.GENERAL, Debug.enabled = !0, Debug.output = null, Debug.log = function(params) {
        Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled && (console.log(params), 
        output("general", params));
    }, Debug.debug = function(params) {
        Debug.minLogLevel <= Debug.DEBUG && _hasConsole && Debug.enabled && (console.debug(params), 
        output("debug", params));
    }, Debug.info = function(params) {
        Debug.minLogLevel <= Debug.INFO && _hasConsole && Debug.enabled && (console.info(params), 
        output("info", params));
    }, Debug.warn = function(params) {
        Debug.minLogLevel <= Debug.WARN && _hasConsole && Debug.enabled && (console.warn(params), 
        output("warn", params));
    }, Debug.error = function(params) {
        _hasConsole && Debug.enabled && (console.error(params), output("error", params));
    }, Debug.fatalError = function(error) {
        var result = error.message + "\non " + error.file + " (code: " + error.code + ")\n";
        if (error.stackTrace) for (var j = 0; error.stackTrace.length > j; j++) result += "\n	 #" + (j + 1) + ". " + error.stackTrace[j];
        Debug.error(result);
    }, Debug.assert = function(truth, params) {
        _hasConsole && Debug.enabled && console.assert !== undefined && (console.assert(truth, params), 
        truth || output("error", params));
    }, Debug.dir = function(params) {
        Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled && console.dir(params);
    }, Debug.clear = function(params) {
        _hasConsole && Debug.enabled && (console.clear(params), Debug.output && Debug.output.html(""));
    }, Debug.trace = function(params) {
        Debug.minLogLevel == Debug.GENERAL && _hasConsole && Debug.enabled && console.trace(params);
    }, global.Debug = Debug;
}(window), function(global, undefined) {
    "use strict";
    function type(value) {
        return null === value ? value + "" : "object" == typeof value || "function" == typeof value ? Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof value;
    }
    var EventDispatcher = function() {}, p = EventDispatcher.prototype;
    p._listeners = [], p.trigger = function(type, params) {
        if (this._listeners[type] !== undefined) for (var listeners = this._listeners[type], i = 0; listeners.length > i; i++) listeners[i](params);
    }, p.on = function(name, callback) {
        if ("object" === type(name)) for (var key in name) name.hasOwnProperty(key) && this.on(key, name[key]); else if ("function" === type(callback)) for (var names = name.split(" "), n = null, i = 0, nl = names.length; nl > i; i++) n = names[i], 
        this._listeners[n] = this._listeners[n] || [], -1 === this._callbackIndex(n, callback) && this._listeners[n].push(callback); else if ("array" === type(callback)) for (var f = 0, fl = callback.length; fl > f; f++) this.on(name, callback[f]);
        return this;
    }, p.off = function(name, callback) {
        if (name === undefined) this._listeners = []; else if ("array" === type(callback)) for (var f = 0, fl = callback.length; fl > f; f++) this.off(name, callback[f]); else for (var names = name.split(" "), n = null, i = 0, nl = names.length; nl > i; i++) if (n = names[i], 
        this._listeners[n] = this._listeners[n] || [], callback === undefined) this._listeners[n].length = 0; else {
            var index = this._callbackIndex(n, callback);
            -1 !== index && this._listeners[name].splice(index, 1);
        }
        return this;
    }, p._callbackIndex = function(name, callback) {
        for (var i = 0, l = this._listeners[name].length; l > i; i++) if (this._listeners[name][i] === callback) return i;
        return -1;
    }, namespace("Canteen").EventDispatcher = EventDispatcher;
}(window), $.fn.touch = function(handler) {
    return this.on("click", !1).on("touchclick", handler);
}, $.fn.untouch = function() {
    return this.off("touchclick");
}, $.fn.internalLink = function(site) {
    var basePath = Canteen.settings.basePath, index = Canteen.settings.siteIndex, state = site.currentState, checkConfirm = function(element) {
        if (element.hasClass("confirm")) {
            var title = element.data("confirm") || "Are you sure you wish to continue?", result = confirm(title);
            return result;
        }
        return !0;
    };
    return this.each(function() {
        var uri, link = $(this), refresh = link.data("refresh"), href = link.attr("href");
        return refresh !== void 0 ? (link.untouch().touch(function(e) {
            return checkConfirm(link) ? "soft" == refresh ? (e.preventDefault(), site.refresh(), 
            void 0) : (href ? document.location.href = href : site.refresh(!1), void 0) : void 0;
        }), void 0) : (href && 0 === href.indexOf(basePath) && (uri = href.substr(basePath.length), 
        link.untouch().touch(function(e) {
            e.preventDefault(), checkConfirm(link) && site.redirect(uri);
        }).removeClass("selected"), (uri == state || 0 === state.indexOf(uri) || uri == index && "" === state) && link.addClass("selected")), 
        void 0);
    });
}, function() {
    "use strict";
    var SavedData = function() {}, _daysToMS = 864e5;
    SavedData.NEVER_EXPIRE = "neverExpire", SavedData.clear = function(name) {
        SavedData.write(name, "", -1);
    }, SavedData.write = function(name, value, days) {
        var expires, date;
        days ? (days == SavedData.NEVER_EXPIRE ? date = new Date(2147483646e3) : (date = new Date(), 
        date.setTime(date.getTime() + days * _daysToMS)), expires = "; expires=" + date.toGMTString()) : expires = "", 
        document.cookie = name + "=" + value + expires + "; path=/";
    }, SavedData.read = function(name) {
        var c, nameEQ = name + "=", ca = document.cookie.split(";"), i = 0;
        for (i = 0; ca.length > i; i++) {
            for (c = ca[i]; " " == c.charAt(0); ) c = c.substring(1, c.length);
            if (0 === c.indexOf(nameEQ)) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }, namespace("Canteen").SavedData = SavedData;
}(), function() {
    "use strict";
    var LocationUtils = function() {
        throw "Location Utils is a static class";
    };
    LocationUtils.getParameters = function() {
        var output = {}, href = window.location.href, questionMark = href.indexOf("?"), vars = null, pound = null, splitVars = null, myVar = null, i = null;
        if (-1 == questionMark) return output;
        vars = 0 > questionMark ? "" : href.substr(questionMark + 1), pound = vars.indexOf("#"), 
        vars = 0 > pound ? vars : vars.substring(0, pound), splitVars = vars.split("&");
        for (i in splitVars) myVar = splitVars[i].split("="), Debug.log(myVar[0] + " -> " + myVar[1]), 
        output[myVar[0]] = myVar[1];
        return output;
    }, namespace("Canteen").LocationUtils = LocationUtils;
}(), function() {
    "use strict";
    var Forms = function() {};
    Forms.ERROR = "error", Forms.DISABLED = "disabled", Forms.SELECTED = "selected", 
    Forms.REQUIRED = "required", Forms.CONFIRM = "confirm", Forms.FEEDBACK_ERROR = "formError", 
    Forms.FEEDBACK_SUCCESS = "formSuccess", Forms.destroy = function() {
        $("input." + Forms.CONFIRM + ", button." + Forms.CONFIRM).untouch(), $("form").resetForm().off("submit"), 
        $(":submit").untouch();
    }, Forms.setup = function(site, debugForms) {
        for (var types = [ "text", "button", "reset", "submit", "checkbox", "image", "radio", "file", "password", "date" ], onEnterKey = function(e) {
            var f = $(e.target).closest("form"), submit = f.find(":submit").eq(0);
            13 == e.keyCode && submit && (e.stopImmediatePropagation(), e.preventDefault(), 
            submit.trigger("touchclick"));
        }, i = 0, len = types.length; len > i; i++) $("input[type='" + types[i] + "']").removeClass(types[i]).addClass(types[i]).keyup(onEnterKey);
        if ($("input." + Forms.CONFIRM + ", button." + Forms.CONFIRM).untouch().touch(function(e) {
            var title = $(this).data(Forms.CONFIRM) || "Are you sure you wish to continue?", result = confirm(title);
            return result ? void 0 : (e.stopImmediatePropagation(), !1);
        }), !debugForms) {
            $('input[name="formSession"]').remove();
            var showRequest = function(formData, form) {
                var required = form.find("." + Forms.REQUIRED).removeClass(Forms.ERROR), errors = required.filter(function() {
                    return !this.value;
                }).addClass(Forms.ERROR);
                if (errors.length > 0) {
                    var removeError = function() {
                        $(this).removeClass(Forms.ERROR).off("keydown");
                    };
                    return errors.untouch().on("touchclick focus keydown", removeError), !1;
                }
                for (var params = {}, i = 0, len = formData.length; len > i; i++) params[formData[i].name] = formData[i].value;
                return params.form ? !0 : (site.refresh(!0, params), !1);
            }, showResponse = function(response, statusText, xhr, form) {
                if (-1 == response.search(/^{.*}$/)) return Debug.error(response), void 0;
                if (response = JSON.parse(response), "fatalError" == response.type) return Debug.fatalError(response), 
                void 0;
                if (response.redirect) return site.redirect(response.redirect, !1, !0), void 0;
                Debug.log(response.messages.join("\n"));
                var refresh = form.find('input[name="refresh"]');
                return !response.ifError && refresh.length && "true" == refresh.val() ? (site.refresh(), 
                void 0) : (Forms.formFeedback(form, response.messages, response.ifError), void 0);
            }, options = {
                data: {
                    async: !0
                },
                beforeSubmit: showRequest,
                success: showResponse
            };
            $(":submit").touch(function(e) {
                this.name && this.value && (options.data = {
                    async: !0
                }, options.data[this.name] = this.value);
                var form = $(this).closest("form");
                form.length > 0 && (e.preventDefault(), form.ajaxSubmit(options));
            }), $("form").on("submit", function(e) {
                e.preventDefault(), $(this).ajaxSubmit(options);
            });
        }
    }, Forms.formFeedback = function(form, messages, error) {
        $("ul." + Forms.FEEDBACK_ERROR + ", ul." + Forms.FEEDBACK_SUCCESS).remove();
        for (var c = error ? Forms.FEEDBACK_ERROR : Forms.FEEDBACK_SUCCESS, ul = '<ul class="' + c + '">', i = 0, len = messages.length; len > i; i++) ul += "<li>" + messages[i] + "</li>";
        ul += "</ul>";
        var legend = form.find("legend");
        legend.length ? legend.after(ul) : form.prepend(ul);
    }, namespace("Canteen").Forms = Forms;
}(), function(undefined) {
    "use strict";
    var Gateway = function(gatewayUrl, callback) {
        this.initialize(gatewayUrl, callback);
    }, p = Gateway.prototype;
    p.gatewayUrl = null, p.initialize = function(gatewayUrl, callback) {
        this.gatewayUrl = gatewayUrl, "/" != gatewayUrl.charAt(gatewayUrl.length - 1) && (this.gatewayUrl += "/"), 
        this.get(function(data) {
            var ifError = null === data || "error" == data.type;
            if (ifError) throw "Couldn't connect to gateway";
            callback(!ifError);
        }, "time", "get-server-time");
    }, p.get = function(callback, service, method, parameters) {
        var url = this.gatewayUrl + service + "/" + method;
        parameters !== undefined && (url += "/" + ($.isArray(parameters) ? parameters.join("/") : parameters + "")), 
        Debug.log(url), $.get(url, function(response) {
            if (!response || "null" == response) return callback(null), undefined;
            if (-1 == response.search(/^{.*}$/)) return Debug.error(response), callback(null), 
            undefined;
            var data = JSON.parse(response);
            return "fatalError" == data.type ? (Debug.fatalError(data), callback(null), undefined) : (callback(data), 
            undefined);
        });
    }, p.destroy = function() {
        p = null;
    }, namespace("Canteen").Gateway = Gateway;
}(), function() {
    "use strict";
    var Page = function() {}, p = Page.prototype;
    p.site = null, p.uri = null, p.enter = function() {}, p.exit = function() {}, p.refresh = function() {
        return !0;
    }, p.resize = function() {}, namespace("Canteen").Page = Page;
}(), function(global, undefined) {
    "use strict";
    var EventDispatcher = Canteen.EventDispatcher, LocationUtils = Canteen.LocationUtils, Gateway = Canteen.Gateway, Forms = Canteen.Forms, Page = Canteen.Page, Site = function(options) {
        this.initialize(options);
    }, p = Site.prototype = new EventDispatcher(), _lastRequest = null, _currentId = null, _currentState = null, _pages = [], _currentPage = null, _defaultOptions = {
        contentId: "#content",
        pageTitleId: "h1",
        pageLoadingId: "article",
        siteLoadingId: "body",
        loadingClass: "loading"
    };
    p.gateway = null, p.parameters = null, p.options = {}, Site.ENTER = "enter", Site.EXIT = "exit", 
    Site.READY = "ready", Site.LOADING = "loading", Site.LOADING_DONE = "loadingDone", 
    Site.VERSION = "1.0.0", p.initialize = function(options) {
        var opts = $.extend(this.options, _defaultOptions, options);
        (Canteen.settings.clientEnabled === undefined || Canteen.settings.clientEnabled) && ($(opts.siteLoadingId).addClass(opts.loadingClass), 
        this.parameters = LocationUtils.getParameters(), Debug.enabled = Canteen.settings.debug, 
        _currentId = 1, _currentState = Canteen.settings.uriRequest, this._enableHistory(!0), 
        this._fixInternalLinks(), this.gateway = new Gateway(Canteen.settings.gatewayPath, this._gatewayReady.bind(this)));
    }, p._enableHistory = function(enable) {
        $(global).off("statechange"), enable && $(global).on("statechange", this._onStateChange.bind(this));
    }, p.redirect = function(uri, replaceInHistory, allowRefresh) {
        var state = Canteen.settings.basePath, siteTitle = $("<div />").html($("title").html()).text();
        return replaceInHistory = replaceInHistory === undefined ? !1 : replaceInHistory, 
        allowRefresh = allowRefresh === undefined ? !1 : allowRefresh, Canteen.settings.siteIndex != uri && (state += uri), 
        _currentState == uri ? (Debug.log("Already on this page! (current: " + _currentState + ", request: " + uri + ")"), 
        allowRefresh && this.refresh(), undefined) : (replaceInHistory ? History.replaceState({
            state: _currentId
        }, siteTitle, state) : (_currentId++, History.pushState({
            state: _currentId
        }, siteTitle, state)), undefined);
    }, Object.defineProperty(p, "currentState", {
        get: function() {
            return _currentState;
        }
    }), Object.defineProperty(p, "currentPage", {
        get: function() {
            return _currentPage;
        }
    }), p.refresh = function(async, params) {
        async = async === undefined ? !0 : async, async ? this._updatePageContent(_currentState, params) : document.location.reload(!0);
    }, p._fixInternalLinks = function() {
        $("a").internalLink(this), Forms.setup(this, "true" === this.parameters.debugForms);
    }, p._onStateChange = function() {
        var state = History.getState(), uri = state.url.split(Canteen.settings.baseUrl)[1];
        return _currentState == uri ? (Debug.log("Already on this page! (" + uri + ")"), 
        undefined) : (this._updatePageContent(uri), undefined);
    }, p._gatewayReady = function(success) {
        success ? Debug.log("Canteen is ready!") : Debug.error("Unable to setup gateway.");
        var options = this.options;
        $(options.siteLoadingId).removeClass(options.loadingClass), $(window).on("resize", this.resize.bind(this)), 
        this.resize(), this.trigger(Site.READY), this._enterPage();
    }, p.resize = function() {
        _currentPage && _currentPage.resize();
    }, p.addPage = function(uriOrRegExp, pageInstance) {
        pageInstance instanceof Page ? (pageInstance.site = this, _pages.push({
            uri: uriOrRegExp,
            content: pageInstance
        })) : Debug.warn("The page your trying to add needs to extend Canteen.Page");
    }, p._enterPage = function() {
        var page = this.getPageByUri(_currentState);
        page && (_currentPage = page.content, _currentPage.uri = _currentState, _currentPage.enter(), 
        _currentPage.resize()), this.trigger(Site.ENTER, _currentState);
    }, p.getPageByUri = function(uri) {
        var len = _pages.length, i = 0, pg = null;
        if (0 === len) return null;
        for (i = 0; len > i; i++) if (pg = _pages[i], pg.uri === uri || pg.uri instanceof RegExp && pg.uri.test(uri)) return pg;
        return null;
    }, p._updatePageContent = function(uri, params) {
        var site = this, options = this.options, page = this.getPageByUri(uri), url = Canteen.settings.baseUrl + uri;
        return this.trigger(Site.EXIT, _currentState), _currentState = uri, page && page.content === _currentPage && !page.content.refresh(uri) ? (page.content.uri = uri, 
        undefined) : (_currentPage && (_currentPage.exit(), _currentPage = null), Forms.destroy(), 
        _lastRequest = uri, params = params === undefined ? {} : params, params.async = !0, 
        this.trigger(Site.LOADING), $(options.pageLoadingId).removeClass(options.loadingClass).addClass(options.loadingClass), 
        Debug.log("Update Page Content : " + uri), $.post(url, params, function(response) {
            if (uri == _lastRequest) {
                if (_lastRequest = null, site.trigger(Site.LOADING_DONE), $(options.pageLoadingId).removeClass(options.loadingClass), 
                !response || "null" == response) return Debug.error("No data for " + uri), undefined;
                if (-1 == response.search(/^{.*}$/)) return Debug.error(response), undefined;
                var data = JSON.parse(response);
                if ("fatalError" == data.type) return Debug.fatalError(data), undefined;
                if (data.redirect !== undefined) return site.redirect(data.redirect, !0), undefined;
                $("body").attr("id", data.pageId), $(options.pageTitleId).html(data.title), $(options.contentId).html(data.content), 
                document.title = $("<div />").html(data.fullTitle).text(), $("meta[name='keywords']").attr("content", data.keywords), 
                $("meta[name='description']").attr("content", data.description), site._fixInternalLinks(), 
                site._enterPage();
            }
        }), undefined);
    }, namespace("Canteen").Site = Site;
}(window);