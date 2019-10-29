[中文简体](./README.md) | English

# ajax-proxy

[![npm version](https://img.shields.io/npm/v/@lazyduke/ajax-proxy)](https://www.npmjs.org/package/ajax-hook) [![GitHub](https://img.shields.io/github/license/LazyDuke/ajax-proxy)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/language-TypeScript-blue.svg) ![](https://img.shields.io/badge/support-%3E%3Des6-brightgreen.svg) [![npm bundle size](https://img.shields.io/bundlephobia/min/@lazyduke/ajax-proxy)](https://unpkg.com/@lazyduke/ajax-proxy/dist/index.min.js)

## Introduction

ajax-proxy is a repo which intercepts XMLHTTPRequest refactor by es6 Proxy.

## Usage

### Install

- Using CDN

```html
<script>
  https://unpkg.com/@lazyduke/ajax-proxy/dist/index.min.js
</script>
```

- Using NPM

  ```shell
  npm install @lazyduke/ajax-proxy
  ```

### API

ajax-proxy is very easy to use, it has only two methods called **proxyAjax** and **unProxyAjax**, you can get started quickly as long as you know of XMLHttpRequest.

#### proxyAjax(proxyMap)

- `proxyMap`: arguments object，`key` is the property or method which need to be intercepted, `value` is the intercepting function.

  - Normal property: `response`, `responseText`, `timeout`... those can intercept through **setter/getter**, we can easily set the `setter` of property to `true` while intercepting method to change some readonly property such as `response`.
    **Notice: `xhr` in args is the intercepted instance of XMLHttpRequest while `this` in args is the original instance of XMLHttpRequest.(if not using arrow function)**

    - intercept `response` (getter)

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

    - intercept `timeout` (setter)

    ```javascript
    proxyAjax({
      timeout: {
        setter: function (v, xhr) {
          return Math.max(v, 1000)
        }

    })
    ```

    - intercept `response` (setter) and `onload`

    ```javascript
    proxyAjax({
      response: {
        setter: true
      },
      onload: function(xhr) {
        try {
          /**
           * In the function which intercepts 'event' property，
           * only the property of this can be operate，
           * otherwise it will cause stack overlow.
           * (certainly do not use arrow function )
           */
          xhr.response = JSON.parse(this.response)
        } catch (error) {}
      }
    })
    ```

  - 'Event' property: `onload`, `onreadystatechange`... those can intercept through **getter**.
    **Notice: `xhr` in args is the intercepted instance of XMLHttpRequest while `this` in args is the original instance of XMLHttpRequest.(if not using arrow function)**

  ```javascript
  proxyAjax({
    onload: function(xhr) {
      // 进行一些代理操作
    }
  })
  ```

  - Method: `open`, `send`... those can intercept through **getter**.
    **Notice: 1.`args` is an array of original method's arguments, `xhr` is the intercepted instance of XMLHttpRequest while `this` is the original instance of XMLHttpRequest.(if not using arrow function)
    2.we can terminate intercept by returning value `true`, if an object is return, it will be the new arguments to pass**

    - intercept `open`

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // do some intercepting
      }
    })
    ```

    - intercept `open` and terminate it

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // do some intercepting
        return true
      }
    })
    ```

    - intercept `open` and pass new arguments

    ```javascript
    proxyAjax({
      open: function(args, xhr) {
        // do some intercepting
        function changeArgs(args) {
          // change args
        }
        return changeArgs(args)
        // also support function
        // return changeArgs
      }
    })
    ```

  - Management of request's context
    > Assume we want to share a variable in `open` and `onload`, `xhr` is the context object we can use.
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

### unProxyAjax

- Cancel the Proxy: Cancel intercepting original XMLHttpRequest object.

## Notice

- As for intercepting property, do not try to get access to any property of `xhr` in getter function as well as doing some assignment in setter function，just do all this operation in `this`.
- This repo require browser environment which support ES6 and Proxy object.

## Credits

Inspired by [Ajax-hook 原理解析](http://www.jianshu.com/p/7337ac624b8e) of [Ajax-hook](https://github.com/wendux/Ajax-hook).
