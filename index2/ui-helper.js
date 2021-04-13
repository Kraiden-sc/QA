loaders.global.start();
loaders.ajax.start();

uiHelper         = {
    current_ls_version : '1.3',
    options            : {
        loader : {
            elementId       : "mainILoader",
            elementAjaxId   : "mainAjaxILoader",
            headerSelector  : ".main-header .logo .logo-lg",
            lazyLoadLoader  : '<div class="lazy-loader">' +
                              '<div class="lazy-loader-inner"> ' +
                              '<span> Data is loading</span>' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '</div>' +
                              '</div>',
            lazyLoadPrepare : '<div class="lazy-loader">' +
                              '<div class="lazy-loader-inner"> ' +
                              '<span> Data is prepairing</span>' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '<label>	●</label> ' +
                              '</div>' +
                              '</div>' +
                              '<div class="sk-cube-grid" id="prepareCube">' +
                              '<div class="sk-cube sk-cube1"></div>' +
                              '<div class="sk-cube sk-cube2"></div>' +
                              '<div class="sk-cube sk-cube3"></div>' +
                              '<div class="sk-cube sk-cube4"></div>' +
                              '<div class="sk-cube sk-cube5"></div>' +
                              '<div class="sk-cube sk-cube6"></div>' +
                              '<div class="sk-cube sk-cube7"></div>' +
                              '<div class="sk-cube sk-cube8"></div>' +
                              '<div class="sk-cube sk-cube9"></div>' +
                              '</div>'
        }
    },

    entityMap : {
        "&" : "&amp;",
        "<" : "&lt;",
        ">" : "&gt;",
        '"' : '&quot;',
        "'" : '&#39;',
        "/" : '&#x2F;'
    },

    snowIsOn : false,
    letItSnow: function(enable) {
        if (!document.querySelector('.letitsnow-button')) {
            return;
        }
        switch (enable) {
            case 1:
                var canvas = document.createElement('canvas');
                var particles = [];
                var canvas2dContext = canvas.getContext('2d');
                var canvasStyles = {
                    position: 'fixed',
                    background: 'transparent',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    userSelect: 'none',
                    pointerEvents: 'none'
                };

                canvas.id = 'letitsnow-canvas';
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                Object.assign(canvas.style, canvasStyles);

                document.querySelector('body').appendChild(canvas);

                var attributes = {
                    particleCount: 400,
                    particleSize: 3,
                    particleColor: '#fff'
                };

                var randomIntFromRange = function (min, max) {
                    return Math.floor(Math.random() * (max - min + 1) + min);
                };

                var Particle = function (x, y, radius, color, radians) {
                    this.x = x;
                    this.y = y;
                    this.radius = radius;
                    this.color = color;
                    this.radians = radians;
                    this.velocity = 0.003;

                    this.update = function () {
                        this.radians += this.velocity;
                        this.x = x + Math.cos(this.radians) * 400;
                        this.y = y + Math.tan(this.radians) * 600;

                        this.draw();
                    };

                    this.draw = function () {
                        canvas2dContext.beginPath();
                        canvas2dContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                        canvas2dContext.fillStyle = this.color;
                        canvas2dContext.fill();

                        canvas2dContext.closePath();
                    };
                };

                var init = function () {
                    for (let i = 0; i < attributes.particleCount; i++) {
                        particles.push(
                            new Particle(
                                Math.random() * canvas.width,
                                Math.random() * canvas.height,
                                randomIntFromRange(1, attributes.particleSize),
                                attributes.particleColor,
                                Math.random() * 80
                            )
                        );
                    }
                };

                var animate = function () {
                    requestAnimationFrame(animate);
                    canvas2dContext.clearRect(0, 0, canvas.width, canvas.height);

                    particles.forEach(function (particle) {
                        particle.update();
                    });
                };

                init();
                animate();

                setCookie('letitsnow', 1);
                this.snowIsOn = true;
                document.addEventListener('resize', function () {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    init();
                });
                break;
            case 0:
                var canvasElement = document.getElementById('letitsnow-canvas');
                if (canvasElement) {
                    canvasElement.remove();
                }
                setCookie('letitsnow', 0);
                this.snowIsOn = false;
                break;
            default:
                var currentState = getCookie('letitsnow');
                currentState = currentState == 1 ? 1 : 0;
                this.letItSnow(currentState);
        }
    },

    escapeHtml : function (string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return uiHelper.entityMap[s];
        });
    },

    size : function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    parse_url : function(url) {
        var parser = document.createElement('a');
        parser.href = url;

        return parser;
    },
    checkSession : true,
    checkSessionIterator : 0,
    checkSessionTimeout : function () {
        if (!uiHelper.checkSession) {
            return false;
        }
        var leftTime = (localStorage.getItem('__sessionTimeout') || 0) - (new Date().getTime()/1000 | 0);
        if (leftTime <= 0) {
            //location.href = '/';
            bootbox.hideAll();
            bootbox.alert("Your session has expired", function(){  if ((localStorage.getItem('__sessionTimeout') || 0) - (new Date().getTime()/1000 | 0) < 1) { location.href = '/auth/logout'; } else { location.reload(); } });
            return false;
        }
        var minTime = 300;
        var recheckTime = 60;
        if (leftTime <= minTime ) {
            recheckTime = 1;
            if ($('#sessionLeftTimeIndicator').length > 0) {
                $('#sessionLeftTimeIndicator').html(leftTime);
            } else {
                bootbox.alert("Your session will expire in <span id='sessionLeftTimeIndicator'>" + leftTime + "</span> seconds, click OK to extend your session",
                              function(){
                                  uiHelper.checkSession = false;
                                  $.ajax({'url': '/account/profile', 'complete' : function() {
                                          localStorage.setItem('__sessionTimeout', parseInt(new Date().getTime()/1000 | 0) + parseInt(localStorage.getItem('__sessionTimeoutMax') || 28800));
                                          uiHelper.checkSession = true;
                                          if (uiHelper.checkSessionIterator > 0) {
                                              clearTimeout(uiHelper.checkSessionIterator);
                                              uiHelper.checkSessionIterator = 0;
                                          }
                                          uiHelper.checkSessionIterator = setTimeout('uiHelper.checkSessionTimeout()', recheckTime * 1000)
                                      }});
                              }
                );
            }
        } else {
            if ($('#sessionLeftTimeIndicator').length > 0) {
                bootbox.hideAll();
            }
        }
        if (uiHelper.checkSessionIterator > 0) {
            clearTimeout(uiHelper.checkSessionIterator);
            uiHelper.checkSessionIterator = 0;
        }
        uiHelper.checkSessionIterator = setTimeout('uiHelper.checkSessionTimeout()', recheckTime * 1000)
    },

    merge_objects : function (obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }

        return obj3;
    },

    conditionalChange : function (element) {
        if ('checkbox' === $(element).attr('type')) {
            var newConditionalVal = $(element).is(':checked') ? $(element).val() : null;
        } else {
            var newConditionalVal = $(element).val();
        }
        $('[data-conditional-target=' + $(element).attr('data-conditional-element') + ']').each(function () {
            var visibleValues = $(this).attr('data-conditional-values') || '';
            visibleValues     = visibleValues.split(',');
            if ($(this).hasClass('ext-daterangepicker')) {
                var conditionalChange = $(this).parent().parent();
            } else if ($(this).parent().hasClass('form-group')) {
                var conditionalChange = $(this).parent();
            } else if ($(this).parent().hasClass('conditional-hide-upper')) {
                var conditionalChange = $(this).parent().parent();
            } else if ($(this).hasClass('icheck-input') || $(this).hasClass('chosen-applied')) {
                var conditionalChange = $(this).parents('.form-group').first();
            } else {
                var conditionalChange = $(this);
            }

            if (visibleValues.indexOf(newConditionalVal) >= 0) {
                $(conditionalChange).show();
                uiHelper.applyPlugins();
            } else {
                $(conditionalChange).hide();
            }
        });
    },

    formLoader : function (form) {
        loaders.form.start(form);
        return false;
    },

    removeFormLoader : function (form) {
        loaders.form.done(form);
        return false;
    },

    /**
     *
     * @param position - int or selector string
     * @param time - int value in ms
     * @param offset - int value in pixels
     * @param scrollTarget - string jquery selector or jquery object
     */
    scrollEasy : function (position, time, offset, scrollTarget) {

        var defaultScrollTarget = 'body,html';

        position     = position || 0;
        offset       = offset || 0;
        time         = time || 400;
        scrollTarget = scrollTarget || defaultScrollTarget;

        if (typeof position == 'string') {
            if ($(position + ':first').length > 0) {
                position = $(position + ':first').offset().top;
            } else {
                return false;
            }
        } else if (typeof position == 'object' && $(position).filter(':first').length > 0) {
            if (scrollTarget == defaultScrollTarget) {
                position = $(position).filter(':first').offset().top;
            } else {
                position = $(position).filter(':first').offset().top - $(scrollTarget).offset().top;
            }
        }

        position += offset;

        $(scrollTarget).animate({
            scrollTop : position
        }, time);
    },

    setPreserveScroll : function (formId) {
        setCookie('ui-preserve-scroll', $(document).scrollTop(), 120);
        setCookie('ui-preserve-scroll-formId', formId);
    },

    applyIcheck : function (selector) {
        selector = selector || false;
        if (selector === false) {
            $('input[type=checkbox]:not(.iCheck-applied):not(.ext-switch):not(.icheckNotNeeded), input[type=radio]:not(.iCheck-applied):not(.ext-switch):not(.icheckNotNeeded)')
                .icheck({checkboxClass : 'icheckbox_square-blue', radioClass : 'iradio_square-blue'})
                .addClass('iCheck-applied');
        } else {
            $(selector).find('input[type=checkbox]:not(.iCheck-applied):not(.ext-switch):not(.icheckNotNeeded), input[type=radio]:not(.iCheck-applied):not(.ext-switch):not(.icheckNotNeeded)')
                .icheck({checkboxClass : 'icheckbox_square-blue', radioClass : 'iradio_square-blue'})
                .addClass('iCheck-applied');
        }
    },

    displayHowToUse : function () {
        var isNotSameHowToUse = setPrefix4HowToUse();
        if (isNotSameHowToUse) {
            checkHowToUse();
        }
    },

    applyChosen : function () {
        $('select:not(.multiselect):not(.chosen-applied)[icon-select]:visible')
            .chosenIcon({
                disable_search_threshold : $(this).data('disableSearchThreshold') || 10,
                allow_single_deselect    : true,
                search_contains          : true,
                width                    : "100%"
            })
            .addClass('chosen-applied');
        $('select:not(.multiselect):not(.chosen-applied):visible')
            .each(function() {
                if(0 < $(this).closest('.daterangepicker').length) {
                    return; // Doesn't apply chosen for datepicker's select
                }
                $(this).chosen({
                    disable_search_threshold : $(this).data('disableSearchThreshold') || 10,
                    allow_single_deselect : (((typeof $(this).data('allowsingledeselect') !== 'undefined') ? $(this).data('allowsingledeselect') : 1) == '0' ? false : true),
                    search_contains : true,
                    width : $(this).parents('.form-inline').length == 0 ? "100%" : null
                })
                .addClass('chosen-applied')
            });
        if ($('select.multiselect').length > 0) {
            if (typeof $.fn.multiselect == 'undefined') {
                $.getScript('/skin/admin/plugins/bootstrap.multiselect/js/bootstrap-multiselect.js', function () {
                    $('<link/>', {
                        rel  : 'stylesheet',
                        type : 'text/css',
                        href : '/skin/admin/plugins/bootstrap.multiselect/css/bootstrap-multiselect.css'
                    }).appendTo('head');
                    uiHelper.setMultiSelect();
                });
            } else {
                uiHelper.setMultiSelect();
            }
        }
        $('.chosen-container').on('click', function (e) {
            var f = $(this).find('.chosen-drop');
            var w = $(window);
            if (f.length > 0) {
                var bottomVis = w.scrollTop() + w.height() > f.offset().top + f.height(); // виден ли низ блока
                if (bottomVis === false) {
                    f.css('bottom', '100%');
                    f.css('top', 'inherit');
                }
            }
        });
    },

    setMultiSelect : function () {
        $('select.multiselect.tableFieldFilter-select:not(.multiselect-applied)')
            .multiselect({buttonClass : 'btn btn-default btn-sm', nonSelectedText : 'All', numberDisplayed : 1})
            .addClass('multiselect-applied')
        ;
        $('select.multiselect:not(.multiselect-applied)').each(function () {
            $(this).find('option[value=""]').remove();
            var msOptions = {
                nonSelectedText : $(this).attr('data-placeholder') || 'All',
                numberDisplayed : $(this).attr('data-numberDisplayed') || 1
            };
            if ($(this).hasClass('form-control')) {
                msOptions.buttonClass     = 'form-control';
                msOptions.buttonWidth     = '100%';
                msOptions.buttonContainer = '<div class="btn-group multi-select-group" style="width: 100%;" />';
            }
            $(this)
                .multiselect(msOptions)
                .addClass('multiselect-applied')
                .promise()
                .done(function () {
                          uiHelper.applyIcheck($(this).next());
                      });
        });
        if ($('.tableFieldFilter-container .btn-group').length > 0) {
            var buttonOffset = $('.tableFieldFilter-container .btn-group').offset();
            var footerOffset = $('.main-footer').offset();
            var diffOffset   = footerOffset.top - buttonOffset.top;
            var menu         = $('.tableFieldFilter-container').find('.multiselect-container');
            var menuHeight   = $('.tableFieldFilter-container').find('.multiselect-container').height();
            if (diffOffset < menuHeight) {
                var newHeight = (diffOffset * 0.7).toFixed();
                menu.css({'height' : newHeight, 'overflow-y' : 'scroll'});
            }

        }
    },

    loadDatepickerFiles : function (callback) {
        callback = callback || false;
        if (typeof $.fn.daterangepicker != 'undefined') {
            if (typeof callback === 'function') {
                callback();
            }
            return true;
        }
        $.getScript('/skin/admin/plugins/daterangepicker/moment.min.js', function () {
            $.getScript('/skin/admin/plugins/daterangepicker/moment-timezone-with-data-2020.js', function () {
                if (typeof(___projectTimeZone) != "undefined")
                    moment.tz.setDefault(___projectTimeZone);

                $.getScript('/skin/admin/plugins/daterangepicker/daterangepicker.js', function () {
                    $('<link/>', {
                        rel  : 'stylesheet',
                        type : 'text/css',
                        href : '/skin/admin/plugins/daterangepicker/daterangepicker.css'
                    }).appendTo('head');
                    if (typeof callback === 'function') {
                        callback();
                    }
                })
            });
        });
    },

    applyDatepicker : function () {

        if ($('.ext-daterangepicker:not(.daterangepicker-applied), .ext-datepicker:not(.datepicker-applied)').length == 0) {
            return false;
        }

        if (typeof $.fn.daterangepicker == 'undefined') {
            uiHelper.loadDatepickerFiles(function() { uiHelper.setDatepicker(); });
        } else {
            uiHelper.setDatepicker();
        }
    },

    setDatepicker : function () {
        var anyTimeStart    = new Date(2000, 0, 2, 0, 0, 0, 0);
        var dayStartTime    = {hour: 0, minute: 0, seconds: 0};
        var dayEndTime      = {hour: 23, minute: 59, seconds: 59};
        var last6MonthStart = moment(dayStartTime).add(-6, 'month');
        var defaultStart    = last6MonthStart;

        $('.ext-daterangepicker:not(.daterangepicker-applied)');
        $('.ext-daterangepicker:not(.daterangepicker-applied)').each(function () {

            var dateRanges = {
                'Last 6 month' : [
                    last6MonthStart,
                    moment(dayEndTime)
                ],
                'Today'        : [
                    moment(dayStartTime),
                    moment(dayEndTime)
                ],
                'Yesterday'    : [
                    moment(dayStartTime).subtract(1, 'days'),
                    moment(dayEndTime).subtract(1, 'days')
                ],
                'This Week'    : [
                    moment().startOf('isoweek'),
                    moment().endOf('isoweek')
                ],
                'Last Week'    : [
                    moment().startOf('isoweek').subtract(7, 'days'),
                    moment().endOf('isoweek').subtract(7, 'days')
                ],
                'This Month'   : [
                    moment().startOf('month'),
                    moment(dayEndTime)
                ],
                'Last Month'   : [
                    moment().subtract(1, 'month').startOf('month'),
                    moment().subtract(1, 'month').endOf('month')
                ]
            };

            if($(this).data('limit') != null ) {

                var limit = moment($(this).data('limit'));

                var newDateRanges = {};
                var limitMonth = parseInt($(this).data('limit-month'), 10);
                if (!isNaN(limitMonth) && limitMonth !== 6) {
                    var newDateKey = 'Last ' + limitMonth + ' month';
                    var newDateValue = [
                        moment(dayStartTime).add(-limitMonth, 'month'),
                        moment(dayEndTime)
                    ];
                    newDateRanges[newDateKey] = newDateValue;
                }

                var limitDays = !isNaN(limitMonth)
                    ? limitMonth * 31
                    : moment().diff(limit, 'days');

                for (var key in dateRanges) {
                    var rangeDays = dateRanges[key][1].diff(dateRanges[key][0], 'days');
                    if (rangeDays > limitDays) {
                        continue;
                    }
                    newDateRanges[key] = dateRanges[key];
                }

                dateRanges = newDateRanges;
            }

            if ($(this).hasClass('any-time')) {
                defaultStart = anyTimeStart;
                dateRanges   = uiHelper.merge_objects({
                    'Any time' : [
                        anyTimeStart,
                        moment(dayEndTime).add(1, 'days')
                    ]
                }, dateRanges);
            }
            var daterangepickerOptions = {
                "autoApply" : true,
                ranges      : dateRanges,
                timePicker  : ($(this).attr('data-timePicker') || false) == '1',
                timePicker24Hour : true,
                timePickerSeconds : true,
                locale      : {
                    format : ___projectDateFormat + (($(this).attr('data-timePicker') || false) == '1' ? ' HH:mm:ss' : '')
                }
            };

            if ($(this).val() == '') {
                daterangepickerOptions.startDate = defaultStart;
                daterangepickerOptions.endDate   = moment(dayEndTime).add(1, 'days');
            }
            $(this).daterangepicker(daterangepickerOptions).addClass('daterangepicker-applied');

            // start handling endDate time
            var defaultEndTime = $.extend({}, dayEndTime);

            var handleChangeEndDate = function(e) {
                var picker = e.data;
                var endDate = $.extend({}, picker.endDate);
                var $target = $(e.target);
                if (!Object.keys(endDate).length) return;
                // save selected time for future "showCalendar.daterangepicker" evens
                defaultEndTime.hour = endDate.hours();
                defaultEndTime.minute = endDate.minutes();
                defaultEndTime.seconds = endDate.seconds();
            }

            var handleClickCalendar = function(e) {
                var picker = e.data;
                var endDate = $.extend({}, picker.endDate);
                var isDayButton = !isNaN(parseInt(e.target.innerText, 10));

                if (!isDayButton || !Object.keys(endDate).length) return;

                var $container = picker.container;
                var $endHour = $container.find('.calendar.right .hourselect');
                var $endMinute = $container.find('.calendar.right .minuteselect');
                var $endSecond = $container.find('.calendar.right .secondselect');
                var $endField = $container.find('[name="daterangepicker_end"]');
                var endFieldVal = $container.find('[name="daterangepicker_end"]').val();
                var hh = defaultEndTime.hour;
                var mm = defaultEndTime.minute;
                var ss = defaultEndTime.seconds;
                var hhStr = ('0' + hh).slice(-2);
                var mmStr = ('0' + mm).slice(-2);
                var ssStr = ('0' + ss).slice(-2);
                var endTimeStr = hhStr + ':' + mmStr + ':' + ssStr;
                var timeRegex = /([0-9]{2}):([0-9]{2}):([0-9]{2})$/g;

                // change only vals immediately
                // because plugin will change with delay
                $endField.val(endFieldVal.replace(timeRegex, endTimeStr));
                $endHour.val(hh);
                $endMinute.val(mm);
                $endSecond.val(ss);

                // reassign plugin endDate with the preselected time before
                endDate.hour(hh).minute(mm).second(ss);
                picker.setEndDate(endDate);
            };

            $(this).on('showCalendar.daterangepicker', function(ev, picker) {
                var $container = picker.container;
                var $rightCalendar = $container.find('.calendar.right');

                $container.off('click', handleClickCalendar);
                $container.on('click', picker, handleClickCalendar);

                $rightCalendar.off('change', handleChangeEndDate);
                $rightCalendar.on('change', picker, handleChangeEndDate);
            });

            $(this).on('hideCalendar.daterangepicker', function(ev, picker) {
                var $container = picker.container;
                var $rightCalendar = $container.find('.calendar.right');
                $container.off('click', handleClickCalendar);
                $rightCalendar.off('change', handleChangeEndDate);
                // reset defaultEndTime
                defaultEndTime = $.extend({}, dayEndTime);
            });
            // end handling endDate time
        });

        $('.ext-datepicker:not(.datepicker-applied)').each(function () {
            var currentDate = new Date();
            currentDate.setFullYear(currentDate.getFullYear()+5);
            var datepickerOptions             = {
                singleDatePicker : true,
                showDropdowns    : true,
                locale           : {},
                maxDate          : currentDate,
            };
            var tmp;
            tmp                               = $(this).attr('data-autoUpdateInput');
            datepickerOptions.autoUpdateInput = (typeof tmp == 'undefined' ? true : (tmp == '1'));
            tmp                               = $(this).attr('data-autoApply');
            datepickerOptions.autoApply       = (typeof tmp == 'undefined' ? true : (tmp == '1'));
            tmp                               = $(this).attr('data-cancelLabel');
            cancelLabel                       = (typeof tmp == 'undefined' ? false : tmp);
            if (cancelLabel !== false) {
                datepickerOptions.locale.cancelLabel = cancelLabel;
            }
            tmp                          = $(this).attr('data-timePicker');
            datepickerOptions.timePicker = (typeof tmp == 'undefined' ? false : (tmp == '1'));
            if (datepickerOptions.timePicker) {
                datepickerOptions.locale.format = ___projectDateFormat + ' HH:mm:00';
            }
            $(this).daterangepicker(datepickerOptions).addClass('datepicker-applied');
        });

        $('.ext-daterangepicker').each(function () {
            if ($(this).hasClass('daterangepicker-empty')) {
                if (!$(this).attr('value')) {
                    $(this).val('');
                }
            }
        });
    },

    applySwitch : function () {

        if ($('.ext-switch:not(.switch-applied)').length == 0) {
            return false;
        }

        if (typeof $.fn.bootstrapSwitch == 'undefined') {
            $.getScript('/skin/admin/plugins/bootstrap-switch/bootstrap-switch.min.js', function () {
                $('<link/>', {
                    rel  : 'stylesheet',
                    type : 'text/css',
                    href : '/skin/admin/plugins/bootstrap-switch/bootstrap-switch.min.css'
                }).appendTo('head');
                setTimeout("uiHelper.setSwitch();", 600);
            });
        } else {
            setTimeout("uiHelper.setSwitch();", 600);
        }
    },

    setSwitch : function () {
        $('.ext-switch:not(.switch-applied)')
            .bootstrapSwitch({
                'onColor'    : 'success',
                'offColor'   : 'danger',
                'labelWidth' : 0,
                'inverse'    : true,
                'labelText'  : '',
                'size'       : 'small'
            })
            .addClass('switch-applied')
        ;
    },

    applyTooltip : function () {
        $('[data-title]:not(.tooltip-applied)').tooltip({container : 'body', trigger : 'hover'}).addClass('tooltip-applied');
    },

    // applyMenuHeight : function () {
    //     setTimeout(function () {
    //         if ($('body>div.wrapper').height() != $('body>div.wrapper>aside.main-sidebar').height()) {
    //             $('body>div.wrapper>aside.main-sidebar').css('height', $('body>div.wrapper').height() + 'px');
    //         }
    //     }, 100);
    // },

    applyPlugins : function (callBack) {
        var callBack = callBack || false;
        uiHelper.applyLazyLoad();
        uiHelper.applyDatepicker();
        uiHelper.applyIcheck();
        uiHelper.applySwitch();
        uiHelper.addTableSearch();
        uiHelper.applyTabClicks();
        uiHelper.addTableFieldFilter();
        uiHelper.addTableRowCounter();
        uiHelper.applyChosen();
        uiHelper.addTableExport();
        uiHelper.applyTooltip();
        uiHelper.doubleScroll();
        scriptWaitRunner({
                             conditionToRun : function () { return typeof tDataHiderApply !== 'undefined'; },
                             scriptToRun    : function () { tDataHiderApply(); },
                             runnerName     : 'tDataHiderApply',
                             maxRetries     : 15,
                         });
        // uiHelper.applyMenuHeight();
        if (callBack) {
            eval(callBack);
        }
    },

    updateRelatedContent: function() {
        $('.update-content-header-title').each(function() {
            var text = $(this).val();
            $('#content-header-title').text(text).attr('data-original-title', text).tooltip('fixTitle');
        });
    },

    setLazyLoadPreloader : function (selector) {
        selector = selector || '';
        if (selector == '') {
            $('.lazzyLoad:visible:not(.lazyLoaded):not(.lazy-loader-applied)').each(function () {
                loaders.lazy.start($(this));
            });
        } else {
            $(selector).each(function () {
                loaders.lazy.start($(this));
            });
        }
    },
    doLazyLoad : function (_url, content_box, lazyLoadIndex, withoutLoader) {
        $.ajax({
                   url        : _url,
                   beforeSend : function (data) {
                       if (!withoutLoader) {
                           uiHelper.setLazyLoadPreloader();
                       }
                   },
                   success    : function (data) {
                       var target = $(content_box).data('targetElement');

                       if (target) {
                           data = $(data).find(target).html();
                       }

                       content_box.addClass('lazyLoaded').removeClass('lazyLoading');

                       if (withoutLoader) {
                           content_box.html(data);
                       } else {
                           content_box.append(data);
                       }
                       //content_box.append('<div class="preparing_data">' + uiHelper.options.loader.lazyLoadPrepare + '</div>');
                       /*$.when( uiHelper.applyPlugins() ).then(function() {
                        content_box.find('.result_box').show();
                        });*/
                   },
                   complete   : function (data) {
                       var waitTime = $(content_box).attr('data-lazy-wait') || 0;
                       waitTime = parseInt(waitTime);
                       if (waitTime > 0) {
                           setTimeout(
                               function () {
                                   if (!withoutLoader) {
                                       loaders.lazy.done(content_box);
                                   }
                                   uiHelper.applyPlugins();
                                   /*uiHelper.applyPlugins("lazyContentBoxes[" + lazyLoadIndex + "].find(\'.preparing_data\').remove();");*/
                               },
                               waitTime);
                       } else {
                           if (!withoutLoader) {
                               loaders.lazy.done(content_box);
                           }
                           uiHelper.applyPlugins();
                           /*uiHelper.applyPlugins("lazyContentBoxes[" + lazyLoadIndex + "].find(\'.preparing_data\').remove();");*/
                       }
                       if (content_box.attr('angular-app')) {
                           // Get the $compile service from the app's injector
                           var injector = $('[ng-app]').injector();
                           var $compile = injector.get('$compile');

                           // Compile the HTML into a linking function...
                           var linkFn = $compile(data.responseText);
                           // ...and link it to the scope we're interested in.
                           // Here we'll use the $rootScope.
                           var $rootScope = injector.get('$rootScope');
                           var elem       = linkFn($rootScope);
                           content_box.html(elem);

                           // Now that the content has been compiled, linked,
                           // and added to the DOM, we must trigger a digest cycle
                           // on the scope we used in order to update bindings.
                           $rootScope.$digest();
                       }

                       var callbackFn = content_box.attr('callback');
                       if (callbackFn) {
                           callbackFn = window[callbackFn];
                           if (typeof callbackFn === 'function') {
                               callbackFn();
                           }
                       }
                       var activeTab = content_box.find('.tab-pane');
                       if (activeTab.length > 0) {
                           uiHelper.displayHowToUse();
                       }
                   },
                   error      : function (response, status, xhr) {
                       var errorMessage = '<div class="alert alert-danger">Error</div>';
                       switch (response.status) {
                           case 403:
                               errorMessage = '<div class="alert alert-warning">You do not have permission to do this</div>';
                               break;
                           case 428:
                               errorMessage = '<div class="alert alert-warning">Contact Phonexa Tech Team</div>';
                               break;
                           default:
                               break;
                       }
                       if (withoutLoader) {
                           content_box.html(errorMessage);
                       } else {
                           content_box.append(errorMessage);
                       }
                       content_box.addClass('lazyLoaded').removeClass('lazyLoading');
                   }
               });
    },

    createUrlWithComponentPrefix : function(url) {
        if (url.search(/((^|\/)p\d{1,2}(\/|$))/gi) < 0) {
            var tmpUrl = uiHelper.parse_url(url);
            tmpUrl.pathname = (__currentComponentPrefix || '/') + tmpUrl.pathname;
            tmpUrl.pathname = tmpUrl.pathname.replace('//', '/');

            url = tmpUrl.href;
        }

        return url;
    },
    setLazyLoad : function () {
        var requests = Math.max(1, 4 - $.active);
        $(".lazzyLoad:visible:not(.lazyLoaded):not(.lazyLoading)").slice(0, requests).each(function () {
            $(this).addClass('lazyLoading');
            var content_box                 = $(this);
            var lazyLoadIndex               = uiHelper.size(lazyContentBoxes);
            lazyContentBoxes[lazyLoadIndex] = content_box;

            var _url = $(this).attr('data-url');
            _url += (_url.split('?')[1] ? '&' : '?');
            _url = uiHelper.createUrlWithComponentPrefix(_url);

            var delayBeforeLoad = $(content_box).attr('data-lazy-delay') || 0;
            delayBeforeLoad = parseInt(delayBeforeLoad);

            if (delayBeforeLoad > 0) {
                setTimeout(
                    function() {
                        uiHelper.doLazyLoad(_url, content_box, lazyLoadIndex);
                    },
                    delayBeforeLoad
                );
            } else {
                uiHelper.doLazyLoad(_url, content_box, lazyLoadIndex);
            }
        });
    },

    resetDoubleScroll : function () {
        if($('#modalPopup').is(':hidden')){
            $('.stickToTop:visible').each(function () {
                var $this = $(this);
                var $parent = $this.closest('table');
                $this.removeAttr('data-stickToTop-init');
                $this.removeAttr('data-stickToTop-offsetTop');
                $this.removeAttr('data-sticktotop-init-width');
                $this.removeAttr('data-sticktotop-init-height');
                $this.removeAttr('data-sticktotop-init-real-height');
                $this.removeAttr('data-window-innerWidth');
                $this.removeAttr('style');
                $parent.removeAttr('style');
                $parent.find('td, th, .stickToTop').removeAttr('style');
            });
        }
        $second_scroll = $('.second_scroll');
        $second_scroll.removeAttr('data-sticktotop-init');
        $second_scroll.removeAttr('data-sticktotop-init-width');
        $second_scroll.removeAttr('data-sticktotop-init-height');
        $second_scroll.removeAttr('data-sticktotop-init-real-height');
        $second_scroll.removeAttr('data-sticktotop-offsettop');
        $second_scroll.removeAttr('style');
        $('.second_scroll.stickToTop-phantom').css({visibility: 'hidden'});

        uiHelper.setDoubleScroll('update');
    },

    applyLazyLoad : function (timeout) {
        //uiHelper.setLazyLoadPreloader();
        var min = 20;
        var max = 60;

        timeout = timeout || uiHelper.getRandomInt(min, max);
        if (timeout > 0) {
            setTimeout(uiHelper.setLazyLoad(), timeout);
        } else {
            uiHelper.setLazyLoad();
        }
    },

    appendToTable : function (table, strToAdd) {
        if ($(table).parent().prev().find('.box-tools').length > 0) {
            var toAdd = $(table).parent().prev().find('.box-tools');
            $(strToAdd).appendTo(toAdd);
        } else if ($(table).parent().prev().hasClass('box-header')) {
            toAdd = $(table).parent().prev();
            $(strToAdd).appendTo(toAdd).wrap('<div class="box-tools table-box-tools"></div>');
        }
        else {
            $(strToAdd)
                .insertBefore($(table).parent())
                .wrap('<div class="box-header"><div class="box-tools table-box-tools"></div></div>');

            //$(strToAdd).insertBefore($(table));
        }
    },

    isScrollExist : function (element, direction) {
        if (direction == 'vertical') {
            return element.get(0).scrollHeight > element.innerHeight();
        }
        else if (direction == 'horizontal') {
            return element.get(0).scrollWidth > element.innerWidth();
        }
        return false;
    },

    doubleScroll : function (action, timeout) {
        var min = 20;
        var max = 60;

        timeout = timeout || uiHelper.getRandomInt(min, max);
        if (timeout > 0) {
            setTimeout(uiHelper.setDoubleScroll(action), timeout);
        } else {
            uiHelper.setDoubleScroll(action);
        }
    },

    setDoubleScroll : function(action) {
        $('div.table-responsive, div.do-double-scroll').not('.table-dscroll-applied').each(function () {
            if (uiHelper.isScrollExist($(this), 'horizontal')) {
                var setOffset = $(this).attr('data-second-scroll-offsetTop') ||
                    $(this).find('.stickToTop').attr('data-sticktotop-init-real-height') || 30;
                if ($(this).hasClass('do-double-scroll')) {
                    var dataStickParent = $(this).attr('id') || '';
                    $(this)
                        .find(':first')
                        .before(
                            '<div class="second_scroll stickToTop" '
                            + (dataStickParent == '' ? '' : ' data-stick-parent = "#' + dataStickParent + '"')
                            + ' data-stickToTop-offsetTop="' + setOffset + 'px"><div class="top_scroll"></div></div>'
                        );
                } else {
                    var offset = $(this).find('thead').attr('data-stickToTop-offsetTop') || '30px';

                    $(this).before('<div class="second_scroll stickToTop" data-stickToTop-offsetTop="'+offset+'"><div class="top_scroll"></div></div>');
                }
                $(this).addClass('table-dscroll-applied');
                if ($(this).hasClass('do-double-scroll')) {
                    var scrollT = $(this).find(">.second_scroll");
                } else {
                    var scrollT = $(this).prev(".second_scroll");
                }
                if ($(this).hasClass('stickToTop-phantom')) {
                    scrollT = $(scrollT).prev('.second_scroll')
                }
                var scrollB = $(this);
                scrollB.scroll(function () {
                    scrollT.scrollLeft(scrollB.scrollLeft());
                });
                scrollT.scroll(function () {
                    scrollB.scrollLeft(scrollT.scrollLeft());
                    $(scrollT).next().find('>table thead.stickToTop').scroll();
                });
                var that    = this;
                setTimeout(function () {
                    if ($(that).hasClass('do-double-scroll')) {
                        scrollT.find('.top_scroll').css('width', $(that).prop('scrollWidth') + 'px')
                    } else {
                        scrollT.find('.top_scroll').css('width', $(that).find('table.table').width())
                    }
                }, 800);
            }
        });
        if (action == 'update') {
            $('div.table-dscroll-applied').each(function () {
                if ($(this).hasClass('do-double-scroll')) {
                    $(this).find('>.second_scroll').find('.top_scroll').css('width', $(this).prop('scrollWidth') + 'px');
                } else {
                    $(this).prev('.second_scroll').find('.top_scroll').css('width', $(this).find('table.table').width());
                }
            });
        }
    },

    getNeededTable : function (cElement) {
        var $table;
        if ($(cElement).parent().parent().hasClass('box-tools')) {
            //table = $(cElement).parent().parent().parent().next().find('table');
            $table = $(cElement).parent().parent().parent().nextAll('.box-body').find('table');
        } else {
            $table = $(cElement).parent().nextAll('table');
        }
        return $table;
    },

    addTableFieldFilter : function (action, multis) {
        /*
        multis         = typeof(multis) !== 'undefined' ? multis : false;
        var ls_version = localStorage.getItem('ls_version');
        if (ls_version != uiHelper.current_ls_version) {
            localStorage.clear();
            localStorage.setItem('ls_version', uiHelper.current_ls_version);
        }
        $('table.table:not(.disableTableFieldFilter)').each(function (idx, table) {
            var tableIndex = $(table).index('table.table:not(.disableTableFieldFilter)');
            var tableHeads = $(table).children('thead').children('tr').children('th');


            var tableRows   = [];
            var urlpart     = uiHelper.getUrlForFilter();
            var cUrlPreffix = location.href.split('?')[0];

            $.each(urlpart, function (iu) {
                var parsedCols = [];
                var storageKey = cUrlPreffix + 'filter_' + urlpart[iu] + '_' + tableIndex;
                var clearStorage = false;
                if ((storageFilter = localStorage.getItem(storageKey)) && action != 'update') {
                    tableRows = JSON.parse(storageFilter);

                    if (tableRows.length != tableHeads.length) {
                        localStorage.removeItem(storageKey);
                        uiHelper.addTableFieldFilter();
                        clearStorage = true;
                    } else {
                        for (var i = 0; i < tableRows.length; i++) {
                            tableRows[i].name = tableHeads.eq(i).text().trim()
                            if (tableRows[i].visible)
                                parsedCols.push(i.toString());
                        }
                        uiHelper.hideTableColumns(table, parsedCols);
                        return false;
                    }
                } else {
                    clearStorage = true;
                }
                if (clearStorage) {
                    var upd = false;
                    tableHeads.each(function () {
                        visual = $(this).css('display') == 'none' ? false : true;
                        if (typeof $(this).attr('data-def-visible') != "undefined" && action != "update") {
                            visual = $(this).attr('data-def-visible') == 'no' ? false : true;
                            upd = true;
                        }
                        tableRows.push({name : $(this).text().trim(), visible : visual});
                    });
                    localStorage.setItem(storageKey, JSON.stringify(tableRows));
                    //update multiselect
                    if (multis) {
                        for (var i = 0; i < tableRows.length; i++) {
                            if (tableRows[i].visible) {
                                $('select.multiselect.tableFieldFilter-select option[value="' + i + '"]').attr('selected', true);
                            } else {
                                $('select.multiselect.tableFieldFilter-select option[value="' + i + '"]').attr('selected', false);
                            }
                        }
                        $('select.multiselect.tableFieldFilter-select').change().trigger('change');
                    }
                    if (upd) {
                        setTimeout(function() { $('select.multiselect.tableFieldFilter-select').change().trigger('change'); }, 300);
                    }
                    return false;
                }
            });

            if ($(table).hasClass('tableFieldFilter-applied')) {
                return true;
            }
            var strToAdd = "<div class='tableFieldFilter-container form-group' onclick='uiHelper.applyIcheck($(this))'><select multiple data-display-selected-options='false' class='tableFieldFilter-select multiselect'>";
            for (var i = 0; i < tableRows.length; i++) {
                var tdName = tableRows[i].name || 'Col #' + (i + 1);
                strToAdd += "<option value='" + i + "' " + (tableRows[i].visible ? 'selected' : '') + ">" + uiHelper.escapeHtml(tdName) + "</option>";
            }
            strToAdd += "</select></div>";
            uiHelper.appendToTable(table, strToAdd);

            $(table).addClass('tableFieldFilter-applied').attr('data-tableFieldFilter-id', tableIndex);
        });*/
    },
    hideTableColumns    : function (table, val) {
        var footerCols     = {};
        var cc             = 0;
        $(table).children('tfoot').children('tr').children('td').each(function (i) {
            if ($(this).attr('data-colspan-orig') === undefined) {
                $(this).attr('data-colspan-orig', ($(this).attr('colspan') || 1))
            }
            var colspan = $(this).attr('data-colspan-orig');
            var ccStr   = 'c_' + i;
            if (typeof footerCols[ccStr] == 'undefined') {
                footerCols[ccStr] = {};
            }
            for (var z = 0; z < colspan; z++) {
                footerCols[ccStr][cc] = cc;
                cc++;
            }
        });
        var footerColsOrig = footerCols;

        for (var i = 0; i < $(table).children('thead').children('tr').children('th').length; i++) {
            if ($.inArray("" + i, val) < 0) {
                $(table).children('tbody').children('tr').children(':nth-child(' + (i + 1) + ')').hide();
                $(table).children('thead').children('tr').children(':nth-child(' + (i + 1) + ')').hide();
                //$(table).children('tfoot').children('tr').children(':nth-child(' + (i+1) + ')').hide();
                $.each(footerColsOrig, function (z) {
                    if (typeof footerCols["" + z]["" + i] != 'undefined') {
                        delete footerCols["" + z]["" + i];
                    }
                });
            } else {
                $(table).children('tbody').children('tr').children(':nth-child(' + (i + 1) + ')').show();
                $(table).children('thead').children('tr').children(':nth-child(' + (i + 1) + ')').show();
                //$(table).children('tfoot').children('tr').children(':nth-child(' + (i+1) + ')').show();
            }
        }
        var i = 0;
        $.each(footerColsOrig, function (z) {
            var colspan = uiHelper.size(footerCols["" + z]);
            if (colspan > 0) {
                $(table).children('tfoot').children('tr').children(':nth-child(' + (i + 1) + ')').show().attr('colspan', colspan);
            } else {
                $(table).children('tfoot').children('tr').children(':nth-child(' + (i + 1) + ')').hide();
            }
            i++;
        });
    },

    addTableSearch : function () {
        $('table.table:not(.disableFastSearch):not(tableSearch-applied)').each(function (idx, table) {
            if ($(table).hasClass('tableSearch-applied')) {
                return true;
            }
            if (typeof window.tableSearchTableFields == 'undefined') {
                window.tableSearchTableFields = {};
            }
            if (typeof window.tableExcludeSearchTableFields == 'undefined') {
                window.tableExcludeSearchTableFields = {};
            }
            var tableIndex                            = $(table).index('table.table:not(.disableFastSearch)');
            window.tableSearchTableFields[tableIndex] = false;
            var searchFields                          = $(table).attr('data-tableSearchFields') || false;
            var excludeSearchFields                   = $(table).attr('data-tableExcludeSearchFields') || false;
            if (searchFields !== false) {
                window.tableSearchTableFields[tableIndex] = searchFields.split('|');
                $.each(window.tableSearchTableFields[tableIndex], function (idx, val) {
                    window.tableSearchTableFields[tableIndex][idx] = parseInt(val);
                });
            }
            if (excludeSearchFields !== false) {
                window.tableExcludeSearchTableFields[tableIndex] = excludeSearchFields.split('|');
                $.each(window.tableExcludeSearchTableFields[tableIndex], function (idx, val) {
                    window.tableExcludeSearchTableFields[tableIndex][idx] = parseInt(val);
                });
            }
            $(table).addClass('tableSearch-applied').attr('data-tableSearch-id', tableIndex);
            var strToAdd                              =
                    "<div class='tableSearch-container form-group'>" +
                    "<label class='tableSearch-label control-label'>" +
                    ($(this).attr('data-searchLabel') || 'Filter: ') +
                    "</label>" +
                    "<input class='tableSearch-input form-control' type='text'>" +
                    "</div>";

            uiHelper.appendToTable(table, strToAdd);
        });
    },
    initValTableRowCounter : '',
    checkIfShowingEntries : function (table) {
        if ($(table).closest('.box').find('.box-footer .total-center').length > 0) {
            uiHelper.initValTableRowCounter = $(table).closest('.box').find('.box-footer .total-center').slice(0, 1).html();
            return true;
        } else {
            return false;
        }
    },
    addCounterTableFooter : function (table, content) {
        var tableBox = $(table).closest('.box');
        var tableHeader = tableBox.find('.box-header');
        var tableBody = tableBox.find('.box-body');
        if(tableBox.find('.box-footer .total-center').length > 0) {
            tableBox.find('.box-footer .total-center').each(function() {
                $(this).html(content);
            });
        } else {
            $('<div class="box-footer clearfix"><div class="total-center">'+content+'</div></div>').insertBefore(tableHeader);
            $('<div class="box-footer clearfix"><div class="total-center">'+content+'</div></div>').insertAfter(tableBody);
        }
    },
    //update totals row in table, class enable_subtotals required
    updateTotalsTableRow : function (table) {
        var calcClassesArray = [
            '.subtotals_calc_default', // sums all values in column
            '.subtotals_calc_format', // sums all values in column + formated string
            '.subtotals_calc_accept_rate', // .subtotals_solds * 100 / .subtotals_posts
            '.subtotals_calc_cpl', // .subtotals_ttl / .subtotals_posts
            '.subtotals_calc_epl', // .subtotals_pub / .subtotals_leads
            '.subtotals_calc_alp', // .subtotals_pub / .subtotals_solds
            '.subtotals_calc_revshare' // .subtotals_pub / .subtotals_ttl * 100
        ];

        var $table = $(table),
            $subtotalsAll = $table.find('tfoot > tr > td'),
            $subtotalsPosts = $table.find('.subtotals_posts'),
            $subtotalsSolds = $table.find('.subtotals_solds'),
            $subtotalsTtl = $table.find('.subtotals_ttl'),
            $subtotalsLeads = $table.find('.subtotals_leads'),
            $subtotalsPub = $table.find('.subtotals_pub');

        $subtotalsAll.each(function () {
            //Get html and removed whitespaces + tabs from string
            var defaultHtml = $.trim($(this).html()
                .split(/\>[\n\t\s]*\</g).join('><')
                .split(/[\n\t]*/gm).join(''));

            //Paste html string to data-attribute for future use
            $(this).attr('data-default-html', defaultHtml);
        });

        var currencySymbol = $('table[data-currency-symbol]').data('currency-symbol');
        $(window).on('tableFastSearch', function(e, data) {

            $.each(calcClassesArray, function (i, className) {
                $(className).each(function() {
                    switch (className) {
                        case '.subtotals_calc_default':
                            $(this).find('span').text(calculateColumn($(this).index(), $(data.table)));
                            break;

                        case '.subtotals_calc_format':
                            var total = calculateColumn($(this).index(), $(data.table)),
                                columnColor = '#067C27';

                            if (total < 0) {
                                columnColor = '#e20000';
                            } else if ($(this).hasClass('subtotals_agn')) {
                                columnColor = '#059E9E';
                            }

                            total = parseFloat(total).toFixed(2);

                            $(this).find('span.showOnCsvExport').text(total);

                            total = currencySymbol+total;
                            total = total.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                            $(this).find('span.hideOnCsvExport').html('<span style="color:'+columnColor+';">'+total+'</span>');
                            break;

                        case '.subtotals_calc_accept_rate':
                            if ($subtotalsSolds.length && $subtotalsPosts.length) {
                                var totalAcceptRate = parseResult($subtotalsSolds.text() * 100 / $subtotalsPosts.text());

                                $(this).find('.hideOnCsvExport span, .showOnCsvExport').text(totalAcceptRate);
                            } else {
                                hideShowColumn($(this), data.searchString);
                            }
                            break;

                        case '.subtotals_calc_cpl':
                            if ($subtotalsPosts.length && $subtotalsTtl.length) {
                                var totalCpl = parseResult($subtotalsTtl.find('.showOnCsvExport').text() / $subtotalsPosts.text());

                                $(this).find('.hideOnCsvExport span').text(currencySymbol + totalCpl);
                                $(this).find('.showOnCsvExport').text(totalCpl);
                            } else {
                                hideShowColumn($(this), data.searchString);
                            }
                            break;

                        case '.subtotals_calc_epl':
                            if ($subtotalsLeads.length && $subtotalsPub.length) {
                                var totalEpl = parseResult($subtotalsPub.find('.showOnCsvExport').text() / $subtotalsLeads.text());

                                $(this).find('.hideOnCsvExport span').text(currencySymbol + totalEpl);
                                $(this).find('.showOnCsvExport').text(totalEpl);
                            } else {
                                hideShowColumn($(this), data.searchString);
                            }
                            break;

                        case '.subtotals_calc_alp':
                            if ($subtotalsSolds.length && $subtotalsPub.length) {
                                var totalAlp = parseResult($subtotalsPub.find('.showOnCsvExport').text() / $subtotalsSolds.text());

                                $(this).find('.hideOnCsvExport span').text(currencySymbol + totalAlp);
                                $(this).find('.showOnCsvExport').text(totalAlp);
                            } else {
                                hideShowColumn($(this), data.searchString);
                            }
                            break;

                        case '.subtotals_calc_revshare':
                            if ($subtotalsPub.length && $subtotalsTtl.length) {
                                var totalRevshare = parseResult($subtotalsPub.find('.showOnCsvExport').text() / $subtotalsTtl.find('.showOnCsvExport').text() * 100);

                                $(this).find('.hideOnCsvExport').text(totalRevshare + '%');
                                $(this).find('.showOnCsvExport').text(totalRevshare);
                            } else {
                                hideShowColumn($(this), data.searchString);
                            }
                            break;
                    }
                });
            });

            $subtotalsAll
                .not(':first')
                .not(calcClassesArray.join(','))
                .each(function() {
                    hideShowColumn($(this), data.searchString);
                });
        });

        function parseResult(result) {
            result = parseFloat(result).toFixed(2);

            if (!isFinite(result)) {
                result = 0;
            }

            return result;
        }

        //hide or show column on search
        function hideShowColumn(column, searchString) {
            if (searchString.length > 0 && $(column).attr('data-default-html') !== '') {
                $(column).text('Turn off the filter to view the total');
            } else {
                $(column).html($(column).attr('data-default-html'));
            }
        }

        //sum by columns
        function calculateColumn(index, table) {
            var total = 0;
            var visibleRows = $(table).find('tbody tr:visible');
            $(visibleRows).each(function() {
                //get correct row text
                var currentTD = $('td', this).eq(index), currentVal = 0;
                if(currentTD.find('.showOnCsvExport').length > 0) {
                    currentVal = currentTD.find('.showOnCsvExport').text();
                } else {
                    currentVal = currentTD.text();
                }
                var value = parseFloat(currentVal.replace(/[ ,]/g, ''));
                if (!isNaN(value)) {
                    total += value;
                }
            });
            return total;
        }
    },
    //add row counter if it empty from php
    addTableRowCounter : function () {
        $('table.table:not(.disableRowCounter):not(.disableFastSearch)').each(function (idx, table) {
            var entriesApplied = uiHelper.checkIfShowingEntries(table);
            if ($(table).hasClass('tableRowCounter-applied')) {
                return true;
            }
            if(!entriesApplied) {
                var visibleRows = $(table).find('tbody > tr:visible').length;
                var allRows = $(table).find('tbody > tr').length;
                if(visibleRows > 0) {
                    var htmlAdd = '<label class="control-label">Showing '+visibleRows+' of '+allRows+' entries</label>';
                    uiHelper.addCounterTableFooter(table, htmlAdd);
                }
            }
            uiHelper.updateTotalsTableRow(table);
        });
    },
    addTableExport : function () {
        $('table.table:not(.disableExport):not(tableExport-applied)').each(function (idx, table) {
            if ($(table).hasClass('tableExport-applied')) {
                return true;
            }

            $(table).addClass('tableExport-applied');
            var exportHref    = $(table).attr('data-export-href');
            var exportHrefRaw = $(table).attr('data-export-href-raw');
            var exportName    = $(table).attr('data-export-name') || 'export';
            exportName        = exportName.replace('.csv', '') + '__' + new Date($.now()) + '.csv';
            if (!$(table).hasClass('hideExport')) {
                var strToAdd;
                if (exportHref) {
                    if (exportHrefRaw) {
                        strToAdd = "<div class='btn-group'>";
                        strToAdd += "<a title='Export data as CSV'" +
                                    " data-toggle='dropdown'" +
                                    " class='btn btn-sm btn-warning dropdown-toggle'" +
                                    " style='margin-left: 5px;'" +
                                    " href='javascript:void(0);'>" +
                                    "<i class='far fa-file-excel' aria-hidden='true'></i><span class='hide-on-small-screen'> Export to CSV</span> <span class='caret'></span></a>";
                        strToAdd += '<ul class="dropdown-menu" style="right: 0 !important; left: inherit;">' +
                                    '<li><a href="' + exportHref + '" target="_blank">Export to CSV as text</a></li>' +
                                    '<li><a href="' + exportHrefRaw + '" target="_blank">Export Raw Data</a></li>' +
                                    "</ul>";
                    } else {
                        strToAdd = " <a title='Export data as CSV' class='csv-export btn btn-sm btn-warning' href='" + exportHref + "' target='_blank'><i class='far fa-file-excel' aria-hidden='true'></i> <span class='hide-on-small-screen'>Export to CSV</span></a>";
                    }

                } else {
                    if ($(table).hasClass('exportAllPages')) {
                        strToAdd = "<div class='btn-group'>";
                        strToAdd += "<a title='Export data as CSV'" +
                            " data-toggle='dropdown'" +
                            " class='btn btn-sm btn-success dropdown-toggle'" +
                            " style='margin-left: 5px;'" +
                            " href='javascript:void(0);'>" +
                            "<i class='far fa-file-excel' aria-hidden='true'></i><span class='hide-on-small-screen'> Export to CSV</span> <span class='caret'></span></a>";
                        strToAdd += '<ul class="dropdown-menu" style="right: 0 !important; left: inherit;">' +
                            '<li><a href="javascript:void(0);"' +
                            ' class="table-to-csv-export-btn"' +
                            ' download="' + exportName + '">Current Page</a></li>' +
                            '<li><a href="javascript:void(0);" onclick="exportToCsvAllPages()">All Pages</a></li>' +
                            "</ul>";
                    } else {
                        strToAdd = " <a title='Export data as CSV' class='csv-export table-to-csv-export-btn btn btn-sm btn-success' href='javascript:void(0);' download='" + exportName + "'><i class='far fa-file-excel' aria-hidden='true'></i><span class='hide-on-small-screen'> Export to CSV</span></a>";
                    }
                }

                uiHelper.appendToTable(table, strToAdd);
            }
        });
    },

    QueryString : function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query        = window.location.search.substring(1);
        var vars         = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr               = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    },

    getUrlWithParam : function (newParam, newVal) {
        newParam         = newParam || '';
        newVal           = newVal || '';
        var url          = location.href.split('?')[0];
        var params       = uiHelper.QueryString();
        var queryStr     = [];
        params[newParam] = newVal;
        $.each(params, function (index, val) {
            if (index !== '') {
                queryStr.push(index + '=' + encodeURIComponent(val));
            }
        });
        var query        = queryStr.join('&');
        if (query != '') {
            query = '?' + query;
        }

        return location.href.split('?')[0] + query;
    },

    getUrlForFilter : function () {
        //var isObj = false;
        var url      = location.href.split('?')[0];
        var params   = uiHelper.QueryString();
        var queryStr = [];

        $.each(params, function (index, val) {
            if (index !== '') {
                queryStr.push(url + '__' + index + '=' + encodeURIComponent(val));
                //isObj = true;
                //queryStr[index] = val;
            }
        });
        if (queryStr.length > 0) {
            return queryStr;
        } else {
            return [location.href.split('?')[0]];
        }

    },
    applyTabClicks  : function () {
        var timeoutCounter = [];
        for (var i = 0; i < 10; i++) {
            if (typeof uiHelper.QueryString()['current-tab[' + i + ']'] !== 'undefined') {
                var tabSelector = uiHelper.QueryString()['current-tab[' + i + ']'];
                if (!$('.tab-buttons:eq(' + i + ')').hasClass('tabAutoOpened')) {
                    $('.tab-buttons:eq(' + i + ')').addClass('tabAutoOpened');
                    setTimeout("$('.tab-buttons:eq(" + i + ")').find('[data-toggle=tab][href=" + decodeURIComponent(tabSelector) + "], [data-toggle=tab][data-target=" + decodeURIComponent(tabSelector) + "]').click();", 100 * (i + 1));
                }
            }
        }
    },

    objToOptions  : function (ob, firstEmpty, elemName) {

        // Get $_GET vars
        var qd = {};
        location.search.substr(1).split("&").forEach(function (item) {
            var s = item.split("="), k = s[0] && decodeURIComponent(s[0]), v = s[1] && decodeURIComponent(s[1]);
            (qd[k] = qd[k] || []).push(v)
        });

        firstEmpty = firstEmpty || false;
        if (firstEmpty) {
            var optionsStr = '<option></option>';
        } else {
            var optionsStr = '';
        }

        var addOption = function (idx, name) {
            var selected = (qd[elemName] == idx) ? 'selected="selected"' : '';
            optionsStr += '<option ' + selected + ' value="' + uiHelper.escapeHtml(idx) + '">' + uiHelper.escapeHtml(name) + '</option>';
        };

        if (Array.isArray(ob)) {
            $.each(ob, function (idx, item) {
                addOption(item.key, item.val);
            });
        } else {
            $.each(ob, function (idx, name) {
                addOption(idx, name);
            });
        }

        return optionsStr;
    },
    sidebarStatus : function () {
        var body    = $('body');
        var d       = new Date();
        d.setTime(d.getTime() + (100 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();

        if (body.hasClass('sidebar-collapse')) {
            setCookie('sidebarPushMenu', 1, expires);
        } else {
            setCookie('sidebarPushMenu', 0, expires);
        }
    },

    setSystemComponent : function (component, newTab) {
        var date = new Date();
        var newTab = newTab || false;
        var cookieDate = date.setDate(date.getDate() + 86400);
        var $componentSwitchToggler = $('#big-component-label');
        var isModalWindow = 'block' === $('.component-switch-bg').css('display');

        setCookie('MenuComponentsUserCookie', 1, cookieDate, '/');
        if (newTab) {
            loaders.body.done();
            window.open('/main/setcomponent?component=' + component);
            uiHelper.forcedCloseBigSystemComponentSwitcher();
            return true;
        }
        $('.component-switch').css({
            'overflow'  : 'hidden',
            'width'     : '5px',
            'height'    : '5px',
            'left'      : $componentSwitchToggler.offset().left + ($componentSwitchToggler.outerWidth() / 2),
            'top'       : $componentSwitchToggler.offset().top + ($componentSwitchToggler.outerHeight() / 2),
            'transform' : 'translateX(-50%) translateY(-50%) scale(0)'
        });

        $('.component-switch-bg').fadeOut('slow', function () {
            if (isModalWindow) {
                window.open(
                    '/main/setcomponent?component=' + component,
                    '_blank'
                );
            } else {
                window.location.href= '/main/setcomponent?component=' + component;
            }
        });
    },

    changeSystemComponentSwitcherWidth: function () {
        var $componentSwitchButtons = $('.component-switch-buttons');
        var componentButtonsLength = $componentSwitchButtons.find('.component-switch-btn').length;
        var componentSwitchButtonWidth = 240;
        var containerMaxWidth = 1200;
        var viewportWidth = $(window).width();

        if (viewportWidth > 1200) {

            if (componentButtonsLength > 10) {
                containerMaxWidth = componentSwitchButtonWidth * 5;
            } else if (componentButtonsLength > 3 && componentButtonsLength <= 10) {
                containerMaxWidth = componentSwitchButtonWidth * Math.round(componentButtonsLength/2);
            } else {
                containerMaxWidth = componentSwitchButtonWidth * componentButtonsLength;
            }

        } else if (viewportWidth <= 1200 && viewportWidth > 740) {

            if (componentButtonsLength === 4) {
                containerMaxWidth = componentSwitchButtonWidth * 2;
            } else if (componentButtonsLength > 4) {
                containerMaxWidth = componentSwitchButtonWidth * 3;
            } else {
                containerMaxWidth = componentSwitchButtonWidth * componentButtonsLength;
            }

        } else if (viewportWidth <= 740 && viewportWidth > 510) {

            containerMaxWidth = componentSwitchButtonWidth * 2;

        } else if (viewportWidth <= 510 && viewportWidth > 430) {

            componentSwitchButtonWidth = 200;
            containerMaxWidth = componentSwitchButtonWidth * 2;

        } else {
            componentSwitchButtonWidth = 145;
            containerMaxWidth = componentSwitchButtonWidth * 2;
        }

        $componentSwitchButtons.css({'max-width': containerMaxWidth + 'px'});
    },

    showBigSystemComponentSwitcher : function () {
        var $componentSwitchToggler = $('#big-component-label');

        uiHelper.changeSystemComponentSwitcherWidth();

        $('.component-switch-bg').fadeIn('fast');

        $('.component-switch').css({
            'overflow-y' : 'hidden',
            'transition' : '',
            'left'       : $componentSwitchToggler.offset().left + ($componentSwitchToggler.outerWidth() / 2),
            'top'        : $componentSwitchToggler.offset().top + ($componentSwitchToggler.outerHeight() / 2),
            'width'      : '0',
            'height'     : '0',
            'transform'  : 'translateX(-50%) translateY(-50%) scale(0)'
        }).show(function () {
            $(this).css({
                'transition' : 'transform .375s linear, left .375s linear, top .375s linear',
                'left'       : '',
                'top'        : '',
                'width'      : '100%',
                'height'     : '100%',
                'transform'  : 'translateX(-50%) translateY(-50%) scale(1)',
                'overflow-y'   : 'auto'
            });
        });

    },

    closeBigSystemComponentSwitcher : function (event) {
        var target = event.target;
        if (target.matches('.component-switch, .component-switch-inner, .orderComponentButton')) {
            var a = getCookie('MenuComponentsCookie');

            if (a !== null) {
                var $componentSwitchToggler = $('#big-component-label');

                $('.component-switch').css({
                    'overflow-y': 'hidden',
                    'width': '5px',
                    'height': '5px',
                    'left': $componentSwitchToggler.offset().left + ($componentSwitchToggler.outerWidth() / 2),
                    'top': $componentSwitchToggler.offset().top + ($componentSwitchToggler.outerHeight() / 2),
                    'transform': 'translateX(-50%) translateY(-50%) scale(0)'
                });
                $('.component-switch-bg').hide(0);
            }
        }
    },

    forcedCloseBigSystemComponentSwitcher : function () {
        var a = getCookie('MenuComponentsCookie');

        if (a !== null) {
            var $componentSwitchToggler = $('#big-component-label');

            $('.component-switch').css({
                'overflow': 'hidden',
                'width': '5px',
                'height': '5px',
                'left': $componentSwitchToggler.offset().left + ($componentSwitchToggler.outerWidth() / 2),
                'top': $componentSwitchToggler.offset().top + ($componentSwitchToggler.outerHeight() / 2),
                'transform': 'translateX(-50%) translateY(-50%) scale(0)'
            });
            $('.component-switch-bg').hide(0);
        }
    },

    /**
     * Отдаёт CSV файл, сгенерированный из таблицы на скачивание
     * @param $buttonElement element !!! jquery object !!!
     * @param $table element !!! jquery object !!!
     * @param filename string
     */
    exportTableToCSV : function ($buttonElement, $table, filename) {
        try {
            var buttonElement = $buttonElement[0]; //Get native js element
            var table = $table[0]; //Get native js element
            var rows = table.querySelectorAll('tr:not(.hideOnCsvExport)');
            rows = filterByContainSelector(rows, 'td, th'); // Remove empty rows
            rows = filterVisible(rows); // Remove hidden rows
            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            var tmpColDelimiter = String.fromCharCode(11); // vertical tab character
            var tmpRowDelimiter = String.fromCharCode(0); // null character
            // actual delimiter characters for CSV format
            var colDelimiterRaw = ',';
            var colDelimiter = '"' + colDelimiterRaw + '"';
            var rowDelimiter = '"\r\n"';
            // Grab text from table into CSV formatted string
            var csv = '"' + 'sep=' + colDelimiterRaw + rowDelimiter;
            csv += formatRows(Array.prototype.map.call(rows, grabRow)) + '"';
            // Data URI
            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

            // For IE (tested 10+)
            if (window.navigator.msSaveOrOpenBlob) {
                var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
                    type: "text/csv;charset=utf-8;"
                });
                navigator.msSaveBlob(blob, filename);
            } else {
                buttonElement.setAttribute('download', filename);
                buttonElement.setAttribute('href', csvData);
                buttonElement.setAttribute('target', '_blank');
            }
        } catch (e) {
            exportToCsvAllPages();
        }

        function filterByContainSelector(nodeList, selector) {
            return Array.prototype.filter.call(nodeList, function (element) {
                return !!element.querySelector(selector);
            });
        }

        function elementIsVisible(element) {
            return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }

        function filterVisible(nodeList) {
            return Array.prototype.filter.call(nodeList, elementIsVisible);
        }
        // Format the output so it has the appropriate delimiters
        function formatRows(rows) {
            return rows.join(tmpRowDelimiter)
                .split(tmpRowDelimiter).join(rowDelimiter)
                .split(tmpColDelimiter).join(colDelimiter);
        }
        // Grab and format a row from the table
        function grabRow(row) {
            var cols = row.querySelectorAll('td:not(.hideOnCsvExport):not(.hidden), th:not(.hideOnCsvExport):not(.hidden)');

            return Array.prototype.map.call(cols, grabCol).join(tmpColDelimiter);
        }
        // Grab and format a column from the table
        function grabCol(col) {
            if (!col) {
                return '';
            }

            var colClassList = col.classList;
            if (!elementIsVisible(col) || colClassList.contains('hideOnCsvExport') && !colClassList.contains('showOnCsvExport')) {
                return '';
            }

            //$col.find(':not(:visible):not(.showOnCsvExport), .hideOnCsvExport:not(.showOnCsvExport)').text('');

            var replaceWithTextList = col.querySelectorAll('._onCsvExportReplaceElementWithText');
            if (replaceWithTextList) {
                for (var i = 0; i < replaceWithTextList.length; i++) {
                    replaceWithTextList[i].innerHTML = replaceWithTextList[i].dataset['replace_text'];
                }
            }

            var text = '';
            var colTextContent = '';
            if (col.querySelectorAll('.hideOnCsvExport, .showOnCsvExport').length > 0 && col.tagName !== 'TH') {
                var elementWithContent = col.querySelectorAll('.showOnCsvExport:not(.hideOnCsvExport)');
                if (elementWithContent) {
                    for (var count = 0; count < elementWithContent.length; count++) {
                        colTextContent += elementWithContent[count].textContent;
                    }
                }
            } else {
                colTextContent = col.textContent;
            }

            text = colTextContent.trim()
                .replace(/(\r|\n)+/g, ' ')      // remove break line
                .replace(/(\s|&nbsp;)+/g, ' ')  // remove repeated spaces
                .replace(/(\(\s)/g, '(').replace(/(\}\s)/g, ')')  // remove spaces near border bracket
                .replace(/\~\|\|\:\|\|\:\|\|\~/g, '\r\n');  // ??? ask Ivan Kaptsov

            var replaceWithSeparator = col.querySelector('._onCsvExportReplaceWithDataText');
            if (replaceWithSeparator) {
                text = replaceWithSeparator.dataset['replace'];
            }

            text = text
                .replace(/"/g, '`')
                .replace('"', '""'); // escape double quotes

            if (col.hasAttribute('colspan') && parseInt(col.getAttribute('colspan')) > 1) {
                for (var j = 0; j < col.getAttribute('colspan') - 1; j++) {
                    text += colDelimiter;
                }
            }

            return text;
        }
    },
    consumerSupport  : function () {
        bootbox.prompt(
            {
                title     : 'Enter your Account Manager\'s name',
                className : "small-popup",
                callback  : function (a) {
                    if (a !== null && a != '') {
                        window.open('https://phonexa.webex.com/meet/' + a);
                    }
                }
            }
        );
    },
    getRandomInt     : function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    resetShortLink: function () {
        if ($('.short-link').hasClass('open')) {
            $('#short-link-btn').show();
            $('#short-link-field').hide();
            $('.shortLinkCopy').hide();

            $('#short-link').val('');
        }
    },
    getShortLink     : function () {
        $.ajax({
            url     : '/short/create',
            method  : 'post',
            data    : {
                link : window.location.href.replace(/^.*\/\/[^\/]+/, '')
            },
            success : function (data) {
                $('#short-link').val(window.location.origin + '/short?link=' + data.shortLink);
                $('#short-link-btn').hide();
                $('#short-link-field').show();
                $('.shortLinkCopy').show();
                $('.short-link').addClass('open');
            },
            error: function (jqXHR) {
                var message = 'Something went wrong';

                if (jqXHR.status === 402) {
                    message = 'This functionality is not covered by your tariff package';
                }
                bootbox.alert({
                    message: '<div class="text-danger text-bold">' + message + '</div>',
                    backdrop: true,
                    buttons: {
                        ok: {
                            label: '<i class="fa fa-check"></i> OK'
                        }
                    },
                });
            }
        });

        return false;
    },

    isSelected : function (idSelectElement) {
        var selectElement = document.getElementById(idSelectElement);
        if (null !== selectElement && selectElement.options[selectElement.selectedIndex].value) {
            return true;
        }
        return false;
    },

    setBreadcrumsBackground: function () {
    var bc = $('.content-header>.breadcrumb');
    if(bc.parent().height() > 50) {
        bc.css({
            'background-color': '#d2d6de',
            'margin-left': '0'
        });

    } else {
        bc.css({
            'background-color': 'transparent',
            'margin-left': 'auto'
        });
    }
},

    tabChanged: function() {
        if (uiHelper.tabChanged.oldPath === location.href) {
            return;
        }

        var event;
        if (typeof window.CustomEvent === 'function') {
            event = new CustomEvent('tabChanged');
        } else { // ie
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('tabChanged', true, true, {});
        }
        document.dispatchEvent(event);

        uiHelper.tabChanged.oldPath = location.href;
    },
};

