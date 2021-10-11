
import defaultSetting from './config.js';
import { common_extend } from './utils/util';
import Store from './store';
import server from './controllers/server';
import sheetConfigSetting from './controllers/sheetConfigSetting';
import sheetmanage from './controllers/sheetmanage';
import luckysheetsizeauto from './controllers/resize';
import luckysheetHandler from './controllers/handler';
import {initialFilterHandler} from './controllers/filter';
import {initialMatrixOperation} from './controllers/matrixOperation';
import {initialSheetBar} from './controllers/sheetBar';
import {formulaBarInitial} from './controllers/formulaBar';
import {rowColumnOperationInitial} from './controllers/rowColumnOperation';
import {keyboardInitial} from './controllers/keyboard';
import {orderByInitial} from './controllers/orderBy';
import {initPlugins} from './controllers/expendPlugins';
import {
    getluckysheetfile,
    getluckysheet_select_save,
    getconfig,
} from './methods/get';
import {
    setluckysheet_select_save
} from './methods/set';
import { luckysheetrefreshgrid, jfrefreshgrid } from './global/refresh';
import functionlist from './function/functionlist';
import { sheetlodingHTML } from './controllers/constant';
import { getcellvalue, getdatabyselection } from './global/getdata';
import { setcellvalue } from './global/setdata';
import { selectHightlightShow } from './controllers/select';
import {zoomInitial} from './controllers/zoom';
import {printInitial} from './controllers/print';
import method from './global/method';

import * as api from './global/api';

import flatpickr from 'flatpickr'
import Mandarin from 'flatpickr/dist/l10n/zh.js'
import { initListener } from './controllers/listener';
import { hideloading, showloading } from './global/loading.js';
import { luckysheetextendData } from './global/extend.js';

let sheet = {};

// mount api
// sheet.api = api;
// Object.assign(sheet, api);

sheet = common_extend(api,sheet);



//创建luckysheet表格
sheet.create = function (setting) {
    method.destroy()
    // Store original parameters for api: toJson
    Store.toJsonOptions = {}
    for(let c in setting){
        if(c !== 'data'){
            Store.toJsonOptions[c] = setting[c];
        }
    }

    let extendsetting = common_extend(defaultSetting, setting);

    let loadurl = extendsetting.loadUrl,
        menu = extendsetting.menu,
        title = extendsetting.title;

    let container = extendsetting.container;
    Store.container = container;
    Store.luckysheetfile = extendsetting.data;
    Store.defaultcolumnNum = extendsetting.column;
    Store.defaultrowNum = extendsetting.row;
    Store.defaultFontSize = extendsetting.defaultFontSize;
    Store.fullscreenmode = extendsetting.fullscreenmode;
    Store.lang = extendsetting.lang; //language
    Store.allowEdit = extendsetting.allowEdit;
    Store.limitSheetNameLength =  extendsetting.limitSheetNameLength;
    Store.defaultSheetNameMaxLength = extendsetting.defaultSheetNameMaxLength;
    Store.fontList = extendsetting.fontList;
    server.gridKey = extendsetting.gridKey;
    server.loadUrl = extendsetting.loadUrl;
    server.updateUrl = extendsetting.updateUrl;
    server.updateImageUrl = extendsetting.updateImageUrl;
    server.title = extendsetting.title;
    server.loadSheetUrl = extendsetting.loadSheetUrl;
    server.allowUpdate = extendsetting.allowUpdate;

    //sheetConfigSetting=common_extend(sheetConfigSetting, extendsetting);

    sheetConfigSetting.defaultAddNum = extendsetting.defaultAddNum;
    sheetConfigSetting.scrollBottomAutoAddRow = extendsetting.scrollBottomAutoAddRow;

    sheetConfigSetting.autoFormatw = extendsetting.autoFormatw;
    sheetConfigSetting.accuracy = extendsetting.accuracy;
    sheetConfigSetting.total = extendsetting.data[0].total;

    sheetConfigSetting.loading = extendsetting.loading;
    sheetConfigSetting.allowCopy = extendsetting.allowCopy;
    sheetConfigSetting.showtoolbar = extendsetting.showtoolbar;
    sheetConfigSetting.showtoolbarConfig = extendsetting.showtoolbarConfig;
    sheetConfigSetting.showinfobar = extendsetting.showinfobar;
    sheetConfigSetting.showsheetbar = extendsetting.showsheetbar;
    sheetConfigSetting.showsheetbarConfig = extendsetting.showsheetbarConfig;
    sheetConfigSetting.showstatisticBar = extendsetting.showstatisticBar;
    sheetConfigSetting.showstatisticBarConfig = extendsetting.showstatisticBarConfig;
    sheetConfigSetting.sheetFormulaBar = extendsetting.sheetFormulaBar;
    sheetConfigSetting.cellRightClickConfig = extendsetting.cellRightClickConfig;
    sheetConfigSetting.sheetRightClickConfig = extendsetting.sheetRightClickConfig;
    sheetConfigSetting.pointEdit = extendsetting.pointEdit;
    sheetConfigSetting.pointEditUpdate = extendsetting.pointEditUpdate;
    sheetConfigSetting.pointEditZoom = extendsetting.pointEditZoom;

    sheetConfigSetting.userInfo = extendsetting.userInfo;
    sheetConfigSetting.userMenuItem = extendsetting.userMenuItem;
    sheetConfigSetting.goback = extendsetting.goback;
    sheetConfigSetting.functionButton = extendsetting.functionButton;

    sheetConfigSetting.showConfigWindowResize = extendsetting.showConfigWindowResize;
    sheetConfigSetting.enableAddRow = extendsetting.enableAddRow;
    sheetConfigSetting.enableAddBackTop = extendsetting.enableAddBackTop;
    sheetConfigSetting.enablePage = extendsetting.enablePage;
    sheetConfigSetting.pageInfo = extendsetting.pageInfo;

    sheetConfigSetting.editMode = extendsetting.editMode;
    sheetConfigSetting.beforeCreateDom = extendsetting.beforeCreateDom;
    sheetConfigSetting.workbookCreateBefore = extendsetting.workbookCreateBefore;
    sheetConfigSetting.workbookCreateAfter = extendsetting.workbookCreateAfter;
    sheetConfigSetting.remoteFunction = extendsetting.remoteFunction;

    sheetConfigSetting.fireMousedown = extendsetting.fireMousedown;
    sheetConfigSetting.forceCalculation = extendsetting.forceCalculation;
    sheetConfigSetting.plugins = extendsetting.plugins;

    sheetConfigSetting.rowHeaderWidth = extendsetting.rowHeaderWidth;
    sheetConfigSetting.columnHeaderHeight = extendsetting.columnHeaderHeight;

    sheetConfigSetting.defaultColWidth = extendsetting.defaultColWidth;
    sheetConfigSetting.defaultRowHeight = extendsetting.defaultRowHeight;

    sheetConfigSetting.title = extendsetting.title;
    sheetConfigSetting.container = extendsetting.container;
    sheetConfigSetting.hook = extendsetting.hook;

    sheetConfigSetting.pager = extendsetting.pager;

    sheetConfigSetting.initShowsheetbarConfig = false;

    sheetConfigSetting.imageUpdateMethodConfig = extendsetting.imageUpdateMethodConfig;

    if (Store.lang === 'zh') flatpickr.localize(Mandarin.zh);

    // Store the currently used plugins for monitoring asynchronous loading
    Store.asyncLoad.push(...sheetConfigSetting.plugins);

    // Register plugins
    initPlugins(extendsetting.plugins , extendsetting.data);

    // Store formula information, including internationalization
    functionlist();

    let devicePixelRatio = extendsetting.devicePixelRatio;
    if(devicePixelRatio == null){
        devicePixelRatio = 1;
    }
    Store.devicePixelRatio = Math.ceil(devicePixelRatio);

    //loading
    const loadingObj=sheetlodingHTML("#" + container)
    Store.loadingObj=loadingObj

    if (loadurl == "") {
        sheetmanage.initialjfFile(menu, title);
        // luckysheetsizeauto();
        initialWorkBook();
    }
    else {
        $.post(loadurl, {"g" : server.gridKey}, function (d) {
            try{
                if(!!d){
                    let data = new Function("return " + d)();
                    if(d.length>0){
                        Store.luckysheetfile = data;
                    }
                }
            }catch(e){
                console.log(e);
            }
    
            sheetmanage.initialjfFile(menu, title);
            // luckysheetsizeauto();
            initialWorkBook();

            //需要更新数据给后台时，建立WebSocket连接
            if(server.allowUpdate){
                server.openWebSocket();
            }
        }).fail(function() {
            sheetmanage.initialjfFile(menu, title);
            // luckysheetsizeauto();
            initialWorkBook();
            //需要更新数据给后台时，建立WebSocket连接
            if(server.allowUpdate){
                server.openWebSocket();
            }
          });
    }
}

