const DEFAULT_ALLOW_METHODS = [
  'POST',
  'GET',
  'PUT',
  'DELETE',
  'OPTIONS',
]

const DEFAULT_ALLOW_HEADERS = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept',
]

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

const checkOrigin = (origin, allowed) => {
  if (Array.isArray(allowed)) return !!allowed.find(a => a === origin)
  if (typeof allowed === 'function') return allowed(origin)
  if (allowed instanceof RegExp) return allowed.test(origin)
  return !!allowed
}

const cors = options => {
  const {
    maxAge,
    origin = '*',
    allowHeaders,
    allowMethods,
  } = (options || {})

  return handler => (req, res) => {

    res.setHeader(
      'Access-Control-Max-Age',
      '' + (maxAge || DEFAULT_MAX_AGE_SECONDS)
    )

    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else if(checkOrigin(req.headers.origin, origin)) {
      res.setHeader(
        'Access-Control-Allow-Origin',
        req.headers.origin
      )
    }
    if (origin !== '*') res.setHeader('Vary', 'Origin')

    res.setHeader(
      'Access-Control-Allow-Methods',
      (allowMethods || DEFAULT_ALLOW_METHODS).join(',')
    )

    res.setHeader(
      'Access-Control-Allow-Headers',
      (allowHeaders || DEFAULT_ALLOW_HEADERS).join(',')
    )

    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      return {}
    }

    return handler(req, res)
  }
}

module.exports = cors
