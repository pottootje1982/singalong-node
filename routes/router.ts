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
      const res = args[1]
      console.log(res)
      res.status(err.statusCode).json(err)
    })

  constructor(expressRouter: core.Router) {
    this.expressRouter = expressRouter
  }

  get(path, requestHandler) {
    this.expressRouter.get(path, this.wrapper(requestHandler))
  }

  express() {
    return this.expressRouter
  }
}

module.exports = router
