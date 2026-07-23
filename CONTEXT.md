# CENTRAL OPS · Plano Operacional — CONTEXT.md
> Para o próximo Claude: leia tudo antes de tocar em qualquer arquivo.
> Atualizado: 22/07/2026 · v1.2

---

## 1. Identidade

**Sistema:** CENTRAL OPS / Plano Operacional
**Órgão:** AMC Fortaleza — NIT (Núcleo de Inteligência de Tráfego)
**Desenvolvedor:** Cristiano Miranda (CrissTiano07) — solo
**URL:** crisstiano07.github.io/NIT_Planop-/
**Repositório:** github.com/CrissTiano07/NIT_Planop-

**A dor que originou o produto:** o supervisor monta a escala do fim de semana toda sexta, no Excel, para ~200 agentes em dezenas de postos e turnos diferentes. Muda muito, dói muito. Tudo no sistema serve a resolver isso.

**Status:** em desenvolvimento. Ainda não está em uso por ninguém além do desenvolvedor.

---

## 2. Stack e arquivos

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vanilla JS + HTML + CSS (sem frameworks) |
| Banco | Firebase RTDB (`nit-operacional-default-rtdb.firebaseio.com`) |
| Deploy | GitHub Pages via Actions (`static.yml`) |
| Backend | **Nenhum** — 100% client-side |

```
planop.js    ~3770L   toda a lógica (IIFE único)
planop.css   ~2300L   todo o CSS
index.html    ~310L   HTML + Firebase config
```

**Ordem interna do JS (obrigatória):**
`S (estado) → CFG (constantes) → helpers → Auth → DB → UI → Campo → Actions → listeners globais → return { Auth, UI, Campo, Actions, DB }`

---

## 3. Firebase

**apiKey:** `AIzaSyCWAGfmCr-pHr0asIk_Sfz1WbajIEhiZn0`

**Paths que o Planop ESCREVE:**
```
/efetivo/escalas/{id}/           status, data, turno, horários, supervisao{}
/efetivo/operacoes/{id}/         escalaId, turno, bairro, tipoMissao, recorrência
/efetivo/postos/{id}/            escalaId, operacaoId, local, orientadores{}
/efetivo/recursos/{id}/          cadastro + status + turno_padrao + bairro + transporte
/efetivo/supervisao_config/      padrão de supervisão por turno
/efetivo/config/                 (legado, ainda usado)
```

**Paths PROIBIDOS (são do módulo Semáforo):**
```
/kanban/*   /recursos/*   /usuarios_autorizados/*   /cursor_exportacao/*
```

**emailKey:** `.` → `_` e `@` → `_at_` (ex: `user_at_gmail_com`)
O Semáforo usa `|` — formato diferente, nunca misturar.

**Rules:** precisam incluir `efetivo/config` e `efetivo/supervisao_config` (adicionados em 21/07).

---

## 4. Auth

- Login normal: `signInWithRedirect` (Google) — **não popup**, gera erro COOP
- **Aba anônima:** Chrome 120+ bloqueia cookies de terceiros e quebra o redirect. `Auth.login()` detecta incógnito testando `localStorage` e cai para `signInWithPopup`
- Modo Campo: auth anônima via `?modo=campo`
- Roles em `/efetivo_roles/{emailKey}` → `monitor | supervisor | admin`
- `_resolveRole` tenta `/role` (string) e depois a raiz — suporta as duas estruturas

---

## 5. Layout atual (reestruturado em 21/07)

```
┌────────────┬────────────────────────────────┬──────────┐
│ CONTEXTO   │ [Manhã][Tarde][Noite][Extraord]│  EFETIVO │
│            │ ‹ Hoje ›  [busca]  [+ Nova Op] │          │
│ turno ativo│ ────────────────────────────── │  totais  │
│ supervisão │ ▸ Aldeota · Controle       ●   │  lista   │
│            │   └ postos (expandem inline)   │  staff   │
│ usuário    │ ▸ Parangaba · Apoio        ●   │          │
└────────────┴────────────────────────────────┴──────────┘
```

