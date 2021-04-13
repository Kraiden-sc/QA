$(function () {
    $('body').on('mousedown', '#search', function (event) {
        //event.preventDefault();
        var elm = $("input[name='search']");
        var params = {"search": elm.val()};
        var uri = elm.attr('data-url') + '/?' + jQuery.param(params);
        document.location = uri;
        return false;
    });

    $("input[name='search']").keyup(function(e){
        if(e.keyCode === 13) {
            $("#search").trigger("mousedown");
        }
    });
});