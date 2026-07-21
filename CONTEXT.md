# CENTRAL OPS · Plano Operacional — CONTEXT.md
> Para o próximo Claude: leia tudo antes de tocar em qualquer arquivo.
> Atualizado: 20/07/2026

---

## 1. Identidade do Sistema

**Nome:** CENTRAL OPS / Plano Operacional  
**Órgão:** AMC Fortaleza — NIT (Núcleo de Inteligência de Tráfego)  
**Desenvolvedor:** Cristiano Miranda (CrissTiano07) — solo  
**URL:** crisstiano07.github.io/NIT_Planop-/  
**Repositório:** github.com/CrissTiano07/NIT_Planop-

---

## 2. Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vanilla JS + HTML + CSS (sem frameworks) |
| Banco | Firebase RTDB (nit-operacional-default-rtdb.firebaseio.com) |
| Deploy | GitHub Pages via GitHub Actions (static.yml) |
| Backend | **Nenhum** — 100% client-side |

**Arquivos:**
- `planop.js` ~3080L — toda lógica (IIFE único)
- `planop.css` ~1780L — todo CSS
- `index.html` ~274L — HTML + Firebase config

**Estrutura interna do JS (ordem obrigatória):**
`S (estado) → CFG (constantes) → helpers → Auth → DB → UI → Campo → Actions → listeners globais → return { Auth, UI, Campo, Actions, DB }`

---

## 3. Firebase

**Projeto:** `nit-operacional-default-rtdb.firebaseio.com`  
**apiKey:** `AIzaSyCWAGfmCr-pHr0asIk_Sfz1WbajIEhiZn0`

### Paths do Planop (ESCREVE):
```
/efetivo/escalas/{id}/          status, data, turno, horários, supervisao{}
/efetivo/operacoes/{id}/        escalaId, nome, bairro, tipoMissao, horario
/efetivo/postos/{id}/           escalaId, operacaoId, local, orientadores{}, faltou
/efetivo/recursos/{id}/status   disponivel|escalado|indisponivel|ausente
/efetivo/recursos/{id}/         (cadastro completo ao criar pessoa)
/efetivo/supervisao_config/     padrao por turno
/efetivo/config/                (legado — ainda usado)
```

### Paths que NUNCA deve tocar:
```
/kanban/*          Semáforo — exclusivo
/recursos/*        Semáforo (diferente de /efetivo/recursos/)
/usuarios_autorizados/*
```

### emailKey format: `.` → `_` e `@` → `_at_`
Exemplo: `cristiano@gmail.com` → `cristiano_at_gmail_com`  
(Semáforo usa `|` — diferente. Nunca misturar.)

---

## 4. Auth

- Login: `signInWithRedirect` (Google) — **não popup** (COOP error)
- Modo Campo: auth anônima via `?modo=campo`
- Roles em `/efetivo_roles/{emailKey}/role` → `monitor|supervisor|admin`
- `_resolveRole` tenta `/role` depois raiz — suporta ambas as estruturas

---

## 5. Decisões Arquiteturais Críticas

### Listeners
```js
S._unsubs       // globais — limpos no logout
S._escalaUnsubs // ops/postos — limpos a cada troca de turno
S._suppressRender // flag 600-800ms — bloqueia renderMainContent durante writes
```

`_listenOperacoes` e `_listenPostos` **sempre filtram por `escalaId`**  
Os listeners **reconstroem** `S.operacoes` e `S.postos` do snap (não fazem merge aditivo) para que deleções reflitam na UI.

### Update otimista
Todo write importante tem 3 etapas:
1. `S._suppressRender = true` por 600-800ms
2. Update local em `S.postos`/`S.operacoes`/`S.recursos`
3. `UI._patchXxx()` cirúrgico (não `renderMainContent`)

### Funções cirúrgicas (NÃO substituir por renderMainContent):
```js
UI._patchQruCard(postoId)  // atualiza chips, badge, borda do card
UI._patchFotos(postoId)    // atualiza só a seção de fotos
```

### Supervisores fixos (NUNCA remover):
```js
CFG.SUPERVISORES_FIXOS = [
  { id:'fixo_marcos_danilo', nome:'Marcos Danilo', cargo:'SUPERVISOR', fixo:true },
  { id:'fixo_francisco_helder', nome:'Francisco Helder', cargo:'SUPERVISOR', fixo:true }
]
```

### Display vs Storage
- Banco: MAIÚSCULO (compatibilidade relatório AMC)
- Display: `titleCase()` em todos os pontos de renderização
- A função `titleCase` está no escopo da IIFE com lista de preposições minúsculas

### Cargos
`SUPERVISOR/AUX/MOT/MON/ORI` — sem OPERADOR. Mapa explícito em `CFG.CARGO_ABBR`.

---

