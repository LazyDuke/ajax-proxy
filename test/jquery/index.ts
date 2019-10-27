import $ from 'jquery'

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
  try {
    await testCase8()
  } catch (error) {
    console.log('case 8.不传参数(undefined):')
    console.error(error.message)
  }
  try {
    await testCase9()
  } catch (error) {
    console.log('case 9.传参数 null:')
    console.error(error.message)
  }
  await testCase10()
}

/**
 * case 0.未使用 proxAjax
 */
async function testCase0() {
  return new Promise(resolve => {
    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result) {
        console.log('case 0.未使用proxAjax: ', result)
        unProxyAjax()
        resolve()
      }
    })
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

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result) {
        unProxyAjax()
        resolve()
      }
    })
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

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result) {
        console.log('case 2.拦截 open 方法，改变传参: ', result)
        unProxyAjax()
        resolve()
      }
    })
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

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('header1', 'header1')
        xhr.setRequestHeader('header2', 'header2')
        xhr.setRequestHeader('header3', 'header3')
      },
      success: function(result, status, xhr) {
        console.log(
          'case 3.拦截 setRequestHeader，并添加headers: 修改后的全部 headers:',
          parseHeaders(xhr.getAllResponseHeaders())
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
    })
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

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      error: function(xhr, status, error) {
        unProxyAjax()
        reject(error)
      }
    })
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

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result) {
        console.log('       拦截 onload 事件: onload triggered')
        unProxyAjax()
        resolve()
      }
    })
  })
}

/**
 * case 6.拦截 onload 事件，修改 response
 */
async function testCase6() {
  return new Promise(resolve => {
    proxyAjax({
      onload: function(xhr) {
        xhr.responseText = '{"proxyed": true}'
      },
      responseText: {
        setter: true
      }
    })

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result, status, xhr) {
        console.log(
          'case 6.拦截 onreadystatechange 事件，修改 response: ',
          result
        )
        unProxyAjax()
        resolve()
      }
    })
  })
}

/**
 * case 7.拦截 responseText 属性
 */
async function testCase7() {
  return new Promise(resolve => {
    proxyAjax({
      responseText: {
        getter: function(value, xhr) {
          try {
            return '{"proxyed": true}'
          } catch (error) {}
        }
      }
    })

    $.ajax({
      url: TEST_URL,
      type: 'GET',
      success: function(result, status, xhr) {
        console.log('case 7.拦截 responseText 属性: ', result)
        unProxyAjax()
        resolve()
      }
    })
  })
}

/**
 * case 8.不传参数(undefined)
 */
async function testCase8() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 9.传参数 null
 */
async function testCase9() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax(null)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 10. 设置 responseText 不可改变后，拦截 responseText 属性并修改
 */
async function testCase10() {
  return new Promise((resolve, reject) => {
    proxyAjax({
      onload: function(xhr) {
        try {
          xhr.responseText = '{"proxyed": true}'
        } catch (error) {
          console.log(
            'case 10.设置 responseText 不可改变后，拦截 responseText 属性并修改:'
          )
          console.error(error.message)
        }
      },
      responseText: {
        setter: false
      }
    })

    $.ajax({
      url: TEST_URL,
      type: 'GET'
    })
  })
}
