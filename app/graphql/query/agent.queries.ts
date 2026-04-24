// app/graphql/query/agent.queries.ts

export const GET_MY_AGENT_PROFILE = `
  query GetMyAgentProfile {
    myAgentProfile {
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
      updated_at
    }
  }
`;

export const GET_AGENT_PROFILE = `
  query GetAgentProfile($id: ID!) {
    agentProfile(id: $id) {
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
      updated_at
    }
  }
`;

export const GET_VERIFIED_AGENTS = `
  query GetVerifiedAgents($skip: Int, $take: Int) {
    verifiedAgents(skip: $skip, take: $take) {
      id
      first_name
      last_name
      country
      city
      profile_image_url
      is_verified
    }
  }
`;

export const SEARCH_AGENTS = `
  query SearchAgents($query: String!, $skip: Int, $take: Int) {
    searchAgents(query: $query, skip: $skip, take: $take) {
      id
      first_name
      last_name
      country
      city
      profile_image_url
      is_verified
    }
  }
`;

export const GET_PENDING_AGENT_PROFILES = `
  query GetPendingAgentProfiles($skip: Int, $take: Int) {
    pendingAgentProfiles(skip: $skip, take: $take) {
      id
      first_name
      last_name
      country
      city
      email_address
      phone
      profile_image_url
      is_verified
      created_at
    }
  }
`;