**A sidebar NÃO é mais navegação** — virou painel de contexto (turno, supervisão, usuário). A lista de operações vive no centro.

**Abas de turno no topo do centro** — decisão fundamentada: turno é filtro temporal (3-4 itens), não navegação de seção. Padrão de mercado põe isso em top bar.

**Operações expandem inline** ao clicar; os postos aparecem dentro do card.

**Form de nova operação é overlay modal** — precisou sair da sidebar porque o centro re-renderiza e destruiria um form inline.

---

## 6. Decisões arquiteturais críticas

### Listeners
```js
S._unsubs         // globais — limpos no logout
S._escalaUnsubs   // ops/postos — limpos a cada troca de turno
S._suppressRender // flag 600-800ms — bloqueia render durante writes
```
`_listenOperacoes` e `_listenPostos` **sempre filtram por escalaId** e **reconstroem** o estado do snap (não fazem merge aditivo) — senão deleções não refletem na UI.

### Renderização cirúrgica (NÃO substituir por renderMainContent)
```js
UI._patchQruCard(postoId)   // chips, badge, borda do card de posto
UI._patchFotos(postoId)     // só a seção de fotos
UI._patchOpCard(opId)       // métricas do header da operação
UI._patchListaOps()         // só a lista (preserva foco do input de busca)
```
Esses quatro são **carga estrutural, não duplicação**. Sem eles a UI pisca, os cards colapsam no meio da edição e o campo de busca perde o foco. Um refactor apressado que os remova é regressão séria.

### Update otimista
Todo write importante segue: `_suppressRender = true` → update local em `S.*` → `_patchXxx()` cirúrgico. É por isso que a interface responde instantaneamente.

### Supervisores fixos (imutáveis)
`CFG.SUPERVISORES_FIXOS` — Marcos Danilo e Francisco Helder, presentes em toda escala.

### Display vs banco
Banco em MAIÚSCULO (compatibilidade com relatórios AMC). Display via `titleCase()`, que preserva numerais romanos (`Pedro II`, `Av. XV de Novembro`).

---

## 7. Estrutura de dados

```json
// Recurso
{ "nome":"...", "cargo":"ORIENTADOR", "status":"disponivel|escalado|indisponivel|ausente",
  "motivoIndisponivel":"ferias|falta|licenca|outro_turno|outro",
  "turno_padrao":"manha|tarde|noite", "contato":"...",
  "bairro":"ALDEOTA", "transporte":"veiculo_proprio|transporte_publico" }

// Operação
{ "escalaId":"...", "turno":"manha|tarde|noite|extraordinario",
  "bairro":"...", "tipoMissao":"...", "horario":"06:00",
  "status":"ativa|planejada", "origemOpId":"...",
  "recorrencia":"unica|diaria|semanal|anual",
  "diasSemana":[0-6], "dataInicio":"YYYY-MM-DD", "dataFim":"YYYY-MM-DD|null" }

// Posto
{ "escalaId":"...", "operacaoId":"...", "numero":1, "local":"AV X × AV Y",
  "bairro":"...", "tipoAcao":"CONTROLE", "obs":"...",
  "orientadores": { "{rId}": { "nome","cargo","ts","faltou":false } },
  "fotoReferencia":"base64", "fotosRegistro":{ "{key}":{"data","timestamp"} } }
```

**Cargos:** `SUPERVISOR · AUXILIAR · MOTOCICLISTA · MONITOR · ORIENTADOR` (abrev. SUP/AUX/MOT/MON/ORI)

---

## 8. Sistema de turnos

```js
manha:          05:30–11:30
tarde:          10:30–16:30
noite:          15:30–21:30
extraordinario: (sem horário fixo)
```
As sobreposições são **intencionais** — é a janela de rendição, onde os turnos se cruzam para a passagem.

