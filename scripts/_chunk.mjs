import sharp from 'sharp';
const [,, f, h, prefix, max] = process.argv; const m = await sharp(f).metadata(); const H=+h; let n=0;
for (let y=0;y<m.height && n<(+max||99);y+=H,n++){ await sharp(f).extract({left:0,top:y,width:m.width,height:Math.min(H,m.height-y)}).toFile(`${prefix}-${n}.png`);} console.log(m.width,m.height,n);
