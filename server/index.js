// Load .env before any other imports so Prisma and app get correct process.env
import "./loadEnv.js";
import { validateProductionEnv } from "./utils/validate-env.js";

validateProductionEnv();

import http from "http";
import app from "./app.js";
import { createSocketServer } from "./socket/socketServer.js";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
createSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is listening at url: http://localhost:${PORT}`);
});
