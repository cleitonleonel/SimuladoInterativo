const inputJson = document.getElementById("inputJson");
const inputZip = document.getElementById("inputZip");
const container = document.getElementById("container");
const timerEl = null; // Removed from header
const barra = document.getElementById("barraInterna");
const audioCorreto = document.getElementById("audioCorreto");
const audioErro = document.getElementById("audioErro");
const resultado = document.getElementById("resultado");

let arquivos = [];
let arquivoAtual = 0;
let acertosTotal = 0;
let totalQuestoes = 0;
let tempos = [];
let resultadosPorArquivo = [];

let questoes = [];
let questaoAtual = 0;
let acertos = 0;
let tempoRestante = 60 * 60;
let intervalo;
let startTime;

function shuffle_secure(n) {
	const arr = Array.from({length: n}, (_, i) => i);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function iniciarSimuladoReal() {
	acertos = 0;
	questaoAtual = 0;
	startTime = Date.now();
    const uploadArea = document.getElementById("uploadArea");
    if (uploadArea) uploadArea.style.display = "none";
	iniciarCronometro();
    criarDots();
	renderizarQuestaoReal();
}

function iniciarSimulado() {
	if (arquivos.length === 0) return;
	arquivoAtual = 0;
	acertosTotal = 0;
	totalQuestoes = 0;
	tempos = [];
	resultadosPorArquivo = [];
	resultado.innerHTML = "";
    const uploadArea = document.getElementById("uploadArea");
    if (uploadArea) uploadArea.style.display = "none";
	carregarArquivo();
}

function iniciarCronometro() {
	clearInterval(intervalo);
    
    let display = document.getElementById("floatingTimer");
    if (!display) {
        display = document.createElement("div");
        display.id = "floatingTimer";
        display.className = "floating-badge glass";
        display.innerHTML = `<span>⏱️</span> <strong id="timerDisplay">00:00</strong>`;
        document.body.appendChild(display);
    }
    const timerText = document.getElementById("timerDisplay");

	intervalo = setInterval(() => {
		if (tempoRestante <= 0) {
			clearInterval(intervalo);
			mostrarResultadoReal("⏰ Tempo esgotado!");
			return;
		}
		tempoRestante--;
		const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
		const segundos = String(tempoRestante % 60).padStart(2, "0");
		if (timerText) timerText.textContent = `${minutos}:${segundos}`;
	}, 1000);
}

function atualizarBarraReal() {
	const percentual = ((questaoAtual) / questoes.length) * 100;
	barra.style.width = percentual + "%";
    atualizarDots();
}

function criarDots() {
    let dotsContainer = document.getElementById("statusDots");
    if (!dotsContainer) {
        dotsContainer = document.createElement("div");
        dotsContainer.id = "statusDots";
        dotsContainer.className = "dots-container";
        const header = document.querySelector(".header-content") || document.querySelector(".global-header");
        if (header) header.after(dotsContainer);
    }
    dotsContainer.innerHTML = "";
    questoes.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "dot";
        dotsContainer.appendChild(dot);
    });
}

function atualizarDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
        if (i < questaoAtual) {
            // Se já passou, a cor já deve estar definida pelo clique anterior
        } else if (i === questaoAtual) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function atualizarBarra() {
	const progresso = ((arquivoAtual + questaoAtual / questoes.length) / arquivos.length) * 100;
	barra.style.width = progresso + "%";
}

