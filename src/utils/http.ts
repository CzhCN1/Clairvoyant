interface HttpConfig {
    timeout?: number;
}

export class Http {
    private HttpConfig: HttpConfig;
    constructor() {
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

    public getRequest(url: string): Promise<any> {
        return new Promise<any>((resolve: any) => {
            const xhr = new XMLHttpRequest;
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(xhr.responseText);
                }
            };
            xhr.open('GET', url, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader('Content-Type', 'application/json');
            // 如果有超时时间
            if (this.HttpConfig && this.HttpConfig.timeout) {
                xhr.timeout = this.HttpConfig.timeout;
                xhr.ontimeout = () => xhr.abort();
            }
            xhr.send();
        });
    }

    /**
     * POST请求  请求头为application/json
     *
     * @param {string} url
     * @param {string} paramJson
     * @returns {Promise<any>}
     * @memberof Http
     */
    public postRequest(url: string, paramJson: string): Promise<any> {
        return new Promise<any>((resolve: any) => {
            const xhr = new XMLHttpRequest;
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve();
                }
            };
            xhr.open('POST', url, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader('Content-Type', 'application/json');
            // 如果有超时时间
            if (this.HttpConfig && this.HttpConfig.timeout) {
                xhr.timeout = this.HttpConfig.timeout;
                xhr.ontimeout = () => xhr.abort();
            }
            xhr.send(paramJson);
        });
    }

}
