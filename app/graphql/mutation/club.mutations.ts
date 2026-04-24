export const CREATE_CLUB_PROFILE = `
  mutation CreateClubProfile($input: CreateClubProfileInput!) {
    createClubProfile(input: $input) {
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

export const UPDATE_MY_CLUB_PROFILE = `
  mutation UpdateMyClubProfile($input: UpdateClubProfileInput!) {
    updateMyClubProfile(input: $input) {
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
