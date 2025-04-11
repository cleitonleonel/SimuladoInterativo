# 📘 Simulado Interativo

Bem-vindo ao **Simulado Interativo**, uma plataforma leve e moderna para realizar simulados diretamente no navegador, com visual bonito, som de acertos/erros e suporte a modo escuro. Desenvolvido com foco em estudantes, concurseiros e autodidatas que querem treinar seus conhecimentos de forma prática e organizada.

---

## 🎯 Objetivo

Criar uma experiência de simulado realista e interativa, utilizando arquivos `.json` contendo questões de múltipla escolha. Ideal para estudar com foco e simular provas com tempo e desempenho por questão.

---

## 👤 Público-alvo

- Estudantes em geral
- Concurseiros
- Preparatórios para provas
- Professores que queiram gerar simulados a partir de banco de questões

---

## ⚙️ Como funciona

O projeto é dividido em duas páginas principais:

- **Simulado Geral (`simulado_geral.html`)** – exibe todas as questões dos arquivos `.json` fornecidos.
- **Simulado Aleatório (`simulado_real.html`)** – seleciona 10 questões aleatórias de arquivos distintos com um cronômetro de 1 hora.

Além disso, você pode:

- Carregar pastas com arquivos `.json`
- Ver barra de progresso e tempo restante
- Receber feedback com som ao responder
- Alternar entre modo claro e escuro 🌙
- Salvar estatísticas e tempo por questão (em desenvolvimento)

---

## 📂 Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/cleitonleonel/SimuladoInterativo.git -o simulado-interativo
   ```

## 📝 Formato do JSON

1. Cada arquivo .json deve conter a estrutura abaixo:
   ```json
   {
     "content": {
       "questions": [
         {
           "enunciated": "Qual a capital da França?",
           "options": [
             {"text": "Paris", "isCorrect": true, "feedback": "Correto! Paris é a capital."},
             {"text": "Londres", "isCorrect": false, "feedback": "Errado. Londres é a capital do Reino Unido."}
           ]
         }
       ]
     }
   }
   ```

---

## 🖥️ Como abrir localmente

1. Após clonar o repositório, navegue até a pasta do projeto:

   ```bash
   cd simulado-interativo
   ```

2. Abra o arquivo `index.html` no seu navegador preferido. Você pode fazer isso de duas formas:

- 🖱️ **Clique duas vezes** no arquivo `index.html` (modo simples)

- 💻 **Ou execute um dos comandos abaixo no terminal**, dependendo do seu sistema:

```bash
xdg-open index.html      # Linux
open index.html          # macOS
start index.html         # Windows
```

---

## 🧑‍💻 Desenvolvedor

Feito com 💙 por [Cleiton Leonel Creton](https://www.linkedin.com/in/cleitonleonel)  
📫 cleiton.leonel@gmail.com  
🐙 [GitHub](https://github.com/cleitonleonel) | 📱 [WhatsApp](https://wa.me/5527995772291?text=Ol%C3%A1%2C+vim+pelo+seu+simulado+interativo+e+gostaria+de+falar+com+voc%C3%AA!)

