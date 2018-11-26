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

test('adds default "access-control-max-age" header only for OPTIONS request', async t => {
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

test('adds configured "access-control-max-age" header', async t => {
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

test('adds default "access-control-allow-origin" header', async t => {
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

test('adds configured "access-control-allow-origin" header', async t => {
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

test('adds default "access-control-allow-methods" header only for OPTIONS request', async t => {
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

test('adds configured "access-control-allow-methods" header', async t => {
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

test('adds default "access-control-allow-headers" header only for OPTIONS request', async t => {
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

test('adds configured "access-control-allow-headers" header', async t => {
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

test('allows configured "access-control-expose-headers" header', async t => {
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

test('adds "access-control-allow-credentials" header by default', async t => {
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

test('allows to remove "access-control-allow-credentials" header', async t => {
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

test('responds to OPTIONS requests without running handler', async t => {
  const cors = microCors()
  let isHandlerCalled = false
  const router = micro(cors((req, res) => {
    isHandlerCalled = true
    res.end()
  }))
  const url = await listen(router)

  const response = await request({
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  t.is(response.statusCode, 200)
  t.false(isHandlerCalled)
})

test('allows to run handler on OPTIONS request', async t => {
  const cors = microCors({ runHandlerOnOptionsRequest: true })
  let isHandlerCalled = false
  const router = micro(cors((req, res) => {
    isHandlerCalled = true
    res.end()
  }))
  const url = await listen(router)

  await request({
    ...testRequestOptions,
    url,
    method: 'OPTIONS'
  })

  t.true(isHandlerCalled)
})
