export const GET_MY_USER_PROFILE = `
  query GetMyUserProfile {
    myUserProfile {
      id
      first_name
      last_name
      bio
      email_address
      phone
      country
      city
      nationality
      birth_date
      profile_image_url
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_USER_PROFILE_BY_ID = `
  query GetUserProfileById($id: String!) {
    userProfile(id: $id) {
      id
      first_name
      last_name
      bio
      email_address
      phone
      country
      city
      nationality
      profile_image_url
      is_verified
      created_at
      updated_at
    }
  }
`;
