import functionImplementation from './functionImplementation';
import Store from '../store/index'
import locale from '../locale/locale';
//{"0":"数学","1":"统计","2":"查找","3":"sheet内置","4":"数据挖掘","5":"数据源","6":"日期","7":"过滤器","8":"财务","9":"工程计算","10":"逻辑","11":"运算符","12":"文本","13":"转换工具","14":"数组"}

const functionlist = function(){
    let _locale = locale();
    // internationalization,get function list
    let functionListOrigin = _locale.functionlist;

    // add new property f
    for (let i = 0; i < functionListOrigin.length; i++) {
        let func = functionListOrigin[i];
        func.f = functionImplementation[func.n];
    }

    Store.functionlist = functionListOrigin;
    
    // get n property
    const sheet_function = {};

    for (let i = 0; i < functionListOrigin.length; i++) {
        let func = functionListOrigin[i];
        sheet_function[func.n] = func;
    }

    window.sheet_function = sheet_function; //Mount window for eval() calculation formula
    
    Store.sheet_function = sheet_function;
}

export default functionlist;