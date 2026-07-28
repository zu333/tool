export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect(302, '/');
  }

  try {
    // YAHAN FIRESTORE KI JAGAH REALTIME DATABASE KI API USE KI GAYI HAI (.json ke sath)
    const response = await fetch(`https://mimetic-victor-p3n78-default-rtdb.asia-southeast1.firebasedatabase.app/infoCards/post_${id}.json`);
    const data = await response.json();

    // Agar post majood na ho toh seedha homepage par le jao
    if (!data || data.error) {
      return res.redirect(302, '/');
    }

    // Realtime Database seedha text return karta hai, is liye fields extract karna bohut asan hai
    const title = data.title || 'ToolTea';
    const desc = data.desc || 'Social Information & Tools';
    const img = data.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=630&fit=crop';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title} | ToolTea</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${img}">
        <meta property="og:url" content="https://tool-ruby-seven.vercel.app/?post=${id}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="${img}">
        
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
    return res.redirect(302, '/');
  }
}
