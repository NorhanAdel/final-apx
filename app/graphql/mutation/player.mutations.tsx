import { gql } from "@apollo/client";

export const CREATE_PLAYER_PROFILE = `
  mutation CreatePlayerProfile($profileImage: Upload!, $verificationDoc: Upload!, $input: CreatePlayerProfileInput!) {
    createPlayerProfile(profileImage: $profileImage, verificationDoc: $verificationDoc, input: $input) {
      id
      first_name
      last_name
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
      updated_at
    }
  }
`;

export const UPLOAD_PHOTO = gql`
  mutation UploadPhoto($file: Upload!, $input: CreatePlayerPhotoInput!) {
    uploadPlayerPhoto(file: $file, input: $input) {
      id
      image_url
    }
  }
`;

export const UPLOAD_VIDEO = gql`
  mutation UploadPlayerVideo($file: Upload!, $input: CreatePlayerVideoInput!) {
    uploadPlayerVideo(file: $file, input: $input) {
      id
      video_url
      title
      reels {
        id
      }
    }
  }
`;

export const TOGGLE_REEL_STATUS = `
  mutation ToggleReel($id: String!) {
    toggleVideoReelStatus(videoId: $id) {
      is_reel
    }
  }
`;

export const DELETE_PHOTO = gql`
  mutation DeletePlayerPhoto($photoId: String!) {
    deletePlayerPhoto(photoId: $photoId)
  }
`;

export const DELETE_VIDEO = gql`
  mutation DeletePlayerVideo($videoId: String!) {
    deletePlayerVideo(videoId: $videoId)
  }
`;
