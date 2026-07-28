export default async function handler(req, res) {
  const { id } = req.query;

  // Agar ID nahi hai, toh wapas homepage par bhej dein
  if (!id) {
    return res.redirect(302, '/');
  }

  try {
    // Firestore ke REST API se post ka data mangwayein
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/mimetic-victor-p3n78/databases/(default)/documents/infoCards/post_${id}`);
    const data = await response.json();

    // Agar post database mein nahi hai, toh homepage par bhej dein
    if (!data.fields) {
      return res.redirect(302, '/');
    }

    // Data extract karein
    const title = data.fields.title ? data.fields.title.stringValue : 'ToolTea';
    const desc = data.fields.desc ? data.fields.desc.stringValue : 'Social Information & Tools';
    const img = data.fields.img ? data.fields.img.stringValue : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&fit=crop';

    // Facebook aur WhatsApp ke liye HTML generate karein
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title} | ToolTea</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${img}">
        <meta property="og:url" content="https://tool799.vercel.app/?post=${id}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="${img}">
        
        <!-- Bot (Facebook/WhatsApp) image read kar lega, asli user ko redirect kar diya jayega -->
        <script>
          window.location.href = "/?post=${id}";
        </script>
      </head>
      <body style="background: #0A0A0A; color: white; font-family: sans-serif; text-align: center; padding-top: 50px;">
        <p>Loading post...</p>
        <p>Agar automatically redirect na ho toh <a href="/?post=${id}" style="color: #3b82f6;">yahan click karein</a>.</p>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    // Kisi bhi error ki soorat mein seedha homepage par redirect karein
    return res.redirect(302, '/');
  }
}