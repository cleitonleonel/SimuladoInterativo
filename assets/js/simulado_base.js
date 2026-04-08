const inputJson = document.getElementById("inputJson");
const inputZip = document.getElementById("inputZip");
const container = document.getElementById("container");
const timerEl = document.getElementById("timer");
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
	iniciarCronometro();
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
	carregarArquivo();
}

function iniciarCronometro() {
	clearInterval(intervalo);
	intervalo = setInterval(() => {
		if (tempoRestante <= 0) {
			clearInterval(intervalo);
			mostrarResultado("⏰ Tempo esgotado!");
			return;
		}
		tempoRestante--;
		const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
		const segundos = String(tempoRestante % 60).padStart(2, "0");
		timerEl.textContent = `Tempo restante: ${minutos}:${segundos}`;
	}, 1000);
}

function atualizarBarraReal() {
	const percentual = ((questaoAtual) / questoes.length) * 100;
	barra.style.width = percentual + "%";
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
	container.innerHTML = `
      <div class="enunciado" style="text-align: left"><strong>${questaoAtual + 1})</strong> ${formatarTexto(q.enunciated)}</div>
      <p style="text-align: left"><em>Arquivo: ${q._arquivo}</em></p>
    `;
	
	q.options.forEach(op => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		//btn.innerHTML = renderOpcao(op);
		renderConteudoComFlag(btn, op.text, op.isHTML);
		btn.onclick = () => {
			const correta = q.options.find(o => o.isCorrect);
			const feedback = document.createElement("p");
			const explicacao = document.createElement("div");
			
			if (op.isCorrect) {
				feedback.innerHTML = "✅ Correto!";
				feedback.className = "correta";
				audioCorreto.play();
				acertos++;
			} else {
				feedback.innerHTML = "❌ Incorreto. A correta era: " + correta.text;
				feedback.className = "incorreta";
				audioErro.play();
			}
			
			explicacao.innerHTML = "📝 " + (op.feedback || "Sem justificativa.");
			explicacao.className = "feedback";
			
			container.appendChild(feedback);
			container.appendChild(explicacao);
			
			Array.from(container.getElementsByTagName("button")).forEach(b => b.disabled = true);
			
			const btnProx = document.createElement("button");
			btnProx.textContent = "Próxima questão";
			btnProx.onclick = () => {
				questaoAtual++;
				renderizarQuestaoReal();
			};
			container.appendChild(btnProx);
		};
		container.appendChild(btn);
	});
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
	qDiv.className = "questao";
	
	const titulo = document.createElement("h3");
	titulo.innerHTML = `Arquivo: ${arquivos[arquivoAtual].name}`;
	qDiv.appendChild(titulo);
	
	const enunciado = document.createElement("div");
	enunciado.innerHTML = `<strong>${questaoAtual + 1})</strong> ${formatarTexto(q.enunciated)}`;
	qDiv.appendChild(enunciado);
	
	q.options.forEach((opcao) => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		//btn.innerHTML = renderOpcao(opcao);
		renderConteudoComFlag(btn, opcao.text, opcao.isHTML);
		btn.onclick = () => {
			const tempo = ((Date.now() - inicio) / 1000).toFixed(2);
			tempos.push(tempo);
			totalQuestoes++;
			
			const feedback = document.createElement("p");
			const correta = q.options.find(opt => opt.isCorrect);
			const acertou = opcao.isCorrect;
			
			feedback.innerHTML = acertou ? "✅ Correto!" : "❌ Incorreto.";
			feedback.className = acertou ? "correta" : "incorreta";
			
			const explicacao = document.createElement("div");
			explicacao.innerHTML = "📝 " + (opcao.feedback || "");
			explicacao.className = "feedback";
			
			if (!acertou && correta) {
				const corretaDiv = document.createElement("div");
				corretaDiv.className = "correta";
				corretaDiv.style.marginTop = "10px";
				corretaDiv.innerHTML = `✔️ Resposta correta: <br><strong>${correta.text}</strong>`;
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
			Array.from(qDiv.getElementsByTagName("button")).forEach(b => b.disabled = true);
			
			const proximo = document.createElement("button");
			proximo.textContent = "Próxima questão";
			proximo.onclick = () => {
				questaoAtual++;
				renderizarQuestao();
			};
			qDiv.appendChild(proximo);
		};
		qDiv.appendChild(btn);
	});
	
	container.appendChild(qDiv);
}

