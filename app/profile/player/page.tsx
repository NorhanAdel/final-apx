"use client";

import {
  User,
  Trophy,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";

import {
  useState,
  ChangeEvent,
  useEffect,
} from "react";

import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";

import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { uploadGraphQL } from "../../lib/uploadGraphQL";

import {
  UPLOAD_PHOTO,
  UPLOAD_VIDEO,
  DELETE_PHOTO,
  DELETE_VIDEO,
} from "@/app/graphql/mutation/player.mutations";

interface UploadLimits {
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

interface PlayerPhoto {
  id: string;
  image_url: string;
}

interface PlayerVideo {
  id: string;
  video_url: string;
  title: string;
}

interface Sport {
  id: string;
  name: string;
}

interface UserProfile {
  playerProfile?: {
    id?: string;
  };
}

function getFullUrl(url: string): string {
  if (!url) return "";

  if (
    url.startsWith("http") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  return `${API_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
}

export default function ImagesReels() {
  const { theme } = useTheme();

  const router = useRouter();

  const { t } = useTranslate();

  const isDark = theme === "dark";

  const [photos, setPhotos] = useState<
    PlayerPhoto[]
  >([]);

  const [videos, setVideos] = useState<
    PlayerVideo[]
  >([]);

  const [sports, setSports] = useState<
    Sport[]
  >([]);

  const [
    playerProfileId,
    setPlayerProfileId,
  ] = useState<string | null>(null);

  const [hasNewUploads, setHasNewUploads] =
    useState(false);

  const [selectedSportId, setSelectedSportId] =
    useState("");

  const [limits, setLimits] =
    useState<UploadLimits | null>(
      null
    );

  const [isUploading, setIsUploading] =
    useState(false);

  const [mainVideo, setMainVideo] =
    useState<string | null>(null);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result: any =
        await fetchGraphQL(`
          query {
            sports {
              id
              name
            }

            myPhotos {
              id
              image_url
            }

            myVideos {
              id
              video_url
              title
            }

            myUploadLimits {
              max_photos
              max_videos
              max_ads

              uploaded_photos
              uploaded_videos
              uploaded_ads

              remaining_photos
              remaining_videos
              remaining_ads

              can_upload_photo
              can_upload_video
              can_create_ad
            }
          }
        `);

      setPhotos(
        result?.data?.myPhotos || []
      );

      setVideos(
        result?.data?.myVideos || []
      );

      setSports(
        result?.data?.sports || []
      );

      setLimits(
        result?.data?.myUploadLimits
      );

      if (
        result?.data?.sports?.length > 0
      ) {
        setSelectedSportId(
          result.data.sports[0].id
        );
      }

      if (
        result?.data?.myVideos
          ?.length > 0
      ) {
        setMainVideo(
          result.data.myVideos[0]
            .video_url
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // CHECK LIMITS
  // =========================
  const canUploadPhoto = () => {
    return (
      (limits?.remaining_photos || 0) > 0
    );
  };

  const canUploadVideo = () => {
    return (
      (limits?.remaining_videos || 0) > 0
    );
  };

  // =========================
  // BUY EXTRA
  // =========================
 const buyExtra = async (
  type: "PHOTO" | "VIDEO"
) => {

  // =========================
  // CHECK IF USER STILL HAS SPACE
  // =========================
  if (
    type === "PHOTO" &&
    (limits?.remaining_photos || 0) > 0
  ) {
    toast.error(
      t(
        "You still have available photo uploads"
      )
    );

    return;
  }

  if (
    type === "VIDEO" &&
    (limits?.remaining_videos || 0) > 0
  ) {
    toast.error(
      t(
        "You still have available video uploads"
      )
    );

    return;
  }


    try {
      const res: any =
        await fetchGraphQL(
          `
          mutation PurchaseExtra($input: PurchaseExtraItemInput!) {
            purchaseExtraItem(input: $input) {
              success
              message
              purchase_id
            }
          }
        `,
          {
            input: {
              unit_type: type,
              quantity: 1,

              card: {
                cardholder_name:
                  "Test User",

                card_number:
                  "4111111111111111",

                expiry_month: 12,

                expiry_year: 2028,

                cvv: "123",
              },
            },
          }
        );

      if (res.errors) {
        toast.error(
          res.errors[0].message
        );

        return;
      }

      toast.success(
        type === "PHOTO"
          ? t(
              "Extra photo purchased"
            )
          : t(
              "Extra video purchased"
            )
      );

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // UPLOAD PHOTO
  // =========================
  const handlePhotoUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!canUploadPhoto()) {
      toast.error(
        t("Photo limit reached")
      );

      e.target.value = "";

      return;
    }

    setIsUploading(true);

    try {
      const result: any =
        await uploadGraphQL(
          UPLOAD_PHOTO,
          {
            file,

            input: {
              is_main: false,
              caption: "",
            },
          }
        );

      if (result.errors) {
        toast.error(
          result.errors[0].message
        );

        return;
      }

      toast.success(
        t("Photo uploaded")
      );

      setHasNewUploads(true);

      if (
        result?.data?.uploadPlayerPhoto
      ) {
        setPhotos((prev) => [
          ...prev,
          result.data.uploadPlayerPhoto,
        ]);
      }

      setLimits((prev: any) => {
        if (!prev) return prev;

        const remaining =
          prev.remaining_photos - 1;

        return {
          ...prev,

          uploaded_photos:
            prev.uploaded_photos + 1,

          remaining_photos:
            Math.max(0, remaining),

          can_upload_photo:
            remaining > 0,
        };
      });
    } catch (err) {
      console.log(err);

      toast.error(
        t("Upload failed")
      );
    } finally {
      setIsUploading(false);

      e.target.value = "";
    }
  };

  // =========================
  // UPLOAD VIDEO
  // =========================
  const handleVideoUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!canUploadVideo()) {
      toast.error(
        t("Video limit reached")
      );

      e.target.value = "";

      return;
    }

    setIsUploading(true);

    try {
      const result: any =
        await uploadGraphQL(
          UPLOAD_VIDEO,
          {
            file,

            input: {
              title: "Highlight",

              type: "HIGHLIGHT",

              sport_id:
                selectedSportId,

              duration_seconds: 30,

              create_reel: false,
            },
          }
        );

      if (result.errors) {
        toast.error(
          result.errors[0].message
        );

        return;
      }

      toast.success(
        t("Video uploaded")
      );

      setHasNewUploads(true);

      if (
        result?.data?.uploadPlayerVideo
      ) {
        setVideos((prev) => [
          ...prev,
          result.data.uploadPlayerVideo,
        ]);

        if (!mainVideo) {
          setMainVideo(
            result.data
              .uploadPlayerVideo
              .video_url
          );
        }
      }

      setLimits((prev: any) => {
        if (!prev) return prev;

        const remaining =
          prev.remaining_videos - 1;

        return {
          ...prev,

          uploaded_videos:
            prev.uploaded_videos + 1,

          remaining_videos:
            Math.max(0, remaining),

          can_upload_video:
            remaining > 0,
        };
      });
    } catch (err) {
      console.log(err);

      toast.error(
        t("Upload failed")
      );
    } finally {
      setIsUploading(false);

      e.target.value = "";
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (
    id: string,
    type: "image" | "video"
  ) => {
    try {
      const mutation =
        type === "image"
          ? DELETE_PHOTO
          : DELETE_VIDEO;

      const variables =
        type === "image"
          ? { photoId: id }
          : { videoId: id };

      const result: any =
        await fetchGraphQL(
          mutation,
          variables
        );

      if (result.errors) {
        toast.error(
          result.errors[0].message
        );

        return;
      }

      toast.success(
        t("Deleted successfully")
      );

      if (type === "image") {
        setPhotos((prev) =>
          prev.filter(
            (p) => p.id !== id
          )
        );

        setLimits((prev: any) => ({
          ...prev,

          uploaded_photos:
            Math.max(
              0,
              prev.uploaded_photos - 1
            ),

          remaining_photos:
            prev.remaining_photos + 1,

          can_upload_photo: true,
        }));
      }

      if (type === "video") {
        setVideos((prev) =>
          prev.filter(
            (v) => v.id !== id
          )
        );

        setLimits((prev: any) => ({
          ...prev,

          uploaded_videos:
            Math.max(
              0,
              prev.uploaded_videos - 1
            ),

          remaining_videos:
            prev.remaining_videos + 1,

          can_upload_video: true,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitProfile =
    async () => {
      let finalPlayerId =
        playerProfileId;

      if (!finalPlayerId) {
        try {
          const storedUser =
            localStorage.getItem(
              "user"
            );

          if (storedUser) {
            const user: UserProfile =
              JSON.parse(storedUser);

            finalPlayerId =
              user.playerProfile?.id ||
              null;
          }
        } catch (err) {
          console.error(
            "Error getting user profile:",
            err
          );
        }
      }

      if (!finalPlayerId) {
        try {
          const result: any =
            await fetchGraphQL(
              `
          query GetMyPlayerId {
            myPlayerProfile {
              id
            }
          }
        `
            );

          if (
            result.data
              ?.myPlayerProfile?.id
          ) {
            finalPlayerId =
              result.data
                .myPlayerProfile.id;

            setPlayerProfileId(
              finalPlayerId
            );

            try {
              const storedUser =
                localStorage.getItem(
                  "user"
                );

              if (storedUser) {
                const user =
                  JSON.parse(
                    storedUser
                  );

                if (
                  !user.playerProfile
                ) {
                  user.playerProfile =
                    {};
                }

                user.playerProfile.id =
                  finalPlayerId;

                localStorage.setItem(
                  "user",
                  JSON.stringify(user)
                );
              }
            } catch (e) {
              console.error(
                "Failed to update localStorage:",
                e
              );
            }
          }
        } catch (err) {
          console.error(
            "Failed to fetch player ID:",
            err
          );
        }
      }

      if (!finalPlayerId) {
        toast.error(
          t(
            "Player profile not found"
          )
        );

        router.push("/");

        return;
      }

      const hasUploads =
        photos.length > 0 ||
        videos.length > 0;

      if (!hasUploads) {
        toast.error(
          t(
            "Please upload at least one photo or video"
          )
        );

        return;
      }

      toast.success(
        t(
          "Profile submitted successfully!"
        )
      );

      setTimeout(() => {
        router.push(
          `/players/${finalPlayerId}`
        );
      }, 1500);
    };

  return (
  <div
    className={`min-h-screen py-32 px-6 ${
      isDark
        ? "bg-[#020617] text-white"
        : "bg-gray-50 text-black"
    }`}
  >
    <div className="max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-black text-center text-yellow-400 mb-14">
        {t("Images & Videos")}
      </h1>

      {/* STEPS */}
      <div className="flex justify-center items-center gap-6 mb-14">
        <Step
          icon={<User />}
          isDark={isDark}
        />

        <Line isDark={isDark} />

        <Step
          icon={<Trophy />}
          isDark={isDark}
        />

        <Line isDark={isDark} />

        <Step
          icon={<DollarSign />}
          isDark={isDark}
        />

        <Line isDark={isDark} />

        <Step
          active
          icon={<ImageIcon />}
          isDark={isDark}
        />
      </div>

      {/* LIMITS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
          <p className="text-sm opacity-80">
            {t("Photos")}
          </p>

          <h2 className="text-4xl font-black mt-2">
            {limits?.remaining_photos || 0}
          </h2>

          <p className="mt-2 text-sm opacity-70">
            {limits?.uploaded_photos} / {limits?.max_photos}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
          <p className="text-sm opacity-80">
            {t("Videos")}
          </p>

          <h2 className="text-4xl font-black mt-2">
            {limits?.remaining_videos || 0}
          </h2>

          <p className="mt-2 text-sm opacity-70">
            {limits?.uploaded_videos} / {limits?.max_videos}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white">
          <p className="text-sm opacity-80">
            {t("Ads")}
          </p>

          <h2 className="text-4xl font-black mt-2">
            {limits?.remaining_ads || 0}
          </h2>
        </div>

      </div>

      {/* BUY EXTRA */}
     {/* BUY EXTRA */}
<div className="flex flex-wrap gap-4 mb-14">

  {!canUploadPhoto() && (
    <button
      onClick={() =>
        buyExtra("PHOTO")
      }
      className="px-6 py-3 rounded-2xl bg-cyan-500 text-white font-bold"
    >
      + {t("Buy Extra Photo")}
    </button>
  )}

  {!canUploadVideo() && (
    <button
      onClick={() =>
        buyExtra("VIDEO")
      }
      className="px-6 py-3 rounded-2xl bg-pink-500 text-white font-bold"
    >
      + {t("Buy Extra Video")}
    </button>
  )}

</div>

      {/* PHOTOS */}
      <div className="mb-16">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">
            {t("Photos")}
          </h2>

          <label
            className={`cursor-pointer ${
              !canUploadPhoto()
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={
                handlePhotoUpload
              }
            />

            <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center">
              <Plus />
            </div>

          </label>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          {photos.map((p) => (
            <div
              key={p.id}
              className="relative h-44 rounded-2xl overflow-hidden group"
            >
              <Image
                src={getFullUrl(
                  p.image_url
                )}
                alt=""
                fill
                className="object-cover group-hover:scale-110 transition"
              />

              <button
                onClick={() =>
                  handleDelete(
                    p.id,
                    "image"
                  )
                }
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}

        </div>

      </div>

      {/* SPORT */}
      <div className="mb-6 relative w-64">

        <select
          value={selectedSportId}
          onChange={(e) =>
            setSelectedSportId(
              e.target.value
            )
          }
          className={`w-full rounded-xl px-4 py-3 appearance-none outline-none ${
            isDark
              ? "bg-[#0b1736] border border-[#1e2d5a]"
              : "bg-white border border-gray-300"
          }`}
        >
          {sports.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {s.name}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-4 text-gray-400"
        />

      </div>

      {/* MAIN VIDEO */}
      <div
        className={`w-full h-[450px] rounded-3xl overflow-hidden mb-8 border ${
          isDark
            ? "bg-black border-[#1e293b]"
            : "bg-white border-gray-300"
        }`}
      >
        {mainVideo ? (
          <video
            src={getFullUrl(
              mainVideo
            )}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {t("No video selected")}
          </div>
        )}
      </div>

      {/* VIDEOS */}
      <div className="flex flex-wrap gap-5 mb-10">

        {videos.map((v) => (
          <div
            key={v.id}
            className="relative group"
          >
            <video
              src={getFullUrl(
                v.video_url
              )}
              onClick={() =>
                setMainVideo(
                  v.video_url
                )
              }
              className={`w-40 h-28 rounded-2xl object-cover cursor-pointer border-2 ${
                mainVideo ===
                v.video_url
                  ? "border-yellow-400"
                  : "border-transparent"
              }`}
            />

            <button
              onClick={() =>
                handleDelete(
                  v.id,
                  "video"
                )
              }
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>

            <p className="text-xs mt-2 text-center">
              {v.title}
            </p>
          </div>
        ))}

        {/* ADD VIDEO */}
        <label
          className={`w-28 h-28 rounded-2xl flex items-center justify-center cursor-pointer border-2 border-dashed ${
            !canUploadVideo()
              ? "opacity-50 pointer-events-none"
              : ""
          } ${
            isDark
              ? "border-[#1e293b] bg-[#0b1120]"
              : "border-gray-300 bg-white"
          }`}
        >
          <Plus className="text-pink-500" />

          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={
              handleVideoUpload
            }
          />
        </label>

      </div>

      {/* SUBMIT */}
      <div className="flex justify-between mt-14">

        <button
          onClick={() =>
            router.back()
          }
          className={`px-10 py-3 rounded-2xl ${
            isDark
              ? "bg-[#1e293b]"
              : "bg-gray-200"
          }`}
        >
          {t("Previous")}
        </button>

        <button
          onClick={handleSubmitProfile}
          disabled={isUploading}
          className="px-12 py-3 rounded-2xl bg-yellow-400 text-black font-bold hover:scale-105 transition disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("Submit")
          )}
        </button>

      </div>

      {/* LOADING */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <Loader2 className="animate-spin text-yellow-400 w-14 h-14" />

        </div>
      )}

    </div>
  </div>
);
}

function Step({
  icon,
  active,
  isDark,
}: {
  icon: React.ReactNode;
  active?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center ${
        active
          ? "bg-yellow-400 text-black"
          : isDark
          ? "bg-[#0b1120] border border-[#1e293b] text-gray-400"
          : "bg-white border border-gray-300 text-gray-500"
      }`}
    >
      {icon}
    </div>
  );
}

function Line({
  isDark,
}: {
  isDark: boolean;
}) {
  return (
    <div
      className={`w-16 h-[2px] ${
        isDark
          ? "bg-[#1e293b]"
          : "bg-gray-300"
      }`}
    />
  );
}
