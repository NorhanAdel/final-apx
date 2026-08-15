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
          adminRating
          externalGroupRating
          aiAnalysisScore
          playerSelfRating
          transferValue
          favoriteCount
          profileViews
          bmiScore
        }
        alignmentScore {
          score
          status
          label
          description
          selfRatingPercentage
          objectiveConsensusScore
          gap
        }
        viewsCount
        createdAt
        position
        ratingsDetails {
          totalRatings
          averageStars
          averagePercentage
          technicalSkillPercent
          physicalFitnessPercent
          gameIntelligencePercent
          mentalResiliencePercent
          professionalismPercent
          growthPotentialPercent
          marketReadinessPercent
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
        adminRating
        externalGroupRating
        aiAnalysisScore
        playerSelfRating
        transferValue
        favoriteCount
        profileViews
        bmiScore
      }
      alignmentScore {
        score
        status
        label
        description
        selfRatingPercentage
        objectiveConsensusScore
        gap
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

export const GET_SUPER7_SCORE_PERCENTAGES = `
  query Super7ScorePercentages {
    super7ScorePercentages {
      ADMIN
      EXTERNAL_GROUPS
      AI_ANALYSIS
      PLAYER_SELF
      TRANSFER_VALUE
      FAVORITE_COUNT
      PROFILE_VIEWS
      BMI_SCORE
    }
  }
`;

export const GET_PLAYER_SKILLS = `
  query PlayerSkills($playerId: String!) {
    playerSkills(playerId: $playerId) {
      technicalSkill
      physicalFitness
      gameIntelligence
      mentalResilience
      professionalism
      growthPotential
      marketReadiness
      totalRatings
      averageStars
      averagePercentage
    }
  }
`;