# Miro2 - Sistema de Chamados

Este projeto é um sistema simples de gerenciamento de chamados, desenvolvido com Node.js, Express, SQLite e uma interface web responsiva utilizando Bootstrap.

## Funcionalidades

- Cadastro de chamados com título, descrição e prioridade (Normal, Alta, Crítica)
- Visualização dos chamados em três colunas: Fila de Atendimento, Em Atendimento e Concluídos
- Mudança de status dos chamados (Atender, Concluir, Reabrir)
- Filtro de chamados por prioridade em cada coluna
- Edição de chamados já cadastrados
- Interface web responsiva e fácil de usar

## Como executar

1. **Instale as dependências**  
   No diretório `backend`:
   ```sh
   npm install
   ```

2. **Inicie o servidor**  
   No diretório `backend`:
   ```sh
   npm start
   ```
   O servidor será iniciado em `http://localhost:3001`.

3. **Acesse a interface web**  
   Abra o arquivo `backend/public/index.html` no navegador  
   ou acesse `http://localhost:3001` se preferir servir via backend.

## Estrutura do Projeto

```
Miro2/
  backend/
    database.db
    package.json
    server.js
    public/
      chamados_cliente.html
      index.html
      login.html
      style.css
  README.md
  .gitignore
```

## Tecnologias utilizadas

- Node.js
- Express
- SQLite3
- Bootstrap 5

## Observações

- O banco de dados é criado automaticamente no arquivo `database.db` na primeira execução.
- Os chamados são salvos de forma persistente no banco SQLite.
- Para desenvolvimento local, certifique-se de que a porta 3001 está livre.

---

Desenvolvido para fins de estudo e aprimoramento profissional.