import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SupportedIconTable from "@/components/commons/SupportedIconTable/SupportedIconTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import type { ModalProps } from "@/providers/ModalProvider";
import CreateStationDialogSkeleton from "./CreateStationDialogSkeleton";

interface CreateStationDialogProps extends ModalProps {
  onCreated?: (stationId: UUID) => void | Promise<void>;
}

const CreateStationDialog = ({
  isOpen,
  onClose,
  onCreated,
}: CreateStationDialogProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);
  const [headerBackgroundURL, setHeaderBackgroundURL] = useState<string>("");
  const [isOpening, setIsOpening] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setDescription("");
    setIcon(null);
    setHeaderBackgroundURL("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsOpening(true);
    const frame = window.requestAnimationFrame(() => setIsOpening(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const createStation = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedHeaderBackgroundURL = headerBackgroundURL.trim();
    if (trimmedName.length === 0) return;

    try {
      const stationNode = await stationRoutineManager.createStation(
        trimmedName,
        trimmedDescription,
        icon,
        trimmedHeaderBackgroundURL.length === 0
          ? null
          : trimmedHeaderBackgroundURL
      );
      await onCreated?.(stationNode.id);
      toast.success(t("workspace.station.created"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingStation) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-visible rounded-sm sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.station.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.station.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createStation();
          }}
        >
          {isOpening ? (
            <CreateStationDialogSkeleton />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="station-name">
                  {t("workspace.station.name")}
                </Label>
                <Input
                  id="station-name"
                  value={name}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => setName(event.currentTarget.value)}
                  placeholder={t("workspace.station.namePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="station-description">
                  {t("workspace.station.description")} (
                  {t("workspace.station.optional")})
                </Label>
                <Textarea
                  id="station-description"
                  value={description}
                  maxLength={1024}
                  onChange={event => setDescription(event.currentTarget.value)}
                  placeholder={t("workspace.station.descriptionPlaceholder")}
                  className="min-h-24 resize-none"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0">
                  <Label>{t("workspace.station.icon")}</Label>
                  <SupportedIconTable
                    value={icon}
                    onValueChange={setIcon}
                    disabled={stationRoutineManager.isCreatingStation}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="station-background-url">
                    {t("workspace.station.backgroundUrl")}
                  </Label>
                  <Input
                    id="station-background-url"
                    type="url"
                    value={headerBackgroundURL}
                    autoComplete="off"
                    onChange={event =>
                      setHeaderBackgroundURL(event.currentTarget.value)
                    }
                    placeholder="https://"
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingStation}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingStation ||
                name.trim().length === 0
              }
            >
              {stationRoutineManager.isCreatingStation && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStationDialog;
