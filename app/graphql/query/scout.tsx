export const MY_PROFILE = `
query {
  myScoutProfile {
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
    search_regions
    profile_image_url
  }
}
`;

export const CREATE_SCOUT_PROFILE = `
mutation CreateScoutProfile($profile_image: Upload, $input: CreateScoutProfileInput!) {
  createScoutProfile(profile_image: $profile_image, input: $input) {
    id
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