function renderizarQuestaoReal() {
	if (questaoAtual >= questoes.length) {
		clearInterval(intervalo);
		mostrarResultadoReal("🎉 Simulado finalizado!");
		return;
	}
	
	atualizarBarraReal();
	const q = questoes[questaoAtual];
	const card = document.createElement("div");
	card.className = "questao-card glass";
	
	card.innerHTML = `
      <div class="enunciado"><strong>${questaoAtual + 1})</strong> ${formatarTexto(q.enunciated)}</div>
      <p style="text-align: left; font-size: 0.8rem; color: var(--text-muted);"><em>Arquivo: ${q._arquivo}</em></p>
    `;
	
	const optionsContainer = document.createElement("div");
	optionsContainer.className = "opcoes-container";
	
	q.options.forEach(op => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		renderConteudoComFlag(btn, op.text);
		btn.onclick = () => {
			const correta = q.options.find(o => o.isCorrect);
			const feedback = document.createElement("div");
			const explicacao = document.createElement("div");
			
			const dots = document.querySelectorAll(".dot");
			if (op.isCorrect) {
				feedback.innerHTML = "✅ Correto!";
				feedback.className = "correta feedback";
				audioCorreto.play();
				acertos++;
                if (dots[questaoAtual]) dots[questaoAtual].classList.add("correct");
			} else {
				feedback.innerHTML = "❌ Incorreto. A correta era: <br>" + formatarTexto(correta.text);
				feedback.className = "incorreta feedback";
				audioErro.play();
                if (dots[questaoAtual]) dots[questaoAtual].classList.add("wrong");
			}
			
			explicacao.innerHTML = "📝 " + (op.feedback || "Sem justificativa.");
			explicacao.className = "feedback";
			
			card.appendChild(feedback);
			card.appendChild(explicacao);
			
			Array.from(optionsContainer.getElementsByTagName("button")).forEach(b => b.disabled = true);
			
			const btnProx = document.createElement("button");
			btnProx.className = "btn-premium btn-primary";
			btnProx.style.marginTop = "1.5rem";
			btnProx.textContent = "Próxima questão";
			btnProx.onclick = () => {
				questaoAtual++;
				renderizarQuestaoReal();
			};
			card.appendChild(btnProx);
		};
		optionsContainer.appendChild(btn);
	});
    card.appendChild(optionsContainer);
    container.innerHTML = "";
    container.appendChild(card);
}

function renderizarQuestao() {
	if (questaoAtual >= questoes.length) {
		arquivoAtual++;
		if (arquivoAtual < arquivos.length) {
			carregarArquivo();
		} else {
			mostrarResultado();
		}
		return;
	}
	
	atualizarBarra();
	const q = questoes[questaoAtual];
	const inicio = Date.now();
	container.innerHTML = "";
	
	const qDiv = document.createElement("div");
	qDiv.className = "questao-card glass";
	
	const titulo = document.createElement("h3");
	titulo.style.fontSize = "0.9rem";
	titulo.style.color = "var(--text-muted)";
	titulo.innerHTML = `Arquivo: ${arquivos[arquivoAtual].name}`;
	qDiv.appendChild(titulo);
	
	const enunciado = document.createElement("div");
	enunciado.className = "enunciado";
	enunciado.innerHTML = `<strong>${questaoAtual + 1})</strong> ${formatarTexto(q.enunciated)}`;
	qDiv.appendChild(enunciado);
    
    const optionsContainer = document.createElement("div");
	optionsContainer.className = "opcoes-container";
	
	q.options.forEach((opcao) => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		renderConteudoComFlag(btn, opcao.text);
		btn.onclick = () => {
			const tempo = ((Date.now() - inicio) / 1000).toFixed(2);
			tempos.push(tempo);
			totalQuestoes++;
			
			const feedback = document.createElement("div");
			const correta = q.options.find(opt => opt.isCorrect);
			const acertou = opcao.isCorrect;
			
			feedback.innerHTML = acertou ? "✅ Correto!" : "❌ Incorreto.";
			feedback.className = acertou ? "correta feedback" : "incorreta feedback";
			
			const explicacao = document.createElement("div");
			explicacao.innerHTML = "📝 " + (opcao.feedback || "");
			explicacao.className = "feedback";
			
			if (!acertou && correta) {
				const corretaDiv = document.createElement("div");
				corretaDiv.className = "correta feedback";
				corretaDiv.style.marginTop = "10px";
				corretaDiv.innerHTML = `✔️ Resposta correta: <br><strong>${formatarTexto(correta.text)}</strong>`;
				audioErro.play();
				qDiv.appendChild(corretaDiv);
			}
			
			if (opcao.isCorrect) {
				acertosTotal++;
				audioCorreto.play();
				resultadosPorArquivo[arquivoAtual].acertos++;
			}
			
			qDiv.appendChild(feedback);
			qDiv.appendChild(explicacao);
			Array.from(optionsContainer.getElementsByTagName("button")).forEach(b => b.disabled = true);
			
			const proximo = document.createElement("button");
			proximo.textContent = "Próxima questão";
            proximo.className = "btn-premium btn-primary";
            proximo.style.marginTop = "1.5rem";
			proximo.onclick = () => {
				questaoAtual++;
				renderizarQuestao();
			};
			qDiv.appendChild(proximo);
		};
		optionsContainer.appendChild(btn);
	});
	
	qDiv.appendChild(optionsContainer);
	container.appendChild(qDiv);
}

