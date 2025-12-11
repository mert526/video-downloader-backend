import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ana endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Video Downloader API çalışıyor!' });
});

// Video bilgisi al
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Geçersiz YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    
    res.json({
      success: true,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name,
      views: info.videoDetails.viewCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Video bilgisi alınamadı' });
  }
});

// Video indir
app.post('/api/download', async (req, res) => {
  try {
    const { url, format } = req.body;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Geçersiz YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    
    // Format seçimi
    let quality = 'highest';
    let filter = 'audioandvideo';
    
    if (format === 'MP3' || format === 'WAV') {
      filter = 'audioonly';
      quality = 'highestaudio';
    } else if (format === 'MP4 HD') {
      quality = 'highestvideo';
    }

    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.${format.toLowerCase()}"`);
    
    ytdl(url, {
      quality: quality,
      filter: filter
    }).pipe(res);

  } catch (error) {
    res.status(500).json({ error: 'İndirme başarısız' });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
```

**C) `.gitignore`**
```
node_modules/
.env
