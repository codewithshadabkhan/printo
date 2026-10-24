import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
export const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};
export async function resolveAsset(requestUrl, root = resolve("dist")) {
  const url = new URL(requestUrl, "http://localhost");
  let path = resolve(root, "." + decodeURIComponent(url.pathname));
  if (path !== root && !path.startsWith(root + sep))
    return { status: 403, body: "Forbidden", headers: {} };
  let exists = false;
  try {
    exists = (await stat(path)).isFile();
  } catch {
    /* A missing extensionless path uses the SPA shell. */
  }
  if (!exists) {
    if (extname(path)) return { status: 404, body: "Not found", headers: {} };
    path = resolve(root, "index.html");
  }
  try {
    return {
      status: 200,
      body: await readFile(path),
      headers: {
        "Content-Type":
          contentTypes[extname(path)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      },
    };
  } catch {
    return { status: 500, body: "Unable to serve request", headers: {} };
  }
}
export async function handleRequest(req, res) {
  try {
    const result = await resolveAsset(req.url);
    res.writeHead(result.status, result.headers);
    res.end(result.body);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
}
