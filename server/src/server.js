import { criarApp } from './app.js'
import { config } from './lib/config.js'

criarApp().listen(config.port, () => {
  console.log(`Kultiva API em http://localhost:${config.port}  ·  documentação em http://localhost:${config.port}/docs`)
})
