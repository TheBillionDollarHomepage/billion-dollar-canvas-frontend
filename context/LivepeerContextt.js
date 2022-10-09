import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";

const client = createReactClient({
  provider: studioProvider({ apiKey: "5a31e1c4-81c2-4e5b-b9a8-c48d361c3fc6" }),
});

export const LivepeerProvider = ({ children }) => {
  return <LivepeerConfig client={client}>{children}</LivepeerConfig>;
};
