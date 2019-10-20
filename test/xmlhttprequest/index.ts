import ajaxProxy from '../../src/index'

const { proxyAjax, unProxyAjax } = ajaxProxy

proxyAjax({
  open: function(args, xhr) {
    console.log(args)
  },
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
  console.log(this.response)
}

proxyedXhr.open('GET', 'http://localhost:8080/base', true)

proxyedXhr.send()

unProxyAjax()

// let pureXhr = new XMLHttpRequest()

// pureXhr.onload = function() {
//   console.log(this.response)
// }

// pureXhr.open('GET', 'http://localhost:8080/base', true)

// pureXhr.send()
