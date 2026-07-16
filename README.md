# readme-stats

API própria de cards SVG para o README de perfil do GitHub, substituindo o [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) público. Gera os cards dinamicamente a partir da API GraphQL do GitHub e roda como serverless functions na Vercel.

## Endpoints

### `GET /api` — stats gerais

```
https://<seu-deploy>.vercel.app/api?username=ghpm99&show_icons=true&theme=dracula&line_height=27
```

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `username` | string | — | **Obrigatório.** Login do GitHub |
| `theme` | string | `default` | Tema do card (`default`, `dracula`) |
| `show_icons` | boolean | `false` | Exibe ícones ao lado de cada stat |
| `line_height` | number | `25` | Altura de cada linha (15–50) |
| `hide` | lista | — | Stats a ocultar: `stars,commits,prs,issues,contribs` |
| `hide_rank` | boolean | `false` | Oculta o círculo de rank |
| `hide_border` | boolean | `false` | Oculta a borda do card |
| `custom_title` | string | — | Substitui o título do card |

### `GET /api/top-langs` — linguagens mais usadas

```
https://<seu-deploy>.vercel.app/api/top-langs?username=ghpm99&theme=dracula&hide_langs_below=1
```

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `username` | string | — | **Obrigatório.** Login do GitHub |
| `theme` | string | `default` | Tema do card (`default`, `dracula`) |
| `hide_langs_below` | number | `0` | Oculta linguagens abaixo de N% (os percentuais restantes são renormalizados) |
| `langs_count` | number | `5` | Quantidade máxima de linguagens (1–20) |
| `hide` | lista | — | Linguagens a ocultar, ex.: `hide=html,css` |
| `hide_border` | boolean | `false` | Oculta a borda do card |
| `custom_title` | string | — | Substitui o título do card |

## Deploy na Vercel

1. Importe este repositório na Vercel (framework preset: **Other** — as functions em `api/` são detectadas automaticamente).
2. Crie um token do GitHub em <https://github.com/settings/tokens> (para perfil público, um fine-grained token sem permissões extras basta; para contar repositórios privados, conceda leitura de repositórios).
3. Em **Settings → Environment Variables**, adicione `GITHUB_TOKEN` com o token criado.
4. Deploy. Use as URLs acima no README do perfil.

## Desenvolvimento

```sh
npm install
npm run lint   # eslint
npm test       # vitest
npm run build  # tsc --noEmit
npm run dev    # vercel dev (precisa do vercel CLI logado e de GITHUB_TOKEN no .env)
```

## Limitações conhecidas

- As estrelas somam os 100 repositórios próprios mais estrelados (suficiente para contas com até 100 repos relevantes).
- `Total Commits` usa o total do ano corrente (`contributionsCollection`), igual ao comportamento padrão do github-readme-stats.
- As respostas são cacheadas por 4h (`s-maxage=14400`) + `stale-while-revalidate` de 24h.
