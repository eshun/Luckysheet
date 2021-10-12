
import sheetmanage from './sheetmanage';
import server from './server';
import { sheetselectlistitemHTML, sheetselectlistHTML, keycode } from './constant';
import {
    replaceHtml,
    mouseclickposition,
} from '../utils/util';
import { getSheetIndex } from '../methods/get';
import { isEditMode } from '../global/validate';
import formula from '../global/formula';
import cleargridelement from '../global/cleargridelement';
import tooltip from '../global/tooltip';
    selectTextDom
import {selectTextDom} from '../global/cursorPos';
import locale from '../locale/locale';
import Store from '../store';
import sheetConfigSetting from './sheetConfigSetting';
import {pagerInit} from '../global/api'


//表格底部名称栏区域 相关事件（增、删、改、隐藏显示、颜色等等）
let isInitialSheetConfig = false, sheetcurrentSheetitem = null, jfdbclicklagTimeout = null,oldSheetFileName = "";
function showsheetconfigmenu() {
    if (!isInitialSheetConfig) {
        isInitialSheetConfig = true;
        const _locale = locale();
        let locale_toolbar = _locale.toolbar;
        $("#sheetsheetconfigcolorur").spectrum({
            showPalette: true,
            preferredFormat: "hex",
            clickoutFiresChange: false,
            showInitial: true,
            showInput: true,
            flat: true,
            hideAfterPaletteSelect: false,
            showSelectionPalette: true,
            maxPaletteSize: 10,
            cancelText: _locale.sheetconfig.cancelText,
            chooseText: _locale.sheetconfig.chooseText,
            togglePaletteMoreText: locale_toolbar.toolMore,
            togglePaletteLessText: locale_toolbar.toolLess,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            palette: [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)"], ["rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)"], ["rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)"], ["rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)"], ["rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"], ["#c1232b", "#27727b", "#fcce10", "#e87c25", "#b5c334", "#fe8463", "#9bca63", "#fad860", "#f3a43b", "#60c0dd", "#d7504b", "#c6e579", "#f4e001", "#f0805a", "#26c0c0", "#c12e34", "#e6b600", "#0098d9", "#2b821d", "#005eaa", "#339ca8", "#cda819", "#32a487", "#3fb1e3", "#6be6c1", "#626c91", "#a0a7e6", "#c4ebad", "#96dee8"]],
            change: function (color) {
                let _input = $(this);
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "rgb(0, 0, 0)";
                }

                let oldcolor = null;
                if(sheetcurrentSheetitem.find(".sheets-item-color").length>0){
                    oldcolor = sheetcurrentSheetitem.find(".sheets-item-color").css("background-color");
                }

                sheetcurrentSheetitem.find(".sheets-item-color").remove();
                sheetcurrentSheetitem.append('<div class="sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + color + ';"></div>');
                let index = getSheetIndex(Store.currentSheetIndex);
                Store.sheetfile[index].color = color;
                server.saveParam("all", Store.currentSheetIndex, color, { "k": "color" });

                if (Store.clearjfundo) {
                    let redo = {};
                    redo["type"] = "sheetColor";
                    redo["sheetIndex"] = Store.currentSheetIndex;

                    redo["oldcolor"] = oldcolor;
                    redo["color"] = color;

                    Store.jfundo.length = 0;
                    Store.jfredo.push(redo);
                }
            }
        });

        $("#sheetsheetconfigcolorreset").click(function () {
            let oldcolor = null;
            if(sheetcurrentSheetitem.find(".sheets-item-color").length>0){
                oldcolor = sheetcurrentSheetitem.find(".sheets-item-color").css("background-color");
            }

            sheetcurrentSheetitem.find(".sheets-item-color").remove();
            let index = getSheetIndex(Store.currentSheetIndex);
            Store.sheetfile[index].color = null;
            server.saveParam("all", Store.currentSheetIndex, null, { "k": "color" } );

            if (Store.clearjfundo) {
                let redo = {};
                redo["type"] = "sheetColor";
                redo["sheetIndex"] = Store.currentSheetIndex;

                redo["oldcolor"] = oldcolor;
                redo["color"] = null;

                Store.jfundo.length = 0;
                Store.jfredo.push(redo);
            }
        });
    }

    let index = getSheetIndex(Store.currentSheetIndex);
    if (Store.sheetfile[index].color != null && Store.sheetfile[index].color.length > 0) {
        $("#sheetsheetconfigcolorur").spectrum("set", Store.sheetfile[index].color);

    }

    $("#sheetsheetconfigcolorur").parent().find("span, div, button, input, a").addClass("sheet-mousedown-cancel");

    // 如果全部按钮设置了隐藏，则不显示
    const config = sheetConfigSetting.sheetRightClickConfig;
    // if(!config.delete && !config.copy && !config.rename && !config.color && !config.hide && !config.move){
    if(Object.values(config).every(ele=> !ele)){
        return;
    }

    setTimeout(function(){
        mouseclickposition($("#sheet-rightclick-sheet-menu"), sheetcurrentSheetitem.offset().left + sheetcurrentSheetitem.width(), sheetcurrentSheetitem.offset().top - 18, "leftbottom");
    },1);
}

