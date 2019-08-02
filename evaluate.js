//All code to async
//Report Bad Config
"use strict";
const { injectCode, insertData } = require('./inject.js');
const b64 = require('./base64.js');
const fs = require('fs');
const configReader = require('./configReader.js');

const injectOptions = {
    //bindThisLastIIFE: true,
    bindThisToEvalInsideDOMFunc: true,
    bindThisToDOMFunc: true,
    //logThisInsideDOMFunc: true,
    //logResultOfDOMFunc: true,
    //saveToFile: './savedCode.js',
    //custom: [['(function(){','(()=>{']],
    allFunctionToArrow: true
};

const btoa = b64.btoa;

const dummyWindow = {
    btoa: b64.btoa,
    atob: b64.atob,
    Date: Date,
    Array: global.Array,
    RegExp: global.RegExp,
    eval: global.eval,
    encodeURIComponent: global.encodeURIComponent,

    process: { version: undefined },
    _phantom: undefined,
    callPhantom: undefined,
    __nightmare: undefined,
    domAutomation: undefined,
    domAutomationController: undefined,
    _Selenium_IDE_Recorder: undefined,
};

function Window(options) {
    const { config, customDocument } = options;
    let configBuild = Object.assign({}, config.window);
    configBuild.screen = config['window.screen'];
    configBuild.navigator.plugins = config['window.navigator.plugins'];
    configBuild.navigator.mimeTypes = config['window.navigator.mimeTypes'];
    configBuild.outerWidth = configBuild.screen.width;
    configBuild.outerHeight = configBuild.screen.height;

    Object.assign(this, configBuild, customDocument, dummyWindow);

    this.window = this;
}

//create dummyDocument
function Document(options) {
    const { cookie } = options;
    this.cookieStr = cookie;
    this.documentMode = undefined;
    this.__webdriver_script_fn = undefined;
    this.$cdc_asdjflasutopfhvcZLmcfl_ = undefined;

    Object.defineProperty(this, 'cookie', {
        set: function (newCookie) {
            !this.cookieStr ?
                (this.cookieStr = newCookie.split(';')[0]) :
                (this.cookieStr += '; ' + newCookie.split(';')[0]);
        },
        get: function () {
            return this.cookieStr
        }
    });

    const self = this;
    this.createElement = function () {
        const fakeDoc = {};
        Object.defineProperty(fakeDoc, 'src', {
            set: function (data) {
                self.imgSrc = data;
            }
        })
        return fakeDoc
    }

};

function evaluateWithConfig(code, config, cookie) {

    const document = new Document({ cookie });

    const window = new Window({
        config: config,
        customDocument: { document }
    });

    //console.log(window);

    code = code.replace('return z', ';z=injectCode(z,injectOptions); return z');

    const bindIndex = code.lastIndexOf(')()');
    code = insertData(code, bindIndex, '.bind(window)');
    eval(code);
    //fs.writeFileSync('./test.js',code);

    return {
        'document.cookieStr': document.cookieStr,
        'document.imgSrc': document.imgSrc,
        userAgent: window.navigator.userAgent
    }
};

 //const config = eval(fs.readFileSync('./config.txt').toString().replace(/^/, 'exports ='));
 //const cookieStr = 'visid_incap_560619=XEjv8C22S9uIoeJpXhWdMtONn1sAAAAAQUIPAAAAAABantAbnyMoPg8SrBCzptP5; incap_ses_473_560619=NzTZGzAz1BJb3M6FE3CQBuYuoFsAAAAAR3f4JYAyBUmQ3ZeV5YdmJg==';
 //const code = fs.readFileSync('./code.txt').toString();
 //console.log(evaluateWithConfig(code, config, cookieStr));

async function evaluate(code, cookie) {
	const configObj = await configReader();
	let {config,folder} = configObj;
    config = eval(config.replace(/^/, 'exports ='));

    let result = evaluateWithConfig(code, config, cookie)
return Object.assign(result, {configName: folder})
}



module.exports = { evaluateWithConfig, evaluate };