"""Build the Praesto A/B vector lockups from the licensed local JetBrains Mono face."""
import argparse, hashlib, json, re, shutil
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--tools-path', default='')
args=parser.parse_args()
if args.tools_path:
    import sys
    sys.path.insert(0,args.tools_path)
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

root=Path(__file__).resolve().parent.parent
out=root/'public/brand/praesto'
served=root/'static/brand/praesto'
out.mkdir(parents=True,exist_ok=True)
served.mkdir(parents=True,exist_ok=True)
font_path=root/'static/fonts/jetbrainsmono-variable-latin.woff2'
font=instantiateVariableFont(TTFont(font_path), {'wght':550}, inplace=False)
glyphs=font.getGlyphSet()
cmap=font.getBestCmap()
upm=font['head'].unitsPerEm
word='praesto'
ink_bounds=[]
for letter in word:
    pen=BoundsPen(glyphs)
    glyphs[cmap[ord(letter)]].draw(pen)
    ink_bounds.append(pen.bounds)
ymin=min(b[1] for b in ink_bounds)
ymax=max(b[3] for b in ink_bounds)

def wordmark(x,center_y,size,ink):
    scale=size/upm
    baseline=center_y+scale*(ymax+ymin)/2
    result=[]
    for letter in word:
        name=cmap[ord(letter)]
        pen=SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        d=re.sub(r'-?\d+\.\d+',lambda m:format(float(m.group()),'.4f').rstrip('0').rstrip('.'),pen.getCommands())
        result.append(f'<path d="{d}" transform="translate({x:.4f} {baseline:.4f}) scale({scale:.6f} {-scale:.6f})"/>')
        x+=font['hmtx'][name][0]*scale-size*.02
    return f'<g fill="{ink}">'+''.join(result)+'</g>'

def mark(direction,ink,dot,micro=False):
    stem='<rect x="14" y="14" width="20" height="92" rx="10" fill="'+ink+'"/>'
    if micro:
        stem='<rect x="12" y="14" width="22" height="92" rx="11" fill="'+ink+'"/>'
    if direction=='a':
        bowl=f'<circle cx="76" cy="45" r="26.5" fill="none" stroke="{ink}" stroke-width="9"/><circle cx="76" cy="45" r="{7.5 if micro else 7}" fill="{dot}"/>'
    else:
        right=81 if micro else 79
        bowl=f'<defs><clipPath id="left"><rect width="73" height="120"/></clipPath><clipPath id="right"><rect x="{right}" width="{120-right}" height="120"/></clipPath></defs><circle cx="76" cy="45" r="31" fill="{ink}" clip-path="url(#left)"/><circle cx="76" cy="45" r="26.5" fill="none" stroke="{ink}" stroke-width="9" clip-path="url(#right)"/><circle cx="90" cy="45" r="{6.5 if micro else 6}" fill="{dot}"/>'
    return stem+bowl

def svg(view,body,title,style=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-labelledby="title"><title id="title">{title}</title>{style}{body}</svg>\n'

files=[]
for direction in ['b','a']:
    for accent,ink,dot,bg in [('light','#17191d','#0a8f5a','#ffffff'),('dark','#ffffff','#3ddc97','#17191d')]:
        art=mark(direction,ink,dot)
        variants={
            'horizontal':svg('0 0 400 128',f'<g transform="translate(0 4)">{art}</g>'+wordmark(142,64,58,ink),f'Praesto {direction.upper()} — horizontal, {accent} accent'),
            'stacked':svg('0 0 320 220',f'<g transform="translate(100 6)">{art}</g>'+wordmark(62,176,48,ink),f'Praesto {direction.upper()} — stacked, {accent} accent'),
            'monogram':svg('0 0 120 120',art,f'Praesto {direction.upper()} — monogram, {accent} accent'),
            'favicon':svg('8 8 104 104',mark(direction,ink,dot,True),f'Praesto {direction.upper()} — optical favicon, {accent} accent'),
            'app-icon':svg('0 0 512 512',f'<g transform="translate(96 96) scale(2.666667)">{art}</g>',f'Praesto {direction.upper()} — transparent app icon, {accent} accent'),
            'app-tile':svg('0 0 512 512',f'<rect width="512" height="512" rx="112" fill="{bg}"/><g transform="translate(96 96) scale(2.666667)">{art}</g>',f'Praesto {direction.upper()} — platform app tile, {accent} accent'),
        }
        for kind,content in variants.items():
            name=f'praesto-{direction}-{kind}-{accent}.svg'
            (out/name).write_text(content,encoding='utf8')
            (served/name).write_text(content,encoding='utf8')
            files.append({'file':name,'direction':direction.upper(),'kind':kind,'accent':accent,'transparent':kind!='app-tile'})
style='<style>:root{--ink:#17191d;--dot:#0a8f5a}@media(prefers-color-scheme:dark){:root{--ink:#ffffff;--dot:#3ddc97}}</style>'
adaptive=svg('8 8 104 104',mark('b','var(--ink)','var(--dot)',True),'Praesto',style)
(out/'praesto-favicon-adaptive.svg').write_text(adaptive,encoding='utf8')
(root/'static/favicon.svg').write_text(adaptive,encoding='utf8')
shutil.copy2(root/'static/fonts/jetbrainsmono-OFL.txt',out/'JetBrains-Mono-OFL.txt')
manifest={'name':'Praesto','primary':'B','alternate':'A','wordmark':{'family':'JetBrains Mono','weight':550,'tracking_em':-.02,'outlined':True,'source_sha256':hashlib.sha256(font_path.read_bytes()).hexdigest()},'geometry':{'grid':120,'stem':{'x':14,'y':14,'width':20,'height':92,'radius':10},'bowl_center':[76,45],'outer_radius':31,'ring_weight':9,'split_gap':6,'favicon_split_gap':8},'colors':{'ink':'#17191d','light_signal':'#0a8f5a','inverse_ink':'#ffffff','dark_signal':'#3ddc97'},'assets':files}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print(f'Built {len(files)} outlined vector lockups plus the adaptive favicon.')
