/**
 * @description Ajax hook refactor by es6 proxy.
 * @author Lazy Duke
 * @email weiguocai.fzu@gmail.com
 * @class AjaxProxy
 */
class AjaxProxy {
  private RealXMLHttpRequest: typeof XMLHttpRequest
  private revoke: () => void = () => {}

  public proxyAjax = (proxyMap: ProxyMap) => {
    if (proxyMap == null) {
      throw new TypeError('proxyMap can not be undefined or null')
    }

    this.RealXMLHttpRequest =
      this.RealXMLHttpRequest || window['XMLHttpRequest']

    const that = this

    const { proxy, revoke } = Proxy.revocable(this.RealXMLHttpRequest, {
      construct(Target) {
        const xhr = new Target()
        const xhrProxy = new Proxy(xhr, {
          get(target, p, receiver) {
            let type = ''
            try {
              type = typeof target[p]
              if (type !== 'function') {
                const v = that.hasOwnProperty(`_${p.toString()}`)
                  ? that[`_${p.toString()}`]
                  : target[p]
                const attrGetterProxy = (proxyMap[p] || {})['getter']
                return (
                  (typeof attrGetterProxy === 'function' &&
                    attrGetterProxy.call(target, v, receiver)) ||
                  v
                )
              }

              return (...args) => {
                let newArgs = args
                if (proxyMap[p]) {
                  const result = proxyMap[p].call(target, args, receiver)
                  if (result === true) {
                    return
                  }
                  if (result) {
                    newArgs =
                      typeof result === 'function'
                        ? result.call(target, ...args)
                        : result
                  }
                }
                return target[p].call(target, ...newArgs)
              }
            } catch (error) {
              console.error(error)
              return target[p]
            }
          },
          set(target, p, value, receiver) {
            let type = ''
            try {
              type = typeof target[p]
              if (type === 'function') {
                throw new Error(
                  `${p.toString()} in XMLHttpRequest can not be reseted`
                )
              }

              if (typeof proxyMap[p] === 'function') {
                target[p] = () => {
                  proxyMap[p].call(target, receiver) || value.call(receiver)
                }
              } else {
                const attrSetterProxy = (proxyMap[p] || {})['setter']
                try {
                  target[p] =
                    (typeof attrSetterProxy === 'function' &&
                      attrSetterProxy.call(target, value, receiver)) ||
                    (typeof value === 'function' ? value.bind(receiver) : value)
                } catch (error) {
                  if (attrSetterProxy === true) {
                    that[`_${p.toString()}`] = value
                  } else {
                    throw error
                  }
                }
              }
            } catch (error) {
              throw error
            }
            return true
          }
        })
        return xhrProxy
      }
    })

    window['XMLHttpRequest'] = proxy
    this.revoke = revoke
    return this.RealXMLHttpRequest
  }

  public unProxyAjax = () => {
    this.revoke()
    this.revoke = () => {}
    if (this.RealXMLHttpRequest) {
      window['XMLHttpRequest'] = this.RealXMLHttpRequest
    }
    this.RealXMLHttpRequest = undefined
  }
}

const ajaxProxy = new AjaxProxy()

export default ajaxProxy

export interface ProxyMap {
  readyState?: AttrProxy<number>
  response?: AttrProxy<any>
  responseText?: AttrProxy<string>
  responseType?: AttrProxy<XMLHttpRequestResponseType>
  responseURL?: AttrProxy<string>
  responseXML?: AttrProxy<Document | null>
  status?: AttrProxy<number>
  statusText?: AttrProxy<string>
  timeout?: AttrProxy<number>
  withCredentials?: AttrProxy<boolean>
  upload?: AttrProxy<XMLHttpRequestUpload>
  UNSENT?: AttrProxy<number>
  OPENED?: AttrProxy<number>
  HEADERS_RECEIVED?: AttrProxy<number>
  LOADING?: AttrProxy<number>
  DONE?: AttrProxy<number>

  onreadystatechange?: (xhr: FullWritableXMLHTTPRequest) => void
  onabort?: (xhr: FullWritableXMLHTTPRequest) => void
  onerror?: (xhr: FullWritableXMLHTTPRequest) => void
  onload?: (xhr: FullWritableXMLHTTPRequest) => void
  onloadend?: (xhr: FullWritableXMLHTTPRequest) => void
  onloadstart?: (xhr: FullWritableXMLHTTPRequest) => void
  onprogress?: (xhr: FullWritableXMLHTTPRequest) => void
  ontimeout?: (xhr: FullWritableXMLHTTPRequest) => void

  open?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  abort?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  getAllResponseHeaders?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  getResponseHeader?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  overrideMimeType?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  send?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  setRequestHeader?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  addEventListener?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  removeEventListener?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
}

export interface AttrProxy<T> {
  setter?: boolean | SetGetFn<T>
  getter?: boolean | SetGetFn<T>
}

export interface SetGetFn<T> {
  (this: XMLHttpRequest, value: T, xhr: XMLHttpRequest): T
}

export type FullWritableXMLHTTPRequest = XMLHttpRequestUpload & WtritableAttrs
export interface WtritableAttrs {
  readyState: number
  response: any
  responseText: string
  responseURL: string
  responseXML: Document | null
  status: number
  statusText: string
  upload: XMLHttpRequestUpload
  DONE: number
  HEADERS_RECEIVED: number
  LOADING: number
  OPENED: number
  UNSENT: number
}
