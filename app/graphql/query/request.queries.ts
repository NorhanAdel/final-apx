export const GET_INCOMING_REQUESTS = `
  query GetIncomingRequests {
    myIncomingRequests {
      id
      type
      status
      sender_id
      sender_role
      senderName
      playerName
      payload {
        message
      }
      created_at
      updated_at
    }
  }
`;

export const GET_ALL_PLAYERS_FOR_REQUESTS = `
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

export const GET_MY_SENT_REQUESTS = `
  query GetMySentRequests($status: String) {
    mySentRequests(status: $status) {
      id
      type
      status
      player_id
      senderName
      playerName
      payload {
        message
      }
      created_at
      updated_at
    }
  }
`;

export const GET_MY_SENT_SCOUT_REQUESTS = `
  query GetMySentScoutRequests($status: String) {
    mySentScoutRequests(status: $status) {
      id
      status
      message
      scout {
        id
        first_name
        last_name
        country
        city
        profile_image_url
      }
      created_at
      updated_at
    }
  }
`;

export const GET_MY_PLAYERS = `
  query GetMyPlayers {
    myPlayers {
      id
      first_name
      last_name
      position
      nationality
      profile_image_url
      average_rating
      total_ratings
      date_of_birth
      age
    }
  }
`;

export const GET_CLUB_REQUESTS_FOR_ME = `
  query ClubRequestsForMe {
    clubRequestsForMe {
      id
      status
      message
      club {
        id
        user_id
        club_name
        country
        logo_url
      }
      created_at
    }
  }
`;

/* =========================
   NEW QUERIES
========================= */

export const HAS_PRIORITY_LISTING = `
  query HasPriorityListing {
    hasPriorityListing
  }
`;

export const MY_MAX_REQUEST_STARS = `
  query MyMaxRequestStars {
    myMaxRequestStars
  }
`;

export const CAN_CONTACT_PLAYER = `
  query CanContactPlayer($playerId: ID!) {
    canContactPlayer(playerId: $playerId) {
      can_contact
      reason
      max_stars
    }
  }
`;
