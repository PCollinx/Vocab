import * as Sentry from "@sentry/react-native";

const DSN =
  "https://c3cf8a0cb02c7ab184422cfd4e35451e@o4511508098318336.ingest.de.sentry.io/4511508114440272";

export function initSentry() {
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
    environment: "production",
  });
}

export { Sentry };
