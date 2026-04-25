export const CREATE_SCOUT_PROFILE = `
mutation CreateScoutProfile($input: CreateScoutProfileInput!) {
  createScoutProfile(input: $input) {
    id
    first_name
    last_name
    bio
    country
    city
    nationality
    email_address
    phone
    search_regions
    birth_date
    profile_image_url
    is_verified
    created_at
  }
}
`;

export const UPDATE_SCOUT_PROFILE = `
mutation UpdateMyScoutProfile($input: UpdateScoutProfileInput!) {
  updateMyScoutProfile(input: $input) {
    id
    first_name
    last_name
    bio
    country
    city
    nationality
    email_address
    phone
    birth_date
    profile_image_url
  }
}
`;

export const UPSERT_CLUB_CAREER = `
  mutation UpsertScoutClubCareer($input: CreateScoutClubCareerInput!) {
    upsertScoutClubCareer(input: $input) {
      id
      current_club
      previous_clubs
    }
  }
`;
