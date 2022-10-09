import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const client = createReactClient({
  provider: studioProvider({ apiKey: "24ff41a0-8969-4d1d-964d-e52525a3ef0c" }),
});

export const LivepeerProvider = ({ children }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};
