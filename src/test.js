import test from 'ava'
import listen from 'test-listen'

import microCors from './index'
import micro from 'micro'
import request from 'request-promise'

const testRequestOptions = {
  json: true,
  // Otherwise request-promise just gives the body
  resolveWithFullResponse: true,
  // Don't reject messages that come back with error code (e.g. 404, 500s)
  simple: false,
  headers: {
    origin: 'example.com'
  }
}

const methods = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

test('adds default access-control-max-age header only for OPTIONS request', async t => {
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

test('adds configured access-control-max-age header', async t => {
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

test('adds default access-control-allow-origin header', async t => {
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

test('adds configured access-control-allow-origin header', async t => {
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

test('adds default access-control-allow-methods header only for OPTIONS request', async t => {
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

test('adds configured access-control-allow-methods header', async t => {
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

test('adds default access-control-allow-headers header only for OPTIONS request', async t => {
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
      t.is(
        response.headers['access-control-allow-headers'],
        'X-Requested-With,Access-Control-Allow-Origin,X-HTTP-Method-Override,Content-Type,Authorization,Accept'
      )
    } else {
      t.false(Object.keys(response.headers).includes('access-control-allow-headers'))
    }
  }
})

test('adds configured access-control-allow-headers header', async t => {
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

test('allows configured access-control-expose-headers header', async t => {
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

test('adds access-control-allow-credentials header by default', async t => {
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

test('allows removal of access-control-allow-credentials header', async t => {
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

test('does not run handler on preflight request', async t => {
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

test('allows running handler on preflight request', async t => {
  const cors = microCors({ runHandlerOnPreflightRequest: true })
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

test('matches request origin against regexp', async t => {
  const cors = microCors({ origin: /example\.com$/ })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, testRequestOptions.headers.origin)
    t.is(response.headers['vary'], 'Origin')
  }
})

test('matches request origin against array of origin checks', async t => {
  const cors = microCors({
    origin: [/foo\.com$/, 'example.com']
  })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, 'example.com')
    t.is(response.headers['vary'], 'Origin')
  }
})

test('does not match request origin against array of invalid origin checks', async t => {
  const cors = microCors({
    origin: [/foo\.com$/, 'bar.com']
  })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, undefined)
    t.is(response.headers['vary'], 'Origin')
  }
})

test('can override origin', async t => {
  const cors = microCors({ origin: 'something-else.com' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    const allowOriginHeader = response.headers['access-control-allow-origin']
    t.is(allowOriginHeader, 'something-else.com')
  }
})

test('does not include Vary header for specific origins', async t => {
  const cors = microCors({ origin: 'example.com' })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    t.is(response.headers['vary'], undefined)
  }
})

test('includes Vary header for dynamic origins', async t => {
  const cors = microCors({ origin: ['foo.com', 'bar.com'] })
  const router = micro(cors(() => ({})))
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    t.is(response.headers['vary'], 'Origin')
  }
})

test('append Vary header', async t => {
  const cors = microCors({ origin: ['foo.com', 'bar.com'] })
  const router = micro(
    cors((req, res) => {
      res.setHeader('Vary', res.getHeader('Vary') + ',Foo')
      return {}
    })
  )
  const url = await listen(router)

  for (let method of methods) {
    const response = await request({
      ...testRequestOptions,
      url,
      method
    })

    if (method === 'OPTIONS') {
      t.is(response.headers['vary'], 'Origin')
    } else {
      t.is(response.headers['vary'], 'Origin,Foo')
    }
  }
})
