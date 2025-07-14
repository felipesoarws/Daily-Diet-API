import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // name, description, date and hour, is in or not in diet

  await knex.schema.createTable("meals", (table) => {
    table.text("name").notNullable;
    table.text("email").notNullable;
    table.enum("is_on_diet", [true, false]).notNullable;
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable;
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
