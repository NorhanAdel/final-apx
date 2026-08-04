export const CREATE_RATING = `
  mutation CreateRating($input: CreateRatingInput!) {
    createRating(input: $input) {
      id
      player_id
      technical_skill
      physical_fitness
      game_intelligence
      mental_resilience
      professionalism
      growth_potential
      market_readiness
      calculated_stars
      notes
      created_at
    }
  }
`;

export const UPDATE_RATING = `
  mutation UpdateRating($id: ID!, $input: UpdateRatingInput!) {
    updateRating(id: $id, input: $input) {
      id
      player_id
      technical_skill
      physical_fitness
      game_intelligence
      mental_resilience
      professionalism
      growth_potential
      market_readiness
      calculated_stars
      notes
      updated_at
    }
  }
`;

export const DELETE_RATING = `
  mutation DeleteRating($id: ID!) {
    deleteRating(id: $id)
  }
`;
