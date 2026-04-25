export const INCREMENT_BLOG_VIEWS = `
  mutation IncrementBlogViews($id: ID!) {
    incrementBlogViews(id: $id) {
      id
      views_count
    }
  }
`;