lazyContentBoxes = {};

$(document).ready(function () {
    uiHelper.applyPlugins();
    uiHelper.setBreadcrumsBackground();

    setTimeout(function () {
        loaders.global.done();
        loaders.ajax.hide();
    }, 500);

    if (getCookie('ui-preserve-scroll') > 0) {
        var prevScrollPos = getCookie('ui-preserve-scroll');
        setCookie('ui-preserve-scroll', 0, 10);
        if (getCookie('ui-preserve-scroll-formId') != null && getCookie('ui-preserve-scroll-formId') != '') {
            var formId = getCookie('ui-preserve-scroll-formId');
            if ($('form#' + formId).length > 0) {
                $(document).scrollTop(prevScrollPos);
            }
        }
    }
    if (typeof(Clipboard) === "function") {
        clipboard = new Clipboard('.copyCode');
        clipboard.on('success', function (e) {
            var successText = e.trigger.getAttribute('data-text') ? e.trigger.getAttribute('data-text') : "Copied!";
            if (successText != 'Copied!') {
                bootbox.alert(successText);
            }
            e.clearSelection();
        });
    }
});


window.onbeforeunload = function (e) {
    loaders.ajax.show();
};

$(document).on('submit', 'form', function (e) {
    var isFormLoaderAdded = $(this).find('.formLoader').length;

    if (!isFormLoaderAdded) {
        uiHelper.formLoader($(this));
    }

    if ($(this).hasClass('ui-preserve-scroll') && $(this).attr('id') !== undefined) {
        uiHelper.setPreserveScroll($(this).attr('id'));
    }
});

