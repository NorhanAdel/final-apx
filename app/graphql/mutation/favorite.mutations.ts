export const TOGGLE_FAVORITE = `
  mutation ToggleFavorite($input: AddFavoriteInput!) {
    toggleFavorite(input: $input)
  }
`;
