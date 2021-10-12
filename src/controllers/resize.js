import sheetConfigSetting from './sheetConfigSetting';
import sheetFreezen from './freezen';
import { sheetrefreshgrid } from '../global/refresh';
import Store from '../store';
import locale from '../locale/locale';
import sheetmanage from './sheetmanage';
import tooltip from '../global/tooltip'
import { $$, getObjType, camel2split } from "../utils/util";
import { defaultToolbar, toolbarIdMap } from './toolbar';

let gridW = 0,
    gridH = 0;

export default function sheetsizeauto(isRefreshCanvas=true) {
    if (!sheetConfigSetting.showinfobar) {
        Store.infobarHeight = 0;
        $("#sheet_info_detail").hide();
    }
    else {
        $("#sheet_info_detail").show();
        // Store.infobarHeight = 56;
        Store.infobarHeight = document.querySelector('#sheet_info_detail').offsetHeight;
    }

    if (!!Store.toobarObject && !!Store.toobarObject.toobarElements && Store.toobarObject.toobarElements.length === 0) {
        $("#" + Store.container).find(".sheet-wa-editor").hide();
        Store.toolbarHeight = 0;
    }
    else {
        $("#" + Store.container).find(".sheet-wa-editor").show();
        // Store.toolbarHeight = 72;
        Store.toolbarHeight = document.querySelector('#' + Store.container +' .sheet-wa-editor').offsetHeight;
    }

    // if (!sheetConfigSetting.showsheetbar) {
    //     $("#" + Store.container).find("#sheet-area").hide();
    //     Store.sheetBarHeight = 0;
    // }
    // else {
    //     $("#" + Store.container).find("#sheet-area").show();
    //     Store.sheetBarHeight = 31;
    // }


    customSheetbarConfig();

    // if (!sheetConfigSetting.showstatisticBar) {
    //     $("#" + Store.container).find(".sheet-stat-area").hide();
    //     Store.statisticBarHeight = 0;
    // }
    // else {
    //     $("#" + Store.container).find(".sheet-stat-area").show();
    //     Store.statisticBarHeight = 23;
    // }

    customStatisticBarConfig();

    // 公式栏
    const formulaEle = document.querySelector("#" + Store.container + ' .sheet-wa-calculate');
    if (!sheetConfigSetting.sheetFormulaBar) {
        formulaEle.style.display = 'none';
        Store.calculatebarHeight = 0;
    }
    else {
        formulaEle.style.display = 'block';
        Store.calculatebarHeight = formulaEle.offsetHeight;
    }

    $("#" + Store.container).find(".sheet-grid-container").css("top", Store.toolbarHeight + Store.infobarHeight + Store.calculatebarHeight);

    gridW = $("#" + Store.container).parent().width();
    gridH = $("#" + Store.container).parent().height();

    if(sheetConfigSetting.showConfigWindowResize){//数据透视表  图表  交替颜色 Protection
        if($("#sheet-modal-dialog-slider-pivot").is(":visible")){
            gridW -= $("#sheet-modal-dialog-slider-pivot").outerWidth();
        }
        else if($(".chartSetting").is(":visible")){
            gridW -= $(".chartSetting").outerWidth();
        }
        else if($("#sheet-modal-dialog-slider-alternateformat").is(":visible")){
            gridW -= $("#sheet-modal-dialog-slider-alternateformat").outerWidth();
        }
        if($("#sheet-modal-dialog-slider-protection").is(":visible")){
            gridW -= $("#sheet-modal-dialog-slider-protection").outerWidth();
        }
    }

    const _locale = locale();
    const locale_toolbar = _locale.toolbar;
    let ismore = false,
        toolbarW = 0,
        morebtn = `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${locale_toolbar.toolMoreTip}" id="sheet-icon-morebtn" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block" style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block" style="user-select: none;">

                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block" style="user-select: none;">
                        ${locale_toolbar.toolMore}
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige" style="user-select: none;font-size:12px;">
                    </div>

                </div>
            </div>
         </div>`,
         // Add style left:$$('.sheet') left, when the worksheet does not fill the full screen
        morediv = '<div id="sheet-icon-morebtn-div" class="sheet-wa-editor" style="position:absolute;top:'+ (Store.infobarHeight + Store.toolbarHeight + $("#" + Store.container).offset().top + $("body").scrollTop()) +'px;right:0px;z-index:1003;padding:5.5px;visibility:hidden;height:auto;white-space:initial;"></div>';

    if($("#sheet-icon-morebtn-div").length == 0){
        $("body").append(morediv);
    }

    // $("#sheet-icon-morebtn-div").hide();
    $$("#sheet-icon-morebtn-div").style.visibility = 'hidden';
    // $("#sheet-icon-morebtn-div > div").appendTo($("#sheet-wa-editor"));

    $("#sheet-icon-morebtn-div > div").each(function(){
        const _t = $(this)[0];
        const _container =  $("#sheet-wa-editor")[0];

        _container.appendChild(document.createTextNode(" "));

        _container.appendChild(_t);
    });

    $("#sheet-icon-morebtn").remove();

    // 所有按钮宽度与元素定位
    const toobarWidths = Store.toobarObject.toobarWidths;
    const toobarElements = Store.toobarObject.toobarElements;
    let moreButtonIndex = 0;

    // When you resize the window during initialization, you will find that the dom has not been rendered yet
    if(toobarWidths == undefined){
        return;
    }
    // 找到应该隐藏的起始元素位置
    for (let index = toobarWidths.length - 1; index >= 0; index--) {

        // #sheet-icon-morebtn button width plus right is 83px
        if(toobarWidths[index] < gridW - 90){
            moreButtonIndex = index;
            if(moreButtonIndex < toobarWidths.length - 1){

                ismore = true;
            }
            break;
        }
    }
    // 从起始位置开始，后面的元素统一挪到下方隐藏DIV中
    for (let index = moreButtonIndex; index < toobarElements.length; index++) {
        const element = toobarElements[index];
        if(element instanceof Array){
            for(const ele of element){
                $("#sheet-icon-morebtn-div").append($(`${ele}`));
            }
        }else{
            $("#sheet-icon-morebtn-div").append($(`${element}`));
        }

    }

    if(ismore){

        $("#sheet-wa-editor").append(morebtn);
        $("#sheet-icon-morebtn").click(function(){

            //When resize, change the width of the more button container in real time
            $$('#sheet-icon-morebtn-div').style.left = '';//reset

            const containerLeft = $$('#sheet').getBoundingClientRect ? $$('#sheet').getBoundingClientRect().left : 0;
            const morebtnLeft = $$('#sheet-icon-morebtn-div').getBoundingClientRect().left;//get real left info

            if(morebtnLeft < containerLeft){
                $$('#sheet-icon-morebtn-div').style.left = containerLeft + 'px';
            }

            let right = $(window).width() - $("#sheet-icon-morebtn").offset().left - $("#sheet-icon-morebtn").width()+ $("body").scrollLeft();


            // $("#sheet-icon-morebtn-div").toggle().css("right", right < 0 ? 0 : right);

            // use native js operation
            $$('#sheet-icon-morebtn-div').style.right = right < 0 ? 0 : right + 'px';

            // change to visibility,morebtnLeft will get the actual value
            if($$('#sheet-icon-morebtn-div').style.visibility === 'hidden'){
                $$('#sheet-icon-morebtn-div').style.visibility = 'visible';
            }else{
                $$('#sheet-icon-morebtn-div').style.visibility = 'hidden';
            }

            let _txt = $(this).find(".sheet-toolbar-menu-button-caption");
            if(_txt.text().indexOf(locale_toolbar.toolMore) > -1){

                const toolCloseHTML = `
                <div class="sheet-toolbar-menu-button-caption sheet-inline-block" style="user-select: none;">
                    ${locale_toolbar.toolClose}
                </div>
                <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-shangyige" style="user-select: none;font-size:12px;">
                </div>
                `
                $(this).find(".sheet-toolbar-button-inner-box").html(toolCloseHTML);
            }
            else{

                const toolMoreHTML = `
                <div class="sheet-toolbar-menu-button-caption sheet-inline-block" style="user-select: none;">
                    ${locale_toolbar.toolMore}
                </div>
                <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige" style="user-select: none;font-size:12px;">
                </div>
                `

                $(this).find(".sheet-toolbar-button-inner-box").html(toolMoreHTML);
            }

        });
        //$("#sheet-wa-editor div").trigger("create");

        // $("#sheet-icon-morebtn-div .sheet-toolbar-menu-button").css("margin-right", -1);
        // $("#sheet-icon-morebtn-div .sheet-toolbar-button-split-left").css("margin-right", -3);

        // “更多”容器中，联动hover效果
        $("#sheet-icon-morebtn-div .sheet-toolbar-button-split-left").off("hover").hover(function(){
            $(this).next(".sheet-toolbar-button-split-right").addClass("sheet-toolbar-button-split-right-hover");
        }, function(){
            $(this).next(".sheet-toolbar-button-split-right").removeClass("sheet-toolbar-button-split-right-hover");
        });

        $("#sheet-icon-morebtn-div .sheet-toolbar-button-split-right").off("hover").hover(function(){
            $(this).prev(".sheet-toolbar-button-split-left").addClass("sheet-toolbar-button-hover");
        }, function(){
            $(this).prev(".sheet-toolbar-button-split-left").removeClass("sheet-toolbar-button-hover");
        });

        // tooltip
        tooltip.createHoverTip("#sheet-icon-morebtn-div" ,".sheet-toolbar-menu-button, .sheet-toolbar-button, .sheet-toolbar-combo-button");
    }

    $("#"+ Store.container + " .sheet-wa-editor .sheet-toolbar-button-split-left").off("hover").hover(function(){
        $(this).next(".sheet-toolbar-button-split-right").addClass("sheet-toolbar-button-split-right-hover");
    }, function(){
        $(this).next(".sheet-toolbar-button-split-right").removeClass("sheet-toolbar-button-split-right-hover");
    });

    $("#"+ Store.container + " .sheet-wa-editor .sheet-toolbar-button-split-right").off("hover").hover(function(){
        $(this).prev(".sheet-toolbar-button-split-left").addClass("sheet-toolbar-button-hover");
    }, function(){
        $(this).prev(".sheet-toolbar-button-split-left").removeClass("sheet-toolbar-button-hover");
    });

    // When adding elements to the sheet-icon-morebtn-div element of the toolbar, it will affect the height of the entire workbook area, so the height is obtained here

    Store.gridW=gridW;
    Store.gridH=gridH;
    changeSheetContainerSize(gridW, gridH)

    if(isRefreshCanvas){
        sheetrefreshgrid($("#sheet-cell-main").scrollLeft(), $("#sheet-cell-main").scrollTop());
    }

    sheetmanage.sheetArrowShowAndHide();
    sheetmanage.sheetBarShowAndHide();
}


