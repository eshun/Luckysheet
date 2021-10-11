import locale from '../locale/locale';
import sheetConfigSetting from './sheetConfigSetting';

import { getObjType, camel2split } from '../utils/util';

// 默认的工具栏按钮
export const defaultToolbar = [
    'undo',
    'redo',
    'paintFormat',
    '|',

    'currencyFormat',
    'percentageFormat',
    'numberDecrease',
    'numberIncrease',
    'moreFormats',
    '|',

    'font',
    '|',
    'fontSize',
    '|',

    'bold',
    'italic',
    'strikethrough',
    'underline',
    'textColor',
    '|',

    'fillColor',
    'border',
    'mergeCell',
    '|',

    'horizontalAlignMode',
    'verticalAlignMode',
    'textWrapMode',
    'textRotateMode',
    '|',

    'image',
    'link',
    'chart',
    'postil',
    'pivotTable',
    '|',

    'function',
    'frozenMode',
    'sortAndFilter',
    'conditionalFormat',
    'dataVerification',
    'splitColumn',
    'screenshot',
    'findAndReplace',
    'protection',
    'print'
];

// 工具栏按钮 id 关系
export const toolbarIdMap = {
    undo: '#sheet-icon-undo', //Undo redo
    redo: '#sheet-icon-redo',
    paintFormat: ['#sheet-icon-paintformat'], //Format brush
    currencyFormat: '#sheet-icon-currency', //currency format
    percentageFormat: '#sheet-icon-percent', //Percentage format
    numberDecrease: '#sheet-icon-fmt-decimal-decrease', //'Decrease the number of decimal places'
    numberIncrease: '#sheet-icon-fmt-decimal-increase', //'Increase the number of decimal places
    moreFormats: '#sheet-icon-fmt-other', //'More Formats'
    font: '#sheet-icon-font-family', //'font'
    fontSize: '#sheet-icon-font-size', //'Font size'
    bold: '#sheet-icon-bold', //'Bold (Ctrl+B)'
    italic: '#sheet-icon-italic', //'Italic (Ctrl+I)'
    strikethrough: '#sheet-icon-strikethrough', //'Strikethrough (Alt+Shift+5)'
    underline: '#sheet-icon-underline', //'Underline (Alt+Shift+6)'
    textColor: ['#sheet-icon-text-color', '#sheet-icon-text-color-menu'], //'Text color'
    fillColor: ['#sheet-icon-cell-color', '#sheet-icon-cell-color-menu'], //'Cell color'
    border: ['#sheet-icon-border-all', '#sheet-icon-border-menu'], //'border'
    mergeCell: ['#sheet-icon-merge-button', '#sheet-icon-merge-menu'], //'Merge cells'
    horizontalAlignMode: ['#sheet-icon-align', '#sheet-icon-align-menu'], //'Horizontal alignment'
    verticalAlignMode: ['#sheet-icon-valign', '#sheet-icon-valign-menu'], //'Vertical alignment'
    textWrapMode: ['#sheet-icon-textwrap', '#sheet-icon-textwrap-menu'], //'Wrap mode'
    textRotateMode: ['#sheet-icon-rotation', '#sheet-icon-rotation-menu'], //'Text Rotation Mode'
    image: '#sheet-insertImg-btn-title', //'Insert link'
    link: '#sheet-insertLink-btn-title', //'Insert picture'
    chart: '#sheet-chart-btn-title', //'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
    postil: '#sheet-icon-postil', //'comment'
    pivotTable: ['#sheet-pivot-btn-title'], //'PivotTable'
    function: ['#sheet-icon-function', '#sheet-icon-function-menu'], //'formula'
    frozenMode: ['#sheet-freezen-btn-horizontal', '#sheet-icon-freezen-menu'], //'freeze mode'
    sortAndFilter: '#sheet-icon-autofilter', //'sort and filter'
    conditionalFormat: '#sheet-icon-conditionformat', //'Conditional Format'
    dataVerification: '#sheet-dataVerification-btn-title', // 'Data Verification'
    splitColumn: '#sheet-splitColumn-btn-title', //'Split column'
    screenshot: '#sheet-chart-btn-screenshot', //'screenshot'
    findAndReplace: '#sheet-icon-seachmore', //'Find and Replace'
    protection: '#sheet-icon-protection', // 'Worksheet protection'
    print: '#sheet-icon-print' // 'print'
};

