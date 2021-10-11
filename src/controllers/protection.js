import Store from '../store';
import locale from '../locale/locale';
import { modelHTML } from './constant';
import { getSheetIndex } from '../methods/get';
import { setluckysheet_scroll_status } from '../methods/set';
import sheetmanage from './sheetmanage';
import luckysheetsizeauto from './resize';
import dataVerificationCtrl from './dataVerificationCtrl';
import { replaceHtml,transformRangeToAbsolute,openSelfModel } from '../utils/util';
import { selectionCopyShow } from './select';
import tooltip from '../global/tooltip';
import cleargridelement from '../global/cleargridelement';

let isInitialProtection = false, isInitialProtectionAddRang = false, rangeItemListCache=[], isAddRangeItemState=true, updateRangeItemIndex = null, validationAuthority=null, updatingSheetFile=null, firstInputSheetProtectionPassword = true;
let sqrefMapCache = {}, inputRangeProtectionPassword = {}, initialRangePasswordHtml=false;

const authorityItemArr = [
    "selectLockedCells",
    "selectunLockedCells",
    "formatCells",
    "formatColumns",
    "formatRows",
    "insertColumns",
    "insertRows",
    "insertHyperlinks",
    "deleteColumns",
    "deleteRows",
    "sort",
    "filter",
    "usePivotTablereports",
    "editObjects",
    "editScenarios"
]

function addRangeItem(item){
    const _locale = locale();
    const local_protection = _locale.protection;
    const locale_button = _locale.button;

    let title = item.name, sqref = item.sqref, password = item.password;
    
    let passwordTxt = "";
    if(password!=null && password.length>0){
        passwordTxt = '<i class="icon iconfont sheet-iconfont-bianji2" title="'+ local_protection.rangeItemHasPassword+'"></i>';
    }

    let rangeItemTemplate = `
        <div class="sheet-protection-rangeItem" title="${local_protection.rangeItemDblclick}">
            <div class="sheet-protection-rangeItem-del" title="${locale_button.delete}">
                <i class="icon iconfont sheet-iconfont-shanchu"></i>
            </div>
            <div class="sheet-protection-rangeItem-name" title="${title}">
                ${title}${passwordTxt}
            </div>
            <div class="sheet-protection-rangeItem-range" title="${sqref}">
                ${sqref}
            </div>
            <div class="sheet-protection-rangeItem-update" title="${locale_button.update}">
                <i class="icon iconfont sheet-iconfont-bianji"></i>
            </div>
        </div>
    `;

    $("#sheet-protection-rangeItem-container").append(rangeItemTemplate);
}

