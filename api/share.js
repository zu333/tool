import express from 'express';
import path from 'path';
import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

const app = express();
app.use(express.json({limit: '50mb'}));

const firebaseConfig = {
  apiKey: "AIzaSyBsr72VFXwgW3dsJyhjGnisWgtlSA4ynVY",
  authDomain: "school-c9633.firebaseapp.com",
  databaseURL: "https://school-c9633-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "school-c9633",
  storageBucket: "school-c9633.firebasestorage.app",
  messagingSenderId: "293275030223",
  appId: "1:293275030223:web:a52db38e099c4dc7019dba"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

async function getInfoCards() {
    try {
        const snapshot = await get(ref(db, "siteData/infoCards"));
        if (snapshot.exists()) {
            return snapshot.val().data;
        }
    } catch (e) {
        console.error("Firebase read error:", e);
    }
    return null;
}

async function saveInfoCards(infoCards) {
    try {
        await set(ref(db, "siteData/infoCards"), { data: infoCards });
    } catch (e) {
        console.error("Firebase save error:", e);
    }
}

app.post('/api/save-info', async (req, res) => {
    await saveInfoCards(req.body);
    res.json({ success: true });
});

app.get('/api/image/:postId', async (req, res) => {
    const infoCards = await getInfoCards();
    if (infoCards) {
        const post = infoCards.find(p => String(p.id) === req.params.postId);
        if (post && post.img && post.img.startsWith('data:image/')) {
            const matches = post.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const type = matches[1];
                const data = Buffer.from(matches[2], 'base64');
                res.writeHead(200, {
                    'Content-Type': type,
                    'Content-Length': data.length,
                    'Cache-Control': 'public, max-age=31536000'
                });
                return res.end(data);
            }
        }
    }
    res.redirect('https://picsum.photos/seed/tooltea/600/340.jpg');
});

app.get('*', async (req, res) => {
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), 'index.html');
    }
    
    let html = '';
    try {
        html = fs.readFileSync(htmlPath, 'utf-8');
    } catch(e) {
        return res.status(500).send("HTML file not found");
    }
    
    const infoCards = await getInfoCards();
    const postIdMatch = req.url.match(/[?&]post=([^&]+)/);
    
    if (postIdMatch) {
        const postId = postIdMatch[1];
        let post = null;
        if (infoCards) {
            post = infoCards.find(p => String(p.id) === postId);
        }
        
        if (!post) {
            const defaultPosts = [
                {id: 1, title: "WhatsApp New Privacy Update 2025", desc: "WhatsApp ne naya privacy feature launch kiya hai...", img: "https://picsum.photos/seed/tooltea-social1/600/340.jpg"},
                {id: 2, title: "AI Tools Se Paise Kaise Kamaye", desc: "2025 me AI tools ka use karke online earning...", img: "https://picsum.photos/seed/tooltea-tech2/600/340.jpg"},
                {id: 3, title: "Instagram Reels Algorithm 2025", desc: "Naya algorithm kaise kaam karta hai...", img: "https://picsum.photos/seed/tooltea-trend3/600/340.jpg"},
                {id: 4, title: "Facebook Account Hack Se Bachen", desc: "Social media accounts ki security zaroori hai...", img: "https://picsum.photos/seed/tooltea-sec4/600/340.jpg"},
                {id: 5, title: "YouTube Shorts Monetization", desc: "YouTube ne shorts par bhi earning ka option...", img: "https://picsum.photos/seed/tooltea-yt5/600/340.jpg"},
                {id: 6, title: "Telegram Premium Features Free", desc: "Telegram ke premium features bina pay ke...", img: "https://picsum.photos/seed/tooltea-app6/600/340.jpg"}
            ];
            post = defaultPosts.find(p => String(p.id) === postId);
        }

        if (post) {
            const title = (post.title || '').replace(/"/g, '&quot;');
            const desc = (post.desc || '').toString().substring(0, 200).replace(/"/g, '&quot;');
            
            let imgUrl = post.img || '';
            if (imgUrl.startsWith('data:image/')) {
                // Determine protocol (Vercel uses x-forwarded-proto, else default to https)
                const protocol = req.headers['x-forwarded-proto'] || 'https';
                imgUrl = `${protocol}://${req.get('host')}/api/image/${post.id}`;
            }

            const ogTags = `
              <meta property="og:title" content="${title}" />
              <meta property="og:description" content="${desc}" />
              <meta property="og:image" content="${imgUrl}" />
              <meta property="og:url" content="https://${req.get('host')}${req.url}" />
              <meta property="og:type" content="article" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="${title}" />
              <meta name="twitter:description" content="${desc}" />
              <meta name="twitter:image" content="${imgUrl}" />
            `;
            html = html.replace('</head>', ogTags + '</head>');
        }
    }
    
    if (infoCards) {
        html = html.replace('<head>', `<head><script>window.__SERVER_DATA__ = ${JSON.stringify(infoCards)};</script>`);
    }
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

export default app;
