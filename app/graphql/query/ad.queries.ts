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
export const GET_AD_WITH_USER = `
  query GetAdWithUser($id: ID!) {
    ad(id: $id) {
      id
      title
      description
      image_url
      video_url
      target_role
      status
      views_count
      created_at
      user {
        id
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

export const HAS_USER_VIEWED_AD = `
  query HasUserViewedAd($adId: ID!) {
    hasUserViewedAd(adId: $adId)
  }
`;

export const GET_AVAILABLE_AD_DURATIONS = `
  query GetAvailableAdDurations {
    availableAdDurationsForPlayer {
      id
      days
      price
    }
  }
`;

export const GET_AVAILABLE_AD_DURATIONS_FOR_ORG = `
  query GetAvailableAdDurationsForOrg {
    availableAdDurationsForOrg {
      id
      days
      price
    }
  }
`;

export const GET_MY_UPLOAD_LIMITS = `
  query GetMyUploadLimits {
    myUploadLimits {
      max_ads
      uploaded_ads
      remaining_ads
      can_create_ad
    }
  }
`;

export const GET_MY_ORGANIZATION_LIMITS = `
  query MyOrganizationLimits {
    myOrganizationLimits {
      max_ads
      ads_used
      ads_remaining
      can_create_ad
    }
  }
`;