## 6. Padrões de UI Implementados

### Combo com teclado (padrão universal)
`UI._combo(inputId, listId, items, onSelect)` — ↑↓ Enter Esc. Clona o input antes de re-init para evitar listeners duplicados.

### Expansão inline (accordion) — padrão atual
**NÃO usar popovers flutuantes.** Dois lugares implementados:

1. **Staff (painel direito):** clicar na linha expande `#exp-{rId}` com dados + ações
2. **Chips de orientador (QRU card):** clicar no chip expande `#chip-exp-{postoId}` abaixo do grupo

### Confirmações inline (NÃO usar confirm() nativo)
- Encerrar turno: overlay modal `#encerrar-confirm-overlay`
- Deletar op/posto: `.inline-confirm` inserido no DOM local

### Fotos
- **Paste global:** `document.addEventListener('paste',...)` captura prints colados em qualquer lugar da página quando detalhes de um posto estão abertos (`[id^="det-"].open`)
- Drag & drop: `soltarFoto(event, postoId, tipo)`
- Sempre: `S._suppressRender = true` + `UI._patchFotos(postoId)`
- Sempre: comprimir antes de gravar — `UI._compressImage(src, 900, 0.72)`

### Registrar falta no posto
`Actions.toggleFalta(postoId, rId)` — grava `faltou: true/false` em `/efetivo/postos/{id}/orientadores/{rId}/faltou`  
Chip com faltou: avatar vermelho, nome riscado, badge "FALTOU", background danger-dim

---

## 7. Estrutura de Dados

```json
// Recurso
{
  "nome": "DOUGLAS MAIA DA SILVA",
  "cargo": "ORIENTADOR",
  "status": "disponivel|escalado|indisponivel|ausente",
  "motivoIndisponivel": "ferias|falta|licenca|outro_turno|outro",
  "turno_padrao": "manha|tarde|noite",
  "contato": "85999990000",
  "bairro": "ALDEOTA",
  "transporte": "veiculo_proprio|transporte_publico"
}

// Posto
{
  "escalaId": "...", "operacaoId": "...",
  "numero": 1, "local": "AV X × AV Y",
  "bairro": "ALDEOTA", "tipoAcao": "CONTROLE",
  "orientadores": {
    "{rId}": { "nome", "cargo", "ts", "faltou": false }
  },
  "fotoReferencia": "base64jpeg ~120KB",
  "fotosRegistro": { "{key}": { "data", "timestamp" } }
}
```

---

## 8. Design System

