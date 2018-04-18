import { Config } from './../config/index';
import { Http, Common, Env } from './../utils';

export interface ClairvoyantConfig {
    active: string;
    console?: string;
    phoneKey?: string;
    storageKey?: string[];
    windowKey?: string[];
    prodEnvHost?: string[];
}
export class Clairvoyant {
    private historyInterval: number;    // 同一错误的记录间隔时间
    private historyErrMsg: any = {      // 错误历史记录
        msg: '',
        date: Date.now()
    };

    private appId: string;              // 项目编号
    private appVersion: string;         // 项目版本号

    private active = true;              // 异常监控全局开关
    private console = false;            // 控制台监控开关
    private storageKey: string[] = [];  // 缓存节点数组
    private windowKey: string[] = [];   // window对象属性数组
    private phoneKey = '';              // 手机号的缓存节点
    private prodEnvHost: string[] = []; // 生产环境域名

    private consoleArr: any[] = [];     // 控制台输出记录
    private environment: any;           // 用户终端的环境信息

    private http: Http;
    private common: Common;
    private env: Env;

    constructor(appId: string, appVersion?: string) {
        this.historyInterval = 3000;
        // 组件入参
        this.appId = appId;
        this.appVersion = appVersion || (localStorage && localStorage.appVersion) || 'Unknown';
        // 辅助类
        this.http = new Http();
        this.common = new Common();
        this.env = new Env();
    }

    /**
     * 监控器配置接口
     * 
     * @param {*} conf 
     * @returns {void} 
     * @memberof Clairvoyant
     */
    public config(conf: ClairvoyantConfig): void {
        // 初始化SDK
        this.initMonitor(conf);
    }

    /**
     * Web框架错误处理接入
     * 
     * @param {*} error 错误对象
     * @memberof Clairvoyant
     */
    public handleError(error: any): void {
        // 如果监控静默，则不上传错误。
        // 如果当前错误信息与错误历史信息一致，不再发送请求
        if (this.active && error && !this.isRepeat(error.message)) {
            setTimeout(() => {
                try {
                    let errObj = {
                        msg: error && error.message,
                        type: error && error.name,
                        rowNum: error && error.lineNumber || error.line || 0,
                        colNum: error && error.columnNumber || error.column || 0,
                        currentUrl: window.location.href,
                        stack: error ? (error.stack ? error.stack.toString() : '') : '',  // 部分浏览器不支持stack参数
                        targetFile: error ? error.fileName || error.sourceURL : '',     // 谷歌浏览器无出错文件名
                    };
                    // 构建日志并发送
                    this.postError(errObj);
                } catch (e) {
                    console.error('Error', '前端异常监控系统出错:' + e);
                }
            }, 0);
        }
    }

    /**
     * 自定义错误上报处理
     *
     * @param {string} errMsg 自定义错误的描述信息
     * @memberof Clairvoyant
     */
    public customError(errMsg: string): void {
        try {
            // 如果监控静默，则不上传错误。
            // 如果当前错误信息与错误历史信息一致，不再发送请求
            if (this.active && !this.isRepeat(errMsg)) {
                let error: any  = new Error(errMsg);
                let stackArr = error.stack ? error.stack.split('\n') : [];
                if (stackArr.length > 1) {
                    // 兼容安卓及Chrome
                    let firstLine = '' + stackArr[0];
                    if (stackArr[0].startsWith('Error:')) {
                        stackArr[0] = stackArr[0].replace('Error', 'CustomError');  // 将堆栈信息中的 Error 替换为 CustomError
                        stackArr.splice(1, 1);   // 去掉函数调用栈中SDK的调用信息
                    } else if (stackArr[0].indexOf('kyee-clairvoyant') > -1) {
                    // 兼容iPhone及Safari
                        stackArr.splice(0, 1);
                    }
                    error.stack = stackArr.join('\n');
                }
                setTimeout(() => {
                    try {
                        // 如果errMsg为空或者非字符串，直接返回
                        if (!errMsg || Object.prototype.toString.apply(errMsg) != '[object String]') {
                            return;
                        }
                        // 解析错误对象
                        let errObj = {
                            msg: error && error.message,
                            type: 'CustomError',
                            rowNum: error && error.lineNumber || error.line || 0,
                            colNum: error && error.columnNumber || error.column || 0,
                            currentUrl: window.location.href,
                            stack: error ? (error.stack ? error.stack.toString() : '') : '',  // 部分浏览器不支持stack参数
                            targetFile: error ? error.fileName || error.sourceURL : '',     // 谷歌浏览器无出错文件名
                        };
                        // 构建日志并发送
                        this.postError(errObj);
                    } catch (e) {
                        console.error('Error', '前端异常监控系统出错:' + e);
                    }
                }, 0);
            }
        } catch (e) {
            console.error('Error', '前端异常监控系统出错:' + e);
        }
    }

