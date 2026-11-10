// Sastavlja src/ u gotove fajlove u dist/ (jedna HTML stranica sa svim ugrađenim, plus PWA fajlovi).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const FD = path.join(root, 'node_modules', '@fontsource-variable');

function fontCss(pkg, from, to) {
  const css = fs.readFileSync(path.join(FD, pkg, 'wght.css'), 'utf8');
  return css.split('/* ').slice(1).map(b => '/* ' + b)
    .filter(b => /-latin(-ext)?-wght-normal \*\//.test(b))
    .map(b => {
      const m = /url\(\.\/files\/([^)]+)\)/.exec(b);
      const data = fs.readFileSync(path.join(FD, pkg, 'files', m[1])).toString('base64');
      return b.replace(m[0], `url(data:font/woff2;base64,${data})`).replace(from, to).replace(/\s+/g, ' ');
    }).join('\n');
}
const fonts = fontCss('hanken-grotesk', /Hanken Grotesk Variable/g, 'Hanken Grotesk') + '\n' +
  fontCss('big-shoulders-display', /Big Shoulders Display Variable/g, 'Big Shoulders Display');

const HEAD = `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>__TITLE__</title>
<meta name="description" content="FITORA: biblioteka vežbi sa animacijama, nedeljni plan treninga i statistika.">
<meta name="theme-color" content="#0D1013" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F1F3EE" media="(prefers-color-scheme: light)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="FITORA">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
`;
const SW = `<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http')){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>\n`;

function page(file, title, withSw) {
  let h = rd(file)
    .replace('/*__FONTS__*/', () => fonts)
    .replace('/*__FIGCSS__*/', () => rd('fig.css'))
    .replace('/*__RIG__*/', () => rd('rig.js'))
    .replace('/*__DATA__*/', () => rd('data.js'))
    .replace('/*__APP__*/', () => rd('app.js'))
    // uklanja <title> i meta oznaku koja važi samo za Claude pregled
    .replace(/^<title>.*<\/title>\s*/m, '')
    .replace(/^<meta name="claude:[^>]*>\s*/m, '');
  return HEAD.replace('__TITLE__', title) + h + (withSw ? SW : '');
}

const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(path.join(root, 'public'), dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), page('app.html', 'FITORA', true));
fs.writeFileSync(path.join(dist, 'studio.html'), page('studio.html', 'FITORA Studio', false));

// Service worker: verzija keša se menja sa sadržajem, pa se nova verzija sama učita
const crypto = require('crypto');
const ver = crypto.createHash('md5').update(fs.readFileSync(path.join(dist, 'index.html'))).digest('hex').slice(0, 8);
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8').replace('__VERSION__', ver);
fs.writeFileSync(path.join(dist, 'sw.js'), sw);
console.log('dist/ spreman (verzija ' + ver + ')');
