import { useShelfItem } from "@shared/api/hooks/react/useShelfItem";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import { Button } from "@shared/components/shadcn/button";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const ShelfBody = ({ rootShelfId }: { rootShelfId: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shelfItem = useShelfItem();
  const shelf = shelfItem.shelvesRef.current.find(
    entry => entry.id === rootShelfId
  );
  if (!shelf) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">
          {t("workspace.navigation.shelves")}
        </h1>
      </main>
    );
  }
  return (
    <main className="min-w-0 p-6">
      <h1 className="truncate text-lg font-medium">{shelf.name}</h1>
      <ul className="mt-4 flex min-w-0 flex-col gap-3">
        {shelf.subShelves.map(subShelf => (
          <li key={subShelf.id} className="min-w-0">
            <h2 className="truncate text-sm font-medium">{subShelf.name}</h2>
            <ul className="mt-1 flex min-w-0 flex-col">
              {subShelf.items.map(item => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="min-w-0 justify-start"
                    onClick={() =>
                      void navigate({
                        to:
                          item.type === ItemType.BlockPack
                            ? "/app/block-packs/$blockPackId"
                            : "/app/materials/$materialId",
                        params:
                          item.type === ItemType.BlockPack
                            ? { blockPackId: item.id }
                            : { materialId: item.id },
                      })
                    }
                  >
                    <span className="truncate">{item.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default function ShelfPage() {
  const { t } = useTranslation();
  const { rootShelfId } = useParams({ from: "/app/shelves/$rootShelfId" });
  const session = useDesktopSession();
  if (!session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <ShelfBody rootShelfId={rootShelfId} />;
}
