import { modelHTML, sheetchartpointconfigHTML, sheetToolHTML } from '../controllers/constant';
import browser from './browser';
import { replaceHtml } from '../utils/util';
import locale from '../locale/locale';
import server from '../controllers/server';

const tooltip = {
    info: function (title, content) {
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-info").remove();

        let _locale = locale();
        let locale_button = _locale.button;

        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-info", 
            "addclass": "", 
            "title": title, 
            "content": content, 
            "botton": '<button class="btn btn-default sheet-model-close-btn">&nbsp;&nbsp;'+locale_button.close+'&nbsp;&nbsp;</button>', 
            "style": "z-index:100003" 
        }));
        let _t = $("#sheet-info").find(".sheet-modal-dialog-content").css("min-width", 300).end(), 
            myh = _t.outerHeight(), 
            myw = _t.outerWidth();
        let winw = $(window).width(), winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        $("#sheet-info").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 }).show();
    },
    confirm: function (title, content, func1, func2, name1, name2) {
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-confirm").remove();

        const _locale = locale();
        const locale_button = _locale.button;
        
        if(name1 == null){
            name1 = locale_button.confirm;
        }
        if(name2 == null){
            name2 = locale_button.cancel;
        }

        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-confirm", 
            "addclass": "", 
            "style": "z-index:100003", 
            "title": title, 
            "content": content, 
            "botton": '<button class="btn btn-primary sheet-model-conform-btn">&nbsp;&nbsp;'+ name1 +'&nbsp;&nbsp;</button><button class="btn btn-default sheet-model-cancel-btn">&nbsp;&nbsp;'+ name2 +'&nbsp;&nbsp;</button>' 
        }));
        let _t = $("#sheet-confirm").find(".sheet-modal-dialog-content").css("min-width", 300).end(), 
            myh = _t.outerHeight(), 
            myw = _t.outerWidth();
        let winw = $(window).width(), winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        $("#sheet-confirm").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 }).show();
        _t.find(".sheet-model-conform-btn").click(function () {
            if (typeof func1 == 'function') {
                func1();
            }
            server.keepHighLightBox();
            $("#sheet-confirm").hide();
            $("#sheet-modal-dialog-mask").hide();  
        });
        _t.find(".sheet-model-cancel-btn").click(function () {
            if (typeof func2 == 'function') {
                func2();
            }
            $("#sheet-confirm").hide();
            $("#sheet-modal-dialog-mask").hide();
        });
    },
    screenshot: function (title, content, imgurl, btn, id) {

        const _locale = locale();
        const locale_screenshot = _locale.screenshot;
        $("#sheet-modal-dialog-mask").show();
        $("#sheet-confirm").remove();
        $("body").append(replaceHtml(modelHTML, { 
            "id": "sheet-confirm", 
            "addclass": "", 
            "style": "z-index:100003", 
            "title": title, 
            "content": content, 
            "botton": btn || '<a style="text-decoration:none;color:#fff;" class="download btn btn-primary sheet-model-conform-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadBtn +'&nbsp;&nbsp;</a>&nbsp;&nbsp;<button class="btn btn-primary sheet-model-copy-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadCopy +'&nbsp;&nbsp;</button><button class="btn btn-default sheet-model-cancel-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadClose +'&nbsp;&nbsp;</button>' 
        }));
        let _t = $("#sheet-confirm").find(".sheet-modal-dialog-content").css("min-width", 300).end();
        setTimeout(()=>{                
            let myh = _t.outerHeight(), 
                myw = _t.outerWidth();
            let winw = $(window).width(), winh = $(window).height();
            let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
            $("#sheet-confirm").css({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 }).show();
        },0);
        _t.find(".sheet-model-conform-btn").click(function () {
            if(browser.isIE() == "1"){
                alert(locale_screenshot.browserNotTip);
            }
            else{
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    if ($("#IframeReportImg").length === 0){
                        $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" onload="downloadImg();" width="0" height="0" src="about:blank"></iframe>').appendTo("body");
                    }
                    if ($('#IframeReportImg').attr("src") != imgurl) {
                        $('#IframeReportImg').attr("src",imgurl);
                    } else {
                        if ($('#IframeReportImg').src != "about:blank") {
                            window.frames["IframeReportImg"].document.execCommand("SaveAs");
                        }
                    }
                }  
            }
        });
        _t.find(".sheet-model-cancel-btn").click(function () {
            $("#sheet-confirm").hide();
            $("#sheet-modal-dialog-mask").hide();
        });

        $('#sheet-confirm .sheet-model-copy-btn').click(function(){
            let dt = new clipboard.DT();
            dt.setData("text/html", "<img src='"+ imgurl +"'>");
            if(browser.isIE() == "1"){
                alert(locale_screenshot.rightclickTip);
            }
            else{
                clipboard.write(dt);
                alert(locale_screenshot.successTip);  
            }
        });
    },
    chartPointConfig: function (id, savefunc1, closefunc2) {
        $("body").append(replaceHtml(modelHTML, { 
            "id": id, 
            "addclass": "sheet-chart-point-config-c", 
            "title": "数据点批量设置", 
            "content": sheetchartpointconfigHTML, 
            "botton": '<button class="btn btn-danger sheet-model-save-btn">&nbsp;&nbsp;保存设置&nbsp;&nbsp;</button><button class="btn btn-default sheet-model-close-btn">&nbsp;&nbsp;取消&nbsp;&nbsp;</button>', 
            "style": "z-index:100003;height:80%;width:80%;top:10%;left:10%;" 
        }));
        $("#sheet-modal-dialog-mask").show();
        let winw = $(window).width(), winh = $(window).height();
        $("#" + id).find(".sheet-chart-point-config").css("height", winh - 160);
        $("#" + id).css({ 
            "height": winh - 90, 
            "width": winw - 100, 
            "left": 7, 
            "top": 14 
        }).show().find(".sheet-model-save-btn").click(function () {
            if (typeof savefunc1 == 'function') {
                savefunc1();
            }

            $("#" + id).hide();
            $("#sheet-modal-dialog-mask").hide();
        });

        $("#" + id).find(".sheet-model-save-btn").click(function () {
            if (typeof closefunc2 == 'function') {
                closefunc2();
            }

            $("#" + id).hide();
            $("#sheet-modal-dialog-mask").hide();
        });
    },
    sheetConfig: function () {

    },
    hoverTipshowState: false,
    hoverTipshowTimeOut: null,
    createHoverTip: function (obj, to) {
        let _this = this;

        $(obj).on("mouseover", to, function (e) {
            if (_this.hoverTipshowState) {
                return;
            }

            clearTimeout(_this.hoverTipshowTimeOut);
            _this.hoverTipshowTimeOut = setTimeout(function(){
                let _t = $(e.currentTarget), 
                    toffset = _t.offset(), 
                    _toolup = $("#sheet-tooltip-up");
                
                let tips = _t.data("tips");
                if (tips == null || tips.length == 0) {
                    tips = _t.prev().data("tips");

                    if (tips == null || tips.length == 0) {
                        return;
                    }
                }

                if (_toolup.length == 0) {
                    $("body").append(sheetToolHTML);
                    _toolup = $("#sheet-tooltip-up");
                }

                _toolup.removeClass("jfk-tooltip-hide").find("div.jfk-tooltip-contentId").html(tips);
                let toolwidth = _toolup.outerWidth();
                _toolup.find("div.jfk-tooltip-arrow").css("left", (toolwidth) / 2);

                let toolleft = toffset.left + (_t.outerWidth() - toolwidth) / 2;
                if(toolleft < 2){
                    toolleft = 2;
                    _toolup.find("div.jfk-tooltip-arrow").css("left", _t.outerWidth() / 2);
                }

                _toolup.css({ "top": toffset.top + _t.outerHeight() + 1, "left": toolleft });
            }, 300);

        }).on("mouseout", to, function (e) {
            _this.hoverTipshowState = false;
            clearTimeout(_this.hoverTipshowTimeOut);
            $("#sheet-tooltip-up").addClass("jfk-tooltip-hide");
        }).on("click", to, function (e) {
            _this.hoverTipshowState = true;
            clearTimeout(_this.hoverTipshowTimeOut);
            $("#sheet-tooltip-up").addClass("jfk-tooltip-hide");
        });
    },
    popover: function(content, position, close, style, btntxt, exitsFuc){
        let _locale = locale();
        let locale_button = _locale.button;
        let locale_paint = _locale.paint;

        if(btntxt == null){
            btntxt = locale_button.close;
        }

        let htmldiv = '<div id="sheetpopover" class="sheetpopover"><div class="sheetpopover-content">'+locale_paint.start+'</div><div class="sheetpopover-btn">'+ btntxt +'</div></div>';
        $("#sheetpopover").remove();
        $("body").append(htmldiv);
        $("#sheetpopover .sheetpopover-content").html(content);

        let w = $("#sheetpopover").outerWidth(),
            h = $("#sheetpopover").outerHeight();
        let pcss = {};

        if(position == 'topLeft'){
            pcss.top = "20px";
            pcss.left = "20px";
        }
        else if(position == 'topCenter'){
            pcss.top = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'topRight'){
            pcss.top = "20px";
            pcss.right = "20px";
        }
        else if(position == 'midLeft'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.left = "20px";
        }
        else if(position == 'center'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'midRight'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.right = "20px";
        }
        else if(position == 'bottomLeft'){
            pcss.bottom = "20px";
            pcss.left = "20px";
        }
        else if(position == 'bottomCenter'){
            pcss.bottom = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'bottomRight'){
            pcss.bottom = "20px";
            pcss.right = "20px";
        }
        else{
            pcss.top = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }

        if(style == "white"){
            pcss.background = "rgba(255, 255, 255, 0.65)";
            pcss.color = "#000";
            $("#sheetpopover .sheetpopover-btn").css({"border": "1px solid #000"});
        }

        setTimeout(function(){
            $("#sheetpopover .sheetpopover-content").css({"margin-left": -$("#sheetpopover .sheetpopover-btn").outerWidth()/2});
        }, 1);
        $("#sheetpopover").css(pcss).fadeIn();
        $("#sheetpopover .sheetpopover-btn").click(function(){
            if(typeof(exitsFuc) == "function"){
                exitsFuc();
            }
        });

        if(close != null && typeof(close) == "number"){
            setTimeout(function(){
                $("#sheetpopover").fadeOut().remove();
                if(typeof(exitsFuc) == "function"){
                    exitsFuc();
                }
            }, close);
        }
    }
}

export default tooltip;