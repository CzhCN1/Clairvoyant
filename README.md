KYEE-Clairvoyant
=====

Introduction
------------
前端监控SDK是面向集团前端项目提供的全业务监控工具包。

Features
--------
- UMD模式，支持各种接入方式
- 全面的js异常监控
- 点击量、访问量等业务统计
- 详细的用户行为记录

Installation
------------
1. 克隆git项目  
```
git clone git@git.kyeegroup.com:system-architecture/kyee-clairvoyant.git
```
2. 安装依赖
```shell
cd kyee-clairvoyant
npm install
```
3. 打包构建
```
npm run build
```
Import
------
### 资源引入
- CDN：https://cdn.kyeegroup.com/repository/private/kyee-web-monitor/1.0.0/kyee-clairvoyant.js
- NPM：kyee-clairvoyant

#### AngularJS/Ionic1
1. 引入SDK  
在index.html中引入script标签，也可以使用RequireJS等其他方式接入。
2. 初始化监控器  
在项目启动初始化完成时进行监控器初始化。
```typescript
if (KyeeMonitor) {
    new KyeeMonitor.FrontEndMonitor(APP-ID);
    localStorage.setItem('appVersion', AppConfig.VERSION);
}
```
3. 异常监控接入  
配置exceptionHandler，并在Bootstrap.js中引入依赖。  
参考资料：[AngularJS文档：$exceptionHandler](https://docs.angularjs.org/api/ng/service/$exceptionHandler)
```typescript
angular
    .moudle("kyee.framework.exception", [])
    .factory('$exceptionHandler', function() {
        return function(exception, cause) {
            console.error(exception);
            if (clairvoyant) {
                clairvoyant.handleError(exception);
            }
        }
    })
```
4. 路由监控接入  
配置 $rootScope 的路由监听，监听路由变化。  
```typescript
if (skye) {
    skye.routeRecord(location.hash.slice(1));
    // 监听路由变化
    $rootScope.$on('$stateChangeSuccess', function(event, target, currentHash) {
        skye.routeRecord(targetHash && ('/' + targetHash.name);
    })
}
```
#### Angular/Ionic2
1. 安装SDK  
安装前需要将npm源切换为集团私有服务器地址。
```shell
npm set registry http://139.129.204.228:4873/

npm install kyee-clairvoyant —-save
```
2. 初始化监控器  
在app.module.ts中进行初始化。
```typescript
import { NgModule, ErrorHandler } from '@angular/core';
import { FrontEndMonitor } from 'kyee-clairvoyant';
let monitor = new FrontEndMonitor(APP-ID);
```
3. 异常监控接入  
声明异常处理的类Clairvoyant并实现ErrorHandler，并在provider中定义ErrorHandler使用新类Clairvoyant。  
参考资料：[Angular 2文档：ErrorHandler](https://angular.io/api/core/ErrorHandler)
```typescript
export class Clairvoyant implements ErrorHandler {
    handlerError(err: any): void {
        monitior.clairvoyant.handleError(err);
        console.error(err);
    }
}

@NgModule({
    providers: [
        { provide: ErrorHandler, useClass: Clairvoyant }
    ],
    ...
```
4. 路由监控接入  
从route引入相关依赖，并接入路由跳转的监听。  
参考资料：[Angular 2文档：NavigationStart](https://angular.io/api/router/NavigationStart)
```typescript
import { Router, NavigationStart } from '@angular/router';

export class AppModule {
    constructor(
        private router: Router
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                monitor.skye.routeRecord(event.url);
            }
        })
    }
}
```

API
===
异常监控接口
----------
#### ***clairvoyant.handleError(Error)*** 异常捕获上报接口 
- 描述：该接口可以将主动捕获的错误发送到后台，可用于上报try...catch捕获的异常信息。（注意：若在try...catch中捕获的异常未抛出处理，SDK则无法捕获该错误。因此只能调该方法进行主动上报，否则会造成该异常信息丢失。）

- 入参：Error类型对象(包括：Error，SyntaxError，ReferenceError，RangeError，TypeError，URLError，EvalError)

- 入参类型：Error

- 用例：
```typescript
try {
    // 代码
} catch (err) {
    if (clairvoyant) {
        clairvoyant.handleError('请求返回数据为空');
    }
}
```
#### ***clairvoyant.customError(ErrorMsg)*** 自定义异常上报接口 
- 描述：该接口可以将异常描述信息进行包装上报，常用于非JS逻辑错误的业务异常上报。

- 入参：异常描述信息

- 入参类型：String

- 用例：
```typescript
if (clairvoyant) {
    clairvoyant.customError('请求返回数据为空');
}
```

行为监控接口
----------
#### ***skye.customRecord(param)*** 点击记录接口 
- 描述：通常点击记录是通过在HTML的DOM上进行埋点来做自动记录，但是在支持WebComponent的框架中难以对组件内的DOM埋点，因此提供该方法可以在点击事件的处理方法中进行手动记录点击事件。除此以外，还可以根据业务逻辑更自由的进行点击记录，而不是在HTML中写死的锚点ID。

- 入参：锚点对象

- 入参类型：
```
{
    id: String;			//  锚点ID，标记点击的对象
    delay: Boolean;		//  是否延长上报，默认true
}
```

- 用例：
```typescript
skye.customRecord({
    id: 'Login'
});
skye.customRecord({
    id: 'Quit',
    delay: false
});
```

#### ***skye.routeRecord(hash)*** 路由记录接口 
- 描述：该接口用于记录路由的变化信息，通常用于对接框架提供的路由变换接口。

- 入参：跳转后的路由Hash

- 入参类型：String

- 用例：
```typescript
skye.routeRecord('/home');
```

Documentation
-------------
详细文档：[点击查看](http://2060nexus.oss-cn-qingdao.aliyuncs.com/docs/%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E/%E5%89%8D%E7%AB%AF%E7%9B%91%E6%8E%A7%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.pdf)

License
-------
MIT
