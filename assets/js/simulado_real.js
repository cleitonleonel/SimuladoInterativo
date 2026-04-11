let baseQuestoes = []; // Todas as questões carregadas dos arquivos
const setupArea = document.getElementById("setupArea");
const btnIniciar = document.getElementById("btnIniciar");

function prepararSimulado(listaQuestoes) {
    baseQuestoes = listaQuestoes;
    const uploadArea = document.getElementById("uploadArea");
    if (uploadArea) uploadArea.style.display = "none";
    if (setupArea) setupArea.style.display = "block";
}

btnIniciar.onclick = () => {
    const qtdStr = document.getElementById("qtdQuestoes").value;
    const tempoLimitMin = parseInt(document.getElementById("tempoLimite").value);
    
    let qtd = qtdStr === "all" ? baseQuestoes.length : parseInt(qtdStr);
    if (qtd > baseQuestoes.length) qtd = baseQuestoes.length;

    // Configura o timer na base
    if (tempoLimitMin > 0) {
        tempoRestante = tempoLimitMin * 60;
    } else {
        tempoRestante = 999 * 60; // Praticamente sem limite
        const timerEl = document.getElementById("timer");
        if (timerEl) timerEl.style.display = "none";
    }

    // Seleciona e embaralha as questões
    renderizarQuestoes(baseQuestoes, qtd);
    
    if (setupArea) setupArea.style.display = "none";
};

function renderizarQuestoes(listaQuestoes, totalDesejado) {
	const questoesSelecionadas = [];

	if (!Array.isArray(listaQuestoes) || listaQuestoes.length === 0) {
		alert("Nenhuma questão válida encontrada.");
		return;
	}

    // Agrupar questões por arquivo para balanceamento
    const porArquivo = {};
    listaQuestoes.forEach(q => {
        if (!porArquivo[q._arquivo]) porArquivo[q._arquivo] = [];
        porArquivo[q._arquivo].push(q);
    });

    const nomesArquivos = Object.keys(porArquivo);
    const qtdPorArquivo = Math.floor(totalDesejado / nomesArquivos.length);
    let resto = totalDesejado % nomesArquivos.length;

    nomesArquivos.forEach(nome => {
        let qs = porArquivo[nome];
        let numParaPegar = Math.min(qs.length, qtdPorArquivo + (resto > 0 ? 1 : 0));
        if (resto > 0) resto--;

        const indices = shuffle_secure(qs.length).slice(0, numParaPegar);
        indices.forEach(i => {
            const q = JSON.parse(JSON.stringify(qs[i])); // deep clone
            const opcoes = q.options;
            const ordem = shuffle_secure(opcoes.length);
            q.options = ordem.map(idx => opcoes[idx]);
            questoesSelecionadas.push(q);
        });
    });

    // Se ainda não chegamos ao total desejado por conta de arquivos pequenos, 
    // pegamos o resto aleatoriamente das que sobraram
    if (questoesSelecionadas.length < totalDesejado) {
        const IDsJaPegas = new Set(questoesSelecionadas.map(q => q.enunciated + q._arquivo));
        const restantes = listaQuestoes.filter(q => !IDsJaPegas.has(q.enunciated + q._arquivo));
        const extras = shuffle_secure(restantes.length).slice(0, totalDesejado - questoesSelecionadas.length);
        extras.forEach(i => {
            const q = JSON.parse(JSON.stringify(restantes[i]));
            const opcoes = q.options;
            const ordem = shuffle_secure(opcoes.length);
            q.options = ordem.map(idx => opcoes[idx]);
            questoesSelecionadas.push(q);
        });
    }

    // Embaralha o pool final para não ficar agrupado por arquivo
	questoes = shuffle_all(questoesSelecionadas);
	iniciarSimuladoReal();
}

inputJson.addEventListener("change", async (event) => {
	const arquivos = Array.from(event.target.files).filter(f => f.name.endsWith(".json"));
	const todasAsQuestoes = [];
	
	for (const arq of arquivos) {
		try {
			const texto = await arq.text();
			const json = JSON.parse(texto);
			const qs = json?.content?.questions || [];
            qs.forEach(q => q._arquivo = arq.name);
			todasAsQuestoes.push(...qs);
		} catch (e) {
			console.error(`Erro ao ler o arquivo ${arq.name}:`, e);
		}
	}
	
	if (todasAsQuestoes.length === 0) {
		alert("Nenhum JSON válido com questões encontrado.");
		return;
	}
	
	prepararSimulado(todasAsQuestoes);
});

inputZip.addEventListener("change", async (event) => {
	const zipFiles = event.target.files;
	const todasAsQuestoes = [];
	
	for (const zipFile of zipFiles) {
		try {
			const zip = await JSZip.loadAsync(zipFile);
			for (const nome of Object.keys(zip.files)) {
				if (nome.endsWith(".json")) {
					try {
						const conteudo = await zip.files[nome].async("string");
						const json = JSON.parse(conteudo);
						const qs = json?.content?.questions || [];
                        qs.forEach(q => q._arquivo = nome);
						todasAsQuestoes.push(...qs);
					} catch (e) {
						console.error(`Erro ao ler o arquivo ${nome}:`, e);
					}
				}
			}
		} catch (e) {
			console.error(`Erro ao processar o arquivo ZIP ${zipFile.name}:`, e);
		}
	}
	
	if (todasAsQuestoes.length === 0) {
		alert("Nenhum arquivo JSON válido encontrado dentro dos ZIPs.");
		return;
	}
	
	prepararSimulado(todasAsQuestoes);
});
