import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

const app = new Hono()

app.use('/', serveStatic({ root: './static/' }))
app.get(
  '/assets/*',
  serveStatic({
    root: './static/assets',
    rewriteRequestPath: (path) =>
      path.replace(/^\/assets/, ''),
  })
)
const port = 3000
console.log(`server running at ${port}`)

serve({
  fetch: app.fetch,
  port: port
})