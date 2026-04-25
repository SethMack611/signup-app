const app               = require("./app");
const { createTable }   = require("./scripts/createTable");

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await createTable();
    app.listen(PORT, () => {
      console.log(`🚀  API listening on http://localhost:${PORT}`);
      console.log(`📋  Health check → http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err);
    process.exit(1);
  }
}

start();
