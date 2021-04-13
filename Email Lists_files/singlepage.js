var nonSpa = [
    'ivr/ivr/constructorfull',
    'mailing/template/edit',
    'mailing/template/edittext',
    'pbx/ivr/blocks-constructor',
    'buyer/campaign/setup',
    'debug/default/index',
    'debug/default',
    'report/parambreakdown/index',
    'fraud/datamismatch/details',
    'fraud/datamismatch/index',
    'fraud/datamismatch',
    'fraud/fraudoverview/index',
    'fraud/fraudoverview',
    'fraud/emailvalidator/index',
    'fraud/emailvalidator',
    'fraud/leadparamcompare/index',
    'fraud/leadparamcompare',
];

var spApp = {
    options             : {
        navigationCount    : 0,
        maxNavigationCount : 200,
        appStartTime       : Math.round(new Date().getTime() / 1000),
        appRunSecondsLimit : 3600
    },
    eventsOnCurrentPage : [],
    globalEvents        : [],
    emptyContentKey     : '**100vh**',
    emptyContentTpl     : '<div class="content-wrapper" style="width:100vw; height: 100vh;"></div>',

    loadContentNow : function () {
        if (typeof loaders == 'undefined') {
            setTimeout(spApp.loadContentNow, 100);
        } else {
            if (location.href != '#') {
                spApp.doContentNavigation(location.href);
            }
        }
    },

    unRegisterEvent : function (eventName, eventElement) {
        $(document).off(eventName, eventElement);
    },

    registerEvent : function (eventName, eventElement, callbackFunction, removeOnUnload) {
        removeOnUnload = removeOnUnload || true;
        if (removeOnUnload) {
            spApp.eventsOnCurrentPage.push({eventName : eventName, eventElement : eventElement, callbackFunction: callbackFunction});
        }
        $(document).on(eventName, eventElement, callbackFunction);
    },

    registerGlobalEvent : function (eventName, eventElement, callbackFunction) {
        spApp.globalEvents.push({eventName : eventName, eventElement : eventElement, callbackFunction: callbackFunction});
        $(document).on(eventName, eventElement, callbackFunction);
    },

    unregisterEventsOnCurrentPage : function () {
        $.each(spApp.eventsOnCurrentPage, function (index, evt) {
            $(document).off(evt.eventName, evt.eventElement, evt.callbackFunction);
        });
        spApp.eventsOnCurrentPage = [];
    },

    onSpaReady : function (callbackFunction) {
        if (__isSinglePageModeOn || false) {
            $(document).on('spaReady', callbackFunction);
        } else {
            $(document).on('ready', callbackFunction);
        }
    },

    offSpaReady : function () {
        $(document).off('ready spaReady');
    },

    clearPageGarbage : null,

    checkLinkDomain(link) {
        // SPA works only for internal links
        var ourDomain = window.location.hostname;
        console.log(link);
        var linkDomain = (new URL(link, window.location.href)).host;

        return ourDomain === linkDomain;
    },

    doContentNavigation : function (link, back) {
        if (
            new RegExp(nonSpa.join("|")).test(link)
            || spApp.options.navigationCount >= spApp.options.maxNavigationCount
            || (Math.round(new Date().getTime() / 1000) - spApp.options.appStartTime) > spApp.options.appRunSecondsLimit
        ) { //Вопрос будущему мне: а как это будет работать вместе с onbeforeunload?
            loaders.body.start();
            location.href = link;
            return true;
        }

        if (typeof window.onbeforeunload !== 'undefined'
            && typeof window.onbeforeunload === 'function'
            && typeof window.onbeforeunload() !== 'undefined'
        ) {
            if (!confirm(window.onbeforeunload())) {
                return false;
            } else {
                window.onbeforeunload = null;
                delete (window.onbeforeunload);
            }
        }
        spApp.options.navigationCount++;

        back           = back || false;
        var parsedLink = parse_url_v2(link);

        if (!back) {
            history.pushState({}, document.title, link);
        }
        spApp.updateSidebar(parsedLink.path);

        var linkParams = {};
        parse_str(parsedLink.query || '', linkParams);
        linkParams             = linkParams || {};
        linkParams._loadSPData = 'yes';
        var linkToGet          =
                (typeof parsedLink.scheme == 'undefined' ? '' : (parsedLink.scheme + '://'))
                + (typeof parsedLink.user == 'undefined' ? '' : (parsedLink.user + ':' + (parsedLink.pass || '') + '@'))
                + (parsedLink.host || '')
                + (parsedLink.path || '')
                + '?' + http_build_query(linkParams)
                + (typeof parsedLink.fragment == 'undefined' ? '' : ('#' + parsedLink.fragment));
        $(document).trigger('spaNavigationStart');
        if (spApp.clearPageGarbage && typeof spApp.clearPageGarbage === 'function') {
            spApp.clearPageGarbage();
        }
        spApp.unregisterEventsOnCurrentPage();
        spApp.offSpaReady();
        $.ajax({
                   url        : linkToGet,
                   beforeSend : function () {
                       loaders.body.start();
                       spApp.fixContentHeight();
                   },
                   success    : function (data) {
                       document.title = $(data).filter('title').text();
                       spApp.applyContent(data);
                   },
                   complete   : function (data, textStatus) {
                       if (302 != data.status) {
                           loaders.body.done();
                           spApp.fixContentHeight();
                           $('.main-footer').show();
                       }
                       $(document).trigger('spaReady');
                       $.each(spApp.globalEvents, function (index, evt) {
                           $(evt.eventElement).trigger(evt.eventName);
                       });
                   },
                   error      : function (data) {
                       if (null !== data.getResponseHeader('X-Error')) {
                           spApp.applyContent('' +
                              '<div class="content-wrapper">' +
                              '<div class="row" style="padding: 50px">' +
                              '<div class="col-sm-4"></div>' +
                              '<div class="col-sm-4"><div class="alert alert-warning text-center">' +
                              data.getResponseHeader('X-Error') +
                              '<br><a href="/">Back to main page</a>' +
                              (data.getResponseHeader('X-Error-Logout') ? '<br><a href="/auth/logout">Logout</a>' : '') +
                              '</div></div>' +
                              '<div class="col-sm-4"></div>' +
                              '</div>' +
                              '</div>'
                           );
                       } else if (413 == (data.status || '!')) {
                           document.title = $(data).filter('title').text();
                           spApp.applyContent(data);
                       } else if (302 == (data.status || '!')) {
                           loaders.body.start();
                       } else {
                           spApp.applyContent('' +
                               '<div class="content-wrapper">' +
                               '<div class="row" style="padding: 50px">' +
                               '<div class="col-sm-4"></div>' +
                               '<div class="col-sm-4"><div class="alert alert-warning text-center">' +
                               '<h4><i class="icon fa fa-warning">' + (data.status || '!') + '</i></h4>' +
                               (data.statusText || '!') +
                               '<br><a href="/">Back to main page</a>' +
                               '</div></div>' +
                               '<div class="col-sm-4"></div>' +
                               '</div>' +
                               '</div>'
                           );
                       }
                   }
               });
    },

    fixContentHeight : function () {
        if (
            typeof $ != 'undefined'
            && typeof $.AdminLTE != 'undefined'
            && typeof $.AdminLTE.controlSidebar != 'undefined'
            && typeof $.AdminLTE.controlSidebar._fixForContent != 'undefined'
        ) {
            $.AdminLTE.controlSidebar._fixForContent($('.main-sidebar'));
        } else {
            setTimeout(spApp.fixContentHeight, 100);
        }
    },

    doFormNavigation : function (currentButton) {
        var targetForm = $(currentButton).parents('form:first');
        if (typeof targetForm == 'undefined') {
            return false;
        }
        var urlWithParams = targetForm.attr('action') + "?" + targetForm.serialize();
        spApp.doContentNavigation(urlWithParams);
    },

    applyContent : function (contentForPage) {
        if (contentForPage == spApp.emptyContentKey) {
            contentForPage = spApp.emptyContentTpl;
        }
        var $mainSidebar = $('aside.main-sidebar');

        $mainSidebar.nextUntil('.main-footer').remove();
        $mainSidebar.after(contentForPage).promise().done(function () {
            scriptWaitRunner({
                conditionToRun : function () { return 'object' === typeof uiHelper; },
                scriptToRun    : function () {
                    uiHelper.applyPlugins();
                    $.getScript('/js/column-hider.js?_=' + Math.random());
                    $('.generalReportChart').trigger('chart');
                    spApp.checkAngularApps();
                    uiHelper.displayHowToUse();
                },
                runnerName     : 'singlepage_wait_uihelper'
            });
        });
    },

    checkAngularApps : function () {
        var appElements       = document.querySelectorAll('[ng-app]');
        var appElementsLength = appElements.length;

        for (var i = 0; i < appElementsLength; i++) {
            var appName = appElements[i].getAttribute('ng-app');

            try {
                angular.bootstrap(appElements[i], [appName]);
            } catch (e) {
                // console.log('Module "' + appName + '" is defined but not loaded!');
            }
        }
    },

    updateSidebar : function (link) {
        var $sidebarElement = $('.sidebar-menu');
        var $linkElement    = $sidebarElement.find('a[href="' + link + '"]');

        if ($linkElement.length) {
            var $currentTreeView = $linkElement.closest('.treeview');

            $sidebarElement.find('li').removeClass('active');
            $linkElement.closest('li').addClass('active');
            $currentTreeView.addClass('active');

            if (!$currentTreeView.hasClass('menu-opened')) {
                $currentTreeView.children('a').trigger('click');
            }
            if ($currentTreeView.length === 0) {
                var $openedTriview = $sidebarElement.find('.menu-opened');
                $openedTriview.find('.treeview-menu').removeClass('menu-open').slideUp(500, function () {
                    $openedTriview.removeClass('menu-opened');
                    $.AdminLTE.controlSidebar._fixForContent($sidebarElement);
                });
            }

        }
    },

    spaReloadCurrentPage : function () {
        spApp.doContentNavigation(location.href);
    }
}

$(document).on('click', 'a[href]:not([download]):not([data-no-spa]):not([data-async]):not([data-target]):not([target]):not([ng-click])', function (event) {
    var $this = $(this);
    var link  = $this.attr('href');
    if (
        !spApp.checkLinkDomain(link)
        || typeof (link) == 'undefined'
        || link.indexOf('#') === 0
        || link == ''
        || link == '#'
        || link == '/'
        || link.indexOf('javascript') >= 0
        || (typeof $this.data('toggle') !== 'undefined' && $this.data('toggle').length > 0)
    ) {
        return true;
    } else {
        event.preventDefault();
        spApp.doContentNavigation(link);
    }
});

$(window).on('popstate', function (event) {
    spApp.doContentNavigation(window.location.href, true);
});

spApp.loadContentNow();
