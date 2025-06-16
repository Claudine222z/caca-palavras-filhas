// Script para gerar ícones do PWA
// Execute com: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// Tamanhos de ícones necessários
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Função para criar ícone SVG
function createIconSVG(size) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  
  <!-- Grid pattern -->
  <g stroke="rgba(255,255,255,0.2)" stroke-width="${size * 0.01}" fill="none">
    ${Array.from({length: 5}, (_, i) => 
      `<line x1="${size * 0.2 + i * size * 0.15}" y1="${size * 0.2}" x2="${size * 0.2 + i * size * 0.15}" y2="${size * 0.8}"/>`
    ).join('')}
    ${Array.from({length: 5}, (_, i) => 
      `<line x1="${size * 0.2}" y1="${size * 0.2 + i * size * 0.15}" x2="${size * 0.8}" y2="${size * 0.2 + i * size * 0.15}"/>`
    ).join('')}
  </g>
  
  <!-- Letters in grid -->
  <g fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.08}" text-anchor="middle">
    <text x="${size * 0.275}" y="${size * 0.28}">C</text>
    <text x="${size * 0.425}" y="${size * 0.28}">A</text>
    <text x="${size * 0.575}" y="${size * 0.28}">Ç</text>
    <text x="${size * 0.725}" y="${size * 0.28}">A</text>
    
    <text x="${size * 0.275}" y="${size * 0.43}">P</text>
    <text x="${size * 0.425}" y="${size * 0.43}">A</text>
    <text x="${size * 0.575}" y="${size * 0.43}">L</text>
    <text x="${size * 0.725}" y="${size * 0.43}">A</text>
    
    <text x="${size * 0.275}" y="${size * 0.58}">V</text>
    <text x="${size * 0.425}" y="${size * 0.58}">R</text>
    <text x="${size * 0.575}" y="${size * 0.58}">A</text>
    <text x="${size * 0.725}" y="${size * 0.58}">S</text>
  </g>
  
  <!-- Highlight effect -->
  <rect x="${size * 0.2}" y="${size * 0.35}" width="${size * 0.6}" height="${size * 0.08}" 
        fill="url(#accent)" opacity="0.3" rx="${size * 0.02}"/>
  
  <!-- Magnifying glass icon -->
  <g transform="translate(${size * 0.65}, ${size * 0.65})">
    <circle cx="${size * 0.08}" cy="${size * 0.08}" r="${size * 0.06}" 
            fill="none" stroke="url(#accent)" stroke-width="${size * 0.015}"/>
    <line x1="${size * 0.125}" y1="${size * 0.125}" x2="${size * 0.16}" y2="${size * 0.16}" 
          stroke="url(#accent)" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  </g>
</svg>`;
}

// Gerar ícones SVG
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  fs.writeFileSync(`icon-${size}x${size}.svg`, svgContent);
  console.log(`Ícone SVG ${size}x${size} criado!`);
});

// Criar arquivo HTML para converter SVG para PNG
const converterHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Conversor de Ícones</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-container { margin: 20px 0; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        button { padding: 10px 20px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>Conversor de Ícones PWA</h1>
    <p>Clique nos botões para baixar os ícones PNG:</p>
    
    ${iconSizes.map(size => `
    <div class="icon-container">
        <h3>Ícone ${size}x${size}</h3>
        <canvas id="canvas-${size}" width="${size}" height="${size}"></canvas>
        <button onclick="downloadIcon(${size})">Baixar PNG ${size}x${size}</button>
    </div>
    `).join('')}

    <script>
        const iconSizes = [${iconSizes.join(', ')}];
        
        function createIconSVG(size) {
            return \`${createIconSVG('${size}').replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
        }
        
        function loadIcon(size) {
            const canvas = document.getElementById('canvas-' + size);
            const ctx = canvas.getContext('2d');
            const svg = createIconSVG(size);
            
            const img = new Image();
            const blob = new Blob([svg], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        }
        
        function downloadIcon(size) {
            const canvas = document.getElementById('canvas-' + size);
            const link = document.createElement('a');
            link.download = 'icon-' + size + 'x' + size + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Carregar todos os ícones
        iconSizes.forEach(size => {
            setTimeout(() => loadIcon(size), 100);
        });
        
        // Função para baixar todos
        function downloadAll() {
            iconSizes.forEach((size, index) => {
                setTimeout(() => downloadIcon(size), index * 500);
            });
        }
    </script>
    
    <button onclick="downloadAll()" style="background: #ff6b9d; font-size: 16px; padding: 15px 30px;">
        📱 Baixar Todos os Ícones
    </button>
    
    <h2>Instruções:</h2>
    <ol>
        <li>Clique em "Baixar Todos os Ícones" ou baixe individualmente</li>
        <li>Coloque todos os arquivos PNG na pasta raiz do seu projeto</li>
        <li>O PWA está pronto para ser instalado!</li>
    </ol>
    
    <h2>Arquivos necessários para PWA:</h2>
    <ul>
        <li>✅ index.html</li>
        <li>✅ styles.css</li>
        <li>✅ script.js</li>
        <li>✅ manifest.json</li>
        <li>✅ sw.js (Service Worker)</li>
        <li>📱 Ícones PNG (baixe usando os botões acima)</li>
    </ul>
</body>
</html>
`;

fs.writeFileSync('icon-converter.html', converterHTML);
console.log('\n🎉 Arquivos criados com sucesso!');
console.log('\n📋 Para gerar os ícones PNG:');
console.log('1. Abra o arquivo icon-converter.html no navegador');
console.log('2. Clique em "Baixar Todos os Ícones"');
console.log('3. Coloque os arquivos PNG na pasta do projeto');
console.log('\n🚀 Seu PWA estará completo!');
