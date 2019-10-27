import ajaxProxy from '../../src/index'

const { proxyAjax, unProxyAjax } = ajaxProxy

const TEST_URL = 'http://localhost:8080/base'

sumTestCase()

async function sumTestCase() {
  await testCase0()
  await testCase1()
  await testCase2()
  await testCase3()
  try {
    await testCase4()
  } catch (error) {
    console.log('case 4.拦截 open 方法，并终止:')
    console.error(error.message)
  }
  await testCase5()
  await testCase6()
  await testCase7()
  await testCase8()
  await testCase9()
  try {
    await testCase10()
  } catch (error) {
    console.log('case 10.不传参数(undefined):')
    console.error(error.message)
  }
  try {
    await testCase11()
  } catch (error) {
    console.log('case 11.传参数 null:')
    console.error(error.message)
  }
  try {
    await testCase12()
  } catch (error) {
    console.log('case 12.改变 XMLHttpRequest 的内建方法:')
    console.error(error.message)
  }
  try {
    await testCase13()
  } catch (error) {
    console.log('case 13. 设置 response 不可改变后，拦截 response 属性并修改:')
    console.error(error.message)
  }
}

/**
 * case 0.未使用 proxAjax
 */
async function testCase0() {
  return new Promise(resolve => {
    let pureXhr = new XMLHttpRequest()

    pureXhr.onload = function() {
      console.log('case 0.未使用proxAjax: ', this.response)
      resolve()
    }

    pureXhr.open('GET', TEST_URL, true)

    pureXhr.send()
  })
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

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onload = function() {
      unProxyAjax()
      resolve()
    }
    proxyedXhr.send()
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

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onload = function() {
      console.log('case 2.拦截 open 方法，改变传参: ', this.response)
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}

/**
 * case 3.拦截 setRequestHeader，改变headers
 */
async function testCase3() {
  return new Promise(resolve => {
    proxyAjax({
      setRequestHeader: function(args, xhr) {
        console.log(
          'case 3.拦截 setRequestHeader，并添加headers: 原来的 header:',
          args
        )
        const proxyedHeader = args.slice().map(arg => `proxyed${arg}`)
        console.log(
          'case 3.拦截 setRequestHeader，并添加headers: 改变后的 header:',
          proxyedHeader
        )
        return proxyedHeader
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.setRequestHeader('header1', 'header1')
    proxyedXhr.setRequestHeader('header2', 'header2')
    proxyedXhr.setRequestHeader('header3', 'header3')

    proxyedXhr.onload = function() {
      console.log(
        'case 3.拦截 setRequestHeader，并添加headers: 修改后的全部 headers:',
        parseHeaders(this.getAllResponseHeaders())
      )

      function parseHeaders(headers: string): any {
        let parsed = Object.create(null)
        if (!headers) {
          return parsed
        }

        headers.split('\r\n').forEach(line => {
          let [key, val] = line.split(':')
          key = key.trim().toLowerCase()
          if (!key) {
            return
          }
          if (val) {
            val = val.trim()
          }
          parsed[key] = val
        })

        return parsed
      }
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}

/**
 * case 4.拦截 open 方法，并终止
 */
async function testCase4() {
  return new Promise((resolve, reject) => {
    proxyAjax({
      open: function(args, xhr) {
        return true
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    try {
      proxyedXhr.send()
    } catch (error) {
      unProxyAjax()
      reject(error)
    }
  })
}

/**
 * case 5.拦截 onload 事件
 */
async function testCase5() {
  return new Promise(resolve => {
    proxyAjax({
      onload: function(xhr) {
        console.log('case 5.拦截 onload 事件: ', xhr.response)
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onload = function() {
      console.log('       拦截 onload 事件: onload triggered')
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}

/**
 * case 6.拦截 onload 事件，修改 response
 */
async function testCase6() {
  return new Promise(resolve => {
    proxyAjax({
      onload: function(xhr) {
        xhr.response = JSON.parse(this.response)
      },
      response: {
        setter: true
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onload = function() {
      console.log(
        'case 6.拦截 onload 事件 和 response，修改 response: ',
        this.response
      )
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}

/**
 * case 7.拦截 onreadystatechange 事件
 */
async function testCase7() {
  return new Promise(resolve => {
    proxyAjax({
      onreadystatechange: function(xhr) {
        console.log(
          'case 7.拦截 onreadystatechange 事件: readyState ',
          xhr.readyState
        )
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onreadystatechange = function() {}

    proxyedXhr.onload = function() {
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}

/**
 * case 8.拦截 response 属性
 */
async function testCase8() {
  return new Promise(resolve => {
    proxyAjax({
      response: {
        getter: function(value, xhr) {
          try {
            return JSON.parse(value)
          } catch (error) {}
        }
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.onload = function() {
      console.log('case 8.拦截 response 属性: ', this.response)
      unProxyAjax()
      resolve()
    }

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.send()
  })
}

/**
 * case 9.拦截 timeout
 */
async function testCase9() {
  return new Promise(resolve => {
    proxyAjax({
      timeout: {
        setter: function(value, xhr) {
          return Math.max(value, 1000)
        }
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.onload = function() {
      console.log('case 9.拦截 timeout: 500 ->', this.timeout)
      unProxyAjax()
      resolve()
    }

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.timeout = 500

    proxyedXhr.send()
  })
}

/**
 * case 10.不传参数(undefined)
 */
async function testCase10() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 11.传参数 null
 */
async function testCase11() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax(null)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 12.改变 XMLHttpRequest 的内建方法
 */
async function testCase12() {
  return new Promise((resolve, reject) => {
    proxyAjax({
      response: {
        setter: true
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    try {
      proxyedXhr.open = function() {}
    } catch (error) {
      unProxyAjax()
      reject(error)
    }
  })
}

/**
 * case 13. 设置 response 不可改变后，拦截 response 属性并修改
 */
async function testCase13() {
  return new Promise((resolve, reject) => {
    proxyAjax({
      onload: function(xhr) {
        try {
          xhr.response = JSON.parse(this.response)
        } catch (error) {
          reject(error)
        }
      },
      response: {
        setter: false
      }
    })

    let proxyedXhr = new XMLHttpRequest()

    proxyedXhr.open('GET', TEST_URL, true)

    proxyedXhr.onload = function() {
      unProxyAjax()
      resolve()
    }

    proxyedXhr.send()
  })
}
