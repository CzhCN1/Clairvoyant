(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("monitor", [], factory);
	else if(typeof exports === 'object')
		exports["monitor"] = factory();
	else
		root["monitor"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ObjectUtils = /** @class */ (function () {
    function ObjectUtils() {
    }
    /**
     * 获取对象的具体属性 支持objct.a.b.c
     *
     * @param {*} parentObj 目标对象
     * @param {string} field 具体属性名
     * @returns {*} 属性值
     * @memberof ObjectUtils
     */
    ObjectUtils.prototype.getParamFromObject = function (parentObj, field) {
        if (parentObj && field) {
            if (field.indexOf('.') == -1) {
                return parentObj[field];
            }
            else {
                var fields = field.split('.');
                var value = parentObj;
                for (var i = 0, len = fields.length; i < len; ++i) {
                    if (value == null) {
                        return null;
                    }
                    value = value[fields[i]];
                }
                return value;
            }
        }
        else {
            return null;
        }
    };
    return ObjectUtils;
}());
exports.ObjectUtils = ObjectUtils;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __webpack_require__(2);
exports.Http = http_1.Http;
var environment_1 = __webpack_require__(3);
exports.Env = environment_1.Env;
var common_1 = __webpack_require__(4);
exports.Common = common_1.Common;
var object_1 = __webpack_require__(0);
exports.ObjectUtils = object_1.ObjectUtils;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Http = /** @class */ (function () {
    function Http() {
        this.HttpConfig = {
            timeout: 3000
        };
    }
    /**
     * 利用创建img标签发送get请求
     *
     * @param {string} url
     * @returns {Promise<any>}
     * @memberof Http
     */
    // public getRequest(url: string): Promise<any> {
    //     return new Promise<any>((resolve: any) => {
    //         let img = new Image;
    //         img.onload = () => {
    //             resolve();
    //         };
    //         img.src = url;
    //     });
    // }
    Http.prototype.getRequest = function (url) {
        var _this = this;
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(xhr.responseText);
                }
            };
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            // 如果有超时时间
            if (_this.HttpConfig && _this.HttpConfig.timeout) {
                xhr.timeout = _this.HttpConfig.timeout;
                xhr.ontimeout = function () { return xhr.abort(); };
            }
            xhr.send();
        });
    };
    /**
     * POST请求  请求头为application/json
     *
     * @param {string} url
     * @param {string} paramJson
     * @returns {Promise<any>}
     * @memberof Http
     */
    Http.prototype.postRequest = function (url, paramJson) {
        var _this = this;
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve();
                }
            };
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            // 如果有超时时间
            if (_this.HttpConfig && _this.HttpConfig.timeout) {
                xhr.timeout = _this.HttpConfig.timeout;
                xhr.ontimeout = function () { return xhr.abort(); };
            }
            xhr.send(paramJson);
        });
    };
    return Http;
}());
exports.Http = Http;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Env = /** @class */ (function () {
    function Env() {
    }
    /**
     * 获取浏览器用户代理信息
     *
     * @returns {string} 用户代理信息
     * @memberof Env
     */
    Env.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };
    /**
     * 获取屏幕尺寸
     *
     * @returns {string} 屏幕尺寸
     * @memberof Env
     */
    Env.prototype.getScreenSize = function () {
        return (window && window.screen && window.screen.width + '*' + window.screen.height) || 'Unknown';
    };
    /**
     * 获取浏览器类型
     *
     * @returns {string} 浏览器类型
     * @memberof Env
     */
    Env.prototype.getBrowserType = function () {
        var userAgent = this.getUserAgent();
        var browserType;
        if (/MicroMessenger/i.test(userAgent)) {
            browserType = 'WeChat';
        }
        else if (/Edge/i.test(userAgent)) {
            browserType = 'Edge';
        }
        else if (/Chrome/i.test(userAgent)) {
            browserType = 'Chrome';
        }
        else if (/Safari/i.test(userAgent)) {
            browserType = 'Safari';
        }
        else if (/Firefox/i.test(userAgent)) {
            browserType = 'Firefox';
        }
        else if (/MSIE/i.test(userAgent) || /Trident/i.test(userAgent)) {
            browserType = 'IE';
        }
        else if (/Opera/i.test(userAgent)) {
            browserType = 'Opera';
        }
        else {
            browserType = 'Unknown';
        }
        return browserType;
    };
    /**
     * 获取终端类型及操作系统信息
     *
     * @returns {any} 设备信息
     * @memberof Env
     */
    Env.prototype.getPlatformOs = function () {
        var regRes = /\((.+?)\)/.exec(navigator.userAgent); // 获取用户平台信息
        var platformInfo = (regRes && regRes[1]) || '';
        var infoArr = platformInfo.split('; ');
        // 终端类型  包括:iPhone iPad Mac Android WinPhone Windows Linux Unknown
        var platformType;
        var osVersion; // 版本号
        var osType; // 操作系统类型 包括: IOS OS_X Android Windows Linux Unknown
        if (infoArr && infoArr.length > 0) {
            if (/iPhone/i.test(infoArr[0])) {
                platformType = 'iPhone';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'IOS ' + (osVersion ? osVersion[0] : '');
            }
            else if (/iPad/i.test(infoArr[0])) {
                platformType = 'iPad';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'IOS' + (osVersion ? osVersion[0] : '');
            }
            else if (/Mac/i.test(infoArr[0])) {
                platformType = 'Mac';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'OS X ' + (osVersion ? osVersion[0] : '');
            }
            else if (/Linux/i.test(infoArr[0])) {
                platformType = 'Android';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'Android ' + (osVersion ? osVersion[0] : '');
            }
            else if (/Windows Phone/i.test(platformInfo)) {
                platformType = 'Windows Phone';
                osVersion = /Windows Phone \d+([_\.]\d+)+/i.exec(platformInfo);
                osType = osVersion ? osVersion[0] : '';
            }
            else if (/Windows/i.test(this.getUserAgent())) {
                platformType = 'Windows';
                osVersion = /Windows NT \d+([_\.]\d+)+/i.exec(platformInfo);
                osType = osVersion ? this.windowsNt2Ver(osVersion[0]) : '';
            }
            else if (/X11/i.test(infoArr[0])) {
                platformType = 'Linux';
                osType = 'Linux';
            }
            else {
                platformType = 'Unknown';
                osType = 'Unknown';
            }
            osType = osType.replace(/_/g, '.'); // 统一版本号为数字+小数点
        }
        else {
            platformType = 'Unknown';
            osType = 'Unknown';
        }
        return {
            platformType: platformType,
            osType: osType
        };
    };
    /**
     * 通过域名判断是否为生产环境
     *
     * @param {string[]} prodHostList 生产环境域名列表 location.host
     * @returns {boolean}  true: 生产环境 false: 非生产环境
     * @memberof Env
     */
    Env.prototype.isProdEnv = function (prodHostList) {
        if (location && location.href.indexOf('localhost') != -1) {
            return false;
        }
        else if (location && location.protocol == 'file:') {
            return true;
        }
        else if (location && location.host) {
            var prodEnvHost = prodHostList;
            var curHost = location.host;
            return (prodEnvHost.indexOf(curHost) == -1) ? false : true;
        }
        else {
            return false;
        }
    };
    /**
     * Windows内核版本转为发行版本
     *
     * @private
     * @param {string} ntVersion 内核版本
     * @returns {string} 发行版本
     * @memberof Env
     */
    Env.prototype.windowsNt2Ver = function (ntVersion) {
        var arr = ntVersion.split(' ');
        var version;
        switch (arr[2]) {
            case '5.1':
                version = 'Windows XP(32位)';
                break;
            case '5.2':
                version = 'Windows XP(64位)';
                break;
            case '6.0':
                version = 'Windows Vista';
                break;
            case '6.1':
                version = 'Windows 7';
                break;
            case '6.2':
                version = 'Windows 8';
                break;
            case '6.3':
                version = 'Windows 8.1';
                break;
            case '10.0':
                version = 'Windows 10';
                break;
            default:
                version = 'Windows';
                break;
        }
        return version;
    };
    return Env;
}());
exports.Env = Env;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = __webpack_require__(0);
var Common = /** @class */ (function () {
    function Common() {
        this.objectUtils = new object_1.ObjectUtils();
    }
    /**
     * 获取缓存信息
     *
     * @param {string[]} keyArr 缓存key列表
     * @returns {object[]} 缓存结果数组
     * @memberof Common
     */
    Common.prototype.getStorage = function (keyArr) {
        var resArr = [];
        for (var _i = 0, keyArr_1 = keyArr; _i < keyArr_1.length; _i++) {
            var storageKey = keyArr_1[_i];
            try {
                var storageValue = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || undefined;
                resArr.push({
                    key: storageKey,
                    value: storageValue
                });
            }
            catch (error) {
                console.error('LocalStorage获取异常：' + error);
            }
        }
        return resArr;
    };
    /**
     * 获取window对象的属性
     *
     * @param {string[]} paramArr
     * @returns {object[]}
     * @memberof Common
     */
    Common.prototype.getWindowParam = function (paramArr) {
        var resArr = [];
        for (var _i = 0, paramArr_1 = paramArr; _i < paramArr_1.length; _i++) {
            var param = paramArr_1[_i];
            var result = this.objectUtils.getParamFromObject(window, param);
            // 如果要查找的属性存在
            if (!!result) {
                // 如果属性节点类型为对象或数组，JSON格式化为字符串
                if (typeof result == 'object') {
                    result = JSON.stringify(result);
                }
                // 如果属性长度过长，为了性能不予上报
                if (result && result.length > 1000) {
                    result = '该属性值过长';
                }
            }
            // 加入结果集
            resArr.push({
                key: param,
                value: result || null
            });
        }
        return resArr;
    };
    /**
     * 获取缓存中的手机号
     *
     * @param {string} storageKey
     * @returns
     * @memberof Common
     */
    Common.prototype.getPhoneNumber = function (storageKey) {
        var paramArr = storageKey && storageKey.split('.');
        if (!paramArr || paramArr.length < 1) {
            return null;
        }
        try {
            var key = paramArr.shift();
            var storageStr = key ? localStorage.getItem(key) || sessionStorage.getItem(key) : '';
            // 如果只有缓存节点key
            if (paramArr.length == 0) {
                return storageStr;
            }
            // 认为手机号是对象中具体的属性
            var storageObj = storageStr ? JSON.parse(storageStr) : null;
            var phoneNumber = this.objectUtils.getParamFromObject(storageObj, paramArr.join('.'));
            return (phoneNumber && phoneNumber.length == 11) ? phoneNumber : null;
        }
        catch (error) {
            console.error('获取手机号失败');
            return null;
        }
    };
    /**
     * 校验appID是否合法
     *
     * @private
     * @param {string} appId 项目编号
     * @returns {boolean} 校验结果
     * @memberof Common
     */
    Common.prototype.appIDCheck = function (appId) {
        return (appId && /^\w{32}$/.test(appId)) ? true : false;
    };
    return Common;
}());
exports.Common = Common;


/***/ })
/******/ ]);
});