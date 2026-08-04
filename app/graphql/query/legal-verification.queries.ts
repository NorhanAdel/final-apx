export const GET_MY_AGENT_LEGAL_STATUS = `
  query GetMyAgentLegalStatus {
    myAgentLegalStatus {
      id
      agent_profile_id
      is_fifa_certified
      fifa_license_id
      created_at
      updated_at
    }
  }
`;

export const GET_MY_CLUB_LEGAL_STATUS = `
  query GetMyClubLegalStatus {
    myClubLegalStatus {
      id
      club_profile_id
      is_officially_licensed
      commercial_register_id
      created_at
      updated_at
    }
  }
`;

export const GET_MY_SCOUT_LEGAL_STATUS = `
  query GetMyScoutLegalStatus {
    myScoutLegalStatus {
      id
      scout_profile_id
      scout_type
      organization_name
      created_at
      updated_at
    }
  }
`;
