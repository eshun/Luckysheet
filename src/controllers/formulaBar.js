import menuButton from './menuButton';
import {luckysheetupdateCell} from './updateCell';
import { keycode } from './constant';
import { 
    luckysheetMoveHighlightCell,
} from './sheetMove';

import insertFormula from './insertFormula';
import { 
    rowLocation, 
    colLocation, 
    mouseposition 
} from '../global/location';
import { isEditMode } from '../global/validate';
import formula from '../global/formula';
import tooltip from '../global/tooltip';
import locale from '../locale/locale';
import Store from '../store';

export function formulaBarInitial(){
    //公式栏处理

    const _locale = locale();
    const locale_formula= _locale.formula;

    if(isEditMode()){//此模式下禁用公式栏        
        $("#sheet-wa-functionbox-fx").removeClass("sheet-wa-calculate-active");
    }

    $("#sheet-functionbox-cell").focus(function () {
        if(isEditMode()){//此模式下禁用公式栏
            return;
        }

        if(Store.luckysheet_select_save.length > 0){
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];

            let row_index = last["row_focus"], col_index = last["column_focus"];
            
            // let _input = $("#sheet-rich-text-editor"),value = _input.text();
            // if(value) {
            //     formula.updatecell(row_index, col_index);
            // }
            luckysheetupdateCell(row_index, col_index, Store.flowdata, null, true);
            formula.rangeResizeTo = $("#sheet-functionbox-cell");
        }
    }).keydown(function (event) {
        if(isEditMode()){//此模式下禁用公式栏
            return;
        }

        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;
        let _input = $("#sheet-input-box");

        if (kcode == keycode.ENTER && parseInt(_input.css("top")) > 0) {
            if ($("#sheet-formula-search-c").is(":visible") && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter($("#sheet-formula-search-c").find(".sheet-formula-search-item-active"));
            }
            else {
                formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                Store.luckysheet_select_save = [{ "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]], "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]], "row_focus": Store.luckysheetCellUpdate[0], "column_focus": Store.luckysheetCellUpdate[1] }];
                luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");
                //$("#sheet-functionbox-cell").blur();
                $("#sheet-rich-text-editor").focus();
            }
            event.preventDefault();
        }
        else if (kcode == keycode.ESC && parseInt(_input.css("top")) > 0) {
            formula.dontupdate();
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            //$("#sheet-functionbox-cell").blur();
            $("#sheet-rich-text-editor").focus();
            event.preventDefault();
        }
        else if (kcode == keycode.F4 && parseInt(_input.css("top")) > 0) {
            formula.setfreezonFuc(event);
            event.preventDefault();
        }
        else if (kcode == keycode.UP && parseInt(_input.css("top")) > 0) {
            if ($("#sheet-formula-search-c").is(":visible")) {
                let _up = $("#sheet-formula-search-c").find(".sheet-formula-search-item-active").prev();
                if (_up.length == 0) {
                    _up = $("#sheet-formula-search-c").find(".sheet-formula-search-item").last();
                }
                $("#sheet-formula-search-c").find(".sheet-formula-search-item").removeClass("sheet-formula-search-item-active");
                _up.addClass("sheet-formula-search-item-active");
                event.preventDefault();
            }
        }
        else if (kcode == keycode.DOWN && parseInt(_input.css("top")) > 0) {
            if ($("#sheet-formula-search-c").is(":visible")) {
                let _up = $("#sheet-formula-search-c").find(".sheet-formula-search-item-active").next();
                if (_up.length == 0) {
                    _up = $("#sheet-formula-search-c").find(".sheet-formula-search-item").first();
                }
                $("#sheet-formula-search-c").find(".sheet-formula-search-item").removeClass("sheet-formula-search-item-active");
                _up.addClass("sheet-formula-search-item-active");
                event.preventDefault();
            }
        }
        else if (kcode == keycode.LEFT && parseInt(_input.css("top")) > 0) {
            formula.rangeHightlightselected($("#sheet-functionbox-cell"));
        }
        else if (kcode == keycode.RIGHT && parseInt(_input.css("top")) > 0) {
            formula.rangeHightlightselected($("#sheet-functionbox-cell"));
        }
        else if (!((kcode >= 112 && kcode <= 123) || kcode <= 46 || kcode == 144 || kcode == 108 || event.ctrlKey || event.altKey || (event.shiftKey && (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40))) || kcode == 8 || kcode == 32 || kcode == 46 || (event.ctrlKey && kcode == 86)) {
            formula.functionInputHanddler($("#sheet-rich-text-editor"), $("#sheet-functionbox-cell"), kcode);
        }
    }).click(function () {
        if(isEditMode()){//此模式下禁用公式栏
            return;
        }

        formula.rangeHightlightselected($("#sheet-functionbox-cell"));
    });

    //公式栏 取消（X）按钮
    $("#sheet-wa-functionbox-cancel").click(function () {
        if (!$(this).hasClass("sheet-wa-calculate-active")) {
            return;
        }
        //若有参数弹出框，隐藏
        if($("#sheet-search-formula-parm").is(":visible")){
            $("#sheet-search-formula-parm").hide();
        }
        //若有参数选取范围弹出框，隐藏
        if($("#sheet-search-formula-parm-select").is(":visible")){
            $("#sheet-search-formula-parm-select").hide();
        }

        formula.dontupdate();
        luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
    });

    //公式栏 确认（）按钮
    $("#sheet-wa-functionbox-confirm").click(function () {
        if (!$(this).hasClass("sheet-wa-calculate-active")) {
            return;
        }
        //若有参数弹出框，隐藏
        if($("#sheet-search-formula-parm").is(":visible")){
            $("#sheet-search-formula-parm").hide();
        }
        //若有参数选取范围弹出框，隐藏
        if($("#sheet-search-formula-parm-select").is(":visible")){
            $("#sheet-search-formula-parm-select").hide();
        }

        formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
    });

    //公式栏 fx按钮
    $("#sheet-wa-functionbox-fx").click(function () {
        if(isEditMode()){//此模式下禁用公式栏
            return;
        }
        //点击函数查找弹出框
        if(Store.luckysheet_select_save.length == 0){
            if(isEditMode()){
                alert(locale_formula.tipSelectCell);
            }
            else{
                tooltip.info(locale_formula.tipSelectCell,"");
            }

            return;
        }

        let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];

        let row_index = last["row_focus"], col_index = last["column_focus"];

        luckysheetupdateCell(row_index, col_index, Store.flowdata);
        
        let cell = Store.flowdata[row_index][col_index];
        if(cell != null && cell.f != null){
            //单元格有计算
            let functionStr = formula.getfunctionParam(cell.f);
            if(functionStr.fn != null){
                //有函数公式
                insertFormula.formulaParmDialog(functionStr.fn, functionStr.param);
            }
            else{
                //无函数公式
                insertFormula.formulaListDialog();
            }
        }
        else{
            //单元格无计算
            $("#sheet-rich-text-editor").html('<span dir="auto" class="sheet-formula-text-color">=</span>');
            $("#sheet-functionbox-cell").html($("#sheet-rich-text-editor").html());
            insertFormula.formulaListDialog();
        }

        insertFormula.init();
    });

    //公式选区操作
    $("#sheet-formula-functionrange").on("mousedown", ".sheet-copy", function (event) {
        formula.rangeMove = true;
        Store.luckysheet_scroll_status = true;
        formula.rangeMoveObj = $(this).parent();
        formula.rangeMoveIndex = $(this).parent().attr("rangeindex");
        
        let mouse = mouseposition(event.pageX, event.pageY);
        let x = mouse[0] + $("#sheet-cell-main").scrollLeft();
        let y = mouse[1] + $("#sheet-cell-main").scrollTop();
        $("#sheet-formula-functionrange-highlight-" + formula.rangeMoveIndex).find(".sheet-selection-copy-hc").css("opacity", 0.13);
        
        let type = $(this).data("type");
        if (type == "top") {
            y += 3;
        }
        else if (type == "right") {
            x -= 3;
        }
        else if (type == "bottom") {
            y -= 3;
        }
        else if (type == "left") {
            x += 3;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        formula.rangeMovexy = [row_index, col_index];
        $("#sheettable").css("cursor", "move");
        event.stopPropagation();
    });

    $("#sheet-formula-functionrange").on("mousedown", ".sheet-highlight", function (event) {
        formula.rangeResize = $(this).data("type");//开始状态resize
        formula.rangeResizeIndex = $(this).parent().attr("rangeindex");
        
        let mouse = mouseposition(event.pageX, event.pageY), 
            scrollLeft = $("#sheet-cell-main").scrollLeft(), 
            scrollTop = $("#sheet-cell-main").scrollTop();
        let x = mouse[0] + scrollLeft;
        let y = mouse[1] + scrollTop;
        formula.rangeResizeObj = $(this).parent();
        $("#sheet-formula-functionrange-highlight-" + formula.rangeResizeIndex).find(".sheet-selection-copy-hc").css("opacity", 0.13);
        
        if (formula.rangeResize == "lt") {
            x += 3;
            y += 3;
        }
        else if (formula.rangeResize == "lb") {
            x += 3;
            y -= 3;
        }
        else if (formula.rangeResize == "rt") {
            x -= 3;
            y += 3;
        }
        else if (formula.rangeResize == "rb") {
            x -= 3;
            y -= 3;
        }

        let row_location = rowLocation(y), 
            row = row_location[1], 
            row_pre = row_location[0], 
            row_index = row_location[2];
        let col_location = colLocation(x), 
            col = col_location[1], 
            col_pre = col_location[0], 
            col_index = col_location[2];

        let position = formula.rangeResizeObj.position();
        formula.rangeResizexy = [
            col_pre, 
            row_pre, 
            formula.rangeResizeObj.width(), 
            formula.rangeResizeObj.height(), 
            position.left + scrollLeft, 
            position.top + scrollTop, col, row
        ];
        formula.rangeResizeWinH = $("#sheet-cell-main")[0].scrollHeight;
        formula.rangeResizeWinW = $("#sheet-cell-main")[0].scrollWidth;
        Store.luckysheet_scroll_status = true;
        event.stopPropagation();
    });
}