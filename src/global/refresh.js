import rhchInit from './rhchInit';
import formula from './formula';
import editor from './editor';
import { setcellvalue } from './setdata';
import { getcellFormula } from './getdata';
import { computeRowlenArr } from './getRowlen';
import { 
    sheetDrawMain, 
    sheetDrawgridRowTitle, 
    sheetDrawgridColumnTitle 
} from './draw';
import sheetFreezen from '../controllers/freezen';
import server from '../controllers/server';
import sheetmanage from '../controllers/sheetmanage';
import sheetPostil from '../controllers/postil';
import dataVerificationCtrl from '../controllers/dataVerificationCtrl';
import hyperlinkCtrl from '../controllers/hyperlinkCtrl';
import { selectHightlightShow, selectionCopyShow, collaborativeEditBox } from '../controllers/select';
import { printLineAndNumber } from '../controllers/print';
import { createFilterOptions } from '../controllers/filter';
import { getSheetIndex } from '../methods/get';
import Store from '../store';

let refreshCanvasTimeOut = null;

function runExecFunction(range, index, data){
    formula.execFunctionExist = [];
    for(let s = 0; s < range.length; s++){
        for(let r = range[s].row[0]; r <= range[s].row[1]; r++){
            for(let c = range[s].column[0]; c <= range[s].column[1]; c++){
                formula.execFunctionExist.push({ "r": r, "c": c, "i": index });
            }
        }
    }
    formula.execFunctionExist.reverse();
    formula.execFunctionGroup(null, null, null, null, data);
    formula.execFunctionGlobalData = null;
}

