$(function () {
    $('.modalPopup').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        //var url = button.data('url'); // Extract info from data-* attributes
        var url = button.attr('data-url');
        var title = button.data('title');
        var size = button.data('size'); // 'lg' or 'sm' or hg
        var vars = button.data('vars'); // Extract info from data-vars attributes

        var modal = $(this);
        //remove prev size modificators
        modal.find('.modal-dialog')
            .removeClass("modal-sm")
            .removeClass("modal-hg")
            .removeClass("modal-full-screen")
            .removeClass('modal-lg');

        if(typeof size === "string" && size.length) {
            modal.find('.modal-dialog').addClass('modal-' + size);
        }

        if (modal.hasClass('serviceModal') && button.data('modal-title')) {
            title = button.data('modal-title');
        }
        modal.find('.modal-title-text').text(title);
        modal.find('.modal-body').html('<div class="overlay text-center"><i class="far fa-sync fa-spin"></i></div>');
        var params = {url: url, cache: false};
        if (vars) {
            params['data']   = {vars: vars};
            params['method'] = 'post';
        }

        params['error'] = function (e) {
            var errorMessage = 'Something went wrong';
            var errorClass = 'alert-danger';

            if (e !== undefined && e.status !== undefined) {
                var headerXError = e.getResponseHeader('X-Error');
                if (null != headerXError) {
                    errorClass = 'alert-warning';
                    errorMessage = headerXError;
                } else {
                    switch (e.status) {
                        case 400:
                            errorClass = 'alert-warning';
                            errorMessage = 'Bad Request';
                            break;
                        case 403:
                            errorClass = 'alert-warning';
                            errorMessage = 'You do not have permission to do this';
                            break;
                        case 404:
                            errorClass = 'alert-warning';
                            errorMessage = 'Not Found';
                            break;
                        case 406:
                            errorClass = 'alert-warning';
                            errorMessage = 'Something went wrong. Contact Phonexa Tech Team';
                            break;
                        case 302:
                            errorClass = 'alert-info';
                            errorMessage = 'Wait to be redirected...';
                            break;
                    }
                }
            }
            var errorFlash = '<div class="alert ' + errorClass + '">' +
       //                         '<h4><i class="icon glyphicon glyphicon-remove"></i> Error</h4>' +
                                errorMessage +
                             '</div>' +
                             '<div class="text-center">' +
                                '<button type="button" class="btn btn-default" data-dismiss="modal">Ok</button>' +
                             '</div>';
            modal.find('.modal-body').html(errorFlash);
        };

        $.ajax(params)
            .done(function (html) {
                modal.find('.modal-body').html(html+'<div class="preparing_data">'+uiHelper.options.loader.lazyLoadPrepare+'</div>');
            })
            .always(function() {
                uiHelper.applyPlugins("$('.modal-body .preparing_data').remove();");
            });
    });

    function isFormElementMultiple(element) {
        return typeof $(element).attr('multiple') !== "undefined";
    }

    var isSubmittingProcess = false;
    function formDataAsyncSubmitter(form, target) {
        var formButton = form.find('[type="submit"]');
        var requestOptions = {
            type: form.attr('method'),
            url: form.attr('action'),
            headers: {
                'X-Ie-Redirect-Compatibility': 1
            },
            data: null,
            success: function (data, status) {
                target.html(data);

                if (window.uiHelper != null) {
                    uiHelper.applyPlugins();
                }
            },
            error: function (e) {
                var defaultMessage = 'Something went wrong';
                var errorMessage = defaultMessage;
                var errorClass = 'alert-danger';
                if (e !== undefined && e.status !== undefined) {
                    switch(e.status) {
                        case 413:
                            errorMessage = 'File is too large';
                            break;
                        case 400:
                            errorClass = 'alert-warning';
                            errorMessage = 'Bad Request';
                            break;
                        case 403:
                            errorClass = 'alert-warning';
                            errorMessage = 'You do not have permission to do this';
                            break;
                        case 404:
                            errorClass = 'alert-danger';
                            errorMessage = 'Not Found';
                            break;
                        case 406:
                            errorClass = 'alert-warning';
                            errorMessage = 'Something went wrong. Contact Phonexa Tech Team';
                            break;
                        case 422:
                            errorClass = 'alert-warning';
                            errorMessage = 'You have exhausted the maximum number of units to create, please contact your agent';
                            break;
                        case 302:
                            errorClass = 'alert-info';
                            errorMessage = 'Wait to be redirected...';
                            break;
                    }
                }
                if (errorMessage == defaultMessage) {
                    target.find('.formLoader').remove();
                    form.append('<div class="formLoader form-error-message"><div class="text-danger text-bold bg-danger text-left" style="font-size: 2rem;">Something Went Wrong <a class="btn btn-warning" href="javascript:void(0);" onclick="$(this).parent().parent().remove();">Try Again</a></div></div>');
                    uiHelper.scrollEasy('.formLoader.form-error-message')
                } else {
                    var errorFlash = '<div class="alert ' + errorClass + '">' + errorMessage + '</div>';
                }
                target.html(errorFlash);
            },
            beforeSend: function() {
                isSubmittingProcess = true;
                if (formButton.length) {
                    formButton.prop('disabled', true);
                }
            },
            complete: function() {
                isSubmittingProcess = false;
                if (formButton.length) {
                    formButton.prop('disabled', false);
                }
            }
        };

        if (isSubmittingProcess) {
            return;
        }

        var formFiles = form.find("input[type=file]");

        if (formFiles.length == 0) {
            requestOptions.data = form.serialize();
        } else {
            var formData      = new FormData;

            $.each (formFiles, function(i, n){

                var current     = formFiles[i];
                var currentName = current.name;
                var files       = current.files;
                var isMultipleFileInput = isFormElementMultiple(current);

                if (files.length) {
                    if (!isMultipleFileInput) {
                        formData.append(currentName, files[0]);

                    } else {
                        $.each (files, function(i) {
                            formData.append(currentName, files[i]);
                        });
                    }
                }
            });

            formFiles = null;

            var formAllInputs = form.find("input[type!='file'],textarea");

            $.each (formAllInputs, function(i, n) {
                var current = $(formAllInputs[i]);
                if (current.is('textarea')) {
                    formData.append(current.prop('name'), current.val());
                } else if (current.attr('type') === 'radio') {
                    if (current.is(':checked')) {
                        formData.append(current.prop('name'), current.val());
                    }
                } else if (current.attr('type') === 'checkbox') {
                    if (current.is(':checked')) {
                        formData.append(current.prop('name'), current.val());
                    }
                } else {
                    formData.append(current.prop('name'), current.val());
                }
            });

            formAllInputs      = null;
            var formAllSelects = form.find("select");

            $.each(formAllSelects, function(i, n){

                var current = $(formAllSelects[i]);
                var isMultipleFileInput = isFormElementMultiple(formAllSelects[i]);
                var currentName = current.prop('name');
                var values      = current.val();
                if(!isMultipleFileInput) {
                    formData.append(currentName, values);
                } else {
                    if(values) {
                        $.each(values, function (i, selectedValue) {
                            formData.append(currentName, selectedValue);
                        });
                    }
                }
            });

            formAllSelects = null;

            $.extend(requestOptions, {
                data : formData,
                processData: false,
                contentType: false
            });
        }

        $.ajax(requestOptions).done(function(){
            var callbackFunc = form.attr('callback');
            if(callbackFunc){
                window[callbackFunc]();
            }
        });
    }

    $('body').on('submit', 'form[data-async]', function (event) {
        event.preventDefault();
        var form = $(this);
        var valid = true;
        if (typeof form.attr('data-validate-function') !== 'undefined'
            && form.attr('data-validate-function').length > 0) {
            valid = eval(form.attr('data-validate-function'));
        }
        if (valid) {
            var target;
            dataTarget = form.attr('data-target');
            if(typeof dataTarget !== "undefined") {
                switch (dataTarget) {
                    case 'parent':
                        target = form.parent();
                        break;
                    case 'service':
                        target = $('#serviceModalPopup').find('.modal-body');
                        break;
                    default :
                        target = $(form.attr('data-target'));
                }
            } else {
                target = $('#modalPopup').find('.modal-body');
            }

            formDataAsyncSubmitter(form, target);
        } else {
            setTimeout("$('form').find('.formLoader').hide()", 500);
        }
    });


});

