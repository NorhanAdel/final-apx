import { gql } from "@apollo/client";

export const GET_ALL_SPORTS = gql`
  query GetAllSports {
    sports {
      id
      name
      image_url
      created_at
    }
  }
`;
