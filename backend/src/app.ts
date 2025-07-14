import fastify from "fastify";
import { usersRoutes } from "./routes/users"; // plugin - separação de rotas e mais
import { mealsRoutes } from "./routes/meals"; // plugin - separação de rotas e mais
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);

app.register(usersRoutes);

app.register(mealsRoutes, {
  prefix: "/dashboard",
});