- **Fontes:** Inter (UI) + JetBrains Mono (dados) via Google Fonts
- **font-feature-settings:** `"cv11", "ss01"` no body; `"tnum"` em elementos mono
- **Cores:** tokens CSS em `:root` — `--bg`, `--accent` (#58a6ff), `--success`, `--warning`, `--danger`
- **Lifecycle (preparado, ainda não ativo):** `--lifecycle-pending` (cinza), `--lifecycle-active` (laranja), `--lifecycle-done` (verde)
- **Sidebar/Right panel:** 320px cada
- **Escala tipográfica:** piso 10px, 4 níveis (10/11-12/13-14/15+)
- **Contraste mínimo:** `--text-tertiary` para texto funcional (~7:1)

---

## 9. O Que Está Pendente (Backlog)

### Alta prioridade
- [ ] **Modo Planejar** — o problema original que motivou o sistema. O supervisor de sexta planeja os 6 turnos do fim de semana. Fluxo: começa pelos postos. Mesmo paradigma do Modo Executar mas com `status:'planejada'` e navegação entre datas. Usar Modo Executar como base.
- [ ] **Passagem de bastão** — UI do form (estrutura Firebase `/bastao` já existe em `encerrarEscala`)
- [ ] **Modal de abertura de turno** — hoje abre silenciosamente com auto-detect

### Média prioridade
- [ ] Relatório mensal (17 abas + TOTAL + BAIRROS)
- [ ] Histórico de designações `/efetivo/historico/{ano}/{mes}/{diaKey}/`
- [ ] Rodízio inteligente por score (quem trabalhou menos naquele tipoMissao aparece primeiro)

### Integração com Semáforo
- Semáforo pode ler `.once()` em `/efetivo/recursos` para saber disponíveis
- Nunca listener permanente cruzado entre módulos

---

## 10. Prompt Universal para Próxima Sessão

```
Você é fullstack sênior em Vanilla JS, HTML, CSS e Firebase RTDB.
Leia CONTEXT_PLANOP.md completamente antes de qualquer mudança.

Arquivos: planop.js (~3080L) + planop.css (~1780L) + index.html (~274L)
URL: crisstiano07.github.io/NIT_Planop-/
Firebase: nit-operacional-default-rtdb.firebaseio.com

Regras obrigatórias:
1. Nunca usar confirm() nativo — confirmações inline
2. Nunca usar popovers flutuantes — expansão accordion inline
3. Sempre S._suppressRender + _patchXxx() em vez de renderMainContent durante edições
4. Nunca tocar /kanban/* ou /recursos/* (são do Semáforo)
5. Display em titleCase, banco em MAIÚSCULO
6. Supervisores fixos Marcos Danilo e Francisco Helder são imutáveis
7. Fotos: sempre comprimir + _patchFotos() após gravar
8. signInWithRedirect (não popup — COOP error)
```

---

## 11. Bugs Conhecidos / Comportamentos a Monitorar

- `S._suppressRender` de 600ms pode ser insuficiente em conexões lentas — monitorar
- Múltiplos postos com detalhes abertos ao mesmo tempo + paste de foto: vai para o sem foto, avisa se ambíguo
- O accordeão dos chips (`chip-exp-{postoId}`) é limpo quando `_patchQruCard` recria o card — estado de expansão se perde; aceitável pois ações são rápidas

---

*CENTRAL OPS v1.1 · AMC Fortaleza · NIT · 20/07/2026*

---

## 12. Bugs Resolvidos Pós-Geração do Context

### Auth: Login em aba anônima / incógnito
**Causa:** Chrome 120+ bloqueia cookies de terceiros em incógnito. `signInWithRedirect` armazena estado que não sobrevive ao redirect sem esses cookies.  
**Fix:** `Auth.login()` detecta incógnito via `localStorage` (lança exceção se bloqueado) e usa `signInWithPopup` como fallback. Em sessão normal, mantém `signInWithRedirect`.

### UI: Ação de status parecia não funcionar (exigia refresh)
**Causa:** `setStatusPessoa` chamava `renderRightPanel()` que reconstruía toda a lista, fazendo a linha expandida desaparecer. O usuário via o painel fechar abruptamente e achava que a ação não completou.  
**Fix:** `setStatusPessoa` agora fecha explicitamente a linha expandida (`#exp-{rId}`) antes de chamar `renderRightPanel()`. Transição visual limpa, ação claramente concluída.

### UI: Chips do QRU — bugs do accordion
- `toggleChipExpand` usava `event.stopPropagation()` sem guard — quebrava quando chamado com string `'{skip}'`. Fix: `if (event?.stopPropagation) event.stopPropagation()`
- `_patchQruCard` reconstruía chips sem fechar o painel de expansão. Fix: fecha e limpa o painel antes de reconstruir.

---

## 13. ARQUITETURA DEFINIDA: Navegação por Turno + Planejamento Unificado

> Decisão de produto tomada em 21/07/2026. Esta é a próxima grande feature.
> Substitui o conceito de "Modo Planejar separado" por planejamento contextual.

### Conceito central
A sidebar deixa de listar "OPERAÇÕES" soltas e passa a agrupar operações **por turno**, com o turno como rótulo à esquerda de cada grupo. Vê-se o dia inteiro (manhã/tarde/noite/extraordinário) numa lista contínua.

### Layout da sidebar (novo)
```
MANHÃ · 05:30–11:30    │  Aldeota · Controle de Tráfego · 06:00h (ATIVA)
                       │
TARDE · 10:30–16:30    │  Parangaba · Apoio a Outros Órgãos (ATIVA)
                       │
NOITE · 15:30–21:30    │  Centro (PLANEJADA)
                       │  Montese (RENDIÇÃO — vem da tarde)
                       │
EXTRAORDINÁRIO         │  (nenhuma operação)
```

### Nomenclatura de turnos (validada com CLT)
`MANHÃ · TARDE · NOITE · EXTRAORDINÁRIO`
- Manhã/Tarde/Noite = vocabulário real do operador, reconhecido pela CLT
- "Extraordinário" para horários fora do padrão (termo trabalhista correto para hora fora da jornada)
- Descartado A/B/C/D (abstrato demais para agentes municipais)

### Três estados de operação (semiótica)
| Estado | Significado | Visual |
|--------|-------------|--------|
| ATIVA | Acontece neste turno, começa e termina nele | Cor cheia, dot de cobertura real |
| PLANEJADA | Projetada para turno futuro, não começou | Fantasma/tracejada, badge PLANEJADA, sem dot de cobertura |
| RENDIÇÃO | Contínua, atravessa turnos, troca de equipe no mesmo posto | Aparece nos DOIS turnos, marca de continuidade |

### Decisões de comportamento (confirmadas com o usuário)
1. **Rendição agendada**: a MESMA operação aparece nos dois turnos (o da origem e o de destino). Não é cópia — é a mesma operação visível em ambos, com marca de continuidade. Posto crítico que não pode ficar descoberto (ex: cruzamento). Turno seguinte RENDE a equipe.
2. **Horário fora do padrão**: destacar quando o horário da operação difere do horário do turno. Ex: turno Manhã é 05:30, mas operação começa 06:00 → destacar 06:00 como alerta. Propósito: evitar que o operador assuma que tudo começa no horário do turno.
3. **Turnos vazios aparecem**: todos os 4 turnos sempre visíveis na lista, mesmo sem operação ("nenhuma operação"). Dá visão completa do dia e convida a planejar.

### Planejamento unificado (a inovação)
NÃO existe "Modo Planejar" separado. Cada operação tem uma ação contextual "Planejar para [próximo turno]" que:
- Cria cópia da operação no turno de destino com `status: 'planejada'`
- Herda postos, endereços, tipo de ação
- Zera as pessoas (elas mudam entre turnos)
- Quando o turno de destino é ativado, a operação planejada já está lá esperando designação

Isso resolve a DOR ORIGINAL (escala de fim de semana feita na sexta) pelo gesto natural: "esta operação se repete no próximo turno" = um clique, sem copiar-colar manual do Excel.

### Impacto no modelo de dados
- Operações ganham vínculo a `turno` (manha/tarde/noite/extraordinario) além de escalaId
- Novo status: 'planejada' (além de 'ativa'/'concluida')
- Rendição: campo que marca operação como contínua + turnos onde aparece
- `_listenOperacoes` precisa carregar operações de múltiplos turnos, não só o ativo

### Etapas de implementação (ordem)
1. Seletor/agrupamento por turno na sidebar (turno como rótulo à esquerda)
2. Estado visual "planejada" (ativar lifecycle pending do CSS)
3. Horário fora do padrão destacado
4. Ação "Planejar para [turno]" com herança de estrutura
5. Rendição agendada (operação em dois turnos)

---

## 14. SUBSISTEMA DE RECORRÊNCIA (evolução do Modo Planejar)

> Decisão 21/07/2026. Substitui "operação continuada" por sistema completo de
> recorrência + vigência. Resolve a dor original (escala de fim de semana) de vez.

### Conceito
Operação deixa de ser evento de um dia. Ganha RECORRÊNCIA (com que frequência
acontece) + VIGÊNCIA (de quando até quando). A regra gera instâncias diárias
automaticamente — o supervisor cadastra uma vez, o sistema projeta.

### Modelo de dados (adicionar à operação)
```
operacao {
  recorrencia: 'unica' | 'diaria' | 'semanal' | 'anual'
  diasSemana: [0-6]           // se semanal: 0=domingo ... 6=sábado
  dataInicio: 'YYYY-MM-DD'
  dataFim: 'YYYY-MM-DD' | null // null = sem prazo (indefinido)
  // resto igual
}
```

### Casos reais cobertos (todos com um só modelo)
| Caso | recorrencia | diasSemana | dataFim |
|------|-------------|-----------|---------|
| Obra temporária | diaria | — | 2026-07-22 |
| Ciclofaixa de Lazer | semanal | [0] domingo | null |
| Feira livre | semanal | [6] sábado | null |
| Réveillon | anual | — | null |
| Posto fixo permanente | diaria | — | null |
| Evento único | unica | — | (data única) |

### Rótulos de vigência (validado com usuário)
```
Única:            (sem rótulo)
Diária com fim:   "Diária · até 22/07"
Diária sem fim:   "Diária · sem prazo"
Semanal:          "Domingos · sem prazo"
Anual:            "Anual · 31/12"
```
"sem prazo" é mais operacional que "indefinido".

### Faseamento
- **FASE 1 (em construção):** campos recorrencia/dataInicio/dataFim no cadastro.
  Todos os 4 tipos gravam. Rótulo de vigência aparece. Projeção automática ainda não.
  'sem prazo' (dataFim null) essencial desde já.
- **FASE 2:** projeção — operação aparece nos dias corretos conforme recorrência.
- **FASE 3:** exceções ("este domingo não") + editar-esta vs editar-todas.
  A parte complexa (padrão Google Calendar recurring events).

### Vocabulário de estados de operação (completo e final)
| Estado | Escopo temporal |
|--------|-----------------|
| ATIVA | acontece agora, começa/termina no turno |
| PLANEJADA | projetada p/ turno futuro do mesmo dia |
| RENDIÇÃO | contínua entre turnos, mesmo posto (não pode ficar vazio) |
| RECORRENTE | tem regra de repetição (diaria/semanal/anual) + vigência |

### Impacto arquitetural
Este é o Modo Planejar de verdade. Com recorrência, "Ciclofaixa domingos sem prazo"
é cadastrada UMA vez e aparece todo domingo automaticamente. A escala de fim de
semana deixa de ser trabalho semanal — vira configuração única. Transcende o Excel.
