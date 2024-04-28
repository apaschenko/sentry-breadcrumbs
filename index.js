import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from 'dotenv';

config();

Sentry.init({
  dsn: process.env.DSN,
  integrations: [
    Sentry.httpIntegration({ tracing: true, breadcrumbs: true }),

    // I commented out this line, but nothing changed:
    nodeProfilingIntegration(),
    Sentry.expressIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

import express from "express";

const app = express();

app.get("/transaction", function rootHandler(req, res) {
  const message = 'It\'s a root!';
  console.log(message);
  Sentry.addBreadcrumb({ message });
  res.end("Hello world!");
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