function mostrarResultadoReal(msg) {
	barra.style.width = "100%";
    const porcentagem = Math.round((acertos / questoes.length) * 100);
    let medalha = "🥉 Bronze";
    let corMedalha = "#cd7f32";
    
    const totalTimeValue = (Date.now() - startTime) / 1000;
    const minutes = Math.floor(totalTimeValue / 60);
    const seconds = Math.floor(totalTimeValue % 60);

	container.innerHTML = `
      <div class="result-dashboard">
        <section class="score-section glass" style="border-radius: 32px;">
            <div class="score-ring">
                <div class="score-value">${porcentagem}%</div>
            </div>
            <h2 style="color: var(--primary); font-size: 2rem; margin-bottom: 0.5rem;">Simulado Finalizado!</h2>
            <p style="color: var(--text-muted);">Confira seu desempenho detalhado abaixo</p>
        </section>

        <div class="stat-grid">
            <div class="stat-item">
                <span class="stat-label">✔️ Acertos</span>
                <div class="stat-value">${acertos} / ${questoes.length}</div>
            </div>
            <div class="stat-item">
                <span class="stat-label">⏱️ Tempo Total</span>
                <div class="stat-value">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
            <button class="btn-premium btn-primary" onclick="window.location.reload()" style="min-width: 240px;">🔁 Novo Simulado</button>
        </div>
      </div>
    `;
    const dotsContainer = document.getElementById("statusDots");
    if (dotsContainer) dotsContainer.style.opacity = "0";
    const timerBadge = document.getElementById("floatingTimer");
    if (timerBadge) timerBadge.style.display = "none";
}

function shuffle_all(questions) {
	let i = questions.length, j, temp;
	while (--i > 0) {
		j = Math.floor(Math.random() * (i + 1));
		temp = questions[j];
		questions[j] = questions[i];
		questions[i] = temp;
	}
	return questions;
}

function carregarArquivo() {
	const reader = new FileReader();
	reader.onload = function (e) {
		const dados = JSON.parse(e.target.result);
		questoes = shuffle_all(dados.content.questions);
		questaoAtual = 0;
		resultadosPorArquivo.push({nome: arquivos[arquivoAtual].name, acertos: 0, total: questoes.length});
		renderizarQuestao();
	};
	reader.readAsText(arquivos[arquivoAtual]);
}

function mostrarResultado() {
	container.innerHTML = "";
    const porcentagemGlobal = Math.round((acertosTotal / totalQuestoes) * 100);
    let medalha = "🥉 Bronze";
    let corMedalha = "#cd7f32";
    
    if (porcentagemGlobal >= 90) {
        medalha = "🏆 Ouro";
        corMedalha = "#ffd700";
    } else if (porcentagemGlobal >= 70) {
        medalha = "🥈 Prata";
        corMedalha = "#c0c0c0";
    }

    let fileCardsHTML = resultadosPorArquivo.map(r => {
        const p = Math.round((r.acertos / r.total) * 100);
        return `
            <div class="stat-item glass" style="text-align: left; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="font-size: 0.9rem; color: var(--text-main);">${r.nome}</strong>
                    <span style="font-weight: 700; color: ${p >= 70 ? 'var(--success)' : 'var(--error)'};">${p}%</span>
                </div>
                <div class="progress-container" style="height: 6px; background: rgba(0,0,0,0.05);">
                    <div class="progress-bar" style="width: ${p}%; height: 100%; background: var(--primary);"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                    ${r.acertos} acertos de ${r.total} questões
                </div>
            </div>
        `;
    }).join('');

	resultado.innerHTML = `
      <div class="result-dashboard">
        <section class="score-section glass" style="border-radius: 32px;">
            <div class="score-ring" style="border-color: ${corMedalha}">
                <div class="score-value">${porcentagemGlobal}%</div>
            </div>
            <h2 style="color: var(--primary); font-size: 2rem; margin-bottom: 0.5rem;">Desempenho Geral</h2>
            <p style="color: var(--text-muted); font-size: 1.2rem;">Sua classificação: <strong>${medalha}</strong></p>
        </section>

        <div class="stat-grid">
            <div class="stat-item">
                <span class="stat-label">🎯 Total de Acertos</span>
                <div class="stat-value">${acertosTotal} / ${totalQuestoes}</div>
            </div>
            <div class="stat-item">
                <span class="stat-label">📄 Arquivos Processados</span>
                <div class="stat-value">${resultadosPorArquivo.length}</div>
            </div>
        </div>

        <h4 style="text-align: left; margin: 1.5rem 0 1rem; color: var(--text-secondary); font-size: 1rem; padding-left: 0.5rem;">Desempenho por Matéria</h4>
        <div class="file-stats-scroll" style="max-height: 400px; overflow-y: auto; padding: 0.5rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                ${fileCardsHTML}
            </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
            <button class="btn-premium btn-primary" onclick="window.location.reload()" style="min-width: 200px;">🔁 Novo Simulado</button>
            <button class="btn-premium" style="background: #25d366; color: white; border-color: #25d366; min-width: 200px;" onclick="compartilharWhatsApp()">📤 WhatsApp</button>
        </div>
      </div>
    `;
	barra.style.width = "100%";
}

