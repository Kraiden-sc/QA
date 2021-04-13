/* global $, uiHelper, loaders */
(function () {
    // this is quick start storage keys
    var quickStartStorageKey = 'quick_start_state';
    var quickStartStorageTarget = 'quick_start_target';
    var quickStartStepActiveItem = 'quick_start_step_active_item';
    var quickStartComponentActive = 'quick_start_component';
    // style for arrow after - enable quick start
    var quickStartBlinkArrowClass = 'quick_start_blink_border';
    // this is available quick start block states
    var showBlockState = 'show';
    var hiddenBlockState = 'hide';
    var updateQuickStartDelay;
    // remove quick start state in local storage
    function removeQuickStartStorageState(key) {
        window.localStorage.removeItem(key);
    }
    // remove all quick start data in local storage
    function removeAllQuickStartStorageData() {
        removeQuickStartStorageState(quickStartStepActiveItem);
        removeQuickStartStorageState(quickStartStorageKey);
        removeQuickStartStorageState(quickStartStorageTarget);
        removeQuickStartStorageState(quickStartComponentActive);
    }
    // get last state for quick start block
    function getQuickStartStorageState(key) {
        var localStorage = window.localStorage;

        if (localStorage.getItem(key)) {
            return localStorage.getItem(key);
        }
        return '';
    }
    function getComponentPrefix() {
        var prefix = $(document).find('#quickStart').data('component');
        var componentPrefix = '';

        if (undefined !== prefix) {
            componentPrefix = prefix;
        }

        return componentPrefix;
    }
    function removeAllHints() {
        $('#quick-start-background').remove();
        $('#contentHintText').remove();
        $('.content-hint-parent').removeClass('content-hint-parent');
        $('.content-hint-item').removeClass('content-hint-item');
        $('.content-hint-item-none-background').removeClass('content-hint-item-none-background');
        $('.sidebar-hint-item').removeClass('sidebar-hint-item');
        $('.sidebar-hint-sidebar').removeClass('sidebar-hint-sidebar');
        $('.quick-start-hint-parent').removeClass('quick-start-hint-parent');
        $('#quickStartTooltip').remove();
    }
    function checkComponent() {
        var storagePrefix = getQuickStartStorageState(quickStartComponentActive);
        var currentPrefix = getComponentPrefix();

        if (currentPrefix !== storagePrefix) {
            removeAllHints();
            removeQuickStartStorageState(quickStartStorageTarget);
            removeQuickStartStorageState(quickStartComponentActive);
        }
    }
    // show last state for quick start block
    function showLastQuickStartBlockState() {
        var lastQuickStartStorageState = getQuickStartStorageState(quickStartStorageKey);

        if (lastQuickStartStorageState !== showBlockState) {
            $('#quickStartArrow').addClass(quickStartBlinkArrowClass);
        } else {
            $('#quickStartArrow').removeClass(quickStartBlinkArrowClass);
        }

        if (lastQuickStartStorageState) {
            $('#quickStart').attr('data-state', lastQuickStartStorageState);
        }
    }
    // set stare for quick start block (open or close)
    function setQuickStartStorageState(key, value) {
        window.localStorage.setItem(key, value);
    }
    // enabled or disabled quick start in support center
    function changeQuickStartStatus(status) {
        var statusEnabled = 1;

        $.ajax({
            url: '/quickstart/quickstart/change-status',
            type: 'POST',
            data: { 'StatusForm[quickStartStatus]': status },
            success: function (response) {
                if (parseInt(response.status, 10) === statusEnabled) {
                    uiHelper.applyPlugins();
                    setQuickStartStorageState(quickStartStorageKey, showBlockState);
                    showLastQuickStartBlockState();
                    $('#dropdown-support-block').parent().removeClass('open');
                }
                return true;
            },
            error: function (response) {
                if (response.status === 403) {
                    var supportDropdown = $(document).find('#dropdown-support-block > li.text-center');
                    var errorMessage = $(document).find('p.qs-access-control').remove();

                    if (errorMessage) {
                        setTimeout(function () {
                            $(document).find('p.qs-access-control').remove();
                        }, 5000);
                    }

                    supportDropdown.append('<p class="qs-access-control alert-warning">' + 'You do not have access.' + '</p>');
                }
            }
        });

        return false;
    }
    // get status ( hidden or display )
    function getQuickStartStatus(checkedValue) {
        var quickStartBlock = $('#quickStart');
        if (checkedValue) {
            quickStartBlock.css('display', 'block');
            return 1;
        }
        quickStartBlock.css('display', 'none');
        return 0;
    }
    // clear last active steps in quick start modal
    function clearSteps() {
        $('#qs-step-item-menu > li').removeClass('active');
        $('#qs-step-item-menu > li:first').addClass('active');
        $('.step-container').removeClass('active').addClass('no-display');
        $('.step-container:first').removeClass('no-display');
    }
    function replaceForceComponentParam(href) {
        var matchForceComponent = href.match(/(forceComponentSwitch=\w+)/g);
        if (matchForceComponent) {
            href = href.replace(matchForceComponent[0], '');
        }
        return href;
    }

    // check first step where exist route in table db
    function isCompletedStepByUrl(itemRoute, targets) {
        var route = new RegExp(itemRoute + '$');
        var urlPath = replaceForceComponentParam(decodeURIComponent(window.location.pathname));
        var testRoute = route.test(urlPath);

        // campaigngroup or campaign-group (вынужденные костыли)
        if (!testRoute && urlPath.indexOf('campaign/setup') > 0) {
            // for campaign create step if current page campaign setup
            if (targets.length === 2 && itemRoute.indexOf('buyer/campaign') > 0) {
                return false;
            }

            var checkRoute = new RegExp(itemRoute);
            testRoute = checkRoute.test(urlPath);
        }

        // check is active tab in targets
        // if search params has the tab href, we find its on page and make step completed
        if (!testRoute) {
            var matchComponent = itemRoute.match(/(\/p\d)/);
            if (matchComponent) {
                var replacementRoute = itemRoute.replace(matchComponent[0], '');
                var newRoute = new RegExp(replacementRoute);
                testRoute = newRoute.test(urlPath);
            }
        }

        if (!window.location.search.length && itemRoute) {
            // if url path has component number p1, p2 ...
            if (urlPath.match(/(\/p\d)/)) {
                urlPath = urlPath.substr(3, urlPath.length);
            }
            // if step route has component number p1, p2 ...
            if (itemRoute.match(/(\/p\d)/)) {
                itemRoute = itemRoute.substr(3, itemRoute.length);
            }
            return urlPath === itemRoute;
        }

        return testRoute;
    }
    // search mode of goals on the page,
    // searches for an element or link on which you need to go to achieve the goal
    function takeMeHereMode(event) {
        setTimeout(function () {
            var targets = getQuickStartStorageState(quickStartStorageTarget);
            var notCompleted = [];

            if (targets) {
                targets = JSON.parse(targets);
                $(targets).each(function (index, item) {
                    // first step check
                    if (item.route !== '') {
                        if (isCompletedStepByUrl(item.route, targets)) {
                            item.completed = true;
                        }
                    } else if (targets[0].completed === true) {
                        // if the page is (configure page) step, take one step back
                        var href = replaceForceComponentParam(window.location.href);

                        if (href.indexOf('setup?id=') > 0) {
                            if (targets.length > 2 && 2 === parseInt(item.order, 10)) {
                                item.completed = true;
                            }
                        }

                        // check the tab in current page
                        var str = decodeURIComponent(window.location.search);
                        var result = str.match(/(#[a-z-]*)/g);

                        if (result) {
                            for (var i = 0; i < result.length; i++) {
                                if (!targets[i].completed) {
                                    var elem = $(document).find(targets[i].css);
                                    if (undefined !== elem.attr('href') && elem.attr('href') === result[i]) {
                                        targets[i].completed = true;
                                        setQuickStartStorageState(quickStartStorageTarget, JSON.stringify(targets));
                                    }
                                }
                            }
                        }

                        // check click the button or tabs, only if quick start exists
                        $(document).off('click', item.css);
                        $(document).on('click', item.css, function (e) {
                            if (getQuickStartStorageState(quickStartStorageTarget)) {
                                targets[index].completed = true;
                                setQuickStartStorageState(quickStartStorageTarget, JSON.stringify(targets));
                                removeAllHints();

                                $(document).find('.transform-edit-campaign-page')
                                    .removeClass('transform-edit-campaign-page')
                                    .addClass('center_block');

                                if (e.target.parentElement.type === 'button') {
                                    $(item.css).css('z-index', 1);
                                }
                            }
                        });
                    }

                    if (item.completed === false) {
                        notCompleted.push(item);
                    } else {
                        removeQuickStartStorageState(quickStartStorageTarget);
                        removeAllHints();
                    }

                    setQuickStartStorageState(quickStartStorageTarget, JSON.stringify(targets));
                });

                if (notCompleted.length === 0) {
                    removeQuickStartStorageState(quickStartStorageTarget);
                    removeAllHints();
                }

                // search class or id unique element on the page
                if (notCompleted[0] && notCompleted[0].css) {
                    initQuickStartHint(notCompleted[0].css, notCompleted[0].comment);
                }
            }
        }, 100);

        if (event) {
            event.currentTarget.removeEventListener('click', takeMeHereMode);
        }
    }

    // add the quick start close icon in take me here mode
    function qsTooltip(param, text) {
        $('body').append(
            $('<div/>')
                .attr({ id: 'quickStartTooltip', class: 'quick-start-tooltip' })
                .css(param)
                .html(text)
                .append($('<div/>').attr({ class: 'quick-start-tooltip-arrow' }).css(param.arrow))
                .append(
                    $('<div/>')
                        .attr({ class: 'quick-start-tooltip-close' })
                        .append($('<i/>').attr({
                            class: 'fa fa-times pulse-infinite',
                            title: 'Close the Quick Start option',
                        }))
                )
        );
    }
    function scrollToItem($item) {
        $('html, body').animate({
            scrollTop: $item.offset().top - 150
        }, 1000);
    }

    function setSidebarHint($item, content) {
        var $parent = $item.closest('.treeview');

        // open sidebar
        $('body').removeClass('sidebar-collapse');

        // open tab
        if (!$parent.hasClass('menu-opened')) {
            $('.menu-opened').removeClass('menu-opened').find('.treeview-menu').removeClass('menu-open')
                .removeAttr('style');
            if (!$parent.hasClass('active')) {
                $('.active').find('.treeview-menu').attr('style', 'display: none');
            }
            $parent.addClass('menu-opened').find('.treeview-menu').addClass('menu-open').attr('style', 'display: block');
        }

        // set hint after menu opened
        (function selectItem() {
            if ($parent.hasClass('menu-opened')) {
                setTimeout(function () {
                    var elementProperties = $item[0].getBoundingClientRect();
                    var tooltipParam = {
                        top: pageYOffset + elementProperties.top,
                        left: elementProperties.left + elementProperties.width + 20,
                        arrow: {
                            top: '5px',
                            left: '-20px',
                            borderRight: '15px solid white'
                        }
                    };

                    // set tooltip
                    qsTooltip(tooltipParam, content);

                    // apply style
                    $item.parents('.main-sidebar').addClass('sidebar-hint-sidebar');
                    $item.addClass('sidebar-hint-item');

                    // scroll and animation
                    scrollToItem($item);
                }, 300);
            } else {
                setTimeout(selectItem, 100);
            }
        }());
    }
    function setContentHint($item, content) {
        var $parent = $item.closest('.box');
        var elementProperties = $item[0].getBoundingClientRect();

        if ($parent.length !== 0) {
            var parentProperties = $parent[0].getBoundingClientRect();
            if (parentProperties.width + parentProperties.left < elementProperties.width + elementProperties.left) {
                var scrolledElement = document.querySelector('.table-dscroll-applied');
                var delta = scrolledElement.scrollWidth - scrolledElement.clientWidth;
                $(scrolledElement).scrollLeft(delta);
                elementProperties = $item[0].getBoundingClientRect();
            }
        }

        var tooltipParam = {
            top: pageYOffset + elementProperties.top + elementProperties.height + 20,
            right: $(document).width() - elementProperties.right,
            arrow: {
                top: '-20px',
                right: '35px',
                display: 'block',
                border: '10px solid transparent',
                borderBottom: '15px solid white'
            }
        };

        // set tooltip
        qsTooltip(tooltipParam, content);

        // apply style
        if ($item.closest('table').length === 0) {
            $parent.addClass('quick-start-hint-parent');
        }

        // by campaign configure where used transform stype in parent block
        if ($item.closest('div.center_block').length) {
            $(document).find('div.center_block')
                .removeClass('center_block')
                .addClass('transform-edit-campaign-page');
        }

        if ($item[0].type === 'button' || $item.hasClass('chosen-container') || $item.css('color') === 'rgb(255, 255, 255)') {
            $item.addClass('content-hint-item-none-background');
        } else {
            $item.addClass('content-hint-item');
        }

        // scroll and animation
        scrollToItem($item);

        $item[0].addEventListener('click', takeMeHereMode);
    }
    function setHeaderHint($item, content) {
        var $parent = $('.main-header');
        var elementProperties = $item[0].getBoundingClientRect();
        var tooltipParam = {
            top: elementProperties.height + 20,
            right: $(document).width() - elementProperties.right,
            arrow: {
                top: '-20px',
                right: '5px',
                display: 'block',
                border: '10px solid transparent',
                borderBottom: '15px solid white'
            }
        };

        // set tooltip
        qsTooltip(tooltipParam, content);

        // apply style
        $parent.addClass('quick-start-hint-parent');

        // scroll and animation
        scrollToItem($item);
    }
    function initQuickStartHint(selector, content) {
        function init() {
            var $item;

            removeAllHints();

            $item = $(document).find(selector).first();

            if (!$item.length) {
                return;
            }
            if ($item.length > 1) {
                $item = $item.filter(function (i, element) {
                    return $(element).parents('.main-sidebar').length || $(element).parents('.content').length;
                });
            }

            // set background
            $('body').append(
                $('<div/>').attr('id', 'quick-start-background')
            );

            if ($item.parents('.main-sidebar').length) {
                setSidebarHint($item, content);
            } else if ($item.parents('.content').length) {
                setContentHint($item, content);
            } else {
                setHeaderHint($item, content);
            }

            $(document).off('lazyLoaderDone');
        }

        if (typeof loaders !== 'undefined') {
            if (loaders.lazy.progressStatus === 'done') {
                setTimeout(init.bind(this), 500);
            } else {
                $(document).on('lazyLoaderDone', init.bind(this));
            }
        } else {
            init();
        }
    }
    function initQuickStartEvents() {
        // don`t hidden after click
        $('ul#dropdown-support-block').click(function (e) {
            if (!$(e.target).hasClass('remote-support-btn')) {
                e.stopPropagation();
            }
        });
        // for expired time in support center
        $(document).on('click', '#dropdown-click', function () {
            uiHelper.applyPlugins();
        });
        // event for close quick start - esc
        $(document).keyup(function (e) {
            if (e.keyCode === 27) {
                removeAllHints();
                removeQuickStartStorageState(quickStartStorageTarget);
                removeQuickStartStorageState(quickStartComponentActive);
            }
        });
        // hidden or open quick start window after click to arrow
        $(document).on('click ', '#quickStartArrow', function () {
            var quickStartBlock = $('#quickStart');
            var quickStartDataState = quickStartBlock.attr('data-state');

            removeQuickStartStorageState('quick_start_step');

            $(this).removeClass(quickStartBlinkArrowClass);

            if (quickStartDataState === hiddenBlockState) {
                quickStartBlock.attr('data-state', showBlockState);
                setQuickStartStorageState(quickStartStorageKey, showBlockState);
            } else {
                quickStartBlock.attr('data-state', hiddenBlockState);
                setQuickStartStorageState(quickStartStorageKey, hiddenBlockState);
                $('#quickStartArrow').addClass(quickStartBlinkArrowClass);
            }
        });
        $('nav.navbar > .navbar-custom-menu a').click(function () {
            $('#quickStart').attr('data-state', hiddenBlockState);
        });

        $('.support-block-close-button').on('click', function () {
            $('li.dropdown.tasks-menu.support-center').removeClass('open');
        });
        // show block targets for step
        $(document).on('click', '.step', function () {
            var id = $(this).data('id');

            $('.step-container').each(function (index, elem) {
                $(elem).removeClass('active');
                $(elem).addClass('no-display');
            });

            $('.step').each(function (index, elem) {
                $(elem).removeClass('active');
            });

            $('#' + id).addClass('active').removeClass('no-display');

            $(this).addClass('active');

            if (!$(this).find('a').hasClass('disabled-step')) {
                setQuickStartStorageState(quickStartStepActiveItem, $(this).data('id'));
            }

        });
        // get quick start steps
        $(document).on('click', 'a.quick-start-hint', function () {
            var url = '/quickstart/step/steps-for-target';
            var targetId = $(this).attr('data-hint-href');
            var prefix = $(document).find('#quickStart').data('component');

            removeQuickStartStorageState(quickStartStorageTarget);
            if (targetId === '') {
                return false;
            }

            $.ajax({
                url: prefix + url,
                type: 'GET',
                data: { targetId: targetId },
                success: function (response) {
                    if (response.length && response.code !== 404) {
                        setQuickStartStorageState(quickStartStorageKey, hiddenBlockState);
                        setQuickStartStorageState(quickStartComponentActive, prefix);
                        $('#quickStart').attr('data-state', hiddenBlockState);
                        $('#quickStartArrow').addClass(quickStartBlinkArrowClass);

                        $(response).each(function (index, item) {
                            item.completed = false;
                        });

                        setQuickStartStorageState(quickStartStorageTarget, JSON.stringify(response));
                        takeMeHereMode();
                    }
                },
            });
        });
        // closing tooltip
        $(document).on('click', '.quick-start-tooltip-close', function () {
            removeAllHints();
            removeQuickStartStorageState(quickStartStorageTarget);
            removeQuickStartStorageState(quickStartComponentActive);
        });
        // change state block quick start
        $(document).on('click ', '#quickStartArrow', function () {
            var quickStartBlock = $('#quickStart');
            if (quickStartBlock.attr('data-state') === hiddenBlockState) {
                quickStartBlock.attr('data-state', hiddenBlockState);
            } else {
                quickStartBlock.attr('data-state', showBlockState);
            }
        });
        $(window).on('resize', function () {
            if ($(window).width() <= 767) {
                removeAllHints();
            }
        });
        // change user quickStartStatus in dropdown menu
        $('#quick-start-status').change(function () {
            var input = $('#quick-start-status');
            var checkedValue = input.attr('checked');

            var quickStartStatus = getQuickStartStatus(checkedValue);
            changeQuickStartStatus(quickStartStatus);
        });
        // pop up window
        $(document).on('click', '#quickStartClose', function () {
            bootbox.confirm({
                closeButton: false,
                message: 'Do you want to turn off the Quick Start or hide?',
                buttons: {
                    confirm: {
                        label: 'Turn off',
                        className: 'btn-primary',
                    },
                    cancel: {
                        label: 'Hide',
                        className: 'btn-default',
                    }
                },
                callback: function (result) {
                    if (result) {
                        changeQuickStartStatus(0);
                        removeQuickStartStorageState('quick_start_step');
                        removeQuickStartStorageState(quickStartComponentActive);
                        $('#quickStart').hide();
                        $('#quick-start-switch-block > div.offLabel').css('display', 'block');
                        $('#quick-start-switch-block > div.onLabel').css('display', 'none');
                        clearSteps();
                    } else {
                        removeQuickStartStorageState('quick_start_step');
                        removeQuickStartStorageState(quickStartComponentActive);
                        clearSteps();
                        $('#quickStart').attr('data-state', hiddenBlockState);
                        setQuickStartStorageState(quickStartStorageKey, hiddenBlockState);
                    }
                }
            });
        });

        // after switching the component,
        // delete the data of the previous component storage quick start
        $(document).on('click', '.component-switch-btn', function () {
            removeAllQuickStartStorageData();
        });

        // for profile setting page (quick start status enabled or disabled)
        $(document).on('submit', '#setting > div > #add-form', function () {
            var quickStartProfileStatus = $('#quickStartStatus option:selected').val();
            var lastQuickStartStorageState = getQuickStartStorageState('quick_start_state');
            removeQuickStartStorageState('quick_start_step');

            if (parseInt(quickStartProfileStatus, 10) === 1) {
                $('#quickStartArrow').addClass(quickStartBlinkArrowClass);
                if (lastQuickStartStorageState === 'show') {
                    $('#quickStartArrow').removeClass(quickStartBlinkArrowClass);
                }
                $('#quickStartStatus').attr('checked', 'checked');
                $('#quickStart').css('display', 'block');
                $('.enable-status').show();
                $('.disable-status').hide();
                setQuickStartStorageState(quickStartStorageKey, 'show');
            } else if (parseInt(quickStartProfileStatus, 10) === 0) {
                $('#quickStartStatus').removeAttr('checked');
                $('.disable-status').show();
                $('.enable-status').hide();
                $('#quickStart').css('display', 'none');
            }
        });
    }
    function updateQuickStart() {
        uiHelper.applyPlugins();
        uiHelper.applyLazyLoad();
        // check current component match with component in storage,
        // if not match, remove all quick start storage data
        checkComponent();
        showLastQuickStartBlockState();
        takeMeHereMode();
        removeAllHints();
    }
    function debounce(f, ms) {
        var isCooldown = false;
        return function () {
            if (isCooldown) {
                return;
            }
            f.apply(this, arguments);
            isCooldown = true;
            function setCooldown() {
                isCooldown = false;
            }
            setTimeout(setCooldown.bind(this), ms);
        };
    }
    updateQuickStartDelay = debounce(updateQuickStart, 1000);

    spApp.registerEvent('ready', document, function () {
        initQuickStartEvents();
        updateQuickStartDelay();
    });

    spApp.registerGlobalEvent('quickStart', document, updateQuickStartDelay);
}());
