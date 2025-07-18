import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";

import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "crypto";

interface CheckMealIdParams {
  id: string;
}

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (req, rep) => {
    console.log(`[${req.method}] ${req.url}`);

    console.log(req.body);
  });

  // criação de usuários
  app.post(
    "/new-meal",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        meal_hour: z.string().regex(
          /^([01]\d|2[0-3]):([0-5]\d)$/, // regex para HH:MM
          "Formato de horário inválido. Use HH:MM (ex: 14:30)."
        ),
        meal_date: z.string().regex(
          /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // regex para DD/MM/YYYY
          "Formato de data inválido. Use DD/MM/YYYY (ex: 31/12/2025)."
        ),
        is_on_diet: z.boolean(),
      });

      try {
        // validação com zod
        const { name, description, meal_hour, meal_date, is_on_diet } =
          createMealBodySchema.parse(req.body);

        const user = req.user;

        if (!user) {
          return rep.status(401).send({ message: "Usuário não autenticado." });
        }

        // incluir refeição
        await knex("meals").insert({
          id: randomUUID(),
          name,
          description,
          hour: meal_hour,
          date: meal_date,
          is_on_diet,
          user_id: user.id,
        });

        return rep
          .status(201)
          .send({ message: "Inserção de refeição com sucesso." });
      } catch (error) {
        console.error("Erro desconhecido na criação de refeição:", error);
        return rep
          .status(500)
          .send({ message: "Erro interno do servidor ao criar refeição." });
      }
    }
  );

  // listar refeições
  app.get(
    "/meals",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      const user = req.user;

      if (!user)
        return rep.status(401).send({ message: "O usuário não existe." });

      const userMeals = await knex("meals").where({ user_id: user.id });

      return rep.status(200).send(userMeals);
    }
  );

  // listar refeições
  app.delete<{ Params: CheckMealIdParams }>(
    "/delete/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      const user = req.user;

      const { id } = req.params;

      if (!user)
        return rep.status(401).send({ message: "O usuário não existe." });

      const rowsDeleted = await knex("meals")
        .where({ user_id: user.id })
        .andWhere({ id })
        .del();

      if (rowsDeleted === 0)
        return rep.status(404).send({
          message:
            "Refeição não encontrada ou você não tem permissão para deletá-la.",
        });

      return rep
        .status(200)
        .send({ message: "Refeição deletada com sucesso." });
    }
  );

  // editar refeição
  app.put<{ Params: CheckMealIdParams }>(
    "/update/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      const user = req.user;

      if (!user)
        return rep.status(401).send({ message: "O usuário não existe." });

      const { id } = req.params;

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        meal_hour: z.string().regex(
          /^([01]\d|2[0-3]):([0-5]\d)$/, // regex para HH:MM
          "Formato de horário inválido. Use HH:MM (ex: 14:30)."
        ),
        meal_date: z.string().regex(
          /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // regex para DD/MM/YYYY
          "Formato de data inválido. Use DD/MM/YYYY (ex: 31/12/2025)."
        ),
        is_on_diet: z.boolean(),
      });

      try {
        // validação com zod
        const { name, description, meal_hour, meal_date, is_on_diet } =
          createMealBodySchema.parse(req.body);

        // incluir refeição
        await knex("meals")
          .where({ user_id: user.id })
          .andWhere({ id })
          .update({
            name,
            description,
            hour: meal_hour,
            date: meal_date,
            is_on_diet,
          });

        return rep
          .status(200)
          .send({ message: "Refeição editada com sucesso." });
      } catch (error) {
        console.error("Erro desconhecido na edição de refeição:", error);
        return rep
          .status(500)
          .send({ message: "Erro interno do servidor ao editar refeição." });
      }
    }
  );
}
