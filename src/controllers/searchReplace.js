import { replaceHtml, chatatABC } from '../utils/util';
import { getSheetIndex } from '../methods/get';
import { modelHTML, keycode } from './constant';
import { selectHightlightShow } from './select';
import sheetmanage from './sheetmanage';
import { isEditMode } from '../global/validate';
import { valueShowEs } from '../global/format';
import { setcellvalue } from '../global/setdata';
import { jfrefreshgrid } from '../global/refresh';
import editor from '../global/editor';
import tooltip from '../global/tooltip';
import func_methods from '../global/func_methods';
import Store from '../store';
import locale from '../locale/locale';
import {checkProtectionLockedRangeList,checkProtectionAllSelected,checkProtectionSelectLockedOrUnLockedCells,checkProtectionNotEnable,checkProtectionLocked} from './protection';


//查找替换
const sheetSearchReplace = {
    createDialog: function(source){
        $("#sheet-modal-dialog-mask").hide();
        $("#sheet-search-replace").remove();

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;
        const locale_button = _locale.button;

        let content = '<div class="tabBox">' +
                        '<span id="searchTab">'+ locale_findAndReplace.find +'</span>' +
                        '<span id="replaceTab">'+ locale_findAndReplace.replace +'</span>' +
                      '</div>' +
                      '<div class="ctBox">' +
                        '<div class="inputBox">' +
                            '<div class="textboxs" id="searchInput">'+ locale_findAndReplace.findTextbox +'：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
                            '<div class="textboxs" id="replaceInput">'+ locale_findAndReplace.replaceTextbox +'：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
                            '<div class="checkboxs">' +
                                '<div id="regCheck">' +
                                    '<input type="checkbox"/>' +
                                    '<span>'+ locale_findAndReplace.regexTextbox +'</span>' +
                                '</div>' +    
                                '<div id="wordCheck">' +
                                    '<input type="checkbox"/>' +
                                    '<span>'+ locale_findAndReplace.wholeTextbox +'</span>' +
                                '</div>' +    
                                '<div id="caseCheck">' +
                                    '<input type="checkbox"/>' +
                                    '<span>'+ locale_findAndReplace.distinguishTextbox +'</span>' +
                                '</div>' +    
                            '</div>' +
                        '</div>' +
                        '<div class="btnBox">' +
                            '<button id="replaceAllBtn" class="btn btn-default">'+ locale_findAndReplace.allReplaceBtn +'</button>' +
                            '<button id="replaceBtn" class="btn btn-default">'+ locale_findAndReplace.replaceBtn +'</button>' +
                            '<button id="searchAllBtn" class="btn btn-default">'+ locale_findAndReplace.allFindBtn +'</button>' +
                            '<button id="searchNextBtn" class="btn btn-default">'+ locale_findAndReplace.findBtn +'</button>' +
                        '</div>' +
                      '</div>';

        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-search-replace", 
            "addclass": "sheet-search-replace", 
            "title": "", 
            "content": content, 
            "botton": '<button class="btn btn-default sheet-model-close-btn">'+locale_button.close+'</button>', 
            "style": "z-index:100003",
            "close":locale_button.close
        }));
        let _t = $("#sheet-search-replace").find(".sheet-modal-dialog-content").css("min-width", 500).end(), 
            myh = _t.outerHeight(), 
            myw = _t.outerWidth();
        let winw = $(window).width(), winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        $("#sheet-search-replace").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 }).show();
    
        if(source == "0"){
            $("#sheet-search-replace #searchTab").addClass("on").siblings().removeClass("on");
            $("#sheet-search-replace #replaceInput").hide();
            $("#sheet-search-replace #replaceAllBtn").hide();
            $("#sheet-search-replace #replaceBtn").hide();
        }
        else if(source == "1"){
            $("#sheet-search-replace #replaceTab").addClass("on").siblings().removeClass("on");
            $("#sheet-search-replace #replaceInput").show();
            $("#sheet-search-replace #replaceAllBtn").show();
            $("#sheet-search-replace #replaceBtn").show();
        }
    },
    init: function(){
        let _this = this;

        //查找替换 切换
        $(document).off("click.SRtabBoxspan").on("click.SRtabBoxspan", "#sheet-search-replace .tabBox span", function(){
            $(this).addClass("on").siblings().removeClass("on");

            let _id = $(this).attr("id");
            if(_id == "searchTab"){
                $("#sheet-search-replace #replaceInput").hide();
                $("#sheet-search-replace #replaceAllBtn").hide();
                $("#sheet-search-replace #replaceBtn").hide();

                $("#sheet-search-replace #searchInput input").focus();
            }
            else if(_id == "replaceTab"){
                $("#sheet-search-replace #replaceInput").show();
                $("#sheet-search-replace #replaceAllBtn").show();
                $("#sheet-search-replace #replaceBtn").show();

                $("#sheet-search-replace #replaceInput input").focus();
            }
        });

        //查找下一个
        $(document).off("keyup.SRsearchInput").on("keyup.SRsearchInput", "#sheet-search-replace #searchInput input", function(event){
            let kcode = event.keyCode;
            if(kcode == keycode.ENTER){
                _this.searchNext();
            }
        });
        $(document).off("click.SRsearchNextBtn").on("click.SRsearchNextBtn", "#sheet-search-replace #searchNextBtn", function(){
            _this.searchNext();
        });

        //查找全部
        $(document).off("click.SRsearchAllBtn").on("click.SRsearchAllBtn", "#sheet-search-replace #searchAllBtn", function(){
            _this.searchAll();
        });
        $(document).off("click.SRsearchAllboxItem").on("click.SRsearchAllboxItem", "#sheet-search-replace #searchAllbox .boxItem", function(){
            $(this).addClass("on").siblings().removeClass("on");

            let r = $(this).attr("data-row");
            let c = $(this).attr("data-col");
            let sheetIndex = $(this).attr("data-sheetIndex");

            if(sheetIndex != Store.currentSheetIndex){
                sheetmanage.changeSheetExec(sheetIndex);
            }

            Store.sheet_select_save = [
                { "row": [r, r], "column": [c, c] }
            ];

            selectHightlightShow();

            let scrollLeft = $("#sheet-cell-main").scrollLeft(), 
                scrollTop = $("#sheet-cell-main").scrollTop();
            let winH = $("#sheet-cell-main").height(), 
                winW = $("#sheet-cell-main").width();

            let row = Store.visibledatarow[r], 
                row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
            let col = Store.visibledatacolumn[c], 
                col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

            if (col - scrollLeft - winW + 20 > 0) {
                $("#sheet-scrollbar-x").scrollLeft(col - winW + 20);
            }
            else if (col_pre - scrollLeft - 20 < 0) {
                $("#sheet-scrollbar-x").scrollLeft(col_pre - 20);
            }

            if (row - scrollTop - winH + 20 > 0) {
                $("#sheet-scrollbar-y").scrollTop(row - winH + 20);
            }
            else if (row_pre - scrollTop - 20 < 0) {
                $("#sheet-scrollbar-y").scrollTop(row_pre - 20);
            }
        });

        //替换
        $(document).off("click.SRreplaceBtn").on("click.SRreplaceBtn", "#sheet-search-replace #replaceBtn", function(){
            _this.replace();
        });

        //全部替换
        $(document).off("click.SRreplaceAllBtn").on("click.SRreplaceAllBtn", "#sheet-search-replace #replaceAllBtn", function(){
            _this.replaceAll();
        });
    },
    searchNext: function(){
        let _this = this;

        let searchText = $("#sheet-search-replace #searchInput input").val();
        if(searchText == "" || searchText == null){
            return;
        }
        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;
        let range;
        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1] && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
            range = [{ 
                "row": [0, Store.flowdata.length - 1], 
                "column": [0, Store.flowdata[0].length - 1] 
            }];
        }
        else{
            range = $.extend(true, [], Store.sheet_select_save);                
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if(searchIndexArr.length == 0){
            if(isEditMode()){
                alert(locale_findAndReplace.noFindTip);
            }
            else{
                tooltip.info(locale_findAndReplace.noFindTip, "");
            }

            return;
        }

        let count = 0;

        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1] && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
            if(Store.sheet_select_save.length == 0){
                count = 0;
            }
            else{
                for(let i = 0; i < searchIndexArr.length; i++){
                    if(searchIndexArr[i].r == Store.sheet_select_save[0].row[0] && searchIndexArr[i].c == Store.sheet_select_save[0].column[0]){
                        if(i == searchIndexArr.length - 1){
                            count = 0;
                        }
                        else{
                            count = i + 1;
                        }

                        break;
                    }
                }
            }

            Store.sheet_select_save = [{ 
                "row": [searchIndexArr[count].r, searchIndexArr[count].r], 
                "column": [searchIndexArr[count].c, searchIndexArr[count].c] 
            }];
        }
        else{
            let rf = range[range.length - 1].row_focus;
            let cf = range[range.length - 1].column_focus;

            for(let i = 0; i < searchIndexArr.length; i++){
                if(searchIndexArr[i].r == rf && searchIndexArr[i].c == cf){
                    if(i == searchIndexArr.length - 1){
                        count = 0;
                    }
                    else{
                        count = i + 1;
                    }

                    break;
                }
            }

            for(let s = 0; s < range.length; s++){
                let r1 = range[s].row[0], r2 = range[s].row[1];
                let c1 = range[s].column[0], c2 = range[s].column[1];

                if(searchIndexArr[count].r >= r1 && searchIndexArr[count].r <= r2 && searchIndexArr[count].c >= c1 && searchIndexArr[count].c <= c2){
                    let obj = range[s];
                    obj["row_focus"] = searchIndexArr[count].r;
                    obj["column_focus"] = searchIndexArr[count].c;
                    range.splice(s, 1);
                    range.push(obj);

                    break;
                }
            }

            Store.sheet_select_save = range;
        }

        selectHightlightShow();

        let scrollLeft = $("#sheet-cell-main").scrollLeft(), 
            scrollTop = $("#sheet-cell-main").scrollTop();
        let winH = $("#sheet-cell-main").height(), 
            winW = $("#sheet-cell-main").width();

        let row = Store.visibledatarow[searchIndexArr[count].r], 
            row_pre = searchIndexArr[count].r - 1 == -1 ? 0 : Store.visibledatarow[searchIndexArr[count].r - 1];
        let col = Store.visibledatacolumn[searchIndexArr[count].c], 
            col_pre = searchIndexArr[count].c - 1 == -1 ? 0 : Store.visibledatacolumn[searchIndexArr[count].c - 1];

        if (col - scrollLeft - winW + 20 > 0) {
            $("#sheet-scrollbar-x").scrollLeft(col - winW + 20);
        }
        else if (col_pre - scrollLeft - 20 < 0) {
            $("#sheet-scrollbar-x").scrollLeft(col_pre - 20);
        }

        if (row - scrollTop - winH + 20 > 0) {
            $("#sheet-scrollbar-y").scrollTop(row - winH + 20);
        }
        else if (row_pre - scrollTop - 20 < 0) {
            $("#sheet-scrollbar-y").scrollTop(row_pre - 20);
        }
        
        if($("#searchAllbox").is(":visible")){
            $("#sheet-search-replace #searchAllbox .boxItem").removeClass("on");
        }
    },
    searchAll: function(){
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        $("#sheet-search-replace #searchAllbox").remove();
        
        let searchText = $("#sheet-search-replace #searchInput input").val();
        if(searchText == "" || searchText == null){
            return;
        }

        let range;
        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1] && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
            range = [{ 
                "row": [0, Store.flowdata.length - 1], 
                "column": [0, Store.flowdata[0].length - 1] 
            }];
        }
        else{
            range = $.extend(true, [], Store.sheet_select_save);                
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if(searchIndexArr.length == 0){
            if(isEditMode()){
                alert(locale_findAndReplace.noFindTip);
            }
            else{
                tooltip.info(locale_findAndReplace.noFindTip, "");
            }

            return;
        }

        let searchAllHtml = '';

        for(let i = 0; i < searchIndexArr.length; i++){
            let value_ShowEs = valueShowEs(searchIndexArr[i].r, searchIndexArr[i].c, Store.flowdata).toString();

            if(value_ShowEs.indexOf("</") > -1 && value_ShowEs.indexOf(">") > -1){
                searchAllHtml += '<div class="boxItem" data-row="' + searchIndexArr[i].r + '" data-col="' + searchIndexArr[i].c + '" data-sheetIndex="' + Store.currentSheetIndex + '">' +
                                    '<span>' + Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].name + '</span>' +
                                    '<span>' + chatatABC(searchIndexArr[i].c) + (searchIndexArr[i].r + 1) + '</span>' +
                                    '<span>' + value_ShowEs + '</span>' +
                                 '</div>';
            }
            else{
                searchAllHtml += '<div class="boxItem" data-row="' + searchIndexArr[i].r + '" data-col="' + searchIndexArr[i].c + '" data-sheetIndex="' + Store.currentSheetIndex + '">' +
                                    '<span>' + Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].name + '</span>' +
                                    '<span>' + chatatABC(searchIndexArr[i].c) + (searchIndexArr[i].r + 1) + '</span>' +
                                    '<span title="' + value_ShowEs + '">' + value_ShowEs + '</span>' +
                                 '</div>';
            }
        }
        
        $('<div id="searchAllbox"><div class="boxTitle"><span>'+ locale_findAndReplace.searchTargetSheet +'</span><span>'+locale_findAndReplace.searchTargetCell+'</span><span>'+locale_findAndReplace.searchTargetValue+'</span></div><div class="boxMain">' + searchAllHtml + '</div></div>').appendTo($("#sheet-search-replace"));
        
        $("#sheet-search-replace #searchAllbox .boxItem").eq(0).addClass("on").siblings().removeClass("on");

        Store.sheet_select_save = [{ 
            "row": [searchIndexArr[0].r, searchIndexArr[0].r], 
            "column": [searchIndexArr[0].c, searchIndexArr[0].c] 
        }];

        selectHightlightShow();
    },
    getSearchIndexArr: function(searchText, range){
        let arr = [];
        let obj = {};

        //正则表达式匹配
        let regCheck = false;
        if($("#sheet-search-replace #regCheck input[type='checkbox']").is(":checked")){
            regCheck = true;
        }

        //整词匹配
        let wordCheck = false;
        if($("#sheet-search-replace #wordCheck input[type='checkbox']").is(":checked")){
            wordCheck = true;
        }

        //区分大小写匹配
        let caseCheck = false;
        if($("#sheet-search-replace #caseCheck input[type='checkbox']").is(":checked")){
            caseCheck = true;
        }

        for(let s = 0; s < range.length; s++){
            let r1 = range[s].row[0], r2 = range[s].row[1];
            let c1 = range[s].column[0], c2 = range[s].column[1];

            for(let r = r1; r <= r2; r++){
                for(let c = c1; c <= c2; c++){
                    let cell = Store.flowdata[r][c];

                    if(cell != null){
                        let value = valueShowEs(r, c, Store.flowdata);

                        if(value == 0){
                            value = value.toString();
                        }

                        if(value != null && value != ""){
                            value = value.toString();

                            if(wordCheck){ //整词
                                if(caseCheck){
                                    if(searchText == value){
                                        if(!((r + "_" + c) in obj)){
                                            obj[r + "_" + c] = 0;
                                            arr.push({"r": r, "c": c});
                                        }
                                    }
                                }
                                else{
                                    let txt = searchText.toLowerCase();
                                    if(txt == value.toLowerCase()){
                                        if(!((r + "_" + c) in obj)){
                                            obj[r + "_" + c] = 0;
                                            arr.push({"r": r, "c": c});
                                        }
                                    }
                                }
                            }
                            else if(regCheck){ //正则表达式
                                let reg;
                                if(caseCheck){
                                    reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
                                }
                                else{
                                    reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
                                }

                                if(reg.test(value)){
                                    if(!((r + "_" + c) in obj)){
                                        obj[r + "_" + c] = 0;
                                        arr.push({"r": r, "c": c});
                                    }
                                }
                            }
                            else if(caseCheck){ //区分大小写
                                let reg = new RegExp(func_methods.getRegExpStr(searchText), "g");

                                if(reg.test(value)){
                                    if(!((r + "_" + c) in obj)){
                                        obj[r + "_" + c] = 0;
                                        arr.push({"r": r, "c": c});
                                    }
                                }
                            }
                            else{
                                let reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");

                                if(reg.test(value)){
                                    if(!((r + "_" + c) in obj)){
                                        obj[r + "_" + c] = 0;
                                        arr.push({"r": r, "c": c});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return arr;
    },
    replace: function(){
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        if(!Store.allowEdit){
            tooltip.info(locale_findAndReplace.modeTip, "");
            return;
        }

        let searchText = $("#sheet-search-replace #searchInput input").val();
        if(searchText == "" || searchText == null){
            if(isEditMode()){
                alert(locale_findAndReplace.searchInputTip);
            }
            else{
                tooltip.info(locale_findAndReplace.searchInputTip, "");
            }

            return;
        }

        let range;
        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1] && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
            range = [{ 
                "row": [0, Store.flowdata.length - 1], 
                "column": [0, Store.flowdata[0].length - 1] 
            }];
        }
        else{
            range = $.extend(true, [], Store.sheet_select_save);                
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if(searchIndexArr.length == 0){
            if(isEditMode()){
                alert(locale_findAndReplace.noReplceTip);
            }
            else{
                tooltip.info(locale_findAndReplace.noReplceTip, "");
            }

            return;
        }

        let count = null;

        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
        let rf = last.row_focus;
        let cf = last.column_focus;

        for(let i = 0; i < searchIndexArr.length; i++){
            if(searchIndexArr[i].r == rf && searchIndexArr[i].c == cf){
                count = i;
                break;
            }
        }

        if(count == null){
            if(searchIndexArr.length == 0){
                if(isEditMode()){
                    alert(locale_findAndReplace.noMatchTip);
                }
                else{
                    tooltip.info(locale_findAndReplace.noMatchTip, "");
                }

                return;
            }
            else{
                count = 0;
            }
        }

        //正则表达式匹配
        let regCheck = false;
        if($("#sheet-search-replace #regCheck input[type='checkbox']").is(":checked")){
            regCheck = true;
        }

        //整词匹配
        let wordCheck = false;
        if($("#sheet-search-replace #wordCheck input[type='checkbox']").is(":checked")){
            wordCheck = true;
        }

        //区分大小写匹配
        let caseCheck = false;
        if($("#sheet-search-replace #caseCheck input[type='checkbox']").is(":checked")){
            caseCheck = true;
        }

        let replaceText = $("#sheet-search-replace #replaceInput input").val();

        let d = editor.deepCopyFlowData(Store.flowdata);

        let r, c;
        if(wordCheck){
            r = searchIndexArr[count].r;
            c = searchIndexArr[count].c;

            let v = replaceText;

            if(!checkProtectionLocked(r, c, Store.currentSheetIndex)){
                return;
            }

            setcellvalue(r, c, d, v);
        }
        else{
            let reg;
            if(caseCheck){
                reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
            }
            else{
                reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
            }

            r = searchIndexArr[count].r;
            c = searchIndexArr[count].c;

            if(!checkProtectionLocked(r, c, Store.currentSheetIndex)){
                return;
            }

            let v = valueShowEs(r, c, d).toString().replace(reg, replaceText);

            setcellvalue(r, c, d, v);
        }

        Store.sheet_select_save = [{ "row": [r, r], "column": [c, c] }];

        if($("#sheet-search-replace #searchAllbox").is(":visible")){
            $("#sheet-search-replace #searchAllbox").hide();
        }

        jfrefreshgrid(d, Store.sheet_select_save);
        selectHightlightShow();

        let scrollLeft = $("#sheet-cell-main").scrollLeft(), 
            scrollTop = $("#sheet-cell-main").scrollTop();
        let winH = $("#sheet-cell-main").height(), 
            winW = $("#sheet-cell-main").width();

        let row = Store.visibledatarow[r], 
            row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c], 
            col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

        if (col - scrollLeft - winW + 20 > 0) {
            $("#sheet-scrollbar-x").scrollLeft(col - winW + 20);
        }
        else if (col_pre - scrollLeft - 20 < 0) {
            $("#sheet-scrollbar-x").scrollLeft(col_pre - 20);
        }

        if (row - scrollTop - winH + 20 > 0) {
            $("#sheet-scrollbar-y").scrollTop(row - winH + 20);
        }
        else if (row_pre - scrollTop - 20 < 0) {
            $("#sheet-scrollbar-y").scrollTop(row_pre - 20);
        }
    },
    replaceAll: function(){
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        if(!Store.allowEdit){
            tooltip.info(locale_findAndReplace.modeTip, "");
            return;
        }

        let searchText = $("#sheet-search-replace #searchInput input").val();
        if(searchText == "" || searchText == null){
            if(isEditMode()){
                alert(locale_findAndReplace.searchInputTip);
            }
            else{
                tooltip.info(locale_findAndReplace.searchInputTip, "");
            }

            return;
        }

        let range;
        if(Store.sheet_select_save.length == 0 || (Store.sheet_select_save.length == 1 && Store.sheet_select_save[0].row[0] == Store.sheet_select_save[0].row[1] && Store.sheet_select_save[0].column[0] == Store.sheet_select_save[0].column[1])){
            range = [{ 
                "row": [0, Store.flowdata.length - 1], 
                "column": [0, Store.flowdata[0].length - 1] 
            }];
        }
        else{
            range = $.extend(true, [], Store.sheet_select_save);                
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if(searchIndexArr.length == 0){
            if(isEditMode()){
                alert(locale_findAndReplace.noReplceTip);
            }
            else{
                tooltip.info(locale_findAndReplace.noReplceTip, "");
            }

            return;
        }

        //正则表达式匹配
        let regCheck = false;
        if($("#sheet-search-replace #regCheck input[type='checkbox']").is(":checked")){
            regCheck = true;
        }

        //整词匹配
        let wordCheck = false;
        if($("#sheet-search-replace #wordCheck input[type='checkbox']").is(":checked")){
            wordCheck = true;
        }

        //区分大小写匹配
        let caseCheck = false;
        if($("#sheet-search-replace #caseCheck input[type='checkbox']").is(":checked")){
            caseCheck = true;
        }

        let replaceText = $("#sheet-search-replace #replaceInput input").val();

        let d = editor.deepCopyFlowData(Store.flowdata);
        let replaceCount = 0;
        if(wordCheck){
            for(let i = 0; i < searchIndexArr.length; i++){
                let r = searchIndexArr[i].r;
                let c = searchIndexArr[i].c;

                if(!checkProtectionLocked(r, c, Store.currentSheetIndex, false)){
                    continue;
                }

                let v = replaceText;

                setcellvalue(r, c, d, v);

                range.push({ "row": [r, r], "column": [c, c] });
                replaceCount++;
            }
        }
        else{
            let reg;
            if(caseCheck){
                reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
            }
            else{
                reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
            }

            for(let i = 0; i < searchIndexArr.length; i++){
                let r = searchIndexArr[i].r;
                let c = searchIndexArr[i].c;

                if(!checkProtectionLocked(r, c, Store.currentSheetIndex, false)){
                    continue;
                }

                let v = valueShowEs(r, c, d).toString().replace(reg, replaceText);

                setcellvalue(r, c, d, v);

                range.push({ "row": [r, r], "column": [c, c] });
                replaceCount++;
            }
        }

        if($("#sheet-search-replace #searchAllbox").is(":visible")){
            $("#sheet-search-replace #searchAllbox").hide();
        }

        jfrefreshgrid(d, range);

        Store.sheet_select_save = $.extend(true, [], range);
        selectHightlightShow();

        let succeedInfo = replaceHtml(locale_findAndReplace.successTip, { 
            "xlength": replaceCount
        });
        if(isEditMode()){
            alert(succeedInfo);
        }
        else{
            tooltip.info(succeedInfo, "");
        }
    }
}

export default sheetSearchReplace;