export function changeSheetContainerSize(gridW, gridH){
    if(!gridW){
        if(Store.gridW){
            gridW = Store.gridW
        }else{
            gridW = $("#" + Store.container).width();
        }
    }
    if(!gridH){
        if(Store.gridH){
            gridH = Store.gridH
        }else{
            gridH = $("#" + Store.container).height();
        }
    }

    $("#" + Store.container).find(".sheet").height(gridH - 2).width(gridW - 2);

    Store.cellmainHeight = gridH - (Store.infobarHeight + Store.toolbarHeight + Store.calculatebarHeight + Store.columnHeaderHeight + Store.sheetBarHeight + Store.statisticBarHeight);
    Store.cellmainWidth = gridW - Store.rowHeaderWidth;

    $("#sheet-cols-h-c, #sheet-cell-main").width(Store.cellmainWidth);
    $("#sheet-cell-main").height(Store.cellmainHeight);
    $("#sheet-rows-h").height(Store.cellmainHeight - Store.cellMainSrollBarSize);

    $("#sheet-scrollbar-y").height(Store.cellmainHeight + Store.columnHeaderHeight - Store.cellMainSrollBarSize - 3);
    $("#sheet-scrollbar-x").height(Store.cellMainSrollBarSize);
    $("#sheet-scrollbar-y").width(Store.cellMainSrollBarSize);

    $("#sheet-scrollbar-x").width(Store.cellmainWidth).css("left", Store.rowHeaderWidth - 2);

    Store.sheetTableContentHW = [
        Store.cellmainWidth + Store.rowHeaderWidth - Store.cellMainSrollBarSize,
        Store.cellmainHeight + Store.columnHeaderHeight - Store.cellMainSrollBarSize
    ];

    $("#sheetTableContent, #sheetTableContentF").attr({
        width: Math.ceil(Store.sheetTableContentHW[0] * Store.devicePixelRatio),
        height: Math.ceil(Store.sheetTableContentHW[1] * Store.devicePixelRatio)
    })
    .css({ width: Store.sheetTableContentHW[0], height: Store.sheetTableContentHW[1] });

    $("#" + Store.container).find("#sheet-grid-window-1").css("bottom", Store.sheetBarHeight);
    $("#" + Store.container).find(".sheet-grid-window").css("bottom", Store.statisticBarHeight);

    let gridwidth = $("#sheet-grid-window-1").width();
    $("#sheet-freezebar-horizontal").find(".sheet-freezebar-horizontal-handle")
    .css({ "width": gridwidth - 10 })
    .end()
    .find(".sheet-freezebar-horizontal-drop")
    .css({ "width": gridwidth - 10 });

    let gridheight = $("#sheet-grid-window-1").height();
    $("#sheet-freezebar-vertical")
    .find(".sheet-freezebar-vertical-handle")
    .css({ "height": gridheight - 10 })
    .end()
    .find(".sheet-freezebar-vertical-drop")
    .css({ "height": gridheight - 10 });

    sheetFreezen.createAssistCanvas();
}

