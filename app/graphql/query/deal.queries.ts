
// Get my deals as player (incoming deals)
export const GET_MY_DEALS = `
  query GetMyDeals($status: DealStatus) {
    myDeals(status: $status) {
      id
      player_id
      sender_id
      offer_type
      description
      club_name
      value
      commission_rate
      status
      admin_approved
      expires_at
      created_at
      updated_at
      playerName
      senderName
    }
  }
`;
// app/graphql/query/deal.queries.ts

export const GET_DEALS_BY_STATUS = `
  query DealsByStatus($status: DealStatus!, $limit: Float) {
    dealsByStatus(status: $status, limit: $limit) {
      id
      player_id
      sender_id
      offer_type
      description
      club_name
      value
      commission_rate
      status
      admin_approved
      expires_at
      created_at
      updated_at
      playerName
      senderName
    }
  }
`;

export const GET_PLAYER_DEALS = `
  query GetPlayerDeals($playerId: ID!, $status: DealStatus) {
    playerDeals(playerId: $playerId, status: $status) {
      id
      player_id
      sender_id
      offer_type
      description
      club_name
      value
      commission_rate
      status
      admin_approved
      expires_at
      created_at
      updated_at
      playerName
      senderName
    }
  }
`;

export const GET_DEAL_BY_ID = `
  query GetDeal($id: ID!) {
    deal(id: $id) {
      id
      player_id
      sender_id
      offer_type
      description
      club_name
      value
      commission_rate
      status
      admin_approved
      expires_at
      created_at
      updated_at
      playerName
      senderName
    }
  }
`;

export const GET_DEAL_STATS = `
  query GetDealStats {
    dealStats {
      total
      pending
      accepted
      rejected
      expired
    }
  }
`;

export const GET_PLAYERS_FOR_DEALS = `
  query GetAllPlayers($skip: Int, $take: Int) {
    getAllPlayers(skip: $skip, take: $take) {
      data {
        id
        first_name
        last_name
        profile_image_url
        average_rating
      }
      total
    }
  }
`;