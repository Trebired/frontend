import assert from "node:assert/strict";

async function verifyProductIdentity(context) {
  const { createProductIdentity, slugText } = await context.importDistRoot();
  assert.equal(slugText("Acme Frontend App"), "acme-frontend-app");
  assert.equal(slugText("", "fallback-app"), "fallback-app");

  const generic = createProductIdentity({ name: "Acme Frontend App" });
  assert.deepEqual(generic, {
      hiddenDir: ".acme-frontend-app",
      name: "Acme Frontend App",
      progressStyleId: "acme-frontend-app-progress-style",
      repositoryIdeMessageType: "acme-frontend-app:repository-ide",
      slug: "acme-frontend-app",
      themeHeaderName: "x-acme-frontend-app-theme",
      themeSyncChannel: "acme-frontend-app-theme",
      themeSyncMessageType: "acme-frontend-app:theme",
      themeSyncStorageKey: "acme-frontend-app:theme-sync",
      workflowsDir: ".acme-frontend-app/workflows",
  });

  const customized = createProductIdentity({
      name: "Acme Frontend App",
      themeSyncMessage: "shell-theme",
  });
  assert.equal(customized.themeSyncMessageType, "acme-frontend-app:shell-theme");
}

export { verifyProductIdentity };