### Cores de turno (identidade visual)
```js
manha: '#2dd4bf'  // turquesa — céu antes do amanhecer; 150° do laranja
tarde: '#f97316'  // laranja-coral — sol pleno
noite: '#8b7cf6'  // violeta — anoitecer, vigília
```
Cada pessoa carrega a cor do seu `turno_padrao` no avatar, como identidade estável. Vermelho tem precedência quando `faltou` — falta é informação mais urgente que turno.

**Por que turquesa e não dourado:** dourado ficava a 18° do laranja da tarde, indistinguível em avatares pequenos. Turquesa dá 150° de separação. Rosa foi descartado (30° do vermelho de "faltou", geraria confusão) e verde-limão também (luminância alta demais, geraria glare).

---

## 9. Subsistema de recorrência

Operação tem **recorrência** (frequência) + **vigência** (de quando até quando). A regra gera as instâncias; o supervisor cadastra uma vez.

| Caso real | recorrencia | diasSemana | dataFim |
|-----------|-------------|------------|---------|
| Obra temporária | diaria | — | 2026-07-22 |
| Ciclofaixa de Lazer | semanal | [0] domingo | null |
| Feira livre | semanal | [6] sábado | null |
| Réveillon | anual | — | null |
| Posto fixo permanente | diaria | — | null |

`dataFim: null` = **sem prazo**. Rótulos: "Diária · até 22/07", "Domingos · sem prazo", "Anual · 31/12".

**`operacaoAconteceEm(op, data)`** decide se a operação acontece numa data. Testada e correta para os quatro tipos.

**Navegador de data** (‹ Hoje ›) no topo do centro permite ver dias futuros com as recorrências projetadas.

**Status:** Fases 1 (campos) e 2 (projeção) prontas. **Fase 3 pendente:** exceções ("este domingo não tem") e editar-esta-instância vs editar-todas — a parte complexa, padrão Google Calendar.

---

## 10. Planejamento unificado

**Não existe "Modo Planejar" separado.** Cada operação tem `··· → Planejar p/ outro turno`, que abre modal com:
- Turno de destino
- O que copiar: postos ☑ · orientadores ☐ · observações/fotos ☑

Os defaults contam a história: estrutura física se repete, pessoas mudam. Cria a operação no turno destino com `status: 'planejada'` e `origemOpId` para rastreabilidade.

**Estados visuais:** ATIVA (cheia) · PLANEJADA (fantasma, tracejada, sem dot) · RENDIÇÃO (borda accent, aparece nos dois turnos).

---

## 11. Busca

Procura em cinco dimensões: **bairro, tipo, nome da operação, endereço do posto e nome de pessoa**.

**Com busca ativa, atravessa todos os turnos** — encontrar alguém não deve exigir saber em que turno ela está (mesmo princípio do Modo Campo). Sem busca, respeita a aba selecionada.

**Painel "Pessoas encontradas"** mostra onde cada uma está: turno, operação, posto, endereço, e se faltou. Quem não está escalado mostra o status (disponível/férias/licença). Botão "Ir →" navega até lá.

**Crítico:** `filtrarOps` chama `_patchListaOps()`, nunca `renderMainContent()` — senão o input de busca é destruído e perde o foco a cada 150ms. O `renderMainContent` tem rede de segurança que restaura foco e cursor caso um listener do Firebase force re-render durante a digitação.

---

## 12. Design system

- **Fontes:** Inter (UI) + JetBrains Mono (dados)
- **Escala tipográfica:** piso 10px, 4 níveis (10 / 11-12 / 13-14 / 15+)
- **Contraste:** `--text-tertiary` (~7:1) para texto funcional; `--text-muted` só decorativo
- **Colunas:** sidebar 320px · centro 1fr · direita 320px

