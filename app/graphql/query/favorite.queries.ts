export const IS_FAVORITE = `
  query IsFavorite($playerId: ID!) {
    isFavorite(playerId: $playerId)
  }
`;

export const GET_FAVORITE_COUNT = `
  query FavoriteCount($playerId: ID!) {
    favoriteCount(playerId: $playerId)
  }
`;

export const MY_FAVORITES_QUERY = `
  query MyFavorites($search: String) {
    myFavorites(search: $search) {
      id
      player {
        id
        first_name
        last_name
        position
        nationality
        profile_image_url
        average_rating
        date_of_birth
        age
      }
    }
  }
`;