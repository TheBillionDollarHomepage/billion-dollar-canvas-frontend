import { useQuery } from "urql";

const Query = `
  query Query($first: Int!) {
    pixelEntities(first: $first) {
      id
      price
      owner
    }
  }
`;

export const usePixels = () => {
  const [{ data, fetching: loading, error }] = useQuery({
    query: Query,
    variables: { first: 300 },
  });

  return [data?.pixelEntities, loading, error];
};
