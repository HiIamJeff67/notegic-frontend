import type { UUID } from "node:crypto";
import type {
  FragmentedBasicPrivateRootShelfFragment,
  FragmentedBasicPublicUserFragment,
  FragmentedBasicPublicUserInfoFragment,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@/api/graphql/hooks/useSearchShelves";
import {
  useDeleteRootShelfPermissions,
  useUpsertRootShelfPermission,
} from "@/api/hooks/rootShelf.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import type {
  RealtimePresenceFrame,
  RealtimePresenceParticipant,
} from "@shared/api/websocket";
import toast from "@shared/lib/toast";
import { cn } from "@shared/util/utils";
import { Plus, UserPlusIcon, UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AddShelfCollaboratorDialog, {
  type ShelfCollaboratorPermission,
} from "@/components/dialogs/ShelfSharingDialog/AddShelfCollaboratorDialog";
import ShelfSharingOverviewDialog, {
  type ShelfSharingOverviewRow,
} from "@/components/dialogs/ShelfSharingDialog/ShelfSharingOverviewDialog";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtime } from "@/hooks/useRealtime";
import { useUser } from "@/hooks/useUser";
import { translateError } from "@shared/i18n/error";

interface BlockPackParticipantsDropdownProps {
  blockPackId: UUID;
  rootShelfId: UUID;
  isEditorReady: boolean;
}

const manageablePermissions = [
  AccessControlPermission.Read,
  AccessControlPermission.Write,
  AccessControlPermission.Admin,
] as const satisfies readonly ShelfCollaboratorPermission[];

