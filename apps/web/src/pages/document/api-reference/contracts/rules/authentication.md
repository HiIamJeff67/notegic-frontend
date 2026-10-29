# Authentication

Create an API key in Notegic **Account settings → API keys**. Copy the secret when it is created and store it in your server or CLI's secret store. Send it with each request:

```http
X-API-Key: <your-api-key>
```

Each key uses its owner's current resource permissions. Manage expiration and revocation in Account settings. Replace exposed keys, update your integrations, then revoke the old key.

Missing, invalid, expired, or revoked keys return HTTP 401. Insufficient resource permissions return HTTP 403.
