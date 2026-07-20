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

    CARGO_ABBR: {
      'SUPERVISOR':   'SUP',
      'AUXILIAR':     'AUX',
      'MOTOCICLISTA': 'MOT',
      'MONITOR':      'MON',
      'ORIENTADOR':   'ORI'
    },

    // Motivos de indisponibilidade — exibidos no painel direito
    // e gravados em /efetivo/recursos/{id}/motivoIndisponivel
    MOTIVOS: [
      { value: 'ferias',      label: 'Férias' },
      { value: 'falta',       label: 'Falta' },
      { value: 'licenca',     label: 'Licença médica' },
      { value: 'outro_turno', label: 'Em outro turno' },
      { value: 'outro',       label: 'Outro motivo' }
    ]
  };

  /* ── ESTADO GLOBAL ─────────────────────────────────────── */
  const S = {
    db: null, user: null, role: null,
    modo: null, escalaAtiva: null, operacaoSel: null,
    escalas: {}, operacoes: {}, postos: {}, recursos: {}, viaturas: {}, templates: {},
    supervisaoDoTurno: [],
    _unsubs: [],        // listeners globais — limpos no logout
    _escalaUnsubs: [],  // listeners de operações/postos — limpos a cada troca de turno
    _suppressRender: false,  // bloqueia renderMainContent do listener durante update otimista
    _dropAberto: null,
    _buscaEquipes: '',
    _buscaStaff: '',
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
  // Auto-grow para textareas de observação
  const _autoGrow = el => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };
  const _bindAutoGrow = selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('input', () => _autoGrow(el));
      _autoGrow(el); // ajustar ao abrir se já tem conteúdo
    });
  };

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
  // Versão maior para o top bar (28x28)
  const opIconLg = tipo => (CFG.OP_ICONS[tipo] || CFG.OP_ICONS.default)
    .replace(/width="15"/g, 'width="28"').replace(/height="15"/g, 'height="28"');

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
        const key  = user.email.replace(/\./g,'_').replace(/@/g,'_at_');
        // Tenta /efetivo_roles/{key}/role (string direta)
        // Se não existir, tenta /efetivo_roles/{key} (objeto { role: "..." })
        const snapRole = await firebase.database()
          .ref(`efetivo_roles/${key}/role`).once('value');
        if (snapRole.exists()) {
          S.role = snapRole.val();
          return;
        }
        const snapObj = await firebase.database()
          .ref(`efetivo_roles/${key}`).once('value');
        if (snapObj.exists()) {
          const val = snapObj.val();
          S.role = typeof val === 'string' ? val : (val?.role || 'campo');
          return;
        }
        S.role = 'campo';
      } catch (e) {
        console.error('[Auth._resolveRole]', e);
        S.role = 'campo';
      }
    },

    login() {
      const prov = new firebase.auth.GoogleAuthProvider();
      // signInWithRedirect evita o erro COOP que bloqueia window.closed
      // na abordagem de popup. O usuário é redirecionado para o Google
      // e retorna ao app após autenticação — sem janela popup.
      firebase.auth().signInWithRedirect(prov).catch(e => {
        console.error('[Auth.login]', e);
        toast('Erro ao entrar. Tente novamente.', 'danger');
      });
    },

    logout() {
      S._unsubs.forEach(fn => fn());      S._unsubs = [];
      S._escalaUnsubs.forEach(fn => fn()); S._escalaUnsubs = [];
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

        if (S.escalaAtiva && S.escalaAtiva !== escalaAnterior) {
          escalaAnterior = S.escalaAtiva;
          S.operacoes    = {};
          S.postos       = {};
          // Fix 1: cancelar listeners anteriores de operações/postos
          // antes de criar novos — evita acúmulo a cada troca de turno
          S._escalaUnsubs.forEach(fn => fn());
          S._escalaUnsubs = [];
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
      if (!S.escalaAtiva) return;
      const ref = S.db.ref('efetivo/operacoes')
        .orderByChild('escalaId').equalTo(S.escalaAtiva);
      const fn  = ref.on('value', snap => {
        // Reconstrói do snap — deleções no Firebase refletem no estado local.
        // (Object.assign aditivo mantinha itens deletados para sempre.)
        S.operacoes = snap.val() || {};
        UI.renderOpsList();
        if (!S._suppressRender) UI.renderMainContent();
      });
      S._escalaUnsubs.push(() => ref.off('value', fn));
    },

    _listenPostos() {
      if (!S.escalaAtiva) return;
      const ref = S.db.ref('efetivo/postos')
        .orderByChild('escalaId').equalTo(S.escalaAtiva);
      const fn  = ref.on('value', snap => {
        const novos = snap.val() || {};
        // Reconstrói do snap (deleções refletem), preservando apenas
        // as fotos já carregadas em memória para não re-baixar base64.
        const fotosCache = {};
        Object.entries(S.postos).forEach(([id, p]) => {
          if (p.fotoReferencia || p.fotosRegistro) {
            fotosCache[id] = {
              fotoReferencia: p.fotoReferencia,
              fotosRegistro:  p.fotosRegistro
            };
          }
        });
        S.postos = {};
        Object.entries(novos).forEach(([id, p]) => {
          S.postos[id] = { ...p };
          if (fotosCache[id]) {
            if (!S.postos[id].fotoReferencia && fotosCache[id].fotoReferencia)
              S.postos[id].fotoReferencia = fotosCache[id].fotoReferencia;
            if (!S.postos[id].fotosRegistro && fotosCache[id].fotosRegistro)
              S.postos[id].fotosRegistro = fotosCache[id].fotosRegistro;
          }
        });
        UI.renderOpsList();
        if (!S._suppressRender) {
          UI.renderMainContent();
          UI.renderRightPanel();
        }
      });
      S._escalaUnsubs.push(() => ref.off('value', fn));
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
      // Tenta Firebase, fallback para localStorage (caso /efetivo/config/ sem permissão)
      let padrao = null;
      try {
        padrao = await S.db.ref(`efetivo/supervisao_config/padrao_${dados.turno}`).once('value');
      } catch {
        const local = localStorage.getItem(`sup_padrao_${dados.turno}`);
        padrao = { exists: () => !!local, val: () => local ? JSON.parse(local) : null };
      }
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
      // Fix 7: batch update — um único write para liberar todos os recursos
      // em vez de N writes em loop (um por recurso escalado)
      const escalados = Object.entries(S.recursos).filter(([,r]) => r.status==='escalado');
      if (escalados.length) {
        const updates = {};
        escalados.forEach(([id]) => { updates[`${id}/status`] = 'disponivel'; });
        await S.db.ref('efetivo/recursos').update(updates);
      }
      if (nota) {
        await S.db.ref(`efetivo/escalas/${escalaId}/bastao`).set({
          nota, autor: S.user?.displayName || S.user?.email, ts: Date.now()
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
      if (S.postos[postoId]) {
        if (!S.postos[postoId].orientadores) S.postos[postoId].orientadores = {};
        S.postos[postoId].orientadores[recursoId] = ori;
      }
      if (S.recursos[recursoId]) S.recursos[recursoId].status = 'escalado';
      // Suprimir re-render do listener por 600ms — preserva o dropdown aberto
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 600);
      UI._patchQruCard(postoId);
      UI.renderOpsList();
      UI.renderRightPanel();
    },

    async removerOrientadorDoPosto(postoId, recursoId) {
      await S.db.ref(`efetivo/postos/${postoId}/orientadores/${recursoId}`).remove();
      const emOutroPosto = Object.entries(S.postos).some(([pid, p]) =>
        pid !== postoId && p.orientadores?.[recursoId]);
      if (!emOutroPosto) {
        await S.db.ref(`efetivo/recursos/${recursoId}/status`).set('disponivel');
      }
      if (S.postos[postoId]?.orientadores) {
        delete S.postos[postoId].orientadores[recursoId];
      }
      if (!emOutroPosto && S.recursos[recursoId]) {
        S.recursos[recursoId].status = 'disponivel';
      }
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 600);
      UI._patchQruCard(postoId);
      UI.renderOpsList();
      UI.renderRightPanel();
    },

    async salvarSupervisaoPadrao(turno) {
      const sup = S.escalas[S.escalaAtiva]?.supervisao || {};
      // Não salvar os fixos no padrão (eles são sempre injetados)
      const semFixos = Object.fromEntries(
        Object.entries(sup).filter(([,v]) => !v.fixo)
      );
      // Grava em /efetivo/supervisao_config/ (precisa de regra no Firebase)
      // Fallback: localStorage para não perder a funcionalidade se regra não existir
      try {
        await S.db.ref(`efetivo/supervisao_config/padrao_${turno}`).set(semFixos);
      } catch {
        localStorage.setItem(`sup_padrao_${turno}`, JSON.stringify(semFixos));
      }
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
      // Relógios removidos da UI — clock tick não necessário
      if (UI._clockTick) clearInterval(UI._clockTick);
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
      let inp  = $(inputId);
      const list = $(listId);
      if (!inp || !list) return;

      // Previne listeners duplicados: clona o input (a clonagem descarta
      // todos os listeners antigos) e substitui no DOM antes de re-inicializar.
      // Sem isso, cada re-init (ex: abrir/fechar o form) acumula listeners.
      const clone = inp.cloneNode(true);
      inp.parentNode.replaceChild(clone, inp);
      inp = clone;

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
      document.querySelectorAll('.posto-form-inline').forEach(el => el.remove());

      const op     = S.operacoes[opId] || {};
      const formId = `posto-form-${opId}`;

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
          <textarea id="pf-obs" class="input-sm textarea-obs"
            placeholder="Ex: ciclofaixa, pista dupla, semáforo próximo..."
            rows="2"></textarea>

          <label class="form-label">Orientadores
            <span class="badge badge-warn-sm">⚠ opcional</span>
          </label>
          <div id="pf-ori-chips" class="pf-ori-chips"></div>
          <div class="combo-wrap">
            <input id="pf-orientador-input" type="text" class="input-sm"
              placeholder="Buscar e adicionar orientador..."
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

      // Ativar auto-grow nas textareas do form
      _bindAutoGrow('#cadastrar-pessoa-form .textarea-obs, .posto-form-inline .textarea-obs');

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

      // Armazena lista de orientadores selecionados no form
      window._pfOriSelecionados = {};

      const _renderPfChips = () => {
        const chipsDiv = $('pf-ori-chips');
        if (!chipsDiv) return;
        chipsDiv.innerHTML = Object.entries(window._pfOriSelecionados)
          .map(([id, nome]) => `
            <div class="pf-ori-chip">
              <div class="chip-avatar" style="background:${avatarColor(nome)}">${avatarInitials(nome)}</div>
              <span>${esc(titleCase(nome))}</span>
              <button onclick="delete window._pfOriSelecionados['${id}'];NIT_PLANOP.UI._renderPfChips()" class="orientador-chip-remove">×</button>
            </div>`).join('');
      };
      UI._renderPfChips = _renderPfChips;

      UI._combo('pf-orientador-input', 'pf-orientador-list',
        [...staffItems, ...equipeItems],
        (value, label) => {
          const nome = label.replace('👥 ','');
          window._pfOriSelecionados[value] = nome;
          const inp = $('pf-orientador-input');
          if (inp) { inp.value = ''; inp.dataset.selectedValue = ''; }
          _renderPfChips();
        }
      );

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
      nome.value = tipo || bairro || '';
    },

    // ── SHIFT BAR
    renderShiftBar() {
      if (!S.escalaAtiva) {
        show('shift-idle'); hide('shift-active');
        return;
      }
      const e = S.escalas[S.escalaAtiva];
      hide('shift-idle'); show('shift-active');
      const lbl = $('shift-label-text');
      if (lbl) {
        lbl.textContent = `${turnoLabel(e)} · ${e.horarioInicio}–${e.horarioFim}`;
        if (canManage()) {
          lbl.style.cursor = 'pointer';
          lbl.title = 'Clique para editar horários do turno';
          lbl.onclick = () => UI.abrirEditarTurno();
        }
      }
    },

    abrirEditarTurno() {
      document.getElementById('editar-turno-form')?.remove();
      const e = S.escalas[S.escalaAtiva];
      if (!e) return;

      const formHTML = `
        <div id="editar-turno-form" class="encerrar-overlay"
          onclick="if(event.target===this)this.remove()">
          <div class="encerrar-dialog" onclick="event.stopPropagation()" style="min-width:280px">
            <div class="posto-form-header">Editar horários do turno</div>
            <label class="form-label">Início</label>
            <input id="et-inicio" type="time" class="input-sm" value="${esc(e.horarioInicio||'')}">
            <label class="form-label">Fim</label>
            <input id="et-fim" type="time" class="input-sm" value="${esc(e.horarioFim||'')}">
            <div class="encerrar-confirm-btns" style="margin-top:12px">
              <button class="btn-ghost-sm"
                onclick="document.getElementById('editar-turno-form')?.remove()">Cancelar</button>
              <button class="btn-accent-sm"
                onclick="NIT_PLANOP.Actions.salvarHorarioTurno()">Salvar</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', formHTML);
      setTimeout(() => $('et-inicio')?.focus(), 60);
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

      const CARGO_ORDER = { SUPERVISOR:0, AUXILIAR:1, MOTOCICLISTA:2, MONITOR:3, ORIENTADOR:4 };

      const todos = [
        ...CFG.SUPERVISORES_FIXOS,
        ...S.supervisaoDoTurno.filter(m => !m.fixo)
      ].sort((a,b) =>
        (CARGO_ORDER[a.cargo?.toUpperCase()]??99) - (CARGO_ORDER[b.cargo?.toUpperCase()]??99)
      );

      if (count) count.textContent = `${todos.length} pessoa${todos.length!==1?'s':''}`;

      lista.innerHTML = todos.map(m => {
        const fixoIcon  = m.fixo
          ? `<span class="supervisao-fixo-icon" title="Supervisor fixo · presente em todos os turnos">📌</span>`
          : '';
        const removeBtn = !m.fixo && canWrite()
          ? `<button class="supervisao-remove-btn"
               onclick="NIT_PLANOP.Actions.removerMembro('${esc(m.id)}')"
               title="Remover">×</button>` : '';
        const cargoClass = m.cargo?.toUpperCase() === 'SUPERVISOR' ? 'cargo-sup' : '';
        return `<div class="supervisao-membro">
          <span class="supervisao-dot"></span>
          <span class="supervisao-nome">${esc(titleCase(m.nome))}${fixoIcon}</span>
          <span class="supervisao-cargo-badge ${cargoClass}">${esc(m.cargo||'—')}</span>
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
        const sub      = [titleCase(op.bairro||''), nPostos + (nPostos === 1 ? ' posto' : ' postos')]
          .filter(Boolean).join(' · ');
        return `<div class="ops-item ${ativo}" onclick="NIT_PLANOP.UI.selOp('${id}')">
          <div class="ops-item-icon">${icon}</div>
          <div class="ops-item-body">
            <div class="ops-item-name">${esc(titleCase(op.bairro||op.nome||'—'))}</div>
            <div class="ops-item-sub">${esc([titleCase(op.tipoMissao||''), nPostos+' posto'+(nPostos!==1?'s':'')].filter(Boolean).join(' · '))}</div>
          </div>
          <span class="ops-status-dot ${dot}"></span>
          ${canWrite() ? `
          <div class="ops-item-menu-wrap" onclick="event.stopPropagation()">
            <button class="btn-ops-menu" onclick="NIT_PLANOP.UI.toggleOpsMenu('${id}',event)"
              aria-label="Opções da operação">···</button>
            <div class="ops-ctx-menu hidden" id="ops-menu-${id}">
              <button onclick="NIT_PLANOP.UI.abrirEditOp('${id}')">✏ Editar</button>
              <button class="danger" onclick="NIT_PLANOP.Actions.deletarOp('${id}')">🗑 Deletar</button>
            </div>
          </div>` : ''}
        </div>`;
      }).join('');
    },

    selOp(opId) {
      S.operacaoSel = opId;
      // Limpar filtro de QRUs ao trocar de operação
      const qruSearch = document.querySelector('.qru-search');
      if (qruSearch) qruSearch.value = '';
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

      cont.innerHTML = `
        <!-- Top bar -->
        <div class="op-topbar">
          <div class="op-topbar-icon">${opIconLg(op.tipoMissao)}</div>
          <div class="op-topbar-info">
            <div class="op-topbar-name">
              ${esc(titleCase(op.bairro||op.nome||'—'))}
              <span class="badge-ativo">ATIVO</span>
            </div>
            <div class="op-topbar-sub">
              ${[titleCase(op.tipoMissao||''), op.horario ? `Início ${op.horario}h` : ''].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div class="op-topbar-right">
            <div class="modo-btns">
              <button class="modo-btn modo-btn-active">
                ▶ EXECUTAR
              </button>
              <button class="modo-btn modo-btn-disabled"
                title="Em desenvolvimento — disponível na próxima versão"
                aria-disabled="true">
                📅 PLANEJAR
              </button>
            </div>
            <span class="topbar-date">Hoje</span>
          </div>
        </div>


        <!-- QRUs -->
        <div class="qru-section-header">
          <span class="qru-section-label">Postos / QRUs</span>
          <input class="qru-search" placeholder="Filtrar postos..."
            oninput="NIT_PLANOP.UI.filtrarQrus(this.value)">
          <button class="btn-expandir" id="btn-expandir-todos"
            onclick="NIT_PLANOP.UI.toggleExpandirTodos()">
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
        const cargo = (CFG.CARGO_ABBR[ori.cargo?.toUpperCase()] || ori.cargo?.slice(0,3)?.toUpperCase() || 'ORI');
        const cor   = avatarColor(nome);
        const ini   = avatarInitials(nome);
        return `<div class="orientador-chip ${ori.faltou?'chip-falta':''}">
          <div class="chip-avatar" style="background:${cor}">${ini}</div>
          <span class="chip-nome">${esc(nomeDisplay)}</span>
          <span class="chip-cargo">${esc(cargo)}</span>
          ${canWrite() ? `
            <button class="chip-falta-btn${ori.faltou?' ativo':''}"
              onclick="NIT_PLANOP.Actions.toggleFalta('${postoId}','${rId}')"
              title="${ori.faltou?'Cancelar falta':'Registrar falta'}">⚠</button>
            <button class="orientador-chip-remove"
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

      // Fix 4: card começa expandido se já tem orientadores designados —
      // o supervisor precisa ver quem está no posto sem ter que clicar
      const expanded = orientadores.length > 0 ? 'expanded' : '';
      return `<div class="qru-card status-${status} ${expanded}" id="qru-${postoId}"
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
          <button class="btn-qru-menu" onclick="NIT_PLANOP.UI.togglePostoMenu('${postoId}',event)"
            aria-label="Mais opções">···</button>
          <div class="ops-ctx-menu hidden" id="posto-menu-${postoId}">
            <button onclick="NIT_PLANOP.UI.abrirEditPosto('${postoId}')">✏ Editar posto</button>
            <button class="danger" onclick="NIT_PLANOP.Actions.deletarPosto('${postoId}')">🗑 Remover posto</button>
          </div>
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
              <textarea class="detalhes-obs-input textarea-obs" rows="2"
                placeholder="Adicionar observação..."
                onblur="NIT_PLANOP.Actions.salvarObs('${postoId}',this.value)">${esc(posto.obs||'')}</textarea>
            </div>
            ${UI._fotosHTML(postoId, posto)}
          </div>
        </div>
      </div>`;
    },

    _fotosHTML(postoId, posto) {
      const fRef = posto.fotoReferencia;
      const regs = posto.fotosRegistro || {};
      const regsArr = Object.entries(regs).slice(0,6);

      return `<div class="fotos-section">
        <div class="fotos-label">Fotos do posto</div>
        <div class="fotos-grid">
          <div class="foto-ref-wrap">
            ${fRef
              ? `<div class="foto-ref-container">
                  <img class="foto-ref" src="${fRef}" alt="Foto de referência"
                    onclick="NIT_PLANOP.UI._fotoZoom(this)"
                    title="Clique para ampliar">
                  ${canWrite() ? `
                  <div class="foto-ref-actions">
                    <button class="foto-action-btn"
                      onclick="NIT_PLANOP.UI.addFotoRef('${postoId}')"
                      title="Substituir foto">↺</button>
                    <button class="foto-action-btn danger"
                      onclick="NIT_PLANOP.Actions.removerFotoRef('${postoId}')"
                      title="Remover foto">×</button>
                  </div>` : ''}
                </div>`
              : `<div class="foto-placeholder"
                   onclick="NIT_PLANOP.UI.addFotoRef('${postoId}')"
                   onpaste="NIT_PLANOP.UI.colarFoto(event,'${postoId}','ref')"
                   ondragover="event.preventDefault();this.classList.add('drag-over')"
                   ondragleave="this.classList.remove('drag-over')"
                   ondrop="NIT_PLANOP.UI.soltarFoto(event,'${postoId}','ref');this.classList.remove('drag-over')"
                   tabindex="0"
                   title="Clique · Ctrl+V · ou arraste a imagem aqui">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>Foto de referência</span>
                  <span class="foto-hint">Clique · Ctrl+V · Arraste</span>
                </div>`}
            <div class="foto-label-sub">Referência</div>
          </div>
          <div class="fotos-registros">
            ${regsArr.map(([rid,r]) =>
              `<div class="foto-registro-wrap">
                <img class="foto-registro" src="${r.data}" alt="Registro"
                  onclick="NIT_PLANOP.UI._fotoZoom(this)"
                  title="Clique para ampliar">
                <span class="foto-ts">${r.timestamp||''}</span>
                ${canWrite() ? `<button class="foto-reg-del"
                  onclick="NIT_PLANOP.Actions.removerFotoRegistro('${postoId}','${rid}')"
                  title="Remover">×</button>` : ''}
              </div>`).join('')}
            ${canWrite() ? `
              <div class="btn-add-registro-wrap"
                ondragover="event.preventDefault();this.classList.add('drag-over')"
                ondragleave="this.classList.remove('drag-over')"
                ondrop="NIT_PLANOP.UI.soltarFoto(event,'${postoId}','registro');this.classList.remove('drag-over')">
                <button class="btn-add-registro"
                  onclick="NIT_PLANOP.UI.addFotoRegistro('${postoId}')"
                  title="Adicionar · Ctrl+V · Arraste">+</button>
              </div>` : ''}
          </div>
        </div>
      </div>`;
    },

    // Fix 3: lightbox para ampliar foto
    abrirFotoZoom(srcKey) {
      // srcKey é uma chave — precisamos encontrar a foto correta no DOM
      // Mais simples: passar a img clicada diretamente via event
    },

    // Drag & drop de imagem para a área de foto
    soltarFoto(event, postoId, tipo) {
      event.preventDefault();
      const file = [...(event.dataTransfer?.files||[])].find(f => f.type.startsWith('image/'));
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async ev => {
        const compressed = await UI._compressImage(ev.target.result, 900, 0.72);
        S._suppressRender = true;
        setTimeout(() => { S._suppressRender = false; }, 800);
        if (tipo === 'ref') {
          if (S.postos[postoId]) S.postos[postoId].fotoReferencia = compressed;
          await S.db.ref(`efetivo/postos/${postoId}/fotoReferencia`).set(compressed);
          UI._patchFotos(postoId);
          toast('Foto de referência adicionada!', 'success');
        } else {
          await S.db.ref(`efetivo/postos/${postoId}/fotosRegistro`).push({
            data: compressed, timestamp: getHoraAtual()
          });
          UI._patchFotos(postoId);
          toast('Registro adicionado!', 'success');
        }
      };
      reader.readAsDataURL(file);
    },

    // Lightbox: ampliar foto ao clicar
    _fotoZoom(imgEl) {
      document.getElementById('foto-zoom-overlay')?.remove();
      const src = imgEl?.src;
      if (!src) return;
      const ov = document.createElement('div');
      ov.id = 'foto-zoom-overlay';
      ov.className = 'foto-zoom-overlay';
      ov.innerHTML = `<img src="${src}" class="foto-zoom-img" onclick="event.stopPropagation()">`;
      ov.addEventListener('click', () => ov.remove());
      document.body.appendChild(ov);
    },

    // Fix 2: colar foto da área de transferência
    colarFoto(event, postoId, tipo) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (!item.type.startsWith('image/')) continue;
        event.preventDefault();
        const file   = item.getAsFile();
        const reader = new FileReader();
        reader.onload = async ev => {
          const compressed = await UI._compressImage(ev.target.result, 900, 0.72);
          S._suppressRender = true;
          setTimeout(() => { S._suppressRender = false; }, 800);
          if (tipo === 'ref') {
            if (S.postos[postoId]) S.postos[postoId].fotoReferencia = compressed;
            await S.db.ref(`efetivo/postos/${postoId}/fotoReferencia`).set(compressed);
            UI._patchFotos(postoId);
            toast('Foto de referência colada!', 'success');
          } else {
            await S.db.ref(`efetivo/postos/${postoId}/fotosRegistro`).push({
              data: compressed, timestamp: getHoraAtual()
            });
            UI._patchFotos(postoId);
            toast('Registro fotográfico colado!', 'success');
          }
        };
        reader.readAsDataURL(file);
        break;
      }
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

    toggleExpandirTodos() {
      const cards = document.querySelectorAll('.qru-card');
      const btn   = document.getElementById('btn-expandir-todos');
      const algumColapsado = [...cards].some(c => !c.classList.contains('expanded'));
      if (algumColapsado) {
        cards.forEach(c => c.classList.add('expanded'));
        if (btn) btn.textContent = 'Colapsar todos';
      } else {
        cards.forEach(c => c.classList.remove('expanded'));
        if (btn) btn.textContent = 'Expandir todos';
      }
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
      const lista  = $('staff-lista');
      const totais = $('efetivo-totais');
      if (!lista) return;

      const busca = S._buscaStaff.toLowerCase().trim();
      const todos = Object.entries(S.recursos)
        .filter(([,r]) => r.status !== 'desligado')
        .sort(([,a],[,b]) => (a.nome||'').localeCompare(b.nome||'','pt-BR'));

      // Índice invertido — fonte de verdade para quem está em posto.
      const postoByRecurso = {};
      Object.values(S.postos).forEach(p => {
        Object.keys(p.orientadores||{}).forEach(rId => {
          postoByRecurso[rId] = p;
        });
      });

      // ── Totais do efetivo ─────────────────────────────────
      const total = todos.length;
      const nDisp = todos.filter(([rId,r]) => !postoByRecurso[rId] && r.status === 'disponivel').length;
      const nEsc  = todos.filter(([rId,r]) => !!postoByRecurso[rId] || r.status === 'escalado').length;
      const nInd  = todos.filter(([,r]) =>
        r.status === 'indisponivel' || r.status === 'ausente').length;

      if (totais) {
        totais.innerHTML = `
          <div class="efetivo-total-grid">
            <div class="etotal-item">
              <span class="etotal-num">${total}</span>
              <span class="etotal-label">Total</span>
            </div>
            <div class="etotal-item success">
              <span class="etotal-num">${nDisp}</span>
              <span class="etotal-label">Disponíveis</span>
            </div>
            <div class="etotal-item accent">
              <span class="etotal-num">${nEsc}</span>
              <span class="etotal-label">Escalados</span>
            </div>
            <div class="etotal-item ${nInd > 0 ? 'warning' : ''}">
              <span class="etotal-num">${nInd}</span>
              <span class="etotal-label">Ausentes</span>
            </div>
          </div>`;
      }

      // Fix 1: se aparece em postoByRecurso → escalado (independente do status Firebase)
      const disponiveis   = todos.filter(([rId, r]) =>
        !postoByRecurso[rId] && r.status === 'disponivel');
      const escalados     = todos.filter(([rId, r]) =>
        !!postoByRecurso[rId] || r.status === 'escalado');
      const indisponiveis = todos.filter(([rId, r]) =>
        !postoByRecurso[rId] &&
        (r.status === 'indisponivel' || r.status === 'ausente'));
      const ausentes      = []; // fundido em indisponiveis acima

      // totais renderizados via efetivo-totais acima

      const filtrar = arr => busca
        ? arr.filter(([,r]) => (r.nome||'').toLowerCase().includes(busca))
        : arr;

      // Fix 4: índice já montado acima — remover motivoLabel legada


      const rowHTML = ([rId, r], opts = {}) => {
        const { canDrag = true, canClick = true } = opts;
        const posto    = postoByRecurso[rId];
        const cargo    = CFG.CARGO_ABBR[r.cargo?.toUpperCase()] || r.cargo?.slice(0,3)?.toUpperCase() || 'ORI';
        const motivo   = r.status === 'ausente' ? 'Ausente'
          : r.status === 'indisponivel'
            ? (CFG.MOTIVOS.find(m => m.value===r.motivoIndisponivel)?.label || 'Indisponível')
            : '';
        const subLine  = posto ? `${cargo} → [${posto.numero||'?'}]` : (motivo || cargo);
        const hasMotivo = !!motivo;
        return `<div class="staff-row ${r.status}"
          ${canDrag ? 'draggable="true"' : ''}
          ${canDrag ? `ondragstart="NIT_PLANOP.UI.dragStartStaff(event,'${rId}')"` : ''}
          ${canDrag ? `ondragend="NIT_PLANOP.UI.dragEndStaff(event)"` : ''}
          ${canWrite() && canClick ? `onclick="NIT_PLANOP.UI.abrirStatusPessoa(event,'${rId}')"` : ''}>
          ${canDrag ? `<span class="staff-drag-handle" aria-hidden="true" onclick="event.stopPropagation()">⠿</span>` : '<span class="staff-drag-placeholder"></span>'}
          <div class="staff-avatar" style="background:${avatarColor(r.nome)}" aria-hidden="true">
            ${avatarInitials(r.nome)}
          </div>
          <div class="staff-info">
            <div class="staff-nome">${esc(titleCase(r.nome||rId))}</div>
            <div class="staff-sub-line${hasMotivo?' has-motivo':''}">${esc(subLine)}</div>
          </div>
          <span class="staff-dot ${r.status}"></span>
        </div>`;
      };

      // Fix 5: apenas os 3 grupos necessários — indisponível + ausente fundidos
      const dispFilt   = filtrar(disponiveis);
      const escFilt    = filtrar(escalados);
      const indAusFilt = filtrar([...indisponiveis, ...ausentes]);

      lista.innerHTML = `
        ${dispFilt.length ? `
          <details open>
            <summary class="staff-group-label disponivel-label" style="list-style:none;cursor:pointer">
              Disponíveis <span>${dispFilt.length}</span>
            </summary>
            ${dispFilt.map(e => rowHTML(e, { canDrag:true, canClick:true })).join('')}
          </details>
        ` : ''}
        ${escFilt.length ? `
          <details open>
            <summary class="staff-group-label" style="list-style:none;cursor:pointer">
              Em posto <span>${escFilt.length}</span>
            </summary>
            ${escFilt.map(e => rowHTML(e, { canDrag:false, canClick:true })).join('')}
          </details>
        ` : ''}
        ${indAusFilt.length ? `
          <details>
            <summary class="staff-group-label warning-label" style="list-style:none;cursor:pointer">
              Ausentes/Indisponíveis <span>${indAusFilt.length}</span>
            </summary>
            ${indAusFilt.map(e => rowHTML(e, { canDrag:false, canClick:true })).join('')}
          </details>
        ` : ''}
        ${!dispFilt.length && !escFilt.length && !indAusFilt.length
          ? `<div style="padding:16px;font-size:11px;color:var(--text-muted);text-align:center">
              Nenhum recurso encontrado
             </div>` : ''}`;
    },

    toggleSettings(event) {
      event.stopPropagation();
      const menu = $('settings-menu');
      if (!menu) return;
      if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden'); menu.innerHTML = ''; return;
      }
      const turnoAtivo = !!S.escalaAtiva;
      menu.innerHTML = `
        ${turnoAtivo && canManage() ? `
        <div class="settings-section-label">Turno</div>
        <button class="settings-item settings-item-danger"
          onclick="NIT_PLANOP.Actions.encerrarTurno()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Encerrar turno
        </button>` : ''}
        <div class="settings-section-label">Conta</div>
        <button class="settings-item" onclick="NIT_PLANOP.Auth.logout()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sair
        </button>
      `;
      menu.classList.remove('hidden');
    },
    _fecharTodosMenus() {
      document.querySelectorAll('.ops-ctx-menu')
        .forEach(m => m.classList.add('hidden'));
    },

    toggleOpsMenu(opId, event) {
      event.stopPropagation();
      const menu = document.getElementById(`ops-menu-${opId}`);
      if (!menu) return;
      const estaAberto = !menu.classList.contains('hidden');
      UI._fecharTodosMenus();
      if (!estaAberto) {
        menu.classList.remove('hidden');
        // Position fixed — escapa do overflow-y:auto da lista
        const btn = event.currentTarget;
        const r   = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top      = `${r.bottom + 4}px`;
        menu.style.left     = `${Math.max(8, r.right - 160)}px`;
        menu.style.right    = 'auto';
      }
    },

    togglePostoMenu(postoId, event) {
      event.stopPropagation();
      const menu = document.getElementById(`posto-menu-${postoId}`);
      if (!menu) return;
      const estaAberto = !menu.classList.contains('hidden');
      UI._fecharTodosMenus();
      if (!estaAberto) {
        menu.classList.remove('hidden');
        const btn = event.currentTarget;
        const r   = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top      = `${r.bottom + 4}px`;
        menu.style.left     = `${Math.max(8, r.right - 160)}px`;
        menu.style.right    = 'auto';
      }
    },

    // ── EDITAR OPERAÇÃO — form inline na sidebar ───────────────
    abrirEditOp(opId) {
      UI._fecharTodosMenus();
      const op = S.operacoes[opId];
      if (!op) return;

      document.getElementById('edit-op-form')?.remove();

      // Bug 1 fix: o form de edição de operação fica na sidebar,
      // abaixo do item da operação — não no painel principal
      const opItem = document.querySelector(`#ops-lista .ops-item[onclick*="'${opId}'"]`);
      if (!opItem) return;

      const formHTML = `
        <div id="edit-op-form" class="posto-form-inline" style="margin:4px 8px 8px">
          <div class="posto-form-header">Editar operação</div>
          <label class="form-label">Nome</label>
          <input id="eop-nome" type="text" class="input-sm" value="${esc(op.nome||'')}">
          <label class="form-label">Bairro</label>
          <div class="combo-wrap">
            <input id="eop-bairro" type="text" class="input-sm" value="${esc(op.bairro||'')}"
              autocomplete="off">
            <div id="eop-bairro-list" class="combo-drop"></div>
          </div>
          <label class="form-label">Horário <span class="form-hint">opcional</span></label>
          <input id="eop-horario" type="time" class="input-sm" value="${esc(op.horario||'')}">
          <div class="posto-form-footer">
            <button class="btn-ghost-sm" onclick="document.getElementById('edit-op-form')?.remove()">Cancelar</button>
            <button class="btn-accent-sm" onclick="NIT_PLANOP.Actions.salvarEditOp('${opId}')">Salvar</button>
          </div>
        </div>`;

      opItem.insertAdjacentHTML('afterend', formHTML);

      UI._combo('eop-bairro', 'eop-bairro-list',
        CFG.BAIRROS.map(b => ({ value: b, label: b })),
        (v) => { $('eop-bairro').value = v; }
      );
      setTimeout(() => $('eop-nome')?.focus(), 60);
    },

    // ── EDITAR POSTO — form inline no card ────────────────────
    abrirEditPosto(postoId) {
      UI._fecharTodosMenus();
      const posto = S.postos[postoId];
      if (!posto) return;

      document.querySelectorAll('.edit-posto-form').forEach(f => f.remove());

      const card = document.getElementById(`qru-${postoId}`);
      if (!card) return;

      const formHTML = `
        <div class="edit-posto-form posto-form-inline" style="margin:8px 16px 8px">
          <div class="posto-form-header">Editar posto Nº ${posto.numero}</div>
          <label class="form-label">Endereço / Local *</label>
          <input id="ep-local-${postoId}" type="text" class="input-sm"
            value="${esc(posto.local||'')}" autocomplete="off">
          <label class="form-label">Bairro</label>
          <div class="combo-wrap">
            <input id="ep-bairro-${postoId}" type="text" class="input-sm"
              value="${esc(posto.bairro||'')}" autocomplete="off">
            <div id="ep-bairro-list-${postoId}" class="combo-drop"></div>
          </div>
          <label class="form-label">Observação <span class="form-hint">opcional</span></label>
          <textarea id="ep-obs-${postoId}" class="input-sm textarea-obs"
            rows="2">${esc(posto.obs||'')}</textarea>
          <div class="posto-form-footer">
            <button class="btn-ghost-sm"
              onclick="this.closest('.edit-posto-form')?.remove()">Cancelar</button>
            <button class="btn-accent-sm"
              onclick="NIT_PLANOP.Actions.salvarEditPosto('${postoId}')">Salvar</button>
          </div>
        </div>`;

      card.insertAdjacentHTML('beforeend', formHTML);

      UI._combo(`ep-bairro-${postoId}`, `ep-bairro-list-${postoId}`,
        CFG.BAIRROS.map(b => ({ value: b, label: b })),
        (v) => { $(`ep-bairro-${postoId}`).value = v; }
      );
      setTimeout(() => document.getElementById(`ep-local-${postoId}`)?.focus(), 60);
    },


    // ── UPDATE CIRÚRGICO — preserva dropdown aberto ───────────
    _patchQruCard(postoId) {
      const posto = S.postos[postoId];
      const card  = document.getElementById(`qru-${postoId}`);
      if (!card || !posto) return;
      const orientadores = Object.entries(posto.orientadores||{});
      const status       = orientadores.length===0 ? 'vazio' : 'parcial';
      card.className = (card.className.replace(/\bstatus-\w+\b/g, '') + ` status-${status}`).trim();
      const badge = card.querySelector('.qru-badge');
      if (badge) {
        badge.className   = `qru-badge ${status}`;
        badge.textContent = status==='vazio' ? 'Vazio'
          : `${orientadores.length} pessoa${orientadores.length!==1?'s':''}`;
      }
      const chipsDiv = card.querySelector('.orientadores-chips');
      if (chipsDiv) {
        chipsDiv.innerHTML = orientadores.map(([rId,ori]) => {
          const nome        = ori.nome || rId;
          const nomeDisplay = nome.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          const cargo = (ori.cargo||'ORI').slice(0,3).toUpperCase();
          return `<div class="orientador-chip">
            <div class="chip-avatar" style="background:${avatarColor(nome)}">${avatarInitials(nome)}</div>
            <span class="chip-nome">${esc(nomeDisplay)}</span>
            <span class="chip-cargo">${esc(cargo)}</span>
            ${canWrite() ? `<button class="orientador-chip-remove"
              onclick="NIT_PLANOP.Actions.removerOrientador('${postoId}','${rId}')"
              title="Remover">×</button>` : ''}
          </div>`;
        }).join('');
      }
    },

    // Atualiza só a seção de fotos dentro do card — sem reconstruir o card inteiro.
    // Preserva: estado expanded, detalhes abertos, dropdowns abertos.
    _patchFotos(postoId) {
      const posto = S.postos[postoId];
      if (!posto) return;
      const secao = document.querySelector(`#qru-${postoId} .fotos-section`);
      if (!secao) return;
      const novaSecao = document.createElement('div');
      novaSecao.innerHTML = UI._fotosHTML(postoId, posto);
      secao.replaceWith(novaSecao.firstElementChild);
    },

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

    abrirStatusPessoa(event, rId) {
      event.stopPropagation();
      document.querySelectorAll('.status-popover').forEach(p => p.remove());

      const r   = S.recursos[rId];
      if (!r) return;

      // Posto atual (para escalados)
      const postoByRecurso = {};
      Object.entries(S.postos).forEach(([pid, p]) => {
        Object.keys(p.orientadores||{}).forEach(id => { postoByRecurso[id] = { pid, posto: p }; });
      });
      const postoAtual = postoByRecurso[rId];

      // Dados cadastrais (contato, bairro, transporte)
      const tel       = r.contato  ? `<a href="tel:${r.contato}" class="sp-contato" onclick="event.stopPropagation()">${r.contato}</a>` : '<span class="sp-vazio">—</span>';
      const bairro    = r.bairro   ? esc(titleCase(r.bairro))   : '<span class="sp-vazio">—</span>';
      const transp    = r.transporte === 'veiculo_proprio'   ? 'Veículo próprio'
                      : r.transporte === 'transporte_publico' ? 'Transporte público'
                      : '<span class="sp-vazio">—</span>';

      const popHTML = `
        <div class="status-popover" id="sp-${rId}" onclick="event.stopPropagation()">
          <div class="sp-titulo">${esc(titleCase(r.nome||rId))}</div>

          <!-- Dados cadastrais -->
          <div class="sp-dados">
            <div class="sp-dado"><span class="sp-dado-label">Contato</span>${tel}</div>
            <div class="sp-dado"><span class="sp-dado-label">Bairro</span>${bairro}</div>
            <div class="sp-dado"><span class="sp-dado-label">Transporte</span>${transp}</div>
          </div>

          <!-- Ações de status -->
          <div class="sp-divider"></div>
          <button class="sp-opt sp-edit-btn"
            onclick="NIT_PLANOP.UI.abrirEditarPessoa('${rId}')">
            ✏ Editar dados
          </button>
          <div class="sp-divider"></div>
          <div class="sp-opcoes">
            ${postoAtual ? `
            <button class="sp-opt warning"
              onclick="NIT_PLANOP.Actions.liberarDoPosto('${rId}','${postoAtual.pid}')">
              <span class="sp-dot disponivel"></span> Liberar do posto
            </button>` : `
            <button class="sp-opt ${r.status==='disponivel'?'active':''}"
              onclick="NIT_PLANOP.Actions.setStatusPessoa('${rId}','disponivel')">
              <span class="sp-dot disponivel"></span> Disponível
            </button>`}
            <button class="sp-opt ${r.status==='indisponivel'?'active':''}"
              onclick="NIT_PLANOP.UI.mostrarMotivos('${rId}')">
              <span class="sp-dot indisponivel"></span> Indisponível ▸
            </button>
          </div>
          <div class="sp-motivos hidden" id="sp-motivos-${rId}">
            ${CFG.MOTIVOS.map(m => `
              <button class="sp-motivo-opt ${r.motivoIndisponivel===m.value?'active':''}"
                onclick="NIT_PLANOP.Actions.setStatusPessoa('${rId}','indisponivel','${m.value}')">
                ${esc(m.label)}
              </button>`).join('')}
          </div>
        </div>`;

      const btn = event.currentTarget;
      const r2  = btn.getBoundingClientRect();
      const pop = document.createElement('div');
      pop.innerHTML = popHTML;
      const el = pop.firstElementChild;
      document.body.appendChild(el);

      const POPOVER_H = 320;
      const top = Math.min(r2.top, window.innerHeight - POPOVER_H - 12);
      el.style.position = 'fixed';
      el.style.top      = `${Math.max(12, top)}px`;
      el.style.right    = `${window.innerWidth - r2.left + 8}px`;
      el.style.zIndex   = '200';
    },

    mostrarMotivos(rId) {
      const motivos = document.getElementById(`sp-motivos-${rId}`);
      if (motivos) motivos.classList.toggle('hidden');
    },

    // Fix 6: debounce — evita renderRightPanel em cada keystroke
    abrirCadastrarPessoa() {
      document.getElementById('cadastrar-pessoa-form')?.remove();
      const container = $('efetivo-totais');
      if (!container) return;

      const formHTML = `
        <div id="cadastrar-pessoa-form" class="posto-form-inline" style="margin:8px 0">
          <div class="posto-form-header">Novo cadastro</div>

          <label class="form-label">Nome completo *</label>
          <input id="cp-nome" type="text" class="input-sm"
            placeholder="Nome do orientador" autocomplete="off">

          <label class="form-label">Cargo</label>
          <div class="combo-wrap">
            <input id="cp-cargo-input" type="text" class="input-sm"
              placeholder="Cargo..." autocomplete="off">
            <div id="cp-cargo-list" class="combo-drop"></div>
          </div>

          <label class="form-label">Turno padrão</label>
          <div class="combo-wrap">
            <input id="cp-turno-input" type="text" class="input-sm"
              placeholder="Turno..." autocomplete="off">
            <div id="cp-turno-list" class="combo-drop"></div>
          </div>

          <label class="form-label">Contato <span class="form-hint">opcional</span></label>
          <input id="cp-contato" type="tel" class="input-sm" placeholder="85 9 9999-0000">

          <label class="form-label">Bairro <span class="form-hint">opcional</span></label>
          <div class="combo-wrap">
            <input id="cp-bairro-input" type="text" class="input-sm"
              placeholder="Bairro onde mora..." autocomplete="off">
            <div id="cp-bairro-list" class="combo-drop"></div>
          </div>

          <label class="form-label">Transporte <span class="form-hint">opcional</span></label>
          <div class="combo-wrap">
            <input id="cp-transporte-input" type="text" class="input-sm"
              placeholder="Selecionar..." autocomplete="off" readonly
              onclick="NIT_PLANOP.UI._openTransporteCombo()">
            <div id="cp-transporte-list" class="combo-drop"></div>
          </div>

          <div class="posto-form-footer">
            <button class="btn-ghost-sm"
              onclick="document.getElementById('cadastrar-pessoa-form')?.remove()">
              Cancelar
            </button>
            <button class="btn-accent-sm"
              onclick="NIT_PLANOP.Actions.confirmarCadastrarPessoa()">
              Cadastrar
            </button>
          </div>
        </div>`;

      container.insertAdjacentHTML('afterend', formHTML);

      UI._combo('cp-cargo-input', 'cp-cargo-list',
        Object.keys(CFG.CARGO_ABBR).map(c => ({ value: c, label: c })),
        (v) => { $('cp-cargo-input').value = v; }
      );
      UI._combo('cp-turno-input', 'cp-turno-list',
        [{ value:'manha', label:'Manhã' },
         { value:'tarde', label:'Tarde' },
         { value:'noite', label:'Noite' }],
        (v, l) => { $('cp-turno-input').value = l; }
      );
      UI._combo('cp-bairro-input', 'cp-bairro-list',
        CFG.BAIRROS.map(b => ({ value: b, label: b })),
        (v) => { $('cp-bairro-input').value = v; }
      );
      UI._combo('cp-transporte-input', 'cp-transporte-list',
        [{ value:'veiculo_proprio', label:'Veículo próprio' },
         { value:'transporte_publico', label:'Transporte público' },
         { value:'moto', label:'Motocicleta própria' }],
        (v, l) => {
          const inp = $('cp-transporte-input');
          if (inp) { inp.value = l; inp.dataset.selectedValue = v; }
        }
      );
      setTimeout(() => $('cp-nome')?.focus(), 60);
    },

    abrirEditarPessoa(rId) {
      document.querySelectorAll('.status-popover').forEach(p => p.remove());
      const r = S.recursos[rId];
      if (!r) return;

      document.getElementById('editar-pessoa-form')?.remove();

      const turnoLabel = { manha:'Manhã', tarde:'Tarde', noite:'Noite' };
      const transpLabel = {
        veiculo_proprio: 'Veículo próprio',
        transporte_publico: 'Transporte público'
      };

      const formHTML = `
        <div id="editar-pessoa-form" class="editar-pessoa-overlay"
          onclick="if(event.target===this)this.remove()">
          <div class="editar-pessoa-dialog" onclick="event.stopPropagation()">
            <div class="posto-form-header">Editar — ${esc(titleCase(r.nome||rId))}</div>

            <label class="form-label">Nome completo *</label>
            <input id="ep2-nome" type="text" class="input-sm" value="${esc(r.nome||'')}">

            <label class="form-label">Cargo</label>
            <div class="combo-wrap">
              <input id="ep2-cargo-input" type="text" class="input-sm"
                value="${esc(r.cargo||'')}" autocomplete="off">
              <div id="ep2-cargo-list" class="combo-drop"></div>
            </div>

            <label class="form-label">Turno padrão</label>
            <div class="combo-wrap">
              <input id="ep2-turno-input" type="text" class="input-sm"
                value="${esc(turnoLabel[r.turno_padrao]||r.turno_padrao||'')}"
                autocomplete="off">
              <div id="ep2-turno-list" class="combo-drop"></div>
            </div>

            <label class="form-label">Contato</label>
            <input id="ep2-contato" type="tel" class="input-sm"
              value="${esc(r.contato||'')}" placeholder="85 9 9999-0000">

            <label class="form-label">Bairro</label>
            <div class="combo-wrap">
              <input id="ep2-bairro-input" type="text" class="input-sm"
                value="${esc(r.bairro ? titleCase(r.bairro) : '')}" autocomplete="off">
              <div id="ep2-bairro-list" class="combo-drop"></div>
            </div>

            <label class="form-label">Transporte</label>
            <div class="combo-wrap">
              <input id="ep2-transp-input" type="text" class="input-sm"
                value="${esc(transpLabel[r.transporte]||'')}"
                placeholder="Selecionar..." autocomplete="off" readonly
                onclick="NIT_PLANOP.UI._openTransporteCombo2()">
              <div id="ep2-transp-list" class="combo-drop"></div>
            </div>

            <div class="posto-form-footer">
              <button class="btn-ghost-sm"
                onclick="document.getElementById('editar-pessoa-form')?.remove()">
                Cancelar
              </button>
              <button class="btn-accent-sm"
                onclick="NIT_PLANOP.Actions.confirmarEditarPessoa('${rId}')">
                Salvar
              </button>
            </div>
          </div>
        </div>`;

      document.body.insertAdjacentHTML('beforeend', formHTML);

      UI._combo('ep2-cargo-input','ep2-cargo-list',
        Object.keys(CFG.CARGO_ABBR).map(c => ({ value:c, label:c })),
        (v) => { $('ep2-cargo-input').value = v; });
      UI._combo('ep2-turno-input','ep2-turno-list',
        [{value:'manha',label:'Manhã'},{value:'tarde',label:'Tarde'},{value:'noite',label:'Noite'}],
        (v,l) => { $('ep2-turno-input').value = l; $('ep2-turno-input').dataset.selectedValue = v; });
      UI._combo('ep2-bairro-input','ep2-bairro-list',
        CFG.BAIRROS.map(b => ({ value:b, label:b })),
        (v) => { $('ep2-bairro-input').value = v; });
      UI._combo('ep2-transp-input','ep2-transp-list',
        [{value:'veiculo_proprio',label:'Veículo próprio'},
         {value:'transporte_publico',label:'Transporte público'}],
        (v,l) => { $('ep2-transp-input').value = l; $('ep2-transp-input').dataset.selectedValue = v; });

      setTimeout(() => $('ep2-nome')?.focus(), 60);
    },

    filtrarStaff(val) {
      S._buscaStaff = val;
      clearTimeout(S._staffDebounce);
      S._staffDebounce = setTimeout(() => UI.renderRightPanel(), 120);
    },

    // ── NOVA OPERAÇÃO (sidebar inline)
    toggleNovaOp() {
      const form = $('nova-op-form');
      if (!form) return;
      const aberto = !form.classList.contains('hidden');
      form.classList.toggle('hidden', aberto);
      if (!aberto) {
        // Limpar campos e resetar botão (pode ter ficado em "Criando...")
        [$('nop-bairro'), $('nop-nome')].forEach(el => { if(el) el.value=''; });
        const hidden = $('nop-tipo'); if (hidden) hidden.value = '';
        const tipoInp = $('nop-tipo-input'); if (tipoInp) tipoInp.value = '';
        const hor = $('nop-horario'); if(hor) hor.value='';
        const nome = $('nop-nome'); if(nome) nome._editado = false;
        const btn = form.querySelector('.btn-accent-sm');
        if (btn) { btn.disabled = false; btn.textContent = 'Criar Operação'; }
        UI._initBairroCombo();
        UI.popularSelectTipos();
        setTimeout(() => $('nop-bairro')?.focus(), 100);
      }
    },

    fecharNovaOp() {
      $('nova-op-form')?.classList.add('hidden');
    },

    // Autocomplete de bairro no formulário inline
    // Fix 3b: comprimir imagem antes de gravar no Firebase.
    // Base64 sem compressão pode chegar a 3-4MB por foto,
    // tornando cada listener snap muito pesado.
    // Reduz para ~80-150KB mantendo qualidade visual adequada.
    _compressImage(dataUrl, maxW = 900, quality = 0.72) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const ratio   = Math.min(maxW / img.width, 1);
          const canvas  = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl); // fallback sem compressão
        img.src = dataUrl;
      });
    },

    addFotoRef(postoId) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = async ev => {
          const compressed = await UI._compressImage(ev.target.result, 900, 0.72);
          S.db.ref(`efetivo/postos/${postoId}/fotoReferencia`).set(compressed);
          toast('Foto de referência adicionada!', 'success');
        };
        reader.readAsDataURL(f);
      };
      inp.click();
    },

    addFotoRegistro(postoId) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = async ev => {
          const compressed = await UI._compressImage(ev.target.result, 700, 0.65);
          const ts = getHoraAtual();
          S.db.ref(`efetivo/postos/${postoId}/fotosRegistro`).push({
            data: compressed, timestamp: ts
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
      await DB.adicionarOrientadorAoPosto(postoId, recursoId);
      vibrar(40);
      // Atualizar itens do dropdown sem fechá-lo — permite adicionar mais
      const bodyId = `drop-body-${postoId}`;
      const body   = document.getElementById(bodyId);
      if (body) {
        const jaDesignados = Object.keys(S.postos[postoId]?.orientadores || {});
        body.querySelectorAll('.orientador-drop-item').forEach(el => {
          const id = el.dataset.id;
          if (jaDesignados.includes(id)) {
            el.classList.add('disabled');
            el.onclick = null;
          }
        });
        // Mover o item recém-designado para o final como grayed
        const item = body.querySelector(`[data-id="${recursoId}"]`);
        if (item) { item.classList.add('disabled'); item.onclick = null; }
      }
      toast(`${S.recursos[recursoId]?.nome||'Orientador'} designado!`, 'success');
    },

    async removerOrientador(postoId, recursoId) {
      await DB.removerOrientadorDoPosto(postoId, recursoId);
      vibrar(40);
    },

    async criarPosto(opId) {
      const local = $('pf-local')?.value.trim();
      if (!local) { toast('Endereço é obrigatório — sem isso ninguém sabe onde ir.', 'warning'); $('pf-local')?.focus(); return; }

      const bairro  = $('pf-bairro-input')?.value.trim() || '';
      const obs     = $('pf-obs')?.value.trim() || '';
      const op      = S.operacoes[opId] || {};
      const oriSel  = window._pfOriSelecionados || {};

      const postoId = await DB.adicionarPosto({
        operacaoId: opId,
        local:    upper(local),
        bairro:   upper(bairro) || op.bairro || '',
        horario:  op.horario || '',
        tipoAcao: 'CONTROLE',
        obs:      upper(obs),
        qruPessoas: 1
      });

      // Designar todos os orientadores selecionados
      if (postoId) {
        for (const [value, nome] of Object.entries(oriSel)) {
          if (value.startsWith('a:')) {
            await DB.adicionarOrientadorAoPosto(postoId, value.slice(2));
          } else if (value.startsWith('v:')) {
            await S.db.ref(`efetivo/viaturas/${value.slice(2)}/status`).set('escalada');
          }
        }
      }

      window._pfOriSelecionados = {};
      UI.fecharAddPosto(opId);
      vibrar(40);
      toast(Object.keys(oriSel).length > 0 ? 'Posto adicionado!' : 'Posto adicionado — designar orientador depois.', 'success');
    },

    async criarOperacao() {
      const bairro = $('nop-bairro')?.value?.trim();
      const tipo   = $('nop-tipo')?.value;
      const hor    = $('nop-horario')?.value;
      const nome   = $('nop-nome')?.value?.trim() ||
        tipo || bairro || 'OPERAÇÃO';

      if (!bairro) { toast('Bairro é obrigatório','warning'); return; }
      if (!tipo)   { toast('Selecione o tipo de missão','warning'); return; }
      if (!S.escalaAtiva) { toast('Abra um turno primeiro','warning'); return; }

      const btn = document.querySelector('.nova-op-footer .btn-accent-sm');
      if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }

      await DB.adicionarOperacao({
        nome: upper(nome), bairro: upper(bairro),
        horario: hor||'', tipoMissao: tipo
      });
      UI.fecharNovaOp();
      toast('Operação criada!', 'success');
    },

    async confirmarEditarPessoa(rId) {
      const nome   = $('ep2-nome')?.value.trim();
      if (!nome) { toast('Nome é obrigatório','warning'); return; }

      const cargo  = $('ep2-cargo-input')?.value.trim().toUpperCase() || 'ORIENTADOR';
      const turnoI = $('ep2-turno-input');
      const turno  = turnoI?.dataset.selectedValue || S.recursos[rId]?.turno_padrao || 'manha';
      const contato= $('ep2-contato')?.value.trim()||'';
      const bairro = $('ep2-bairro-input')?.value.trim()||'';
      const transpI= $('ep2-transp-input');
      const transp = transpI?.dataset.selectedValue || S.recursos[rId]?.transporte || '';

      const updates = {
        nome: upper(nome), cargo, turno_padrao: turno, contato,
        bairro: bairro ? upper(bairro) : null,
        transporte: transp || null,
        updatedAt: Date.now()
      };

      await S.db.ref(`efetivo/recursos/${rId}`).update(updates);
      if (S.recursos[rId]) Object.assign(S.recursos[rId], updates);

      document.getElementById('editar-pessoa-form')?.remove();
      UI.renderRightPanel();
      toast('Dados atualizados!', 'success');
    },

    async liberarDoPosto(rId, postoId) {
      document.querySelectorAll('.status-popover').forEach(p => p.remove());
      await DB.removerOrientadorDoPosto(postoId, rId);
      toast(`${titleCase(S.recursos[rId]?.nome||'')} liberado do posto`, 'success');
    },

    async setStatusPessoa(rId, status, motivo = '') {
      document.querySelectorAll('.status-popover').forEach(p => p.remove());
      const updates = { status, updatedAt: Date.now() };
      if (status === 'indisponivel') {
        updates.motivoIndisponivel = motivo;
      } else {
        updates.motivoIndisponivel = null;
      }
      await S.db.ref(`efetivo/recursos/${rId}`).update(updates);
      // Update otimista
      if (S.recursos[rId]) {
        S.recursos[rId].status = status;
        S.recursos[rId].motivoIndisponivel = motivo || null;
      }
      UI.renderRightPanel();
      const r = S.recursos[rId];
      const label = status === 'indisponivel'
        ? `${titleCase(r?.nome||'')} → Indisponível`
        : `${titleCase(r?.nome||'')} → Disponível`;
      toast(label, status === 'disponivel' ? 'success' : 'warning');
    },

    async confirmarCadastrarPessoa() {
      const nome      = $('cp-nome')?.value.trim();
      const cargo     = $('cp-cargo-input')?.value.trim().toUpperCase() || 'ORIENTADOR';
      const turnoIn   = $('cp-turno-input');
      const turno     = turnoIn?.dataset.selectedValue || 'manha';
      const contato   = $('cp-contato')?.value.trim() || '';
      const bairro    = $('cp-bairro-input')?.value.trim() || '';
      const transp    = $('cp-transporte-input')?.dataset.selectedValue || '';

      if (!nome) {
        toast('Nome é obrigatório', 'warning');
        $('cp-nome')?.focus();
        return;
      }

      const payload = {
        nome:         upper(nome),
        cargo,
        turno_padrao: turno,
        contato,
        status:       'disponivel',
        criadoEm:     Date.now()
      };
      if (bairro)  payload.bairro     = upper(bairro);
      if (transp)  payload.transporte = transp;

      const ref = await S.db.ref('efetivo/recursos').push(payload);

      S.recursos[ref.key] = { ...payload };
      document.getElementById('cadastrar-pessoa-form')?.remove();
      UI.renderRightPanel();
      toast(`${nome} cadastrado!`, 'success');
    },

    async salvarHorarioTurno() {
      const inicio = $('et-inicio')?.value;
      const fim    = $('et-fim')?.value;
      if (!inicio || !fim) { toast('Preencha início e fim','warning'); return; }
      await S.db.ref(`efetivo/escalas/${S.escalaAtiva}`).update({
        horarioInicio: inicio, horarioFim: fim
      });
      document.getElementById('editar-turno-form')?.remove();
      toast('Horários atualizados!', 'success');
    },

    async removerFotoRef(postoId) {
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 800);
      if (S.postos[postoId]) S.postos[postoId].fotoReferencia = null;
      await S.db.ref(`efetivo/postos/${postoId}/fotoReferencia`).remove();
      UI._patchFotos(postoId);
      toast('Foto removida', 'info');
    },

    async removerFotoRegistro(postoId, regId) {
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 800);
      if (S.postos[postoId]?.fotosRegistro) {
        delete S.postos[postoId].fotosRegistro[regId];
      }
      await S.db.ref(`efetivo/postos/${postoId}/fotosRegistro/${regId}`).remove();
      UI._patchFotos(postoId);
      toast('Registro removido', 'info');
    },

    async toggleFalta(postoId, rId) {
      const ori = S.postos[postoId]?.orientadores?.[rId];
      if (!ori) return;
      const novoFaltou = !ori.faltou;
      await S.db.ref(`efetivo/postos/${postoId}/orientadores/${rId}/faltou`).set(novoFaltou);
      if (S.postos[postoId]?.orientadores?.[rId])
        S.postos[postoId].orientadores[rId].faltou = novoFaltou;
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 600);
      UI._patchQruCard(postoId);
      const nome = titleCase(ori.nome || rId);
      toast(novoFaltou ? `${nome} — falta registrada` : `${nome} — falta cancelada`,
        novoFaltou ? 'warning' : 'success');
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
      if (!S.escalaAtiva) return;

      // Remove confirm anterior se existir
      document.getElementById('encerrar-confirm-overlay')?.remove();

      // Confirm no body — não dentro do settings-menu (que é destruído pelo document.click)
      const overlay = document.createElement('div');
      overlay.id = 'encerrar-confirm-overlay';
      overlay.className = 'encerrar-overlay';
      overlay.innerHTML = `
        <div class="encerrar-dialog" onclick="event.stopPropagation()">
          <p class="encerrar-confirm-msg">Encerrar o turno?<br>
            <span style="font-size:10px;color:var(--text-muted)">
              Todos os orientadores escalados serão liberados.
            </span>
          </p>
          <div class="encerrar-confirm-btns">
            <button class="btn-ghost-sm"
              onclick="document.getElementById('encerrar-confirm-overlay')?.remove()">
              Cancelar
            </button>
            <button class="btn-encerrar-ok"
              onclick="NIT_PLANOP.Actions._doEncerrar()">
              Encerrar turno
            </button>
          </div>
        </div>`;
      overlay.addEventListener('click', () =>
        document.getElementById('encerrar-confirm-overlay')?.remove());
      document.body.appendChild(overlay);
    },

    async _doEncerrar() {
      document.getElementById('encerrar-confirm-overlay')?.remove();
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
      const btn = document.querySelector('.btn-salvar-padrao');
      if (btn) { btn.textContent = 'Salvando...'; btn.disabled = true; }
      await DB.salvarSupervisaoPadrao(escala.turno);
      if (btn) { btn.textContent = 'Salvar como padrão para este turno'; btn.disabled = false; }
      toast(`Supervisão padrão salva para o turno ${escala.turno}`, 'success');
      toast(`Padrão ${turnoLabel(escala)} salvo!`, 'success');
    },

    async salvarEditOp(opId) {
      const nome   = $('eop-nome')?.value.trim();
      const bairro = $('eop-bairro')?.value.trim();
      const horario = $('eop-horario')?.value;
      if (!nome) { toast('Nome é obrigatório', 'warning'); return; }
      await S.db.ref(`efetivo/operacoes/${opId}`).update({
        nome: upper(nome), bairro: upper(bairro||''), horario: horario||'',
        updatedAt: Date.now()
      });
      document.getElementById('edit-op-form')?.remove();
      toast('Operação atualizada', 'success');
    },

    async salvarEditPosto(postoId) {
      const local  = document.getElementById(`ep-local-${postoId}`)?.value.trim();
      const bairro = document.getElementById(`ep-bairro-${postoId}`)?.value.trim();
      const obs    = document.getElementById(`ep-obs-${postoId}`)?.value.trim();
      if (!local) { toast('Endereço é obrigatório', 'warning'); return; }
      await S.db.ref(`efetivo/postos/${postoId}`).update({
        local: upper(local), bairro: upper(bairro||''), obs: upper(obs||''),
        updatedAt: Date.now()
      });
      document.querySelector(`.edit-posto-form`)?.remove();
      toast('Posto atualizado', 'success');
    },

    async deletarOp(opId) {
      UI._fecharTodosMenus();
      const op = S.operacoes[opId];
      if (!op) return;
      const nPostos = Object.values(S.postos).filter(p => p.operacaoId === opId).length;
      const label   = nPostos > 0
        ? `Deletar "${titleCase(op.nome)}" e ${nPostos} posto(s)?`
        : `Deletar "${titleCase(op.nome)}"?`;
      const opEl = document.querySelector(`#ops-lista .ops-item[onclick*="'${opId}'"]`);
      if (opEl?.querySelector('.inline-confirm')) { opEl.querySelector('.inline-confirm').remove(); return; }
      const ic = document.createElement('div');
      ic.className = 'inline-confirm';
      ic.innerHTML = `<span>${esc(label)}</span>
        <button class="btn-ghost-sm" onclick="this.closest('.inline-confirm').remove()">Não</button>
        <button class="btn-danger-sm" onclick="NIT_PLANOP.Actions._doDeletarOp('${opId}')">Sim</button>`;
      opEl?.appendChild(ic);
    },

    async _doDeletarOp(opId) {
      document.querySelector('.inline-confirm')?.remove();
      vibrar([60,40,60]);

      const postosOp = Object.entries(S.postos).filter(([,p]) => p.operacaoId === opId);

      // Bug 3 fix: coletar TODOS os recursos a liberar antes de qualquer delete.
      // O emOutro é calculado com S.postos intacto — sem mutação durante o loop.
      const postosIds  = new Set(postosOp.map(([pid]) => pid));
      const aLiberar   = new Set();
      for (const [pid, posto] of postosOp) {
        for (const rId of Object.keys(posto.orientadores||{})) {
          // Só libera se o recurso não está em OUTRO posto (fora desta operação)
          const emOutro = Object.entries(S.postos)
            .some(([id2, p2]) => !postosIds.has(id2) && p2.orientadores?.[rId]);
          if (!emOutro) aLiberar.add(rId);
        }
      }

      // 1. Liberar recursos (batch update único)
      if (aLiberar.size) {
        const updates = {};
        aLiberar.forEach(rId => {
          updates[`${rId}/status`] = 'disponivel';
          if (S.recursos[rId]) S.recursos[rId].status = 'disponivel';
        });
        await S.db.ref('efetivo/recursos').update(updates);
      }

      // 2. Deletar postos
      for (const [pid] of postosOp) {
        await S.db.ref(`efetivo/postos/${pid}`).remove();
        delete S.postos[pid];
      }

      // 3. Deletar operação
      await S.db.ref(`efetivo/operacoes/${opId}`).remove();
      delete S.operacoes[opId];
      if (S.operacaoSel === opId) S.operacaoSel = null;

      UI.renderOpsList();
      UI.renderMainContent();
      UI.renderRightPanel();
      toast('Operação deletada', 'info');
    },

    async deletarPosto(postoId) {
      UI._fecharTodosMenus();
      const posto = S.postos[postoId];
      if (!posto) return;
      const card = document.getElementById(`qru-${postoId}`);
      if (card?.querySelector('.inline-confirm')) { card.querySelector('.inline-confirm').remove(); return; }
      const ic = document.createElement('div');
      ic.className = 'inline-confirm inline-confirm-danger';
      ic.innerHTML = `<span>Remover posto Nº ${posto.numero}?</span>
        <button class="btn-ghost-sm" onclick="this.closest('.inline-confirm').remove()">Não</button>
        <button class="btn-danger-sm" onclick="NIT_PLANOP.Actions._doDeletarPosto('${postoId}')">Sim</button>`;
      card?.querySelector('.qru-card-header')?.appendChild(ic);
    },

    async _doDeletarPosto(postoId) {
      document.querySelector('.inline-confirm')?.remove();
      vibrar(60);
      const posto = S.postos[postoId];
      if (!posto) return;
      for (const rId of Object.keys(posto.orientadores||{})) {
        const emOutro = Object.entries(S.postos)
          .some(([id2,p2]) => id2!==postoId && p2.orientadores?.[rId]);
        if (!emOutro) {
          await S.db.ref(`efetivo/recursos/${rId}/status`).set('disponivel');
          if (S.recursos[rId]) S.recursos[rId].status = 'disponivel';
        }
      }
      await S.db.ref(`efetivo/postos/${postoId}`).remove();
      delete S.postos[postoId];  // update otimista
      UI.renderOpsList();
      UI.renderMainContent();
      UI.renderRightPanel();
      toast('Posto removido', 'info');
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
  // Auto-grow global para qualquer textarea.textarea-obs inserida dinamicamente
  document.addEventListener('input', e => {
    if (e.target.classList.contains('textarea-obs')) _autoGrow(e.target);
  });

  // Paste global — captura prints colados em qualquer lugar da página.
  // Prioridade: foto de referência do posto com detalhes abertos.
  // 99% do uso é Ctrl+V após tirar print — não deve exigir clicar no placeholder.
  document.addEventListener('paste', e => {
    // Ignorar se o foco está num input/textarea (o usuário está digitando algo)
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const imgItem = [...(e.clipboardData?.items||[])].find(i => i.type.startsWith('image/'));
    if (!imgItem) return;

    // Encontrar postos com detalhes expandidos
    const abertos = [...document.querySelectorAll('.detalhes-body.open, .detalhes-body[style*="block"]')]
      .map(el => el.closest('.qru-card')?.id?.replace('qru-',''))
      .filter(Boolean);

    // Preferir posto sem foto de referência
    const semFoto = abertos.find(pid => !S.postos[pid]?.fotoReferencia);
    const alvo    = semFoto || abertos[0];

    if (!alvo) return; // nenhum posto aberto — deixar o comportamento padrão

    e.preventDefault();
    const file   = imgItem.getAsFile();
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await UI._compressImage(ev.target.result, 900, 0.72);
      // Suppress: evita que o listener reconstrua o card e colapsa os detalhes
      S._suppressRender = true;
      setTimeout(() => { S._suppressRender = false; }, 800);
      if (S.postos[alvo]) S.postos[alvo].fotoReferencia = compressed;
      await S.db.ref(`efetivo/postos/${alvo}/fotoReferencia`).set(compressed);
      UI._patchFotos(alvo); // atualiza só a seção de fotos
      toast('Print colado!', 'success');
    };
    reader.readAsDataURL(file);

    if (abertos.length > 1) {
      toast(`Print colado no posto ${S.postos[alvo]?.numero||''}. Abra só um posto por vez para colar com precisão.`, 'info');
    }
  });
  // Ativar nas que já existem ao abrir detalhes
  document.addEventListener('click', e => {
    const toggle = e.target.closest('.detalhes-toggle');
    if (toggle) setTimeout(() => _bindAutoGrow('.detalhes-obs-input'), 50);
  });

  document.addEventListener('click', () => {
    // Fechar settings menu
    const sm = $('settings-menu');
    if (sm && !sm.classList.contains('hidden')) {
      sm.classList.add('hidden'); sm.innerHTML = '';
    }
    if (S._dropAberto) {
      const drop = document.getElementById(S._dropAberto);
      if (drop) drop.classList.remove('open');
      S._dropAberto = null;
    }
    $('nop-bairro-list')?.classList.remove('open');
    UI._fecharTodosMenus?.();
    document.querySelectorAll('.status-popover').forEach(p => p.remove());
  });

  /* ── INICIALIZAÇÃO ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => Auth.init());

  /* ── API PÚBLICA ────────────────────────────────────────── */
  return { Auth, UI, Campo, Actions, DB };

})();
