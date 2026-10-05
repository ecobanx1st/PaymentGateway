require("dotenv-safe").config({
  allowEmptyValues: true
});
const vault = require("node-vault");
const mongoose = require("mongoose");
const ethCron = require("./app/services/evmBalanceUpdate/evmBalanceUpdate");
const rateLimiter = require("./app/middleware/rateLimiter")
require("./app/middleware/utils/zodErrorMap")
const cron = require("node-cron");
const {
    updateExpiredPayments,
} = require("./app/utils/paymentstatusUpdateCron");

const path = require("path");
const isDev = process.env.NODE_ENV !== "production";
const mongoSanitize = require("mongo-sanitize");
const loggerConfig = {
  level: "info",
  customLevels: {
    emailotp: 35,
    security: 36,
    email: 37
  },
  useOnlyCustomLevels: false,
};

// File transports use worker threads which slow down startup — only use in production
if (!isDev) {
  loggerConfig.transport = {
    targets: [
      {
        target: "pino/file",
        level: "info",
        options: { destination: "info.log", mkdir: true }
      },
      {
        target: "pino/file",
        level: "emailotp",
        options: { destination: "emailotp.log", mkdir: true }
      },
      {
        target: "pino/file",
        level: "quicknode_address_error",
        options: { destination: "quicknode_address_error.log", mkdir: true }
      }
    ]
  };
}

const fastify = require("fastify")({ logger: loggerConfig });

const client = require("prom-client");

client.collectDefaultMetrics({ prefix: 'myapp_' });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Average response time of all APIs in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// ✅ onRequest hook — runs at START of every request
fastify.addHook('onRequest', (request, reply, done) => {
  reply.startTimer = httpRequestDuration.startTimer(); // save timer on reply
  done();
});

// ✅ onResponse hook — runs at END of every request
fastify.addHook('onResponse', (request, reply, done) => {
  const route = request.routerPath || request.url; // /users  /login
  const labels = {
    method: request.method,          // GET POST PUT DELETE
    route: route,                    // /users /orders /login
    status_code: reply.statusCode,   // 200 404 500
  };

  reply.startTimer(labels);          // ✅ end timer + record duration
  httpRequestsTotal.inc(labels);     // ✅ count total requests

  done();
});

fastify.get("/metrics", async (request, reply) => {
  reply.header("Content-Type", client.register.contentType);
  return await client.register.metrics();
});

const mongooseConnectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

fastify.get("/health", async (request, reply) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbConnected = dbReadyState === 1;
  const status = dbConnected ? "ok" : "degraded";

  return reply.code(dbConnected ? 200 : 503).send({
    success: dbConnected,
    status,
    server: {
      alive: true,
      uptime: process.uptime(),
    },
    database: {
      connected: dbConnected,
      state: mongooseConnectionStates[dbReadyState] || "unknown",
      // readyState: dbReadyState,
    },
    timestamp: new Date().toISOString(),
  });
});

const fastifyCors = require("@fastify/cors");
const fastifyHelmet = require("@fastify/helmet");
const fastifyCompress = require("@fastify/compress");
const fastifyFormbody = require("@fastify/formbody");
const fastifyMultipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");
const fastifyView = require("@fastify/view");
const fastifyRawBody = require("fastify-raw-body");

const ejs = require("ejs");
const { Server } = require("socket.io");
const { initMongo } = require('./config/mongo')
const { connectRedis, disconnectRedis } = require("./config/redis");
const validateOrigin = require("./config/corsConfig");
const { socketAuth } = require("./app/socket/socketAuth");
const { initRegistry } = require("./app/socket/socketRegistry");

// Cron jobs — runs on import (every 5 mins: expire pending payments >5h)
require("./app/utils/paymentstatusUpdateCron");


// ----------------
// REGISTER PLUGINS
// ----------------

// CORS
fastify.register(fastifyCors, validateOrigin);


// Helmet security
// fastify.register(fastifyHelmet, {
//   crossOriginResourcePolicy: { policy: "cross-origin" },
// });

fastify.register(fastifyHelmet, {
  global: true,
  frameguard: { action: "deny" }, noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
// Compression
fastify.register(fastifyCompress);

// Body parser
fastify.register(fastifyFormbody, {
  bodyLimit: 20 * 1024 * 1024,
});

// Mongo Sanitize to prevent NoSQL injection
fastify.addHook("preHandler", (request, reply, done) => {
  if (request.body) {
    const hasNoSQLInjection = (obj) => {
      if (typeof obj !== 'object' || obj === null) return false;
      return Object.keys(obj).some(key => {
        if (key.startsWith('$') || key.includes('.')) return true;
        if (typeof obj[key] === 'object') return hasNoSQLInjection(obj[key]);
        return false;
      });
    };
    if (hasNoSQLInjection(request.body)) {
      return reply.code(400).send({
        success: false,
        message: 'Request body contains forbidden keys'
      });
    }
    request.body = mongoSanitize(request.body);
  }
  // console.log("Request body sanitized", request.body);
  done();
});


// Multipart for file uploads
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// DB connection is awaited before server starts (see bottom of file)


// Views (EJS)
fastify.register(fastifyView, {
  engine: { ejs },
  root: path.join(__dirname, "views"),
});

// Static directory /public
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public", "uploads"),
  prefix: "/uploads/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'img'), // your folder
  prefix: '/img/',                   // URL prefix
  decorateReply: false,
});

