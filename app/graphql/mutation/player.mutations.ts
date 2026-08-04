export const CREATE_PLAYER_PROFILE = `
  mutation CreatePlayerProfile($profileImage: Upload!, $verificationDoc: Upload, $input: CreatePlayerProfileInput!) {
    createPlayerProfile(profileImage: $profileImage, verificationDoc: $verificationDoc, input: $input) {
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
      created_at
    }
  }
`;

export const UPDATE_PLAYER_PROFILE = `
  mutation UpdateProfileWithFiles($playerId: String!, $profileImage: Upload, $verificationDoc: Upload, $input: UpdatePlayerProfileInput!) {
    updateProfileWithFiles(playerId: $playerId, profileImage: $profileImage, verificationDoc: $verificationDoc, input: $input) {
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
    }
  }
`;

export const CREATE_FOOTBALL_INFO = `
  mutation CreatePlayerFootballInfo($input: CreatePlayerFootballInfoInput!) {
    createPlayerFootballInfo(input: $input) {
      id
      position {
        id
        name
      }
      preferred_foot
      jersey_number
      playing_style
      strengths
      market_value
    }
  }
`;

export const UPDATE_FOOTBALL_INFO = `
  mutation UpdatePlayerFootballInfo($input: UpdatePlayerFootballInfoInput!) {
    updatePlayerFootballInfo(input: $input) {
      id
      position {
        id
        name
      }
      preferred_foot
      jersey_number
      playing_style
      strengths
      market_value
    }
  }
`;
export const UPDATE_PLAYER_CLUB_CAREER = `
  mutation UpdatePlayerClubCareer($input: UpdatePlayerClubCareerInput!) {
    updatePlayerClubCareer(input: $input) {
      id
      player_id
      current_club
      professional_debut
      previous_clubs
      created_at
      updated_at
    }
  }
`;

export const UPLOAD_PHOTO = `
  mutation UploadPhoto($file: Upload!, $input: CreatePlayerPhotoInput!) {
    uploadPlayerPhoto(file: $file, input: $input) {
      id
      image_url
    }
  }
`;

export const UPLOAD_VIDEO = `
  mutation UploadPlayerVideo($file: Upload!, $input: CreatePlayerVideoInput!) {
    uploadPlayerVideo(file: $file, input: $input) {
      id
      video_url
      title
    }
  }
`;

export const TOGGLE_REEL_STATUS = `
  mutation ToggleReel($id: String!, $eventType: String) {
    toggleVideoReelStatus(videoId: $id, eventType: $eventType) {
      is_reel
    }
  }
`;

export const DELETE_PHOTO = `
  mutation DeletePlayerPhoto($photoId: String!) {
    deletePlayerPhoto(photoId: $photoId)
  }
`;

export const DELETE_VIDEO = `
  mutation DeletePlayerVideo($videoId: String!) {
    deletePlayerVideo(videoId: $videoId)
  }
`;

export const CREATE_REEL_FROM_VIDEO = `
  mutation CreateReelFromVideo($videoId: ID!, $start_time: Int!, $end_time: Int!, $event_type: ReelEventType!) {
    createReelFromVideo(videoId: $videoId, start_time: $start_time, end_time: $end_time, event_type: $event_type) {
      id
      video_id
      start_time
      end_time
      event_type
      clip_url
    }
  }
`;

export const INCREMENT_UPLOAD_COUNT = `
  mutation IncrementUploadCount($type: String!) {
    incrementUploadCount(type: $type) {
      success
      remaining
    }
  }
`;

export const INCREMENT_PLAYER_VIEWS = `
  mutation IncrementPlayerViews($playerId: String!) {
    incrementPlayerViews(playerId: $playerId) {
      id
      views_count
    }
  }
`;