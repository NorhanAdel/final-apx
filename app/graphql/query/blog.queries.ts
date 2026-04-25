export const GET_BLOG_BY_ID = `
  query GetBlog($id: ID!) {
    blog(id: $id) {
      id
      title
      content
      created_at
      cover_image_url
      views_count
    }
  }
`;

export const GET_ALL_BLOGS = `
  query GetAllBlogs($skip: Int, $take: Int) {
    blogs(skip: $skip, take: $take) {
      id
      title
      content
      created_at
      cover_image_url
      is_published
      views_count
      category {
        id
        name
      }
    }
  }
`;

export const GET_BLOGS_BY_CATEGORY = `
  query GetBlogsByCategory($categoryId: ID!, $skip: Int, $take: Int) {
    blogsByCategory(categoryId: $categoryId, skip: $skip, take: $take) {
      id
      title
      content
      created_at
      cover_image_url
      is_published
      views_count
    }
  }
`;

export const SEARCH_BLOGS = `
  query SearchBlogs($searchTerm: String!, $skip: Int, $take: Int) {
    searchBlogs(searchTerm: $searchTerm, skip: $skip, take: $take) {
      id
      title
      content
      created_at
      cover_image_url
      is_published
      views_count
    }
  }
`;