function compartilharWhatsApp() {
	const header = "📘 Simulado Concluído!";
	const acertosLinha = `✅ Acertos: ${acertosTotal} de ${totalQuestoes}`;
	const resultados = resultadosPorArquivo.map(r =>
		`- ${r.nome}: ${r.acertos}/${r.total}`
	).join('\n');
	const mensagem = `${header}\n\n${acertosLinha}\n📄 Resultados por arquivo:\n${resultados}`;
	const url = `https://web.whatsapp.com/send/?text=${encodeURIComponent(mensagem)}`;
	window.open(url, '_blank');
}

// --- Funções de Utilitários ---

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const ALIAS_LINGUAGEM = {
  py: 'python', js: 'javascript', ts: 'javascript',
  cpp: 'c', 'c++': 'c', cc: 'c',
  htm: 'html',
};

function normalizarLinguagem(lang) {
  const l = (lang || '').toLowerCase().trim();
  return ALIAS_LINGUAGEM[l] || l || null;
}

function detectarLinguagem(linhas) {
  const codigo = linhas.join('\n');
  if (/public\s+class|import\s+java\.|System\.out|extends\s+\w|implements\s+\w/.test(codigo)) return 'java';
  if (/def\s+\w+\s*\(|self\.\w|^\s*print\s*\(|^\s*from\s+\w+\s+import|elif\s+|^\s*pass\s*$/m.test(codigo)) return 'python';
  if (/function\s*[\w(]|const\s+\w+\s*=|let\s+\w+|var\s+\w+|console\.log|=>\s*[{(]/.test(codigo)) return 'javascript';
  if (/#include\s*<|printf\s*\(|scanf\s*\(|int\s+main\s*\(/.test(codigo)) return 'c';
  if (/<html|<!DOCTYPE|<div|<p>|<span/i.test(codigo)) return 'html';
  return 'default';
}

function tamanhoTab(linguagem) {
  return { java: 2, javascript: 2, html: 2, python: 4, c: 4 }[linguagem] ?? 2;
}

function indentarChaves(linhas, tabSize) {
  const tab = ' '.repeat(tabSize);
  let nivel = 0;
  return linhas.map(linha => {
    const t = linha.trim();
    if (!t) return '';
    const abre = (t.match(/\{/g) || []).length;
    const fecha = (t.match(/\}/g) || []).length;
    const net = abre - fecha;
    if (t.startsWith('}')) {
      nivel = Math.max(0, nivel - 1);
      const r = tab.repeat(nivel) + t;
      nivel = Math.max(0, nivel + net + 1);
      return r;
    }
    const r = tab.repeat(nivel) + t;
    nivel = Math.max(0, nivel + net);
    return r;
  });
}

function indentarPython(linhas, tabSize) {
  const tab = ' '.repeat(tabSize);
  const expandirTabs = (linha) => linha.replace(/\t/g, tab);
  const naoVazias = linhas
    .map(expandirTabs)
    .filter(linha => linha.trim().length > 0);
  const possuiIndentacaoOriginal = naoVazias.some(linha => /^\s+/.test(linha));

  // Quando o texto já traz indentação, não tentamos "adivinhar" blocos;
  // apenas normalizamos o deslocamento comum para evitar aninhamento incorreto.
  if (possuiIndentacaoOriginal) {
    const menorIndent = naoVazias.reduce((min, linha) => {
      const atual = (linha.match(/^\s*/) || [''])[0].length;
      return Math.min(min, atual);
    }, Infinity);

    return linhas.map(linha => {
      const expandida = expandirTabs(linha).trimEnd();
      if (!expandida.trim()) return '';
      return expandida.slice(Math.min(menorIndent, expandida.length));
    });
  }

  let nivel = 0;
  return linhas.map(linha => {
    const t = linha.trim();
    if (!t) return '';
    if (/^class\b/.test(t)) nivel = 0;
    else if (/^def\b/.test(t)) nivel = Math.max(0, nivel - 1);
    else if (/^(else|elif|except|finally)\b/.test(t)) nivel = Math.max(0, nivel - 1);
    const r = tab.repeat(nivel) + t;
    if (t.endsWith(':')) nivel++;
    return r;
  });
}

function indentarHTML(linhas, tabSize) {
  const tab = ' '.repeat(tabSize);
  let nivel = 0;
  const VOID = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i;
  return linhas.map(linha => {
    const t = linha.trim();
    if (!t) return '';
    if (/^<\//.test(t)) nivel = Math.max(0, nivel - 1);
    const r = tab.repeat(nivel) + t;
    if (/^<\w/.test(t) && !VOID.test(t) && !t.endsWith('/>') && !/<\/\w+>$/.test(t)) nivel++;
    return r;
  });
}

function indentarCodigo(linhas, linguagem) {
  const size = tamanhoTab(linguagem);
  if (linguagem === 'python') return indentarPython(linhas, size);
  if (linguagem === 'html') return indentarHTML(linhas, size);
  return indentarChaves(linhas, size);
}

function formatarTexto(texto) {
  if (!texto) return "";

  let processado = texto;

  // 1. Tenta extrair apenas o conteúdo útil se houver uma estrutura de documento
  // Procura por <div class="question">, <div class="question-option"> ou pelo conteúdo dentro de <body>
  const extracao = processado.match(/<div[^>]+class=["']question(?:-option)?["'][^>]*>([\s\S]*)<\/div>/i) || 
                   processado.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  
  if (extracao) {
    processado = extracao[1];
  }

  // 1. Converte tags de imagens externas para imagens padrão
  processado = processado.replace(/<grupoalayout\s+[^>]*banner="([^"]*)"[^>]*>[\s\S]*?<\/grupoalayout>/gi, (match, url) => {
    return `<img src="${url}" class="enunciado-img" style="max-width: 100%; display: block; margin: 1.5rem auto; border-radius: 12px; box-shadow: var(--shadow);">`;
  });

  // 2. Converte tags de anexos externas para botões de download
  processado = processado.replace(/<grupoaattachment\s+[^>]*file="([^"]*)"[^>]*title="([^"]*)"[^>]*buttoncolor="([^"]*)"[^>]*buttontextcolor="([^"]*)"[^>]*>[\s\S]*?<\/grupoaattachment>/gi, (match, url, titulo, corBg, corTxt) => {
    return `<a href="${url}" target="_blank" class="btn-anexo" style="background: ${corBg}; color: ${corTxt};">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>${titulo}</span>
    </a>`;
  });

  // 3. Normaliza quebras de linha em HTML para o processador, evitando duplicidade
  if (processado.includes('<p') || processado.includes('<div')) {
    processado = processado.replace(/<(p|div|br)[^>]*>/gi, '\n$&');
  }

  // 4. Limpeza final de tags residuais de envelope
  processado = processado.replace(/<\/?(html|head|body|meta|link)[^>]*>/gi, '');

  const linhas = processado.split('\n');
  const resultado = [];
  let emBlocoFence = false;
  let linguagemFence = null;
  let emBlocoHeuristico = false;
  let blocoAtual = [];

  const CODIGO_REGEX = /^(public|private|protected|class|interface|enum|abstract|void|int|double|float|long|boolean|char|byte|short|String|return|import|from|package|if\b|else\b|for\b|while\b|do\b|try\b|catch\b|except\b|finally\b|new\s+\w|static|final|this\.|super\.|self\.|def\b|elif\b|pass\b|print\b|yield\b|assert\b|with\b|raise\b|lambda\b|\/\/|\/\*|\*|\}|@\w)/;

  const pareceCodigoLinha = (linha) => {
    // Limpa apenas tags HTML REAIS (começam com letra ou / seguidas de caracteres de palavra), preservando < b ou x < y
    const textoPuro = linha.replace(/<\/?\w+\b[^>]*>/g, '').trim();
    if (!textoPuro) return emBlocoHeuristico;

    const temKeyword = CODIGO_REGEX.test(textoPuro);
    // Ignora ponto e vírgula se ele fizer parte de uma entidade HTML ou se vier após um parêntese (comum em frases)
    const temEstruturaForte = /[{;]$/.test(textoPuro) && !/&[a-zA-Z0-9#]+;$/.test(textoPuro) && !/\);$/.test(textoPuro);
    const temEstruturaFraca = /[():[\]]$/.test(textoPuro); 
    const temOperador = /[=+\-*\/<>!|&]/.test(textoPuro);
    const estaIndented = /^(\s{2,}|\t)/.test(linha.replace(/<[^>]*>/g, ''));
    // Detecta atribuição simples (ex: x = 10 ou lista = [])
    const temAtribuicao = /^[a-zA-Z_]\w*\s*=[^=]/.test(textoPuro);

    // Para COMEÇAR um bloco, precisa de keyword, sinal forte ou atribuição
    if (!emBlocoHeuristico) {
      return temKeyword || temEstruturaForte || temAtribuicao;
    }

    // Uma vez dentro do bloco, aceitamos sinais fracos, operadores, indentação ou atribuição
    return temKeyword || temEstruturaForte || temEstruturaFraca || temOperador || estaIndented || temAtribuicao;
  };

  const emitirBloco = (linguagem) => {
    const lang = linguagem || detectarLinguagem(blocoAtual);
    const indentado = indentarCodigo(blocoAtual, lang);
    resultado.push(`<pre><code>${escapeHTML(indentado.join('\n'))}</code></pre>`);
    emBlocoHeuristico = false;
    blocoAtual = [];
  };

  for (const linha of linhas) {
    const trimmed = linha.trim();

    // Detecta abertura de fence: ```linguagem ou ```
    const fenceAbrir = !emBlocoFence && trimmed.match(/^```(\w*)$/);
    if (fenceAbrir) {
      if (emBlocoHeuristico) emitirBloco(null); // fecha bloco heurístico pendente
      emBlocoFence = true;
      linguagemFence = normalizarLinguagem(fenceAbrir[1]);
      blocoAtual = [];
      continue;
    }

    // Detecta fechamento de fence
    if (emBlocoFence && trimmed === '```') {
      emitirBloco(linguagemFence);
      emBlocoFence = false;
      linguagemFence = null;
      continue;
    }

    // Dentro de bloco fence: acumula linha como está
    if (emBlocoFence) {
      blocoAtual.push(linha);
      continue;
    }

    // Detecção heurística para blocos sem fence
    if (pareceCodigoLinha(linha)) {
      if (!emBlocoHeuristico) {
        emBlocoHeuristico = true;
        blocoAtual = [];
      }
      // Ao guardar no bloco, limpamos apenas as tags reais para manter a integridade do código
      blocoAtual.push(linha.replace(/<\/?\w+\b[^>]*>/g, ''));
    } else {
      if (emBlocoHeuristico) emitirBloco(null);
      // Lista de tags HTML seguras. Usamos \b para evitar que < b seja confundido com <b>
      const TAGS_SEGURAS = /<\/?(b|i|u|strong|em|sup|sub|br|p|div|span|img|a|pre|code|h[1-6]|ul|ol|li|blockquote|table|tr|td|th|thead|tbody|tfoot)\b[^>]*>/i;
      
      const tDiv = document.createElement("div");
      tDiv.innerHTML = linha;
      // Consideramos HTML apenas se houver tags seguras OU entidades HTML
      const temHTML = TAGS_SEGURAS.test(linha) || /&[a-zA-Z0-9#]+;/.test(linha);
      resultado.push(temHTML ? linha : escapeHTML(linha));
    }
  }

  // Fecha blocos não encerrados
  if (emBlocoFence && blocoAtual.length > 0) emitirBloco(linguagemFence);
  else if (emBlocoHeuristico && blocoAtual.length > 0) emitirBloco(null);

  // Une as linhas de forma inteligente: evita <br> antes de tags de bloco
  return resultado.reduce((acc, linha, i) => {
    const limpa = linha.trim();
    if (!limpa) return acc;
    
    if (i === 0) return limpa;
    
    // Se a linha começa com uma tag de bloco ou de formatação, não precisa de <br>
    const isSpecialTag = /^<(p|div|br|img|a|pre|h|blockquote|ul|ol|li|b|i|u|strong|em|sup|sub|span)/i.test(limpa);
    return acc + (isSpecialTag ? "" : "<br>") + limpa;
  }, "");
}

function renderConteudoComFlag(destino, texto) {
  // Sempre usamos formatarTexto para garantir suporte a imagens, códigos e limpeza de tags
  destino.innerHTML = formatarTexto(texto);
}
