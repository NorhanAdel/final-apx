// Accept deal (Player)
export const ACCEPT_DEAL = `
  mutation AcceptDeal($id: ID!) {
    acceptDeal(id: $id) {
      id
      status
    }
  }
`;

// Reject deal (Player)
export const REJECT_DEAL = `
  mutation RejectDeal($id: ID!) {
    rejectDeal(id: $id) {
      id
      status
    }
  }
`;

// Create deal (Admin/Club)
export const CREATE_DEAL = `
  mutation CreateDeal($input: CreateDealInput!) {
    createDeal(input: $input) {
      id
      player_id
      sender_id
      offer_type
      description
      club_name
      value
      commission_rate
      status
      created_at
    }
  }
`;

// Update deal (Admin/Club)
export const UPDATE_DEAL = `
  mutation UpdateDeal($id: ID!, $input: UpdateDealInput!) {
    updateDeal(id: $id, input: $input) {
      id
      description
      club_name
      value
      commission_rate
      status
      expires_at
    }
  }
`;

// Delete deal (Admin/Club)
export const DELETE_DEAL = `
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;
