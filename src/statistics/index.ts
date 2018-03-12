import { Config } from './../config/index';
import { Http, Common, Env } from './../utils';
import { Clairvoyant } from '../exception/index';

export interface SkyeConfig {
    active: string;
    phoneKey?: string;
}

export class Skye {
    private appId: string;          // 应用号
    private appVersion: string;     // 应用版本号
    
    private active = false;         // 使能开关
    private phoneKey = '';          // 手机缓存位置

    private options: any;           // SDK相关配置从信息
    private recordStack: any[] = []; // 用于记录点击事件数据

    private params: any = {};       // 记录标签上绑定的属性和参数
    private time: number;           // 记录上一次点击事件发生时间

    private commonService: Common = new Common();
    private httpService: Http = new Http();

    constructor(
        appId: string,
        appVersion?: string
    ) {
        this.options = {
            selector: '_kyee_statistics', // 点击触发的选择器，支持id, class
            prefix: '_kyee_',           // 定义标签参数的前缀
            delay_attr: '_kyee_delay',  // 标签中指定是否延迟上报, ture延时,false立即上报，默认true
            limit: 10
        };
        this.appId = appId;
        this.appVersion = appVersion || (localStorage && localStorage.appVersion) || 'Unknown';
        this.time =  Date.now();
        // 启动初始化
        this.initMonitor();
    }

    /**
     * 修改配置参数
     * 
     * @param {*} conf 
     * @memberof Skye
     */
    public setOptions(conf: any): void {
        try {
            if (typeof conf != 'object') {
                return;
            }
            for (let item in conf) {
                if (conf.hasOwnProperty(item)) {
                    this.options[item] = conf[item];
                }
            }
        } catch (e) {
            console.error('Error', '修改统计组件参数失败');
        }
    }

    /**
     * SDK配置参数设置
     * 
     * @param {SkyeConfig} configParams 
     * @memberof Skye
     */
    public config(configParams: SkyeConfig): void {
        // 设置静默开关
        this.active = (configParams['active'] && configParams['active'] == '1') ? true : false;     // 默认为false，即不开启异常上报，采用静默模式
        // 设置手机号位置信息
        this.phoneKey = configParams['phoneKey'] || '';
    }

    /**
     * 自定义记录
     * 
     * @param {*} param 
     * @returns 
     * @memberof Skye
     */
    public customRecord(param: any) {
        if (!param || typeof param != 'object') {
            return;
        }
        this.addRecord(param);
    }

    /**
     * 初始化监控器
     * 
     * @private
     * @memberof Skye
     */
    private initMonitor(): void {
        let bodyEle = document.getElementsByTagName('body')[0];
        let _self = this;
        // 在<body>标签上绑定点击事件
        this.delegate(bodyEle, 'click', (eventObj: Node) => {
            // 连续点击限制
            if (Date.now() - _self.time < 200) {
                return;
            }
            this.time = Date.now();
            let param = this.getAttrParam(eventObj);    // 获取标签参数
            this.addRecord(param);     // 添加事件记录
        });

        // 在即将离开当前页面（刷新或关闭）时触发,将未发送的数据立即上报
        window.onbeforeunload = () => {
            this.sendData();
        };
    }

    /**
     * 获取埋点标签上绑定的业务参数
     * 
     * @private
     * @param {Node} clickObj 
     * @memberof Skye
     */
    private getAttrParam(clickObj: Node): any {
        let params: any =  {};
        let options = this.options;
        if (clickObj && clickObj.attributes) {
            let attrs = clickObj.attributes;
            for (let i = 0; i < attrs.length; i++) {
                let name = attrs[i].name;
                if (name.indexOf(options.prefix) == 0) {
                    if (name == options.delay_attr && attrs[i].value === 'false') {
                        params['delay'] = false;
                        continue;
                    }
                    name = name.replace(options.prefix, '');
                    let value = attrs[i].value;
                    params[name] = value;
                }
            }
        }
        return params;
    }

