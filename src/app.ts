import { Clairvoyant, ClairvoyantConfig } from './exception/index';
import { Skye, SkyeConfig } from './statistics/index'; 
import { Http, Common } from './utils';
import { Config } from './config/index';

export class FrontEndMonitor {
    public clairvoyant: Clairvoyant;    // 异常监控
    public skye: Skye;                  // 点击统计

    private httpService: Http = new Http();
    private commonService: Common = new Common();

    constructor(
        private appId: string,
        private appVersion?: string
    ) {
        // 实例化异常监控
        this.clairvoyant = new Clairvoyant(appId, appVersion);
        // 实例化点击统计
        this.skye = new Skye(appId, appVersion);
        // 初始化配置
        this.initConfig(appId);
        // PV统计
        this.pvRecord(appId);
    }
    
    /**
     * 初始化SDK的配置
     * 
     * @private
     * @param {string} appId 应用编号
     * @returns 
     * @memberof FrontEndMonitor
     */
    private initConfig(appId: string): void {
        // 如果appId校验通过
        if (this.commonService.appIDCheck(appId)) {
            // 向后台请求配置参数
            this.queryConfig(appId, (resp: any) => {
                let respObj;
                try {
                    // JSON响应转为Object
                    respObj = resp ? JSON.parse(resp) : {};
                    // 如果请求成功
                    if (respObj && respObj['success']) {
                        // 响应中的data数据
                        let params = respObj['data'];
                        // 具体SDK参数
                        let configParams = params['configParams'] ? JSON.parse(params['configParams']) : {};
                        configParams['active'] = params['active'];
                        // 向各组件分发配置参数
                        this.distributeConfig(configParams);
                    } else {
                        console.error('Error', '前端监控初始化失败,' + respObj['message']);
                        return;
                    }
                } catch (e) {
                    console.error('Error', '前端监控获取配置参数JSON解析失败');
                    return;
                }
            });
        } else {
            console.error('Error', '前端监控初始化失败，appId不合法');
            return;
        }
    }
    
    /**
     * 请求前端监控的配置参数
     * 
     * @private
     * @param {string} appId 项目编号
     * @param {Function} feedback 回调函数
     * @memberof FrontEndMonitor
     */
    private queryConfig(appId: string, feedback: Function): void {
        let url = Config.SERVER_URL + Config.QUERY_CONFIG + '?appId=' + appId;
        Promise.resolve(this.httpService.getRequest(url)).then((resp) => {
            feedback(resp);
        });
    }

    /**
     * 配置参数分发
     * 
     * @private
     * @param {*} configParams 配置参数
     * @returns 
     * @memberof FrontEndMonitor
     */
    private distributeConfig(configParams: any): void {
        // 获取配置参数集合
        let configGroup = this.configFactory(configParams);
        // 对各组件进行参数分发
        this.clairvoyant.config(configGroup.clairvoyantConfig);
        this.skye.config(configGroup.skyeConfig);
    }

    /**
     * 生成配置参数对象
     * 
     * @private
     * @param {*} configParams 配置参数
     * @returns 
     * @memberof FrontEndMonitor
     */
    private configFactory(configParams: any): any {
        const clairvoyantKey = ['active', 'console', 'phoneKey', 'storageKey', 'windowKey', 'prodEnvHost'];
        const skyeKey = ['active', 'phoneKey'];
        return {
            clairvoyantConfig: this.extendCopy(configParams, clairvoyantKey),
            skyeConfig: this.extendCopy(configParams, skyeKey),
        };
    }

    /**
     * 根据key进行浅复制
     * 
     * @private
     * @param {*} origin 源对象
     * @param {string[]} keys key数组
     * @returns {*} 
     * @memberof FrontEndMonitor
     */
    private extendCopy(origin: any, keys: string[]): any {
        try {
            if (typeof origin != 'object') {
                return;
            }
            let result: any = {};
            for (let key in origin) {
                if (origin.hasOwnProperty(key) && keys.indexOf(key) != -1 ) {
                    result[key] = origin[key];
                }
            }
            return result;
        } catch (e) {
            console.error('Error', '前端监控生成配置参数失败');
            return;
        }
    }

    /**
     * PV统计
     * 
     * @private
     * @param {string} appId 应用编号
     * @param {Function} [feedback] 回调函数
     * @memberof FrontEndMonitor
     */
    private pvRecord(appId: string, feedback?: Function): void {
        let url = Config.SERVER_URL + Config.PV_RECORD + '?appId=' + appId;
        Promise.resolve(this.httpService.getRequest(url)).then((resp) => {
            if (feedback) {
                feedback(resp);
            }
        });
    }
}
