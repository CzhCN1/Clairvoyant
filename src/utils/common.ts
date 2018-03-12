import { ObjectUtils } from './object';

export class Common {
    private objectUtils: ObjectUtils;
    constructor() {
        this.objectUtils = new ObjectUtils();
    }

    /**
     * 获取缓存信息
     * 
     * @param {string[]} keyArr 缓存key列表
     * @returns {object[]} 缓存结果数组
     * @memberof Common
     */
    public getStorage(keyArr: string[]): object[] {
        let resArr = [];
        for (let storageKey of keyArr) {
            try {
                let storageValue = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || undefined;
                resArr.push({
                    key: storageKey,
                    value: storageValue
                });
            } catch (error) {
                console.error('LocalStorage获取异常：' + error);
            }
        }
        return resArr;
    }

    /**
     * 获取window对象的属性
     * 
     * @param {string[]} paramArr 
     * @returns {object[]} 
     * @memberof Common
     */
    public getWindowParam(paramArr: string[]): object[] {
        let resArr = [];
        for (let param of paramArr) {
            let result = this.objectUtils.getParamFromObject(window, param);
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
    }

    /**
     * 获取缓存中的手机号
     * 
     * @param {string} storageKey 
     * @returns 
     * @memberof Common
     */
    public getPhoneNumber(storageKey: string) {
        let paramArr = storageKey && storageKey.split('.');
        if (!paramArr || paramArr.length < 1) {
            return null;
        }
        try {
            let key = paramArr.shift();
            let storageStr = key ? localStorage.getItem(key) || sessionStorage.getItem(key) : '';
            // 如果只有缓存节点key
            if (paramArr.length == 0) {
                return storageStr;
            }
            // 认为手机号是对象中具体的属性
            let storageObj = storageStr ? JSON.parse(storageStr) : null;
            let phoneNumber = this.objectUtils.getParamFromObject(storageObj, paramArr.join('.'));
            return (phoneNumber && phoneNumber.length == 11) ? phoneNumber : null;
        } catch (error) {
            console.error('获取手机号失败');
            return null;
        }
    }

    /**
     * 校验appID是否合法
     * 
     * @private
     * @param {string} appId 项目编号
     * @returns {boolean} 校验结果
     * @memberof Common
     */
    public appIDCheck(appId: string): boolean {
        return (appId && /^\w{32}$/.test(appId)) ? true : false;
    }
}
