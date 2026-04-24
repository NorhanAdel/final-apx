export const SEND_REQUEST_MUTATION = `
  mutation SendRequest($input: CreateRequestInput!) {
    sendRequest(input: $input) {
      id
      type
      status
      player_id
      sender_id
      sender_role
      senderName
      playerName
      payload
      created_at
      updated_at
    }
  }
`;

export const RESPOND_TO_REQUEST = `
  mutation RespondToRequest($input: RespondToRequestInput!) {
    respondToRequest(input: $input) {
      id
      type
      status
      sender_role
      senderName
      playerName
      payload
      admin_notified
      created_at
      updated_at
    }
  }
`;

export const CANCEL_REQUEST_MUTATION = `
  mutation CancelRequest($requestId: String!) {
    cancelRequest(requestId: $requestId) {
      id
      type
      status
      created_at
      updated_at
    }
  }
`;

export const SEND_SCOUT_REQUEST_MUTATION = `
  mutation SendScoutRequest($scoutProfileId: String!, $message: String) {
    sendScoutRequest(scoutProfileId: $scoutProfileId, message: $message) {
      id
      type
      status
      created_at
    }
  }
`;

export const CANCEL_SCOUT_REQUEST_MUTATION = `
  mutation CancelScoutRequest($requestId: String!) {
    cancelScoutRequest(requestId: $requestId) {
      id
      status
      created_at
    }
  }
`;