function jfrefreshgrid(data, range, allParam, isRunExecFunction = true, isRefreshCanvas = true) {
    if(data == null){
        data = Store.flowdata;
    }

    if(range == null){
        range = Store.sheet_select_save;
    }
    range = JSON.parse(JSON.stringify(range));

    clearTimeout(refreshCanvasTimeOut);

    //关联参数
    if(allParam == null){
        allParam = {};
    }

    let cfg = allParam["cfg"];  //config
    let RowlChange = allParam["RowlChange"];  //行高改变
    let cdformat = allParam["cdformat"];  //条件格式
    let dataVerification = allParam["dataVerification"];  //数据验证
    let dynamicArray = allParam["dynamicArray"];  //动态数组

    let file = Store.sheetfile[getSheetIndex(Store.currentSheetIndex)];

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        let curConfig;
        if(cfg == null){
            curConfig = $.extend(true, {}, Store.config);
        }
        else{
            curConfig = $.extend(true, {}, cfg);
        }

        let curCdformat;
        if(cdformat == null){
            curCdformat = $.extend(true, [], file["conditionformat_save"]);
        }
        else{
            curCdformat = cdformat;
        }

        let curDataVerification;
        if(dataVerification == null){
            curDataVerification = $.extend(true, {}, file["dataVerification"])
        }
        else{
            curDataVerification = dataVerification;
        }

        let curDynamicArray;
        if(dynamicArray == null){
            curDynamicArray = $.extend(true, [], file["dynamicArray"]);
        }
        else{
            curDynamicArray = dynamicArray;
        }
        
        Store.jfredo.push({ 
            "type": "datachange", 
            "data": Store.flowdata, 
            "curdata": data,
            "sheetIndex": Store.currentSheetIndex, 
            "config": $.extend(true, {}, Store.config), 
            "curConfig": curConfig,
            "cdformat":  $.extend(true, [], file["conditionformat_save"]),
            "curCdformat": curCdformat,
            "RowlChange": RowlChange,
            "dataVerification": $.extend(true, [], file["dataVerification"]),
            "curDataVerification": curDataVerification,
            "dynamicArray": $.extend(true, [], file["dynamicArray"]),
            "curDynamicArray": curDynamicArray,
            "range": range,
            "dataRange": [...file.sheet_select_save]// 保留操作时的选区
        });
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
    file.data = Store.flowdata;

    //config, null or empty object are not processed
    if(cfg != null  && Object.keys(cfg).length !== 0){
        Store.config = cfg;
        file.config = Store.config;

        server.saveParam("all", Store.currentSheetIndex, cfg, { "k": "config" });

        if(RowlChange != null){
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
    }

    //condition format, null or empty array are not processed
    if(cdformat != null && cdformat.length !== 0){
        file["conditionformat_save"] = cdformat;

        server.saveParam("all", Store.currentSheetIndex, cdformat, { "k": "conditionformat_save" });
    }

    //data Verification, null or empty object are not processed
    if(dataVerification != null && Object.keys(dataVerification).length !== 0){
        dataVerificationCtrl.dataVerification = dataVerification;
        file["dataVerification"] = dataVerification;
        server.saveParam("all", Store.currentSheetIndex, dataVerification, { "k": "dataVerification" });
    }

    //动态数组
    if(dynamicArray != null){
        file["dynamicArray"] = dynamicArray;

        server.saveParam("all", Store.currentSheetIndex, dynamicArray, { "k": "dynamicArray" });
    }

    //更新数据的范围
    for(let s = 0; s < range.length; s++){
        let r1 = range[s].row[0];
        let c1 = range[s].column[0];

        if(Store.flowdata[r1][c1] != null && Store.flowdata[r1][c1].spl != null){
            window.sheetCurrentRow = r1;
            window.sheetCurrentColumn = c1;
            window.sheetCurrentFunction = Store.flowdata[r1][c1].f;

            let fp = $.trim(formula.functionParserExe(Store.flowdata[r1][c1].f));
            let sparklines = new Function("return " +fp)();
            Store.flowdata[r1][c1].spl = sparklines;
        }

        if(server.allowUpdate){ //共享编辑模式
            server.historyParam(Store.flowdata, Store.currentSheetIndex, range[s]);
        }
        // 刷新图表
        if(typeof(Store.chartparam.jfrefreshchartall)=="function"){
            Store.chartparam.jfrefreshchartall(Store.flowdata,range[s].row[0],range[s].row[1],range[s].column[0],range[s].column[1]);
        }
    }
    //单元格数据更新联动
    if (isRunExecFunction) {
        runExecFunction(range, Store.currentSheetIndex, data);
    }
    //刷新表格
    if(isRefreshCanvas){
        refreshCanvasTimeOut = setTimeout(function () {
            sheetrefreshgrid();
        }, 1);
    }

    /* 选区同步 */
    selectHightlightShow();
    
    //打印预览区同步
    printLineAndNumber();
    
    window.sheet_getcelldata_cache = null;
}

function jfrefreshgridall(colwidth, rowheight, data, cfg, range, ctrlType, ctrlValue, cdformat, isRefreshCanvas=true) {
    let redo = {}, isRunExecFunction=false;
    clearTimeout(refreshCanvasTimeOut);
    if (ctrlType == "cellRowChange") {
        redo["type"] = "cellRowChange";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.sheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        let setfield = cfg["rowlen"];

        if(setfield == null){
            setfield = {};
        }

        server.saveParam("cg", Store.currentSheetIndex, setfield, { "k": "rowlen" });
    }
    else if (ctrlType == "resizeC") {
        redo["type"] = "resize";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.sheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        let setfield = cfg["columnlen"];

        if(setfield == null){
            setfield = {};
        }

        server.saveParam("cg", Store.currentSheetIndex, setfield, { "k": "columnlen" });
    }
    else if (ctrlType.indexOf("extend")>-1) {
        redo["type"] = "extend";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.sheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        server.saveParam("arc", Store.currentSheetIndex, {"index": ctrlValue.index, "len": ctrlValue.len, "direction": ctrlValue.direction, "mc": cfg.merge }, { "rc": ctrlValue.type });
    }
    else if (ctrlType.indexOf("dele")>-1) {
        redo["type"] = "dele";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.sheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        server.saveParam("drc", Store.currentSheetIndex, {"index": ctrlValue.index, "len":ctrlValue.len, "mc": cfg.merge, "borderInfo": cfg.borderInfo }, { "rc": ctrlValue.type});
    }
    else {
        redo["type"] = "datachangeAll";

        redo["range"] = $.extend(true, [], Store.sheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        isRunExecFunction = true;

        for(let s = 0; s < range.length; s++){
            server.historyParam(data, Store.currentSheetIndex, range[s]);    
        }
    }

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        redo["data"] = Store.flowdata;
        redo["curdata"] = data;
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["cdformat"] = $.extend(true, [], Store.sheetfile[getSheetIndex(Store.currentSheetIndex)]["conditionformat_save"]);
        redo["curCdformat"] = cdformat;

        Store.jfredo.push(redo);
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(data);//worker存数据
    Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;

    //config
    if (cfg != null) {
        Store.config = cfg;
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

        server.saveParam("all", Store.currentSheetIndex, cfg, { "k": "config" });
    }

    //条件格式
    if(cdformat != null){
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)]["conditionformat_save"] = cdformat;
    
        server.saveParam("all", Store.currentSheetIndex, cdformat, { "k": "conditionformat_save" });
    }

    //选区
    Store.sheet_select_save = $.extend(true, [], range);
    if(Store.sheet_select_save.length > 0){
        //有选区时，刷新一下选区
        selectHightlightShow();
    }


    if(isRunExecFunction){
        //单元格数据更新联动
        runExecFunction(range, Store.currentSheetIndex, data);
    }

    //行高、列宽 刷新  
    jfrefreshgrid_rhcw(rowheight, colwidth);

    if(isRefreshCanvas){
        refreshCanvasTimeOut = setTimeout(function () {
            sheetrefreshgrid();
        }, 1);
    }
    

    sheetmanage.storeSheetParamALL();
    
    window.sheet_getcelldata_cache = null;
}

function jfrefreshrange(data, range, cdformat) {
    clearTimeout(refreshCanvasTimeOut);

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        Store.jfredo.push({ 
            "type": "rangechange", 
            "data": Store.flowdata, 
            "curdata": data,
            "range": range, 
            "sheetIndex": Store.currentSheetIndex,
            "cdformat":  $.extend(true, [],  Store.sheetfile[getSheetIndex(Store.currentSheetIndex)]["conditionformat_save"]),
            "curCdformat": cdformat 
        });
    }

    //flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据

    Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;

    //条件格式
    if(cdformat != null){
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)]["conditionformat_save"] = cdformat;
    }

    //单元格数据更新联动
    runExecFunction(range, Store.currentSheetIndex, data);

    //刷新表格
    refreshCanvasTimeOut = setTimeout(function () {
        sheetrefreshgrid();
    }, 1);

    //发送给后台
    for(let s = 0; s < range.length; s++){
        server.historyParam(Store.flowdata, Store.currentSheetIndex, range[s]);
    }
}

