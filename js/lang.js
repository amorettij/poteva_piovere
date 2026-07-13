/* =====================================================
   lang.js — IT / EN language switch
   ===================================================== */

(function () {

  var STRINGS = {

    /* ═══════════════════════════════════════════════
       ITALIANO
    ═══════════════════════════════════════════════ */
    it: {
      nav_ringraziamenti  : 'I RINGRAZIAMENTI',

      hero_subtitle_html  : 'Come è andato questo dottorato?<br>(2023-2026)',
      hero_scroll         : 'scorri',

      quote_0 : '«Ogni volta che dico sta cosa poi la mia coscienza in forma d’Armadillo mi dice',
      quote_1 : '“Guarda, me sa che è peggio annà a lavorà in cantiere, eh. Così, a occhio.”',
      quote_2 : 'Sì, è vero, è peggio annà in cantiere, grazie —',
      quote_3 : 'c’è sempre na cosa peggio.',
      quote_4 : 'Però non è che a una che gl’è morto un figlio glie dici',
      quote_5 : '“Eh vabbè, alla famiglia Kennedy gliene so’ morti quaranta.”»',

      section_percorso    : 'IL PERCORSO',
      section_dati        : 'I DATI',
      section_lascia      : 'COME MI LASCIA QUESTO PHD',

      dati_intro_html     : 'Nel 2024 — anno centrale di questo percorso — un gruppo scelto di <a class="dati__link" href="group.html?group=le_ragazze_non_piangono_mai">ragazze che non piangono mai</a> ha raccolto dei preziosi dati statistici sulle volte in cui la regola è stata infranta. Nel rispetto della loro privacy, riporto di seguito solo la parte relativa alla mia personalissima performance.',
      dati_subtext_html   : 'Se sei membro del gruppo <a class="dati__link" href="lrnpm.html">Le ragazze non piangono mai</a>, prosegui alla pagina dedicata per scoprire classifiche e statistiche di insieme.',

      dati_q1             : 'Quanto ho pianto?',
      dati_q2             : 'Quando ho pianto?',
      dati_q3             : 'Per cosa ho pianto?',
      dati_q4             : 'Con quanto trasporto ho pianto?',
      dati_counter_q      : 'Dunque, quante volte ho pianto nel 2024?',
      dati_counter_label  : 'volte',
      dati_slot_prefix    : 'Il mese dei piantini per eccellenza è stato',
      dati_cal_label      : 'Il giorno più memorabile',

      modal_close         : 'Chiudi ×',

      ack_pre             : 'Grazie per aver partecipato al mio Ted Talk, prosegui pure verso:',
      ack_title_html      : 'I RINGRA-<br>ZIAMENTI',
      ack_link            : 'Ed eccoci qua',

      rg_subtitle         : 'Una serie di prolissi ringraziamenti',
      rg_intro_p1         : 'Portare a termine questo percorso è stato a tratti solo difficile, a tratti tragicomico, e spesso grottesco. Tutte le persone menzionate in questa sede sono accomunate da due fattori principali:',
      rg_intro_li1_html   : '<strong>essere delle <span style="color:var(--c-accent)">creature incredibili</span>, e soprattutto</strong>',
      rg_intro_li2_html   : '<strong>essersi sorbite almeno un lungo quarto d’ora di lamento su questo pittoresco spaccato di vita che è stato il dottorato (<span style="color:var(--c-accent)">i più fortunati tra voi su base quotidiana</span>).</strong>',
      rg_intro_p2         : 'Sarebbe carino se vi focalizzaste sull’affetto che c’è dietro a tutto questo e non sul fatto che non avevo alcun diritto di usare le vostre foto. Un abbraccio, siete tutti splendidi.',
      rg_intro_p3_html    : 'Qui sotto vi trovate raggruppati per <span style="color:var(--c-accent)">gruppi di appartenenza</span> (più cringe del previsto eh?) che trovo intuitivi. Se non li trovate intuitivi probabilmente siete inclusi nel gruppo dei non raggruppati. Se non siete presenti, è perché ho commesso un grave errore (o perché non pensavo che sareste stati qui stasera e che quindi avrei avuto tempo di fare un update più tardi — <strong>ma la vostra presenza è stata sicuramente una splendida sorpresa</strong>).',

      months_full  : ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
      months_abbr  : ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
      causa_labels : {
        'audio-video-scritto'              : 'Film, serie e musica',
        'relazioni-sessuoaffettive'        : 'Relazioni sentimentali',
        'altro-e-gran-mix'                 : 'Altro e gran mix',
        'relazioni-amicali-familiari'      : 'Amicizie e famiglia',
        'stress-ansia-per-futuro-nostalgia': 'Ansia e nostalgia',
        'accademia-lavoro-economia'        : 'Dottorato e lavoro',
        'contrattempi'                     : 'Contrattempi',
      },
      donut_comment : function (total, workCount, stressCount, pct) {
        return 'Su ' + total + ' piantini registrati, ' + workCount + ' hanno causa diretta nel dottorato o nel lavoro. ' +
          'A occhio e croce, ' + stressCount + ' piantini per ansia e nostalgia potrebbero non essere totalmente scollegati dalla prospettiva della permanenza nelle terre scandinave o dal suo concretizzarsi. ' +
          'Anche se apparentemente il restante ' + (100 - pct) + '% ci è stato regalato da una complessa serie di concause, i dati a disposizione non sono sufficienti a scongiurare possibili legami causa-effetto tra il verificarsi del piantino e aspetti collaterali del dottorato.';
      },
      line_comment : function (peakDay, dayStr) {
        return 'Ci sono tanti giorni speciali nell’anno, ma il giorno ' + dayStr + ' deve proprio essere stato memorabile! ' +
          'Peccato non avere a disposizione i dati dei successivi dieci mesi in Finlandia!';
      },
    },

    /* ═══════════════════════════════════════════════
       ENGLISH
    ═══════════════════════════════════════════════ */
    en: {
      nav_ringraziamenti  : 'ACKNOWLEDGEMENTS',

      hero_subtitle_html  : 'How did this PhD go?<br>(2023–2026)',
      hero_scroll         : 'scroll',

      quote_0 : '«Every time I say this, my conscience — in the shape of an Armadillo — tells me',
      quote_1 : '“Look, I reckon it’s probably worse going to work on a building site, right. Just, roughly speaking.”',
      quote_2 : 'Yes, fine, a building site is worse, thank you —',
      quote_3 : 'there’s always something worse.',
      quote_4 : 'But you wouldn’t say to someone whose child just died:',
      quote_5 : '“Well, the Kennedys lost forty of theirs.”»',

      section_percorso    : 'THE JOURNEY',
      section_dati        : 'THE DATA',
      section_lascia      : 'HOW THIS PHD LEAVES ME',

      dati_intro_html     : 'In 2024 — the central year of this journey — a select group of <a class="dati__link" href="group.html?group=le_ragazze_non_piangono_mai">girls who never cry</a> collected precious statistical data on the occasions when the rule was broken. Out of respect for their privacy, I am reporting here only the part relating to my very personal performance.',
      dati_subtext_html   : 'If you are a member of the <a class="dati__link" href="lrnpm.html">Le ragazze non piangono mai</a> group, proceed to the dedicated page to discover rankings and group statistics.',

      dati_q1             : 'How much did I cry?',
      dati_q2             : 'When did I cry?',
      dati_q3             : 'What made me cry?',
      dati_q4             : 'How intensely did I cry?',
      dati_counter_q      : 'So, how many times did I cry in 2024?',
      dati_counter_label  : 'times',
      dati_slot_prefix    : 'The peak crying month was',
      dati_cal_label      : 'The most memorable day',

      modal_close         : 'Close ×',

      ack_pre             : 'Thank you for attending my TED Talk — now proceed to:',
      ack_title_html      : 'THE ACKNOWLEDGE-<br>MENTS',
      ack_link            : 'And here we are',

      rg_subtitle         : 'A series of verbose acknowledgements',
      rg_intro_p1         : 'Getting through this journey was at times merely difficult, at times tragicomic, and often outright grotesque. All the people mentioned here share two main qualities:',
      rg_intro_li1_html   : '<strong>being absolutely <span style="color:var(--c-accent)">incredible human beings</span>, and above all,</strong>',
      rg_intro_li2_html   : '<strong>having endured at least a solid quarter of an hour of me lamenting this picturesque slice of life that was the PhD — (<span style="color:var(--c-accent)">the lucky ones among you on a daily basis</span>).</strong>',
      rg_intro_p2         : 'It would be nice if you focused on the affection behind all this rather than on the fact that I had absolutely no right to use your photos. A hug — you are all wonderful.',
      rg_intro_p3_html    : 'Below you are grouped by <span style="color:var(--c-accent)">categories of belonging</span> (more cringe than expected, I know) that I found intuitive. If you don’t find them intuitive, you are probably in the ungrouped group. If you are not here at all, it is either because I made a serious mistake, or because I did not expect you to be here tonight and assumed I would have time to add you later — <strong>but your presence has certainly been a wonderful surprise</strong>.',

      months_full  : ['January','February','March','April','May','June','July','August','September','October','November','December'],
      months_abbr  : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      causa_labels : {
        'audio-video-scritto'              : 'Films, shows & music',
        'relazioni-sessuoaffettive'        : 'Romantic relationships',
        'altro-e-gran-mix'                 : 'Other & grand mix',
        'relazioni-amicali-familiari'      : 'Friendships & family',
        'stress-ansia-per-futuro-nostalgia': 'Anxiety & homesickness',
        'accademia-lavoro-economia'        : 'PhD & work',
        'contrattempi'                     : 'Life mishaps',
      },
      donut_comment : function (total, workCount, stressCount, pct) {
        return 'Out of ' + total + ' recorded crying episodes, ' + workCount + ' are directly caused by the PhD or work. ' +
          'Roughly speaking, ' + stressCount + ' episodes of anxiety and homesickness may not be entirely unrelated to the prospect — or reality — of an extended stay in Scandinavian territory. ' +
          'While the remaining ' + (100 - pct) + '% appears to have been brought about by a complex set of contributing factors, available data are insufficient to rule out causal links between individual episodes and the various collateral aspects of doctoral life.';
      },
      line_comment : function (peakDay, dayStr) {
        return 'There are many special days in a year, but ' + dayStr + ' must have been truly memorable! ' +
          'A pity we don’t have data for the following ten months in Finland.';
      },
    },
  };

  /* ── State ───────────────────────────────────────── */
  var _lang = localStorage.getItem('pp_lang') || 'it';

  /* ── Public API ──────────────────────────────────── */
  window.PP = window.PP || {};

  window.PP.getLang = function () { return _lang; };

  window.PP.t = function (key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var val = (STRINGS[_lang] && STRINGS[_lang][key] !== undefined)
      ? STRINGS[_lang][key]
      : (STRINGS.it[key] !== undefined ? STRINGS.it[key] : key);
    return typeof val === 'function' ? val.apply(null, args) : val;
  };

  window.PP.setLang = function (lang) {
    if (lang !== 'it' && lang !== 'en') return;
    _lang = lang;
    localStorage.setItem('pp_lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    document.dispatchEvent(new CustomEvent('pp:langchange', { detail: { lang: lang } }));
  };

  /* ── DOM translation ─────────────────────────────── */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = window.PP.t(el.dataset.i18n);
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = window.PP.t(el.dataset.i18nHtml);
      if (typeof val === 'string') el.innerHTML = val;
    });
    updateToggleButtons();
  }

  function updateToggleButtons() {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.langToggle === _lang));
    });
  }

  /* ── Init ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = _lang;
    applyTranslations();
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.PP.setLang(btn.dataset.langToggle); });
    });
  });

})();
