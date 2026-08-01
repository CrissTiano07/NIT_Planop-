/* ═══════════════════════════════════════════════════════════
   CENTRAL OPS · P0 — Datas em formato brasileiro (dd/mm/aaaa)
   ───────────────────────────────────────────────────────────
   Problema: <input type="date"> renderiza mm/dd/yyyy conforme o
   idioma do navegador, não conforme lang="pt-BR". O operador
   digitava dia e mês invertidos, em silêncio.

   Solução: campo de texto com máscara dd/mm/aaaa, mas .value
   continua devolvendo ISO (YYYY-MM-DD). Nenhuma alteração é
   necessária no planop.js — ele lê e escreve exatamente como antes.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var IDS = ['nop-data-inicio', 'nop-data-fim'];

  var descritorNativo = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  );

  function soDigitos(s) { return (s || '').replace(/\D/g, '').slice(0, 8); }

  function mascarar(d) {
    if (d.length <= 2) return d;
    if (d.length <= 4) return d.slice(0, 2) + '/' + d.slice(2);
    return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
  }

  function paraISO(texto) {
    var d = soDigitos(texto);
    if (d.length !== 8) return '';
    var dia = +d.slice(0, 2), mes = +d.slice(2, 4), ano = +d.slice(4);
    if (mes < 1 || mes > 12 || dia < 1 || ano < 1900) return '';
    var dt = new Date(ano, mes - 1, dia);
    if (dt.getDate() !== dia || dt.getMonth() !== mes - 1) return ''; // 31/02
    return d.slice(4) + '-' + d.slice(2, 4) + '-' + d.slice(0, 2);
  }

  function deISO(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }

  function preparar(el) {
    if (!el || el.dataset.p0Data === '1') return;
    el.dataset.p0Data = '1';

    // .value passa a falar ISO com o resto do sistema, dd/mm/aaaa com a pessoa
    Object.defineProperty(el, 'value', {
      configurable: true,
      get: function () { return paraISO(descritorNativo.get.call(el)); },
      set: function (v) {
        descritorNativo.set.call(el, v ? (deISO(v) || v) : '');
        validar(el);
      }
    });

    el.addEventListener('input', function () {
      var pos = el.selectionStart;
      var antes = descritorNativo.get.call(el);
      var depois = mascarar(soDigitos(antes));
      if (antes !== depois) {
        descritorNativo.set.call(el, depois);
        var delta = depois.length - antes.length;
        try { el.setSelectionRange(pos + delta, pos + delta); } catch (e) {}
      }
      validar(el);
    });

    el.addEventListener('blur', function () { validar(el, true); });
  }

  function validar(el, aoSair) {
    var bruto = descritorNativo.get.call(el);
    var vazio = soDigitos(bruto).length === 0;
    var ok = vazio || paraISO(bruto) !== '';
    el.classList.toggle('invalido', !ok);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (aoSair && !ok && window.NIT_PLANOP && NIT_PLANOP.UI && NIT_PLANOP.UI.toast) {
      NIT_PLANOP.UI.toast('Data inválida. Use dia/mês/ano — ex.: 05/08/2026', 'erro');
    }
  }

  function iniciar() { IDS.forEach(function (id) { preparar(document.getElementById(id)); }); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
