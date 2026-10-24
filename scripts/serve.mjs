import { createServer } from "node:http";
import { handleRequest } from "./http-handler.mjs";
const port = Number(process.env.PORT || 4173);
const server = createServer(handleRequest);
server.on("error", (error) => {
  console.error(`Preview unavailable: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}`),
);
