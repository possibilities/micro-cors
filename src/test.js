import test from 'ava'
import listen from 'test-listen'

import microCors from './index'
import micro from 'micro'
import request from 'request-promise'

import 'babel-polyfill'

const testRequestOptions = {
  json: true,
  // Otherwise request-promise just gives the body
  resolveWithFullResponse: true,
  // Don't reject messages that come back with error code (e.g. 404, 500s)
  simple: false
}

const methods = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

test('adds default max age header only for OPTIONS request', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    if (method === 'OPTIONS') {
      const maxAgeHeader = response.headers['access-control-max-age']
      t.deepEqual(maxAgeHeader, '86400')
    } else {
      t.false(Object.keys(response.headers).includes('access-control-max-age'))
    }
  }
})

test('adds configured max age header', async t => {
  const cors = microCors({ maxAge: 'foo' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  const response = await request({
    url,
    method: 'OPTIONS',
    ...testRequestOptions
  })

  const maxAgeHeader = response.headers['access-control-max-age']
  t.deepEqual(maxAgeHeader, 'foo')
})

test('adds default allow origin header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, '*')
  }
})

test('adds configured allow origin header', async t => {
  const cors = microCors({ origin: 'BAZ' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, 'BAZ')
  }
})

test('adds default allow methods header only for OPTIONS request', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    if (method === 'OPTIONS') {
      const allowMethodsHeader = response.headers['access-control-allow-methods']
      t.deepEqual(allowMethodsHeader, 'POST,GET,PUT,PATCH,DELETE,OPTIONS')
    } else {
      t.false(Object.keys(response.headers).includes('access-control-allow-methods'))
    }
  }
})

test('adds configured allow methods header', async t => {
  const cors = microCors({ allowMethods: ['FOO'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  const response = await request({
    url,
    method: 'OPTIONS',
    ...testRequestOptions
  })

  const allowMethodsHeader = response.headers['access-control-allow-methods']
  t.deepEqual(allowMethodsHeader, 'FOO')
})

test('adds default allow headers header only for OPTIONS request', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    if (method === 'OPTIONS') {
      const allowMethodsHeader = response.headers['access-control-allow-headers']
      t.deepEqual(
        allowMethodsHeader,
        'X-Requested-With,Access-Control-Allow-Origin,X-HTTP-Method-Override,Content-Type,Authorization,Accept'
      )
    } else {
      t.false(Object.keys(response.headers).includes('access-control-allow-headers'))
    }
  }
})

test('adds configured allow headers header', async t => {
  const cors = microCors({ allowHeaders: ['BAR'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  const response = await request({
    url,
    method: 'OPTIONS',
    ...testRequestOptions
  })

  const allowMethodsHeader = response.headers['access-control-allow-headers']
  t.deepEqual(
    allowMethodsHeader,
    'BAR'
  )
})

test('allows configured expose headers header', async t => {
  const cors = microCors({ exposeHeaders: ['BAR'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    const exposeMethodsHeader = response.headers['access-control-expose-headers']
    t.deepEqual(
      exposeMethodsHeader,
      'BAR'
    )
  }
})

test('adds allow credentials header by default', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    const allowCredentialsHeader =
      response.headers['access-control-allow-credentials']
    t.deepEqual(allowCredentialsHeader, 'true')
  }
})

test('allows remove allow credentials header', async t => {
  const cors = microCors({ allowCredentials: false })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions
    })

    t.false(Object.keys(response.headers).includes('access-control-allow-credentials'))
  }
})

test('responds to OPTIONS requests', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)
  const method = 'OPTIONS'

  const response = await request({
    url,
    method,
    ...testRequestOptions
  })

  t.deepEqual(200, response.statusCode)
  t.deepEqual({}, response.body)
})