$(document).on('mousedown', '.form-group .btn.open-pass-btn', function () {
    $(this).parent().next().attr('type', 'text');
});
$(document).on('mouseup mouseout', '.form-group .btn.open-pass-btn', function () {
    $(this).parent().next().attr('type', 'password');
});

$(document).ajaxSend(function (xhr) {
    loaders.ajax.show();
});
$(document).ajaxComplete(function (xhr) {
    loaders.ajax.hide();
    //uiHelper.applyPlugins();
});

$(document).on('change', '[data-conditional-element]', function () {
    uiHelper.conditionalChange($(this));
});

/*
 * select deselect all
 */
$(document).on('change', '[data-handler=turnAuto]', function () {
    var attr    = $(this).attr('data-element');
    var checked = $(this).prop("checked");
    $('[name="' + attr + '"][data-hold="0"]').prop('checked', checked).trigger("change");
});
var test;

$(document).ready(function () {
    setTimeout(function () {
        uiHelper.displayHowToUse();
    }, 1000);
});

function checkHowToUse()
{
    var howToUseModal = $(document).find('[data-target="#howToUseWindow"]');
    if (howToUseModal.length > 0) {
        var href = howToUseModal.attr("href");
        var url = href.split("?")[0];
        var prefix4howtouse = href.split('=')[1];
        if (prefix4howtouse == undefined) {
            prefix4howtouse = getPrefix4HowToUse();
        }
        $.ajax({
            url: url + '-display',
            method: 'get',
            data: {
                prefix: prefix4howtouse,
            },
            success: function (data) {
                if (data != true) {
                    howToUseModal.show();
                } else {
                    howToUseModal.hide();
                }
            }
        });
    }
}

