const DEFAULT_ALLOW_METHODS = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

const DEFAULT_ALLOW_HEADERS = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
]

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

function isString (s) {
  return typeof s === 'string' || s instanceof String
}

function isOriginAllowed (origin, allowedOrigin) {
  if (Array.isArray(allowedOrigin)) {
    for (const i in allowedOrigin) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true
      }
    }
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin)
  }
  return false
}

function setVaryHeader (res, origin) {
  if (!isString(origin)) {
    if (res.getHeader('Vary')) {
      res.setHeader('Vary', res.getHeader('Vary') + ',Origin')
    } else {
      res.setHeader('Vary', 'Origin')
    }
  }
}

const cors = (options = {}) => handler => async (req, res, ...restArgs) => {
  const {
    origin = '*',
    maxAge = DEFAULT_MAX_AGE_SECONDS,
    allowMethods = DEFAULT_ALLOW_METHODS,
    allowHeaders = DEFAULT_ALLOW_HEADERS,
    allowCredentials = true,
    exposeHeaders = [],
    runHandlerOnPreflightRequest = false
  } = options

  if (!req.headers.origin) {
    return handler(req, res, ...restArgs)
  }

  if (isString(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    if (isOriginAllowed(req.headers.origin, origin)) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    }
  }

  if (allowCredentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  if (exposeHeaders.length) {
    res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
  }

  const preFlight = req.method === 'OPTIONS'
  if (preFlight) {
    res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
    res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
    res.setHeader('Access-Control-Max-Age', String(maxAge))
  }

  if (preFlight && !runHandlerOnPreflightRequest) {
    setVaryHeader(res, origin)
    res.end()
  } else {
    setVaryHeader(res, origin)
    const handlerResult = await handler(req, res, ...restArgs)
    return handlerResult
  }
}

module.exports = cors
