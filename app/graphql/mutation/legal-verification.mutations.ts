export const UPDATE_MY_AGENT_LEGAL_STATUS = `
  mutation UpdateMyAgentLegalStatus($input: UpdateAgentLegalInput!) {
    updateMyAgentLegalStatus(input: $input) {
      id
      agent_profile_id
      is_fifa_certified
      fifa_license_id
      updated_at
    }
  }
`;

export const UPDATE_MY_CLUB_LEGAL_STATUS = `
  mutation UpdateMyClubLegalStatus($input: UpdateClubLegalInput!) {
    updateMyClubLegalStatus(input: $input) {
      id
      club_profile_id
      is_officially_licensed
      commercial_register_id
      updated_at
    }
  }
`;

export const UPDATE_MY_SCOUT_LEGAL_STATUS = `
  mutation UpdateMyScoutLegalStatus($input: UpdateScoutLegalInput!) {
    updateMyScoutLegalStatus(input: $input) {
      id
      scout_profile_id
      scout_type
      organization_name
      updated_at
    }
  }
`;
