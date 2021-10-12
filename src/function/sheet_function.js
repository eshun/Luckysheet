import functionlist from './functionlist';

const sheet_function = {};

for (let i = 0; i < functionlist.length; i++) {
    let func = functionlist[i];
    sheet_function[func.n] = func;
}

window.sheet_function = sheet_function; //挂载window 用于 eval() 计算公式

export default sheet_function;