$(document).on('click', '[data-target=#howToUseWindow]', function (e) {
    setPrefix4HowToUse();
});

function getPrefix4HowToUse()
{
    var activeTab = $(document).find('.tab-pane.active:visible');
    var prefix4howtouse = activeTab.attr('id');
    var activeSubTabList = $(activeTab).find('.tab-pane.active');
    if (activeSubTabList.length > 0) {
        activeSubTabList.each(function (i, item) {
            prefix4howtouse += '_' + item.id;
        });
    }
    return prefix4howtouse;
}

function setPrefix4HowToUse() {
    var prefix4howtouse = getPrefix4HowToUse();

    var howToUseModal = $(document).find('[data-target="#howToUseWindow"]');
    var href = howToUseModal.attr("href");
    if (prefix4howtouse != null && href) {
        var newHref = href.split("prefix=")[0] + 'prefix=' + prefix4howtouse;
        if (href == newHref) {
            return false;
        }
        howToUseModal.attr({href: newHref});
        $('#howToUseWindow').data('prefix4howtouse', prefix4howtouse);
        $('#howToUseWindow').load(newHref);
    }
    return true;
}

function getParams () {
    var hash = window.location.search.replace('?','');
    var params = hash.split('&');
    var result = {};
    for ( var i=0; i < params.length;i++ ) {
        var param = params[i].split('=');
        if ( param[0].indexOf('[') > -1 ) {
            var key = param[0].split('[')[0].replace('%23', '');
        } else {
            key = param[0];
        }
        if (typeof param[1] == 'undefined') {
            continue;
        }
        var value = param[1].replace('%23', '');

        if ( typeof (result[key]) == 'undefined') result[key] = [];

        result[key].push(value);
    }

    return result;
}

