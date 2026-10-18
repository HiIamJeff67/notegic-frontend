# Authentication

Create an API key in Notegic **Account settings → API keys** while signed in. The secret is displayed only when the key is created; copy it to a trusted server or CLI secret store before leaving that screen. Send it with each public API request:

```http
X-API-Key: <your-api-key>
```

Keys belong to the creating user. Access to a resource follows that user's current permissions; a key cannot grant access the user does not have. The current public API does not offer per-key resource scopes. A key may have an expiration time and can be revoked in Account settings. An expired or revoked key cannot be used for new requests. If a key might be exposed, create a replacement, update every trusted consumer, verify it works, then revoke the old key. Do not assume in-flight requests are cancelled by revocation.

Do not share a key between users or place it in browser code, frontend environment files, URLs, or logs. A missing, invalid, expired, or revoked key results in HTTP 401; an authenticated request without sufficient resource permission can result in HTTP 403.
