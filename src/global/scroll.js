import sheetFreezen from '../controllers/freezen';
import { sheet_searcharray } from '../controllers/sheetSearch';
import { sheetrefreshgrid } from '../global/refresh';
import Store from '../store';
import sheetConfigSetting from '../controllers/sheetConfigSetting';
import method from '../global/method'
import { sheetextendtable } from '../global/extend';
import {
    sheetContainerFocus
} from '../utils/util';

let scrollRequestAnimationFrameIni = true,scrollRequestAnimationFrame = false, scrollTimeOutCancel=null;

function execScroll(){
    let scrollLeft = $("#sheet-scrollbar-x").scrollLeft(), 
        scrollTop = $("#sheet-scrollbar-y").scrollTop();
    sheetrefreshgrid(scrollLeft, scrollTop);
    scrollRequestAnimationFrame = window.requestAnimationFrame(execScroll);
}

//全局滚动事件
export default function sheetscrollevent(isadjust) {
    let _t = $("#sheet-cell-main");
    let scrollLeft = $("#sheet-scrollbar-x").scrollLeft(), 
        scrollTop = $("#sheet-scrollbar-y").scrollTop(),
        canvasHeight = $("#sheetTableContent").height(); // canvas高度

    // clearTimeout(scrollTimeOutCancel);

    // scrollTimeOutCancel = setTimeout(() => {
    //     scrollRequestAnimationFrameIni  = true;
    //     window.cancelAnimationFrame(scrollRequestAnimationFrame);
    // }, 500);

    // if (!!isadjust) {
    //     let scrollHeight = _t.get(0).scrollHeight;
    //     let windowHeight = _t.height();
    //     let scrollWidth = _t.get(0).scrollWidth;
    //     let windowWidth = _t.width();

    //     let maxScrollLeft = scrollWidth - windowWidth;
    //     let maxScrollTop = scrollHeight - windowHeight;

    //     let visibledatacolumn_c = Store.visibledatacolumn, visibledatarow_c = Store.visibledatarow;

    //     if (sheetFreezen.freezenhorizontaldata != null) {
    //         visibledatarow_c = sheetFreezen.freezenhorizontaldata[3];
    //     }

    //     if (sheetFreezen.freezenverticaldata != null) {
    //         visibledatacolumn_c = sheetFreezen.freezenverticaldata[3];
    //     }

    //     let col_ed = sheet_searcharray(visibledatacolumn_c, scrollLeft);
    //     let row_ed = sheet_searcharray(visibledatarow_c, scrollTop);

    //     let refreshLeft = scrollLeft , refreshTop = scrollTop;

    //     if (col_ed <= 0) {
    //         scrollLeft = 0;
    //     }
    //     else {
    //         scrollLeft = visibledatacolumn_c[col_ed - 1];
    //     }

    //     if (row_ed <= 0) {
    //         scrollTop = 0;
    //     }
    //     else {
    //         scrollTop = visibledatarow_c[row_ed - 1];
    //     }
    // }

    if (sheetFreezen.freezenhorizontaldata != null) {
        if (scrollTop < sheetFreezen.freezenhorizontaldata[2]) {
            scrollTop = sheetFreezen.freezenhorizontaldata[2];
            $("#sheet-scrollbar-y").scrollTop(scrollTop);
            return;
        }
    }

    if (sheetFreezen.freezenverticaldata != null) {
        if (scrollLeft < sheetFreezen.freezenverticaldata[2]) {
            scrollLeft = sheetFreezen.freezenverticaldata[2];
            $("#sheet-scrollbar-x").scrollLeft(scrollLeft);
            return;
        }
    }

    $("#sheet-cols-h-c").scrollLeft(scrollLeft);//列标题
    $("#sheet-rows-h").scrollTop(scrollTop);//行标题
    
    _t.scrollLeft(scrollLeft).scrollTop(scrollTop);

    $("#sheet-input-box-index").css({
        "left": $("#sheet-input-box").css("left"), 
        "top": (parseInt($("#sheet-input-box").css("top")) - 20) + "px", 
        "z-index": $("#sheet-input-box").css("z-index")
    }).show();

    // if(scrollRequestAnimationFrameIni && Store.scrollRefreshSwitch){
    //     execScroll();
    //     scrollRequestAnimationFrameIni = false;
    // }

    sheetrefreshgrid(scrollLeft, scrollTop);
    

    $("#sheet-bottom-controll-row").css("left", scrollLeft);

    //有选区且有冻结时，滚动适应
    if(sheetFreezen.freezenhorizontaldata != null || sheetFreezen.freezenverticaldata != null){
        sheetFreezen.scrollAdapt();
    }

    if(!method.createHookFunction("scroll", {scrollLeft, scrollTop, canvasHeight})){ return; }

    const scrollBottomAutoAddRow=sheetConfigSetting.scrollBottomAutoAddRow || false;
    let scrollHeight = $("#sheet-scrollbar-y").get(0).scrollHeight;
    //let clientHeight = $("#sheet-scrollbar-y").get(0).clientHeight;
    if(scrollBottomAutoAddRow===true && scrollHeight<(canvasHeight + scrollTop + 100)){
        setTimeout(() => {
            $("#sheet-rightclick-menu").hide();
            sheetContainerFocus();            
            sheetextendtable("row", Store.flowdata.length - 1, 10);
            
            $("#sheet-scrollbar-y").scrollTop(scrollTop);
        }, 500);
    }
}