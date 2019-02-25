# CORS middleware for Micro

### Summary

Simple [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) middleware for Zeit's [Micro](https://github.com/zeit/micro)

[![CircleCI](https://circleci.com/gh/possibilities/micro-cors.svg?style=svg)](https://circleci.com/gh/possibilities/micro-cors)

###### We're working on [`v1`](https://github.com/possibilities/micro-cors/issues/51), come help us out.

### Install

```
yarn add micro-cors
```

### Usage

Basic

```js
const { send } = require('micro')
const cors = require('micro-cors')()
const handler = (req, res) => send(res, 200, 'ok!')

module.exports = cors(handler)
```

Since the current version of micro-cors only set headers to the response (`res`) you have do some manual work. Lets say you only want to handle a POST request:

```js
const { send } = require('micro')
const cors = require('micro-cors')()
const handler = (req, res) => {
  if (req.method !== 'OPTIONS') {
    return send(res, 200, 'ok!');
  }

  if (req.method !== 'POST') {
    throw createError(404, 'Not Found');
  }

  // handle incoming request as usual

}

module.exports = cors(handler)
```

With options

```js
const { send } = require('micro')
const microCors = require('micro-cors')
const cors = microCors({ allowMethods: ['PUT', 'POST'] })
const handler = (req, res) => send(res, 200, 'ok!')

module.exports = cors(handler)
```

#### Options

##### `allowMethods`

default: `['POST','GET','PUT','PATCH','DELETE','OPTIONS']`

##### `allowHeaders`

default: `['X-Requested-With','Access-Control-Allow-Origin','X-HTTP-Method-Override','Content-Type','Authorization','Accept']`

##### `allowCredentials`

default: `true`

##### `exposeHeaders`

default: `[]`

##### `maxAge`

default: `86400`

##### `origin`

default: `*`
