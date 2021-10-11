import selection from '../controllers/selection';
import menuButton from '../controllers/menuButton';

export default function cleargridelement(event) {
    $("#sheet-cols-h-hover").hide();
    $("#sheet-rightclick-menu").hide();

    $("#sheet-cell-selected-boxs .sheet-cell-selected").hide();
    $("#sheet-cols-h-selected .sheet-cols-h-selected").hide();
    $("#sheet-rows-h-selected .sheet-rows-h-selected").hide();

    $("#sheet-cell-selected-focus").hide();
    $("#sheet-rows-h-hover").hide();
    $("#sheet-selection-copy .sheet-selection-copy").hide();
    $("#sheet-cols-menu-btn").hide();
    $("#sheet-row-count-show, #sheet-column-count-show").hide();
    if (!event) {
        selection.clearcopy(event);
    }
    //else{
    //	selection.clearcopy();
    //}

    //选区下拉icon隐藏
    if($("#sheet-dropCell-icon").is(":visible")){
        if(event){
            $("#sheet-dropCell-icon").remove();
        }
    }
    //格式刷
    if(menuButton.luckysheetPaintModelOn && !event){
        menuButton.cancelPaintModel();
    }
}