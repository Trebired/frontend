import { verifyA11y } from "./a11y.mjs";
import { verifyCms } from "./cms.mjs";
import { verifyFrontendComponents } from "./components.mjs";
import { verifyMoney } from "./money.mjs";
import { verifyProse } from "./prose.mjs";
import { verifyBuildSources } from "./sources.mjs";
import { verifyFrontendTheme } from "./theme.mjs";
import { verifyNoHydration } from "./rendering.mjs";

async function verifyPackageSurface({ importDist, importDistRoot, packageVersion, rootDir, window }) {
  await verifyFrontendComponents({ importDist, packageVersion, rootDir });
  await verifyFrontendTheme({ importDist, packageVersion, rootDir });
  await verifyMoney(importDist);
  await verifyProse({ importDist, rootDir });
  await verifyBuildSources({ importDist });
  await verifyA11y(importDist, importDistRoot);
  await verifyCms({ importDist }, window);
  await verifyNoHydration({ importDist, importDistRoot, rootDir });
}

export { verifyPackageSurface };