//删除、增加行列 刷新表格
function jfrefreshgrid_adRC(data, cfg, ctrlType, ctrlValue, calc, filterObj, cf, af, freezen, dataVerification, hyperlink){
    let file = Store.sheetfile[getSheetIndex(Store.currentSheetIndex)];
    collaborativeEditBox();
    //merge改变对应的单元格值改变
    let mcData = [];
    for(let m in cfg["merge"]){
        let mc = cfg["merge"][m];

        for(let r = mc.r; r <= mc.r + mc.rs - 1; r++){
            for(let c = mc.c; c <= mc.c + mc.cs - 1; c++){
                if(data[r][c] == null){
                    data[r][c] = {};
                }

                if(r == mc.r && c == mc.c){
                    data[r][c].mc = mc;
                }
                else{
                    data[r][c].mc = { "r": mc.r, "c": mc.c };
                }

                mcData.push({ "r": r, "c": c });                       
            }
        }
    }

    //公式链中公式范围改变对应单元格值的改变
    let funcData = [];
    // if(calc.length > 0){
    //     // 取消execFunctionGroupData，改用execFunctionGlobalData
    //     // formula.execFunctionGroupData = data;

    //     for(let i = 0; i < calc.length; i++){
    //         let clc = calc[i];
    //         let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            
    //         let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
    //         clc.func = clc_result;

    //         if(data[clc_r][clc_c].f == clc_funcStr){
    //             setcellvalue(clc_r, clc_c, data, clc_result[1]);
    //             // funcData存储当前结果没有用处，每次还是需要从calc公式链实时从当前数据中计算比较靠谱
    //             // funcData.push({ "r": clc_r, "c": clc_c });
    //         }
    //     }
    // }

    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": ctrlType,
            "sheetIndex": Store.currentSheetIndex,
            "data": Store.flowdata,
            "curData": data,
            "config": $.extend(true, {}, Store.config),
            "curConfig": cfg,
            "ctrlValue": ctrlValue,
            "mcData": mcData,
            "calc": $.extend(true, [], file.calcChain),
            "curCalc": calc,
            "funcData": funcData,
            "filterObj": { "filter_select": $.extend(true, {}, file.filter_select), "filter": $.extend(true, {}, file.filter) },
            "curFilterObj": filterObj,
            "cf": $.extend(true, [], file.conditionformat_save),
            "curCf": cf,
            "af": $.extend(true, [], file.alternateformat_save),
            "curAf": af,
            "freezen": { "freezenhorizontaldata": sheetFreezen.freezenhorizontaldata, "freezenverticaldata": sheetFreezen.freezenverticaldata },
            "curFreezen": freezen,
            "dataVerification": $.extend(true, {}, file.dataVerification),
            "curDataVerification": dataVerification,
            "hyperlink": $.extend(true, {}, file.hyperlink),
            "curHyperlink": hyperlink,
            "range": file.sheet_select_save,
            "dataRange": [...file.sheet_select_save]// 保留操作时的选区
        });
    }

    let index = ctrlValue.index,
        len = ctrlValue.len,
        rc = ctrlValue.rc;

    if(ctrlType == "addRC"){
        let direction = ctrlValue.direction,
            restore = ctrlValue.restore;

        let addData = [];
        if(restore){
            if(rc == "r"){
                let st_r;
                if(direction == "lefttop"){
                    st_r = index;
                }
                else if(direction == "rightbottom"){
                    st_r = index + 1;
                }
                let ed_r = st_r + len - 1;

                for(let r = st_r; r <= ed_r; r++){
                    let row = [];
                    for(let c = 0; c < data[0].length; c++){
                        let cell = data[r][c];
                        row.push(cell);
                    }
                    addData.push(row);
                }
            }
            else if(rc == "c"){
                let st_c;
                if(direction == "lefttop"){
                    st_c = index;
                }
                else if(direction == "rightbottom"){
                    st_c = index + 1;
                }
                let ed_c = st_c + len - 1;

                for(let r = 0; r < data.length; r++){
                    let row = [];
                    for(let c = st_c; c <= ed_c; c++){
                        let cell = data[r][c];
                        row.push(cell);
                    }
                    addData.push(row);
                }
            }
        }

        server.saveParam("arc", Store.currentSheetIndex, {"index": index, "len": len, "direction": direction, "data": addData }, { "rc": rc });
    }
    else if(ctrlType == "delRC"){
        server.saveParam("drc", Store.currentSheetIndex, {"index": index, "len": len }, { "rc": rc });
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
    file.data = data;

    //config
    Store.config = cfg;
    file.config = Store.config;
    server.saveParam("all", Store.currentSheetIndex, cfg, { "k": "config" });

    //mcData
    for(let i = 0; i < mcData.length; i++){
        let mcData_r = mcData[i].r,
            mcData_c = mcData[i].c;

        server.saveParam("v", Store.currentSheetIndex, Store.flowdata[mcData_r][mcData_c], { "r": mcData_r, "c": mcData_c });
    }

    //公式链中公式范围改变对应单元格值的改变
    if(calc.length > 0){
        // 取消execFunctionGroupData，改用execFunctionGlobalData
        // formula.execFunctionGroupData = data;

        for(let i = 0; i < calc.length; i++){
            let clc = calc[i];
            let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            
            let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
            clc.func = clc_result;

            if(data[clc_r][clc_c].f == clc_funcStr){
                setcellvalue(clc_r, clc_c, data, clc_result[1]);
                // funcData存储当前结果没有用处，每次还是需要从calc公式链实时从当前数据中计算比较靠谱
                // funcData.push({ "r": clc_r, "c": clc_c });
            }
        }
    }

    //calc函数链
    file.calcChain = calc;
    server.saveParam("all", Store.currentSheetIndex, calc, { "k": "calcChain" });
    for(let i = 0; i < funcData.length; i++){
        let funcData_r = funcData[i].r,
            funcData_c = funcData[i].c;

        server.saveParam("v", Store.currentSheetIndex, Store.flowdata[funcData_r][funcData_c], { "r": funcData_r, "c": funcData_c });
    }

    //筛选配置
    if(filterObj != null){
        file.filter_select = filterObj.filter_select;
        file.filter = filterObj.filter;
    }
    else{
        file.filter_select = null;
        file.filter = null;
    }
    createFilterOptions(file.filter_select, file.filter);
    server.saveParam("all", Store.currentSheetIndex, file.filter_select, { "k": "filter_select" });
    server.saveParam("all", Store.currentSheetIndex, file.filter, { "k": "filter" });

    //条件格式配置
    file.conditionformat_save = cf;
    server.saveParam("all", Store.currentSheetIndex, file.conditionformat_save, { "k": "conditionformat_save" });

    //交替颜色配置
    file.alternateformat_save = af;
    server.saveParam("all", Store.currentSheetIndex, file.alternateformat_save, { "k": "alternateformat_save" });

    //冻结配置
    if(freezen != null){
        sheetFreezen.freezenhorizontaldata = freezen.freezenhorizontaldata;
        sheetFreezen.freezenverticaldata = freezen.freezenverticaldata;
    }
    else{
        sheetFreezen.freezenhorizontaldata = null;
        sheetFreezen.freezenverticaldata = null;
    }

    //数据验证
    dataVerificationCtrl.dataVerification = dataVerification;
    file.dataVerification = dataVerification;
    server.saveParam("all", Store.currentSheetIndex, file.dataVerification, { "k": "dataVerification" });

    //超链接
    hyperlinkCtrl.hyperlink = hyperlink;
    file.hyperlink = hyperlink;
    server.saveParam("all", Store.currentSheetIndex, file.hyperlink, { "k": "hyperlink" });

    //行高、列宽刷新
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
}

