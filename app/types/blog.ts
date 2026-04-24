  
export interface BlogCategory {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  category_id: string;
  category?: BlogCategory | null;
  sport_id?: string | null;
  sport?: Sport | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}