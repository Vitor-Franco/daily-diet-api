import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import { feedRoutes } from './routes/feeds'
import { userRoutes } from './routes/users'

const app = fastify()

app.addHook('preHandler', async (request, reply) => {
  console.log(`[${request.method}] ${request.url}`)
})

app.register(fastifyCookie)
app.register(userRoutes, {
  prefix: 'users',
})

app.register(feedRoutes, {
  prefix: 'feeds',
})

export { app }
