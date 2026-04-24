export const GET_ACTIVE_ADS = `
  query GetActiveAds {
    activeAds {
      id
      title
      description
      image_url
      video_url
      target_role
      views_count
      created_at
    }
  }
`;

export const GET_MY_ADS = `
  query GetMyAds {
    myAds {
      id
      title
      description
      image_url
      video_url
      status
      target_role
      views_count
      expires_at
      created_at
      updated_at
      user {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

export const GET_AD_BY_ID = `
  query GetAdById($id: ID!) {
    ad(id: $id) {
      id
      title
      description
      image_url
      video_url
      target_role
      status
      views_count
      expires_at
      created_at
      updated_at
      user {
        id
        email
        first_name
        last_name
        role
      }
    }
  }
`;

export const SEARCH_ADS = `
  query SearchAds($searchTerm: String!) {
    searchAds(searchTerm: $searchTerm) {
      id
      title
      description
      image_url
      video_url
      target_role
      views_count
      created_at
    }
  }
`;
