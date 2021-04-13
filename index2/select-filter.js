var itemsCache = '';
var selectFilter = (that) => {
    var currentUnitType = $(that).val().toLowerCase();
    var selects = $("select#searchform-caller,select#searchform-callee");

    if (currentUnitType) {
        var caller = selects.eq(0).val();
        var callee = selects.eq(1).val();
        if (itemsCache === '') {
            itemsCache = selects.html();
        }
        selects.html(itemsCache);
        selects.eq(0).val(caller);
        selects.eq(1).val(callee);
        selects.find("optgroup").each(function () {
            if ($(this).prop("label").toLowerCase() != currentUnitType) {
                $(this).remove();
            }
        });
        selects.trigger("chosen:updated");
    }
};
$(function() {
    $('.select-filter').each(function () {
        selectFilter(this);
    });
});
