class WordSearchGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 50;
        this.score = 0;
        this.wordsFound = 0;
        this.totalWords = 0;
        this.selectedCells = [];
        this.foundWords = [];
        this.isSelecting = false;
        this.currentWord = '';
        this.gameGrid = [];
        this.placedWords = [];
        this.hintsUsed = 0;
        
        // Sistema de áudio
        this.audioContext = null;
        this.sounds = {};
        this.isSoundEnabled = true;
        
        // Frases motivacionais para suas filhas
        this.motivationalPhrases = [
            "Muito bem, princesa!",
            "Você é incrível!",
            "Parabéns, campeã!",
            "Que inteligente!",
            "Continue assim!",
            "Você consegue!",
            "Perfeito!",
            "Maravilhoso!",
            "Excelente trabalho!",
            "Você é uma estrela!"
        ];
        
        this.levelCompletePhrases = [
            "Uau! Nível completado!",
            "Você é demais!",
            "Que orgulho de você!",
            "Incrível, minha querida!",
            "Você é uma campeã!",
            "Fantástico!",
            "Brilhante!",
            "Você é especial!"
        ];
        
        // Palavras por categoria e nível
        this.wordCategories = {
            1: ['GATO', 'CASA', 'SOL', 'MAR'],
            2: ['AMOR', 'VIDA', 'FLOR', 'AGUA', 'FOGO'],
            3: ['ESCOLA', 'LIVRO', 'MESA', 'PORTA', 'JANELA'],
            4: ['FAMILIA', 'AMIGO', 'FELIZ', 'SORRIR', 'CANTAR'],
            5: ['NATUREZA', 'MONTANHA', 'FLORESTA', 'OCEANO'],
            6: ['COMPUTADOR', 'TELEFONE', 'INTERNET', 'DIGITAL'],
            7: ['AVENTURA', 'VIAGEM', 'DESCOBRIR', 'EXPLORAR', 'MUNDO'],
            8: ['MUSICA', 'DANCA', 'ARTE', 'PINTURA', 'TEATRO'],
            9: ['CIENCIA', 'FISICA', 'QUIMICA', 'BIOLOGIA', 'MATEMATICA'],
            10: ['UNIVERSO', 'ESTRELA', 'PLANETA', 'GALAXIA', 'COSMOS']
        };
        
        this.generateMoreWords();
        this.initializeAudio();
        this.initializeGame();
        this.bindEvents();
    }
    
    // Sistema de áudio Web Audio API
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Áudio não suportado:', e);
            this.isSoundEnabled = false;
        }
    }
    
    createSounds() {
        // Som de palavra encontrada (melodia alegre)
        this.sounds.wordFound = () => {
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Dó, Mi, Sol, Dó
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.2, 'sine', 0.3);
                }, index * 100);
            });
        };
        
        // Som de nível completado (fanfarra)
        this.sounds.levelComplete = () => {
            const melody = [
                {freq: 523.25, duration: 0.3}, // Dó
                {freq: 659.25, duration: 0.3}, // Mi
                {freq: 783.99, duration: 0.3}, // Sol
                {freq: 1046.50, duration: 0.6}, // Dó alto
                {freq: 783.99, duration: 0.3}, // Sol
                {freq: 1046.50, duration: 0.8}  // Dó alto longo
            ];
            
            let delay = 0;
            melody.forEach(note => {
                setTimeout(() => {
                    this.playTone(note.freq, note.duration, 'triangle', 0.4);
                }, delay);
                delay += note.duration * 200;
            });
        };
        
        // Som de erro (suave, não assustador)
        this.sounds.error = () => {
            this.playTone(220, 0.3, 'sine', 0.2);
            setTimeout(() => {
                this.playTone(196, 0.4, 'sine', 0.15);
            }, 150);
        };
        
        // Som de dica
        this.sounds.hint = () => {
            const frequencies = [440, 554.37, 659.25]; // Lá, Dó#, Mi
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.15, 'triangle', 0.25);
                }, index * 80);
            });
        };
        
        // Som de clique/seleção
        this.sounds.select = () => {
            this.playTone(800, 0.1, 'square', 0.1);
        };
        
        // Som de jogo completado (muito especial)
        this.sounds.gameComplete = () => {
            const celebration = [
                523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00
            ];
            
            celebration.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.4, 'sine', 0.3);
                    // Harmonia
                    this.playTone(freq * 1.25, 0.4, 'triangle', 0.2);
                }, index * 200);
            });
        };
    }
    
    playTone(frequency, duration, waveType = 'sine', volume = 0.3) {
        if (!this.isSoundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Erro ao reproduzir som:', e);
        }
    }
    
    // Síntese de voz para frases motivacionais
    speakPhrase(phrase) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            utterance.pitch = 1.2;
            utterance.volume = 0.8;
            
            // Tentar usar uma voz feminina se disponível
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.lang.includes('pt') && 
                (voice.name.includes('female') || voice.name.includes('Female') || voice.name.includes('woman'))
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    generateMoreWords() {
        const categories = [
            ['PROGRAMACAO', 'ALGORITMO', 'CODIGO', 'SISTEMA', 'DADOS'],
            ['INTELIGENCIA', 'ARTIFICIAL', 'ROBOTICA', 'AUTOMACAO', 'TECNOLOGIA'],
            ['SUSTENTABILIDADE', 'ECOLOGIA', 'AMBIENTE', 'RECICLAGEM', 'ENERGIA'],
            ['CRIATIVIDADE', 'INOVACAO', 'INSPIRACAO', 'IMAGINACAO', 'ORIGINALIDADE'],
            ['COMUNICACAO', 'LINGUAGEM', 'DIALOGO', 'CONVERSA', 'EXPRESSAO'],
            ['EDUCACAO', 'APRENDIZADO', 'CONHECIMENTO', 'SABEDORIA', 'ENSINO'],
            ['SAUDE', 'EXERCICIO', 'NUTRICAO', 'MEDICINA', 'WELLNESS'],
            ['ECONOMIA', 'FINANCAS', 'INVESTIMENTO', 'MERCADO', 'NEGOCIOS'],
            ['HISTORIA', 'CULTURA', 'TRADICAO', 'PATRIMONIO', 'CIVILIZACAO'],
            ['FILOSOFIA', 'REFLEXAO', 'PENSAMENTO', 'CONSCIENCIA', 'EXISTENCIA'],
            ['PSICOLOGIA', 'COMPORTAMENTO', 'EMOCAO', 'PERSONALIDADE', 'MENTE'],
            ['GEOGRAFIA', 'CONTINENTE', 'TERRITORIO', 'PAISAGEM', 'CLIMA'],
            ['LITERATURA', 'POESIA', 'ROMANCE', 'NARRATIVA', 'ESCRITOR'],
            ['ESPORTE', 'COMPETICAO', 'ATLETISMO', 'CAMPEONATO', 'VITORIA'],
            ['GASTRONOMIA', 'CULINARIA', 'SABOR', 'INGREDIENTE', 'RECEITA'],
            ['ARQUITETURA', 'CONSTRUCAO', 'EDIFICIO', 'PROJETO', 'DESIGN'],
            ['MEDICINA', 'TRATAMENTO', 'DIAGNOSTICO', 'TERAPIA', 'CURA'],
            ['ENGENHARIA', 'MECANICA', 'ELETRICA', 'CIVIL', 'INDUSTRIAL'],
            ['AGRICULTURA', 'PLANTACAO', 'COLHEITA', 'CULTIVO', 'FAZENDA'],
            ['TRANSPORTE', 'VEICULO', 'LOGISTICA', 'MOBILIDADE', 'TRAFEGO'],
            ['ENTRETENIMENTO', 'DIVERSAO', 'LAZER', 'RECREACAO', 'HOBBY'],
            ['RELIGIAO', 'ESPIRITUALIDADE', 'CRENCA', 'DEVOCAO', 'ORACAO'],
            ['POLITICA', 'GOVERNO', 'DEMOCRACIA', 'CIDADANIA', 'SOCIEDADE'],
            ['DIREITO', 'JUSTICA', 'LEI', 'TRIBUNAL', 'ADVOGADO'],
            ['JORNALISMO', 'NOTICIA', 'REPORTAGEM', 'INFORMACAO', 'MIDIA'],
            ['FOTOGRAFIA', 'IMAGEM', 'CAMERA', 'RETRATO', 'PAISAGEM'],
            ['CINEMA', 'FILME', 'DIRETOR', 'ATOR', 'ROTEIRO'],
            ['MODA', 'ESTILO', 'TENDENCIA', 'ROUPA', 'ELEGANCIA'],
            ['BELEZA', 'ESTETICA', 'HARMONIA', 'SIMETRIA', 'PROPORCAO'],
            ['TEMPO', 'MOMENTO', 'INSTANTE', 'DURACAO', 'ETERNIDADE'],
            ['ESPACO', 'DIMENSAO', 'DISTANCIA', 'LOCALIZACAO', 'POSICAO'],
            ['MOVIMENTO', 'DINAMICA', 'VELOCIDADE', 'ACELERACAO', 'RITMO'],
            ['EQUILIBRIO', 'ESTABILIDADE', 'BALANCO', 'HARMONIA', 'CENTRO'],
            ['TRANSFORMACAO', 'MUDANCA', 'EVOLUCAO', 'PROGRESSO', 'DESENVOLVIMENTO'],
            ['CONEXAO', 'LIGACAO', 'RELACIONAMENTO', 'VINCULO', 'UNIAO'],
            ['LIBERDADE', 'INDEPENDENCIA', 'AUTONOMIA', 'ESCOLHA', 'DECISAO'],
            ['RESPONSABILIDADE', 'COMPROMISSO', 'DEVER', 'OBRIGACAO', 'ETICA'],
            ['QUALIDADE', 'EXCELENCIA', 'PERFEICAO', 'SUPERIORIDADE', 'OTIMO'],
            ['QUANTIDADE', 'NUMERO', 'MEDIDA', 'PROPORCAO', 'ESTATISTICA'],
            ['DIVERSIDADE', 'VARIEDADE', 'MULTIPLICIDADE', 'DIFERENCA', 'PLURALIDADE']
        ];
        
        categories.forEach((category, index) => {
            this.wordCategories[11 + index] = category;
        });
    }
    
    initializeGame() {
        this.loadGameState();
        this.generateLevel();
        this.updateUI();
        this.addSoundToggle();
    }
    
    addSoundToggle() {
        // Adicionar botão para ligar/desligar som
        const soundToggle = document.createElement('button');
        soundToggle.innerHTML = this.isSoundEnabled ? '🔊 Som' : '🔇 Som';
        soundToggle.className = 'btn btn-hint';
        soundToggle.style.position = 'fixed';
        soundToggle.style.top = '10px';
        soundToggle.style.right = '10px';
        soundToggle.style.zIndex = '1000';
        
        soundToggle.addEventListener('click', () => {
            this.isSoundEnabled = !this.isSoundEnabled;
            soundToggle.innerHTML = this.isSoundEnabled ? '🔊 Som' : '🔇 Som';
            
            if (this.isSoundEnabled && this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        });
        
        document.body.appendChild(soundToggle);
    }
    
    bindEvents() {
        // Botões
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('continue-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('restart-game-btn').addEventListener('click', () => this.restartGame());
        
        // Grid events serão adicionados dinamicamente
        this.setupGridEvents();
    }
    
    setupGridEvents() {
        const grid = document.getElementById('word-grid');
        
        grid.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                this.startSelection(e.target);
            }
        });
        
        grid.addEventListener('mouseover', (e) => {
            if (this.isSelecting && e.target.classList.contains('grid-cell')) {
                this.updateSelection(e.target);
            }
        });
        
        grid.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
        
        // Touch events para mobile
        grid.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('grid-cell')) {
                this.startSelection(element);
            }
        });
        
        grid.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isSelecting) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('grid-cell')) {
                    this.updateSelection(element);
                }
            }
        });
        
        grid.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
    
    generateLevel() {
        const levelWords = this.wordCategories[this.currentLevel] || this.generateRandomWords();
        this.totalWords = levelWords.length;
        this.wordsFound = 0;
        this.foundWords = [];
        this.placedWords = [];
        
        // Determinar tamanho do grid baseado no nível
        const gridSize = Math.min(15, Math.max(8, 6 + Math.floor(this.currentLevel / 5)));
        
        this.createGrid(gridSize, levelWords);
        this.displayWordsToFind(levelWords);
        this.updateUI();
    }
    
    generateRandomWords() {
        const allWords = Object.values(this.wordCategories).flat();
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        const numWords = Math.min(6, 3 + Math.floor(this.currentLevel / 10));
        return shuffled.slice(0, numWords);
    }
    
    createGrid(size, words) {
        this.gameGrid = Array(size).fill().map(() => Array(size).fill(''));
        
        // Colocar palavras no grid
        words.forEach(word => {
            this.placeWordInGrid(word, size);
        });
        
        // Preencher células vazias com letras aleatórias
        this.fillEmptyCells();
        
        // Renderizar grid
        this.renderGrid(size);
    }
    
    placeWordInGrid(word, gridSize) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal principal
            [1, -1],  // diagonal secundária
            [0, -1],  // horizontal reversa
            [-1, 0],  // vertical reversa
            [-1, -1], // diagonal principal reversa
            [-1, 1]   // diagonal secundária reversa
        ];
        
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);
            
            if (this.canPlaceWord(word, startRow, startCol, direction, gridSize)) {
                this.placeWord(word, startRow, startCol, direction);
                placed = true;
            }
            attempts++;
        }
        
        if (!placed) {
            // Se não conseguir colocar, tenta na horizontal simples
            this.forcePlace(word, gridSize);
        }
    }
    
    canPlaceWord(word, row, col, direction, gridSize) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + (direction[0] * i);
            const newCol = col + (direction[1] * i);
            
            if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
                return false;
            }
            
            if (this.gameGrid[newRow][newCol] !== '' && this.gameGrid[newRow][newCol] !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    placeWord(word, row, col, direction) {
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
            const newRow = row + (direction[0] * i);
            const newCol = col + (direction[1] * i);
            this.gameGrid[newRow][newCol] = word[i];
            positions.push([newRow, newCol]);
        }
        
        this.placedWords.push({
            word: word,
            positions: positions
        });
    }
    
    forcePlace(word, gridSize) {
        // Coloca horizontalmente na primeira linha disponível
        for (let row = 0; row < gridSize; row++) {
            if (gridSize - word.length >= 0) {
                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    if (this.gameGrid[row][i] !== '' && this.gameGrid[row][i] !== word[i]) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    this.placeWord(word, row, 0, [0, 1]);
                    break;
                }
            }
        }
    }
    
    fillEmptyCells() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let row = 0; row < this.gameGrid.length; row++) {
            for (let col = 0; col < this.gameGrid[row].length; col++) {
                if (this.gameGrid[row][col] === '') {
                    this.gameGrid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    renderGrid(size) {
        const grid = document.getElementById('word-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.gameGrid[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                grid.appendChild(cell);
            }
        }
    }
    
    displayWordsToFind(words) {
        const container = document.getElementById('words-to-find');
        container.innerHTML = '';
        
        words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.dataset.word = word;
            container.appendChild(wordElement);
        });
    }
    
    startSelection(cell) {
        this.isSelecting = true;
        this.selectedCells = [cell];
        this.currentWord = cell.textContent;
        cell.classList.add('selected');
        
        // Som de seleção
        if (this.sounds.select) {
            this.sounds.select();
        }
    }
    
    updateSelection(cell) {
        if (!this.isSelecting) return;
        
        // Limpar seleção anterior
        document.querySelectorAll('.grid-cell.selected').forEach(c => {
            if (!c.classList.contains('found')) {
                c.classList.remove('selected');
            }
        });
        
        // Calcular linha reta entre primeira célula e atual
        const startCell = this.selectedCells[0];
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const endRow = parseInt(cell.dataset.row);
        const endCol = parseInt(cell.dataset.col);
        
        const cells = this.getCellsInLine(startRow, startCol, endRow, endCol);
        this.selectedCells = cells;
        this.currentWord = cells.map(c => c.textContent).join('');
        
        cells.forEach(c => {
            if (!c.classList.contains('found')) {
                c.classList.add('selected');
            }
        });
    }
    
    getCellsInLine(startRow, startCol, endRow, endCol) {
        const cells = [];
        const deltaRow = endRow - startRow;
        const deltaCol = endCol - startCol;
        
        // Determinar direção
        const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
        
        if (steps === 0) {
            const cell = document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
            return cell ? [cell] : [];
        }
        
        const stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
        const stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);
        
        // Verificar se é uma linha válida (horizontal, vertical ou diagonal)
        if (deltaRow !== 0 && deltaCol !== 0 && Math.abs(deltaRow) !== Math.abs(deltaCol)) {
            return [document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`)];
        }
        
        for (let i = 0; i <= steps; i++) {
            const row = startRow + (stepRow * i);
            const col = startCol + (stepCol * i);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cells.push(cell);
            }
        }
        
        return cells;
    }
    
    endSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        
        // Verificar se a palavra foi encontrada
        const word = this.currentWord;
        const reverseWord = word.split('').reverse().join('');
        
        let foundWord = null;
        
        // Verificar palavra normal e reversa
        this.placedWords.forEach(placedWord => {
            if (placedWord.word === word || placedWord.word === reverseWord) {
                if (!this.foundWords.includes(placedWord.word)) {
                    foundWord = placedWord.word;
                }
            }
        });
        
        if (foundWord) {
            this.markWordAsFound(foundWord);
            this.createParticleEffect();
            
            // Som de palavra encontrada + frase motivacional
            if (this.sounds.wordFound) {
                this.sounds.wordFound();
            }
            
            // Frase motivacional aleatória
            setTimeout(() => {
                const phrase = this.motivationalPhrases[Math.floor(Math.random() * this.motivationalPhrases.length)];
                this.speakPhrase(phrase);
            }, 500);
            
        } else {
            // Som de erro (suave)
            if (this.sounds.error) {
                this.sounds.error();
            }
            
            // Remover seleção se palavra não foi encontrada
            this.selectedCells.forEach(cell => {
                if (!cell.classList.contains('found')) {
                    cell.classList.remove('selected');
                }
            });
            
            // Frase de encorajamento ocasional
            if (Math.random() < 0.3) { // 30% de chance
                setTimeout(() => {
                    const encouragement = [
                        "Tente novamente!",
                        "Você está quase lá!",
                        "Continue tentando!",
                        "Não desista!"
                    ];
                    const phrase = encouragement[Math.floor(Math.random() * encouragement.length)];
                    this.speakPhrase(phrase);
                }, 300);
            }
        }
        
        this.selectedCells = [];
        this.currentWord = '';
    }
    
    markWordAsFound(word) {
        this.foundWords.push(word);
        this.wordsFound++;
        
        // Marcar células como encontradas
        const placedWord = this.placedWords.find(pw => pw.word === word);
        if (placedWord) {
            placedWord.positions.forEach(([row, col]) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('found');
                    cell.classList.remove('selected');
                }
            });
        }
        
        // Marcar palavra na lista como encontrada
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
        
        // Calcular pontos
        const points = word.length * 10 * this.currentLevel;
        this.score += points;
        
        // Atualizar UI
        this.updateUI();
        
        // Verificar se nível foi completado
        if (this.wordsFound === this.totalWords) {
            setTimeout(() => {
                this.completeLevel();
            }, 1000); // Dar tempo para o som e frase
        }
    }
    
    createParticleEffect() {
        const colors = ['#ffd700', '#ff6b9d', '#4ecdc4', '#ff6b6b', '#4CAF50'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = Math.random() * window.innerHeight + 'px';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 50);
        }
    }
    
    showHint() {
        if (this.hintsUsed >= 3) {
            this.speakPhrase('Você já usou todas as dicas deste nível!');
            return;
        }
        
        // Som de dica
        if (this.sounds.hint) {
            this.sounds.hint();
        }
        
        // Encontrar uma palavra não encontrada
        const remainingWords = this.placedWords.filter(pw => !this.foundWords.includes(pw.word));
        
        if (remainingWords.length === 0) return;
        
        const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        const firstPosition = randomWord.positions[0];
        
        // Destacar primeira letra da palavra
        const cell = document.querySelector(`[data-row="${firstPosition[0]}"][data-col="${firstPosition[1]}"]`);
        if (cell) {
            cell.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
            cell.style.transform = 'scale(1.2)';
            cell.style.boxShadow = '0 0 20px #ffd700';
            
            setTimeout(() => {
                cell.style.background = '';
                cell.style.transform = '';
                cell.style.boxShadow = '';
            }, 2000);
        }
        
        this.hintsUsed++;
        this.score = Math.max(0, this.score - 50); // Penalidade por usar dica
        this.updateUI();
        
        // Frase de dica
        setTimeout(() => {
            const hintPhrases = [
                "Aqui está uma dica para você!",
                "Olhe bem essa letra!",
                "Esta é a primeira letra da palavra!",
                "Você consegue encontrar a palavra agora!"
            ];
            const phrase = hintPhrases[Math.floor(Math.random() * hintPhrases.length)];
            this.speakPhrase(phrase);
        }, 200);
    }
    
    resetLevel() {
        this.wordsFound = 0;
        this.foundWords = [];
        this.hintsUsed = 0;
        this.generateLevel();
        
        // Som de reset
        this.playTone(300, 0.2, 'sine', 0.2);
        
        // Frase de reset
        setTimeout(() => {
            this.speakPhrase("Vamos tentar novamente!");
        }, 300);
    }
    
    completeLevel() {
        // Som de nível completado
        if (this.sounds.levelComplete) {
            this.sounds.levelComplete();
        }
        
        const modal = document.getElementById('celebration-modal');
        const message = document.getElementById('celebration-message');
        
        let bonusPoints = 0;
        if (this.hintsUsed === 0) {
            bonusPoints = 100 * this.currentLevel;
            this.score += bonusPoints;
        }
        
        message.innerHTML = `
            Nível ${this.currentLevel} concluído!<br>
            Pontos ganhos: ${this.score}<br>
            ${bonusPoints > 0 ? `Bônus sem dicas: ${bonusPoints}` : ''}
        `;
        
        modal.style.display = 'block';
        
        // Mostrar botão próximo nível
        if (this.currentLevel < this.maxLevel) {
            document.getElementById('next-level-btn').style.display = 'inline-block';
        }
        
        this.saveGameState();
        
        // Frase de parabéns especial
        setTimeout(() => {
            const phrase = this.levelCompletePhrases[Math.floor(Math.random() * this.levelCompletePhrases.length)];
            this.speakPhrase(phrase);
        }, 1000);
        
        // Efeito visual extra para níveis especiais
        if (this.currentLevel % 10 === 0) {
            this.createSpecialCelebration();
        }
    }
    
    createSpecialCelebration() {
        // Celebração especial para níveis múltiplos de 10
        const colors = ['#ff6b9d', '#4ecdc4', '#ffd700', '#ff6b6b', '#4CAF50', '#9b59b6', '#e67e22'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'special-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    animation: sparkle 3s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 100);
        }
        
        // Som especial para marcos
        setTimeout(() => {
            if (this.sounds.gameComplete) {
                this.sounds.gameComplete();
            }
        }, 500);
        
        // Frase especial para marcos
        setTimeout(() => {
            this.speakPhrase(`Incrível! Você chegou ao nível ${this.currentLevel}! Você é uma verdadeira campeã!`);
        }, 2000);
    }
    
    nextLevel() {
        if (this.currentLevel >= this.maxLevel) {
            this.completeGame();
            return;
        }
        
        this.currentLevel++;
        this.hintsUsed = 0;
        document.getElementById('next-level-btn').style.display = 'none';
        this.generateLevel();
        this.saveGameState();
        
        // Som de próximo nível
        this.playTone(523.25, 0.3, 'triangle', 0.3);
        setTimeout(() => {
            this.playTone(659.25, 0.3, 'triangle', 0.3);
        }, 150);
        
        // Frase de novo nível
        setTimeout(() => {
            const nextLevelPhrases = [
                `Agora vamos para o nível ${this.currentLevel}!`,
                "Novo desafio chegando!",
                "Você está indo muito bem!",
                "Vamos continuar essa aventura!"
            ];
            const phrase = nextLevelPhrases[Math.floor(Math.random() * nextLevelPhrases.length)];
            this.speakPhrase(phrase);
        }, 500);
    }
    
    completeGame() {
        // Som de jogo completado
        if (this.sounds.gameComplete) {
            this.sounds.gameComplete();
        }
        
        const modal = document.getElementById('game-complete-modal');
        const finalScore = document.getElementById('final-score');
        
        finalScore.textContent = this.score;
        modal.style.display = 'block';
        
        // Salvar recorde
        const bestScore = localStorage.getItem('wordSearchBestScore') || 0;
        if (this.score > bestScore) {
            localStorage.setItem('wordSearchBestScore', this.score);
        }
        
        // Celebração final épica
        this.createEpicCelebration();
        
        // Frase final especial
        setTimeout(() => {
            this.speakPhrase("Parabéns! Você completou todos os níveis! Você é absolutamente incrível e eu tenho muito orgulho de você!");
        }, 2000);
    }
    
    createEpicCelebration() {
        // Celebração épica para completar o jogo
        const colors = ['#ffd700', '#ff6b9d', '#4ecdc4', '#ff6b6b', '#4CAF50', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#f39c12'];
        
        // Chuva de confetes
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: ${Math.random() * 10 + 5}px;
                    height: ${Math.random() * 10 + 5}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * window.innerWidth}px;
                    top: -10px;
                    pointer-events: none;
                    z-index: 10000;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    animation: fall ${Math.random() * 3 + 2}s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 50);
        }
        
        // Fogos de artifício sonoros
        const fireworks = [
            () => this.playTone(523.25, 0.5, 'sine', 0.4),
            () => this.playTone(659.25, 0.5, 'triangle', 0.4),
            () => this.playTone(783.99, 0.5, 'square', 0.3),
            () => this.playTone(1046.50, 0.5, 'sine', 0.4)
        ];
        
        fireworks.forEach((firework, index) => {
            setTimeout(firework, index * 300);
        });
    }
    
    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.wordsFound = 0;
        this.foundWords = [];
        this.hintsUsed = 0;
        
        document.getElementById('game-complete-modal').style.display = 'none';
        document.getElementById('next-level-btn').style.display = 'none';
        
        this.generateLevel();
        this.saveGameState();
        
        // Som de reinício
        this.playTone(440, 0.3, 'sine', 0.3);
        
        // Frase de reinício
        setTimeout(() => {
            this.speakPhrase("Vamos começar uma nova aventura!");
        }, 300);
    }
    
    closeModal() {
        document.getElementById('celebration-modal').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
        document.getElementById('words-found').textContent = this.wordsFound;
        document.getElementById('total-words').textContent = this.totalWords;
    }
    
    saveGameState() {
        const gameState = {
            currentLevel: this.currentLevel,
            score: this.score,
            timestamp: Date.now()
        };
        localStorage.setItem('wordSearchGameState', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('wordSearchGameState');
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                // Carregar apenas se foi salvo nas últimas 24 horas
                if (Date.now() - gameState.timestamp < 24 * 60 * 60 * 1000) {
                    this.currentLevel = gameState.currentLevel || 1;
                    this.score = gameState.score || 0;
                }
            } catch (e) {
                console.log('Erro ao carregar estado do jogo:', e);
            }
        }
    }
}

// Adicionar estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .particle {
        animation: sparkle 2s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new WordSearchGame();
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registrado com sucesso: ', registration);
            })
            .catch((registrationError) => {
                console.log('Falha ao registrar SW: ', registrationError);
            });
    });
}

// Prevenir zoom no mobile durante o jogo
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Adicionar suporte a teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Fechar modais
        document.getElementById('celebration-modal').style.display = 'none';
        document.getElementById('game-complete-modal').style.display = 'none';
    }
});

// Inicializar contexto de áudio no primeiro toque/clique (necessário para mobile)
document.addEventListener('click', function initAudio() {
    const game = window.wordSearchGame;
    if (game && game.audioContext && game.audioContext.state === 'suspended') {
        game.audioContext.resume();
    }
    document.removeEventListener('click', initAudio);
}, { once: true });

document.addEventListener('touchstart', function initAudioTouch() {
    const game = window.wordSearchGame;
    if (game && game.audioContext && game.audioContext.state === 'suspended') {
        game.audioContext.resume();
    }
    document.removeEventListener('touchstart', initAudioTouch);
}, { once: true });
