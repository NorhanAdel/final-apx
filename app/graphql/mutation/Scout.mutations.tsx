export const CREATE_SCOUT_PROFILE = `
mutation CreateScoutProfile($profile_image: Upload, $input: CreateScoutProfileInput!) {
  createScoutProfile(profile_image: $profile_image, input: $input) {
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
mutation UpdateScoutProfile($profile_image: Upload, $input: UpdateScoutProfileInput!) {
  updateScoutProfile(profile_image: $profile_image, input: $input) {
    id
  }
}
`;