function initialEvent(file){

    const _locale = locale();
    const local_protection = _locale.protection;
    const locale_button = _locale.button;

    //confirm protection
    $("#sheet-slider-protection-ok").click(function(){
        let password = $("#protection-password").val();
        let sheet = $("#protection-swichProtectionState").is(":checked");
        let hint = $("#protection-hint").val();

        let file = updatingSheetFile, aut = {};

        if(file!=null && file.config!=null && file.config.authority!=null){
            aut = file.config.authority;
        }        
        
        let authorityData = {

        }

        let algorithmName = "None";
        if(password!="••••••••"){
            authorityData.password = password;
            authorityData.algorithmName = "None";
            authorityData.saltValue = null;
        }
        else if(aut!=null){
            authorityData.algorithmName = aut.algorithmName;
            authorityData.saltValue = aut.saltValue;
            authorityData.password = aut.password;
        }
        else {
            authorityData.algorithmName = "None";
            authorityData.saltValue = null;
            authorityData.password = "";
        }

        authorityData.hintText = hint;

        authorityData.sheet = sheet==true?1:0;

        for(let i=0;i<authorityItemArr.length;i++){
            let name = authorityItemArr[i];
            let checkId = "sheet-protection-check-" + name;
            let authorityValue =  $("#"+checkId).is(':checked');
            
            authorityData[name] = authorityValue==true?1:0;
        }

        authorityData.allowRangeList = rangeItemListCache;

        rangeItemListCache = [];
        firstInputSheetProtectionPassword = true;

        if(file.config==null){
            file.config = {};
        }

        file.config.authority = authorityData;

        inputRangeProtectionPassword = {};

        closeProtectionModal();

    });

    //cancel protection
    $("#sheet-slider-protection-cancel, #sheet-modal-dialog-protection-close").click(function(){
        closeProtectionModal();
    });

    //Add allow edit range
    $("#sheet-slider-protection-addRange").click(function(){
        initialProtectionRangeModal();
        isAddRangeItemState = true;
        $("#sheet-protection-rangeItem-confirm").html(locale_button.insert);

        openSelfModel("sheet-protection-rangeItem-dialog");

        $("#protection-allowRangeAdd-title").val("Default"+rangeItemListCache.length);
        $("#protection-allowRangeAdd-range input").val("");
        $("#protection-allowRangeAdd-password").val("");
        $("#protection-allowRangeAdd-hint").val("");

    });

    //update allow edit range
    $(document).off("click.luckysheetProtection.rangeItemUpdate").on("click.luckysheetProtection.rangeItemUpdate","#sheet-protection-rangeItem-container .sheet-protection-rangeItem-update", function(e){
        initialProtectionRangeModal();

        isAddRangeItemState = false;
        $("#sheet-protection-rangeItem-confirm").html(locale_button.update);

        openSelfModel("sheet-protection-rangeItem-dialog");

        let _rangeItem = $(e.target).closest(".sheet-protection-rangeItem");

        let _rangeItemContainer =  $("#sheet-protection-rangeItem-container");

        let index = _rangeItemContainer.find("> div.sheet-protection-rangeItem").index(_rangeItem);

        let item = rangeItemListCache[index];

        updateRangeItemIndex = index;

        $("#protection-allowRangeAdd-title").val(item.name);
        $("#protection-allowRangeAdd-range input").val(item.sqref);
        if(item.algorithmName=="None"){
            $("#protection-allowRangeAdd-password").val(item.password);
        }
        else{
            $("#protection-allowRangeAdd-password").val("••••••••");
        }
        $("#protection-allowRangeAdd-hint").val(item.hintText);
    });

    //delete allow edit range
    $(document).off("click.luckysheetProtection.rangeItemDelete").on("click.luckysheetProtection.rangeItemDelete","#sheet-protection-rangeItem-container .sheet-protection-rangeItem-del", function(e){
        let _rangeItem = $(e.target).closest(".sheet-protection-rangeItem");

        let _rangeItemContainer =  $("#sheet-protection-rangeItem-container");

        let index = _rangeItemContainer.find("> div.sheet-protection-rangeItem").index(_rangeItem);

        let item = rangeItemListCache[index];

        rangeItemListCache.splice(index, 1);
        _rangeItem.remove();
    });

    //confirm allow edit range
    $(document).off("click.luckysheetProtection.rangeItemConfirm").on("click.luckysheetProtection.rangeItemConfirm","#sheet-protection-rangeItem-confirm", function(){
        let name = $("#protection-allowRangeAdd-title").val(),
        rangeText = $("#protection-allowRangeAdd-range input").val(),
        password = $("#protection-allowRangeAdd-password").val(),
        hint = $("#protection-allowRangeAdd-hint").val();

        if(name.length==0){
            alert(local_protection.rangeItemErrorTitleNull);
            return;
        }

        let range = dataVerificationCtrl.getRangeByTxt(rangeText);

        if(rangeText.length==0){
            alert(local_protection.rangeItemErrorRangeNull);
            return;
        }

        if(range.length==0){
            alert(local_protection.rangeItemErrorRange);
            return;
        }

        rangeText = transformRangeToAbsolute(rangeText);


        if(isAddRangeItemState){
            let item = {
                name:name,
                password:password,
                hintText:hint,
                algorithmName:"None",//MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
                saltValue:null,
                checkRangePasswordUrl:null,
                sqref:rangeText
            }

            addRangeItem(item);
            rangeItemListCache.push(item);
        }
        else{
            let index = updateRangeItemIndex;
            let item = rangeItemListCache[index];

            item.name = name;
            item.sqref = rangeText;
            item.hintText = hint;

            if(password!="••••••••"){
                item.password = password;
                item.algorithmName = "None";
            }

            let _rangeItemContainer =  $("#sheet-protection-rangeItem-container");

            let _rangeitem = _rangeItemContainer.find("> div.sheet-protection-rangeItem").eq(index);

            let _name = _rangeitem.find(".sheet-protection-rangeItem-name");

            let passwordTxt = "";
            if(password!=null && password.length>0){
                passwordTxt = '<i class="icon iconfont sheet-iconfont-bianji2" title="'+ local_protection.rangeItemHasPassword+'"></i>';
            }

            _name.html(name+passwordTxt).attr("title",name);

            let _range = _rangeitem.find(".sheet-protection-rangeItem-range");

            _range.html(rangeText).attr("title",rangeText);
        }



        $("#sheet-protection-rangeItem-dialog").hide();
        $("#sheet-modal-dialog-mask").hide();

    });


    //sheet validation check passWord
    $(document).off("click.luckysheetProtection.validationConfirm").on("click.luckysheetProtection.validationConfirm","#sheet-protection-sheet-validation-confirm", function(e){
        let _validation = $("#sheet-protection-sheet-validation");
        let aut = validationAuthority;

        if(aut==null){
            restoreProtectionConfig(validationAuthority);
            _validation.hide();
            $("#sheet-modal-dialog-mask").hide();
            $("#sheet-modal-dialog-slider-protection").show();
            luckysheetsizeauto();
            return;
        }
        
        let _input = _validation.find("input");
        let password = _input.val();


        if(password==null || password.length==0){
            alert(local_protection.checkPasswordNullalert);
            return;
        }

        if(aut.algorithmName!=null && aut.algorithmName!="None"){
            if(aut.saltValue!=null && aut.saltValue.length>0){
                var hasher = CryptoApi.getHasher(aut.algorithmName);
                password =CryptoApi.hmac(aut.saltValue, password, hasher);
            }
            else{
                password = CryptoApi.hash(aut.algorithmName, password);
            }
        }

        if(password==aut.password){
            restoreProtectionConfig(validationAuthority);
            _validation.hide();
            $("#sheet-modal-dialog-mask").hide();
            $("#sheet-modal-dialog-slider-protection").show();
            luckysheetsizeauto();
            firstInputSheetProtectionPassword = false;
        }
        else{
            alert(local_protection.checkPasswordWrongalert);
        }
        
    });

    $("#sheet-protection-check-selectLockedCells").change(function() { 
        let _selectLockedCells = $("#sheet-protection-check-selectLockedCells"), _selectunLockedCells = $("#sheet-protection-check-selectunLockedCells");

        let selectLockedCellsChecked = _selectLockedCells.is(":checked"), selectunLockedCellsChecked = _selectunLockedCells.is(":checked");

        if(selectLockedCellsChecked){
            _selectunLockedCells.prop('checked', true);
        }
    });

    $("#sheet-protection-check-selectunLockedCells").change(function() { 
        let _selectLockedCells = $("#sheet-protection-check-selectLockedCells"), _selectunLockedCells = $("#sheet-protection-check-selectunLockedCells");

        let selectLockedCellsChecked = _selectLockedCells.is(":checked"), selectunLockedCellsChecked = _selectunLockedCells.is(":checked");

        if(!selectunLockedCellsChecked){
            _selectLockedCells.prop('checked', false);
        }
    });


    //Cell range select controll
    $(document).off("click.luckysheetProtection.dvRange").on("click.luckysheetProtection.dvRange", "#protection-allowRangeAdd-range .fa-table", function(e) {
        $("#sheet-protection-rangeItem-dialog").hide();

        let dataSource = "0";
        let txt = $(this).siblings("input").val().trim(); 

        dataVerificationCtrl.rangeDialog(dataSource, txt);

        dataVerificationCtrl.selectRange = [];

        let range = dataVerificationCtrl.getRangeByTxt(txt);
        if(range.length > 0){
            for(let s = 0; s < range.length; s++){
                let r1 = range[s].row[0], r2 = range[s].row[1];
                let c1 = range[s].column[0], c2 = range[s].column[1];

                let row = Store.visibledatarow[r2], 
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2], 
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                dataVerificationCtrl.selectRange.push({ 
                    "left": col_pre, 
                    "width": col - col_pre - 1, 
                    "top": row_pre, 
                    "height": row - row_pre - 1, 
                    "left_move": col_pre, 
                    "width_move": col - col_pre - 1, 
                    "top_move": row_pre, 
                    "height_move": row - row_pre - 1, 
                    "row": [r1, r2], 
                    "column": [c1, c2], 
                    "row_focus": r1, 
                    "column_focus": c1 
                });
            }
        }
        
        selectionCopyShow(dataVerificationCtrl.selectRange);
    }); 
    $(document).off("click.luckysheetProtection.dvRange2").on("click.luckysheetProtection.dvRange2", "#sheet-protection-rangeItem-dialog .show-box-item-dropdown .range .fa-table", function(e) {
        $("#sheet-protection-rangeItem-dialog").hide();

        let dataSource = "1";
        let txt = $(this).siblings("input").val().trim(); 

        dataVerificationCtrl.rangeDialog(dataSource, txt);

        dataVerificationCtrl.selectRange = [];

        let range = dataVerificationCtrl.getRangeByTxt(txt);
        if(range.length > 0){
            for(let s = 0; s < range.length; s++){
                let r1 = range[s].row[0], r2 = range[s].row[1];
                let c1 = range[s].column[0], c2 = range[s].column[1];

                let row = Store.visibledatarow[r2], 
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2], 
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                    dataVerificationCtrl.selectRange.push({ 
                    "left": col_pre, 
                    "width": col - col_pre - 1, 
                    "top": row_pre, 
                    "height": row - row_pre - 1, 
                    "left_move": col_pre, 
                    "width_move": col - col_pre - 1, 
                    "top_move": row_pre, 
                    "height_move": row - row_pre - 1, 
                    "row": [r1, r2], 
                    "column": [c1, c2], 
                    "row_focus": r1, 
                    "column_focus": c1 
                });
            }
        }
        
        selectionCopyShow(dataVerificationCtrl.selectRange);
    });
    $(document).off("click.luckysheetProtection.dvRangeConfirm").on("click.luckysheetProtection.dvRangeConfirm", "#sheet-dataVerificationRange-dialog-confirm", function(e) {
        let txt = $(this).parents("#sheet-dataVerificationRange-dialog").find("input").val();

        let _input = $("#protection-allowRangeAdd-range input"), inputValue = _input.val();
        if(inputValue.substr(inputValue.length-1, 1)==","){
            _input.val(inputValue + txt);
        }
        else{
            _input.val(txt);
        }
        $("#sheet-dataVerificationRange-dialog").hide();
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-protection-rangeItem-dialog").show();

        let range = [];
        selectionCopyShow(range);
    });
    $(document).off("click.luckysheetProtection.dvRangeClose").on("click.dvRangeClose", "#sheet-dataVerificationRange-dialog-close", function(e) {
        $("#sheet-dataVerificationRange-dialog").hide();
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-protection-rangeItem-dialog").show();

        let range = [];
        selectionCopyShow(range);
    });
    $(document).on("click.luckysheetProtection.luckysheetProtection", "#sheet-dataVerificationRange-dialog .sheet-modal-dialog-title-close", function(e) {
        $("#sheet-dataVerificationRange-dialog").hide();
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-protection-rangeItem-dialog").show();

        let range = [];
        selectionCopyShow(range);
    });
}