/**
 *
 *
 * Toolbar judgment rules: First set the display and hide of all tool buttons according to showtoolbar, and then override the judgment of showtoolbar according to showtoolbarConfig rules
 *
 * The width value of each button in the statistics toolbar is used to calculate which needs to be placed in more buttons
 */
export function menuToolBarWidth() {
    const showtoolbar = sheetConfigSetting.showtoolbar;
    const showtoolbarConfig = sheetConfigSetting.showtoolbarConfig;

    const toobarWidths = Store.toobarObject.toobarWidths = [];
    const toobarElements = Store.toobarObject.toobarElements = [];
    const toolbarConfig = Store.toobarObject.toolbarConfig = buildBoolBarConfig();

    /**
     * 基于 showtoolbarConfig 配置 动态生成 toolbarConfig
     * @returns {object}
     * @input showtoolbarConfig = ['undo', 'redo', '|' , 'font' , 'moreFormats', '|']
     * {
     *     undo: {ele: '#sheet-icon-undo', index: 0},
     *     redo: {ele: ['#sheet-icon-redo', '#sheet-separator-redo'], index: 1},
     *     undo: {ele: '#sheet-icon-font', index: 2},
     *     moreFormats: {ele: ['#sheet-icon-fmt-other', '#sheet-separator-more-formats'], index: 3},
     * }
     */
    function buildBoolBarConfig() {
        let obj = {};
        function array2Config(arr) {
            const obj = {};
            let current,next;
            let index = 0;
            for (let i = 0; i<arr.length; i++) {
                current = arr[i];
                next = arr[i + 1];
                if (current !== '|') {
                    obj[current] = {
                        ele: toolbarIdMap[current],
                        index: index++
                    }
                }
                if (next === '|' && obj[current] && obj[current].ele) {
                    if (getObjType(obj[current].ele) === 'array') {
                        obj[current].ele.push(`#toolbar-separator-${camel2split(current)}`);
                    } else {
                        obj[current].ele = [obj[current].ele, `#toolbar-separator-${camel2split(current)}`];
                    }
                }
            }
            return obj;
        }
        // 数组形式直接生成
        if (getObjType(showtoolbarConfig) === 'array') {
            // show 为 false
            if (!showtoolbar) {
                return obj;
            }
            return array2Config(showtoolbarConfig);
        }
        // 否则为全部中从记录中挑选显示或隐藏
        const config = defaultToolbar.reduce(function(total, curr) {
            if (curr !== '|') {
                total[curr] = true;
            }
            return total;
        }, {});
        if (!showtoolbar) {
            for (let s in config) {
                config[s] = false;
            }
        }

        if (JSON.stringify(showtoolbarConfig) !== '{}') {
            if(showtoolbarConfig.hasOwnProperty('undoRedo')){
                config.undo = config.redo = showtoolbarConfig.undoRedo;

            }
            Object.assign(config, showtoolbarConfig);

            let current,next;
            let index = 0;
            for (let i = 0; i<defaultToolbar.length; i++) {
                current = defaultToolbar[i];
                next = defaultToolbar[i + 1];
                if (current !== '|' && config[current]) {

                    obj[current] = {
                        ele: toolbarIdMap[current],
                        index: index++
                    }
                }
                if (next === '|' && obj[current] && obj[current].ele) {
                    if (getObjType(obj[current].ele) === 'array') {
                        obj[current].ele.push(`#toolbar-separator-${camel2split(current)}`);
                    } else {
                        obj[current].ele = [obj[current].ele, `#toolbar-separator-${camel2split(current)}`];
                    }
                }
            }
        } else {
            obj = showtoolbar ? array2Config(defaultToolbar) : {};
        }

        return obj;
    }

    for (let s in toolbarConfig){
        if (Object.prototype.hasOwnProperty.call(toolbarConfig, s)) {
            toobarElements.push($.extend(true,{},toolbarConfig[s]));
        }
    }

    toobarElements.sort(sortToolbar);

    function sortToolbar(a,b) {
        if(a.index > b.index){
            return 1;
        }else{
            return -1;
        }
    }
    toobarElements.forEach((curr,index,arr)=>{
        arr[index] = curr.ele;

        if(index !== toobarElements.length - 1){
            if(curr.ele instanceof Array){
                toobarWidths.push($(curr.ele[0]).offset().left);
            }else{
                toobarWidths.push($(curr.ele).offset().left);
            }
        }else{
            if(curr.ele instanceof Array){
                toobarWidths.push($(curr.ele[0]).offset().left);
                toobarWidths.push($(curr.ele[0]).offset().left + $(curr.ele[0]).outerWidth() + 5);
            }else{
                toobarWidths.push($(curr.ele).offset().left);
                toobarWidths.push($(curr.ele).offset().left + $(curr.ele).outerWidth() + 5);
            }
        }

    });

    //If the container does not occupy the full screen, we need to subtract the left margin
    const containerLeft = $('#' + Store.container).offset().left;
    toobarWidths.forEach((item,i)=>{
        toobarWidths[i] -= containerLeft;
    })

}

