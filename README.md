# 🎮 Caça Palavras - PWA Game

Um jogo de caça palavras divertido e educativo com 50 níveis, totalmente responsivo e funcionando como PWA (Progressive Web App).

## 🌟 Características

- ✅ **50 níveis únicos** com diferentes temas
- ✅ **PWA completo** - funciona offline
- ✅ **Responsivo** - perfeito para mobile e desktop  
- ✅ **Efeitos sonoros** e vibrações
- ✅ **Tema escuro/claro**
- ✅ **Sistema de pontuação** e dicas
- ✅ **Salvamento automático** do progresso
- ✅ **Instalável** como app nativo

## 📱 Instalação

### Opção 1: Usar online
1. Acesse o jogo no navegador
2. Clique no botão "📱 Instalar App" quando aparecer
3. Confirme a instalação

### Opção 2: Hospedar localmente
1. Baixe todos os arquivos
2. Gere os ícones usando `icon-converter.html`
3. Sirva os arquivos via HTTPS (obrigatório para PWA)

## 🛠️ Arquivos do Projeto

```
projeto/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica do jogo
├── manifest.json       # Manifesto PWA
├── sw.js              # Service Worker
├── icon-converter.html # Gerador de ícones
├── icon-*x*.png       # Ícones do app (gerar)
└── README.md          # Este arquivo
```

## 🎯 Como Jogar

1. **Objetivo**: Encontre todas as palavras escondidas no grid
2. **Seleção**: Clique e arraste para selecionar palavras
3. **Direções**: Palavras podem estar em qualquer direção
4. **Dicas**: Use até 3 dicas por nível (reduz pontuação)
5. **Níveis**: Complete todos os 50 níveis!

## ⌨️ Controles

- **H**: Usar dica
- **R**: Reiniciar nível  
- **N**: Próximo nível (se disponível)
- **ESC**: Fechar modais
- **🌙/☀️**: Alternar tema

## 🚀 Deploy

### Netlify/Vercel
1. Faça upload dos arquivos
2. Configure HTTPS automático
3. PWA funcionará automaticamente

### GitHub Pages
1. Crie repositório no GitHub
2. Ative GitHub Pages
3. Acesse via HTTPS

### Servidor próprio
```bash
# Exemplo com Python
python -m http.server 8000

# Exemplo com Node.js
npx serve .

# Exemplo com PHP
php -S localhost:8000
```

⚠️ **Importante**: PWA requer HTTPS em produção!

## 🎨 Personalização

### Alterar cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #ff6b9d;
  --accent-color: #4ecdc4;
}
```

### Adicionar níveis
Modifique o array `levelWords` em `script.js`:
```javascript
// Adicione novos temas e palavras
const themes = {
  novoTema: ['PALAVRA1', 'PALAVRA2', ...]
};
```

### Alterar ícones
1. Edite `generate-icons.js`
2. Execute `node generate-icons.js`
3. Abra `icon-converter.html` e baixe os novos ícones

## 🔧 Desenvolvimento

### Estrutura do código
- `WordSearchGame`: Classe principal do jogo
- `generateLevelWords()`: Gera palavras por nível
- `generateGrid()`: Cria o grid de letras
- `handleStart/Move/End()`: Controla seleção
- Service Worker: Cache e funcionalidade offline

### Adicionar recursos
```javascript
// Exemplo: novo efeito sonoro
playCustomSound() {
  this.playSound([440, 554, 659], [200, 200, 400]);
}
```

## 📊 Analytics (Opcional)

Para adicionar Google Analytics:
```html
<!-- Adicione no <head> do index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Solução de Problemas

### PWA não instala
- Verifique se está usando HTTPS
- Confirme que todos os ícones existem
- Valide o manifest.json

### Jogo não carrega
- Verifique console do navegador
- Confirme que todos os arquivos estão presentes
- Teste em modo incógnito

### Performance lenta
- Reduza tamanho do grid para dispositivos antigos
- Otimize animações CSS
- Minimize arquivos JS/CSS

## 📄 Licença

Este projeto é open source. Sinta-se livre para usar e modificar!

## 🤝 Contribuições

Contribuições são bem-vindas! 
- Reporte bugs
- Sugira melhorias  
- Adicione novos recursos
- Melhore a documentação

---

**Divirta-se jogando! 🎉**
