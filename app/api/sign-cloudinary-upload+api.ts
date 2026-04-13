import cloudinary from "@/lib/cloudinary";

export async function POST(_: Request) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: "pro-fitness-uploads" };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return Response.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: params.folder,
  });
}