### Gramática de cores (não violar)
| Cor | Significa | Nunca usar para |
|-----|-----------|-----------------|
| `--accent` azul | interativo, foco, seleção | status |
| `--success` verde | presença confirmada, conclusão | ação clicável |
| `--warning` âmbar | atenção, cobertura parcial | erro |
| `--danger` vermelho | falta, ausência, erro | ênfase decorativa |

### Conforto visual (aplicado em 22/07)
Bordas saturadas longas causam halo em olhos com astigmatismo — azul é o pior caso (aberração cromática). Por isso:
- Card expandido usa **elevação de fundo + barra lateral única**, não borda de perímetro em azul
- Barras semânticas dos postos dessaturadas para ~50-55% de opacidade
- Avatares com `saturate(0.88)`
- Hierarquia por elevação, não por linha — padrão Linear/Vercel/GitHub dark

---

## 13. Padrões de UI (obrigatórios)

1. **Nunca `confirm()` nativo** — confirmações inline ou overlay
2. **Nunca popovers flutuantes** — expansão accordion inline (staff no painel direito, chips nos QRUs)
3. **Escape global centralizado** — um único `document.keydown` fecha a camada mais próxima, na ordem: settings → menus → accordion → chip → overlays → confirms
4. **Undo de 5s em vez de confirmar antes** — deletar operação/posto faz soft delete, mostra "Desfazer", e só commita no Firebase depois. Padrão Gmail
5. **Save indicator global** no header — verde (salvo) / âmbar pulsante (salvando) / vermelho (erro ou offline)
6. **Erros traduzidos** — `erroHumano()` converte `PERMISSION_DENIED` em linguagem operacional
7. **Fotos:** paste global (Ctrl+V em qualquer lugar com posto aberto), drag&drop, e clique. Referência vazia recebe primeiro; se ocupada, vai para registro
8. **Textareas com auto-grow** via delegation global

---

## 14. Desempenho — medido em 22/07

### Carga do shell
```
Firebase SDK   267 KB (72% do total)
Fontes          45 KB
Código próprio  58 KB
────────────────────
TOTAL          370 KB gzip
```
| Rede | Shell |
|------|-------|
| Wi-Fi | ~0,7s |
| 4G bom | ~1,3s |
| 4G médio | ~2,5s |
| 3G | ~6,5s |

### 🔴 PROBLEMA CRÍTICO — fotos base64 no nó dos postos

`_listenPostos` usa `.on('value')` sobre `/efetivo/postos`. O RTDB envia **o nó inteiro a cada mudança**, incluindo todas as fotos base64.

```
Foto comprimida (900px q72) → ~110 KB → base64 ~146 KB
100 postos, 60% com foto    → ~8,6 MB por evento de sync
```

| Cenário | 4G médio | 3G |
|---------|----------|-----|
| Turno leve (sem fotos) | 2,6s | 6,7s |
| Fim de semana (60% com foto) | **20,2s** | **53,7s** |

E o custo **se repete a cada sincronização** — alguém marca uma falta e todos re-baixam tudo.

O `fotosCache` no listener é cosmético: evita reatribuir na memória, mas o download já aconteceu.

**Correção:** mover fotos para `/efetivo/postos_fotos/{postoId}` com carga sob demanda ao expandir detalhes. O nó dos postos cai para ~50 KB e o tempo em 4G médio vai de 20,2s para ~2,6s. Alternativa: Firebase Storage, que é o lugar correto para binários.

### Outros achados (não urgentes)
- **Busca O(n²):** `opCasaComBusca` varre `S.postos` para cada operação — ~7.500 iterações por tecla no cenário de fim de semana. Índice pré-computado resolveria
- **innerHTML completo:** ~3.600 nós reconstruídos por `renderMainContent`, chamado de 13 pontos. Parcialmente mitigado pelos `_patchXxx`
- **`renderRightPanel`** (175 linhas) reconstrói as 80 linhas de efetivo a cada mudança de status
- **`initCampoUI`** cria `setInterval` sem guard — acumula se chamado duas vezes
- **Firebase compat** (267 KB) poderia virar modular v9 (~100 KB), mas é refactor de risco médio para ganho modesto