function mostrarResultadoReal(msg) {
	barra.style.width = "100%";
	container.innerHTML = `
      <h2>${msg}</h2>
      <p>Você acertou <strong>${acertos}</strong> de <strong>${questoes.length}</strong> questões.</p>
      <button onclick="window.location.reload()">🔁 Refazer simulado</button>
      <button onclick="gerarPDF()">📄 Exportar resultado</button>
    `;
}

function gerarPDF() {
	const resultado = document.getElementById("container").cloneNode(true);
	resultado.querySelectorAll("button").forEach(b => b.remove());
	resultado.querySelectorAll("audio").forEach(a => a.remove());
	
	const opt = {
		margin: 0.5,
		filename: `resultado_simulado_${new Date().toISOString().slice(0, 10)}.pdf`,
		image: {type: 'jpeg', quality: 0.98},
		html2canvas: {scale: 2},
		jsPDF: {unit: 'in', format: 'a4', orientation: 'portrait'}
	};
	
	html2pdf().from(resultado).set(opt).save();
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
	resultado.innerHTML = `
      <h2>Simulado Concluído</h2>
      <p>Você acertou <strong>${acertosTotal}</strong> de <strong>${totalQuestoes}</strong> questões.</p>
      <h3>Tempos de resposta:</h3>
      <ul>${tempos.map((t, i) => `<li>Questão ${i + 1}: ${t}s</li>`).join('')}</ul>
      <h3>Resultado por Arquivo:</h3>
      ${resultadosPorArquivo.map(r =>
		`<div class="result-arquivo"><strong>${r.nome}</strong>: ${r.acertos}/${r.total} acertos</div>`
	).join('')}
      <button onclick="window.location.reload()">🔁 Refazer simulado</button>
      <button class="whatsapp" onclick="compartilharWhatsApp()">📤 Compartilhar no WhatsApp</button>
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

function renderConteudoSeguro(destino, texto) {
  const el = document.createElement("div");
  el.innerHTML = texto;

  const contemTagsHTML = el.innerHTML !== el.textContent;
  destino.innerHTML = contemTagsHTML ? texto : escapeHTML(texto);
}

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
  const linhas = texto.split('\n');
  const resultado = [];
  let emBlocoFence = false;
  let linguagemFence = null;
  let emBlocoHeuristico = false;
  let blocoAtual = [];

  const CODIGO_REGEX = /^(public|private|protected|class|interface|enum|abstract|void|int|double|float|long|boolean|char|byte|short|String|return|import|package|if\s*[\({]|else[\s{]|for\s*\(|while\s*\(|do\s*[{(]|try\s*\{|catch\s*\(|finally|new\s+\w|static|final|this\.|super\.|self\.|def\s+\w|elif\s|pass\b|\/\/|\/\*|\*|\}|@\w)/;

  const pareceCodigoLinha = (linha) => {
    const l = linha.trim();
    if (!l) return emBlocoHeuristico;
    return CODIGO_REGEX.test(l) || /[{};]$/.test(l);
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
      blocoAtual.push(linha);
    } else {
      if (emBlocoHeuristico) emitirBloco(null);
      if (trimmed) resultado.push(escapeHTML(linha));
    }
  }

  // Fecha blocos não encerrados
  if (emBlocoFence && blocoAtual.length > 0) emitirBloco(linguagemFence);
  else if (emBlocoHeuristico && blocoAtual.length > 0) emitirBloco(null);

  return resultado.join('<br>');
}

function renderConteudoComFlag(destino, texto, isHTML = null) {
  if (isHTML === true) {
    destino.innerHTML = texto;
  } else if (isHTML === false) {
    destino.innerHTML = escapeHTML(texto);
  } else {
    renderConteudoSeguro(destino, texto);
  }
}
