import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import * as bcrypt from "bcrypt";

const hashNumbers = 10;

export async function usersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (req, rep) => {
    console.log(`[${req.method}] ${req.url}`);
  });

  // criação de usuários
  app.post("/register", async (req, rep) => {
    const createUserBodySchema = z.object({
      name: z
        .string()
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          "O nome de usuário só pode conter letras, números, sublinhados (_) e hifens (-)."
        ),
      email: z.string().email("O formato do e-mail está incorreto."),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    });

    try {
      // validação com zod
      const { name, email, password } = createUserBodySchema.parse(req.body);

      // verificar se o email existe no banco de dados
      const existingEmail = await knex("users").where({ email }).first();

      if (existingEmail) {
        return rep.status(409).send({ message: "E-mail já existente." });
      }

      // verificar se o nome do usuário existe no banco de dados
      const existingUserName = await knex("users").where({ name }).first();

      if (existingUserName) {
        return rep
          .status(409)
          .send({ message: "Nome de usuário já existente." });
      }

      // gerar hash para a senha
      const hashedPassword = await bcrypt.hash(password, hashNumbers);

      // gerar cookie do usuario se não existir
      let sessionId = req.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        rep.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });
      }

      // incluir usuario
      await knex("users").insert({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        session_id: sessionId,
      });

      return rep.status(201).send(); // criação de recurso com sucesso: 201
    } catch (error) {
      console.error("Error creating user:", error);
      return rep.status(500).send();
    }
  });

  app.post("/login", async (req, rep) => {
    const loginBodySchema = z.object({
      email: z.string().email("O formato do e-mail está incorreto."),
      password: z.string(),
    });

    try {
      const { email, password } = loginBodySchema.parse(req.body);

      const user = await knex("users").where({ email }).first();

      // check se o usuario existe
      if (!user)
        return rep.status(401).send({ message: "O e-mail não existe." });

      // comparar senha com hash
      const passwordMatch = await bcrypt.compare(password, user.password);

      // check se a senha existe
      if (!passwordMatch)
        return rep.status(401).send({ message: "A senha está incorreta." });

      // gerar cookie do usuario se não existir
      let sessionId = req.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        rep.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });
      }

      // atualizar cookie
      await knex("users")
        .where({ id: user.id })
        .update({ session_id: sessionId });

      rep.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // retornar login com êxito com os dados do usuarios (sem a senha)

      return rep.status(200).send({
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Erro durante o login:", error);
      return rep.status(500).send({ message: "Internal server error." });
    }
  });

  app.get(
    "/dashboard",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      const user = req.user;

      if (!user)
        return rep.status(401).send({ message: "O usuário não existe." });

      return rep.status(200).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }
  );

  app.post(
    "/logout",
    { preHandler: [checkSessionIdExists] },
    async (req, rep) => {
      try {
        // cookie do usuario logado
        let sessionId = req.cookies.sessionId;

        // limpar o cookie do lado do client
        rep.clearCookie("sessionId", { path: "/" });

        // atualizar cookie
        await knex("users")
          .where({ session_id: sessionId })
          .update({ session_id: null });

        return rep.status(200).send({ message: "Logout com sucesso." });
      } catch (error) {
        console.error("Erro durante logout:", error);
        return rep.status(500).send({ message: "Erro durante logout." });
      }
    }
  );
}