//删除单元格 刷新表格
function jfrefreshgrid_deleteCell(data, cfg, ctrl, calc, filterObj, cf, dataVerification, hyperlink){
    let file = Store.sheetfile[getSheetIndex(Store.currentSheetIndex)];
    clearTimeout(refreshCanvasTimeOut);
    collaborativeEditBox();
    //merge改变对应的单元格值改变
    let mcData = [];
    if(JSON.stringify(cfg["merge"]) == "{}"){
        for(let r = 0; r < data.length; r++){
            for(let c = 0; c < data[0].length; c++){
                let cell = data[r][c];
    
                if(cell != null && cell.mc != null){
                    delete cell.mc;
                    mcData.push({ "r": r, "c": c });
                }
            }
        }
    }
    else{
        for(let m in cfg["merge"]){
            let mc = cfg["merge"][m];
    
            for(let r = mc.r; r <= mc.r + mc.rs - 1; r++){
                for(let c = mc.c; c <= mc.c + mc.cs - 1; c++){
                    if(data[r][c] == null){
                        data[r][c] = {};
                    }
    
                    // if(r == mc.r && c == mc.c){
                    //     data[r][c].mc = mc;
                    // }
                    // else{
                    //     data[r][c].mc = { "r": mc.r, "c": mc.c };
                    // }
    
                    // mcData.push({ "r": r, "c": c });        
                    

                    if(r == mc.r && c == mc.c){
                        if(JSON.stringify(data[r][c].mc) !=JSON.stringify(mc)){
                            data[r][c].mc = mc;
                            mcData.push({ "r": r, "c": c });   
                        }
                    }
                    else{
                        let tempMc = { "r": mc.r, "c": mc.c };
                        if(JSON.stringify(data[r][c].mc) != JSON.stringify(tempMc)){
                            data[r][c].mc = tempMc;
                            mcData.push({ "r": r, "c": c });   
                        }
                    }   
                }
            }
        }
    }

    //公式链中公式范围改变对应单元格值的改变
    let funcData = [];
    // if(calc.length > 0){
    //     // formula.execFunctionGroupData = data;

    //     for(let i = 0; i < calc.length; i++){
    //         let clc = calc[i];
    //         let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
    //         let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
    //         clc.func = clc_result;

    //         if(data[clc_r][clc_c].f == clc_funcStr){
    //             setcellvalue(clc_r, clc_c, data, clc_result[1]);
    //             funcData.push({ "r": clc_r, "c": clc_c });
    //         }
    //     }
    // }

    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": "deleteCell",
            "sheetIndex": Store.currentSheetIndex,
            "ctrl": ctrl,
            "data": Store.flowdata,
            "curData": data,
            "config": $.extend(true, {}, Store.config),
            "curConfig": cfg,
            "mcData": mcData,
            "calc": $.extend(true, [], file.calcChain),
            "curCalc": calc,
            "funcData": funcData,
            "filterObj": { "filter_select": $.extend(true, {}, file.filter_select), "filter": $.extend(true, {}, file.filter) },
            "curFilterObj": filterObj,
            "cf": $.extend(true, [], file.conditionformat_save),
            "curCf": cf,
            "dataVerification": $.extend(true, {}, file.dataVerification),
            "curDataVerification": dataVerification,
            "hyperlink": $.extend(true, {}, file.hyperlink),
            "curHyperlink": hyperlink,
            "range": file.sheet_select_save,
            "dataRange": [...file.sheet_select_save] // 保留操作时的选区
        });
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
    file.data = data;

    //共享编辑模式
    if(server.allowUpdate){
        let type = ctrl.type,
            str = ctrl.str,
            edr = ctrl.edr,
            stc = ctrl.stc,
            edc = ctrl.edc;

        let range;
        if(type == 'moveUp'){
            range = {
                "row": [str, data.length - 1],
                "column": [stc, edc]
            }
        }
        else if(type == 'moveLeft'){
            range = {
                "row": [str, edr],
                "column": [stc, data[0].length - 1]
            };
        }

        server.historyParam(Store.flowdata, Store.currentSheetIndex, range);
    }

    //config
    Store.config = cfg;
    file.config = Store.config;
    server.saveParam("all", Store.currentSheetIndex, cfg, { "k": "config" });

    //mcData
    for(let i = 0; i < mcData.length; i++){
        let mcData_r = mcData[i].r,
            mcData_c = mcData[i].c;

        server.saveParam("v", Store.currentSheetIndex, Store.flowdata[mcData_r][mcData_c], { "r": mcData_r, "c": mcData_c });
    }

    //公式链中公式范围改变对应单元格值的改变
    if(calc.length > 0){
        // formula.execFunctionGroupData = data;

        for(let i = 0; i < calc.length; i++){
            let clc = calc[i];
            let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
            clc.func = clc_result;

            if(data[clc_r][clc_c].f == clc_funcStr){
                setcellvalue(clc_r, clc_c, data, clc_result[1]);
                // funcData.push({ "r": clc_r, "c": clc_c });
            }
        }
    }

    //calc函数链
    file.calcChain = calc;
    server.saveParam("all", Store.currentSheetIndex, calc, { "k": "calcChain" });
    for(let i = 0; i < funcData.length; i++){
        let funcData_r = funcData[i].r,
            funcData_c = funcData[i].c;

        server.saveParam("v", Store.currentSheetIndex, Store.flowdata[funcData_r][funcData_c], { "r": funcData_r, "c": funcData_c });
    }

    //筛选配置
    if(filterObj != null){
        file.filter_select = filterObj.filter_select;
        file.filter = filterObj.filter;
    }
    else{
        file.filter_select = null;
        file.filter = null;
    }
    createFilterOptions(file.filter_select, file.filter);
    server.saveParam("all", Store.currentSheetIndex, file.filter_select, { "k": "filter_select" });
    server.saveParam("all", Store.currentSheetIndex, file.filter, { "k": "filter" });

    //条件格式配置
    file.conditionformat_save = cf;
    server.saveParam("all", Store.currentSheetIndex, file.conditionformat_save, { "k": "conditionformat_save" });

    //数据验证
    dataVerificationCtrl.dataVerification = dataVerification;
    file.dataVerification = dataVerification;
    server.saveParam("all", Store.currentSheetIndex, file.dataVerification, { "k": "dataVerification" });

    //超链接
    hyperlinkCtrl.hyperlink = hyperlink;
    file.hyperlink = hyperlink;
    server.saveParam("all", Store.currentSheetIndex, file.hyperlink, { "k": "hyperlink" });

    refreshCanvasTimeOut = setTimeout(function () {
        sheetrefreshgrid();
    }, 1);
}

