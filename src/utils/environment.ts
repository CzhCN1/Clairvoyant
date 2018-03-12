export class Env {

    /**
     * 获取浏览器用户代理信息
     *
     * @returns {string} 用户代理信息
     * @memberof Env
     */
    public getUserAgent(): string {
        return navigator.userAgent;
    }

    /**
     * 获取屏幕尺寸
     * 
     * @returns {string} 屏幕尺寸
     * @memberof Env
     */
    public getScreenSize(): string {
        return (window && window.screen && window.screen.width + '*' + window.screen.height) || 'Unknown';
    }

    /**
     * 获取浏览器类型
     *
     * @returns {string} 浏览器类型
     * @memberof Env
     */
    public getBrowserType(): string {
        let userAgent = this.getUserAgent();
        let browserType: string;
        if (/MicroMessenger/i.test(userAgent)) {
            browserType = 'WeChat';
        } else if (/Edge/i.test(userAgent)) {
            browserType = 'Edge';
        } else if (/Chrome/i.test(userAgent)) {
            browserType = 'Chrome';
        } else if (/Safari/i.test(userAgent)) {
            browserType = 'Safari';
        } else if (/Firefox/i.test(userAgent)) {
            browserType = 'Firefox';
        } else if (/MSIE/i.test(userAgent) || /Trident/i.test(userAgent)) {
            browserType = 'IE';
        } else if (/Opera/i.test(userAgent)) {
            browserType = 'Opera';
        } else {
            browserType = 'Unknown';
        }

        return browserType;
    }

    /**
     * 获取终端类型及操作系统信息
     *
     * @returns {any} 设备信息
     * @memberof Env
     */
    public getPlatformOs(): any {
        let regRes = /\((.+?)\)/.exec(navigator.userAgent); // 获取用户平台信息
        let platformInfo = (regRes && regRes[1]) || '';
        let infoArr = platformInfo.split('; ');

        // 终端类型  包括:iPhone iPad Mac Android WinPhone Windows Linux Unknown
        let platformType: string;
        let osVersion: any;             // 版本号
        let osType: string;             // 操作系统类型 包括: IOS OS_X Android Windows Linux Unknown
        if (infoArr && infoArr.length > 0) {
            if (/iPhone/i.test(infoArr[0])) {
                platformType = 'iPhone';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'IOS ' + (osVersion ? osVersion[0] : '');
            } else if (/iPad/i.test(infoArr[0])) {
                platformType = 'iPad';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'IOS' + (osVersion ? osVersion[0] : '');
            } else if (/Mac/i.test(infoArr[0])) {
                platformType = 'Mac';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'OS X ' + (osVersion ? osVersion[0] : '');
            } else if (/Linux/i.test(infoArr[0])) {
                platformType = 'Android';
                osVersion = /\d+([_\.]\d+)+/.exec(infoArr[1]);
                osType = 'Android ' + (osVersion ? osVersion[0] : '');
            } else if (/Windows Phone/i.test(platformInfo)) {
                platformType = 'Windows Phone';
                osVersion = /Windows Phone \d+([_\.]\d+)+/i.exec(platformInfo);
                osType = osVersion ? osVersion[0] : '';
            } else if (/Windows/i.test(this.getUserAgent())) {
                platformType = 'Windows';
                osVersion = /Windows NT \d+([_\.]\d+)+/i.exec(platformInfo);
                osType = osVersion ? this.windowsNt2Ver(osVersion[0]) : '';
            } else if (/X11/i.test(infoArr[0])) {
                platformType = 'Linux';
                osType = 'Linux';
            } else {
                platformType = 'Unknown';
                osType = 'Unknown';
            }
            osType = osType.replace(/_/g, '.');  // 统一版本号为数字+小数点
        } else {
            platformType = 'Unknown';
            osType = 'Unknown';
        }
        return {
            platformType: platformType,
            osType: osType
        };
    }

    /**
     * 通过域名判断是否为生产环境
     * 
     * @param {string[]} prodHostList 生产环境域名列表 location.host
     * @returns {boolean}  true: 生产环境 false: 非生产环境
     * @memberof Env
     */
    public isProdEnv(prodHostList: string[]): boolean {
        if (location && location.href.indexOf('localhost') != -1) {      // 如果包含localhost为非生产
            return false;
        } else if (location && location.protocol == 'file:') {           // 如果包含file则为生产环境  安卓 ios 外壳应用，因浏览器同源限制忽略本地打开的html文件
            return true;
        } else if (location && location.host) {                          // 如果host在生产环境列表内 则为生产环境
            let prodEnvHost = prodHostList;
            let curHost = location.host;
            return (prodEnvHost.indexOf(curHost) == -1) ? false : true;
        } else {
            return false;
        }
    }

    /**
     * Windows内核版本转为发行版本
     *
     * @private
     * @param {string} ntVersion 内核版本
     * @returns {string} 发行版本
     * @memberof Env
     */
    private windowsNt2Ver(ntVersion: string): string {
        let arr = ntVersion.split(' ');
        let version: string;
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
    }
}
