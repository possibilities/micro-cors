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
    for (var i = 0; i < allowedOrigin.length; ++i) {
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

const cors = (options = {}) => handler => (req, res, ...restArgs) => {
  const {
    origin = '*',
    maxAge = DEFAULT_MAX_AGE_SECONDS,
    allowMethods = DEFAULT_ALLOW_METHODS,
    allowHeaders = DEFAULT_ALLOW_HEADERS,
    allowCredentials = true,
    exposeHeaders = [],
    runHandlerOnOptionsRequest = false
  } = options

  const requestOrigin = req.headers.origin

  if (!requestOrigin) {
    return handler(req, res, ...restArgs)
  }

  if (origin === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (isString(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    const isAllowed = isOriginAllowed(requestOrigin, origin)
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    }
    res.setHeader('Vary', 'Origin')
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

  if (preFlight && !runHandlerOnOptionsRequest) {
    res.end()
  } else {
    return handler(req, res, ...restArgs)
  }
}

module.exports = cors
