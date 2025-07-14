import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // name, description, date and hour, is in or not in diet

  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.text("name").notNullable;
    table.text("description").notNullable;
    table.text("hour").notNullable;
    table.text("date").notNullable;
    table.boolean("is_on_diet").notNullable;
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // linkar base com usuario logado
    table.uuid("user_id").notNullable();
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