function initialWorkBook(){
    luckysheetHandler();//Overall dom initialization
    initialFilterHandler();//Filter initialization
    initialMatrixOperation();//Right click matrix initialization
    initialSheetBar();//bottom sheet bar initialization
    formulaBarInitial();//top formula bar initialization
    rowColumnOperationInitial();//row and coloumn operate initialization
    keyboardInitial();//Keyboard operate initialization
    orderByInitial();//menu bar orderby function initialization
    zoomInitial();//zoom method initialization
    printInitial();//print initialization
    initListener();
}

//获取所有表格数据
sheet.getluckysheetfile = getluckysheetfile;

//获取当前表格 选区
sheet.getluckysheet_select_save = getluckysheet_select_save;

//设置当前表格 选区
sheet.setluckysheet_select_save = setluckysheet_select_save;

//获取当前表格 config配置
sheet.getconfig = getconfig;

//二维数组数据 转化成 {r, c, v}格式 一维数组 (传入参数为二维数据data)
sheet.getGridData = sheetmanage.getGridData;

//生成表格所需二维数组 （传入参数为表格数据对象file）
sheet.buildGridData = sheetmanage.buildGridData;

// Refresh the canvas display data according to scrollHeight and scrollWidth
sheet.luckysheetrefreshgrid = luckysheetrefreshgrid;

// Refresh canvas
sheet.jfrefreshgrid = jfrefreshgrid;

// Get the value of the cell
sheet.getcellvalue = getcellvalue;

// Set cell value
sheet.setcellvalue = setcellvalue;

// Get selection range value
sheet.getdatabyselection = getdatabyselection;

sheet.sheetmanage = sheetmanage;

// Data of the current table
sheet.flowdata = function () {
    return Store.flowdata;
}

// Set selection highlight
sheet.selectHightlightShow = selectHightlightShow;

// Reset parameters after destroying the table
sheet.destroy = method.destroy;

sheet.showLoadingProgress = showloading;
sheet.hideLoadingProgress = hideloading;
sheet.luckysheetextendData = luckysheetextendData;

export {
    sheet
}
