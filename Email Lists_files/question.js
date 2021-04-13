question = {
    answerId    : 0,

    minLength   : 0,
    maxLength   : 0,

    feedback    : null,
    reactionId  : null,
    rating      : null,

    agreement   : 0,

    currentDialog : null,

    nameCookieForQuestion   : 'issetQuestion',
    issetQuestion           : 1,
    notIssetQuestion        : 0,


    getAnswerId : function () {
        return question.answerId;
    },

    setAnswerId : function (answerId) {
        question.answerId = answerId;
    },

    getFeedback : function () {
        return question.feedback;
    },

    setFeedback : function (feedback) {
        if (feedback.length > 0) {
            question.feedback = feedback;
        }
    },

    getReactionId : function () {
        return question.reactionId;
    },

    setReactionId : function (reactionId) {
        question.reactionId = reactionId;
    },

    getAgreement : function () {
        return question.agreement;
    },

    setAgreement : function (agreement) {
        question.agreement = agreement;
    },

    getRating : function () {
        return question.rating;
    },

    setRating : function (rating) {
        question.rating = rating;
    },

    getMinLength : function () {
        return question.minLength;
    },

    setMinLength : function (minLength) {
        question.minLength = minLength;
    },

    getMaxLength : function () {
        return question.maxLength;
    },

    setMaxLength : function (maxLength) {
        question.maxLength = maxLength;
    },

    getDataCookie : function() {
        question.nameCookieForQuestion
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + question.nameCookieForQuestion.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    setDataCookie : function(val) {
        var date = new Date(new Date().getTime() + 7200 * 1000);
        document.cookie = question.nameCookieForQuestion+"="+val+"; path=/; expires=" + date.toUTCString();
    },

    disabledButtonGetQuestion : 0,

    timeoutDisabledButtonGetQuestion : function () {
        question.disabledButtonGetQuestion = 1;
        setTimeout(function() {
            question.disabledButtonGetQuestion = 0;
        }, 1000);
    },

    getQuestion : function () {
        if (question.disabledButtonGetQuestion == 1) {
            return;
        }
        question.timeoutDisabledButtonGetQuestion();

        $.ajax({
            type: "GET",
            url: '/api/question/get-question',
            cache: false,
            success: function(data){
                if (question.successQuestion(data)) {
                    question.loadForm(data.response);
                } else {
                    question.setDataCookie(question.notIssetQuestion);
                    question.hideBlock();
                }
            }
        });
    },

    successQuestion : function (data) {
        if (data.code == 200) {
            if (data.response.length !== 0) {
                return true;
            }
        }

        return false;
    },

    loadForm : function (data) {

        question.setAnswerId(data.question.answerId);

        if (data.question.type == 1) {
            question.htmlContentForType1(data);
        } else if (data.question.type == 2) {
            question.htmlContentForType2(data);
        } else if (data.question.type == 3) {
            question.htmlContentForType3(data);
        } else {
            question.htmlContentForType3(data);
        }
    },

    //rating
    htmlContentForType1 : function (data) {
        question.setMaxLength(data.feedbackLength.max);

        var html = '';
        html += '<p>' + data.question.extendedText + '</p>';
        html += question.ratingStars();

        html += '<br><p align="center"><b data-question-show-feedback-button class="question-show-feedback-button" onclick="question.showFeedBack()">Add a feedback</b></p>';
        html += '<div class="form-group display-none" data-question-show-feedback>';
        html += '<textarea class="form-control" rows="3" placeholder="feedback" data-question-feedback data-question-type-rating></textarea>';
        html += '<p>Maximum  length '+question.getMaxLength()+' character</p>';
        html += '</div>';
        html += question.agreementText(data.agreementText);

        bootbox.confirm({
            title: data.question.text,
            message: html,
            buttons: {
                confirm: {
                    label: 'Send',
                    className: 'btn-primary'
                },
            },
            callback: function (result) {
                if (result) {
                    question.sendAnswer();
                }
            }
        });
        question.setStyleForBootBox();
        question.setDisabledButton();
    },

    //reaction
    htmlContentForType2 : function (data) {
        question.setMaxLength(data.feedbackLength.max);

        var html = '';
        html += '<p>' + data.question.extendedText + '</p>';
        html += '<br><p align="center"><b data-question-show-feedback-button class="question-show-feedback-button" onclick="question.showFeedBack()">Add a feedback</b></p>';
        html += '<div class="form-group display-none" data-question-show-feedback>';
        html += '<textarea class="form-control" rows="3" placeholder="feedback" data-question-feedback data-question-type-reaction></textarea>';
        html += '<p>Maximum  length '+question.getMaxLength()+' character</p>';
        html += '</div>';

        $.each(data.buttons, function(index, value) {
            var style = '';
            if (value.color) {
                style += 'color:'+value.color+'; ';
            }

            if (value.bgColor) {
                style += 'background-color:'+value.bgColor+'; ';
            }

            html += '<button type="button" data-question-button-reaction class="btn btn-block btn-primary" onclick="question.clickReaction('+value.params.reactionId+');" style="'+style+'">'+value.title+'</button>';
        });
        html += question.agreementText(data.agreementText);

        question.currentDialog = bootbox.dialog({
            title: data.question.text,
            message: html,
        });
        question.setStyleForBootBox();
    },

    clickReaction : function (reactionId) {
        question.setReactionId(reactionId);
        question.sendAnswer();
        question.currentDialog.modal('hide');
    },

    //feedback
    htmlContentForType3 : function (data) {
        question.setMinLength(data.feedbackLength.min);
        question.setMaxLength(data.feedbackLength.max);

        var html = '';
        html += '<p>' + data.question.extendedText + '</p>';
        html += '<div class="form-group">';
        html += '<textarea class="form-control" rows="3" placeholder="feedback" data-question-feedback data-question-type-feedback></textarea>';
        html += '<p>Minimum  length '+question.getMinLength()+' character, maximum  length '+question.getMaxLength()+' character</p>';
        html += '</div>';
        html += question.agreementText(data.agreementText);

        bootbox.confirm({
            title: data.question.text,
            message: html,
            buttons: {
                confirm: {
                    label: 'Send',
                    className: 'btn-primary'
                }
            },
            callback: function (result) {
                var feedback = $(this).find('[data-question-feedback]').val().trim();

                if (feedback.length > 0 && result) {
                    question.sendAnswer();
                }
            }

        });
        question.setDisabledButton();
        question.setStyleForBootBox();
    },

    ratingStars : function () {
        var html = '';
        html += '<div class="star-rating" id="star-rating" align="center">';
        html += '<div class="star-rating__wrap">';

        for (i = 5; i > 0; i--) {
            html += '<input class="star-rating__input iCheck-applied icheckNotNeeded" id="star-rating-'+i+'" type="radio" name="score" value="'+i+'">';
            html += '<label onclick="$(\'#star-rating-'+i+'\').attr(\'checked\', \'checked\'); question.setRating('+i+');  question.checkedRate();" class="star-rating__ico fa fa-star-o fa-3x" for="star-rating-'+i+'" title="'+i+' out of 5 stars"></label>';
        }

        html += '</div>';
        html += '</div>';

        return html;
    },

    sendAnswer : function () {

        var feedback = $('[data-question-feedback]').val().trim();
        question.setFeedback(feedback);
        if($('[data-question-agreement]').prop("checked")) {
            question.setAgreement(1);
        }

        var feedback    = question.getFeedback();
        var answerId    = question.getAnswerId();
        var reactionId  = question.getReactionId();
        var rating      = question.getRating();
        var agreement   = question.getAgreement();

        if (feedback == null && rating == null && reactionId == null) {
            return;
        }

        question.hideBlock();

        $.ajax({
            type: "GET",
            url: '/api/question/set-answer',
            cache: false,
            data: {'feedback': feedback, 'answerId': answerId, 'reactionId' : reactionId, 'rate' : rating, 'agreement' : agreement},
            success: function(data){

                if (data.code == 200 && data.response.length !== 0) {
                    setTimeout(function(){
                        question.modalFinish(data);
                    }, 500);
                }

                question.setDataCookie(question.notIssetQuestion);
            }
        });
    },

    modalFinish : function (data) {
        bootbox.dialog({
            title: ' ',
            message: '<b>'+data.response.message+'</b>',
            buttons: {
                ok: {
                    label: 'Close',
                    className: 'btn-primary'
                }
            },
        });
        question.setStyleForBootBox();
    },

    showFeedBack : function () {
        $('[data-question-show-feedback]').removeClass('display-none');
        $('[data-question-show-feedback]').addClass('display-block');
        $('[data-question-show-feedback-button]').addClass('display-none');
    },

    setStyleForBootBox : function () {
        $('.bootbox .modal-dialog .modal-header').addClass('bootbox--modal-header');

    },

    hideBlock : function () {
        $('[data-question-button-call-form]').removeClass('display-block').addClass('display-none');
    },

    showBlockCss : function () {
        $('[data-question-button-call-form]').removeClass('display-none').addClass('display-block');
    },

    showBlock : function () {

        if(question.getDataCookie() == question.notIssetQuestion) {
            return;
        }

        if(question.getDataCookie() == question.issetQuestion) {
            question.showBlockCss();
            return;
        }


        $.ajax({
            type: "GET",
            url: '/api/question/get-question',
            cache: false,
            success: function(data){
                if (question.successQuestion(data)) {
                    if (data.response.question.type == 2 && !data.response.buttons) {
                        question.hideBlock();
                        return;
                    }

                    question.setDataCookie(question.issetQuestion);
                    question.showBlockCss();
                } else {
                    question.setDataCookie(question.notIssetQuestion);
                }
            }
        });
    },

    setDisabledButton : function() {
        $('[data-bb-handler="confirm"], [data-question-button-reaction]').attr('disabled', 'disabled');
    },

    unsetDisabledButton : function() {
        $('[data-bb-handler="confirm"], [data-question-button-reaction]').removeAttr('disabled');
    },

    lengthFeedback : function(thisFeedback) {
        var feedback = thisFeedback.val().trim();

        if (feedback.length >= question.getMinLength() && feedback.length <= question.getMaxLength()) {
            question.unsetDisabledButton();
        } else {
            question.setDisabledButton();
        }
    },

    checkedRate : function() {
        var feedback = $('[data-question-type-rating]').val().trim();
        if (feedback.length >= question.getMinLength() && feedback.length <= question.getMaxLength() && question.getRating()) {
            question.unsetDisabledButton();
        } else {
            question.setDisabledButton();
        }
    },

    agreementText : function(agreementText) {
        return '<br><p><input type="checkbox" name="agreement" value="1" data-question-agreement> '+agreementText.text+'</p>';
    }

}

$('body').on('keyup','[data-question-type-feedback]', function(){
   question.lengthFeedback($(this));
});

$('body').on('keyup', '[data-question-type-rating]', function(){
    question.checkedRate();
});

$('body').on('keyup', '[data-question-type-reaction]', function(){
    question.lengthFeedback($(this));
});