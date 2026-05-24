export const CREATE_AD_WITH_IMAGE = `
  mutation CreateAdWithImage($image: Upload!, $input: CreateAdInput!) {
    createAd(image: $image, input: $input) {
      id
      title
      description
      image_url
      video_url
      target_role
      status
      expires_at
      created_at
    }
  }
`;

export const CREATE_AD_WITH_VIDEO = `
  mutation CreateAdWithVideo($video: Upload!, $input: CreateAdInput!) {
    createAd(video: $video, input: $input) {
      id
      title
      description
      image_url
      video_url
      target_role
      status
      expires_at
      created_at
    }
  }
`;

export const CREATE_AD_WITH_BOTH = `
  mutation CreateAdWithBoth($image: Upload!, $video: Upload!, $input: CreateAdInput!) {
    createAd(image: $image, video: $video, input: $input) {
      id
      title
      description
      image_url
      video_url
      target_role
      status
      expires_at
      created_at
    }
  }
`;

export const UPDATE_AD = `
  mutation UpdateAd($adId: ID!, $input: UpdateAdInput!) {
    updateAd(adId: $adId, input: $input) {
      id
      title
      description
      target_role
      expires_at
      updated_at
    }
  }
`;

export const DELETE_AD = `
  mutation DeleteAd($adId: ID!) {
    deleteAd(adId: $adId)
  }
`;

export const INCREMENT_AD_VIEWS = `
  mutation IncrementAdViews($adId: ID!) {
    incrementAdViews(adId: $adId) {
      id
      views_count
    }
  }
`;
