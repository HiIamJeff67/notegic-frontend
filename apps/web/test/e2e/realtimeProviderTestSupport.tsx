import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import {
  RealtimeProvider,
  type RealtimeBlockPackChannel,
} from "@/providers/RealtimeProvider";
import { useBlockPackRealtimeChannel } from "@/hooks/useRealtime";
import { RealtimePermission } from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import { UserContext } from "@/providers/UserProvider";
import {
  defaultLocalPreferences,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import { type ContextType, useState } from "react";
import { createRoot } from "react-dom/client";

export const mountRealtimeProviderExample = (blockPackId?: UUID) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const apollo = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });
  let updateUser: (publicId: string | null) => void = () => {};
  let channel: RealtimeBlockPackChannel | null = null;
  const Channel = ({ id }: { id: UUID }) => {
    channel = useBlockPackRealtimeChannel(id, RealtimePermission.Write);
    return <span data-channel-status={channel.status} />;
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
            <RealtimeProvider>
              {blockPackId && <Channel id={blockPackId} />}
              <span data-realtime-revision={revision}>
                Realtime provider fixture
              </span>
            </RealtimeProvider>
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
  };
};
