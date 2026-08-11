import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { appCapture, serverResponseProbe } from "./probe.mjs";

async function verifyFrontendServerFramework(server) {
  verifyBoundServerFactories(server);
  await verifyFrontendServerServices(server);
  verifyStaticServer(server);
}

function verifyBoundServerFactories(server) {
  const theme = server.createThemeServer({
      allowedThemes: ["dark", "light"],
      defaultTheme: "dark",
  });
  const themeReq = { cookies: { theme: "light" }, headers: {}, query: {} };
  const themeRes = serverResponseProbe();
  assert.equal(theme.current(themeReq), "light");
  assert.equal(theme.effectiveKey(themeReq), "light");
  assert.equal(theme.className("light"), "light");
  assert.equal(theme.setTheme(themeReq, themeRes, "dark"), "dark");

  const language = server.createLanguageServer({
      allowedLanguages: ["en", "cs"],
      defaultLanguage: "en",
  });
  const languageReq = { cookies: {}, headers: { "accept-language": "cs-CZ" } };
  const languageRes = serverResponseProbe();
  assert.equal(language.effective(languageReq), "cs");
  assert.equal(language.setLanguage(languageReq, languageRes, "cs"), "cs");
  assert.equal(language.match("cs-CZ"), "cs");

  const sidebar = server.createSidebarServer({ allowedSides: ["left"] });
  const sidebarReq = { cookies: {} };
  const sidebarRes = serverResponseProbe();
  assert.deepEqual(
    sidebar.setMinimized(sidebarReq, sidebarRes, "left", true),
    { minimized: true, side: "left" },
  );
  assert.equal(sidebar.currentMinimized(sidebarReq, "left"), true);
}

async function verifyFrontendServerServices(server) {
  const app = appCapture();
  const attached = server.attachFrontendServerServices(app, {
      icons: true,
      language: {
        options: { allowedLanguages: ["en", "cs"], defaultLanguage: "en" },
        respond: ({ lang }) => ({ lang }),
      },
      locale: true,
      navigation: true,
      security: true,
      seo: { defaults: { contentLanguage: "en" } },
      sidebar: {
        options: { allowedSides: ["left"] },
        respond: ({ state }) => state,
      },
      theme: {
        options: { allowedThemes: ["dark", "light"], defaultTheme: "dark" },
        respond: ({ theme }) => ({ theme }),
      },
  });
  assert.equal(attached.security, true);
  assert.equal(attached.navigation, true);
  assert.equal(attached.locale, true);
  assert.equal(attached.seo, true);
  assert.equal(attached.theme, true);
  assert.equal(attached.language, true);
  assert.equal(attached.sidebar, true);
  assert.equal(attached.icons.route, "/__icons/svg");
  assert.equal(app.locals.icons.save, "remixicon:save-3-line");
  assert.deepEqual(
    app.posts.map((route) => route.path),
    ["/ui/theme/toggle", "/ui/lang/set", "/ui/sidebar/toggle"],
  );
  const themeRes = serverResponseProbe();
  assert.deepEqual(
    await app.posts[0].handler({
        body: { theme: "light" },
        cookies: {},
        headers: {},
        query: {},
      }, themeRes),
    { theme: "light" },
  );
}

function verifyStaticServer(server) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "frontend-static-"));
  fs.writeFileSync(path.join(root, "asset.js"), "const asset = true;");
  const res = serverResponseProbe();
  const middleware = server.createStaticDirectoryMiddleware(root, {
      maxAgeSeconds: 10,
  });
  middleware({ url: "/asset.js" }, res, () => {});
  assert.equal(res.headers["Content-Type"], "text/javascript; charset=utf-8");
  assert.equal(res.headers["Cache-Control"], "public, max-age=10");
  assert.equal(String(res.body), "const asset = true;");
  assert.equal(server.resolveStaticFile(root, "/../asset.js"), "");

  const app = appCapture();
  const attached = server.attachStaticDirectory(app, "/assets", root);
  assert.equal(attached.attached, true);
  assert.equal(app.staticRoutes[0].path, "/assets");
}

export { verifyFrontendServerFramework };
