inputJson.addEventListener("change", async (event) => {
	arquivos = Array.from(event.target.files).filter(f => f.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name));
	iniciarSimulado();
});

inputZip.addEventListener('change', async (event) => {
  const zipFiles = event.target.files;

  for (const zipFile of zipFiles) {
    const zip = await JSZip.loadAsync(zipFile);
    
    for (const nome of Object.keys(zip.files)) {
      if (nome.endsWith(".json")) {
        const conteudo = await zip.files[nome].async("string");
        const blob = new Blob([conteudo], { type: "application/json" });
        blob.name = nome;
        arquivos.push(blob);
      }
    }
  }
	iniciarSimulado();
});
