export const CREATE_TRANSFER_FROM_DEAL = `
  mutation CreateTransferFromDeal($dealId: ID!) {
    createTransferFromDeal(dealId: $dealId) {
      id
      player_id
      from_club
      to_club
      club_name
      status
      transfer_date
      completed_at
      created_at
      playerName
      fromClubName
      toClubName
    }
  }
`;
