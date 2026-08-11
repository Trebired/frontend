function serverResponseProbe() {
  const probe = {
    body: null,
    cookies: {},
    headers: {},
    cookie(name, value, options) {
      this.cookies[name] = { options, value };
      return this;
    },
    redirect(status, url) {
      this.statusCode = status;
      this.headers.Location = url;
      return this;
    },
    status(status) {
      this.statusCode = status;
      return this;
    },
  };
  probe.end = (body) => writeProbeBody(probe, body, false);
  probe.json = (body) => writeProbeBody(probe, body, true);
  probe.send = (body) => writeProbeBody(probe, body, false);
  probe.set = (name, value) => writeProbeHeader(probe, name, value);
  probe.setHeader = (name, value) => writeProbeHeader(probe, name, value);
  return probe;
}

function writeProbeBody(probe, body, passthrough) {
  probe.body = body;
  return passthrough ? body : probe;
}

function writeProbeHeader(probe, name, value) {
  probe.headers[name] = value;
  return probe;
}

function appCapture() {
  return {
    locals: {},
    middlewares: [],
    posts: [],
    routes: [],
    staticRoutes: [],
    get(pathInput, handler) {
      this.routes.push({ handler, path: pathInput });
    },
    post(pathInput, ...handlers) {
      this.posts.push({
          handler: handlers[handlers.length - 1],
          handlers,
          path: pathInput,
      });
    },
    use(pathOrHandler, maybeHandler) {
      if (typeof pathOrHandler === "string") {
        this.staticRoutes.push({ handler: maybeHandler, path: pathOrHandler });
        return;
      }
      this.middlewares.push(pathOrHandler);
    },
  };
}

export { appCapture, serverResponseProbe };