// 创建工具栏按钮的html
export function createToolbarHtml() {
    const toolbar = locale().toolbar;
    const fontarray = locale().fontarray;
    const defaultFmtArray = locale().defaultFmt;
    const htmlMap = {
        undo: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.undo}"
        id="sheet-icon-undo" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-undo iconfont sheet-iconfont-qianjin"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        redo: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.redo}"
        id="sheet-icon-redo" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-redo iconfont sheet-iconfont-houtui"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        paintFormat: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.paintFormat}"
        id="sheet-icon-paintformat" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img iconfont sheet-iconfont-geshishua"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        currencyFormat: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.currencyFormat}"
        id="sheet-icon-currency" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img iconfont sheet-iconfont-jine"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
        percentageFormat: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.percentageFormat}"
        id="sheet-icon-percent" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img iconfont sheet-iconfont-baifenhao"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //Percentage format
        numberDecrease: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.numberDecrease}"
        id="sheet-icon-fmt-decimal-decrease" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block toolbar-decimal-icon"
                    style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-decimal-decrease iconfont sheet-iconfont-jianxiaoxiaoshuwei"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Decrease the number of decimal places'
        numberIncrease: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.numberIncrease}"
        id="sheet-icon-fmt-decimal-increase" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block toolbar-decimal-icon"
                    style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-decimal-increase iconfont sheet-iconfont-zengjiaxiaoshuwei"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Increase the number of decimal places
        moreFormats: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.moreFormats}"
        id="sheet-icon-fmt-other" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        ${defaultFmtArray[0].text}
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'More Formats'
        font: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.font}" id="sheet-icon-font-family" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        ${fontarray[0]}
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'font'
        fontSize: `<div class="sheet-toolbar-select sheet-toolbar-zoom-combobox sheet-toolbar-combo-button sheet-inline-block"
        data-tips="${toolbar.fontSize}" id="sheet-icon-font-size" style="user-select: none;">
            <div class="sheet-toolbar-combo-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-combo-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div aria-posinset="4" aria-setsize="7" class="sheet-inline-block sheet-toolbar-combo-button-caption"
                    style="user-select: none;">
                        <input aria-label="${toolbar.fontSize}" class="sheet-toolbar-combo-button-input sheet-toolbar-textinput"
                        role="combobox" style="user-select: none;" tabindex="-1" type="text" value="10"
                        />
                    </div>
                    <div class="sheet-toolbar-combo-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Font size'
        bold: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.bold}"
        id="sheet-icon-bold" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-bold iconfont sheet-iconfont-jiacu"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Bold (Ctrl+B)'
        italic: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.italic}"
        id="sheet-icon-italic" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-italic iconfont sheet-iconfont-wenbenqingxie1"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Italic (Ctrl+I)'
        strikethrough: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.strikethrough}"
        id="sheet-icon-strikethrough" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-strikethrough iconfont sheet-iconfont-wenbenshanchuxian"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Strikethrough (Alt+Shift+5)'
        underline: `<div class="sheet-toolbar-button sheet-inline-block" data-tips="${toolbar.underline}"
        id="sheet-icon-underline" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-underline iconfont sheet-iconfont-wenbenxiahuaxian"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Underline (Alt+Shift+6)'
        textColor: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-text-color"
        data-tips="${toolbar.textColor}" id="sheet-icon-text-color" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-color-menu-button-indicator" style="border-bottom-color: rgb(0, 0, 0); user-select: none;">
                            <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                                <div class="text-color-bar" style="background-color:${sheetConfigSetting.defaultTextColor}"></div>
                                <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-text-color iconfont sheet-iconfont-wenbenyanse"
                                style="user-select: none;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.chooseColor}..." id="sheet-icon-text-color-menu" role="button"
        style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Text color'
        fillColor: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-cell-color"
        data-tips="${toolbar.fillColor}" id="sheet-icon-cell-color" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-color-menu-button-indicator" style="border-bottom-color: rgb(255, 255, 255); user-select: none;">
                            <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                                <div class="text-color-bar" style="background-color:${sheetConfigSetting.defaultCellColor}"></div>
                                <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-cell-color iconfont sheet-iconfont-tianchong"
                                style="user-select: none;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.chooseColor}..." id="sheet-icon-cell-color-menu" role="button"
        style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Cell color'
        border: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-border-all"
        data-tips="${toolbar.border}" id="sheet-icon-border-all" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-border-all iconfont sheet-iconfont-quanjiabiankuang"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.borderStyle}..." id="sheet-icon-border-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'border'
        mergeCell: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-merge-button"
        data-tips="${toolbar.mergeCell}" id="sheet-icon-merge-button" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-merge iconfont sheet-iconfont-hebing"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.chooseMergeType}..." id="sheet-icon-merge-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Merge cells'
        horizontalAlignMode: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-align"
        data-tips="${toolbar.horizontalAlign}" id="sheet-icon-align" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-align-left iconfont sheet-iconfont-wenbenzuoduiqi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.alignment}..." id="sheet-icon-align-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Horizontal alignment'
        verticalAlignMode: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-valign"
        data-tips="${toolbar.verticalAlign}" id="sheet-icon-valign" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-valign-bottom iconfont sheet-iconfont-dibuduiqi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.alignment}..." id="sheet-icon-valign-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Vertical alignment'
        textWrapMode: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-textwrap"
        data-tips="${toolbar.textWrap}" id="sheet-icon-textwrap" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-textwrap-clip iconfont sheet-iconfont-jieduan"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.textWrapMode}..." id="sheet-icon-textwrap-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Wrap mode'
        textRotateMode: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-rotation"
        data-tips="${toolbar.textRotate}" id="sheet-icon-rotation" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-wuxuanzhuang"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.textRotateMode}..." id="sheet-icon-rotation-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Text Rotation Mode'
        image: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.insertImage}" id="sheet-insertImg-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-tupian"
                            style="user-select: none;">
                                <input id="sheet-imgUpload" type="file" accept="image/*" style="display:none;"></input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Insert picture'
        link: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.insertLink}" id="sheet-insertLink-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-lianjie"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Insert link'(TODO)
        chart: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.chart}" id="sheet-chart-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-tubiao"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
        postil: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.postil}"
        id="sheet-icon-postil" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon-img-container sheet-toolbar-menu-button-caption sheet-inline-block iconfont sheet-iconfont-zhushi"
                    style="user-select: none;">
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'comment'
        pivotTable: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.pivotTable}" id="sheet-pivot-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-shujutoushi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'PivotTable'
        function: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-icon-function"
        data-tips="${toolbar.autoSum}" id="sheet-icon-function" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-function iconfont sheet-iconfont-jisuan"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        ${toolbar.sum}
                    </div>
                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.moreFunction}..." id="sheet-icon-function-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'formula'
        frozenMode: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block sheet-freezen-btn-horizontal"
        data-tips="${toolbar.freezeTopRow}" id="sheet-freezen-btn-horizontal" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">

                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-dongjie1"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="sheet-toolbar-button-split-right sheet-toolbar-menu-button sheet-inline-block"
        data-tips="${toolbar.moreOptions}..." id="sheet-icon-freezen-menu" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'freeze mode'
        sortAndFilter: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.sortAndFilter}"
        id="sheet-icon-autofilter" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-autofilter iconfont sheet-iconfont-shaixuan"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>`, //'Sort and filter'
        conditionalFormat: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.conditionalFormat}"
        id="sheet-icon-conditionformat" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">

                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-autofilter iconfont sheet-iconfont-geshitiaojian"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Conditional Format'
        dataVerification: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.dataVerification}" id="sheet-dataVerification-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-shujuyanzheng"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Data Verification'
        splitColumn: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.splitColumn}" id="sheet-splitColumn-btn-title" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-wenbenfenge"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Split column'
        screenshot: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.screenshot}" id="sheet-chart-btn-screenshot" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-jieping"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'screenshot'
        findAndReplace: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.findAndReplace}"
        id="sheet-icon-seachmore" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">

                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-autofilter iconfont sheet-iconfont-sousuo"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>`, //'Find and Replace'
        protection: `<div class="sheet-toolbar-button-split-left sheet-toolbar-button sheet-inline-block"
        data-tips="${toolbar.protection}" id="sheet-icon-protection" role="button" style="user-select: none;">
            <div class="sheet-toolbar-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-menu-button-inner-box sheet-inline-block"
                style="user-select: none;">
                    <div class="sheet-toolbar-menu-button-caption sheet-inline-block"
                    style="user-select: none;">
                        <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-rotation-none iconfont sheet-iconfont-biaogesuoding"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Worksheet protection'
        print: `<div class="sheet-toolbar-select sheet-toolbar-menu-button sheet-inline-block" data-tips="${toolbar.print}"
        id="sheet-icon-print" role="button" style="user-select: none;">
            <div class="sheet-toolbar-menu-button-outer-box sheet-inline-block"
            style="user-select: none;">
                <div class="sheet-toolbar-button-inner-box sheet-inline-block"
                style="user-select: none;">

                    <div class="sheet-icon sheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="sheet-icon-img-container sheet-icon-img sheet-icon-autofilter iconfont sheet-iconfont-dayin"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="sheet-toolbar-menu-button-dropdown sheet-inline-block iconfont sheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>` // 'print'
    };

    const showtoolbar = sheetConfigSetting.showtoolbar;
    const showtoolbarConfig = sheetConfigSetting.showtoolbarConfig;

    const buttonHTML = ['<div class="sheet-toolbar-left-theme"></div>'];

    // 数组形式直接生成
    if (getObjType(showtoolbarConfig) === 'array') {
        // 此时不根据 showtoolbar=false，showtoolbarConfig为某几个进行适配，此时showtoolbarConfig本身就是全部要显示的按钮
        if (!showtoolbar) {
            return '';
        }
        let i = 0;
        showtoolbarConfig.forEach(function(key, i) {
            if (key === '|') {
                const nameKeys = showtoolbarConfig[i - 1]
                if(nameKeys !== '|') {
                    buttonHTML.push(
                        `<div id="toolbar-separator-${camel2split(nameKeys)}" class="sheet-toolbar-separator sheet-inline-block" style="user-select: none;"></div>`
                        );
                }
            } else {
                buttonHTML.push(htmlMap[key]);
            }
        });
        return buttonHTML.join('');
    }

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

    // 对象模式 则从里面挑选 true 保留 false 删掉
    if (JSON.stringify(showtoolbarConfig) !== '{}') {
        if(showtoolbarConfig.hasOwnProperty('undoRedo')){
            config.undo = config.redo = showtoolbarConfig.undoRedo;
        }
        Object.assign(config, showtoolbarConfig);
    }
    for (let i = 0; i < defaultToolbar.length; i++) {
        let key = defaultToolbar[i];
        if (!config[key] && key !== '|') {
            // 如果当前元素隐藏 按照之前的规则 后面紧跟的 | 分割也不需要显示了
            if (defaultToolbar[i + 1] === '|') {
                i++;
            }
            continue;
        }
        if (key === '|') {
            const nameKeys = defaultToolbar[i - 1]
            if(nameKeys !== '|') {
                buttonHTML.push(
                    `<div id="toolbar-separator-${camel2split(nameKeys)}" class="sheet-toolbar-separator sheet-inline-block" style="user-select: none;"></div>`
                );
            }
        } else {
            buttonHTML.push(htmlMap[key]);
        }
    }
    return buttonHTML.join('');
}