    /**
     * 添加点击事件记录
     * 
     * @private
     * @param {*} param 
     * @memberof Skye
     */
    private addRecord(param: any) {
        // 记录关键属性值
        let nodeId = param.id;
        let delay: boolean = param.delay;   // false为立即上报
        // 删除已记录的属性
        delete param.id;
        delete param.delay;
        // 添加记录到记录栈中
        this.recordStack.push({
            anchorId: nodeId,
            time: this.time,
            param: JSON.stringify(param)
        });

        // 如果是需要立即发送的记录
        if (delay === false) {
            this.sendData();
        }
    }

    /**
     * 构建请求日志
     * 
     * @private
     * @returns {string} 
     * @memberof Skye
     */
    private buildTopic(): string {
        let topic = {
            appId: this.appId,
            appVersion: this.appVersion,
            phoneNumber: this.commonService.getPhoneNumber(this.phoneKey),
            record: this.recordStack
        };
        return JSON.stringify(topic);
    }

    /**
     * 发送记录日志
     * 
     * @private
     * @param {Function} [feedback] 
     * @memberof Skye
     */
    private sendData(feedback?: Function): void {
        if (this.recordStack && this.recordStack.length > 0) {
            // 生成记录日志
            let topic = this.buildTopic();
            // 清空记录栈
            this.recordStack = [];
            // 拼接后台接口URL
            let url = Config.SERVER_URL + Config.STATISTICS_INTERFACE;
            // 发送请求
            Promise.resolve(this.httpService.postRequest(url, topic)).then((resp) => {
                if (feedback) { feedback(resp); }
            });
        }
    }

    /**
     * 事件代理
     * 
     * @param {string} parentId 代理元素的id
     * @param {string} type     代理事件的类型
     * @param {string} selector 被代理元素的选择器
     * @param {Function} fn     事件处理函数
     * @returns {void}
     * @memberof Common
     */
    private delegate(parentEle: HTMLElement, type: string, fn: Function): void {
        // 入参校验
        if ( (typeof type !== 'string') || (typeof fn !== 'function')) {
            return;
        }
        if (parentEle && document.addEventListener) {
            // 添加事件监听
            parentEle.addEventListener(type, (e) => {
                // 获取event对象
                let evt = e ? e : window.event;
                // 获取触发事件的原始事件源
                let target: any = this.getMonitorNode(evt);
                // 执行事件处理函数
                if (target) {
                    fn(target);
                }
            }, false);
        }
    }

    /**
     * 获取事件触发的路径
     * 
     * @private
     * @param {*} evt 事件对象
     * @returns 
     * @memberof Skye
     */
    private eventPath(evt: any) {
        // Chrome通过event.path直接获取
        let path = (evt.composedPath && evt.composedPath()) || evt.path;
        // 获取触发事件的原始事件源
        let target = evt.target || evt.srcElement;

        if (path != null) {
            // Safari doesn't include Window, but it should.
            return (path.indexOf(window) < 0) ? path.concat(window) : path;
        }
        if (target === window) {
            return [window];
        }
        return [target].concat(this.getParents(target), window);
    }

    /**
     * 获取父节点
     * 
     * @private
     * @param {Node} node 当前节点
     * @param {Node[]} [memo] 节点记录栈
     * @returns {Node[]} 
     * @memberof Skye
     */
    private getParents(node: Node, memo?: Node[]): Node[] {
        memo = memo || [];
        let parentNode = node.parentNode;
        if (!parentNode) {
            return memo;
        } else {
            return this.getParents(parentNode, memo.concat(parentNode));
        }
    }

    /**
     * 获取监控的目标节点
     * 
     * @private
     * @param {*} evt 事件对象
     * @returns {Node}
     * @memberof Skye
     */
    private getMonitorNode(evt: any): Node {
        let path = this.eventPath(evt);
        let target;
        for (let i = 0; i < path.length; i++) {
            if (path[i].tagName.toLowerCase() === 'body') {
                break;
            }
            if (path[i].id === this.options.selector || path[i].className.indexOf(this.options.selector) != -1) {
                target = path[i];
                break;
            }
        }
        return target;
    }
}
