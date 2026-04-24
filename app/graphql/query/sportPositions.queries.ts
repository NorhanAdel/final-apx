export const GET_ALL_POSITIONS = `
  query {
    sportPositions {
      id
      name
      category
      sport {
        id
        name
        image_url
      }
    }
  }
`;