/**
 *Custom configuration bottom sheet button
 */
function customSheetbarConfig() {

    if(!sheetConfigSetting.initShowsheetbarConfig){

        sheetConfigSetting.initShowsheetbarConfig = true;

        const config = {
            add: true, //Add worksheet
            menu: true, //Worksheet management menu
            sheet: true //Worksheet display
        }

        if(!sheetConfigSetting.showsheetbar){
            for(let s in config){
                config[s] = false;
            }
        }

        // showsheetbarConfig determines the final result
        if(JSON.stringify(sheetConfigSetting.showsheetbarConfig) !== '{}'){
            Object.assign(config,sheetConfigSetting.showsheetbarConfig);
        }

        sheetConfigSetting.showsheetbarConfig = config;

    }

    const config = sheetConfigSetting.showsheetbarConfig;

    let isHide = 0;

    for (let s in config) {
        if(!config[s]){
            switch (s) {
                case 'add':
                    $('#sheets-add').hide();
                    isHide++;
                    break;

                case 'menu':
                    $('#sheets-m').hide();
                    isHide++;
                    break;

                case 'sheet':
                    $('#sheet-container').hide();
                    $('#sheets-leftscroll').hide();
                    $('#sheets-rightscroll').hide();
                    isHide++;
                    break;

                default:
                    break;
            }
        }
    }

    if (isHide === 3) {
        $("#" + Store.container).find("#sheet-area").hide();
        Store.sheetBarHeight = 0;
    }
    else {
        $("#" + Store.container).find("#sheet-area").show();
        Store.sheetBarHeight = 31;
    }
}


