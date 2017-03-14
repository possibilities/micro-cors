import 'async-to-gen/register'
import 'babel-polyfill'

import test from 'ava'
import listen from 'test-listen'

import microCors from './index'
import micro, { send } from 'micro'
import request from 'request-promise'

const testRequestOptions = {
  json: true,
  // Otherwise request-promise just gives the body
  resolveWithFullResponse: true,
  // Don't reject messages that come back with error code (e.g. 404, 500s)
  simple: false,
}

const methods = [
  'POST',
  'GET',
  'PUT',
  'DELETE',
  'OPTIONS',
]

test('adds default max age header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const maxAgeHeader = response.headers['access-control-max-age']
    t.deepEqual(maxAgeHeader, '86400')
  }
})

test('adds configured max age header', async t => {
  const cors = microCors({ maxAge: 'foo' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const maxAgeHeader = response.headers['access-control-max-age']
    t.deepEqual(maxAgeHeader, 'foo')
  }
})

test('adds default allow origin header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
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
      ...testRequestOptions,
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, 'BAZ')
  }
})

test('adds allowed header when origin is a function', async t => {
  const cors = microCors({ origin: o => o === 'BAZ' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      headers: { Origin: 'BAZ' },
      ...testRequestOptions,
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, 'BAZ')
  }
})

test('adds allowed header when origin is a regex', async t => {
  const cors = microCors({ origin: /^BAZ$/ })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      headers: { Origin: 'BAZ' },
      ...testRequestOptions,
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, 'BAZ')
  }
})

test('adds allowed header when origin is an array', async t => {
  const cors = microCors({ origin: ['FOO', 'BAR', 'BAZ'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      headers: { Origin: 'BAZ' },
      ...testRequestOptions,
    })

    const allowOriginHeader =
      response.headers['access-control-allow-origin']
    t.deepEqual(allowOriginHeader, 'BAZ')
  }
})

test('adds default allow methods header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const allowMethodsHeader = response.headers['access-control-allow-methods']
    t.deepEqual(allowMethodsHeader, 'POST,GET,PUT,DELETE,OPTIONS')
  }
})

test('adds configured allow methods header', async t => {
  const cors = microCors({ allowMethods: ['FOO'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const allowMethodsHeader = response.headers['access-control-allow-methods']
    t.deepEqual(allowMethodsHeader, 'FOO')
  }
})

test('adds default allow headers header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const allowMethodsHeader = response.headers['access-control-allow-headers']
    t.deepEqual(
      allowMethodsHeader,
      'X-Requested-With,Access-Control-Allow-Origin,X-HTTP-Method-Override,Content-Type,Authorization,Accept'
    )
  }
})

test('adds configured allow headers header', async t => {
  const cors = microCors({ allowHeaders: ['BAR'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const allowMethodsHeader = response.headers['access-control-allow-headers']
    t.deepEqual(
      allowMethodsHeader,
      'BAR'
    )
  }
})

test('adds allow credentials header', async t => {
  const cors = microCors()
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      url,
      method,
      ...testRequestOptions,
    })

    const allowCredentialsHeader =
      response.headers['access-control-allow-credentials']
    t.deepEqual(allowCredentialsHeader, 'true')
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
    ...testRequestOptions,
  })

  t.deepEqual(200, response.statusCode)
  t.deepEqual({}, response.body)
})