    /**
     * 初始化监控器
     * 
     * @private
     * @param {*} configParams 配置参数
     * @memberof Clairvoyant
     */
    private initMonitor(configParams: ClairvoyantConfig): void {
        // 配置初始化
        this.initConfig(configParams);
        // console输出监控
        if (this.console) {
            this.initConsole();
        }
        // 获取环境信息
        this.getEnvironment();
        // 绑定onerror全局监听
        window.onerror = this.errorListener;
    }

    /**
     * 监控器配置初始化
     * 
     * @private
     * @param {*} params 配置参数
     * @returns {void} 
     * @memberof Clairvoyant
     */
    private initConfig(configParams: ClairvoyantConfig): void {
        // let active = (params['active'] && params['active'] == '1') ? true : false;
        // let configParams;
        // try {
        //     // JSON响应转为Object
        //     configParams = params['configParams'] ? JSON.parse(params['configParams']) : {};
        // } catch (e) {
        //     console.error('Error', '前端异常监控获取配置参数失败');
        //     return;
        // }
        // 设置静默开关
        this.active = (configParams['active'] && configParams['active'] == '1') ? true : false;     // 默认为false，即不开启异常上报，采用静默模式
        // 设置日志开关
        let consoleReport = (configParams['console'] && configParams['console'] == '1') ? true : false;
        this.console = consoleReport;  // 默认为false，即不开启控制台信息上报
        // 设置手机号位置信息
        this.phoneKey = configParams['phoneKey'] || '';
        // 设置缓存节点key
        let storageKey = configParams['storageKey'] || [];
        // 如果该属性是数组
        if (Object.prototype.toString.apply(storageKey) == '[object Array]') {
            this.storageKey = storageKey;
        } else {
            this.storageKey = [];
        }
        // 设置window属性key
        let windowKey = configParams['windowKey'] || [];
        // 如果该属性是数组
        if (Object.prototype.toString.apply(windowKey) == '[object Array]') {
            this.windowKey = windowKey;
        } else {
            this.windowKey = [];
        }
        // 设置生产域名列表
        let prodEnvHost = configParams['prodEnvHost'] || [];
        // 如果该属性是数组
        if (Object.prototype.toString.apply(prodEnvHost) == '[object Array]') {
            this.prodEnvHost = prodEnvHost;
        } else {
            this.prodEnvHost = [];
        }
    }

    /**
     * 初始化控制台监控
     * 
     * @private
     * @memberof Clairvoyant
     */
    private initConsole(): void {
        let consoleList = ['warn', 'log', 'info'];
        this.consoleArr = [];    // 用于记录控制台打印的日志信息，长度20的队列
        let self = this;
        let _console: any = console;
        for (let i = 0; i < consoleList.length; i++) {
            // for循环闭包
            (() => {
                let key = consoleList[i];
                let consoleFunc = _console[key]; // 记录原console方法
                if (Object.prototype.toString.apply(consoleFunc) == '[object Function]') {
                    // console方法改写
                    _console[key] = function () {
                        // 记录控制台console信息
                        if (self.console) {    // 打开控制台监控才进行记录
                            self.consoleArr.push({
                                type: 'console',
                                level: key,
                                message: Array.prototype.slice.apply(arguments).join(' ')
                            });
                            // 保证记录最大长度为20
                            if (self.consoleArr.length > 20) {
                                self.consoleArr.shift();
                            }
                        }
                        // 调用原console方法
                        consoleFunc.apply(console, arguments);
                    };
                }
            })();
        }
    }

    /**
     * 获取环境信息
     * 
     * @private
     * @memberof Clairvoyant
     */
    private getEnvironment(): void {
        let env: any = {};
        let deviceInfo = this.env.getPlatformOs();
        [env.platformType, env.opsystemType] = [deviceInfo.platformType, deviceInfo.osType];
        env.userAgent = this.env.getUserAgent();
        env.screenSize = this.env.getScreenSize();
        env.prodEnv = this.env.isProdEnv(this.prodEnvHost) ? '1' : '0';     // 1 生产环境， 0 非生产环境
        env.browserType = this.env.getBrowserType();
        this.environment = env;
    }

    /**
     * 校验appID是否合法
     * 
     * @private
     * @param {string} appId 项目编号
     * @returns {boolean} 校验结果
     * @memberof Clairvoyant
     */
    private appIDCheck(appId: string): boolean {
        return (appId && /^\w{32}$/.test(appId)) ? true : false;
    }