//复制剪切 刷新表格
function jfrefreshgrid_pastcut(source, target, RowlChange){
    //单元格数据更新联动
    let execF_rc = {};
    formula.execFunctionExist = [];
    clearTimeout(refreshCanvasTimeOut);
    for(let r = source["range"].row[0]; r <= source["range"].row[1]; r++){
        for(let c = source["range"].column[0]; c <= source["range"].column[1]; c++){
            if((r + "_" + c + "_" + source["sheetIndex"]) in execF_rc){
                continue;
            }

            execF_rc[r + "_" + c + "_" + source["sheetIndex"]] = 0;
            formula.execFunctionExist.push({ "r": r, "c": c, "i": source["sheetIndex"] });
        }
    }

    for(let r = target["range"].row[0]; r <= target["range"].row[1]; r++){
        for(let c = target["range"].column[0]; c <= target["range"].column[1]; c++){
            if((r + "_" + c + "_" + target["sheetIndex"]) in execF_rc){
                continue;
            }

            execF_rc[r + "_" + c + "_" + target["sheetIndex"]] = 0;
            formula.execFunctionExist.push({ "r": r, "c": c, "i": target["sheetIndex"] });
        }
    }



    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": "pasteCut",
            "source": source,
            "target": target,
            "RowlChange": RowlChange
        })
    }

    //config
    let rowHeight;
    if(Store.currentSheetIndex == source["sheetIndex"]){
        Store.config = source["curConfig"];
        rowHeight = source["curData"].length;
        Store.sheetfile[getSheetIndex(target["sheetIndex"])]["config"] = target["curConfig"];
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.config = target["curConfig"];
        rowHeight = target["curData"].length;
        Store.sheetfile[getSheetIndex(source["sheetIndex"])]["config"] = source["curConfig"];
    }

    if(RowlChange){
        Store.visibledatarow = [];
        Store.rh_height = 0;
        
        for (let i = 0; i < rowHeight; i++) {
            let rowlen = Store.defaultrowlen;
            
            if (Store.config["rowlen"] != null && Store.config["rowlen"][i] != null) {
                rowlen = Store.config["rowlen"][i];
            }

            if (Store.config["rowhidden"] != null && Store.config["rowhidden"][i] != null) {
                rowlen = Store.config["rowhidden"][i];
                Store.visibledatarow.push(Store.rh_height);
                continue;
            }
            else {
                Store.rh_height += rowlen + 1;
            }

            Store.visibledatarow.push(Store.rh_height);//行的临时长度分布
        }
        Store.rh_height += 80;
        // sheetmanage.showSheet();

        if(Store.currentSheetIndex == source["sheetIndex"]){
            let rowlenArr = computeRowlenArr(target["curData"].length, target["curConfig"]);
            Store.sheetfile[getSheetIndex(target["sheetIndex"])]["visibledatarow"] = rowlenArr;
        }
        else if(Store.currentSheetIndex == target["sheetIndex"]){
            let rowlenArr = computeRowlenArr(source["curData"].length, source["curConfig"]);
            Store.sheetfile[getSheetIndex(source["sheetIndex"])]["visibledatarow"] = rowlenArr;
        }
    }

    //Store.flowdata
    if(Store.currentSheetIndex == source["sheetIndex"]){
        Store.flowdata = source["curData"];
        Store.sheetfile[getSheetIndex(target["sheetIndex"])]["data"] = target["curData"];
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.flowdata = target["curData"];
        Store.sheetfile[getSheetIndex(source["sheetIndex"])]["data"] = source["curData"];
    }
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
    Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;
    
    //sheet_select_save
    if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.sheet_select_save = [{"row": target["range"].row, "column": target["range"].column}];
    }
    else{
        Store.sheet_select_save = [{"row": source["range"].row, "column": source["range"].column}];
    }
    if(Store.sheet_select_save.length > 0){
        //有选区时，刷新一下选区
        selectHightlightShow();
    }

    //条件格式
    Store.sheetfile[getSheetIndex(source["sheetIndex"])].conditionformat_save = source["curCdformat"];
    Store.sheetfile[getSheetIndex(target["sheetIndex"])].conditionformat_save = target["curCdformat"];

    //数据验证
    if(Store.currentSheetIndex == source["sheetIndex"]){
        dataVerificationCtrl.dataVerification = source["curDataVerification"];
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
        dataVerificationCtrl.dataVerification = target["curDataVerification"]
    }
    Store.sheetfile[getSheetIndex(source["sheetIndex"])].dataVerification = source["curDataVerification"];
    Store.sheetfile[getSheetIndex(target["sheetIndex"])].dataVerification = target["curDataVerification"];
    
    
    formula.execFunctionExist.reverse();
    formula.execFunctionGroup(null, null, null, null, target["curData"]);
    formula.execFunctionGlobalData = null;

    let index = getSheetIndex(Store.currentSheetIndex);
    let file = Store.sheetfile[index];
    file.scrollTop  = $("#sheet-cell-main").scrollTop();
    file.scrollLeft = $("#sheet-cell-main").scrollLeft()
    
    sheetmanage.showSheet();

    refreshCanvasTimeOut = setTimeout(function () {
        sheetrefreshgrid();
    }, 1);

    sheetmanage.storeSheetParamALL();

    //saveparam
    //来源表
    server.saveParam("all", source["sheetIndex"], source["curConfig"], { "k": "config" });
    //目的表
    server.saveParam("all", target["sheetIndex"], target["curConfig"], { "k": "config" });
    
    //来源表
    server.historyParam(source["curData"], source["sheetIndex"], {"row": source["range"]["row"], "column": source["range"]["column"]});
    //目的表
    server.historyParam(target["curData"], target["sheetIndex"], {"row": target["range"]["row"], "column": target["range"]["column"]});

    //来源表
    server.saveParam("all", source["sheetIndex"], source["curCdformat"], { "k": "conditionformat_save" });
    //目的表
    server.saveParam("all", target["sheetIndex"], target["curCdformat"], { "k": "conditionformat_save" });

    //来源表
    server.saveParam("all", source["sheetIndex"], source["curDataVerification"], { "k": "dataVerification" });
    //目的表
    server.saveParam("all", target["sheetIndex"], target["curDataVerification"], { "k": "dataVerification" });
}

