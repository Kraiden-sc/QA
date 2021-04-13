accountSecurity = {
    blocAccountSecurity : $('[data-bloc-account-security]'),

    nameCookieForAccountSecurity   : 'checkedAccountSecurity',

    //напомнить позже
    remindMeLater : function() {
        accountSecurity.setDataCookie(1, 86400); //1 день
        accountSecurity.blocAccountSecurity.removeClass('display-none');
        accountSecurity.blocAccountSecurity.addClass('display-none');
    },

    remindMeLaterAndModal : function() {
        accountSecurity.remindMeLater();
        accountSecurity.modalBootboxSuccess();
    },

    //ОК я всё сделал
    isOk : function() {
        accountSecurity.setDataCookie(1, 7776000); // 90дней
        accountSecurity.blocAccountSecurity.removeClass('display-none');
        accountSecurity.blocAccountSecurity.addClass('display-none');
        $.ajax({
            type: "GET",
            url: '/user/account-security/is-ok',
            cache: false
        });
    },

    isOkAndModal : function() {
        accountSecurity.isOk();
        accountSecurity.modalBootboxSuccess();

    },

    getDataCookie : function() {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + accountSecurity.nameCookieForAccountSecurity.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    setDataCookie : function(val, time) {
        var date = new Date(new Date().getTime() + time * 1000);
        document.cookie = accountSecurity.nameCookieForAccountSecurity+"="+val+"; path=/; expires=" + date.toUTCString();
    },

    checkIsAccoutSecurity : function() {
        if(!accountSecurity.getDataCookie() && window.location.pathname != '/user/account-security') {
            accountSecurity.isShowWindow();
        }
    },

    modalBootboxSuccess : function() {
        bootbox.dialog({
            message: '<div class="modal-body"><div class="alert alert-success alert-dismissible">'
                +'<h4><i class="icon fa fa-check"></i> Success</h4>'
                +'</div></div>',
            buttons: {
                ok: {
                    label: 'Close',
                    className: 'btn-primary'
                }
            },
        });
    },

    isShowWindow : function() {
        $.ajax({
            type: "GET",
            url: '/user/account-security/show-window',
            cache: false,
            success: function(data){
                if (data['response']== true) {
                    accountSecurity.blocAccountSecurity.removeClass('display-none');
                    if (typeof uiHelper !== 'undefined') {
                        uiHelper.resetDoubleScroll();
                    }
                }
                // else {
                //     accountSecurity.setDataCookie(1, 86400); //1 день
                // }
            }
        });
    },
}