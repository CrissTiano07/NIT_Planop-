/* ═══════════════════════════════════════════════════════════
   CENTRAL OPS · PLANO OPERACIONAL · v1.0
   AMC Fortaleza — Sistema de Gestão Operacional
   Stack: Vanilla JS + Firebase RTDB + GitHub Pages
   Path Firebase: /efetivo/* (mesmo projeto do NIT Semáforos)
═══════════════════════════════════════════════════════════ */
'use strict';

const NIT_PLANOP = (() => {

  /* ── CONFIGURAÇÃO ──────────────────────────────────────── */
  const CFG = {
    firebase: {
      apiKey:            'AIzaSyCWAGfmCr-pHr0asIk_Sfz1WbajIEhiZn0',
      authDomain:        'nit-operacional.firebaseapp.com',
      databaseURL:       'https://nit-operacional-default-rtdb.firebaseio.com',
      projectId:         'nit-operacional',
      storageBucket:     'nit-operacional.appspot.com',
      messagingSenderId: '823046484118',
      appId:             '1:823046484118:web:487159cabb28ae275bd2b7'
    },
    TURNOS: {
      manha: { label:'MANHÃ',  inicio:'05:30', fim:'11:30', minI:330,  minF:690  },
      tarde: { label:'TARDE',  inicio:'11:30', fim:'17:30', minI:690,  minF:1050 },
      noite: { label:'NOITE',  inicio:'17:30', fim:'23:30', minI:1050, minF:1410 }
    },
    TIPOS_ACAO: [
      'CONTROLE','BLOQUEIO','BLOQUEIO/DESVIO','BLOQUEIO/CONTROLE',
      'CONTROLE/COIBIR DIREITA','BLOQUEIO NA LARGADA','CONTROLE NA'
    ],
    STATUS_RECURSO: ['disponivel','escalado','ausente','afastado','desligado'],
    CARGOS_SUPERVISAO: ['SUPERVISOR','AUXILIAR','MOTOCICLISTA','MONITOR'],
    TIPOS_MISSAO: [
      'CONTROLE DE TRAFEGO','OPERAÇÃO SEMAFORICA','APOIO A OBRA',
      'RESERVA DE VAGAS','OPER CICLOFAIXA DO LAZER','COLISÃO SEM VITIMA',
      'APOIO AO JOGO','APOIO A EVENTO','APOIO A OUTROS ORGÃOS',
      'FIOS CAIDOS NA VIA','POSTE CAIDO NA VIA','MANIFESTAÇÃO',
      'APOIO A PODA','INCENDIO','ARVORE CAIDA NA VIA',
      'DILIGENCIA','OLEO NA PISTA'
    ],
    BAIRROS: [
      'AEROLANDIA','AEROPORTO','ALDEOTA','ALVARO WEYNE','ANCURI','ALTO ALEGRE',
      'ANTONIO BEZERRA','AUTRAN NUNES','BARRA DO CEARÁ','BARROSO','BELA VISTA',
      'BENFICA','BOM FUTURO','BOM JARDIM','CAJAZEIRAS','CAMBEBA','CANINDEZINHO',
      'CARLITO PAMPLONA','CASTELÃO','CENTRO','CIDADE 2000','CIDADE DOS FUNCIONARIOS',
      'COCÓ','CONJUNTO CEARÁ','CONJUNTO ESPERANÇA','CONJUNTO PALMEIRAS',
      'COUTO FERNANDES','CRISTO REDENTOR','CURIÓ','DAMAS','DEMOCRITO ROCHA',
      'DIAS MACEDO','DIONISIO TORRES','DOM LUSTOSA','EDSON QUEIROZ',
      'FARIAS BRITO','FATIMA','FLORESTA','GENIBAU','GRANJA LISBOA',
      'GRANJA PORTUGAL','GUAJIRU','GUARARAPES','HENRIQUE JORGE','ITAOCA',
      'ITAPERI','JACARECANGA','JANGURUSSU','JARDIM AMERICA','JARDIM IRACEMA',
      'JOAO XXIII','JOAQUIM TAVORA','JOQUEI CLUBE','JOSÉ DE ALENCAR',
      'JOSÉ BONIFACIO','JOSE WALTER','LAGOA REDONDA','LUCIANO CAVALCANTE',
      'MARAPONGA','MEIRELES','MESSEJANA','MONDUBIM','MONTE CASTELO','MONTESE',
      'MOURA BRASIL','MUCURIPE','OTAVIO BONFIM','PADRE ANDRADE','PANAMERICANO',
      'PAPICU','PARANGABA','PARREÃO','PARQUE ARAXÁ','PARQUE MANIBURA',
      'PARQUELANDIA','PASSARÉ','PAUPINA','PEDRAS','PIRAMBU',
      'PRAIA DE IRACEMA','PRAIA DO FUTURO','PRESIDENTE KENNEDY','QUINTINO CUNHA',
      'RODOLFO TEOFILO','SALINAS','SÃO CRISTOVÃO','SÃO GERARDO',
      'SÃO JOÃO DO TAUAPE','SAPIRANGA','SERRINHA','SIQUEIRA','VARJOTA',
      'VICENTE PIZON','VILA ELLERY','VILA MANUEL SATIRO','VILA PERY',
      'VILA UNIÃO','VILA VELHA'
    ],
    // Supervisores fixos — presentes em todos os turnos, sem exceção
    SUPERVISORES_FIXOS: [
      { id:'fixo_marcos_danilo',    nome:'Marcos Danilo',    cargo:'SUPERVISOR', fixo:true },
      { id:'fixo_francisco_helder', nome:'Francisco Helder', cargo:'SUPERVISOR', fixo:true }
    ],
    OP_ICONS: {
      'CONTROLE DE TRAFEGO':     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'OPER CICLOFAIXA DO LAZER':`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M8 17.5l2.5-7 2.5 4 2-4h2.5"/><circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/></svg>`,
      'APOIO AO JOGO':           `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M18 2H6v7a6 6 0 0012 0V2z"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/></svg>`,
      'APOIO A EVENTO':          `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      'APOIO A OBRA':            `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M12 7V3M8 7V5M16 7V5"/></svg>`,
      'RESERVA DE VAGAS':        `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>`,
      'OPERAÇÃO SEMAFORICA':     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none"/></svg>`,
      'COLISÃO SEM VITIMA':      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/><circle cx="16" cy="17" r="3"/><circle cx="7" cy="17" r="3"/></svg>`,
      'APOIO A OUTROS ORGÃOS':   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
      'FIOS CAIDOS NA VIA':      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      'POSTE CAIDO NA VIA':      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="20" y2="4"/><path d="M8 20l8-8"/><circle cx="18" cy="6" r="2"/></svg>`,
      'MANIFESTAÇÃO':            `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
      'APOIO A PODA':            `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>`,
      'INCENDIO':                `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>`,
      'ARVORE CAIDA NA VIA':     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22V8l-5-6-5 6v14"/><line x1="3" y1="22" x2="21" y2="22"/><line x1="7" y1="13" x2="17" y2="13"/></svg>`,
      'DILIGENCIA':              `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
      'OLEO NA PISTA':           `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
      'default':                 `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    },

    // Lifecycle de operação — terreno preparado para o sistema de duas camadas.
    // Quando op.status for implementado na UI, substituir os dots da sidebar.
    LIFECYCLE_COLORS: {
      planejada:  'var(--lifecycle-pending)',
      ativa:      'var(--lifecycle-active)',
      concluida:  'var(--lifecycle-done)'
    }
  };

  /* ── ESTADO GLOBAL ─────────────────────────────────────── */
  const S = {
    db: null, user: null, role: null,
    modo: null,          // 'dashboard' | 'campo'
    escalaAtiva: null,   // ID da escala do turno ativo
    operacaoSel: null,   // ID da operação selecionada
    escalas: {}, operacoes: {}, postos: {}, recursos: {}, viaturas: {}, templates: {},
    supervisaoDoTurno: [], // composição real do turno ativo
    _unsubs: [],           // unsubscribe listeners Firebase
    _dropAberto: null,     // ID do dropdown aberto (para fechar ao clicar fora)
    _buscaEquipes: '',     // filtro da lista de operações
    _buscaStaff: '',       // filtro do painel direito
  };

  /* ── UTILITÁRIOS ───────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const show = id => { const el=$(id); if(el) el.classList.remove('hidden'); };
  const hide = id => { const el=$(id); if(el) el.classList.add('hidden'); };
  const esc  = str => String(str||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const upper = str => String(str||'').toUpperCase().trim();

  // Title case para exibição — preposições e conjunções em minúsculo.
  // Aplicado na camada de display, não no banco — dados permanecem
  // em MAIÚSCULO para consistência com o relatório mensal da AMC.
  const PREP = new Set(['de','do','da','dos','das','e','a','o','em',
                        'no','na','nos','nas','por','para','com','x']);
  const titleCase = str => String(str||'').toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !PREP.has(w))
      ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ');
  const vibrar = ms => navigator.vibrate?.(ms);

  const getDataHoje = () => {
    const brt = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Fortaleza'}));
    return brt.toISOString().slice(0,10);
  };
  const getHoraAtual = () => {
    const brt = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Fortaleza'}));
    return `${String(brt.getHours()).padStart(2,'0')}:${String(brt.getMinutes()).padStart(2,'0')}`;
  };
  const getMinAtual = () => {
    const brt = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Fortaleza'}));
    return brt.getHours()*60 + brt.getMinutes();
  };

  const turnoLabel = escala => {
    if (!escala) return '';
    const RE = /\s+\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\s*$/;
    const base = CFG.TURNOS[escala.turno]?.label || escala.label || upper(escala.turno||'');
    return base.replace(RE,'').trim();
  };

  const opIcon = tipo => CFG.OP_ICONS[tipo] || CFG.OP_ICONS.default;

  // Cor do avatar a partir do nome (determinística)
  const AVATAR_COLORS = [
    '#58a6ff','#38bd6b','#fbbf24','#ef4444','#a78bfa',
    '#fb923c','#34d399','#f472b6','#60a5fa','#4ade80'
  ];
  const avatarColor = nome => {
    let h = 0;
    for (const c of (nome||'')) h = (h*31 + c.charCodeAt(0)) & 0xFFFFFF;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  };
  const avatarInitials = nome => {
    const parts = (nome||'').trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
      : (parts[0]||'?')[0].toUpperCase();
  };

  // Status do posto baseado nos orientadores
  const postoStatus = posto => {
    const orientadores = posto.orientadores || {};
    const n = Object.keys(orientadores).length;
    if (n === 0) return 'vazio';
    return 'parcial'; // TODO: 'completo' quando tivermos mínimo configurável
  };

  // Cor do dot de operação na sidebar
  const opDot = opId => {
    const postsOp = Object.values(S.postos).filter(p => p.operacaoId === opId);
    if (!postsOp.length) return 'vermelho';
    const vazios = postsOp.filter(p => !Object.keys(p.orientadores||{}).length).length;
    if (vazios === 0) return 'verde';
    if (vazios === postsOp.length) return 'vermelho';
    return 'amarelo';
  };

  // Toast
  const toast = (msg, tipo='info', ms=3000) => {
    let cont = $('toast-container');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'toast-container';
      document.body.appendChild(cont);
    }
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.textContent = msg;
    cont.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  /* ── AUTH ──────────────────────────────────────────────── */
  const Auth = {
    init() {
      const url = new URL(location.href);
      S.modo = url.searchParams.get('modo') === 'campo' ? 'campo' : 'dashboard';

      firebase.initializeApp(CFG.firebase);
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          S.user = user;
          await Auth._resolveRole(user);
          if (S.modo === 'campo' || !S.role || S.role === 'campo') {
            await DB.initPublico();
            UI.showCampo();
          } else {
            await DB.initDashboard();
            UI.showDashboard();
          }
        } else {
          if (S.modo === 'campo') {
            firebase.auth().signInAnonymously();
          } else {
            UI.showLogin();
          }
        }
      });
    },

    async _resolveRole(user) {
      if (!user.email) { S.role = 'campo'; return; }
      try {
        const snap = await firebase.database()
          .ref(`efetivo_roles/${user.email.replace(/\./g,'_').replace(/@/g,'_at_')}`)
          .once('value');
        S.role = snap.exists() ? snap.val() : 'campo';
      } catch { S.role = 'campo'; }
    },

    login() {
      const prov = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(prov).catch(e => {
        console.error('[Auth.login]', e);
        toast('Erro ao entrar. Tente novamente.', 'danger');
      });
    },

    logout() {
      S._unsubs.forEach(fn => fn());
      S._unsubs = [];
      firebase.auth().signOut();
    }
  };

  /* ── DB ────────────────────────────────────────────────── */
  const DB = {
    // ── Inicialização do dashboard (listeners em tempo real)
    async initDashboard() {
      S.db = firebase.database();
      DB._listenRecursos();
      DB._listenViaturas();
      DB._listenEscalas(); // _listenOperacoes e _listenPostos são
                           // chamados dentro de _listenEscalas depois
                           // que S.escalaAtiva é definido
      DB._listenTemplates();
      DB._listenConexao();
    },

    _listenRecursos() {
      const ref = S.db.ref('efetivo/recursos');
      const fn  = ref.on('value', snap => {
        S.recursos = snap.val() || {};
        UI.renderRightPanel();
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenViaturas() {
      const ref = S.db.ref('efetivo/viaturas');
      const fn  = ref.on('value', snap => {
        S.viaturas = snap.val() || {};
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenEscalas() {
      const hoje = getDataHoje();
      const ref  = S.db.ref('efetivo/escalas').orderByChild('data').equalTo(hoje);
      let   escalaAnterior = null;
      const fn   = ref.on('value', snap => {
        const todas = snap.val() || {};
        S.escalas = todas;
        const ativa = Object.entries(todas).find(([,e]) => e.status === 'ativo');
        S.escalaAtiva = ativa ? ativa[0] : null;

        if (S.escalaAtiva && todas[S.escalaAtiva]?.supervisao) {
          S.supervisaoDoTurno = _normalizarSupervisao(todas[S.escalaAtiva].supervisao);
        } else {
          S.supervisaoDoTurno = [];
        }

        // Inicializar listeners de operações e postos quando
        // S.escalaAtiva muda — garante filtro pelo turno correto
        if (S.escalaAtiva && S.escalaAtiva !== escalaAnterior) {
          escalaAnterior = S.escalaAtiva;
          S.operacoes    = {};
          S.postos       = {};
          DB._listenOperacoes();
          DB._listenPostos();
        }

        UI.renderShiftBar();
        UI.renderSupervisao();
        UI.renderOpsList();
        UI.renderMainContent();
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenOperacoes() {
      // Ouve APENAS as operações do turno ativo — evita carregar
      // todo o histórico de /efetivo/operacoes (que pode ter milhares
      // de registros de sessões anteriores do Efetivo e Semáforos).
      // Quando S.escalaAtiva muda, _listenEscalas chama este método
      // novamente com o novo ID.
      if (!S.escalaAtiva) return;
      const ref = S.db.ref('efetivo/operacoes')
        .orderByChild('escalaId').equalTo(S.escalaAtiva);
      const fn  = ref.on('value', snap => {
        // Merge: preserva operações de outras escalas já em memória
        const novas = snap.val() || {};
        Object.assign(S.operacoes, novas);
        UI.renderOpsList();
        UI.renderMainContent();
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenPostos() {
      // Mesmo padrão: filtra pelo turno ativo
      if (!S.escalaAtiva) return;
      const ref = S.db.ref('efetivo/postos')
        .orderByChild('escalaId').equalTo(S.escalaAtiva);
      const fn  = ref.on('value', snap => {
        const novos = snap.val() || {};
        Object.assign(S.postos, novos);
        UI.renderOpsList();
        UI.renderMainContent();
        UI.renderRightPanel();
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenTemplates() {
      const ref = S.db.ref('efetivo/templates/operacoes');
      const fn  = ref.on('value', snap => {
        S.templates = snap.val() || {};
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    _listenConexao() {
      const ref = S.db.ref('.info/connected');
      const fn  = ref.on('value', snap => {
        const online = snap.val() === true;
        const bar    = $('conexao-bar');
        const dot    = $('conexao-dot-main');
        const lbl    = $('conexao-label-main');
        if (!bar) return;
        bar.className = `conexao-bar ${online ? 'conexao-online' : 'conexao-offline'}`;
        if (lbl) lbl.textContent = online ? 'Firebase online' : 'Sem conexão';
      });
      S._unsubs.push(() => ref.off('value', fn));
    },

    // ── Modo Campo (leitura única, sem listener persistente)
    async initPublico() {
      S.db = firebase.database();
      try {
        const escSnap = await S.db.ref('efetivo/escalas')
          .orderByChild('status').equalTo('ativo').once('value');
        const todas = escSnap.val() || {};
        const ativa = Object.entries(todas).find(([,e]) => e.status === 'ativo');
        S.escalaAtiva = ativa ? ativa[0] : null;
        S.escalas     = todas;

        if (S.escalaAtiva) {
          const [rS,vS,oS,pS] = await Promise.all([
            S.db.ref('efetivo/recursos').once('value'),
            S.db.ref('efetivo/viaturas').once('value'),
            S.db.ref('efetivo/operacoes').orderByChild('escalaId').equalTo(S.escalaAtiva).once('value'),
            S.db.ref('efetivo/postos').orderByChild('escalaId').equalTo(S.escalaAtiva).once('value')
          ]);
          S.recursos  = rS.val() || {};
          S.viaturas  = vS.val() || {};
          S.operacoes = oS.val() || {};
          S.postos    = pS.val() || {};
        } else {
          const [rS,vS] = await Promise.all([
            S.db.ref('efetivo/recursos').once('value'),
            S.db.ref('efetivo/viaturas').once('value')
          ]);
          S.recursos = rS.val() || {};
          S.viaturas = vS.val() || {};
        }
      } catch(e) { console.error('[DB.initPublico]', e); }
    },

    // ── Writes

    async criarEscala(dados) {
      const ref = await S.db.ref('efetivo/escalas').push({
        ...dados, status:'ativo', criadoEm:Date.now(), criadoPor:S.user?.email
      });
      // Auto-aplicar supervisores fixos
      const supervisaoFixa = {};
      CFG.SUPERVISORES_FIXOS.forEach(sf => {
        supervisaoFixa[sf.id] = { nome:sf.nome, cargo:sf.cargo, fixo:true, contato:'' };
      });
      // Tentar aplicar padrão salvo
      const padrao = await S.db.ref(`efetivo/config/supervisao_padrao_${dados.turno}`).once('value');
      if (padrao.exists()) {
        await S.db.ref(`efetivo/escalas/${ref.key}/supervisao`).set({
          ...supervisaoFixa, ...padrao.val()
        });
      } else {
        await S.db.ref(`efetivo/escalas/${ref.key}/supervisao`).set(supervisaoFixa);
      }
      return ref.key;
    },

    async encerrarEscala(escalaId, nota) {
      // Liberar todos os recursos escalados
      const escalados = Object.entries(S.recursos).filter(([,r]) => r.status==='escalado');
      await Promise.all(escalados.map(([id]) =>
        S.db.ref(`efetivo/recursos/${id}/status`).set('disponivel')));
      if (nota) {
        await S.db.ref(`efetivo/escalas/${escalaId}/bastao`).set({
          nota, autor:S.user?.displayName||S.user?.email, ts:Date.now()
        });
      }
      await S.db.ref(`efetivo/escalas/${escalaId}/status`).set('encerrado');
    },

    async adicionarOperacao(dados) {
      const ordem = Object.values(S.operacoes)
        .filter(o => o.escalaId === S.escalaAtiva).length + 1;
      const payload = {
        ...dados, escalaId: S.escalaAtiva,
        ordem, criadoEm: Date.now()
      };
      const ref = await S.db.ref('efetivo/operacoes').push(payload);
      // Update otimista: não espera o listener disparar.
      // A UI atualiza imediatamente; o listener vai confirmar
      // (ou corrigir) quando o Firebase responder.
      S.operacoes[ref.key] = payload;
      S.operacaoSel = ref.key;
      UI.renderOpsList();
      UI.renderMainContent();
      return ref.key;
    },

    async adicionarOrientadorAoPosto(postoId, recursoId) {
      const r = S.recursos[recursoId];
      if (!r) return;
      const ori = { nome: r.nome, cargo: r.cargo || 'ORIENTADOR', ts: Date.now() };
      await S.db.ref(`efetivo/postos/${postoId}/orientadores/${recursoId}`).set(ori);
      await S.db.ref(`efetivo/recursos/${recursoId}/status`).set('escalado');
      // Update otimista
      if (S.postos[postoId]) {
        if (!S.postos[postoId].orientadores) S.postos[postoId].orientadores = {};
        S.postos[postoId].orientadores[recursoId] = ori;
      }
      if (S.recursos[recursoId]) S.recursos[recursoId].status = 'escalado';
      UI.renderMainContent();
      UI.renderRightPanel();
    },

    async removerOrientadorDoPosto(postoId, recursoId) {
      await S.db.ref(`efetivo/postos/${postoId}/orientadores/${recursoId}`).remove();
      const emOutroPosto = Object.entries(S.postos).some(([pid, p]) =>
        pid !== postoId && p.orientadores?.[recursoId]);
      if (!emOutroPosto) {
        await S.db.ref(`efetivo/recursos/${recursoId}/status`).set('disponivel');
      }
      // Update otimista
      if (S.postos[postoId]?.orientadores) {
        delete S.postos[postoId].orientadores[recursoId];
      }
      if (!emOutroPosto && S.recursos[recursoId]) {
        S.recursos[recursoId].status = 'disponivel';
      }
      UI.renderMainContent();
      UI.renderRightPanel();
    },

    async salvarSupervisaoPadrao(turno) {
      const sup = S.escalas[S.escalaAtiva]?.supervisao || {};
      // Não salvar os fixos no padrão (eles são sempre injetados)
      const semFixos = Object.fromEntries(
        Object.entries(sup).filter(([,v]) => !v.fixo)
      );
      await S.db.ref(`efetivo/config/supervisao_padrao_${turno}`).set(semFixos);
    },

    async adicionarPosto(dados) {
      const postosEscala = Object.values(S.postos).filter(p => p.escalaId === S.escalaAtiva);
      const numero       = postosEscala.filter(p => p.operacaoId === dados.operacaoId).length + 1;
      const payload = { ...dados, escalaId: S.escalaAtiva, numero, orientadores: {}, criadoEm: Date.now() };
      const ref = await S.db.ref('efetivo/postos').push(payload);
      // Update otimista
      S.postos[ref.key] = payload;
      UI.renderMainContent();
      return ref.key;
    }
  };

  // Normaliza supervisão (de objeto Firebase → array)
  const _normalizarSupervisao = sup => {
    if (!sup) return [];
    return Object.entries(sup).map(([id,v]) => ({
      id, nome:v.nome||id, cargo:v.cargo||'SUPERVISOR',
      contato:v.contato||'', fixo:!!v.fixo
    }));
  };

  /* ── UI ────────────────────────────────────────────────── */
  // Helper de escopo — contagem de postos por operação.
  // Declarada aqui para ser acessível dentro dos métodos do UI
  // sem precisar do prefixo UI._countPostos().
  const _countPostos = opId =>
    Object.values(S.postos).filter(p => p.operacaoId === opId).length;

  const UI = {

    showLogin()     { show('login-screen'); },
    showCampo()     { show('app-campo');    UI.initCampoUI(); },
    showDashboard() {
      show('app-dashboard');
      UI._initClock();
      UI.popularSelectTipos();
    },

    // Relógio em tempo real
    _clockTick: null,
    _initClock() {
      const tick = () => {
        const h = getHoraAtual();
        ['shift-clock','topbar-clock'].forEach(id => {
          const el = $(id);
          if (el && el.textContent !== h) el.textContent = h;
        });
      };
      tick();
      UI._clockTick = setInterval(tick, 5000);
    },

    popularSelectTipos() {
      // Monta o combo pesquisável de tipo de missão com navegação por teclado
      UI._combo('nop-tipo-input', 'nop-tipo-list',
        CFG.TIPOS_MISSAO.map(t => ({ value: t, label: t })),
        (value) => {
          const hidden = $('nop-tipo');
          if (hidden) hidden.value = value;
          UI._autoNomeOp();
        }
      );
    },

    // ── COMBO UNIFICADO COM TECLADO ────────────────────────
    // Substitui todos os <select> do sistema por um input pesquisável
    // com navegação por teclado: ↑↓ navegar · Enter selecionar · Esc fechar
    _combo(inputId, listId, items, onSelect) {
      const inp  = $(inputId);
      const list = $(listId);
      if (!inp || !list) return;

      let focusIdx = -1;

      const getVisiveis = () =>
        [...list.querySelectorAll('.combo-item')].filter(el => el.style.display !== 'none');

      const posicionar = () => {
        const r = inp.getBoundingClientRect();
        list.style.top   = `${r.bottom + 2}px`;
        list.style.left  = `${r.left}px`;
        list.style.width = `${Math.max(r.width, 220)}px`;
      };

      const render = (filtro = '') => {
        focusIdx = -1;
        const f = filtro.toLowerCase().trim();
        const matches = f
          ? items.filter(it => it.label.toLowerCase().includes(f))
          : items;

        list.innerHTML = matches.length
          ? matches.map(it =>
              `<div class="combo-item" data-value="${esc(it.value)}">${esc(it.label)}</div>`
            ).join('')
          : `<div class="combo-empty">Nenhum resultado para "${esc(filtro)}"</div>`;

        list.querySelectorAll('.combo-item').forEach(el => {
          el.addEventListener('mousedown', e => e.preventDefault());
          el.addEventListener('click', () => {
            inp.value  = el.textContent;
            inp.dataset.selectedValue = el.dataset.value;
            list.classList.remove('open');
            focusIdx = -1;
            onSelect(el.dataset.value, el.textContent);
          });
        });

        posicionar();
        list.classList.add('open');
      };

      inp.addEventListener('input',  () => render(inp.value));
      inp.addEventListener('focus',  () => render(inp.value));
      inp.addEventListener('blur',   () => setTimeout(() => list.classList.remove('open'), 180));
      inp.addEventListener('keydown', e => {
        const vis = getVisiveis();
        if (!vis.length && e.key !== 'Escape') return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!list.classList.contains('open')) { render(inp.value); return; }
          focusIdx = Math.min(focusIdx + 1, vis.length - 1);
          vis.forEach((el, i) => el.classList.toggle('combo-item-focused', i === focusIdx));
          vis[focusIdx]?.scrollIntoView({ block: 'nearest' });

        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusIdx = Math.max(focusIdx - 1, 0);
          vis.forEach((el, i) => el.classList.toggle('combo-item-focused', i === focusIdx));
          vis[focusIdx]?.scrollIntoView({ block: 'nearest' });

        } else if (e.key === 'Enter') {
          if (focusIdx >= 0 && vis[focusIdx]) {
            e.preventDefault();
            vis[focusIdx].click();
          } else if (vis.length === 1) {
            // Enter com um único resultado → seleciona automaticamente
            e.preventDefault();
            vis[0].click();
          }
        } else if (e.key === 'Escape') {
          list.classList.remove('open');
          focusIdx = -1;
        }
      });
    },

    // ── ADD POSTO INLINE ───────────────────────────────────
    // Abre um mini-form inline dentro do card da operação.
    // Sem modal — o operador preenche sem perder o contexto visual.
    abrirAddPosto(opId) {
      // Fechar qualquer form inline aberto anteriormente
      document.querySelectorAll('.posto-form-inline').forEach(el => el.remove());

      const op        = S.operacoes[opId] || {};
      const formId    = `posto-form-${opId}`;
      const container = document.querySelector(`#qru-${opId.replace(/[^a-zA-Z0-9]/g,'\\$&')} .qrus-lista`)
                     || document.getElementById('qrus-lista');

      const formHTML = `
        <div class="posto-form-inline" id="${formId}">
          <div class="posto-form-header">Novo posto · ${esc(op.nome||'—')}</div>

          <label class="form-label">Endereço / Local *</label>
          <input id="pf-local" type="text" class="input-sm"
            placeholder="Ex: AV DES MOREIRA × AV DOM LUÍS" autocomplete="off">

          <label class="form-label">Bairro
            <span class="form-hint">pré-preenchido da operação, editável</span>
          </label>
          <div class="combo-wrap">
            <input id="pf-bairro-input" type="text" class="input-sm"
              value="${esc(op.bairro||'')}"
              placeholder="Bairro..." autocomplete="off">
            <div id="pf-bairro-list" class="combo-drop"></div>
          </div>

          <label class="form-label">Observação
            <span class="form-hint">opcional</span>
          </label>
          <input id="pf-obs" type="text" class="input-sm" placeholder="">

          <label class="form-label">Orientador / Equipe
            <span class="badge badge-warn-sm">⚠ não designado</span>
          </label>
          <div class="combo-wrap">
            <input id="pf-orientador-input" type="text" class="input-sm"
              placeholder="Opcional — designar depois é possível"
              autocomplete="off">
            <div id="pf-orientador-list" class="combo-drop"></div>
          </div>

          <div class="posto-form-footer">
            <button class="btn-ghost-sm"
              onclick="NIT_PLANOP.UI.fecharAddPosto('${opId}')">Cancelar</button>
            <button class="btn-accent-sm"
              onclick="NIT_PLANOP.Actions.criarPosto('${opId}')">+ Adicionar posto</button>
          </div>
        </div>`;

      // Inserir antes do card de "nenhum posto" ou ao final da lista
      const qrusLista = document.getElementById('qrus-lista');
      if (qrusLista) {
        qrusLista.insertAdjacentHTML('beforeend', formHTML);
      }

      // Montar combos com teclado
      UI._combo('pf-bairro-input', 'pf-bairro-list',
        CFG.BAIRROS.map(b => ({ value: b, label: b })),
        (value) => { $('pf-bairro-input').value = value; }
      );

      const staffItems = Object.entries(S.recursos)
        .filter(([,r]) => r.status !== 'desligado' && r.status !== 'ausente')
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'))
        .map(([id,r]) => ({ value: `a:${id}`, label: `${r.nome} · ${r.cargo||''}` }));
      const equipeItems = Object.entries(S.viaturas)
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'))
        .map(([id,v]) => ({ value: `v:${id}`, label: `👥 ${v.nome||id}` }));

      UI._combo('pf-orientador-input', 'pf-orientador-list',
        [...staffItems, ...equipeItems],
        () => {} // só armazena no dataset do input
      );

      // Foco automático no campo obrigatório
      setTimeout(() => $('pf-local')?.focus(), 80);
    },

    fecharAddPosto(opId) {
      document.querySelectorAll('.posto-form-inline').forEach(el => el.remove());
    },

    _autoNomeOp() {
      const tipo   = $('nop-tipo')?.value || '';
      const bairro = $('nop-bairro')?.value?.trim() || '';
      const nome   = $('nop-nome');
      if (!nome || nome._editado) return;
      nome.value = tipo && bairro ? `${tipo} — ${bairro}` : tipo || bairro || '';
    },

    // ── SHIFT BAR
    renderShiftBar() {
      if (!S.escalaAtiva) {
        show('shift-idle'); hide('shift-active');
        hide('btn-encerrar-wrap');
        return;
      }
      const e = S.escalas[S.escalaAtiva];
      hide('shift-idle'); show('shift-active');
      const lbl = $('shift-label-text');
      if (lbl) lbl.textContent = `${turnoLabel(e)} · ${e.horarioInicio}–${e.horarioFim}`;
      if (canManage()) show('btn-encerrar-wrap');
      else hide('btn-encerrar-wrap');
    },

    // ── SUPERVISÃO
    toggleSupervisao() {
      const body    = $('supervisao-body');
      const toggle  = $('supervisao-toggle');
      if (!body || !toggle) return;
      const aberto = !body.classList.contains('hidden');
      body.classList.toggle('hidden', aberto);
      toggle.setAttribute('aria-expanded', String(!aberto));
    },

    renderSupervisao() {
      const lista  = $('supervisao-lista');
      const count  = $('supervisao-count');
      if (!lista) return;

      // Supervisores fixos + os do turno
      const todos = [
        ...CFG.SUPERVISORES_FIXOS,
        ...S.supervisaoDoTurno.filter(m => !m.fixo)
      ];

      if (count) count.textContent = `${todos.length} pessoa${todos.length!==1?'s':''}`;

      lista.innerHTML = todos.map(m => {
        const fixoIcon = m.fixo
          ? `<span class="supervisao-fixo-icon" title="Supervisor fixo — presente em todos os turnos">📌</span>` : '';
        const removeBtn = !m.fixo && canWrite()
          ? `<button class="btn-icon-nav" style="min-width:20px;min-height:20px" 
               onclick="NIT_PLANOP.Actions.removerMembro('${esc(m.id)}')" 
               title="Remover">×</button>` : '';
        return `<div class="supervisao-membro">
          <span class="supervisao-dot"></span>
          <span class="supervisao-nome">${esc(titleCase(m.nome))}${fixoIcon}</span>
          <span class="supervisao-cargo">${esc(m.cargo)}</span>
          ${removeBtn}
        </div>`;
      }).join('');
    },

    // ── LISTA DE OPERAÇÕES (sidebar)
    renderOpsList() {
      const lista = $('ops-lista');
      if (!lista) return;
      const busca = S._buscaEquipes.toLowerCase().trim();
      let ops = Object.entries(S.operacoes)
        .filter(([,o]) => !S.escalaAtiva || o.escalaId === S.escalaAtiva)
        .sort(([,a],[,b]) => (a.ordem||0)-(b.ordem||0));
      if (busca) ops = ops.filter(([,o]) =>
        (o.nome||'').toLowerCase().includes(busca) ||
        (o.bairro||'').toLowerCase().includes(busca));
      if (!ops.length) {
        lista.innerHTML = `<div style="padding:16px;font-size:11px;color:var(--text-muted);text-align:center">
          ${S.escalaAtiva ? 'Nenhuma operação' : 'Abra um turno para ver as operações'}
        </div>`;
        return;
      }
      lista.innerHTML = ops.map(([id,op]) => {
        const ativo    = S.operacaoSel === id ? 'active' : '';
        const dot      = opDot(id);
        const icon     = opIcon(op.tipoMissao);
        const nPostos  = Object.values(S.postos).filter(p => p.operacaoId === id).length;
        const sub      = [op.bairro, nPostos + (nPostos === 1 ? ' posto' : ' postos'), op.horario ? op.horario + 'h' : '']
          .filter(Boolean).join(' · ');
        return `<div class="ops-item ${ativo}" onclick="NIT_PLANOP.UI.selOp('${id}')">
          <div class="ops-item-icon">${icon}</div>
          <div class="ops-item-body">
            <div class="ops-item-name">${esc(titleCase(op.nome||'—'))}</div>
            <div class="ops-item-sub">${esc([titleCase(op.bairro||''), nPostos+' posto'+(nPostos!==1?'s':''), op.horario?op.horario+'h':''].filter(Boolean).join(' · '))}</div>
          </div>
          <span class="ops-status-dot ${dot}"></span>
        </div>`;
      }).join('');
    },

    selOp(opId) {
      S.operacaoSel = opId;
      UI.renderOpsList();
      UI.renderMainContent();
    },

    filtrarOps(val) {
      S._buscaEquipes = val;
      const clear = $('sidebar-busca-clear');
      if (clear) clear.classList.toggle('hidden', !val);
      UI.renderOpsList();
    },

    limparBuscaOps() {
      const inp = $('sidebar-busca');
      if (inp) inp.value = '';
      UI.filtrarOps('');
    },

    // ── CONTEÚDO PRINCIPAL
    renderMainContent() {
      const cont = $('main-content');
      if (!cont) return;

      // Sem turno aberto
      if (!S.escalaAtiva) {
        cont.innerHTML = `<div class="estado-vazio">
          <div class="estado-vazio-icon">📋</div>
          <div class="estado-vazio-titulo">Nenhum turno ativo</div>
          <div class="estado-vazio-sub">
            Abra um turno para iniciar o planejamento e o acompanhamento das operações do dia.
          </div>
          ${canWrite() ? `<button class="btn-abrir-turno-main" onclick="NIT_PLANOP.UI.abrirTurno()">
            Abrir turno agora
          </button>` : ''}
        </div>`;
        return;
      }

      // Sem operação selecionada — seleciona a primeira automaticamente
      if (!S.operacaoSel) {
        const primeira = Object.keys(S.operacoes)
          .find(id => S.operacoes[id].escalaId === S.escalaAtiva);
        if (primeira) { S.operacaoSel = primeira; UI.renderOpsList(); }
      }

      const op = S.operacoes[S.operacaoSel];
      if (!op) {
        cont.innerHTML = `<div class="estado-vazio">
          <div class="estado-vazio-icon">↑</div>
          <div class="estado-vazio-titulo">Selecione uma operação</div>
          <div class="estado-vazio-sub">Clique em uma operação na barra lateral para ver os postos.</div>
        </div>`;
        return;
      }

      const postos = Object.entries(S.postos)
        .filter(([,p]) => p.operacaoId === S.operacaoSel)
        .sort(([,a],[,b]) => (a.numero||0)-(b.numero||0));

      // Métricas
      const semNinguem = postos.filter(([,p]) => !Object.keys(p.orientadores||{}).length).length;
      const totalOri   = postos.reduce((s,[,p]) => s+Object.keys(p.orientadores||{}).length, 0);
      const cobertura  = postos.length ? Math.round(((postos.length-semNinguem)/postos.length)*100) : 0;

      cont.innerHTML = `
        <!-- Top bar -->
        <div class="op-topbar">
          <div class="op-topbar-icon">${opIcon(op.tipoMissao)}</div>
          <div class="op-topbar-info">
            <div class="op-topbar-name">
              ${esc(titleCase(op.nome||'—'))}
              <span class="badge-ativo">ATIVO</span>
            </div>
            <div class="op-topbar-sub">
              ${[titleCase(op.bairro||''), op.horario?op.horario+'h':'', titleCase(op.tipoMissao||'')]
                .filter(Boolean).map(esc).join(' · ')}
            </div>
          </div>
          <div class="op-topbar-right">
            <div class="modo-btns">
              <button class="modo-btn modo-btn-active">
                ▶ EXECUTAR
              </button>
              <button class="modo-btn"
                onclick="NIT_PLANOP.UI.abrirPlanejar()">
                📅 PLANEJAR
              </button>
            </div>
            <span class="topbar-date">Hoje</span>
            <span class="topbar-clock" id="topbar-clock">${getHoraAtual()}</span>
          </div>
        </div>

        <!-- Métricas -->
        <div class="metricas-grid">
          <div class="metrica-card">
            <div class="metrica-label">QRUs</div>
            <div class="metrica-num">${postos.length}</div>
            <div class="metrica-sub">postos ativos</div>
          </div>
          <div class="metrica-card">
            <div class="metrica-label">Sem ninguém</div>
            <div class="metrica-num ${semNinguem>0?'danger':'success'}">${semNinguem}</div>
            <div class="metrica-sub">${semNinguem>0?'precisam de designação':'todos cobertos'}</div>
          </div>
          <div class="metrica-card">
            <div class="metrica-label">Orientadores no posto</div>
            <div class="metrica-num">${totalOri}</div>
            <div class="metrica-sub">no campo agora</div>
          </div>
          <div class="metrica-card">
            <div class="metrica-label">Cobertura</div>
            <div class="metrica-num ${cobertura<100?'warning':'success'}">${cobertura}%</div>
            <div class="metrica-sub">dos postos cobertos</div>
          </div>
        </div>

        <!-- QRUs -->
        <div class="qru-section-header">
          <span class="qru-section-label">Postos / QRUs</span>
          <input class="qru-search" placeholder="Filtrar postos..."
            oninput="NIT_PLANOP.UI.filtrarQrus(this.value)">
          <button class="btn-expandir" onclick="NIT_PLANOP.UI.expandirTodos()">
            Expandir todos
          </button>
          ${canWrite() ? `<button class="btn-add-posto"
            onclick="NIT_PLANOP.UI.abrirAddPosto('${S.operacaoSel}')">+ Posto</button>` : ''}
        </div>

        <div class="qrus-lista" id="qrus-lista">
          ${postos.map(([postoId,posto]) => UI._qruCardHTML(postoId,posto)).join('')}
          ${!postos.length ? `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px">
            Nenhum posto cadastrado. Clique em "+ Posto" para adicionar.
          </div>` : ''}
        </div>`;
    },

    // ── QRU CARD
    _qruCardHTML(postoId, posto) {
      const orientadores = Object.entries(posto.orientadores||{});
      const status = orientadores.length===0 ? 'vazio' : 'parcial';
      const badgeText = status==='vazio'
        ? 'Vazio'
        : `${orientadores.length} pessoa${orientadores.length!==1?'s':''}`;

      const chipsHTML = orientadores.map(([rId,ori]) => {
        const nome = ori.nome || rId;
        // Title case para exibição — o banco pode ter ALL CAPS por legado
        const nomeDisplay = nome.split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        const cargo = (ori.cargo || 'ORI').slice(0,3).toUpperCase();
        const cor   = avatarColor(nome);
        const ini   = avatarInitials(nome);
        return `<div class="orientador-chip">
          <div class="chip-avatar" style="background:${cor}">${ini}</div>
          <span class="chip-nome">${esc(nomeDisplay)}</span>
          <span class="chip-cargo">${esc(cargo)}</span>
          ${canWrite() ? `<button class="orientador-chip-remove"
            onclick="NIT_PLANOP.Actions.removerOrientador('${postoId}','${rId}')"
            title="Remover">×</button>` : ''}
        </div>`;
      }).join('');

      const addBtn = canWrite()
        ? `<div class="add-orientador-wrap">
            <button class="btn-add-orientador"
              onclick="NIT_PLANOP.UI.abrirDropOrientador(event,'${postoId}')">
              + Adicionar orientador ▾
            </button>
            <div id="drop-${postoId}" class="orientador-drop"></div>
           </div>` : '';

      return `<div class="qru-card status-${status}" id="qru-${postoId}"
        ondragover="NIT_PLANOP.UI.dragOverQru(event,'${postoId}')"
        ondragleave="NIT_PLANOP.UI.dragLeaveQru(event,'${postoId}')"
        ondrop="NIT_PLANOP.UI.dropOnQru(event,'${postoId}')">
        <div class="qru-card-header" onclick="NIT_PLANOP.UI.toggleQru('${postoId}')">
          <span class="qru-num">${posto.numero||'?'}</span>
          <div class="qru-addr-wrap">
            <div class="qru-addr">${esc(titleCase(posto.local||'—'))}</div>
            <div class="qru-sub">${[titleCase(posto.bairro||''), titleCase(posto.tipoAcao||'')].filter(Boolean).map(esc).join(' · ')}</div>
          </div>
          <span class="qru-badge ${status}">${badgeText}</span>
          <svg class="qru-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <button class="btn-qru-menu" onclick="event.stopPropagation()"
            aria-label="Mais opções">···</button>
        </div>
        <div class="qru-body">
          <div class="orientadores-label">Orientadores designados</div>
          <div class="orientadores-chips">${chipsHTML}</div>
          ${addBtn}
          <button class="detalhes-toggle"
            onclick="NIT_PLANOP.UI.toggleDetalhes('${postoId}')">
            ▸ Detalhes do posto
          </button>
          <div class="detalhes-body" id="det-${postoId}">
            <div class="detalhes-row">
              <span class="detalhes-key">Horário</span>
              <span class="detalhes-val">${esc(posto.horario||'—')}</span>
            </div>
            <div class="detalhes-row">
              <span class="detalhes-key">Tipo de ação</span>
              <span class="detalhes-val">${esc(titleCase(posto.tipoAcao||'Controle'))}</span>
            </div>
            <div class="detalhes-row" style="flex-direction:column;gap:4px">
              <span class="detalhes-key">Observação</span>
              <input class="detalhes-obs-input" value="${esc(posto.obs||'')}"
                placeholder="Adicionar observação..."
                onblur="NIT_PLANOP.Actions.salvarObs('${postoId}',this.value)">
            </div>
            ${UI._fotosHTML(postoId, posto)}
          </div>
        </div>
      </div>`;
    },

    _fotosHTML(postoId, posto) {
      const fRef = posto.fotoReferencia;
      const regs = posto.fotosRegistro || {};
      const regsArr = Object.entries(regs).slice(0,3);

      return `<div class="fotos-section">
        <div class="fotos-label">Fotos do posto</div>
        <div class="fotos-grid">
          <div class="foto-ref-wrap">
            ${fRef
              ? `<img class="foto-ref" src="${fRef}" alt="Foto de referência">`
              : `<div class="foto-placeholder" onclick="NIT_PLANOP.UI.addFotoRef('${postoId}')">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Adicionar foto do local
                </div>`}
            <div class="foto-label-sub">Foto de referência</div>
          </div>
          <div class="fotos-registros">
            ${regsArr.map(([rid,r]) =>
              `<div class="foto-registro-wrap">
                <img class="foto-registro" src="${r.data}" alt="Registro">
                <span class="foto-ts">${r.timestamp||''}</span>
              </div>`).join('')}
            ${canWrite() ? `<button class="btn-add-registro"
              onclick="NIT_PLANOP.UI.addFotoRegistro('${postoId}')" title="Adicionar registro">+</button>` : ''}
          </div>
        </div>
      </div>`;
    },

    toggleQru(postoId) {
      const card = document.getElementById(`qru-${postoId}`);
      if (card) card.classList.toggle('expanded');
    },

    toggleDetalhes(postoId) {
      const det = document.getElementById(`det-${postoId}`);
      if (!det) return;
      const aberto = det.classList.toggle('open');
      const btn    = det.previousElementSibling;
      if (btn) btn.textContent = aberto ? '▾ Detalhes do posto' : '▸ Detalhes do posto';
    },

    expandirTodos() {
      document.querySelectorAll('.qru-card').forEach(c => c.classList.add('expanded'));
    },

    filtrarQrus(val) {
      const busca = val.toLowerCase().trim();
      document.querySelectorAll('.qru-card').forEach(card => {
        const addr = card.querySelector('.qru-addr')?.textContent?.toLowerCase()||'';
        const sub  = card.querySelector('.qru-sub')?.textContent?.toLowerCase()||'';
        card.style.display = (!busca || addr.includes(busca) || sub.includes(busca)) ? '' : 'none';
      });
    },

    // ── DROPDOWN DE ORIENTADOR
    // Bairro do form de nova operação — inicializado uma vez ao abrir o form
    _initBairroCombo() {
      UI._combo('nop-bairro', 'nop-bairro-list',
        CFG.BAIRROS.map(b => ({ value: b, label: b })),
        () => UI._autoNomeOp()
      );
    },

    // Dropdown de orientador por QRU — usa _combo para consistência
    abrirDropOrientador(event, postoId) {
      event.stopPropagation();

      // Fechar outros abertos
      if (S._dropAberto && S._dropAberto !== `drop-${postoId}`) {
        const outro = document.getElementById(S._dropAberto);
        if (outro) outro.classList.remove('open');
        S._dropAberto = null;
      }

      const drop = document.getElementById(`drop-${postoId}`);
      if (!drop) return;

      if (drop.classList.contains('open')) {
        drop.classList.remove('open');
        S._dropAberto = null;
        return;
      }

      // Montar conteúdo — itens com disponibilidade visual
      const jaDesignados = Object.keys(S.postos[postoId]?.orientadores || {});
      const items = Object.entries(S.recursos)
        .filter(([,r]) => r.status !== 'desligado' && r.status !== 'ausente')
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'))
        .map(([rId, r]) => {
          const desig = jaDesignados.includes(rId);
          const sub   = desig ? ' · já designado'
                      : r.status === 'escalado' ? ' · em outro posto'
                      : '';
          return {
            value:    rId,
            label:    `${r.nome}${sub}`,
            disabled: desig,
            dot:      r.status === 'disponivel' ? 'on' : 'off'
          };
        });

      // Estrutura do dropdown com search input próprio
      drop.innerHTML = `
        <div class="orientador-drop-search">
          <input type="text" id="drop-search-${postoId}"
            placeholder="Buscar por nome..." autocomplete="off">
        </div>
        <div class="orientador-drop-list" id="drop-body-${postoId}"></div>`;

      drop.classList.add('open');
      S._dropAberto = `drop-${postoId}`;

      // Posicionar antes de montar o combo (precisa estar visível)
      const btn = event.currentTarget;
      const r   = btn.getBoundingClientRect();
      drop.style.top   = `${r.bottom + 4}px`;
      drop.style.left  = `${r.left}px`;
      drop.style.width = `${Math.max(240, r.width)}px`;

      // Reusar _combo no input de busca interno — teclado + filtro
      const inputId = `drop-search-${postoId}`;
      const listId  = `drop-body-${postoId}`;

      // Renderizar lista com dot de disponibilidade
      const renderItems = (filtro = '') => {
        const f = filtro.toLowerCase().trim();
        const vis = f ? items.filter(it => it.label.toLowerCase().includes(f)) : items;
        const body = document.getElementById(listId);
        if (!body) return;
        body.innerHTML = vis.length
          ? vis.map(it => `
              <div class="orientador-drop-item ${it.disabled ? 'disabled' : ''}"
                data-id="${esc(it.value)}"
                onclick="${it.disabled ? '' : `NIT_PLANOP.Actions.addOrientador('${postoId}','${it.value}')`}">
                <span class="drop-avail-dot ${it.dot}"></span>
                <span class="drop-item-nome">${esc(it.label)}</span>
              </div>`).join('')
          : `<div class="combo-empty">Nenhum resultado</div>`;
      };

      renderItems();

      // Teclado no search input do dropdown
      let focusIdx = -1;
      const inp = document.getElementById(inputId);
      if (!inp) return;

      const getVis = () => [...document.querySelectorAll(`#${listId} .orientador-drop-item:not(.disabled)`)];

      inp.addEventListener('input', () => { focusIdx = -1; renderItems(inp.value); });
      inp.addEventListener('keydown', e => {
        const vis = getVis();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusIdx = Math.min(focusIdx + 1, vis.length - 1);
          vis.forEach((el, i) => el.classList.toggle('combo-item-focused', i === focusIdx));
          vis[focusIdx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusIdx = Math.max(focusIdx - 1, 0);
          vis.forEach((el, i) => el.classList.toggle('combo-item-focused', i === focusIdx));
          vis[focusIdx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          if (focusIdx >= 0) { e.preventDefault(); vis[focusIdx]?.click(); }
          else if (vis.length === 1) { e.preventDefault(); vis[0].click(); }
        } else if (e.key === 'Escape') {
          drop.classList.remove('open'); S._dropAberto = null;
        }
      });

      setTimeout(() => inp?.focus(), 40);
    },

    // ── PAINEL DIREITO (staff disponíveis)
    renderRightPanel() {
      const lista = $('staff-lista');
      const count = $('disponiveis-count');
      if (!lista) return;

      const busca = S._buscaStaff.toLowerCase().trim();
      const todos = Object.entries(S.recursos)
        .filter(([,r]) => r.status !== 'desligado')
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'));

      const disponiveis = todos.filter(([,r]) => r.status === 'disponivel');
      const escalados   = todos.filter(([,r]) => r.status === 'escalado');
      const ausentes    = todos.filter(([,r]) => r.status === 'ausente');

      if (count) count.textContent = disponiveis.length;

      const filtrar = arr => busca ? arr.filter(([,r]) =>
        (r.nome||'').toLowerCase().includes(busca)) : arr;

      const rowHTML = ([rId,r], muted=false) => {
        const posto = Object.entries(S.postos).find(([,p]) => p.orientadores?.[rId]);
        const postoInfo = posto ? `→ [${posto[1].numero||'?'}]` : '';
        return `<div class="staff-row ${muted?'muted':''}"
          draggable="${!muted}"
          ondragstart="NIT_PLANOP.UI.dragStartStaff(event,'${rId}')"
          ondragend="NIT_PLANOP.UI.dragEndStaff(event)">
          <span class="staff-drag-handle" aria-hidden="true">⠿</span>
          <div class="staff-avatar" style="background:${avatarColor(r.nome)}" aria-hidden="true">
            ${avatarInitials(r.nome)}
          </div>
          <div class="staff-info">
            <div class="staff-nome">${esc(titleCase(r.nome||rId))}</div>
            ${postoInfo ? `<div class="staff-sub">${esc(postoInfo)}</div>` : ''}
          </div>
          <span class="staff-cargo-pill">${esc((r.cargo||'ORI').slice(0,3).toUpperCase())}</span>
          <span class="staff-dot ${r.status}"></span>
        </div>`;
      };

      const dispFilt = filtrar(disponiveis);
      const escFilt  = filtrar(escalados);
      const ausFilt  = filtrar(ausentes);

      lista.innerHTML = `
        ${dispFilt.length ? `<div class="staff-group-label">
          Disponíveis <span>${dispFilt.length}</span>
        </div>${dispFilt.map(e => rowHTML(e)).join('')}` : ''}
        ${escFilt.length ? `<div class="staff-group-label" style="border-top:1px solid var(--border);margin-top:4px;padding-top:6px">
          Em posto <span>${escFilt.length}</span>
        </div>${escFilt.map(e => rowHTML(e, true)).join('')}` : ''}
        ${ausFilt.length ? `<details style="margin-top:4px">
          <summary style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--danger);padding:6px 16px;cursor:pointer">
            Ausentes (${ausFilt.length})
          </summary>
          ${ausFilt.map(e => rowHTML(e, true)).join('')}
        </details>` : ''}
        ${!dispFilt.length && !escFilt.length && !ausFilt.length
          ? `<div style="padding:16px;font-size:11px;color:var(--text-muted);text-align:center">
               Nenhum recurso cadastrado
             </div>` : ''}`;
    },

    // ── DRAG & DROP — painel direito → QRU card ──────────────
    dragStartStaff(event, rId) {
      // setData é obrigatório para Safari — sem ele o drag não funciona
      event.dataTransfer.setData('text/plain', rId);
      event.dataTransfer.effectAllowed = 'copy';
      // Feedback visual no elemento arrastado
      setTimeout(() => event.target.closest('.staff-row')?.classList.add('dragging'), 0);
    },

    dragEndStaff(event) {
      event.target.closest('.staff-row')?.classList.remove('dragging');
      // Limpar qualquer drag-over que tenha ficado
      document.querySelectorAll('.qru-card.drag-over')
        .forEach(el => el.classList.remove('drag-over'));
    },

    dragOverQru(event, postoId) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      document.getElementById(`qru-${postoId}`)?.classList.add('drag-over');
    },

    dragLeaveQru(event, postoId) {
      // Só remove se o leave for para fora do card (não para um filho)
      const card = document.getElementById(`qru-${postoId}`);
      if (card && !card.contains(event.relatedTarget)) {
        card.classList.remove('drag-over');
      }
    },

    dropOnQru(event, postoId) {
      event.preventDefault();
      const rId = event.dataTransfer.getData('text/plain');
      document.getElementById(`qru-${postoId}`)?.classList.remove('drag-over');
      if (!rId) return;
      // Verificar se já está designado neste posto
      if (S.postos[postoId]?.orientadores?.[rId]) {
        toast(`${S.recursos[rId]?.nome||'Pessoa'} já está neste posto`, 'warning');
        return;
      }
      NIT_PLANOP.Actions.addOrientador(postoId, rId);
    },

    filtrarStaff(val) {
      S._buscaStaff = val;
      UI.renderRightPanel();
    },

    // ── NOVA OPERAÇÃO (sidebar inline)
    toggleNovaOp() {
      const form = $('nova-op-form');
      if (!form) return;
      const aberto = !form.classList.contains('hidden');
      form.classList.toggle('hidden', aberto);
      if (!aberto) {
        // Limpar campos
        [$('nop-bairro'), $('nop-nome')].forEach(el => { if(el) el.value=''; });
        const hidden = $('nop-tipo'); if (hidden) hidden.value = '';
        const tipoInp = $('nop-tipo-input'); if (tipoInp) tipoInp.value = '';
        const hor = $('nop-horario'); if(hor) hor.value='';
        const nome = $('nop-nome'); if(nome) nome._editado = false;
        // Inicializar combos (bairro + tipo de missão) — padrão unificado
        UI._initBairroCombo();
        UI.popularSelectTipos();
        setTimeout(() => $('nop-bairro')?.focus(), 100);
      }
    },

    fecharNovaOp() {
      $('nova-op-form')?.classList.add('hidden');
    },

    // Autocomplete de bairro no formulário inline
    // ── FOTOS (placeholders conectados ao input de arquivo)
    addFotoRef(postoId) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
          S.db.ref(`efetivo/postos/${postoId}/fotoReferencia`).set(ev.target.result);
          toast('Foto de referência adicionada!', 'success');
        };
        reader.readAsDataURL(f);
      };
      inp.click();
    },

    addFotoRegistro(postoId) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const ts = getHoraAtual();
          S.db.ref(`efetivo/postos/${postoId}/fotosRegistro`).push({
            data: ev.target.result, timestamp: ts
          });
          toast('Registro fotográfico adicionado!', 'success');
        };
        reader.readAsDataURL(f);
      };
      inp.click();
    },

    // ── ABRIR TURNO (simplificado — modal futuro)
    abrirTurno() {
      const min = getMinAtual();
      let turnoAuto = 'manha';
      for (const [k,t] of Object.entries(CFG.TURNOS)) {
        if (min >= t.minI && min <= t.minF) { turnoAuto = k; break; }
      }
      const cfg = CFG.TURNOS[turnoAuto];
      if (!S.escalaAtiva) {
        DB.criarEscala({
          turno: turnoAuto, data: getDataHoje(),
          horarioInicio: cfg.inicio, horarioFim: cfg.fim,
          label: cfg.label
        }).then(() => toast(`Turno ${cfg.label} aberto!`, 'success'));
      }
    },

    abrirAddMembro() {
      if (!S.escalaAtiva) { toast('Abra um turno primeiro', 'warning'); return; }

      // Remover form anterior se existir
      document.getElementById('add-membro-form')?.remove();

      const supervisaoLista = $('supervisao-lista');
      if (!supervisaoLista) return;

      const formHTML = `
        <div id="add-membro-form" style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          <div class="combo-wrap">
            <input id="membro-nome-input" type="text" class="input-sm"
              placeholder="Nome do membro..." autocomplete="off">
            <div id="membro-nome-list" class="combo-drop"></div>
          </div>
          <select id="membro-cargo" class="select-sm">
            ${CFG.CARGOS_SUPERVISAO.map(c => `<option>${c}</option>`).join('')}
          </select>
          <input id="membro-contato" type="tel" class="input-sm"
            placeholder="Telefone (opcional)">
          <div style="display:flex;gap:6px;justify-content:flex-end">
            <button class="btn-ghost-sm"
              onclick="document.getElementById('add-membro-form')?.remove()">
              Cancelar
            </button>
            <button class="btn-accent-sm"
              onclick="NIT_PLANOP.Actions.confirmarAddMembro()">
              Adicionar
            </button>
          </div>
        </div>`;

      supervisaoLista.insertAdjacentHTML('afterend', formHTML);

      // Combo de recursos com teclado
      const items = Object.entries(S.recursos)
        .filter(([,r]) => r.status !== 'desligado')
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'))
        .map(([id, r]) => ({ value: id, label: `${r.nome} · ${r.cargo||'—'}` }));

      UI._combo('membro-nome-input', 'membro-nome-list', items, () => {});
      setTimeout(() => $('membro-nome-input')?.focus(), 60);
    },

    abrirPlanejar() {
      toast('Modo Planejar chegará na próxima entrega.', 'info');
    },

    // ── MODO CAMPO UI
    initCampoUI() {
      UI._campoClockTick = setInterval(() => {
        const el = $('campo-clock');
        if (el) el.textContent = getHoraAtual();
        UI._atualizarBadgeTurno();
      }, 5000);
      UI._atualizarBadgeTurno();
      $('campo-clock').textContent = getHoraAtual();

      // Restaurar última busca
      const ultimo = localStorage.getItem('planop_campo_ultimo');
      if (ultimo && ultimo.length >= 2) {
        const inp = $('campo-busca');
        if (inp) { inp.value = ultimo; Campo.onBusca(ultimo); }
      }
    },

    _atualizarBadgeTurno() {
      const el = $('campo-turno-badge');
      if (!el) return;
      if (S.escalaAtiva) {
        const e = S.escalas[S.escalaAtiva];
        el.textContent = `${turnoLabel(e)} · ${e.horarioInicio}–${e.horarioFim}`;
        el.style.cssText = 'color:var(--success);background:var(--success-dim);border:1px solid var(--success)';
      } else {
        el.textContent = 'FORA DE TURNO';
        el.style.cssText = 'color:var(--text-muted);background:var(--bg-surface)';
      }
    }
  };

  /* ── CAMPO ─────────────────────────────────────────────── */
  const Campo = {
    _timer: null,

    onBusca(val) {
      const clear = $('campo-clear');
      if (clear) clear.classList.toggle('hidden', !val);
      clearTimeout(Campo._timer);
      if (!val || val.length < 2) {
        $('campo-resultado').innerHTML = '';
        return;
      }
      Campo._timer = setTimeout(() => Campo.buscar(val), 350);
    },

    limpar() {
      const inp = $('campo-busca');
      if (inp) inp.value = '';
      $('campo-resultado').innerHTML = '';
      $('campo-clear')?.classList.add('hidden');
      localStorage.removeItem('planop_campo_ultimo');
      inp?.focus();
    },

    buscar(val) {
      const busca  = val.toLowerCase().trim();
      const matches = Object.entries(S.recursos).filter(([,r]) =>
        (r.nome||'').toLowerCase().includes(busca));

      const cont = $('campo-resultado');
      if (!matches.length) {
        cont.innerHTML = `<div class="campo-card" style="padding:16px;text-align:center;color:var(--text-muted)">
          Nenhum recurso encontrado para "${esc(val)}"
        </div>`;
        return;
      }

      if (matches.length === 1) {
        Campo.mostrarQTH(matches[0][0], matches[0][1]);
        return;
      }

      // Múltiplos resultados
      cont.innerHTML = `<div class="campo-card">
        ${matches.slice(0,5).map(([id,r]) =>
          `<div style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer"
            onclick="NIT_PLANOP.Campo.mostrarQTH('${id}',null)">
            <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${esc(r.nome)}</div>
            <div style="font-size:11px;color:var(--text-muted)">Mat: ${esc(r.matricula||'—')} · ${esc(r.cargo||'—')}</div>
          </div>`).join('')}
      </div>`;
    },

    mostrarQTH(recursoId, recurso) {
      const r = recurso || S.recursos[recursoId];
      if (!r) return;
      localStorage.setItem('planop_campo_ultimo', r.nome||'');

      const escala = S.escalaAtiva ? S.escalas[S.escalaAtiva] : null;
      const postosDoTurno = S.escalaAtiva
        ? Object.entries(S.postos).filter(([,p]) => p.escalaId === S.escalaAtiva)
        : [];

      // Postos diretos
      const postosDiretos = postosDoTurno
        .filter(([,p]) => p.orientadores?.[recursoId])
        .sort(([,a],[,b]) => (a.numero||0)-(b.numero||0));

      // Via viatura/equipe
      let postosViatura = [];
      if (!postosDiretos.length) {
        const viat = Object.entries(S.viaturas).find(([,v]) =>
          v.liderId===recursoId || Object.keys(v.membrosIds||{}).includes(recursoId));
        if (viat) {
          postosViatura = postosDoTurno
            .filter(([,p]) => p.alocacao?.id === viat[0])
            .sort(([,a],[,b]) => (a.numero||0)-(b.numero||0));
        }
      }

      const todos = [...postosDiretos, ...postosViatura];

      // Supervisor do turno para contato
      let supInfo = null;
      if (escala?.supervisao) {
        const sups = Object.values(escala.supervisao).filter(m => m.cargo==='SUPERVISOR' && m.contato);
        if (sups.length) supInfo = sups[0];
      }

      const cont = $('campo-resultado');
      let corpo = '';

      if (!todos.length) {
        corpo = `<div style="padding:20px;text-align:center">
          <div style="font-size:14px;color:var(--text-muted)">Nenhum QRU designado ainda.</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:8px">
            Aguarde a designação pelo supervisor.
          </div>
        </div>`;
      } else {
        corpo = todos.map(([,p]) => {
          const op  = S.operacoes[p.operacaoId] || {};
          const url = `https://maps.google.com/maps?q=${encodeURIComponent((p.local||'')+', Fortaleza, CE')}`;
          return `<div class="campo-qth-destaque">
            <div class="campo-zona-onde">
              <div class="campo-zona-onde-label">QTH · ONDE</div>
              <div class="campo-qth-valor">${esc(titleCase(p.local||'—'))}</div>
              <div class="campo-qth-bairro">${esc(titleCase(p.bairro||op.bairro||''))}</div>
              <a href="${url}" target="_blank" rel="noopener" class="btn-maps">
                📍 Abrir no Maps
              </a>
            </div>
            <div class="campo-zona-oque">
              <div class="campo-qtu-num">QRU Nº ${p.numero||'?'} · O QUÊ</div>
              <div class="campo-acao-badge">${esc(titleCase(p.tipoAcao||'Controle'))}</div>
              ${op.nome ? `<div class="campo-op-nome">${esc(titleCase(op.nome))}${op.horario?` · ${op.horario}h`:''}</div>` : ''}
            </div>
          </div>`;
        }).join('');
      }

      cont.innerHTML = `<div class="campo-card">
        <div class="campo-recurso-header">
          <div class="campo-nome">${esc(titleCase(r.nome))}</div>
          <div class="campo-mat">Mat: ${esc(r.matricula||'—')} · ${esc(r.cargo||'—')}</div>
        </div>
        ${corpo}
        ${supInfo ? `<div class="campo-supervisor">
          <span>Supervisor: ${esc(titleCase(supInfo.nome||''))}</span>
          <a href="tel:${esc(supInfo.contato)}" class="campo-tel">📞 ${esc(supInfo.contato)}</a>
        </div>` : ''}
        ${escala ? `<div class="campo-turno-info">
          TURNO ${esc(turnoLabel(escala))} · ${esc(escala.horarioInicio)}–${esc(escala.horarioFim)}
        </div>` : ''}
      </div>`;
    }
  };

  /* ── ACTIONS ───────────────────────────────────────────── */
  const Actions = {
    async addOrientador(postoId, recursoId) {
      // Fechar dropdown
      const drop = document.getElementById(`drop-${postoId}`);
      if (drop) drop.classList.remove('open');
      S._dropAberto = null;

      await DB.adicionarOrientadorAoPosto(postoId, recursoId);
      vibrar(40);
      toast(`${S.recursos[recursoId]?.nome||'Orientador'} designado!`, 'success');
    },

    async removerOrientador(postoId, recursoId) {
      await DB.removerOrientadorDoPosto(postoId, recursoId);
      vibrar(40);
    },

    async criarPosto(opId) {
      const local = $('pf-local')?.value.trim();
      if (!local) { toast('Endereço é obrigatório — sem isso ninguém sabe onde ir.', 'warning'); $('pf-local')?.focus(); return; }

      const bairro   = $('pf-bairro-input')?.value.trim() || '';
      const obs      = $('pf-obs')?.value.trim() || '';
      const oriInput = $('pf-orientador-input');
      const oriValue = oriInput?.dataset.selectedValue || '';
      const op       = S.operacoes[opId] || {};

      let alocacao = null;
      if (oriValue) {
        if (oriValue.startsWith('v:')) {
          const id = oriValue.slice(2);
          alocacao = { tipo:'equipe', id, nome: S.viaturas[id]?.nome||id };
        } else {
          const id = oriValue.slice(2);
          alocacao = { tipo:'agente', id, nome: S.recursos[id]?.nome||id };
        }
      }

      // DB.adicionarPosto retorna o ref.key do novo posto — único e correto.
      // Não usar Object.keys(S.postos).pop() que é não-determinístico.
      const postoId = await DB.adicionarPosto({
        operacaoId: opId,
        local:    upper(local),
        bairro:   upper(bairro) || op.bairro || '',
        horario:  op.horario || '',
        tipoAcao: 'CONTROLE',
        alocacao,
        obs:      upper(obs),
        qruPessoas: 1
      });

      // Designar orientador se foi selecionado — usando o ID correto do posto
      if (postoId && alocacao?.id) {
        if (alocacao.tipo === 'agente') {
          await DB.adicionarOrientadorAoPosto(postoId, alocacao.id);
        } else {
          // Equipe: marcar a viatura como escalada no Firebase
          await S.db.ref(`efetivo/viaturas/${alocacao.id}/status`).set('escalada');
        }
      }

      UI.fecharAddPosto(opId);
      vibrar(40);
      toast(alocacao ? 'Posto adicionado!' : 'Posto adicionado — designar orientador depois.', 'success');
    },

    async criarOperacao() {
      const bairro = $('nop-bairro')?.value?.trim();
      // Tipo lido do hidden input (preenchido pelo combo)
      const tipo   = $('nop-tipo')?.value;
      const hor    = $('nop-horario')?.value;
      const nome   = $('nop-nome')?.value?.trim() ||
        (tipo && bairro ? `${tipo} — ${bairro}` : tipo||bairro||'OPERAÇÃO');

      if (!bairro) { toast('Bairro é obrigatório','warning'); return; }
      if (!tipo)   { toast('Selecione o tipo de missão','warning'); return; }
      if (!S.escalaAtiva) { toast('Abra um turno primeiro','warning'); return; }

      await DB.adicionarOperacao({
        nome: upper(nome), bairro: upper(bairro),
        horario: hor||'', tipoMissao: tipo
      });
      UI.fecharNovaOp();
      toast('Operação criada!', 'success');
    },

    async confirmarAddMembro() {
      const nomInp  = $('membro-nome-input');
      const recursoId = nomInp?.dataset.selectedValue || '';
      const cargo   = $('membro-cargo')?.value;
      const contato = $('membro-contato')?.value.trim() || '';

      if (!recursoId) {
        toast('Selecione um membro da lista', 'warning');
        $('membro-nome-input')?.focus();
        return;
      }

      const r = S.recursos[recursoId] || {};
      await S.db.ref(
        `efetivo/escalas/${S.escalaAtiva}/supervisao/${recursoId}`
      ).set({ nome: r.nome||recursoId, cargo, contato, fixo: false });

      document.getElementById('add-membro-form')?.remove();
      toast(`${r.nome||recursoId} adicionado à supervisão`, 'success');
    },

    async encerrarTurno() {
      if (!confirm('Encerrar o turno?\n\nOs recursos escalados voltarão para DISPONÍVEL.')) return;
      vibrar([60,40,60]);
      await DB.encerrarEscala(S.escalaAtiva, '');
      S.operacaoSel = null;
      toast('Turno encerrado.', 'info');
    },

    async removerMembro(membroId) {
      if (!S.escalaAtiva) return;
      await S.db.ref(`efetivo/escalas/${S.escalaAtiva}/supervisao/${membroId}`).remove();
    },

    async salvarSupervisaoPadrao() {
      const escala = S.escalas[S.escalaAtiva];
      if (!escala) return;
      await DB.salvarSupervisaoPadrao(escala.turno);
      toast(`Padrão ${turnoLabel(escala)} salvo!`, 'success');
    },

    async salvarObs(postoId, val) {
      await S.db.ref(`efetivo/postos/${postoId}/obs`).set(val.trim());
    }
  };

  /* ── PERMISSÕES ────────────────────────────────────────── */
  const canWrite  = () => ['monitor','supervisor','admin'].includes(S.role);
  const canManage = () => ['supervisor','admin'].includes(S.role);
  const canAdmin  = () => S.role === 'admin';

  /* ── FECHAR DROPDOWN AO CLICAR FORA ─────────────────────── */
  document.addEventListener('click', () => {
    if (S._dropAberto) {
      const drop = document.getElementById(S._dropAberto);
      if (drop) drop.classList.remove('open');
      S._dropAberto = null;
    }
    $('nop-bairro-list')?.classList.remove('open');
  });

  /* ── INICIALIZAÇÃO ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => Auth.init());

  /* ── API PÚBLICA ────────────────────────────────────────── */
  return { Auth, UI, Campo, Actions, DB };

})();
