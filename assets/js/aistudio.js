function toggleTheme() {
	document.body.classList.toggle('dark-mode');
}

async function enviarPrompt() {
	const API_KEY = document.getElementById("api_key").value;
	const msg = document.getElementById("message");
	const err = document.getElementById("error-message");
	const loading = document.getElementById("loading");
	const modal = document.getElementById("modalIA");
	
	const promptOriginal = document.getElementById("prompt").value;
	
	const exemploFormato = `Por favor, crie em um único arquivo JSON contendo as questões da disciplina citada.
Formato:
{
  "content": {
    "questions": [
      {
        "enunciated": "Qual a capital da França?",
        "options": [
          { "text": "Paris", "isCorrect": true, "feedback": "Correto! Paris é a capital." },
          { "text": "Londres", "isCorrect": false, "feedback": "Errado. Londres é a capital do Reino Unido." }
        ]
      }
    ]
  }
}`;
	
	const prompt = promptOriginal + "\n\n" + exemploFormato;
	
	
	msg.textContent = "";
	err.textContent = "";
	loading.style.display = 'block';
	
	if (!API_KEY) {
		err.textContent = "Por favor, insira sua chave de API.";
		loading.style.display = 'none';
		return;
	}
	
	const body = {
		contents: [{parts: [{text: prompt}]}],
		generationConfig: {
			responseMimeType: "application/json",
		}
	};
	
	try {
		const response = await fetch(
			"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
			{
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(body)
			}
		);
		
		const data = await response.json();
		const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
		const json = JSON.parse(text);
		if (json) {
			const blob = new Blob([text], {type: 'application/json'});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "resposta.json";
			a.click();
			URL.revokeObjectURL(url);
			msg.textContent = "✅ A resposta foi salva como arquivo JSON.";
			if (typeof renderizarQuestoes === "function") {
				renderizarQuestoes(json.content.questions);
			} else {
				err.textContent = "Função de renderização não encontrada.";
			}
		} else {
			err.textContent = "Resposta da IA vazia ou malformada.";
		}
	} catch (error) {
		console.error(error);
		err.textContent = "Erro ao acessar a API.";
	} finally {
		loading.style.display = 'none';
		if (modal) {
			modal.style.display = 'none';
		}
	}
}

document.getElementById("btnIA").addEventListener("click", () => {
	const modal = document.getElementById("modalIA");
	const modalContent = modal.querySelector(".modal-content");
	modal.style.display = "block";
	setTimeout(() => {
		modal.classList.add("show");
		modalContent.classList.add("show");
	}, 10);  // Delay para garantir a animação
});

document.getElementById("fecharModalIA").addEventListener("click", () => {
	const modal = document.getElementById("modalIA");
	const modalContent = modal.querySelector(".modal-content");
	modal.classList.remove("show");
	modalContent.classList.remove("show");
	setTimeout(() => {
		modal.style.display = "none";
	}, 300); // Tempo da animação de fechamento
});

window.onclick = function (event) {
	const modal = document.getElementById("modalIA");
	if (event.target === modal) {
		const modalContent = modal.querySelector(".modal-content");
		modal.classList.remove("show");
		modalContent.classList.remove("show");
		setTimeout(() => {
			modal.style.display = "none";
		}, 300);
	}
};

document.getElementById("prompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enviarPrompt().then(r => {});
    }
});
