import { selectionCopyShow, selectIsOverlap } from './select';
import { sheetColor, iconfontObjects } from './constant';
import sheetConfigSetting from './sheetConfigSetting';
import sheetMoreFormat from './moreFormat';
import alternateformat from './alternateformat';
import conditionformat from './conditionformat';
import server from './server';
import { printLineAndNumber } from './print';
import { sheet_searcharray } from './sheetSearch';
import sheetFreezen from './freezen';
import sheetsizeauto from './resize';
import { createFilter } from './filter';
import sheetSearchReplace from './searchReplace';
import sheetLocationCell from './locationCell';
import ifFormulaGenerator from './ifFormulaGenerator';
import {sheetupdateCell} from './updateCell';
import insertFormula from './insertFormula';
import sheetmanage from './sheetmanage';
import sheetPostil from './postil';
import { isRealNum, isRealNull, isEditMode, hasPartMC } from '../global/validate';
import tooltip from '../global/tooltip';
import editor from '../global/editor';
import { genarate, update, is_date } from '../global/format';
import { jfrefreshgrid, sheetrefreshgrid } from '../global/refresh';
import { sortSelection } from '../global/sort';
import sheetformula from '../global/formula';
import { rowLocationByIndex, colLocationByIndex } from '../global/location';
import { isdatatypemulti } from '../global/datecontroll';
import { rowlenByRange, getCellTextSplitArr } from '../global/getRowlen';
import { setcellvalue } from '../global/setdata';
import { getFontStyleByCell, checkstatusByCell} from '../global/getdata';
import { countfunc } from '../global/count';
import { hideMenuByCancel } from '../global/cursorPos';
import { getSheetIndex, getRangetxt, getsheet_file } from '../methods/get';
import { setsheetfile } from '../methods/set';
import {isInlineStringCell,updateInlineStringFormat,convertCssToStyleList,inlineStyleAffectAttribute,updateInlineStringFormatOutside} from './inlineString';
import { replaceHtml, getObjType, rgbTohex, mouseclickposition, sheetfontformat,sheetContainerFocus } from '../utils/util';
import {openProtectionModal,checkProtectionFormatCells,checkProtectionNotEnable} from './protection';
import Store from '../store';
import locale from '../locale/locale';
import { sheetDrawMain, sheetDrawFistBorder } from '../global/draw';
import {checkTheStatusOfTheSelectedCells,getRangeHtml,getPrintPages} from '../global/api';

import {printRange,printPages} from '../expendPlugins/print/plugin';

