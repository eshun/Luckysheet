import { getSheetIndex } from '../methods/get';
import Store from '../store';

function setsheet_select_save(v) {
    Store.sheet_select_save = v;
}

function setsheet_scroll_status(v) {
    Store.sheet_scroll_status = v;
}

function setsheetfile(d) {
    Store.sheetfile = d;
}

function setconfig(v) {
    Store.config = v;

    if(Store.sheetfile != null){
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].config = v;
    }
}

function setvisibledatarow(v) {
    Store.visibledatarow = v;

    if(Store.sheetfile != null){
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].visibledatarow = v;
    }
}

function setvisibledatacolumn(v) {
    Store.visibledatacolumn = v;

    if(Store.sheetfile != null){
        Store.sheetfile[getSheetIndex(Store.currentSheetIndex)].visibledatacolumn = v;
    }
}

export {
    setsheet_select_save,
    setsheet_scroll_status,
    setsheetfile,
    setconfig,
    setvisibledatarow,
    setvisibledatacolumn,
}