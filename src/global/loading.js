export function showloading(txt) {
    $("#sheet-cell-loading").find("span").text(txt).end().show();
};

export function hideloading() {
    $("#sheet-cell-loading").hide();
};