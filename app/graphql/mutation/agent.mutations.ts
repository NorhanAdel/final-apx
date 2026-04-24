// app/graphql/mutation/agent.mutations.ts

export const CREATE_AGENT_PROFILE = `
  mutation CreateAgentProfile($input: CreateAgentProfileInput!) {
    createAgentProfile(input: $input) {
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
      is_verified
      created_at
    }
  }
`;

export const UPDATE_MY_AGENT_PROFILE_WITH_IMAGE = `
  mutation UpdateMyAgentProfileWithImage($input: UpdateAgentProfileInput!, $profile_image: Upload) {
    updateMyAgentProfileWithImage(input: $input, profile_image: $profile_image) {
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
      is_verified
    }
  }
`;

export const DELETE_MY_AGENT_PROFILE = `
  mutation DeleteMyAgentProfile {
    deleteMyAgentProfile
  }
`;

export const VERIFY_AGENT_PROFILE = `
  mutation VerifyAgentProfile($profileId: ID!) {
    verifyAgentProfile(profileId: $profileId) {
      id
      first_name
      last_name
      is_verified
    }
  }
`;

export const REJECT_AGENT_PROFILE = `
  mutation RejectAgentProfile($profileId: ID!) {
    rejectAgentProfile(profileId: $profileId)
  }
`;
