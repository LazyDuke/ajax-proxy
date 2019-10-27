import axios from 'axios'

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
  try {
    await testCase9()
  } catch (error) {
    console.log('case 9.不传参数(undefined):')
    console.error(error.message)
  }
  try {
    await testCase10()
  } catch (error) {
    console.log('case 10.传参数 null:')
    console.error(error.message)
  }
  await testCase11()
}

/**
 * case 0.未使用 proxAjax
 */
async function testCase0() {
  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      console.log('case 0.未使用proxAjax: ', res.data)
    })
}

/**
 * case 1.拦截 open 方法
 */
async function testCase1() {
  proxyAjax({
    open: function(args, xhr) {
      console.log('case 1.拦截 open 方法: ', args)
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      unProxyAjax()
    })
}

/**
 * case 2.拦截 open 方法，改变传参
 */
async function testCase2() {
  proxyAjax({
    open: function(args, xhr) {
      return ['POST'].concat(args.slice(1, 3))
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      console.log('case 2.拦截 open 方法，改变传参: ', res.data)
      unProxyAjax()
    })
}

/**
 * case 3.拦截 setRequestHeader，改变headers
 */
async function testCase3() {
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

  return axios
    .create({
      headers: {
        header1: 'header1',
        header2: 'header2',
        header3: 'header3'
      }
    })
    .get(TEST_URL)
    .then(res => {
      console.log(
        'case 3.拦截 setRequestHeader，并添加headers: 修改后的全部 headers:',
        res.headers
      )
      unProxyAjax()
    })
}

/**
 * case 4.拦截 open 方法，并终止
 */
async function testCase4() {
  proxyAjax({
    open: function(args, xhr) {
      return true
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      console.log('case 2.拦截 open 方法，改变传参: ', res.data)
    })
    .catch(error => {
      unProxyAjax()
      throw error
    })
}

/**
 * case 5.拦截 onreadystatechange 事件
 */
async function testCase5() {
  proxyAjax({
    onreadystatechange: function(xhr) {
      console.log(
        'case 5.拦截 onreadystatechange 事件: readyState ',
        xhr.readyState
      )
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      unProxyAjax()
    })
}

/**
 * case 6.拦截 onreadystatechange 事件，修改 response
 */
async function testCase6() {
  proxyAjax({
    onreadystatechange: function(xhr) {
      xhr.responseText = '{"proxyed": true}'
    },
    responseText: {
      setter: true
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      console.log(
        'case 6.拦截 onreadystatechange 事件，修改 response: ',
        res.data
      )
      unProxyAjax()
    })
}

/**
 * case 7.拦截 responseText 属性
 */
async function testCase7() {
  proxyAjax({
    responseText: {
      getter: function(value, xhr) {
        try {
          return '{"proxyed": true}'
        } catch (error) {}
      }
    }
  })

  return axios
    .create()
    .get(TEST_URL)
    .then(res => {
      console.log('case 7.拦截 responseText 属性: ', res.data)
      unProxyAjax()
    })
}

/**
 * case 8.拦截 timeout
 */
async function testCase8() {
  proxyAjax({
    timeout: {
      setter: function(value, xhr) {
        return Math.max(value, 1000)
      }
    }
  })

  return axios
    .create({
      timeout: 500
    })
    .get(TEST_URL)
    .then(res => {
      console.log(
        'case 8.拦截 timeout: ',
        res.config.timeout,
        '->',
        res.request.timeout
      )
      unProxyAjax()
    })
}

/**
 * case 9.不传参数(undefined)
 */
async function testCase9() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 10.传参数 null
 */
async function testCase10() {
  return new Promise((resolve, reject) => {
    try {
      proxyAjax(null)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * case 11. 设置 response 不可改变后，拦截 response 属性并修改
 */
async function testCase11() {
  proxyAjax({
    onreadystatechange: function(xhr) {
      if (this.readyState === 2) {
        try {
          xhr.response = '{"proxyed": true}'
        } catch (error) {
          console.log(
            'case 11.设置 response 不可改变后，拦截 response 属性并修改:'
          )
          console.error(error.message)
        }
      }
    },
    response: {
      setter: false
    }
  })

  return axios
    .create({
      timeout: 500
    })
    .get(TEST_URL)
}
