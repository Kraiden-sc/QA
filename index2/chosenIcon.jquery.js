;
(function ($) {

    $.getCSSValue = function (classname, property, pseudo) {

        var pseudo = pseudo || null
            , classReaplce = classname.replace('.', '')
            , element = document.createElement('i');
        element.className = classReaplce;
        var value = '';

        document.body.appendChild(element);
        if (classname != '.') {
            classname = classname.trim().split(/\s+/).join('.');
            var el = document.querySelector(classname);
            if( typeof el === 'object' && el !== null ) {
                value = getComputedStyle(el, pseudo).getPropertyValue(property);
            }
        }

        document.body.removeChild(element);
        return value.replace(/\"/g,'');
    }


    $.fn.chosenIcon = function (options) {

        return this.each(function () {

            var $select = $(this),
                iconMap = {};

            // 1. Retrieve icon class from data attribute and build object for each list item
            $select.find('option').filter(function () {
                return $(this).text();
            }).each(function (i) {
                    var iconSrc = $(this).attr('data-icon');
                    iconMap[i] = $.trim(iconSrc);
                });


            // 2. Execute chosen plugin
            $select.chosen(options);


            // 2.1 add Class for specific styling
            var $chosen = $select.next().addClass('chosenIcon-container');


            // 3. add data in lis with icon name
            $select.on('chosen:showing_dropdown chosen:activate', function () {
                setTimeout(function () {
                    $chosen.find('.chosen-results li').each(function (i) {
                        var iconClassName = iconMap[i];
                        var iconContent = $.getCSSValue('.' + iconClassName, 'content', ':before');
                        $(this).attr('data-icon', iconContent);
                        var fontFamily = $.getCSSValue('.' + iconClassName, 'font-family', null);
                        $(this).css('font-family', "'" + fontFamily + "'");
                    });
                }, 0);
            });


            // 4. Change image on chosen selected element when form changes
            $select.change(function () {
                var iconClassName = ($select.find('option:selected').attr('data-icon'))
                    ? $select.find('option:selected').attr('data-icon') : null;

                if (iconClassName) {
                    var iconContent = $.getCSSValue('.' + iconClassName, 'content', ':before');
                    $chosen.find('.chosen-single span').attr('data-icon', iconContent);
                    var fontFamily = $.getCSSValue('.' + iconClassName, 'font-family', null);
                    $chosen.find('.chosen-single span').css('font-family', "'" + fontFamily + "'");
                }

            });

            $select.trigger('change');

        });
    }

})(jQuery);