//protect range config
function initialProtectionRangeModal(file){
    if(isInitialProtectionAddRang){
        return;
    }
    isInitialProtectionAddRang = true;
    let _locale = locale();
    let local_protection = _locale.protection;
    const locale_button = _locale.button;
    $("body").append(replaceHtml(modelHTML, { 
        "id": "sheet-protection-rangeItem-dialog", 
        "addclass": "sheet-protection-rangeItem-dialog", 
        "title": local_protection.allowRangeTitle, 
        "content": `
            <div class="sheet-protection-rangeItem-content">
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column sheet-protection-column-3x">
                        ${local_protection.allowRangeAddTitle}
                    </div>
                    <div class="sheet-slider-protection-column sheet-protection-column-7x" style="left:30%">
                        <input class="sheet-protection-rangeItemiInput" id="protection-allowRangeAdd-title"  placeHolder="${local_protection.allowRangeAddtitleDefault}">
                    </div>
                </div>
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column sheet-protection-column-3x">
                        ${local_protection.allowRangeAddSqrf}
                    </div>
                    <div class="sheet-slider-protection-column sheet-protection-column-7x" style="left:30%">
                        <div id="protection-allowRangeAdd-range" class="range">
                            <input class="formulaInputFocus" spellcheck="false" placeHolder="${local_protection.selectCellRangeHolder}">
                            <i class="fa fa-table" aria-hidden="true" title="${local_protection.selectCellRange}"></i>
                        </div>
                    </div>
                </div>
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column sheet-protection-column-3x">
                        ${local_protection.allowRangeAddTitlePassword}
                    </div>
                    <div class="sheet-slider-protection-column sheet-protection-column-7x" style="left:30%">
                        <input class="sheet-protection-rangeItemiInput" id="protection-allowRangeAdd-password"  placeHolder="${local_protection.enterPassword}">
                    </div>
                </div>
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column sheet-protection-column-3x">
                        ${local_protection.allowRangeAddTitleHint}
                    </div>
                    <div class="sheet-slider-protection-column sheet-protection-column-7x" style="left:30%">
                        <textarea class="sheet-protection-rangeItemTextarea" id="protection-allowRangeAdd-hint"  placeHolder="${local_protection.allowRangeAddTitleHintTitle}"></textarea>
                    </div>
                </div>
            </div>
        `, 
        "botton":  `<button id="sheet-protection-rangeItem-confirm" class="btn btn-primary">${locale_button.insert}</button>
                    <button class="btn btn-default sheet-model-close-btn">${locale_button.cancel}</button>`, 
        "style": "z-index:100003" 
    }));
}


