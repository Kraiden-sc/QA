$(function () {
    var tableColumns = null;
    var href = location.href,
        separator = '?';
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
    if (href.includes('/index?')) {
        separator = '/index?';
    }
    if (href.includes('/index')) {
        separator = '/index';
    }

    var pagePrefix = href.split(separator)[0];
    var storageKey = 'columnsSelector.' + pagePrefix;

    function checkLocalStorageAndSetSelectedBeforeValues(tableId, table, columns) {
        var selectedBeforeValues = localStorage.getItem(storageKey + '.' + tableId);
        var savedColumns = JSON.parse(selectedBeforeValues);
        if (savedColumns) {
            $.each(savedColumns, function (key, savedColumn) {
                if (columns[savedColumn.value] && !columns[savedColumn.value].isBulkChangeColumn) {
                    columns[savedColumn.value].selected = savedColumn.selected;
                    showOrHideColumn(table, savedColumn.value, savedColumn.selected);
                }
            });
        }
        return columns;
    }

    function saveOriginColspanForTableRows(tableId, table) {
        $.each(['tbody', 'tfoot'], function (index, tablePart) {
            $(table).find('> ' + tablePart + ' > tr:not(.rowDetails)').each(function () {
                $(this).find('> td').each(function (i, td) {
                    var colspan = $(td).attr('colspan') || 1;
                    $(td).attr('data-colspan-orig', colspan);
                });
            });
        });
    }

    function createColumnsSelector(tableId, table) {
        var columns = getTableColumns(table);
        columns = checkLocalStorageAndSetSelectedBeforeValues(tableId, table, columns);
        var strToAdd = '<select id="' + tableId + '" multiple="multiple" style="display: none;">';
        var i = 0;
        $.each(columns, function (key, column) {
            if (column.hideSelector) {
                return;
            }
            var name = column.name || 'Col #' + (i + 1);
            var value = column.value;
            var selected = column.selected;
            strToAdd += '<option value="' + value + '"' + (selected ? ' selected' : '') + '>' + uiHelper.escapeHtml(name) + '</option>';
            i++;
            if (!selected) {
                showOrHideColumn(table, value, false);
            }
        });
        strToAdd += "</select>";
        var container = $(table).parents('.box').find('.tableFieldFilter-container');
        $(strToAdd).appendTo(container);
        return tableId;
    }

    function getTableColumns(table) {
        if (tableColumns) {
            return tableColumns;
        }
        tableColumns = {};
        var headerNumber = 0;
        $(table).find('thead > tr').first().find('> th').each(function (i, th) {
            var isVisibleByDefault = $(th).attr('data-def-visible');
            var isSelected = isVisibleByDefault == 'yes' || isVisibleByDefault == undefined;
            var key = $(th).attr('column-id');
            var colspan = +$(th).attr('colspan') || 1;
            tableColumns[key] = {
                name: $(th).text().trim(),
                colspan: colspan,
                value: key,
                selected: isSelected,
                number: headerNumber,
                hideSelector: $(th).attr('data-always-hide'),
                isBulkChangeColumn: $(th).attr('bulk-selector') === 'true'
            };
            headerNumber += colspan;
        });

        return tableColumns;
    }

    function showOrHideColumn(table, columnId, checked) {
        var columns = getTableColumns(table);
        var th = $(table).find('> thead > tr > th[column-id="' + columnId + '"]');
        checked ? th.removeClass('hidden') : th.addClass('hidden');

        var th = columns[columnId];

        $.each(['tbody', 'tfoot'], function (index, tablePart) {
            $(table).find('> ' + tablePart + ' > tr:not(.rowDetails)').each(function () {
                var tdNumber = 0;
                $(this).find('> td').each(function (i, td) {
                    var colspan = +$(td).attr('colspan') || 1;
                    var colspanOrig = +$(td).attr('data-colspan-orig') || 1;
                    if ((th.number + th.colspan) > tdNumber && th.number < (tdNumber + colspanOrig)) {
                        if (checked) {
                            if ($(td).hasClass('hidden')) {
                                $(td).removeClass('hidden')
                            } else if (colspan < colspanOrig) {
                                $(td).attr('colspan', colspan + 1);
                            }
                        } else {
                            if (colspan > 1) {
                                $(td).attr('colspan', colspan - 1);
                            } else {
                                $(td).addClass('hidden');
                            }
                        }
                    }
                    tdNumber += colspanOrig;
                });

                var $details = $(this).next('.rowDetails');
                if ($details.length > 0) {
                    $details.find('>td').attr('colspan', $(this).find('> td:visible').length);
                }
            });
        });

    }

    function countUpTdWidth(table) {
        var widthsTd = [];
        // change second scroll width
        $('.second_scroll .top_scroll').width($(table).outerWidth());

        // change thead.stickToTop th width if position fixed
        if ($(table).find('thead').css('position') === 'fixed') {
            $(table).find('tbody tr:first-child td').each(function (i, e) {
                var width = $(e).outerWidth();
                widthsTd[i] = width;
            });
            $(table).find('thead.stickToTop').each(function (i, e) {
                $(e).find('th').each(function (c, th) {
                    $(th).outerWidth(widthsTd[c]);
                });
            });
        }
    }

    // Export functions to allow use in row-expander.js
    window.showOrHideColumn = showOrHideColumn;
    window.countUpTdWidth   = countUpTdWidth;

    function saveChoiceInStorage(tableId, columnId, checked) {
        tableColumns[columnId].selected = checked;
        localStorage.setItem(storageKey + '.' + tableId, JSON.stringify(tableColumns));
    }

    $('table.table:not(.disableTableFieldFilter)').each(function (tableId, table) {
        saveOriginColspanForTableRows(tableId, table);
        var id = createColumnsSelector(tableId, table);

        $('#' + id).multiselect({
            buttonClass: 'btn btn-primary btn-sm ml',
            buttonWidth: '100px',
            numberDisplayed: 0,
            templates: {
                button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><b class="caret"></b></button>',
                ul: '<ul class="multiselect-container dropdown-menu"></ul>',
                filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
                filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button"><i class="glyphicon glyphicon-remove-circle"></i></button></span>',
                li: '<li><a href="javascript:void(0);" class="avrv"><label class="checkbox icheck-label"><div class="icheckbox_square-blue icheck-item"><input class="icheck-input"></div></label></a></li>',
                divider: '<li class="multiselect-item divider"></li>',
                liGroup: '<li class="multiselect-item group"><label class="multiselect-group"></label></li>'
            },
            onChange: function (option, checked, select) {
                showOrHideColumn(table, option[0].value, checked);
                saveChoiceInStorage(tableId, option[0].value, checked);
                countUpTdWidth(table);

                var th = $(table).find('thead.stickToTop th');
                var thPhantom = $(table).find('thead.stickToTop-phantom th');
                th.css('width', '');
                thPhantom.css('width', '');
                th.each(function (i) {
                    if ($(this).hasClass('hidden')) return;
                    var width = $(this).innerWidth();
                    $(this).css('width', width);
                    $(thPhantom[i]).css('width', width);
                });
            }
        });

        $(table).parents('.box').find('#bulkChangeBtn').on('click', function(){
            var th = $(table).find('th[bulk-selector="true"]');
            if (th) {
                var bulkColumnId = th.attr('column-id');
                showOrHideColumn(table, bulkColumnId, th.hasClass('hidden'));
                countUpTdWidth(table);
            }
        });

        $(table).parents('.box').find('#adjustmentModeBtn').on('click', function(){
            $('.leadAdjustmentForm').remove();
            var th = $(table).find('th[adjustment-selector="true"]');
            if (th) {
                var adjustmentColumnId = th.attr('column-id');
                showOrHideColumn(table, adjustmentColumnId, th.hasClass('hidden'));
                countUpTdWidth(table);
            }
        });
    });
    uiHelper.applyIcheck();
});
