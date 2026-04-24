export const GET_MY_CLUB_PROFILE = `
  query GetMyClubProfile {
    myClubProfile {
      id
      club_name
      email_address
      phone
      country
      city
      bio
      logo_url
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_CLUB_PROFILE = `
  query GetClubProfile($id: ID!) {
    clubProfile(id: $id) {
      id
      club_name
      email_address
      phone
      country
      city
      bio
      logo_url
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_VERIFIED_CLUBS = `
  query GetVerifiedClubs($skip: Int, $take: Int) {
    verifiedClubs(skip: $skip, take: $take) {
      id
      club_name
      email_address
      country
      city
      phone
      bio
      league_level
      logo_url
      is_verified
      created_at
      updated_at
    }
  }
`;

export const SEARCH_CLUBS = `
  query SearchClubs($query: String!, $country: String, $leagueLevel: String, $skip: Int, $take: Int) {
    searchClubs(query: $query, country: $country, leagueLevel: $leagueLevel, skip: $skip, take: $take) {
      id
      club_name
      email_address
      country
      city
      phone
      bio
      league_level
      logo_url
      is_verified
      created_at
      updated_at
    }
  }
`;
