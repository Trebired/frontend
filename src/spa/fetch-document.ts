import { frontendToken } from "#5vbaqj4pirp3";
import { progress } from "#hmj29rrpgtsh";
import { currentLocale } from "#xp296eiocpdg";
import { applyLocaleView } from "#eck6shyxffsw";

async function fetchDocument(url: string, token: string) {
  progress.begin();
  try {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Requested-With": frontendToken(token) },
    });
    if (!response.ok) return null;
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    applyLocaleView(doc, currentLocale());
    return { doc, url: response.url || url };
  } finally {
    progress.end();
  }
}

export { fetchDocument };
