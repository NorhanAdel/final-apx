import { gql } from "@apollo/client";

// Club Career Information
export const GET_MY_CLUB_CAREER = `
  query GetMyClubCareer {
    myClubCareer {
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

// Professional Debut Options
export const GET_PROFESSIONAL_DEBUT_OPTIONS = `
  query GetProfessionalDebutOptions($lang: String) {
    getProfessionalDebutOptions(lang: $lang) {
      value
      label
    }
  }
`;

// Player Media
export const GET_MY_VIDEOS = gql`
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

export const GET_MY_VIDEOS_AND_SPORTS = gql`
  query GetMyVideosAndSports {
    sports {
      id
      name
    }
    myPhotos {
      id
      image_url
    }
    myVideos {
      id
      video_url
      title
      duration_seconds
      reels {
        id
      }
    }
  }
`;

export const GET_MY_PHOTOS = gql`
  query MyPhotos {
    myPhotos {
      id
      image_url
      caption
      created_at
    }
  }
`;

export const GET_PLAYER_DATA = `
  query GetPlayerMedia {
    sports { id name }
    myPhotos { id image_url }
    myVideos { 
      id 
      video_url 
      title 
      reels { id } 
    }
  }
`;

export const GET_PLAYER_PROFILE = `
  query GetPlayerProfile($id: String!) {
    playerProfile(id: $id) {
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
      trust_level
      views_count
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
        scalability
        technical_skill
        calculated_stars
        notes
        created_at
        rater {
          id
          first_name
          last_name
        }
      }
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

// Skill Level Options (dropdown for playing_style)
export const GET_SKILL_LEVEL_OPTIONS = `
  query GetSkillLevelOptions($lang: String) {
    getSkillLevelOptions(lang: $lang) {
      value
      label
    }
  }
`;

// Professional Goals Options (multi-select dropdown for strengths)
export const GET_GOAL_OPTIONS = `
  query GetGoalOptions($lang: String) {
    getGoalOptions(lang: $lang) {
      value
      label
    }
  }
`;