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
            let phoneNumber;
            let key = paramArr.shift();
            let storageStr = key ? localStorage.getItem(key) || sessionStorage.getItem(key) : '';
            // 如果只有缓存节点key
            if (paramArr.length == 0) {
                phoneNumber = storageStr;
            } else {
                // 认为手机号是对象中具体的属性
                let storageObj = storageStr ? JSON.parse(storageStr) : null;
                phoneNumber = this.objectUtils.getParamFromObject(storageObj, paramArr.join('.'));
            }
            // phoneNumber是否为11位或者32位 （兼容趣医APP的aes-ecb加密）
            if (phoneNumber && phoneNumber.length == 11) {
                return phoneNumber;
            } else if (phoneNumber && phoneNumber.length == 32) {
                let aesjs = this.objectUtils.getParamFromObject(window, 'aesjs');
                if (aesjs) {
                    return this.aesDecrypt(aesjs, phoneNumber);
                }
            } else {
                return null;
            }
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

    /**
     * 生成UUID
     * 
     * @param {number} [len] 默认长度为8
     * @returns {string} 
     * @memberof Common
     */
    public createUUID(len?: number): string {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [];
        len = len || 8;
        for (let i = 0; i < len - 3; i++) {
            let idx = Math.floor(Math.random() * chars.length);
            uuid[i] = chars[idx];
        }
        // 取时间后三位毫秒数作为uuid后三位
        let time = Date.now().toString();
        uuid = uuid.concat(time.substr(10).split(''));
        return uuid.join('');
    }

    /**
     * 根据key获取URL中的查询参数
     * 
     * @param {string} url 
     * @param {string} queryKey 
     * @returns 
     * @memberof Common
     */
    public getUrlQueryParam(url: string, queryKey: string) {
        let urlParts = url.split('?');
        if (!urlParts || urlParts.length < 2) {
            return '';
        }
        let queryStr = urlParts[1];
        if (queryStr.indexOf(queryStr) == -1) {
            return '';
        }
        let reg = new RegExp(queryKey + '=([\\w%\\.]*)&?');
        let regRes = reg.exec(queryStr);
        if (!regRes || regRes.length < 2) {
            return '';
        }
        return regRes[1];
    }

    /**
     * aes-ecb解码
     * 
     * @private
     * @param {*} aesjs 
     * @param {string} str 
     * @returns 
     * @memberof Common
     */
    private aesDecrypt(aesjs: any, str: string) {
        // AES-ECB解密模式
        let key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
        let aesEcb = new aesjs.ModeOfOperation.ecb(key);
        let encryptedBytes = aesjs.utils.hex.toBytes(str);
        let decryptedBytes = aesEcb.decrypt(encryptedBytes);
        // 判断是否包含padding
        let lastChar = decryptedBytes[decryptedBytes.length - 1];
        let isPadding = false;
        if (lastChar < 16 && lastChar > 0) {
            isPadding = true;
            let tmpLen = decryptedBytes.length - 1;
            for (let i = 1; i < lastChar; i++) {
                if (decryptedBytes[tmpLen - i] != lastChar) {
                    isPadding = false;
                    break;
                }
            }
        }
        if (isPadding) {
            let resArr = new Uint8Array(decryptedBytes.length - lastChar);
            resArr.set(decryptedBytes.subarray(0, decryptedBytes.length - lastChar), 0);
            decryptedBytes = resArr;
        }
        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
}
