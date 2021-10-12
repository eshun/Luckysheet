import { replaceHtml } from '../utils/util';
import { getcellvalue } from '../global/getdata';
import { sheetrefreshgrid } from '../global/refresh';
import { rowLocation, colLocation, mouseposition } from '../global/location';
import formula from '../global/formula';
import tooltip from '../global/tooltip';
import editor from '../global/editor';
import { modelHTML } from './constant';
import { selectHightlightShow } from './select';
import server from './server';
import sheetmanage from './sheetmanage';
import sheetFreezen from './freezen';
import menuButton from './menuButton';
import { getSheetIndex } from '../methods/get';
import locale from '../locale/locale';
import Store from '../store';

const hyperlinkCtrl = {
    item: {
        linkType: 'external', //链接类型 external外部链接，internal内部链接
        linkAddress: '',  //链接地址 网页地址或工作表单元格引用
        linkTooltip: '',  //提示
    },
    hyperlink: null,
    createDialog: function(){
        let _this = this;

        const _locale = locale();
        const hyperlinkText = _locale.insertLink;
        const toolbarText = _locale.toolbar;
        const buttonText = _locale.button;

        $("#sheet-modal-dialog-mask").show();
        $("#sheet-insertLink-dialog").remove();

        let sheetListOption = '';
        Store.sheetfile.forEach(item => {
            sheetListOption += `<option value="${item.name}">${item.name}</option>`;
        })

        let content =  `<div class="box">
                            <div class="box-item">
                                <label for="sheet-insertLink-dialog-linkText">${hyperlinkText.linkText}：</label>
                                <input type="text" id="sheet-insertLink-dialog-linkText"/>
                            </div>
                            <div class="box-item">
                                <label for="sheet-insertLink-dialog-linkType">${hyperlinkText.linkType}：</label>
                                <select id="sheet-insertLink-dialog-linkType">
                                    <option value="external">${hyperlinkText.external}</option>
                                    <option value="internal">${hyperlinkText.internal}</option>
                                </select>
                            </div>
                            <div class="show-box show-box-external">
                                <div class="box-item">
                                    <label for="sheet-insertLink-dialog-linkAddress">${hyperlinkText.linkAddress}：</label>
                                    <input type="text" id="sheet-insertLink-dialog-linkAddress" placeholder="${hyperlinkText.placeholder1}" />
                                </div>
                            </div>
                            <div class="show-box show-box-internal">
                                <div class="box-item">
                                    <label for="sheet-insertLink-dialog-linkSheet">${hyperlinkText.linkSheet}：</label>
                                    <select id="sheet-insertLink-dialog-linkSheet">
                                        ${sheetListOption}
                                    </select>
                                </div>
                                <div class="box-item">
                                    <label for="sheet-insertLink-dialog-linkCell">${hyperlinkText.linkCell}：</label>
                                    <input type="text" id="sheet-insertLink-dialog-linkCell" value="A1" placeholder="${hyperlinkText.placeholder2}" />
                                </div>
                            </div>
                            <div class="box-item">
                                <label for="sheet-insertLink-dialog-linkTooltip">${hyperlinkText.linkTooltip}：</label>
                                <input type="text" id="sheet-insertLink-dialog-linkTooltip" placeholder="${hyperlinkText.placeholder3}" />
                            </div>
                        </div>`;

        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-insertLink-dialog", 
            "addclass": "sheet-insertLink-dialog", 
            "title": toolbarText.insertLink, 
            "content": content, 
            "botton":  `<button id="sheet-insertLink-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button class="btn btn-default sheet-model-close-btn">${buttonText.cancel}</button>`, 
            "style": "z-index:100003" 
        }));
        let _t = $("#sheet-insertLink-dialog").find(".sheet-modal-dialog-content").css("min-width", 350).end(), 
            myh = _t.outerHeight(), 
            myw = _t.outerWidth();
        let winw = $(window).width(), 
            winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), 
            scrollTop = $(document).scrollTop();
        $("#sheet-insertLink-dialog").css({ 
            "left": (winw + scrollLeft - myw) / 2, 
            "top": (winh + scrollTop - myh) / 3 
        }).show();

        _this.dataAllocation();
    },
    init: function (){
        let _this = this;

        const _locale = locale();
        const hyperlinkText = _locale.insertLink;

        //链接类型
        $(document).off("change.linkType").on("change.linkType", "#sheet-insertLink-dialog-linkType", function(e){
            let value = this.value;

            $("#sheet-insertLink-dialog .show-box").hide();
            $("#sheet-insertLink-dialog .show-box-" + value).show();
        })

        //确认按钮
        $(document).off("click.confirm").on("click.confirm", "#sheet-insertLink-dialog-confirm", function(e){
            let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
            let rowIndex = last.row_focus || last.row[0];
            let colIndex = last.column_focus || last.column[0];

            //文本
            let linkText = $("#sheet-insertLink-dialog-linkText").val();

            let linkType = $("#sheet-insertLink-dialog-linkType").val();
            let linkAddress = $("#sheet-insertLink-dialog-linkAddress").val();
            let linkSheet = $("#sheet-insertLink-dialog-linkSheet").val();
            let linkCell = $("#sheet-insertLink-dialog-linkCell").val();
            let linkTooltip = $("#sheet-insertLink-dialog-linkTooltip").val();

            if(linkType == 'external'){
                if(!/^http[s]?:\/\//.test(linkAddress)){
                    linkAddress = 'https://' + linkAddress;
                }

                if(!/^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/ig.test(linkAddress)){
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', hyperlinkText.tooltipInfo1);
                    return;
                }
            }
            else{
                if(!formula.iscelldata(linkCell)){
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', hyperlinkText.tooltipInfo2);
                    return;
                }

                linkAddress = linkSheet + "!" + linkCell;
            }

            if(linkText == null || linkText.replace(/\s/g, '') == ''){
                linkText = linkAddress;
            }

            let item = {
                linkType: linkType,
                linkAddress: linkAddress,
                linkTooltip: linkTooltip,
            }

            let historyHyperlink = $.extend(true, {}, _this.hyperlink);
            let currentHyperlink = $.extend(true, {}, _this.hyperlink);

            currentHyperlink[rowIndex + "_" + colIndex] = item;

            let d = editor.deepCopyFlowData(Store.flowdata);
            let cell = d[rowIndex][colIndex];

            if(cell == null){
                cell = {};
            }

            cell.fc = 'rgb(0, 0, 255)';
            cell.un = 1;
            cell.v = linkText;

            d[rowIndex][colIndex] = cell;

            _this.ref(
                historyHyperlink, 
                currentHyperlink, 
                Store.currentSheetIndex, 
                d, 
                { row: [rowIndex, rowIndex], column: [colIndex, colIndex] }
            );

            $("#sheet-modal-dialog-mask").hide();
            $("#sheet-insertLink-dialog").hide();
        })
    },
    dataAllocation: function(){
        let _this = this;

        let last = Store.sheet_select_save[Store.sheet_select_save.length - 1];
        let rowIndex = last.row_focus || last.row[0];
        let colIndex = last.column_focus || last.column[0];

        let hyperlink = _this.hyperlink || {};
        let item = hyperlink[rowIndex + "_" + colIndex] || {};

        //文本
        let text = getcellvalue(rowIndex, colIndex, null, 'm');
        $("#sheet-insertLink-dialog-linkText").val(text);

        //链接类型
        let linkType = item.linkType || 'external';
        $("#sheet-insertLink-dialog-linkType").val(linkType);

        $("#sheet-insertLink-dialog .show-box").hide();
        $("#sheet-insertLink-dialog .show-box-" + linkType).show();

        //链接地址
        let linkAddress = item.linkAddress || '';

        if(linkType == 'external'){
            $("#sheet-insertLink-dialog-linkAddress").val(linkAddress);
        }
        else{
            if(formula.iscelldata(linkAddress)){
                let sheettxt = linkAddress.split("!")[0];
                let rangetxt = linkAddress.split("!")[1];

                $("#sheet-insertLink-dialog-linkSheet").val(sheettxt);
                $("#sheet-insertLink-dialog-linkCell").val(rangetxt);
            }
        }

        //提示
        let linkTooltip = item.linkTooltip || '';
        $("#sheet-insertLink-dialog-linkTooltip").val(linkTooltip);
    },
    cellFocus: function(r, c){
        let _this = this;

        if(_this.hyperlink == null || _this.hyperlink[r + '_' + c] == null){
            return;
        }

        let item = _this.hyperlink[r + '_' + c];

        if(item.linkType == 'external'){
            window.open(item.linkAddress);
        }
        else{
            let cellrange = formula.getcellrange(item.linkAddress);
            let sheetIndex = cellrange.sheetIndex;
            let range = [{
                row: cellrange.row,
                column: cellrange.column
            }];

            if(sheetIndex != Store.currentSheetIndex){
                $("#sheet-area div.sheets-item").removeClass("sheets-item-active");
                $("#sheets-item" + sheetIndex).addClass("sheets-item-active");

                sheetmanage.changeSheet(sheetIndex);
            }

            Store.sheet_select_save = range;
            selectHightlightShow(true);

            let row_pre = cellrange.row[0] - 1 == -1 ? 0 : Store.visibledatarow[cellrange.row[0] - 1];
            let col_pre = cellrange.column[0] - 1 == -1 ? 0 : Store.visibledatacolumn[cellrange.column[0] - 1];

            $("#sheet-scrollbar-x").scrollLeft(col_pre);
            $("#sheet-scrollbar-y").scrollTop(row_pre);
        }
    },
    overshow: function(event){
        let _this = this;

        $("#sheet-hyperlink-overshow").remove();

        if($(event.target).closest("#sheet-cell-main").length == 0){
            return;
        }

        let mouse = mouseposition(event.pageX, event.pageY);
        let scrollLeft = $("#sheet-cell-main").scrollLeft();
        let scrollTop = $("#sheet-cell-main").scrollTop();
        let x = mouse[0] + scrollLeft;
        let y = mouse[1] + scrollTop;

        if(sheetFreezen.freezenverticaldata != null && mouse[0] < (sheetFreezen.freezenverticaldata[0] - sheetFreezen.freezenverticaldata[2])){
            return;
        }

        if(sheetFreezen.freezenhorizontaldata != null && mouse[1] < (sheetFreezen.freezenhorizontaldata[0] - sheetFreezen.freezenhorizontaldata[2])){
            return;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
        if(!!margeset){
            row_index = margeset.row[2];
            col_index = margeset.column[2];
        }

        if(_this.hyperlink == null || _this.hyperlink[row_index + "_" + col_index] == null){
            return;
        }

        let item = _this.hyperlink[row_index + "_" + col_index];
        let linkTooltip = item.linkTooltip;

        if(linkTooltip == null || linkTooltip.replace(/\s/g, '') == ''){
            linkTooltip = item.linkAddress;
        }

        let row = Store.visibledatarow[row_index], 
            row_pre = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        let col = Store.visibledatacolumn[col_index], 
            col_pre = col_index - 1 == -1 ? 0 : Store.visibledatacolumn[col_index - 1];

        if(!!margeset){
            row = margeset.row[1];
            row_pre = margeset.row[0];
            
            col = margeset.column[1];
            col_pre = margeset.column[0];
        }

        let html = `<div id="sheet-hyperlink-overshow" style="background:#fff;padding:5px 10px;border:1px solid #000;box-shadow:2px 2px #999;position:absolute;left:${col_pre}px;top:${row + 5}px;z-index:100;">
                        <div>${linkTooltip}</div>
                        <div>单击鼠标可以追踪</div>
                    </div>`;

        $(html).appendTo($("#sheet-cell-main"));
    },
    ref: function(historyHyperlink, currentHyperlink, sheetIndex, d, range){
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;

            let redo = {};
            redo["type"] = "updateHyperlink";
            redo["sheetIndex"] = sheetIndex;
            redo["historyHyperlink"] = historyHyperlink;
            redo["currentHyperlink"] = currentHyperlink;
            redo["data"] = Store.flowdata; 
            redo["curData"] = d;
            redo["range"] = range; 
            Store.jfredo.push(redo); 
        }

        _this.hyperlink = currentHyperlink;
        Store.sheetfile[getSheetIndex(sheetIndex)].hyperlink = currentHyperlink;

        Store.flowdata = d;
        editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
        Store.sheetfile[getSheetIndex(sheetIndex)].data = Store.flowdata;

        //共享编辑模式
        if(server.allowUpdate){ 
            server.saveParam("all", sheetIndex, currentHyperlink, { "k": "hyperlink" });
            server.historyParam(Store.flowdata, sheetIndex, range);
        }

        setTimeout(function () {
            sheetrefreshgrid();
        }, 1);
    }
}

export default hyperlinkCtrl;