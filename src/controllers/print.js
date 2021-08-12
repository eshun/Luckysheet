import luckysheetConfigsetting from './luckysheetConfigsetting';
import {zoomChange} from './zoom';
import menuButton from './menuButton';
import sheetmanage from './sheetmanage';
import server from './server';
import {rowLocationByIndex, colLocationByIndex,mouseposition,rowLocation,colLocation} from '../global/location';
import Store from '../store';

let ExcelPlaceholder = {
    "[tabName]":"&A",
    "[CurrentDate]":"&D",
    "[fileName]":"&F",
    "[background]":"&G",
    "[Shadow]":"&H",
    "[TotalPages]":"&N",
    "[pageNumber]":"&P",
    "[CurrentTime]":"&T",
    "[filePath]":"&Z",
}

// Get the pixel value per millimeter
function getOneMmsPx (){
    let div = document.createElement("div");
    div.style.width = "1mm";
    document.querySelector("body").appendChild(div);
    let mm1 = div.getBoundingClientRect();
    let w = mm1.width;
    $(div).remove();
    return mm1.width;
}

let PageSize={
    "a4":{
        width: 595.28,
        height:841.89
    },
};

export function viewChange(curType, preType){
    let currentSheet = sheetmanage.getSheetByIndex();

    if(currentSheet.config==null){
        currentSheet.config = {};
    }

    if(currentSheet.config.sheetViewZoom==null){
        currentSheet.config.sheetViewZoom = {};
    }

    let defaultZoom = 1, type="zoomScaleNormal";
    printLineAndNumberDelete();
    if(curType=="viewNormal"){
        type = "viewNormalZoomScale";
    }
    else if(curType=="viewLayout"){
        type = "viewLayoutZoomScale";
    }
    else if(curType=="viewPage"){
        type = "viewPageZoomScale";
        //defaultZoom = 0.6;
        printLineAndNumberCreate();
    }

    let curZoom = currentSheet.config.sheetViewZoom[type];
    if(curZoom==null){
        curZoom = defaultZoom;
    }

    currentSheet.config.curentsheetView = curType;

    if (Store.clearjfundo) {
        Store.jfredo.push({
            "type": "viewChange",
            "curType": curType,
            "preType": preType,
            "sheetIndex": Store.currentSheetIndex,
        });
    }

    // Store.zoomRatio = curZoom;
    // server.saveParam("all", Store.currentSheetIndex, curZoom, { "k": "zoomRatio" });
    server.saveParam("cg", Store.currentSheetIndex, curType, { "k": "curentsheetView" });

    Store.currentSheetView = curType;

    zoomChange(curZoom);
}

export function printLineAndNumber() {    
    if(Store.showPrintGridLines===true || Store.currentSheetView=="viewPage"){
        printLineAndNumberCreate();
    }else{
        printLineAndNumberDelete();
    }    
}

function printLineAndNumberDelete(){
    $("#sheet-cell-printline-boxs").hide();
    $("#sheet-cell-printline-boxs .sheet-cell-printline").remove();
}

function printLineAndNumberCreate(){
    $("#sheet-cell-printline-boxs").show();
    $("#sheet-cell-printline-boxs .sheet-cell-printline").remove();
    
    const sheet = sheetmanage.getSheetByIndex();
    const luckysheetTableContent = $("#luckysheetTableContent").get(0).getContext("2d");

    const col_w=luckysheetConfigsetting.defaultColWidth;
    const row_h=luckysheetConfigsetting.defaultRowHeight;
    console.log('printLineAndNumberCreate',sheet);

    const contentWidth = sheet.ch_width;
    const contentHeight = sheet.rh_height;
    
    const showPageText= Store.currentSheetView=="viewPage";
    const lineWidth=Store.devicePixelRatio*Store.zoomRatio;

    //格式a4[595.28,841.89]
    const pageSize=PageSize["a4"];
    const pageWidth=pageSize.width;//*Store.devicePixelRatio
    const pageHeight=pageSize.height;

    const xPage=parseInt((contentWidth+pageWidth)/pageWidth);
    const yPage=parseInt((contentHeight+pageHeight)/pageHeight);
    console.log(xPage,yPage);

    for(let x=1;x<=xPage;x++){
        const xPox_s=(x-1)*pageWidth+col_w;
        let xPox_e=x*pageWidth;
        if(xPox_e>contentWidth) xPox_e=contentWidth;
        for(let y=1;y<=yPage;y++){
            const yPox_s=(y-1)*pageHeight+row_h;
            let yPox_e=y*pageHeight;
            if(yPox_e>contentHeight) yPox_e=contentHeight;

            let start_row_location = rowLocation(yPox_s), 
                start_row = start_row_location[1], 
                start_row_pre = start_row_location[0], 
                start_row_index = start_row_location[2];

            let end_row_location = rowLocation(yPox_e), 
                end_row = end_row_location[1], 
                end_row_pre = end_row_location[0], 
                end_row_index = end_row_location[2];
            
            let start_col_location = colLocation(xPox_s), 
                start_col = start_col_location[1], 
                start_col_pre = start_col_location[0], 
                start_col_index = start_col_location[2];

            let end_col_location = colLocation(xPox_e), 
                end_col = end_col_location[1], 
                end_col_pre = end_col_location[0], 
                end_col_index = end_col_location[2];
            
            let l = start_col_pre, t= start_row_pre,w = end_col-start_col_pre-1,h = end_row-start_row_pre-1;

            let pageText='';
            if(showPageText){
                pageText='<span>第 '+(x+(y-1))+' 页</span>';
            }

            $("#sheet-cell-printline-boxs").append('<div class="sheet-cell-printline" style="left: '+l+'px; width: '+w+'px; top: '+t+'px; height: '+h+'px;border-width: '+lineWidth+'px;">'+pageText+'</div>');
        }
    }
}

function switchViewBtn($t){
    let $viewList = $t.parent(), preType=$viewList.find("sheet-print-viewBtn-active").attr("type");
    if($t.attr("type") == preType){
        return;
    }

    let curType = $t.attr("type");
    if(curType!=null){
        viewChange(curType, preType);
    }
    else{
        return;
    }

    $t.parent().find(".sheet-print-viewBtn").removeClass("sheet-print-viewBtn-active");
    $t.addClass("sheet-print-viewBtn-active");
}

export function printInitial(){
    let container = luckysheetConfigsetting.container;
    let _this = this;
    $("#"+container).find(".sheet-print-viewBtn").click(function(){
        switchViewBtn($(this));
    });
    setTimeout(function () {
        printLineAndNumber();
    }, 10);
}