$(document).on('click', '[data-toggle=tab]', function (e) {
    $('#howToUseWindow').hide();
    uiHelper.applyLazyLoad();
    var buttonsIndex = $(this).parents('.tab-buttons').index('.tab-buttons');
    var paramName = 'current-tab[' + buttonsIndex + ']';

    if (typeof e.originalEvent !== 'undefined') {
        uiHelper.displayHowToUse();

        if (buttonsIndex >= 0) {
            history.pushState(history.state, false, uiHelper.getUrlWithParam(paramName, $(this).data('target') || $(this).attr('href')));
        }
    }
    uiHelper.addTableSearch();
    uiHelper.addTableFieldFilter();
    uiHelper.addTableExport();
    uiHelper.tabChanged();
    // uiHelper.applyMenuHeight();
});
if ( $('[data-toggle="tab"]').length ) {
    $(window).on('popstate', function (event) {
        var params = getParams();
        if ( typeof (params['current-tab']) != 'undefined' ) {
            var tab = params['current-tab'][0],
                sub_tab = params['current-tab'][1],
                tab_button = $('[data-toggle="tab"][href="#' + tab + '"],[data-toggle="tab"][href="#' + sub_tab + '"]');

            $('[data-toggle="tab"]').blur();
            tab_button.trigger('click');
        } else {

                $('[data-toggle="tab"]').blur();
                $('[data-toggle="tab"]:first-child').trigger('click');
        }
    });
}


