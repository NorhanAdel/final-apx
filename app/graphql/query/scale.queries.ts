// Super7 Scale Queries

export const GET_SUPER7_LEVELS = `
  query Super7Levels {
    super7Levels {
      level
      title
      description
      marketingTarget
      context
      minScore
      maxScore
    }
  }
`;

export const GET_PLAYERS_BY_LEVEL = `
  query PlayersByLevel($levelCode: String!, $searchTerm: String, $limit: Int, $skip: Int) {
    playersByLevel(levelCode: $levelCode, searchTerm: $searchTerm, limit: $limit, skip: $skip) {
      data {
        id
        name
        fullName
        profileImageUrl
        nationality
        country
        age
        level
        levelTitle
        super7Score
        super7Breakdown {
          userRating
          transferValue
          favoriteCount
          profileViews
        }
        viewsCount
        createdAt
        position
        ratingsDetails {
          totalRatings
          averageStars
          averagePercentage
          scalabilityPercent
          mentalStabilityPercent
          soccerIntelligencePercent
          physicalFitnessPercent
          technicalSkillPercent
          tacticalVisionPercent
          republicanInfluencePercent
        }
      }
      total
      skip
      take
    }
  }
`;

export const GET_PLAYER_SUPER7_SCORE = `
  query PlayerSuper7Score($playerId: String!) {
    playerSuper7Score(playerId: $playerId) {
      total
      level
      title
      breakdown {
        userRating
        transferValue
        favoriteCount
        profileViews
      }
    }
  }
`;

export const GET_PLAYER_SUPER7_LEVEL = `
  query PlayerSuper7Level($playerId: String!) {
    playerSuper7Level(playerId: $playerId) {
      level
      title
      description
      marketingTarget
      context
      minScore
      maxScore
    }
  }
`;

export const GET_SUPER7_LEADERBOARD = `
  query Super7Leaderboard($limit: Int) {
    super7Leaderboard(limit: $limit) {
      id
      name
      level
      levelTitle
      averageRating
      viewsCount
      profileImageUrl
    }
  }
`;
