import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

// criar tipagem de user na interface FastifyRequest
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }
}

export async function checkSessionIdExists(
  req: FastifyRequest,
  rep: FastifyReply
) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    rep.status(401).send({
      error: "Unauthorized.",
      message: "Session ID missing. Please log in.",
    });
  }

  // buscar no bando de dados que tenha o session_id
  const user = await knex("users").where("session_id", sessionId).first();

  if (!user) return rep.status(401).send({ massage: "User doesn't exist." });

  // anexar os dados do usuário para a requisição no front end
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
