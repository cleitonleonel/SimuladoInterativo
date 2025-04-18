const totalQuestoesDesejadas = 10;

function renderizarQuestoes(listaQuestoes) {
	const questoesSelecionadas = [];

	if (!Array.isArray(listaQuestoes) || listaQuestoes.length === 0) {
		alert("Nenhuma questão válida recebida da IA.");
		return;
	}

	if (listaQuestoes.length <= totalQuestoesDesejadas) {
		for (const q of listaQuestoes) {
			const opcoes = q.options || [];
			const ordem = shuffle_secure(opcoes.length);
			q.options = ordem.map(i => opcoes[i]);
			q._arquivo = "IA"; // Identifica que veio da IA
			questoesSelecionadas.push(q);
		}
	} else {
		const indices = shuffle_secure(listaQuestoes.length).slice(0, totalQuestoesDesejadas);
		for (const i of indices) {
			const q = listaQuestoes[i];
			const opcoes = q.options || [];
			const ordem = shuffle_secure(opcoes.length);
			q.options = ordem.map(i => opcoes[i]);
			q._arquivo = "IA";
			questoesSelecionadas.push(q);
		}
	}

	questoes = questoesSelecionadas;
	iniciarSimuladoReal();
}

inputJson.addEventListener("change", async (event) => {
	const arquivos = Array.from(event.target.files).filter(f => f.name.endsWith(".json"));
	const arquivosQuestoes = [];
	const questoesSelecionadas = [];
	
	for (const arq of arquivos) {
		try {
			const texto = await arq.text();
			const json = JSON.parse(texto);
			const qs = json?.content?.questions || [];
			if (qs.length > 0) {
				arquivosQuestoes.push({nome: arq.name, questoes: qs});
			}
		} catch (e) {
			console.error(`Erro ao ler o arquivo ${arq.name}:`, e);
		}
	}
	
	if (arquivosQuestoes.length === 0) {
		alert("Nenhum JSON válido com questões encontrado.");
		return;
	}
	
	if (arquivosQuestoes.length === 1) {
		const {nome, questoes: qs} = arquivosQuestoes[0];
		const indices = shuffle_secure(qs.length).slice(0, totalQuestoesDesejadas);
		indices.forEach(i => {
			const q = qs[i];
			const opcoes = q.options;
			const ordem = shuffle_secure(opcoes.length);
			q.options = ordem.map(i => opcoes[i]);
			q._arquivo = nome;
			questoesSelecionadas.push(q);
		});
	} else {
		const base = Math.floor(totalQuestoesDesejadas / arquivosQuestoes.length);
		let resto = totalQuestoesDesejadas % arquivosQuestoes.length;
		
		for (const {nome, questoes: qs} of arquivosQuestoes) {
			const qtd = base + (resto > 0 ? 1 : 0);
			if (resto > 0) resto--;
			
			const indices = shuffle_secure(qs.length).slice(0, qtd);
			indices.forEach(i => {
				const q = qs[i];
				const opcoes = q.options;
				const ordem = shuffle_secure(opcoes.length);
				q.options = ordem.map(i => opcoes[i]);
				q._arquivo = nome;
				questoesSelecionadas.push(q);
			});
		}
	}
	
	questoes = questoesSelecionadas;
	iniciarSimuladoReal();
});

inputZip.addEventListener("change", async (event) => {
	const zipFiles = event.target.files;
	const arquivosQuestoes = [];
	const questoesSelecionadas = [];
	
	for (const zipFile of zipFiles) {
		try {
			const zip = await JSZip.loadAsync(zipFile);
			
			for (const nome of Object.keys(zip.files)) {
				if (nome.endsWith(".json")) {
					try {
						const conteudo = await zip.files[nome].async("string");
						const json = JSON.parse(conteudo);
						const qs = json?.content?.questions || [];
						if (qs.length > 0) {
							arquivosQuestoes.push({nome, questoes: qs});
						}
					} catch (e) {
						console.error(`Erro ao ler o arquivo ${nome}:`, e);
					}
				}
			}
		} catch (e) {
			console.error(`Erro ao processar o arquivo ZIP ${zipFile.name}:`, e);
		}
	}
	
	if (arquivosQuestoes.length === 0) {
		alert("Nenhum arquivo JSON válido encontrado.");
		return;
	}
	
	if (arquivosQuestoes.length === 1) {
		const {nome, questoes: qs} = arquivosQuestoes[0];
		const indices = shuffle_secure(qs.length).slice(0, totalQuestoesDesejadas);
		indices.forEach(i => {
			const q = qs[i];
			const opcoes = q.options;
			const ordem = shuffle_secure(opcoes.length);
			q.options = ordem.map(i => opcoes[i]);
			q._arquivo = nome;
			questoesSelecionadas.push(q);
		});
	} else {
		const base = Math.floor(totalQuestoesDesejadas / arquivosQuestoes.length);
		let resto = totalQuestoesDesejadas % arquivosQuestoes.length;
		
		for (const {nome, questoes: qs} of arquivosQuestoes) {
			const qtd = base + (resto > 0 ? 1 : 0);
			if (resto > 0) resto--;
			
			const indices = shuffle_secure(qs.length).slice(0, qtd);
			indices.forEach(i => {
				const q = qs[i];
				const opcoes = q.options;
				const ordem = shuffle_secure(opcoes.length);
				q.options = ordem.map(i => opcoes[i]);
				q._arquivo = nome;
				questoesSelecionadas.push(q);
			});
		}
	}
	
	questoes = questoesSelecionadas;
	iniciarSimuladoReal();
});