$(document).on('click','[data-toggle=ajax]', function () {
    var url = $(this).attr('data-url');
    var target = $(this).attr('data-target');
    $(target).load(url);
});

$(document).on('click', function (e) {
    if($(e.target).hasClass('tooltip-applied')) {
        $(e.target).tooltip('show');
    } else {
        $('.tooltip[role=tooltip]').remove();
    }
});

$(document).on('show.bs.tooltip', '.tooltip-applied', function () {
    $('.tooltip[role=tooltip]').not(this).remove();
});

$(document).off('click', "a.table-to-csv-export-btn");
$(document).on('click', "a.table-to-csv-export-btn", function (event) {
    var $table = $(this).closest('.box-header').siblings('.box-body');

    uiHelper.exportTableToCSV($(this), $table.children('table.tableExport-applied'), $(this).attr('download'));
});

/**
 *
 * @param name string
 * @param value string
 * @param expires int
 * @param path string
 * @param domain string
 * @param secure bool
 */
function setCookie(name, value, expires, path, domain, secure) {
    document.cookie = name + "=" + encodeURIComponent(value) +
                      ((expires) ? "; expires=" + expires : "") +
                      ((path) ? "; path=" + path : "") +
                      ((domain) ? "; domain=" + domain : "") +
                      ((secure) ? "; secure" : "");
}

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/:/g, '&colon;');
}

/**
 * @param name string
 * @returns {*}
 */
function getCookie(name) {
    var cookie = " " + document.cookie;
    var search = " " + name + "=";
    var setStr = null;
    var offset = 0;
    var end    = 0;
    if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = cookie.indexOf(";", offset);
            if (end == -1) {
                end = cookie.length;
            }
            setStr = decodeURIComponent(cookie.substring(offset, end));
        }
    }
    return (setStr);
}

//scroll to top
var last_scroll_place = 0;
var scroll_to_top     = $("#scroll_to_top");
var visible_totop     = false;
scroll_to_top.on("click", function () {
    if (scroll_to_top.hasClass("has_place")) {
        scroll_to_top.removeClass("has_place");
        uiHelper.scrollEasy(window.last_scroll_place, 400);
        window.last_scroll_place = 0;
        scroll_to_top.attr("title", "Up");
        scroll_to_top.find('i.fa').removeClass("fa-angle-down").addClass("fa-angle-up");
    } else {
        scroll_to_top.addClass("has_place");
        window.last_scroll_place = window.pageYOffset;
        uiHelper.scrollEasy(0, 400);
        scroll_to_top.attr("title", "Down");
        scroll_to_top.find('i.fa').removeClass("fa-angle-up").addClass("fa-angle-down");
    }
    return false
});

$(window).on('resize', uiHelper.resetDoubleScroll);
$(window).on('resize', uiHelper.changeSystemComponentSwitcherWidth);
$(window).on('resize', uiHelper.setBreadcrumsBackground);

$(window).on('scroll', function () {
    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) <= 991) {
        return;
    }
    if ($('.stickToTop').length > 0) {
        $('.stickToTop:visible').each(function () {
            var innerStickParentDoubleTable;
            var tableIsInModal = $('.stickToTop').closest('#modalPopup')[0];
            if ($(this).attr('data-window-innerWidth') == null) {
                $(this).attr('data-window-innerWidth', window.innerWidth);
            }

            var StickerParentOrig, StickerParent;

            if (typeof $(this).attr('data-stick-parent') == 'undefined') {
                if ($(tableIsInModal).is(":visible")) {
                    StickerParentOrig = $('#modalPopup');
                    StickerParent =  StickerParentOrig;
                } else {
                    StickerParentOrig = 'window';
                    StickerParent = $(window);
                }
            } else {
                StickerParent = $(this).attr('data-stick-parent');
                StickerParentOrig = StickerParent;
                if ($(StickerParent).css('position') == 'static') {
                    $(StickerParent).css('position', 'relative');
                }
            }


            innerStickParentDoubleTable = $(this).parents('table').length > 1 && StickerParentOrig !== 'window';
            var currentScroll = $(StickerParent).scrollTop();

            if (typeof $(this).attr('data-stickToTop-init') == 'undefined') {
                var stickToTopInitAttr;

                if (StickerParentOrig == 'window') {
                    stickToTopInitAttr = $(this).offset().top;
                } else if (innerStickParentDoubleTable) {
                    stickToTopInitAttr = 0;
                } else {
                    stickToTopInitAttr = parseInt($(this).offset().top) - parseInt($(StickerParent).offset().top);
                }
                $(this).attr('data-stickToTop-init', stickToTopInitAttr);
            }

            if (typeof $(this).attr('data-stickToTop-init-width') == 'undefined' || $(this).attr('data-stickToTop-init-width') === '0') {
                $(this).attr('data-stickToTop-init-width', $(this).outerWidth());
                $(this).attr('data-stickToTop-init-height', $(this).outerHeight());
                $(this).attr('data-stickToTop-init-real-height', $(this).outerHeight());
                $(this).find('.stickToTopHideBtn').remove();
                //Обновляем дополнительный скролл, если он есть
                $(this).closest('.table-dscroll-applied').prevAll('.second_scroll.stickToTop').attr('data-sticktotop-offsettop', $(this).outerHeight() + 'px');
            }
            if ($(this).next('.stickToTop-phantom').length < 1) {
                var phantom = $(this).clone();
                $(phantom).removeClass('stickToTop').addClass('stickToTop-phantom hidden').css('visibility', 'hidden');
                $(this).after(phantom);
            }
            var tableH, tableOffset, isNotMax;

            if ($(this).parent('table').length > 0 && $(this).parent('table').is(":visible")) {
                tableH = parseInt($(this).parent('table').height());
                tableOffset = parseInt($(this).parent('table').offset().top);
                var currentTheadInit = parseInt($(this).attr('data-stickToTop-init'));
                if (currentTheadInit > tableOffset || currentTheadInit > (tableOffset + tableH)) {
                    var stickToTopInitAttribute;
                    if (tableIsInModal) {
                        stickToTopInitAttribute = stickToTopInitAttr;
                    } else   if (StickerParentOrig === 'window') {
                        stickToTopInitAttribute = tableOffset;
                    } else if (innerStickParentDoubleTable) {
                        stickToTopInitAttribute = 0;
                    } else  {
                        stickToTopInitAttribute = parseInt($(this).offset().top) - parseInt($(StickerParent).offset().top);
                    }
                    $(this).attr('data-stickToTop-init', stickToTopInitAttribute);
                }
                var maxScroll = tableH + parseInt($(this).attr('data-stickToTop-init')) - 16; // 16px - scroll default height
                isNotMax = maxScroll > currentScroll;
            } else {
                var $parent = $(this).parent();
                var $table = $parent.find('table:first');
                tableH = $table.height() || 0;
                if (typeof $table.offset() !== 'undefined') {
                    tableOffset = parseInt($table.offset().top);
                } else {
                    tableOffset = 0;
                }
                $parent.attr('data-debug', JSON.stringify([currentScroll, tableH, tableOffset]));
                isNotMax = currentScroll < tableH + tableOffset - $(this).height();
            }
            var topX;

            if ($('.second_scroll').length) {
                topX = $(this).attr('data-stickToTop-offsetTop') || 30;
                if (tableIsInModal) {
                    topX -= 98;
                }
            } else if (tableIsInModal) {
                topX = -65;
            } else {
                topX = 0;
            }
            topX = parseInt(topX);
            var stickyHeaderHeight = $(this).height() + 50;
            var parentHeight = $(StickerParent).height();
            var stickerOffset = parseInt($(this).attr('data-stickToTop-init')) - topX;

            if ((stickerOffset < currentScroll && isNotMax && stickyHeaderHeight < parentHeight) || innerStickParentDoubleTable) {
                if ($(this).prop("tagName").toLowerCase() == 'thead') {
                    var table = $(this).closest('table');
                    var stickedHeader = table.find('thead.stickToTop');
                    var isHeaderFixed = stickedHeader.css('position') === 'fixed';
                    var th = stickedHeader.find('th');
                    var thPhantom = table.find('thead.stickToTop-phantom th');

                    th.each(function (i) {
                        var self = $(this);
                        if (self.hasClass('hidden')) return;
                        var width = self.outerWidth();
                        self.css('width', width);
                        $(thPhantom[i]).css('width', width);
                    });

                    if (!isHeaderFixed) {
                        var tableOffsetX, tablePosition, topPx;

                        if (StickerParentOrig == 'window') {
                            topPx = ($('.navbar-fixed-top').css('position') == 'fixed' ? '50px' : '0');
                            tablePosition = 'fixed';
                            tableOffsetX = $(table).offset().left;
                        } else {
                            topPx = parseInt($(StickerParent).scrollTop()) + 'px';
                            tablePosition = 'absolute';
                            var borderMinus = $(StickerParent).css('border-left-width') || 0;
                            tableOffsetX = table.offset().left - $(StickerParent).offset().left - borderMinus;
                        }

                        if (innerStickParentDoubleTable) {
                            tableOffsetX = 5;
                        }
                        stickedHeader.css({
                            'position': tablePosition,
                            'top': topPx,
                            'left': tableOffsetX + 'px',
                            'display': 'table-header-group',
                            'width': table.outerWidth() + 'px',
                            'background': 'white',
                            'zIndex': '100'
                        });
                        // force close for any dropdown above table when header is fixed
                        table.closest('.box').find('.tableFieldFilter-container .btn-group.open .dropdown-toggle').trigger('click');
                    } else {
                        tableOffsetX = $(table).offset().left;
                        stickedHeader.css('display', '');
                    }

                    if (($(StickerParent).scrollLeft() > 0 || parseInt($(table).find('thead.stickToTop').css('left')) != tableOffsetX) && !innerStickParentDoubleTable) {
                        stickedHeader.css('left', (-parseInt($(StickerParent).scrollLeft()) + tableOffsetX) + 'px')
                    }
                } else {

                    if (StickerParentOrig == 'window') {
                        tablePosition = 'fixed';
                    } else {
                        tablePosition = 'absolute';
                    }
                }

                if (StickerParentOrig != 'window') {
                    topX = (parseInt(topX) + parseInt($(StickerParent).scrollTop())) + 'px';
                }
                var paramsToSet = {
                    'position': tablePosition || 'fixed',
                    'top': topX,
                    'zIndex': 1,
                    'width': $(this).attr('data-stickToTop-init-width') + 'px'
                };

                if ($(this).attr('data-stickToTop-init-height') > 1) {
                    paramsToSet.height = $(this).attr('data-stickToTop-init-height') + 'px';
                } else {
                    paramsToSet.height = '';
                }

                if ($(this).css('position') != 'fixed') {
                    $(this).css(paramsToSet);
                }
                $(this).next('.stickToTop-phantom').removeClass('hidden');

                if ($(this).find('.stickToTopHideBtn').length < 1 && $(this).height() > 50) {
                    $(this).append('<div class="stickToTopHideBtn"><i class="far fa-arrow-alt-circle-up"></i></div>')
                }
            } else {
                var paramsToSet = {
                    'position': '',
                    'top': '',
                    'overflow': ''
                };

                if ($(this).attr('data-stickToTop-init-real-height') > 1) {
                    paramsToSet.height = $(this).attr('data-stickToTop-init-real-height') + 'px';
                } else {
                    paramsToSet.height = '';
                }
                $(this).next('.stickToTop-phantom').addClass('hidden');
                $(this).removeClass('stickToTopHidden')
                    .css(paramsToSet)
                    .attr('data-stickToTop-init-height', $(this).attr('data-stickToTop-init-real-height'))
                    .find('.stickToTopHideBtn').remove();
            }
        });
    }

    if (window.pageYOffset > 40) {
        if (!visible_totop) {
            scroll_to_top.removeClass("hidden");
            visible_totop = true
        }
    } else {
        if (visible_totop && !scroll_to_top.hasClass("has_place")) {
            scroll_to_top.addClass("hidden");
            visible_totop = false
        }
    }

});

window.addEventListener('scroll', function(e){ if (e.target != document) { $(window).scroll(); } }, true);

