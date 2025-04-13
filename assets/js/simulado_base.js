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

function escaparHTML(str) {
	const div = document.createElement("div");
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

function renderOpcao(op) {
	const isHTML = op.isHTML ?? true;
	return isHTML ? op.text : escaparHTML(op.text);
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
      <h3 style="text-align: left">${questaoAtual + 1}) ${q.enunciated}</h3>
      <p style="text-align: left"><em>Arquivo: ${q._arquivo}</em></p>
    `;
	
	q.options.forEach(op => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		btn.innerHTML = renderOpcao(op);
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
	enunciado.innerHTML = `<strong>${questaoAtual + 1})</strong> ${q.enunciated}`;
	qDiv.appendChild(enunciado);
	
	q.options.forEach((opcao) => {
		const btn = document.createElement("button");
		btn.className = "opcao";
		btn.innerHTML = renderOpcao(opcao);
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

