"""Render a seamless two-photo banner loop (slow camera moves + crossfades) as raw frames on stdout."""
import sys
from PIL import Image
OW, OH, FPS = 1920, 800, 30
CLIP, FADE = 6.5, 1.3
A = Image.open(sys.argv[1]).convert('RGB')   # garden mandap 2000x1333
B = Image.open(sys.argv[2]).convert('RGB')   # stage 1790x1297
def ease(t): return t*t*(3-2*t)
def view(im, cx, cy, w):
    """Crop a window of width w (banner aspect) centred at cx,cy with sub-pixel accuracy."""
    h = w*OH/OW
    s = w/OW
    return im.transform((OW,OH), Image.AFFINE, (s,0,cx-w/2, 0,s,cy-h/2), resample=Image.BICUBIC)
def frameA(t):  # slow tilt down: floral canopy -> chairs and gold kalash
    p = ease(min(max(t/CLIP,0),1))
    return view(A, 1000, 470+260*p, 1960-120*p)
def frameB(t):  # slow pull-back from the monogram to the full stage
    p = ease(min(max(t/CLIP,0),1))
    return view(B, 895, 560+120*p, 1450+330*p)
n = int((2*CLIP - FADE)*FPS)          # A, then B; the last FADE of B blends back into A's first frame
a0 = frameA(0)
out = sys.stdout.buffer
for i in range(n):
    t = i/FPS
    if t < CLIP - FADE:
        f = frameA(t)
    elif t < CLIP:
        k = ease((t-(CLIP-FADE))/FADE); f = Image.blend(frameA(t), frameB(t-(CLIP-FADE)), k)
    elif t < 2*CLIP - 2*FADE:
        f = frameB(t-(CLIP-FADE))
    else:
        k = ease((t-(2*CLIP-2*FADE))/FADE); f = Image.blend(frameB(t-(CLIP-FADE)), a0, k)
    out.write(f.tobytes())
