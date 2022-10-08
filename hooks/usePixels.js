import { useEffect } from "react";
import { useQuery } from "urql";
import { useBlockNumber } from "wagmi";

const Query = `
  query Query($first: Int!) {
    pixelEntities(first: $first) {
      id
      price
      owner
      tokenUri
    }
  }
`;

export const usePixels = () => {
  const [{ data, fetching: loading, error }, reexecuteQuery] = useQuery({
    query: Query,
    variables: { first: 300 },
  });

  return [data?.pixelEntities, loading, error];
};
