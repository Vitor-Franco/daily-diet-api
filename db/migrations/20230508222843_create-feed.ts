import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('feeds', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description')
    table.timestamp('date').notNullable()
    table.boolean('is_on_diet')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('feeds')
}
