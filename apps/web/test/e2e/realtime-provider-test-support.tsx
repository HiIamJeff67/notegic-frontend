import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { UserContext } from "@/providers/UserProvider";
import {
  defaultLocalPreferences,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import { type ContextType, useState } from "react";
import { createRoot } from "react-dom/client";

export const mountRealtimeProviderExample = () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const apollo = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });
  let updateUser: (publicId: string | null) => void = () => {};
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
  };
};
