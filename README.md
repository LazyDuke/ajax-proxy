中文简体 | [English](./README.en-US.md)

# ajax-proxy

[![npm version](https://img.shields.io/npm/v/@lazyduke/ajax-proxy)](https://www.npmjs.org/package/ajax-hook) [![GitHub](https://img.shields.io/github/license/LazyDuke/ajax-proxy)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/language-TypeScript-blue.svg) ![](https://img.shields.io/badge/support-%3E%3Des6-brightgreen.svg) [![npm bundle size](https://img.shields.io/bundlephobia/min/@lazyduke/ajax-proxy)](https://unpkg.com/@lazyduke/ajax-proxy/dist/index.min.js)

## 简介

ajax-proxy 是一个用 ES6 中 Proxy 特性实现的用于代理原生对象 XMLHttpRequest 的库，它可以使你从底层对 XMLHttpRequest 进行操作。

## 使用

### 安装

- CDN 引入

```html
<script>
  https://unpkg.com/@lazyduke/ajax-proxy/dist/index.min.js
</script>
```

- NPM 引入

```shell
npm install @lazyduke/ajax-proxy
```

### API

ajax-proxy 使用起来十分简单，只有两个方法 **proxyAjax** 和 **unProxyAjax**，只要你对 XMLHttpRequest 有所了解，就能很快上手使用。

#### proxyAjax(proxyMap)

- `proxyMap`: 代理对象，`key` 为需要代理的 属性 或 方法, `value` 为具体的函数

  - 普通属性：`response`, `responseText`, `timeout`... 以上可以同过对 **读/写** 的操作进行代理，当代理 **写操作** 时，可以直接将值指定为 `true` 并配合 代理方法，对一些 **只读属性** 如 `response` 进行修改。**注意：参数中 `xhr` 是代理后的对象，而 `this` 则是 被代理的原始对象（如果不使用箭头函数）。**

    - 代理 `response` （读操作）

    ```javascript
    proxyAjax({
      response: {
        getter: function(value, xhr) {
          try {
            return JSON.parse(value)
          } catch (error) {}
        }
      }
    })
    ```

    - 代理 `timeout` （写操作）

    ```javascript
    proxyAjax({
      timeout: {
        setter: function (v, xhr) {
          //超时最短为1s，返回值为最终值。
          return Math.max(v, 1000)
        }

    })
    ```

    - 代理 `response` （写操作）和 `onload` 属性

    ```javascript
    proxyAjax({
      response: {
        setter: true
      },
      onload: function(xhr) {
        try {
          /**
           * 在“事件”属性的代理方法里，
           * 被操作的一定是 this 也就是 被代理的原始对象，
           * 否则会循环调用导致栈溢出，因此也不能使用箭头函数。
           */
          xhr.response = JSON.parse(this.response)
        } catch (error) {}
      }
    })
    ```

  - "事件"属性：`onload`, `onreadystatechange`... 以上可以通过对 **读** 的操作进行代理。**注意：参数中 `xhr` 是代理后的对象，而 `this` 则是 被代理的原始对象（如果不使用箭头函数）。**

  ```javascript
  proxyAjax({
    onload: function(xhr) {
      // 进行一些代理操作
    }
  })
  ```

  - 方法：`open`, `send`... 以上可以通过对 **读** 的操作进行代理。\*\*注意：
    1、参数中 `args` 是一个数组，数组的内容是其对应的原生方法的参数列表，`xhr` 是代理后的对象，而 `this` 则是 被代理的原始对象（如果不使用箭头函数）。

    2、代理方法的返回值如果是 `true` ，则可对方法进行终止，如果是一个对象或者方法，则当做新参数传入其对应的原生方法。\*\*

    - 代理 `open` 方法

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // 进行一些代理操作
      }
    })
    ```

    - 代理 `open` 方法，并终止

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // 进行一些代理操作
        return true
      }
    })
    ```

    - 代理 `open` 方法，传入新的参数

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // 进行一些代理操作
        function changeArgs(args) {
          // change args
        }
        return changeArgs(args)
        // 也支持返回方法
        // return changeArgs
      }
    })
    ```

  - 请求的上下文管理
    > 假设对于同一个请求，你需要在其 `open` 的拦截函数和 `onload` 回调中共享一个变量，但由于拦截的是全局 XMLHttpRequest 对象，所有网络请求会无次序的走到拦截的方法中，这时你可以通过 `xhr` 来对应请求的上下文信息。在上述场景中，你可以在 `open` 拦截函数中给 `xhr` 设置一个属性，然后在 `onload` 回调中获取即可。
    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        xhr.xxx = '...'
      },
      onload: function(xhr) {
        xhr.xxx // ‘...’
      }
    })
    ```

#### unProxyAjax

- 取消代理：取消对原生 XMLHttpRequest 对象的代理

## 注意

- 对于属性代理，为了避免循环调用导致的栈溢出，不可以在其 getter 拦截器中再读取其同名属性或在其 setter 拦截器中在给其同名属性赋值，需要在原有属性上进行改动是请对 this.xxx 进行操作。

- 本库需要在支持 ES6 的浏览器环境中运行，依赖特性 Proxy。

## 贡献

1.  将代码 clone 到本地
2.  在命令行中依次输入

    ```shell
    npm install
    npm test
    ```

    进行调试

## 感谢

在看 [Ajax-hook 原理解析](http://www.jianshu.com/p/7337ac624b8e) 时，受到 [Ajax-hook](https://github.com/wendux/Ajax-hook) 的启发，从脑中冒出可以用 Proxy 实现的想法，再到着手开发实现，加入些许新功能，一气呵成。
