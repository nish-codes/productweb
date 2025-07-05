export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "product-preset");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dj8fre7jc/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    return null;
  }
};
