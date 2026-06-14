export const CREATE_USER_PROFILE = `
  mutation CreateUserProfile($input: CreateUserProfileInput!) {
    createUserProfile(input: $input) {
      id
      first_name
      last_name
      email_address
      phone
      country
      city
      nationality
      birth_date
      bio
      profile_image_url
      is_verified
    }
  }
`;

export const UPDATE_USER_PROFILE = `
  mutation UpdateMyUserProfile($input: UpdateUserProfileInput!, $profile_image: Upload) {
    updateMyUserProfile(input: $input, profile_image: $profile_image) {
      id
      first_name
      last_name
      email_address
      phone
      country
      city
      nationality
      birth_date
      bio
      profile_image_url
      is_verified
    }
  }
`;