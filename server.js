import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// In-memory store for temporary images
// ID -> { buffer: Buffer, mimeType: string, expiresAt: number }
const imageStore = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

// Clean up expired images every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of imageStore.entries()) {
    if (now > data.expiresAt) {
      imageStore.delete(id);
      console.log(`[Store] Expired and removed image: ${id}`);
    }
  }
}, 60 * 1000);

// Endpoint to upload a temporary image (Base64 json format)
app.post('/api/temp-image', (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Expecting base64 data url, e.g. "data:image/png;base64,iVBORw0KGgo..."
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format. Must be a valid Data URL' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique ID
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + TTL;

    imageStore.set(id, {
      buffer,
      mimeType,
      expiresAt
    });

    console.log(`[Store] Uploaded temporary image ${id}. Size: ${(buffer.length / 1024).toFixed(1)} KB. Expires at: ${new Date(expiresAt).toLocaleTimeString()}`);

    // Return the public URL for sharing
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const url = `${protocol}://${host}/api/temp-image/${id}`;
    
    res.json({ id, url });
  } catch (error) {
    console.error('Error uploading temporary image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to serve the raw image data
app.get('/api/temp-image/raw/:id', (req, res) => {
  const { id } = req.params;
  const imageData = imageStore.get(id);

  if (!imageData || Date.now() > imageData.expiresAt) {
    // If expired, clean it up just in case
    if (imageData) imageStore.delete(id);
    return res.status(404).send('Image not found or expired');
  }

  res.set({
    'Content-Type': imageData.mimeType,
    'Cache-Control': 'public, max-age=300', // Cache for 5 mins
    'Content-Length': imageData.buffer.length
  });
  res.send(imageData.buffer);
});

// Endpoint to serve the HTML page with Open Graph headers for Twitter/X cards
app.get('/api/temp-image/:id', (req, res) => {
  const { id } = req.params;
  const imageData = imageStore.get(id);

  if (!imageData || Date.now() > imageData.expiresAt) {
    if (imageData) imageStore.delete(id);
    return res.status(404).send('Pass not found or expired. Please generate a new one.');
  }

  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const rawImageUrl = `${protocol}://${host}/api/temp-image/raw/${id}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HH Goa 2026 Hacker Pass</title>
  
  <!-- Open Graph Meta Tags (for Twitter/X Card preview) -->
  <meta property="og:title" content="HH Goa 2026 Hacker Pass">
  <meta property="og:description" content="Claiming my identity at HH Goa 2026! Generate your own custom pass #FrameInGoa.">
  <meta property="og:image" content="${rawImageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${protocol}://${host}/api/temp-image/${id}">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="HH Goa 2026 Hacker Pass">
  <meta name="twitter:description" content="Claiming my identity at HH Goa 2026! Generate your own custom pass #FrameInGoa.">
  <meta name="twitter:image" content="${rawImageUrl}">
  <meta name="twitter:site" content="@HHGoa">

  <style>
    body {
      background-color: #0A0B10;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      text-align: center;
      max-width: 500px;
      padding: 20px;
    }
    .badge-image {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 90, 95, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 24px;
    }
    h1 {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #FFFFFF 30%, #FF5A5F 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #8E9AA8;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FF5A5F 0%, #E0484C 100%);
      color: #FFFFFF;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 20px rgba(255, 90, 95, 0.2);
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 25px rgba(255, 90, 95, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>HH Goa 2026</h1>
    <img src="${rawImageUrl}" class="badge-image" alt="Hacker Pass" />
    <p>Check out my custom hacker pass for HH Goa 2026. Create and frame yours now!</p>
    <a href="${protocol}://${host}/" class="btn">Generate Your Pass</a>
  </div>
</body>
</html>`;

  res.send(html);
});

// Serve frontend static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for frontend routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HH Goa 2026 Studio - Development Mode</title>
        <style>
          body {
            background-color: #0A0B10;
            color: #FFFFFF;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 50px;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 40px;
            border-radius: 16px;
            display: inline-block;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
          h2 {
            color: #FF5A5F;
            margin-top: 0;
            font-weight: 800;
          }
          p {
            color: #8E9AA8;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          a {
            color: #00F2FE;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          pre {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 12px;
            border-radius: 8px;
            text-align: left;
            font-family: monospace;
            color: #A7FF37;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Production Build Not Found</h2>
          <p>The production distribution directory (<code>dist/</code>) does not exist yet.</p>
          <p>To run the app in development mode, please visit the Vite development server:</p>
          <p><a href="http://localhost:5173/"><strong>http://localhost:5173/</strong></a></p>
          <p>Or build the project for production deployment by running:</p>
          <pre>npm run build</pre>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Express temp-image backend running on port ${PORT}`);
});
