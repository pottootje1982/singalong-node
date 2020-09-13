import express = require('express')
import * as core from 'express-serve-static-core'

const router = () => {
  const expressRouter = express.Router()
  return new CatchRouter(expressRouter)
}

class CatchRouter {
  private expressRouter: core.Router

  wrapper = (fn) => (...args) =>
    fn(...args).catch((err) => {
      let res = args[1]
      console.log(err)
      if (err.statusCode) {
        res = res.status(err.statusCode)
      }
      res.json(err)
    })

  constructor(expressRouter: core.Router) {
    this.expressRouter = expressRouter
  }

  get(path, requestHandler) {
    this.expressRouter.get(path, this.wrapper(requestHandler))
  }

  put(path, requestHandler) {
    this.expressRouter.put(path, this.wrapper(requestHandler))
  }

  post(path, requestHandler) {
    this.expressRouter.post(path, this.wrapper(requestHandler))
  }

  delete(path, requestHandler) {
    this.expressRouter.delete(path, this.wrapper(requestHandler))
  }

  express() {
    return this.expressRouter
  }
}

module.exports = router