var $howToUseWindow;

$(document).ready(function() {
    $howToUseWindow = $('#howToUseWindow');

    $(window).scroll(function() {
        if ($howToUseWindow.is(':visible')) {
            var currentScroll = $(window).scrollTop();
            if (currentScroll > $('body header.main-header').outerHeight()) {
                $howToUseWindow.css('top', '0');
            } else {
                calcHowToUseHeight();
            }
        }
    });
});

function howToUseShow() {
    if ($howToUseWindow.is(':visible')) {
        $howToUseWindow.hide();
    } else {
        $howToUseWindow.show().promise().done(function() {
            calcHowToUseHeight(true);
        });
    }
}

function calcHowToUseWidth() {
    if ($(window).width() < 767 || $howToUseWindow.hasClass('allWidth')) {
        $howToUseWindow.css('width', '100%');
    } else {
        if (1==2 && $howToUseWindow.find('.content').height() > $(window).outerHeight()-50) {
            $howToUseWindow.css('width', '100%');
        } else {
            $howToUseWindow.css('width', '500px');
        }
    }
}

function calcHowToUseHeight(calcWidth) {
    var calcWidth = calcWidth || false;
    if ($(window).width() < 767) {
        $howToUseWindow.css('top', '0');
    } else {
        $howToUseWindow.css('top', $('body header.main-header').outerHeight() + 'px');
    }
    if (calcWidth) {
        setTimeout('calcHowToUseWidth()', 100);
    }
}

$(document).on('click', '#howToUseWindow .closeButton', function() {
    $howToUseWindow.hide();
});
$(document).on('click', '#howToUseWindow .widthButton', function() {
    $howToUseWindow.toggleClass('allWidth');
    $(this).toggleClass('fa-arrow-circle-o-right, fa-arrow-circle-o-left');
    calcHowToUseWidth();
});

//# sourceURL=modals.js
