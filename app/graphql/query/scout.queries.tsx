export const MY_SCOUT_PROFILE = `
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
    search_regions
    birth_date
    profile_image_url
    is_verified
    created_at
  }
}
`;

export const GET_ALL_SCOUTS = `
  query GetAllScouts {
    verifiedScouts {
      id
      user_id
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
      is_verified
      created_at
      updated_at
    }
  }
`;