//行高、列宽改变 刷新表格
function jfrefreshgrid_rhcw(rowheight, colwidth, isRefreshCanvas=true){
    rhchInit(rowheight, colwidth);
    clearTimeout(refreshCanvasTimeOut);
    sheetmanage.storeSheetParam();

    //行高列宽改变时 重新计算sparklines
    let calcChain = Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].calcChain;
    
    if(calcChain != null && calcChain.length > 0){
        if(Store.config["rowlen"] == null){
            Store.config["rowlen"] = {};
        }

        if(Store.config["columnlen"] == null){
            Store.config["columnlen"] = {};
        }            

        for(let i = 0; i < calcChain.length; i++){
            let r = calcChain[i].r, c = calcChain[i].c, index = calcChain[i].index;

            if(index == Store.currentSheetIndex && Store.flowdata[r][c] != null && Store.flowdata[r][c].spl != null && ((r in Store.config["rowlen"]) || (c in Store.config["columnlen"]))){
                window.sheetCurrentRow = r;
                window.sheetCurrentColumn = c;
                window.sheetCurrentFunction = Store.flowdata[r][c].f;

                let fp = $.trim(formula.functionParserExe(Store.flowdata[r][c].f));
                let sparklines = new Function("return " + fp)();
                Store.flowdata[r][c].spl = sparklines;

                server.saveParam("v", Store.currentSheetIndex, Store.flowdata[r][c], { "r": r, "c": c });
            }
        }

        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;
    }
    
    //批注框同步
    sheetPostil.positionSync();
    //选区同步
    selectHightlightShow();
    // 协同提示框同步
    collaborativeEditBox();
    //改变单元格行高，复制虚线框同步
    if($(".sheet-selection-copy").is(":visible")){
        selectionCopyShow();
    }

    //改变单元格行高，选区下拉icon隐藏
    if($("#sheet-dropCell-icon").is(":visible")){
        $("#sheet-dropCell-icon").remove();
    }

    //打印预览区同步
    printLineAndNumber();

    //有冻结状态时，同步行高、列宽
    if(sheetFreezen.freezenhorizontaldata != null && sheetFreezen.freezenverticaldata != null){
        let row_st = sheetFreezen.freezenhorizontaldata[1] - 1;
        let col_st = sheetFreezen.freezenverticaldata[1] - 1;

        let scrollTop = sheetFreezen.freezenhorizontaldata[2];
        let scrollLeft = sheetFreezen.freezenverticaldata[2];

        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        let freezenhorizontaldata = [
            Store.visibledatarow[row_st], 
            row_st + 1, 
            scrollTop, 
            sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), 
            top
        ];
        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        let freezenverticaldata = [
            Store.visibledatacolumn[col_st], 
            col_st + 1, 
            scrollLeft, 
            sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), 
            left
        ];

        sheetFreezen.saveFreezen(freezenhorizontaldata, top, freezenverticaldata, left);
        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        sheetFreezen.createFreezenVertical(freezenverticaldata, left);
        sheetFreezen.createAssistCanvas();
    }
    else if(sheetFreezen.freezenhorizontaldata != null){
        let row_st = sheetFreezen.freezenhorizontaldata[1] - 1;
        let scrollTop = sheetFreezen.freezenhorizontaldata[2];

        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        let freezenhorizontaldata = [
            Store.visibledatarow[row_st], 
            row_st + 1, 
            scrollTop, 
            sheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), 
            top
        ];

        sheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
        sheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        sheetFreezen.createAssistCanvas();
    }
    else if(sheetFreezen.freezenverticaldata != null){
        let col_st = sheetFreezen.freezenverticaldata[1] - 1;
        let scrollLeft = sheetFreezen.freezenverticaldata[2];

        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        let freezenverticaldata = [
            Store.visibledatacolumn[col_st], 
            col_st + 1, 
            scrollLeft, 
            sheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), 
            left
        ];

        sheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
        sheetFreezen.createFreezenVertical(freezenverticaldata, left);
        sheetFreezen.createAssistCanvas();
    }
    else{
        //有筛选标志时，同步筛选按钮和筛选范围位置
        if($("#sheet-filter-options-sheet" + Store.currentSheetIndex + " .sheet-filter-options").length > 0){
            $("#sheet-filter-options-sheet" + Store.currentSheetIndex + " .sheet-filter-options").each(function(i, e){
                let str = $(e).data("str"), cindex = $(e).data("cindex");

                let left = Store.visibledatacolumn[cindex] - 20;
                let top = str - 1 == -1 ? 0 : Store.visibledatarow[str - 1];

                $(e).css({ "left": left, "top": top });
            });
        }
    }

    if($("#sheet-filter-selected-sheet" + Store.currentSheetIndex).length > 0){
        let sheet_filter_save = Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].filter_select;

        let r1 = sheet_filter_save.row[0], 
            r2 = sheet_filter_save.row[1];
        let c1 = sheet_filter_save.column[0], 
            c2 = sheet_filter_save.column[1];

        let row = Store.visibledatarow[r2], 
            row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let col = Store.visibledatacolumn[c2], 
            col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

        $("#sheet-filter-selected-sheet" + Store.currentSheetIndex).css({
            "left": col_pre,
            "width": col - col_pre - 1,
            "top": row_pre,
            "height": row - row_pre - 1
        });
    }

    sheetmanage.showSheet();

    if(isRefreshCanvas){
        refreshCanvasTimeOut = setTimeout(function () {
            sheetrefreshgrid();
        }, 1);
    }
   
}

