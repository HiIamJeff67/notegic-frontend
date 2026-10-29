# Origins and security

Run API-key integrations on a trusted server or CLI. Browser applications should call their own backend, which stores and uses the Notegic API key.

Use HTTPS and a secret manager or protected environment. Keep API keys, passwords, and authorization codes out of browser bundles, URLs, and logs. Request only the resources your integration needs and use the key owner's applicable permissions.
