import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import WebpackConfig from './webpack.config'

const app = express()
const complier = webpack(WebpackConfig)

app.use(
  webpackDevMiddleware(complier, {
    publicPath: '/__build__/',
    stats: {
      colors: true,
      chunks: false
    }
  })
)

app.use(webpackHotMiddleware(complier))

app.use(
  express.static(__dirname, {
    setHeaders(res) {
      res.cookie(
        'XSRF-TOKEN-D',
        Math.random()
          .toString(16)
          .slice(2)
      )
    }
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

const router = express.Router()

app.use(router)

registerBaseRouter()

const port = process.env.PORT || 8080

export default app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})

function registerBaseRouter() {
  const BASE_DATA = {
    data: [
      {
        id: 1,
        data: 'This is data 1'
      },
      {
        id: 2,
        data: 'This is data 2'
      },
      {
        id: 3,
        data: 'This is data 3'
      }
    ]
  }
  function generateBaseData(method: 'GET' | 'POST'): BaseData {
    return Object.assign(BASE_DATA, {
      method
    })
  }

  router.get('/base', function(req, res) {
    Object.keys(req.headers).forEach(headerKey => {
      if (/header/.test(headerKey)) {
        res.setHeader(headerKey, req.headers[headerKey])
      }
    })
    res.json(generateBaseData('GET'))
  })

  router.post('/base', function(req, res) {
    res.json(generateBaseData('POST'))
  })
}

interface BaseData {
  method: 'GET' | 'POST'
  data: Data[]
}

interface Data {
  id: number
  data: string
}
