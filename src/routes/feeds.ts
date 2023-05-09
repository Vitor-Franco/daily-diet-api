import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function feedRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createTransactionBodySchema = z.object({
        name: z.string(),
        description: z.string().optional(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      })

      const { name, date, isOnDiet, description } =
        createTransactionBodySchema.parse(request.body)

      await knex('feeds').insert({
        id: crypto.randomUUID(),
        name,
        description,
        date: new Date(date).toISOString(),
        is_on_diet: isOnDiet,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const updateTransactionBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.coerce.date().optional(),
        isOnDiet: z.boolean().optional(),
      })

      const updateTransactionParamSchema = z.object({
        id: z.string(),
      })

      const { id } = updateTransactionParamSchema.parse(request.params)

      const { name, date, isOnDiet, description } =
        updateTransactionBodySchema.parse(request.body)

      await knex('feeds')
        .where({
          id,
          session_id: sessionId,
        })
        .update({
          name,
          description,
          date: new Date(date!).toISOString(),
          is_on_diet: isOnDiet,
        })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const deleteTransactionParamSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteTransactionParamSchema.parse(request.params)

      await knex('feeds')
        .where({
          id,
          session_id: sessionId,
        })
        .delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getTransactionParamSchema = z.object({
        id: z.string(),
      })

      const { id } = getTransactionParamSchema.parse(request.params)

      const [feeds] = await knex('feeds')
        .where({
          id,
          session_id: sessionId,
        })
        .select()

      return {
        feed: feeds,
      }
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const feeds = await knex('feeds').where('session_id', sessionId).select()

      return {
        feeds,
      }
    },
  )
}
