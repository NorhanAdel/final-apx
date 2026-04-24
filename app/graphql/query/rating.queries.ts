export const GET_RATING = `
  query GetRating($id: ID!) {
    rating(id: $id) {
      id
      rater_id
      player_id
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
    }
  }
`;

export const GET_MY_RATINGS = `
  query GetMyRatings {
    myRatings {
      id
      player_id
      calculated_stars
      notes
      created_at
      player {
        first_name
        last_name
      }
    }
  }
`;

export const GET_MY_RATING_FOR_PLAYER = `
  query GetMyRatingForPlayer($playerId: ID!) {
    myRatingForPlayer(playerId: $playerId) {
      id
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
    }
  }
`;
export const GET_PLAYER_RATINGS = `
  query GetPlayerRatings($playerId: ID!) {
    playerRatings(playerId: $playerId) {
      id
      rater_id
      scalability
      technical_skill
      calculated_stars
      notes
      created_at
    }
  }
`;

export const GET_PLAYER_AVERAGE_RATINGS = `
  query GetPlayerAverageRatings($playerId: ID!) {
    playerAverageRatings(playerId: $playerId) {
      averageStars
      scalabilityPercent
      mentalStabilityPercent
      soccerIntelligencePercent
      physicalFitnessPercent
      technicalSkillPercent
      tacticalVisionPercent
      republicanInfluencePercent
      totalRatings
    }
  }
`;
