import { createClient, Provider } from "urql";

export const TheGraphProvider = ({ children }) => {
  const client = createClient({
    url: process.env.NEXT_PUBLIC_THEGRAPH_API_URL,
  });

  return <Provider value={client}>{children}</Provider>;
};
