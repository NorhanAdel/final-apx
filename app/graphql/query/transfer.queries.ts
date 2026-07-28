export const GET_MY_TRANSFERS = `
  query GetMyTransfers {
    myTransfers {
      id
      player_id
      from_club
      to_club
      club_name
      logo_url
      status
      transfer_date
      completed_at
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_ALL_TRANSFERS = `
  query GetAllTransfers($filter: TransferFilterInput) {
    allTransfers(filter: $filter) {
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
      notes
    }
  }
`;

export const GET_TRANSFER_BY_ID = `
  query GetTransfer($id: ID!) {
    transfer(id: $id) {
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
      notes
    }
  }
`;

export const GET_INCOMING_PLAYERS = `
  query IncomingPlayers {
    incomingPlayers {
      player {
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
  }
`;


export const GET_TRANSFERS_BY_CLUB = `
  query GetTransfersByClub {
    getTransfersByClub {
      id
      player_id
      from_club
      to_club
      club_name
      status
      transfer_date
      completed_at
      notes
      created_at
      updated_at
      player {
        id
        first_name
        last_name
        profile_image_url
        nationality
      }
    }
  }
`;