const menuButton = {
    "menu": '<div class="sheet-cols-menu sheet-rightgclick-menu sheet-menuButton ${subclass} sheet-mousedown-cancel" id="sheet-icon-${id}-menuButton">${item}</div>',
    // "item": '<div itemvalue="${value}" itemname="${name}" class="sheet-cols-menuitem ${sub} sheet-mousedown-cancel"><div class="sheet-cols-menuitem-content sheet-mousedown-cancel" style="padding: 3px 0px 3px 1px;"><span style="margin-right:3px;width:13px;display:inline-block;" class="icon sheet-mousedown-cancel"></span> ${name} <span class="sheet-submenu-arrow sheet-mousedown-cancel" style="user-select: none;">${example}</span></div></div>',
    "item": '<div itemvalue="${value}" itemname="${name}" class="sheet-cols-menuitem ${sub} sheet-mousedown-cancel"><div class="sheet-cols-menuitem-content sheet-mousedown-cancel" style="padding: 3px 0px 3px 1px;"><span style="margin-right:3px;width:13px;display:inline-block;" class="icon sheet-mousedown-cancel"></span> ${name} <span class="sheet-submenu-arrow sheet-mousedown-cancel ${iconClass}" style="user-select: none;">${example}</span></div></div>',
    "split": '<div class="sheet-menuseparator sheet-mousedown-cancel" role="separator"></div>',
    "color": '<div class="sheet-cols-menu sheet-rightgclick-menu sheet-rightgclick-menu-sub sheet-mousedown-cancel sheet-menuButton ${sub}" id="${id}"><div class="sheet-cols-menuitem sheet-mousedown-cancel sheet-color-reset"><div class="sheet-cols-menuitem-content sheet-mousedown-cancel">${resetColor}</div></div> <div class="sheet-mousedown-cancel"> <div class="sheet-mousedown-cancel"> <input type="text" class="sheet-color-selected" /> </div> </div> <div class="sheet-menuseparator sheet-mousedown-cancel" role="separator"></div> ${coloritem}</div>',
    "coloritem": '<div class="sheet-cols-menuitem sheet-mousedown-cancel ${class}"><div class="sheet-cols-menuitem-content sheet-mousedown-cancel">${name}</div></div>',
    "subcolor": '<div id="sheet-icon-${id}-menuButton" class="sheet-cols-menu sheet-rightgclick-menu sheet-rightgclick-menu-sub sheet-menuButton-sub sheet-mousedown-cancel"> <div class="sheet-mousedown-cancel"> <div class="sheet-mousedown-cancel"> <input type="text" class="sheet-color-selected" /> </div> </div></div>',
    "rightclickmenu": null,
    "submenuhide": {},
    focus: function(_obj, value){
        if(_obj.attr("id")=="sheet-icon-font-family-menuButton"){
            if (isdatatypemulti(value)["num"]) {
                 let  _locale = locale();
                const locale_fontarray = _locale.fontarray;
                value = locale_fontarray[parseInt(value)];
                if(value==null){
                    value = this.defualtFont[itemvalue];
                }
            }
        }
        _obj.find(".sheet-cols-menuitem").find("span.icon").html("");
        if(value == null){
            _obj.find(".sheet-cols-menuitem").eq(0).find("span.icon").html('<i class="fa fa-check sheet-mousedown-cancel"></i>');
        }
        else{
            _obj.find(".sheet-cols-menuitem[itemvalue='"+ value +"']").find("span.icon").html('<i class="fa fa-check sheet-mousedown-cancel"></i>');
        }
    },
    blur: function(_obj){
        _obj.find(".sheet-cols-menuitem").find("span.icon").html("");
    },
    createButtonMenu: function(itemdata){
        let itemset = "";
        let _this = this;

        for(let i = 0; i < itemdata.length; i++){
            let item = itemdata[i];

            if(item.value=="split"){
                itemset += _this.split;
            }
            else{
                if(item.example=="more"){
                    // itemset += replaceHtml(_this.item, {"value": item.value, "name": item.text, "example": "►", "sub": "sheet-cols-submenu"});
                    itemset += replaceHtml(_this.item, {"value": item.value, "name": item.text, "example": "", "sub": "sheet-cols-submenu", "iconClass": "iconfont sheet-iconfont-youjiantou"});

                }
                else{
                    itemset += replaceHtml(_this.item, {"value": item.value, "name": item.text, "example": item.example, "sub": "", "iconClass": ""});
                }
            }
        }

        return itemset;
    },
    cancelPaintModel: function(){
        let _this = this;

        $("#sheettable_0").removeClass("sheetPaintCursor");

        if(Store.sheet_copy_save["dataSheetIndex"] == Store.currentSheetIndex){
            Store.sheet_selection_range = [];
            selectionCopyShow();
        }
        else{
            Store.sheetfile[getSheetIndex(Store.sheet_copy_save["dataSheetIndex"])].sheet_selection_range = [];
        }
        
        Store.sheet_copy_save = {};

        _this.sheetPaintModelOn = false;
        $("#sheetpopover").fadeOut(200,function(){
            $("#sheetpopover").remove();
        });
    },
    sheetPaintModelOn:false,
    sheetPaintSingle: false,
    initialMenuButton: function(){
        let _this = this;

        //格式刷
        $("#sheet-icon-paintformat").click(function(e){
            e.stopPropagation();
            let _locale = locale();
            let locale_paint = _locale.paint;

            if(Store.sheet_select_save == null || Store.sheet_select_save.length == 0){
                if(isEditMode()){
                    alert(locale_paint.tipSelectRange);
                }
                else{
                    tooltip.info("",locale_paint.tipSelectRange);
                }
                return;
            }
            else if(Store.sheet_select_save.length > 1){
                if(isEditMode()){
                    alert(locale_paint.tipNotMulti);
                }
                else{
                    tooltip.info("",locale_paint.tipNotMulti);
                }
                return;
            }

            tooltip.popover("<i class='fa fa-paint-brush'></i> "+locale_paint.start+"", "topCenter", true, null, locale_paint.end,function(){
                _this.cancelPaintModel();
            });
            $("#sheettable_0").addClass("sheetPaintCursor");

            Store.sheet_selection_range = [{ "row": Store.sheet_select_save[0].row, "column": Store.sheet_select_save[0].column }];
            selectionCopyShow();

            let RowlChange = false, HasMC = false;
            for(let r = Store.sheet_select_save[0].row[0]; r <= Store.sheet_select_save[0].row[1]; r++){
                if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
                    continue;
                }

                if (Store.config["rowlen"] != null && (r in Store.config["rowlen"])){
                    RowlChange = true;
                }

                for(let c = Store.sheet_select_save[0].column[0]; c <= Store.sheet_select_save[0].column[1]; c++){
                    let cell = Store.flowdata[r][c];
                    
                    if(getObjType(cell) == "object" && ("mc" in cell) && cell.mc.rs != null){
                        HasMC = true;
                    }
                }
            }
            Store.sheet_copy_save = { "dataSheetIndex": Store.currentSheetIndex, "copyRange": [{ "row": Store.sheet_select_save[0].row, "column": Store.sheet_select_save[0].column }], "RowlChange": RowlChange, "HasMC": HasMC };

            _this.sheetPaintModelOn = true;
            _this.sheetPaintSingle = true;
        });
        $("#sheet-icon-paintformat").dblclick(function(){
            let _locale = locale();
            let locale_paint = _locale.paint;
            if(Store.sheet_select_save == null || Store.sheet_select_save.length == 0){
                if(isEditMode()){
                    alert(locale_paint.tipSelectRange);
                }
                else{
                    tooltip.info("",locale_paint.tipSelectRange);  
                }
                return;
            }
            else if(Store.sheet_select_save.length > 1){
                if(isEditMode()){
                    alert(locale_paint.tipNotMulti);
                }
                else{
                    tooltip.info("",locale_paint.tipNotMulti);
                }
                return;
            }

            tooltip.popover("<i class='fa fa-paint-brush'></i> "+locale_paint.start, "topCenter", true, null, locale_paint.end,function(){
                _this.cancelPaintModel();
            });
            $("#sheettable_0").addClass("sheetPaintCursor");

            Store.sheet_selection_range = [{ "row": Store.sheet_select_save[0].row, "column": Store.sheet_select_save[0].column }];
            selectionCopyShow();

            let RowlChange = false, HasMC = false;
            for(let r = Store.sheet_select_save[0].row[0]; r <= Store.sheet_select_save[0].row[1]; r++){
                if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
                    continue;
                }

                if (Store.config["rowlen"] != null && (r in Store.config["rowlen"])){
                    RowlChange = true;
                }

                for(let c = Store.sheet_select_save[0].column[0]; c <= Store.sheet_select_save[0].column[1]; c++){
                    let cell = Store.flowdata[r][c];
                    
                    if(getObjType(cell) == "object" && ("mc" in cell) && cell.mc.rs != null){
                        HasMC = true;
                    }
                }
            }
            Store.sheet_copy_save = { "dataSheetIndex": Store.currentSheetIndex, "copyRange": [{ "row": Store.sheet_select_save[0].row, "column": Store.sheet_select_save[0].column }], "RowlChange": RowlChange, "HasMC": HasMC };
            
            _this.sheetPaintModelOn = true;
            _this.sheetPaintSingle = false;
        });

        //货币格式
        $("#sheet-icon-currency").click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);//取数据

            _this.updateFormat(d, "ct", "¥ #.00");
        });

        //百分比
        $("#sheet-icon-percent").click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);//取数据

            _this.updateFormat(d, "ct", "0.00%");
        });

        //减少小数位数
        $("#sheet-icon-fmt-decimal-decrease").click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);//取数据
            let row_index = Store.sheet_select_save[0]["row_focus"], 
                col_index = Store.sheet_select_save[0]["column_focus"];
            let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
            let cell = d[row_index][col_index];

            if(foucsStatus == null || foucsStatus.t != "n"){
                return;
            }

            if(foucsStatus.fa == "General"){
                let mask = genarate(cell.v);
                foucsStatus = mask[1];
            }

            //万亿格式
            let reg = /^(w|W)((0?)|(0\.0+))$/;
            if(reg.test(foucsStatus.fa)){
                if(foucsStatus.fa.indexOf(".") > -1){
                    if(foucsStatus.fa.substr(-2) == ".0"){
                        _this.updateFormat(d, "ct", foucsStatus.fa.split(".")[0]);
                    }
                    else{
                        _this.updateFormat(d, "ct", foucsStatus.fa.substr(0, foucsStatus.fa.length - 1));   
                    }
                }
                else{
                    _this.updateFormat(d, "ct", foucsStatus.fa);
                }

                return;
            }
            //Uncaught ReferenceError: Cannot access 'fa' before initialization
            let prefix = "", main = "", fa = [];
            if(foucsStatus.fa.indexOf(".")>-1){
                fa = foucsStatus.fa.split(".");
                prefix = fa[0];
                main = fa[1];
            }
            else{
                return;
            }

            fa = main.split("");
            let tail = "";
            for(let i = fa.length-1; i >= 0; i--){
                let c = fa[i];
                if((c!="#" && c!="0" && c!="," && isNaN(parseInt(c)))) {
                    tail = c + tail;
                }
                else{
                    break;
                }
            }

            let fmt = "";
            if(foucsStatus.fa.indexOf(".")>-1){
                let suffix = main;
                if(tail.length>0){
                    suffix = main.replace(tail, "");
                }

                let pos = suffix.replace(/#/g, "0");
                pos = pos.substr(0, pos.length-1);
                if(pos==""){
                    fmt = prefix + tail;
                }
                else{
                    fmt = prefix + "." + pos + tail;
                }
            }

            _this.updateFormat(d, "ct", fmt);
        });

        //增加小数位数
        $("#sheet-icon-fmt-decimal-increase").click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);//取数据
            let row_index = Store.sheet_select_save[0]["row_focus"], 
                col_index = Store.sheet_select_save[0]["column_focus"];
            let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
            let cell = d[row_index][col_index];

            if(foucsStatus== null || foucsStatus.t != "n"){
                return;
            }

            if(foucsStatus.fa == "General"){
                let mask = genarate(cell.v);
                foucsStatus = mask[1];
            }

            if(foucsStatus.fa == "General"){
                _this.updateFormat(d, "ct", "#.0");
                return;
            }

            //万亿格式
            let reg = /^(w|W)((0?)|(0\.0+))$/;
            if(reg.test(foucsStatus.fa)){
                if(foucsStatus.fa.indexOf(".") > -1){
                    _this.updateFormat(d, "ct", foucsStatus.fa + "0");
                }
                else{
                    if(foucsStatus.fa.substr(-1) == "0"){
                        _this.updateFormat(d, "ct", foucsStatus.fa + ".0");
                    }
                    else{
                        _this.updateFormat(d, "ct", foucsStatus.fa + "0.0");
                    }
                }

                return;
            }

            //Uncaught ReferenceError: Cannot access 'fa' before initialization
            let prefix = "", main = "", fa = [];
            
            if(foucsStatus.fa.indexOf(".")>-1){
                fa = foucsStatus.fa.split(".");
                prefix = fa[0];
                main = fa[1];
            }
            else{
                main = foucsStatus.fa;
            }

            fa = main.split("");
            let tail = "";
            for(let i = fa.length - 1; i >= 0; i--){
                let c = fa[i];
                if(( c!="#" && c!="0" && c!="," && isNaN(parseInt(c)))) {
                    tail = c + tail;
                }
                else{
                    break;
                }
            }

            let fmt = "";
            if(foucsStatus.fa.indexOf(".")>-1){
                let suffix = main;
                if(tail.length>0){
                    suffix = main.replace(tail, "");
                }

                let pos = suffix.replace(/#/g, "0");
                pos += "0";
                fmt = prefix + "." + pos + tail;
            }
            else{
                if(tail.length>0){
                    fmt = main.replace(tail, "") + ".0" + tail;
                }
                else{
                    fmt = main + ".0" + tail;
                }
            }


            _this.updateFormat(d, "ct", fmt);
        });

        //更多格式
        $("#sheet-icon-fmt-other").click(function(){
            const _locale = locale();
            const locale_format = _locale.format;
            const locale_defaultFmt = _locale.defaultFmt;

            let menuButtonId = $(this).attr("id")+"-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                let itemdata = locale_defaultFmt;

                let itemset = _this.createButtonMenu(itemdata);

                // sheet-menuButton-sub
                let menu = replaceHtml(_this.menu, {"id": "fmt-other", "item": itemset, "subclass": "", "sub": ""});

                let subitemdata = [
                    {"text":locale_format.moreCurrency+"...", "value":"morecurrency", "example":""},
                    {"text":locale_format.moreDateTime+"...", "value":"moredatetime", "example":""},
                    {"text":locale_format.moreNumber+"...", "value":"moredigit", "example":""}
                ];
                let subitemset = _this.createButtonMenu(subitemdata);
                let submenu = replaceHtml(_this.menu, {"id": "fmtOtherSelf", "item": subitemset, "subclass": "sheet-menuButton-sub"});
                
                //sheet-icon-fmt-other-menuButton_sub
                $("body").append(menu+submenu);
                _menuButton = $("#" + menuButtonId).width(250);
                _this.focus(_menuButton);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue"),itemname = _t.attr("itemname");
                    $("#sheet-icon-fmt-other").find(".sheet-toolbar-menu-button-caption").html(" "+ itemname +" ");

                    if(itemvalue == "fmtOtherSelf"){
                        return;
                    }

                    let d = editor.deepCopyFlowData(Store.flowdata);//取数据
                    _this.focus(_menuButton, itemvalue);

                    _this.updateFormat(d, "ct", itemvalue);
                });

                //更多格式
                $("#sheet-icon-fmtOtherSelf-menuButton").find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    $("#sheet-icon-fmtOtherSelf-menuButton").hide();
                    sheetContainerFocus();

                    let itemvalue = $(this).attr("itemvalue");

                    sheetMoreFormat.createDialog(itemvalue);
                    sheetMoreFormat.init();
                })
            } else {
                const text =$(this).find(".sheet-toolbar-menu-button-caption").text().trim();
                const format = locale_defaultFmt.find(f => f.text === text);
                if(format) {
                    _this.focus(_menuButton, format.value);
                }
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top+25, "lefttop");
        });

        //字体设置
        $("#sheet-icon-font-family").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let menuButtonId = $(this).attr("id")+"-menuButton";
            let _menuButton = $("#"+menuButtonId);
            if(_menuButton.length == 0){
                // const locale_fontarray = locale().fontarray;
                // let itemdata = [];

                // for(let a=0;a<locale_fontarray.length;a++){
                //     let fItem = locale_fontarray[a];
                //     let ret = {};
                //     ret.value = a;
                //     ret.text = "<span class='sheet-mousedown-cancel' style='font-size:11px;font-family:"+fItem+"'>"+fItem+"</span>";
                //     ret.example = "";
                //     itemdata.push(ret);
                // }

                let itemset = _this.createButtonMenu(_this.fontSelectList);

                let menu = replaceHtml(_this.menu, {"id": "font-family", "item": itemset, "subclass": "", "sub": ""});

                $("body").append(menu);
                _menuButton = $("#"+menuButtonId).width(200);
                _this.focus(_menuButton);

                _menuButton.on("click", ".sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue"), itemname = _t.attr("itemname");
                    _this.focus(_menuButton, itemvalue);
                    $("#sheet-icon-font-family").find(".sheet-toolbar-menu-button-caption").html(" "+ itemname +" ");

                    let d = editor.deepCopyFlowData(Store.flowdata);

                    _this.updateFormat(d, "ff", itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top+25, "lefttop");
        });

        //字体颜色
        $("#sheet-icon-text-color").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);
            let color =  $(this).attr("color");
            if(color == null){
                color = "#000000";
            }
            _this.updateFormat(d, "fc", color);
        });

        $("#sheet-icon-text-color-menu").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#"+menuButtonId);

            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_toolbar = _locale.toolbar;
                const locale_button = _locale.button;
                const locale_alternatingColors = _locale.alternatingColors;
                let itemdata = [
                    {"name":locale_toolbar.alternatingColors+"...", "id":"sheet-color-alternate", "example":""}
                ];

                let itemset = _this.createButtonMenu(itemdata);
                let subid = "text-color-self";
                let coloritem = replaceHtml(_this.coloritem, {"class": "sheet-icon-alternateformat", "name": locale_toolbar.alternatingColors+"..."});
                let menu = replaceHtml(_this.color, {"id":menuButtonId, "coloritem": coloritem, "colorself": subid, "sub": "","resetColor":locale_toolbar.resetColor});

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId);

                $("#" + menuButtonId).find(".sheet-color-selected").spectrum({
                    showPalette: true,
                    showPaletteOnly: true,
                    preferredFormat: "hex",
                    clickoutFiresChange: false,
                    showInitial: true,
                    showInput: true,
                    flat: true,
                    hideAfterPaletteSelect: true,
                    showSelectionPalette: true,
                    maxPaletteSize: 8,
                    maxSelectionSize: 8,
                    cancelText: locale_button.cancel,
                    chooseText: locale_button.confirm,
                    togglePaletteMoreText: locale_toolbar.customColor,
                    togglePaletteLessText: locale_toolbar.collapse,
                    togglePaletteOnly: true,
                    clearText: locale_toolbar.clearText,
                    color: sheetConfigSetting.defaultTextColor,
                    noColorSelectedText: locale_toolbar.noColorSelectedText,
                    localStorageKey: "spectrum.textcolor" + server.gridKey,
                    palette: [["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                    ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                    ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                    ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                    ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                    ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                    ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                    ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]],
                    change: function (color) {
                        let _input = $(this);
                        if (color != null) {
                            color = color.toHexString();
                        }
                        else {
                            color = "#000";
                        }

                        let oldcolor = null;
                        // $("#sheet-icon-text-color .sheet-color-menu-button-indicator").css("border-bottom-color", color);
                        // 下边框换成了一个DIV
                        $("#sheet-icon-text-color .text-color-bar").css("background-color", color);
                        $("#sheet-icon-text-color").attr("color", color);

                        let d = editor.deepCopyFlowData(Store.flowdata);
                        _this.updateFormat(d, "fc", color);

                        _menuButton.hide();
                        sheetContainerFocus();
                    },
                });

                _menuButton.find(".sheet-color-reset").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _input = $("#"+ menuButtonId).find(".sheet-color-selected");
                    _input.val("#000000");
                    $("#sheet-icon-text-color").attr("color", null);
                    _input.spectrum("set", "#000000");
                    $("#sheet-icon-text-color .sheet-color-menu-button-indicator").css("border-bottom-color", "#000000");
                    
                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "fc", null);
                });

                //交替颜色
                _menuButton.find(".sheet-icon-alternateformat").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    if(Store.sheet_select_save.length > 1){
                        if(isEditMode()){
                            alert(locale_alternatingColors.errorInfo);
                        }
                        else{
                            tooltip.info(locale_alternatingColors.errorInfo, "");
                        }
                        return;
                    }

                    let range = $.extend(true, {}, Store.sheet_select_save[0]);

                    let isExists = alternateformat.rangeIsExists(range)[0];
                    if(!isExists){
                        alternateformat.modelfocusIndex = 0;
                        alternateformat.new(range);    
                    }

                    alternateformat.init();
                    alternateformat.perfect();
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }

            let offsetTop = $(this).offset().top+26;
            setTimeout(function(){
                let _input = $("#" + menuButtonId).find(".sheet-color-selected");
                _input.spectrum("set", _input.val());
                mouseclickposition(_menuButton, menuleft-28, offsetTop, "lefttop");
            }, 1);
        });

        //背景颜色
        $("#sheet-icon-cell-color").click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);
            let color =  $(this).attr("color");
            if(color == null){
                color = "#ffffff";
            }
            _this.updateFormat(d, "bg", color);
        });

        $("#sheet-icon-cell-color-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                let subid = "cell-color-self";

                const _locale = locale();
                const locale_toolbar = _locale.toolbar;
                const locale_button = _locale.button;
                const locale_alternatingColors = _locale.alternatingColors;

                let coloritem = replaceHtml(_this.coloritem, { "class": "sheet-icon-alternateformat", "name": locale_toolbar.alternatingColors+"..." });
                let menu = replaceHtml(_this.color, { "id": menuButtonId, "coloritem": coloritem, "colorself": subid, "sub": "","resetColor":locale_toolbar.resetColor });
                
                $("body").append(menu);
                _menuButton = $("#" + menuButtonId);

                $("#" + menuButtonId).find(".sheet-color-selected").spectrum({
                    showPalette: true,
                    showPaletteOnly: true,
                    preferredFormat: "hex",
                    clickoutFiresChange: false,
                    showInitial: true,
                    showInput: true,
                    flat: true,
                    hideAfterPaletteSelect: true,
                    showSelectionPalette: true,
                    maxPaletteSize: 8,
                    maxSelectionSize: 8,
                    color: sheetConfigSetting.defaultCellColor,
                    cancelText: locale_button.cancel,
                    chooseText: locale_button.confirm,
                    togglePaletteMoreText: locale_toolbar.customColor,
                    togglePaletteLessText: locale_toolbar.collapse,
                    togglePaletteOnly: true,
                    clearText: locale_toolbar.clearText,
                    noColorSelectedText: locale_toolbar.noColorSelectedText,
                    localStorageKey: "spectrum.bgcolor" + server.gridKey,
                    palette: [
                        ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                        ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                        ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                        ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                        ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                        ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                        ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                        ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                    ],
                    change: function (color) {
                        let _input = $(this);
                        if (color != null) {
                            color = color.toHexString();
                        }
                        else {
                            color = "#fff";
                        }

                        let oldcolor = null;
                        // $("#sheet-icon-cell-color .sheet-color-menu-button-indicator").css("border-bottom-color", color);
                        // 下边框换成了一个DIV
                        $("#sheet-icon-cell-color .text-color-bar").css("background-color", color);
                        
                        $("#sheet-icon-cell-color").attr("color", color);
                        let d = editor.deepCopyFlowData(Store.flowdata);
                        _this.updateFormat(d, "bg", color);

                        _menuButton.hide();
                        sheetContainerFocus();
                    }
                });

                _menuButton.find(".sheet-color-reset").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _input = $("#" + menuButtonId).find(".sheet-color-selected");
                    _input.val("#ffffff");
                    $("#sheet-icon-cell-color").attr("color", null);
                    _input.spectrum("set", "#ffffff");
                    $("#sheet-icon-cell-color .sheet-color-menu-button-indicator").css("border-bottom-color", "#ffffff");
                    
                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "bg", null);
                });

                //交替颜色
                _menuButton.find(".sheet-icon-alternateformat").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    if(Store.sheet_select_save.length > 1){
                        if(isEditMode()){
                            alert(locale_alternatingColors.errorInfo);
                        }
                        else{
                            tooltip.info(locale_alternatingColors.errorInfo, "");
                        }
                        return;
                    }

                    let range = $.extend(true, {}, Store.sheet_select_save[0]);

                    let isExists = alternateformat.rangeIsExists(range)[0];
                    if(!isExists){
                        alternateformat.modelfocusIndex = 0;
                        alternateformat.new(range);    
                    }

                    alternateformat.init();
                    alternateformat.perfect();
                });

                $("#" + menuButtonId).find(".sheet-color-selected").val("#fff");
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }

            let offsetTop = $(this).offset().top + 26;
            setTimeout(function(){
                let _input = $("#"+ menuButtonId).find(".sheet-color-selected");
                _input.spectrum("set", _input.val());
                mouseclickposition(_menuButton, menuleft - 28, offsetTop, "lefttop");
            }, 1);
        });


        //字体大小
        let sheet_fs_setTimeout = null;
        $("#sheet-icon-font-size").mousedown(function(e){
            if (parseInt($("#sheet-input-box").css("top")) > 0){
                let w = window.getSelection();
                if(w.type!="None"){
                    let range = w.getRangeAt(0);
                    if(!range.collapsed){
                        Store.inlineStringEditRange = range.cloneRange();
                    }
                }
            }
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                let itemdata = [
                    { "text": "9", "value": "9", "example": "" },
                    { "text": "10", "value": "10", "example": "" },
                    { "text": "11", "value": "11", "example": "" },
                    { "text": "12", "value": "12", "example": "" },
                    { "text": "14", "value": "14", "example": "" },
                    { "text": "16", "value": "16", "example": "" },
                    { "text": "18", "value": "18", "example": "" },
                    { "text": "20", "value": "20", "example": "" },
                    { "text": "22", "value": "22", "example": "" },
                    { "text": "24", "value": "24", "example": "" },
                    { "text": "26", "value": "26", "example": "" },
                    { "text": "28", "value": "28", "example": "" },
                    { "text": "36", "value": "36", "example": "" },
                    { "text": "48", "value": "48", "example": "" },
                    { "text": "72", "value": "72", "example": "" }
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "font-size", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(150);
                _this.focus(_menuButton, 10);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue"), _input = $("#sheet-icon-font-size input");
                    $("#sheet-icon-font-size").attr("itemvalue", itemvalue);
                    _this.focus(_menuButton, itemvalue);
                    _input.val(itemvalue);

                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "fs", itemvalue);
                    
                    clearTimeout(sheet_fs_setTimeout);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let defualtvalue = $("#sheet-icon-font-size").attr("itemvalue");
            if(defualtvalue == null){
                defualtvalue = 10;
            }
            _this.focus(_menuButton, defualtvalue);

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");


        })
        .find("input.sheet-toolbar-textinput").keydown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).keyup(function(e){
            if(e.keyCode != 13){//Enter
                return;
            }

            let _this = $(this);

            let itemvalue = parseInt(_this.val());
            let _menuButton = $("#sheet-icon-font-size-menuButton");
            _this.focus(_menuButton, itemvalue);
            
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "fs", itemvalue);
            
            sheet_fs_setTimeout = setTimeout(function(){
                _menuButton.hide();
                _this.blur();
            }, 200);
        });

        //边框设置
        $("#sheet-icon-border-all").click(function(){

            if(!checkProtectionFormatCells(Store.currentSheetIndex)){
                return;
            }

            let d = editor.deepCopyFlowData(Store.flowdata);

            let type = $(this).attr("type");
            if(type == null){
                type = "border-all";
            }

            let subcolormenuid = "sheet-icon-borderColor-menuButton";
            let color = $("#" + subcolormenuid).find(".sheet-color-selected").val();
            let style = $("#sheetborderSizepreview").attr("itemvalue");

            if(color == null || color == ""){
                color = "#000";
            }

            if(style == null || style == ""){
                style = "1";
            }

            let cfg = $.extend(true, {}, Store.config);
            if(cfg["borderInfo"] == null){
                cfg["borderInfo"] = [];
            }

            let borderInfo = {
                "rangeType": "range",
                "borderType": type,
                "color": color,
                "style": style,
                "range": $.extend(true, [], Store.sheet_select_save)
            }

            cfg["borderInfo"].push(borderInfo);

            if (Store.clearjfundo) {
                Store.jfundo.length  = 0;

                let redo = [];

                redo["type"] = "borderChange";

                redo["config"] = $.extend(true, {}, Store.config);
                redo["curconfig"] = $.extend(true, {}, cfg);
                
                redo["sheetIndex"] = Store.currentSheetIndex;

                Store.jfredo.push(redo);
            }

            server.saveParam("cg", Store.currentSheetIndex, cfg["borderInfo"], { "k": "borderInfo" });

            Store.config = cfg;
            Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

            setTimeout(function () {
                sheetrefreshgrid();
            }, 1);
        });

        $("#sheet-icon-border-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);

            if(_menuButton.length == 0){
                let canvasH = 10, canvasW = 120;
                const _locale = locale();
                const locale_border = _locale.border;
                const locale_toolbar = _locale.toolbar;
                const locale_button = _locale.button;
                let itemdata = [
                    {"text": locale_border.borderTop, "value": "border-top", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-top iconfont sheet-iconfont-shangbiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderBottom, "value":"border-bottom", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-bottom iconfont sheet-iconfont-xiabiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderLeft, "value":"border-left", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-left iconfont sheet-iconfont-zuobiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderRight, "value":"border-right", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-right iconfont sheet-iconfont-youbiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": "", "value": "split", "example":""},
                    {"text": locale_border.borderNone, "value": "border-none", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-none iconfont sheet-iconfont-wubiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderAll, "value": "border-all", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-all iconfont sheet-iconfont-quanjiabiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderOutside, "value": "border-outside", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-outside iconfont sheet-iconfont-sizhoujiabiankuang" style="user-select: none;"> </div> </div>'},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_border.borderInside, "value": "border-inside", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-inside iconfont sheet-iconfont-neikuangxian" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderHorizontal, "value": "border-horizontal", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-horizontal iconfont sheet-iconfont-neikuanghengxian" style="user-select: none;"> </div> </div>'},
                    {"text": locale_border.borderVertical, "value": "border-vertical", "example": '<div class="sheet-icon sheet-inline-block sheet-material-icon sheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-vertical iconfont sheet-iconfont-neikuangshuxian" style="user-select: none;"> </div> </div>'},
                    {"text": "", "value": "split", "example": ""},
                    {"text": "<span id='sheet-icon-borderColor-linecolor' class='sheet-mousedown-cancel' style='border-bottom:3px solid #000;'>"+ locale_border.borderColor +"</span>", "value":"borderColor", "example":"more"},
                    {"text": ""+ locale_border.borderSize +"<img id='sheetborderSizepreview' width=100 height=10 src='data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==' style='position:absolute;bottom:-5px;right:0px;width:100px;height:10px;'>", "value":"borderSize", "example":"more"}
                ];

                // itemvalue to iconfont
                const iconfontObject = iconfontObjects.border;

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "border-menu", "item": itemset, "subclass": "", "sub": "" });

                let subitemdata = [
                    {"text": locale_border.borderNone, "value": "0", "example": ""},
                    {"text": "<canvas type='Thin' class='border-Thin' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "1", "example": ""},
                    {"text": "<canvas type='Hair' class='border-Hair' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "2", "example": ""},
                    {"text": "<canvas type='Dotted' class='border-Dotted' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "3", "example": ""},
                    {"text": "<canvas type='Dashed' class='border-Dashed' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "4", "example": ""},
                    {"text": "<canvas type='DashDot' class='border-DashDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "5", "example": ""},
                    {"text": "<canvas type='DashDotDot' class='border-DashDotDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "6", "example": ""},
                    // {"text":"<canvas type='Double' class='border-Double' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value":"7", "example":""},
                    {"text": "<canvas type='Medium' class='border-Medium' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "8", "example": ""},
                    {"text": "<canvas type='MediumDashed' class='border-MediumDashed' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "9", "example": ""},
                    {"text": "<canvas type='MediumDashDot' class='border-MediumDashDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "10", "example": ""},
                    {"text": "<canvas type='MediumDashDotDot' class='border-MediumDashDotDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "11", "example": ""},
                    // {"text":"<canvas type='SlantedDashDot' class='border-SlantedDashDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value":"12", "example":""},
                    {"text": "<canvas type='Thick' class='border-Thick' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value": "13", "example": ""}
                ];

                let subitemset = _this.createButtonMenu(subitemdata);
                let submenu = replaceHtml(_this.menu, { "id": "borderSize", "item": subitemset, "subclass": "sheet-menuButton-sub" });
                let submenuid = "sheet-icon-borderSize-menuButton";
                let subcolormenuid = "sheet-icon-borderColor-menuButton";
                let colormenu = replaceHtml(_this.color, { "id": subcolormenuid, "coloritem": "", "colorself": "", "sub": "sheet-menuButton-sub",resetColor:locale_toolbar.resetColor });

                $("body").append(menu + colormenu + submenu);
                _menuButton = $("#" + menuButtonId).width(170);
                _this.focus(_menuButton, "border-all");

                $("#" + submenuid + " canvas").each(function(i){
                    let type = $(this).attr("type");
                    let itemvalue = $(this).closest(".sheet-cols-menuitem").attr("itemvalue");
                    let canvasborder = $(this).addClass("sheet-mousedown-cancel").get(0).getContext("2d");
                    canvasborder.translate(0.5, 0.5);

                    _this.setLineDash(canvasborder, itemvalue, "h", 0, 5, 100, 5);
                    
                    canvasborder.strokeStyle = "#000000";
                    canvasborder.stroke();
                    canvasborder.closePath();
                });

                $("#" + submenuid + " .sheet-cols-menuitem").click(function(){
                    $("#"+ submenuid).hide();

                    let _t = $(this), 
                        itemvalue = _t.attr("itemvalue");
                    
                    if(itemvalue == 0){
                        $("#sheetborderSizepreview").attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==").attr("itemvalue", null);
                    }
                    else{
                        let bg = _t.find("canvas").get(0).toDataURL("image/png");
                        $("#sheetborderSizepreview").attr("src", bg).attr("itemvalue", itemvalue);
                    }
                    
                    _this.focus($("#" + submenuid), itemvalue);
                });
                
                // border choose menu
                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    if(itemvalue == "borderColor" || itemvalue == "borderSize"){
                        return;
                    }

                    if(!checkProtectionFormatCells(Store.currentSheetIndex)){
                        return;
                    }

                    let d = editor.deepCopyFlowData(Store.flowdata);

                    let color = $("#"+ subcolormenuid).find(".sheet-color-selected").val();
                    let style = $("#sheetborderSizepreview").attr("itemvalue");

                    if(color == null || color == ""){
                        color = "#000";
                    }

                    if(style == null || style == ""){
                        style = "1";
                    }

                    let cfg = $.extend(true, {}, Store.config);
                    if(cfg["borderInfo"] == null){
                        cfg["borderInfo"] = [];
                    }

                    let borderInfo = {
                        "rangeType": "range",
                        "borderType": itemvalue,
                        "color": color,
                        "style": style,
                        "range": $.extend(true, [], Store.sheet_select_save)
                    }

                    cfg["borderInfo"].push(borderInfo);

                    if (Store.clearjfundo) {
                        Store.jfundo.length  = 0;

                        let redo = [];

                        redo["type"] = "borderChange";

                        redo["config"] = $.extend(true, {}, Store.config);
                        redo["curconfig"] = $.extend(true, {}, cfg);
                        
                        redo["sheetIndex"] = Store.currentSheetIndex;

                        Store.jfredo.push(redo);
                    }

                    server.saveParam("cg", Store.currentSheetIndex, cfg["borderInfo"], { "k": "borderInfo" });

                    Store.config = cfg;
                    Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

                    setTimeout(function () {
                        sheetrefreshgrid();
                    }, 1);

                    $("#sheet-icon-border-all").attr("type", itemvalue);

                    let _icon = $("#sheet-icon-border-all").find(".sheet-icon-img-container");

                    // add iconfont
                    _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-" + itemvalue + iconfontObject[itemvalue]);

                    _this.focus(_menuButton, itemvalue);
                });

                $("#" + subcolormenuid).find(".sheet-color-selected").spectrum({
                    showPalette: true,
                    showPaletteOnly: true,
                    preferredFormat: "hex",
                    clickoutFiresChange: false,
                    showInitial: true,
                    showInput: true,
                    flat: true,
                    hideAfterPaletteSelect: true,
                    showSelectionPalette: true,
                    maxPaletteSize: 8,
                    maxSelectionSize: 8,
                    color: "#000",
                    cancelText: locale_button.cancel,
                    chooseText: locale_button.confirm,
                    togglePaletteMoreText: locale_toolbar.customColor,
                    togglePaletteLessText: locale_toolbar.collapse,
                    togglePaletteOnly: true,
                    clearText: locale_toolbar.clearText,
                    noColorSelectedText:locale_toolbar.noColorSelectedText,
                    localStorageKey: "spectrum.bordercolor" + server.gridKey,
                    palette: [
                        ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                        ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                        ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                        ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                        ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                        ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                        ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                        ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                    ],
                    change: function (color) {
                        let _input = $(this);
                        if (color != null) {
                            color = color.toHexString();
                        }
                        else {
                            color = "#000";
                        }

                        let oldcolor = null;
                        $("#sheet-icon-borderColor-linecolor").css("border-bottom-color", color);
                        $("#"+ subcolormenuid).find(".sheet-color-selected").val(color);
                    }
                });

                $("#"+ subcolormenuid).find(".sheet-color-reset").click(function(){
                    let _input = $("#"+ subcolormenuid).find(".sheet-color-selected");
                    _input.val("#000");
                    $("#sheet-icon-cell-color").attr("color", null);
                    _input.spectrum("set", "#000");
                    $("#sheet-icon-borderColor-linecolor").css("border-bottom-color", "#000");
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft-28, $(this).offset().top+25, "lefttop");
        });

        //合并单元格
        $("#sheet-icon-merge-button").click(function(){

            if(!checkProtectionNotEnable(Store.currentSheetIndex)){
                return;
            }

            if(selectIsOverlap()){
                if(isEditMode()){
                    alert("不能合并重叠区域");
                }
                else{
                    tooltip.info("不能合并重叠区域", "");
                }
                return;
            }

            if(Store.config["merge"] != null){
                let has_PartMC = false;

                for(let s = 0; s < Store.sheet_select_save.length; s++){
                    let r1 = Store.sheet_select_save[s].row[0], 
                        r2 = Store.sheet_select_save[s].row[1];
                    let c1 = Store.sheet_select_save[s].column[0], 
                        c2 = Store.sheet_select_save[s].column[1];

                    has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                    if(has_PartMC){
                        break;
                    }
                }

                if(has_PartMC){
                    if(isEditMode()){
                        alert("无法对部分合并单元格执行此操作");
                    }
                    else{
                        tooltip.info("无法对部分合并单元格执行此操作", ""); 
                    }
                    return;    
                }
            }

            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat_mc(d, "mergeAll");
        });

        $("#sheet-icon-merge-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_merge =  _locale.merge;

                let itemdata = [
                    {"text": locale_merge.mergeAll, "value": "mergeAll", "example": ""},
                    {"text": locale_merge.mergeV, "value": "mergeV", "example": ""},
                    {"text": locale_merge.mergeH, "value": "mergeH", "example": ""},
                    {"text": locale_merge.mergeCancel, "value": "mergeCancel", "example": ""}
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "merge-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#"+menuButtonId).width(110);
                _this.focus(_menuButton);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    if(selectIsOverlap()){
                        if(isEditMode()){
                            alert(locale_merge.overlappingError);
                        }
                        else{
                            tooltip.info(locale_merge.overlappingError, "");
                        }
                        return;
                    }

                    if(Store.config["merge"] != null){
                        let has_PartMC = false;

                        for(let s = 0; s < Store.sheet_select_save.length; s++){
                            let r1 = Store.sheet_select_save[s].row[0], 
                                r2 = Store.sheet_select_save[s].row[1];
                            let c1 = Store.sheet_select_save[s].column[0], 
                                c2 = Store.sheet_select_save[s].column[1];

                            has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                            if(has_PartMC){
                                break;
                            }
                        }

                        if(has_PartMC){
                            if(isEditMode()){
                                alert(locale_merge.partiallyError);
                            }
                            else{
                                tooltip.info(locale_merge.partiallyError, ""); 
                            }
                            return;    
                        }
                    }

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat_mc(d, itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
        });

        //水平对齐
        $("#sheet-icon-align").click(function(){
        	let itemvalue = $("#sheet-icon-align").attr("type");
        	if(itemvalue == null){
        		itemvalue = "left";
        	}

            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "ht", itemvalue);
        });

        $("#sheet-icon-align-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_align = _locale.align;
                let itemdata = [
                    {"text": locale_align.left, "value": "left", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-align-left iconfont sheet-iconfont-wenbenzuoduiqi" style="user-select: none;"> </div> </div>'},
                    {"text": locale_align.center, "value": "center", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-align-center iconfont sheet-iconfont-wenbenjuzhongduiqi" style="user-select: none;"> </div> </div>'},
                    {"text": locale_align.right, "value": "right", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-align-right iconfont sheet-iconfont-wenbenyouduiqi" style="user-select: none;"> </div> </div>'}
                ];

                // itemvalue to iconfont
                const iconfontObject = iconfontObjects.align;

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "align-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(120);
                _this.focus(_menuButton);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    let _icon = $("#sheet-icon-align").attr("type", itemvalue).find(".sheet-icon-img-container");

                    // add iconfont
                    _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);

                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "ht", itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
        });

        //垂直对齐
        $("#sheet-icon-valign").click(function(){
        	let itemvalue = $("#sheet-icon-valign").attr("type");
        	if(itemvalue == null){
        		itemvalue = "bottom";
        	}

            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "vt", itemvalue);
        });

        $("#sheet-icon-valign-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            const _locale = locale();
            const locale_align = _locale.align;
            if(_menuButton.length == 0){
                let itemdata = [
                    {"text": locale_align.top, "value": "top", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-valign-top iconfont sheet-iconfont-dingbuduiqi" style="user-select: none;"> </div> </div>'},
                    {"text": locale_align.middle, "value": "middle", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-valign-middle iconfont sheet-iconfont-shuipingduiqi" style="user-select: none;"> </div> </div>'},
                    {"text": locale_align.bottom, "value": "bottom", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-valign-bottom iconfont sheet-iconfont-dibuduiqi" style="user-select: none;"> </div> </div>'}
                ];

                // itemvalue to iconfont
                const iconfontObject = iconfontObjects.align;

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "valign-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(120);
                _this.focus(_menuButton, "bottom");

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    let _icon = $("#sheet-icon-valign").attr("type", itemvalue).find(".sheet-icon-img-container");

                    // add iconfont
                    _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-valign-" + itemvalue + iconfontObject[itemvalue]);

                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "vt", itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
        });

        //文本换行
        $("#sheet-icon-textwrap-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_textWrap = _locale.textWrap;
                let itemdata = [
                    {"text": locale_textWrap.overflow, "value": "overflow", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-overflow iconfont sheet-iconfont-yichu1" style="user-select: none;"> </div> </div>'},
                    {"text": locale_textWrap.wrap, "value": "wrap", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-wrap iconfont sheet-iconfont-zidonghuanhang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_textWrap.clip, "value": "clip", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-clip iconfont sheet-iconfont-jieduan" style="user-select: none;"> </div> </div>'}
                ];

                // itemvalue to iconfont
                const iconfontObject = iconfontObjects.textWrap;

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "textwrap-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(120);
                _this.focus(_menuButton, "clip");

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    let _icon = $("#sheet-icon-textwrap").attr("type", itemvalue).find(".sheet-icon-img-container");

                    // add iconfont
                    _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue]);

                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "tb", itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
        });

        //文本旋转
        $("#sheet-icon-rotation-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_rotation = _locale.rotation;
                let itemdata = [
                    {"text": locale_rotation.none, "value": "none", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-wuxuanzhuang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_rotation.angleup, "value": "angleup", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-angleup iconfont sheet-iconfont-xiangshangqingxie" style="user-select: none;"> </div> </div>'},
                    {"text": locale_rotation.angledown, "value": "angledown", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-angledown iconfont sheet-iconfont-xiangxiaqingxie" style="user-select: none;"> </div> </div>'},
                    {"text": locale_rotation.vertical, "value": "vertical", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-vertical iconfont sheet-iconfont-shupaiwenzi" style="user-select: none;"> </div> </div>'},
                    {"text": locale_rotation.rotationUp, "value": "rotation-up", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-rotation-up iconfont sheet-iconfont-wenbenxiangshang" style="user-select: none;"> </div> </div>'},
                    {"text": locale_rotation.rotationDown, "value": "rotation-down", "example": '<div class="sheet-icon sheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-rotation-down iconfont sheet-iconfont-xiangxia90" style="user-select: none;"> </div> </div>'},
                ];

                // itemvalue to iconfont
                const iconfontObject = iconfontObjects.rotation;

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "rotation-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);

                // 文字旋转总 Stack Vertically 太长了，拉宽到160
                _menuButton = $("#" + menuButtonId).width(160);
                _this.focus(_menuButton);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    let _icon = $("#sheet-icon-rotation").attr("type", itemvalue).find(".sheet-icon-img-container");

                    // add iconfont
                    _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue]);
                    
                    let d = editor.deepCopyFlowData(Store.flowdata);
                    _this.updateFormat(d, "tr", itemvalue);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
        });

        //冻结行列
        $("#sheet-icon-freezen-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_freezen = _locale.freezen;
                let itemdata = [
                    {"text": locale_freezen.freezenRow, "value": "freezenRow", "example": ''},
                    {"text": locale_freezen.freezenColumn, "value": "freezenColumn", "example": ''},
                    {"text": locale_freezen.freezenRC, "value": "freezenRC", "example": ''},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_freezen.freezenRowRange, "value": "freezenRowRange", "example": ''},
                    {"text": locale_freezen.freezenColumnRange, "value": "freezenColumnRange", "example": ''},
                    {"text": locale_freezen.freezenRCRange, "value": "freezenRCRange", "example": ''},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_freezen.freezenCancel, "value": "freezenCancel", "example": ''}
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "freezen-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(170);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    _this.focus(_menuButton, itemvalue);

                    // store frozen
                    sheetFreezen.saveFrozen(itemvalue);

                    if(itemvalue == "freezenRow"){ //首行冻结
                        let scrollTop = $("#sheet-cell-main").scrollTop();
                        let row_st = sheet_searcharray(Store.visibledatarow, scrollTop);
                        if(row_st == -1){
                            row_st = 0;
                        }
                        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                        let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                        sheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

                        if (sheetFreezen.freezenverticaldata != null) {
                            sheetFreezen.cancelFreezenVertical();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenColumn"){ //首列冻结
                        let scrollLeft = $("#sheet-cell-main").scrollLeft();
                        let col_st = sheet_searcharray(Store.visibledatacolumn, scrollLeft);
                        if(col_st == -1){
                            col_st = 0;
                        }
                        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                        let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                        sheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

                        if (sheetFreezen.freezenhorizontaldata != null) {
                            sheetFreezen.cancelFreezenHorizontal();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        sheetFreezen.createFreezenVertical(freezenverticaldata, left);
                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenRC"){ //首行列冻结
                        let scrollTop = $("#sheet-cell-main").scrollTop();
                        let row_st = sheet_searcharray(Store.visibledatarow, scrollTop);
                        if(row_st == -1){
                            row_st = 0;
                        }
                        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                        let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                        sheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

                        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

                        let scrollLeft = $("#sheet-cell-main").scrollLeft();
                        let col_st = sheet_searcharray(Store.visibledatacolumn, scrollLeft);
                        if(col_st == -1){
                            col_st = 0;
                        }
                        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                        let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                        sheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

                        sheetFreezen.createFreezenVertical(freezenverticaldata, left);

                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenRowRange"){ //选区行冻结
                        if(Store.sheet_select_save == null || Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(locale_freezen.noSeletionError);
                            }
                            else{
                                tooltip.info(locale_freezen.noSeletionError, "");
                            }

                            return;
                        }
                        
                        let scrollTop = $("#sheet-cell-main").scrollTop();
                        let row_st = sheet_searcharray(Store.visibledatarow, scrollTop);

                        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
                        let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];

                        if(row_focus > row_st){
                            row_st = row_focus;
                        }
                        
                        if(row_st == -1){
                            row_st = 0;
                        }

                        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                        let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                        sheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

                        if (sheetFreezen.freezenverticaldata != null) {
                            sheetFreezen.cancelFreezenVertical();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenColumnRange"){ //选区列冻结
                        if(Store.sheet_select_save == null || Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(locale_freezen.noSeletionError);
                            }
                            else{
                                tooltip.info(locale_freezen.noSeletionError,"");
                            }

                            return;
                        }
                        
                        let scrollLeft = $("#sheet-cell-main").scrollLeft();
                        let col_st = sheet_searcharray(Store.visibledatacolumn, scrollLeft);

                        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
                        let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];

                        if(column_focus > col_st){
                            col_st = column_focus;
                        }

                        if(col_st == -1){
                            col_st = 0;
                        }

                        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                        let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                        sheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

                        if (sheetFreezen.freezenhorizontaldata != null) {
                            sheetFreezen.cancelFreezenHorizontal();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        sheetFreezen.createFreezenVertical(freezenverticaldata, left);
                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenRCRange"){ //选区行列冻结
                        if(Store.sheet_select_save == null || Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(locale_freezen.noSeletionError);
                            }
                            else{
                                tooltip.info(locale_freezen.noSeletionError,"");
                            }

                            return;
                        }
                        
                        let scrollTop = $("#sheet-cell-main").scrollTop();
                        let row_st = sheet_searcharray(Store.visibledatarow, scrollTop);

                        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
                        let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];

                        if(row_focus > row_st){
                            row_st = row_focus;
                        }
                        
                        if(row_st == -1){
                            row_st = 0;
                        }

                        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                        let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                        sheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

                        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

                        let scrollLeft = $("#sheet-cell-main").scrollLeft();
                        let col_st = sheet_searcharray(Store.visibledatacolumn, scrollLeft);

                        let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];

                        if(column_focus > col_st){
                            col_st = column_focus;
                        }

                        if(col_st == -1){
                            col_st = 0;
                        }
                        
                        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                        let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                        sheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

                        sheetFreezen.createFreezenVertical(freezenverticaldata, left);
                        
                        sheetFreezen.createAssistCanvas();
                        sheetrefreshgrid();
                    }
                    else if(itemvalue == "freezenCancel"){ //Cancel freezen
                        if (sheetFreezen.freezenverticaldata != null) {
                            sheetFreezen.cancelFreezenVertical();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        if (sheetFreezen.freezenhorizontaldata != null) {
                            sheetFreezen.cancelFreezenHorizontal();
                            sheetFreezen.createAssistCanvas();
                            sheetrefreshgrid();
                        }

                        sheetFreezen.scrollAdapt();
                    }

                    setTimeout(function(){
                        sheetsizeauto();
                    },0);
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft - 68, $(this).offset().top + 25, "lefttop");
        });

        //过滤和排序
        $("#sheet-icon-autofilter").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            if(_menuButton.length == 0){
                const _locale = locale();
                const locale_sort = _locale.sort;
                const locale_filter = _locale.filter;
                let itemdata = [
                    {"text": locale_sort.asc, "value": "asc", "example": '<i class="iconfont sheet-iconfont-shengxu" aria-hidden="true"></i>'},
                    {"text": locale_sort.desc, "value": "desc", "example": '<i class="iconfont sheet-iconfont-jiangxu" aria-hidden="true"></i>'},
                    {"text": locale_sort.custom+"...", "value": "diysort", "example": '<i class="iconfont sheet-iconfont-zidingyipaixu" aria-hidden="true"></i>'},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_filter.filter, "value": "filter", "example": '<i class="iconfont sheet-iconfont-shaixuan2" aria-hidden="true"></i>'},
                    {"text": locale_filter.clearFilter, "value": "clearfilter", "example": '<i class="iconfont sheet-iconfont-qingchushaixuan" aria-hidden="true"></i>'}
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, {"id":"autofilter", "item": itemset, "subclass":"", "sub":""});

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(150);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "diysort"){
                        $("#sheetorderby").click();
                    }
                    else if(itemvalue == "asc"){
                        sortSelection(true);
                    }
                    else if(itemvalue == "desc"){
                        sortSelection(false);
                    }
                    else if(itemvalue == "filter"){
                        if($('#sheet-filter-options-sheet' + Store.currentSheetIndex).length > 0){
                            $("#sheet-filter-initial").click();
                        }
                        else{
                            createFilter();
                        }
                    }
                    else if(itemvalue == "clearfilter"){
                        $("#sheet-filter-initial").click();
                    }
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");
        });

        //查找和替换
        $("#sheet-icon-seachmore").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            const _locale = locale();
            const locale_findAndReplace = _locale.findAndReplace;
            if(_menuButton.length == 0){
                let itemdata = [
                    {"text": locale_findAndReplace.find+" ...", "value": "search", "example": '<i class="iconfont sheet-iconfont-sousuo" aria-hidden="true"></i>'},
                    {"text": locale_findAndReplace.replace+" ...", "value": "replace", "example": '<i class="iconfont sheet-iconfont-tihuan" aria-hidden="true"></i>'},
                    // {"text": locale_findAndReplace.goto+" ...", "value": "goto", "example": '<i class="iconfont sheet-iconfont-zhuandao1" aria-hidden="true"></i>'},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_findAndReplace.location+" ...", "value": "location", "example": '<i class="iconfont sheet-iconfont-dingwei" aria-hidden="true"></i>'},
                    {"text": locale_findAndReplace.formula, "value": "locationFormula", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.date, "value": "locationConstantDate", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.number, "value": "locationConstantNumber", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.string, "value": "locationConstantString", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.error, "value": "locationConstantError", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.condition, "value": "locationCF", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.rowSpan, "value": "locationStepRow", "example": locale_findAndReplace.locationExample},
                    {"text": locale_findAndReplace.columnSpan, "value": "locationStepColumn", "example": locale_findAndReplace.locationExample}
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "seachmore", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(180);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "search" || itemvalue == "replace"){ //查找替换
                        if(itemvalue == "search"){
                            sheetSearchReplace.createDialog(0);
                        }
                        else if(itemvalue == "replace"){
                            sheetSearchReplace.createDialog(1);    
                        }
                        
                        sheetSearchReplace.init();

                        $("#sheet-search-replace #searchInput input").focus();
                    }
                    else if(itemvalue == "location"){ //定位条件
                        sheetLocationCell.createDialog();
                        sheetLocationCell.init();
                    }
                    else if(itemvalue == "locationFormula" || itemvalue == "locationConstantDate" || itemvalue == "locationConstantNumber" || itemvalue == "locationConstantString" || itemvalue == "locationConstantError" || itemvalue == "locationCF"){ 
                        let last = Store.sheet_select_save[0];
                        
                        let range;
                        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && last.row[0] == last.row[1] && last.column[0] == last.column[1])){
                            //单个单元格
                            range = [{"row": [0, Store.flowdata.length - 1], "column": [0, Store.flowdata[0].length - 1]}];
                        }
                        else{
                            range = $.extend(true, [], Store.sheet_select_save);
                        }

                        if(itemvalue == "locationFormula"){               //公式
                            sheetLocationCell.apply(range, "locationFormula", "all");
                        }
                        else if(itemvalue == "locationConstantDate"){     //日期
                            sheetLocationCell.apply(range, "locationConstant", "d");
                        }
                        else if(itemvalue == "locationConstantNumber"){   //数字
                            sheetLocationCell.apply(range, "locationConstant", "n");
                        }
                        else if(itemvalue == "locationConstantString"){   //字符
                            sheetLocationCell.apply(range, "locationConstant", "s,g");
                        }
                        else if(itemvalue == "locationConstantError"){    //错误
                            sheetLocationCell.apply(range, "locationConstant", "e");
                        }
                        else if(itemvalue == "locationCF"){               //条件格式
                            sheetLocationCell.apply(range, "locationCF");
                        }
                    }
                    else if(itemvalue == "locationStepRow"){ //间隔行
                        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1])){
                            if(isEditMode()){
                                alert(locale_findAndReplace.lessTwoRowTip);
                            }
                            else{
                                tooltip.info("", locale_findAndReplace.lessTwoRowTip); 
                            }
                            return;                            
                        }

                        let range = $.extend(true, [], Store.sheet_select_save);

                        sheetLocationCell.apply(range, "locationStepRow");
                    }
                    else if(itemvalue == "locationStepColumn"){ //间隔列
                        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
                            if(isEditMode()){
                                alert(locale_findAndReplace.lessTwoColumnTip);
                            }
                            else{
                                tooltip.info("", locale_findAndReplace.lessTwoColumnTip); 
                            }
                            return;                            
                        }

                        let range = $.extend(true, [], Store.sheet_select_save);

                        sheetLocationCell.apply(range, "locationStepColumn");
                    }
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");
        });

        //公式
        $("#sheet-icon-function").click(function(){
            _this.autoSelectionFormula("SUM");
        });

        //公式菜单
        $("#sheet-icon-function-menu").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);

            const _locale = locale();
            const locale_formula = _locale.formula;
            
            if(_menuButton.length == 0){
                let itemdata = [
                    {"text": locale_formula.sum, "value": "SUM", "example": 'SUM'},
                    {"text": locale_formula.average, "value": "AVERAGE", "example": 'AVERAGE'},
                    {"text": locale_formula.count, "value": "COUNT", "example": 'COUNT'},
                    {"text": locale_formula.max, "value": "MAX", "example": 'MAX'},
                    {"text": locale_formula.min, "value": "MIN", "example": 'MIN'},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_formula.ifGenerate, "value": "if", "example": 'IF'},
                    {"text": locale_formula.find+" ...", "value": "formula", "example": ""}
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "function-menu", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(180);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "if"){
                        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
                        let r = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
                        let c = last["column_focus"] == null ? last["column"][0] : last["column_focus"];

                        if(!!Store.flowdata[r] && !!Store.flowdata[r][c] && !!Store.flowdata[r][c]["f"]){
                            let fp = Store.flowdata[r][c]["f"].toString();

                            if(fp.indexOf("=if(") != -1){
                                ifFormulaGenerator.ifFormulaDialog(fp);
                            }
                            else{
                                if(isEditMode()){
                                    alert(locale_formula.tipNotBelongToIf);
                                }
                                else{
                                    tooltip.info(locale_formula.tipNotBelongToIf,"");
                                }
                                return;
                            }
                        }
                        else{
                            ifFormulaGenerator.ifFormulaDialog();
                        }

                        ifFormulaGenerator.init();
                    }
                    else if(itemvalue == "formula"){
                        //点击函数查找弹出框
                        if(Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(locale_formula.tipSelectCell);
                            }
                            else{
                                tooltip.info(locale_formula.tipSelectCell,"");
                            }

                            return;
                        }

                        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];

                        let row_index = last["row_focus"], col_index = last["column_focus"];

                        sheetupdateCell(row_index, col_index, Store.flowdata);
                        
                        let cell = Store.flowdata[row_index][col_index];
                        if(cell != null && cell.f != null){
                            //单元格有计算
                            let functionStr = sheetformula.getfunctionParam(cell.f);
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
                    }
                    else {
                        _this.autoSelectionFormula(itemvalue);
                    }
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft-48, $(this).offset().top+25, "lefttop");
        });

        //加粗
        $("#sheet-icon-bold").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(e){
            let d = editor.deepCopyFlowData(Store.flowdata);
            
            let flag = checkTheStatusOfTheSelectedCells("bl",1);
            let foucsStatus = flag ? 0 : 1;

            _this.updateFormat(d, "bl", foucsStatus);
        });

        //斜体
        $("#sheet-icon-italic").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);

            let flag = checkTheStatusOfTheSelectedCells("it",1);
            let foucsStatus = flag ? 0 : 1;

            _this.updateFormat(d, "it", foucsStatus);
        });

        //删除线
        $("#sheet-icon-strikethrough").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);
            let flag = checkTheStatusOfTheSelectedCells("cl",1);
            let foucsStatus = flag ? 0 : 1;

            _this.updateFormat(d, "cl", foucsStatus);
        });

        //下划线
        $("#sheet-icon-underline").mousedown(function(e){
            hideMenuByCancel(e);
            e.stopPropagation();
        }).click(function(){
            let d = editor.deepCopyFlowData(Store.flowdata);
            let flag = checkTheStatusOfTheSelectedCells("un",1);
            let foucsStatus = flag ? 0 : 1;

            _this.updateFormat(d, "un", foucsStatus);
        });

        //条件格式
        $("#sheet-icon-conditionformat").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);

            const conditionformat_text = locale().conditionformat;
            
            if(_menuButton.length == 0){
                let itemdata = [
                    { "text": conditionformat_text.highlightCellRules, "value": "highlightCellRule", "example": "more" },
                    { "text": conditionformat_text.itemSelectionRules, "value": "projectSelectRule", "example": "more" },
                    { "text": conditionformat_text.dataBar, "value": "dataBar", "example": "more" },
                    { "text": conditionformat_text.colorGradation, "value": "colorGradation", "example": "more" },
                    { "text": conditionformat_text.icons, "value": "icons", "example": "" },
                    { "text": "", "value": "split", "example": "" },
                    { "text": conditionformat_text.newRule, "value": "newRule", "example": "" },
                    { "text": conditionformat_text.deleteRule, "value": "deleteRule", "example": "more" },
                    { "text": conditionformat_text.manageRules, "value": "administerRule", "example": "" }
                ];
                let itemset = _this.createButtonMenu(itemdata);
                let menu = replaceHtml(_this.menu, {"id": "conditionformat", "item": itemset, "subclass": "", "sub": ""});
                
                //突出显示单元格规则子菜单
                let subitemdata = [
                    { "text": conditionformat_text.greaterThan, "value": "greaterThan", "example": ">" },
                    { "text": conditionformat_text.lessThan, "value": "lessThan", "example": "<" },
                    { "text": conditionformat_text.between, "value": "betweenness", "example": "[]" },
                    { "text": conditionformat_text.equal, "value": "equal", "example": "=" },
                    { "text": conditionformat_text.textContains, "value": "textContains", "example": "()" },
                    { "text": conditionformat_text.occurrence, "value": "occurrenceDate", "example": conditionformat_text.yesterday },
                    { "text": conditionformat_text.duplicateValue, "value": "duplicateValue", "example": "##" }
                ];
                let subitemset = _this.createButtonMenu(subitemdata);
                let submenu = replaceHtml(_this.menu, {"id": "highlightCellRule", "item": subitemset, "subclass": "sheet-menuButton-sub"});
                
                //项目选取规则子菜单
                let subitemdata2 = [
                    { "text": conditionformat_text.top10, "value": "top10", "example": conditionformat_text.top10 },
                    { "text": conditionformat_text.top10_percent, "value": "top10%", "example": conditionformat_text.top10_percent },
                    { "text": conditionformat_text.last10, "value": "last10", "example": conditionformat_text.last10 },
                    { "text": conditionformat_text.last10_percent, "value": "last10%", "example": conditionformat_text.last10_percent },
                    { "text": conditionformat_text.aboveAverage, "value": "AboveAverage", "example": conditionformat_text.above },
                    { "text": conditionformat_text.belowAverage, "value": "SubAverage", "example": conditionformat_text.below }
                ];
                let subitemset2 = _this.createButtonMenu(subitemdata2);
                let submenu2 = replaceHtml(_this.menu, {"id": "projectSelectRule", "item": subitemset2, "subclass": "sheet-menuButton-sub"});
                
                //数据条子菜单
                let submenu3 = `<div id="sheet-icon-dataBar-menuButton" class="sheet-cols-menu sheet-rightgclick-menu sheet-menuButton sheet-menuButton-sub sheet-mousedown-cancel" style="width: 126px;padding: 5px;top: 118.5px;left: 1321.48px;display: none;">
                                    <div itemvalue="0" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 0;" title="${conditionformat_text.gradientDataBar_1}"></div>
                                    </div>
                                    <div itemvalue="1" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px 0;" title="${conditionformat_text.gradientDataBar_2}"></div>
                                    </div>
                                    <div itemvalue="2" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px 0;" title="${conditionformat_text.gradientDataBar_3}"></div>
                                    </div>
                                    <div itemvalue="3" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 -36px;" title="${conditionformat_text.gradientDataBar_4}"></div>
                                    </div>
                                    <div itemvalue="4" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px -36px;" title="${conditionformat_text.gradientDataBar_5}"></div>
                                    </div>
                                    <div itemvalue="5" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px -36px;" title="${conditionformat_text.gradientDataBar_6}"></div>
                                    </div>
                                    <div itemvalue="6" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 -72px;" title="${conditionformat_text.solidColorDataBar_1}"></div>
                                    </div>
                                    <div itemvalue="7" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px -72px;" title="${conditionformat_text.solidColorDataBar_2}"></div>
                                    </div>
                                    <div itemvalue="8" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px -72px;" title="${conditionformat_text.solidColorDataBar_3}"></div>
                                    </div>
                                    <div itemvalue="9" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 -108px;" title="${conditionformat_text.solidColorDataBar_4}"></div>
                                    </div>
                                    <div itemvalue="10" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px -108px;" title="${conditionformat_text.solidColorDataBar_5}"></div>
                                    </div>
                                    <div itemvalue="11" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px -108px;" title="${conditionformat_text.solidColorDataBar_6}"></div>
                                    </div>
                                </div>`;

                //色阶
                let submenu4 = `<div id="sheet-icon-colorGradation-menuButton" class="sheet-cols-menu sheet-rightgclick-menu sheet-menuButton sheet-menuButton-sub sheet-mousedown-cancel" style="width: 126px;padding: 5px;top: 143.5px;left: 1321.48px;display: none;">
                                    <div itemvalue="0" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 0;" title="${conditionformat_text.colorGradation_1}"></div>
                                    </div>
                                    <div itemvalue="1" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px 0;" title="${conditionformat_text.colorGradation_2}"></div>
                                    </div>
                                    <div itemvalue="2" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px 0;" title="${conditionformat_text.colorGradation_3}"></div>
                                    </div>
                                    <div itemvalue="3" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -114px 0;" title="${conditionformat_text.colorGradation_4}"></div>
                                    </div>
                                    <div itemvalue="4" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 -36px;" title="${conditionformat_text.colorGradation_5}"></div>
                                    </div>
                                    <div itemvalue="5" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px -36px;" title="${conditionformat_text.colorGradation_6}"></div>
                                    </div>
                                    <div itemvalue="6" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px -36px;" title="${conditionformat_text.colorGradation_7}"></div>
                                    </div>
                                    <div itemvalue="7" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -114px -36px;" title="${conditionformat_text.colorGradation_8}"></div>
                                    </div>
                                    <div itemvalue="8" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: 0 -72px;" title="${conditionformat_text.colorGradation_9}"></div>
                                    </div>
                                    <div itemvalue="9" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -38px -72px;" title="${conditionformat_text.colorGradation_10}"></div>
                                    </div>
                                    <div itemvalue="10" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -76px -72px;" title="${conditionformat_text.colorGradation_11}"></div>
                                    </div>
                                    <div itemvalue="11" class="sheet-cols-menuitem sheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="sheet-mousedown-cancel bgImgBox" style="background-position: -114px -72px;" title="${conditionformat_text.colorGradation_12}"></div>
                                    </div>
                                </div>`;

                //清除规则子菜单
                let subitemdata6 = [
                    { "text": conditionformat_text.deleteSheetRule, "value": "delSheet", "example": "" }
                ];
                let subitemset6 = _this.createButtonMenu(subitemdata6);
                let submenu6 = replaceHtml(_this.menu, {"id": "deleteRule", "item": subitemset6, "subclass":"sheet-menuButton-sub"});

                $("body").append(menu + submenu + submenu2 + submenu3 + submenu4 + submenu6);
                _menuButton = $("#" + menuButtonId).width(190);
                $("#sheet-icon-highlightCellRule-menuButton").width(160);
                $("#sheet-icon-projectSelectRule-menuButton").width(180);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "icons"){
                        if(Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(conditionformat_text.pleaseSelectRange);
                            }
                            else{
                                tooltip.info(conditionformat_text.pleaseSelectRange, "");
                            }
                            return;
                        }

                        conditionformat.CFiconsDialog();
                        conditionformat.init();
                    }
                    else if(itemvalue == "newRule"){
                        if(Store.sheet_select_save.length == 0){
                            if(isEditMode()){
                                alert(conditionformat_text.pleaseSelectRange);
                            }
                            else{
                                tooltip.info(conditionformat_text.pleaseSelectRange, "");
                            }
                            return;
                        }

                        conditionformat.newConditionRuleDialog(0);
                        conditionformat.init();
                    }
                    else if(itemvalue == "administerRule"){
                        let loadSheetUrl = server.loadSheetUrl;
                        let file = getsheet_file();

                        if(loadSheetUrl != "" && loadSheetUrl != null){
                            let sheetindex = [];
                            for(let i = 0; i < file.length; i++){
                                sheetindex.push(file[i].index);
                            }

                            $.post(loadSheetUrl, {"g" : server.gridKey, "index": sheetindex.join(",")}, function (d) {
                                let dataset = new Function("return " + d)();

                                setTimeout(function(){
                                    Store.loadingObj.close()
                                }, 500);

                                for(let item in dataset){
                                    if(item == Store.currentSheetIndex){
                                        continue;
                                    }

                                    let otherfile = file[getSheetIndex(item)];

                                    otherfile.celldata = dataset[item.toString()];
                                    otherfile["data"] = sheetmanage.buildGridData(otherfile);
                                }

                                setsheetfile(file);

                                conditionformat.fileClone =  $.extend(true, [], file);
                                conditionformat.administerRuleDialog();
                                conditionformat.init();
                            });
                        }
                        else{
                            conditionformat.fileClone =  $.extend(true, [], file);
                            conditionformat.administerRuleDialog();
                            conditionformat.init();
                        }
                    }
                });

                //突出显示单元格规则子菜单点击事件
                $(document).off("click.CFhighlightCellRule").on("click.CFhighlightCellRule", "#sheet-icon-highlightCellRule-menuButton .sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    $("#sheet-icon-highlightCellRule-menuButton").hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(Store.sheet_select_save.length == 0){
                        if(isEditMode()){
                            alert(conditionformat_text.pleaseSelectRange);
                        }
                        else{
                            tooltip.info(conditionformat_text.pleaseSelectRange, ""); 
                        }
                        return;
                    }
                    else{
                        let textCellColorHtml = conditionformat.textCellColorHtml();

                        let title, content;
                        switch(itemvalue){
                            case "greaterThan":
                                title = conditionformat_text.conditionformat_greaterThan;
                                content =  `<div class="box" data-itemvalue="greaterThan">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_greaterThan_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div> 
                                                ${textCellColorHtml} 
                                            </div>`;
                                break;
                            case "lessThan":
                                title = conditionformat_text.conditionformat_lessThan;
                                content =  `<div class="box" data-itemvalue="lessThan">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_lessThan_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "betweenness":
                                title = conditionformat_text.conditionformat_betweenness;
                                content =  `<div class="box" data-itemvalue="betweenness">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_betweenness_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div class="inpbox2 range">
                                                        <input id="conditionVal" class="formulaInputFocus"/>
                                                        <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.to}</div>
                                                    <div class="inpbox2 range">
                                                        <input id="conditionVal2" class="formulaInputFocus"/>
                                                        <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                    </div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "equal":
                                title = conditionformat_text.conditionformat_equal;
                                content =  `<div class="box" data-itemvalue="equal">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_equal_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "textContains":
                                title = conditionformat_text.conditionformat_textContains;
                                content =  `<div class="box" data-itemvalue="textContains">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_textContains_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break; 
                            case "occurrenceDate":
                                title = conditionformat_text.conditionformat_occurrenceDate;
                                content =  `<div class="box" data-itemvalue="occurrenceDate">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_occurrenceDate_title}：</div>
                                                <div class="inpbox">
                                                    <input id="daterange-btn" class="formulaInputFocus" readonly="readonly" placeholder="${conditionformat_text.pleaseSelectADate}"/>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break; 
                            case "duplicateValue":
                                title = conditionformat_text.conditionformat_duplicateValue;
                                content =  `<div class="box" data-itemvalue="duplicateValue">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_duplicateValue_title}：</div>
                                                <select id="conditionVal" class="selectbox">
                                                    <option value="0">${conditionformat_text.duplicateValue}</option>
                                                    <option value="1">${conditionformat_text.uniqueValue}</option>
                                                </select>
                                                <div style="margin:5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;      
                        }

                        conditionformat.conditionformatDialog(title, content); 
                    }
                });

                //项目选取规则子菜单点击事件
                $(document).off("click.CFprojectSelectRule").on("click.CFprojectSelectRule", "#sheet-icon-projectSelectRule-menuButton .sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    $("#sheet-icon-projectSelectRule-menuButton").hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(Store.sheet_select_save.length == 0){
                        if(isEditMode()){
                            alert(conditionformat_text.pleaseSelectRange);
                        }
                        else{
                            tooltip.info(conditionformat_text.pleaseSelectRange, ""); 
                        }
                        return;
                    }
                    else{
                        let textCellColorHtml = conditionformat.textCellColorHtml();

                        let title, content;
                        switch(itemvalue){
                            case "top10":
                                title = conditionformat_text.conditionformat_top10;
                                content =  `<div class="box" data-itemvalue="top10">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "top10%":
                                title = conditionformat_text.conditionformat_top10_percent;
                                content =  `<div class="box" data-itemvalue="top10%">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">%</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "last10":
                                title = conditionformat_text.conditionformat_last10;
                                content =  `<div class="box" data-itemvalue="last10">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.last}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "last10%":
                                title = conditionformat_text.conditionformat_last10_percent;
                                content =  `<div class="box" data-itemvalue="last10%">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.last}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">%</div>
                                                </div>
                                                <div style="margin:5px 0;">设置为：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break;
                            case "AboveAverage":
                                title = conditionformat_text.conditionformat_AboveAverage;
                                content =  `<div class="box" data-itemvalue="AboveAverage">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_AboveAverage_title}：</div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break; 
                            case "SubAverage":
                                title = conditionformat_text.conditionformat_SubAverage;
                                content =  `<div class="box" data-itemvalue="SubAverage">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_SubAverage_title}：</div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                                break; 
                        }

                        conditionformat.conditionformatDialog(title,content);
                    }
                });

                //数据条子菜单点击事件
                $(document).off("click.CFdataBar").on("click.CFdataBar", "#sheet-icon-dataBar-menuButton .sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    $("#sheet-icon-dataBar-menuButton").hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(Store.sheet_select_save.length > 0){
                        let cellrange = $.extend(true, [], Store.sheet_select_save);
                        let format = conditionformat.dataBarList[itemvalue]["format"];

                        conditionformat.updateItem("dataBar", cellrange, format);
                    }
                });

                //色阶子菜单点击事件
                $(document).off("click.CFcolorGradation").on("click.CFcolorGradation", "#sheet-icon-colorGradation-menuButton .sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    $("#sheet-icon-colorGradation-menuButton").hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(Store.sheet_select_save.length > 0){
                        let cellrange = $.extend(true, [], Store.sheet_select_save);
                        let format = conditionformat.colorGradationList[itemvalue]["format"];

                        conditionformat.updateItem("colorGradation", cellrange, format);
                    }
                });

                //清除规则子菜单点击事件
                $(document).off("click.CFdeleteRule").on("click.CFdeleteRule", "#sheet-icon-deleteRule-menuButton .sheet-cols-menuitem", function(){
                    _menuButton.hide();
                    $("#sheet-icon-deleteRule-menuButton").hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "delSheet"){
                        conditionformat.updateItem("delSheet");
                    }
                });
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");
        });

        //批注
        $("#sheet-icon-postil").click(function(){
            let menuButtonId = $(this).attr("id")+"-menuButton";
            let _menuButton = $("#" + menuButtonId);
            
            const locale_comment = locale().comment;

            _menuButton.remove();

            // if(_menuButton.length == 0){
                sheetPostil.removeActivePs();

                let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
                
                let row_index = last["row_focus"];
                if(row_index == null){
                    row_index = last["row"][0];
                }

                let col_index = last["column_focus"];
                if(col_index == null){
                    col_index = last["column"][0];
                }

                let itemdata;
                if(Store.flowdata[row_index][col_index] != null && Store.flowdata[row_index][col_index].ps != null){
                    itemdata = [
                        {"text": locale_comment.edit, "value": "editPs", "example": ""},
                        {"text": locale_comment.delete, "value": "delPs", "example": ""},
                        {"text": "", "value": "split", "example": ""},
                        {"text": locale_comment.showOne, "value": "showHidePs", "example": ""},
                        {"text": locale_comment.showAll, "value": "showHideAllPs", "example": ""}
                    ];
                }
                else{
                    itemdata = [
                        {"text": locale_comment.insert, "value": "newPs", "example": ""},
                        {"text": "", "value": "split", "example": ""},
                        {"text": locale_comment.showAll, "value": "showHideAllPs", "example": ""}
                    ];
                }
                
                let itemset = _this.createButtonMenu(itemdata);
                let menu = replaceHtml(_this.menu, {"id": "postil", "item": itemset, "subclass": "", "sub": ""});
                
                $("body").append(menu);
                _menuButton = $("#"+menuButtonId).width(150);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");
                    
                    if(itemvalue == "newPs"){
                        sheetPostil.newPs(row_index, col_index);
                    }
                    else if(itemvalue == "editPs"){
                        sheetPostil.editPs(row_index, col_index);
                    }
                    else if(itemvalue == "delPs"){
                        sheetPostil.delPs(row_index, col_index);
                    }
                    else if(itemvalue == "showHidePs"){
                        sheetPostil.showHidePs(row_index, col_index);
                    }
                    else if(itemvalue == "showHideAllPs"){
                        sheetPostil.showHideAllPs();
                    }
                });
            // }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");
        });
        
        //sheet protection
        $("#sheet-icon-protection").click(function(){
            let sheetFile = sheetmanage.getSheetByIndex();
            openProtectionModal(sheetFile);
        });

        //print
        $("#sheet-icon-print").click(function(){
            let menuButtonId = $(this).attr("id") + "-menuButton";
            let _menuButton = $("#" + menuButtonId);
            const _locale = locale();
            const locale_print = _locale.print;
            if(_menuButton.length == 0){
                let itemdata = [
                    {"text": locale_print.menuItemGridLines, "value": "gridLines", "example": ''},
                    {"text": "", "value": "split", "example": ""},
                    {"text": locale_print.menuItemPrint, "value": "print", "example": '<i class="iconfont sheet-iconfont-dayin" aria-hidden="true"></i>'},
                    {"text": locale_print.menuItemAreas, "value": "areas", "example": '<i class="iconfont sheet-iconfont-tihuan" aria-hidden="true"></i>'},
                    // {"text": locale_print.menuItemRows, "value": "rows", "example": '<i class="iconfont sheet-iconfont-zhuandao1" aria-hidden="true"></i>'},
                    // {"text": locale_print.menuItemColumns, "value": "columns", "example": '<i class="iconfont sheet-iconfont-dingwei" aria-hidden="true"></i>'},
                ];

                let itemset = _this.createButtonMenu(itemdata);

                let menu = replaceHtml(_this.menu, { "id": "print", "item": itemset, "subclass": "", "sub": "" });

                $("body").append(menu);
                _menuButton = $("#" + menuButtonId).width(180);

                _menuButton.find(".sheet-cols-menuitem").click(function(){
                    _menuButton.hide();
                    sheetContainerFocus();

                    let _t = $(this), itemvalue = _t.attr("itemvalue");

                    if(itemvalue == "print"){ //Print config
                        printPages();
                    }else if(itemvalue == "gridLines") {
                        Store.showPrintGridLines=!Store.showPrintGridLines;
                        printLineAndNumber();
                    }
                    else if(itemvalue == "areas") { //range
                        printRange();
                    }
                });
            }

            //是否显示打印网格线
            if(Store.showPrintGridLines===true){
                _this.focus(_menuButton, "gridLines");
            }else{
                _this.blur(_menuButton);
            }

            let userlen = $(this).outerWidth();
            let tlen = _menuButton.outerWidth();

            let menuleft = $(this).offset().left;
            if(tlen > userlen && (tlen + menuleft) > $("#" + Store.container).width()){
                menuleft = menuleft - tlen + userlen;
            }
            mouseclickposition(_menuButton, menuleft, $(this).offset().top + 25, "lefttop");
        });
        
        $("body").on("mouseover mouseleave",".sheet-menuButton .sheet-cols-submenu", function(e){
            let _t = $(this), attrid = _t.attr("itemvalue"), 
                _attr = $("#sheet-icon-" + attrid + "-menuButton");
            
            if (e.type === "mouseover") {
                let _con = _t.parent();
                let winW = $(window).width(), winH = $(window).height();
                let menuW = _con.width(), attrH = _attr.height() + 25, attrW = _attr.width() + 5;
                let offset = _t.offset();
                let top = offset.top, left = offset.left + menuW;

                if (left + attrW > winW) {
                    left = offset.left - attrW;
                }

                if (top + attrH > winH) {
                    top = winH - attrH;
                }

                _attr.css({ "top": top, "left": left }).show();
                _this.rightclickmenu = _t;
            } else {
                clearTimeout(_this.submenuhide[_attr.attr('id')]);
                _this.submenuhide[_attr.attr('id')] = setTimeout(function () { _attr.hide(); }, 200);
            }
        }).on("mouseover mouseleave",".sheet-menuButton-sub", function(e){
            if (e.type === "mouseover") {
                _this.rightclickmenu.addClass("sheet-cols-menuitem-hover");
                clearTimeout(_this.submenuhide[$(this).attr('id')]);
            } 
            else {
                _this.rightclickmenu.removeClass("sheet-cols-menuitem-hover");
                $(this).hide();
            }
        });
    },
    getQKBorder: function(width, type, color){
        let bordertype = "";

        if(width.indexOf("pt") > -1){
            width = parseFloat(width);
            
            if(width < 1){

            }
            else if(width < 1.5){
                bordertype = "Medium";
            }
            else{
                bordertype = "Thick";
            }
        }
        else{
            width = parseFloat(width);
            
            if(width < 2){

            }
            else if(width < 3){
                bordertype = "Medium";
            }
            else{
                bordertype = "Thick";
            }
        }

        let style = 0;
        type = type.toLowerCase();

        if(type == "double"){
            style = 2;
        }
        else if(type == "dotted"){
            if(bordertype == "Medium" || bordertype == "Thick"){
                style = 3;
            }
            else{
                style = 10;
            }
        }
        else if(type == "dashed"){
            if(bordertype == "Medium" || bordertype == "Thick"){
                style = 4;
            }
            else{
                style = 9;
            }
        }
        else if(type == "solid"){
            if(bordertype == "Medium"){
                style = 8;
            }
            else if(bordertype == "Thick"){
                style = 13;
            }
            else{
                style = 1;
            }
        }
        
        return [style, color];
    },
    updateFormatCell:function(d, attr, foucsStatus,row_st, row_ed, col_st, col_ed){
        if(d==null || attr==null){
            return;
        }
        if(attr == "ct"){
            for (let r = row_st; r <= row_ed; r++) {
                if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
                    continue;
                }

                for (let c = col_st; c <= col_ed; c++) {
                    let cell = d[r][c], value = null;
                    
                    if (getObjType(cell) == "object") {
                        value = d[r][c]["v"];
                    }
                    else{
                        value = d[r][c];
                    }

                    if(foucsStatus != "@" && isRealNum(value)){
                        value = parseFloat(value);
                    }

                    let mask = update(foucsStatus, value);
                    let type = "n";
                    
                    if(is_date(foucsStatus) || foucsStatus === 14 || foucsStatus === 15 || foucsStatus === 16 || foucsStatus === 17 || foucsStatus === 18 || foucsStatus === 19 || foucsStatus === 20 || foucsStatus === 21 || foucsStatus === 22 || foucsStatus === 45 || foucsStatus === 46 || foucsStatus === 47){
                        type = "d";
                    }
                    else if(foucsStatus == "@" || foucsStatus === 49){
                        type = "s"
                    }
                    else if(foucsStatus == "General" || foucsStatus === 0){
                        // type = "g"; 
                        type = isRealNum(value) ? "n" : "g";
                    }

                    if (getObjType(cell) == "object") {
                        d[r][c]["m"] = mask;
                        if(d[r][c]["ct"] == null){
                            d[r][c]["ct"] = {};
                        }
                        d[r][c]["ct"]["fa"] = foucsStatus;
                        d[r][c]["ct"]["t"] = type;
                    }
                    else{
                        d[r][c] = { "ct":{"fa":foucsStatus, "t":type}, "v": value, "m": mask };
                    }
                }
            }
        }
        else{
            if(attr == "ht"){
                if(foucsStatus == "left"){
                    foucsStatus = "1";
                }
                else if(foucsStatus == "center"){
                    foucsStatus = "0";
                }
                else if(foucsStatus == "right"){
                    foucsStatus = "2";
                }
            }
            else if(attr == "vt"){
                if(foucsStatus == "top"){
                    foucsStatus = "1";
                }
                else if(foucsStatus == "middle"){
                    foucsStatus = "0";
                }
                else if(foucsStatus == "bottom"){
                    foucsStatus = "2";
                }
            }
            else if(attr == "tb"){
                if(foucsStatus == "overflow"){
                    foucsStatus = "1";
                }
                else if(foucsStatus == "clip"){
                    foucsStatus = "0";
                }
                else if(foucsStatus == "wrap"){
                    foucsStatus = "2";
                }
            }
            else if(attr == "tr"){
                if(foucsStatus == "none"){
                    foucsStatus = "0";
                }
                else if(foucsStatus == "angleup"){
                    foucsStatus = "1";
                }
                else if(foucsStatus == "angledown"){
                    foucsStatus = "2";
                }
                else if(foucsStatus == "vertical"){
                    foucsStatus = "3";
                }
                else if(foucsStatus == "rotation-up"){
                    foucsStatus = "4";
                }
                else if(foucsStatus == "rotation-down"){
                    foucsStatus = "5";
                }
            }

            for (let r = row_st; r <= row_ed; r++) {
                if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
                    continue;
                }

                for (let c = col_st; c <= col_ed; c++) {
                    let value = d[r][c];
                    
                    if (getObjType(value) == "object") {
                        // if(attr in inlineStyleAffectAttribute && isInlineStringCell(value)){
                            updateInlineStringFormatOutside(value, attr, foucsStatus);
                        // }
                        // else{
                            d[r][c][attr] = foucsStatus;
                        // }
                        
                    }
                    else{
                        d[r][c] = { v: value };
                        d[r][c][attr] = foucsStatus;
                    }

                    // if(attr == "tr" && d[r][c].tb != null){
                    //     d[r][c].tb = "0";
                    // }
                }
            }
        }

    },
    updateFormat: function(d, attr, foucsStatus){
        let _this = this;

        if(!checkProtectionFormatCells(Store.currentSheetIndex)){
            return;
        }

        if(Store.allowEdit===false){
            return;
        }

        let canvasElement = document.createElement('canvas');
        let canvas = canvasElement.getContext("2d");

        if(attr in inlineStyleAffectAttribute ){
            if (parseInt($("#sheet-input-box").css("top")) > 0 ) {
                let value = $("#sheet-input-box").text();
                if(value.substr(0,1)!="="){
                    let cell = d[Store.sheetCellUpdate[0]][Store.sheetCellUpdate[1]];
                    updateInlineStringFormat(cell, attr, foucsStatus, sheetformula.rangeResizeTo);
                    // return;
                }
            }
        }

        let cfg = $.extend(true, {}, Store.config);
        if(cfg["rowlen"] == null){
            cfg["rowlen"] = {};
        }

        for(let s = 0; s < Store.sheet_select_save.length; s++){
            let row_st = Store.sheet_select_save[s]["row"][0], 
                row_ed = Store.sheet_select_save[s]["row"][1];
            let col_st = Store.sheet_select_save[s]["column"][0], 
                col_ed = Store.sheet_select_save[s]["column"][1];

            this.updateFormatCell(d, attr, foucsStatus, row_st, row_ed, col_st, col_ed);

            if(attr == "tb" || attr == "tr" || attr == "fs"){
                cfg = rowlenByRange(d, row_st, row_ed, cfg);
            }
        }

        let allParam = {};
        if(attr == "tb" || attr == "tr" || attr == "fs"){
            allParam = {
                "cfg": cfg,
                "RowlChange": true
            }
        }

        jfrefreshgrid(d, Store.sheet_select_save, allParam, false);
    },
    updateFormat_mc: function(d, foucsStatus){
        let cfg = $.extend(true, {}, Store.config);
        if(cfg["merge"] == null){
            cfg["merge"] = {};
        }

        if(!checkProtectionNotEnable(Store.currentSheetIndex)){
            return;
        }

        if(foucsStatus == "mergeCancel"){
            for(let i = 0; i < Store.sheet_select_save.length; i++){
                let range = Store.sheet_select_save[i];
                let r1 = range["row"][0], r2 = range["row"][1];
                let c1 = range["column"][0], c2 = range["column"][1];

                if(r1 == r2 && c1 == c2){
                    continue;
                }

                let fv = {};

                for(let r = r1; r <= r2; r++){
                    for(let c = c1; c <= c2; c++){
                        let cell = d[r][c];

                        if(cell != null && cell.mc != null){
                            let mc_r = cell.mc.r, mc_c = cell.mc.c;

                            if("rs" in cell.mc){
                                delete cell.mc;
                                delete cfg["merge"][mc_r + "_" + mc_c];

                                fv[mc_r + "_" + mc_c] = $.extend(true, {}, cell);
                            }
                            else{
                                // let cell_clone = fv[mc_r + "_" + mc_c];
                                let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));

                                delete cell_clone.v;
                                delete cell_clone.m;
                                delete cell_clone.ct;
                                delete cell_clone.f;
                                delete cell_clone.spl;

                                d[r][c] = cell_clone;
                            }
                        }
                    }
                }
            }
        }
        else{
            let isHasMc = false; //选区是否含有 合并的单元格

            for(let i = 0; i < Store.sheet_select_save.length; i++){
                let range = Store.sheet_select_save[i];
                let r1 = range["row"][0], r2 = range["row"][1];
                let c1 = range["column"][0], c2 = range["column"][1];

                for(let r = r1; r <= r2; r++){
                    for(let c = c1; c <= c2; c++){
                        let cell = d[r][c];

                        if(getObjType(cell) == "object" && ("mc" in cell)){
                            isHasMc = true;
                            break;
                        }
                    }
                }
            }

            if(isHasMc){//选区有合并单元格（选区都执行 取消合并）
                for(let i = 0; i < Store.sheet_select_save.length; i++){
                    let range = Store.sheet_select_save[i];
                    let r1 = range["row"][0], r2 = range["row"][1];
                    let c1 = range["column"][0], c2 = range["column"][1];

                    if(r1 == r2 && c1 == c2){
                        continue;
                    }

                    let fv = {};

                    for(let r = r1; r <= r2; r++){
                        for(let c = c1; c <= c2; c++){
                            let cell = d[r][c];

                            if(cell != null && cell.mc != null){
                                let mc_r = cell.mc.r, mc_c = cell.mc.c;

                                if("rs" in cell.mc){
                                    delete cell.mc;
                                    delete cfg["merge"][mc_r + "_" + mc_c];

                                    fv[mc_r + "_" + mc_c] = $.extend(true, {}, cell);
                                }
                                else{
                                // let cell_clone = fv[mc_r + "_" + mc_c];
                                let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));

                                    delete cell_clone.v;
                                    delete cell_clone.m;
                                    delete cell_clone.ct;
                                    delete cell_clone.f;
                                    delete cell_clone.spl;

                                    d[r][c] = cell_clone;
                                }
                            }
                        }
                    }
                }
            }
            else{
                for(let i = 0; i < Store.sheet_select_save.length; i++){
                    let range = Store.sheet_select_save[i];
                    let r1 = range["row"][0], r2 = range["row"][1];
                    let c1 = range["column"][0], c2 = range["column"][1];

                    if(r1 == r2 && c1 == c2){
                        continue;
                    }

                    if(foucsStatus == "mergeAll"){
                        let fv = {}, isfirst = false;

                        for(let r = r1; r <= r2; r++){
                            for(let c = c1; c <= c2; c++){
                                let cell = d[r][c];

                                if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                                    fv = $.extend(true, {}, cell);
                                    isfirst = true;
                                }

                                d[r][c] = { "mc": { "r": r1, "c": c1 } };
                            }
                        }

                        d[r1][c1] = fv;
                        d[r1][c1].mc = { "r": r1, "c": c1, "rs": r2 - r1 + 1, "cs": c2 - c1 + 1 };

                        cfg["merge"][r1 + "_" + c1] = { "r": r1, "c": c1, "rs": r2 - r1 + 1, "cs": c2 - c1 + 1 };
                    }
                    else if(foucsStatus == "mergeV"){
                        for(let c = c1; c <= c2; c++){
                            let fv = {}, isfirst = false;

                            for(let r = r1; r <= r2; r++){
                                let cell = d[r][c];

                                if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                                    fv = $.extend(true, {}, cell);
                                    isfirst = true;
                                }

                                d[r][c] = { "mc": { "r": r1, "c": c } };
                            }

                            d[r1][c] = fv;
                            d[r1][c].mc = { "r": r1, "c": c, "rs": r2 - r1 + 1, "cs": 1 };

                            cfg["merge"][r1 + "_" + c] = { "r": r1, "c": c, "rs": r2 - r1 + 1, "cs": 1 };
                        }
                    }
                    else if(foucsStatus == "mergeH"){
                        for(let r = r1; r <= r2; r++){
                            let fv = {}, isfirst = false;

                            for(let c = c1; c <= c2; c++){
                                let cell = d[r][c];

                                if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                                    fv = $.extend(true, {}, cell);
                                    isfirst = true;
                                }

                                d[r][c] = { "mc": { "r": r, "c": c1 } };
                            }

                            d[r][c1] = fv;
                            d[r][c1].mc = { "r": r, "c": c1, "rs": 1, "cs": c2 - c1 + 1 };

                            cfg["merge"][r + "_" + c1] = { "r": r, "c": c1, "rs": 1, "cs": c2 - c1 + 1 };
                        }
                    }
                }
            }
        }

        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;
            Store.jfredo.push({
                "type": "mergeChange",
                "sheetIndex": Store.currentSheetIndex,
                "data": Store.flowdata,
                "curData": d,
                "range": $.extend(true, [], Store.sheet_select_save),
                "config": $.extend(true, {}, Store.config),
                "curConfig": cfg
            });
        }

        Store.clearjfundo = false;
        jfrefreshgrid(d, Store.sheet_select_save, {"cfg": cfg});
        Store.clearjfundo = true;
    },
    borderfix: function(d, r, c){
        // return [-1, -1, 2, 2];

        let cell = d[r][c];
        let bg = null;
        
        if(cell == null){
            return [-1, 0, 0, -1];
        }
        else if(d[r][c].bg == null || d[r][c].bg == ""){
            return [-1, 0, 0, -1];
        }
        else {
            return [-2, -1, 1, 0];
            //return [-2, -2, 1, 0];
        }
    },
    changeMenuButtonDom:function(attr, foucsStatus, _locale){
        let _this = this;
        if(_locale==null){
            _locale = locale();
        }
        const locale_fontarray = _locale.fontarray;
        const locale_fontjson = _locale.fontjson;

        if(attr == "bl"){
            if(foucsStatus != "0"){
                $("#sheet-icon-bold").addClass("sheet-toolbar-button-hover");
            }
            else{
                $("#sheet-icon-bold").removeClass("sheet-toolbar-button-hover");
            }
        }
        else if(attr == "it"){
            if(foucsStatus != "0"){
                $("#sheet-icon-italic").addClass("sheet-toolbar-button-hover");
            }
            else{
                $("#sheet-icon-italic").removeClass("sheet-toolbar-button-hover");
            }
        }
        else if(attr == "cl"){
            if(foucsStatus != "0"){
                $("#sheet-icon-strikethrough").addClass("sheet-toolbar-button-hover");
            }
            else{
                $("#sheet-icon-strikethrough").removeClass("sheet-toolbar-button-hover");
            }
        }
        else if(attr == "un"){
            if(foucsStatus != "0"){
                $("#sheet-icon-underline").addClass("sheet-toolbar-button-hover");
            }
            else{
                $("#sheet-icon-underline").removeClass("sheet-toolbar-button-hover");
            }
        }
        else if(attr == "ff"){
            let menuButtonId = "sheet-icon-font-family-menuButton";
            let _menuButton = $("#" + menuButtonId);
            // const locale_fontarray = locale().fontarray;
            let itemname = locale_fontarray[0], itemvalue = 0;
            if(foucsStatus != null){
                if(isdatatypemulti(foucsStatus)["num"]){
                    itemvalue = parseInt(foucsStatus);
                    itemname = locale_fontarray[itemvalue];

                    if(itemname==null){
                        itemvalue = _this.defualtFont[itemvalue];
                        itemname = itemvalue;
                        if(itemvalue!=null){
                            _this.addFontTolist(itemvalue);
                        }
                    }
                }
                else{
                    foucsStatus = foucsStatus.replace(/"/g, "").replace(/'/g, "");
                    itemvalue = foucsStatus;
                    itemname = foucsStatus;

                    _this.addFontTolist(itemvalue);
                }   
            }

            _this.focus(_menuButton, itemvalue);
            $("#sheet-icon-font-family").find(".sheet-toolbar-menu-button-caption").html(" "+ itemname +" ");
        }
        else if(attr == "fs"){
            let _menuButton = $("#sheet-icon-font-size-menuButton");
            let itemvalue = foucsStatus, _input = $("#sheet-icon-font-size input");
            _this.focus(_menuButton, itemvalue);
            $("#sheet-icon-font-size").attr("itemvalue", itemvalue);
            _input.val(itemvalue);
        }
        else if(attr == "ht"){
            let _menuButton = $("#sheet-icon-align-menu-menuButton");
            let _t = $("sheet-icon-align"), itemvalue = "left";
            
            if(foucsStatus == "0"){
                itemvalue = "center";
            }
            else if(foucsStatus == "2"){
                itemvalue = "right";
            }

            _this.focus(_menuButton, itemvalue);

            // add iconfont
            const iconfontObject = iconfontObjects.align;

            let _icon = $("#sheet-icon-align").attr("type", itemvalue).find(".sheet-icon-img-container");
            _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);
            _menuButton.hide();
        }
        else if(attr == "vt"){
            let _menuButton = $("#sheet-icon-valign-menu-menuButton");
            let _t = $("sheet-icon-valign"), itemvalue = "bottom";
            
            if(foucsStatus == "1"){
                itemvalue = "top";
            }
            else if(foucsStatus == "0"){
                itemvalue = "middle";
            }

            _this.focus(_menuButton, itemvalue);

            // add iconfont
            const iconfontObject = iconfontObjects.align;

            let _icon = $("#sheet-icon-valign").attr("type", itemvalue).find(".sheet-icon-img-container");
            _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-valign-" + itemvalue+ iconfontObject[itemvalue]);
            _menuButton.hide();
        }
        else if(attr == "tb"){
            let _menuButton = $("#sheet-icon-textwrap-menu-menuButton");
            let _t = $("sheet-icon-textwrap"), itemvalue = "clip";
            
            if(foucsStatus == "1"){
                itemvalue = "overflow";
            }
            else if(foucsStatus == "2"){
                itemvalue = "wrap";
            }

            _this.focus(_menuButton, itemvalue);

            // add iconfont
            const iconfontObject = iconfontObjects.textWrap;

            let _icon = $("#sheet-icon-textwrap").attr("type", itemvalue).find(".sheet-icon-img-container");
            _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue]);
            _menuButton.hide();
        }
        else if(attr == "tr"){
            let _menuButton = $("#sheet-icon-rotation-menu-menuButton");
            let _t = $("sheet-icon-rotation"), itemvalue = "none";
            
            if(foucsStatus == "1"){
                itemvalue = "angleup";
            }
            else if(foucsStatus == "2"){
                itemvalue = "angledown";
            }
            else if(foucsStatus == "3"){
                itemvalue = "vertical";
            }
            else if(foucsStatus == "4"){
                itemvalue = "rotation-up";
            }
            else if(foucsStatus == "5"){
                itemvalue = "rotation-down";
            }

            _this.focus(_menuButton, itemvalue);

            // add iconfont
            const iconfontObject = iconfontObjects.rotation;

            let _icon = $("#sheet-icon-rotation").attr("type", itemvalue).find(".sheet-icon-img-container");
            _icon.removeAttr("class").addClass("sheet-icon-img-container sheet-icon-img sheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue]);
            _menuButton.hide();
        }
        else if(attr == "ct") {
            let _menuButton = $("#sheet-icon-fmt-other");
            const _locale = locale();
            const locale_defaultFmt = _locale.defaultFmt;
            if(!foucsStatus) {
                _menuButton.find(".sheet-toolbar-menu-button-caption").html(" "+ locale_defaultFmt[0].text +" ");
                return;
            }
            const {fa} = foucsStatus;
            const format = locale_defaultFmt.find(f => f.value === fa);
            if(format) {
                _menuButton.find(".sheet-toolbar-menu-button-caption").html(" "+ format.text +" ");
            } else {
                const otherFormat = locale_defaultFmt.find(f => f.value === "fmtOtherSelf");
                _menuButton.find(".sheet-toolbar-menu-button-caption").html(" "+ otherFormat.text +" ");
            }
        }
    },
    inputMenuButtonFocus:function(focusTarget){
        var  w = window.getSelection(); 
        var range = w.getRangeAt(0);
        let startContainer = range.startContainer;
        Store.inlineStringEditRange = null;
        const _locale = locale();
        if(startContainer.parentNode.tagName=="SPAN"){
            let cssText = startContainer.parentNode.style.cssText;
            let stylelist = convertCssToStyleList(cssText);
            for(let key in stylelist){
                this.changeMenuButtonDom(key, stylelist[key], _locale);
            }
        }
    },
    menuButtonFocus: function(d, r, c){
        let _this = this;
        let foucsList = ["bl", "it", "cl", "ff", "ht", "vt", "fs", "tb", "tr", "ct", "un"];
        const _locale = locale();
        for(let i = 0; i < foucsList.length; i++){
            let attr = foucsList[i];
            let foucsStatus = _this.checkstatus(d, r, c, attr);

            this.changeMenuButtonDom(attr, foucsStatus, _locale);
        }
    },
    checkstatus: function(d, r, c, a){
        if(d==null || d[r]==null){
            console.warn("It's incorrect data", r, c);
            return null;
        }
        let foucsStatus = d[r][c];
        return checkstatusByCell(foucsStatus, a);
    },
    setLineDash: function(canvasborder, type, hv, m_st, m_ed, line_st, line_ed){
    	let borderType = {
            "0": "none", 
            "1": "Thin", 
            "2": "Hair", 
            "3": "Dotted", 
            "4": "Dashed", 
            "5": "DashDot", 
            "6": "DashDotDot", 
            "7": "Double", 
            "8": "Medium", 
            "9": "MediumDashed", 
            "10": "MediumDashDot", 
            "11": "MediumDashDotDot", 
            "12": "SlantedDashDot", 
            "13": "Thick"
        };

        type = borderType[type.toString()];

    	try {
        	if(type == "Hair"){
                canvasborder.setLineDash([1, 2]);
            }
            else if(type.indexOf("DashDotDot") > -1){
                canvasborder.setLineDash([2, 2, 5, 2, 2]);
            }
            else if(type.indexOf("DashDot") > -1){
                canvasborder.setLineDash([2, 5, 2]);
            }
            else if(type.indexOf("Dotted") > -1){
                canvasborder.setLineDash([2]);
            }
            else if(type.indexOf("Dashed") > -1){
                canvasborder.setLineDash([3]);
            }
            else{
            	canvasborder.setLineDash([0]);
            }
        } 
        catch(e) {
    		console.log(e);
    	}

        canvasborder.beginPath();

        if(type.indexOf("Medium") > -1){
        	if(hv == "h"){
        		canvasborder.moveTo(m_st, m_ed - 0.5);
            	canvasborder.lineTo(line_st, line_ed - 0.5);
        	}
        	else{
        		canvasborder.moveTo(m_st - 0.5, m_ed);
            	canvasborder.lineTo(line_st - 0.5, line_ed);
        	}
            
            canvasborder.lineWidth = 2;
        }
        else if(type == "Thick"){
            canvasborder.moveTo(m_st, m_ed);
            canvasborder.lineTo(line_st, line_ed);
            canvasborder.lineWidth = 3;
        }
        else {
            canvasborder.moveTo(m_st, m_ed);
            canvasborder.lineTo(line_st, line_ed);
            canvasborder.lineWidth = 1;
        }
    },
    moveMergeData: function(d, offset_r, offset_c){
        if(isRealNull(d)){
            return d;
        }

        let deleMC = [], insertMC=[], hasMC = false;

        for(let r = 0; r < d.length; r++){
            for(let c = 0; c < d[0].length; c++){
                let cell = d[r][c];
                
                if(getObjType(cell) == "object" && ("mc" in cell)){
                    if(cell.mc.rs != null){
                        deleMC.push({ 
                            rs: cell.mc.rs, 
                            cs: cell.mc.cs, 
                            r: cell.mc.r, 
                            c: cell.mc.c
                        });
                        insertMC.push({ 
                            rs: cell.mc.rs, 
                            cs: cell.mc.cs, 
                            r: cell.mc.r + offset_r, 
                            c: cell.mc.c + offset_c
                        });

                        hasMC= true;
                    }

                    d[r][c].mc.r += offset_r;
                    d[r][c].mc.c += offset_c;
                }
            }
        }

        return { "deleMC": deleMC, "insertMC": insertMC, "hasMC": hasMC };
    },
    getRangeInMerge: function(st_r, rlen, st_c, clen, sheetIndex){
        let _this = this;

        let mergelist = [];
        let cfg = null;
        if(sheetIndex != null){
            cfg = $.extend(true, {}, _this.getSheetConfig());
        }
        else{
            cfg = $.extend(true, {}, Store.config);
        }

        if(cfg != null && cfg["merge"] != null){
            for(let key in cfg["merge"]){
                let mc = cfg["merge"][key];
                if(!((st_r + rlen - 1) < mc.r || st_r > (mc.r + mc.rs - 1)) && !((st_c + clen - 1) < mc.c || st_c > (mc.c + mc.cs - 1))){
                    mergelist.push(mc);
                }
            }
        }

        return mergelist;
    },
    mergeborer: function(d, row_index, col_index){
        if(d==null || d[row_index]==null){
            console.warn("Merge info is null", row_index, col_index);
            return null;
        }
        let value = d[row_index][col_index];
        
        if(getObjType(value) == "object" && ("mc" in value)){
            let margeMaindata = value["mc"];
            if(margeMaindata==null){
                console.warn("Merge info is null", row_index, col_index);
                return null;
            }
            col_index = margeMaindata.c;
            row_index = margeMaindata.r;


            if(d[row_index][col_index]==null){
                console.warn("Main merge Cell info is null", row_index, col_index);
                return null;
            }
            let col_rs = d[row_index][col_index].mc.cs;
            let row_rs = d[row_index][col_index].mc.rs;

            let margeMain = d[row_index][col_index].mc;
            
            let start_r, end_r, row, row_pre;
            for(let r = row_index; r < margeMain.rs + row_index; r++){
                if (r == 0) {
                    start_r = - 1;
                }
                else {
                    start_r = Store.visibledatarow[r - 1] - 1;
                }

                end_r = Store.visibledatarow[r];

                if(row_pre == null){
                    row_pre = start_r;
                    row = end_r;
                }
                else{
                    row += end_r - start_r - 1;
                }
            }

            let start_c, end_c, col, col_pre; 
            for(let c = col_index; c < margeMain.cs + col_index; c++){
                if (c == 0) {
                    start_c = 0;
                }
                else {
                    start_c = Store.visibledatacolumn[c - 1];
                }

                end_c = Store.visibledatacolumn[c];

                if(col_pre == null){
                    col_pre = start_c;
                    col = end_c;
                }
                else{
                    col += end_c - start_c;
                }
            }

            return {
                "row": [row_pre , row, row_index, row_index + row_rs - 1], 
                "column": [col_pre, col , col_index, col_index + col_rs - 1]
            };
        }
        else{
            return null;
        }
    },
    mergeMoveData: {},
    mergeMoveMain: function(columnseleted, rowseleted, s, top , height, left , width){
        let _this = this;
        let mergesetting = sheetmanage.getSheetMerge();
        
        if(mergesetting == null){
            return;
        }

        let mcset = [];
        for(let key in mergesetting){
            mcset.push(key);
        }

        if(rowseleted[0] > rowseleted[1]){
            rowseleted[1] = rowseleted[0];
        }

        if(columnseleted[0] > columnseleted[1]){
            columnseleted[1] = columnseleted[0];
        }

        let offloop = true;
        _this.mergeMoveData = {};

        while (offloop) {
            offloop = false;

            for(let i = 0; i < mcset.length; i++){
                let key = mcset[i];
                let mc = mergesetting[key];

                if(key in _this.mergeMoveData){
                    continue;
                }

                let changeparam  = _this.mergeMove(mc, columnseleted, rowseleted, s, top, height, left, width);

                if(changeparam != null){
                    _this.mergeMoveData[key] = mc;
                    
                    columnseleted = changeparam[0];
                    rowseleted= changeparam[1];
                    top = changeparam[2];
                    height = changeparam[3];
                    left = changeparam[4];
                    width = changeparam[5];

                    offloop = true;
                }
                else{
                    delete _this.mergeMoveData[key];
                }
            }
        }
        
        return [columnseleted, rowseleted, top, height, left, width];
    },
    mergeMove: function(mc, columnseleted, rowseleted, s, top , height, left , width){
        let _this = this;
        
        let row_st = mc.r, row_ed = mc.r + mc.rs - 1;
        let col_st = mc.c, col_ed = mc.c + mc.cs - 1;
        let ismatch = false;

        if(columnseleted[1] < columnseleted[0]){
            columnseleted[0] = columnseleted[1];
        }

        if(rowseleted[1] < rowseleted[0]){
            rowseleted[0] = rowseleted[1];
        }

        if( (columnseleted[0] <= col_st && columnseleted[1] >= col_ed && rowseleted[0] <= row_st && rowseleted[1] >= row_ed) || (!(columnseleted[1] < col_st || columnseleted[0] > col_ed) && !(rowseleted[1] < row_st || rowseleted[0] > row_ed))){
            let margeset = _this.mergeborer(Store.flowdata, mc.r, mc.c);
            if(!!margeset){
                let row = margeset.row[1],
                    row_pre = margeset.row[0],
                    row_index = margeset.row[2],
                    col = margeset.column[1],
                    col_pre = margeset.column[0],
                    col_index = margeset.column[2];

                if(!(columnseleted[1] < col_st || columnseleted[0] > col_ed)){
                    //向上滑动
                    if(rowseleted[0] <= row_ed && rowseleted[0] >= row_st){
                        height += top - row_pre;
                        top = row_pre;
                        rowseleted[0] = row_st;
                    }
                    
                    //向下滑动或者居中时往上滑动的向下补齐
                    if(rowseleted[1] >= row_st && rowseleted[1] <= row_ed){
                        if(s.row_focus >= row_st && s.row_focus <= row_ed){
                            height = row - top;
                        }
                        else{
                            height = row - top;
                        }
                        
                        rowseleted[1] = row_ed;
                    }
                }
                
                if(!(rowseleted[1] < row_st || rowseleted[0] > row_ed)){
                    if(columnseleted[0] <= col_ed && columnseleted[0] >= col_st){
                        width += left - col_pre;
                        left = col_pre;
                        columnseleted[0] = col_st;
                    }
                    
                    //向右滑动或者居中时往左滑动的向下补齐
                    if(columnseleted[1] >= col_st && columnseleted[1] <= col_ed){
                        if(s.column_focus >= col_st && s.column_focus <= col_ed){
                            width = col - left;
                        }
                        else{
                            width = col - left;
                        }
                        
                        columnseleted[1] = col_ed;
                    }
                }

                ismatch = true;
            }
        }
       
        if(ismatch){
            return [columnseleted, rowseleted, top , height, left , width];
        }
        else{
            return null;
        }
    },
    getCellRealSize: function(d, cell_r, cell_c){
        let _this = this;

        let width = Store.defaultcollen;
        let height = Store.defaultrowlen;
        let celldata = d[cell_r][cell_c];

        if(!!celldata && celldata["mc"] != null){
            let mc = celldata["mc"];
            let margeset = _this.mergeborer(d, mc.r, mc.c);

            if(!!margeset){
                let row = margeset.row[1];
                let row_pre = margeset.row[0];
                let row_index = margeset.row[2];
                let row_index_ed = margeset.row[3];

                let col = margeset.column[1];
                let col_pre = margeset.column[0];
                let col_index = margeset.column[2];
                let col_index_ed = margeset.column[3];                    

                width = col - col_pre - 1;
                height = row - row_pre - 1;
            }
        }
        else{
            let config = getsheet_file()[getSheetIndex(Store.currentSheetIndex)]["config"];
            
            if (config["columnlen"] != null && config["columnlen"][cell_c] != null) {
                width = config["columnlen"][cell_c];
            }
            
            if (config["rowlen"] != null && config["rowlen"][cell_r] != null) {
                height = config["rowlen"][cell_r];
            }
        }

        return [width, height];
    },
    getTextHeightCache: {},
    getTextSize: function(text, font){
        let fontarray = locale().fontarray;
        let f = font || '10pt ' + fontarray[0];
        
        let _this = this;

        if (f in _this.getTextHeightCache){
            return _this.getTextHeightCache[f];
        }

        if($("#sheetTextSizeTest").length == 0){
            $('<span id="sheetTextSizeTest" style="float:left;white-space:nowrap;visibility:hidden;margin:0;padding:0;">' + text + '</span>').appendTo($('body'));
        }

        let o = $("#sheetTextSizeTest").text(text).css({'font': f}),
            w = o.innerWidth(), 
            h = o.innerHeight();

        _this.getTextHeightCache[f] = [w, h];
       
        return [w, h];
    },
    activeFormulaInput: function(row_index, col_index, rowh, columnh, formula, isnull){
        let _this = this;

        if(isnull == null){
            isnull = false;
        }

        sheetupdateCell(row_index, col_index, Store.flowdata, true);

        if(isnull){
            let formulaTxt = '<span dir="auto" class="sheet-formula-text-color">=</span><span dir="auto" class="sheet-formula-text-color">'+ formula.toUpperCase() +'</span><span dir="auto" class="sheet-formula-text-color">(</span><span dir="auto" class="sheet-formula-text-color">)</span>';

            $("#sheet-rich-text-editor").html(formulaTxt);

            let currSelection = window.getSelection();
            let _span = $("#sheet-rich-text-editor").find("span");
            sheetformula.setCaretPosition(_span.get(_span.length-2), 0, 1);

            return;
        }

        let row_pre = rowLocationByIndex(rowh[0])[0], 
            row = rowLocationByIndex(rowh[1])[1], 
            col_pre = colLocationByIndex(columnh[0])[0], 
            col = colLocationByIndex(columnh[1])[1];

        let formulaTxt = '<span dir="auto" class="sheet-formula-text-color">=</span><span dir="auto" class="sheet-formula-text-color">'+ formula.toUpperCase() +'</span><span dir="auto" class="sheet-formula-text-color">(</span><span class="sheet-formula-functionrange-cell" rangeindex="0" dir="auto" style="color:'+ sheetColor[0] +';">'+ getRangetxt(Store.currentSheetIndex, {"row":rowh, "column":columnh }, Store.currentSheetIndex) +'</span><span dir="auto" class="sheet-formula-text-color">)</span>';
        $("#sheet-rich-text-editor").html(formulaTxt);

        sheetformula.israngeseleciton();
        sheetformula.rangestart = true;
        sheetformula.rangedrag_column_start = false;
        sheetformula.rangedrag_row_start = false;
        sheetformula.rangechangeindex = 0;
        sheetformula.rangeSetValue({ "row": rowh, "column": columnh });
        sheetformula.func_selectedrange = { 
            "left": col_pre, 
            "width": col - col_pre - 1, 
            "top": row_pre, 
            "height": row - row_pre - 1, 
            "left_move": col_pre, 
            "width_move": col - col_pre - 1, 
            "top_move": row_pre, 
            "height_move": row - row_pre - 1, 
            "row": [row_index, row_index], 
            "column": [col_index, col_index] 
        };
        
        $("#sheet-formula-functionrange-select").css({ "left": col_pre, "width": col - col_pre - 1, "top": row_pre, "height": row - row_pre - 1 }).show();

        $("#sheet-formula-help-c").hide();
    },
    backFormulaInput: function(d, r, c, rowh, columnh, formula){
        let _this = this;

        let f = '='+ formula.toUpperCase() +'('+ getRangetxt(Store.currentSheetIndex, {"row":rowh, "column":columnh }, Store.currentSheetIndex) +')';
        let v = sheetformula.execfunction(f, r, c);
        let value = { "v": v[1], "f": v[2] };
        setcellvalue(r, c, d, value);
        sheetformula.execFunctionExist.push({ "r": r, "c": c, "i": Store.currentSheetIndex });

        server.historyParam(d, Store.currentSheetIndex, {"row": [r, r], "column": [c, c]});
    },
    checkNoNullValue: function(cell){
        let v = cell;
        if(getObjType(v) == "object"){
            v = v.v;
        }

        if(!isRealNull(v) && isdatatypemulti(v).num && (cell.ct == null || cell.ct.t == null || cell.ct.t == "n"  || cell.ct.t == "g")   ){
            return true;
        }
        else{
            return false;
        }
    },
    checkNoNullValueAll: function(cell){
        let v = cell;
        if(getObjType(v) == "object"){
            v = v.v;
        }

        if(!isRealNull(v)){
            return true;
        }
        else{
            return false;
        }
    },
    getNoNullValue: function(d, st_x, ed, type){
        let _this = this;
        let hasValueSum = 0, hasValueStart = null;
        let nullNum = 0, nullTime = 0;

        for(let r = ed - 1 ; r >= 0; r--){
            let cell;
            if(type == "c"){
                cell = d[st_x][r];
            }
            else{
                cell = d[r][st_x];
            }

            if(_this.checkNoNullValue(cell)){
                hasValueSum++;
                hasValueStart = r;
            }
            else if(cell == null || cell.v == null || cell.v == ""){
                nullNum++;

                if(nullNum >= 40){
                    if(nullTime <= 0){
                        nullTime = 1;
                    }
                    else{
                        break;
                    }
                }
            }
            else{
                break;
            }
        }

        return hasValueStart;
    },
    singleFormulaInput: function(d, _index, fix, st_m, ed_m, formula, type, noNum, noNull){
        let _this = this;

        if(type == null){
            type = "r";
        }

        if(noNum == null){
            noNum = true;
        }

        if(noNull == null){
            noNull = true;
        }
        
        let isNull = true, isNum= false;
        
        for(let c = st_m; c <= ed_m; c++){
            let cell = null;

            if(type == "c"){
                cell = d[c][fix];
            }
            else{
                cell = d[fix][c];
            }

            if(_this.checkNoNullValue(cell)){
                isNull = false;
                isNum= true;
            }
            else if(_this.checkNoNullValueAll(cell)){
                isNull = false;
            }
        } 

        if(isNull && noNull){
            let st_r_r = _this.getNoNullValue(d, _index, fix, type);

            if(st_r_r == null){
                if(type == "c"){
                    _this.activeFormulaInput(_index, fix, null, null, formula, true);
                }
                else{
                    _this.activeFormulaInput(fix, _index, null, null, formula, true);
                }
            }
            else{
                if(_index == st_m){
                    for(let c = st_m; c <= ed_m; c++){
                        let st_r_r = _this.getNoNullValue(d, c, fix, type);
                        
                        if(st_r_r == null){
                            break;
                        }

                        if(type == "c"){
                            _this.backFormulaInput(d, c, fix, [c, c], [st_r_r, fix-1], formula);
                        }
                        else{
                            _this.backFormulaInput(d, fix, c, [st_r_r, fix-1], [c, c], formula);
                        }
                    }
                }
                else{
                    for(let c = ed_m; c >= st_m; c--){
                        let st_r_r = _this.getNoNullValue(d, c, fix, type);
                        
                        if(st_r_r == null){
                            break;
                        }

                        if(type == "c"){
                            _this.backFormulaInput(d, c, fix, [c, c], [st_r_r, fix-1], formula);
                        }
                        else{
                            _this.backFormulaInput(d, fix, c, [st_r_r, fix-1], [c, c], formula);
                        }
                    }
                }
            }
        }
        else if(isNum && noNum){
            let cell = null;

            if(type == "c"){
                cell = d[ed_m + 1][fix];
            }
            else{
                cell = d[fix][ed_m + 1];
            }

            /* 备注：在搜寻的时候排除自己以解决单元格函数引用自己的问题 */
            if(cell != null && cell.v != null && cell.v.toString().length > 0){
                let c = ed_m + 1;

                if(type == "c"){
                    cell = d[ed_m + 1][fix];
                }
                else{
                    cell = d[fix][ed_m + 1];
                }

                while ( cell != null && cell.v != null && cell.v.toString().length > 0) {
                    
                    c++;
                    let len = null;
                    
                    if(type == "c"){
                        len = d.length;
                    }
                    else{
                        len = d[0].length;
                    }

                    if(c >= len){
                        return;
                    }
                    
                    if(type == "c"){
                        cell = d[c][fix];
                    }
                    else{
                        cell = d[fix][c];
                    }
                }

                if(type == "c"){
                    _this.backFormulaInput(d, c, fix, [st_m, ed_m], [fix ,fix], formula);
                }
                else{
                    _this.backFormulaInput(d, fix, c, [fix ,fix], [st_m, ed_m], formula);
                }
            }
            else{
                if(type == "c"){
                    _this.backFormulaInput(d, ed_m + 1, fix, [st_m, ed_m], [fix ,fix], formula);
                }
                else{
                    _this.backFormulaInput(d, fix, ed_m + 1, [fix ,fix], [st_m, ed_m], formula);
                }
            }
        }
        else{
            return true;
        }
    },
    autoSelectionFormula: function(formula){
        let _this = this;
        let d = editor.deepCopyFlowData(Store.flowdata);
        let nullfindnum = 40;
        let isfalse = true;
        sheetformula.execFunctionExist = [];

        let execFormulaInput_c = function(d, st_r, ed_r, st_c, ed_c, formula){
            let st_c_c = _this.getNoNullValue(d, st_r, ed_c, "c");

            if(st_c_c == null){
                _this.activeFormulaInput(st_r, st_c, null, null, formula, true);
            }
            else{
                _this.activeFormulaInput(st_r, st_c, [st_r, ed_r], [st_c_c, ed_c - 1], formula);
            }
        }

        let execFormulaInput = function(d, st_r, ed_r, st_c, ed_c, formula){
            let st_r_c = _this.getNoNullValue(d, st_c, ed_r, "r");

            if(st_r_c == null){
                execFormulaInput_c(d, st_r, ed_r, st_c, ed_c, formula);
            }
            else{
                _this.activeFormulaInput(st_r, st_c, [st_r_c, ed_r - 1], [st_c, ed_c], formula);
            }
        }

        for(let s = 0; s < Store.sheet_select_save.length; s++){
            let st_r = Store.sheet_select_save[s].row[0], 
                ed_r = Store.sheet_select_save[s].row[1];
            let st_c = Store.sheet_select_save[s].column[0], 
                ed_c = Store.sheet_select_save[s].column[1];
            let row_index = Store.sheet_select_save[s].row_focus, 
                col_index = Store.sheet_select_save[s].column_focus;

            if(st_r == ed_r && st_c == ed_c){
                if(ed_r - 1 < 0 && ed_c - 1 < 0){
                    _this.activeFormulaInput(st_r, st_c, null, null, formula, true);
                    return;
                }

                if(ed_r - 1 >= 0 && _this.checkNoNullValue(d[ed_r - 1][st_c])){
                    execFormulaInput(d, st_r, ed_r, st_c, ed_c, formula);
                }
                else if(ed_c - 1 >= 0 && _this.checkNoNullValue(d[st_r][ed_c - 1])){
                    execFormulaInput_c(d, st_r, ed_r, st_c, ed_c, formula);
                }
                else{
                    execFormulaInput(d, st_r, ed_r, st_c, ed_c, formula);
                }
            }
            else if(st_r == ed_r){
                isfalse = _this.singleFormulaInput(d, col_index, st_r, st_c, ed_c, formula, "r");
            }
            else if(st_c == ed_c){
                isfalse = _this.singleFormulaInput(d, row_index, st_c, st_r, ed_r, formula, "c");
            }
            else{
                let r_false = true;
                for(let r = st_r; r <= ed_r; r++){
                    r_false = _this.singleFormulaInput(d, col_index, r, st_c, ed_c, formula, "r", true, false) && r_false;
                }

                let c_false = true;
                for(let c = st_c; c <= ed_c; c++){
                    c_false = _this.singleFormulaInput(d, row_index, c, st_r, ed_r, formula, "c", true, false) && c_false;
                }

                isfalse = !!r_false && !!c_false;
            }

            isfalse = isfalse && isfalse;
        }

        if(!isfalse){
            sheetformula.execFunctionExist.reverse();
            sheetformula.execFunctionGroup(null, null, null, null, d);
            jfrefreshgrid(d, Store.sheet_select_save);

            clearTimeout(Store.jfcountfuncTimeout);
            Store.jfcountfuncTimeout = setTimeout(function () { countfunc() }, 500);
        }
    },
    getStyleByCell: function(d, r, c){
        let _this = this;
        let style = "";
        
        //交替颜色
        let af_compute = alternateformat.getComputeMap();
        let checksAF = alternateformat.checksAF(r, c, af_compute);

        //条件格式
        let cf_compute = conditionformat.getComputeMap();
        let checksCF = conditionformat.checksCF(r, c, cf_compute);

        const locale_fontarray = locale().fontarray;

        let cell = d[r][c];
        let ct = cell.ct, isInline=false;
        if(isInlineStringCell(cell)){
            isInline = true;
        }
        for(let key in cell){
            let value = _this.checkstatus(d, r, c , key);

            if(checksAF != null || (checksCF != null && checksCF["cellColor"] != null)){
                if(checksCF != null && checksCF["cellColor"] != null){
                    style += "background: " + checksCF["cellColor"] + ";";
                }
                else if(checksAF != null){
                    style += "background: " + checksAF[1] + ";";
                }
            }

            if(getObjType(value) == "object"){
                continue;
            }

            if(key == "bg" || checksAF != null || (checksCF != null && checksCF["cellColor"] != null)){
                if(checksCF != null && checksCF["cellColor"] != null){
                    style += "background: " + checksCF["cellColor"] + ";";
                }
                else if(checksAF != null){
                    style += "background: " + checksAF[1] + ";";
                }
                else{
                    style += "background: " + value + ";";
                }
            }

            // if(!isInline){
            //     if(key == "bl" && value != "0"){
            //         style += "font-weight: bold;";
            //     }
    
            //     if(key == "it" && value != "0"){
            //         style += "font-style:italic;";
            //     }
    
            //     if(key == "ff" && value != "0"){
            //         let f = value;
            //         if(!isNaN(parseInt(value))){
            //             f = locale_fontarray[parseInt(value)];
            //         }
            //         style += "font-family: " + f + ";";
            //     }
    
            //     if(key == "fs" && value != "10"){
            //         style += "font-size: "+ value + "pt;";
            //     }
    
            //     if((key == "fc" && value != "#000000") || checksAF != null || (checksCF != null && checksCF["textColor"] != null)){
            //         if(checksCF != null && checksCF["textColor"] != null){
            //             style += "color: " + checksCF["textColor"] + ";";
            //         }
            //         else if(checksAF != null){
            //             style += "color: " + checksAF[0] + ";";
            //         }
            //         else{
            //             style += "color: " + value + ";";  
            //         }
            //     }
            // }

            if(key == "ht" && value != "1"){
                if(value == "0"){
                    style += "text-align: center;";
                }
                else if(value == "2"){
                    style += "text-align: right;";
                }
            }

            if(key == "vt" && value != "1"){
                if(value == "0"){
                    style += "align-items: center;";
                }
                else if(value == "2"){
                    style += "align-items: flex-end;";
                }
            }
        }

        if(!isInline){
            style += getFontStyleByCell(cell,checksAF,checksCF);
        }

        return style;
    },
    fontSelectList:[],
    defualtFont:["Times New Roman","Arial","Verdana","微软雅黑","宋体","黑体","楷体","仿宋","新宋体","华文新魏","华文行楷","华文隶书"],
    addFontTolist:function(fontName) {
        fontName = fontName.replace(/"/g, "").replace(/'/g, "");
        let isNone = true;
        for(let a=0;a<this.fontSelectList.length;a++){
            let fItem = this.fontSelectList[a];
            if(fItem.value == fontName){
                isNone = false;
                break
            }
        }

        let  _locale = locale();
        const locale_fontjson = _locale.fontjson;
        if(fontName in locale_fontjson){
            isNone = false;
        }

        if(isNone){
            let ret = {};
            ret.value = fontName;
            ret.index = this.fontSelectList.length;
            ret.type = "userDefined";
            ret.text = "<span class='sheet-mousedown-cancel' style='font-size:11px;font-family:"+fontName+"'>"+fontName+"</span>";
            ret.example = "";
            this.fontSelectList.push(ret);

            let _menuButton = $("#sheet-icon-font-family-menuButton");
            let itemset = this.createButtonMenu(this.fontSelectList);
            _menuButton.html(itemset);
        }
    },
    fontInitial:function(fontList) {
        let itemdata = [];
        const locale_fontarray = locale().fontarray;
        for(let a=0;a<locale_fontarray.length;a++){
            let fItem = locale_fontarray[a];
            let ret = {};
            ret.value = fItem;
            ret.index = a;
            ret.type = "inner";
            ret.text = "<span class='sheet-mousedown-cancel' style='font-size:11px;font-family:"+fItem+"'>"+fItem+"</span>";
            ret.example = "";
            itemdata.push(ret);
        }

        if(fontList!=null){
            for(let a=0;a<fontList.length;a++){
                let fItem = fontList[a];
                let ret = {};
                ret.value = fItem.fontName;
                ret.index = a;
                ret.type = "userDefined";
                ret.text = "<span class='sheet-mousedown-cancel' style='font-size:11px;font-family:"+fItem.fontName+"'>"+fItem.fontName+"</span>";
                ret.example = "";
                itemdata.push(ret);

                if(document.fonts && !document.fonts.check("12px "+fItem.fontName)){
                    if(fItem.url){
                        const fontface = new FontFace(fItem.fontName, `url(${fItem.url})`);
                        document.fonts.add(fontface);
                        fontface.load();
                    }
                }
            }

            document.fonts && document.fonts.ready.then(function() {
                // Any operation that needs to be done only after all the fonts
                // have finished loading can go here.
                // console.log("font ready");
            });
        }

        this.fontSelectList = itemdata;
    },
    rangeScreenshot: function(options) {
        let  _locale = locale();
        const locale_screenshot = _locale.screenshot;
        const defaultPadding=1;

        let range={...options};
        if(!(options&&options.row)){
            if (Store.sheet_select_save.length == 0) {
                if (isEditMode()) {
                    alert(locale_screenshot.screenshotTipNoSelection);
                }
                else {
                    tooltip.info(locale_screenshot.screenshotTipTitle, locale_screenshot.screenshotTipNoSelection);
                }
                return;
            }
    
            if (Store.sheet_select_save.length > 1) {
                if (isEditMode()) {
                    alert(locale_screenshot.screenshotTipHasMulti);
                }
                else {
                    tooltip.info(locale_screenshot.screenshotTipTitle, locale_screenshot.screenshotTipHasMulti);
                }
                return;
            }
            range=Store.sheet_select_save[0];
        }

        // if(getObjType(range) == 'string'){
        //     if(!formula.iscelldata(range)){
        //         return tooltip.info("The range parameter is invalid.", "");
        //     }
    
        //     let cellrange = formula.getcellrange(range);
        //     range = {
        //         "row": cellrange.row,
        //         "column": cellrange.column
        //     };
        // }
        if(getObjType(range) != 'object' || range.row == null || range.column == null){
            if (isEditMode()) {
                alert("The range parameter is invalid.");
            }
            else {
                tooltip.info("The range parameter is invalid.", "");
            }
            return;
        }

        let st_r = range.row[0],
            ed_r = range.row[1];
        let st_c = range.column[0],
            ed_c = range.column[1];
        if(ed_r-st_r===0&&ed_c-st_c===0){
            //只有一个单元格时 全部
            st_r=0;
            ed_r=Store.visibledatarow.length-1;
            st_c=0;
            ed_c=Store.visibledatacolumn.length-1;
        }

        let has_PartMC = hasPartMC(Store.config, st_r, ed_r, st_c, ed_c);
        //截图范围内包含部分合并单元格，提示
        if(has_PartMC){
            if (isEditMode()) {
                alert(locale_screenshot.screenshotTipHasMerge);
            }
            else {
                tooltip.info(locale_screenshot.screenshotTipTitle, locale_screenshot.screenshotTipHasMerge);
            }
            return;
        }
        //截图范围内包含部分合并单元格，提示
        // if (Store.config["merge"] != null) {
        //     let has_PartMC = false;

        //     for (let s = 0; s < Store.sheet_select_save.length; s++) {
        //         let r1 = Store.sheet_select_save[s].row[0],
        //             r2 = Store.sheet_select_save[s].row[1];
        //         let c1 = Store.sheet_select_save[s].column[0],
        //             c2 = Store.sheet_select_save[s].column[1];

        //         has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

        //         if (has_PartMC) {
        //             break;
        //         }
        //     }

        //     if (has_PartMC) {
        //         if (isEditMode()) {
        //             alert(locale_screenshot.screenshotTipHasMerge);
        //         }
        //         else {
        //             tooltip.info(locale_screenshot.screenshotTipTitle, locale_screenshot.screenshotTipHasMerge);
        //         }
        //         return;
        //     }
        // }


        let scrollHeight, rh_height;
        if (st_r - 1 < 0) {
            scrollHeight = -defaultPadding;
            rh_height = Store.visibledatarow[ed_r]+defaultPadding;
        }
        else {
            scrollHeight = Store.visibledatarow[st_r - 1]-defaultPadding;
            rh_height = Store.visibledatarow[ed_r] - Store.visibledatarow[st_r - 1]+defaultPadding;
        }

        let scrollWidth, ch_width;
        if (st_c - 1 < 0) {
            scrollWidth = -defaultPadding;
            ch_width = Store.visibledatacolumn[ed_c]+defaultPadding;
        }
        else {
            scrollWidth = Store.visibledatacolumn[st_c - 1]-defaultPadding;
            ch_width = Store.visibledatacolumn[ed_c] - Store.visibledatacolumn[st_c - 1]+defaultPadding;
        }

        let newCanvas = $("<canvas>").attr({
            width: Math.ceil(ch_width * devicePixelRatio),
            height: Math.ceil(rh_height * devicePixelRatio)
        }).css({ width: ch_width, height: rh_height });

        let ctx_newCanvas = newCanvas.get(0).getContext("2d");
        // ctx_newCanvas.scale(Store.devicePixelRatio, Store.devicePixelRatio);
        
        // ctx_newCanvas.clearRect(
        //     0, 
        //     0, 
        //     Store.sheetTableContentHW[0],
        //     Store.sheetTableContentHW[1]
        // );
        // ctx_newCanvas.save();

        //sheetDrawFistBorder(ch_width, rh_height, 1, 1, newCanvas);
        //补上 左边框和上边框
        // ctx_newCanvas.beginPath();
        // ctx_newCanvas.moveTo(
        //     0, 
        //     0
        // );
        // ctx_newCanvas.lineTo(
        //     0, 
        //     Store.devicePixelRatio * rh_height
        // );
        // ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
        // ctx_newCanvas.strokeStyle = sheetdefaultstyle.strokeStyle;        
        // ctx_newCanvas.stroke();
        // ctx_newCanvas.closePath();

        // ctx_newCanvas.beginPath();
        // ctx_newCanvas.moveTo(
        //     0, 
        //     0
        // );
        // ctx_newCanvas.lineTo(
        //     Store.devicePixelRatio * ch_width, 
        //     0
        // );
        // ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
        // ctx_newCanvas.strokeStyle = sheetdefaultstyle.strokeStyle;        
        // ctx_newCanvas.stroke();
        // ctx_newCanvas.closePath();

        sheetDrawMain(scrollWidth, scrollHeight, ch_width, rh_height, 1, 1, null, null, newCanvas, true);


        let url = newCanvas.get(0).toDataURL("image/png");
        newCanvas.remove();
        let image = new Image();
        image.src = url;
        if (ch_width > rh_height) {
            image.style.width = "100%";
        }
        else {
            image.style.height = "100%";
        }
        return {url,image};
    }
}

export default menuButton;