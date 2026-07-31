export const UPDATE_MY_CONTRACT_STATUS = `
  mutation UpdateMyContractStatus($input: UpdatePlayerContractStatusInput!) {
    updateMyContractStatus(input: $input) {
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