    /**
     * 获取异常监控的配置参数
     * 
     * @private
     * @param {string} appId 项目编号
     * @param {Function} feedback 回调函数
     * @memberof Clairvoyant
     */
    private getConfigParms(appId: string, feedback: Function): void {
        let url = Config.SERVER_URL + Config.QUERY_CONFIG + '?appId=' + appId;
        Promise.resolve(this.http.getRequest(url)).then((resp) => {
            feedback(resp);
        });
    }

    /**
     * 错误事件监听处理
     * 
     * @private
     * @param {*} msg 错误信息
     * @param {*} url 页面url
     * @param {*} line 出错行
     * @param {*} col 出错列
     * @param {*} error 错误对象
     * @returns {void} 
     * @memberof Clairvoyant
     */
    private errorListener(msg: any, url: any, line: any, col: any, error: any): void {
        try {
            // 如果监控静默，则不上传错误。
            // 如果当前错误信息与错误历史信息一致，不再发送请求
            if (this.active && !this.isRepeat(msg)) {
                // 如果是第三方脚本出错
                if (msg == 'Script error.') {
                    // 不作处理，抛出错误
                    return;
                }
                // 错误加入JS线程任务队列，防止阻塞
                setTimeout(() => {
                    try {
                        let errObj: any = {
                            msg: error.message,
                            type: error.name,
                            rowNum: line ? line : error.lineNumber || error.line || 0,
                            colNum: col ? col : error.columnNumber || error.column || 0,  // 部分浏览器不支持错误列信息
                            currentUrl: window.location.href,
                            stack: error ? (error.stack ? error.stack.toString() : '') : '',  // 部分浏览器不支持stack参数
                            targetFile: error ? error.fileName || error.sourceURL : '',     // 谷歌浏览器无出错文件名
                            errorTime: Date.now()
                        };
                        // 发送错误信息
                        this.postError(errObj);
                    } catch (e) {
                        console.error('Error', '前端异常监控系统出错');
                    }
                }, 0);
            }
        } catch (e) {
            console.error('Error', '前端异常监控系统出错');
        }
    }

    /**
     * 发送post请求，上报日志
     * 
     * @private
     * @param {string} errObj 错误日志JSON字符串
     * @param {Function} [feedback] 成功回调
     * @memberof Clairvoyant
     */
    private postError(errObj: any, feedback?: Function): void {
        // 生成错误日志信息
        let errorTopic = this.buildTopic(errObj);
        let url = Config.SERVER_URL + Config.EXCEPTION_INTERFACE;
        Promise.resolve(this.http.postRequest(url, errorTopic)).then((resp) => {
            if (feedback) { feedback(resp); }
        });
    }

    /**
     * 根据错误基本信息生成错误日志
     * 
     * @private
     * @param {any} errData 错误基本信息
     * @returns 
     * @memberof Clairvoyant
     */
    private buildTopic(errData: any): string {
        // 日志添加应用信息
        errData['appId'] = this.appId;
        errData['appVersion'] = this.appVersion;
        // 日志添加环境信息
        let env = this.environment;
        for (let key in env) {
            if (env.hasOwnProperty(key)) {
                errData[key] = env[key];
            }
        }
        // 日志添加时间信息
        errData['errorTime'] = (new Date).getTime();
        // 添加控制台记录信息
        if (this.console) {
            errData['console'] = JSON.stringify(this.consoleArr);
            this.consoleArr = [];    // 清空消息队列
        }
        // 如果开启前端缓存获取功能，添加缓存信息
        if (this.storageKey && (this.storageKey.length !== 0)) {
            errData['storage'] = JSON.stringify(this.common.getStorage(this.storageKey));   // 获取缓存信息
        }
        // 如果开启window属性获取功能，获取window属性
        if (this.windowKey && (this.windowKey.length !== 0)) {
            errData['windowParam'] = JSON.stringify(this.common.getWindowParam(this.windowKey));   // 获取缓存信息
        }
        // 如果开启获取手机号功能
        if (this.phoneKey) {
            errData['phoneNumber'] = this.common.getPhoneNumber(this.phoneKey);     // 获取手机号缓存
        }
        // JSON格式化日志对象
        return JSON.stringify(errData);
    }

    /**
     * 判断该错误是否在短时间内重复上报
     * 
     * @private
     * @param {string} errMsg 
     * @returns {boolean} 
     * @memberof Clairvoyant
     */
    private isRepeat(errMsg: string): boolean {
        if (this.historyErrMsg.msg == errMsg && (Date.now() - this.historyErrMsg.date < this.historyInterval)) {
            return true;
        } else {
            this.historyErrMsg = {
                msg: errMsg,
                date: Date.now()
            };
            return false;
        }
    }
}