// /testapi path
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/ecobanxApi/",
  decorateReply: false,
});

fastify.register(fastifyRawBody, {
  field: "rawBody",
  global: false,
  encoding: "utf8",
  runFirst: true,
});


// -----------------------------
// DEEP LINK ROOT ROUTES
// -----------------------------
// fastify.get("/.well-known/apple-app-site-association", async (request, reply) => {
//   return reply
//     .header("Content-Type", "application/json")
//     .send({
//       applinks: {
//         apps: [],
//         details: [
//           {
//             appID: "N5AQ9PL5MN.com.jokkos.app",
//             paths: ["/payment-callback*"],
//           },
//         ],
//       },
//     });
// });

// fastify.get("/.well-known/assetlinks.json", async (request, reply) => {
//   return reply
//     .header("Content-Type", "application/json")
//     .send([
//       {
//         relation: ["delegate_permission/common.handle_all_urls"],
//         target: {
//           namespace: "android_app",
//           package_name: "com.jokkos.app",
//           sha256_cert_fingerprints: [
//             "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C",
//           ],
//         },
//       },
//     ]);
// });


// fastify.get("/payment-callback", async (request, reply) => {
//   const { status = "success", type = "buy" } = request.query;
//   const deepLink = `jokko://payment-callback?status=${status}&type=${type}`;

//   return reply
//     .header("Content-Security-Policy", "default-src 'self' jokko:; script-src 'unsafe-inline'")
//     .type("text/html")
//     .send(`
// <html>
// <head>
// <title>Redirecting to Jokko...</title>
// <meta http-equiv="refresh" content="0;url=${deepLink}">
// </head>
// <body>
// <p>Redirecting to Jokko app...</p>
// <script>
//                         window.location.href = "${deepLink}";
//                         setTimeout(function () {
//                             document.body.innerHTML =
//                                 "<h2>Jokko app not found</h2><p>Please install the Jokko app.</p>";
//                         }, 2000);
// </script>
// </body>
// </html>
//         `);
// });


// GLOBAL RATE LIMITER
fastify.addHook("preHandler", rateLimiter());
fastify.addHook("onSend", rateLimiter.onSend);

// -------------
// ROUTES
// -------------
fastify.register(require("./app/routes"));

// -------------
// SOCKET.IO
// -------------
const server = fastify.server;
const io = new Server(server, {
  cors: validateOrigin,
  pingInterval: 25000,
  pingTimeout: 20000,
});

fastify.decorate("io", io);
global.io = io;

io.use(socketAuth);

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);

  if (socket.userRole === "admin") {
    socket.join("admins");
    socket.join(`admin:${socket.userId}`);
  }

  console.log(`Socket ${socket.id} connected - user:${socket.userId} role:${socket.userRole}`);
});

initRegistry(io);

const { initSupportTicketSocket } = require("./app/socket/supportTicketHandler");
initSupportTicketSocket(io);

const { initPaymentSocket } = require("./app/socket/paymentSocketHandler");
initPaymentSocket(io);

const { initNotificationSocket } = require("./app/socket/notificationSocketHandler");
initNotificationSocket(io);

// io.on("connection", (socket) => {
//     sockets = socket;

//     socket.on("join", (data) => {
//         socket.join(data.room);
//     });

//     socket.on("send_message1", (data) => {
//         socket.to(data.room).emit("receive_message1", data);
//     });

//     socket.on("disconnect", () => { });
// });

// -------------
// ERROR HANDLING
// -------------
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
});
process.on("SIGINT", async () => {
  try { ethCron.stopBlockCron(); } catch {}
  try { ethCron.stopFailWebhookCron(); } catch {}
  await disconnectRedis();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  try { ethCron.stopBlockCron(); } catch {}
  try { ethCron.stopFailWebhookCron(); } catch {}
  await disconnectRedis();
  process.exit(0);
});

// ----------
// START SERVER
// ----------
cron.schedule("*/5 * * * *", updateExpiredPayments);

const vaultClient = vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});


async function start() {

  await connectRedis();
  // const result = await vaultClient.read(process.env.VAULT_SECRET_PATH);

  // const secrets = result.data.data;

  // console.log("Vault loaded:", secrets);

  // process.env = secrets;

  const PORT = process.env.PORT || 3000;

  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log("🚀 Fastify server running on port", PORT);
  await initMongo();
  try {
    await ethCron.startCron(); // initializes state + starts both crons
    console.log("ETH cron started (in-process)");
  } catch (err) {
    console.error("ETH cron startCron failed:", err?.message || err);
  }
}

start();
module.exports = { fastify, io };

