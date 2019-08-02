const fs = require('fs');

function insertData(str, index, data) {
    return str.slice(0, index) + data + str.slice(index);
};

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

function injectCode(code, options) {
    const { bindThisLastIIFE, allFunctionToArrow, bindThisToEvalInsideDOMFunc, bindThisToDOMFunc, logThisInsideDOMFunc, saveToFile, logResultOfDOMFunc, custom } = options;

    if (bindThisLastIIFE) {
        const lastiife = code.lastIndexOf(';}}());') + ';}}'.length;
        code = insertData(code, lastiife, '.bind(window)');
    };


    const testEvalType = code.match(/(\(eval,[0-9_xa-f]+\))/); // (eval, ....)
    const testEvalType2 = code.match(/(eval\([0-9_xa-f]+\))/); // eval(...)

    if (bindThisToEvalInsideDOMFunc && testEvalType !== null) {
        const goingToEval = code.match(/(\(eval,[0-9_xa-f]+\))/);
        const goodGoingToEval = goingToEval.map((val) => {
            const name = val.replace('(eval,', '').replace(')', '');
            return `.call(this,()=>eval('this.'+${name}))`
        });

        for (let i = 0; i < goodGoingToEval.length; i++) {
            code = code.replace(goingToEval[i], goodGoingToEval[i]);
        }
    };

    if (bindThisToEvalInsideDOMFunc && testEvalType2 !== null) {
        // eval(_0x1a7ffa)
        const goingToEval = code.match(/(eval\([0-9_xa-f]+\))/);
        const goodGoingToEval = goingToEval.map((val) => {
            const name = val.replace('eval(', '').replace(')', '');
            return `eval('this.'+${name})`
        });

        for (let i = 0; i < goodGoingToEval.length; i++) {
            code = code.replace(goingToEval[i], goodGoingToEval[i]);
        }
    };


    if (bindThisToDOMFunc) {
        const iOfEndDOMFunc = code.lastIndexOf(')]();}var') + ')]();}'.length;
        const nameOfDomFunc = code.match(/function ([0-9a-f_x]+)\([0-9a-f_x]+\)\{var [0-9a-f_x]+='';var [0-9a-f_x]+=new Array\(\)/)[1];
        code = insertData(code, iOfEndDOMFunc, `;${nameOfDomFunc} = ${nameOfDomFunc}.bind(this);`);
    };

    if (logResultOfDOMFunc) {
        const nameOfArrayWithData = code.match(/function [0-9a-f_x]+\([0-9a-f_x]+\)\{var [0-9a-f_x]+='';var ([0-9a-f_x]+)=new Array\(\)/)[1];
        code = code.replace(`return ${nameOfArrayWithData}`, `console.log('\\r\\n\\r\\n\\r\\nlogResultOfDOMFunc:');console.log(${nameOfArrayWithData}); return ${nameOfArrayWithData}`);
    }

    if (logThisInsideDOMFunc) {
        const funcStr = code.match(/(function [0-9a-f_x]+\([0-9a-f_x]+\)\{)var [0-9a-f_x]+='';var [0-9a-f_x]+=new Array\(\)/)[1];
        const iOfDomFunctionStart = code.indexOf(funcStr) + funcStr.length;
        code = insertData(code, iOfDomFunctionStart, `console.log('\\r\\n\\r\\n\\r\\nthisInsideDOMFunc');console.log(this);`);
    };

    if (custom && custom.length !== 0) {
        custom.forEach(combination => {
            code = code.replaceAll(combination[0], combination[1])
        });
    };

    if (allFunctionToArrow) {
        const regexp = /(\(function\(\)\{.*?\}\(\)\))/g;
        const defaultFunctions = code.match(regexp);
        const modifiedFunctions = defaultFunctions.map(val => {return val.replace(/^\(function\(\)\{/, '(()=>{').replace(/\}\(\)\)$/, '})()') })

        for (let i = 0; i < modifiedFunctions.length; i++) {
            code = code.replace(defaultFunctions[i], modifiedFunctions[i]);
        };
    }

    //logThisInsideCodeBeginng ???
    //code = code.replace('(function(){var _0x4111ca','(function(){console.log(this);var _0x4111ca');

    //logCatchErrorInsideExistsCase ???
    //code = code.replace('catch(_0x4fdefe){', 'catch(_0x4fdefe){console.log(_0x4fdefe);')

    if (saveToFile) {
        fs.writeFileSync(saveToFile, code);
    }
    return code
};

module.exports = { injectCode, insertData };