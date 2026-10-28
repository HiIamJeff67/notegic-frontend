import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { RealtimePermission } from "@shared/api/interfaces/enums";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import { getDefaultBlockPackMeta } from "@shared/reducers/blockPackMeta.reducer";
import type { UUID } from "crypto";
import { type ContextType, useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import { useBlockPackRealtimeChannel } from "@/hooks/useRealtime";
import { AppRouterActionsContext } from "@/providers/AppRouterProvider";
import {
  BlockEditorContext,
  BlockEditorProvider,
} from "@/providers/BlockEditorProvider";
import {
  defaultLocalPreferences,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import {
  type RealtimeBlockPackChannel,
  RealtimeProvider,
} from "@/providers/RealtimeProvider";
import { UserContext } from "@/providers/UserProvider";

export const mountRealtimeProviderExample = (
  blockPackId?: UUID,
  withEditor = false
) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const apollo = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });
  let updateUser: (publicId: string | null) => void = () => {};
  let channel: RealtimeBlockPackChannel | null = null;
  let blockEditor: ContextType<typeof BlockEditorContext>;
  let navigations = 0;
  const Editor = () => {
    blockEditor = useContext(BlockEditorContext);
    if (!blockEditor) return null;
    return (
      <div data-editor-state={blockEditor.state}>
        <BlockNoteView editor={blockEditor.editor} />
      </div>
    );
  };
  const Channel = ({ id }: { id: UUID }) => {
    channel = useBlockPackRealtimeChannel(id, RealtimePermission.Write);
    return (
      <>
        <span data-channel-status={channel.status} />
        {withEditor && (
          <BlockEditorProvider
            blockPackMeta={getDefaultBlockPackMeta(id, id, id)}
          >
            <Editor />
          </BlockEditorProvider>
        )}
      </>
    );
  };
  const Example = () => {
    const [publicId, setPublicId] = useState<string | null>("fixture-user");
    const [revision, setRevision] = useState(0);
    updateUser = value => {
      setPublicId(value);
      setRevision(revision => revision + 1);
    };
    return (
      <ApolloProvider client={apollo}>
        <UserContext.Provider
          value={
            { userData: publicId ? { publicId } : null } as ContextType<
              typeof UserContext
            >
          }
        >
          <LocalPreferencesContext.Provider
            value={
              {
                preferences: defaultLocalPreferences,
                notificationPermission: "unknown",
              } as ContextType<typeof LocalPreferencesContext>
            }
          >
            <AppRouterActionsContext.Provider
              value={{
                isSamePath: (left, right) => left === right,
                getCurrentPath: () => window.location.pathname,
                getPrevPaths: () => [],
                push: () => {
                  navigations++;
                },
                forceNavigate: () => {
                  navigations++;
                },
                replace: () => {
                  navigations++;
                },
                back: () => {
                  navigations++;
                },
                forward: () => {
                  navigations++;
                },
                refresh: () => {
                  navigations++;
                },
              }}
            >
              <RealtimeProvider>
                {blockPackId && <Channel id={blockPackId} />}
                <span data-realtime-revision={revision}>
                  Realtime provider fixture
                </span>
              </RealtimeProvider>
            </AppRouterActionsContext.Provider>
          </LocalPreferencesContext.Provider>
        </UserContext.Provider>
      </ApolloProvider>
    );
  };
  root.render(<Example />);
  return {
    updateUser: (publicId: string | null) => updateUser(publicId),
    unmount: () => root.unmount(),
    getChannel: () => channel,
    getBlockEditor: () => blockEditor,
    getNavigations: () => navigations,
    getCachedDocument: () =>
      blockPackId
        ? LocalYjsDocumentStore.load("fixture-user", blockPackId)
        : null,
  };
};
