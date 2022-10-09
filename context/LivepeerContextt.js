import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const client = createReactClient({
  provider: studioProvider({ apiKey: "3cbfc18c-1295-4d1f-a55b-433f842e1af7" }),
});

export const LivepeerProvider = ({ children }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};
