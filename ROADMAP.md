# CENTRAL OPS · Plano Operacional
## Roadmap de Desenvolvimento
**AMC Fortaleza — NIT (Núcleo de Inovação Tecnológica)**
Stack: Vanilla JS · Firebase RTDB · GitHub Pages
URL: `crisstiano07.github.io/NIT_Planop/`

---

## ✅ Implementado

### Infraestrutura
- [x] Firebase Auth — login Google + auth anônima (Modo Campo)
- [x] Detecção de role (`efetivo_roles/`) — monitor / supervisor / admin
- [x] Listeners em tempo real com filtro por `escalaId` (sem carregar histórico)
- [x] Update otimista após writes — UI não espera o listener
- [x] Indicador de conexão Firebase (online / offline)
- [x] Deploy via GitHub Actions (`static.yml`)
- [x] Permissões por hierarquia — `canWrite` / `canManage` / `canAdmin`

### Layout
- [x] Shell de 3 colunas (sidebar 264px · painel principal · painel direito 200px)
- [x] Responsivo — mobile colapsa colunas laterais
- [x] Brand pulse animado
- [x] Relógio ao vivo no shift bar

### Sidebar
- [x] Status do turno com detecção automática de MANHÃ / TARDE / NOITE
- [x] Supervisores fixos (Marcos Danilo e Francisco Helder) com 📌 — imutáveis
- [x] Seção de supervisão do turno colapsível
- [x] Auto-aplicação de supervisão padrão ao abrir turno
- [x] Salvar supervisão como padrão por tipo de turno
- [x] Nova Operação — form inline com bairro (106 bairros) + tipo de missão
- [x] Lista de operações com dots de status (verde / âmbar / vermelho)
- [x] Busca de operações em tempo real

### Painel principal — Modo Executar
- [x] Top bar da operação com toggle Executar / Planejar
- [x] 4 métricas derivadas do estado real (QRUs, sem ninguém, orientadores, cobertura)
- [x] Cards de QRU com borda colorida por cobertura (vazio / parcial / completo)
- [x] Múltiplos orientadores por posto — modelo correto
- [x] Dropdown inline de designação com busca e navegação por teclado (↑↓ Enter Esc)
- [x] Remoção de orientador com um clique
- [x] Seção "Detalhes do posto" colapsível (horário, tipo de ação, observação)
- [x] Upload de foto de referência por posto (base64 → Firebase)
- [x] Upload de fotos de registro com timestamp
- [x] Filtro de QRUs por endereço em tempo real
- [x] "+ Posto" inline — form no próprio card sem modal

### Painel direito
- [x] Lista de disponíveis / em posto / ausentes agrupados
- [x] Avatares coloridos por nome (determinístico)
- [x] Filtro de staff em tempo real
- [x] Indicação de qual posto cada pessoa está

### Modo Campo (agente de rua)
- [x] Acesso via `?modo=campo` com auth anônima
- [x] Busca por nome com debounce
- [x] QTH (ONDE) e QRU (O QUÊ) em zonas visuais separadas
- [x] Link direto para Google Maps
- [x] Supervisor com telefone clicável (tel:)
- [x] Persistência da última busca via localStorage
- [x] Busca via viatura/equipe (agente membro de equipe vê o posto da equipe)
- [x] Filtro por escala ativa — sem mostrar histórico de turnos anteriores

### UX / Sistema de combos
- [x] Combo unificado com teclado em todos os dropdowns do sistema
- [x] Enter com resultado único seleciona automaticamente
- [x] Escape fecha sem selecionar
- [x] Auto-geração de nome de operação (Tipo — Bairro)

---

## 🔄 Parcialmente implementado

- [ ] **Abrir turno** — hoje abre silenciosamente com auto-detect de horário
  - Falta: mini-form para escolher turno / horário / data manualmente
- [ ] **Encerrar turno** — funciona, mas sem formulário de passagem de bastão
  - Falta: campo de nota + banner no próximo turno
- [ ] **Adicionar membro à supervisão** — mostra toast "em breve"
  - Falta: dropdown de busca inline (mesmo padrão dos orientadores)
- [ ] **Modo Planejar** — toggle existe, mostra toast "em breve"
  - Falta: 3 colunas de turno, blocos arrastáveis, "continua no próximo turno"

---

## 📋 Backlog

### Prioridade alta — operacional imediato
- [ ] Modal de abertura de turno (turno + data + horário personalizável)
- [ ] Passagem de bastão ao encerrar (nota livre + banner no turno seguinte)
- [ ] Adicionar membro à supervisão (inline, sem modal)
- [ ] Editar / remover posto existente
- [ ] Editar / remover operação existente
- [ ] Drag & drop do painel direito para o QRU card (designação por arraste)

### Prioridade média — planejamento
- [ ] Modo Planejar completo
  - 3 colunas: MANHÃ · TARDE · NOITE do dia selecionado
  - Navegação entre dias (Ontem · Hoje · Amanhã)
  - "Continua no próximo turno →" com herança visual
  - Templates salvos com botão "Aplicar"
- [ ] Templates de operação (criar / editar / aplicar com 1 clique)
- [ ] Supervisão padrão separada por turno (manhã / tarde / noite) com fallback inteligente

### Prioridade média — qualidade
- [ ] CRUD completo de recursos (editar cadastro, status administrativo)
- [ ] Histórico de turno (o que foi executado, quem esteve onde)
- [ ] Relatório mensal (17 abas + TOTAL + BAIRROS — portar do Efetivo)
- [ ] Modo Campo: confirmação de chegada ao posto (ação de escrita pelo agente)

### Prioridade baixa — crescimento
- [ ] Módulo de Monitoramento Geral
  - Saúde do Firebase (conexões, latência)
  - Atividade por turno em tempo real
  - Log de ações (quem fez o quê, quando)
- [ ] Módulo Reboques
- [ ] Parser de texto (colar escala do WhatsApp → preenche postos automaticamente)
- [ ] Modo Campo aprimorado com foto de registro pelo agente

---

## 🏗️ Decisões arquiteturais registradas

| Decisão | Escolha | Motivo |
|---|---|---|
| Stack | Vanilla JS + Firebase + GitHub Pages | Sem build step, sem servidor, zero custo |
| Autenticação campo | Auth anônima | Agentes não têm conta Google |
| Múltiplos orientadores | `orientadores: {}` objeto | Norma, não exceção |
| Supervisores fixos | Constante no CFG, auto-injetada | Sempre presentes, nunca removíveis |
| Update de UI | Otimista (local antes do listener) | Percepção de velocidade, sem esperar Firebase |
| Listeners Firebase | Filtrados por `escalaId` | Evita carregar histórico inteiro |
| Combos | Unificado com teclado em todo o sistema | Consistência + acessibilidade |
| Deploy | GitHub Actions `static.yml` | Contorno do bug pós-rename do repositório |

---

## 📁 Estrutura Firebase (`/efetivo/*`) 


```
efetivo/
├── escalas/          → turnos (status, data, horário, supervisao{})
├── operacoes/        → operações por escala (nome, bairro, tipoMissao)
├── postos/           → QRUs por operação (local, orientadores{}, fotos)
├── recursos/         → cadastro de agentes (nome, cargo, status, turno_padrao)
├── viaturas/         → equipes (nome, liderId, membrosIds{}, temViatura)
├── templates/        → templates de operação reutilizáveis
├── config/           → supervisao_padrao_{turno}
└── efetivo_roles/    → permissões por email (monitor/supervisor/admin)
```

---

*Última atualização: 04/07/2026*
*Sessão de desenvolvimento ativa — atualizar após cada entrega*
