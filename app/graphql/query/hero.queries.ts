export const GET_ALL_HERO_VIDEOS = `
  query GetAllHeroVideos {
    allHeroVideos {
      id
      title
      video_url
      order
      created_at
    }
  }
`;