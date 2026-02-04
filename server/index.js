// Load .env before any other imports so Prisma and app get correct process.env
import "./loadEnv.js";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening at url: http://localhost:${PORT}`);
});
