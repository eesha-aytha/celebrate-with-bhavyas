# Banner video loop

`videos/banner-loop.mp4` is built from the photos in this folder: a slow camera move on each photo with soft crossfades, looping seamlessly.

To rebuild it (for example after adding more photos and extending `make-loop.py`):

```bash
python3 make-loop.py 1-garden-mandap.jpg 2-monogram-stage.jpg | ffmpeg -y -f rawvideo -pix_fmt rgb24 -s 1920x800 -r 30 -i - -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an ../banner-loop.mp4
```

`2-monogram-stage.jpg` has been straightened and centered.
