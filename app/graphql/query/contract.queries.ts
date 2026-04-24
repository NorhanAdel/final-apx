// Get my contract template URL based on user role
export const GET_MY_CONTRACT_TEMPLATE = `
  query GetMyContractTemplate {
    myContractTemplate
  }
`;

// Get my current contract
export const GET_MY_CONTRACT = `
  query GetMyContract {
    myContract {
      id
      user_id
      role
      contract_url
      status
      rejection_reason
      created_at
      reviewed_at
      reviewed_by
      updated_at
    }
  }
`;

// Get all my contracts (history)
export const GET_MY_CONTRACTS = `
  query GetMyContracts {
    myContracts {
      id
      user_id
      role
      contract_url
      status
      rejection_reason
      created_at
      reviewed_at
      updated_at
    }
  }
`;