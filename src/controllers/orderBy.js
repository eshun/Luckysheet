
import { modelHTML } from './constant';

import { selectHightlightShow } from './select';
import {checkProtectionAuthorityNormal} from './protection';
import { 
    replaceHtml,
    chatatABC, 
} from '../utils/util';
import { rowlenByRange } from '../global/getRowlen';
import {  isEditMode } from '../global/validate';
import cleargridelement from '../global/cleargridelement';
import { 
    jfrefreshgrid, 
} from '../global/refresh';
import { getcellvalue } from '../global/getdata';
import { orderbydata,  sortColumnSeletion } from '../global/sort';
import tooltip from '../global/tooltip';
import editor from '../global/editor';
import { isdatatype } from '../global/datecontroll';
import Store from '../store';
import locale from '../locale/locale';


export function orderByInitial(){
    const _locale = locale();
    //菜单栏 排序按钮
    $("#sheetorderbyasc, #sheetorderbyasc_t").mousedown(function (event) {
        cleargridelement(event);
        sortColumnSeletion(Store.orderbyindex, true);
        selectHightlightShow();
    });

    $("#sheetorderbydesc, #sheetorderbydesc_t").click(function (event) {
        cleargridelement(event);
        sortColumnSeletion(Store.orderbyindex, false);
        selectHightlightShow();
    }); 

    //排序事件
    let sheet_sort_initial = true;
    $("#sheetorderby").click(function () {

        if(!checkProtectionAuthorityNormal(Store.currentSheetIndex, "sort")){
            return;
        }

        $("body .sheet-cols-menu").hide();
        const locale_sort = _locale.sort;
        if(Store.sheet_select_save.length > 1){
            if(isEditMode()){
                alert(locale_sort.noRangeError);
            }
            else{
                tooltip.info(locale_sort.noRangeError, ""); 
            }
            return;
        }

        let last = Store.sheet_select_save[0];
        let r1 = last["row"][0], r2 = last["row"][1];
        let c1 = last["column"][0], c2 = last["column"][1];

        if (sheet_sort_initial) {
            sheet_sort_initial = false;
            
            let content = `<div style="overflow: hidden;" class="sheet-sort-modal"><div><label><input type="checkbox" id="sheet-sort-haveheader"/><span>${locale_sort.hasTitle}</span></label></div><div style="overflow-y:auto;" id="sheet-sort-dialog-tablec"><table data-itemcount="0" cellspacing="0"> <tr><td>${locale_sort.hasTitle} <select name="sort_0"> <option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> </select> </td> <td> <div><label><input value="asc" type="radio" checked="checked" name="sort_0"><span>${locale_sort.asc}A-Z</span></label></div> <div><label><input value="desc" type="radio" name="sort_0"><span>${locale_sort.desc}Z-A</span></label></div></td></tr></table></div><div style="background: #e5e5e5;border-top: 1px solid #f5f5f5; height: 1px; width: 100%;margin:2px 0px;margin-bottom:10px;"></div> <div> <span style="font-weight: bold; text-decoration: underline;text-align:center;color: blue;cursor: pointer;" class="sheet-sort-dialog-additem">+ ${locale_sort.addOthers}</span> </div> </div>`;

            $("body").append(replaceHtml(modelHTML, { "id": "sheet-sort-dialog", "addclass": "", "title": _locale.sort.sortTitle, "content": content, "botton": `<button id="sheet-sort-modal-confirm" class="btn btn-primary">${locale_sort.confirm}</button><button class="btn btn-default sheet-model-close-btn">${locale_sort.close}</button>`}));

            $("#sheet-sort-dialog .sheet-sort-dialog-additem").click(function () {
                let last = Store.sheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                let option = "", i = $("#sheet-sort-dialog table").data("itemcount") + 1;
                let t = $("#sheet-sort-haveheader").is(':checked');

                for (let c = c1; c <= c2; c++) {
                    if (t) {
                        let v = getcellvalue(r1, c, Store.flowdata, "m");

                        if(v == null){
                            v = locale_sort.columnOperation + (c - c1 + 1); 
                        }

                        option += '<option value="' + c + '">' + v + '</option>';
                    }
                    else {
                        option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
                    }
                }

                $("#sheet-sort-dialog table").append(`
                    <tr class="sheet-sort-dialog-tr">
                        <td><span class="sheet-sort-item-close" onclick="$(this).parent().parent().remove();"><i class="fa fa-times"
                                    aria-hidden="true"></i></span>${locale_sort.secondaryTitle} <select
                                name="sort_${i}">${option}</select> </td>
                        <td>
                            <div><label><input value="asc" type="radio" checked="checked"
                                        name="sort_${i}"><span>${locale_sort.asc}A-Z</span></label></div>
                            <div><label><input value="desc" type="radio" name="sort_${i}"><span>${locale_sort.desc}Z-A</span></label>
                            </div>
                        </td>
                    </tr>
                `);
                $("#sheet-sort-dialog table").data("itemcount", i);
            });

            $("#sheet-sort-haveheader").change(function () {
                let last = Store.sheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                let t = $(this).is(':checked');
                let option = "";

                for (let c = c1; c <= c2; c++) {
                    if (t) {
                        let v = getcellvalue(r1, c, Store.flowdata, "m");
                        
                        if(v == null){
                            v = locale_sort.columnOperation + (c - c1 + 1); 
                        }

                        option += '<option value="' + c + '">' + v + '</option>';
                    }
                    else {
                        option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
                    }
                }

                $("#sheet-sort-dialog tr select").each(function () {
                    $(this).html(option);
                });
            });

            //Custom sort
            $("#sheet-sort-modal-confirm").click(function () {
                if(Store.sheet_select_save.length > 1){
                    if(isEditMode()){
                        alert(locale_sort.noRangeError);
                    }
                    else{
                        tooltip.info(locale_sort.noRangeError, "");
                    }

                    return;
                }

                let d = editor.deepCopyFlowData(Store.flowdata);

                let last = Store.sheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                //Data has header row
                let t = $("#sheet-sort-haveheader").is(':checked');

                let str;
                if(t){
                    str = r1 + 1;
                }
                else{
                    str = r1;
                }

                let hasMc = false; //Whether the sort selection has merged cells

                let data = [];

                for(let r = str; r <= r2; r++){
                    let data_row = [];

                    for(let c = c1; c <= c2; c++){
                        if(d[r][c] != null && d[r][c].mc != null){
                            hasMc = true;
                            break;
                        }

                        data_row.push(d[r][c]);
                    }

                    data.push(data_row);
                }

                if(hasMc){
                    if(isEditMode()){
                        alert(locale_sort.mergeError);
                    }
                    else{
                        tooltip.info(locale_sort.mergeError, "");
                    }

                    return;
                }
                
                $($("#sheet-sort-dialog table tr").toArray().reverse()).each(function () {
                    let i = $(this).find("select").val(), 
                        asc = $(this).find('input:radio:checked').val();
                    
                    i -= c1;
                    
                    if (asc == "asc") {
                        asc = true;
                    }
                    else {
                        asc = false;
                    }

                    data = orderbydata([].concat(data), i, asc);
                });

                for(let r = str; r <= r2; r++){
                    for(let c = c1; c <= c2; c++){
                        d[r][c] = data[r - str][c - c1];
                    }
                }

                let allParam = {};
                if(Store.config["rowlen"] != null){
                    let cfg = $.extend(true, {}, Store.config);
                    cfg = rowlenByRange(d, str, r2, cfg);

                    allParam = {
                        "cfg": cfg,
                        "RowlChange": true
                    }
                }

                jfrefreshgrid(d, [{ "row": [str, r2], "column": [c1, c2] }], allParam);

                $("#sheet-sort-dialog").hide();
                $("#sheet-modal-dialog-mask").hide();
            });
        }

        let option = "";
        for (let c = c1; c <= c2; c++) {
            option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
        }

        $("#sheet-sort-dialog select").html(option);

        $("#sheet-sort-dialog .sheet-sort-dialog-tr").remove();

        $("#sheet-sort-haveheader").prop("checked", false);
        $("#sheet-sort-dialog input:radio:first").prop("checked", "checked");

        $("#sheet-sort-dialog .sheet-modal-dialog-title-text").html(locale_sort.sortRangeTitle+"<span>" + chatatABC(c1) + (r1 + 1) + "</span>"+ locale_sort.sortRangeTitleTo +"<span>" + chatatABC(c2) + (r2 + 1) + "</span>");

        let _t = $("#sheet-sort-dialog"), myh = _t.outerHeight(), myw = _t.outerWidth();
        let winw = $(window).width(), winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();

        $("#sheet-sort-dialog-tablec").css("max-height", (winh - myh) / 2);
        $("#sheet-sort-dialog").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 2 }).show();
        $("#sheet-modal-dialog-mask").show();

        if (r1 < r2) {
            setTimeout(function () {
                let flowrowdata1 = Store.flowdata[r1], 
                    flowrowdata2 = Store.flowdata[r1 + 1], 
                    hastitle = false;
                
                for (let i = c1; i <= c2; i++) {
                    let isdatatype_r1 = isdatatype(flowrowdata1[i]), 
                        isdatatype_r2 = isdatatype(flowrowdata2[i]);
                    
                    if (isdatatype_r1 != isdatatype_r2) {
                        hastitle = true;
                    }
                }

                if (hastitle) {
                    $("#sheet-sort-haveheader").prop("checked", true).change();
                }
            }, 10);
        }
    });
}