/**
 * Customize the bottom count bar
 */
function customStatisticBarConfig() {
    if(!sheetConfigSetting.initStatisticBarConfig){

        sheetConfigSetting.initStatisticBarConfig = true;

        const config = {
            count: true, // Count bar
            view: true, // print view
            zoom: true // Zoom
        }

        if(!sheetConfigSetting.showstatisticBar){
            for(let s in config){
                config[s] = false;
            }
        }

        // showstatisticBarConfig determines the final result
        if(JSON.stringify(sheetConfigSetting.showstatisticBarConfig) !== '{}'){
            Object.assign(config,sheetConfigSetting.showstatisticBarConfig);
        }

        sheetConfigSetting.showstatisticBarConfig = config;

    }

    const config = sheetConfigSetting.showstatisticBarConfig;

    let isHide = 0;

    for (let s in config) {
        if(!config[s]){
            switch (s) {
                case 'count':
                    $('#sheet-sta-content').hide();
                    isHide++;
                    break;

                case 'view':
                    $('.sheet-print-viewList').hide();
                    isHide++;
                    break;

                case 'zoom':
                    $('#sheet-zoom-content').hide();
                    isHide++;
                    break;

                default:
                    break;
            }
        }
    }

    if (isHide === 3) {
        $("#" + Store.container).find(".sheet-stat-area").hide();
        Store.statisticBarHeight = 0;
    }
    else {
        $("#" + Store.container).find(".sheet-stat-area").show();
        Store.statisticBarHeight = 23;
    }
}