let sheetsheetrightclick = function (_t, _cur, e) {
    clearTimeout(jfdbclicklagTimeout);
    if (_cur.hasClass("sheets-item-name") && _cur.attr("contenteditable") == "true") {
        return;
    }
    if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton()) {
        setTimeout(function () {
            formula.setCaretPosition(formula.rangeSetValueTo.get(0), 0, formula.rangeSetValueTo.text().length);
            formula.createRangeHightlight();
            $("#sheet-input-box-index").find(".sheet-input-box-index-sheettxt").remove().end().prepend("<span class='sheet-input-box-index-sheettxt'>" + sheetmanage.getSheetName(formula.rangetosheet) + "!</span>").show();
            $("#sheet-input-box-index").css({"left": $("#sheet-input-box").css("left"), "top": (parseInt($("#sheet-input-box").css("top")) - 20) + "px", "z-index": $("#sheet-input-box").css("z-index")});
        }, 1);
    }
    else {
        //保存正在编辑的单元格内容
        if (parseInt($("#sheet-input-box").css("top")) > 0) {
            formula.updatecell(Store.sheetCellUpdate[0], Store.sheetCellUpdate[1]);
        }

        $("#sheet-input-box").removeAttr("style");
        $("#sheet-formula-functionrange .sheet-formula-functionrange-highlight").remove();
    }

    $("#sheet-area div.sheets-item").removeClass("sheets-item-active");
    _t.addClass("sheets-item-active");
    cleargridelement(e);
    sheetmanage.changeSheet(_t.data("index"));

    $("#sheet-list, #sheet-rightclick-sheet-menu").hide();

    if (_cur.hasClass("sheets-item-menu") || _cur.hasClass("fa-sort-desc") || e.which == "3") {
        sheetcurrentSheetitem = _cur.closest(".sheets-item");
        showsheetconfigmenu();
    }
}


