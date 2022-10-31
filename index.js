const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const users = [];
const posts = [
  { id: "1", title: "Lorem ipsum yeah" },
  { id: "2", title: "Ok ok ok ok" },
];
const { JWT_SECRET } = process.env;

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});
fastify.get("/posts", async (request, reply) => {
  const { authorization } = request.headers;
  try {
    const verified = jwt.verify(authorization, JWT_SECRET);
    reply.header("Access-Control-Allow-Origin", "*");
    return posts;
  } catch (err) {
    return reply.status(401).send({ ok: false, error: "Unauthorized" });
  }
});

fastify.get("/users", async (request, reply) => {
  return users;
});

fastify.post("/register", async (request, reply) => {
  const { email, password } = request.body;
  users.push({ email, password });
  reply.header("Access-Control-Allow-Origin", "*");
  return { registered: true };
});
fastify.post("/login", async (request, reply) => {
  const { email, password } = request.body;
  const isAuthed = users.some(
    (user) => user.email === email && user.password === password
  );

  reply.header("Access-Control-Allow-Origin", "*");

  if (isAuthed) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
    return { login: true, token };
  }

  return { login: false };
});

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: (origin, cb) => {
        const hostname = new URL(origin).hostname;
        if (hostname === "localhost") {
          //  Request from localhost will pass
          cb(null, true);
          return;
        }
        // Generate an error on other origins, disabling access
        cb(new Error("Not allowed"), false);
      },
    });
    await fastify.listen({ port: 8080 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