### Saudável
Listeners balanceados (7 on / 7 off), sem vazamento. `addEventListener` globais no document. Filtros por `escalaId` com `.indexOn` corretos.

---

## 15. Dívida técnica conhecida

Código está ~20-25% acima do ótimo (um sênior faria em ~2.800-3.000 linhas de JS). A causa é iteração — o layout foi reescrito três vezes e cada reescrita deixou sedimento.

**Repetição estrutural que vai gerar bug de divergência:**
1. **Chips renderizados em dois lugares** (`_qruCardHTML` e `_patchQruCard`) — **já causou bug real** (a falta não aparecia sem refresh). Extrair `_chipHTML()` compartilhado é a prioridade
2. **Três modais quase idênticos** (nova-op, planejar, editar-pessoa) — um `_modal({titulo, corpo, acoes})` economizaria ~80 linhas
3. **26 campos de formulário** com estrutura repetida — um `_campo()` cortaria ~100 linhas
4. **CSS com ~15% de resíduo** de três iterações de layout

**Métodos grandes demais (não geram bug, dificultam leitura):**
- `_listenConexao()` — 201 linhas, nome não descreve o que faz
- `renderRightPanel()` — 175 linhas, quatro responsabilidades

**Ordem sugerida quando for refatorar:** `_chipHTML` (previne bug) → `_modal` → quebrar os métodos gigantes → limpeza de CSS.

---

## 16. Backlog

### Urgente
- [ ] **Fotos fora do nó dos postos** — único item que inviabiliza uso real

### Alta
- [ ] Fase 3 da recorrência: exceções e editar-esta vs editar-todas
- [ ] Rendição agendada funcional (operação aparecendo em dois turnos)
- [ ] Modal de abertura de turno (hoje abre silenciosamente com auto-detect)
- [ ] Passagem de bastão — UI (estrutura Firebase `/bastao` já existe)

### Média
- [ ] Relatório mensal (17 abas + TOTAL + BAIRROS)
- [ ] Histórico de designações `/efetivo/historico/{ano}/{mes}/{diaKey}/`
- [ ] Rodízio inteligente por score (quem trabalhou menos em cada tipoMissao)
- [ ] **Virtualização da lista** — numa escala de fim de semana passa de 25 operações facilmente. Confirmado pelo desenvolvedor como cenário real, não hipotético

### Integração com Semáforo
- [ ] Semáforo lê `/efetivo/recursos` via `.once()` para sugerir agentes no despacho
- [ ] Nunca listener permanente cruzado entre módulos

---

## 17. Prompt para a próxima sessão

```
Você é fullstack sênior em Vanilla JS, HTML, CSS e Firebase RTDB.
Leia CONTEXT_PLANOP.md completamente antes de qualquer mudança.

Arquivos: planop.js (~3770L) + planop.css (~2300L) + index.html (~310L)
URL: crisstiano07.github.io/NIT_Planop-/

Regras obrigatórias:
1. Nunca confirm() nativo — inline ou overlay
2. Nunca popovers flutuantes — accordion inline
3. Sempre _suppressRender + _patchXxx() em vez de renderMainContent durante edições
4. Nunca tocar /kanban/* ou /recursos/* (são do Semáforo)
5. Display em titleCase, banco em MAIÚSCULO
6. Supervisores fixos Marcos Danilo e Francisco Helder são imutáveis
7. Fotos: comprimir + _patchFotos() após gravar
8. signInWithRedirect normal, signInWithPopup em incógnito
9. _patchQruCard e _qruCardHTML DEVEM renderizar chips idênticos
10. Busca chama _patchListaOps(), nunca renderMainContent()
```

---

*CENTRAL OPS v1.2 · AMC Fortaleza · NIT · 22/07/2026*
