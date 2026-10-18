# Origins and security

The API-key surface is for a trusted server or CLI. A third-party web UI should call its own trusted backend; do not ship a Notegic key in browser JavaScript, browser storage, or a public frontend environment variable. Do not ask users for their Notegic password to operate an integration.

Use HTTPS, a secret manager or protected local environment, and redacted logs. Never place keys, account passwords, or authorization codes in URLs or query parameters. Request only the data your integration needs and check the current user's resource access.

Browser CORS policy is separate from authentication and authorization. An allowed Origin does not grant resource access, and a failed CORS preflight is not a reason to spoof an Origin or move a key into client code. Browser-based third-party access is not documented as a supported direct integration path.