export function initialSheetBar(){
    const _locale = locale();
    const locale_sheetconfig = _locale.sheetconfig;
    isInitialSheetConfig = false

    $("#sheet-area").on("mousedown", "div.sheets-item", function (e) {
        if(isEditMode()){
            // alert("非编辑模式下不允许该操作！");
            return;
        }

        let _t = $(this), _cur = $(e.target), _item = _cur.closest(".sheets-item");

        if (e.which == "3") {
            sheetsheetrightclick(_t, _cur, e);
            sheetcurrentSheetitem = _item;
            showsheetconfigmenu();
            return;
        }

        if (_item.hasClass("sheets-item-active") && _item.find(".sheets-item-name").attr("contenteditable") == "false") {
            jfdbclicklagTimeout = setTimeout(function () {
                Store.sheet_sheet_move_status = true;
                Store.sheet_sheet_move_data = {};
                Store.sheet_sheet_move_data.widthlist = [];

                $("#sheet-area div.sheets-item:visible").each(function (i) {
                    if (i == 0) {
                        Store.sheet_sheet_move_data.widthlist.push(parseInt($(this).outerWidth()));
                    }
                    else {
                        Store.sheet_sheet_move_data.widthlist.push(parseInt($(this).outerWidth()) + Store.sheet_sheet_move_data.widthlist[i - 1]);
                    }
                });

                Store.sheet_sheet_move_data.curindex = $("#sheet-area div.sheets-item").index(_item);
                let x = e.pageX;
                Store.sheet_sheet_move_data.curleft = x - _item.offset().left;
                Store.sheet_sheet_move_data.pageX = x;
                Store.sheet_sheet_move_data.activeobject = _item;
                Store.sheet_sheet_move_data.cursorobject = _cur;
                let _itemclone = _item.clone().css("visibility", "hidden").attr("id", "sheets-item-clone");
                _item.after(_itemclone);
                _item.css({ "position": "absolute", "opacity": 0.8, "cursor": "move", "transition": "initial", "z-index": 10 });
            }, 200);
        }
    }).on("click", "div.sheets-item", function (e) {

        if(isEditMode()){
            // alert("非编辑模式下不允许该操作！");
            return;
        }

        let _t = $(this), _cur = $(e.target);
        sheetsheetrightclick(_t, _cur, e);
        server.keepHighLightBox()
    });

    let sheetsheetnameeditor = function (_t) {
        if(Store.allowEdit===false){
            return;
        }
        _t.attr("contenteditable", "true").addClass("sheet-mousedown-cancel").data("oldtxt", _t.text());

        setTimeout(function () {
            selectTextDom(_t.get(0));
        }, 1);
    }

    $("#sheet-area").on("dblclick", "span.sheets-item-name", function (e) {
        sheetsheetnameeditor($(this));
    });

    let compositionFlag = true;
    $("#sheet-area").on("compositionstart", "span.sheets-item-name",  ()=> compositionFlag = false);
    $("#sheet-area").on("compositionend", "span.sheets-item-name", ()=> compositionFlag = true);
    $("#sheet-area").on("input", "span.sheets-item-name", function () {
        if(Store.allowEdit===false){
            return;
        }

        if(Store.limitSheetNameLength === false){
            return
        }

        let maxLength = Store.defaultSheetNameMaxLength;
        if(maxLength  === 0){
            return
        }

        setTimeout( ()=> {
            if (compositionFlag) {

                if ($(this).text().length >= maxLength) {  /* 检查：值是否越界 */
                    setTimeout(() => {
                        $(this).text($(this).text().substring(0, maxLength));

                        let range = window.getSelection();
                        range.selectAllChildren(this);
                        range.collapseToEnd();
                    }, 0);
                 }
            }
        }, 0);
    });

    $("#sheet-area").on("blur", "span.sheets-item-name", function (e) {
        if(Store.allowEdit===false){
            return;
        }

        if(0 === $(this).text().length){

            tooltip.info("", locale_sheetconfig.sheetNamecannotIsEmptyError);

            setTimeout(()=>{
                $(this).text(oldSheetFileName);
                sheetsheetnameeditor($(this));
                $(this).focus();
            }, 1);
            return;
        }

        let _t = $(this);
        let txt = _t.text(), oldtxt = _t.data("oldtxt");
        if(txt.length>31 || txt.charAt(0)=="'" || txt.charAt(txt.length-1)=="'" || /[：\:\\\/？\?\*\[\]]+/.test(txt)){
            alert(locale_sheetconfig.sheetNameSpecCharError);
            setTimeout(()=>{
                sheetsheetnameeditor($(this));
                $(this).focus();
            }, 1);
            return;
        }

        let index = getSheetIndex(Store.currentSheetIndex);
        for (let i = 0; i < Store.sheetfile.length; i++) {
            if (index != i && Store.sheetfile[i].name == txt) {
                if(isEditMode()){
                    alert(locale_sheetconfig.tipNameRepeat);
                }
                else{
                    tooltip.info("", locale_sheetconfig.tipNameRepeat);
                }
                _t.text(oldtxt).attr("contenteditable", "false");
                return;
            }
        }

        sheetmanage.sheetArrowShowAndHide();

        Store.sheetfile[index].name = txt;
        server.saveParam("all", Store.currentSheetIndex, txt, { "k": "name" });

        _t.attr("contenteditable", "false").removeClass("sheet-mousedown-cancel");

        if (Store.clearjfundo) {
            let redo = {};
            redo["type"] = "sheetName";
            redo["sheetIndex"] = Store.currentSheetIndex;

            redo["oldtxt"] = oldtxt;
            redo["txt"] = txt;

            Store.jfundo.length = 0;
            Store.jfredo.push(redo);
        }
    });

    $("#sheet-area").on("keydown", "span.sheets-item-name", function (e) {
        if(Store.allowEdit===false){
            return;
        }
        let kcode = e.keyCode;
        let _t = $(this);
        if (kcode == keycode.ENTER) {
            let index = getSheetIndex(Store.currentSheetIndex);
            oldSheetFileName = Store.sheetfile[index].name || oldSheetFileName;
            Store.sheetfile[index].name = _t.text();
            _t.attr("contenteditable", "false");
        }
    });

    $("#sheetsheetconfigrename").click(function () {
        sheetsheetnameeditor(sheetcurrentSheetitem.find("span.sheets-item-name"));
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();
    });

    $("#sheetsheetconfigshow").click(function () {
        $("#sheets-m").click();
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-rightclick-sheet-menu").hide();
    });

    $("#sheetsheetconfigmoveleft").click(function () {
        if (sheetcurrentSheetitem.prevAll(":visible").length > 0) {
            sheetcurrentSheetitem.insertBefore(sheetcurrentSheetitem.prevAll(":visible").eq(0));
            sheetmanage.reOrderAllSheet();
        }
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();
    });

    $("#sheetsheetconfigmoveright").click(function () {
        if (sheetcurrentSheetitem.nextAll(":visible").length > 0) {
            sheetcurrentSheetitem.insertAfter(sheetcurrentSheetitem.nextAll(":visible").eq(0));
            sheetmanage.reOrderAllSheet();
        }
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();
    });

    $("#sheetsheetconfigdelete").click(function (e) {
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();

        if($("#sheet-container-c .sheets-item:visible").length <= 1){
            if(isEditMode()){
                alert(locale_sheetconfig.noMoreSheet);
            }
            else{
                tooltip.info(locale_sheetconfig.noMoreSheet, "");
            }

            return;
        }

        let index = getSheetIndex(Store.currentSheetIndex);

        tooltip.confirm(locale_sheetconfig.confirmDelete+"【" + Store.sheetfile[index].name + "】？", "<span style='color:#9e9e9e;font-size:12px;'>"+locale_sheetconfig.redoDelete+"</span>", function () {
            sheetmanage.deleteSheet(sheetcurrentSheetitem.data("index"));
        }, null);

        $("#sheet-input-box").removeAttr("style");
    });

    $("#sheetsheetconfigcopy").click(function (e) {
        sheetmanage.copySheet(sheetcurrentSheetitem.data("index"), e);
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();
    });

    $("#sheetsheetconfighide").click(function () {
        if ($("#sheet-area div.sheets-item:visible").length == 1) {
            if(isEditMode()){
                alert(locale_sheetconfig.noHide);
            }
            else{
                tooltip.info("", locale_sheetconfig.noHide);
            }
            return;
        }
        sheetmanage.setSheetHide(sheetcurrentSheetitem.data("index"));
        $("#sheet-input-box").removeAttr("style");
        $("#sheet-list, #sheet-rightclick-sheet-menu").hide();
    });

    if(isEditMode()){//此模式下禁用公式栏        
        $("#sheets-add").addClass("sheet-button-disable");
    }

    $("#sheets-add").click(function (e) {
        //保存正在编辑的单元格内容
        if (parseInt($("#sheet-input-box").css("top")) > 0) {
            formula.updatecell(Store.sheetCellUpdate[0], Store.sheetCellUpdate[1]);
        }

        sheetmanage.addNewSheet(e);
        sheetmanage.locationSheet();
        $("#sheet-input-box").removeAttr("style");
    });

    let sheetscrollani = null, sheetscrollstart = 0, sheetscrollend = 0, sheetscrollstep = 150;
    $("#sheets-leftscroll").click(function () {
        let _c = $("#sheet-container-c");
        sheetscrollstart = _c.scrollLeft();
        sheetscrollend = _c.scrollLeft() - sheetscrollstep;

        if (sheetscrollend <= 0) {
            $("#sheet-container .docs-sheet-fade-left").hide();
        }
        $("#sheet-container .docs-sheet-fade-right").show();

        clearInterval(sheetscrollani);
        sheetscrollani = setInterval(function () {
            sheetscrollstart -= 4;
            _c.scrollLeft(sheetscrollstart);
            if (sheetscrollstart <= sheetscrollend) {
                clearInterval(sheetscrollani);
            }
        }, 1);
    });

    $("#sheets-rightscroll").click(function () {
        let _c = $("#sheet-container-c");
        sheetscrollstart = _c.scrollLeft();
        sheetscrollend = _c.scrollLeft() + sheetscrollstep;

        if (sheetscrollstart > 0) {
            $("#sheet-container .docs-sheet-fade-right").hide();
        }
        $("#sheet-container .docs-sheet-fade-left").show();

        clearInterval(sheetscrollani);
        sheetscrollani = setInterval(function () {
            sheetscrollstart += 4;
            _c.scrollLeft(sheetscrollstart);
            if (sheetscrollstart >= sheetscrollend) {
                clearInterval(sheetscrollani);
            }
        }, 1);
    });

    let initialOpenSheet = true;
    $("#sheets-m").click(function (e) {
        //保存正在编辑的单元格内容
        if (parseInt($("#sheet-input-box").css("top")) > 0) {
            formula.updatecell(Store.sheetCellUpdate[0], Store.sheetCellUpdate[1]);
        }

        $("#sheet-list").html("");

        let item = "";
        for (let i = 0; i < Store.sheetfile.length; i++) {
            let f = Store.sheetfile[i], icon = '', style = "";
            if (f["status"] == 1) {
                icon = '<i class="fa fa-check" aria-hidden="true"></i>';
            }

            if (f["hide"] == 1) {
                icon = '<i class="fa fa-low-vision" aria-hidden="true"></i>';
                style += "color:#BBBBBB;";
            }

            if (f["color"] != null && f["color"].length > 0) {
                style += "border-right:4px solid " + f["color"] + ";";
            }

            item += replaceHtml(sheetselectlistitemHTML, { "index": f["index"], "name": f["name"], "icon": icon, "style": style });
        }

        if (initialOpenSheet) {
            $("#" + Store.container).append(replaceHtml(sheetselectlistHTML, { "item": item }));
            $("#sheet-list").on("click", ".sheet-cols-menuitem", function (e) {
                if(isEditMode()){
                    // tooltip.info("提示", "图表编辑模式下不允许该操作！");
                    alert(locale_sheetconfig.chartEditNoOpt);
                    return;
                }

                let _item = $(this), index = _item.data("index");

                if (_item.data("index") != Store.currentSheetIndex) {
                    sheetmanage.setSheetShow(index);
                    sheetmanage.locationSheet();
                }
                server.keepHighLightBox()
            });

            initialOpenSheet = false;
        }
        else {
            $("#sheet-list").html(item);
        }

        let _t = $("#sheet-list");

        let left = $(this).offset().left - $('#' + Store.container).offset().left;
        let bottom = $(this).height() + $('#sheet-sta-content').height() + 12;
        _t.css({left: left + 'px', bottom: bottom + 'px'}).show();
        $("#sheet-input-box").removeAttr("style");
    });

    // 初始化分页器
    if (sheetConfigSetting.pager) {
        pagerInit(sheetConfigSetting.pager)
    }

}
