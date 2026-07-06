// Club Career Information
export const GET_MY_CLUB_CAREER = `
  query GetMyClubCareer {
    myClubCareer {
      player_id
      current_club
      professional_debut
      previous_clubs
      created_at
      updated_at
    }
  }
`;

export const GET_PLAYER_CLUB_CAREER = `
  query GetPlayerClubCareer($playerId: String!) {
    playerClubCareer(playerId: $playerId) {
      id
      current_club
      professional_debut
      previous_clubs
    }
  }
`;

// Player Media
export const GET_MY_VIDEOS = `
  query MyVideos {
    myVideos {
      id
      title
      video_url
      type
      is_approved
      views_count
      created_at
      duration_seconds
    }
  }
`;

export const GET_MY_PHOTOS_AND_VIDEOS = `
  query GetMyPhotosAndVideos {
    sports {
      id
      name
      image_url
      created_at
    }
    myPhotos {
      id
      image_url
      caption
      created_at
    }
    myVideos {
      id
      video_url
      title
      type
      duration_seconds
      created_at
      is_reel
    }
  }
`;

export const GET_MY_PHOTOS = `
  query MyPhotos {
    myPhotos {
      id
      image_url
      caption
      created_at
    }
  }
`;

export const GET_PLAYER_PROFILE = `
  query GetPlayerProfile($id: String!) {
    playerProfile(id: $id) {
      id
    
      first_name
      last_name
      bio
      email_address
      phone
      nationality
      country
      city
      height_cm
      weight_kg
      date_of_birth
      profile_image_url
      verification_doc_url
      is_verified
     
      views_count
      age
      super7_level  
      super7_score
      average_rating
      created_at
      updated_at
      photos {
        id
        image_url
        caption
        created_at
      }
      videos {
        id
        title
        video_url
        type
        is_approved
        views_count
        created_at
      }
      ratings {
        id
        rater_id
        scalability
        mental_stability
        soccer_intelligence
        physical_fitness
        technical_skill
        tactical_vision
        republican_influence
        calculated_stars
        notes
        created_at
        rater {
          id
         username
        }
      }
    }
  }
`;


export const GET_ALL_PLAYERS = `
  query GetAllPlayers($skip: Int, $take: Int, $sortBy: String, $minAge: Int, $maxAge: Int) {
    getAllPlayers(skip: $skip, take: $take, sortBy: $sortBy, minAge: $minAge, maxAge: $maxAge) {
      data {
        id
        first_name
        last_name
        profile_image_url
        nationality
        date_of_birth
        age
        average_rating
         super7_score
      }
      total
    }
  }
`;

export const GET_MY_PLAYER_PROFILE = `
  query GetMyPlayerProfile {
    myPlayerProfile {
      id
      first_name
      last_name
      bio
      email_address
      phone
      nationality
      country
      city
      height_cm
      weight_kg
      date_of_birth
      age
      average_rating
      profile_image_url
      verification_doc_url
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_MY_FOOTBALL_INFO = `
  query GetMyFootballInfo {
    myFootballInfo {
      id
      player_id
      position {
        id
        name
      }
      preferred_foot
      jersey_number
      playing_style
      strengths
      market_value
      created_at
      updated_at
    }
  }
`;

export const GET_PLAYER_FOOTBALL_INFO = `
  query GetPlayerFootballInfo($playerId: String!) {
    playerFootballInfo(playerId: $playerId) {
      id
      player_id
      position {
        id
        name
        category
      }
      preferred_foot
      jersey_number
      playing_style
      strengths
      market_value
      created_at
      updated_at
    }
  }
`;

export const SEARCH_PLAYERS = `
  query SearchPlayers($query: String!, $skip: Int, $take: Int, $sortBy: String, $minAge: Int, $maxAge: Int) {
    searchPlayers(query: $query, skip: $skip, take: $take, sortBy: $sortBy, minAge: $minAge, maxAge: $maxAge) {
      data {
        id
        first_name
        last_name
        profile_image_url
        nationality
        date_of_birth
        age
        average_rating
        trust_level
      }
      total
    }
  }
`;

export const GET_PLAYERS_BY_SPORT = `
query GetPlayersBySport($sportId: String!) {
  playersBySport(sportId: $sportId) {
    data {
      id
      first_name
      last_name
      nationality
      country
      city
      age

      average_rating

      super7_level
      super7_score

      football_info {
        jersey_number
        preferred_foot
        position {
          name
        }
      }

      photos {
        image_url
      }
    }

    total
  }
}
`;

export const SEARCH_PLAYERS_BY_SPORT = `
  query SearchPlayersBySport($sportId: String!, $query: String!, $skip: Int, $take: Int, $sortBy: String) {
    searchPlayersBySport(sportId: $sportId, query: $query, skip: $skip, take: $take, sortBy: $sortBy) {
      data {
        id
        first_name
        last_name
        profile_image_url
        nationality
        date_of_birth
        age
        average_rating
        football_info {
          position {
            name
          }
        }
      }
      total
    }
  }
`;

export const GET_TOTAL_PLAYERS_COUNT = `
  query GetTotalPlayersCount {
    totalPlayersCount
  }
`;
