import {
  useCreateRootShelf,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import type { LocalDB } from "@shared/api/local/repositories/localDB";
import { Button } from "@shared/components/shadcn/button";
import { Input } from "@shared/components/shadcn/input";
import { useTranslation } from "@shared/hooks/useTranslation";
import { type FormEvent, useState } from "react";
import {
  CreateRootShelf,
  UpdateMyRootShelfById,
} from "../../../../api/functions/rootShelf.function";

type LocalShelf = {
  id: string;
  name: string;
};

export const RootShelves = ({
  db,
  ownerPublicId,
}: {
  db: LocalDB;
  ownerPublicId: string;
}) => {
  const { t } = useTranslation();
  const createRootShelf = useCreateRootShelf(
    db,
    ownerPublicId,
    CreateRootShelf
  );
  const updateRootShelf = useUpdateMyRootShelfById(
    db,
    ownerPublicId,
    UpdateMyRootShelfById
  );
  const [draft, setDraft] = useState("");
  const [shelves, setShelves] = useState<LocalShelf[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const createShelf = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.trim();
    if (name === "") return;
    setErrorMessage("");
    try {
      const created = await createRootShelf.mutateAsync({
        body: { id: crypto.randomUUID(), name },
      });
      setShelves(current => [...current, { id: created.local.id, name }]);
      setNames(current => ({ ...current, [created.local.id]: name }));
      setDraft("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "create failed");
    }
  };

  const renameShelf = async (shelf: LocalShelf) => {
    const name = (names[shelf.id] ?? shelf.name).trim();
    if (name === "" || name === shelf.name) return;
    setErrorMessage("");
    try {
      const renamed = await updateRootShelf.mutateAsync({
        body: { rootShelfId: shelf.id, values: { name } },
      });
      const nextName = renamed.local === undefined ? shelf.name : name;
      setShelves(current =>
        current.map(item =>
          item.id === shelf.id ? { ...item, name: nextName } : item
        )
      );
    } catch (error) {
      setNames(current => ({ ...current, [shelf.id]: shelf.name }));
      setErrorMessage(error instanceof Error ? error.message : "rename failed");
    }
  };

  return (
    <section className="min-w-0 px-2 py-2">
      <h2 className="truncate px-2 text-sm font-medium">
        {t("workspace.navigation.shelves")}
      </h2>
      <form className="mt-2 flex min-w-0 flex-col gap-2" onSubmit={createShelf}>
        <Input
          value={draft}
          placeholder={t("workspace.navigation.shelfNamePlaceholder")}
          aria-label={t("workspace.navigation.createRootShelf")}
          onChange={event => setDraft(event.target.value)}
        />
        <Button type="submit" disabled={draft.trim() === ""}>
          {t("workspace.navigation.createRootShelf")}
        </Button>
      </form>
      <ul className="mt-2 flex min-w-0 flex-col gap-2">
        {shelves.map(shelf => (
          <li key={shelf.id} className="min-w-0">
            <Input
              value={names[shelf.id] ?? shelf.name}
              aria-label={t("workspace.navigation.typeNewName")}
              onChange={event =>
                setNames(current => ({
                  ...current,
                  [shelf.id]: event.target.value,
                }))
              }
              onBlur={() => void renameShelf(shelf)}
              onKeyDown={event => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void renameShelf(shelf);
              }}
            />
          </li>
        ))}
      </ul>
      {errorMessage !== "" && (
        <p className="mt-2 truncate px-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </section>
  );
};
