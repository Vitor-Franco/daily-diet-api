import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      email: z.string().email(),
    })

    const { email } = createUserSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: sessionId,
      email,
    })

    return reply.status(201).send()
  })

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const feedsInsideDiet = await knex('feeds')
        .where({ session_id: sessionId, is_on_diet: true })
        .select()

      const feeds = await knex('feeds')
        .where({ session_id: sessionId })
        .select()

      const feedsOutsideDiet = await knex('feeds')
        .where({ session_id: sessionId, is_on_diet: false })
        .select()

      const allFeedsByDayInsideDiet = feedsInsideDiet.reduce((acc, feed) => {
        const [date] = new Date(feed.date).toISOString().split('T')

        if (!acc[date]) {
          acc[date] = 0
        }

        acc[date] += 1

        return acc
      }, {})

      return reply.status(200).send({
        insideDiet: feedsInsideDiet.length,
        outsideDiet: feedsOutsideDiet.length,
        total: feeds.length,
        dietByDay: allFeedsByDayInsideDiet,
      })
    },
  )
}
