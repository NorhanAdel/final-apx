export const GET_ALL_POSITIONS = `
  query GetAllPositions($sportId: ID) {
    sportPositions(sportId: $sportId) {
      id
      name
      category
      image_url
      sport {
        id
        name
        image_url
      }
    }
  }
`;

export const GET_POSITIONS_BY_SPORT = `
  query GetPositionsBySport($sportId: ID!, $lang: String) {
    positionsBySport(sportId: $sportId, lang: $lang) {
      id
      name
      category
      image_url
      sport {
        id
        name
        image_url
      }
    }
  }
`;