//Protect sheet initial
function initialProtectionRIghtBar(file){
    const _locale = locale();
    const local_protection = _locale.protection;
    const locale_button = _locale.button;

    let authorityItemHtml = "";
    for(let i=0;i<authorityItemArr.length;i++){
        let name = authorityItemArr[i];

        authorityItemHtml += `
            <div class="sheet-slider-protection-row" style="height:18px;">
                <div class="sheet-slider-protection-column sheet-protection-column-10x">
                <label for="sheet-protection-check-${name}"><input id="sheet-protection-check-${name}" name="sheet-protection-check-${name}" type="checkbox">${local_protection[name]}</label>
                </div>
            </div>
        `;
    }

    const protectionModalHtml = `
    <div id="sheet-modal-dialog-slider-protection" class="sheet-modal-dialog-slider sheet-modal-dialog-slider-pivot" style="display:none;">
        <div class="sheet-modal-dialog-slider-title"> <span>${local_protection.protectiontTitle}</span> <span id="sheet-modal-dialog-protection-close" title="${locale_button.close}"><i class="fa fa-times" aria-hidden="true"></i></span> </div>
        <div class="sheet-modal-dialog-slider-content">
            <div class="sheet-slider-protection-config">
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column sheet-protection-column-10x">
                    <label for="protection-swichProtectionState"><input id="protection-swichProtectionState" name="protection-swichProtectionState" type="checkbox">${local_protection.swichProtectionTip}</label>
                    </div>
                </div>
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column" style="width:98%;">
                        <input class="sheet-protection-input" id="protection-password"  placeHolder="${local_protection.enterPassword}">
                    </div>
                </div>
                <div class="sheet-slider-protection-row">
                    <div class="sheet-slider-protection-column" style="width:98%;">
                        <textarea class="sheet-protection-textarea" id="protection-hint"  placeHolder="${local_protection.enterHintTitle}"></textarea>
                    </div>
                </div>
            </div>
            <div class="sheet-slider-protection-config" style="height:290px;border-top:1px solid #c5c5c5">
                <div class="sheet-slider-protection-row" style="height:20px;">
                    ${local_protection.authorityTitle}
                </div>
                ${authorityItemHtml}
            </div>
            <div class="sheet-slider-protection-config" style="border-top:1px solid #c5c5c5">
                <div class="sheet-slider-protection-row" style="height:25px;">
                    <div class="sheet-slider-protection-column sheet-protection-column-7x" style="left:0px;line-height: 25px;">
                        ${local_protection.allowRangeTitle}
                    </div>
                    <div class="sheet-slider-protection-column sheet-protection-column-3x" style="left:70%;">
                        <div class="sheet-slider-protection-ok sheet-slider-protection-addRange" id="sheet-slider-protection-addRange">
                            ${local_protection.allowRangeAdd}
                        </div>
                    </div>
                </div>

                <div id="sheet-protection-rangeItem-container" class="sheet-slider-protection-row" style="">
                   
                </div>
            </div>
            <div style="bottom:0px;height:45px;position: absolute;width: 100%;">
                <div class="sheet-slider-protection-column sheet-protection-column-5x" style="left:0px;">
                    <div class="sheet-slider-protection-ok" id="sheet-slider-protection-ok">
                        ${locale_button.confirm}
                    </div>
                </div>
                <div class="sheet-slider-protection-column sheet-protection-column-5x" style="left:50%;">
                    <div class="sheet-slider-protection-cancel" id="sheet-slider-protection-cancel">
                        ${locale_button.cancel}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    $("body").append(protectionModalHtml);


    //Password input initial for sheet Protection
    $("body").append(replaceHtml(modelHTML, { 
        "id": "sheet-protection-sheet-validation", 
        "addclass": "sheet-protection-sheet-validation", 
        "title": local_protection.validationTitle, 
        "content": `
            <div class="sheet-slider-protection-row">
                <div class="sheet-slider-protection-column sheet-protection-column-10x">
                    ${local_protection.validationTips}
                </div>
            </div>
            <div class="sheet-slider-protection-row" style="margin-top:20px">
                <div class="sheet-slider-protection-column sheet-protection-column-10x">
                    <input type="password" class="sheet-protection-rangeItemiInput" placeHolder="${local_protection.validationInputHint}">
                </div>
            </div>
        `, 
        "botton":  `<button id="sheet-protection-sheet-validation-confirm" class="btn btn-primary">${locale_button.confirm}</button>
                    <button class="btn btn-default sheet-model-close-btn">${locale_button.cancel}</button>`, 
        "style": "z-index:100003" 
    }));

}


function restoreProtectionConfig(aut){
    if(aut==null){
        aut = {};
    }
    for(let i=0;i<authorityItemArr.length;i++){
        let name = authorityItemArr[i];
        let checkId = "sheet-protection-check-" + name;
        let authorityValue = aut[name];
        if(authorityValue==null){
            authorityValue = 0;
        }

        if(authorityValue==null && name in {selectLockedCells:1, selectunLockedCells:1}){
            authorityValue = 1;
        }

        $("#"+checkId).prop('checked',authorityValue==1?true:false);
    }

    if(aut.password!=null && aut.password.length>0){
        if(aut.algorithmName=="None" || aut.algorithmName==null){
            $("#protection-password").val(aut.password);
        }
        else{
            $("#protection-password").val("••••••••");
        }
    }
    else{
        $("#protection-password").val("");
    }

    let sheet = aut.sheet;
    if(aut.sheet==null){
        sheet = 0;
    }
    $("#protection-swichProtectionState").prop('checked',sheet==1?true:false);

    let hintText = aut.hintText;
    if(hintText==null){
        hintText = "";
    }
    $("#protection-hint").val(hintText);


    rangeItemListCache = [];
    $("#sheet-protection-rangeItem-container").empty();
    let allowRangeList = aut.allowRangeList;
    if(allowRangeList!=null && allowRangeList.length>0){
        for(let i=0;i<allowRangeList.length;i++){
            let item = allowRangeList[i];
            addRangeItem(item);
            rangeItemListCache.push(item);
        }
    }

}

export function openProtectionModal(file){
    if(!isInitialProtection){
        initialProtectionRIghtBar(file);
        initialEvent(file);
        isInitialProtection = true;
    }

    updatingSheetFile = file;


    if(file!=null && file.config!=null && file.config.authority!=null){
        let aut = file.config.authority;
        if(firstInputSheetProtectionPassword && aut.sheet==1 && aut.password!=null && aut.password.length>0){
            validationAuthority = aut;
            $("#sheet-protection-sheet-validation input").val("");
            openSelfModel("sheet-protection-sheet-validation");
            return;
        }
        else{//retore protection config
            restoreProtectionConfig(aut);
        }
    }
    else{//protection initial config
        $("#sheet-protection-check-selectLockedCells").prop('checked',true);
        $("#sheet-protection-check-selectunLockedCells").prop('checked',true);
    }

    $("#sheet-modal-dialog-slider-protection").show();
    luckysheetsizeauto();

}

export function closeProtectionModal(){
    $("#sheet-protection-rangeItem-dialog").hide();
    $("#sheet-modal-dialog-slider-protection").hide();
    luckysheetsizeauto();
}




function checkProtectionLockedSqref(r, c, aut, local_protection, isOpenAlert=true, isLock=true){
    let isPass = false;
    let rangeAut = aut.allowRangeList;
    if(rangeAut!=null && rangeAut.length>0){
        let isExists = false;
        for(let i=0;i<rangeAut.length;i++){
            let ra = rangeAut[i];
            let sqref = ra.sqref;
            let range = dataVerificationCtrl.getRangeByTxt(sqref);

            if(range.length > 0){
                for(let s = 0; s < range.length; s++){
                    let r1 = range[s].row[0], r2 = range[s].row[1];
                    let c1 = range[s].column[0], c2 = range[s].column[1];

                    if(r>=r1 && r<=r2 && c>=c1 && c<=c2){
                        isExists = true;
                        break;
                    }
                }
            }

            if(isExists){

                let password = ra.password;
                if(password!=null && password.length>0  && !(sqref in inputRangeProtectionPassword)){
                    if(isOpenAlert){
                        openRangePasswordModal(ra);
                        $("#sheet-selection-copy .sheet-selection-copy").hide();
                    }
                    return false;
                }
                else{
                    isPass = true;
                }

                break;
            }
        }
    }
    if (!isPass && !isLock) isPass = true
    if(!isPass && isOpenAlert){
        let ht;
        if(aut.hintText != null && aut.hintText.length>0){
            ht = aut.hintText;
        }
        else{
            ht = local_protection.defaultSheetHintText;
        }
        tooltip.info("", ht);
        $("#sheet-selection-copy .sheet-selection-copy").hide();
    }
    
    return isPass;
}


function openRangePasswordModal(rangeAut) {
    const _locale = locale();
    const local_protection = _locale.protection;
    const locale_button = _locale.button;
    
    if(!initialRangePasswordHtml){
        //Password input initial for range
        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-protection-range-validation", 
            "addclass": "sheet-protection-sheet-validation", 
            "title": local_protection.validationTitle, 
            "content": `
                <div class="sheet-slider-protection-row">
                    <div id="sheet-protection-range-validation-hint" class="sheet-slider-protection-column sheet-protection-column-10x">
                        
                    </div>
                </div>
                <div class="sheet-slider-protection-row" style="margin-top:20px">
                    <div class="sheet-slider-protection-column sheet-protection-column-10x">
                        <input type="password" class="sheet-protection-rangeItemiInput" placeHolder="${local_protection.validationInputHint}">
                    </div>
                </div>
            `, 
            "botton":  `<button id="sheet-protection-range-validation-confirm" class="btn btn-primary">${locale_button.confirm}</button>
                        <button class="btn btn-default sheet-model-close-btn">${locale_button.cancel}</button>`, 
            "style": "z-index:100003" 
        }));
    }

    initialRangePasswordHtml = true;


    
    openSelfModel("sheet-protection-range-validation");

    let _hint = $("#sheet-protection-range-validation-hint");
    if(rangeAut.hintText != null && rangeAut.hintText.length>0){
        _hint.html(rangeAut.hintText);
    }
    else{
        _hint.html(local_protection.defaultRangeHintText);
    }
    let _rangeV = $("#sheet-protection-range-validation");
    let _input = _rangeV.find("input");
    _input.val("");

    $("#sheet-protection-range-validation-confirm").off("click").on("click", function(){
        let password = _input.val();

        if(password==null || password.length==0){
            alert(local_protection.checkPasswordNullalert);
            return;
        }

        if(rangeAut.algorithmName!=null && rangeAut.algorithmName!="None"){
            // password = CryptoApi.hash(rangeAut.algorithmName, password);
            if(rangeAut.saltValue!=null && rangeAut.saltValue.length>0){
                var hasher = CryptoApi.getHasher(rangeAut.algorithmName);
                password =CryptoApi.hmac(rangeAut.saltValue, password, hasher);
            }
            else{
                password = CryptoApi.hash(rangeAut.algorithmName, password);
            }
        }

        if(password==rangeAut.password){
            inputRangeProtectionPassword[rangeAut.sqref] = 1;
            _rangeV.hide();
            $("#sheet-modal-dialog-mask").hide();
            alert(local_protection.checkPasswordSucceedalert);
        }
        else{
            alert(local_protection.checkPasswordWrongalert);
        }

    });
    
}

//protection state
export function checkProtectionNotEnable(sheetIndex){
    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    const _locale = locale();
    const local_protection = _locale.protection;

    let ht;
    if(aut.hintText != null && aut.hintText.length>0){
        ht = aut.hintText;
    }
    else{
        ht = local_protection.defaultSheetHintText;
    }
    tooltip.info("", ht);

    return false;
}

//cell locked state
export function checkProtectionLocked(r, c, sheetIndex, isOpenAlert=true, isLock=true){

    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let data=sheetFile.data, cell=data[r][c], aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(cell && cell.lo === 0){ // lo为0的时候才是可编辑
        return true;
    }

    const _locale = locale();
    const local_protection = _locale.protection;

    return checkProtectionLockedSqref(r, c , aut, local_protection, isOpenAlert, isLock);
}

//cell hidden state
export function checkProtectionCellHidden(r, c, sheetIndex){
    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(!sheetFile || (sheetFile.data && !sheetFile.data[r]) || (sheetFile.data && !sheetFile.data[r][c])){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let data=sheetFile.data, cell=data[r][c], aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(cell==null || cell.hi==null || cell.hi==0){
        return true;
    }

    return false;
}

//cell range locked state
export function checkProtectionLockedRangeList(rangeList, sheetIndex){
    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);

    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(rangeList==null || rangeList.length==0){
        return true;
    }

    const _locale = locale();
    const local_protection = _locale.protection;

    for(let s = 0; s < rangeList.length; s++){
        let r1 = rangeList[s].row[0], r2 = rangeList[s].row[1];
        let c1 = rangeList[s].column[0], c2 = rangeList[s].column[1];

        for(let r=r1;r<=r2;r++){
            for(let c=c1;c<=c2;c++){
                const cell = sheetFile.data[r][c] || {}
                let isLock = cell.lo === undefined || cell.lo === 1, // 单元格是否锁定
                    isPass = checkProtectionLockedSqref(r, c , aut, local_protection, true, isLock);
                if(!isPass){
                    return false;
                }
            }
        }
    }

    return true;
}

//selectLockedCells  , selectunLockedCells  and cell state
export function checkProtectionSelectLockedOrUnLockedCells(r, c, sheetIndex){
    const _locale = locale();
    const local_protection = _locale.protection;
    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let data=sheetFile.data, cell=data[r][c], aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(cell && cell.lo === 0){ // lo为0的时候才是可编辑
        if(aut.selectunLockedCells==1 || aut.selectunLockedCells==null){
            return true;
        }
        else{
            return false;
        }
    }
    else{//locked??
        let isAllEdit = checkProtectionLockedSqref(r, c , aut, local_protection, false);//dont alert password model
        if(isAllEdit){//unlocked
            if(aut.selectunLockedCells==1 || aut.selectunLockedCells==null){
                return true;
            }
            else{
                return false;
            }
        }
        else{//locked
            if(aut.selectLockedCells==1 || aut.selectLockedCells==null){
                return true;
            }
            else{
                return false;
            }
        }
    }

    
}



//selectLockedCells or selectunLockedCells authority, highlight cell 
export function checkProtectionAllSelected(sheetIndex){
    const _locale = locale();
    const local_protection = _locale.protection;
    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    let selectunLockedCells = false;
    if(aut.selectunLockedCells==1 || aut.selectunLockedCells==null){
        selectunLockedCells = true;
    }

    let selectLockedCells = false;
    if(aut.selectLockedCells==1 || aut.selectLockedCells==null){
        selectLockedCells = true;
    }

    if(selectunLockedCells && selectLockedCells){
        return true;
    }

    return false;
}

//formatCells authority, bl cl fc fz ff ct  border etc.
export function checkProtectionFormatCells(sheetIndex){

    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(aut.formatCells==1 || aut.formatCells==null){
        return true;
    }

    const _locale = locale();
    const local_protection = _locale.protection;

    let ht;
    if(aut.hintText != null && aut.hintText.length>0){
        ht = aut.hintText;
    }
    else{
        ht = local_protection.defaultSheetHintText;
    }
    tooltip.info("", ht);

    return false;
}

//formatColumns authority: controll column hidden and width
//formatRows authority: controll row hidden and height
//insertColumns authority
//insertRows authority
//insertHyperlinks authority:Hyperlinks is not incomplete
//deleteColumns authority
//deleteRows authority
//sort authority
//filter authority
//usePivotTablereports authority
//editObjects authority: insert,delete,update for image, chart, comment,shape etc. 
//editScenarios authority: Scenarios features is uncompleted

export function checkProtectionAuthorityNormal(sheetIndex, type="formatColumns", isAlert=true){

    let sheetFile = sheetmanage.getSheetByIndex(sheetIndex);
    if(sheetFile==null){
        return true;
    }

    if(sheetFile.config==null || sheetFile.config.authority==null){
        return true;
    }

    let aut = sheetFile.config.authority;

    if(aut==null || aut.sheet==null || aut.sheet==0 ){
        return true;
    }

    if(aut[type]==1 || aut[type]==null){
        return true;
    }

    if(isAlert){
        const _locale = locale();
        const local_protection = _locale.protection;
        
        let ht;
        if(aut.hintText != null && aut.hintText.length>0){
            ht = aut.hintText;
        }
        else{
            ht = local_protection.defaultSheetHintText;
        }
        tooltip.info("", ht);
    }

    return false;
}