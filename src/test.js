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
      ...testRequestOptions,
      url,
      method
    })

    if (method === 'OPTIONS') {
      const maxAgeHeader = response.headers['access-control-max-age']
      t.is(maxAgeHeader, '86400')
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
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  const maxAgeHeader = response.headers['access-control-max-age']
  t.is(maxAgeHeader, 'foo')
})

test('adds default allow origin header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, '*')
  }
})

test('adds configured allow origin header', async t => {
  const cors = microCors({ origin: 'BAZ' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, 'BAZ')
  }
})

test('adds default allow methods header only for OPTIONS request', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    if (method === 'OPTIONS') {
      const allowMethodsHeader = response.headers['access-control-allow-methods']
      t.is(allowMethodsHeader, 'POST,GET,PUT,PATCH,DELETE,OPTIONS')
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
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  const allowMethodsHeader = response.headers['access-control-allow-methods']
  t.is(allowMethodsHeader, 'FOO')
})

test('adds default allow headers header only for OPTIONS request', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    if (method === 'OPTIONS') {
      const allowMethodsHeader = response.headers['access-control-allow-headers']
      t.is(
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
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  const allowMethodsHeader = response.headers['access-control-allow-headers']
  t.is(allowMethodsHeader, 'BAR')
})

test('allows configured expose headers header', async t => {
  const cors = microCors({ exposeHeaders: ['BAR'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const exposeMethodsHeader = response.headers['access-control-expose-headers']
    t.is(exposeMethodsHeader, 'BAR')
  }
})

test('adds allow credentials header by default', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowCredentialsHeader = response.headers['access-control-allow-credentials']
    t.is(allowCredentialsHeader, 'true')
  }
})

test('allows remove allow credentials header', async t => {
  const cors = microCors({ allowCredentials: false })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    t.false(Object.keys(response.headers).includes('access-control-allow-credentials'))
  }
})

test('responds to OPTIONS requests', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  const response = await request({
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  t.is(response.statusCode, 200)
  t.deepEqual(response.body, {})
})

test('has configuration to prevent handler from running on OPTIONS request', async t => {
  const cors = microCors({ runHandlerOnOptionsRequest: false })
  let isInnerCalled = false
  const router = micro(cors((req, res) => {
    isInnerCalled = true
    res.end()
  }))
  const url = await listen(router)

  await request({
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  t.false(isInnerCalled)
})
