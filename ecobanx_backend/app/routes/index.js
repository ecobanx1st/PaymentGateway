const fs = require("fs");
const { removeExtensionFromFile } = require("../middleware/utils");

module.exports = async function (fastify, opts) {
    const routesPath = __dirname;

    // ---------------------------
    // Load auth route first
    // ---------------------------
    fastify.register(require("./auth"), { prefix: "/ecobanxApi" });

    // ---------------------------
    // Auto-load all other route files dynamically
    // ---------------------------
    fs.readdirSync(routesPath)
        .filter((file) => {
            const routeFile = removeExtensionFromFile(file);

            return (
                routeFile !== "index" &&
                routeFile !== "auth" &&
                file !== ".DS_Store"
            );
        })
        .forEach((file) => {
            const routeFile = removeExtensionFromFile(file);

            fastify.register(require(`./${routeFile}`), {
                prefix: `/ecobanxApi/${routeFile}`,
            });
        });

    // ---------------------------
    // Default index route
    // ---------------------------
    fastify.get("/", async (req, reply) => {
        return reply.view("index");
    });

    // ---------------------------
    // 404 Handler
    // ---------------------------
    fastify.setNotFoundHandler((req, reply) => {
        reply.status(404).send({
            errors: { msg: "URL NOT FOUND" },
        });
    });
};
