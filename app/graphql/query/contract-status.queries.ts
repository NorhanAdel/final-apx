export const GET_MY_CONTRACT_STATUS = `
  query GetMyContractStatus {
    myContractStatus {
      id
      player_id
      contract_status
      contract_status_label
      contract_end_date
      release_clause_amount
      has_official_agent
      official_agent_name
      created_at
      updated_at
    }
  }
`;

export const GET_PLAYER_CONTRACT_STATUS = `
  query GetPlayerContractStatus($playerId: String!) {
    playerContractStatus(playerId: $playerId) {
      id
      player_id
      contract_status
      contract_status_label
      contract_end_date
      release_clause_amount
      has_official_agent
      official_agent_name
      created_at
      updated_at
    }
  }
`;
