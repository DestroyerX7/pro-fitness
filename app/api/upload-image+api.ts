import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  const { file } = await request.json();

  const response = await cloudinary.uploader.upload(file, {
    resource_type: "image",
    folder: "pro-fitness-uploads",
  });

  return Response.json({ url: response.url });
}

// const fileBuffer = req.file.buffer;

// // Upload buffer to Cloudinary
// const streamUpload = (buffer: Buffer) => {
//   return new Promise<any>((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: req.body.folder || 'uploads' },
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// };

// const result = await streamUpload(fileBuffer);

// res.json({ url: result.secure_url });
