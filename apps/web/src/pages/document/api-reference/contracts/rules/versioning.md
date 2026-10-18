# Versions and changes

The `/v1` URL segment is the public HTTP compatibility version. The OpenAPI `info.version` is a revision of this published contract, not the Notegic product release number. Product releases and API contract revisions can change independently.

New optional fields or operations may be added within v1. Clients should tolerate unknown response fields and enum values while sending only documented request fields. A removal or incompatible change requires explicit migration guidance and a reviewed compatibility decision; no automatic deprecation period or notification channel is promised here. When an operation is deprecated, its OpenAPI entry or these rules will carry the current migration notice. Check the current published contract before upgrading an integration.