$(document).on('click', '.stickToTopHideBtn', function () {
    var $parentElem = $(this).parent();
    if ($parentElem.attr('data-stickToTop-init-height') == $parentElem.attr('data-stickToTop-init-real-height')) {
        $parentElem.attr('data-stickToTop-init-height', '24').css({'overflow' : 'hidden'}).addClass('stickToTopHidden');
        $(this).find('i.fa.fa-arrow-circle-o-up').removeClass('fa-arrow-circle-o-up').addClass('fa-arrow-circle-down');
    } else {
        $parentElem.attr('data-stickToTop-init-height', $parentElem.attr('data-stickToTop-init-real-height')).css('overflow', '').removeClass('stickToTopHidden');
        $(this).find('i.fa.fa-arrow-circle-down').removeClass('fa-arrow-circle-down').addClass('fa-arrow-circle-o-up');
    }
    $(window).scroll();

});
$(document).on('click', '.tab-buttons > a.btn', function () {
    $(this).parent().find('>a.btn').removeClass('active');
    $(this).parent().find('.current-tab-label').text($(this).text());
    $(this).parent().parent().find('.current-tab-label').text($(this).text());
    $(this).addClass('active');
});
$(document).on('click', 'a[data-async=1]', function (event) {
    event.stopPropagation();
    event.preventDefault();

    var element = $(this);
    if ('modal' === element.attr('data-toggle')) {
        // Skip async load if this is button for lazy modal
        return false;
    }
    var callback = function () {
        $(element.attr('data-target')).load(element.attr('href'), function() {
            $(this).find("script").each(function(){
                eval($(this).text());
            });
        });
    };

    if (element.attr('data-confirmation') != undefined && element.attr('data-confirmation') != '') {
        bootbox.confirm({
            message: element.attr('data-confirmation'),
            buttons: {
                confirm: {
                    label:     'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label:     'No',
                    className: 'btn-default'
                }
            },
            callback: function (result) {
                if (result) {
                    callback();
                }
            }
        });
    } else {
        callback();
    }

    /*$($(this).attr('data-target')).load($(this).attr('href'), function() {
        $(this).find("script").each(function(){
            eval($(this).text());
        });
    });*/
    return false;
});

var updateRelatedSelects = function (actionName, dataType, onSuccess, addSearchParams) {
    addSearchParams = addSearchParams || {};
    var id;
    var parentForm        = $(this).parents('form');
    var isPhoneReportNull = $(this).hasClass('isPhoneReportNull');
    loaders.form.start(parentForm);
    var url               = parentForm.attr('action');
    url                   = url.split('/');
    url[(url.length - 1)] = actionName;
    url                   = url.join('/');
    url = uiHelper.createUrlWithComponentPrefix(url);
    if ($(this).attr('name') == 'searchForm[productId]') {
        id = parentForm.find('[name="searchForm[webmasterId]"] option:selected').val();
    } else {
        id = $(this).val();
    }
    var ajaxData = {
        type      : dataType,
        id        : id,
        productId : $("#searchform-productId option:selected").val(),
    };

    ajaxData = $.extend({}, ajaxData, addSearchParams);
    if (!isPhoneReportNull) {
        ajaxData['isPhone'] = (typeof isPhoneReport == "undefined" ? 0 : (isPhoneReport ? 1 : 0));
    }

    $.ajax({
        url     : url,
        method  : 'get',
        data    : ajaxData,
        success : function (data) {
            try {
                data = $.parseJSON(data);
            } catch (error) {
                console.error('Not a valid JSON');
            }

            onSuccess(data);
            loaders.form.done(parentForm);
        },
        done : function() {
            loaders.form.done(parentForm);
        },
        error : function() {
            loaders.form.done(parentForm);
        }
    });
};

var updateRelatedOptions = function (selector, data, namePattern, openElement, setVal) {
    namePattern = namePattern || '';
    openElement = openElement || false;
    setVal      = setVal || '';
    var el      = $(selector);
    var options = uiHelper.objToOptions(data, true, el.prop('name'));

    //https://github.com/harvesthq/chosen/issues/1780
    //$(selector).html(options).trigger("chosen:updated");
    el.html(options);
    el.attr('data-placeholder', 'All');
    if (setVal != '') {
        el.val(setVal);
    }
    el.chosen("destroy");
    el.chosen(
        {
            disable_search_threshold : $(el).data('disableSearchThreshold') || 10,
            allow_single_deselect    : true,
            search_contains          : true
        }
    ).addClass('chosen-applied');
    if (namePattern != '' || openElement) {
        el.trigger("chosen:close")
            .trigger("chosen:open")
            .next('div.chosen-container')
            .find('> .chosen-drop > .chosen-search > input')
            .val(namePattern);
    }
};

$(document).on('change', '._searchForWmReferral', function (e) {
    updateRelatedSelects.call(this, 'getwmdata', 'referral', function (data) {
        data = e.currentTarget.checked ? data : [];

        updateRelatedOptions('._selectForWmReferral', data);
    });
});

$(document).on('change', '._searchForWmChannelLabel', function () {
    updateRelatedSelects.call(this, 'getwmchannellabels', 'labels', function (data) {
        updateRelatedOptions('._selectForWmChannelLabel', data);
    });
});

$(document).on('change', '._searchForWmChannelAndSource', function () {
    updateRelatedSelects.call(this, 'getwmdata', 'channelAndSource', function (data) {
        updateRelatedOptions('._selectForWmChannel', data.channel);
        updateRelatedOptions('._selectForWmSource', data.source);
        updateRelatedOptions('._selectForPhoneNumberGroup', data.phoneGroup);
    });
});

$(document).on('change', '._searchForWmChannel', function () {
    updateRelatedSelects.call(this, 'getwmdata', 'channelAndSource', function (data) {
        updateRelatedOptions('._selectForWmChannel', data.channel);
    });
});

$(document).on('change', '._searchForWmSource', function () {
    updateRelatedSelects.call(this, 'getwmdata', 'channelAndSource', function (data) {
        updateRelatedOptions('._selectForWmSource', data.source);
    });
});

$(document).on('change', '._searchForBuyerPhone', function () {
    updateRelatedSelects.call(this, 'getphonepartner', 'phone', function (data) {
        updateRelatedOptions('._selectForBuyerPhone', data);
    });
});

$(document).on('change', '._searchForProductParams', function () {
    updateRelatedSelects.call(this, 'get-lead-parameters', 'lead-parameters', function (data) {
        updateRelatedOptions('._selectForProductParams', data);
    });
});

$(document).on('change', '._selectForWmChannel.chosen-applied', function() {
    resetWmDataInput($(this), '._selectForWmChannel');
});
$(document).on('change', '._selectForWmSource.chosen-applied', function() {
    resetWmDataInput($(this), '._selectForWmSource');
});
function resetWmDataInput(calledElement, selector) {
    var val = $(calledElement).val() || '';
    if (val == '___reset_search_result___') {
        $(calledElement).val('')
            .next('div.chosen-container')
            .find('> .chosen-drop > .chosen-search > input')
            .val('');
        wmDataAutocomplete($(calledElement), true, selector)
    }
}
var wmDataTimer = {
    channel: 0,
    source: 0
};
$(document).on('change', 'select._selectForWmChannel.chosen-applied', function () {
    if ($(this).val() != '') {
        if (wmDataTimer['channel'] > 0) {
            clearTimeout(wmDataTimer['channel']);
        }
        var currentElement     = $(this);
        wmDataTimer['channel'] = setTimeout(function () {
            wmDataAutocomplete(currentElement, false, '._selectForWmChannel', false);
        }, 800);
    }
});
$(document).on('change', 'select._selectForWmSource.chosen-applied', function () {
    if ($(this).val() != '') {
        if (wmDataTimer['channel'] > 0) {
            clearTimeout(wmDataTimer['channel']);
        }
        var currentElement = $(this);
        //wmDataTimer['channel'] = setTimeout(function() { wmDataAutocomplete(currentElement, false, '._selectForWmSource', false); }, 800);
    }
});
$(document).on('keyup', '._selectForWmChannel.chosen-applied ~ div.chosen-container > .chosen-drop > .chosen-search > input', function () {
    if (wmDataTimer['channel'] > 0) {
        clearTimeout(wmDataTimer['channel']);
    }
    var currentElement = $(this);
    wmDataTimer['channel'] = setTimeout(function() { wmDataAutocomplete(currentElement, false, '._selectForWmChannel'); }, 800);
});
$(document).on('keyup', '._selectForWmSource.chosen-applied ~ div.chosen-container > .chosen-drop > .chosen-search > input', function () {
    if (wmDataTimer['channel'] > 0) {
        clearTimeout(wmDataTimer['channel']);
    }
    var currentElement = $(this);
    wmDataTimer['channel'] = setTimeout(function() { wmDataAutocomplete(currentElement, false, '._selectForWmSource'); }, 800);
});

function wmDataAutocomplete(calledElement, openElement, selector, doUpdate) {
    openElement = openElement || false;
    selector = selector || '';
    doUpdate = doUpdate || true;
    var form = $(calledElement).parents('form');
    var elem = (
        $(form).find('._searchForWmChannelAndSource').length > 0
            ? $(form).find('._searchForWmChannelAndSource')
            : (
            $(form).find('._searchForWmChannel').length > 0
                ? $(form).find('._searchForWmChannel')
                : (
                $(form).find('._searchForWmSource').length > 0
                    ? $(form).find('._searchForWmSource')
                    : null
            )
        )
    );
    if (elem !== null) {
        var nodeName = $(calledElement).prop('nodeName') || 'INPUT';
        nodeName = nodeName.toLowerCase();
        var valToSearch = nodeName == 'input' ? ($(calledElement).val() || '') : '';
        var setVal = nodeName == 'input' ? $(calledElement).parent().parent().parent().prev('select').val() : $(calledElement).val();
        if (doUpdate) {
            updateRelatedSelects.call(
                elem,
                'getwmdata',
                'channelAndSource',
                function (data) {
                    updateRelatedOptions(selector, (selector == '._selectForWmChannel' ? data.channel : data.source), valToSearch, openElement, setVal);
                },
                {
                    'namePattern'  : valToSearch,
                    'autoComplete' : 'yes'
                }
            );
        }
    }
}

/* Fetch Partner Campaign list */
$(document).on('chosen:ready', '._searchForPartnerCampaign', function () {
    if (!isNaN(parseInt($(document).find('._searchForPartnerCampaign').val()))) {
        updateRelatedSelects.call(this, 'getpartnerdata', 'campaign', function (data) {
            updateRelatedOptions('._selectForPartnerCampaign', data);
        });
    }
});

$(document).on('change', '._searchForPartnerByAgent', function () {
    updateRelatedSelects.call(this, 'getpartnerdata', 'partnerByAgent', function (data) {
        updateRelatedOptions('._selectForPartnerByAgent', data);
    });
});

$(document).on('change', '._searchForPartnerCampaign', function () {
    var overrideSelector = $(this).attr('data-campaign-target');
    var selector = typeof overrideSelector !== 'undefined' ? overrideSelector : '._selectForPartnerCampaign';

    updateRelatedSelects.call(this, 'getpartnerdata', 'campaign', function (data) {
        updateRelatedOptions(selector, data);
    });
});

$(document).on('change', '._searchForIvr', function () {
    updateRelatedSelects.call(this, 'getivrdata', 'ivr', function (data) {
        updateRelatedOptions('._selectForIvr', data);
        // при обновлении данных подстраивало ширину дива под контент и ломалась верстка
        $('#searchform_r_ivrId_chosen').width('100%');
    });
});

$(document).on('change', '._searchForUserReport', function () {
    var type      = this.getAttribute('reportname');
    var influence = this.getAttribute('influence');
    updateRelatedSelects.call(this, 'getreportnames', type, function (data) {
        updateRelatedOptions(influence, data);
    });
});

$(document).on('change', '._searchForUsersOfGroup', function () {
    updateRelatedSelects.call(this, 'getassignofgroup', 'assignOfGroup', function (data) {
        updateRelatedOptions('._assignOfGroup', data);
    });
});

$(document).on('change', '._resetWebmastersChannelSource', function () {
    $('#searchform-webmasterId').each(function () {
        $(this).trigger("change");
    });
});

$(document).on('change', '._searchForProduct', function () {
    if ($('._selectForPingTree').length > 0) {
        updateRelatedSelects.call(this, 'getpingtreedata', 'pingtree', function (data) {
            updateRelatedOptions('._selectForPingTree', data);
        });
    }
    if ($('._selectForIntegration').length > 0) {
        updateRelatedSelects.call(this, 'getintegrationdata', 'productForIntegration', function (data) {
            updateRelatedOptions('._selectForIntegration', data);
        });
    }
});

function filterSelectTillClass(classList) {
    var needleClassList = classList.filter(function (value, index, ar) {
        if (/^_selectTill_\d+$/.test(value)) {
            return true;
        }
        return false;
    });
    return (needleClassList.length) ? needleClassList.shift() : null;
}

