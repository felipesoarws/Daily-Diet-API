import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary;
    table.text("name").notNullable;
    table.text("email").unique().notNullable;
    table.text("password").notNullable;
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable;
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}