const BlockPackParticipantsDropdown = ({
  blockPackId,
  rootShelfId,
  isEditorReady,
}: BlockPackParticipantsDropdownProps) => {
  const { t } = useTranslation();
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [overviewQuery, setOverviewQuery] = useState("");
  const [selectedUserPublicIds, setSelectedUserPublicIds] = useState<
    Set<string>
  >(() => new Set());
  const [userPublicId, setUserPublicId] = useState("");
  const [permission, setPermission] = useState<ShelfCollaboratorPermission>(
    AccessControlPermission.Read
  );
  const [permissionByPublicId, setPermissionByPublicId] = useState(
    () => new Map<string, AccessControlPermission>()
  );
  const [removedUserPublicIds, setRemovedUserPublicIds] = useState(
    () => new Set<string>()
  );
  const [presenceParticipants, setPresenceParticipants] = useState(
    () => new Map<string, RealtimePresenceParticipant>()
  );
  const [awarenessVersion, setAwarenessVersion] = useState(0);

  const userManager = useUser();
  const realtimeManager = useRealtime();
  const realtimeChannel = realtimeManager.getBlockPackChannel(blockPackId);
  const [searchRootShelves, searchRootShelvesQuery] =
    useSearchRootShelvesLazyQuery();
  const upsertPermissionMutator = useUpsertRootShelfPermission();
  const deletePermissionsMutator = useDeleteRootShelfPermissions();
  const currentUserPublicId = userManager.userData?.publicId;

  const awarenessUsersByPublicId = useMemo(() => {
    void awarenessVersion;
    const map = new Map<
      string,
      { userPublicId: string; displayName: string; name: string; count: number }
    >();
    const awareness = realtimeChannel?.provider.awareness;
    if (!awareness) return map;

    for (const state of awareness.getStates().values()) {
      if (
        !state ||
        typeof state !== "object" ||
        !("user" in state) ||
        !state.user ||
        typeof state.user !== "object"
      )
        continue;

      const user = state.user as Record<string, unknown>;
      if (typeof user.publicId !== "string") continue;
      const displayName =
        typeof user.name === "string" && user.name.trim()
          ? user.name
          : t("workspace.viewer.participant");
      const previous = map.get(user.publicId);
      map.set(user.publicId, {
        userPublicId: user.publicId,
        displayName: previous?.displayName ?? displayName,
        name: previous?.name ?? displayName,
        count: (previous?.count ?? 0) + 1,
      });
    }

    return map;
  }, [awarenessVersion, realtimeChannel?.provider, t]);
  useEffect(() => {
    setPresenceParticipants(new Map());
    const handlePresence = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { blockPackId?: UUID; frame?: RealtimePresenceFrame }
        | undefined;
      const frame = detail?.frame;
      if (!detail || detail.blockPackId !== blockPackId || !frame) return;

      setPresenceParticipants(previous => {
        const next = new Map(previous);
        next.set(frame.participant.userPublicId, frame.participant);
        return next;
      });
    };
    const handlePresenceSnapshot = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | {
            blockPackId?: UUID;
            participants?: RealtimePresenceParticipant[];
          }
        | undefined;
      if (!detail || detail.blockPackId !== blockPackId) return;

      setPresenceParticipants(
        new Map(
          (detail.participants ?? []).map(participant => [
            participant.userPublicId,
            participant,
          ])
        )
      );
    };

    window.addEventListener("notegic:realtime-presence", handlePresence);
    window.addEventListener(
      "notegic:realtime-presence-snapshot",
      handlePresenceSnapshot
    );
    return () => {
      window.removeEventListener("notegic:realtime-presence", handlePresence);
      window.removeEventListener(
        "notegic:realtime-presence-snapshot",
        handlePresenceSnapshot
      );
    };
  }, [blockPackId]);
  const displayedParticipants = useMemo(() => {
    const participants = new Map(awarenessUsersByPublicId);
    for (const participant of presenceParticipants.values()) {
      const awarenessParticipant = participants.get(participant.userPublicId);
      participants.set(participant.userPublicId, {
        userPublicId: participant.userPublicId,
        displayName: awarenessParticipant?.displayName ?? "",
        name: awarenessParticipant?.name ?? "",
        count: participant.connectionCount,
      });
    }

    return Array.from(participants.values()).filter(
      participant =>
        participant.count > 0 &&
        !removedUserPublicIds.has(participant.userPublicId)
    );
  }, [awarenessUsersByPublicId, presenceParticipants, removedUserPublicIds]);
  const connectionCountsByPublicId = useMemo(() => {
    const map = new Map<string, number>();
    for (const participant of displayedParticipants) {
      map.set(participant.userPublicId, participant.count);
    }

    return map;
  }, [displayedParticipants]);
  const rootShelf = useMemo(() => {
    for (const edge of searchRootShelvesQuery.data?.searchRootShelves
      ?.searchEdges ?? []) {
      const candidate =
        edge.node as unknown as FragmentedBasicPrivateRootShelfFragment;
      if (candidate.id === rootShelfId) return candidate;
    }

    return undefined;
  }, [rootShelfId, searchRootShelvesQuery.data]);
  const publicUsersByPublicId = useMemo(() => {
    const map = new Map<string, FragmentedBasicPublicUserFragment>();
    if (!rootShelf) return map;

    const owner =
      rootShelf.owner as unknown as FragmentedBasicPublicUserFragment;
    map.set(owner.publicId, owner);
    for (const sharer of rootShelf.sharers) {
      const user = sharer as unknown as FragmentedBasicPublicUserFragment;
      map.set(user.publicId, user);
    }

    return map;
  }, [rootShelf]);
  const overviewRows = useMemo(() => {
    const rows = new Map<string, ShelfSharingOverviewRow>();

    const owner = rootShelf?.owner as
      | FragmentedBasicPublicUserFragment
      | undefined;
    if (owner) {
      const ownerConnectionCount =
        connectionCountsByPublicId.get(owner.publicId) ?? 0;
      rows.set(owner.publicId, {
        userPublicId: owner.publicId,
        displayName: owner.displayName,
        avatarURL:
          (
            owner.info as unknown as FragmentedBasicPublicUserInfoFragment | null
          )?.avatarURL ?? null,
        permission: "owner",
        status: ownerConnectionCount > 0 ? "In channel" : "Not in channel",
        isOnline: ownerConnectionCount > 0,
        isSelf: owner.publicId === currentUserPublicId,
      });
    }

    for (const sharer of rootShelf?.sharers ?? []) {
      const user = sharer as unknown as FragmentedBasicPublicUserFragment;
      const sharerPublicId = user.publicId;
      if (removedUserPublicIds.has(sharerPublicId)) continue;
      const sharerConnectionCount =
        connectionCountsByPublicId.get(sharerPublicId) ?? 0;
      rows.set(sharerPublicId, {
        userPublicId: sharerPublicId,
        displayName: user.displayName,
        avatarURL:
          (user.info as unknown as FragmentedBasicPublicUserInfoFragment | null)
            ?.avatarURL ?? null,
        permission:
          sharerPublicId === currentUserPublicId
            ? (rootShelf?.permission.toLowerCase() ?? "read")
            : (permissionByPublicId.get(sharerPublicId)?.toLowerCase() ??
              "read"),
        status: sharerConnectionCount > 0 ? "In channel" : "Not in channel",
        isOnline: sharerConnectionCount > 0,
        isSelf: sharerPublicId === currentUserPublicId,
      });
    }

    for (const [userPublicId, localPermission] of permissionByPublicId) {
      if (removedUserPublicIds.has(userPublicId)) continue;
      if (rows.has(userPublicId)) continue;
      const connectionCount = connectionCountsByPublicId.get(userPublicId) ?? 0;
      rows.set(userPublicId, {
        userPublicId,
        displayName:
          publicUsersByPublicId.get(userPublicId)?.displayName ??
          t("workspace.viewer.sharer"),
        avatarURL:
          (
            publicUsersByPublicId.get(userPublicId)
              ?.info as unknown as FragmentedBasicPublicUserInfoFragment | null
          )?.avatarURL ?? null,
        permission: localPermission.toLowerCase(),
        status: connectionCount > 0 ? "In channel" : "Not in channel",
        isOnline: connectionCount > 0,
        isSelf: userPublicId === currentUserPublicId,
      });
    }

    for (const participant of displayedParticipants) {
      const publicUser = publicUsersByPublicId.get(participant.userPublicId);
      const isOnline = participant.count > 0;
      const isOwner = participant.userPublicId === owner?.publicId;
      const isSelf = participant.userPublicId === currentUserPublicId;
      rows.set(participant.userPublicId, {
        userPublicId: participant.userPublicId,
        displayName:
          publicUser?.displayName ??
          participant.displayName ??
          participant.name ??
          t("workspace.viewer.participant"),
        avatarURL:
          (
            publicUser?.info as unknown as FragmentedBasicPublicUserInfoFragment | null
          )?.avatarURL ?? null,
        permission: isOwner
          ? "owner"
          : (permissionByPublicId
              .get(participant.userPublicId)
              ?.toLowerCase() ??
            (isSelf && rootShelf
              ? rootShelf.permission.toLowerCase()
              : "write")),
        status: isOnline ? "In channel" : "Not in channel",
        isOnline,
        isSelf,
      });
    }

    const normalizedQuery = overviewQuery.trim().toLowerCase();
    return Array.from(rows.values()).filter(row => {
      if (!normalizedQuery) return true;

      return (
        row.displayName.toLowerCase().includes(normalizedQuery) ||
        row.userPublicId.toLowerCase().includes(normalizedQuery) ||
        row.permission.toLowerCase().includes(normalizedQuery) ||
        row.status.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [
    connectionCountsByPublicId,
    currentUserPublicId,
    overviewQuery,
    displayedParticipants,
    permissionByPublicId,
    publicUsersByPublicId,
    removedUserPublicIds,
    rootShelf,
    t,
  ]);
  const selectableUserPublicIds = useMemo(
    () =>
      overviewRows
        .filter(
          row =>
            (rootShelf?.permission === AccessControlPermission.Owner ||
              rootShelf?.permission === AccessControlPermission.Admin) &&
            !row.isSelf &&
            row.permission !== "owner"
        )
        .map(row => row.userPublicId),
    [overviewRows, rootShelf?.permission]
  );
  const selectedUserPublicIdList = useMemo(
    () =>
      selectableUserPublicIds.filter(userPublicId =>
        selectedUserPublicIds.has(userPublicId)
      ),
    [selectableUserPublicIds, selectedUserPublicIds]
  );

  useEffect(() => {
    const awareness = realtimeChannel?.provider.awareness;
    if (!awareness) return;
    const handleAwarenessUpdate = () => setAwarenessVersion(value => value + 1);
    handleAwarenessUpdate();
    awareness.on("update", handleAwarenessUpdate);
    return () => {
      awareness.off("update", handleAwarenessUpdate);
    };
  }, [realtimeChannel?.provider]);

  useEffect(() => {
    if (!isMenuOpen && !isOverviewOpen) return;

    searchRootShelves({
      variables: { input: { query: "", first: 64 } },
    });
  }, [isMenuOpen, isOverviewOpen, searchRootShelves]);

  useEffect(() => {
    if (
      permission !== AccessControlPermission.Admin ||
      rootShelf?.permission === AccessControlPermission.Owner
    )
      return;

    setPermission(AccessControlPermission.Read);
  }, [permission, rootShelf?.permission]);

  useEffect(() => {
    setSelectedUserPublicIds(prev => {
      const overviewRowIdSet = new Set(selectableUserPublicIds);
      const next = new Set(
        Array.from(prev).filter(userPublicId =>
          overviewRowIdSet.has(userPublicId)
        )
      );

      return next.size === prev.size ? prev : next;
    });
  }, [selectableUserPublicIds]);

  const handleAddPermission = async () => {
    if (
      rootShelf?.permission !== AccessControlPermission.Owner &&
      rootShelf?.permission !== AccessControlPermission.Admin
    )
      return;

    if (userPublicId.trim() === currentUserPublicId) {
      toast.error(t("workspace.notifications.cannotEditOwnSharingPermission"));
      return;
    }

    try {
      const response = await upsertPermissionMutator.mutateAsync({
        param: {
          rootShelfId,
          userPublicId: userPublicId.trim() as UUID,
        },
        body: { permission },
      });
      setPermissionByPublicId(prev => {
        const next = new Map(prev);
        next.set(response.data.userPublicId, response.data.permission);
        return next;
      });
      setRemovedUserPublicIds(prev => {
        const next = new Set(prev);
        next.delete(response.data.userPublicId);
        return next;
      });
      toast.success(t("workspace.notifications.sharingPermissionUpdated"));
      setUserPublicId("");
      setPermission(AccessControlPermission.Read);
      setIsAddOpen(false);
      setIsOverviewOpen(true);
      searchRootShelves({
        variables: { input: { query: "", first: 64 } },
      });
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  const handleDeletePermissions = async () => {
    if (
      selectedUserPublicIdList.length === 0 ||
      (rootShelf?.permission !== AccessControlPermission.Owner &&
        rootShelf?.permission !== AccessControlPermission.Admin)
    )
      return;

    try {
      await deletePermissionsMutator.mutateAsync({
        param: { rootShelfId },
        body: { userPublicIds: selectedUserPublicIdList as UUID[] },
      });
      setPermissionByPublicId(prev => {
        const next = new Map(prev);
        for (const userPublicId of selectedUserPublicIdList) {
          next.delete(userPublicId);
        }
        return next;
      });
      setRemovedUserPublicIds(prev => {
        const next = new Set(prev);
        for (const userPublicId of selectedUserPublicIdList) {
          next.add(userPublicId);
        }
        return next;
      });
      toast.success(t("workspace.notifications.sharingPermissionsDeleted"));
      setSelectedUserPublicIds(new Set());
      searchRootShelves({
        variables: { input: { query: "", first: 64 } },
      });
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <>
      <DropdownMenu
        modal={false}
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 min-w-11 px-2 hover:bg-transparent"
            aria-label={t("workspace.viewer.openCollaborators")}
          >
            <AvatarGroup className="-space-x-2.5">
              {displayedParticipants
                .slice(
                  0,
                  displayedParticipants.length > 3
                    ? 3
                    : displayedParticipants.length
                )
                .map(participant => {
                  const publicUser = publicUsersByPublicId.get(
                    participant.userPublicId
                  );
                  const displayName =
                    publicUser?.displayName ||
                    participant.displayName ||
                    participant.name;
                  const displayInitials =
                    displayName
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map(part => part[0]?.toUpperCase())
                      .join("") || "?";
                  const avatarURL =
                    (
                      publicUser?.info as unknown as FragmentedBasicPublicUserInfoFragment | null
                    )?.avatarURL ?? null;
                  return (
                    <Avatar key={participant.userPublicId} size="default">
                      <AvatarImage
                        src={avatarURL ?? undefined}
                        alt={displayName}
                      />
                      <AvatarFallback className="text-[10px]">
                        {displayInitials}
                      </AvatarFallback>
                      <AvatarBadge
                        className={cn(
                          participant.count > 0
                            ? "bg-emerald-500"
                            : "bg-muted-foreground",
                          "size-3"
                        )}
                      />
                    </Avatar>
                  );
                })}
              {displayedParticipants.length > 3 ? (
                <AvatarGroupCount>
                  +{displayedParticipants.length - 3}
                </AvatarGroupCount>
              ) : (
                <AvatarGroupCount>
                  <Plus />
                </AvatarGroupCount>
              )}
            </AvatarGroup>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">
              {t("workspace.viewer.participants")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("workspace.viewer.activeUsers")}
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {displayedParticipants.length === 0 ? (
              <div className="px-2 py-6 text-sm text-muted-foreground">
                {t("workspace.viewer.noActiveParticipants")}
              </div>
            ) : (
              displayedParticipants.map(participant => {
                const publicUser = publicUsersByPublicId.get(
                  participant.userPublicId
                );
                const displayName =
                  publicUser?.displayName ||
                  participant.displayName ||
                  participant.name;
                const displayInitials =
                  displayName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => part[0]?.toUpperCase())
                    .join("") || "?";
                const avatarURL =
                  (
                    publicUser?.info as unknown as FragmentedBasicPublicUserInfoFragment | null
                  )?.avatarURL ?? null;
                const participantPermission =
                  participant.userPublicId ===
                  (
                    rootShelf?.owner as unknown as
                      | FragmentedBasicPublicUserFragment
                      | undefined
                  )?.publicId
                    ? "owner"
                    : (permissionByPublicId
                        .get(participant.userPublicId)
                        ?.toLowerCase() ??
                      (participant.userPublicId === currentUserPublicId &&
                      rootShelf
                        ? rootShelf.permission.toLowerCase()
                        : "write"));

                return (
                  <div
                    key={participant.userPublicId}
                    className="flex items-center gap-3 rounded-md px-2 py-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={avatarURL ?? undefined}
                        alt={displayName}
                      />
                      <AvatarFallback className="text-xs">
                        {displayInitials}
                      </AvatarFallback>
                      <AvatarBadge
                        className={
                          participant.count > 0
                            ? "bg-emerald-500"
                            : "bg-muted-foreground"
                        }
                      />
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {participant.userPublicId.slice(0, 8)}...
                        {participant.userPublicId.slice(-4)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {participantPermission === "owner"
                          ? t("workspace.viewer.owner")
                          : participantPermission === "admin"
                            ? t("workspace.viewer.admin")
                            : participantPermission === "write"
                              ? t("workspace.viewer.write")
                              : t("workspace.viewer.read")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-2 p-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsMenuOpen(false);
                setIsOverviewOpen(true);
              }}
            >
              <UsersIcon className="size-4" />
              {t("workspace.viewer.overview")}
            </Button>
            <Button
              className="w-full justify-start"
              disabled={
                rootShelf?.permission !== AccessControlPermission.Owner &&
                rootShelf?.permission !== AccessControlPermission.Admin
              }
              onClick={() => {
                setIsMenuOpen(false);
                setIsAddOpen(true);
              }}
            >
              <UserPlusIcon className="size-4" />
              {t("workspace.viewer.addByPublicId")}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShelfSharingOverviewDialog
        open={isOverviewOpen}
        onOpenChange={setIsOverviewOpen}
        rows={overviewRows}
        query={overviewQuery}
        onQueryChange={setOverviewQuery}
        canManageSharing={
          rootShelf?.permission === AccessControlPermission.Owner ||
          rootShelf?.permission === AccessControlPermission.Admin
        }
        selectedUserPublicIds={selectedUserPublicIds}
        isAllRowsSelected={
          selectableUserPublicIds.length > 0 &&
          selectedUserPublicIdList.length === selectableUserPublicIds.length
        }
        isSomeRowsSelected={
          selectedUserPublicIdList.length > 0 &&
          !(
            selectableUserPublicIds.length > 0 &&
            selectedUserPublicIdList.length === selectableUserPublicIds.length
          )
        }
        selectableRowCount={selectableUserPublicIds.length}
        selectedRowCount={selectedUserPublicIdList.length}
        isDeleting={deletePermissionsMutator.isPending}
        onToggleRow={(userPublicId, isSelected) => {
          setSelectedUserPublicIds(prev => {
            const next = new Set(prev);
            if (isSelected) next.add(userPublicId);
            else next.delete(userPublicId);
            return next;
          });
        }}
        onToggleAllRows={isSelected => {
          setSelectedUserPublicIds(prev => {
            const next = new Set(prev);
            for (const userPublicId of selectableUserPublicIds) {
              if (isSelected) next.add(userPublicId);
              else next.delete(userPublicId);
            }
            return next;
          });
        }}
        onAddClick={() => setIsAddOpen(true)}
        onDeleteClick={handleDeletePermissions}
      />

      <AddShelfCollaboratorDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        userPublicId={userPublicId}
        onUserPublicIdChange={setUserPublicId}
        permission={permission}
        onPermissionChange={setPermission}
        permissionOptions={
          rootShelf?.permission === AccessControlPermission.Owner
            ? [...manageablePermissions]
            : manageablePermissions.filter(
                value => value !== AccessControlPermission.Admin
              )
        }
        canManageSharing={
          rootShelf?.permission === AccessControlPermission.Owner ||
          rootShelf?.permission === AccessControlPermission.Admin
        }
        currentUserPublicId={currentUserPublicId as UUID | undefined}
        isPending={upsertPermissionMutator.isPending}
        onSubmit={handleAddPermission}
      />
    </>
  );
};

export default BlockPackParticipantsDropdown;
