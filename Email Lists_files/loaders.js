;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.loaders = factory();
    }

})(this, function () {
    var globalLoader = {};
    var lazyLoader = {};
    var formLoader = {};
    var bodyLoader = {};
    var ajaxGlobalLoader = {};

    globalLoader.status = 0;


    ajaxGlobalLoader.settings = {
        loaderSelector: '#mainAjaxILoader',
        template: '<div id="mainAjaxILoader" class="sk-cube-grid">' +
            '<div class="sk-cube sk-cube1"></div>' +
            '<div class="sk-cube sk-cube2"></div>' +
            '<div class="sk-cube sk-cube3"></div>' +
            '<div class="sk-cube sk-cube4"></div>' +
            '</div>'
    };
    ajaxGlobalLoader.start = function () {
        var loader = document.createElement('div');

        loader.innerHTML = this.settings.template;

        if (document.body != null) {
            document.body.appendChild(loader.firstChild);
        }
    };
    ajaxGlobalLoader.show = function () {
        var loader = document.getElementById('mainAjaxILoader');

        loader.style.opacity = '1';
        loader.style.visibility = 'visible';
    };
    ajaxGlobalLoader.hide = function () {
        var loader = document.getElementById('mainAjaxILoader');

        setTimeout(function () {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 500);
    };
    ajaxGlobalLoader.done = function () {
        var loader = document.getElementById('mainAjaxILoader');

        document.removeChild(loader);
    };



    globalLoader.settings = {
        speed: 400,
        trickleSpeed: 600,
        barSelector: '[role="bar"]',
        parent: 'body',
        template: '<div class="bar-bg"></div><div class="bar" role="bar"></div>'
    };
    globalLoader.configure = lazyLoader.configure = function(options) {
        var key, value;
        for (key in options) {
            value = options[key];

            if (value !== undefined && options.hasOwnProperty(key)) {
                this.settings[key] = value;
            }
        }

        return this;
    };
    globalLoader.set = function (n) {
        var started = globalLoader.isStarted();

        n = clamp(n, 0.01, 1);
        globalLoader.status = (n === 1 ? null : n);

        var progress = globalLoader.render(!started),
            bar = progress.querySelector(globalLoader.settings.barSelector),
            speed = globalLoader.settings.speed;

        queue(function(next) {
            css(bar, {
                transform: 'scaleX(' + n + ')'
            });

            if (n === 1) {
                setTimeout(function() {
                    globalLoader.remove();
                    next();
                }, speed);
            } else {
                setTimeout(next, speed);
            }
        });

        return this;
    };
    globalLoader.isStarted = function () {
        return typeof globalLoader.status === 'number';
    };
    globalLoader.start = function () {
        if (!globalLoader.status) {
            globalLoader.set(0);
        }

        var work = function() {
            setTimeout(function() {
                if (!globalLoader.status) {
                    return;
                }
                globalLoader.trickle();
                work();
            }, globalLoader.settings.trickleSpeed);
        };

        work();

        return this;
    };
    globalLoader.done = function () {
        return globalLoader.set(1);
    };
    globalLoader.inc = function (amount) {
        var n = globalLoader.status;

        if (!n) {
            return globalLoader.start();
        } else if (n > 1) {
            return;
        } else {
            if (typeof amount !== 'number') {
                amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
            }

            n = clamp(n + amount, 0, 0.994);

            return globalLoader.set(n);
        }
    };
    globalLoader.trickle = function () {
        return globalLoader.inc(Math.random() * 0.45);
    };
    globalLoader.render = function () {
        if (globalLoader.isRendered()) {
            return document.getElementById('zp-global-loader');
        }

        addClass(document.documentElement, 'zp-global-loader-busy');

        var progress = document.createElement('div');
        progress.id = 'zp-global-loader';
        progress.innerHTML = globalLoader.settings.template;

        var bar = progress.querySelector(globalLoader.settings.barSelector),
            percents = globalLoader.status || 0,
            parent = document.querySelector(globalLoader.settings.parent);

        css(bar, {
            transform: 'scaleX(' + percents + ')'
        });

        parent.appendChild(progress);
        return progress;
    };
    globalLoader.remove = function () {
        removeClass(document.documentElement, 'zp-global-loader-busy');
        var progress = document.getElementById('zp-global-loader');
        progress && removeElement(progress);
    };
    globalLoader.isRendered = function () {
        return !!document.getElementById('zp-global-loader');
    };



    lazyLoader.settings = {
        trickleSpeed: 400,
        template: '<div class="loader">' +
            '<div><span class="loader-text">Making data request</span> (<span class="loader-percents">0%</span>)</div>' +
            '<div class="loader-progress"><div class="progress-bar"></div>' +
            '</div>' +
            '</div>',
        queryTexts: ['Making data request', 'Searching database', 'Fetching data', 'Loading']
    };
    lazyLoader.status = 0;
    lazyLoader.progressStatus = 0;
    lazyLoader.start = function (parentElement) {

        if (parentElement instanceof jQuery) {
            parentElement = parentElement[0];
        }

        addClass(parentElement, 'lazy-loader-applied');

        var progress = document.createElement('div');

        addClass(progress, 'lazy-loader');

        progress.innerHTML = lazyLoader.settings.template;

        if (isElement(parentElement)) {
            parentElement.innerHTML = '';
            parentElement.appendChild(progress);
            css(parentElement, {
                minHeight: '80px'
            });
        }

        var textRanges = lazyLoader.getTextRanges();
        var status = 0.3;

        var work = setTimeout(function tick() {
            if (status >= 0.995 || hasClass(progress, 'lazy-loader-ended')) {
                return;
            }

            var n = status;
            var timer = lazyLoader.settings.trickleSpeed;
            var amount = (1 - n) * clamp(Math.random() * n, 0.05, 0.98);

            if (status >= 0.80) {
                n = clamp(n + (amount/10), 0.80, 1);
                timer = lazyLoader.settings.trickleSpeed / 2;
            } else {
                n = clamp(n + amount, 0, 0.80);
            }

            lazyLoader.set(progress, n, textRanges);
            status = n;

            work = setTimeout(tick, timer);

        }, lazyLoader.settings.trickleSpeed);

        lazyLoader.progressStatus = 'in-progress';
    };
    lazyLoader.getTextRanges = function () {
        var x = 0,
            part = lazyLoader.settings.queryTexts.length,
            textRanges = [];

        for (var i = 0; i < part; i++) {
            if (!textRanges[i]) {
                textRanges[i] = {};
            }
            textRanges[i].percentsFrom = x;
            x = x + (1 / part);
            textRanges[i].percentsTo = x;
        }

        return textRanges;
    };
    lazyLoader.set = function (progress, n, textRanges) {
        var bar = progress.querySelector('.progress-bar'),
            percents = progress.querySelector('.loader-percents'),
            textBox = progress.querySelector('.loader-text'),
            queryTexts = lazyLoader.settings.queryTexts;
        if (n === 1) {
            addClass(progress, 'lazy-loader-ended');
        }

        if (textRanges) {
            if (textBox.innerText !== queryTexts[queryTexts.length - 1] ) {
                for (var i = 0; i < textRanges.length; i++) {
                    if (textRanges[i].percentsFrom <= n && textRanges[i].percentsTo >= n) {
                        textBox.innerText = queryTexts[i];
                        break;
                    }
                }
            }
        } else {
            textBox.innerText = queryTexts[queryTexts.length - 1];
        }

        percents.innerText = Math.round(n * 100) + '%';

        css(bar, {
            transform: 'scaleX(' + n.toFixed(2) + ')'
        });

    };
    lazyLoader.done = function (parentElement) {
        if (parentElement instanceof jQuery) {
            parentElement = parentElement[0];
        }

        if (isElement(parentElement)) {
            var progress = parentElement.querySelector('.lazy-loader');
            if (isElement(progress)) {
                lazyLoader.set(progress, 1);

                setTimeout(function () {
                    var event;
                    removeClass(parentElement, 'lazy-loader-applied');
                    removeElement(progress);

                    css(parentElement, {
                        minHeight: ''
                    });

                    if (!document.querySelectorAll('.lazy-loader').length) {
                        lazyLoader.progressStatus = 'done';

                        if (window.CustomEvent && typeof window.CustomEvent === 'function') {
                            event = new CustomEvent('lazyLoaderDone');
                        } else { // ie
                            event = document.createEvent('CustomEvent');
                            event.initCustomEvent('lazyLoaderDone', true, false, null);
                        }
                        document.dispatchEvent(event);
                    }
                }, 400);
            }
        }
    };



    formLoader.settings = {
        loaderSelector: '.formLoader',
        template: '<div class="formLoader"><div class="formLoaderContent">Loading...</div></div>'
    };
    formLoader.progressStatus = 0;
    formLoader.start = function (parentElement) {
        if (parentElement instanceof jQuery) {
            parentElement = parentElement[0];
        }

        if (isElement(parentElement)) {
            var parentElementPosition = getComputedStyle(parentElement, null).getPropertyValue('position');

            if (parentElementPosition === 'fixed' || parentElementPosition === 'position') {
                return false;
            }

            var loader = document.createElement('div');

            loader.innerHTML = this.settings.template;

            parentElement.style.position = 'relative';
            parentElement.appendChild(loader.firstChild);
            formLoader.progressStatus = 'in-progress';
        }
    };
    formLoader.done = function (parentElement) {
        if (parentElement instanceof jQuery) {
            parentElement = parentElement[0];
        }

        if (isElement(parentElement)) {
            var loader = parentElement.querySelector(this.settings.loaderSelector);

            removeElement(loader);
            formLoader.progressStatus = 'done';
        }
    };

    bodyLoader.progressStatus = 0;
    bodyLoader.start = function () {
        addClass(document.body, 'loading');
        bodyLoader.progressStatus = 'in-progress';
    };
    bodyLoader.done = function () {
        removeClass(document.body, 'loading');
        bodyLoader.progressStatus = 'done';
    };

    var queue = (function() {
        var pending = [];

        function next() {
            var fn = pending.shift();
            if (fn) {
                fn(next);
            }
        }

        return function(fn) {
            pending.push(fn);
            if (pending.length === 1) {
                next();
            }
        };
    })();

    var css = (function() {
        var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
            cssProps    = {};

        function camelCase(string) {
            return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
                return letter.toUpperCase();
            });
        }

        function getVendorProp(name) {
            var style = document.body.style;
            if (name in style) return name;

            var i = cssPrefixes.length,
                capName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;
            while (i--) {
                vendorName = cssPrefixes[i] + capName;
                if (vendorName in style) return vendorName;
            }

            return name;
        }

        function getStyleProp(name) {
            name = camelCase(name);
            return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }

        function applyCss(element, prop, value) {
            prop = getStyleProp(prop);
            element.style[prop] = value;
        }

        return function(element, properties) {
            var args = arguments,
                prop,
                value;

            if (args.length === 2) {
                for (prop in properties) {
                    value = properties[prop];
                    if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
                }
            } else {
                applyCss(element, args[1], args[2]);
            }
        };
    })();

    function clamp(n, min, max) {
        if (n < min) {
            return min;
        }
        if (n > max) {
            return max;
        }
        return n;
    }

    // Helper functions for manipulations with element --START
    function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
    }
    function addClass(element, name) {
        var oldList = classList(element),
            newList = oldList + name;

        if (hasClass(oldList, name)) return;

        // Trim the opening space.
        element.className = newList.substring(1);
    }
    function removeClass(element, name) {
        var oldList = classList(element),
            newList;

        if (!hasClass(element, name)) return;

        // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

        // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
    }
    function classList(element) {
        return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
    }
    function removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    function isElement(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    // Helper functions for manipulations with element --END

    //.closest() Polyfill --START
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }

    (function(ELEMENT) {
        ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
        ELEMENT.closest = ELEMENT.closest || function closest(selector) {
            if (!this) return null;
            if (this.matches(selector)) return this;
            if (!this.parentElement) {return null;}
            else return this.parentElement.closest(selector);
        };
    }(Element.prototype));
    //.closest() Polyfill --END
    return {
        global: globalLoader,
        ajax: ajaxGlobalLoader,
        lazy: lazyLoader,
        form: formLoader,
        body: bodyLoader
    };
});