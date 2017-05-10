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

const cors = options => handler => (req, res) => {
  const {
    maxAge,
    origin,
    allowHeaders,
    allowMethods
  } = (options || {})

  res.setHeader(
    'Access-Control-Max-Age',
    '' + (maxAge || DEFAULT_MAX_AGE_SECONDS)
  )

  res.setHeader(
    'Access-Control-Allow-Origin',
    (origin || '*')
  )

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

module.exports = cors
