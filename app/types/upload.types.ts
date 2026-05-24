export interface UploadLimitsType {
  max_photos: number;
  max_videos: number;
  max_ads: number;
  uploaded_photos: number;
  uploaded_videos: number;
  uploaded_ads: number;
  remaining_photos: number;
  remaining_videos: number;
  remaining_ads: number;
  can_upload_photo: boolean;
  can_upload_video: boolean;
  can_create_ad: boolean;
}
