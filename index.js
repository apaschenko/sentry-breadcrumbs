const Sentry = require('@sentry/node');
const { config } = require('dotenv');

config();
Sentry.get
Sentry.init({
  dsn: process.env.DSN,
  integrations: [
    Sentry.httpIntegration({ tracing: true, breadcrumbs: true }),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const express = require('express');

const app = express();

app.get("/breadcrumb/:name", function rootHandler(req, res) {
  Sentry.addBreadcrumb({
    message: `It's a breadcrum for "${req.params.name}"`
  })

  res.end(req.params.name);
});

app.get("/error", function mainHandler(req, res) {
  const message = 'It\'s a breadcrumb for exception!';
  console.log(message);
  Sentry.addBreadcrumb({ message });
  throw new Error("My first Sentry error!");
});

Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(`${res.sentry}\n`);
});

app.listen(3000);
