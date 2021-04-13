$(function () {

    $(document).on('click', 'a.reset_translation', function (event) {
        var resetButton = $(this);
        $.post(
            resetButton.attr('data-target'),
            {
                category: resetButton.attr('data-name'),
                translationId: resetButton.attr('data-pk')
            },
            function (response) {
                resetButton.closest('tr').remove();
                if (!$('.modified-translation-row').length) {
                    $('#serviceModalPopup')
                        .find('.modal-body')
                        .find('form')
                        .submit();
                }
            });
    });

    $('#serviceModalPopup').on('hidden.bs.modal', function (event) {
       if($('.modalPopup:visible').length) {
           $('body').addClass('modal-open');
       }
    });


    $(document).on('click', 'a.reset_field_description', function (event) {
        var resetButton = $(this);
        $.post(
            resetButton.attr('data-target'),
            {
                form: resetButton.attr('data-form'),
                path: resetButton.attr('data-path'),
                id: resetButton.attr('data-pk')
            },
            function (response) {
                resetButton.closest('tr').remove();
                if (!$('.modified-description-row').length) {
                    $('#serviceModalPopup')
                        .find('.modal-body')
                        .find('form')
                        .submit();
                }
            });
    });


});