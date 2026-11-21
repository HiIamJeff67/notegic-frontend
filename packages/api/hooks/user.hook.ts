import type { Client } from "@shared/api/local/client";
import type { UpsertLoggedInUserInput } from "@shared/api/local/repositories/inputs/user.input";
import { UserRepository } from "@shared/api/local/repositories/user.repository";
import { useEffect, useState } from "react";

export const useUpsertLoggedInUser = (
  client: Client,
  input: UpsertLoggedInUserInput
) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void UserRepository.UpsertLoggedIn(client, input).then(
      () => {
        if (!cancelled) setReady(true);
      },
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, [client, input.displayName, input.email, input.name, input.publicId]);
  return ready;
};