//Refresh the canvas display data according to scrollHeight and scrollWidth
function sheetrefreshgrid(scrollWidth, scrollHeight) {
    formula.groupValuesRefresh();
    
    if (scrollWidth == null) {
        scrollWidth = $("#sheet-cell-main").scrollLeft();
    }
    if (scrollHeight == null) {
        scrollHeight = $("#sheet-cell-main").scrollTop();
    }

    if (sheetFreezen.freezenverticaldata != null || sheetFreezen.freezenhorizontaldata != null) {
        let freezen_horizon_px, freezen_horizon_ed, freezen_horizon_scrollTop;
        let freezen_vertical_px, freezen_vertical_ed, freezen_vertical_scrollTop;
        let drawWidth = Store.sheetTableContentHW[0], drawHeight = Store.sheetTableContentHW[1];
        
        if (sheetFreezen.freezenverticaldata != null && sheetFreezen.freezenhorizontaldata != null) {
            freezen_horizon_px = sheetFreezen.freezenhorizontaldata[0];
            freezen_horizon_ed = sheetFreezen.freezenhorizontaldata[1];
            freezen_horizon_scrollTop = sheetFreezen.freezenhorizontaldata[2];

            freezen_vertical_px = sheetFreezen.freezenverticaldata[0];
            freezen_vertical_ed = sheetFreezen.freezenverticaldata[1];
            freezen_vertical_scrollTop = sheetFreezen.freezenverticaldata[2];

            //左上canvas freezen_3
            sheetDrawMain(
                freezen_vertical_scrollTop, 
                freezen_horizon_scrollTop, 
                freezen_vertical_px, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_3"
            );

            //上右canvas freezen_4
            sheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                freezen_horizon_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_4"
            );

            //左下canvas freezen_7
            sheetDrawMain(
                freezen_vertical_scrollTop, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                freezen_vertical_px, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                1, 
                1, 
                null, 
                null, 
                "freezen_7"
            );

            //右下canvas sheetTableContent
            sheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );

            //标题
            sheetDrawgridColumnTitle(freezen_vertical_scrollTop, freezen_vertical_px, Store.rowHeaderWidth);
            sheetDrawgridColumnTitle(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth
            );
            
            sheetDrawgridRowTitle(freezen_horizon_scrollTop, freezen_horizon_px, Store.columnHeaderHeight);
            sheetDrawgridRowTitle(
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
           
        }
        else if (sheetFreezen.freezenhorizontaldata != null) {
            freezen_horizon_px = sheetFreezen.freezenhorizontaldata[0];
            freezen_horizon_ed = sheetFreezen.freezenhorizontaldata[1];
            freezen_horizon_scrollTop = sheetFreezen.freezenhorizontaldata[2];

            sheetDrawMain(
                scrollWidth, 
                freezen_horizon_scrollTop, 
                drawWidth, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_h"
            );
            sheetDrawMain(
                scrollWidth, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawWidth, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                null, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
        
            sheetDrawgridColumnTitle(scrollWidth, drawWidth, null);
            
            sheetDrawgridRowTitle(freezen_horizon_scrollTop, freezen_horizon_px, Store.columnHeaderHeight);
            sheetDrawgridRowTitle(
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
            
        }
        else if (sheetFreezen.freezenverticaldata != null) {
            freezen_vertical_px = sheetFreezen.freezenverticaldata[0];
            freezen_vertical_ed = sheetFreezen.freezenverticaldata[1];
            freezen_vertical_scrollTop = sheetFreezen.freezenverticaldata[2];
            
            sheetDrawMain(
                freezen_vertical_scrollTop, 
                scrollHeight, 
                freezen_vertical_px, 
                drawHeight, 
                1, 
                1, 
                null, 
                null, 
                "freezen_v"
            );
            sheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                scrollHeight, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                drawHeight, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth, 
                null
            );
            
            sheetDrawgridRowTitle(scrollHeight, drawHeight, null);
            
            sheetDrawgridColumnTitle(freezen_vertical_scrollTop, freezen_vertical_px, Store.rowHeaderWidth);
            sheetDrawgridColumnTitle(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth
            );
            
        }
    }
    else {
        if($("#sheetTableContent").length == 0){
            return;
        }
        let sheetTableContent = $("#sheetTableContent").get(0).getContext("2d");
        sheetDrawMain(scrollWidth, scrollHeight);
    
        // sheetTableContent.clearRect(0, 0, 46, 20);
        
        sheetDrawgridColumnTitle(scrollWidth);
        sheetDrawgridRowTitle(scrollHeight);

        //清除canvas左上角区域 防止列标题栏序列号溢出显示
        
        sheetTableContent.clearRect(0, 0, (Store.rowHeaderWidth* Store.devicePixelRatio-1) , (Store.columnHeaderHeight* Store.devicePixelRatio-1) );
    }
}

export {
    jfrefreshgrid,
    jfrefreshgridall,
    jfrefreshrange,
    jfrefreshgrid_adRC,
    jfrefreshgrid_deleteCell,
    jfrefreshgrid_pastcut,
    jfrefreshgrid_rhcw,
    sheetrefreshgrid,
}