function processSelectFrom(selectFromObject, selectedTillValue) {
    var selectedTillValue = parseInt(selectedTillValue);
    if (selectFromObject.length && !isNaN(selectedTillValue)) {
        selectFromObject.find('option').each(function () {
            var optionValue = parseInt($(this).prop('value'));
            if (optionValue <= selectedTillValue) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else {
        selectFromObject.find('option').each(function () {
            $(this).show();
        })
    }
}

$(document).on('change', 'select[class*=_selectTill_]', function () {
   var classList = $(this).attr("class").split(' ');
   if (classList.length) {
       var filteredClass = filterSelectTillClass(classList);
       if (typeof filteredClass === "string") {
           var selectedTillValue = $(this).val();
           var needleClassList = filteredClass.split("_");
           filteredClass = needleClassList.pop();
           var selectFrom = $('._selectFrom[data-validate='+ '_' + filteredClass +']');
           processSelectFrom(selectFrom, selectedTillValue);
           $(selectFrom).trigger("chosen:updated");
           delete needleClassList;
           delete selectFrom;
           delete selectedTillValue;
       }
       delete filteredClass;
   }
   delete classList;
});

$(document).on('change', '._selectFrom', function () {
    var values          = [];
    var selected        = $(this).val();
    $(this).find('option').each(function () {
        if (parseInt(selected) > parseInt($(this).prop('value')) && $(this).prop('value') !== '') {
            values.push($(this).prop('value'));
        }
    });

    var validateObjName = '._selectTill' + $(this).data('validate');
    $(validateObjName).find('option').each(function () {
        $(this).show();
        if ($.inArray($(this).prop('value'), values) !== -1) {
            $(this).hide();
        }
    });
    $(validateObjName).trigger("chosen:updated");
});

$(document).on('click', '.popupNewWindow[href]', function (event) {
    event.stopPropagation();
    event.preventDefault();
    window.open($(this).attr('href'), 'wnd' + Math.random() + '_' + Math.random(), 'menubar=no,width=1500,height=600,location=yes,resizable=yes,scrollbars=yes,status=yes');
});

$(document).on('keyup', "input.tableSearch-input", function (event) {
    var $input = $(this),
        $table = uiHelper.getNeededTable($input),
        searchString = $input.val().toLowerCase(),
        tableIndex  = $table.attr('data-tableSearch-id');

    $table.find('tbody tr').each(function () {
        var $tbodyTr = $(this),
            match = false;

        $tbodyTr.find('td').each(function (i) {
            if (window.tableSearchTableFields[tableIndex] !== false && $.inArray(i, window.tableSearchTableFields[tableIndex]) < 0) {
                return true;
            }
            if (window.tableExcludeSearchTableFields[tableIndex] !== false && $.inArray(i, window.tableExcludeSearchTableFields[tableIndex]) > 0) {
                return true;
            }
            var StrippedString = $(this).html().replace(/(<([^>]+)>)/ig, "").toLowerCase();
            var PhoneString    = StrippedString.replace(/\-/g, '');
            if (StrippedString.indexOf(searchString) > -1 || PhoneString.indexOf(searchString) > -1) {
                match = true;
                return false;
            }
        });

        if (match) {
            $tbodyTr.css('display', '');
        } else {
            $tbodyTr.css('display', 'none');
        }
    });

    $input.trigger('tableFastSearch', {table: $table, searchString: searchString});
});

$(document).on('tableFastSearch', function(e, data){
    var $table = data.table instanceof jQuery ? data.table : $(data.table),
        $tableBox = $table.closest('.box');

    if($tableBox.find('.box-footer .total-center').length > 0) {
        var visibleRows = $table.find('tbody > tr:visible').length;
        var allRows = $table.find('tbody > tr').length;
        var htmlAdd = '<label class="control-label">Showing ' + visibleRows + ' of ' + allRows + ' entries</label>';
        // if(visibleRows === allRows) {
        //     htmlAdd = uiHelper.initValTableRowCounter;
        // }
        $tableBox.find('.box-footer .total-center').each(function() {
            $(this).html(htmlAdd);
        });
    }
});

var __interval = null;

function pinLockCheckTicker() {
    if ((typeof __pinLockCheck == "number") && __pinLockCheck == 1) {
        if (__interval == null) {
            var interval = Math.floor(Math.random() * (12000 - 9000 + 1)) + 9000;
            __interval   = setInterval(function () {
                $.get('/account/profile/pin-lock-route?check=1');
            }, interval);
        }
    } else if (__interval !== null) {
        clearInterval(__interval);
    }
}

pinLockCheckTicker();

$(document).on('change', '.tableFieldFilter-select', function () {
    var table = uiHelper.getNeededTable($(this));
    var val   = $(this).val();
    uiHelper.hideTableColumns(table, val);
    uiHelper.addTableFieldFilter('update');
    uiHelper.doubleScroll('update');

});

$(document).on('click', "[data-toggle='offcanvas']", function () {
    uiHelper.sidebarStatus();
});

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

// $(window).on('resize', function () {
//     uiHelper.applyMenuHeight();
// });

function exportToCsvAllPages() {
    var form = $( "form[form-role='search-form']:visible" );
    if (form.length > 0) {
        var search = window.location.search.substr(1);
        $.ajax({
            type: form.attr('method') || 'GET',
            url: (__currentComponentPrefix || '') + 'report/export/add',
            data: {
                action: form.attr('action'),
                fields: (search.length ? search + '&' : '') + form.serialize()
            },
            success: function (msg) {
                bootbox.alert(msg);
            },
            error: function () {
                console.log("unsuccessful");
            }
        });
    } else {
        bootbox.alert('This action can not be performed for this page');
    }
}

function printHtmlPreview (containerElementSelector, sourceElementSelector) {
    if (typeof window.BBCodeHelper === 'undefined') {
        $.getScript('/special/editorbbcode/helper.js', function () {
            setTimeout($(containerElementSelector).html(BBCodeHelper.bbReplace($(sourceElementSelector).val())), 600);
        });
    } else if ($(sourceElementSelector).length) {
        $(containerElementSelector).html(BBCodeHelper.bbReplace($(sourceElementSelector).val()));
    }
}

function switchCheckBoxChange(element, newState, disabled) {
    if (typeof(disabled) == "undefined") {
        disabled = null;
    }
    if (typeof(newState) == "undefined") {
        newState = null;
    }

    if (newState == null) {
        var on = $(element).hasClass('offLabel');
    } else {
        var on = newState;
    }

    var container = $(element).parent();

    if (disabled != null) {
        if (disabled == true) {
            container.attr("disabled", "");
        } else {
            container.removeAttr('disabled');
        }
    } else {
        if (container.is('[disabled]') || disabled == true) {
            return;
        }
    }

    if (imitationWorkCheckbox(container)) { //имитация работы стандартного чекбокса (если не checked то форма не отправляет этот элемен)
        if (on) {
            container.find('>input').attr('checked', 'checked').prop('checked', 'checked').change();
        } else {
            container.find('>input').removeAttr('checked').removeProp('checked').change();
        }
    } else { // всегда оправляет данные взятые из dataValueForOn или dataValueForOff
        var dataValueForOn  = $(container).attr('data-value-for-on');
        var dataValueForOff = $(container).attr('data-value-for-off');

        if (on) {
            container.find('>input')
                .attr('checked', 'checked')
                .prop('checked', 'checked')
                .attr('data-switch-checkbox', dataValueForOn)
                .val(dataValueForOn)
                .change();
        } else {
            container.find('>input')
                .attr('checked', 'checked')
                .prop('checked', 'checked')
                .attr('data-switch-checkbox', dataValueForOff)
                .val(dataValueForOff)
                .change();
        }
    }
}

/**
 * @param container
 * @returns {boolean}
 */
function imitationWorkCheckbox(container)
{
    var dataValueForOn  = $(container).attr('data-value-for-on');
    var dataValueForOff = $(container).attr('data-value-for-off');

    if(typeof dataValueForOn == "undefined" && typeof dataValueForOff == "undefined") {
        var imitationOriginalCheckbox  = true;
    } else {
        var imitationOriginalCheckbox  = false;
    }

    return imitationOriginalCheckbox;
}

function isCheckedSwitchCheckBox(element) {
    var container = element.parent();
    if(imitationWorkCheckbox(container)) {
        var on = element.is(':checked');
    } else {
        var on = element.attr('data-switch-checkbox') == $(container).attr('data-value-for-on');
    }

    return on;
}

// functions for events in item app\extensions\helpers\Html::switchCheckBox override in view
function switchCheckboxOffPosition() {}
function switchCheckboxOnPosition() {}

$(document).on('change', 'input[type=checkbox][data-switch-checkbox]', function () {
    var container = $(this).parent();

    var on = isCheckedSwitchCheckBox($(this));

    if (on) {
        container.find('.offLabel').hide();
        container.find('.onLabel').show();
    } else {
        container.find('.offLabel').show();
        container.find('.onLabel').hide();
    }
});

$(document).on("chosen:showing_dropdown", "[forceDisabled] select", function() {
    $(this).find("option:not(:selected):not(:disabled)").attr("disabled", true);
    $(this).trigger("chosen:updated");
});

$(document).on('change', 'form[data-async="1"] select.donotpost', function() {
    $form = $(this).closest('form[data-async="1"]');
    $form.data('yiiActiveForm').validated = true;
    $form.find('input[type="hidden"]').val('1');
    $form.submit();
});

$(document).on("click", ".date-previous", function () {
    var $target = $(this).closest(".form-group").find(".daterangepicker-applied");
    $target.trigger("date-switch", [$target, -1]);
});

$(document).on("click", ".date-next", function () {
    var $target = $(this).closest(".form-group").find(".daterangepicker-applied");
    $target.trigger("date-switch", [$target, 1]);
});

$(document).on("mouseenter", ".date-previous", function () {
    var $target = $(this).closest(".form-group").find(".daterangepicker-applied");
    $target.trigger("date-hover", [$target, this, -1]);
});

$(document).on("mouseenter", ".date-next", function () {
    var $target = $(this).closest(".form-group").find(".daterangepicker-applied");
    $target.trigger("date-hover", [$target, this, 1]);
});

var detectPeriod = function (startDate, endDate) {
    var period, size;
    var diff = endDate.diff(startDate, "day");
    var endDay = endDate.date();
    var startDay = startDate.date();
    var endMonth = endDate.month();
    var startMonth = startDate.month();

    if (diff == 0) {
        period = 'day';
        size = 1;
    } else if ((endDay == startDay || endDay == startDay + 1) && startMonth != endMonth) {
        period = 'month';
        size = endDate.diff(startDate, 'month');
    } else if (startDate.isSame(moment(startDate).startOf('month'), 'day') && endDate.isSame(moment(endDate).endOf('month'), 'day')) {
        period = 'month';
        size = endDate.diff(startDate, 'month') + 1;
    } else if ((diff + 1) % 7 == 0 && diff != 0) {
        period = 'week';
        size = (diff + 1) / 7;
    } else {
        period = 'day';
        size = diff + 1;
    }

    return {preiod: period, size: size};
};

$(document).on("date-switch", function (e, $target, direction) {
    var daterangepicker = $target.data('daterangepicker');
    var startDate = moment(daterangepicker.startDate);
    var endDate = moment(daterangepicker.endDate);

    var period = detectPeriod(startDate, endDate);

    var checkDate = moment(startDate).add(direction * period.size, period.preiod + 's');
    if(checkDate.isBefore('2000-01-01')) {
        return;
    }

    startDate.add(direction * period.size, period.preiod + 's');
    endDate.add(direction * period.size, period.preiod + 's');

    if (period.preiod == 'month' && moment(startDate).startOf('month').isSame(startDate)) {
       endDate.endOf('month');
    }

    daterangepicker.setStartDate(startDate);
    daterangepicker.setEndDate(endDate);
});

$(document).on("date-hover", function (e, $target, button, direction) {
    var daterangepicker = $target.data('daterangepicker');
    var startDate = daterangepicker.startDate;
    var endDate = daterangepicker.endDate;

    var period = detectPeriod(startDate, endDate);

    $(button).attr('title', (direction == 1 ? 'next' : 'previous') + ' ' + period.size + ' ' + period.preiod + (period.size > 1 ? 's' : ''));
});

//Search menu
$(document).click(function(){
    $('.menu-search-wrap .search-dropdown').removeClass('open');
});
$('.menu-search-wrap').click(function (e) {
    e.stopPropagation();
});

$('#menu_search').on( 'input focus', function(){

    var dropdown = $(this).parents('.menu-search-wrap').find('.search-dropdown');
    var val = $(this).val();

    if ( val.length > 2 ) {

        dropdown.find('.col').html('');

        var items_array = [];
        var ul_index = -1;

        $('.sidebar-menu .treeview-menu').each( function(i, ul) {

            var item_count = 0;

            $.each( $(ul).find('a'), function(index, item){

                var link = $(item).find('span').text();

                if ( link.toLowerCase().indexOf(val.toLowerCase()) > -1 ) {

                    var category = $(item).parent('li').prevAll('li.header').first().text();
                    $(item).attr('target', '_blank');

                    if (!item_count) {
                        ul_index++;

                        var col_title = $(item).parents('.treeview-menu').prev('a').find('span').text();
                        var template = '<ul>' +
                            '    <li>' +
                            '        <h3>' + col_title + '</h3>' +
                            '    </li>' +
                            '    <li>' + $(item)[0].outerHTML + (category ? ' <span class="cat">(' + category + ')</span>' : '') + '</li>' +
                            '</ul>';

                        if ( ul_index % 2 === 0) {

                            dropdown.find('.col-odd').append(template);
                        } else {

                            dropdown.find('.col-even').append(template);
                        }

                    } else {

                        template = '<li>' + $(item)[0].outerHTML + (category ? ' <span class="cat">(' + category + ')</span>' : '') + '</li>';

                        $(dropdown.find('ul')[ul_index]).append( template );

                    }

                    item_count++;
                    items_array.push(item);

                }
            });


        });

        if(items_array.length) {
            dropdown.addClass('open');
            dropdown.removeClass('not-found');

            if(dropdown.find('ul').length < 2)
            {
                dropdown.addClass('one-item');
            }
            else {
                dropdown.removeClass('one-item');
            }

        }
        else {
            dropdown.removeClass('one-item').addClass('open not-found').find('.col:first-child').html('<p>Nothing found</p>');
        }

    } else {
        dropdown.removeClass('open one-item not-found');
    }

}).focusout(function () {
    $('#menu-search').val('');
    $('.sidebar-menu').each( function (i, item) {
        $(item).find('a').removeAttr('target');
    })
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};



$(document).on('keyup', '#fields-filter', function(){

    var searchValue = $(this).val().toLowerCase();
    var fields = $('#my-calls-profile .form-group-fieldset');

        if (searchValue.length > 1) {
            for (var i = 0; i < fields.length-1; i++) {
                var fieldset = fields[i];
                var label = $(fieldset).find('.form-group-label').text();

                if (label.length > 0) {
                    if (label.toLowerCase().search(searchValue) === -1) {
                        $(fieldset).addClass('filtering');
                    } else {
                        $(fieldset).addClass('show-field');
                    }
                }
            }
        } else {
            fields.removeClass('filtering show-field');
        }
});

$(document).on('click', '.my-call-filter .btn-hide', function() {

    var fields = $('#my-calls-profile .form-group-fieldset');

    if ($(this).hasClass('hide-fields')) {
        fields.each(function(index, fieldset){
            var emptyFieldsCount = 0;

            var profileField = $(fieldset).find('.profile-field');

            if (profileField.length > 0) {
                for (var i = 0; i < profileField.length; i++) {
                    var field = $(profileField[i]).find('.form-control');

                    if (field.length > 0) {
                        if (field.val() !== '') {
                            emptyFieldsCount = 0;
                            break;
                        }

                        emptyFieldsCount++;
                    }
                }
            }

            if (emptyFieldsCount > 0) {
                $(fieldset).addClass('hide-empty');
            }
        });

    } else {
        fields.removeClass('hide-empty');
    }

    $(this).toggleClass('show-fields hide-fields');
});

//Fix for Firefox, correct focus if multiple bootstrap modal windows are open
if ( typeof($.fn.modal.Constructor.prototype.enforceFocus) === 'function') {
    $.fn.modal.Constructor.prototype.enforceFocus = function () {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', function() {
                var that = this;

                $.proxy(function (e) {
                    if (document !== e.target &&
                        this.$element[0] !== e.target &&
                        !this.$element.has(e.currentTarget).length) {
                        this.$element.trigger('focus');
                    }
                }, that)
            })
    };
}

//# sourceURL=ui-helper.js
