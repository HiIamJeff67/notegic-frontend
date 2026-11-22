import { useCreateStation } from "@shared/api/hooks/station.hook";
import type { SupportedIcon } from "@shared/api/interfaces/enums";
import SupportedIconTable from "@shared/components/commons/SupportedIconTable/SupportedIconTable";
import { Button } from "@shared/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/shadcn/dialog";
import { Input } from "@shared/components/shadcn/input";
import { Label } from "@shared/components/shadcn/label";
import { Spinner } from "@shared/components/shadcn/spinner";
import { Textarea } from "@shared/components/shadcn/textarea";
import toast from "@shared/components/toast/toast";
import { useTranslation } from "@shared/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import { useEffect, useState } from "react";
import { CreateStation } from "../../api/functions/station.function";
import type { ModalProps } from "../../providers/ModalProvider";

const CreateStationDialog = ({ isOpen, onClose }: ModalProps) => {
  const { t } = useTranslation();
  const createStation = useCreateStation(CreateStation);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);
  const [headerBackgroundURL, setHeaderBackgroundURL] = useState("");

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setDescription("");
    setIcon(null);
    setHeaderBackgroundURL("");
  }, [isOpen]);

  const submit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;
    try {
      await createStation.mutateAsync({
        body: {
          name: trimmedName,
          description: description.trim(),
          icon,
          headerBackgroundURL: headerBackgroundURL.trim() || null,
        },
      });
      toast.success(
        t("workspace.notifications.created", { name: trimmedName })
      );
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[85vh] overflow-visible rounded-sm sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.station.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.station.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={event => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="station-name">{t("workspace.station.name")}</Label>
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
                disabled={createStation.isPending}
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
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={createStation.isPending}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createStation.isPending || name.trim().length === 0}
            >
              {createStation.isPending && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStationDialog;
