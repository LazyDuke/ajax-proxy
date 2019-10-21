import ajaxProxy from '../../src/index'

const { proxyAjax, unProxyAjax } = ajaxProxy

sumTestCase()

async function sumTestCase() {
  await testCase1()
  await testCase2()
  try {
    await testCase3()
  } catch (error) {
    console.error('case 3.拦截 open 方法，并终止: ', error.message)
  }
  await testCase4()
  await testCase5()
}

/**
 * case 1.拦截 open 方法
 */
async function testCase1() {
  return new Promise(resolve => {
    proxyAjax({
      open: function(args, xhr) {
        console.log('case 1.拦截 open 方法: ', args)
      }
    })

    let proxyedXhr1 = new XMLHttpRequest()

    proxyedXhr1.open('GET', 'http://localhost:8080/base', true)

    proxyedXhr1.onload = function() {
      unProxyAjax()
      resolve()
    }
    proxyedXhr1.send()
  })
}

/**
 * case 2.拦截 open 方法，改变传参
 */
async function testCase2() {
  return new Promise(resolve => {
    proxyAjax({
      open: function(args, xhr) {
        return ['POST'].concat(args.slice(1, 3))
      }
    })

    let proxyedXhr2 = new XMLHttpRequest()

    proxyedXhr2.open('GET', 'http://localhost:8080/base', true)

    proxyedXhr2.onload = function() {
      console.log('case 2.拦截 open 方法，改变传参: ', this.response)
      unProxyAjax()
      resolve()
    }

    proxyedXhr2.send()
  })
}

/**
 * case 3.拦截 open 方法，并终止
 */
async function testCase3() {
  return new Promise((resolve, reject) => {
    proxyAjax({
      open: function(args, xhr) {
        return true
      }
    })

    let proxyedXhr3 = new XMLHttpRequest()

    proxyedXhr3.open('GET', 'http://localhost:8080/base', true)

    proxyedXhr3.onload = function() {
      resolve()
    }

    try {
      proxyedXhr3.send()
      unProxyAjax()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 4.拦截 onload 事件
 */

async function testCase4() {
  return new Promise(resolve => {
    proxyAjax({
      onload: function(xhr) {
        console.log('case 4.拦截 onload 事件: ', xhr.response)
      }
    })

    let proxyedXhr4 = new XMLHttpRequest()

    proxyedXhr4.open('GET', 'http://localhost:8080/base', true)

    proxyedXhr4.onload = function() {
      console.log('       拦截 onload 事件: onload triggered')
      unProxyAjax()
      resolve()
    }

    proxyedXhr4.send()
  })
}

/**
 * case 5.拦截 onload 事件，修改 response
 */
async function testCase5() {
  return new Promise(resolve => {
    proxyAjax({
      onload: function(xhr) {
        xhr.response = JSON.parse(this.response)
      },
      response: {
        setter: true
      }
    })

    let proxyedXhr5 = new XMLHttpRequest()

    proxyedXhr5.open('GET', 'http://localhost:8080/base', true)

    proxyedXhr5.onload = function() {
      console.log(
        'case 5.拦截 onload 事件 和 response，修改 response: ',
        this.response
      )
      unProxyAjax()
      resolve()
    }

    proxyedXhr5.send()
  })
}

// /**
//  * case 2.拦截 response 属性
//  */
// proxyAjax({
//   response: {
//     getter: function(value, xhr) {
//       try {
//         return JSON.parse(value)
//       } catch (error) {}
//     }
//   }
// })

// let proxyedXhr = new XMLHttpRequest()

// proxyedXhr.onload = function() {
//   console.log('case 2: ', this.response)
// }

// proxyedXhr.open('GET', 'http://localhost:8080/base', true)

// proxyedXhr.send()

// unProxyAjax()

// let pureXhr = new XMLHttpRequest()

// pureXhr.onload = function() {
//   console.log(this.response)
// }

// pureXhr.open('GET', 'http://localhost:8080/base', true)

// pureXhr.send()
