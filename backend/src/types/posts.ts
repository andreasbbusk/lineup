export interface CreatePostBody {
  type: "note" | "request" | "story";
  title: string;
  description: string;
  tags?: string[];
  genres?: string[];
  location?: string;
  paidOpportunity?: boolean;
  taggedUsers?: string[];
  media?: {
    url: string;
    thumbnail_url?: string;
    type: string;
  }[];
}
