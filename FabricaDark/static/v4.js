// Fábrica Dark v4 — Estúdio 1 clique + Acompanhar geração
(function () {
  const ICONE = {pendente: '○', rodando: '◐', ok: '✓', erro: '✕', pulada: '✓'};
  const fmtT = s => { s = Math.round(s || 0); if (s >= 3600) return `${Math.floor(s / 3600)}h${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}min`; if (s >= 60) return `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, '0')}s`; return `${s}s`; };
  const pararTimer = () => { if (S.estTimer) { clearInterval(S.estTimer); S.estTimer = null; } };

  // =========================================================================
  // 💬 MODELOS DO CHAT DARKPLANNER (FLASH HIGH / ARGON MEDIUM / GEMINI 4 CARBON HIGH)
  // + MONITOR DE PROCESSO AO VIVO ESTILO CHAT DARKPLANNER (MINIMIZÁVEL)
  // =========================================================================
  window.obterInfoModeloChatDp = function (op) {
    const v = String(op || (window.S && S.estChatDpOpcao) || 'flash_high').trim().toLowerCase();
    if (v.includes('argon') || v === 'argon_medium') {
      return {
        opt: 'argon_medium',
        curto: '🧠 4 Argon',
        completo: 'Antigravity · Gemini 4 Argon · Medium',
        modeloNome: 'Gemini 4 Argon',
        esforcoNome: 'Medium',
        toastMsg: '🧠 Chat DarkPlanner Desktop: Antigravity -> Gemini 4 Argon (Medium) selecionado!',
      };
    }
    if (v.includes('carbon') || v === 'gemini_4_carbon_high') {
      return {
        opt: 'gemini_4_carbon_high',
        curto: '♊ 4 Carbon High',
        completo: 'Antigravity · Gemini 4 Carbon · High',
        modeloNome: 'Gemini 4 Carbon',
        esforcoNome: 'High',
        toastMsg: '♊ Chat DarkPlanner Desktop: Antigravity -> Gemini 4 Carbon (High) selecionado!',
      };
    }
    return {
      opt: 'flash_high',
      curto: '⚡ 3.8 Flash',
      completo: 'Antigravity · Gemini 3.8 Flash · High',
      modeloNome: 'Gemini 3.8 Flash',
      esforcoNome: 'High',
      toastMsg: '⚡ Chat DarkPlanner Desktop: Antigravity -> Gemini 3.8 Flash (High) selecionado!',
    };
  };

  window.definirModeloChatDp = function (op, mostrarToast = true) {
    const info = window.obterInfoModeloChatDp(op);
    S.estChatDpOpcao = info.opt;
    try { localStorage.setItem('fd_chat_dp_opcao_v3', info.opt); } catch (_e) {}

    $$('.e-chk-chat-dp-opt').forEach(c => {
      c.checked = (c.getAttribute('data-chat-opt') || c.value) === info.opt;
    });
    const paresLbl = [
      ['#e-lbl-chat-dp-flash', 'flash_high', '#10b981', 'rgba(16,185,129,.14)', '#6ee7b7'],
      ['#e-lbl-chat-dp-argon', 'argon_medium', '#10b981', 'rgba(16,185,129,.14)', '#6ee7b7'],
      ['#e-lbl-chat-dp-carbon', 'gemini_4_carbon_high', '#22d3ee', 'rgba(34,211,238,.16)', '#67e8f9'],
    ];
    paresLbl.forEach(([sel, chave, corBorda, corBg, corTxt]) => {
      const lbl = $(sel);
      if (!lbl) return;
      const ativo = info.opt === chave;
      lbl.style.borderColor = ativo ? corBorda : 'var(--line)';
      lbl.style.background = ativo ? corBg : 'transparent';
      const b = lbl.querySelector('b');
      if (b) b.style.color = ativo ? corTxt : '#9ba3b0';
    });

    const selDrw = $('#fd-dp-live-model-sel');
    if (selDrw && selDrw.value !== info.opt) selDrw.value = info.opt;
    const effPill = $('#fd-dp-live-effort-pill');
    if (effPill) effPill.textContent = `⚡ ${info.esforcoNome}`;

    if (mostrarToast && typeof toast === 'function') {
      toast(info.toastMsg);
    }
    return info;
  };

  window.baixarArquivoModoRemoto = async function (url, payloadPost = null, nomePadrao = 'download_fabrica_dark.zip') {
    if (typeof toast === 'function') toast(`⏳ Preparando download: ${nomePadrao}…`);
    try {
      const opts = {credentials: 'same-origin'};
      if (payloadPost !== null) {
        opts.method = 'POST';
        opts.headers = {'Content-Type': 'application/json'};
        opts.body = JSON.stringify(payloadPost);
      }
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        let errTxt = `HTTP ${resp.status}`;
        try {
          const j = await resp.json();
          if (j && (j.erro || j.error)) errTxt = j.erro || j.error;
        } catch (_eJ) {}
        throw new Error(errTxt);
      }
      let nomeFinal = nomePadrao;
      const disp = resp.headers.get('Content-Disposition') || '';
      const mFn = disp.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      if (mFn && mFn[1]) {
        try { nomeFinal = decodeURIComponent(mFn[1].trim()); } catch (_eD) { nomeFinal = mFn[1].trim(); }
      }
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nomeFinal;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch (_eR) {}
        URL.revokeObjectURL(blobUrl);
      }, 2500);
      if (typeof toast === 'function') toast(`✅ Baixado com sucesso: ${nomeFinal} (salvo em Downloads)!`);
      return true;
    } catch (err) {
      if (payloadPost === null) {
        const aFb = document.createElement('a');
        aFb.href = url;
        aFb.download = nomePadrao;
        aFb.target = '_blank';
        document.body.appendChild(aFb);
        aFb.click();
        setTimeout(() => { try { document.body.removeChild(aFb); } catch (_eR2) {} }, 1000);
      } else if (typeof toast === 'function') {
        toast(`⚠️ ${err.message || 'Não foi possível gerar o ZIP.'}`, true);
      }
      return false;
    }
  };

  window.baixarPacoteSistemaZip = function () {
    return window.baixarArquivoModoRemoto(
      '/api/atualizacao/baixar-pacote',
      null,
      'PACOTE_ATUALIZACAO_ANTIGRAVITY_MAQUINA_LEO.zip',
    );
  };

  window.baixarProjetoAtualZip = function (extra = {}) {
    const tit = (extra.titulo || ($('#e-tit') && $('#e-tit').value) || S.estTitulo || '').trim();
    const payload = {
      pasta: extra.pasta || S.estPastaArquivosVideo || '',
      titulo: tit,
      vid: extra.vid || S.estVideoId || '',
      slug: extra.slug || '',
      job_id: extra.job_id || S.estAudioJobId || '',
      skill6_slug: extra.skill6_slug || ((S.estSkill6Pacote || {}).slug || ''),
      roteiro: extra.roteiro !== undefined ? extra.roteiro : (($('#e-rot') && $('#e-rot').value) || S.estRoteiro || ''),
      srt_texto: extra.srt_texto !== undefined ? extra.srt_texto : (S.estSrtEdited || S.estSrtTexto || ''),
    };
    const slugFn = (tit || 'Projeto_FabricaDark').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'Projeto_FabricaDark';
    return window.baixarArquivoModoRemoto(
      '/api/projetos-criados/baixar-zip',
      payload,
      `${slugFn}_PROJETO_COMPLETO.zip`,
    );
  };

  const _MAPA_ETAPAS_PROC = {
    p1: {num: 1, titulo: 'Estrutura de Blocos do Roteiro', acaoPadrao: 'estruturar_roteiro'},
    p2: {num: 2, titulo: 'Roteiro Completo Limpo (Narração)', acaoPadrao: 'escrever_roteiro_limpo'},
    p3_viral: {num: 3, titulo: 'Thumbnail 16:9 + Descrição SEO + Tags', acaoPadrao: 'gerar_pacote_viral'},
    p4: {num: 4, titulo: 'Narração MP3 + Legenda SRT Tempo VEO', acaoPadrao: 'gerar_audio_tts'},
    p5: {num: 4, titulo: 'Narração MP3 + Legenda SRT Tempo VEO', acaoPadrao: 'quebrar_srt_veo'},
    p6: {num: 5, titulo: 'Cenas & Prompts 1:1 com o SRT', acaoPadrao: 'gerar_prompts_cenas'},
    p7: {num: 6, titulo: 'Produção & Edição no DarkPlanner Desktop', acaoPadrao: 'conectar_darkplanner'},
  };

  function _carregarProcessosDpSalvos() {
    if (Array.isArray(S.dpProcessos)) return;
    try {
      const brutos = JSON.parse(localStorage.getItem('fd_dp_processos_v1') || '[]');
      S.dpProcessos = (Array.isArray(brutos) ? brutos.slice(-18) : []).map(p => {
        if (p && p.total_cenas > 0 && p.cenas_prontas > p.total_cenas) {
          p.cenas_prontas = p.total_cenas;
        }
        return p;
      });
    } catch (_e) {
      S.dpProcessos = [];
    }
    try {
      const glob = JSON.parse(localStorage.getItem('fd_dp_chat_global_v1') || '[]');
      S.dpChatGlobalMsgs = Array.isArray(glob) ? glob.slice(-25) : [];
    } catch (_eG) {
      S.dpChatGlobalMsgs = [];
    }
    if (S.dpMonitorMinimizado === undefined) {
      S.dpMonitorMinimizado = true;
    }
    S.dpMonitorExpandido = false;
    S.dpProcessoSelecionadoId = (S.dpProcessos[S.dpProcessos.length - 1] || {}).id || '';
  }

  function _salvarProcessosDp() {
    try {
      const enxuto = (S.dpProcessos || []).slice(-18).map(p => Object.assign({}, p, {
        eventos: (p.eventos || []).slice(-30),
        mensagens_chat: (p.mensagens_chat || []).slice(-25),
      }));
      localStorage.setItem('fd_dp_processos_v1', JSON.stringify(enxuto));
      localStorage.setItem('fd_dp_chat_global_v1', JSON.stringify((S.dpChatGlobalMsgs || []).slice(-25)));
      localStorage.setItem('fd_dp_monitor_min', S.dpMonitorMinimizado ? '1' : '0');
    } catch (_e) {}
  }

  function _fmtInlineCodeDp(texto) {
    return esc(String(texto || '')).replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function _fmtChatOpMsgDp(texto) {
    return esc(String(texto || ''))
      .replace(/\*\*([^*]+)\*\*/g, '<b style="color:#f8fafc">$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  const _ROTULOS_CHIPS_CHAT_OP = {
    parar_e_corrigir_app: 'Parar projeto e corrigir erro agora na automação Fábrica Dark',
    editar_codigo_site: 'Altere aqui no código/interface da Fábrica Dark: ',
    ajustar_roteiro_canal: 'Analisar o canal e ajustar a estrutura/roteiro deste projeto aqui na Fábrica Dark sem recriar do zero: ',
    mudar_estilo_formato_funcao: 'Quero que os vídeos deste canal tenham formato diferente, estilo cinematográfico escuro, legenda marca-texto e função de capítulos na tela',
    regularizar_gta_rockstar: '🎮 Configurar canal GTA à la Une 100% focado nos jogos GTA (fr-FR) com cenas Rockstar sem copyright',
    corrigir_erro_dp: 'Parar projeto e corrigir erro na Fábrica Dark: ',
    auditar_status: '🔍 Auditar status real da edição e das cenas agora no DarkPlanner Desktop',
    criar_conversa_dp: '💬 Abrir nova conversa deste projeto diretamente no Chat do DarkPlanner Desktop',
    reaplicar_edicao_studio: '🎬 Completar 100% das cenas faltantes no Studio + sincronia 1:1 + transições e efeitos',
  };
  const _CHIPS_ACAO_TECNICA_DIRETA = new Set(['parar_e_corrigir_app', 'auditar_status', 'criar_conversa_dp', 'regularizar_gta_rockstar', 'reaplicar_edicao_studio']);

  function _obterProcessoChatOpAtual() {
    const lista = S.dpProcessos || [];
    return lista.find(p => p.id === S.dpProcessoSelecionadoId)
      || lista.find(p => p.status === 'rodando')
      || lista[lista.length - 1]
      || null;
  }

  function _atualizarVisibilidadeBtnLimparInputDp() {
    const inp = $('#fd-dp-chat-input');
    const btnClr = $('#fd-dp-chat-clear-inp');
    if (btnClr && inp) {
      btnClr.style.display = inp.value.length > 0 ? 'inline-flex' : 'none';
    }
  }

  window.preencherSugestaoChatOpDp = function (chipKey, opcoes = {}) {
    _carregarProcessosDpSalvos();
    if (opcoes.abrirDrawer) {
      window.abrirMonitorProcessoDp();
    } else {
      window.garantirMonitorProcessoDpUI();
    }
    const inp = $('#fd-dp-chat-input');
    if (!inp) return;
    const textoSug = String(opcoes.textoCustom || _ROTULOS_CHIPS_CHAT_OP[chipKey] || chipKey || '').trim();
    const precisaEspaco = chipKey === 'corrigir_erro_dp' || chipKey === 'ajustar_roteiro_canal' || chipKey === 'editar_codigo_site';
    inp.value = precisaEspaco ? (textoSug + ' ') : textoSug;
    inp.dataset.acaoSugerida = _CHIPS_ACAO_TECNICA_DIRETA.has(chipKey) ? chipKey : '';
    inp.dataset.textoSugerido = inp.value.trim();
    _atualizarVisibilidadeBtnLimparInputDp();
    inp.focus();
    try {
      inp.setSelectionRange(inp.value.length, inp.value.length);
    } catch (_eSel) {}
  };

  window.limparCampoChatOpDp = function () {
    const inp = $('#fd-dp-chat-input');
    if (!inp) return;
    inp.value = '';
    inp.dataset.acaoSugerida = '';
    inp.dataset.textoSugerido = '';
    _atualizarVisibilidadeBtnLimparInputDp();
    inp.focus();
  };

  window.excluirMensagemChatOpDp = function (idxMsg) {
    _carregarProcessosDpSalvos();
    const proc = _obterProcessoChatOpAtual();
    const arr = proc ? (proc.mensagens_chat || []) : (S.dpChatGlobalMsgs || []);
    const idx = Number(idxMsg);
    if (!Array.isArray(arr) || isNaN(idx) || idx < 0 || idx >= arr.length) return;
    arr.splice(idx, 1);
    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();
  };

  window.editarMensagemChatOpDp = function (idxMsg) {
    _carregarProcessosDpSalvos();
    const proc = _obterProcessoChatOpAtual();
    const arr = proc ? (proc.mensagens_chat || []) : (S.dpChatGlobalMsgs || []);
    const idx = Number(idxMsg);
    if (!Array.isArray(arr) || isNaN(idx) || idx < 0 || idx >= arr.length) return;
    const item = arr[idx];
    const textoAntigo = String((item && item.texto) || '');
    arr.splice(idx, 1);
    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();
    const inp = $('#fd-dp-chat-input');
    if (inp) {
      inp.value = textoAntigo;
      inp.dataset.acaoSugerida = '';
      inp.dataset.textoSugerido = '';
      _atualizarVisibilidadeBtnLimparInputDp();
      inp.focus();
      try {
        inp.setSelectionRange(inp.value.length, inp.value.length);
      } catch (_eSel) {}
    }
  };

  window.limparHistoricoChatOpDp = function () {
    _carregarProcessosDpSalvos();
    const proc = _obterProcessoChatOpAtual();
    if (proc) {
      proc.mensagens_chat = [];
    } else {
      S.dpChatGlobalMsgs = [];
    }
    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();
    toast('🗑️ Mensagens do chat limpas!');
  };

  window.pararAutomacaoFabricaDark = function (motivo = '⏹️ Parado pelo usuário no Chat da Fábrica Dark') {
    S._automacaoParadaPeloUsuario = true;
    S.estRodandoEsteira = false;
    S._gerandoAudioBackendAgora = false;
    if (typeof window.abortarRequisicoesPipelineFabricaDark === 'function') {
      window.abortarRequisicoesPipelineFabricaDark(motivo);
    }
    if (Array.isArray(S.estLiveSteps)) {
      S.estLiveSteps.forEach(st => {
        if (st && st.status === 'rodando') {
          st.status = 'pendente';
          st.pct = 0;
          st.msg = motivo;
        }
      });
    }
    if (Array.isArray(S.filaProducao)) {
      S.filaProducao.forEach(it => {
        if (it && it.status === 'rodando') {
          it.status = 'erro';
          it.etapa_atual = '⏸ Pausado pelo Chat da Fábrica Dark — clique em ▶️ Continuar Etapa quando quiser';
          if (Array.isArray(it.live_steps)) {
            it.live_steps.forEach(s => {
              if (s && s.status === 'rodando') {
                s.status = 'pendente';
                s.pct = 0;
                s.msg = motivo;
              }
            });
          }
        }
      });
      if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
    }
    const btnEst = $('#e-btn-rodar-esteira');
    if (btnEst) {
      btnEst.disabled = false;
      btnEst.textContent = '🚀 Executar Passos Marcados';
    }
    const btnV8 = $('#e-v8-btn');
    if (btnV8) btnV8.disabled = false;
    const btnViral = $('#e-v8-viral-btn');
    if (btnViral) {
      btnViral.disabled = false;
      btnViral.textContent = '🖼 3️⃣ Descrição + Tags + Thumb';
    }
    const viralBox = $('#e-v8-viral-box');
    if (viralBox && viralBox.querySelector('.spin') && !S.estPacoteViral) {
      viralBox.style.display = 'none';
      viralBox.innerHTML = '';
    }
    if (typeof window.estAddLog === 'function') {
      window.estAddLog(`⏹️ ${motivo}`, 'info');
    } else if (typeof window.renderLiveLogEstudio === 'function') {
      window.renderLiveLogEstudio();
    }
  };

  window.limparErrosEtapasFabricaDark = function () {
    if (Array.isArray(S.estLiveSteps)) {
      S.estLiveSteps.forEach(st => {
        if (st && st.status === 'erro') {
          st.status = 'pendente';
          st.pct = 0;
          st.msg = '🛠️ Erro corrigido na Fábrica Dark — pronto para reexecutar';
        }
      });
    }
    if (typeof window.renderLiveLogEstudio === 'function') {
      window.renderLiveLogEstudio();
    }
  };

  window.reexecutarEtapaFabricaDarkPeloChat = async function (etapaChave = 'p1_estruturar') {
    S._automacaoParadaPeloUsuario = false;
    window.limparErrosEtapasFabricaDark();
    if (S.view !== 'estudio' && typeof go === 'function') {
      await go('estudio');
    }
    const chv = String(etapaChave || 'p1_estruturar').trim();
    toast(`▶️ Reexecutando ${chv} aqui na Fábrica Dark...`);
    if (chv === 'p1_estruturar' && typeof window.estRodarV8 === 'function') {
      await window.estRodarV8('estruturar');
    } else if (chv === 'p2_roteiro' && typeof window.estRodarV8 === 'function') {
      await window.estRodarV8('roteiro_completo');
    } else if (chv === 'p4_pacote_viral' && typeof window.gerarPacoteViralSobDemanda === 'function') {
      await window.gerarPacoteViralSobDemanda();
    } else if (chv === 'p5_audio_srt' && typeof window.estGerarAudioSrt === 'function') {
      S.estStep45Aberto = true;
      if (typeof window.atualizarVisibilidadeEtapas === 'function') window.atualizarVisibilidadeEtapas();
      await window.estGerarAudioSrt();
    } else if (chv === 'p6_cenas' && typeof window.estExecutarStep6 === 'function') {
      await window.estExecutarStep6();
    } else if (typeof window.estExecutarEsteira === 'function') {
      await window.estExecutarEsteira();
    }
  };

  window.pausarProcessoChatOpDp = async function (opcoes = {}) {
    _carregarProcessosDpSalvos();
    window._dpChatRunSeq = (window._dpChatRunSeq || 0) + 1;
    window._dpChatSending = false;
    if (window._dpOpPollTimer) {
      clearInterval(window._dpOpPollTimer);
      window._dpOpPollTimer = null;
    }
    window.pararAutomacaoFabricaDark('⏸ Pausado pelo usuário no Chat da Fábrica Dark');
    const btnSend = $('#fd-dp-chat-send');
    if (btnSend) {
      btnSend.disabled = false;
      btnSend.textContent = '➤';
    }

    const proc = _obterProcessoChatOpAtual();
    const spIdAlvo = String(opcoes.sp_id || (proc && proc.sp_id) || S.estUltSpId7 || '').trim();
    const nomeAlvo = String(opcoes.nome_projeto || (proc && proc.titulo) || ($('#e-tit') && $('#e-tit').value.trim()) || S.estTitulo || '').trim();
    const horaPausa = new Date().toLocaleTimeString('pt-BR', {hour12: false});
    const msgPausaUi = '⏹️ **Projeto e automação pausados aqui na Fábrica Dark!** *(Nada foi enviado ao DarkPlanner.)* Você pode editar/excluir o que escreveu ou pedir o ajuste que quiser nesta mesma conversa.';

    if (proc) {
      proc.status = 'pausado';
      proc.jobs_rodando = 0;
      proc.finalizado_em = Date.now();
      proc.linha1_progresso = '⏸ Pausado na Fábrica Dark — escreva abaixo ou retome quando quiser.';
      proc.linha2_acao = 'pausado_usuario';
      if (proc.etapas && proc.etapas.s6 && proc.etapas.s6.status === 'rodando') {
        proc.etapas.s6.status = 'pausado';
        proc.etapas.s6.detalhe = '⏸ Pausado manualmente pelo usuário.';
        proc.etapas.s6.hora = horaPausa;
      }
      if (!Array.isArray(proc.mensagens_chat)) proc.mensagens_chat = [];
      if (!opcoes.silencioso) {
        proc.mensagens_chat.push({de: 'ia', texto: msgPausaUi, hora: horaPausa, ok: true});
      }
    } else if (!opcoes.silencioso) {
      if (!Array.isArray(S.dpChatGlobalMsgs)) S.dpChatGlobalMsgs = [];
      S.dpChatGlobalMsgs.push({de: 'ia', texto: msgPausaUi, hora: horaPausa, ok: true});
    }

    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();

    try {
      await api('/api/chat-operacional/pausar', {
        json: {
          sp_id: spIdAlvo,
          nome_projeto: nomeAlvo,
          pausar_chat_dp: Boolean(S.estStep7Aberto && spIdAlvo),
        }
      });
    } catch (_eP) {}
    toast('⏹️ Automação pausada na Fábrica Dark!');
  };

  window.iniciarPollingOperacionalDp = function (spId, nomeProjeto, canalNome = '') {
    const chavePoll = String(spId || nomeProjeto || '').trim();
    if (!chavePoll) return;
    if (window._dpOpPollTimer) {
      clearInterval(window._dpOpPollTimer);
      window._dpOpPollTimer = null;
    }
    const t0 = Date.now();
    window._dpOpPollTimer = setInterval(async () => {
      if ((Date.now() - t0) > 2700000) {
        clearInterval(window._dpOpPollTimer);
        window._dpOpPollTimer = null;
        return;
      }
      try {
        const st7 = await api(`/api/darkplanner/status-etapa7?sp_id=${encodeURIComponent(spId || '')}&nome_projeto=${encodeURIComponent(nomeProjeto || '')}`);
        if (!st7 || st7.nao_encontrado) return;
        const pctNow = Math.max(15, Math.min(100, Number(st7.progresso_pct || 25)));
        const msgNow = st7.etapa_atual || 'Regularizando projeto diretamente no DarkPlanner Desktop…';
        const totCn = Number(st7.total_cenas || 0);
        const rawPrtCn = Number(st7.cenas_prontas || 0);
        const prtCn = totCn > 0 ? Math.min(totCn, rawPrtCn) : rawPrtCn;
        const rodCn = Number(st7.jobs_rodando || 0);
        const errCn = Number(st7.jobs_erros || 0);
        const acaoTec = st7.acao_tecnica || 'regularizando_dp';
        const concluiu = Boolean(st7.concluido_dp);
        const foiPausado = Boolean(st7.pausado || acaoTec === 'pausado_usuario');
        const deuErro = Boolean(!concluiu && !foiPausado && st7.em_andamento === false && st7.erro);

        window.registrarPassoProcessoDp({
          titulo: st7.nome_projeto || nomeProjeto || S.estTitulo || 'Projeto Atual',
          sp_id: st7.sp_id || spId || '',
          canal_nome: canalNome || st7.canal_nome || '',
          chat_modelo_opcao: st7.chat_modelo_opcao || S.estChatDpOpcao || 'gemini_4_carbon_high',
          stepKey: 'p7',
          stepStatus: concluiu ? 'ok' : (foiPausado ? 'pausado' : (deuErro ? 'erro' : 'rodando')),
          detalhe: msgNow,
          acao_tecnica: concluiu ? 'concluido' : acaoTec,
          cenas_prontas: prtCn,
          total_cenas: totCn,
          jobs_rodando: rodCn,
          jobs_erros: errCn,
          historico_acoes: st7.historico_acoes || [],
          progresso_pct: concluiu ? 100 : pctNow,
          concluirProjeto: concluiu,
        });

        // Sincroniza também o card da Etapa 7 na página se estiver visível!
        if ($('#e-step7-main-card')) {
          if (concluiu) {
            $('#e-step7-main-card').style.border = '1.5px solid #10b981';
            $('#e-step7-main-card').style.background = 'rgba(16,185,129,.08)';
            if ($('#e-step7-bg-title')) {
              $('#e-step7-bg-title').style.color = '#6ee7b7';
              $('#e-step7-bg-title').textContent = `✅ Etapa 7 100% Concluída no DarkPlanner Desktop: "${st7.nome_projeto || nomeProjeto}"!`;
            }
            if ($('#e-step7-bg-bar')) $('#e-step7-bg-bar').style.width = '100%';
            if ($('#e-step7-bg-pct')) $('#e-step7-bg-pct').textContent = '100%';
            if ($('#e-step7-bg-status')) {
              $('#e-step7-bg-status').style.color = '#6ee7b7';
              $('#e-step7-bg-status').textContent = `✅ ${msgNow}`;
            }
          } else if (foiPausado) {
            $('#e-step7-main-card').style.border = '1.5px solid #f59e0b';
            $('#e-step7-main-card').style.background = 'rgba(245,158,11,.08)';
            if ($('#e-step7-bg-title')) {
              $('#e-step7-bg-title').style.color = '#fde68a';
              $('#e-step7-bg-title').textContent = `⏸ Etapa 7 Pausada pelo Usuário: "${st7.nome_projeto || nomeProjeto}"`;
            }
            if ($('#e-step7-bg-status')) {
              $('#e-step7-bg-status').style.color = '#fde68a';
              $('#e-step7-bg-status').textContent = `⏸ ${msgNow}`;
            }
          } else if (!deuErro) {
            $('#e-step7-main-card').style.border = '1.5px solid #f59e0b';
            $('#e-step7-main-card').style.background = 'rgba(245,158,11,.08)';
            if ($('#e-step7-bg-title')) {
              $('#e-step7-bg-title').style.color = '#fde68a';
              $('#e-step7-bg-title').textContent = `⏳ Regularizando Direto no DarkPlanner Desktop: "${st7.nome_projeto || nomeProjeto}"…`;
            }
            if ($('#e-step7-bg-bar')) $('#e-step7-bg-bar').style.width = `${pctNow}%`;
            if ($('#e-step7-bg-pct')) $('#e-step7-bg-pct').textContent = `${pctNow}%`;
            if ($('#e-step7-bg-status')) {
              $('#e-step7-bg-status').style.color = '#fef3c7';
              $('#e-step7-bg-status').textContent = `⏳ ${msgNow}`;
            }
          }
        }

        if (concluiu || foiPausado || st7.em_andamento === false) {
          clearInterval(window._dpOpPollTimer);
          window._dpOpPollTimer = null;
        }
      } catch (_eOpP) {}
    }, 2500);
  };

  window.criarNovaConversaChatApp = function () {
    _carregarProcessosDpSalvos();
    const numConv = (S.dpProcessos || []).filter(p => String(p.id || '').startsWith('conv_')).length + 1;
    const idConv = 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const agoraH = new Date().toLocaleTimeString('pt-BR', {hour12: false});
    const titAtual = (($('#e-tit') && $('#e-tit').value.trim()) || S.estTitulo || '').trim();
    const nova = {
      id: idConv,
      sp_id: '',
      titulo: titAtual ? `Conversa #${numConv} · ${titAtual.slice(0, 28)}` : `Nova Conversa #${numConv}`,
      canal_nome: '',
      duracao_min: Number(($('#e-dur') && $('#e-dur').value) || S.estDur || 20),
      chat_modelo_opcao: S.estChatDpOpcao || 'gemini_4_carbon_high',
      status: 'pausado',
      progresso_pct: 0,
      iniciado_em: Date.now(),
      finalizado_em: Date.now(),
      cenas_prontas: 0,
      total_cenas: 0,
      jobs_rodando: 0,
      jobs_erros: 0,
      linha1_progresso: '🆕 Nova conversa independente iniciada — fale com Antigravity + Codex ou regularize um projeto.',
      linha2_acao: 'nova_conversa',
      pasta_arquivos_video: '',
      conversa_id: idConv,
      conversa_criada_real_dp: false,
      eh_conversa_livre: true,
      etapas: {},
      eventos: [],
      mensagens_chat: [{
        de: 'ia',
        texto: '🆕 **Nova conversa criada!**\n• Tudo o que você escrever aqui permanece **nesta mesma conversa** (se der erro e você responder, corrijo apenas o ponto pedido **sem gerar nova narração, novo ponto de vista ou novo roteiro do zero**).\n• Você também pode pedir alterações diretas em canais, roteiros, temas e configurações pelo **Agente Antigravity + Codex**.',
        hora: agoraH,
        ok: true,
      }],
    };
    S.dpProcessos.push(nova);
    if (S.dpProcessos.length > 24) S.dpProcessos = S.dpProcessos.slice(-24);
    S.dpProcessoSelecionadoId = idConv;
    S.dpForcarNovaConversa = true;
    S.dpMonitorMinimizado = false;
    _salvarProcessosDp();
    window.garantirMonitorProcessoDpUI();
    window.renderizarMonitorProcessoDpUI();
    const inp = $('#fd-dp-chat-input');
    if (inp) inp.focus();
    toast('➕ Nova conversa criada!');
  };

  window.excluirProjetoPeloChatDp = async function () {
    _carregarProcessosDpSalvos();
    const proc = _obterProcessoChatOpAtual();
    const itFila = proc ? (S.filaProducao || []).find(x => x.id_fila === proc.id) : null;
    const nomeAlvo = String((itFila && itFila.titulo) || (proc && proc.titulo) || ($('#e-tit') && $('#e-tit').value.trim()) || S.estTitulo || '').trim();
    const spIdAlvo = String((proc && proc.sp_id) || S.estUltSpId7 || '').trim();
    const vidAlvo = String((itFila && itFila.video_id) || (proc && proc.video_id) || S.estVideoId || '').trim();
    const pastaAlvo = String((itFila && itFila.pasta_arquivos_video) || (proc && proc.pasta_arquivos_video) || '').trim();
    if (!proc && !nomeAlvo) {
      toast('Nenhum projeto selecionado no Chat para excluir.', true);
      return;
    }
    const ehApenasConv = Boolean(proc && proc.eh_conversa_livre && !spIdAlvo && !vidAlvo && !pastaAlvo && !itFila);
    const msgConf = ehApenasConv
      ? `🗑️ Deseja excluir esta conversa "${proc.titulo}" do Chat?`
      : `🗑️ Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o projeto "${nomeAlvo || (proc && proc.titulo)}"?\n\nIsso vai apagá-lo do Chat, da Fila de Produção, dos Vídeos Criados, do DarkPlanner Desktop e da pasta de arquivos.`;
    if (!window.confirm(msgConf)) return;

    if (!ehApenasConv) {
      try {
        await api('/api/chat-operacional/executar', {
          json: {
            acao_rapida: 'excluir_projeto',
            mensagem: `Excluir projeto ${nomeAlvo}`,
            sp_id: spIdAlvo,
            nome_projeto: nomeAlvo,
            vid: vidAlvo,
            pasta: pastaAlvo,
            nova_conversa: false,
          }
        });
      } catch (_eDel) {
        try {
          await api('/api/projetos-criados/deletar', {
            json: {titulo: nomeAlvo, vid: vidAlvo, sp_id: spIdAlvo, pasta: pastaAlvo, apagar_arquivos: true}
          });
        } catch (_eDel2) {}
      }
    }

    if (proc) {
      S.dpProcessos = (S.dpProcessos || []).filter(p => p.id !== proc.id);
    }
    if (Array.isArray(S.filaProducao)) {
      const normTit = nomeAlvo.toLowerCase();
      S.filaProducao = S.filaProducao.filter(x => {
        if (proc && x.id_fila === proc.id) return false;
        if (normTit && !ehApenasConv && String(x.titulo || '').trim().toLowerCase() === normTit) return false;
        return true;
      });
      if (S.filaVinculadaId && !S.filaProducao.some(x => x.id_fila === S.filaVinculadaId)) {
        S.filaVinculadaId = (S.filaProducao[0] && S.filaProducao[0].id_fila) || '';
      }
      if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
    }
    if (!ehApenasConv && nomeAlvo && String(S.estTitulo || '').trim().toLowerCase() === nomeAlvo.toLowerCase()) {
      S.estTitulo = '';
      S.estVideoId = '';
      S.estUltSpId7 = '';
      if ($('#e-tit')) $('#e-tit').value = '';
    }
    const rest = S.dpProcessos || [];
    S.dpProcessoSelecionadoId = rest.length ? rest[rest.length - 1].id : '';
    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();
    if (typeof window.carregarListaVideosCriados === 'function') {
      window.carregarListaVideosCriados(false).catch(() => {});
    }
    toast(ehApenasConv ? '🗑️ Conversa excluída!' : `🗑️ Projeto "${nomeAlvo}" excluído por completo (Chat + Fila + Disco)!`);
  };

  window.enviarComandoChatOperacionalDp = async function (opcoes = {}) {
    _carregarProcessosDpSalvos();
    if (opcoes.abrirDrawer) {
      window.abrirMonitorProcessoDp();
    }
    const inp = $('#fd-dp-chat-input');
    const btnSend = $('#fd-dp-chat-send');
    let acaoRapida = String(opcoes.acao_rapida || '').trim();
    const msgDigitada = opcoes.mensagem !== undefined
      ? String(opcoes.mensagem || '').trim()
      : (inp ? inp.value.trim() : '');

    // Se o usuário selecionou uma sugestão rápida e apertou Enter sem alterá-la, preserva o identificador técnico junto com o texto!
    if (!acaoRapida && inp && inp.dataset.acaoSugerida && msgDigitada && msgDigitada === String(inp.dataset.textoSugerido || '').trim()) {
      acaoRapida = String(inp.dataset.acaoSugerida || '').trim();
    }

    if (acaoRapida === 'excluir_projeto') {
      if (inp) {
        inp.value = '';
        inp.dataset.acaoSugerida = '';
        inp.dataset.textoSugerido = '';
        _atualizarVisibilidadeBtnLimparInputDp();
      }
      await window.excluirProjetoPeloChatDp();
      return;
    }

    const textoExibicaoUser = msgDigitada || _ROTULOS_CHIPS_CHAT_OP[acaoRapida] || '';
    if (!textoExibicaoUser && !acaoRapida) return;

    const proc = _obterProcessoChatOpAtual();
    const itFilaVinc = proc ? (S.filaProducao || []).find(x => x.id_fila === proc.id) : null;
    const historicoAntes = proc
      ? (Array.isArray(proc.mensagens_chat) ? proc.mensagens_chat.slice(-12) : [])
      : (Array.isArray(S.dpChatGlobalMsgs) ? S.dpChatGlobalMsgs.slice(-12) : []);

    // Captura o retrato exato das etapas e logs da Fábrica Dark ANTES de parar o spinner em 0ms!
    const stepsFonte = (itFilaVinc && Array.isArray(itFilaVinc.live_steps) && itFilaVinc.live_steps.length)
      ? itFilaVinc.live_steps
      : (Array.isArray(S.estLiveSteps) ? S.estLiveSteps : []);
    const etapasSnapshot = stepsFonte.map(s => ({
      id: s.id || '',
      nome: s.nome || '',
      status: s.status || 'pendente',
      msg: s.msg || '',
    }));
    const logsFonte = (itFilaVinc && Array.isArray(itFilaVinc.live_logs) && itFilaVinc.live_logs.length)
      ? itFilaVinc.live_logs
      : (Array.isArray(S.estLiveLogs) ? S.estLiveLogs : []);
    const logsSnapshot = logsFonte.slice(-25).map(l => String((l && l.t) || l || ''));
    const estavaRodandoAntes = Boolean(
      S.estRodandoEsteira
      || S._processandoFilaAgora
      || etapasSnapshot.some(s => s.status === 'rodando')
    );

    // Proteção absoluta: se um pacote da Etapa 7 cair no campo do Chat da Fábrica Dark, NUNCA pausa a esteira — encaminha direto ao DarkPlanner Desktop!
    const ehPacoteEtapa7Colado = /#\s*(PRODUÇÃO AUTOMÁTICA NO DARKPLANNER DESKTOP|MONTAGEM E EDIÇÃO IMEDIATA NO DARKPLANNER STUDIO)/i.test(msgDigitada);
    if (ehPacoteEtapa7Colado) {
      if (inp) {
        inp.value = '';
        inp.dataset.acaoSugerida = '';
        inp.dataset.textoSugerido = '';
        inp.blur();
        _atualizarVisibilidadeBtnLimparInputDp();
      }
      toast('🎯 Enviando pacote diretamente para o DarkPlanner Desktop (Dark Planner.exe)…');
      try {
        await api('/api/darkplanner/acao', {
          json: {
            acao: 'enviar_chat',
            mensagem: msgDigitada,
            nova_conversa: true,
            titulo_conversa: (proc && proc.titulo) || S.estTitulo || 'Projeto Fábrica Dark',
            chat_modelo_opcao: S.estChatDpOpcao || 'flash_high',
          }
        });
      } catch (_eRedir) {}
      return;
    }

    // Se o comando curto pede parar/pausar/interromper (ex.: "parar projeto e corrigir erro"), aborta IMEDIATAMENTE (0ms) na Fábrica Dark!
    const pediuPararNaMsg = (msgDigitada.length < 400 && /\b(parar|pausar|interromper|cancelar|pare)\b/i.test(msgDigitada))
      || acaoRapida === 'parar_e_corrigir_app';
    if (pediuPararNaMsg && typeof window.pararAutomacaoFabricaDark === 'function') {
      window.pararAutomacaoFabricaDark('⏹️ Parado imediatamente pelo Chat da Fábrica Dark');
    }

    const agoraHora = new Date().toLocaleTimeString('pt-BR', {hour12: false});
    const msgUserObj = {de: 'eu', texto: textoExibicaoUser, hora: agoraHora};
    if (proc) {
      if (!Array.isArray(proc.mensagens_chat)) proc.mensagens_chat = [];
      proc.mensagens_chat.push(msgUserObj);
    } else {
      if (!Array.isArray(S.dpChatGlobalMsgs)) S.dpChatGlobalMsgs = [];
      S.dpChatGlobalMsgs.push(msgUserObj);
    }
    if (inp && opcoes.mensagem === undefined) {
      inp.value = '';
      inp.dataset.acaoSugerida = '';
      inp.dataset.textoSugerido = '';
      _atualizarVisibilidadeBtnLimparInputDp();
    }

    const meuRunSeq = (window._dpChatRunSeq || 0) + 1;
    window._dpChatRunSeq = meuRunSeq;
    window._dpChatSending = true;

    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();

    if (btnSend) {
      btnSend.disabled = true;
      btnSend.textContent = '⏳';
    }
    try {
      const selCanalEl = $('#e-canal');
      const canalIdAtual = (selCanalEl && selCanalEl.value) || S.estCanal || '';
      const canalNomeOpt = (selCanalEl && selCanalEl.selectedOptions && selCanalEl.selectedOptions[0])
        ? selCanalEl.selectedOptions[0].textContent.trim()
        : '';
      const modOpt = ($('#fd-dp-live-model-sel') && $('#fd-dp-live-model-sel').value) || S.estChatDpOpcao || 'gemini_4_carbon_high';
      const modoAgSel = ($('#fd-dp-agent-mode-sel') && $('#fd-dp-agent-mode-sel').value) || S.dpChatModoAgente || 'auto';
      const usarNovaConv = Boolean(opcoes.nova_conversa === true || S.dpForcarNovaConversa === true);
      S.dpForcarNovaConversa = false;
      const rotContexto = ($('#e-rot') && $('#e-rot').value.trim()) || (itFilaVinc && itFilaVinc.roteiro) || S.estRoteiro || '';
      const estContexto = S.estUltimaRespostaV8Limpa || ($('#e-v8-txt') && $('#e-v8-txt').textContent.trim()) || (itFilaVinc && itFilaVinc.estrutura_txt) || '';
      const step7Ativo = Boolean(
        etapasSnapshot.some(s => s.id === 'p7' && (s.status === 'rodando' || s.status === 'ok'))
        || (proc && proc.conversa_criada_real_dp)
      );

      const res = await api('/api/chat-operacional/executar', {
        json: {
          mensagem: msgDigitada,
          acao_rapida: acaoRapida,
          modo_agente: modoAgSel === 'antigravity_codex' ? 'antigravity_codex' : '',
          nova_conversa: usarNovaConv,
          manter_mesma_conversa: !usarNovaConv,
          historico: historicoAntes,
          roteiro_atual: rotContexto,
          estrutura_atual: estContexto,
          etapas_app: etapasSnapshot,
          logs_recentes_app: logsSnapshot,
          esteira_rodando: estavaRodandoAntes,
          ja_na_etapa7: step7Ativo,
          sp_id: (proc && proc.sp_id) || S.estUltSpId7 || '',
          nome_projeto: (proc && !proc.eh_conversa_livre ? proc.titulo : '') || ($('#e-tit') && $('#e-tit').value.trim()) || S.estTitulo || '',
          canal_id: (itFilaVinc && itFilaVinc.canal_id) || canalIdAtual,
          canal_nome: (proc && proc.canal_nome) || canalNomeOpt || '',
          vid: (itFilaVinc && itFilaVinc.video_id) || S.estVideoId || '',
          job_id: (itFilaVinc && itFilaVinc.job_id) || S.estJobId || S.estAudioJobId || '',
          srt_texto: (itFilaVinc && itFilaVinc.srt_texto) || S.estSrtEdited || S.estSrtTexto || '',
          chat_modelo_opcao: modOpt,
        }
      });
      // Se o usuário clicou em Pausar enquanto a requisição estava em trânsito, ignora resposta tardia!
      if (window._dpChatRunSeq !== meuRunSeq) return;

      // Se o comando excluiu o projeto por texto ("excluir projeto"), remove da lista local também!
      if (res && res.projeto_excluido) {
        if (proc) {
          S.dpProcessos = (S.dpProcessos || []).filter(p => p.id !== proc.id);
        }
        if (Array.isArray(S.filaProducao) && res.nome_projeto) {
          const nLow = String(res.nome_projeto || '').trim().toLowerCase();
          S.filaProducao = S.filaProducao.filter(x => (proc ? x.id_fila !== proc.id : true) && String(x.titulo || '').trim().toLowerCase() !== nLow);
          if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
        }
        const restAfter = S.dpProcessos || [];
        S.dpProcessoSelecionadoId = restAfter.length ? restAfter[restAfter.length - 1].id : '';
        if (!Array.isArray(S.dpChatGlobalMsgs)) S.dpChatGlobalMsgs = [];
        S.dpChatGlobalMsgs.push({
          de: 'ia',
          texto: res.resposta || '🗑️ Projeto excluído por completo!',
          hora: new Date().toLocaleTimeString('pt-BR', {hour12: false}),
          ok: true,
        });
        _salvarProcessosDp();
        window.renderizarMonitorProcessoDpUI();
        toast('🗑️ Projeto excluído pelo Chat!');
        return;
      }

      if (res && res.parar_automacao_app && !pediuPararNaMsg && typeof window.pararAutomacaoFabricaDark === 'function') {
        window.pararAutomacaoFabricaDark('⏹️ Automação parada na Fábrica Dark');
      }
      if (res && res.limpar_erros_etapas && typeof window.limparErrosEtapasFabricaDark === 'function') {
        window.limparErrosEtapasFabricaDark();
      }

      // Se o Agente atualizou a estrutura ou o roteiro na Fábrica Dark, aplica na hora sem recriar narração!
      if (res && res.nova_estrutura && typeof res.nova_estrutura === 'string' && res.nova_estrutura.trim().length > 20) {
        S.estUltimaRespostaV8Limpa = res.nova_estrutura;
        if ($('#e-v8-out')) $('#e-v8-out').style.display = '';
        if ($('#e-v8-txt')) $('#e-v8-txt').textContent = res.nova_estrutura;
        if (itFilaVinc) itFilaVinc.estrutura_txt = res.nova_estrutura;
      }
      if (res && res.novo_roteiro && typeof res.novo_roteiro === 'string' && res.novo_roteiro.trim().length > 20) {
        S.estRoteiro = res.novo_roteiro;
        if ($('#e-rot')) {
          $('#e-rot').value = res.novo_roteiro;
          $('#e-rot').dispatchEvent(new Event('input'));
        }
        if (itFilaVinc) {
          itFilaVinc.roteiro = res.novo_roteiro;
        }
        toast('✏️ Roteiro atualizado na Fábrica Dark (sem recriar do zero)!');
      }

      // Aplica na hora na tela da Fábrica Dark as mudanças de Estilo, Formato, Proporção de Mídia e Funções!
      if (res && res.ui_patch && typeof res.ui_patch === 'object') {
        const up = res.ui_patch;
        if (up.edicao_config && typeof up.edicao_config === 'object') {
          const edP = up.edicao_config;
          const mapPredef = {sys_tudo: 'sys_tudo', sys_doc: 'sys_doc_classico', sys_doc_classico: 'sys_doc_classico', doc: 'sys_doc_classico', documentario: 'sys_doc_classico', sys_cinema: 'sys_cinema', cinema: 'sys_cinema', cinematografico: 'sys_cinema', sys_minimalista: 'pemuh61p9a', minimalista: 'pemuh61p9a', sys_dinamico: 'pemuip9b05', dinamico: 'pemuip9b05'};
          const mapDest = {equilibrado: 'equilibrado', dinamico: 'dinamico', rapido: 'dinamico', discreto: 'minimal', minimal: 'minimal', minimalista: 'minimal', nenhum: 'nenhum'};
          const mapLeg = {marca_texto: 'highlight', highlight: 'highlight', karaoke: 'kinetic', kinetic: 'kinetic', dinamica: 'kinetic', minimalista: 'serif_doc', serif_doc: 'serif_doc', typewriter: 'typewriter_doc', typewriter_doc: 'typewriter_doc', caixa_escura: 'impact', impact: 'impact', impacto: 'impact'};
          const mapLook = {cinematografico: 'doc_dark', contraste: 'doc_dark', alto_contraste: 'doc_dark', escuro: 'doc_dark', sombrio: 'doc_dark', doc_dark: 'doc_dark', quente: 'golden_hour', golden_hour: 'golden_hour', frio: 'moonlight', moonlight: 'moonlight', retro: 'retro_vhs', vhs: 'retro_vhs', retro_vhs: 'retro_vhs', neutro: 'original', original: 'original'};

          if (edP.predef) {
            const pv = mapPredef[edP.predef] || edP.predef;
            S.estEdPredef = pv;
            if ($('#e-ed-predef')) $('#e-ed-predef').value = pv;
          }
          if (edP.densidade_destaques) {
            const dv = mapDest[edP.densidade_destaques] || edP.densidade_destaques;
            S.estEdDestaques = dv;
            if ($('#e-ed-destaques')) $('#e-ed-destaques').value = dv;
          }
          if (edP.legenda_estilo) {
            if (edP.legenda_estilo === 'sem_legenda') {
              S.estEdMostrarLeg = false;
              if ($('#e-ed-mostrar-leg')) $('#e-ed-mostrar-leg').checked = false;
            } else {
              S.estEdMostrarLeg = true;
              if ($('#e-ed-mostrar-leg')) $('#e-ed-mostrar-leg').checked = true;
              const lv = mapLeg[edP.legenda_estilo] || edP.legenda_estilo;
              S.estEdLegEstilo = lv;
              if ($('#e-ed-leg-estilo')) $('#e-ed-leg-estilo').value = lv;
            }
          }
          if (edP.look_cor) {
            const kv = mapLook[edP.look_cor] || edP.look_cor;
            S.estEdLook = kv;
            if ($('#e-ed-look')) $('#e-ed-look').value = kv;
          }
          if (edP.instrucoes_custom) {
            S.estEdCustom = edP.instrucoes_custom;
            if ($('#e-ed-custom')) $('#e-ed-custom').value = edP.instrucoes_custom;
          }
        }
        if (up.estilo_visual && $('#e-s6-style')) {
          $('#e-s6-style').value = up.estilo_visual;
        }
        if (up.modo_midia_custom) {
          S.estSkillModo = up.modo_midia_custom === 'video_real' || up.modo_midia_custom === 'gta_rockstar_real' ? 'video_real' : 'ia_flow';
        }
        toast('⚡ Formato, estilo e funções salvos na Fábrica Dark (prontos para levar ao DarkPlanner na Etapa 7)!');
      }

      if (res && ((Array.isArray(res.acoes_executadas) && res.acoes_executadas.length) || (Array.isArray(res.alteracoes) && res.alteracoes.length) || (Array.isArray(res.arquivos_editados) && res.arquivos_editados.length) || res.sincronizado_darkplanner)) {
        api('/api/channels').then(chs => { if (Array.isArray(chs)) S.channels = chs; }).catch(() => {});
        api('/api/settings').then(st => { if (st && typeof st === 'object') S.settings = st; }).catch(() => {});
      }

      const horaResp = new Date().toLocaleTimeString('pt-BR', {hour12: false});
      const prefixoProv = (res && res.provedor) ? `*[${res.provedor}]*\n` : '';
      const msgIaObj = {
        de: 'ia',
        texto: prefixoProv + ((res && res.resposta) || 'Comando processado aqui na Fábrica Dark.'),
        hora: horaResp,
        ok: !(res && res.ok === false),
        botao_reexecutar: (res && res.etapa_sugerida_botao && res.etapa_sugerida_botao.chave)
          ? res.etapa_sugerida_botao
          : null,
      };
      let procAlvo = proc;
      if (!procAlvo && res && res.nome_projeto) {
        procAlvo = window.obterOuCriarProcessoDp(res.nome_projeto, {
          titulo: res.nome_projeto,
          sp_id: res.sp_id || '',
          status: res.em_andamento ? 'rodando' : (res.pausado ? 'pausado' : 'concluido'),
        });
      }
      if (procAlvo) {
        if (!Array.isArray(procAlvo.mensagens_chat)) procAlvo.mensagens_chat = [];
        procAlvo.mensagens_chat.push(msgIaObj);
        if (res && res.sp_id) procAlvo.sp_id = res.sp_id;
        if (res && res.conversa_criada_real_dp) {
          procAlvo.conversa_criada_real_dp = true;
          const pillConv = $('#e-step7-conv-pill');
          if (pillConv) {
            pillConv.className = 'pill ok';
            pillConv.textContent = '💬 Conversa Ativa no Chat DP (Multi)';
          }
          const btnConv = $('#e-step7-btn-criar-conv-dp');
          if (btnConv) btnConv.style.display = 'none';
        }
        if (res && res.pausado) {
          procAlvo.status = 'pausado';
          procAlvo.jobs_rodando = 0;
          procAlvo.finalizado_em = Date.now();
          procAlvo.linha1_progresso = '⏹️ Automação pausada na Fábrica Dark.';
          procAlvo.linha2_acao = 'pausado_usuario';
        } else if (res && res.em_andamento && (res.enviado_direto_chat_dp || res.modo_remoto_vinculado_pc)) {
          procAlvo.status = 'rodando';
          procAlvo.iniciado_em = Date.now();
          procAlvo.finalizado_em = 0;
          window.iniciarPollingOperacionalDp(res.sp_id || procAlvo.sp_id, res.nome_projeto || procAlvo.titulo, procAlvo.canal_nome || '');
        }
      } else {
        S.dpChatGlobalMsgs.push(msgIaObj);
      }
      _salvarProcessosDp();
      window.renderizarMonitorProcessoDpUI();

      // Se o Agente Desenvolvedor editou arquivos visuais (`static/v4.js`, `static/app.js`, `static/index.html`, `static/style.css`),
      // atualiza a interface automaticamente quando nenhuma esteira estiver rodando!
      if (res && res.recarregar_frontend) {
        toast('🔄 Código visual atualizado pelo Agente — aplicando alterações na interface…');
        if (!S.estRodandoEsteira && !S._processandoFilaAgora) {
          setTimeout(() => {
            window.location.reload();
          }, 1400);
        }
      }

      // Se o usuário pediu para corrigir e continuar na mesma mensagem, dispara a etapa corrigida automaticamente na Fábrica Dark!
      if (res && res.reexecutar_etapa_app && typeof window.reexecutarEtapaFabricaDarkPeloChat === 'function') {
        setTimeout(() => {
          window.reexecutarEtapaFabricaDarkPeloChat(res.reexecutar_etapa_app).catch(() => {});
        }, 250);
      }
    } catch (eChat) {
      if (window._dpChatRunSeq !== meuRunSeq) return;
      const msgErr = {
        de: 'ia',
        texto: `⚠️ Erro ao executar comando na Fábrica Dark: \`${(eChat && eChat.message) || eChat}\``,
        hora: new Date().toLocaleTimeString('pt-BR', {hour12: false}),
        ok: false,
      };
      if (proc) {
        if (!Array.isArray(proc.mensagens_chat)) proc.mensagens_chat = [];
        proc.mensagens_chat.push(msgErr);
      } else {
        S.dpChatGlobalMsgs.push(msgErr);
      }
      _salvarProcessosDp();
      window.renderizarMonitorProcessoDpUI();
    } finally {
      if (window._dpChatRunSeq === meuRunSeq) {
        window._dpChatSending = false;
      }
      if (btnSend) {
        btnSend.disabled = false;
        btnSend.textContent = '➤';
      }
      window.renderizarMonitorProcessoDpUI();
    }
  };

  window.obterOuCriarProcessoDp = function (idOuTitulo, meta = {}) {
    _carregarProcessosDpSalvos();
    const rawKey = String(idOuTitulo || meta.titulo || S.estTitulo || 'Projeto Atual').trim();
    const idNorm = meta.id || (rawKey.startsWith('fila_') || rawKey.startsWith('proc_') || rawKey.startsWith('conv_')
      ? rawKey
      : 'proc_' + rawKey.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48));
    let proc = S.dpProcessos.find(p => p.id === idNorm);
    if (!proc) {
      proc = {
        id: idNorm,
        sp_id: meta.sp_id || '',
        titulo: meta.titulo || S.estTitulo || rawKey,
        canal_nome: meta.canal_nome || '',
        duracao_min: meta.duracao_min || S.estDur || 20,
        chat_modelo_opcao: meta.chat_modelo_opcao || S.estChatDpOpcao || 'flash_high',
        status: meta.status || 'rodando',
        progresso_pct: meta.progresso_pct || 5,
        iniciado_em: meta.iniciado_em || Date.now(),
        finalizado_em: 0,
        cenas_prontas: 0,
        total_cenas: meta.total_cenas || 0,
        jobs_rodando: 0,
        jobs_erros: 0,
        linha1_progresso: meta.linha1_progresso || 'Iniciando pipeline de produção do projeto...',
        linha2_acao: meta.linha2_acao || 'iniciar_projeto',
        pasta_arquivos_video: meta.pasta_arquivos_video || '',
        conversa_id: meta.conversa_id || '',
        conversa_criada_real_dp: Boolean(meta.conversa_criada_real_dp),
        etapas: {},
        eventos: [],
        mensagens_chat: [],
      };
      S.dpProcessos.push(proc);
      if (S.dpProcessos.length > 24) S.dpProcessos = S.dpProcessos.slice(-24);
    }
    Object.keys(meta || {}).forEach(k => {
      if (meta[k] !== undefined && meta[k] !== '' && k !== 'etapas' && k !== 'eventos' && k !== 'mensagens_chat') {
        proc[k] = meta[k];
      }
    });
    return proc;
  };

  window.registrarPassoProcessoDp = function (opcoes = {}) {
    _carregarProcessosDpSalvos();
    const proc = window.obterOuCriarProcessoDp(opcoes.procId || opcoes.titulo, opcoes);
    const stepInfo = _MAPA_ETAPAS_PROC[opcoes.stepKey] || {num: 6, titulo: opcoes.stepTitulo || 'Processo em Execução', acaoPadrao: 'processar'};
    const chaveNum = 's' + stepInfo.num;
    const statusPasso = opcoes.stepStatus || 'rodando';
    const agoraHora = new Date().toLocaleTimeString('pt-BR', {hour12: false});

    if (statusPasso === 'rodando' && proc.status !== 'rodando') {
      proc.status = 'rodando';
      proc.iniciado_em = Date.now();
      proc.finalizado_em = 0;
    }

    proc.etapas[chaveNum] = {
      num: stepInfo.num,
      titulo: stepInfo.titulo,
      status: statusPasso,
      detalhe: opcoes.detalhe || '',
      hora: agoraHora,
    };

    if (opcoes.progresso_pct !== undefined) proc.progresso_pct = opcoes.progresso_pct;
    if (opcoes.total_cenas !== undefined) proc.total_cenas = Number(opcoes.total_cenas || 0);
    if (opcoes.cenas_prontas !== undefined) {
      const rawPrt = Number(opcoes.cenas_prontas || 0);
      proc.cenas_prontas = proc.total_cenas > 0 ? Math.min(proc.total_cenas, rawPrt) : rawPrt;
    } else if (proc.total_cenas > 0 && proc.cenas_prontas > proc.total_cenas) {
      proc.cenas_prontas = proc.total_cenas;
    }
    if (opcoes.jobs_rodando !== undefined) proc.jobs_rodando = Number(opcoes.jobs_rodando || 0);
    if (opcoes.jobs_erros !== undefined) proc.jobs_erros = Number(opcoes.jobs_erros || 0);
    if (opcoes.pasta_arquivos_video) proc.pasta_arquivos_video = opcoes.pasta_arquivos_video;
    if (opcoes.conversa_id) proc.conversa_id = opcoes.conversa_id;

    const acaoTec = opcoes.acao_tecnica || stepInfo.acaoPadrao;
    proc.linha2_acao = acaoTec;

    if (opcoes.linha1_progresso) {
      proc.linha1_progresso = opcoes.linha1_progresso;
    } else if (opcoes.detalhe) {
      proc.linha1_progresso = opcoes.detalhe;
    }

    if (opcoes.concluirProjeto || (stepInfo.num === 6 && statusPasso === 'ok')) {
      proc.status = 'concluido';
      proc.progresso_pct = 100;
      proc.jobs_rodando = 0;
      proc.linha2_acao = 'concluido';
      if (!proc.finalizado_em) proc.finalizado_em = Date.now();
    } else if (statusPasso === 'pausado') {
      proc.status = 'pausado';
      proc.jobs_rodando = 0;
      proc.linha2_acao = 'pausado_usuario';
      if (!proc.finalizado_em) proc.finalizado_em = Date.now();
    } else if (statusPasso === 'erro') {
      proc.status = 'erro';
      proc.jobs_rodando = 0;
      if (!proc.finalizado_em) proc.finalizado_em = Date.now();
    }

    if (opcoes.selecionar !== false) {
      S.dpProcessoSelecionadoId = proc.id;
    }
    _salvarProcessosDp();
    window.renderizarMonitorProcessoDpUI();
    return proc;
  };

  window.abrirMonitorProcessoDp = function (procId = '') {
    _carregarProcessosDpSalvos();
    if (procId) S.dpProcessoSelecionadoId = procId;
    S.dpMonitorMinimizado = false;
    S.dpMonitorManualFechado = false;
    _salvarProcessosDp();
    window.garantirMonitorProcessoDpUI();
    window.renderizarMonitorProcessoDpUI();
  };

  window.minimizarMonitorProcessoDp = function () {
    _carregarProcessosDpSalvos();
    S.dpMonitorMinimizado = true;
    S.dpMonitorManualFechado = true;
    _salvarProcessosDp();
    window.garantirMonitorProcessoDpUI();
    window.renderizarMonitorProcessoDpUI();
  };

  window.garantirMonitorProcessoDpUI = function () {
    _carregarProcessosDpSalvos();
    if (!$('#fd-dp-live-fab')) {
      const fab = document.createElement('button');
      fab.type = 'button';
      fab.id = 'fd-dp-live-fab';
      fab.style.display = 'none';
      fab.title = 'Abrir Chat da automação Fábrica Dark (parar/corrigir erros, analisar canais, roteiros e estilos)';
      fab.onclick = () => window.abrirMonitorProcessoDp();
      document.body.appendChild(fab);
    }
    if (!$('#fd-dp-live-drawer')) {
      const drw = document.createElement('div');
      drw.id = 'fd-dp-live-drawer';
      drw.className = 'oculto';
      const infoMod = window.obterInfoModeloChatDp(S.estChatDpOpcao);
      drw.innerHTML = `
        <div class="dp-drw-head" style="flex-wrap:wrap;gap:6px">
          <span class="dp-drw-tab" id="fd-dp-tab-title" style="font-weight:700">💬 Chat · Fábrica Dark</span>
          <span class="pill ok" style="font-size:9.5px;padding:1px 6px">🤖 Antigravity Local</span>
          <select id="fd-dp-proc-sel" title="Selecionar conversa ou projeto vinculado" style="flex:1;min-width:120px;max-width:175px;padding:3px 6px;font-size:11px;background:#23262f;border:1px solid #323642;color:#e5e7eb;border-radius:6px"></select>
          <button type="button" class="dp-drw-iconbtn" id="fd-dp-btn-new-conv" title="Criar nova conversa limpa" style="color:#6ee7b7;font-weight:700;border-color:rgba(16,185,129,.45);padding:4px 8px">➕ Nova</button>
          <button type="button" class="dp-drw-iconbtn" id="fd-dp-btn-del-proj" title="Excluir definitivamente o projeto vinculado" style="color:#fca5a5;font-weight:700;border-color:rgba(239,68,68,.45);padding:4px 8px">🗑️ Excluir Projeto</button>
          <button type="button" class="dp-drw-iconbtn" id="fd-dp-btn-expand" title="Expandir / Reduzir tamanho do chat">↗</button>
          <button type="button" class="dp-drw-iconbtn" id="fd-dp-btn-min" title="Fechar / Minimizar chat" style="color:#cbd5e1;font-weight:700;padding:4px 8px">✕</button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:#141821;border-bottom:1px solid #262b36;font-size:11px;flex-wrap:wrap">
          <select id="fd-dp-agent-mode-sel" title="Modo do Chat da Fábrica Dark" style="padding:3px 6px;font-size:11px;background:#0d1117;border:1px solid #10b981;color:#6ee7b7;border-radius:5px;font-weight:600;flex:1;min-width:155px">
            <option value="auto">🤖 Antigravity + Automação (Código, Canais, Roteiro & Correções)</option>
            <option value="antigravity_codex">💻 Modo Desenvolvedor Direto (Ler/Editar Código & Hot-Reload)</option>
          </select>
          <select id="fd-dp-live-model-sel" class="dp-foot-sel" title="Modelo do Chat" style="max-width:140px">
            <option value="gemini_4_carbon_high">♊ Carbon · High</option>
            <option value="flash_high">⚡ Flash · High</option>
            <option value="argon_medium">🧠 Argon · Medium</option>
          </select>
          <button type="button" class="dp-drw-iconbtn" id="fd-dp-btn-link-acc" title="Vincular contas Antigravity e OpenAI Codex" style="font-size:10.5px;padding:2px 7px;color:#fde68a;border-color:rgba(245,158,11,.4)">🔑 Contas</button>
        </div>
        <div class="dp-drw-feed" id="fd-dp-live-feed"></div>
        <div class="dp-live-rows" id="fd-dp-live-working" style="display:none"></div>
        <div class="dp-drw-chat-composer">
          <div class="dp-drw-quick-chips" style="gap:5px;flex-wrap:wrap">
            <button type="button" class="dp-chip-btn" data-dp-chip="parar_e_corrigir_app" title="Preenche no campo abaixo para você revisar antes de dar Enter">⏹️🛠️ Parar e Corrigir</button>
            <button type="button" class="dp-chip-btn" data-dp-chip="editar_codigo_site" title="Preenche no campo abaixo para você revisar antes de dar Enter">💻 Código / Site</button>
            <button type="button" class="dp-chip-btn" data-dp-chip="ajustar_roteiro_canal" title="Preenche no campo abaixo para você revisar antes de dar Enter">📝 Roteiro / Canal</button>
            <button type="button" class="dp-chip-btn" data-dp-chip="mudar_estilo_formato_funcao" title="Preenche no campo abaixo para você revisar antes de dar Enter">🎨 Estilo / Função</button>
            <button type="button" class="dp-chip-btn gta" data-dp-chip="regularizar_gta_rockstar" title="Preenche no campo abaixo para você revisar antes de dar Enter">🎮 GTA 100% Jogos</button>
            <button type="button" class="dp-chip-btn danger-lite" id="fd-dp-chat-clear-all" style="margin-left:auto" title="Limpar apenas as mensagens escritas neste chat">🧹 Limpar</button>
          </div>
          <div class="dp-chat-input-row">
            <div class="dp-chat-input-wrap">
              <textarea id="fd-dp-chat-input" rows="2" placeholder="Fale exatamente como no Antigravity: peça para editar código/tela, corrigir qualquer erro, ajustar canal/roteiro ou controlar o DarkPlanner!"></textarea>
              <button type="button" id="fd-dp-chat-clear-inp" title="Apagar o texto do campo">✕</button>
            </div>
            <button type="button" id="fd-dp-chat-pause" title="Parar / Pausar imediatamente a automação na Fábrica Dark" style="display:none">⏸</button>
            <button type="button" id="fd-dp-chat-send" title="Enviar (Enter)">➤</button>
          </div>
        </div>`;
      document.body.appendChild(drw);

      $('#fd-dp-btn-min').onclick = () => window.minimizarMonitorProcessoDp();
      $('#fd-dp-btn-new-conv').onclick = () => window.criarNovaConversaChatApp();
      $('#fd-dp-btn-del-proj').onclick = () => window.excluirProjetoPeloChatDp();
      $('#fd-dp-btn-link-acc').onclick = () => {
        window.minimizarMonitorProcessoDp();
        go('conexoes');
      };
      const selAgMode = $('#fd-dp-agent-mode-sel');
      if (selAgMode) {
        selAgMode.value = S.dpChatModoAgente || 'auto';
        selAgMode.onchange = e => { S.dpChatModoAgente = e.target.value; };
      }
      $('#fd-dp-btn-expand').onclick = () => {
        S.dpMonitorExpandido = !S.dpMonitorExpandido;
        drw.classList.toggle('expandido', S.dpMonitorExpandido);
        $('#fd-dp-btn-expand').textContent = S.dpMonitorExpandido ? '↙' : '↗';
      };
      $('#fd-dp-proc-sel').onchange = e => {
        S.dpProcessoSelecionadoId = e.target.value;
        S.dpForcarNovaConversa = false;
        window.renderizarMonitorProcessoDpUI();
      };
      const selMod = $('#fd-dp-live-model-sel');
      selMod.value = infoMod.opt;
      selMod.onchange = e => window.definirModeloChatDp(e.target.value, true);

      const btnChatSend = $('#fd-dp-chat-send');
      const btnChatPause = $('#fd-dp-chat-pause');
      const btnClearInp = $('#fd-dp-chat-clear-inp');
      const btnClearAll = $('#fd-dp-chat-clear-all');
      const inpChat = $('#fd-dp-chat-input');
      const feedBox = $('#fd-dp-live-feed');

      if (btnChatSend) btnChatSend.onclick = () => window.enviarComandoChatOperacionalDp();
      if (btnChatPause) btnChatPause.onclick = () => window.pausarProcessoChatOpDp();
      if (btnClearInp) btnClearInp.onclick = () => window.limparCampoChatOpDp();
      if (btnClearAll) btnClearAll.onclick = () => window.limparHistoricoChatOpDp();
      if (inpChat) {
        inpChat.addEventListener('input', () => {
          if (inpChat.dataset.textoSugerido && inpChat.value.trim() !== inpChat.dataset.textoSugerido) {
            inpChat.dataset.acaoSugerida = '';
          }
          _atualizarVisibilidadeBtnLimparInputDp();
        });
        inpChat.addEventListener('keydown', ev => {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            window.enviarComandoChatOperacionalDp();
          } else if (ev.key === 'Escape') {
            window.limparCampoChatOpDp();
          }
        });
      }
      if (feedBox) {
        feedBox.addEventListener('click', ev => {
          const btnRetry = ev.target.closest('[data-fd-retry-step]');
          if (btnRetry) {
            ev.preventDefault();
            const chv = btnRetry.dataset.fdRetryStep || 'p1_estruturar';
            window.reexecutarEtapaFabricaDarkPeloChat(chv).catch(() => {});
            return;
          }
          const btnDel = ev.target.closest('[data-dp-msg-del]');
          if (btnDel) {
            ev.preventDefault();
            window.excluirMensagemChatOpDp(btnDel.dataset.dpMsgDel);
            return;
          }
          const btnEdit = ev.target.closest('[data-dp-msg-edit]');
          if (btnEdit) {
            ev.preventDefault();
            window.editarMensagemChatOpDp(btnEdit.dataset.dpMsgEdit);
          }
        });
      }
      // Sugestões rápidas apenas preenchem a caixa de texto para revisar antes de enviar
      drw.querySelectorAll('[data-dp-chip]').forEach(chipBtn => {
        chipBtn.onclick = () => window.preencherSugestaoChatOpDp(chipBtn.dataset.dpChip);
      });
    } else if ($('#fd-dp-agent-mode-sel') && S.dpChatModoAgente) {
      $('#fd-dp-agent-mode-sel').value = S.dpChatModoAgente;
    }
  };

  function _renderizarBolhasChatOperacional(msgs) {
    if (!Array.isArray(msgs) || !msgs.length) return '';
    const offsetIni = Math.max(0, msgs.length - 30);
    return msgs.slice(offsetIni).map((m, iRel) => {
      const idxReal = offsetIni + iRel;
      if (m.de === 'eu') {
        return `<div class="dp-chat-user-msg">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:10px;color:#bae6fd;margin-bottom:3px">
            <b>🧑 Você</b>
            <span style="display:inline-flex;align-items:center;gap:4px">
              <span>${esc(m.hora || '')}</span>
              <span class="dp-msg-actions">
                <button type="button" class="dp-msg-act-btn" data-dp-msg-edit="${idxReal}" title="Editar mensagem">✏️</button>
                <button type="button" class="dp-msg-act-btn del" data-dp-msg-del="${idxReal}" title="Excluir mensagem">🗑️</button>
              </span>
            </span>
          </div>
          <div>${_fmtChatOpMsgDp(m.texto || '')}</div>
        </div>`;
      }
      const btnRetryHtml = (m.botao_reexecutar && m.botao_reexecutar.chave)
        ? `<div style="margin-top:8px">
             <button type="button" class="sm pri" data-fd-retry-step="${esc(m.botao_reexecutar.chave)}" style="font-size:11.5px;padding:5px 11px;font-weight:700">
               ${esc(m.botao_reexecutar.rotulo || '▶️ Reexecutar Etapa Corrigida na Fábrica Dark')}
             </button>
           </div>`
        : '';
      return `<div class="dp-agent-bubble" style="${m.ok === false ? 'border-color:rgba(248,113,113,.45);background:rgba(127,29,29,.22)' : ''}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:10px;color:#67e8f9;margin-bottom:3px">
          <b>🤖 Fábrica Dark</b>
          <span style="display:inline-flex;align-items:center;gap:4px">
            <span>${esc(m.hora || '')}</span>
            <span class="dp-msg-actions">
              <button type="button" class="dp-msg-act-btn del" data-dp-msg-del="${idxReal}" title="Excluir resposta">🗑️</button>
            </span>
          </span>
        </div>
        <div>${_fmtChatOpMsgDp(m.texto || '')}</div>
        ${btnRetryHtml}
      </div>`;
    }).join('');
  }

  window.renderizarMonitorProcessoDpUI = function () {
    window.garantirMonitorProcessoDpUI();
    const fab = $('#fd-dp-live-fab');
    const drw = $('#fd-dp-live-drawer');
    if (!fab || !drw) return;

    const lista = S.dpProcessos || [];
    const proc = lista.find(p => p.id === S.dpProcessoSelecionadoId)
      || lista.find(p => p.status === 'rodando')
      || lista[lista.length - 1]
      || null;

    const btnPauseBar = $('#fd-dp-chat-pause');
    const enviandoChatAgora = Boolean(window._dpChatSending);
    const automacaoRodandoAgora = Boolean(
      enviandoChatAgora
      || S.estRodandoEsteira
      || S._processandoFilaAgora
      || (Array.isArray(S.estLiveSteps) && S.estLiveSteps.some(s => s && s.status === 'rodando'))
    );
    if (btnPauseBar) {
      btnPauseBar.style.display = automacaoRodandoAgora ? 'inline-flex' : 'none';
      btnPauseBar.classList.toggle('ativo', automacaoRodandoAgora);
    }
    _atualizarVisibilidadeBtnLimparInputDp();

    // Quando minimizado, exibe apenas um botão discreto "💬 Chat" (sem repetir logs/contagens do painel direito)
    if (S.dpMonitorMinimizado) {
      drw.classList.add('oculto');
      fab.style.display = 'flex';
      fab.classList.remove('concluido');
      fab.innerHTML = `<span>💬</span><span style="font-weight:700">Chat</span>`;
      return;
    }

    fab.style.display = 'none';
    drw.classList.remove('oculto');

    const tabTitle = $('#fd-dp-tab-title');
    if (tabTitle) tabTitle.textContent = '💬 Chat · Fábrica Dark';

    const selProc = $('#fd-dp-proc-sel');
    if (selProc) {
      if (!lista.length) {
        selProc.innerHTML = `<option value="">💬 Conversa Livre</option>`;
      } else {
        selProc.innerHTML = lista.slice().reverse().map(p => {
          const prefixo = p.eh_conversa_livre ? '💬' : '📌';
          return `<option value="${esc(p.id)}" ${proc && p.id === proc.id ? 'selected' : ''}>${prefixo} ${(p.titulo || 'Conversa').slice(0, 30)}</option>`;
        }).join('');
      }
    }

    const btnDelProj = $('#fd-dp-btn-del-proj');
    if (btnDelProj) {
      btnDelProj.textContent = (proc && proc.eh_conversa_livre) ? '🗑️ Excluir Conv.' : '🗑️ Excluir Projeto';
    }

    const infoMod = window.obterInfoModeloChatDp((proc && proc.chat_modelo_opcao) || S.estChatDpOpcao);
    const selMod = $('#fd-dp-live-model-sel');
    if (selMod && selMod.value !== infoMod.opt) selMod.value = infoMod.opt;

    const feed = $('#fd-dp-live-feed');
    if (feed) {
      const msgsAtuais = proc ? (proc.mensagens_chat || []) : (S.dpChatGlobalMsgs || []);
      const htmlMsgsChat = _renderizarBolhasChatOperacional(msgsAtuais);
      const contextoBadge = (proc && !proc.eh_conversa_livre && proc.titulo)
        ? `<div style="font-size:11px;color:#94a3b8;padding:6px 10px;border-radius:7px;background:#141821;border:1px solid #232834;margin-bottom:6px">
            📌 Projeto na Fábrica Dark: <b style="color:#e2e8f0">${esc(proc.titulo)}</b>${proc.canal_nome ? ` · <span>${esc(proc.canal_nome)}</span>` : ''}
           </div>`
        : '';

      if (htmlMsgsChat) {
        feed.innerHTML = `${contextoBadge}${htmlMsgsChat}`;
      } else {
        feed.innerHTML = `
          ${contextoBadge}
          <div style="padding:14px 12px;border-radius:10px;background:#141821;border:1px dashed #2b3140;color:#94a3b8;font-size:12px;line-height:1.5">
            <b style="color:#e2e8f0;display:block;margin-bottom:4px">🤖 Chat Fábrica Dark · Acesso Total (Estilo Antigravity)</b>
            Converse aqui exatamente como no Antigravity: o agente lê e edita o código-fonte do app (<code>app.py</code>, <code>core/*.py</code>, <code>static/*.js</code>) com backup + hot-reload imediato, corrige qualquer erro, ajusta canais/roteiros/estilos na mesma conversa e envia na Etapa 7 direto para o <code>Dark Planner.exe</code>.
          </div>`;
      }
      feed.scrollTop = feed.scrollHeight;
    }

    const workBox = $('#fd-dp-live-working');
    if (workBox) {
      if (enviandoChatAgora) {
        workBox.style.display = '';
        workBox.innerHTML = `
          <div class="dp-live-row">
            <span class="dp-cyan-spin"></span>
            <span style="color:#e2e8f0;font-size:12px;flex:1">Corrigindo / ajustando aqui na Fábrica Dark…</span>
            <button type="button" class="dp-pause-inline-btn" id="fd-dp-btn-pause-inline">⏸ Parar</button>
          </div>`;
        const bPauseInl = $('#fd-dp-btn-pause-inline');
        if (bPauseInl) bPauseInl.onclick = () => window.pausarProcessoChatOpDp();
      } else {
        workBox.style.display = 'none';
        workBox.innerHTML = '';
      }
    }
  };

  // Limpa asteriscos/markdown quebrados (ex.: ****, ###, ---, [00:00], [000]) deixando o texto limpo e organizado
  function limparCaracteresEspeciaisV8(txt) {
    if (!txt) return '';
    return String(txt)
      .replace(/\r\n/g, '\n')
      .replace(/\[\s*\d{1,3}(?:\s*[:\-–—]\s*\d{1,3}){0,3}\s*\]/g, ' ')
      .replace(/\(\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?)?\s*\)/g, ' ')
      .replace(/^\s*\d{1,2}:\d{2}(?::\d{2})?\s*[-–—:]\s*/gm, '')
      .replace(/\*{3,}/g, '')
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')
      .replace(/^\s*[\*\-]\s+/gm, '• ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/^\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function renderizarV8Organizado(txt, modo) {
    if (!txt) return '';
    const s = String(txt)
      .replace(/\r\n/g, '\n')
      .replace(/\*{3,}/g, '**')
      .replace(/\*\*\s*\*\*/g, '');

    const fmtInline = linha => esc(linha)
      .replace(/\*\*([^*]+)\*\*/g, '<b style="color:#fff">$1</b>')
      .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
      .replace(/\*+/g, '')
      .replace(/`([^`]+)`/g, '<code style="color:#38bdf8">$1</code>');

    if (modo === 'roteiro_completo') {
      const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro(s) : limparCaracteresEspeciaisV8(s);
      return limpo
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p style="margin:0 0 10px 0;line-height:1.65;color:#f1f5f9">${esc(p)}</p>`)
        .join('');
    }

    const linhas = s.split('\n');
    const out = [];
    for (let rawL of linhas) {
      const l = rawL.trim();
      if (!l) {
        out.push('<div style="height:6px"></div>');
        continue;
      }
      if (/^[-*_]{3,}$/.test(l)) {
        out.push('<hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:10px 0">');
        continue;
      }
      const mHead = l.match(/^#{1,6}\s+(.*)$/);
      if (mHead) {
        const tituloSec = mHead[1].replace(/\*+/g, '').trim();
        out.push(`<div style="font-weight:700;font-size:14px;color:#fbbf24;margin:12px 0 6px;padding:6px 10px;background:rgba(249,115,22,.1);border-left:3px solid #f97316;border-radius:6px">${fmtInline(tituloSec)}</div>`);
        continue;
      }
      const mBullet = l.match(/^[\*\-•]\s+(.*)$/);
      if (mBullet) {
        out.push(`<div style="margin:4px 0 4px 6px;padding:4px 10px;border-left:2px solid #38bdf8;background:rgba(255,255,255,.02);border-radius:0 6px 6px 0">• ${fmtInline(mBullet[1])}</div>`);
        continue;
      }
      const mNum = l.match(/^(\d+[\.\)])\s+(.*)$/);
      if (mNum) {
        out.push(`<div style="margin:6px 0;padding:6px 10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px"><b style="color:#f97316">${esc(mNum[1])}</b> ${fmtInline(mNum[2])}</div>`);
        continue;
      }
      out.push(`<div style="margin:4px 0;line-height:1.6;color:#e2e8f0">${fmtInline(l)}</div>`);
    }
    return out.join('');
  }

  // Calcula automaticamente palavras e blocos a partir da duração em minutos (145 PPM)
  function calcPorDuracao(durMin) {
    const d = Math.max(1, Number(durMin || 20));
    const palavras = Math.max(150, Math.round(d * 145));
    const blocos = Math.max(3, Math.min(16, Math.round(d / 3)));
    return {dur: d, palavras, blocos};
  }

  // ---------------------------------------------------------------- tela inicial
  window.estudioView = async function () {
    pararTimer();
    const [lista, vozes] = await Promise.all([api('/api/estudio'), api('/api/vozes')]);
    const op = Object.assign({}, lista.opcoes_padrao, S.estOp || {});
    const chSel = S.estCanal || (S.channels[0] || {}).id || '';
    const chObj = S.channels.find(c => c.id === chSel) || {};
    const dpInfo = chObj.dp || {};
    const dpPrompts = dpInfo.prompts || [];
    const dpNarrator = dpInfo.narrator || {};
    const durInicial = Number(S.estDur || 20);
    const metaAuto = calcPorDuracao(durInicial);
    S.estPalavras = metaAuto.palavras;
    S.estBlocos = metaAuto.blocos;

    const skillsCatalogoDp = Array.isArray(lista.skills_dp) ? lista.skills_dp : [];

    const cnLowCheck = (chObj.nome || '').toLowerCase();
    const cidLowCheck = String(chObj.id || '').toLowerCase();
    const ehCanalRecomeco = cnLowCheck.includes('recomec') || cnLowCheck.includes('recomeç') || cidLowCheck === '732eb8c6-56d8-4d30-b0a8-25929aa6614d';

    const limparTermosRecomecoDeClone = (txtRaw) => {
      let s = String(txtRaw || '');
      if (!s || ehCanalRecomeco) return s;
      return s
        .replace(/capitto\s+recome[cç]o/gi, chObj.nome || 'Canal')
        .replace(/\biflord\b/gi, 'Referência do Canal')
        .replace(/what if you were indestructible\??/gi, '')
        .replace(/cabe[cç]a\s+esf[eé]rica\s+preta[^.;,\n]*/gi, '')
        .replace(/black\s+spherical\s+head[^.;,\n]*/gi, '')
        .replace(/moletom\s+(?:amarelo|âmbar|azul)\s*#[0-9a-f]{6}/gi, '')
        .replace(/amber\s+hoodie\s*#[0-9a-f]{6}/gi, '')
        .replace(/#0E1738/gi, '')
        .replace(/boca\s+branca\s+2d[^.;,\n]*/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    const ytCloneDoCanal = (() => {
      const raw = (chObj.youtube_clone_ativo && chObj.youtube_clone_ativo.yt_id) ? chObj.youtube_clone_ativo : null;
      if (!raw) return null;
      if (!ehCanalRecomeco) {
        const yid = String(raw.yt_id || '').trim();
        const origLow = String(raw.canal_origem || '').toLowerCase();
        const titLow = String(raw.titulo_referencia || '').toLowerCase();
        const cidVinc = String(raw.canal_id_vinculado || '').trim().toLowerCase();
        if (yid === 'FKezpSvDtw4' || origLow === 'iflord' || titLow.includes('what if you were indestructible')) {
          return null;
        }
        if (cidVinc && cidLowCheck && cidVinc !== cidLowCheck) {
          return null;
        }
        const cloneLimpo = Object.assign({}, raw);
        cloneLimpo.style_dna = limparTermosRecomecoDeClone(cloneLimpo.style_dna);
        cloneLimpo.character_dna = limparTermosRecomecoDeClone(cloneLimpo.character_dna);
        cloneLimpo.prompt_mestre_clonagem = limparTermosRecomecoDeClone(cloneLimpo.prompt_mestre_clonagem);
        return cloneLimpo;
      }
      return raw;
    })();

    const ehCanal70Video30Img = (() => {
      const nm = (chObj.nome || '').toLowerCase();
      const cid = String(chObj.id || '').toLowerCase();
      if (['af61268b-3d6a-4e64-a6c4-9cd8a9d90cb0', '8e9fb1f4-0a9b-407c-a67d-c7fcd58f2d10'].includes(cid)) {
        return true;
      }
      return nm.includes('cappito vital') || nm.includes('capitto vital') || nm.includes('capittofin');
    })();

    const ehCanal100Img = (() => {
      const nm = (chObj.nome || '').toLowerCase();
      const cid = String(chObj.id || '').toLowerCase();
      // Capitto Recomeço, CapittoFin, Cappito Vital, Longevidad Real e StormScope NUNCA são 100% imagem!
      if (['732eb8c6-56d8-4d30-b0a8-25929aa6614d', '8e9fb1f4-0a9b-407c-a67d-c7fcd58f2d10', 'af61268b-3d6a-4e64-a6c4-9cd8a9d90cb0', 'de8d4d79-9bd8-44db-b967-3086539f667c', '17681e73-1ab9-412e-93e5-ca12739ece16'].includes(cid)) {
        return false;
      }
      if (nm.includes('recomec') || nm.includes('recomeç') || nm.includes('capittofin') || nm.includes('cappito vital') || nm.includes('capitto vital') || nm.includes('longevidad') || nm.includes('stormscope')) {
        return false;
      }
      if (['4afc5dba-eb73-470e-a0fb-07aa16c7d7a3', 'cc6b6330-d7b4-4dde-b207-1c2b587f79f3'].includes(cid)) {
        return true;
      }
      if (nm.includes('estrategista') || nm.includes('catch-up') || nm.includes('catch up')) {
        return true;
      }
      return dpPrompts.some(p => {
        const pc = (p.conteudo || '').toLowerCase();
        return pc.includes('100% still images') || pc.includes('100% imagens estáticas') || pc.includes('100% imagens com movimento');
      });
    })();

    const ehCanalFlowIv = (() => {
      const nm = (chObj.nome || '').toLowerCase();
      const cid = String(chObj.id || '').toLowerCase();
      if (['732eb8c6-56d8-4d30-b0a8-25929aa6614d', '8e9fb1f4-0a9b-407c-a67d-c7fcd58f2d10', 'af61268b-3d6a-4e64-a6c4-9cd8a9d90cb0', 'de8d4d79-9bd8-44db-b967-3086539f667c'].includes(cid)) {
        return true;
      }
      return nm.includes('recomec') || nm.includes('recomeç') || nm.includes('capittofin') || nm.includes('cappito vital') || nm.includes('capitto vital') || nm.includes('longevidad');
    })();

    const ehCanalGtaFr = (() => {
      const nm = (chObj.nome || '').toLowerCase();
      const cid = String(chObj.id || '').toLowerCase();
      return cid === 'a8068857-d56f-4aba-baf3-ea2b7ebda5bb' || nm.includes('gta') || nm.includes('à la une') || nm.includes('a la une');
    })();

    // Identifica qual das 6 Skills Oficiais (+ Vídeo Real) é SUGERIDA para este canal
    const sugestaoCanal = (() => {
      const nm = (chObj.nome || '').toLowerCase();
      const refSufixo = ytCloneDoCanal ? ` · Ref: ${ytCloneDoCanal.canal_origem || ytCloneDoCanal.titulo_referencia || 'Vinculada'}` : '';
      if (ehCanalGtaFr) {
        return {
          modo: 'video_real',
          botaoCurto: `7. 100% Jogos GTA · FR (Mano. / Rockstar Mag' / Rou · 0% Repetição)`,
          resumoUso: `7 - 🎮 GTA à la Une (100% Jogos GTA VI / V / IV em Francês fr-FR · Padrão Mano. + Rockstar Mag' + Rou · Disco D: e Outros Bancos Só em Último Caso)`,
        };
      }
      const ehReal = nm.includes('stormscope') || nm.includes('severe weather') || nm.includes('video real') || dpPrompts.some(p => {
        const pn = (p.nome || '').toLowerCase();
        const pc = (p.conteudo || '').toLowerCase();
        return pn.includes('video real') || pn.includes('vídeo real') || pc.includes('real disaster footage') || pc.includes('real footage first');
      });
      if (ehReal) {
        return {
          modo: 'video_real',
          botaoCurto: `7. Vídeo e Imagens Reais${refSufixo}`,
          resumoUso: `7 - 🌍 Vídeo e Imagens Reais (0% IA — 12 Bancos + Gemini Flash Turbo + 0% Repetição no Canal${refSufixo})`,
        };
      }
      if (ehCanal100Img) {
        return {
          modo: 'skill2_mestre_img',
          botaoCurto: `2. 100% Imagem ([flow][i][16:9]${refSufixo})`,
          resumoUso: `2 - SKILL MESTRE — 100% Imagens por SRT ([flow][i][16:9] Obrigatório no Canal${refSufixo})`,
        };
      }
      if (ehCanalRecomeco) {
        return {
          modo: 'skill6_cenas_flow',
          botaoCurto: '6. NOVA SKILL MESTRE (Imagens e Vídeos pelo Flow [flow][iv][16:9])',
          resumoUso: `6 - NOVA SKILL MESTRE: Imagens e Vídeos Gerados pelo Google Flow ([flow][iv][16:9] · Vinculado à Base ${ytCloneDoCanal?.canal_origem || 'Iflord'}: Avatar [01]/[02] + Falas de Destaque c/ Lip-Sync + Quadros 2D Azul-Marinho #0E1738)`,
        };
      }
      if (ehCanal70Video30Img) {
        return {
          modo: 'skill6_cenas_flow',
          botaoCurto: `6. NOVA SKILL MESTRE · 70% Vídeo + 30% Imagem (Padrão CapittoFin${refSufixo})`,
          resumoUso: `6 - NOVA SKILL MESTRE: 70% Vídeo ([flow][iv][16:9]) + 30% Imagem ([flow][i][16:9]) · Fórmula Visual CapittoFin${refSufixo}`,
        };
      }
      if (ehCanalFlowIv) {
        return {
          modo: 'skill3_diretor_iv',
          botaoCurto: `3. Imagens e Vídeos pelo Flow ([flow][iv][16:9]${refSufixo})`,
          resumoUso: `3 - DIRETOR DE IMAGEM + ANIMAÇÃO VEO (Imagens e Vídeos Gerados pelo Google Flow [flow][iv][16:9] / [flow][v][16:9]${refSufixo})`,
        };
      }
      return {
        modo: 'skill6_cenas_flow',
        botaoCurto: `6. NOVA SKILL MESTRE (Flow SRT${refSufixo})`,
        resumoUso: `6 - NOVA SKILL MESTRE: Crie Personagens Consistentes Automaticamente em Todos os Vídeos${refSufixo}`,
      };
    })();

    const montarBlocoReferenciaAnexadaCanal = () => {
      if (!ytCloneDoCanal || ehCanalRecomeco) return '';
      const urlsRef = Array.isArray(ytCloneDoCanal.urls_referencia) && ytCloneDoCanal.urls_referencia.length
        ? ytCloneDoCanal.urls_referencia.join(' | ')
        : (ytCloneDoCanal.url_original || ytCloneDoCanal.yt_id || '');
      const orig = limparTermosRecomecoDeClone(ytCloneDoCanal.canal_origem || ytCloneDoCanal.titulo_referencia || 'Referência do Canal');
      const stDna = limparTermosRecomecoDeClone(ytCloneDoCanal.style_dna || '');
      const chDna = limparTermosRecomecoDeClone(ytCloneDoCanal.character_dna || '');
      const edC = ytCloneDoCanal.estilo_edicao_e_como_funciona || {};
      const ritC = ytCloneDoCanal.ritmo_edicao_e_camera || {};
      const comoFunc = limparTermosRecomecoDeClone(edC.como_funciona_o_video || '');
      const ritmoTxt = limparTermosRecomecoDeClone(ritC.frequencia_cortes || '');
      return `\n4. REFERÊNCIAS VINCULADAS EXCLUSIVAMENTE AO CANAL "${chObj.nome || 'Canal'}" (${orig}${urlsRef ? ` — ${urlsRef}` : ''}):\n` +
        (stDna ? `   • DNA Visual das Referências Anexadas: ${stDna}\n` : '') +
        (chDna ? `   • Personagens / Apresentador das Referências: ${chDna}\n` : '') +
        (comoFunc ? `   • Estrutura Narrativa e Edição das Referências: ${comoFunc}\n` : '') +
        (ritmoTxt ? `   • Ritmo de Cortes e Câmera das Referências: ${ritmoTxt}` : '');
    };

    const montarInstrucoesEdicaoPadraoCanal = () => {
      const cn = (chObj.nome || 'Canal').trim();
      const cnLow = cn.toLowerCase();
      const cidLow = String(chObj.id || '').toLowerCase();
      const ehRecomeco = ehCanalRecomeco;
      const blocoRefExtra = montarBlocoReferenciaAnexadaCanal();

      if (ehCanalGtaFr || cnLow.includes('gta') || cidLow === 'a8068857-d56f-4aba-baf3-ea2b7ebda5bb') {
        return `[BASE VINCULADA AO CANAL "${cn}": GTA à la Une (https://www.youtube.com/@GTA%C3%A0laUne) — 100% FOCADO NOS JOGOS GTA EM FRANCÊS (fr-FR) — Referências Oficiais: Mano. (https://www.youtube.com/watch?v=8GD39QLKtyY&t=50s) · Rockstar Mag' (https://www.youtube.com/watch?v=dPSpuFYoEF8) · Rou (https://www.youtube.com/watch?v=I-bJ61bouDo) · Vico GTA & G3ADRIEN OFF]\n` +
          `1. FOCO 100% EXCLUSIVO NOS JOGOS GTA EM FRANCÊS (fr-FR): Todo título, roteiro, narração (voz Léo - Reassuring and Dynamic), SRT, capítulos e descrição SEO devem estar 100% em FRANCÊS fluente, focados SOMENTE nos jogos Grand Theft Auto (GTA VI Vice City/Leonida, GTA V Los Santos, GTA IV Liberty City, San Andreas, Vice City e motor RAGE 9 da Rockstar Games), seguindo o gancho magnético de 50s de Mano., o domínio da franquia de Rockstar Mag' e a análise tecnológica visual de Rou.\n` +
          `2. HIERARQUIA ESTRITA DE MÍDIAS (100% JOGOS GTA EM 1º LUGAR · DISCO D: E OUTROS BANCOS SÓ EM ÚLTIMO CASO): Utilize obrigatoriamente vídeos e capturas 100% retirados dos JOGOS GTA (gameplay 4K sem facecam, trailers oficiais Rockstar Games, comparativos GTA V vs GTA VI e capturas RAGE com máscara Fair-Use Anti-Copyright e 0% repetição no canal). O banco de dados local do Disco D: (D:\\BANCO DE DADOS) e os outros bancos de dados externos só devem ser usados EM ÚLTIMO CASO, estritamente para apoio.\n` +
          `3. RITMO DE CORTES & ESTÉTICA FRANCÓFONA VIRAL (PADRÃO MANO. / ROU / VICO GTA): Micro-cortes dinâmicos de gameplay de 3s a 5.5s acompanhando exatamente o que o narrador francês descreve (física, animações, mapa, veículos, missões); capítulos minimalistas em francês e Ken Burns suave em capturas 4K oficiais.\n` +
          `4. MÚSICA DE FUNDO (BGM) & CTA EM FRANCÊS: Synthwave / Ambient Gaming sutil em -18dB sob a voz em francês (fr-FR, 0% áudio original dos trailers para proteção anti-copyright), encerrando com CTA natural ("Abonnez-vous à GTA à la Une et activez la cloche !").` + blocoRefExtra;
      }

      if (cnLow.includes('stormscope') || cnLow.includes('severe weather') || cidLow === '17681e73-1ab9-412e-93e5-ca12739ece16') {
        return `[BASE VINCULADA AO CANAL "${cn}": USA Severe Weather (https://www.youtube.com/@USASevereWeather) & Weather Field Report (https://www.youtube.com/@WeatherFieldReport)]\n` +
          `1. ABERTURA DE IMPACTO REAL (00:00–03:00 — 100% FILMAGENS E FOTOS REAIS): Os primeiros 3 minutos devem exibir exclusivamente vídeos e fotografias documentais reais do evento climático/desastre em ruas, bairros, rodovias e comunidades afetadas, sincronizados 1:1 com a narração (0% IA, sem avatares, sem mapas de tela cheia ou logos longos na abertura).\n` +
          `2. ESTILO DE EDIÇÃO DOCUMENTAL (PADRÃO @USASevereWeather & @WeatherFieldReport): Reportagem meteorológica investigativa em inglês americano com 100% de mídias reais na trilha V1 (12 bancos oficiais verificados por visão multimodal — 0 repetição no vídeo e 0 repetição com vídeos anteriores do canal). Após 03:00, intercale lower-thirds jornalísticos discretos (local, data e dados verificados de NOAA/NWS/USGS), alertas meteorológicos e gráficos factuais limpos. Thumbnail 100% fotográfica/jornalística sem textos grandes na frente.\n` +
          `3. RITMO DE CORTES E MOVIMENTO: Cortes documentais dinâmicos a cada 2.5s a 5s acompanhando a ação real (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase); em fotografias reais, aplique apenas Ken Burns suave (push-in/pan lento) preservando a cena real.\n` +
          `4. MÚSICA DE FUNDO (BGM) & AMBIÊNCIA: Tensão documental meteorológica sutil e ambiência realista (chuva, vento, trovão distante) em volume baixo (-20dB sob a voz), mantendo a narração sempre dominante.\n` +
          `5. TRANSIÇÕES E EFEITOS SONOROS (SFX): Cortes secos (clean cuts) e dissolves suaves em silêncio (estilo reportagem de campo @USASevereWeather / @WeatherFieldReport, sem whooshes exagerados).` + blocoRefExtra;
      }

      if (sugestaoCanal.modo === 'video_real') {
        return `[BASE VINCULADA AO CANAL "${cn}": Produção Documental de Imagens e Vídeos Reais — Visão Multimodal Rápida & 0% Repetição no Canal]\n` +
          `1. 100% MÍDIAS REAIS VERIFICADAS POR VISÃO MULTIMODAL: Cada bloco do SRT deve receber um vídeo .mp4 ou fotografia real pertinente ao tema narrado, validado semanticamente pela IA multimodal.\n` +
          `2. PROIBIDO REPETIR NO VÍDEO OU NO CANAL: Bloqueio automático por URL, hash MD5 e dHash perceptual contra todas as cenas do vídeo atual e contra todos os vídeos anteriores publicados no canal "${cn}".\n` +
          `3. RITMO DE CORTES & BGM: Primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase, Ken Burns suave nas fotografias e trilha documental discreta (-18dB sob a narração).` + blocoRefExtra;
      }

      if (ehRecomeco) {
        const avC = (ytCloneDoCanal && ytCloneDoCanal.avatar_e_falas_destaque) || {};
        const edC = (ytCloneDoCanal && ytCloneDoCanal.estilo_edicao_e_como_funciona) || {};
        const bgmC = (ytCloneDoCanal && ytCloneDoCanal.musica_fundo_bgm) || {};
        const sfxC = (ytCloneDoCanal && ytCloneDoCanal.efeitos_sonoros_sfx) || {};
        const ritC = (ytCloneDoCanal && ytCloneDoCanal.ritmo_edicao_e_camera) || {};
        return `[BASE VINCULADA AO CANAL "${cn}": ${(ytCloneDoCanal && (ytCloneDoCanal.titulo_referencia || ytCloneDoCanal.yt_id)) || 'What If You Were Indestructible?'} (${(ytCloneDoCanal && ytCloneDoCanal.canal_origem) || 'Iflord'}) — IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW ([flow][iv][16:9] / [flow][v][16:9])]\n` +
          `0. MODO VISUAL DO CANAL (IMAGENS E VÍDEOS PELO FLOW — NÃO É 100% IMAGEM): As cenas deste canal são geradas como IMAGENS E VÍDEOS pelo Google Flow ([flow][iv][16:9] / [flow][v][16:9]), sincronizadas 1:1 com os blocos do SRT (exatamente 1 cena por bloco SRT, sem incluir imagens de referência [01]..[N] na timeline).\n` +
          `1. AVATAR & FALAS DE DESTAQUE (80% Narração / 20% Falas Curtas dos Avatares): ${avC.mecanica_falas_destaque || avC.como_gerar_no_flow || 'Nos blocos de narração o avatar age sem lip-sync contínuo; nas Falas de Destaque (a cada 25-45s) corte para plano médio onde o avatar fala com boca branca 2D sincronizada e parada seca da música.'}\n` +
          `2. ESTILO DE EDIÇÃO E ALTERNÂNCIA 3D/2D: ${edC.como_funciona_o_video || ''} | ${edC.alternancia_visual_3d_2d || ''}\n` +
          `3. RITMO DE CORTES: ${ritC.frequencia_cortes || '1 corte a cada 3.8s (~16 cortes/min)'}\n` +
          `4. MÚSICA DE FUNDO (BGM): ${bgmC.estilo_e_genero || 'Curious Sci-Fi Synth Pulse & Playful Suspense'} (${bgmC.bpm_estimado || '104 BPM'}, ${bgmC.volume_ducking || '-18dB sob a voz com Music Stop seco nas Falas de Destaque'})\n` +
          `5. EFEITOS SONOROS (SFX): Transições: ${(sfxC.sfx_transicoes || []).join(', ')} | Destaques: ${(sfxC.sfx_destaques_texto || []).join(', ')}`;
      }

      if (cnLow.includes('estrategista') || cidLow === '4afc5dba-eb73-470e-a0fb-07aa16c7d7a3') {
        return `[BASE VINCULADA AO CANAL "${cn}": Crônica Histórica Ilustrada 2D do Brasil — 100% Imagem Estática ([flow][i][16:9])]\n` +
          `1. REGRA OBRIGATÓRIA 100% IMAGEM ([flow][i][16:9]): Todas as cenas deste canal devem ser geradas exclusivamente como imagens estáticas 16:9 ([flow][i][16:9], PROIBIDO gerar vídeo [v] ou [iv]).\n` +
          `2. ESTILO DE EDIÇÃO HISTÓRICA 2D: Posicione 100% das imagens sincronizadas 1:1 com os blocos do SRT (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase) aplicando movimento contínuo de câmera (Ken Burns / zoom in / zoom out / pan suave) em 100% das imagens, mapas históricos e datas em destaque.\n` +
          `3. MÚSICA DE FUNDO (BGM) & SFX: Trilha épica/documental histórica brasileira em -18dB sob a narração e transições limpas sem música nas transições.` + blocoRefExtra;
      }

      if (cnLow.includes('vital') || cidLow === 'af61268b-3d6a-4e64-a6c4-9cd8a9d90cb0') {
        return `[BASE VINCULADA AO CANAL "${cn}": MESMA FÓRMULA VISUAL DO CAPITTOFIN (Joca Investe / Cartoon 2D Vibrante BR) — 70% VÍDEO ([flow][iv][16:9]) + 30% IMAGEM ([flow][i][16:9])]\n` +
          `1. REGRA OBRIGATÓRIA 70% VÍDEO + 30% IMAGEM (IGUAL AO PROMPT DO CAPITTOFIN — NÃO É 100% IMAGEM): As cenas deste canal seguem exatamente a mesma engenharia de prompt 2D estilizado vibrante do CapittoFin, distribuindo automaticamente 70% de cenas em VÍDEO animado pelo Google Flow ([flow][iv][16:9] — incluindo os primeiros blocos de gancho) e 30% em IMAGEM 16:9 ([flow][i][16:9]) com movimento contínuo Ken Burns, mantendo consistência do apresentador Miguel [01].\n` +
          `2. ESTILO VISUAL CAPITTOFIN ADAPTADO À SAÚDE 40+: Vibrant 2D stylized cartoon illustration com contornos escuros limpos, expressões faciais intensas, comparações fisiológicas claras ('ERRADO' vs 'CERTO') e sincronia 1:1 exata com os blocos do SRT (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase).\n` +
          `3. MÚSICA DE FUNDO (BGM) & SFX: Trilha documental dinâmica e envolvente em -18dB sob a narração em português.` + blocoRefExtra;
      }

      if (cnLow.includes('catch-up') || cnLow.includes('catch up') || cidLow === 'cc6b6330-d7b4-4dde-b207-1c2b587f79f3') {
        return `[BASE VINCULADA AO CANAL "${cn}": Hypothetica (https://www.youtube.com/@Hypothetica101/videos) & The Munger Method — 100% Imagem Estática ([flow][i][16:9])]\n` +
          `1. REGRA OBRIGATÓRIA 100% IMAGEM ([flow][i][16:9]): Todas as cenas deste canal devem ser geradas exclusivamente como imagens estáticas 16:9 ([flow][i][16:9], PROIBIDO gerar vídeo [v] ou [iv]), mantendo consistência do protagonista Arthur [01].\n` +
          `2. ESTILO DE EDIÇÃO EDITORIAL FINANCEIRA 2D: Posicione 100% das imagens sincronizadas 1:1 com os blocos do SRT (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase) aplicando movimento contínuo (Ken Burns) em 100% das imagens, destacando números, idades e comparações patrimoniais.\n` +
          `3. MÚSICA DE FUNDO (BGM) & SFX: Trilha editorial reflexiva e sofisticada em -18dB sob a narração em inglês americano.` + blocoRefExtra;
      }

      if (cnLow.includes('longevidad') || cidLow === 'de8d4d79-9bd8-44db-b967-3086539f667c') {
        return `[BASE VINCULADA AO CANAL "${cn}": Educação Médica Visual 2D (60+ Anos / Espanhol Neutro) — IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW ([flow][iv][16:9] / [flow][v][16:9])]\n` +
          `1. MODO VISUAL DO CANAL (IMAGENS E VÍDEOS PELO FLOW — NÃO É 100% IMAGEM): As cenas deste canal são geradas como IMAGENS E VÍDEOS pelo Google Flow ([flow][iv][16:9] / [flow][v][16:9]), sincronizadas 1:1 com o SRT em espanhol neutro (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase; mesma quantidade de cenas = mesma quantidade de blocos SRT).\n` +
          `2. ESTILO VISUAL & EDIÇÃO MÉDICA 2D: Educador médico [01] e comparações visuais claras ('INCORRECTO' vs 'CORRECTO') sobre força muscular e nutrição 60+.\n` +
          `3. MÚSICA DE FUNDO (BGM) & SFX: Trilha médica clara e serena em -18dB sob a narração em espanhol.` + blocoRefExtra;
      }

      if (cnLow.includes('capittofin') || cidLow === '8e9fb1f4-0a9b-407c-a67d-c7fcd58f2d10') {
        return `[BASE VINCULADA AO CANAL "${cn}": Joca Investe (https://www.youtube.com/@jocainvesteOFICIAL) — Storytelling Financeiro 2D Brasil — 70% VÍDEO ([flow][iv][16:9]) + 30% IMAGEM ([flow][i][16:9])]\n` +
          `1. MODO VISUAL DO CANAL (70% VÍDEO + 30% IMAGEM PELO FLOW — NÃO É 100% IMAGEM): As cenas deste canal distribuem 70% em VÍDEO ([flow][iv][16:9]) e 30% em IMAGEM ([flow][i][16:9] com Ken Burns), sincronizadas 1:1 com o SRT (primeiros 60 blocos de 2 a 4s e demais blocos de 4 a 8s quebrados por frase; mesma quantidade de cenas = mesma quantidade de blocos SRT).\n` +
          `2. ESTILO VISUAL & EDIÇÃO FINANCEIRA BR: Cenas animadas 2D vibrantes ambientadas no Brasil real destacando valores em R$, juros, escolhas financeiras e dilemas patrimoniais.\n` +
          `3. MÚSICA DE FUNDO (BGM) & SFX: Trilha dinâmica documental de finanças em -18dB sob a narração em português.` + blocoRefExtra;
      }

      if (ytCloneDoCanal) {
        return `[BASE VINCULADA AO CANAL "${cn}": ${ytCloneDoCanal.titulo_referencia || ytCloneDoCanal.canal_origem || 'Referência do Canal'}]` + blocoRefExtra;
      }

      return '';
    };

    const sanitizarInstrucoesEdicaoPorCanal = (txtRaw) => {
      const txt = String(txtRaw || '').trim();
      const cn = (chObj.nome || '').trim();
      const cnLow = cn.toLowerCase();
      const ehRecomeco = ehCanalRecomeco;
      const ehStorm = cnLow.includes('stormscope') || cnLow.includes('severe weather') || String(chObj.id || '').toLowerCase() === '17681e73-1ab9-412e-93e5-ca12739ece16';
      const padrao = montarInstrucoesEdicaoPadraoCanal();
      if (!txt) return padrao;
      const txtLow = txt.toLowerCase();
      const contaminadoIflord = (
        txtLow.includes('capitto recomeço') ||
        txtLow.includes('capitto recomeco') ||
        txtLow.includes('iflord') ||
        txtLow.includes('what if you were indestructible') ||
        txtLow.includes('moletom amarelo #e89b15') ||
        txtLow.includes('boca branca 2d') ||
        txtLow.includes('curious sci-fi synth pulse') ||
        txtLow.includes('kurzgesagt dark')
      );
      if (contaminadoIflord && !ehRecomeco) {
        return padrao;
      }
      const contaminadoWeather = (
        txtLow.includes('usasevereweather') ||
        txtLow.includes('weatherfieldreport') ||
        txtLow.includes('evento climático/desastre') ||
        txtLow.includes('noaa/nws/usgs')
      );
      if (contaminadoWeather && !ehStorm) {
        return padrao;
      }
      if (ehCanalGtaFr && (!txtLow.includes('novembr') || !txtLow.includes('gta iv'))) {
        return padrao;
      }
      // Se o canal é 100% imagem (Estrategista, Catch-Up) e o texto antigo disser "NÃO É 100% IMAGEM", substitui pelo padrão correto!
      if (ehCanal100Img && (txtLow.includes('não é 100% imagem') || txtLow.includes('imagens e vídeos pelo flow') || txtLow.includes('70% vídeo'))) {
        return padrao;
      }
      // Se for Cappito Vital ou CapittoFin e o texto antigo não tiver a regra 70% Vídeo + 30% Imagem (ou disser 100% imagem), migra imediatamente!
      if (ehCanal70Video30Img && (!txtLow.includes('70%') || txtLow.includes('100% imagem estática') || txtLow.includes('proibido gerar vídeo'))) {
        return padrao;
      }
      // Se for Capitto Recomeço ou Longevidad Real e o texto antigo disser "100% imagem", substitui pelo padrão correto (Flow Imagem + Vídeo)
      if (ehCanalFlowIv && (txtLow.includes('100% imagem estática') || txtLow.includes('100% still') || txtLow.includes('proibido gerar vídeo'))) {
        return padrao;
      }
      const mBase = txt.match(/\[BASE VINCULADA AO CANAL\s+"([^"]+)"/i);
      if (mBase && cnLow) {
        const canalNoTxt = (mBase[1] || '').trim().toLowerCase();
        if (canalNoTxt && !cnLow.includes(canalNoTxt) && !canalNoTxt.includes(cnLow)) {
          return padrao;
        }
      }
      return txt;
    };

    // Ao trocar de canal, carrega os prompts, as URLs de referência e as diretrizes de edição EXCLUSIVAS daquele canal (sem puxar de outro canal!)
    if (S.estUltimoCanalAuto !== chSel) {
      S.estUltimoCanalAuto = chSel;
      S.estSkillModo = '';
      S.estS6Style = ytCloneDoCanal?.style_dna || '';
      S.estS6Epoca = '';
      S.estPromptsMarcados = dpPrompts.map(p => String(p.id || p.nome || p.title));
      S.estEdCustom = montarInstrucoesEdicaoPadraoCanal();
      const refsDoCanal = (ytCloneDoCanal && Array.isArray(ytCloneDoCanal.urls_referencia) && ytCloneDoCanal.urls_referencia.length)
        ? ytCloneDoCanal.urls_referencia
        : (ytCloneDoCanal && ytCloneDoCanal.url_original ? String(ytCloneDoCanal.url_original).split(/\s*\|\|\|\s*|\r?\n/).map(s => s.trim()).filter(Boolean) : []);
      S.estYoutubeCloneUrl1 = refsDoCanal[0] || '';
      S.estYoutubeCloneUrl2 = refsDoCanal[1] || '';
      S.estYoutubeCloneUrl3 = refsDoCanal[2] || '';
      S.estYoutubeCloneUrl = refsDoCanal.join(' ||| ');
      if (ytCloneDoCanal) {
        S.estYoutubeCloneAtivo = ytCloneDoCanal;
        api('/api/youtube-cloner/detalhe/' + encodeURIComponent(ytCloneDoCanal.yt_id)).then(det => {
          if (det && det.yt_id) {
            S.estYoutubeCloneAtivo = det;
            if ($('#e-yt-cloner-result')) renderizarPainelYoutubeClone(det);
          }
        }).catch(() => {});
      } else {
        S.estYoutubeCloneAtivo = null;
      }
    } else {
      S.estEdCustom = sanitizarInstrucoesEdicaoPorCanal(S.estEdCustom);
      if (!ytCloneDoCanal && S.estYoutubeCloneAtivo) {
        S.estYoutubeCloneAtivo = null;
      }
    }
    if (!Array.isArray(S.estPromptsMarcados)) {
      S.estPromptsMarcados = dpPrompts.map(p => String(p.id || p.nome || p.title));
    }
    if (S.estSkillModo === 'skill5_img') S.estSkillModo = 'skill2_mestre_img';
    if (S.estSkillModo === 'skill6') S.estSkillModo = 'skill6_cenas_flow';
    if (!S.estSkillModo) S.estSkillModo = sugestaoCanal.modo || 'skill6_cenas_flow';

    const skillMarcada = S.estSkillModo || sugestaoCanal.modo || 'skill6_cenas_flow';
    const ehModoVideoReal = skillMarcada === 'video_real';
    const SKILLS_IA_SRT = ['skill1_extrator', 'skill2_mestre_img', 'skill3_diretor_iv', 'skill4_personagens_srt', 'skill5_personagem_mestre', 'skill6_cenas_flow', 'outra_skill'];
    const ehModoSkill6OuImg = SKILLS_IA_SRT.includes(skillMarcada);

    if (!S.estOpcoesMarcadas) {
      S.estOpcoesMarcadas = {
        p1_estruturar: true,
        p2_roteiro: true,
        p4_pacote_viral: true,
        p5_audio_srt: true,
        p6_cenas: true,
        p7_projeto_dp: true,
      };
    }
    delete S.estOpcoesMarcadas.p3_titulos;
    if (S.estPausarParaVerificar === undefined) {
      try {
        const salvoAuto = localStorage.getItem('fd_seguir_tudo_auto');
        S.estPausarParaVerificar = salvoAuto === '0';
      } catch (_e) {
        S.estPausarParaVerificar = false;
      }
    }
    if (!S.estChatDpOpcao) {
      try {
        S.estChatDpOpcao = localStorage.getItem('fd_chat_dp_opcao_v3') || 'flash_high';
      } catch (_e) {
        S.estChatDpOpcao = 'flash_high';
      }
    }
    if (!S.estVeoFaixasCfg) {
      let salvoVeo = null;
      try {
        salvoVeo = JSON.parse(localStorage.getItem('fd_veo_faixas_cfg') || 'null');
      } catch (_e) {}
      S.estVeoFaixasCfg = Object.assign({
        ativo: true,
        primeiros_blocos: 60,
        primeiros_min_s: 2,
        primeiros_max_s: 4,
        resto_min_s: 4,
        resto_max_s: 8,
        quebrar_frases: true,
      }, salvoVeo || {});
    }
    window.obterPayloadVeoFaixas = function () {
      const c = S.estVeoFaixasCfg || {
        ativo: true,
        primeiros_blocos: 60,
        primeiros_min_s: 2,
        primeiros_max_s: 4,
        resto_min_s: 4,
        resto_max_s: 8,
        quebrar_frases: true,
      };
      const primN = Math.max(1, Number(c.primeiros_blocos) || 60);
      const primMin = Math.max(0, Number(c.primeiros_min_s ?? 2));
      const primMax = Math.max(primMin + 0.5, Number(c.primeiros_max_s || 4));
      const restMin = Math.max(0, Number(c.resto_min_s ?? 4));
      const restMax = Math.max(restMin + 0.5, Number(c.resto_max_s || 8));
      const usarFx = c.ativo !== false;
      const quebrarFr = c.quebrar_frases !== false;
      const faixas = usarFx
        ? [
            {count: primN, minMs: primMin * 1000, maxMs: primMax * 1000},
            {minMs: restMin * 1000, maxMs: restMax * 1000},
          ]
        : [{minMs: restMin * 1000, maxMs: restMax * 1000}];
      return {
        ativo: usarFx,
        primeiros_blocos: primN,
        primeiros_min_s: primMin,
        primeiros_max_s: primMax,
        resto_min_s: restMin,
        resto_max_s: restMax,
        quebrar_frases: quebrarFr,
        min_s: restMin,
        max_s: restMax,
        faixas,
      };
    };

    const MAPA_NOMES_SKILL = {
      skill1_extrator: '1 - SKILL EXTRATOR — Criador de Estilos Visuais por Imagens',
      skill2_mestre_img: '2 - SKILL MESTRE — Gerador de Imagens por SRT',
      skill3_diretor_iv: '3 - Diretor Cinematográfico SRT — Imagem + Vídeo ([i] + [v])',
      skill4_personagens_srt: '4 - SKILL MESTRE - Gerar Prompts com Personagens pelo SRT ([SafeName])',
      skill5_personagem_mestre: '5 - Criar Personagem Consistente pelo Roteiro/SRT (Master Detail + Standing)',
      skill6_cenas_flow: '6 - NOVA SKILL MESTRE: Crie Personagens Consistentes Automaticamente em Todos os Vídeos',
      video_real: '7 - 🌍 Vídeo e Imagens Reais (0% IA — Direto no Studio)',
      outra_skill: '📚 Outra Skill do Catálogo DarkPlanner (36 Skills)',
      skill5_img: '2 - SKILL MESTRE — Gerador de Imagens por SRT',
      skill6: '6 - NOVA SKILL MESTRE: Crie Personagens Consistentes Automaticamente em Todos os Vídeos',
    };

    const classificarPapelPrompt = p => {
      const nm = String(p.nome || '').toLowerCase();
      const cat = String(p.categoria || '').toLowerCase();
      const ct = String(p.conteudo || '');
      if (nm.includes('estilo') || cat.includes('estilo') || ct.includes('STYLE_DNA')) {
        return {icone: '🎨', tipo: 'Estilo Visual & DNA de Personagem', desc: 'Define o traço visual (STYLE_DNA), paleta de cores, iluminação, identidade fixa do protagonista (CHARACTER_DNA) e restrições negativas (NEGATIVE_DNA).'};
      }
      if (nm.includes('edicao') || nm.includes('edição') || cat.includes('edicao') || ct.includes('STUDIO_EDIT_BLOCK')) {
        return {icone: '🎬', tipo: 'Gerador de Edição (DarkPlanner Studio)', desc: 'Define o ritmo de cortes, distribuição de templates documentais, movimentos de câmera (Ken Burns), legendas e destaques na timeline do Studio.'};
      }
      return {icone: '📜', tipo: 'Prompt Mestre do Canal (Direção & Narrativa)', desc: 'Define as regras mestras do canal, estrutura narrativa, tom documental e diretrizes de criação de cenas 1:1 com o SRT.'};
    };

    // Extrai automaticamente o STYLE_DNA do canal (priorizando a Base YouTube vinculada ao canal, ex: Iflord / Capitto Recomeço)
    const styleDnaExtraido = (() => {
      if (ytCloneDoCanal && ytCloneDoCanal.style_dna) {
        return String(ytCloneDoCanal.style_dna).replace(/\s+/g, ' ').trim();
      }
      for (const p of dpPrompts) {
        const ct = String(p.conteudo || p.content || '');
        const mQ = ct.match(/STYLE_DNA\s*:\s*\r?\n?"([^"]+)"/i);
        if (mQ && mQ[1]) return mQ[1].replace(/\s+/g, ' ').trim();
        const mU = ct.match(/STYLE_DNA\s*:\s*\r?\n?([^\r\n]{20,600})/i);
        if (mU && mU[1]) return mU[1].replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
      }
      for (const p of dpPrompts) {
        const ct = String(p.conteudo || p.content || '');
        const mB = ct.match(/PROMPT\s+BASE\s*:\s*([\s\S]{20,500}?)(?:\n\s*\n|DIRETRIZES\s*:|CONSISTENCIA\s*:|$)/i);
        if (mB && mB[1]) return mB[1].replace(/\s+/g, ' ').trim();
      }
      for (const p of dpPrompts) {
        const nm = String(p.nome || p.title || '').toLowerCase();
        if (nm.includes('estilo') || nm.includes('vetorial') || nm.includes('cartoon') || nm.includes('cronica')) {
          return String(p.conteudo || p.content || '').replace(/\s+/g, ' ').trim().slice(0, 380);
        }
      }
      return chObj.estilo_visual || '';
    })();
    const estiloVisualPadraoStep6 = styleDnaExtraido || S.estS6Style || 'Cinematic photorealistic documentary 8k, natural lighting, 35mm lens, shallow depth of field';
    const epocaPadraoStep6 = S.estS6Epoca || (
      ehCanalGtaFr
        ? 'Vice City & Liberty City Next-Gen (GTA IV & GTA VI Sortie de Novembre), 16:9, Rockstar Games RAGE/Euphoria Visuals'
        : ((chObj.nome || '').toLowerCase().includes('recome') || dpPrompts.some(p => /australia/i.test(p.nome || p.title || ''))
          ? 'Contemporary Australia (Melbourne & Sydney), 16:9, Dual-Mode 2.5D/3D + 2D Navy Board (#0E1738) What If Animation'
          : 'Contemporary, 16:9, realistic setting')
    );

    const ytRefList = String(S.estYoutubeCloneUrl || '').split(/\s*\|\|\|\s*|\r?\n/).map(s => s.trim()).filter(Boolean);
    const ytRef1 = S.estYoutubeCloneUrl1 ?? ytRefList[0] ?? '';
    const ytRef2 = S.estYoutubeCloneUrl2 ?? ytRefList[1] ?? '';
    const ytRef3 = S.estYoutubeCloneUrl3 ?? ytRefList[2] ?? '';

    const curChatOpt = window.obterInfoModeloChatDp(S.estChatDpOpcao || 'flash_high').opt;
    S.estChatDpOpcao = curChatOpt;

    main.innerHTML = `<div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <div class="sp">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#f3f4f6">⚡ Estúdio 1 clique</h1>
      </div>
      <button class="sm" id="e-open-proc-dp-top" type="button" style="border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700" title="Abrir Chat auxiliar para organizar algo ou enviar mais informações">💬 Chat</button>
      <button class="sm" onclick="go('guia')" type="button">📖 Guia</button>
      <button class="sm ai-dp" id="e-dp-btn" type="button">🎬 Abrir DarkPlanner</button>
    </div>
    ${lista.tem_gemini ? '' : `<div class="card est-alerta"><b>Sem chave do Gemini.</b> Coloque sua chave em <a href="#" id="e-cx">Conexões</a>.</div>`}
    <div class="grid est-grid" style="align-items:start">
      <div>
        <div class="card" style="padding:14px">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <h3 style="margin:0;font-size:15px;color:#f3f4f6" class="sp">1. Configuração do Vídeo</h3>
            <span class="pill ${S.estConcluido ? 'ok' : ''}" id="e-vid-status-pill">${S.estConcluido ? '✅ CONCLUÍDO' : '⏳ Em Produção'}</span>
            <button type="button" class="sm" id="e-ver-videos-criados-top" style="border-color:rgba(16,185,129,.4);color:#6ee7b7">🎬 Vídeos Criados</button>
            <button type="button" class="sm" id="e-novo-video-top" style="border-color:var(--line);color:#cbd5e1">🆕 Próximo Vídeo</button>
          </div>
          <div id="e-videos-criados-drawer" class="kcard" style="display:none;margin-bottom:12px;border-color:rgba(16,185,129,.4);background:#0d1218">
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <b class="sp" style="color:#6ee7b7;font-size:13.5px">🎬 Vídeos e Projetos Criados</b>
              <button type="button" class="sm" id="e-videos-criados-refresh" style="border-color:rgba(16,185,129,.4);color:#6ee7b7">🔄 Atualizar</button>
              <button type="button" class="sm" id="e-videos-criados-close">✖ Fechar</button>
            </div>
            <div id="e-videos-criados-list" style="max-height:380px;overflow-y:auto">Carregando vídeos criados…</div>
          </div>
          <div class="grid g2">
            <div class="f"><label>Canal (Sincronizado c/ DarkPlanner)</label><select id="e-canal">${chOptions(chSel)}</select></div>
            <div class="f"><label>Duração desejada (minutos)</label><input id="e-dur" type="number" min="1" max="120" value="${durInicial}"></div>
          </div>
          <div class="small mut" style="margin:-2px 0 8px">
            ⏱️ <b id="e-dur-auto-info" style="color:#d1fae5">${metaAuto.dur} min = ~${metaAuto.palavras.toLocaleString('pt-BR')} palavras (${metaAuto.blocos} blocos)</b>
            ${dpNarrator.voice_name ? ` · 🎙 <b style="color:#cbd5e1">${esc(dpNarrator.voice_name)}</b>` : ''}
            · <span style="color:#34d399">${esc(sugestaoCanal.botaoCurto)}</span>
            ${ytCloneDoCanal ? ` <span class="pill ok" style="font-size:10px">🔗 ${esc(ytCloneDoCanal.canal_origem || 'Ref')}</span>` : ''}
          </div>
          <div class="f" style="display:none"><div class="row est-radio">
            ${[['normal', 'Normal', ''], ['noticia', 'Notícia', '']].map(([k, n]) => `<label class="opt ${(op.modo || 'normal') === k ? 'on' : ''}"><input type="radio" name="e-modo" value="${k}" ${(op.modo || 'normal') === k ? 'checked' : ''}><b>${n}</b></label>`).join('')}
          </div></div>
          <div class="f" style="margin-bottom:8px"><label id="e-tit-lbl">Título ou Tema do Novo Vídeo</label><input id="e-tit" value="${esc(S.estTitulo || '')}" placeholder="Ex.: What If You Were the Last Person in Australia?"></div>

          <!-- ABA RECOLHÍVEL: OPÇÕES OPCIONAIS (INSTRUÇÕES EXTRAS + ATÉ 3 VÍDEOS OU CANAIS DE REFERÊNCIA) -->
          <details style="margin-bottom:10px;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:#0d1218">
            <summary class="row small" style="cursor:pointer;color:#cbd5e1;font-weight:600;list-style:none">
              <span class="sp">➕ Opções Opcionais (Instruções extras ou Analisar até 3 Vídeos / Canais de Referência)</span>
              <span class="pill" style="font-size:10px">🔽 Abrir</span>
            </summary>
            <div class="grid g2" style="gap:10px;margin-top:8px;align-items:start">
              <div class="f" style="margin:0">
                <label>Contexto ou instruções extras (opcional)</label>
                <textarea id="e-ctx" style="min-height:84px" placeholder="Opcional: instruções específicas para o roteiro…"></textarea>
              </div>
              <div class="f" style="margin:0">
                <label>🔗 Até 3 Vídeos ou Canais (@canal) de Referência p/ Análise — Exclusivo do Canal <b style="color:#6ee7b7">${esc(chObj.nome || 'Atual')}</b></label>
                <div style="display:flex;flex-direction:column;gap:5px">
                  <input id="e-yt-clone-url" value="${esc(ytRef1)}" placeholder="1º Vídeo ou @Canal do YouTube (ex.: https://youtube.com/watch?v=... ou @Canal)…">
                  <input id="e-yt-clone-url-2" value="${esc(ytRef2)}" placeholder="2º Vídeo ou @Canal de referência (opcional)…">
                  <div class="row" style="gap:6px">
                    <input id="e-yt-clone-url-3" value="${esc(ytRef3)}" placeholder="3º Vídeo ou @Canal de referência (opcional)…" style="flex:1">
                    <button type="button" class="sm pri" id="e-yt-clone-run" style="white-space:nowrap">⚡ Analisar Referências</button>
                    <button type="button" class="sm" id="e-yt-clone-unlink" style="white-space:nowrap;border-color:rgba(239,68,68,.4);color:#fca5a5" title="Desvincular referências deste canal">🗑️ Desvincular</button>
                  </div>
                </div>
                <div class="small mut" id="e-yt-clone-bg-status" style="margin-top:4px;color:#6ee7b7">
                  ${ytCloneDoCanal ? `✅ Vinculado exclusivamente ao canal ${esc(chObj.nome || '')}: "${esc(ytCloneDoCanal.titulo_referencia || ytCloneDoCanal.yt_id)}"` : 'Analisa de 1 a 3 vídeos/canais juntos e vincula o DNA visual e narrativa exclusivamente a este canal.'}
                </div>
              </div>
            </div>
          </details>

          <!-- ESTEIRA ANTIGRAVITY V8 + DARKPLANNER — CHECKLIST CLEAN -->
          <div class="kcard" style="border-color:var(--line);margin-bottom:10px;background:#0d1218;padding:12px">
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <b class="sp" style="font-size:14px;color:#f3f4f6">☑️ 2. Passos para executar</b>
              <button type="button" class="sm" id="e-chk-marcar-todos" style="border-color:rgba(16,185,129,.4);color:#6ee7b7">☑️ Marcar Todos</button>
              <button type="button" class="sm" id="e-toggle-all-steps" style="border-color:var(--line);color:#9ba3b0">${S.estMostrarTudo ? '🔽 Fechar Abas' : '👁️ Abrir Abas'}</button>
            </div>

            <!-- LISTA COMPACTA E CLEAN DE OPÇÕES PARA MARCAR (TEMA ESCURO + VERDE ESMERALDA) -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px;margin-bottom:10px" id="e-esteira-checklist">
              ${[
                ['p1_estruturar', '1', `1️⃣ Estruturar Roteiro (${metaAuto.blocos} blocos)`],
                ['p2_roteiro', '2', '2️⃣ Escrever Roteiro Limpo'],
                ['p4_pacote_viral', '4', '3️⃣ Descrição + Tags + Thumb'],
                ['p5_audio_srt', '5', '4️⃣ Áudio MP3 + SRT Tempo VEO'],
                ['p6_cenas', '6', '5️⃣ Cenas e Prompts Flow'],
                ['p7_projeto_dp', '7', '6️⃣ Enviar ao Chat DarkPlanner'],
              ].map(([k, v, lbl]) => {
                const on = !!S.estOpcoesMarcadas[k];
                return `<label class="card" style="margin:0;padding:7px 10px;cursor:pointer;border:1px solid ${on ? 'rgba(16,185,129,.55)' : 'var(--line)'};background:${on ? 'rgba(16,185,129,.1)' : '#11161d'};display:flex;align-items:center;gap:8px">
                  <input type="checkbox" class="e-step-chk" data-step-key="${k}" value="${v}" ${on ? 'checked' : ''}>
                  <b style="color:${on ? '#ecfdf5' : '#9ba3b0'};font-size:12.5px">${lbl}</b>
                </label>`;
              }).join('')}
            </div>

            <!-- FAIXAS DE TEMPO DO SRT VEO + QUEBRAR POR FRASES (COMPACTO & CLEAN) -->
            <div id="e-veo-faixas-bar" class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px;padding:7px 10px;border-radius:8px;background:#11161d;border:1px solid var(--line)">
              <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px">
                <input type="checkbox" id="e-veo-faixas-ativo" ${S.estVeoFaixasCfg.ativo !== false ? 'checked' : ''} style="width:15px;height:15px">
                <b style="color:#d1fae5;font-size:12px">⏱️ SRT VEO:</b>
              </label>
              <span class="small">1ºs</span>
              <input type="number" id="e-veo-prim-blocos" min="1" max="500" step="1" value="${S.estVeoFaixasCfg.primeiros_blocos || 60}" style="width:54px;padding:3px 5px;font-weight:700;text-align:center">
              <span class="small">blocos de</span>
              <input type="number" id="e-veo-prim-min" min="0" max="30" step="0.5" value="${S.estVeoFaixasCfg.primeiros_min_s ?? 2}" style="width:48px;padding:3px 5px;font-weight:700;text-align:center">
              <span class="small">a</span>
              <input type="number" id="e-veo-prim-max" min="1" max="60" step="0.5" value="${S.estVeoFaixasCfg.primeiros_max_s || 4}" style="width:48px;padding:3px 5px;font-weight:700;text-align:center">
              <span class="small">s · demais</span>
              <input type="number" id="e-veo-rest-min" min="0" max="60" step="0.5" value="${S.estVeoFaixasCfg.resto_min_s ?? 4}" style="width:48px;padding:3px 5px;font-weight:700;text-align:center">
              <span class="small">a</span>
              <input type="number" id="e-veo-rest-max" min="1" max="120" step="0.5" value="${S.estVeoFaixasCfg.resto_max_s || 8}" style="width:48px;padding:3px 5px;font-weight:700;text-align:center">
              <span class="small">s</span>
              <label style="margin:0 0 0 auto;cursor:pointer;display:flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;border:1px solid rgba(16,185,129,.4);background:rgba(16,185,129,.1)">
                <input type="checkbox" id="e-veo-quebrar-frases" ${S.estVeoFaixasCfg.quebrar_frases !== false ? 'checked' : ''} style="width:14px;height:14px">
                <b style="font-size:11px;color:#6ee7b7">🪄 Quebrar por frases</b>
              </label>
            </div>

            <!-- BARRA COMPACTA: THUMB (CHATGPT) + ATÉ 5 PERSONAGENS DE REFERÊNCIA PARA OS PROMPTS DO VÍDEO ([01] A [05]) -->
            <div id="e-thumb-avatar-bar" class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px;padding:7px 10px;border-radius:8px;background:#11161d;border:1px solid var(--line)">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <img id="e-thumb-avatar-img" src="" alt="Avatar" style="display:none;width:28px;height:28px;object-fit:contain;border-radius:6px;border:1px solid #10b981;background:#0a0d12;flex-shrink:0">
                <b style="color:#d1fae5;font-size:12px;white-space:nowrap">🖼 Thumb:</b>
                <span class="pill ok" id="e-thumb-avatar-status" style="font-size:10px;padding:2px 7px">✅ Estilo do Canal</span>
                <span id="e-thumb-paleta-box" style="display:inline-flex;align-items:center;gap:3px"></span>
                <span id="e-thumb-estilo-imgs-box" style="display:none;align-items:center;gap:4px"></span>
                <input type="file" id="e-inp-upload-avatar-thumb" accept="image/*" style="display:none">
                <input type="file" id="e-inp-upload-estilo-thumb" accept="image/*" multiple style="display:none">
                <input type="hidden" id="e-inp-desc-avatar-thumb" value="">
                <input type="hidden" id="e-inp-estilo-thumb-canal" value="">
                <button type="button" class="sm" id="e-btn-upload-avatar-thumb" style="border-color:rgba(16,185,129,.45);color:#6ee7b7;padding:3px 8px;font-size:11px" title="Anexar Avatar da Thumbnail">📎 Avatar Thumb</button>
                <button type="button" class="sm" id="e-btn-upload-estilo-thumb" style="border-color:var(--line);color:#cbd5e1;padding:3px 8px;font-size:11px" title="Anexar exemplo de estilo de Thumbnail">🖼️ Estilo</button>
                <button type="button" class="sm" id="e-btn-ref01-avatar-thumb" style="display:none;border-color:var(--line);color:#cbd5e1;padding:3px 7px;font-size:10.5px">🧩 [01]</button>
                <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;border:1px solid var(--line);background:#0d1218" title="Incluir o Avatar na Thumbnail gerada pelo ChatGPT">
                  <input type="checkbox" id="e-chk-avatar-thumb-sempre" style="width:13px;height:13px">
                  <span style="font-size:10.5px;color:#cbd5e1;white-space:nowrap">Usar Avatar</span>
                </label>
                <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;border:1px solid var(--line);background:#0d1218" title="Opcional: sobrepor recorte PNG do Avatar no canto lateral">
                  <input type="checkbox" id="e-chk-avatar-thumb-comp" style="width:13px;height:13px">
                  <span style="font-size:10.5px;color:#9ba3b0;white-space:nowrap">📌 Fixar Canto</span>
                </label>
                <button type="button" class="sm" id="e-btn-del-avatar-thumb" style="display:none;border-color:rgba(239,68,68,.4);color:#fca5a5;padding:2px 6px;font-size:10.5px" title="Remover Avatar da Thumb">✕</button>
              </div>

              <!-- ATÉ 5 PERSONAGENS DE REFERÊNCIA PARA OS PROMPTS DO VÍDEO ([01] A [05]) -->
              <div style="margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding-left:8px;border-left:1px solid var(--line)">
                <b style="color:#6ee7b7;font-size:11.5px;white-space:nowrap">🧑 Personagens Vídeo (até 5):</b>
                <img id="e-pers-video-img" src="" alt="Personagem Vídeo" style="display:none;width:26px;height:26px;object-fit:cover;border-radius:6px;border:1px solid #10b981;background:#0a0d12;flex-shrink:0">
                <span id="e-pers-video-list-box" style="display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap"></span>
                <input type="file" id="e-inp-upload-pers-video" accept="image/*" multiple style="display:none">
                <button type="button" class="sm" id="e-btn-upload-pers-video" style="border-color:rgba(16,185,129,.45);color:#6ee7b7;padding:3px 8px;font-size:11px" title="Anexar de 1 até 5 imagens de personagens para serem referências [01] a [05] nos prompts do vídeo">📎 Anexar (0/5)</button>
                <label id="e-lbl-pers-video-ativo" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;border:1px solid var(--line);background:#0d1218" title="Se marcado e anexado, usa os personagens anexados como referências [01]..[05] nos prompts do vídeo e no Pacote do DarkPlanner.">
                  <input type="checkbox" id="e-chk-pers-video-ativo" style="width:13px;height:13px">
                  <span style="font-size:10.5px;color:#cbd5e1;white-space:nowrap" id="e-txt-pers-video-status">Usar nos Prompts</span>
                </label>
                <button type="button" class="sm" id="e-btn-del-pers-video" style="display:none;border-color:rgba(239,68,68,.4);color:#fca5a5;padding:2px 6px;font-size:10.5px" title="Limpar todos os personagens anexados do vídeo">✕ Todos</button>
              </div>
            </div>

            <!-- BARRA DE EXECUÇÃO AUTOMÁTICA + FILA DE PRODUÇÃO + MODELO DO CHAT DARKPLANNER -->
            <div class="row" style="gap:8px;flex-wrap:wrap;padding:8px 10px;border-radius:8px;background:#11161d;border:1px solid rgba(16,185,129,.4)">
              <label id="e-lbl-seguir-tudo-auto" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:6px;border:1px solid ${!S.estPausarParaVerificar ? '#10b981' : 'var(--line)'};background:${!S.estPausarParaVerificar ? 'rgba(16,185,129,.14)' : '#0d1218'}">
                <input type="checkbox" id="e-chk-seguir-tudo-auto" ${!S.estPausarParaVerificar ? 'checked' : ''} style="width:15px;height:15px">
                <b style="color:${!S.estPausarParaVerificar ? '#6ee7b7' : '#cbd5e1'};font-size:12px;white-space:nowrap">⚡ Seguir passos tudo automático (1 ao 6)</b>
              </label>

              <label id="e-lbl-usar-fila-auto" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:6px;border:1px solid ${S.estUsarFilaAuto !== false ? '#10b981' : 'var(--line)'};background:${S.estUsarFilaAuto !== false ? 'rgba(16,185,129,.14)' : '#0d1218'}" title="Quando marcado, ao clicar em Gerar Tudo Automático o vídeo vai para a Fila em 2º plano e já libera a tela para você iniciar o próximo vídeo imediatamente!">
                <input type="checkbox" id="e-chk-usar-fila-auto" ${S.estUsarFilaAuto !== false ? 'checked' : ''} style="width:14px;height:14px">
                <b style="color:${S.estUsarFilaAuto !== false ? '#6ee7b7' : '#9ba3b0'};font-size:11.5px;white-space:nowrap">📥 Enviar p/ Fila (Liberar p/ Novo Vídeo)</b>
              </label>

              <label id="e-lbl-pausar-verificar" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:6px;border:1px solid ${S.estPausarParaVerificar ? '#10b981' : 'var(--line)'};background:${S.estPausarParaVerificar ? 'rgba(16,185,129,.14)' : '#0d1218'}">
                <input type="checkbox" id="e-chk-pausar-verificar" ${S.estPausarParaVerificar ? 'checked' : ''} style="width:14px;height:14px">
                <b style="color:${S.estPausarParaVerificar ? '#6ee7b7' : '#9ba3b0'};font-size:11.5px;white-space:nowrap">⏸️ Pausar p/ verificar</b>
              </label>

              <!-- ESCOLHA DO MODELO NO CHAT DO DARKPLANNER DESKTOP (FLASH / ARGON / GEMINI 4 CARBON HIGH) -->
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:4px 8px;border-radius:6px;background:#0d1218;border:1px solid var(--line);margin-left:auto">
                <span style="font-size:11px;font-weight:700;color:#9ba3b0;white-space:nowrap">💬 Chat DP:</span>
                <label id="e-lbl-chat-dp-flash" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;border:1px solid ${curChatOpt === 'flash_high' ? '#10b981' : 'var(--line)'};background:${curChatOpt === 'flash_high' ? 'rgba(16,185,129,.14)' : 'transparent'}" title="Antigravity · Gemini 3.8 Flash · High">
                  <input type="checkbox" class="e-chk-chat-dp-opt" data-chat-opt="flash_high" value="flash_high" ${curChatOpt === 'flash_high' ? 'checked' : ''} style="width:13px;height:13px">
                  <b style="font-size:10.5px;color:${curChatOpt === 'flash_high' ? '#6ee7b7' : '#9ba3b0'};white-space:nowrap">⚡ 3.8 Flash</b>
                </label>
                <label id="e-lbl-chat-dp-argon" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;border:1px solid ${curChatOpt === 'argon_medium' ? '#10b981' : 'var(--line)'};background:${curChatOpt === 'argon_medium' ? 'rgba(16,185,129,.14)' : 'transparent'}" title="Antigravity · Gemini 4 Argon · Medium">
                  <input type="checkbox" class="e-chk-chat-dp-opt" data-chat-opt="argon_medium" value="argon_medium" ${curChatOpt === 'argon_medium' ? 'checked' : ''} style="width:13px;height:13px">
                  <b style="font-size:10.5px;color:${curChatOpt === 'argon_medium' ? '#6ee7b7' : '#9ba3b0'};white-space:nowrap">🧠 4 Argon</b>
                </label>
                <label id="e-lbl-chat-dp-carbon" style="margin:0;cursor:pointer;display:flex;align-items:center;gap:4px;padding:2px 7px;border-radius:5px;border:1px solid ${curChatOpt === 'gemini_4_carbon_high' ? '#22d3ee' : 'var(--line)'};background:${curChatOpt === 'gemini_4_carbon_high' ? 'rgba(34,211,238,.16)' : 'transparent'}" title="Antigravity · Gemini 4 Carbon · High">
                  <input type="checkbox" class="e-chk-chat-dp-opt" data-chat-opt="gemini_4_carbon_high" value="gemini_4_carbon_high" ${curChatOpt === 'gemini_4_carbon_high' ? 'checked' : ''} style="width:13px;height:13px">
                  <b style="font-size:10.5px;color:${curChatOpt === 'gemini_4_carbon_high' ? '#67e8f9' : '#9ba3b0'};white-space:nowrap">♊ 4 Carbon High</b>
                </label>
              </div>

              <button type="button" class="sm pri" id="e-btn-add-fila-novo" style="padding:8px 13px;font-size:12px;white-space:nowrap;background:#047857;border-color:#10b981" title="Adiciona este vídeo na Fila Automática em 2º plano e já limpa a tela para você configurar o próximo vídeo imediatamente!">
                📥 + Fila & Iniciar Novo Vídeo
              </button>
              <button type="button" class="pri" id="e-btn-rodar-esteira" style="padding:8px 16px;font-size:12.5px;white-space:nowrap">
                🚀 Executar Passos Marcados
              </button>
            </div>

            <!-- PAINEL DA FILA DE PRODUÇÃO AUTOMÁTICA (EXECUTA EM 2º PLANO ENQUANTO VOCÊ CRIA NOVOS VÍDEOS) -->
            <div id="e-fila-producao-box" style="display:none;margin-top:8px;padding:10px 12px;border-radius:10px;border:1px solid rgba(16,185,129,.45);background:#0d1218"></div>

            <!-- BARRA COMPACTA QUANDO TODO O PROJETO GERADO ESTÁ MINIMIZADO -->
            <div id="e-est-proj-min-bar" class="fd-min-bar" style="display:${S.estProjetoMinimizado ? 'flex' : 'none'};margin-top:8px">
              <span class="pill ok" style="font-size:10.5px">🔽 MINIMIZADO</span>
              <b id="e-est-proj-min-txt" style="color:#ecfdf5;font-size:12.5px" class="sp">🎬 Projeto Minimizado: "${esc(S.estTitulo || 'Projeto Atual')}"</b>
              <button type="button" class="sm" id="e-est-proj-min-dl" style="border-color:#38bdf8;color:#7dd3fc;font-weight:700" title="Baixar todos os arquivos gerados deste projeto em .ZIP">⬇️ Baixar .ZIP</button>
              <button type="button" class="sm" id="e-est-proj-min-mon" style="border-color:#22d3ee;color:#67e8f9;font-weight:700">💬 Ver no Monitor (Chat DP)</button>
              <button type="button" class="sm pri" id="e-est-proj-min-open">📂 Abrir e Ver Processo</button>
            </div>

            <!-- BANNER INTERATIVO: "DESEJA QUE EU CONTINUE?" -->
            <div id="e-v8-confirm-continue-box" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid #10b981;background:rgba(16,185,129,.1)">
              <div class="row" style="gap:10px;flex-wrap:wrap">
                <div class="sp">
                  <b style="color:#6ee7b7;font-size:13.5px" id="e-v8-confirm-title">✅ Etapa concluída! Deseja continuar para o próximo passo?</b>
                  <div class="small" style="color:#d1fae5;margin-top:2px" id="e-v8-confirm-sub">Confira o resultado abaixo.</div>
                </div>
                <button type="button" class="pri" id="e-v8-confirm-yes">▶️ Sim, continuar</button>
                <button type="button" class="sm" id="e-v8-confirm-adjust">✏️ Pedir ajuste</button>
                <button type="button" class="sm" id="e-v8-confirm-stop">⏹ Parar</button>
              </div>
            </div>

            <!-- SELECT OCULTO DE COMPATIBILIDADE -->
            <div style="display:none">
              <select id="e-v8-modo">
                <option value="estruturar">estruturar</option>
                <option value="roteiro_completo">roteiro_completo</option>
                <option value="analisar_titulo">analisar_titulo</option>
                <option value="analisar_canal">analisar_canal</option>
              </select>
              <button type="button" id="e-v8-btn">Executar</button>
              <button type="button" id="e-step1-btn"></button>
              <button type="button" id="e-step2-btn"></button>
              <button type="button" id="e-step3-btn"></button>
              <button type="button" id="e-step-viral-btn"></button>
              <button type="button" id="e-step45-btn"></button>
              <button type="button" id="e-step6-scroll"></button>
              <button type="button" id="e-step7-scroll"></button>
            </div>
            <div id="e-v8-neurais-box" style="display:none"></div>
            <div id="e-v8-viral-box" style="display:none;margin-top:10px;padding:10px;border:1px solid rgba(16,185,129,.4);border-radius:10px;background:#11161d"></div>
            <div id="e-v8-out" style="display:none;margin-top:10px">
              <div class="copybox" id="e-v8-txt" style="max-height:240px;font-family:inherit;line-height:1.55;white-space:normal"></div>
              <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">
                <button type="button" class="sm pri" id="e-v8-escrever">✅ 2️⃣ Escrever Roteiro</button>
                <button type="button" class="sm" id="e-v8-viral-btn">🖼 3️⃣ Descrição + Tags + Thumb</button>
                <button type="button" class="sm" id="e-v8-audiogen">🎙 4️⃣ Gerar Áudio + SRT</button>
                <button type="button" class="sm" id="e-v8-usar">📋 Colar no Contexto</button>
                <button type="button" class="sm" id="e-v8-dp">🎬 Salvar no DarkPlanner</button>
                <button type="button" class="sm" id="e-v8-copy">Copiar Limpo</button>
              </div>

              <!-- CAIXA DE CONVERSA COM A IA RECOLHÍVEL -->
              <details id="e-v8-chat-details" style="margin-top:8px;padding:8px 11px;border-radius:8px;border:1px solid var(--line);background:#11161d">
                <summary style="cursor:pointer;color:#6ee7b7;font-weight:600;font-size:12px">💬 Conversar com a IA / Pedir ajuste</summary>
                <div style="margin-top:8px">
                  <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">
                    <button type="button" class="sm" data-v8-chip="Refaça o gancho inicial mais forte, começando direto no ponto mais dramático sem enrolação">⚡ Gancho mais forte</button>
                    <button type="button" class="sm" data-v8-chip="Aprofunde mais os blocos e mantenha rigorosamente a duração total em minutos que eu pedi">⏱️ Cumprir minutos exatos</button>
                    <button type="button" class="sm" data-v8-chip="Deixe a narrativa mais investigativa, com fatos concretos e mais tensão entre os blocos">🔥 Mais tensão e fatos</button>
                    <button type="button" class="sm" data-v8-chip="Mude a ordem dos blocos para criar um mistério maior até o clímax">🧱 Reorganizar blocos</button>
                  </div>
                  <div id="e-v8-chat-hist" style="display:none;max-height:110px;overflow:auto;margin-bottom:8px;padding:8px;border-radius:8px;background:#0a0d12;font-size:12px"></div>
                  <textarea id="e-v8-chat-msg" style="min-height:50px;font-size:13px;margin:0" placeholder="Escreva aqui o que você quer mudar ou como quer que a IA refaça…"></textarea>
                  <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">
                    <button type="button" class="pri sm" id="e-v8-chat-send">🔄 Pedir para a IA Refazer</button>
                    <button type="button" class="sm" id="e-v8-chat-ref-est">🧱 Refazer Estrutura</button>
                    <button type="button" class="sm" id="e-v8-chat-ref-rot">📜 Refazer Roteiro</button>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <!-- ABA RECOLHÍVEL (FECHADA POR PADRÃO): PASSO 4 — NARRAÇÃO + ROTEIRO LIMPO -->
          <details id="e-step45-wrap" class="kcard" style="border-color:var(--line);background:#0d1218;margin-top:8px;padding:9px 12px">
            <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap;list-style:none">
              <b class="sp" style="color:#d1fae5;font-size:13px">🎙 Passo 4 — Roteiro Limpo, Áudio MP3 e Legenda SRT</b>
              <span class="pill" style="font-size:10.5px">🔽 Abrir</span>
            </summary>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line)">
              <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
                <button type="button" class="est-tab sm ${S.estAudio ? '' : 'on'}" data-narr="ia">🎙 Narrar c/ IA</button>
                <button type="button" class="est-tab sm ${S.estAudio ? 'on' : ''}" data-narr="audio">🎧 Já tenho MP3/SRT</button>
                <button type="button" class="sm" id="e-auto-detect-audio" style="border-color:rgba(16,185,129,.4);color:#6ee7b7">🔄 Detectar Baixados</button>
                <button type="button" class="pri sm" id="e-open-dp-audiogen">🎙 Abrir Gerador de Áudio + SRT</button>
              </div>
              <div id="e-audio-box" class="est-drop" style="${S.estAudio ? '' : 'display:none'};margin-bottom:8px">
                <div class="grid g2">
                  <label class="est-arq ${S.estMp3Url ? 'ok' : ''}" id="e-arq-a"><span>🎙</span><div><b>Áudio da narração (.mp3)</b><div class="small" id="e-a-nome">${S.estMp3Url ? '✓ Áudio DarkPlanner vinculado' : 'escolher arquivo (.mp3, .wav)'}</div></div><input type="file" id="e-audio" accept="audio/*,.mp3,.wav,.m4a,.ogg" hidden></label>
                  <label class="est-arq ${S.estSrtTexto ? 'ok' : ''}" id="e-arq-s"><span>💬</span><div><b>Legenda (.srt Tempo VEO)</b><div class="small" id="e-s-nome">${S.estSrtTexto ? `✓ SRT vinculado (${S.estTotalBlocosSrt || ''} blocos)` : 'escolher arquivo .srt'}</div></div><input type="file" id="e-srt" accept=".srt" hidden></label>
                </div>
              </div>
              <div class="f" style="margin:0">
                <div class="row" style="margin-bottom:4px">
                  <label id="e-rot-lbl" class="sp" style="margin:0">Roteiro Limpo para Narração (apenas o texto falado)</label>
                  <button type="button" class="sm" id="e-rot-clean-btn">🧹 Limpar [00:00] / Blocos</button>
                </div>
                <textarea id="e-rot" style="min-height:105px;max-height:190px" placeholder="O roteiro limpo gerado no Passo 2 aparece aqui automaticamente…">${esc(typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro(S.estRoteiro || '') : limparCaracteresEspeciaisV8(S.estRoteiro || ''))}</textarea>
                <div class="row small mut" style="margin-top:4px"><span id="e-pal">0 palavras</span><span class="sp"></span><span id="e-min"></span></div>
              </div>
              <div class="est-leitor" id="e-leitor" style="display:none;margin-top:8px;padding:8px 12px">
                <div class="grid g4"><div><b id="l-tempo">0:00</b><small>de fala</small></div><div><b id="l-pal">0</b><small>palavras</small></div>
                <div><b id="l-ppm">${Number(S.settings.palavras_por_minuto || 145)}</b><small>PPM</small></div><div><b id="l-cenas">0</b><small>cenas (~${Number(S.settings.segundos_por_cena || 8)}s)</small></div></div>
                <div class="small mut" id="l-origem" style="display:none"></div>
              </div>
            </div>
          </details>

          <!-- ABA RECOLHÍVEL (FECHADA POR PADRÃO): PASSO 5 — CENAS E PROMPTS DO VÍDEO -->
          <details class="kcard" id="e-step6-card" style="border-color:var(--line);background:#0d1218;margin-top:8px;padding:9px 12px">
            <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap;list-style:none">
              <b class="sp" style="color:#d1fae5;font-size:13px">🎬 Passo 5 — Cenas e Prompts do Vídeo</b>
              <span class="pill ok" id="e-skill-sel-badge" style="font-size:10.5px">☑️ ${esc(sugestaoCanal.botaoCurto)}</span>
              <span class="pill" id="e-srt-badge" style="border-color:#38bdf8;color:#7dd3fc;font-size:10.5px">${S.estSrtTexto ? `✓ SRT (${S.estTotalBlocosSrt || 'vários'} blocos)` : 'Aguardando SRT'}</span>
              <span class="pill" style="border-color:#38bdf8;color:#bae6fd;font-size:11px">🔽 Abrir / Fechar</span>
            </summary>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)">
              <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <button type="button" class="pri" id="e-run-skill6" style="background:#0284c7;border-color:#38bdf8;${ehModoVideoReal ? 'display:none' : ''}">🎬 Gerar Cenas e Prompts Agora (Passo 5)</button>
                <button type="button" class="pri" id="e-run-vidreal" style="background:#059669;border-color:#10b981;${ehModoVideoReal ? '' : 'display:none'}">🌍 Buscar Vídeos e Fotos Reais por SRT Agora (Passo 5)</button>
                <span class="small mut sp">Estilo visual e cenas já configurados automaticamente no backend para <b>${esc(chObj.nome || 'Canal')}</b>.</span>
              </div>

              <!-- SUB-ABA FECHADA POR PADRÃO COM TODAS AS CONFIGURAÇÕES TÉCNICAS DO PASSO 6 -->
              <details style="margin-bottom:8px;padding:8px 10px;border-radius:8px;border:1px solid rgba(56,189,248,.3);background:rgba(15,23,42,.55)">
                <summary class="row small" style="cursor:pointer;color:#fde68a;font-weight:700;list-style:none">
                  <span class="sp">⚙️ Configurações Técnicas de Estilo, Skill e Imagens de Referência (opcional)</span>
                  <span class="pill" style="font-size:10.5px;border-color:#fbbf24;color:#fde68a">🔽 Abrir / Fechar</span>
                </summary>
                <div style="margin-top:10px">
                  <div class="row" style="margin:0 0 8px 0;gap:8px;flex-wrap:wrap">
                  <span class="small sp" style="color:#fde68a">💡 <b>Recomendada p/ "${esc(chObj.nome || 'Canal')}":</b> ${esc(sugestaoCanal.resumoUso)}</span>
                  <button type="button" class="sm pri" id="e-btn-marcar-sugestao" data-sug-skill="${esc(sugestaoCanal.modo)}" style="background:#d97706;border-color:#fbbf24;color:#fff;white-space:nowrap">
                    ☑️ Usar Recomendada (${esc(sugestaoCanal.botaoCurto)})
                  </button>
                </div>
                <div class="grid g2" style="gap:8px;margin-bottom:10px" id="e-skill-cards">
                  <!-- 1 - SKILL EXTRATOR -->
                  <label class="opt ${skillMarcada === 'skill1_extrator' ? 'on' : ''}" data-skill="skill1_extrator" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill1_extrator' ? '#f472b6' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill1_extrator" ${skillMarcada === 'skill1_extrator' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill1_extrator' ? 'ok' : ''}" data-skill-chk="skill1_extrator" style="font-size:10px">${skillMarcada === 'skill1_extrator' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#fbcfe8;font-size:12px"> 1 - SKILL EXTRATOR (Imagens)</b>
                  </label>
                  <!-- 2 - SKILL MESTRE -->
                  <label class="opt ${skillMarcada === 'skill2_mestre_img' ? 'on' : ''}" data-skill="skill2_mestre_img" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill2_mestre_img' ? '#a855f7' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill2_mestre_img" ${skillMarcada === 'skill2_mestre_img' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill2_mestre_img' ? 'ok' : ''}" data-skill-chk="skill2_mestre_img" style="font-size:10px">${skillMarcada === 'skill2_mestre_img' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#e9d5ff;font-size:12px"> 2 - SKILL MESTRE (Imagens SRT)</b>
                  </label>
                  <!-- 3 - DIRETOR CINEMATOGRÁFICO -->
                  <label class="opt ${skillMarcada === 'skill3_diretor_iv' ? 'on' : ''}" data-skill="skill3_diretor_iv" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill3_diretor_iv' ? '#f59e0b' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill3_diretor_iv" ${skillMarcada === 'skill3_diretor_iv' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill3_diretor_iv' ? 'ok' : ''}" data-skill-chk="skill3_diretor_iv" style="font-size:10px">${skillMarcada === 'skill3_diretor_iv' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#fde68a;font-size:12px"> 3 - Diretor Cinematográfico (Img+Vídeo)</b>
                  </label>
                  <!-- 4 - PERSONAGENS SRT -->
                  <label class="opt ${skillMarcada === 'skill4_personagens_srt' ? 'on' : ''}" data-skill="skill4_personagens_srt" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill4_personagens_srt' ? '#2dd4bf' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill4_personagens_srt" ${skillMarcada === 'skill4_personagens_srt' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill4_personagens_srt' ? 'ok' : ''}" data-skill-chk="skill4_personagens_srt" style="font-size:10px">${skillMarcada === 'skill4_personagens_srt' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#99f6e4;font-size:12px"> 4 - Prompts c/ Personagens SRT</b>
                  </label>
                  <!-- 5 - PERSONAGEM CONSISTENTE -->
                  <label class="opt ${skillMarcada === 'skill5_personagem_mestre' ? 'on' : ''}" data-skill="skill5_personagem_mestre" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill5_personagem_mestre' ? '#818cf8' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill5_personagem_mestre" ${skillMarcada === 'skill5_personagem_mestre' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill5_personagem_mestre' ? 'ok' : ''}" data-skill-chk="skill5_personagem_mestre" style="font-size:10px">${skillMarcada === 'skill5_personagem_mestre' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#c7d2fe;font-size:12px"> 5 - Personagem Mestre Consistente</b>
                  </label>
                  <!-- 6 - NOVA SKILL MESTRE -->
                  <label class="opt ${skillMarcada === 'skill6_cenas_flow' ? 'on' : ''}" data-skill="skill6_cenas_flow" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'skill6_cenas_flow' ? '#38bdf8' : 'var(--line)'};border-radius:8px">
                    <input type="radio" name="e-skill-sel" value="skill6_cenas_flow" ${skillMarcada === 'skill6_cenas_flow' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'skill6_cenas_flow' ? 'ok' : ''}" data-skill-chk="skill6_cenas_flow" style="font-size:10px">${skillMarcada === 'skill6_cenas_flow' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#7dd3fc;font-size:12px"> 6 - NOVA SKILL MESTRE (Flow SRT)</b>
                  </label>
                  <!-- 7 - VÍDEO E IMAGENS REAIS -->
                  <label class="opt ${skillMarcada === 'video_real' ? 'on' : ''}" data-skill="video_real" style="cursor:pointer;padding:8px 10px;border:1px solid ${skillMarcada === 'video_real' ? '#10b981' : 'var(--line)'};border-radius:8px;grid-column:span 2">
                    <input type="radio" name="e-skill-sel" value="video_real" ${skillMarcada === 'video_real' ? 'checked' : ''} hidden>
                    <span class="pill ${skillMarcada === 'video_real' ? 'ok' : ''}" data-skill-chk="video_real" style="font-size:10px">${skillMarcada === 'video_real' ? '☑️ MARCADA' : '☐'}</span>
                    <b style="color:#6ee7b7;font-size:12px"> 7 - 🌍 Vídeo e Imagens Reais (0% IA — Direto no Studio)</b>
                  </label>
                </div>
                <div class="row" style="gap:8px;flex-wrap:wrap">
                  <details style="flex:1;min-width:220px;padding:6px 10px;border-radius:8px;border:1px solid rgba(56,189,248,.3);background:rgba(15,23,42,.5)">
                    <summary class="small" style="cursor:pointer;color:#7dd3fc">🧩 Prompts do Canal (${dpPrompts.length})</summary>
                    <div style="margin-top:8px">
                      ${dpPrompts.length ? `<div class="grid g${Math.min(2, dpPrompts.length)}" style="gap:6px" id="e-canal-prompts-chk-list">
                        ${dpPrompts.map(p => {
                          const pid = String(p.id || p.nome);
                          const marcado = !Array.isArray(S.estPromptsMarcados) || S.estPromptsMarcados.includes(pid);
                          const papel = classificarPapelPrompt(p);
                          return `<label class="card" style="margin:0;padding:7px;border:1px solid ${marcado ? '#38bdf8' : 'var(--line)'};background:${marcado ? 'rgba(14,116,144,.2)' : 'rgba(15,23,42,.4)'};cursor:pointer">
                            <div class="row" style="gap:6px">
                              <input type="checkbox" class="e-chk-prompt-canal" value="${esc(pid)}" ${marcado ? 'checked' : ''}>
                              <b class="small sp" style="color:#7dd3fc">${papel.icone} ${esc(p.nome)}</b>
                            </div>
                          </label>`;
                        }).join('')}
                      </div>` : `<div class="small mut">Usando estilo visual padrão do canal.</div>`}
                    </div>
                  </details>
                  <details style="flex:1;min-width:220px;padding:6px 10px;border-radius:8px;border:1px solid rgba(56,189,248,.3);background:rgba(15,23,42,.5)">
                    <summary class="small" style="cursor:pointer;color:#7dd3fc">📄 Ver / Colar <code>.srt</code> manualmente</summary>
                    <div style="margin-top:8px">
                      <textarea id="e-srt-raw" style="min-height:85px;font-family:monospace;font-size:11.5px" placeholder="Cole aqui o conteúdo do seu arquivo .srt…">${esc(S.estSrtTexto || '')}</textarea>
                    </div>
                  </details>
                  <button type="button" class="sm" id="e-btn-outra-skill-cat" style="border-color:#f59e0b;color:#fde68a">📚 Catálogo (${skillsCatalogoDp.length || 36} Skills)</button>
                </div>

                <div id="e-skill-nenhuma-box" style="display:none"></div>

                <!-- Opções para Skills 1 a 6 / Outra Skill do Catálogo -->
                <div id="e-skill6-opts" style="${ehModoSkill6OuImg ? '' : 'display:none'};margin-top:8px">
                  <!-- PAINEL EXCLUSIVO DA SKILL 1: EXTRATOR DE ESTILO VISUAL POR IMAGENS (FASE 2.5 PIXEL-PERFECT) -->
                  <div id="e-skill1-extrator-box" class="card" style="${skillMarcada === 'skill1_extrator' ? '' : 'display:none'};margin:0 0 10px 0;padding:10px 12px;border:1px solid #f472b6;background:rgba(236,72,153,.1)">
                    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
                      <b class="sp" style="color:#fbcfe8">🔬 Skill 1 — Extrator Forense de Estilo Visual por Imagens (Paleta Pixel-Perfect)</b>
                      <span class="pill" style="border-color:#f472b6;color:#fbcfe8;font-size:10.5px">3 a 10 imagens → STYLE_DNA + CHARACTER_DNA v2</span>
                    </div>
                    <div class="grid g3" style="gap:8px;align-items:end">
                      <div class="f" style="margin:0">
                        <label style="color:#fbcfe8">Enviar 3 a 10 imagens de referência (opcional se usar pacote do canal):</label>
                        <input type="file" id="e-s1-files" accept="image/*" multiple style="padding:5px">
                      </div>
                      <div class="f" style="margin:0">
                        <label style="color:#fbcfe8">Observações (ex: "o de óculos é o protagonista"):</label>
                        <input id="e-s1-obs" placeholder="Opcional: observações sobre o estilo ou personagem…">
                      </div>
                      <div>
                        <button type="button" class="pri sm" id="e-s1-extract-btn" style="width:100%;padding:9px;background:#db2777;border-color:#f472b6">🎨 Extrair DNA + Paleta Hex Agora</button>
                      </div>
                    </div>
                    <div id="e-s1-out" style="display:none;margin-top:8px"></div>
                  </div>

                  <div id="e-outra-skill-catalogo-box" style="${skillMarcada === 'outra_skill' ? '' : 'display:none'};margin-bottom:8px">
                    <div class="f" style="margin:0">
                      <label style="color:#fde68a">📚 Escolha a Skill do Catálogo DarkPlanner:</label>
                      <select id="e-s6-catalogo-id">
                        <option value="">— Selecione uma Skill do seu Catálogo DarkPlanner —</option>
                        ${skillsCatalogoDp.map(sk => `<option value="${esc(String(sk.id))}">#${esc(String(sk.numero || ''))} [${esc(sk.etapa || '')}] ${esc(sk.titulo || '')}</option>`).join('')}
                      </select>
                    </div>
                  </div>

                  <!-- ESTILO VISUAL DO CANAL (STYLE_DNA) -->
                  <div class="card" style="margin:0 0 8px 0;padding:8px 10px;border:1px solid rgba(56,189,248,.35);background:rgba(2,132,199,.1)">
                    <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
                      <b class="sp small" style="color:#7dd3fc">🎨 Estilo Visual Oficial do Canal (${esc(chObj.nome || 'Canal')})</b>
                      <span class="pill ok" style="font-size:10px">Automático no Backend</span>
                    </div>
                    <div class="grid g3" style="gap:8px">
                      <div class="f" style="margin:0;grid-column:span 2">
                        <label style="color:#bae6fd">Estilo Visual do Canal (STYLE_DNA):</label>
                        <input id="e-s6-style" value="${esc(estiloVisualPadraoStep6)}" placeholder="Informe o Estilo Visual (STYLE_DNA) deste canal…">
                      </div>
                      <div class="f" style="margin:0">
                        <label style="color:#bae6fd">Época / País / Formato:</label>
                        <input id="e-s6-epoca" value="${esc(epocaPadraoStep6)}">
                      </div>
                    </div>
                  </div>

                  <!-- PAINEL RECOLHÍVEL DE PERSONAGENS/REFERÊNCIAS E GUIA DE TAGS -->
                  <details style="margin-bottom:4px;padding:8px 10px;border-radius:8px;border:1px solid rgba(168,85,247,.35);background:rgba(168,85,247,.06)">
                    <summary class="small" style="cursor:pointer;color:#e9d5ff;font-weight:700">🧩 Imagens de Referência do Vídeo (<code id="e-s6-tag-preview">${(ehCanal100Img || skillMarcada === 'skill5_img' || skillMarcada === 'skill2_mestre_img') ? '[flow][i][16:9]' : (ehCanalFlowIv ? '[flow][iv][16:9]' : '[flow][v][16:9]')}</code>) — Clique para personalizar</summary>
                    <div style="margin-top:8px">
                      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
                        <span class="pill ok" id="e-s6-pack-badge" style="border-color:#38bdf8;color:#bae6fd">✨ Modo 100% Novas Referências Ativo</span>
                        <button type="button" class="sm" id="e-s6-refresh-pack">🔄 Atualizar Pacotes</button>
                      </div>
                      <div class="grid g3" style="gap:8px;margin-bottom:8px;align-items:stretch">
                        <label class="small" style="margin:0;padding:8px 10px;border:1px solid #38bdf8;background:rgba(2,132,199,.18);border-radius:8px;color:#f8fafc;cursor:pointer;display:flex;align-items:center;gap:6px">
                          <input type="checkbox" id="e-s6-gen-refs" checked>
                          <span>✨ <b>Gerar Imagens de Referência NOVAS</b> (<code>[01]..[N]</code>)</span>
                        </label>
                        <label class="small" style="margin:0;padding:8px 10px;border:1px solid rgba(168,85,247,.4);border-radius:8px;color:#e2e8f0;cursor:pointer;display:flex;align-items:center;gap:6px">
                          <input type="checkbox" id="e-s6-reutilizar-existentes">
                          <span>🔄 Reutilizar imagens existentes do pacote</span>
                        </label>
                        <label class="small" style="margin:0;padding:8px 10px;border:1px solid rgba(168,85,247,.4);border-radius:8px;color:#e2e8f0;cursor:pointer;display:flex;align-items:center;gap:6px">
                          <input type="checkbox" id="e-s6-save-pack">
                          <span>💾 Salvar novas referências no Pacote do Canal</span>
                        </label>
                      </div>
                      <div id="e-s6-pack-select-row" style="display:none;margin-bottom:8px">
                        <div class="f" style="margin:0"><label>Pacote de Referências Existentes</label>
                          <select id="e-s6-pack-id">
                            <option value="">✨ Detectar Automaticamente (${esc(chObj.nome || 'Canal')})</option>
                          </select>
                        </div>
                      </div>
                      <div id="e-s6-pack-thumbs" style="display:flex;gap:8px;overflow-x:auto;padding:4px 2px;margin-bottom:8px"></div>
                      <div class="grid g4" style="gap:8px;margin-bottom:8px">
                        <div class="f" style="margin:0"><label>Onde Gerar</label>
                          <select id="e-tag-onde">
                            <option value="flow" selected>[flow] Google Flow</option>
                            <option value="gpt">[gpt] GPT Image 2.5</option>
                            <option value="grok">[grok] Grok</option>
                            <option value="vids">[vids] Google Vids</option>
                          </select>
                        </div>
                        <div class="f" style="margin:0"><label>Tipo</label>
                          <select id="e-tag-tipo">
                            <option value="v" ${(ehCanal100Img || ehCanalFlowIv || skillMarcada === 'skill5_img' || skillMarcada === 'skill2_mestre_img') ? '' : 'selected'}>[v] Vídeo</option>
                            <option value="i" ${(ehCanal100Img || skillMarcada === 'skill5_img' || skillMarcada === 'skill2_mestre_img') ? 'selected' : ''}>[i] Imagem</option>
                            <option value="iv" ${(!ehCanal100Img && ehCanalFlowIv) ? 'selected' : ''}>[iv] Imagem + Vídeo</option>
                          </select>
                        </div>
                        <div class="f" style="margin:0"><label>Formato</label>
                          <select id="e-tag-fmt">
                            <option value="16:9" selected>[16:9] Horizontal</option>
                            <option value="9:16">[9:16] Vertical</option>
                            <option value="1:1">[1:1] Quadrado</option>
                          </select>
                        </div>
                        <div class="f" style="margin:0"><label>Modelo</label>
                          <select id="e-tag-modelo">
                            <option value="" selected>Padrão DarkPlanner</option>
                            <option value="nano_2">[nano_2] Nano Banana 2.1</option>
                            <option value="nano_pro">[nano_pro] Nano Banana Pro</option>
                            <option value="lite">[lite] Veo 3.1 Lite</option>
                            <option value="fast">[fast] Veo 3.1 Fast</option>
                            <option value="quality">[quality] Veo 3.1 Quality</option>
                          </select>
                        </div>
                      </div>
                      <div class="grid g2" style="gap:8px">
                        <div class="f" style="margin:0"><label>Modo de Geração</label>
                          <select id="e-s6-mode">
                            <option value="DIRETO" ${(ehCanal100Img || ehCanalFlowIv || skillMarcada === 'skill5_img') ? '' : 'selected'}>DIRETO — 1 prompt vídeo/cena</option>
                            <option value="STILL_IMAGE" ${(ehCanal100Img || skillMarcada === 'skill5_img') ? 'selected' : ''}>STILL_IMAGE — 1 imagem estática/cena ([flow][i][16:9])</option>
                            <option value="IV" ${(!ehCanal100Img && ehCanalFlowIv) ? 'selected' : ''}>IV — Imagem + Animação ([flow][iv][16:9])</option>
                          </select>
                        </div>
                        <div class="small mut" style="display:flex;align-items:center;padding-top:14px">
                          ✅ Tags (<code>[personagem:01]</code> e <code>${(ehCanal100Img || skillMarcada === 'skill5_img') ? '[flow][i][16:9]' : (ehCanalFlowIv ? '[flow][iv][16:9]' : '[flow][v][16:9]')}</code>) prontas para o DarkPlanner Desktop! (Sincronia 1:1 com blocos SRT)
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <!-- Opções e Prompt de Edição no Studio (Visível para Vídeo Real e Vídeos de Prompt) -->
                <div id="e-vidreal-opts" style="margin-top:8px">
                  <!-- PAINEL DOS 12 BANCOS DE DADOS REAIS + TEU ACERVO (ANEXAR VÍDEOS/FOTOS) -->
                  <details id="e-12bancos-details" ${ehModoVideoReal ? 'open' : ''} class="card" style="margin:0 0 8px 0;padding:10px 12px;border:1px solid #10b981;background:rgba(16,185,129,.09)">
                    <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap;list-style:none">
                      <b class="sp" style="color:#6ee7b7;font-size:13px">🌍 12 Bancos de Dados de Imagens & Vídeos Reais Analisados + Teu Acervo</b>
                      <span class="pill ok" style="font-size:10.5px">✅ 12/12 Bancos Ativos</span>
                      <span class="pill ok" id="e-acervo-count-badge" style="font-size:10.5px">📁 Teu Acervo Pronto</span>
                      <span class="pill" style="font-size:10.5px">🔽 Abrir / Fechar</span>
                    </summary>
                    <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)">
                      <div class="small mut" style="margin-bottom:8px">O motor de <b>Vídeos e Imagens Reais</b> analisa simultaneamente os <b>12 bancos oficiais</b> abaixo para cada bloco do SRT (priorizando primeiro o <b>Teu Acervo</b> anexado e vídeos <code>.MP4</code> sem repetição):</div>
                      <div class="grid g4" style="gap:6px;margin-bottom:10px" id="e-12bancos-grid">
                        ${[
                          ['📁', 'Teu Acervo (você pode anexar)', 'Prioridade #1 (Local)'],
                          ['🎥', 'Pexels', 'API Vídeo HD + Foto'],
                          ['🎬', 'Pixabay', 'API Vídeo MP4 + Foto'],
                          ['▶️', 'YouTube', 'Creative Commons & News'],
                          ['🛰️', 'NASA', 'API Oficial Images/Videos'],
                          ['🌎', 'Google Earth', 'Satélite / Mapas / 3D'],
                          ['🖼️', 'Freepik', 'Stock Vídeo & Fotos'],
                          ['🎞️', 'Coverr', 'B-Roll Cinematográfico'],
                          ['📷', 'Unsplash', 'Fotografia Documental HD'],
                          ['🔓', 'Openverse', 'Domínio Público & CC'],
                          ['🔍', 'Google', 'Imagens & Contexto Real'],
                          ['🏛️', 'Wikipédia', 'API Wikipédia & Commons'],
                        ].map(([ic, nm, sub], idxB) => `<div style="padding:6px 8px;border-radius:7px;background:#0c1016;border:1px solid rgba(16,185,129,.35)">
                          <div class="row" style="gap:5px">
                            <span>${ic}</span>
                            <b class="small sp" style="color:#e6edf3;font-size:11.5px">${idxB + 1}. ${esc(nm)}</b>
                            <span class="pill ok" style="font-size:9.5px;padding:1px 5px">ON</span>
                          </div>
                          <div class="small mut" style="font-size:10.5px;margin-top:2px">${esc(sub)}</div>
                        </div>`).join('')}
                      </div>

                      <!-- UPLOAD / ANEXO PARA "TEU ACERVO" -->
                      <div style="padding:9px 11px;border-radius:8px;background:#0c1016;border:1px solid rgba(56,189,248,.35)">
                        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
                          <b class="small sp" style="color:#7dd3fc">📁 1. Teu Acervo — Anexar Vídeos (<code>.mp4</code>, <code>.mov</code>, <code>.webm</code>) ou Fotos (<code>.jpg</code>, <code>.png</code>, <code>.webp</code>)</b>
                          <button type="button" class="sm" id="e-acervo-refresh-btn">🔄 Atualizar Acervo</button>
                        </div>
                        <div class="grid g3" style="gap:8px;align-items:end">
                          <div class="f" style="margin:0">
                            <label class="small mut">Selecionar arquivos do computador:</label>
                            <input type="file" id="e-acervo-files" accept="video/*,image/*" multiple style="padding:5px">
                          </div>
                          <div class="f" style="margin:0">
                            <label class="small mut">Palavras-chave / Tema (p/ casar com o SRT):</label>
                            <input id="e-acervo-tags" placeholder="Ex.: tornado, flood, radar, highway, damage…">
                          </div>
                          <div>
                            <button type="button" class="pri sm" id="e-acervo-upload-btn" style="width:100%;padding:8px">📤 Anexar ao Teu Acervo</button>
                          </div>
                        </div>
                        <div id="e-acervo-list-box" class="small mut" style="margin-top:8px">Carregando arquivos do Teu Acervo…</div>
                      </div>
                    </div>
                  </details>

                  <div class="card" style="margin:0 0 8px 0;padding:10px 12px;border:1px solid rgba(52,211,153,.35);background:rgba(6,78,59,.22)">
                    <div class="row" style="margin-bottom:8px;flex-wrap:wrap;gap:6px">
                      <b class="sp" style="color:#a7f3d0">🎬 Prompt de Edição & Configuração da Timeline no DarkPlanner Studio (Sincronia 1:1 Cenas = Blocos SRT)</b>
                      <button type="button" class="sm pri" id="e-aplicar-edicao-agora" style="background:#0d9488;border-color:#2dd4bf">⚡ Aplicar Edição Agora no Studio</button>
                    </div>
                    <div class="grid g4" style="gap:8px;margin-bottom:8px">
                      <div class="f" style="margin:0"><label>Distribuição / Predefinição</label>
                        <select id="e-ed-predef">
                          <option value="sys_tudo" ${(S.estEdPredef || 'sys_tudo') === 'sys_tudo' ? 'selected' : ''}>🏆 Padrão Grandes Canais</option>
                          <option value="pemuip9b05" ${S.estEdPredef === 'pemuip9b05' ? 'selected' : ''}>⚡ Dinâmico / Alta Retenção</option>
                          <option value="pemuh61p9a" ${S.estEdPredef === 'pemuh61p9a' ? 'selected' : ''}>📰 Reportagem Cortes Secos</option>
                          <option value="sys_doc_classico" ${S.estEdPredef === 'sys_doc_classico' ? 'selected' : ''}>🎬 Documentário Clássico</option>
                          <option value="sys_cinema" ${S.estEdPredef === 'sys_cinema' ? 'selected' : ''}>🎞️ Cinema Premium</option>
                        </select>
                      </div>
                      <div class="f" style="margin:0"><label>Destaques</label>
                        <select id="e-ed-destaques">
                          <option value="equilibrado" ${(S.estEdDestaques || 'equilibrado') === 'equilibrado' ? 'selected' : ''}>Equilibrado</option>
                          <option value="dinamico" ${S.estEdDestaques === 'dinamico' ? 'selected' : ''}>Dinâmico</option>
                          <option value="minimal" ${S.estEdDestaques === 'minimal' ? 'selected' : ''}>Minimalista</option>
                          <option value="nenhum" ${S.estEdDestaques === 'nenhum' ? 'selected' : ''}>Sem Destaques</option>
                        </select>
                      </div>
                      <div class="f" style="margin:0"><label>Estilo da Legenda</label>
                        <select id="e-ed-leg-estilo">
                          <option value="">Padrão Documental</option>
                          <option value="serif_doc">Editorial Serif</option>
                          <option value="typewriter_doc">Máquina de Escrever</option>
                          <option value="highlight">Marca-texto</option>
                          <option value="impact">Impacto</option>
                          <option value="kinetic">Cinética</option>
                        </select>
                      </div>
                      <div class="f" style="margin:0"><label>Look Visual</label>
                        <select id="e-ed-look">
                          <option value="original">Original</option>
                          <option value="doc_dark">Documentário Escuro</option>
                          <option value="golden_hour">Hora Dourada</option>
                          <option value="moonlight">Luar Frio</option>
                          <option value="retro_vhs">VHS Retrô</option>
                        </select>
                      </div>
                    </div>
                    <details open style="margin-bottom:8px">
                      <summary class="small" style="cursor:pointer;color:#fde68a;font-weight:700">✍️ Prompt de Edição Oficial deste Vídeo (<code>09_PROMPT_EDICAO_STUDIO.txt</code> — Legenda, SFX e Regras do Canal)</summary>
                      <div style="margin-top:8px">
                        <div class="row" style="gap:16px;flex-wrap:wrap;margin-bottom:6px">
                          <label class="small" style="margin:0;color:#e2e8f0;cursor:pointer">
                            <input type="checkbox" id="e-ed-mostrar-leg" ${S.estEdMostrarLeg !== false ? 'checked' : ''}> Mostrar Legenda na Tela (<code>caption:0</code>)
                          </label>
                          <label class="small" style="margin:0;color:#e2e8f0;cursor:pointer">
                            <input type="checkbox" id="e-ed-usar-sfx" ${S.estEdUsarSfx !== false ? 'checked' : ''}> Ativar Efeitos Sonoros Documentais (SFX)
                          </label>
                        </div>
                        <textarea id="e-ed-custom" style="min-height:75px;font-size:12px" placeholder="Regras do Prompt de Edição para o DarkPlanner Studio…">${esc(S.estEdCustom || '')}</textarea>
                      </div>
                    </details>
                    <div class="row" style="gap:8px;flex-wrap:wrap">
                      <button type="button" class="sm" id="e-ver-prompt-v8-real" style="border-color:#34d399;color:#6ee7b7">📜 Ver / Copiar Prompt Mestre & Edição Completo</button>
                    </div>
                  </div>
                  <div id="e-prompt-v8-real-box" style="display:none;margin-bottom:10px"></div>
                </div>
              </div>
            </details>

            <div id="e-step6-out" style="display:none;margin-top:10px"></div>
          </div>
          </details>

          <!-- PASSO 6 RECOLHÍVEL: ENVIAR PROJETO AO CHAT DO APP DARKPLANNER DESKTOP -->
          <details class="kcard" id="e-step7-card" style="border-color:var(--line);background:#0d1218;margin-top:8px;padding:9px 12px">
            <summary class="row" style="cursor:pointer;list-style:none;gap:8px;flex-wrap:wrap">
              <b class="sp" style="color:#d1fae5;font-size:13px" id="e-step7-title">${ehModoVideoReal ? '🚀 Passo 6 — Enviar Projeto ao DarkPlanner Studio' : '🚀 Passo 6 — Enviar Projeto ao Chat do DarkPlanner Desktop'}</b>
              <span class="pill ok" id="e-step7-pill" style="font-size:10px">💬 Apenas pelo Chat</span>
              <span class="pill" style="font-size:10px">🔽 Abrir</span>
            </summary>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line)">
              <div class="small mut" id="e-step7-desc" style="margin:0 0 8px">${ehModoVideoReal
                ? 'Salva tudo em <b>D:\\ARQUIVOS DE VIDEOS</b>, monta o projeto no <b>DarkPlanner Studio</b> e envia exclusivamente pelo Chat para você acompanhar.'
                : 'Salva todos os arquivos em <b>D:\\ARQUIVOS DE VIDEOS</b> e envia exclusivamente pelo <b>Chat do DarkPlanner Desktop</b> (sem duplicar com a API).'
              }</div>
              <div class="row" style="gap:8px;flex-wrap:wrap">
                <button type="button" class="pri" id="e-run-step7">${ehModoVideoReal ? '🚀 6️⃣ Criar e Enviar ao Chat DarkPlanner Studio' : '🚀 6️⃣ Enviar Projeto pelo Chat do DarkPlanner Desktop'}</button>
                <button type="button" class="sm" id="e-open-dp-only">💻 Abrir DarkPlanner</button>
              </div>
              <div id="e-step7-out" style="display:none;margin-top:10px"></div>
            </div>
          </details>
        </div>
      </div>

      <!-- COLUNA DIREITA (AO LADO): PROGRESSO + ETAPAS + LOG RECOLHÍVEL + VÍDEOS CRIADOS RECOLHÍVEL -->
      <div style="position:sticky;top:14px;display:flex;flex-direction:column;gap:10px">
        <div class="card est-topo" id="est-live-panel" style="margin:0;padding:12px;border-color:${S.estConcluido ? '#10b981' : 'var(--line)'}">
          <div id="est-live-fila-bind-bar" style="display:none;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line)"></div>
          <div class="row">
            <div class="est-pct" id="est-live-pct">0%</div>
            <div class="sp">
              <div class="bar grande"><i id="est-live-bar" style="width:0%"></i></div>
              <div class="row small mut" style="margin-top:6px">
                <span id="est-live-estado">Pronto — clique em Executar Passos Marcados</span>
                <span class="sp"></span>
                <span id="est-live-tempo"></span>
              </div>
            </div>
          </div>
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">
            <button type="button" class="sm" id="e-open-proc-dp-side" style="border-color:#22d3ee;color:#67e8f9;font-weight:700" title="Abrir Chat auxiliar para organizar algo ou enviar mais informações">💬 Chat</button>
            <button type="button" class="sm" id="e-dl-proj-side" style="border-color:#38bdf8;color:#7dd3fc;font-weight:700" title="Baixar todos os arquivos gerados deste projeto (.zip) para o seu PC">⬇️ Baixar Projeto (.zip)</button>
            <button type="button" class="sm" id="e-min-proj-side" style="border-color:var(--line);color:#cbd5e1" title="Minimizar ou expandir todo o projeto gerado na tela">${S.estProjetoMinimizado ? '📂 Abrir Processo' : '— Minimizar Projeto'}</button>
          </div>
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
            <button type="button" class="sm pri" id="e-concluir-video-side" style="flex:1">✅ Concluir Vídeo</button>
            <button type="button" class="sm" id="e-publicar-video-side" style="border-color:rgba(16,185,129,.4);color:#6ee7b7" title="Marca o vídeo como Concluído e já Publicado no canal">📢 Publicado</button>
            <button type="button" class="sm" id="e-reset-video-side" title="Limpa os campos para iniciar o próximo vídeo">🆕 Novo</button>
          </div>
          <div id="est-concluido-banner" style="display:${S.estConcluido ? '' : 'none'};margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(16,185,129,.12);border:1px solid #10b981;font-size:12px;color:#d1fae5">
            <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:space-between">
              <span><b>🎉 Vídeo 100% CONCLUÍDO!</b> Sincronizado no <b>DarkPlanner</b>.</span>
              <button type="button" class="sm" id="e-concluido-open-proc" style="padding:2px 8px;font-size:11px;border-color:#22d3ee;color:#67e8f9;font-weight:700">📂 Ver Processo</button>
            </div>
          </div>
        </div>

        <details class="card" id="est-steps-details" ${S.estProjetoMinimizado ? '' : 'open'} style="margin:0;padding:10px 12px">
          <summary class="row" style="cursor:pointer;list-style:none">
            <h3 class="sp" id="est-steps-title" style="margin:0;font-size:13px;color:#f3f4f6">📋 Etapas (Passos 1 a 7)</h3>
            <span class="pill" style="font-size:10px">🔽</span>
          </summary>
          <ol class="est-steps" id="est-live-steps" style="margin-top:8px"></ol>
        </details>

        <details class="card" style="margin:0;padding:10px 12px">
          <summary class="row" style="cursor:pointer;list-style:none">
            <h3 class="sp" id="est-log-title" style="margin:0;font-size:13px;color:#f3f4f6">🖥 Log em Tempo Real</h3>
            <span class="pill" style="font-size:10px">🔽</span>
          </summary>
          <div style="margin-top:8px">
            <div class="row" style="margin-bottom:6px;gap:6px">
              <label class="small sp" style="margin:0;color:var(--txt)"><input type="checkbox" id="est-live-auto" checked> rolar sozinho</label>
              <button type="button" class="sm" id="est-live-clear">Limpar</button>
              <button type="button" class="sm" id="est-live-copy">Copiar</button>
            </div>
            <div class="est-log" id="est-live-log" style="min-height:150px;max-height:220px"></div>
          </div>
        </details>

        <!-- CARD LATERAL RECOLHÍVEL: VÍDEOS CRIADOS (EDITAR / REFAZER) -->
        <details class="card" style="margin:0;padding:10px 12px">
          <summary class="row" style="cursor:pointer;list-style:none;gap:6px">
            <h3 class="sp" style="margin:0;font-size:13px;color:#f3f4f6">🎬 Vídeos Criados</h3>
            <button type="button" class="sm" id="e-side-vc-refresh" style="padding:2px 6px" title="Atualizar lista de vídeos criados">🔄</button>
            <span class="pill" style="font-size:10px">🔽</span>
          </summary>
          <div style="margin-top:8px">
            <div id="e-side-videos-criados" style="max-height:260px;overflow-y:auto" class="small mut">Carregando vídeos…</div>
          </div>
        </details>

        <!-- PAINEL DA API DO APP DESKTOP DO DARKPLANNER RECOLHÍVEL -->
        <details class="card" style="margin:0;padding:10px 12px">
          <summary class="row" style="cursor:pointer;list-style:none">
            <h3 class="sp" style="margin:0;font-size:13px;color:#f3f4f6">🔌 API Desktop DarkPlanner</h3>
            <span class="pill ok" id="dp-api-badge" style="font-size:10px">● ONLINE (7812)</span>
          </summary>
          <div style="margin-top:8px">
            <div class="small mut">URL: <code>http://127.0.0.1:7812</code> · Autenticação Automática Ativa</div>
            <div id="dp-api-resumo" class="small" style="margin-top:6px">Carregando projetos e contas do DarkPlanner Desktop…</div>
            <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">
              <button type="button" class="sm" data-dp-ep="GET:/api/projects">📂 Projetos</button>
              <button type="button" class="sm" data-dp-ep="GET:/api/accounts/summary">👤 Contas</button>
              <button type="button" class="sm" data-dp-ep="GET:/api/voices">🎙 Vozes</button>
              <button type="button" class="sm" data-dp-ep="GET:/api/ingredient-packs">🧩 Pacotes</button>
              <button type="button" class="sm pri" id="dp-api-refresh">🔄 Atualizar</button>
            </div>
            <details style="margin-top:6px">
              <summary class="small mut" style="cursor:pointer;font-size:11px">🔑 Chave API 7812 (Auto-detectada — clique se quiser alterar)</summary>
              <div class="row" style="gap:6px;margin-top:5px">
                <input type="text" id="dp-api-key-inp" placeholder="Ex.: 9JRBMb_dKAiKEFadWyt_..." value="${esc((S.settings && S.settings.dp_desktop_api_key) || '')}" style="flex:1;font-size:11.5px;padding:4px 8px">
                <button type="button" class="sm pri" id="dp-api-key-save">Salvar Chave</button>
              </div>
            </details>
            <div id="dp-api-proj-list" style="margin-top:8px"></div>
          </div>
        </details>
      </div>
    </div>`;

    window.garantirMonitorProcessoDpUI();
    window.renderizarMonitorProcessoDpUI();

    // ---- MOTOR DE LOG E ETAPAS AO VIVO (VINCULADO 1:1 A CADA PROJETO DA FILA) ----
    const criarStepsPadraoEstudio = () => [
      {id: 'p1', nome: 'Estruturar Roteiro (Sem Escrever)', status: 'pendente', msg: 'Calcula o tempo exato pela duração em minutos e estrutura os blocos', pct: 0},
      {id: 'p2', nome: 'Dar OK e Escrever Roteiro Completo Limpo', status: 'pendente', msg: 'Escreve apenas a narração falada no idioma do canal', pct: 0},
      {id: 'p3_viral', nome: 'Gerar Descrição, Tags e Thumbnail + Enviar p/ DarkPlanner', status: 'pendente', msg: 'Gera Thumbnail 16:9 (padrão referências), Descrição SEO e Tags Virais', pct: 0},
      {id: 'p4', nome: 'Gerar Áudio no DarkPlanner (/audio-generator)', status: 'pendente', msg: 'Converte o roteiro limpo em MP3 com a voz oficial do canal', pct: 0},
      {id: 'p5', nome: 'Editar SRT Tempo VEO (Quebra por Frase)', status: 'pendente', msg: 'Sincroniza os blocos de legenda VEO e baixa MP3 + SRT', pct: 0},
      {id: 'p6', nome: 'Criar Prompts/Cenas por SRT (Skill 6 ou Vídeo Real)', status: 'pendente', msg: '1 bloco SRT = 1 linha CSV = 1 prompt Flow / busca real', pct: 0},
      {id: 'p7', nome: 'Criar Projeto no DarkPlanner (Studio / Creator) + Enviar Chat', status: 'pendente', msg: 'Cria no Studio (se Vídeo Real) ou Creator + envia tudo no Chat', pct: 0},
    ];
    window.criarStepsPadraoEstudio = criarStepsPadraoEstudio;

    const garantirStepsELogsDoItemFila = (it) => {
      if (!it) return null;
      if (!Array.isArray(it.live_steps) || it.live_steps.length !== 7 || !it.live_steps.some(s => s.id === 'p3_viral')) {
        const stNovo = criarStepsPadraoEstudio();
        const pctIt = Number(it.progresso_pct || 0);
        if (it.status === 'concluido' || pctIt >= 100) {
          stNovo.forEach(s => { s.status = 'ok'; s.pct = 100; });
        } else {
          if (it.estrutura_txt || pctIt >= 22) { stNovo[0].status = 'ok'; stNovo[0].pct = 100; }
          if (it.roteiro || pctIt >= 40) { stNovo[0].status = 'ok'; stNovo[1].status = 'ok'; stNovo[1].pct = 100; }
          if (it.pacote_viral || pctIt >= 55) { stNovo[2].status = 'ok'; stNovo[2].pct = 100; }
          if (it.job_id || pctIt >= 70) { stNovo[3].status = 'ok'; stNovo[3].pct = 100; }
          if (it.srt_texto || pctIt >= 78) { stNovo[4].status = 'ok'; stNovo[4].pct = 100; }
          if (it.pacote_skill6 || it.midias_reais || pctIt >= 86) { stNovo[5].status = 'ok'; stNovo[5].pct = 100; }
          const idxPend = stNovo.findIndex(s => s.status !== 'ok');
          if (idxPend >= 0) {
            if (it.status === 'rodando') {
              stNovo[idxPend].status = 'rodando';
              stNovo[idxPend].pct = Math.max(15, Math.min(95, pctIt));
              stNovo[idxPend].msg = it.etapa_atual || stNovo[idxPend].msg;
            } else if (it.status === 'erro') {
              stNovo[idxPend].status = 'erro';
              stNovo[idxPend].msg = it.erro_msg || it.etapa_atual || 'Pausado / Erro nesta etapa';
            }
          }
        }
        it.live_steps = stNovo;
      }
      if (!Array.isArray(it.live_logs)) {
        const hCr = new Date(it.criado_em || Date.now()).toLocaleTimeString('pt-BR', {hour12: false});
        it.live_logs = [{t: `[${hCr}] 📥 [Fila #${it.numero}] Projeto "${it.titulo}" vinculado individualmente.`, nivel: 'info'}];
        if (it.etapa_atual) {
          it.live_logs.push({t: `[${hCr}] ${it.etapa_atual}`, nivel: it.status === 'erro' ? 'erro' : 'ok'});
        }
      }
      return it;
    };
    window.garantirStepsELogsDoItemFila = garantirStepsELogsDoItemFila;

    const obterNumeroEtapaItemFila = (it) => {
      if (!it) return 1;
      garantirStepsELogsDoItemFila(it);
      if (it.status === 'concluido') return 7;
      const idxRod = it.live_steps.findIndex(s => s.status === 'rodando');
      if (idxRod >= 0) return idxRod + 1;
      const idxErr = it.live_steps.findIndex(s => s.status === 'erro');
      if (idxErr >= 0) return idxErr + 1;
      const qtdOk = it.live_steps.filter(s => s.status === 'ok').length;
      return Math.min(7, Math.max(1, qtdOk + 1));
    };
    window.obterNumeroEtapaItemFila = obterNumeroEtapaItemFila;

    const obterItemFilaVinculadoPainel = () => {
      const fila = Array.isArray(S.filaProducao) ? S.filaProducao : [];
      if (!fila.length) return null;
      if (S.filaVinculadaId === '__tela__') return null;
      if (!S.filaVinculadaId) {
        try {
          const salvoVinc = localStorage.getItem('fd_fila_vinculada_v1') || '';
          if (salvoVinc && (salvoVinc === '__tela__' || fila.some(x => x.id_fila === salvoVinc))) {
            S.filaVinculadaId = salvoVinc;
          }
        } catch (_eV) {}
      }
      if (S.filaVinculadaId === '__tela__') return null;
      let alvo = fila.find(x => x.id_fila === S.filaVinculadaId);
      if (!alvo) {
        // Vincula automaticamente ao primeiro projeto ativo/na fila (1 projeto por vez, nunca misturado!)
        alvo = fila.find(x => x.status === 'rodando') || fila[0] || null;
        if (alvo) {
          S.filaVinculadaId = alvo.id_fila;
          try { localStorage.setItem('fd_fila_vinculada_v1', alvo.id_fila); } catch (_eS) {}
        }
      }
      return alvo ? garantirStepsELogsDoItemFila(alvo) : null;
    };
    window.obterItemFilaVinculadoPainel = obterItemFilaVinculadoPainel;

    if (!S.estLiveSteps || !S.estLiveSteps.some(s => s.id === 'p3_viral')) {
      S.estLiveSteps = criarStepsPadraoEstudio();
    }
    if (!S.estLiveLogs) {
      const h0 = new Date().toLocaleTimeString('pt-BR', {hour12: false});
      S.estLiveLogs = [
        {t: `[${h0}] ▶ Estúdio 1 clique V8 + DarkPlanner Desktop inicializado`, nivel: 'info'},
        {t: `[${h0}] — API Desktop configurada em http://127.0.0.1:7812 (Autenticação Automática Ativa)`, nivel: 'ok'},
      ];
    }
    let liveStartMs = S.estLiveStartMs || 0;
    let liveStepStartMs = 0;
    let liveRunning = false;

    const renderLiveLog = () => {
      const stepsEl = $('#est-live-steps');
      const logEl = $('#est-live-log');
      const pctEl = $('#est-live-pct');
      const barEl = $('#est-live-bar');
      const estEl = $('#est-live-estado');
      const bindBarEl = $('#est-live-fila-bind-bar');
      const stepsTitEl = $('#est-steps-title');
      const logTitEl = $('#est-log-title');
      const panelEl = $('#est-live-panel');
      if (!stepsEl || !logEl) return;

      const fila = Array.isArray(S.filaProducao) ? S.filaProducao : [];
      const itVinc = obterItemFilaVinculadoPainel();

      if (bindBarEl) {
        if (fila.length > 0) {
          bindBarEl.style.display = '';
          bindBarEl.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:11px;font-weight:700;color:#67e8f9">📌 Acompanhamento 1:1 da Fila (clique p/ ver a etapa de cada projeto):</span>
              ${itVinc ? `<span class="pill ok" style="font-size:10px">Vinculado: #${itVinc.numero} · Etapa ${obterNumeroEtapaItemFila(itVinc)}/7</span>` : `<span class="pill" style="font-size:10px">Tela Livre</span>`}
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap">
              ${fila.map(f => {
                const ehSel = Boolean(itVinc && itVinc.id_fila === f.id_fila);
                const numEt = obterNumeroEtapaItemFila(f);
                const ic = f.status === 'concluido' ? '✅' : (f.status === 'rodando' ? '⚙️' : (f.status === 'erro' ? '⚠️' : '⏳'));
                const rotEt = f.status === 'concluido' ? '100%' : `Etapa ${numEt}`;
                return `<button type="button" class="sm" data-live-bind-fila="${esc(f.id_fila)}" style="padding:3px 8px;font-size:10.5px;border-color:${ehSel ? '#22d3ee' : 'var(--line)'};background:${ehSel ? 'rgba(34,211,238,.16)' : '#0d1218'};color:${ehSel ? '#ecfeff' : '#cbd5e1'};font-weight:${ehSel ? '700' : '500'}" title="${esc(f.titulo || '')} — Clique para ver exclusivamente a etapa deste projeto">${ic} #${f.numero} ${(f.titulo || 'Vídeo').slice(0, 16)} (${rotEt})</button>`;
              }).join('')}
              <button type="button" class="sm" data-live-bind-fila="__tela__" style="padding:3px 7px;font-size:10.5px;border-color:${S.filaVinculadaId === '__tela__' ? '#a855f7' : 'var(--line)'};background:${S.filaVinculadaId === '__tela__' ? 'rgba(168,85,247,.16)' : '#0d1218'};color:${S.filaVinculadaId === '__tela__' ? '#f3e8ff' : '#94a3b8'}" title="Ver passos avulsos da tela de digitação">📝 Tela Livre</button>
            </div>`;
          $$('[data-live-bind-fila]', bindBarEl).forEach(btn => {
            btn.onclick = () => {
              if (typeof window.vincularProjetoFilaNoPainel === 'function') {
                window.vincularProjetoFilaNoPainel(btn.dataset.liveBindFila, true);
              } else {
                S.filaVinculadaId = btn.dataset.liveBindFila;
                renderLiveLog();
              }
            };
          });
        } else {
          bindBarEl.style.display = 'none';
          bindBarEl.innerHTML = '';
        }
      }

      const stepsAtivos = itVinc ? itVinc.live_steps : S.estLiveSteps;
      const logsAtivos = itVinc ? itVinc.live_logs : S.estLiveLogs;

      if (stepsTitEl) {
        stepsTitEl.textContent = itVinc
          ? `📋 Etapas (#${itVinc.numero} · ${(itVinc.titulo || '').slice(0, 28)})`
          : '📋 Etapas (Passos 1 a 7)';
      }
      if (logTitEl) {
        logTitEl.textContent = itVinc
          ? `🖥 Log em Tempo Real (#${itVinc.numero})`
          : '🖥 Log em Tempo Real';
      }

      const feitos = stepsAtivos.filter(s => s.status === 'ok').length;
      const rodando = stepsAtivos.find(s => s.status === 'rodando');
      const erroSt = stepsAtivos.find(s => s.status === 'erro');
      let pctTotal = Math.min(100, Math.round(((feitos + (rodando ? (rodando.pct || 50) / 100 : 0)) / stepsAtivos.length) * 100));
      if (itVinc && itVinc.status === 'concluido') pctTotal = 100;
      else if (itVinc && typeof itVinc.progresso_pct === 'number' && itVinc.progresso_pct > pctTotal && itVinc.status === 'rodando') {
        pctTotal = Math.min(99, Math.round(itVinc.progresso_pct));
      }

      if (panelEl) {
        panelEl.style.borderColor = (itVinc ? itVinc.status === 'concluido' : S.estConcluido)
          ? '#10b981'
          : (rodando ? '#22d3ee' : (erroSt ? '#ef4444' : 'var(--line)'));
      }
      if (pctEl) pctEl.textContent = `${pctTotal}%`;
      if (barEl) {
        barEl.style.width = `${pctTotal}%`;
        barEl.className = erroSt && !rodando ? 'bad' : '';
      }
      if (estEl) {
        const prefFila = itVinc ? `[Fila #${itVinc.numero} · Etapa ${obterNumeroEtapaItemFila(itVinc)}/7] ` : '';
        if (rodando) estEl.textContent = `${prefFila}${rodando.nome}${rodando.msg ? ' — ' + rodando.msg : ''}`;
        else if (erroSt) estEl.textContent = `${prefFila}Parou em ${erroSt.nome}: ${erroSt.msg || 'erro'}`;
        else if (feitos === stepsAtivos.length || (itVinc && itVinc.status === 'concluido')) estEl.textContent = `${prefFila}✓ Todos os 7 passos concluídos e enviados ao DarkPlanner Desktop!`;
        else if (itVinc && itVinc.status === 'na_fila') estEl.textContent = `${prefFila}⏳ Aguardando vez na Fila (${itVinc.duracao_min || 20} min) — vinculado e pronto!`;
        else if (feitos > 0) estEl.textContent = `${prefFila}✓ ${feitos} de ${stepsAtivos.length} etapas concluídas — pronto para o próximo passo`;
        else estEl.textContent = 'Pronto — clique em Executar Passos Marcados';
      }
      stepsEl.innerHTML = stepsAtivos.map((e, i) => `<li class="st-${e.status}">
        <span class="ic">${e.status === 'rodando' ? '<span class="spin"></span>' : (ICONE[e.status] || '○')}</span>
        <div class="sp">
          <div class="row"><b class="sp">${i + 1}. ${esc(e.nome)}</b>${e.status === 'rodando' ? `<span class="small mut">${e.pct || 0}%</span>` : (e.status === 'ok' ? `<span class="small" style="color:#10b981">✓ concluída</span>` : '')}</div>
          ${e.msg ? `<div class="small mut">${esc(e.msg)}</div>` : ''}
          ${e.status === 'rodando' ? `<div class="bar"><i style="width:${e.pct || 0}%"></i></div>` : ''}
        </div>
      </li>`).join('');
      logEl.innerHTML = logsAtivos.map(l => `<div class="lg-${l.nivel || 'info'}">${esc(l.t)}</div>`).join('');
      if ($('#est-live-auto')?.checked) logEl.scrollTop = 1e9;
    };
    window.renderLiveLogEstudio = renderLiveLog;

    const addLog = (msg, nivel = 'info', idFilaAlvo = '') => {
      const h = new Date().toLocaleTimeString('pt-BR', {hour12: false});
      const entry = {t: `[${h}] ${msg}`, nivel};
      if (idFilaAlvo) {
        const itF = (S.filaProducao || []).find(x => x.id_fila === idFilaAlvo);
        if (itF) {
          garantirStepsELogsDoItemFila(itF);
          itF.live_logs.push(entry);
          if (itF.live_logs.length > 120) itF.live_logs = itF.live_logs.slice(-120);
        }
      } else {
        S.estLiveLogs.push(entry);
        if (S.estLiveLogs.length > 150) S.estLiveLogs = S.estLiveLogs.slice(-150);
      }
      renderLiveLog();
    };

    const atualizarVisibilidadeEtapas = () => {
      const mostrarTudo = Boolean(S.estMostrarTudo);
      const w45 = $('#e-step45-wrap');
      const w6 = $('#e-step6-card');
      const w7 = $('#e-step7-card');
      if (w45) w45.style.display = S.estProjetoMinimizado ? 'none' : '';
      if (w6) w6.style.display = S.estProjetoMinimizado ? 'none' : '';
      if (w7) w7.style.display = S.estProjetoMinimizado ? 'none' : '';
      const btnToggle = $('#e-toggle-all-steps');
      if (btnToggle) {
        btnToggle.textContent = mostrarTudo ? '🔽 Fechar Abas Avançadas' : '👁️ Abrir Abas Avançadas';
      }
      const btnMinSide = $('#e-min-proj-side');
      if (btnMinSide) {
        btnMinSide.textContent = S.estProjetoMinimizado ? '📂 Abrir Processo' : '— Minimizar Projeto';
        btnMinSide.style.borderColor = S.estProjetoMinimizado ? '#22d3ee' : 'var(--line)';
        btnMinSide.style.color = S.estProjetoMinimizado ? '#67e8f9' : '#cbd5e1';
      }
      const minProjBar = $('#e-est-proj-min-bar');
      if (minProjBar) {
        minProjBar.style.display = S.estProjetoMinimizado ? 'flex' : 'none';
        const titAtual = ($('#e-tit')?.value || S.estTitulo || 'Projeto Atual').trim();
        const minProjTxt = $('#e-est-proj-min-txt');
        if (minProjTxt) minProjTxt.textContent = `🎬 Projeto Minimizado: "${titAtual}"`;
      }
    };
    window.atualizarVisibilidadeEtapas = atualizarVisibilidadeEtapas;

    window.alternarMinimizarProjetoEstudio = (forcarValor = undefined) => {
      S.estProjetoMinimizado = forcarValor !== undefined ? Boolean(forcarValor) : !S.estProjetoMinimizado;
      ['e-v8-viral-box', 'e-v8-out'].forEach(id => {
        const el = $('#' + id);
        if (!el) return;
        if (S.estProjetoMinimizado) {
          if (el.style.display !== 'none') el.dataset.wasVisible = '1';
          el.style.display = 'none';
        } else if (el.dataset.wasVisible === '1') {
          el.style.display = '';
        }
      });
      ['e-step45-wrap', 'e-step6-card', 'e-step7-card', 'est-steps-details'].forEach(id => {
        const el = $('#' + id);
        if (el) el.open = !S.estProjetoMinimizado;
      });
      if (S.estProjetoMinimizado && (S.filaProducao || []).length) {
        S.filaMinimizada = true;
        if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
      } else if (!S.estProjetoMinimizado && S.filaMinimizada) {
        S.filaMinimizada = false;
        if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
      }
      atualizarVisibilidadeEtapas();
      if (S.estProjetoMinimizado) {
        toast('🔽 Projeto minimizado! Clique em "📂 Abrir Processo" quando quiser expandir.');
      }
    };

    if ($('#e-open-proc-dp-top')) $('#e-open-proc-dp-top').onclick = () => window.abrirMonitorProcessoDp();
    if ($('#e-open-proc-dp-side')) $('#e-open-proc-dp-side').onclick = () => {
      const itV = obterItemFilaVinculadoPainel();
      window.abrirMonitorProcessoDp(itV ? itV.id_fila : '');
    };
    if ($('#e-dl-proj-side')) $('#e-dl-proj-side').onclick = () => {
      const itV = obterItemFilaVinculadoPainel();
      if (itV) {
        window.baixarProjetoAtualZip({
          pasta: itV.pasta_arquivos_video || '',
          titulo: itV.titulo || '',
          vid: itV.video_id || '',
          job_id: itV.job_id || '',
          skill6_slug: (itV.pacote_skill6 || {}).slug || '',
          roteiro: itV.roteiro || '',
          srt_texto: itV.srt_texto || '',
        });
      } else {
        window.baixarProjetoAtualZip();
      }
    };
    if ($('#e-concluido-open-proc')) $('#e-concluido-open-proc').onclick = () => window.abrirMonitorProcessoDp();
    if ($('#e-min-proj-side')) $('#e-min-proj-side').onclick = () => window.alternarMinimizarProjetoEstudio();
    if ($('#e-est-proj-min-open')) $('#e-est-proj-min-open').onclick = () => window.alternarMinimizarProjetoEstudio(false);
    if ($('#e-est-proj-min-mon')) $('#e-est-proj-min-mon').onclick = () => window.abrirMonitorProcessoDp();
    if ($('#e-est-proj-min-dl')) $('#e-est-proj-min-dl').onclick = () => window.baixarProjetoAtualZip();

    ['e-step45-wrap', 'e-step6-card', 'e-step7-card'].forEach(id => {
      const el = $('#' + id);
      if (el) {
        el.addEventListener('toggle', () => {
          if (id === 'e-step45-wrap') S.estStep45Aberto = el.open;
          if (id === 'e-step6-card') S.estStep6Aberto = el.open;
          if (id === 'e-step7-card') S.estStep7Aberto = el.open;
        });
      }
    });

    const setStep = (id, status, msg, pct = 50) => {
      const st = S.estLiveSteps.find(x => x.id === id);
      if (st) {
        st.status = status;
        if (msg !== undefined) st.msg = msg;
        st.pct = status === 'ok' ? 100 : (status === 'pendente' ? 0 : pct);
      }
      if (status === 'rodando' && !String(msg || '').startsWith('[Fila #')) {
        // Se o usuário disparou execução manual avulsa fora da Fila, foca na tela avulsa
        if (!(S.filaProducao || []).some(x => x.status === 'rodando')) {
          S.filaVinculadaId = '__tela__';
        }
        if (!liveStartMs) { liveStartMs = Date.now(); S.estLiveStartMs = liveStartMs; }
        liveStepStartMs = Date.now();
        liveRunning = true;
      } else if (!S.estLiveSteps.some(x => x.status === 'rodando')) {
        liveRunning = false;
      }
      renderLiveLog();
      atualizarVisibilidadeEtapas();

      // Espelha passos diretos do Estúdio no Monitor Estilo Chat DarkPlanner (evita duplicar quando vier da Fila)
      if (status !== 'pendente' && !String(msg || '').startsWith('[Fila #')) {
        const titEst = ($('#e-tit')?.value || S.estTitulo || '').trim();
        if (titEst) {
          const feitosNow = S.estLiveSteps.filter(s => s.status === 'ok').length;
          const pctGlobal = Math.min(100, Math.round(((feitosNow + (status === 'rodando' ? (pct || 50) / 100 : 0)) / S.estLiveSteps.length) * 100));
          window.registrarPassoProcessoDp({
            titulo: titEst,
            canal_nome: chObj ? (chObj.nome || '') : '',
            duracao_min: Number($('#e-dur')?.value || S.estDur || 20),
            chat_modelo_opcao: S.estChatDpOpcao || 'flash_high',
            stepKey: id,
            stepStatus: status,
            detalhe: msg || (st ? st.nome : ''),
            progresso_pct: pctGlobal,
            total_cenas: S.estTotalBlocosSrt || 0,
            selecionar: true,
          });
        }
      }
    };
    window.estAddLog = addLog;
    window.estSetStep = setStep;
    atualizarVisibilidadeEtapas();
    if ($('#e-toggle-all-steps')) {
      $('#e-toggle-all-steps').onclick = () => {
        S.estMostrarTudo = !S.estMostrarTudo;
        if (S.estMostrarTudo) S.estProjetoMinimizado = false;
        S.estStep45Aberto = S.estMostrarTudo;
        S.estStep6Aberto = S.estMostrarTudo;
        S.estStep7Aberto = S.estMostrarTudo;
        ['e-step45-wrap', 'e-step6-card', 'e-step7-card'].forEach(id => {
          const el = $('#' + id);
          if (el) el.open = S.estMostrarTudo;
        });
        atualizarVisibilidadeEtapas();
      };
    }

    if (S.estLiveTimer) clearInterval(S.estLiveTimer);
    S.estLiveTimer = setInterval(() => {
      if (S.view !== 'estudio') { clearInterval(S.estLiveTimer); S.estLiveTimer = null; return; }
      const tEl = $('#est-live-tempo');
      if (!tEl) return;
      const itV = obterItemFilaVinculadoPainel();
      if (itV) {
        if (itV.status === 'rodando') {
          const totS = Math.max(0, Math.round((Date.now() - (itV.iniciado_em || Date.now())) / 1000));
          const stpS = Math.max(0, Math.round((Date.now() - (itV.step_iniciado_em || itV.iniciado_em || Date.now())) / 1000));
          tEl.textContent = `gerando há ${fmtT(totS)} · nesta etapa ${fmtT(stpS)}`;
        } else if (itV.status === 'concluido' && itV.finalizado_em && itV.iniciado_em) {
          tEl.textContent = `concluído em ${fmtT(Math.max(1, Math.round((itV.finalizado_em - itV.iniciado_em) / 1000)))}`;
        } else {
          tEl.textContent = '';
        }
        return;
      }
      if (!liveRunning) { tEl.textContent = ''; return; }
      const totS = Math.max(0, Math.round((Date.now() - liveStartMs) / 1000));
      const stpS = Math.max(0, Math.round((Date.now() - liveStepStartMs) / 1000));
      tEl.textContent = `gerando há ${fmtT(totS)} · nesta etapa ${fmtT(stpS)}`;
    }, 1000);

    renderLiveLog();
    if ($('#est-live-clear')) $('#est-live-clear').onclick = () => {
      const itV = obterItemFilaVinculadoPainel();
      if (itV) itV.live_logs = [];
      else S.estLiveLogs = [];
      renderLiveLog();
    };
    if ($('#est-live-copy')) $('#est-live-copy').onclick = () => {
      const itV = obterItemFilaVinculadoPainel();
      const logsRef = itV ? (itV.live_logs || []) : S.estLiveLogs;
      copiar(logsRef.map(l => l.t).join('\n'));
    };

    // ---- PAINEL DA API DESKTOP DARKPLANNER (7812) ----
    const renderizarListaProjetosDp = (projs) => {
      const pList = $('#dp-api-proj-list');
      if (!pList) return;
      if (!Array.isArray(projs) || !projs.length) {
        pList.innerHTML = `<div class="small mut" style="padding:4px 0">Nenhum projeto listado ainda.</div>`;
        return;
      }
      pList.innerHTML = projs.slice(0, 10).map(p => `<div class="row small" style="padding:5px 0;border-bottom:1px solid var(--line)">
        <span class="pill ok">#${esc(String(p.id || p.project_id || 1))}</span>
        <b class="sp" style="margin-left:6px">${esc(p.name || p.nome || 'Projeto')}</b>
        <button type="button" class="sm" data-dp-jobs="${esc(String(p.id || p.project_id || 1))}" data-dp-pname="${esc(p.name || p.nome || '')}">Ver Jobs</button>
      </div>`).join('');
      $$('[data-dp-jobs]', pList).forEach(btn => btn.onclick = async () => {
        try {
          const pid = btn.dataset.dpJobs;
          addLog(`▶ Consultando GET /api/projects/${pid}/jobs (${btn.dataset.dpPname})…`, 'info');
          const r = await api('/api/darkplanner/desktop-api/proxy', {json: {method: 'GET', path: `/api/projects/${pid}/jobs`}});
          const jobs = Array.isArray(r.data) ? r.data : [];
          addLog(`✓ Projeto #${pid} possui ${jobs.length} job(s) na fila do DarkPlanner Desktop.`, 'ok');
          toast(`Projeto #${pid}: ${jobs.length} job(s) encontrados.`);
        } catch (_e) {}
      });
    };

    const carregarStatusApiDesktop = async () => {
      try {
        const st = await api('/api/darkplanner/desktop-api/status');
        const b = $('#dp-api-badge');
        const resEl = $('#dp-api-resumo');
        if (!b || !resEl) return;
        b.textContent = '● ONLINE (7812)';
        b.className = 'pill ok';
        const acc = (st.accounts || [])[0] || {};
        resEl.innerHTML = `<div>👤 Conta Google ativa: <b style="color:#4ade80">${esc(acc.account_id || 'vinculada')}</b> (${acc.can_generate !== false ? 'pronta p/ gerar' : 'em espera'})</div>
          <div style="margin-top:2px">📂 Projetos no Creator/Studio: <b>${(st.projects || []).length}</b> · Vozes: <b>${(st.voices || []).length}</b> · Pacotes: <b>${(st.ingredient_packs || []).length}</b></div>`;
        renderizarListaProjetosDp(st.projects || []);
      } catch (_e) { /* silencioso */ }
    };
    carregarStatusApiDesktop();
    if ($('#dp-api-refresh')) $('#dp-api-refresh').onclick = () => { addLog('▶ Atualizando status da API Desktop http://127.0.0.1:7812…', 'info'); carregarStatusApiDesktop(); };
    if ($('#dp-api-key-save')) {
      $('#dp-api-key-save').onclick = async () => {
        const novaKey = ($('#dp-api-key-inp')?.value || '').trim();
        await api('/api/settings', {method: 'PATCH', json: {dp_desktop_api_key: novaKey}}).catch(() => {});
        if (S.settings) S.settings.dp_desktop_api_key = novaKey;
        toast('🔑 Chave da API Desktop DarkPlanner (7812) salva!');
        carregarStatusApiDesktop();
      };
    }
    $$('[data-dp-ep]').forEach(btn => btn.onclick = async () => {
      try {
        const [method, path] = btn.dataset.dpEp.split(':');
        addLog(`▶ Consultando DarkPlanner Desktop: ${method} ${path}`, 'info');
        const r = await api('/api/darkplanner/desktop-api/proxy', {json: {method, path}});
        const d = r.data;
        const pList = $('#dp-api-proj-list');
        if (path === '/api/projects' && Array.isArray(d)) {
          renderizarListaProjetosDp(d);
          toast(`📂 ${d.length} projeto(s) carregado(s) do DarkPlanner!`);
        } else if (path === '/api/accounts/summary' && Array.isArray(d) && pList) {
          pList.innerHTML = d.map(a => `<div class="row small" style="padding:5px 0;border-bottom:1px solid var(--line)">
            <span class="pill ok">● Ativa</span>
            <b class="sp" style="margin-left:6px">${esc(a.account_id || 'Conta Google')}</b>
            <span class="small mut">${a.can_generate !== false ? 'Pronta p/ gerar' : 'Em espera'}</span>
          </div>`).join('');
          toast(`👤 ${d.length} conta(s) ativa(s) no DarkPlanner!`);
        } else if (path === '/api/voices' && Array.isArray(d) && pList) {
          pList.innerHTML = d.slice(0, 12).map(v => `<div class="row small" style="padding:4px 0;border-bottom:1px solid var(--line)">
            <span class="pill">🎙 Voz</span>
            <b class="sp" style="margin-left:6px">${esc(v.name || v.nome || v.voice_id || 'Voz')}</b>
            <code class="small mut">${esc(String(v.voice_id || v.id || '').slice(0, 14))}</code>
          </div>`).join('');
          toast(`🎙 ${d.length} voz(es) disponível(is) no DarkPlanner!`);
        } else if (path === '/api/ingredient-packs' && Array.isArray(d) && pList) {
          pList.innerHTML = d.slice(0, 12).map(pk => `<div class="row small" style="padding:4px 0;border-bottom:1px solid var(--line)">
            <span class="pill ok">🧩 Pack #${esc(String(pk.id || ''))}</span>
            <b class="sp" style="margin-left:6px">${esc(pk.name || pk.nome || 'Pacote')}</b>
          </div>`).join('') || `<div class="small mut" style="padding:4px 0">Nenhum pacote cadastrado ainda.</div>`;
          toast(`🧩 ${d.length} pacote(s) de ingredientes carregado(s)!`);
        } else {
          const resumoTxt = typeof d === 'string' ? d.slice(0, 260) : JSON.stringify(d).slice(0, 260);
          addLog(`✓ Resposta ${method} ${path}: ${resumoTxt}`, 'ok');
          toast(`✅ ${method} ${path} carregado!`);
        }
      } catch (e) {
        addLog(`ℹ️ Usando sincronização local para ${btn.dataset.dpEp}`, 'info');
      }
    });

    $('#e-cx') && ($('#e-cx').onclick = e => { e.preventDefault(); go('conexoes'); });
    if ($('#e-dp-btn')) $('#e-dp-btn').onclick = () => safe(async () => {
      addLog('▶ Abrindo aplicativo DarkPlanner Desktop (Dark Planner.exe)…', 'info');
      const r = await api('/api/darkplanner/acao', {json: {acao: 'abrir_app'}});
      addLog('✓ ' + r.msg, 'ok');
      toast(r.msg);
      setTimeout(carregarStatusApiDesktop, 2500);
    });
    const limparEstruturaAprovadaCtx = () => {
      const elCtx = $('#e-ctx');
      if (elCtx && elCtx.value && /ESTRUTURA APROVADA\s*:/i.test(elCtx.value)) {
        elCtx.value = elCtx.value.replace(/\n*ESTRUTURA APROVADA\s*:[\s\S]*$/i, '').trim();
      }
    };

    const invalidarAudioESrtAtual = () => {
      S.estSrtTexto = '';
      S.estJobId = '';
      S.estMp3Url = '';
      S.estTotalBlocosSrt = 0;
      S.estUltimoHashRoteiroAudio = '';
      S.estAudio = false;
      if ($('#e-srt-raw')) $('#e-srt-raw').value = '';
      if ($('#e-srt-badge')) $('#e-srt-badge').textContent = 'Aguardando SRT';
      if ($('#e-a-nome')) $('#e-a-nome').textContent = 'escolher arquivo (.mp3, .wav)';
      if ($('#e-s-nome')) $('#e-s-nome').textContent = 'escolher arquivo .srt';
      if ($('#e-arq-a')) $('#e-arq-a').classList.remove('ok');
      if ($('#e-arq-s')) $('#e-arq-s').classList.remove('ok');
      if ($('#e-audio')) { try { $('#e-audio').value = ''; } catch (_e) {} }
      if ($('#e-srt')) { try { $('#e-srt').value = ''; } catch (_e) {} }
      if (typeof window._resetAudioLeitorLocal === 'function') window._resetAudioLeitorLocal();
      setStep('p4', 'pendente', 'Converte o roteiro limpo em MP3 com a voz oficial do canal');
      setStep('p5', 'pendente', 'Sincroniza os blocos de legenda VEO e baixa MP3 + SRT');
    };

    const limparArtefatosVideoAnterior = (preservarTituloEDuracao = true) => {
      S.estVideoId = '';
      S.estConcluido = false;
      S.estRoteiro = '';
      S.estUltimaRespostaV8Limpa = '';
      S.estEstruturaV8 = '';
      S.estPacoteSkill6 = null;
      S.estSkill6Pacote = null;
      S.estPacoteReal = null;
      S.estMidiasReais = null;
      S.estPacoteViral = null;
      S.estV8ChatHist = [];
      invalidarAudioESrtAtual();
      limparEstruturaAprovadaCtx();
      if (!preservarTituloEDuracao) {
        S.estTitulo = '';
        if ($('#e-tit')) $('#e-tit').value = '';
      }
      if ($('#e-rot')) {
        $('#e-rot').value = '';
        $('#e-rot').dispatchEvent(new Event('input'));
      }
      if ($('#e-v8-txt')) $('#e-v8-txt').innerHTML = '';
      if ($('#e-v8-out')) $('#e-v8-out').style.display = 'none';
      if ($('#e-v8-viral-box')) { $('#e-v8-viral-box').style.display = 'none'; $('#e-v8-viral-box').innerHTML = ''; }
      if ($('#e-step6-out')) { $('#e-step6-out').style.display = 'none'; $('#e-step6-out').innerHTML = ''; }
      if ($('#e-step7-out')) { $('#e-step7-out').style.display = 'none'; $('#e-step7-out').innerHTML = ''; }
      if ($('#est-concluido-banner')) $('#est-concluido-banner').style.display = 'none';
      if ($('#e-vid-status-pill')) {
        $('#e-vid-status-pill').className = 'pill';
        $('#e-vid-status-pill').textContent = '⏳ Em Produção';
      }
      // Zera apenas os passos avulsos da tela, NUNCA desconectando o projeto da Fila vinculado à direita!
      S.estLiveSteps = criarStepsPadraoEstudio();
      renderLiveLog();
    };

    const atuCalcV8 = () => {
      const c = calcPorDuracao($('#e-dur')?.value || S.estDur || 20);
      const durMudou = Boolean(S.estUltimaDuracaoV8 && Number(S.estUltimaDuracaoV8) !== Number(c.dur));
      S.estDur = c.dur;
      S.estPalavras = c.palavras;
      S.estBlocos = c.blocos;
      if ($('#e-dur-auto-info')) $('#e-dur-auto-info').textContent = `${c.dur} min = ~${c.palavras.toLocaleString('pt-BR')} palavras (${c.blocos} blocos)`;
      if ($('#e-v8-calc')) $('#e-v8-calc').textContent = `${c.dur} min · ~${c.palavras} palavras · ${c.blocos} blocos (145 PPM)`;
      const chkP1 = $('#e-esteira-checklist [data-step-key="p1_estruturar"]');
      if (chkP1 && chkP1.parentElement) {
        const bLbl = chkP1.parentElement.querySelector('b');
        if (bLbl) bLbl.textContent = `1️⃣ Estruturar Roteiro (${c.blocos} blocos)`;
      }
      if (durMudou) {
        // Se o usuário alterou os minutos (ex: de 20 para 10 min), limpa imediatamente a estrutura anterior de 20 min para nunca interferir!
        limparEstruturaAprovadaCtx();
        if ($('#e-v8-modo')?.value === 'estruturar') {
          S.estUltimaRespostaV8Limpa = '';
        }
      }
    };
    if ($('#e-dur')) {
      $('#e-dur').oninput = atuCalcV8;
      $('#e-dur').onchange = atuCalcV8;
    }
    if ($('#e-tit')) {
      $('#e-tit').oninput = () => {
        const novoTit = ($('#e-tit').value || '').trim();
        S.estTitulo = novoTit;
        // Se o vídeo anterior estava marcado como concluído e o usuário começou a digitar o próximo título, limpa tudo do vídeo anterior automaticamente!
        if (S.estConcluido && novoTit && (!S.estUltimoTituloV8 || novoTit.toLowerCase() !== S.estUltimoTituloV8.toLowerCase())) {
          limparArtefatosVideoAnterior(true);
        }
      };
    }

    if (!Array.isArray(S.estV8ChatHist)) S.estV8ChatHist = [];
    const renderChatV8Hist = () => {
      const hEl = $('#e-v8-chat-hist');
      if (!hEl) return;
      if (!S.estV8ChatHist.length) {
        hEl.style.display = 'none';
        return;
      }
      hEl.style.display = '';
      hEl.innerHTML = S.estV8ChatHist.slice(-8).map(it => `<div style="margin-bottom:4px">
        <b style="color:${it.de === 'eu' ? '#38bdf8' : '#34d399'}">${it.de === 'eu' ? '🧑 Você:' : '🤖 IA V8:'}</b>
        <span style="color:#e2e8f0">${esc(it.txt)}</span>
      </div>`).join('');
      hEl.scrollTop = 1e9;
    };
    renderChatV8Hist();

    const rodarV8 = (modoForcado, pedidoAjuste = '') => safe(async () => {
      const modo = modoForcado || $('#e-v8-modo').value;
      if (modoForcado && $('#e-v8-modo')) $('#e-v8-modo').value = modoForcado;
      const tit = $('#e-tit').value.trim();
      const calc = calcPorDuracao($('#e-dur')?.value || S.estDur || 20);
      const duracao_min = calc.dur;
      const palavras = calc.palavras;
      const blocos = calc.blocos;
      // Trava a duração escolhida pelo usuário para nunca cair sozinha
      S.estDur = duracao_min; S.estPalavras = palavras; S.estBlocos = blocos;
      if ($('#e-dur')) $('#e-dur').value = duracao_min;
      atuCalcV8();

      // Se é um novo vídeo (ou o vídeo anterior foi concluído, ou o título mudou sem ser pedido de ajuste), limpa 100% dos resquícios do vídeo anterior!
      if (!pedidoAjuste && (S.estConcluido || (tit && S.estUltimoTituloV8 && tit.toLowerCase() !== S.estUltimoTituloV8.toLowerCase()))) {
        limparArtefatosVideoAnterior(true);
      }
      if (!pedidoAjuste && modo === 'estruturar') {
        limparEstruturaAprovadaCtx();
        S.estUltimaRespostaV8Limpa = '';
      } else if (!pedidoAjuste && modo === 'roteiro_completo' && S.estUltimaDuracaoV8 && Number(S.estUltimaDuracaoV8) !== Number(duracao_min)) {
        limparEstruturaAprovadaCtx();
      }

      const ctx = $('#e-ctx').value.trim();
      const rotAtual = $('#e-rot') ? $('#e-rot').value.trim() : '';
      if (!tit && !ctx && !rotAtual) throw new Error('Digite um título, tema ou roteiro acima para o Antigravity V8 processar.');

      S.estUltimoTituloV8 = tit;
      S.estUltimaDuracaoV8 = duracao_min;
      S.estTitulo = tit;

      const canal_id = $('#e-canal') ? $('#e-canal').value : '';
      const prompt_mestre_id = $('#e-dp-prompt') ? $('#e-dp-prompt').value : '';
      const video_id = S.estVideoId || '';
      const texto_anterior = pedidoAjuste ? (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || rotAtual || '').trim() : '';
      const roteiroEnvio = (pedidoAjuste || modo === 'titulos_neurais') ? rotAtual : '';
      const stepId = modo === 'roteiro_completo' ? 'p2' : (modo === 'titulos_neurais' ? 'p3' : 'p1');
      const tInicio = Date.now();
      if (pedidoAjuste) {
        S.estV8ChatHist.push({de: 'eu', txt: pedidoAjuste});
        renderChatV8Hist();
        setStep(stepId, 'rodando', `Refazendo no Motor V8 conforme seu pedido (${duracao_min} min · ~${palavras} palavras)…`, 45);
        addLog(`💬 [Conversa IA] Refazendo ${modo.toUpperCase()} com seu pedido: "${pedidoAjuste.slice(0, 80)}" (${duracao_min} min → ${palavras} palavras)`, 'info');
      } else {
        setStep(stepId, 'rodando', `Processando no Motor V8 (${duracao_min} min · ~${palavras} palavras · ${blocos} blocos)…`, 35);
        addLog(`▶ Iniciando ${modo.toUpperCase()} — Título/Tema: "${tit || ctx.slice(0, 50)}" (${duracao_min} min → ${palavras} palavras, ${blocos} blocos)`, 'info');
      }
      const btn = $('#e-v8-btn');
      const btnChat = $('#e-v8-chat-send');
      btn.disabled = true; const t0 = btn.textContent; btn.textContent = '⏳ Antigravity V8 processando…';
      if (btnChat) { btnChat.disabled = true; btnChat.textContent = '⏳ IA refazendo conforme seu pedido…'; }
      try {
        const u1 = ($('#e-yt-clone-url')?.value || '').trim();
        const u2 = ($('#e-yt-clone-url-2')?.value || '').trim();
        const u3 = ($('#e-yt-clone-url-3')?.value || '').trim();
        const urlsRef = [u1, u2, u3].filter(Boolean);
        S.estYoutubeCloneUrl1 = u1;
        S.estYoutubeCloneUrl2 = u2;
        S.estYoutubeCloneUrl3 = u3;
        const ytRefUrl = urlsRef.length ? urlsRef.join(' ||| ') : (S.estYoutubeCloneUrl || '').trim();
        if (ytRefUrl) S.estYoutubeCloneUrl = ytRefUrl;
        const r = await api('/api/antigravity/analisar', {
          json: {
            modo,
            titulo: tit || ctx,
            instrucoes: ctx,
            duracao_min,
            palavras,
            blocos,
            canal_id,
            prompt_mestre_id,
            video_id,
            roteiro: roteiroEnvio,
            pedido_ajuste: pedidoAjuste,
            texto_anterior,
            youtube_clone: S.estYoutubeCloneAtivo || null,
            youtube_ref_url: ytRefUrl,
            veo_faixas_config: typeof window.obterPayloadVeoFaixas === 'function' ? window.obterPayloadVeoFaixas() : null,
          }
        });
        const segGasto = Math.max(1, Math.round((Date.now() - tInicio) / 1000));
        if (r.video_id) S.estVideoId = r.video_id;
        if (r.ref_backend && r.ref_backend.ok) {
          S.estYoutubeCloneAtivo = r.ref_backend;
          if (r.ref_backend.style_dna && $('#e-s6-style')) {
            $('#e-s6-style').value = r.ref_backend.style_dna;
            S.estS6Style = r.ref_backend.style_dna;
          }
          if (r.ref_backend.skill_recomendada) {
            S.estSkillModo = r.ref_backend.skill_recomendada;
          }
          if ($('#e-yt-clone-bg-status')) {
            $('#e-yt-clone-bg-status').textContent = `✅ Estilo "${r.ref_backend.nome_estilo || r.ref_backend.titulo_ref || 'Referência'}" vinculado ao canal no backend`;
          }
        }
        // Garante que a duração configurada permaneça exatamente o que o usuário pediu
        if ($('#e-dur')) $('#e-dur').value = duracao_min;
        atuCalcV8();
        if ($('#e-v8-out')) $('#e-v8-out').style.display = '';
        const txtLimpoOrganizado = limparCaracteresEspeciaisV8(r.resposta || '');
        S.estUltimaRespostaV8Limpa = txtLimpoOrganizado;
        const ehModoTitulos = modo === 'titulos_neurais' && Boolean(r.titulos_neurais);
        if ($('#e-v8-txt')) {
          $('#e-v8-txt').style.display = ehModoTitulos ? 'none' : '';
          $('#e-v8-txt').innerHTML = renderizarV8Organizado(r.resposta || '', modo);
        }
        if (!ehModoTitulos && $('#e-v8-neurais-box')) {
          $('#e-v8-neurais-box').style.display = 'none';
        }
        if (pedidoAjuste) {
          S.estV8ChatHist.push({de: 'ia', txt: `${modo === 'roteiro_completo' ? 'Roteiro completo' : 'Estrutura'} refeito(a) com sucesso mantendo ${duracao_min} min (~${palavras} palavras)!`});
          renderChatV8Hist();
          if ($('#e-v8-chat-msg')) $('#e-v8-chat-msg').value = '';
        }
        if (modo === 'roteiro_completo') {
          const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro(r.resposta || '') : txtLimpoOrganizado;
          // Invalida imediatamente qualquer áudio ou SRT anterior pois um NOVO roteiro foi gerado!
          invalidarAudioESrtAtual();
          $('#e-rot').value = limpo;
          S.estRoteiro = limpo;
          $('#e-rot').dispatchEvent(new Event('input'));
          const nPal = limpo.split(/\s+/).filter(Boolean).length;
          S.estStep45Aberto = true;
          setStep('p2', 'ok', `Roteiro completo (${nPal} palavras · ${duracao_min} min) pronto (${segGasto}s)`);
          addLog(`✓ Passo 2 concluído — Novo roteiro limpo com ${nPal} palavras (${duracao_min} min) salvo no DarkPlanner (${segGasto}s)`, 'ok');
          if (r.pacote_viral) {
            renderizarPacoteViralV8(r.pacote_viral);
            setStep('p3_viral', 'ok', `Thumbnail 16:9 + Descrição SEO + ${(r.pacote_viral.tags_lista || []).length} Tags enviadas ao DarkPlanner`);
            addLog(`✓ [Pós-Roteiro] Descrição SEO + ${(r.pacote_viral.tags_lista || []).length} Tags + Thumbnail Viral 1280x720 geradas e enviadas ao DarkPlanner!`, 'ok');
          } else if (!S.estRodandoEsteira && !pedidoAjuste && typeof window.gerarPacoteViralSobDemanda === 'function') {
            toast(`Passo 2 concluído (${nPal} palavras)! Gerando agora Thumbnail + Descrição + Tags…`);
            await window.gerarPacoteViralSobDemanda();
            return;
          }
          toast(pedidoAjuste ? `Roteiro refeito (${nPal} palavras) pronto!` : `Passo 2 concluído! Roteiro completo (${nPal} palavras) gerado!`);
        } else if (modo === 'titulos_neurais' && r.titulos_neurais) {
          const tn = r.titulos_neurais;
          const camp = tn.campeao || tn.campeao_neural || {};
          const listaVar = tn.variacoes || tn.titulos || [];
          const aplicarESincronizarTituloDP = async (novoTit, silencioso = false) => {
            if (!novoTit) return;
            const titAntigo = ($('#e-tit')?.value || S.estTitulo || '').trim();
            if ($('#e-tit')) $('#e-tit').value = novoTit;
            S.estTitulo = novoTit;
            try {
              const rSync = await api('/api/darkplanner/atualizar-titulo', {
                json: {
                  vid: S.estVideoId || r.video_id || '',
                  canal_id: $('#e-canal')?.value || '',
                  novo_titulo: novoTit,
                  titulo_antigo: titAntigo,
                }
              });
              addLog(`✓ Título alterado AUTOMATICAMENTE no DarkPlanner: "${novoTit}"${rSync.dp_web_atualizado ? ' (DarkPlanner Web + Local)' : ''}`, 'ok');
              if (!silencioso) toast(`✅ Título alterado automaticamente no DarkPlanner: ${novoTit}`);
            } catch (eSync) {
              addLog(`✓ Título aplicado: "${novoTit}"`, 'ok');
              if (!silencioso) toast('Título Neural V8 aplicado: ' + novoTit);
            }
          };
          if (camp.titulo) {
            await aplicarESincronizarTituloDP(camp.titulo, true);
          }
          setStep('p3', 'ok', `Campeão Neural aplicado no DarkPlanner: "${camp.titulo || ''}" (${segGasto}s)`);
          addLog(`✓ Passo 3 concluído — Campeão Neural #1: "${camp.titulo || ''}" aplicado AUTOMATICAMENTE no DarkPlanner + ${listaVar.length} variações (${segGasto}s)`, 'ok');
          const box = $('#e-v8-neurais-box');
          if (box) {
            box.style.display = '';
            box.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="sp" style="color:#6ee7b7">🧠 Modo Títulos Neurais V8 — Título Campeão Aplicado no DarkPlanner!</b><span class="pill ok">Sincronizado</span></div>
              ${camp.titulo ? `<div class="card" style="margin-bottom:8px;padding:10px;border:1px solid #10b981;background:rgba(16,185,129,.12)">
                <div class="row"><span class="pill ok">🏆 CAMPEÃO NEURAL #1 · Score ${esc(String(camp.ctr_score || 99))}/100</span><span class="sp"></span>
                  <button type="button" class="sm pri" data-set-tit="${esc(camp.titulo)}">✅ Aplicar Novamente</button>
                </div>
                <div style="font-size:16px;font-weight:700;margin-top:6px;color:#fff">${esc(camp.titulo)}</div>
                ${camp.gatilho ? `<div class="small mut" style="margin-top:4px">Gatilho: <b>${esc(camp.gatilho)}</b> — ${esc(camp.motivo || camp.explicacao || '')}</div>` : ''}
                ${camp.ideia_thumb ? `<div class="small" style="margin-top:4px;color:#d1fae5">🖼 Ideia de Thumb: ${esc(camp.ideia_thumb)}</div>` : ''}
              </div>` : ''}
              <div class="grid g2" style="gap:6px">
                ${listaVar.map((item, idx) => `<div class="card" style="margin:0;padding:8px;border:1px solid var(--line)">
                  <div class="row"><span class="small mut">#${idx + 1} · ${esc(item.gatilho || item.angulo || 'Neural V8')}</span><span class="pill" style="margin-left:auto">${esc(String(item.ctr_score || 95))}% CTR</span></div>
                  <div style="font-weight:600;margin:4px 0">${esc(item.titulo || '')}</div>
                  <div class="row"><span class="small mut sp">${esc(item.traducao || item.por_que_funciona || '')}</span><button type="button" class="sm" data-set-tit="${esc(item.titulo || '')}">✅ Usar</button></div>
                </div>`).join('')}
              </div>`;
            $$('[data-set-tit]', box).forEach(b => b.onclick = () => {
              const novoTit = b.dataset.setTit;
              if (!novoTit) return;
              aplicarESincronizarTituloDP(novoTit, false);
            });
          }
          toast(`✅ Passo 3 concluído! Novo título "${camp.titulo || ''}" alterado automaticamente lá no DarkPlanner!`);
        } else {
          setStep('p1', 'ok', `${blocos} blocos estruturados · ${duracao_min} min (~${palavras} palavras a 145 PPM, ${segGasto}s)`);
          addLog(`✓ Passo 1 concluído — Estrutura de ${blocos} blocos (${duracao_min} min = ~${palavras} palavras) pronta para análise (${segGasto}s)`, 'ok');
          toast(pedidoAjuste ? 'Estrutura refeita conforme seu pedido! Confira abaixo.' : 'Passo 1 concluído! Analise a estrutura organizada abaixo.');
        }
      } catch (e) {
        if (e && e.foiInterrompidoUsuario) {
          setStep(stepId, 'pendente', '⏹️ Interrompido pelo Chat da Fábrica Dark');
          addLog(`⏹️ ${modo} interrompido pelo usuário no Chat da Fábrica Dark.`, 'info');
          throw e;
        }
        setStep(stepId, 'erro', e.message || 'Erro no processamento V8');
        addLog(`✕ Erro em ${modo}: ${e.message || e}`, 'erro');
        throw e;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = t0; }
        if (btnChat) { btnChat.disabled = false; btnChat.textContent = '🔄 Pedir para a IA Refazer'; }
      }
    });

    // Eventos da Caixa de Conversa com a IA (Foto 2)
    $$('[data-v8-chip]').forEach(b => b.onclick = () => {
      const inp = $('#e-v8-chat-msg');
      if (inp) {
        inp.value = b.dataset.v8Chip || '';
        inp.focus();
      }
    });
    if ($('#e-v8-chat-send')) {
      $('#e-v8-chat-send').onclick = () => {
        const msg = ($('#e-v8-chat-msg')?.value || '').trim();
        if (!msg) { toast('Escreva na caixa o que você quer que a IA mude ou refaça.'); return; }
        rodarV8($('#e-v8-modo')?.value || 'estruturar', msg);
      };
    }
    if ($('#e-v8-chat-ref-est')) {
      $('#e-v8-chat-ref-est').onclick = () => {
        const msg = ($('#e-v8-chat-msg')?.value || '').trim() || 'Refaça a estrutura dos blocos com uma abordagem diferente e mais magnética';
        rodarV8('estruturar', msg);
      };
    }
    if ($('#e-v8-chat-ref-rot')) {
      $('#e-v8-chat-ref-rot').onclick = () => {
        const msg = ($('#e-v8-chat-msg')?.value || '').trim() || 'Reescreva o roteiro completo melhorando o ritmo e mantendo a duração exata em minutos';
        rodarV8('roteiro_completo', msg);
      };
    }

    // ---- RENDERIZADOR ENXUTO DA THUMBNAIL CAMPEÃ (MOSTRA APENAS A FOTO GERADA + BAIXA AUTOMATICAMENTE + ENVIA DIRETO AO DARKPLANNER) ----
    const mostrarCarregandoPacoteViralV8 = (msgCustom = '') => {
      if ($('#e-v8-out')) $('#e-v8-out').style.display = '';
      const box = $('#e-v8-viral-box');
      if (!box) return;
      box.style.display = '';
      box.innerHTML = `<div class="row" style="gap:12px;align-items:center;padding:12px;border-radius:8px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.4)">
        <span class="spin" style="width:20px;height:20px;border-width:3px;flex-shrink:0"></span>
        <div class="sp">
          <b style="color:#6ee7b7;font-size:13.5px">${esc(msgCustom || '⏳ Gerando Thumbnail 16:9 + Descrição SEO + Tags Virais…')}</b>
          <div class="small mut" style="margin-top:2px">Gerando pelo ChatGPT com o estilo e Avatar do canal e enviando ao DarkPlanner…</div>
        </div>
      </div>`;
      box.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    };

    // ---- GERENCIAMENTO COMPACTO DO AVATAR PRINCIPAL + ESTILO DA THUMB + PERSONAGEM DE REFERÊNCIA P/ VÍDEO (100% JSON BASE64) ----
    const lerJsonSeguroThumb = async (resp) => {
      const txt = await resp.text();
      try {
        return JSON.parse(txt);
      } catch (_e) {
        throw new Error('Erro ao processar resposta do servidor local: ' + String(txt || '').slice(0, 120));
      }
    };

    const lerArquivoComoBase64 = (file) => new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = String(reader.result || '');
        const nomeBase = (file.name || 'imagem.png').replace(/\.[^.]+$/, '') + '.png';
        // Normaliza e otimiza a imagem via Canvas HTML5 (máx 1024px) para upload instantâneo e zero erro de formato/tamanho
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1024;
            let w = img.naturalWidth || img.width || 512;
            let h = img.naturalHeight || img.height || 512;
            if (w > maxDim || h > maxDim) {
              if (w >= h) {
                h = Math.max(1, Math.round((h * maxDim) / w));
                w = maxDim;
              } else {
                w = Math.max(1, Math.round((w * maxDim) / h));
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const pngDataUrl = canvas.toDataURL('image/png');
            resolve({b64: pngDataUrl || rawDataUrl, nome: nomeBase});
          } catch (_errCv) {
            resolve({b64: rawDataUrl, nome: file.name || 'imagem.png'});
          }
        };
        img.onerror = () => resolve({b64: rawDataUrl, nome: file.name || 'imagem.png'});
        img.src = rawDataUrl;
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem selecionado.'));
      reader.readAsDataURL(file);
    });

    const chamarApiThumbCanal = async (subacao, payload = {}) => {
      const cid = payload.canal_id || $('#e-canal')?.value || S.estCanal || '';
      const resp = await fetch('/api/antigravity/skill1-extrator-estilo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          canal_id: cid,
          nome_estilo: `__THUMB_CANAL__:${subacao}`,
          observacoes: JSON.stringify({
            canal_id: cid,
            usar_sempre: $('#e-chk-avatar-thumb-sempre') ? !!$('#e-chk-avatar-thumb-sempre').checked : true,
            compositar_direto: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : false,
            descricao_avatar: ($('#e-inp-desc-avatar-thumb')?.value || '').trim(),
            estilo_thumb: ($('#e-inp-estilo-thumb-canal')?.value || '').trim(),
            ...payload,
          }),
        }),
      });
      const r = await lerJsonSeguroThumb(resp);
      if (!resp.ok || r.erro) throw new Error(r.erro || 'Erro ao atualizar configuração da Thumbnail/Personagens do canal');
      return r;
    };

    const atualizarUiAvatarThumbCanal = (cfg = {}) => {
      S.estAvatarThumbCanal = cfg || {};
      const urlPrev = (cfg && (cfg.url_preview || cfg.avatar_url || cfg.ref_01_preview_url)) || '';
      const temAvatarAtivo = !!(cfg && (cfg.ativo || cfg.usar_sempre || cfg.sempre_incluir));
      const compLateral = !!(cfg && (cfg.compositar_canto || cfg.compositar_direto));
      const imgEl = $('#e-thumb-avatar-img');
      const stEl = $('#e-thumb-avatar-status');
      const palEl = $('#e-thumb-paleta-box');
      const estImgsEl = $('#e-thumb-estilo-imgs-box');
      const chkSempre = $('#e-chk-avatar-thumb-sempre');
      const chkComp = $('#e-chk-avatar-thumb-comp');
      const inpDesc = $('#e-inp-desc-avatar-thumb');
      const inpEstilo = $('#e-inp-estilo-thumb-canal');
      const btnRef01 = $('#e-btn-ref01-avatar-thumb');
      const btnDel = $('#e-btn-del-avatar-thumb');
      const btnUp = $('#e-btn-upload-avatar-thumb');
      const btnUpEst = $('#e-btn-upload-estilo-thumb');

      // Até 5 Personagens de referência p/ os prompts do vídeo ([01] a [05])
      const persVidImg = $('#e-pers-video-img');
      const persVidListBox = $('#e-pers-video-list-box');
      const btnUpPersVid = $('#e-btn-upload-pers-video');
      const chkPersVid = $('#e-chk-pers-video-ativo');
      const lblPersVid = $('#e-lbl-pers-video-ativo');
      const txtPersVid = $('#e-txt-pers-video-status');
      const btnDelPersVid = $('#e-btn-del-pers-video');
      const listaPersVid = Array.isArray(cfg && cfg.personagens_video) ? cfg.personagens_video : [];
      const persVidUrl = (cfg && cfg.personagem_video_url) || (listaPersVid[0] && listaPersVid[0].url) || '';
      const qtdPersVid = listaPersVid.length || (persVidUrl ? 1 : 0);
      const persVidAtivo = !!(cfg && cfg.personagem_video_ativo && qtdPersVid > 0);

      if (imgEl) {
        if (urlPrev) {
          imgEl.src = urlPrev;
          imgEl.style.display = '';
        } else {
          imgEl.style.display = 'none';
        }
      }
      if (chkSempre) chkSempre.checked = !cfg.sem_texto_na_thumb && (cfg.usar_sempre !== false && cfg.sempre_incluir !== false);
      if (chkComp) chkComp.checked = compLateral;
      if (inpDesc) inpDesc.value = (cfg && cfg.descricao_avatar) || '';
      if (inpEstilo) inpEstilo.value = (cfg && cfg.estilo_thumb) || '';
      if (palEl) {
        const pal = Array.isArray(cfg.paleta_hex) ? cfg.paleta_hex : [];
        palEl.innerHTML = pal.slice(0, 5).map(hx =>
          `<span title="Cor do canal: ${esc(hx)}" style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${esc(hx)};border:1px solid rgba(255,255,255,.4)"></span>`
        ).join('');
      }
      if (estImgsEl) {
        const urlsEst = Array.isArray(cfg.thumbs_estilo_urls) ? cfg.thumbs_estilo_urls : [];
        if (urlsEst.length) {
          estImgsEl.style.display = 'inline-flex';
          estImgsEl.innerHTML = urlsEst.slice(0, 3).map((u, idx) =>
            `<img src="${esc(u)}" alt="Estilo ${idx + 1}" style="height:22px;aspect-ratio:16/9;object-fit:cover;border-radius:4px;border:1px solid #10b981;background:#000">`
          ).join('') + `<button type="button" class="sm" id="e-btn-limpar-estilo-imgs" style="font-size:10px;padding:1px 5px;border-color:rgba(239,68,68,.4);color:#fca5a5" title="Limpar imagens de estilo">✕</button>`;
          if ($('#e-btn-limpar-estilo-imgs')) {
            $('#e-btn-limpar-estilo-imgs').onclick = () => safe(async () => {
              const rL = await chamarApiThumbCanal('SALVAR_CONFIG', {limpar_thumbs_estilo: true});
              atualizarUiAvatarThumbCanal(rL);
              toast('🗑️ Exemplos de imagem de estilo removidos.');
            });
          }
        } else {
          estImgsEl.style.display = 'none';
          estImgsEl.innerHTML = '';
        }
      }
      if (btnRef01) {
        btnRef01.style.display = (cfg && cfg.ref_01_disponivel) ? '' : 'none';
      }
      if (btnDel) {
        btnDel.style.display = (cfg && cfg.avatar_url) ? '' : 'none';
      }
      if (btnUp) {
        btnUp.textContent = (cfg && cfg.avatar_url) ? '📎 Trocar Avatar' : '📎 Avatar Thumb';
      }
      if (btnUpEst) {
        const nEst = (cfg.thumbs_estilo_urls || []).length;
        btnUpEst.textContent = nEst ? `🖼️ Estilo (${nEst})` : '🖼️ Estilo';
      }
      if (stEl) {
        if (cfg.sem_texto_na_thumb) {
          stEl.className = 'pill ok';
          stEl.textContent = '📸 100% Imagem';
        } else if (temAvatarAtivo) {
          stEl.className = 'pill ok';
          stEl.textContent = cfg.avatar_url ? '✅ Avatar + Estilo' : '✅ Estilo Ativo';
        } else {
          stEl.className = 'pill';
          stEl.textContent = '🎨 Estilo do Canal';
        }
      }

      // Atualiza UI de até 5 Personagens de Referência para o Vídeo ([01] a [05])
      if (persVidImg) {
        persVidImg.style.display = 'none';
      }
      if (persVidListBox) {
        if (listaPersVid.length > 0) {
          persVidListBox.style.display = 'inline-flex';
          persVidListBox.innerHTML = listaPersVid.slice(0, 5).map((it, idx) => {
            const slotNum = it.slot || (idx + 1);
            const tagLbl = it.tag || `[0${slotNum}]`;
            return `<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 4px;border-radius:6px;background:#0d1218;border:1px solid #10b981" title="Personagem ${esc(tagLbl)}: ${esc(it.nome || '')}">
              <img src="${esc(it.url || '')}" alt="${esc(tagLbl)}" style="width:24px;height:24px;object-fit:cover;border-radius:4px;background:#000">
              <b style="font-size:10px;color:#6ee7b7">${esc(tagLbl)}</b>
              <button type="button" class="sm btn-del-pers-slot" data-slot="${slotNum}" style="padding:0 4px;font-size:9.5px;line-height:14px;border-color:rgba(239,68,68,.35);color:#fca5a5" title="Remover ${esc(tagLbl)}">✕</button>
            </span>`;
          }).join('');
          persVidListBox.querySelectorAll('.btn-del-pers-slot').forEach(btnSlot => {
            btnSlot.onclick = (ev) => {
              ev.stopPropagation();
              safe(async () => {
                const slot = Number(btnSlot.getAttribute('data-slot') || 1);
                const cid = $('#e-canal')?.value || S.estCanal || '';
                const rS = await chamarApiThumbCanal('REMOVER_PERSONAGEM_VIDEO', {
                  canal_id: cid,
                  slot_personagem_video: slot,
                });
                atualizarUiAvatarThumbCanal(rS);
                toast(`🗑️ Personagem [0${slot}] removido.`);
              });
            };
          });
        } else {
          persVidListBox.style.display = 'none';
          persVidListBox.innerHTML = '';
        }
      }
      if (btnUpPersVid) {
        btnUpPersVid.textContent = qtdPersVid > 0
          ? (qtdPersVid >= 5 ? `📎 Trocar [05] (5/5)` : `📎 + Personagem (${qtdPersVid}/5)`)
          : '📎 Anexar (0/5)';
      }
      if (chkPersVid) {
        chkPersVid.checked = persVidAtivo;
      }
      if (lblPersVid) {
        lblPersVid.style.borderColor = persVidAtivo ? '#10b981' : 'var(--line)';
        lblPersVid.style.background = persVidAtivo ? 'rgba(16,185,129,.14)' : '#0d1218';
      }
      if (txtPersVid) {
        txtPersVid.style.color = persVidAtivo ? '#6ee7b7' : '#9ba3b0';
        txtPersVid.textContent = persVidAtivo
          ? `Ativos (${qtdPersVid}/5)`
          : 'Usar nos Prompts';
      }
      if (btnDelPersVid) {
        btnDelPersVid.style.display = qtdPersVid > 0 ? '' : 'none';
      }
    };

    const carregarAvatarThumbCanal = async () => {
      const cid = $('#e-canal')?.value || S.estCanal || '';
      if (!cid) return;
      try {
        const cfg = await chamarApiThumbCanal('GET', {canal_id: cid});
        atualizarUiAvatarThumbCanal(cfg);
      } catch (_e) {}
    };
    carregarAvatarThumbCanal();

    const salvarConfigAvatarThumbCanal = async (extra = {}) => {
      const cid = $('#e-canal')?.value || S.estCanal || '';
      if (!cid) return;
      const cfg = await chamarApiThumbCanal('SALVAR_CONFIG', {
        canal_id: cid,
        usar_sempre: $('#e-chk-avatar-thumb-sempre') ? !!$('#e-chk-avatar-thumb-sempre').checked : true,
        sempre_incluir: $('#e-chk-avatar-thumb-sempre') ? !!$('#e-chk-avatar-thumb-sempre').checked : true,
        compositar_direto: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : false,
        compositar_canto: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : false,
        descricao_avatar: ($('#e-inp-desc-avatar-thumb')?.value || '').trim(),
        estilo_thumb: ($('#e-inp-estilo-thumb-canal')?.value || '').trim(),
        ...extra,
      });
      atualizarUiAvatarThumbCanal(cfg);
      return cfg;
    };

    if ($('#e-btn-upload-avatar-thumb') && $('#e-inp-upload-avatar-thumb')) {
      $('#e-btn-upload-avatar-thumb').onclick = () => $('#e-inp-upload-avatar-thumb').click();
      $('#e-inp-upload-avatar-thumb').onchange = () => safe(async () => {
        const f = $('#e-inp-upload-avatar-thumb').files?.[0];
        if (!f) return;
        const btn = $('#e-btn-upload-avatar-thumb');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Anexando…';
        try {
          const arq = await lerArquivoComoBase64(f);
          const r = await chamarApiThumbCanal('UPLOAD_AVATAR', {
            arquivo_b64: arq.b64,
            nome_arquivo: arq.nome,
            usar_sempre: true,
            sempre_incluir: true,
            compositar_direto: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : false,
          });
          atualizarUiAvatarThumbCanal(r);
          addLog(`✓ Avatar da Thumbnail anexado ao canal "${r.canal_nome || ''}" (DNA visual extraído p/ geração nativa pelo ChatGPT)!`, 'ok');
          toast('🦸 Avatar da Thumbnail anexado com sucesso!');
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
          $('#e-inp-upload-avatar-thumb').value = '';
        }
      });
    }
    if ($('#e-btn-upload-pers-video') && $('#e-inp-upload-pers-video')) {
      $('#e-btn-upload-pers-video').onclick = () => $('#e-inp-upload-pers-video').click();
      $('#e-inp-upload-pers-video').onchange = () => safe(async () => {
        const files = Array.from($('#e-inp-upload-pers-video').files || []).slice(0, 5);
        if (!files.length) return;
        const btn = $('#e-btn-upload-pers-video');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = `⏳ Anexando (${files.length})…`;
        try {
          const listaB64 = [];
          for (const f of files) {
            const arq = await lerArquivoComoBase64(f);
            listaB64.push(arq);
          }
          const r = await chamarApiThumbCanal('UPLOAD_PERSONAGEM_VIDEO', {
            personagens_video_b64_list: listaB64,
            personagem_video_b64: listaB64[0]?.b64 || '',
            personagem_video_nome: listaB64[0]?.nome || 'personagem_01.png',
            personagem_video_ativo: true,
          });
          atualizarUiAvatarThumbCanal(r);
          const qtdTot = (r.personagens_video || []).length || listaB64.length;
          addLog(`✓ ${listaB64.length} personagem(ns) anexado(s) (Total: ${qtdTot}/5 — [01]..[0${qtdTot}]) para os prompts do vídeo e sincronizado(s) com o DarkPlanner no canal "${r.canal_nome || ''}"!`, 'ok');
          toast(`🧑 ${qtdTot} Personagem(ns) vinculado(s) ([01] a [0${qtdTot}]) para o vídeo!`);
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
          $('#e-inp-upload-pers-video').value = '';
        }
      });
    }
    if ($('#e-chk-pers-video-ativo')) {
      $('#e-chk-pers-video-ativo').onchange = () => safe(async () => {
        const ativo = !!$('#e-chk-pers-video-ativo').checked;
        const qtdAt = ((S.estAvatarThumbCanal && S.estAvatarThumbCanal.personagens_video) || []).length;
        if (ativo && qtdAt === 0 && !(S.estAvatarThumbCanal && S.estAvatarThumbCanal.personagem_video_url)) {
          $('#e-chk-pers-video-ativo').checked = false;
          toast('Anexe primeiro até 5 imagens de personagens clicando em "📎 Anexar (0/5)".');
          $('#e-inp-upload-pers-video')?.click();
          return;
        }
        const r = await chamarApiThumbCanal('TOGGLE_PERSONAGEM_VIDEO', {
          personagem_video_ativo: ativo,
        });
        atualizarUiAvatarThumbCanal(r);
        toast(ativo
          ? `☑️ Personagens de referência ativados nos prompts do vídeo ([01]..[0${Math.max(1, (r.personagens_video || []).length)}])!`
          : '⏸ Personagens de referência desativados (os prompts serão gerados sem forçar personagem fixo).');
      });
    }
    if ($('#e-btn-del-pers-video')) {
      $('#e-btn-del-pers-video').onclick = () => safe(async () => {
        const cid = $('#e-canal')?.value || S.estCanal || '';
        const r = await chamarApiThumbCanal('REMOVER_PERSONAGEM_VIDEO', {canal_id: cid});
        atualizarUiAvatarThumbCanal(r);
        toast('🗑️ Todos os personagens de referência do vídeo foram removidos.');
      });
    }
    if ($('#e-btn-upload-estilo-thumb') && $('#e-inp-upload-estilo-thumb')) {
      $('#e-btn-upload-estilo-thumb').onclick = () => $('#e-inp-upload-estilo-thumb').click();
      $('#e-inp-upload-estilo-thumb').onchange = () => safe(async () => {
        const files = Array.from($('#e-inp-upload-estilo-thumb').files || []);
        if (!files.length) return;
        const btn = $('#e-btn-upload-estilo-thumb');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Anexando…';
        try {
          const listaB64 = [];
          for (const f of files.slice(0, 6)) {
            const arq = await lerArquivoComoBase64(f);
            listaB64.push(arq);
          }
          const r = await chamarApiThumbCanal('UPLOAD_ESTILO_THUMB', {
            arquivos_estilo_b64: listaB64,
          });
          atualizarUiAvatarThumbCanal(r);
          addLog(`✓ ${listaB64.length} imagem(ns) do Estilo da Thumbnail anexada(s) ao canal "${r.canal_nome || ''}"!`, 'ok');
          toast(`🖼️ Estilo da Thumbnail anexado (${listaB64.length} imagem(ns))!`);
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
          $('#e-inp-upload-estilo-thumb').value = '';
        }
      });
    }
    if ($('#e-btn-ref01-avatar-thumb')) {
      $('#e-btn-ref01-avatar-thumb').onclick = () => safe(async () => {
        await salvarConfigAvatarThumbCanal({usar_ref_01_canal: true, usar_sempre: true, sempre_incluir: true});
        toast('🧩 Personagem [01] do canal vinculado como Avatar Principal para todas as Thumbnails!');
      });
    }
    if ($('#e-chk-avatar-thumb-sempre')) {
      $('#e-chk-avatar-thumb-sempre').onchange = () => safe(async () => {
        const r = await salvarConfigAvatarThumbCanal();
        toast(r?.sempre_incluir ? '☑️ Avatar Principal do canal sempre aparecerá na Thumbnail!' : '⏸ Avatar desativado na Thumbnail (mantendo o Estilo Fixo do canal).');
      });
    }
    if ($('#e-chk-avatar-thumb-comp')) {
      $('#e-chk-avatar-thumb-comp').onchange = () => safe(async () => {
        const r = await salvarConfigAvatarThumbCanal();
        toast(r?.compositar_canto ? '📌 A imagem exata do Avatar também será fixada na lateral da Thumbnail!' : '🤖 O Avatar será gerado integrado na cena pelo ChatGPT.');
      });
    }
    if ($('#e-btn-del-avatar-thumb')) {
      $('#e-btn-del-avatar-thumb').onclick = () => safe(async () => {
        const cid = $('#e-canal')?.value || S.estCanal || '';
        const r = await chamarApiThumbCanal('REMOVER_AVATAR', {canal_id: cid});
        atualizarUiAvatarThumbCanal(r);
        toast('🗑️ Imagem anexada do Avatar removida.');
      });
    }

    const renderizarPacoteViralV8 = pv => {
      const box = $('#e-v8-viral-box');
      if (!box || !pv) return;
      S.estPacoteViral = pv;
      const concs = pv.conceitos_thumb || [];
      const idxAtivo = Number(pv._idxConceitoAtivo || 0);
      const cAtivo = concs[idxAtivo] || concs[0] || {};
      const thPrin = pv.thumb_principal || {};
      const urlImp = cAtivo.url_impacto || thPrin.url_impacto || cAtivo.url_limpa || thPrin.url_limpa || '';
      const dlImp = urlImp ? (urlImp + (urlImp.includes('?') ? '&' : '?') + 'download=1') : '';
      const slugNome = String($('#e-tit')?.value || pv.titulo || 'video_viral').replace(/[^\w\-]+/g, '_').slice(0, 45) || 'video_viral';
      const avInfo = pv.avatar_canal || S.estAvatarThumbCanal || {};
      const comAv = !!(cAtivo.avatar_incluido || thPrin.avatar_incluido || (avInfo.ativo && !avInfo.sem_texto_na_thumb));
      const histChat = Array.isArray(pv._historicoChatThumb) ? pv._historicoChatThumb : [];
      const anV8 = cAtivo.analise_v8 || pv.analise_thumb_v8 || {};
      const gatilhoV8 = anV8.gatilho_psicologico_ctr || cAtivo.angulo_emocional || '';
      const histVisV8 = anV8.historia_visual_3_elementos || '';

      box.style.display = '';
      box.innerHTML = `<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <b class="sp" style="color:#6ee7b7;font-size:13.5px">🖼 Thumbnail Campeã (1280x720 · Análise Motor V8 + ChatGPT High/HD)</b>
        <span class="pill ok">🧠 Análise V8</span>
        <span class="pill ok">🤖 ChatGPT HD</span>
        ${comAv ? `<span class="pill ok">🦸 Com Avatar</span>` : ''}
        <span class="pill ok">✅ Salva no DarkPlanner</span>
        ${dlImp ? `<a class="btn sm pri" id="pv-link-dl-auto" href="${esc(dlImp)}" download="thumb_${esc(slugNome)}.png">⬇ Baixar</a>` : ''}
        <button type="button" class="sm" id="pv-btn-anexar-av-inline">📎 ${avInfo.avatar_url ? 'Trocar Avatar' : 'Anexar Avatar'}</button>
        <button type="button" class="sm" id="pv-btn-anexar-est-inline">🖼️ Estilo</button>
        <button type="button" class="sm" id="pv-btn-regerar-chatgpt" style="border-color:rgba(16,185,129,.45);color:#6ee7b7">🔄 Gerar Outra Foto (V8 + GPT)</button>
      </div>
      ${(gatilhoV8 || histVisV8) ? `<div class="small mut" style="margin:-2px 0 8px;color:#a7f3d0">🧠 <b>Direção Motor V8:</b> ${esc(gatilhoV8 ? `[${gatilhoV8}] ` : '')}${esc(histVisV8)}</div>` : ''}
      <div style="display:grid;grid-template-columns:minmax(280px,640px) minmax(260px,1fr);gap:12px;align-items:start">
        <div>
          ${urlImp
            ? `<img id="pv-img-impacto" src="${esc(urlImp)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;border:1.5px solid #10b981;background:#000;display:block">`
            : `<div class="empty" style="padding:24px">Gerando imagem 1280x720 pelo ChatGPT (Análise Motor V8 + Estilo do Canal)…</div>`}
        </div>

        <!-- CAIXA DE CONVERSA COM A IA APÓS GERAÇÃO DA THUMBNAIL -->
        <div style="padding:10px 12px;border-radius:10px;background:#0d1218;border:1px solid rgba(16,185,129,.38)">
          <div class="row" style="gap:6px;margin-bottom:6px">
            <b style="color:#6ee7b7;font-size:12.5px">💬 Conversar com a IA — Ajustar Thumbnail</b>
            <span class="pill ok" style="font-size:10px;padding:1px 6px">Reajuste Instantâneo</span>
          </div>
          <div style="font-size:11px;color:#9ba3b0;margin-bottom:8px;line-height:1.35">
            O texto ficou na frente do personagem ou quer mudar algo? Clique num atalho ou escreva abaixo o que ficou errado e a IA reajusta na hora:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="O texto ficou na frente do personagem, jogue para o lado livre no topo e diminua um pouco" style="font-size:10.5px;padding:3px 7px;border-color:rgba(16,185,129,.45);color:#6ee7b7">🚫 Tirar texto da frente do personagem</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Mova o texto para o lado esquerdo" style="font-size:10.5px;padding:3px 7px">⬅️ Texto na Esquerda</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Mova o texto para o lado direito" style="font-size:10.5px;padding:3px 7px">➡️ Texto na Direita</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Suba o texto para o topo da imagem" style="font-size:10.5px;padding:3px 7px">⬆️ Texto no Topo</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Diminua o tamanho do texto para ficar mais limpo" style="font-size:10.5px;padding:3px 7px">🔡 Diminuir Letras</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Aumente um pouco o tamanho do texto" style="font-size:10.5px;padding:3px 7px">🔠 Aumentar Letras</button>
            <button type="button" class="sm pv-chip-ajuste-ia" data-msg="Tire todo o texto da imagem, deixe 100% sem texto" style="font-size:10.5px;padding:3px 7px;color:#fcd34d">🖼️ Deixar Sem Texto</button>
          </div>
          <div class="row" style="gap:6px">
            <input type="text" id="pv-inp-chat-ajuste-ia" placeholder="Ex: O texto ficou em cima do personagem, jogue para a direita e diminua... ou mude o texto para &quot;ZERO SLEEP&quot;" style="flex:1;font-size:11.5px;padding:7px 9px;background:#080b10;border:1px solid var(--line);border-radius:6px;color:#e6edf3">
            <button type="button" class="pri sm" id="pv-btn-enviar-ajuste-ia" style="padding:7px 11px;font-size:11.5px;white-space:nowrap">✨ Reajustar</button>
          </div>
          <div id="pv-chat-ia-historico" style="margin-top:8px;display:${histChat.length ? 'flex' : 'none'};flex-direction:column;gap:4px;max-height:110px;overflow-y:auto">
            ${histChat.slice(-3).map(h => `<div style="font-size:10.5px;padding:5px 8px;border-radius:6px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.28);color:#d1fae5">
              <b>Você:</b> ${esc(h.pedido)}<br>
              <b style="color:#6ee7b7">🤖 IA:</b> ${esc(h.resposta)}
            </div>`).join('')}
          </div>
        </div>
      </div>`;

      // Baixa automaticamente a melhor Thumbnail assim que é gerada (1 vez por URL gerada)
      if (dlImp && S.estUltimaThumbAutoBaixada !== urlImp) {
        S.estUltimaThumbAutoBaixada = urlImp;
        setTimeout(() => {
          try {
            const a = document.createElement('a');
            a.href = dlImp;
            a.download = `thumb_${slugNome}.png`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => a.remove(), 800);
          } catch {}
        }, 250);
      }

      if ($('#pv-btn-anexar-av-inline')) {
        $('#pv-btn-anexar-av-inline').onclick = () => {
          $('#e-thumb-avatar-bar')?.scrollIntoView({behavior: 'smooth', block: 'center'});
          $('#e-inp-upload-avatar-thumb')?.click();
        };
      }
      if ($('#pv-btn-anexar-est-inline')) {
        $('#pv-btn-anexar-est-inline').onclick = () => {
          $('#e-thumb-avatar-bar')?.scrollIntoView({behavior: 'smooth', block: 'center'});
          $('#e-inp-upload-estilo-thumb')?.click();
        };
      }

      const executarAjusteThumbComIa = (mensagemUsuario) => safe(async () => {
        const msg = String(mensagemUsuario || $('#pv-inp-chat-ajuste-ia')?.value || '').trim();
        if (!msg) {
          toast('Digite ou clique no que deseja ajustar na Thumbnail.');
          $('#pv-inp-chat-ajuste-ia')?.focus();
          return;
        }
        const btnAj = $('#pv-btn-enviar-ajuste-ia');
        if (btnAj) { btnAj.disabled = true; btnAj.textContent = '⏳ IA Reajustando…'; }
        const payloadAj = {
          vid: S.estVideoId || pv.video_id || '',
          canal_id: $('#e-canal')?.value || S.estCanal || '',
          titulo: $('#e-tit')?.value || pv.titulo || 'video_viral',
          roteiro: ($('#e-rot')?.value || S.estRoteiro || '').trim(),
          pedido_ajuste_ia: msg,
          prompt_imagem_en: cAtivo.prompt_imagem_en || '',
          texto_tela: cAtivo.texto_tela !== undefined ? cAtivo.texto_tela : '',
          palavra_destaque: cAtivo.palavra_destaque || '',
          estilo: cAtivo.estilo_sugerido || 'impacto',
          lado: cAtivo.lado_texto || 'esquerda',
          posicao_vertical: cAtivo.posicao_vertical || 'auto',
          escala_texto: cAtivo.escala_texto || 1.0,
          sem_texto_thumb: cAtivo.sem_texto_thumb,
          cor_destaque: cAtivo.cor_destaque || (S.estAvatarThumbCanal && S.estAvatarThumbCanal.cor_destaque) || '#FFD400',
          incluir_avatar: $('#e-chk-avatar-thumb-sempre') ? !!$('#e-chk-avatar-thumb-sempre').checked : undefined,
          compositar_avatar: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : undefined,
          descricao_avatar: ($('#e-inp-desc-avatar-thumb')?.value || '').trim(),
          estilo_thumb: ($('#e-inp-estilo-thumb-canal')?.value || '').trim(),
        };
        try {
          let rTh;
          try {
            rTh = await api('/api/antigravity/thumb-viral-render', {json: payloadAj});
          } catch (_eRota) {
            rTh = await chamarApiThumbCanal('AJUSTAR_THUMB_IA', payloadAj);
          }
          const aj = rTh.ajustes_aplicados || {};
          cAtivo.url_impacto = rTh.url_impacto;
          cAtivo.url_limpa = rTh.url_limpa;
          cAtivo.arq_impacto = rTh.arq_impacto;
          cAtivo.avatar_incluido = rTh.avatar_incluido;
          if (rTh.analise_v8) cAtivo.analise_v8 = rTh.analise_v8;
          if (aj.lado) cAtivo.lado_texto = aj.lado;
          if (aj.posicao_vertical) cAtivo.posicao_vertical = aj.posicao_vertical;
          if (aj.escala_texto) cAtivo.escala_texto = aj.escala_texto;
          if (aj.cor_destaque) cAtivo.cor_destaque = aj.cor_destaque;
          if (aj.texto_tela !== undefined) cAtivo.texto_tela = aj.texto_tela;
          if (aj.palavra_destaque !== undefined) cAtivo.palavra_destaque = aj.palavra_destaque;
          if (aj.sem_texto_thumb !== undefined) cAtivo.sem_texto_thumb = aj.sem_texto_thumb;
          pv._historicoChatThumb = Array.isArray(pv._historicoChatThumb) ? pv._historicoChatThumb : [];
          pv._historicoChatThumb.push({
            pedido: msg,
            resposta: rTh.explicacao_ia || 'Thumbnail reajustada com sucesso!',
          });
          renderizarPacoteViralV8(pv);
          addLog(`✓ [IA Thumbnail] ${rTh.explicacao_ia || 'Thumbnail reajustada conforme seu pedido!'}`, 'ok');
          toast(`✨ ${rTh.explicacao_ia || 'Thumbnail reajustada pela IA!'}`);
        } finally {
          if (btnAj) { btnAj.disabled = false; btnAj.textContent = '✨ Reajustar'; }
        }
      });

      if ($('#pv-btn-enviar-ajuste-ia')) {
        $('#pv-btn-enviar-ajuste-ia').onclick = () => executarAjusteThumbComIa();
      }
      if ($('#pv-inp-chat-ajuste-ia')) {
        $('#pv-inp-chat-ajuste-ia').onkeydown = (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            executarAjusteThumbComIa();
          }
        };
      }
      box.querySelectorAll('.pv-chip-ajuste-ia').forEach(btnChip => {
        btnChip.onclick = () => {
          const msgChip = btnChip.getAttribute('data-msg') || '';
          if ($('#pv-inp-chat-ajuste-ia')) $('#pv-inp-chat-ajuste-ia').value = msgChip;
          executarAjusteThumbComIa(msgChip);
        };
      });

      if ($('#pv-btn-regerar-chatgpt')) {
        $('#pv-btn-regerar-chatgpt').onclick = () => safe(async () => {
          const btnRegGpt = $('#pv-btn-regerar-chatgpt');
          if (btnRegGpt) { btnRegGpt.disabled = true; btnRegGpt.textContent = '⏳ Analisando V8 + Gerando GPT…'; }
          setStep('p3_viral', 'rodando', 'Motor V8 analisando roteiro + ChatGPT High/HD gerando nova foto de Thumbnail 1280x720 no estilo do canal…', 60);
          mostrarCarregandoPacoteViralV8('⏳ Motor V8 analisando composição + ChatGPT High/HD gerando nova Thumbnail 1280x720…');
          try {
            const rTh = await api('/api/antigravity/thumb-viral-render', {
              json: {
                vid: S.estVideoId || pv.video_id || '',
                canal_id: $('#e-canal')?.value || S.estCanal || '',
                titulo: $('#e-tit')?.value || pv.titulo || 'video_viral',
                roteiro: ($('#e-rot')?.value || S.estRoteiro || '').trim(),
                ordem: idxAtivo + 1,
                prompt_imagem_en: '',
                texto_tela: cAtivo.texto_tela || '',
                palavra_destaque: cAtivo.palavra_destaque || '',
                estilo: cAtivo.estilo_sugerido || 'impacto',
                lado: cAtivo.lado_texto || 'esquerda',
                posicao_vertical: cAtivo.posicao_vertical || 'auto',
                escala_texto: cAtivo.escala_texto || 1.0,
                sem_texto_thumb: cAtivo.sem_texto_thumb,
                cor_destaque: cAtivo.cor_destaque || (S.estAvatarThumbCanal && S.estAvatarThumbCanal.cor_destaque) || '#FFD400',
                incluir_avatar: $('#e-chk-avatar-thumb-sempre') ? !!$('#e-chk-avatar-thumb-sempre').checked : undefined,
                compositar_avatar: $('#e-chk-avatar-thumb-comp') ? !!$('#e-chk-avatar-thumb-comp').checked : undefined,
                descricao_avatar: ($('#e-inp-desc-avatar-thumb')?.value || '').trim(),
                estilo_thumb: ($('#e-inp-estilo-thumb-canal')?.value || '').trim(),
                forcar_nova_arte: true,
              }
            });
            cAtivo.url_impacto = rTh.url_impacto;
            cAtivo.url_limpa = rTh.url_limpa;
            cAtivo.arq_impacto = rTh.arq_impacto;
            cAtivo.avatar_incluido = rTh.avatar_incluido;
            if (rTh.analise_v8) cAtivo.analise_v8 = rTh.analise_v8;
            if (rTh.darkplanner_sync) pv.darkplanner_sync = rTh.darkplanner_sync;
            renderizarPacoteViralV8(pv);
            setStep('p3_viral', 'ok', 'Nova Thumbnail 1280x720 analisada pelo Motor V8 e gerada pelo ChatGPT High/HD!');
            toast('🖼 Nova Thumbnail 1280x720 analisada pelo Motor V8 e gerada pelo ChatGPT!');
          } catch (eTh) {
            setStep('p3_viral', 'erro', eTh.message || 'Erro ao gerar nova foto');
            renderizarPacoteViralV8(pv);
            throw eTh;
          } finally {
            if (btnRegGpt) { btnRegGpt.disabled = false; btnRegGpt.textContent = '🔄 Gerar Outra Foto (V8 + GPT)'; }
          }
        });
      }
    };


    window.gerarPacoteViralSobDemanda = () => safe(async () => {
      const tit = ($('#e-tit')?.value || S.estTitulo || '').trim();
      const rot = ($('#e-rot')?.value || S.estRoteiro || S.estUltimaRespostaV8Limpa || '').trim();
      if (!tit && !rot) throw new Error('Digite um título ou gere/cole o roteiro primeiro.');
      const calc = calcPorDuracao($('#e-dur')?.value || S.estDur || 20);
      const btn2 = $('#e-v8-viral-btn');
      const t2 = btn2 ? btn2.textContent : '';
      if (btn2) { btn2.disabled = true; btn2.textContent = '⏳ Gerando Thumb + Descrição + Tags…'; }
      const tIniPv = Date.now();
      setStep('p3_viral', 'rodando', 'Gerando Thumbnail 16:9 pelo ChatGPT + Descrição SEO + Tags Virais e enviando ao DarkPlanner…', 45);
      mostrarCarregandoPacoteViralV8('⏳ Gerando Thumbnail 16:9 pelo ChatGPT + Descrição SEO + Tags Virais…');
      addLog(`▶ [Passo 3] Gerando Descrição SEO + Tags Virais + Thumbnail 1280x720 pelo ChatGPT…`, 'info');
      try {
        const pv = await api('/api/antigravity/pacote-viral', {
          json: {
            titulo: tit,
            roteiro: rot,
            canal_id: $('#e-canal')?.value || S.estCanal || '',
            vid: S.estVideoId || '',
            duracao_min: calc.dur,
          }
        });
        const segPv = Math.max(1, Math.round((Date.now() - tIniPv) / 1000));
        if (pv.darkplanner_sync && pv.darkplanner_sync.vid) {
          S.estVideoId = pv.darkplanner_sync.vid;
        }
        renderizarPacoteViralV8(pv);
        setStep('p3_viral', 'ok', `Thumbnail 16:9 (ChatGPT) + Descrição SEO + ${(pv.tags_lista || []).length} Tags enviadas ao DarkPlanner (${segPv}s)`);
        $('#e-v8-viral-box')?.scrollIntoView({behavior: 'smooth', block: 'center'});
        addLog(`✓ [Passo 3] Pacote Viral gerado pelo ChatGPT e enviado ao DarkPlanner (${segPv}s): Thumbnail + ${(pv.tags_lista || []).length} Tags + Descrição SEO!`, 'ok');
        toast('🔥 Descrição, Tags e Thumbnail 1280x720 (ChatGPT) geradas e enviadas direto ao DarkPlanner!');
        return pv;
      } catch (ePv) {
        if (ePv && ePv.foiInterrompidoUsuario) {
          setStep('p3_viral', 'pendente', '⏹️ Interrompido pelo Chat da Fábrica Dark');
          addLog('⏹️ Passo 3 (Pacote Viral / Thumbnail) interrompido pelo Chat da Fábrica Dark.', 'info');
          throw ePv;
        }
        setStep('p3_viral', 'erro', ePv.message || 'Erro ao gerar Thumbnail/Descrição/Tags');
        addLog(`✕ Erro ao gerar Pacote Viral: ${ePv.message || ePv}`, 'erro');
        throw ePv;
      } finally {
        if (btn2) { btn2.disabled = false; btn2.textContent = t2 || '🖼 3️⃣ Descrição + Tags + Thumb'; }
      }
    });

    if (S.estPacoteViral) {
      renderizarPacoteViralV8(S.estPacoteViral);
    }

    // ---- ESTEIRA INTELIGENTE POR OPÇÕES MARCADAS: SEGUIR TUDO AUTOMÁTICO (1 AO 6 DIRETO) OU PAUSAR PARA VERIFICAR ----
    $$('.e-step-chk').forEach(chk => {
      chk.onchange = () => {
        const k = chk.dataset.stepKey;
        S.estPassosMarcados = S.estPassosMarcados || {};
        S.estPassosMarcados[k] = chk.checked;
        S.estOpcoesMarcadas = S.estOpcoesMarcadas || {};
        S.estOpcoesMarcadas[k] = chk.checked;
        const lbl = chk.closest('label.card');
        if (lbl) {
          lbl.style.borderColor = chk.checked ? 'rgba(16,185,129,.55)' : 'var(--line)';
          lbl.style.background = chk.checked ? 'rgba(16,185,129,.1)' : '#11161d';
          const b = lbl.querySelector('b');
          if (b) b.style.color = chk.checked ? '#ecfdf5' : '#9ba3b0';
        }
      };
    });
    if ($('#e-chk-marcar-todos')) {
      $('#e-chk-marcar-todos').onclick = () => {
        const todosMarcados = $$('.e-step-chk').every(c => c.checked);
        const marcar = !todosMarcados;
        $$('.e-step-chk').forEach(c => {
          c.checked = marcar;
          c.dispatchEvent(new Event('change'));
        });
      };
    }

    const atualizarModoExecucaoAutomaticaUI = (pausar) => {
      S.estPausarParaVerificar = !!pausar;
      try {
        localStorage.setItem('fd_seguir_tudo_auto', S.estPausarParaVerificar ? '0' : '1');
      } catch (_e) {}
      const chkAuto = $('#e-chk-seguir-tudo-auto');
      const chkPausar = $('#e-chk-pausar-verificar');
      const lblAuto = $('#e-lbl-seguir-tudo-auto');
      const lblPausar = $('#e-lbl-pausar-verificar');
      if (chkAuto) chkAuto.checked = !S.estPausarParaVerificar;
      if (chkPausar) chkPausar.checked = !!S.estPausarParaVerificar;
      if (lblAuto) {
        lblAuto.style.borderColor = !S.estPausarParaVerificar ? '#10b981' : 'var(--line)';
        lblAuto.style.background = !S.estPausarParaVerificar ? 'rgba(16,185,129,.14)' : '#0d1218';
        const b = lblAuto.querySelector('b');
        if (b) b.style.color = !S.estPausarParaVerificar ? '#6ee7b7' : '#cbd5e1';
      }
      if (lblPausar) {
        lblPausar.style.borderColor = S.estPausarParaVerificar ? '#10b981' : 'var(--line)';
        lblPausar.style.background = S.estPausarParaVerificar ? 'rgba(16,185,129,.14)' : '#0d1218';
        const b = lblPausar.querySelector('b');
        if (b) b.style.color = S.estPausarParaVerificar ? '#6ee7b7' : '#9ba3b0';
      }
    };

    if (typeof S.estUsarFilaAuto === 'undefined') {
      try {
        S.estUsarFilaAuto = localStorage.getItem('fd_usar_fila_auto') !== '0';
      } catch (_e) {
        S.estUsarFilaAuto = true;
      }
    }
    if ($('#e-chk-usar-fila-auto')) {
      $('#e-chk-usar-fila-auto').checked = S.estUsarFilaAuto !== false;
      $('#e-chk-usar-fila-auto').onchange = e => {
        S.estUsarFilaAuto = !!e.target.checked;
        try { localStorage.setItem('fd_usar_fila_auto', S.estUsarFilaAuto ? '1' : '0'); } catch (_e) {}
        const lblF = $('#e-lbl-usar-fila-auto');
        if (lblF) {
          lblF.style.borderColor = S.estUsarFilaAuto ? '#10b981' : 'var(--line)';
          lblF.style.background = S.estUsarFilaAuto ? 'rgba(16,185,129,.14)' : '#0d1218';
          const b = lblF.querySelector('b');
          if (b) b.style.color = S.estUsarFilaAuto ? '#6ee7b7' : '#9ba3b0';
        }
        toast(S.estUsarFilaAuto
          ? '📥 Modo Fila Automática Ativo: ao clicar em Executar, o vídeo vai para a Fila em 2º plano e já libera a tela para o próximo vídeo!'
          : '🖥️ Modo Direto na Tela: o vídeo será executado direto na tela atual.');
      };
    }

    if ($('#e-chk-seguir-tudo-auto')) {
      $('#e-chk-seguir-tudo-auto').onchange = e => {
        const seguirAuto = !!e.target.checked;
        atualizarModoExecucaoAutomaticaUI(!seguirAuto);
        if (seguirAuto) {
          $$('.e-step-chk').forEach(c => {
            c.checked = true;
            c.dispatchEvent(new Event('change'));
          });
        }
        toast(seguirAuto
          ? '⚡ Seguir tudo automático ativado: todos os passos (1 ao 6) serão executados direto!'
          : '⏸ Modo Verificação Ativo: vou perguntar "Deseja que eu continue?" após cada passo.');
      };
    }
    if ($('#e-chk-pausar-verificar')) {
      $('#e-chk-pausar-verificar').onchange = e => {
        const pausar = !!e.target.checked;
        atualizarModoExecucaoAutomaticaUI(pausar);
        toast(pausar
          ? '⏸ Modo Verificação Ativo: vou perguntar "Deseja que eu continue?" após cada passo.'
          : '⚡ Seguir tudo automático ativado: todos os passos marcados serão executados direto!');
      };
    }

    $$('.e-chk-chat-dp-opt').forEach(chk => {
      chk.onchange = e => {
        const opt = e.target.getAttribute('data-chat-opt') || e.target.value || 'flash_high';
        window.definirModeloChatDp(opt, true);
      };
    });

    // ---- SINCRONIZAÇÃO DOS CAMPOS DE FAIXAS DE TEMPO DO SRT VEO + QUEBRAR POR FRASES ----
    const sincronizarCamposVeoFaixas = () => {
      S.estVeoFaixasCfg = {
        ativo: $('#e-veo-faixas-ativo') ? !!$('#e-veo-faixas-ativo').checked : true,
        primeiros_blocos: Math.max(1, Number($('#e-veo-prim-blocos')?.value) || 60),
        primeiros_min_s: Math.max(0, Number($('#e-veo-prim-min')?.value ?? 2)),
        primeiros_max_s: Math.max(1, Number($('#e-veo-prim-max')?.value || 4)),
        resto_min_s: Math.max(0, Number($('#e-veo-rest-min')?.value ?? 4)),
        resto_max_s: Math.max(1, Number($('#e-veo-rest-max')?.value || 8)),
        quebrar_frases: $('#e-veo-quebrar-frases') ? !!$('#e-veo-quebrar-frases').checked : true,
      };
      try {
        localStorage.setItem('fd_veo_faixas_cfg', JSON.stringify(S.estVeoFaixasCfg));
      } catch (_e) {}
      const bar = $('#e-veo-faixas-bar');
      if (bar) {
        bar.style.borderColor = S.estVeoFaixasCfg.ativo ? '#f59e0b' : 'var(--line)';
      }
    };
    ['#e-veo-faixas-ativo', '#e-veo-prim-blocos', '#e-veo-prim-min', '#e-veo-prim-max', '#e-veo-rest-min', '#e-veo-rest-max', '#e-veo-quebrar-frases'].forEach(sel => {
      const el = $(sel);
      if (el) {
        el.onchange = () => {
          sincronizarCamposVeoFaixas();
          const c = S.estVeoFaixasCfg;
          toast(`⏱️ SRT Tempo VEO: Primeiros ${c.primeiros_blocos} blocos (${c.primeiros_min_s}s a ${c.primeiros_max_s}s) + demais (${c.resto_min_s}s a ${c.resto_max_s}s) · Quebrar por frases: ${c.quebrar_frases ? 'SIM' : 'NÃO'}`);
        };
      }
    });

    const aguardarConfirmacaoContinuar = (msgTitulo, msgDetalhe) => new Promise(resolve => {
      const box = $('#e-v8-confirm-continue-box');
      if (!box) return resolve('yes');
      if ($('#e-v8-confirm-msg')) $('#e-v8-confirm-msg').textContent = msgTitulo || '✅ Etapa concluída! Deseja que eu continue para o próximo passo?';
      if ($('#e-v8-confirm-sub')) $('#e-v8-confirm-sub').textContent = msgDetalhe || 'Revise o resultado abaixo. Se estiver tudo certo, clique em "Sim, Continuar".';
      box.style.display = '';
      box.scrollIntoView({behavior: 'smooth', block: 'center'});
      const finalizar = acao => {
        box.style.display = 'none';
        resolve(acao);
      };
      if ($('#e-v8-confirm-yes')) $('#e-v8-confirm-yes').onclick = () => finalizar('yes');
      if ($('#e-v8-confirm-adjust')) $('#e-v8-confirm-adjust').onclick = () => {
        $('#e-v8-chat-msg')?.focus();
        finalizar('adjust');
      };
      if ($('#e-v8-confirm-stop')) $('#e-v8-confirm-stop').onclick = () => finalizar('stop');
    });

    const gerarAudioESrtAutomaticoNoBackend = async () => {
      sincronizarCamposVeoFaixas();
      const pVeo = typeof window.obterPayloadVeoFaixas === 'function'
        ? window.obterPayloadVeoFaixas()
        : {
            ativo: true,
            primeiros_blocos: 60,
            primeiros_min_s: 2,
            primeiros_max_s: 4,
            resto_min_s: 4,
            resto_max_s: 8,
            quebrar_frases: true,
            min_s: 4,
            max_s: 8,
            faixas: [{count: 60, minMs: 2000, maxMs: 4000}, {minMs: 4000, maxMs: 8000}],
          };
      const rotTxt = window.limparApenasRoteiro
        ? window.limparApenasRoteiro(($('#e-rot')?.value || S.estRoteiro || '').trim())
        : ($('#e-rot')?.value || S.estRoteiro || '').trim();
      const tit = ($('#e-tit')?.value || S.estTitulo || 'Audio_Video').trim();
      const cid = $('#e-canal')?.value || S.estCanal || '';
      const hashRoteiroAtual = `${cid}|${tit}|${rotTxt.length}|${rotTxt.slice(0, 140)}|${rotTxt.slice(-140)}`;

      // Só reaproveita SRT/Áudio se for exatamente do MESMO roteiro atual (ou se o usuário subiu arquivo manualmente na aba Já tenho MP3/SRT sem roteiro novo)
      const srtExistente = ($('#e-srt-raw')?.value || S.estSrtTexto || '').trim();
      if (srtExistente && S.estUltimoHashRoteiroAudio && S.estUltimoHashRoteiroAudio === hashRoteiroAtual && S.estJobId) {
        return true;
      }
      if (srtExistente && S.estAudio && !rotTxt) {
        return true;
      }
      if (!rotTxt) {
        throw new Error('Gere ou cole o Roteiro Completo antes de gerar o Áudio MP3 e o SRT.');
      }

      // Limpa qualquer áudio/SRT antigo antes de iniciar a geração do NOVO áudio para este roteiro!
      invalidarAudioESrtAtual();
      S._gerandoAudioBackendAgora = true;
      try {
        setStep('p4', 'rodando', `Gerando NOVO Áudio MP3 no DarkPlanner para este roteiro (Ritmo SRT: ${pVeo.primeiros_blocos} blocos ${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s + demais ${pVeo.resto_min_s}-${pVeo.resto_max_s}s)…`, 50);
        addLog(`🎙 [Passo 4] Iniciando geração de NOVO Áudio MP3 + SRT Tempo VEO (${rotTxt.split(/\s+/).filter(Boolean).length} palavras · ${pVeo.primeiros_blocos} blocos de ${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s + demais de ${pVeo.resto_min_s}-${pVeo.resto_max_s}s) para "${tit}"…`, 'info');
        const [cfgData, hAntesRes] = await Promise.all([
          api(`/api/darkplanner/audio/config?canal_id=${encodeURIComponent(cid)}`).catch(() => ({})),
          api(`/api/darkplanner/audio/history?canal_id=${encodeURIComponent(cid)}`).catch(() => ({items: []})),
        ]);
        const idsJobsAntigos = new Set(((hAntesRes.items || hAntesRes.history || [])).map(x => String(x.job_id || '')).filter(Boolean));
        const vozes = cfgData.vozes || cfgData.voices || [];
        const cfg = cfgData.config || {};
        const vozId = (
          cfg.voice_id
          || cfg.default_voice_id
          || (cfgData.voz && (cfgData.voz.voice_id || cfgData.voz.id))
          || (vozes[0] && (vozes[0].voice_id || vozes[0].id))
          || 'cdf1ce4c-bbe0-43f5-b4ad-df00daae27ad'
        );
        const rGen = await api('/api/darkplanner/audio/generate', {
          json: {
            canal_id: cid,
            voice_id: vozId,
            title: tit,
            text: rotTxt,
            speed: Number(cfg.speed) || 1.0,
            volume: Number(cfg.volume) || 1.0,
            subtitle_words: Math.max(1, Number(cfg.subtitle_words) || 5),
            subtitle_case: cfg.subtitle_case || 'normal',
            subtitle_veo_words: Math.max(1, Number(cfg.subtitle_veo_words) || 5),
            subtitle_veo_min: Math.max(1, Number(pVeo.primeiros_min_s || cfg.subtitle_veo_min || 2)),
            subtitle_veo_max: Math.max(4, Number(pVeo.resto_max_s || cfg.subtitle_veo_max || 8)),
          }
        });
        const jobAlvo = String(rGen.job_id || (rGen.job && rGen.job.job_id) || '').trim();
        if (jobAlvo) S.estJobId = jobAlvo;
        // Aguarda conclusão EXCLUSIVAMENTE do novo áudio gerado (nunca pega um job antigo do vídeo anterior!)
        let itemPronto = null;
        for (let tent = 0; tent < 55; tent++) {
          await new Promise(r => setTimeout(r, 3500));
          const hRes = await api(`/api/darkplanner/audio/history?canal_id=${encodeURIComponent(cid)}`).catch(() => ({items: []}));
          const lista = hRes.items || hRes.history || [];
          const cand = jobAlvo
            ? lista.find(x => String(x.job_id || '') === jobAlvo)
            : lista.find(x => !idsJobsAntigos.has(String(x.job_id || '')) && (x.file_name || x.title || '').toLowerCase().includes(tit.toLowerCase().slice(0, 20)));
          if (cand && (cand.status || 'completed') === 'completed') {
            itemPronto = cand;
            break;
          }
          if (cand && cand.status === 'failed') {
            throw new Error('Falha ao gerar áudio no DarkPlanner: ' + (cand.error || 'erro desconhecido'));
          }
        }
        if (!itemPronto) {
          // Fallback: abre o modal para acompanhamento caso demore mais que 3 min
          if ($('#e-open-dp-audiogen')) $('#e-open-dp-audiogen').click();
          return false;
        }
        const jid = itemPronto.job_id || jobAlvo;
        S.estJobId = jid;
        setStep('p4', 'ok', `Novo Áudio MP3 gerado automaticamente (${itemPronto.file_name || tit})`);
        setStep('p5', 'rodando', `Editando SRT Tempo VEO: primeiros ${pVeo.primeiros_blocos} blocos (${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s) + demais (${pVeo.resto_min_s}-${pVeo.resto_max_s}s) quebrados por frase…`, 65);
        // 1º: Executa a quebra por frases com as Faixas configuradas (ex.: primeiros 60 blocos de 2 a 4s e os outros de 4 a 8s)
        const dVeo = await api('/api/darkplanner/audio/srt-veo', {
          json: {
            job_id: jid,
            quebrar_frases: pVeo.quebrar_frases,
            min_s: pVeo.min_s,
            max_s: pVeo.max_s,
            faixas: pVeo.faixas,
          }
        }).catch(() => ({}));
        // Pausa estratégica (time mais lento) para o DarkPlanner finalizar o processamento do áudio antes de anexar o MP3 e o SRT único
        await new Promise(r => setTimeout(r, 2200));
        // 2º: Baixa e vincula o MP3 já com SOMENTE O SRT Tempo VEO editado (`dVeo.srt_texto` — 1 único SRT) e salva em D:\ARQUIVOS DE VIDEOS\<NOME DO VIDEO>
        const rVinc = await api('/api/darkplanner/audio/vincular', {
          json: {
            job_id: jid,
            audio_url: itemPronto.audio_url || '',
            srt_texto: dVeo?.srt_texto || '',
            vid: S.estVideoId || '',
            file_name: itemPronto.file_name || tit,
            criar_cenas_veo: true,
            faixas: pVeo.faixas,
            quebrar_frases: pVeo.quebrar_frases,
            min_s: pVeo.min_s,
            max_s: pVeo.max_s,
          }
        }).catch(() => ({}));
        // Pausa extra após vincular Áudio e SRT para garantir sincronia 1:1 antes de gerar cenas
        await new Promise(r => setTimeout(r, 1800));
        const srtFinal = (dVeo && dVeo.srt_texto) || (rVinc && rVinc.srt_texto) || '';
        const totBlocosFinal = (dVeo && dVeo.total_blocos) || (rVinc && rVinc.total_blocos) || (srtFinal ? srtFinal.trim().split(/\n\s*\n/).length : 0);
        if (srtFinal) {
          S.estSrtTexto = srtFinal;
          S.estTotalBlocosSrt = totBlocosFinal;
          S.estUltimoHashRoteiroAudio = hashRoteiroAtual;
          if ($('#e-srt-raw')) $('#e-srt-raw').value = srtFinal;
          if ($('#e-srt-badge')) $('#e-srt-badge').textContent = `✓ SRT editado pronto (${totBlocosFinal} blocos · ${pVeo.primeiros_blocos}x ${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s + ${pVeo.resto_min_s}-${pVeo.resto_max_s}s)`;
        }
        if (rVinc && rVinc.download_mp3_url) {
          S.estMp3Url = rVinc.download_mp3_url;
        }
        setStep('p5', 'ok', `SRT Tempo VEO editado pronto (${totBlocosFinal} blocos · Salvo em ${rVinc?.pasta_arquivos_video || 'D:\\ARQUIVOS DE VIDEOS'})`);
        addLog(`✓ [Passo 4] Novo Áudio MP3 (Job ${jid}) e SOMENTE 1 SRT Tempo VEO (${totBlocosFinal} blocos: primeiros ${pVeo.primeiros_blocos} de ${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s e demais de ${pVeo.resto_min_s}-${pVeo.resto_max_s}s quebrados por frase) salvos em ${rVinc?.pasta_arquivos_video || 'D:\\ARQUIVOS DE VIDEOS'}!`, 'ok');
        return true;
      } finally {
        S._gerandoAudioBackendAgora = false;
      }
    };

    // =========================================================================
    // 📋 FILA DE PRODUÇÃO AUTOMÁTICA EM 2º PLANO (MULTI-VÍDEOS INDEPENDENTES)
    // =========================================================================
    const salvarFilaProducaoStorage = () => {
      try {
        const resumo = (S.filaProducao || []).slice(-25).map(it => ({
          id_fila: it.id_fila,
          numero: it.numero,
          criado_em: it.criado_em,
          iniciado_em: it.iniciado_em || 0,
          finalizado_em: it.finalizado_em || 0,
          step_iniciado_em: it.step_iniciado_em || 0,
          status: it.status,
          etapa_atual: it.etapa_atual,
          progresso_pct: it.progresso_pct,
          titulo: it.titulo,
          contexto: it.contexto,
          canal_id: it.canal_id,
          canal_nome: it.canal_nome,
          duracao_min: it.duracao_min,
          palavras: it.palavras,
          blocos: it.blocos,
          prompt_mestre_id: it.prompt_mestre_id,
          passos: it.passos,
          skill_modo: it.skill_modo,
          estilo_visual: it.estilo_visual,
          epoca_pais: it.epoca_pais,
          generation_mode: it.generation_mode,
          tag_config: it.tag_config,
          edicao_config: it.edicao_config,
          veo_faixas_config: it.veo_faixas_config,
          chat_modelo_opcao: it.chat_modelo_opcao,
          youtube_ref_url: it.youtube_ref_url,
          video_id: it.video_id || '',
          sp_id: it.sp_id || '',
          estrutura_txt: (it.estrutura_txt || '').slice(0, 25000),
          roteiro: (it.roteiro || '').slice(0, 65000),
          job_id: it.job_id || '',
          srt_texto: (it.srt_texto || '').slice(0, 65000),
          total_blocos_srt: it.total_blocos_srt || 0,
          mp3_url: it.mp3_url || '',
          pasta_arquivos_video: it.pasta_arquivos_video || '',
          mensagem_chat_dp: (it.mensagem_chat_dp || '').slice(0, 25000),
          erro_msg: it.erro_msg || '',
          live_steps: Array.isArray(it.live_steps) ? it.live_steps : undefined,
          live_logs: Array.isArray(it.live_logs) ? it.live_logs.slice(-60) : undefined,
        }));
        localStorage.setItem('fd_fila_producao_v1', JSON.stringify(resumo));
        localStorage.setItem('fd_fila_contador_v1', String(S.filaContador || resumo.length || 0));
        if (S.filaVinculadaId) {
          localStorage.setItem('fd_fila_vinculada_v1', String(S.filaVinculadaId));
        }
      } catch (_e) {}
    };

    const atualizarStepItemFila = (it, stepId, stepStatus, msg, pct = 50) => {
      if (!it) return;
      garantirStepsELogsDoItemFila(it);
      const st = it.live_steps.find(s => s.id === stepId);
      if (st) {
        st.status = stepStatus;
        if (msg !== undefined) st.msg = msg;
        st.pct = stepStatus === 'ok' ? 100 : (stepStatus === 'pendente' ? 0 : pct);
      }
      if (stepStatus === 'rodando') {
        it.step_iniciado_em = Date.now();
      }
      salvarFilaProducaoStorage();
      renderLiveLog();
    };

    window.vincularProjetoFilaNoPainel = function (idFila, mostrarToast = false) {
      S.filaVinculadaId = idFila || '';
      try { localStorage.setItem('fd_fila_vinculada_v1', S.filaVinculadaId); } catch (_eV) {}
      if (idFila && idFila !== '__tela__') {
        S.dpProcessoSelecionadoId = idFila;
      }
      renderLiveLog();
      if (typeof window.renderizarFilaProducaoUI === 'function') window.renderizarFilaProducaoUI();
      if (mostrarToast && idFila && idFila !== '__tela__') {
        const it = (S.filaProducao || []).find(x => x.id_fila === idFila);
        if (it) {
          toast(`📌 Painel vinculado exclusivamente ao Projeto #${it.numero} (Etapa ${obterNumeroEtapaItemFila(it)}/7)!`);
        }
      }
    };

    if (!Array.isArray(S.filaProducao)) {
      try {
        const salvoFila = JSON.parse(localStorage.getItem('fd_fila_producao_v1') || '[]');
        S.filaProducao = Array.isArray(salvoFila) ? salvoFila.map(it => {
          if (it && it.status === 'rodando' && !S._processandoFilaAgora) {
            it.status = 'erro';
            it.etapa_atual = '⏸ Interrompido ao recarregar — clique em ▶️ Continuar Etapa ou 📂 Reabrir';
          }
          if (it) garantirStepsELogsDoItemFila(it);
          return it;
        }) : [];
        S.filaContador = Math.max(Number(localStorage.getItem('fd_fila_contador_v1') || 0), S.filaProducao.length);
      } catch (_e) {
        S.filaProducao = [];
        S.filaContador = 0;
      }
    } else {
      S.filaProducao.forEach(it => { if (it) garantirStepsELogsDoItemFila(it); });
    }

    window.renderizarFilaProducaoUI = function () {
      salvarFilaProducaoStorage();
      renderLiveLog();
      const box = $('#e-fila-producao-box');
      if (!box) return;
      const lista = S.filaProducao || [];
      if (!lista.length) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
      }
      box.style.display = '';
      const qtdRodando = lista.filter(x => x.status === 'rodando').length;
      const qtdEsperando = lista.filter(x => x.status === 'na_fila').length;
      const qtdConcluidos = lista.filter(x => x.status === 'concluido').length;
      const itVincAtual = obterItemFilaVinculadoPainel();

      if (S.filaMinimizada) {
        const itAtivo = itVincAtual || lista.find(x => x.status === 'rodando') || lista[lista.length - 1];
        box.style.padding = '0';
        box.style.border = 'none';
        box.style.background = 'transparent';
        box.innerHTML = `
          <div class="fd-min-bar">
            ${qtdRodando
              ? `<span class="pill ok" style="font-size:10.5px"><span class="dp-cyan-spin" style="width:10px;height:10px;margin-right:4px"></span>${qtdRodando} Produzindo</span>`
              : `<span class="pill ok" style="font-size:10.5px">✅ ${qtdConcluidos}/${lista.length} Gerado${lista.length > 1 ? 's' : ''}</span>`}
            <b style="color:#ecfdf5;font-size:12.5px" class="sp">🎬 ${esc((itAtivo && itAtivo.titulo) || 'Projetos na Fila')} ${lista.length > 1 ? `(+${lista.length - 1})` : ''} — <span style="font-weight:500;color:#94a3b8">${esc((itAtivo && itAtivo.etapa_atual) || '')}</span></b>
            <button type="button" class="sm" id="e-fila-btn-mon-min" style="border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700">💬 Monitor (Chat DP)</button>
            <button type="button" class="sm pri" id="e-fila-btn-expandir">📂 Abrir e Ver Processo (${lista.length})</button>
          </div>`;
        if ($('#e-fila-btn-expandir')) {
          $('#e-fila-btn-expandir').onclick = () => {
            S.filaMinimizada = false;
            window.renderizarFilaProducaoUI();
          };
        }
        if ($('#e-fila-btn-mon-min')) {
          $('#e-fila-btn-mon-min').onclick = () => window.abrirMonitorProcessoDp(itAtivo ? itAtivo.id_fila : '');
        }
        return;
      }

      box.style.padding = '10px 12px';
      box.style.border = '1px solid rgba(16,185,129,.45)';
      box.style.background = '#0d1218';

      box.innerHTML = `
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <b style="color:#6ee7b7;font-size:13px">📋 Fila de Produção Automática em 2º Plano (${lista.length} vídeo${lista.length > 1 ? 's' : ''})</b>
          ${qtdRodando ? `<span class="pill ok" style="font-size:10.5px">⚙️ ${qtdRodando} Produzindo Agora</span>` : ''}
          ${qtdEsperando ? `<span class="pill warn" style="font-size:10.5px">⏳ ${qtdEsperando} Aguardando na Fila</span>` : ''}
          ${qtdConcluidos ? `<span class="pill ok" style="font-size:10.5px">✅ ${qtdConcluidos} Concluído${qtdConcluidos > 1 ? 's' : ''}</span>` : ''}
          <span class="small mut sp">Clique em <b>👁️ Ver Etapa</b> em qualquer vídeo da fila para ver exclusivamente a etapa dele no painel à direita!</span>
          <button type="button" class="sm" id="e-fila-btn-mon-top" style="font-size:10.5px;padding:2px 8px;border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700">💬 Monitor ao Vivo</button>
          <button type="button" class="sm" id="e-fila-btn-minimizar" style="font-size:10.5px;padding:2px 9px;border-color:#22d3ee;color:#67e8f9;font-weight:700" title="Minimizar todos os projetos da fila para 1 linha compacta">— Minimizar Projetos</button>
          ${qtdConcluidos ? `<button type="button" class="sm" id="e-fila-limpar-concluidos" style="font-size:10.5px;padding:2px 8px">🧹 Limpar Concluídos</button>` : ''}
          <button type="button" class="sm" id="e-fila-limpar-tudo" style="font-size:10.5px;padding:2px 8px;border-color:rgba(239,68,68,.4);color:#fca5a5">🗑️ Limpar Fila</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:310px;overflow-y:auto">
          ${lista.map(it => {
            const ehVinc = Boolean(itVincAtual && itVincAtual.id_fila === it.id_fila);
            const numEt = obterNumeroEtapaItemFila(it);
            const corBorda = ehVinc
              ? '#22d3ee'
              : (it.status === 'rodando'
                ? '#10b981'
                : (it.status === 'concluido' ? 'rgba(16,185,129,.4)' : (it.status === 'erro' ? '#ef4444' : 'var(--line)')));
            const bgCard = ehVinc
              ? 'rgba(34,211,238,.09)'
              : (it.status === 'rodando'
                ? 'rgba(16,185,129,.1)'
                : (it.status === 'erro' ? 'rgba(239,68,68,.1)' : '#11161d'));
            const badgeStatus = it.status === 'rodando'
              ? `<span class="pill ok" style="font-size:10px"><span class="dp-cyan-spin" style="width:10px;height:10px;margin-right:4px"></span>ETAPA ${numEt}/7 (${it.progresso_pct || 10}%)</span>`
              : (it.status === 'concluido'
                ? `<span class="pill ok" style="font-size:10px">✅ ETAPA 7/7 · 100%</span>`
                : (it.status === 'erro'
                  ? `<span class="pill err" style="font-size:10px">⚠️ ETAPA ${numEt}/7 · PAUSADO</span>`
                  : `<span class="pill warn" style="font-size:10px">⏳ FILA · ETAPA ${numEt}/7</span>`));
            if (it.minimizado) {
              return `<div class="fd-min-bar" style="padding:6px 10px;border-color:${corBorda}">
                ${badgeStatus}
                <b style="color:#ecfdf5;font-size:12px" class="sp">#${it.numero} · ${esc(it.titulo || 'Vídeo')}</b>
                <button type="button" class="sm" data-fila-bind="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#22d3ee;color:#67e8f9;font-weight:700">${ehVinc ? '📌 Vinculado' : '👁️ Ver Etapa'}</button>
                <button type="button" class="sm" data-fila-dl="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#38bdf8;color:#7dd3fc;font-weight:700" title="Baixar todos os arquivos gerados deste projeto em .ZIP">⬇️ .ZIP</button>
                <button type="button" class="sm" data-fila-proc="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700">💬 Chat</button>
                <button type="button" class="sm pri" data-fila-min="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px">📂 Expandir</button>
              </div>`;
            }
            return `<div style="padding:8px 10px;border-radius:8px;border:${ehVinc ? '1.5px' : '1px'} solid ${corBorda};background:${bgCard}">
              <div class="row" style="gap:8px;flex-wrap:wrap">
                <b style="color:#ecfdf5;font-size:12.5px;cursor:pointer" data-fila-bind="${esc(it.id_fila)}" title="Clique para acompanhar exclusivamente a etapa deste projeto à direita">#${it.numero} · ${esc(it.titulo || 'Vídeo sem título')}</b>
                <span class="pill" style="font-size:10px">${esc(it.canal_nome || 'Canal')} · ⏱️ ${it.duracao_min} min · 🤖 ${esc(window.obterInfoModeloChatDp(it.chat_modelo_opcao).curto)}</span>
                ${badgeStatus}
                ${ehVinc ? `<span class="pill ok" style="font-size:10px;border-color:#22d3ee;color:#ecfeff;background:rgba(34,211,238,.22)">📌 Vinculado às Etapas</span>` : ''}
                <div style="margin-left:auto;display:flex;align-items:center;gap:5px;flex-wrap:wrap">
                  <button type="button" class="sm" data-fila-bind="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#22d3ee;color:#67e8f9;font-weight:700" title="Vincular o painel de Etapas à direita exclusivamente a este projeto (sem reiniciar nada)">${ehVinc ? '📌 Acompanhando' : `👁️ Ver Etapa (${numEt}/7)`}</button>
                  <button type="button" class="sm" data-fila-dl="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#38bdf8;color:#7dd3fc;font-weight:700" title="Baixar todos os arquivos gerados deste projeto em .ZIP para o seu PC">⬇️ .ZIP</button>
                  <button type="button" class="sm" data-fila-proc="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#22d3ee;color:#67e8f9;font-weight:700" title="Abrir Chat e monitor em tempo real deste projeto">💬 Chat</button>
                  <button type="button" class="sm" data-fila-min="${esc(it.id_fila)}" style="padding:2px 7px;font-size:10.5px;border-color:var(--line);color:#cbd5e1" title="Minimizar card deste projeto">— Min</button>
                  <button type="button" class="sm" data-fila-ver="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#10b981;color:#6ee7b7;font-weight:700" title="Reabrir os textos e arquivos deste projeto na tela sem repetir etapas já concluídas">📂 Reabrir</button>
                  <button type="button" class="sm" data-fila-check="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#38bdf8;color:#7dd3fc;font-weight:700" title="Verificar arquivos salvos (Roteiro, Áudio, SRT, Thumb, Prompts e Pasta)">🔍 Verificar</button>
                  ${it.mensagem_chat_dp ? `<button type="button" class="sm pri" data-fila-chat="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px" title="Reenviar na mesma conversa do Chat DarkPlanner Desktop">💬 Chat DP</button>` : ''}
                  ${it.mensagem_chat_dp ? `<button type="button" class="sm" data-fila-copy="${esc(it.id_fila)}" style="padding:2px 7px;font-size:10.5px" title="Copiar comando do Chat">📋</button>` : ''}
                  <button type="button" class="sm" data-fila-retry="${esc(it.id_fila)}" style="padding:2px 8px;font-size:10.5px;border-color:#f59e0b;color:#fde68a" title="Continuar exatamente da etapa onde parou (sem regerar roteiro/narração já prontos)">▶️ Continuar Etapa</button>
                  <button type="button" class="sm" data-fila-del="${esc(it.id_fila)}" style="padding:2px 7px;font-size:10.5px;border-color:rgba(239,68,68,.45);color:#fca5a5" title="Deletar da fila (ou excluir projeto completo)">🗑️ Excluir</button>
                </div>
              </div>
              <div class="small" style="margin-top:4px;color:${it.status === 'erro' ? '#fca5a5' : '#a7f3d0'}">${esc(it.etapa_atual || '')}${it.pasta_arquivos_video ? ` · 📂 <code>${esc(it.pasta_arquivos_video)}</code>` : ''}</div>
              <div style="height:4px;background:#0a0d12;border-radius:4px;overflow:hidden;margin-top:5px">
                <div style="height:100%;width:${Math.max(2, Math.min(100, Number(it.progresso_pct || 0)))}%;background:${it.status === 'erro' ? '#ef4444' : '#10b981'};transition:width .3s"></div>
              </div>
            </div>`;
          }).join('')}
        </div>`;

      if ($('#e-fila-btn-minimizar')) {
        $('#e-fila-btn-minimizar').onclick = () => {
          S.filaMinimizada = true;
          window.renderizarFilaProducaoUI();
        };
      }
      if ($('#e-fila-btn-mon-top')) {
        $('#e-fila-btn-mon-top').onclick = () => {
          const itRef = itVincAtual || lista.find(x => x.status === 'rodando') || lista[lista.length - 1];
          window.abrirMonitorProcessoDp(itRef ? itRef.id_fila : '');
        };
      }
      if ($('#e-fila-limpar-concluidos')) {
        $('#e-fila-limpar-concluidos').onclick = () => {
          S.filaProducao = (S.filaProducao || []).filter(x => x.status !== 'concluido');
          if (S.filaVinculadaId && !S.filaProducao.some(x => x.id_fila === S.filaVinculadaId)) {
            S.filaVinculadaId = (S.filaProducao[0] && S.filaProducao[0].id_fila) || '';
          }
          window.renderizarFilaProducaoUI();
        };
      }
      if ($('#e-fila-limpar-tudo')) {
        $('#e-fila-limpar-tudo').onclick = () => {
          if (!window.confirm('Deseja limpar todos os itens da Fila de Produção?')) return;
          S.filaProducao = [];
          S.filaVinculadaId = '';
          S._processandoFilaAgora = false;
          window.renderizarFilaProducaoUI();
          toast('🗑️ Fila de Produção limpa.');
        };
      }
      $$('[data-fila-bind]', box).forEach(b => b.onclick = () => {
        window.vincularProjetoFilaNoPainel(b.dataset.filaBind, true);
      });
      $$('[data-fila-dl]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaDl);
        if (!it) return;
        window.baixarProjetoAtualZip({
          pasta: it.pasta_arquivos_video || '',
          titulo: it.titulo || '',
          vid: it.video_id || '',
          job_id: it.job_id || '',
          skill6_slug: (it.pacote_skill6 || {}).slug || '',
          roteiro: it.roteiro || '',
          srt_texto: it.srt_texto || '',
        });
      });
      $$('[data-fila-proc]', box).forEach(b => b.onclick = () => {
        window.vincularProjetoFilaNoPainel(b.dataset.filaProc, false);
        window.abrirMonitorProcessoDp(b.dataset.filaProc);
      });
      $$('[data-fila-min]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaMin);
        if (!it) return;
        it.minimizado = !it.minimizado;
        window.renderizarFilaProducaoUI();
      });
      $$('[data-fila-ver]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaVer);
        if (it) window.carregarItemFilaNaTela(it);
      });
      $$('[data-fila-check]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaCheck);
        if (it && typeof window.verificarProjetoCriadoModal === 'function') {
          window.verificarProjetoCriadoModal(it.titulo, it.video_id || '', '', it.canal_id || '');
        }
      });
      $$('[data-fila-copy]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaCopy);
        if (it && it.mensagem_chat_dp) {
          copiar(it.mensagem_chat_dp);
          toast(`📋 Prompt do vídeo #${it.numero} copiado!`);
        }
      });
      $$('[data-fila-chat]', box).forEach(b => b.onclick = () => safe(async () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaChat);
        if (!it || !it.mensagem_chat_dp) return;
        b.disabled = true;
        const tOld = b.textContent;
        b.textContent = '⏳ Colando no Chat DP…';
        try {
          copiar(it.mensagem_chat_dp);
          const res = await api('/api/darkplanner/acao', {
            json: {
              acao: 'enviar_chat',
              mensagem: it.mensagem_chat_dp,
              auto_enviar: true,
              nova_conversa: false,
              chat_modelo_opcao: it.chat_modelo_opcao || 'flash_high',
              forcar_reenvio: true,
            }
          });
          toast(res.msg || `💬 Vídeo #${it.numero} enviado na conversa do DarkPlanner Desktop!`);
        } finally {
          setTimeout(() => { b.disabled = false; b.textContent = tOld; }, 8000);
        }
      }));
      $$('[data-fila-retry]', box).forEach(b => b.onclick = ev => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaRetry);
        if (!it) return;
        if (it.status === 'rodando') {
          window.vincularProjetoFilaNoPainel(it.id_fila, true);
          return;
        }
        const refazerDoZero = Boolean(ev && ev.shiftKey);
        it.retomar_de_onde_parou = !refazerDoZero;
        it.status = 'na_fila';
        it.erro_msg = '';
        const numEt = obterNumeroEtapaItemFila(it);
        it.etapa_atual = refazerDoZero
          ? '⏳ Reagendado para refazer do zero…'
          : `⏳ Retomando exatamente da Etapa ${numEt}/7 (preservando roteiro e narração já prontos)…`;
        window.vincularProjetoFilaNoPainel(it.id_fila, false);
        window.renderizarFilaProducaoUI();
        window.processarFilaProducao();
      });
      $$('[data-fila-del]', box).forEach(b => b.onclick = () => {
        const it = (S.filaProducao || []).find(x => x.id_fila === b.dataset.filaDel);
        if (!it) return;
        const jaTemArquivos = Boolean(it.video_id || it.pasta_arquivos_video || it.sp_id || it.status === 'concluido');
        if (jaTemArquivos && typeof window.deletarProjetoCriadoConfirmado === 'function') {
          if (window.confirm(`Deseja EXCLUIR o projeto "${it.titulo}" por completo (Fila + Chat + DarkPlanner + Disco)?\n\nClique em OK para excluir tudo, ou Cancelar para remover apenas do card da Fila.`)) {
            S.filaProducao = (S.filaProducao || []).filter(x => x.id_fila !== it.id_fila);
            S.dpProcessos = (S.dpProcessos || []).filter(p => p.id !== it.id_fila);
            if (S.filaVinculadaId === it.id_fila) {
              S.filaVinculadaId = (S.filaProducao[0] && S.filaProducao[0].id_fila) || '';
            }
            window.renderizarFilaProducaoUI();
            window.deletarProjetoCriadoConfirmado(it.titulo, it.video_id || '', '', it.pasta_arquivos_video || '', true);
            return;
          }
        }
        S.filaProducao = (S.filaProducao || []).filter(x => x.id_fila !== it.id_fila);
        if (S.filaVinculadaId === it.id_fila) {
          S.filaVinculadaId = (S.filaProducao[0] && S.filaProducao[0].id_fila) || '';
        }
        window.renderizarFilaProducaoUI();
        toast(`🗑️ Vídeo #${it.numero} removido da fila.`);
      });
    };

    window.carregarItemFilaNaTela = async function (it) {
      if (!it) return;
      garantirStepsELogsDoItemFila(it);
      // 1. Vincula imediatamente o painel de Etapas à direita a este projeto específico!
      window.vincularProjetoFilaNoPainel(it.id_fila, false);

      // Se o projeto está produzindo ao vivo agora na fila, NÃO sobrescreve os checkboxes como se fosse repetir do zero!
      if (it.status === 'rodando') {
        const numEt = obterNumeroEtapaItemFila(it);
        if ($('#e-rot') && it.roteiro && !$('#e-rot').value.trim()) {
          $('#e-rot').value = it.roteiro;
          $('#e-rot').dispatchEvent(new Event('input'));
        }
        if ($('#e-srt-raw') && it.srt_texto && !$('#e-srt-raw').value.trim()) {
          $('#e-srt-raw').value = it.srt_texto;
        }
        S.dpProcessoSelecionadoId = it.id_fila;
        toast(`👁️ Acompanhando Projeto #${it.numero} ao vivo na Etapa ${numEt}/7 no painel direito!`);
        return;
      }

      if (it.canal_id && $('#e-canal') && $('#e-canal').value !== it.canal_id) {
        S.estCanal = it.canal_id;
        $('#e-canal').value = it.canal_id;
      }
      S.estVideoId = it.video_id || '';
      S.estUltSpId7 = it.sp_id || '';
      S.estTitulo = it.titulo || '';
      S.estUltimoTituloV8 = it.titulo || '';
      S.estDur = it.duracao_min || 20;
      S.estUltimaDuracaoV8 = it.duracao_min || 20;
      S.estEstruturaV8 = it.estrutura_txt || '';
      S.estRoteiro = it.roteiro || '';
      S.estJobId = it.job_id || '';
      S.estSrtTexto = it.srt_texto || '';
      S.estTotalBlocosSrt = it.total_blocos_srt || 0;
      S.estPacoteViral = it.pacote_viral || null;
      S.estSkill6Pacote = it.pacote_skill6 || null;
      S.estMidiasReais = it.midias_reais || null;
      S.estConcluido = it.status === 'concluido';
      S.estStep45Aberto = true;
      S.estStep6Aberto = true;
      S.estStep7Aberto = true;
      S.estMostrarTudo = true;
      if ($('#e-tit')) $('#e-tit').value = it.titulo || '';
      if ($('#e-ctx')) $('#e-ctx').value = it.contexto || '';
      if ($('#e-dur')) $('#e-dur').value = it.duracao_min || 20;
      atuCalcV8();
      if ($('#e-rot')) {
        $('#e-rot').value = it.roteiro || '';
        $('#e-rot').dispatchEvent(new Event('input'));
      }
      if ($('#e-srt-raw')) $('#e-srt-raw').value = it.srt_texto || '';
      if (it.pacote_viral) renderizarPacoteViralV8(it.pacote_viral);

      // Desmarca automaticamente as etapas já concluídas neste projeto para NUNCA repetir do zero por engano!
      const jaFezMapa = {
        p1_estruturar: Boolean(it.estrutura_txt || it.roteiro),
        p2_roteiro: Boolean(it.roteiro),
        p4_pacote_viral: Boolean(it.pacote_viral),
        p5_audio_srt: Boolean(it.job_id && it.srt_texto),
        p6_cenas: Boolean(it.pacote_skill6 || it.midias_reais),
        p7_projeto_dp: Boolean(it.status === 'concluido'),
      };
      $$('.e-step-chk').forEach(chk => {
        const k = chk.dataset.stepKey;
        if (k && jaFezMapa[k] !== undefined) {
          chk.checked = !jaFezMapa[k];
        }
      });

      atualizarVisibilidadeEtapas();
      renderLiveLog();

      // Se faltar roteiro/SRT em memória mas existir no servidor, restaura os arquivos mantendo o vínculo 1:1 da Fila!
      if ((!it.roteiro || !it.srt_texto) && it.titulo && typeof window.carregarProjetoCriadoNoEstudio === 'function' && (it.status === 'concluido' || it.pasta_arquivos_video || it.video_id)) {
        await window.carregarProjetoCriadoNoEstudio(it.titulo, it.video_id || '', '');
        window.vincularProjetoFilaNoPainel(it.id_fila, false);
        return;
      }
      const numEt = obterNumeroEtapaItemFila(it);
      toast(`📂 Projeto #${it.numero} reaberto na Etapa ${numEt}/7 (etapas já prontas desmarcadas para não repetir do zero)!`);
    };

    const resumirMidiasReaisParaEnvio = (mr) => {
      if (!mr || typeof mr !== 'object') return {};
      const cenasOrig = Array.isArray(mr.cenas) ? mr.cenas : [];
      return {
        ok: Boolean(mr.ok),
        total_cenas: mr.total_cenas || cenasOrig.length,
        videos_reais_selecionados: mr.videos_reais_selecionados || 0,
        pool_videos_disponiveis: mr.pool_videos_disponiveis || 0,
        midias_banco_local_disponiveis: mr.midias_banco_local_disponiveis || 0,
        total_bancos_analisados: mr.total_bancos_analisados || 12,
        bancos_12_analise: Array.isArray(mr.bancos_12_analise) ? mr.bancos_12_analise : [],
        cenas: cenasOrig.map(c => ({
          scene_index: c.scene_index,
          start: c.start,
          end: c.end,
          texto: c.texto,
          query_en: c.query_en,
          midia: c.midia || null,
          pexels_url: c.pexels_url || '',
          pexels_fotos_url: c.pexels_fotos_url || '',
          resultados: Array.isArray(c.resultados) ? c.resultados.slice(0, 2) : [],
        })),
      };
    };

    window.adicionarVideoNaFilaProducao = function () {
      const tit = ($('#e-tit')?.value || '').trim();
      const ctx = ($('#e-ctx')?.value || '').trim();
      if (!tit && !ctx) {
        $('#e-tit')?.focus();
        toast('⚠️ Digite primeiro o Título ou Ideia do vídeo lá no topo para adicionar à Fila!');
        return null;
      }
      const passosMarcados = $$('.e-step-chk').filter(c => c.checked).map(c => c.dataset.stepKey);
      if (!passosMarcados.length) {
        toast('⚠️ Marque pelo menos 1 passo nas caixas de seleção para adicionar à Fila.');
        return null;
      }
      sincronizarCamposVeoFaixas();
      const durInput = Math.max(1, Number($('#e-dur')?.value || S.estDur || 20));
      const calc = calcPorDuracao(durInput);
      const cid = $('#e-canal')?.value || S.estCanal || '';
      const chItem = (S.channels || []).find(c => c.id === cid) || {};
      const chNome = chItem.nome || 'Canal';
      const chNomeLow = chNome.toLowerCase();
      const ehCanalVideoReal = chNomeLow.includes('stormscope') || chNomeLow.includes('severe weather') || chNomeLow.includes('gta') || chNomeLow.includes('à la une') || chNomeLow.includes('a la une') || ['17681e73-1ab9-412e-93e5-ca12739ece16', 'a8068857-d56f-4aba-baf3-ea2b7ebda5bb'].includes(String(cid).toLowerCase()) || sugestaoCanal.modo === 'video_real';
      const promptMestreId = $('#e-dp-prompt')?.value || '';
      const skModoEscolhido = String(S.estSkillModo || '').trim();
      const skModo = (skModoEscolhido && skModoEscolhido !== 'video_real' && (skModoEscolhido.startsWith('skill') || skModoEscolhido === 'outra_skill'))
        ? skModoEscolhido
        : (ehCanalVideoReal ? 'video_real' : (skModoEscolhido || sugestaoCanal.modo || 'skill6_cenas_flow'));
      const estiloVal = ($('#e-s6-style')?.value || S.estS6Style || '').trim();
      const epocaVal = ($('#e-s6-epoca')?.value || S.estS6Epoca || '').trim();
      const genMode = $('#e-s6-mode')?.value || (ehCanal100Img ? 'STILL_IMAGE' : (ehCanalFlowIv ? 'IV' : 'DIRETO'));
      const tagCfg = typeof atuPreviewGuiaTags === 'function' ? atuPreviewGuiaTags() : {onde_gerar: 'flow', tipo: 'v', formato: '16:9', modelo: ''};
      const cfgEd = typeof lerEdicaoConfig === 'function' ? lerEdicaoConfig() : {predef: 'sys_tudo', densidade_destaques: 'equilibrado', mostrar_legenda: true, usar_sfx: true, instrucoes_custom: ''};
      const pVeo = typeof window.obterPayloadVeoFaixas === 'function'
        ? window.obterPayloadVeoFaixas()
        : {ativo: true, primeiros_blocos: 60, primeiros_min_s: 2, primeiros_max_s: 4, resto_min_s: 4, resto_max_s: 8, quebrar_frases: true, min_s: 4, max_s: 8, faixas: [{count: 60, minMs: 2000, maxMs: 4000}, {minMs: 4000, maxMs: 8000}]};
      const chatOpcaoDp = window.obterInfoModeloChatDp(S.estChatDpOpcao || 'flash_high').opt;
      const u1 = ($('#e-yt-clone-url')?.value || '').trim();
      const u2 = ($('#e-yt-clone-url-2')?.value || '').trim();
      const u3 = ($('#e-yt-clone-url-3')?.value || '').trim();
      const urlsRef = [u1, u2, u3].filter(Boolean);
      const ytRefUrl = urlsRef.length ? urlsRef.join(' ||| ') : (S.estYoutubeCloneUrl || '').trim();
      const reutilizarExistentes = $('#e-s6-reutilizar-existentes') ? !!$('#e-s6-reutilizar-existentes').checked : false;
      const packIdSnap = $('#e-s6-pack-id')?.value || '';
      const gerarRefsSnap = $('#e-s6-gen-refs') ? !!$('#e-s6-gen-refs').checked : true;
      const salvarPackSnap = $('#e-s6-save-pack') ? !!$('#e-s6-save-pack').checked : false;
      const promptsMarcadosIds = $$('.e-chk-prompt-canal').length
        ? $$('.e-chk-prompt-canal').filter(c => c.checked).map(c => c.value)
        : (S.estPromptsMarcados || []);

      const iniciaDoZero = passosMarcados.includes('p1_estruturar') || passosMarcados.includes('p2_roteiro');
      const rotInicial = iniciaDoZero ? '' : (($('#e-rot')?.value || S.estRoteiro || '').trim());
      const srtInicial = iniciaDoZero ? '' : (($('#e-srt-raw')?.value || S.estSrtTexto || '').trim());

      S.filaContador = (S.filaContador || 0) + 1;
      const hIni = new Date().toLocaleTimeString('pt-BR', {hour12: false});
      const novoItem = {
        id_fila: 'fila_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        numero: S.filaContador,
        criado_em: Date.now(),
        iniciado_em: Date.now(),
        step_iniciado_em: Date.now(),
        finalizado_em: 0,
        status: 'na_fila',
        minimizado: false,
        etapa_atual: `⏳ Na fila (${calc.dur} min · ${passosMarcados.length} passos marcados)…`,
        progresso_pct: 6,
        titulo: tit || ctx.slice(0, 80),
        contexto: ctx,
        canal_id: cid,
        canal_nome: chNome,
        duracao_min: calc.dur,
        palavras: calc.palavras,
        blocos: calc.blocos,
        prompt_mestre_id: promptMestreId,
        passos: passosMarcados.slice(),
        skill_modo: skModo,
        estilo_visual: estiloVal,
        epoca_pais: epocaVal,
        generation_mode: genMode,
        tag_config: Object.assign({}, tagCfg),
        edicao_config: Object.assign({}, cfgEd),
        veo_faixas_config: JSON.parse(JSON.stringify(pVeo)),
        chat_modelo_opcao: chatOpcaoDp,
        youtube_ref_url: ytRefUrl,
        youtube_clone: S.estYoutubeCloneAtivo || null,
        reutilizar_existentes: reutilizarExistentes,
        pack_id: packIdSnap,
        gerar_imagens_ref: gerarRefsSnap,
        salvar_novas_no_pack: salvarPackSnap,
        prompts_canal_ids: promptsMarcadosIds.slice(),
        video_id: '',
        sp_id: '',
        estrutura_txt: '',
        roteiro: rotInicial,
        pacote_viral: null,
        job_id: '',
        srt_texto: srtInicial,
        total_blocos_srt: 0,
        mp3_url: '',
        pacote_skill6: null,
        midias_reais: null,
        resultado_passo7: null,
        pasta_arquivos_video: '',
        mensagem_chat_dp: '',
        retomar_de_onde_parou: false,
        live_steps: criarStepsPadraoEstudio(),
        live_logs: [
          {t: `[${hIni}] 📥 [Fila #${S.filaContador}] "${tit || ctx.slice(0, 60)}" (${calc.dur} min · ~${calc.palavras} palavras) vinculado a este projeto.`, nivel: 'ok'},
        ],
      };

      S.filaProducao.push(novoItem);
      // Se não havia outro item da fila em acompanhamento (ou estava em Tela Livre), vincula imediatamente ao Fila #1 sem desconectar!
      if (!S.filaVinculadaId || S.filaVinculadaId === '__tela__' || !S.filaProducao.some(x => x.id_fila === S.filaVinculadaId && x.id_fila !== novoItem.id_fila)) {
        S.filaVinculadaId = novoItem.id_fila;
        try { localStorage.setItem('fd_fila_vinculada_v1', novoItem.id_fila); } catch (_eV) {}
      }

      window.registrarPassoProcessoDp({
        procId: novoItem.id_fila,
        id: novoItem.id_fila,
        titulo: novoItem.titulo,
        canal_nome: novoItem.canal_nome,
        duracao_min: novoItem.duracao_min,
        chat_modelo_opcao: novoItem.chat_modelo_opcao,
        stepKey: 'p1',
        stepStatus: 'rodando',
        detalhe: `Projeto adicionado à fila automática (\`${novoItem.duracao_min} min\` · \`~${novoItem.palavras} palavras\`)`,
        acao_tecnica: 'enfileirar_projeto',
        progresso_pct: 6,
        selecionar: S.filaVinculadaId === novoItem.id_fila,
        abrirJanela: !S.dpMonitorManualFechado,
      });

      // Limpa os campos de digitação para o próximo vídeo SEM desconectar o painel lateral do item da Fila!
      limparArtefatosVideoAnterior(true);
      S.estVideoId = '';
      S.estTitulo = '';
      S.estUltimoTituloV8 = '';
      S.estUltimaDuracaoV8 = 0;
      // Restaura todos os checkboxes marcados para caso o usuário digite o próximo projeto na sequência
      $$('.e-step-chk').forEach(c => { c.checked = true; });
      if ($('#e-tit')) {
        $('#e-tit').value = '';
        $('#e-tit').focus();
      }
      if ($('#e-ctx')) $('#e-ctx').value = '';

      window.renderizarFilaProducaoUI();
      toast(`📥 Vídeo #${novoItem.numero} ("${novoItem.titulo}" · ${novoItem.duracao_min} min) vinculado na Fila! Já pode digitar o próximo ou acompanhar as etapas à direita.`);

      window.processarFilaProducao();
      return novoItem;
    };

    window.processarFilaProducao = async function () {
      if (S._processandoFilaAgora) return;
      S._processandoFilaAgora = true;
      try {
        while (true) {
          const item = (S.filaProducao || []).find(x => x.status === 'na_fila');
          if (!item) break;

          garantirStepsELogsDoItemFila(item);
          item.status = 'rodando';
          if (!item.iniciado_em || !item.retomar_de_onde_parou) {
            item.iniciado_em = Date.now();
          }
          item.step_iniciado_em = Date.now();
          let stepEmExecucao = 'p1';

          const atualizarItem = (stepKey, pct, msg, extraDp = {}) => {
            stepEmExecucao = stepKey;
            item.progresso_pct = pct;
            item.etapa_atual = msg;
            atualizarStepItemFila(item, stepKey, 'rodando', msg, pct);
            addLog(`⚙️ [Etapa ${obterNumeroEtapaItemFila(item)}/7] ${msg}`, 'info', item.id_fila);
            window.renderizarFilaProducaoUI();
            window.registrarPassoProcessoDp(Object.assign({
              procId: item.id_fila,
              id: item.id_fila,
              titulo: item.titulo,
              canal_nome: item.canal_nome,
              duracao_min: item.duracao_min,
              chat_modelo_opcao: item.chat_modelo_opcao,
              stepKey,
              stepStatus: 'rodando',
              detalhe: msg,
              progresso_pct: pct,
              pasta_arquivos_video: item.pasta_arquivos_video || '',
              selecionar: S.filaVinculadaId === item.id_fila,
            }, extraDp));
          };

          try {
            const retomar = Boolean(item.retomar_de_onde_parou);
            for (let i = 0; i < item.passos.length; i++) {
              const chave = item.passos[i];

              if (chave === 'p1_estruturar') {
                if (retomar && (item.estrutura_txt || item.roteiro)) {
                  atualizarStepItemFila(item, 'p1', 'ok', `Estrutura já pronta (${item.blocos} blocos preservados)`, 100);
                  continue;
                }
                atualizarItem('p1', 15, `Etapa 1/7: Estruturando ${item.blocos} blocos (${item.duracao_min} min · ~${item.palavras} palavras)…`, {acao_tecnica: 'estruturar_roteiro'});
                const r1 = await api('/api/antigravity/analisar', {
                  json: {
                    modo: 'estruturar',
                    titulo: item.titulo,
                    instrucoes: item.contexto,
                    duracao_min: item.duracao_min,
                    palavras: item.palavras,
                    blocos: item.blocos,
                    canal_id: item.canal_id,
                    prompt_mestre_id: item.prompt_mestre_id,
                    video_id: item.video_id || '',
                    roteiro: '',
                    youtube_clone: item.youtube_clone,
                    youtube_ref_url: item.youtube_ref_url,
                    veo_faixas_config: item.veo_faixas_config,
                  }
                });
                if (r1.video_id) item.video_id = r1.video_id;
                item.estrutura_txt = limparCaracteresEspeciaisV8(r1.resposta || '');
                atualizarStepItemFila(item, 'p1', 'ok', `Estrutura aprovada (${item.blocos} blocos · ~${item.palavras} palavras)`, 100);
                addLog(`✓ [Etapa 1/7] Estrutura concluída (${item.blocos} blocos).`, 'ok', item.id_fila);
                window.registrarPassoProcessoDp({
                  procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                  stepKey: 'p1', stepStatus: 'ok',
                  detalhe: `Estrutura aprovada (\`${item.blocos} blocos\` · \`~${item.palavras} palavras\`)`,
                  acao_tecnica: 'estrutura_pronta', progresso_pct: 22,
                  selecionar: S.filaVinculadaId === item.id_fila,
                });
              } else if (chave === 'p2_roteiro') {
                if (retomar && item.roteiro && item.roteiro.trim().length > 80) {
                  atualizarStepItemFila(item, 'p2', 'ok', 'Roteiro completo já pronto (preservado sem recriar)', 100);
                  continue;
                }
                atualizarItem('p2', 32, `Etapa 2/7: Escrevendo Roteiro Completo (${item.duracao_min} min · ~${item.palavras} palavras)…`, {acao_tecnica: 'escrever_roteiro_limpo'});
                const instRot = item.estrutura_txt
                  ? ((item.contexto ? item.contexto + '\n\n' : '') + 'ESTRUTURA APROVADA:\n' + item.estrutura_txt).trim()
                  : item.contexto;
                const r2 = await api('/api/antigravity/analisar', {
                  json: {
                    modo: 'roteiro_completo',
                    titulo: item.titulo,
                    instrucoes: instRot,
                    duracao_min: item.duracao_min,
                    palavras: item.palavras,
                    blocos: item.blocos,
                    canal_id: item.canal_id,
                    prompt_mestre_id: item.prompt_mestre_id,
                    video_id: item.video_id || '',
                    roteiro: '',
                    youtube_clone: item.youtube_clone,
                    youtube_ref_url: item.youtube_ref_url,
                    veo_faixas_config: item.veo_faixas_config,
                  }
                });
                if (r2.video_id) item.video_id = r2.video_id;
                item.roteiro = typeof window.limparApenasRoteiro === 'function'
                  ? window.limparApenasRoteiro(r2.resposta || '')
                  : limparCaracteresEspeciaisV8(r2.resposta || '');
                if (r2.pacote_viral) {
                  item.pacote_viral = r2.pacote_viral;
                }
                const nPalsRot = (item.roteiro.trim().match(/\S+/g) || []).length;
                atualizarStepItemFila(item, 'p2', 'ok', `Roteiro limpo pronto (${nPalsRot} palavras)`, 100);
                addLog(`✓ [Etapa 2/7] Roteiro completo concluído (${nPalsRot} palavras).`, 'ok', item.id_fila);
                window.registrarPassoProcessoDp({
                  procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                  stepKey: 'p2', stepStatus: 'ok',
                  detalhe: `Roteiro limpo concluído (\`${nPalsRot} palavras\` salvas em \`01_ROTEIRO_LIMPO.txt\`)`,
                  acao_tecnica: 'roteiro_salvo', progresso_pct: 40,
                  selecionar: S.filaVinculadaId === item.id_fila,
                });
              } else if (chave === 'p4_pacote_viral') {
                if (!item.pacote_viral) {
                  atualizarItem('p3_viral', 48, `Etapa 3/7: Gerando Thumbnail 16:9 + Descrição SEO + Tags…`, {acao_tecnica: 'gerar_pacote_viral'});
                  const pv = await api('/api/antigravity/pacote-viral', {
                    json: {
                      titulo: item.titulo,
                      roteiro: item.roteiro,
                      canal_id: item.canal_id,
                      vid: item.video_id || '',
                      duracao_min: item.duracao_min,
                    }
                  });
                  item.pacote_viral = pv;
                  if (pv.darkplanner_sync && pv.darkplanner_sync.vid) {
                    item.video_id = pv.darkplanner_sync.vid;
                  }
                }
                atualizarStepItemFila(item, 'p3_viral', 'ok', 'Thumbnail 16:9, Descrição SEO e Tags prontas', 100);
                addLog(`✓ [Etapa 3/7] Thumbnail 16:9, Descrição SEO e Tags sincronizadas.`, 'ok', item.id_fila);
                window.registrarPassoProcessoDp({
                  procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                  stepKey: 'p3_viral', stepStatus: 'ok',
                  detalhe: `Thumbnail 16:9 (\`thumbnail.png\`), Descrição SEO e Tags sincronizadas`,
                  acao_tecnica: 'pacote_viral_pronto', progresso_pct: 55,
                  selecionar: S.filaVinculadaId === item.id_fila,
                });
              } else if (chave === 'p5_audio_srt') {
                if (retomar && item.job_id && item.srt_texto && item.srt_texto.trim().length > 30) {
                  atualizarStepItemFila(item, 'p4', 'ok', `Áudio MP3 já gerado (Job ${item.job_id})`, 100);
                  atualizarStepItemFila(item, 'p5', 'ok', `SRT VEO já pronto (${item.total_blocos_srt || 0} blocos preservados)`, 100);
                  continue;
                }
                atualizarItem('p4', 62, `Etapa 4/7: Gerando Áudio MP3 (${item.duracao_min} min) no DarkPlanner…`, {acao_tecnica: 'gerar_audio_tts'});
                const pVeo = item.veo_faixas_config;
                const [cfgData, hAntesRes] = await Promise.all([
                  api(`/api/darkplanner/audio/config?canal_id=${encodeURIComponent(item.canal_id)}`).catch(() => ({})),
                  api(`/api/darkplanner/audio/history?canal_id=${encodeURIComponent(item.canal_id)}`).catch(() => ({items: []})),
                ]);
                const idsJobsAntigos = new Set(((hAntesRes.items || hAntesRes.history || [])).map(x => String(x.job_id || '')).filter(Boolean));
                const vozes = cfgData.vozes || cfgData.voices || [];
                const cfg = cfgData.config || {};
                const vozId = (
                  cfg.voice_id
                  || cfg.default_voice_id
                  || (cfgData.voz && (cfgData.voz.voice_id || cfgData.voz.id))
                  || (vozes[0] && (vozes[0].voice_id || vozes[0].id))
                  || 'cdf1ce4c-bbe0-43f5-b4ad-df00daae27ad'
                );
                const rGen = await api('/api/darkplanner/audio/generate', {
                  json: {
                    canal_id: item.canal_id,
                    voice_id: vozId,
                    title: item.titulo,
                    text: item.roteiro,
                    speed: Number(cfg.speed) || 1.0,
                    volume: Number(cfg.volume) || 1.0,
                    subtitle_words: Math.max(1, Number(cfg.subtitle_words) || 5),
                    subtitle_case: cfg.subtitle_case || 'normal',
                    subtitle_veo_words: Math.max(1, Number(cfg.subtitle_veo_words) || 5),
                    subtitle_veo_min: Math.max(1, Number(pVeo.primeiros_min_s || cfg.subtitle_veo_min || 2)),
                    subtitle_veo_max: Math.max(4, Number(pVeo.resto_max_s || cfg.subtitle_veo_max || 8)),
                  }
                });
                const jobAlvo = String(rGen.job_id || (rGen.job && rGen.job.job_id) || '').trim();
                if (jobAlvo) item.job_id = jobAlvo;
                let itemPronto = null;
                for (let tent = 0; tent < 60; tent++) {
                  await new Promise(r => setTimeout(r, 3500));
                  const hRes = await api(`/api/darkplanner/audio/history?canal_id=${encodeURIComponent(item.canal_id)}`).catch(() => ({items: []}));
                  const lista = hRes.items || hRes.history || [];
                  const cand = jobAlvo
                    ? lista.find(x => String(x.job_id || '') === jobAlvo)
                    : lista.find(x => !idsJobsAntigos.has(String(x.job_id || '')) && (x.file_name || x.title || '').toLowerCase().includes(item.titulo.toLowerCase().slice(0, 20)));
                  if (cand && (cand.status || 'completed') === 'completed') {
                    itemPronto = cand;
                    break;
                  }
                  if (cand && cand.status === 'failed') {
                    throw new Error('Falha ao gerar áudio no DarkPlanner: ' + (cand.error || 'erro desconhecido'));
                  }
                }
                if (!itemPronto) {
                  throw new Error('Tempo limite aguardando conclusão do áudio no DarkPlanner.');
                }
                const jid = itemPronto.job_id || jobAlvo;
                item.job_id = jid;
                atualizarStepItemFila(item, 'p4', 'ok', `Áudio MP3 pronto (Job ${jid})`, 100);
                atualizarItem('p5', 74, `Etapa 5/7: Quebrando SRT Tempo VEO por frases (${pVeo.primeiros_blocos} blocos ${pVeo.primeiros_min_s}-${pVeo.primeiros_max_s}s + demais ${pVeo.resto_min_s}-${pVeo.resto_max_s}s)…`, {acao_tecnica: 'quebrar_srt_veo'});
                const dVeo = await api('/api/darkplanner/audio/srt-veo', {
                  json: {
                    job_id: jid,
                    quebrar_frases: pVeo.quebrar_frases,
                    min_s: pVeo.min_s,
                    max_s: pVeo.max_s,
                    faixas: pVeo.faixas,
                  }
                }).catch(() => ({}));
                await new Promise(r => setTimeout(r, 2200));
                const rVinc = await api('/api/darkplanner/audio/vincular', {
                  json: {
                    job_id: jid,
                    audio_url: itemPronto.audio_url || '',
                    srt_texto: dVeo?.srt_texto || '',
                    vid: item.video_id || '',
                    file_name: itemPronto.file_name || item.titulo,
                    criar_cenas_veo: true,
                    faixas: pVeo.faixas,
                    quebrar_frases: pVeo.quebrar_frases,
                    min_s: pVeo.min_s,
                    max_s: pVeo.max_s,
                  }
                }).catch(() => ({}));
                await new Promise(r => setTimeout(r, 1800));
                const srtItemFinal = (dVeo && dVeo.srt_texto) || (rVinc && rVinc.srt_texto) || '';
                const totBlocosItemFinal = (dVeo && dVeo.total_blocos) || (rVinc && rVinc.total_blocos) || (srtItemFinal ? srtItemFinal.trim().split(/\n\s*\n/).length : 0);
                if (srtItemFinal) {
                  item.srt_texto = srtItemFinal;
                  item.total_blocos_srt = totBlocosItemFinal;
                }
                if (rVinc && rVinc.download_mp3_url) {
                  item.mp3_url = rVinc.download_mp3_url;
                }
                atualizarStepItemFila(item, 'p5', 'ok', `SRT VEO pronto (${item.total_blocos_srt || 0} blocos sincronizados)`, 100);
                addLog(`✓ [Etapa 5/7] Áudio MP3 + SRT VEO prontos (${item.total_blocos_srt || 0} blocos).`, 'ok', item.id_fila);
                window.registrarPassoProcessoDp({
                  procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                  stepKey: 'p5', stepStatus: 'ok',
                  detalhe: `Narração \`audio.mp3\` + Legenda \`srtsynctempo_editado.srt\` prontos (\`${item.total_blocos_srt || 0} blocos\` VEO)`,
                  acao_tecnica: 'audio_srt_vinculados', total_cenas: item.total_blocos_srt || 0, progresso_pct: 78,
                  selecionar: S.filaVinculadaId === item.id_fila,
                });
              } else if (chave === 'p6_cenas') {
                if (retomar && (item.pacote_skill6 || item.midias_reais)) {
                  atualizarStepItemFila(item, 'p6', 'ok', 'Prompts / Cenas 1:1 já gerados (preservados)', 100);
                  continue;
                }
                const ehItemVideoReal = item.skill_modo === 'video_real' || String(item.canal_nome || '').toLowerCase().includes('stormscope') || String(item.canal_nome || '').toLowerCase().includes('gta') || ['17681e73-1ab9-412e-93e5-ca12739ece16', 'a8068857-d56f-4aba-baf3-ea2b7ebda5bb'].includes(String(item.canal_id || '').toLowerCase());
                if (ehItemVideoReal) item.skill_modo = 'video_real';
                atualizarItem('p6', 84, ehItemVideoReal
                  ? `Etapa 6/7: Analisando os 12 Bancos de Imagens/Vídeos Reais (${item.total_blocos_srt || 'vários'} blocos SRT)…`
                  : `Etapa 6/7: Gerando Cenas e Prompts 1:1 com o SRT (${item.total_blocos_srt || 'vários'} blocos)…`,
                  {acao_tecnica: ehItemVideoReal ? 'buscar_videos_reais' : 'gerar_prompts_cenas'}
                );
                if (ehItemVideoReal) {
                  const rVr = await api('/api/antigravity/buscar-videos-reais-srt', {
                    json: {
                      srt_texto: item.srt_texto,
                      job_id: item.job_id || '',
                      titulo: item.titulo,
                      canal_id: item.canal_id,
                      canal_nome: item.canal_nome || '',
                    }
                  });
                  item.midias_reais = rVr;
                  if (rVr && rVr.srt_texto && !item.srt_texto) {
                    item.srt_texto = rVr.srt_texto;
                  }
                  atualizarStepItemFila(item, 'p6', 'ok', `${(rVr && rVr.total_cenas) || item.total_blocos_srt || 0} cenas reais mapeadas 1:1`, 100);
                  addLog(`✓ [Etapa 6/7] ${(rVr && rVr.total_cenas) || 0} cenas reais mapeadas 1:1.`, 'ok', item.id_fila);
                  window.registrarPassoProcessoDp({
                    procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                    stepKey: 'p6', stepStatus: 'ok',
                    detalhe: `\`${(rVr && rVr.total_cenas) || item.total_blocos_srt || 0}\` cenas reais mapeadas 1:1 com o SRT`,
                    acao_tecnica: 'midias_reais_prontas', progresso_pct: 86,
                    selecionar: S.filaVinculadaId === item.id_fila,
                  });
                } else {
                  const rS6 = await api('/api/antigravity/skill-cenas-srt', {
                    json: {
                      srt_texto: item.srt_texto,
                      job_id: item.job_id || '',
                      titulo: item.titulo,
                      canal_id: item.canal_id,
                      estilo_visual: item.estilo_visual,
                      epoca_pais: item.epoca_pais,
                      generation_mode: item.generation_mode,
                      aspect_ratio: (item.tag_config && item.tag_config.formato) || '16:9',
                      skill_modo: item.skill_modo || 'skill6',
                      prompts_canal_ids: item.prompts_canal_ids || [],
                      pack_id: item.reutilizar_existentes ? (item.pack_id || '') : '',
                      reutilizar_existentes: Boolean(item.reutilizar_existentes),
                      gerar_imagens_ref: item.gerar_imagens_ref !== false,
                      salvar_novas_no_pack: Boolean(item.salvar_novas_no_pack),
                      tag_config: item.tag_config,
                      edicao_config: item.edicao_config,
                      instrucoes_edicao_custom: (item.edicao_config && item.edicao_config.instrucoes_custom) || '',
                    }
                  });
                  item.pacote_skill6 = rS6;
                  if (rS6.pasta_arquivos_video) item.pasta_arquivos_video = rS6.pasta_arquivos_video;
                  atualizarStepItemFila(item, 'p6', 'ok', `${(rS6 && rS6.total_cenas) || item.total_blocos_srt || 0} prompts Flow gerados 1:1`, 100);
                  addLog(`✓ [Etapa 6/7] ${(rS6 && rS6.total_cenas) || 0} prompts gerados em 02_FLOW_PROMPTS.txt.`, 'ok', item.id_fila);
                  window.registrarPassoProcessoDp({
                    procId: item.id_fila, id: item.id_fila, titulo: item.titulo,
                    stepKey: 'p6', stepStatus: 'ok',
                    detalhe: `\`${(rS6 && rS6.total_cenas) || item.total_blocos_srt || 0}\` prompts gerados em \`02_FLOW_PROMPTS.txt\` + referências \`01_CONSISTENCY_REFERENCES.txt\``,
                    acao_tecnica: 'prompts_flow_prontos',
                    pasta_arquivos_video: item.pasta_arquivos_video || '',
                    progresso_pct: 86,
                    selecionar: S.filaVinculadaId === item.id_fila,
                  });
                }
              } else if (chave === 'p7_projeto_dp') {
                if ($('#fd-dp-chat-input')) $('#fd-dp-chat-input').blur();
                S.dpMonitorMinimizado = true;
                if (typeof window.renderizarMonitorProcessoDpUI === 'function') window.renderizarMonitorProcessoDpUI();
                atualizarItem('p7', 88, `Etapa 7/7 (DarkPlanner Desktop): Abrindo Dark Planner.exe e enviando pacote…`, {acao_tecnica: 'conectar_darkplanner', abrirJanela: false});
                const r7 = await api('/api/darkplanner/criar-projeto-studio', {
                  json: {
                    titulo: item.titulo,
                    canal_id: item.canal_id,
                    vid: item.video_id || '',
                    roteiro: item.roteiro,
                    srt_texto: item.srt_texto,
                    job_id: item.job_id || '',
                    skill_modo: item.skill_modo,
                    skill6_slug: (item.pacote_skill6 || {}).slug || '',
                    pacote_skill6: item.pacote_skill6 || {},
                    midias_reais: resumirMidiasReaisParaEnvio(item.midias_reais),
                    edicao_config: item.edicao_config,
                    instrucoes_edicao_custom: (item.edicao_config && item.edicao_config.instrucoes_custom) || '',
                    abrir_exe: true,
                    abrir_chat: true,
                    auto_enviar_chat: true,
                    enviar_jobs_direto: false,
                    apenas_pelo_chat: true,
                    chat_modelo_opcao: item.chat_modelo_opcao || 'flash_high',
                  }
                });
                S._ultimoEnvioFilaChatDpTs = Date.now();
                item.resultado_passo7 = r7;
                item.sp_id = r7.sp_id || r7.projeto_id || item.sp_id || '';
                item.pasta_arquivos_video = r7.pasta_arquivos_video || item.pasta_arquivos_video || '';
                item.mensagem_chat_dp = r7.mensagem_chat || '';

                // Monitora a execução no DarkPlanner Desktop e só conclui quando tudo estiver pronto lá!
                const spIdMon = r7.sp_id || r7.projeto_id || '';
                const cpIdMon = r7.creator_project_id || '';
                let ultimoSt7 = r7.status_etapa7 || null;
                const tIniMon = Date.now();
                while ((Date.now() - tIniMon) < 3600000) {
                  await new Promise(r => setTimeout(r, 2500));
                  let st7 = null;
                  try {
                    st7 = await api(`/api/darkplanner/status-etapa7?sp_id=${encodeURIComponent(spIdMon)}&creator_project_id=${encodeURIComponent(cpIdMon)}&nome_projeto=${encodeURIComponent(item.titulo)}`);
                  } catch (_eSt7) {}
                  if (!st7) continue;
                  ultimoSt7 = st7;
                  const pctDp = Math.max(89, Math.min(99, Math.round(88 + ((Number(st7.progresso_pct || 20) / 100) * 11))));
                  const txtDp = st7.etapa_atual || 'Produzindo diretamente no Chat do DarkPlanner Desktop…';
                  atualizarItem('p7', pctDp, `⏳ Etapa 7/7 (DarkPlanner): ${txtDp}`, {
                    acao_tecnica: st7.acao_tecnica || 'listar_jobs',
                    cenas_prontas: st7.cenas_prontas || 0,
                    total_cenas: st7.total_cenas || r7.cenas_total || 0,
                    jobs_rodando: st7.jobs_rodando || 0,
                    jobs_erros: st7.jobs_erros || 0,
                    historico_acoes: st7.historico_acoes || [],
                    conversa_id: r7.conversa_id || '',
                  });
                  if (st7.concluido_dp || st7.em_andamento === false) {
                    break;
                  }
                }
                if (!ultimoSt7 || !ultimoSt7.concluido_dp) {
                  throw new Error((ultimoSt7 && (ultimoSt7.erro || ultimoSt7.etapa_atual)) || 'DarkPlanner Desktop ainda não concluiu a Etapa 7.');
                }
                atualizarStepItemFila(item, 'p7', 'ok', ultimoSt7.etapa_atual || 'Projeto 100% concluído no DarkPlanner Desktop!', 100);
              }
            }

            item.retomar_de_onde_parou = false;
            item.status = 'concluido';
            item.progresso_pct = 100;
            item.finalizado_em = Date.now();
            item.live_steps.forEach(s => { if (s.status === 'rodando') { s.status = 'ok'; s.pct = 100; } });
            const segTotal = Math.max(1, Math.round((item.finalizado_em - item.iniciado_em) / 1000));
            item.etapa_atual = `✅ 100% Concluído em ${fmtT(segTotal)}!`;
            window.registrarPassoProcessoDp({
              procId: item.id_fila,
              id: item.id_fila,
              titulo: item.titulo,
              sp_id: item.sp_id || '',
              canal_nome: item.canal_nome,
              chat_modelo_opcao: item.chat_modelo_opcao,
              stepKey: 'p7',
              stepStatus: 'ok',
              detalhe: item.etapa_atual,
              acao_tecnica: 'concluido',
              pasta_arquivos_video: item.pasta_arquivos_video || '',
              progresso_pct: 100,
              concluirProjeto: true,
              selecionar: S.filaVinculadaId === item.id_fila,
            });
            addLog(`✅ [Fila #${item.numero}] Vídeo "${item.titulo}" 100% concluído em ${fmtT(segTotal)}!`, 'ok', item.id_fila);
            window.renderizarFilaProducaoUI();
            toast(`✅ [Fila #${item.numero}] "${item.titulo}" 100% concluído!`);
          } catch (errItem) {
            item.status = 'erro';
            item.erro_msg = errItem.message || String(errItem);
            const numEtFalha = obterNumeroEtapaItemFila(item);
            item.etapa_atual = `⚠️ Parou na Etapa ${numEtFalha}/7: ${item.erro_msg} (clique em ▶️ Continuar Etapa ou corrija na mesma conversa do Chat)`;
            atualizarStepItemFila(item, stepEmExecucao || 'p7', 'erro', item.erro_msg, item.progresso_pct || 50);
            window.registrarPassoProcessoDp({
              procId: item.id_fila,
              id: item.id_fila,
              titulo: item.titulo,
              sp_id: item.sp_id || '',
              stepKey: stepEmExecucao || 'p7',
              stepStatus: 'erro',
              detalhe: item.etapa_atual,
              acao_tecnica: 'erro_fila',
              selecionar: S.filaVinculadaId === item.id_fila,
            });
            addLog(`✕ [Etapa ${numEtFalha}/7] Erro: ${item.erro_msg}`, 'erro', item.id_fila);
            window.renderizarFilaProducaoUI();
            toast(`⚠️ Vídeo #${item.numero} pausou na Etapa ${numEtFalha}/7: ${item.erro_msg}`);
          }
        }
      } finally {
        S._processandoFilaAgora = false;
      }
    };

    // Renderiza a fila caso já existam itens em andamento ao abrir a aba Estúdio
    window.renderizarFilaProducaoUI();

    const executarEsteiraMarcada = () => safe(async () => {
      const tit = ($('#e-tit')?.value || '').trim();
      const ctx = ($('#e-ctx')?.value || '').trim();
      if (!tit && !ctx) {
        $('#e-tit')?.focus();
        throw new Error('Digite primeiro o Título ou Ideia do vídeo lá no topo para iniciar a esteira.');
      }
      const passosMarcados = $$('.e-step-chk').filter(c => c.checked).map(c => c.dataset.stepKey);
      if (!passosMarcados.length) {
        throw new Error('Marque pelo menos 1 passo nas caixas de seleção para executar.');
      }

      const pausar = $('#e-chk-pausar-verificar') ? !!$('#e-chk-pausar-verificar').checked : !!S.estPausarParaVerificar;
      const usarFila = $('#e-chk-usar-fila-auto') ? !!$('#e-chk-usar-fila-auto').checked : (S.estUsarFilaAuto !== false);

      // Se "Seguir passos tudo automático" + "Enviar p/ Fila" estiverem marcados (ou se já houver vídeo rodando), adiciona direto na Fila em 2º plano e libera a tela!
      if ((!pausar && usarFila) || S._processandoFilaAgora) {
        window.adicionarVideoNaFilaProducao();
        return;
      }

      // Se o vídeo anterior estava marcado como Concluído ou o título mudou e estamos iniciando a esteira pelo Passo 1 ou Passo 2, limpa 100% dos resquícios do vídeo anterior!
      const iniciaGeracaoNova = passosMarcados.includes('p1_estruturar') || passosMarcados.includes('p2_roteiro');
      if (iniciaGeracaoNova && (S.estConcluido || (tit && S.estUltimoTituloV8 && tit.toLowerCase() !== S.estUltimoTituloV8.toLowerCase()))) {
        limparArtefatosVideoAnterior(true);
      }

      const btn = $('#e-btn-rodar-esteira');
      const tOrig = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Executando Passos Marcados…';
      }
      if ($('#e-v8-confirm-continue-box')) $('#e-v8-confirm-continue-box').style.display = 'none';

      const NOMES_PASSOS = {
        p1_estruturar: 'Passo 1 (Estruturar Blocos)',
        p2_roteiro: 'Passo 2 (Escrever Roteiro Completo)',
        p4_pacote_viral: 'Passo 3 (Descrição + Tags + Thumbnail Direto no DarkPlanner)',
        p5_audio_srt: 'Passo 4 (Áudio MP3 + SRT Tempo VEO)',
        p6_cenas: 'Passo 5 (Prompts Flow / Referências / Cenas do Canal)',
        p7_projeto_dp: 'Passo 6 (Criar e Abrir Projeto no DarkPlanner Desktop)',
      };

      try {
        S._automacaoParadaPeloUsuario = false;
        S.estRodandoEsteira = true;
        const temErroStep = idAlvo => Array.isArray(S.estLiveSteps) && S.estLiveSteps.some(x => x && x.id === idAlvo && x.status === 'erro');
        for (let i = 0; i < passosMarcados.length; i++) {
          if (S._automacaoParadaPeloUsuario) {
            addLog('⏹️ Esteira interrompida imediatamente a seu pedido no Chat da Fábrica Dark.', 'info');
            break;
          }
          const chave = passosMarcados[i];
          const proxChave = passosMarcados[i + 1] || '';
          const pausarPasso = $('#e-chk-pausar-verificar') ? !!$('#e-chk-pausar-verificar').checked : !!S.estPausarParaVerificar;

          if (chave === 'p1_estruturar') {
            limparEstruturaAprovadaCtx();
            await rodarV8('estruturar');
            if (S._automacaoParadaPeloUsuario || temErroStep('p1')) {
              addLog('⛔ Esteira interrompida porque o Passo 1 (Estruturar Roteiro) parou ou retornou erro.', 'erro');
              break;
            }
          } else if (chave === 'p2_roteiro') {
            const estAtual = (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '').trim();
            if (estAtual && $('#e-v8-modo')?.value === 'estruturar' && $('#e-ctx')) {
              limparEstruturaAprovadaCtx();
              $('#e-ctx').value = ($('#e-ctx').value + '\n\nESTRUTURA APROVADA:\n' + estAtual).trim();
            }
            await rodarV8('roteiro_completo');
            if (S._automacaoParadaPeloUsuario || temErroStep('p2') || !($('#e-rot')?.value || S.estRoteiro || '').trim()) {
              addLog('⛔ Esteira interrompida porque o Passo 2 (Roteiro Completo) não foi concluído.', 'erro');
              break;
            }
          } else if (chave === 'p4_pacote_viral') {
            await window.gerarPacoteViralSobDemanda();
            if (S._automacaoParadaPeloUsuario || temErroStep('p3_viral')) break;
          } else if (chave === 'p5_audio_srt') {
            S.estStep45Aberto = true;
            atualizarVisibilidadeEtapas();
            await gerarAudioESrtAutomaticoNoBackend();
            if (S._automacaoParadaPeloUsuario || temErroStep('p4') || temErroStep('p5')) break;
          } else if (chave === 'p6_cenas') {
            S.estStep6Aberto = true;
            atualizarVisibilidadeEtapas();
            const cidAt = String($('#e-canal')?.value || S.estCanal || '').toLowerCase();
            const nmAt = String(chObj.nome || '').toLowerCase();
            if (nmAt.includes('stormscope') || cidAt === '17681e73-1ab9-412e-93e5-ca12739ece16' || sugestaoCanal.modo === 'video_real') {
              S.estSkillModo = 'video_real';
            } else if (!S.estSkillModo) {
              S.estSkillModo = sugestaoCanal.modo || 'skill6_cenas_flow';
            }
            if (S.estSkillModo === 'video_real') {
              await executarBuscaVideosReaisStep6();
            } else {
              if ($('#e-run-skill6')) await $('#e-run-skill6').onclick();
            }
            if (S._automacaoParadaPeloUsuario || temErroStep('p6')) break;
          } else if (chave === 'p7_projeto_dp') {
            if (S._automacaoParadaPeloUsuario) break;
            S.estStep7Aberto = true;
            atualizarVisibilidadeEtapas();
            await executarPasso7(false);
          }

          if (S._automacaoParadaPeloUsuario) break;

          // Se houver próximo passo marcado e a opção "Quero verificar cada passo" estiver marcada, pergunta: "Deseja que eu continue?"
          if (proxChave && pausarPasso) {
            const respUsuario = await aguardarConfirmacaoContinuar(
              `✅ ${NOMES_PASSOS[chave]} concluído! Deseja que eu continue para ${NOMES_PASSOS[proxChave]}?`,
              `Confira o resultado gerado abaixo. Clique em "✅ Sim, Continuar" para eu executar ${NOMES_PASSOS[proxChave]} agora, ou peça algum ajuste.`
            );
            if (respUsuario !== 'yes') {
              addLog(`⏸ Esteira pausada após ${NOMES_PASSOS[chave]} a seu pedido para revisão/ajuste.`, 'info');
              toast('⏸ Esteira pausada para sua revisão. Quando quiser, clique novamente em Executar Passos Marcados!');
              break;
            }
          }
        }
      } finally {
        S.estRodandoEsteira = false;
        if (btn) {
          btn.disabled = false;
          btn.textContent = tOrig || '🚀 Executar Passos Marcados';
        }
      }
    });

    window.estRodarV8 = rodarV8;
    window.estExecutarEsteira = executarEsteiraMarcada;
    window.estGerarAudioSrt = gerarAudioESrtAutomaticoNoBackend;
    window.estExecutarStep6 = async () => {
      S.estStep6Aberto = true;
      atualizarVisibilidadeEtapas();
      if (S.estSkillModo === 'video_real') {
        await executarBuscaVideosReaisStep6();
      } else if ($('#e-run-skill6')) {
        await $('#e-run-skill6').onclick();
      }
    };

    if ($('#e-btn-add-fila-novo')) $('#e-btn-add-fila-novo').onclick = () => window.adicionarVideoNaFilaProducao();
    if ($('#e-btn-rodar-esteira')) $('#e-btn-rodar-esteira').onclick = () => executarEsteiraMarcada();
    if ($('#e-v8-btn')) $('#e-v8-btn').onclick = () => rodarV8();
    if ($('#e-v8-viral-btn')) $('#e-v8-viral-btn').onclick = () => window.gerarPacoteViralSobDemanda();
    if ($('#e-v8-escrever')) $('#e-v8-escrever').onclick = () => {
      const estAtual = (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '').trim();
      if (estAtual && $('#e-ctx')) {
        limparEstruturaAprovadaCtx();
        $('#e-ctx').value = ($('#e-ctx').value + '\n\nESTRUTURA APROVADA:\n' + estAtual).trim();
      }
      rodarV8('roteiro_completo');
    };
    if ($('#e-v8-usar')) $('#e-v8-usar').onclick = () => {
      const txt = (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '').trim();
      if (!txt) return;
      if ($('#e-v8-modo').value === 'roteiro_completo') {
        const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro(txt) : txt;
        $('#e-rot').value = limpo; S.estRoteiro = limpo; $('#e-rot').dispatchEvent(new Event('input'));
        toast('Apenas o roteiro limpo foi colado no campo Roteiro!');
      } else {
        $('#e-ctx').value = ($('#e-ctx').value + '\n\n' + txt).trim();
        toast('Estrutura/análise limpa adicionada ao Contexto do vídeo!');
      }
    };
    if ($('#e-v8-audiogen')) $('#e-v8-audiogen').onclick = () => {
      const txt = (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '').trim();
      if (txt && $('#e-v8-modo')?.value === 'roteiro_completo' && $('#e-rot')) {
        const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro(txt) : txt;
        if (limpo) { $('#e-rot').value = limpo; S.estRoteiro = limpo; $('#e-rot').dispatchEvent(new Event('input')); }
      }
      if ($('#e-open-dp-audiogen')) $('#e-open-dp-audiogen').click();
    };
    if ($('#e-v8-dp')) $('#e-v8-dp').onclick = () => safe(async () => {
      const txt = $('#e-rot').value.trim() || (S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '').trim();
      const r = await api('/api/darkplanner/acao', {json: {acao: 'enviar_roteiro', titulo: $('#e-tit').value || 'roteiro_v8', texto: txt}});
      toast(r.msg);
    });
    if ($('#e-v8-copy')) $('#e-v8-copy').onclick = () => copiar(S.estUltimaRespostaV8Limpa || $('#e-v8-txt')?.textContent || '');

    // ---- Passo 6: Pacotes de Imagens de Referência do Canal (Foto 4) + Guia de Tags ----
    const atuPreviewGuiaTags = () => {
      const onde = $('#e-tag-onde')?.value || 'flow';
      if (ehCanal100Img && $('#e-tag-tipo')) $('#e-tag-tipo').value = 'i';
      const tipo = ehCanal100Img ? 'i' : ($('#e-tag-tipo')?.value || 'v');
      const fmt = $('#e-tag-fmt')?.value || '16:9';
      const mod = $('#e-tag-modelo')?.value || '';
      const pref = `[${onde}][${tipo}][${fmt}]${mod ? `[${mod}]` : ''}`;
      if ($('#e-s6-tag-preview')) $('#e-s6-tag-preview').textContent = pref;
      return {onde_gerar: onde, tipo, formato: fmt, modelo: mod};
    };
    ['#e-tag-onde', '#e-tag-tipo', '#e-tag-fmt', '#e-tag-modelo'].forEach(sel => {
      if ($(sel)) $(sel).onchange = atuPreviewGuiaTags;
    });
    if ($('#e-s6-mode')) {
      $('#e-s6-mode').onchange = () => {
        const m = ehCanal100Img ? 'STILL_IMAGE' : $('#e-s6-mode').value;
        if ($('#e-tag-tipo')) {
          if (m === 'STILL_IMAGE' || ehCanal100Img) $('#e-tag-tipo').value = 'i';
          else if (m === 'IV') $('#e-tag-tipo').value = 'iv';
          else $('#e-tag-tipo').value = 'v';
          atuPreviewGuiaTags();
        }
      };
    }

    const renderizarEstadoReferenciasStep6 = (pkCanal, refsAtuais = null) => {
      const reutilizar = Boolean($('#e-s6-reutilizar-existentes')?.checked);
      const bdg = $('#e-s6-pack-badge');
      const thEl = $('#e-s6-pack-thumbs');
      const pkRow = $('#e-s6-pack-select-row');
      if (pkRow) pkRow.style.display = reutilizar ? '' : 'none';
      const refsGeradas = refsAtuais || (S.estSkill6Pacote && S.estSkill6Pacote.references) || [];
      if (refsGeradas.length) {
        if (bdg) {
          bdg.className = 'pill ok';
          bdg.textContent = `✓ ${refsGeradas.length} Imagens de Referência deste Vídeo Prontas ([01]..[${String(refsGeradas.length).padStart(2, '0')}])`;
        }
        if (thEl) {
          thEl.innerHTML = refsGeradas.map(rf => `<div style="min-width:118px;max-width:118px;background:#0d0f17;border:1px solid ${rf.source_mode === 'EXISTING_REUSED' ? '#10b981' : '#38bdf8'};border-radius:8px;padding:4px;text-align:center">
            <img src="${esc(rf.preview_url)}?t=${Date.now()}" style="width:100%;height:62px;object-fit:cover;border-radius:5px;background:#000" loading="lazy">
            <div class="small" style="font-weight:700;color:#e9d5ff;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(rf.tag)} <code>${esc(rf.canonical_name || rf.name || '')}</code></div>
            <div class="small" style="font-size:9.5px;color:${rf.source_mode === 'EXISTING_REUSED' ? '#6ee7b7' : '#7dd3fc'}">${rf.source_mode === 'EXISTING_REUSED' ? 'REUTILIZADA' : 'NOVA DO VÍDEO'}</div>
          </div>`).join('');
        }
        return;
      }
      if (!reutilizar) {
        if (bdg) {
          bdg.className = 'pill ok';
          bdg.textContent = '✨ Modo 100% Novas Referências Ativo (Não reutiliza imagens antigas)';
        }
        if (thEl) {
          thEl.innerHTML = `<div class="small" style="padding:8px 10px;border-radius:8px;border:1px dashed #38bdf8;background:rgba(2,132,199,.1);color:#bae6fd;width:100%">
            ✨ <b>Sempre Novas Imagens de Referência:</b> Ao clicar em <b>Executar Passo 6</b> abaixo, o sistema criará do zero os personagens e cenários <code>[01]..[N]</code> exclusivos para a história deste vídeo obedecendo à Skill anexada e ao <b>Estilo Visual do Canal</b> (sem repetir imagens antigas). Se precisar reutilizar imagens já existentes do pacote${pkCanal ? ` "${esc(pkCanal.name)}" (${(pkCanal.items || []).length} imagens)` : ''}, marque a opção <b>"🔄 Se precisar: Reutilizar imagens já existentes"</b> acima.
          </div>`;
        }
      } else {
        const items = (pkCanal && pkCanal.items) || [];
        if (bdg) {
          if (items.length) {
            bdg.className = 'pill warn';
            bdg.textContent = `🔄 Reutilizando Pacote "${pkCanal.name}" (${items.length} imagens base [01]..[${String(items.length).padStart(2, '0')}])`;
          } else {
            bdg.className = 'pill warn';
            bdg.textContent = 'Canal sem pacote prévio — as imagens de referência [01]..[N] serão geradas agora!';
          }
        }
        if (thEl) {
          thEl.innerHTML = items.length ? items.map(it => `<div style="min-width:110px;max-width:110px;background:#0d0f17;border:1px solid #a855f7;border-radius:8px;padding:4px;text-align:center">
            <img src="${esc(it.preview_url)}" style="width:100%;height:60px;object-fit:cover;border-radius:5px;background:#000" loading="lazy">
            <div class="small" style="font-weight:700;color:#e9d5ff;margin-top:3px">${esc(it.tag)} <code>${esc(it.name)}</code></div>
            <div class="small mut" style="font-size:9.5px">EXISTING_REUSED</div>
          </div>`).join('') : `<div class="small mut">Nenhuma imagem base pré-cadastrada neste pacote — o sistema criará novas referências <code>[01]..[N]</code>!</div>`;
        }
      }
    };

    let ultimoPkCanalCarregado = null;
    const carregarPacotesIngredientesCanal = async (packForcado = '') => {
      try {
        const cid = $('#e-canal')?.value || '';
        const r = await api(`/api/darkplanner/ingredientes-canal?canal_id=${encodeURIComponent(cid)}&pack_id=${encodeURIComponent(packForcado)}`);
        const sel = $('#e-s6-pack-id');
        const pkCanal = r.pack_canal;
        ultimoPkCanalCarregado = pkCanal;
        const packs = r.packs || [];
        if (r.style_dna_canal && $('#e-s6-style')) {
          const valAtualSt = ($('#e-s6-style').value || '').trim();
          if (!valAtualSt || valAtualSt.startsWith('Cinematic photorealistic documentary 8k') || !S.estS6Style) {
            $('#e-s6-style').value = r.style_dna_canal;
          }
        }
        if (sel) {
          const valAtual = packForcado || (pkCanal ? String(pkCanal.id) : '');
          sel.innerHTML = `<option value="">✨ Detectar Automaticamente pelo Canal</option>` +
            packs.map(p => `<option value="${esc(String(p.id))}" ${String(p.id) === valAtual ? 'selected' : ''}>📦 ${esc(p.name)} · ${p.total_items || 0} imagens (${(p.items || []).slice(0, 6).map(x => x.name).join(', ')})</option>`).join('');
        }
        renderizarEstadoReferenciasStep6(pkCanal);
      } catch (e) {}
    };
    carregarPacotesIngredientesCanal();
    if ($('#e-s6-pack-id')) $('#e-s6-pack-id').onchange = e => carregarPacotesIngredientesCanal(e.target.value);
    if ($('#e-s6-refresh-pack')) $('#e-s6-refresh-pack').onclick = () => carregarPacotesIngredientesCanal($('#e-s6-pack-id')?.value || '');
    if ($('#e-s6-reutilizar-existentes')) {
      $('#e-s6-reutilizar-existentes').onchange = () => renderizarEstadoReferenciasStep6(ultimoPkCanalCarregado);
    }
    if ($('#e-s6-style')) {
      $('#e-s6-style').oninput = () => { S.estS6Style = $('#e-s6-style').value; };
    }
    if ($('#e-s6-epoca')) {
      $('#e-s6-epoca').oninput = () => { S.estS6Epoca = $('#e-s6-epoca').value; };
    }

    // ---- Passo 6: Seleção e Marcação Explícita das 6 Skills Oficiais + Vídeo Real ----
    const CORES_BORDA_SKILL = {
      skill1_extrator: ['#f472b6', 'rgba(236,72,153,.15)'],
      skill2_mestre_img: ['#a855f7', 'rgba(168,85,247,.16)'],
      skill3_diretor_iv: ['#f59e0b', 'rgba(245,158,11,.15)'],
      skill4_personagens_srt: ['#2dd4bf', 'rgba(20,184,166,.15)'],
      skill5_personagem_mestre: ['#818cf8', 'rgba(99,102,241,.16)'],
      skill6_cenas_flow: ['#38bdf8', 'rgba(2,132,199,.18)'],
      video_real: ['#10b981', 'rgba(16,185,129,.16)'],
      outra_skill: ['#f59e0b', 'rgba(245,158,11,.15)'],
    };

    const aplicarSelecaoSkill = sk => {
      if (sk === 'skill5_img') sk = 'skill2_mestre_img';
      if (sk === 'skill6') sk = 'skill6_cenas_flow';
      S.estSkillModo = sk;
      const ehReal = sk === 'video_real';
      const ehS6OuImg = SKILLS_IA_SRT.includes(sk);
      $$('#e-skill-cards [data-skill]').forEach(x => {
        const ativo = x.dataset.skill === sk;
        x.classList.toggle('on', ativo);
        const [corB, corBg] = CORES_BORDA_SKILL[x.dataset.skill] || ['#38bdf8', 'rgba(2,132,199,.16)'];
        x.style.borderColor = ativo ? corB : 'var(--line)';
        x.style.background = ativo ? corBg : 'rgba(15,23,42,.5)';
        const chkPill = x.querySelector('[data-skill-chk]');
        if (chkPill) {
          chkPill.className = 'pill ' + (ativo ? 'ok' : '');
          chkPill.textContent = ativo ? '☑️ MARCADA' : '☐ Selecionar';
        }
      });
      if ($('#e-skill-sel-badge')) {
        $('#e-skill-sel-badge').className = 'pill ok';
        $('#e-skill-sel-badge').textContent = `☑️ ${MAPA_NOMES_SKILL[sk] || sk}`;
      }
      if ($('#e-pacote-skill-pill')) {
        $('#e-pacote-skill-pill').className = 'pill ok';
        $('#e-pacote-skill-pill').textContent = `☑️ ${MAPA_NOMES_SKILL[sk] || sk}`;
      }
      if ($('#e-skill-nenhuma-box')) $('#e-skill-nenhuma-box').style.display = 'none';
      if ($('#e-skill6-opts')) $('#e-skill6-opts').style.display = ehS6OuImg ? '' : 'none';
      if ($('#e-skill1-extrator-box')) $('#e-skill1-extrator-box').style.display = sk === 'skill1_extrator' ? '' : 'none';
      if ($('#e-outra-skill-catalogo-box')) $('#e-outra-skill-catalogo-box').style.display = sk === 'outra_skill' ? '' : 'none';
      if ($('#e-vidreal-opts')) $('#e-vidreal-opts').style.display = '';
      if ($('#e-s6-mode')) {
        if (ehCanal100Img || sk === 'skill2_mestre_img' || sk === 'skill1_extrator' || sk === 'skill5_personagem_mestre') {
          $('#e-s6-mode').value = 'STILL_IMAGE';
          if ($('#e-tag-tipo')) $('#e-tag-tipo').value = 'i';
        } else if (ehCanalFlowIv || sk === 'skill3_diretor_iv') {
          $('#e-s6-mode').value = 'IV';
          if ($('#e-tag-tipo')) $('#e-tag-tipo').value = 'iv';
        } else if (sk === 'skill6_cenas_flow' || sk === 'skill4_personagens_srt') {
          $('#e-s6-mode').value = 'DIRETO';
          if ($('#e-tag-tipo')) $('#e-tag-tipo').value = 'v';
        }
        atuPreviewGuiaTags();
      }
      if ($('#e-step7-title')) {
        $('#e-step7-title').textContent = ehReal
          ? '🚀 Passo 7 — Criar e Abrir Projeto AUTOMATICAMENTE no DarkPlanner Studio (Sem Chat Manual)'
          : '🚀 Passo 7 — Criar e Abrir Projeto AUTOMATICAMENTE no App DarkPlanner Desktop (Sem Chat Manual)';
      }
      if ($('#e-step7-pill')) {
        $('#e-step7-pill').textContent = ehReal ? '100% Automático no Studio' : '100% Automático no App Desktop';
      }
      if ($('#e-step7-desc')) {
        $('#e-step7-desc').innerHTML = ehReal
          ? 'Modo <b>Vídeo e Imagens Reais</b> marcado: <b>NÃO cria em Meus Projetos e NÃO pede Enter no Chat</b>. Ao clicar abaixo, o sistema cria, importa as mídias reais, sincroniza narração/SRT, aplica a edição na timeline e <b>já abre o projeto pronto lá no DarkPlanner Studio Desktop</b>!'
          : `Ao clicar abaixo, o sistema cria e abre automaticamente o projeto com o nome do título lá no <b>App DarkPlanner Desktop</b> + <b>DarkPlanner Studio</b> com o áudio <code>.mp3</code>, a legenda <code>.srt</code>, o pacote de personagens/referências e os prompts da <b>${esc(MAPA_NOMES_SKILL[sk] || 'Skill marcada')}</b> (100% automático via API Desktop, sem precisar dar Enter no Chat)!`;
      }
      if ($('#e-run-step7')) {
        $('#e-run-step7').textContent = ehReal
          ? '🚀 7️⃣ Criar e Abrir Projeto Direto no DarkPlanner Studio Agora (100% Automático)'
          : '🚀 7️⃣ Criar e Abrir Projeto Lá no App DarkPlanner Desktop Agora (100% Automático)';
      }
      if ($('#e-run-step7-jobs')) {
        $('#e-run-step7-jobs').style.display = ehReal ? 'none' : '';
      }
      atualizarVisibilidadeEtapas();
      addLog(`✓ [Passo 6] Skill marcada por você: ${MAPA_NOMES_SKILL[sk] || sk}`, 'ok');
    };

    $$('#e-skill-cards [data-skill]').forEach(lbl => lbl.onclick = () => {
      aplicarSelecaoSkill(lbl.dataset.skill);
    });
    if ($('#e-btn-marcar-sugestao')) {
      $('#e-btn-marcar-sugestao').onclick = () => {
        const sug = $('#e-btn-marcar-sugestao').dataset.sugSkill || sugestaoCanal.modo || 'skill6_cenas_flow';
        aplicarSelecaoSkill(sug);
        toast(`Skill recomendada marcada: ${MAPA_NOMES_SKILL[sug] || sug}`);
      };
    }
    if ($('#e-btn-outra-skill-cat')) {
      $('#e-btn-outra-skill-cat').onclick = () => {
        aplicarSelecaoSkill('outra_skill');
        $('#e-s6-catalogo-id')?.focus();
      };
    }
    if ($('#e-s1-extract-btn')) {
      $('#e-s1-extract-btn').onclick = () => safe(async () => {
        const btn = $('#e-s1-extract-btn');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Extraindo pixels e DNA…';
        try {
          const fd = new FormData();
          fd.append('canal_id', $('#e-canal')?.value || '');
          fd.append('nome_estilo', chObj.nome || $('#e-tit')?.value || '');
          fd.append('observacoes', $('#e-s1-obs')?.value || '');
          const files = $('#e-s1-files')?.files || [];
          for (let i = 0; i < files.length; i++) fd.append('imagens', files[i]);
          const resp = await fetch('/api/antigravity/skill1-extrator-estilo', {method: 'POST', body: fd});
          const r = await resp.json();
          if (!resp.ok || r.erro) throw new Error(r.erro || 'Erro ao extrair estilo');
          if (r.style_dna && $('#e-s6-style')) {
            $('#e-s6-style').value = r.style_dna;
            S.estS6Style = r.style_dna;
          }
          const out1 = $('#e-s1-out');
          if (out1) {
            const cores = (r.paleta && r.paleta.dominant_colors) || [];
            out1.style.display = '';
            out1.innerHTML = `<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px">
              <span class="pill ok">✓ ${r.imagens_analisadas || 0} imagens analisadas (Confiança: ${esc(r.confianca)})</span>
              ${cores.map(hx => `<span class="pill" style="background:${esc(hx)};color:#fff;text-shadow:0 1px 2px #000;border-color:rgba(255,255,255,.3)">${esc(hx)}</span>`).join('')}
              <button type="button" class="sm" id="e-s1-copy-v2" style="margin-left:auto">📋 Copiar Arquivo de Estilo v2</button>
            </div>
            <pre class="copybox" style="max-height:170px;font-size:11px;overflow:auto">${esc(r.arquivo_estilo_v2 || '')}</pre>`;
            if ($('#e-s1-copy-v2')) $('#e-s1-copy-v2').onclick = () => copiar(r.arquivo_estilo_v2 || '');
          }
          addLog(`✓ [Skill 1] Paleta Hex (${(r.paleta?.dominant_colors || []).join(', ')}) e STYLE_DNA v2 extraídos e aplicados ao canal!`, 'ok');
          toast('🎨 Estilo Visual v2 + Paleta Pixel-Perfect extraídos e aplicados!');
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
        }
      });
    }
    $$('.e-chk-prompt-canal').forEach(chk => chk.onchange = () => {
      S.estPromptsMarcados = $$('.e-chk-prompt-canal').filter(c => c.checked).map(c => c.value);
      const cardLbl = chk.closest('label.card');
      if (cardLbl) {
        cardLbl.style.borderColor = chk.checked ? '#38bdf8' : 'var(--line)';
        cardLbl.style.background = chk.checked ? 'rgba(14,116,144,.2)' : 'rgba(15,23,42,.4)';
      }
      addLog(`▶ [Passo 6] Prompts do canal marcados para unir: ${S.estPromptsMarcados.length} de ${dpPrompts.length}`, 'info');
    });

    if ($('#e-srt-raw')) {
      $('#e-srt-raw').oninput = () => {
        S.estSrtTexto = $('#e-srt-raw').value;
        const nB = (S.estSrtTexto.match(/-->/g) || []).length;
        if (nB) S.estTotalBlocosSrt = nB;
        if ($('#e-srt-badge')) $('#e-srt-badge').textContent = S.estSrtTexto.trim() ? `✓ SRT pronto (${nB} blocos)` : 'Aguardando SRT';
        if (nB > 0) setStep('p5', 'ok', `SRT informado manualmente (${nB} blocos)`);
      };
    }
    if ($('#e-run-skill6')) {
      $('#e-run-skill6').onclick = () => safe(async () => {
        if (!S.estSkillModo) {
          throw new Error('Marque e escolha primeiro qual Skill deseja utilizar nos cards do Passo 6 acima.');
        }
        const estiloVal = ($('#e-s6-style')?.value || '').trim();
        if (!estiloVal) {
          $('#e-s6-style')?.focus();
          throw new Error('Informe o Estilo Visual Oficial do Canal (STYLE_DNA) no campo "🎨 Estilo Visual Oficial do Canal" acima antes de executar.');
        }
        S.estS6Style = estiloVal;
        let srtVal = ($('#e-srt-raw')?.value || S.estSrtTexto || '').trim();
        if (!srtVal && typeof window.detectarAudioSrtAutomatico === 'function') {
          await window.detectarAudioSrtAutomatico(true);
          srtVal = ($('#e-srt-raw')?.value || S.estSrtTexto || '').trim();
        }
        if (!srtVal && !S.estJobId) {
          throw new Error('Gere/baixe o SRT primeiro no Passo 5 (Editar SRT Tempo VEO) ou cole o conteúdo .srt na caixa do Passo 6.');
        }
        const promptsMarcadosIds = $$('.e-chk-prompt-canal').length
          ? $$('.e-chk-prompt-canal').filter(c => c.checked).map(c => c.value)
          : (S.estPromptsMarcados || []);
        const reutilizarExistentes = $('#e-s6-reutilizar-existentes') ? !!$('#e-s6-reutilizar-existentes').checked : false;
        const tagCfg = atuPreviewGuiaTags();
        const cfgEdS6 = lerEdicaoConfig();
        const btn = $('#e-run-skill6');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = reutilizarExistentes
          ? '⏳ Executando Skill + SRT + Reutilizando/Gerando Referências [01]..[N] + Flow Prompts + Prompt de Edição…'
          : '⏳ Executando Skill + SRT + Gerando NOVAS Imagens de Referência [01]..[N] + Flow Prompts + Prompt de Edição…';
        const tIni = Date.now();
        setStep('p6', 'rodando', `Executando ${MAPA_NOMES_SKILL[S.estSkillModo] || S.estSkillModo}: validando SRT, criando ${reutilizarExistentes ? 'referências' : 'NOVAS imagens de referência'} [01]..[N], mapa_cenas.csv, Flow Prompts e Prompt de Edição…`);
        addLog(`▶ [Passo 6] Iniciando ${MAPA_NOMES_SKILL[S.estSkillModo] || S.estSkillModo} com ${promptsMarcadosIds.length} prompt(s) do canal, Estilo Visual ativo, modo ${reutilizarExistentes ? 'Reutilizar se existir' : '100% Novas Referências'} e tag ${ $('#e-s6-tag-preview')?.textContent || '[flow][v][16:9]' }`, 'info');
        try {
          const r = await api('/api/antigravity/skill-cenas-srt', {
            json: {
              srt_texto: srtVal,
              job_id: S.estJobId || '',
              titulo: $('#e-tit')?.value.trim() || 'Projeto_Skill6',
              canal_id: $('#e-canal')?.value || '',
              estilo_visual: estiloVal,
              epoca_pais: $('#e-s6-epoca')?.value || '',
              generation_mode: $('#e-s6-mode')?.value || (ehCanal100Img ? 'STILL_IMAGE' : (ehCanalFlowIv ? 'IV' : 'DIRETO')),
              aspect_ratio: tagCfg.formato || '16:9',
              skill_modo: S.estSkillModo || 'skill6',
              skill_catalogo_id: $('#e-s6-catalogo-id')?.value || '',
              prompts_canal_ids: promptsMarcadosIds,
              pack_id: reutilizarExistentes ? ($('#e-s6-pack-id')?.value || '') : '',
              reutilizar_existentes: reutilizarExistentes,
              gerar_imagens_ref: $('#e-s6-gen-refs') ? !!$('#e-s6-gen-refs').checked : true,
              salvar_novas_no_pack: $('#e-s6-save-pack') ? !!$('#e-s6-save-pack').checked : false,
              tag_config: tagCfg,
              edicao_config: cfgEdS6,
              instrucoes_edicao_custom: cfgEdS6.instrucoes_custom || '',
            }
          });
          S.estSkill6Pacote = r;
          S.estStep7Aberto = true;
          const arqs = r.arquivos || {};
          const val = r.validacao || {};
          const refsList = r.references || [];
          renderizarEstadoReferenciasStep6(ultimoPkCanalCarregado, refsList);
          const segGasto = Math.max(1, Math.round((Date.now() - tIni) / 1000));
          setStep('p6', 'ok', `${val.total_blocos || 0} blocos SRT == ${val.total_blocos || 0} cenas (1:1) · Salvo em ${r.pasta_arquivos_video || r.pasta || ''}`);
          addLog(`✓ [Passo 6] Concluído (${segGasto}s) — ${val.total_blocos || 0} cenas 1:1 com SRT (${r.tag_prefix || '[flow]'}), Prompt de Edição gerado e tudo salvo em ${r.pasta_arquivos_video || 'D:\\ARQUIVOS DE VIDEOS'}`, 'ok');
          const out = $('#e-step6-out');
          if (out) {
            out.style.display = '';
            out.innerHTML = `<div class="card" style="border:1px solid #38bdf8;background:rgba(2,132,199,.1)">
              <div class="row" style="gap:8px;flex-wrap:wrap"><b class="sp" style="color:#7dd3fc">✅ Pacote Completo (Skill + SRT Único + Referências + Guia de Tags <code>${esc(r.tag_prefix || '')}</code> + Prompt de Edição) Pronto!</b>
                <span class="pill ok">🎯 Sincronia 1:1: ${val.total_blocos || 0} blocos SRT = ${val.total_blocos || 0} cenas Flow</span>
                <span class="pill" style="border-color:#a855f7;color:#e9d5ff">🧩 ${refsList.length} Referências (${val.GENERATED_THIS_RUN_REFERENCES || 0} Novas + ${val.EXISTING_REUSED_REFERENCES || 0} Reutilizadas)</span>
              </div>
              <div class="small" style="margin:6px 0;padding:6px 10px;border-radius:6px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:#a7f3d0">
                📂 <b>Pasta Organizada do Vídeo (Foto 2):</b> <code>${esc(r.pasta_arquivos_video || r.pasta || '')}</code>
                <span class="mut"> · Contém Roteiro TXT, Áudio MP3, 1 Único SRT Tempo (Quebra por Frases), Thumb, Prompt Mestre, Prompt de Edição e ZIP!</span>
              </div>
              <div class="small mut" style="margin:4px 0">Pasta Creator: <code>${esc(r.pasta || '')}</code>${(r.prompts_canal_usados || []).length ? ` · Prompts do canal unidos: <b>${esc(r.prompts_canal_usados.join(' + '))}</b>` : ''}</div>

              <!-- GALERIA DE IMAGENS DE REFERÊNCIA (GENERATED_THIS_RUN + EXISTING_REUSED) -->
              ${refsList.length ? `<div class="card" style="margin:8px 0;padding:10px;border:1px solid #a855f7;background:rgba(15,23,42,.6)">
                <div class="row" style="margin-bottom:6px;flex-wrap:wrap;gap:6px">
                  <b class="small sp" style="color:#e9d5ff">🖼️ Imagens de Referência Prontas para este Vídeo (<code>references/01..${String(refsList.length).padStart(2, '0')}</code> — Fora da Timeline p/ manter 1:1):</b>
                  ${arqs.contact_sheet_all ? `<a class="btn sm" href="${esc(arqs.contact_sheet_all)}" target="_blank">🖼 Abrir ALL_REFERENCES_CONTACT_SHEET.jpg</a>` : ''}
                  ${arqs.reference_registry_csv ? `<a class="btn sm" href="${esc(arqs.reference_registry_csv)}" download>📋 REFERENCE_REGISTRY.csv</a>` : ''}
                  ${arqs.reference_review_csv ? `<a class="btn sm" href="${esc(arqs.reference_review_csv)}" download>✅ 14_REFERENCE_VISUAL_REVIEW.csv</a>` : ''}
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:8px">
                  ${refsList.map(rf => `<div style="background:#0d0f17;border:1px solid ${rf.source_mode === 'EXISTING_REUSED' ? '#10b981' : '#38bdf8'};border-radius:8px;padding:6px">
                    <img src="${esc(rf.preview_url)}?t=${Date.now()}" style="width:100%;height:78px;object-fit:cover;border-radius:5px;background:#000" loading="lazy">
                    <div class="row" style="margin-top:4px;gap:4px">
                      <b class="small" style="color:#fff">${esc(rf.tag)}</b>
                      <span class="pill ${rf.source_mode === 'EXISTING_REUSED' ? '' : 'ok'}" style="font-size:9px;padding:1px 5px">${rf.source_mode === 'EXISTING_REUSED' ? 'REUTILIZADA' : 'NOVA DO VÍDEO'}</span>
                    </div>
                    <div class="small" style="color:#bae6fd;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(rf.canonical_name)}">${esc(rf.canonical_name)}</div>
                    <div class="small mut" style="font-size:10px">${esc(rf.type)}</div>
                  </div>`).join('')}
                </div>
              </div>` : ''}

              <div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0">
                ${arqs.zip ? `<a class="btn pri" href="${esc(arqs.zip)}" download>📦 Baixar Pacote Completo (.ZIP)</a>` : ''}
                ${arqs.prompt_edicao_txt ? `<a class="btn sm" style="border-color:#10b981;color:#6ee7b7;font-weight:700" href="${esc(arqs.prompt_edicao_txt)}" download>🎬 09_PROMPT_EDICAO_STUDIO.txt</a>` : ''}
                ${arqs.prompt_mestre_md ? `<a class="btn sm" style="border-color:#f59e0b;color:#fde68a" href="${esc(arqs.prompt_mestre_md)}" download>📜 08_PROMPT_MESTRE_DO_CANAL.md</a>` : ''}
                ${arqs.pedido_guia_tags_txt ? `<a class="btn sm" style="border-color:#a855f7;color:#e9d5ff" href="${esc(arqs.pedido_guia_tags_txt)}" download>🏷️ 00_PEDIDO_PRONTO_GUIA_DE_TAGS.txt</a>` : ''}
                ${arqs.references_txt ? `<a class="btn sm" href="${esc(arqs.references_txt)}" download>📄 01_CONSISTENCY_REFERENCES.txt</a>` : ''}
                ${arqs.flow_prompts_txt ? `<a class="btn sm" href="${esc(arqs.flow_prompts_txt)}" download>🎬 02_FLOW_PROMPTS.txt</a>` : ''}
                ${arqs.mapa_cenas_csv ? `<a class="btn sm" href="${esc(arqs.mapa_cenas_csv)}" download>📊 mapa_cenas.csv</a>` : ''}
                <button type="button" class="sm pri" id="e-s6-to-step7" style="background:#9333ea;border-color:#c084fc;margin-left:auto">🚀 Criar e Abrir Agora no App DarkPlanner Desktop (Passo 7)</button>
              </div>

              <!-- PROMPT DE EDIÇÃO DO STUDIO (SEMPRE VISÍVEL TAMBÉM NOS VÍDEOS DE PROMPT) -->
              ${r.prompt_edicao_studio ? `<details open style="margin-top:8px;padding:10px;border-radius:8px;border:1px solid #10b981;background:rgba(6,78,59,.25)">
                <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap">
                  <b class="small sp" style="color:#6ee7b7">🎬 Prompt de Edição Completo deste Vídeo (<code>09_PROMPT_EDICAO_STUDIO.txt</code> — O que fazer no DarkPlanner Studio após gerar os prompts)</b>
                  <button type="button" class="sm pri" id="e-copy-s6-edicao" style="background:#059669;border-color:#34d399">📋 Copiar Prompt de Edição</button>
                </summary>
                <pre class="copybox" style="margin-top:8px;max-height:220px;font-size:11px;overflow:auto">${esc(r.prompt_edicao_studio || '')}</pre>
              </details>` : ''}

              <details style="margin-top:8px"><summary class="small" style="cursor:pointer;color:#fde68a">👁 Visualizar / Copiar <code>01_CONSISTENCY_REFERENCES.txt</code> e <code>02_FLOW_PROMPTS.txt</code> (${val.total_blocos || 0} cenas 1:1)</summary>
                <div class="grid g2" style="gap:8px;margin-top:8px">
                  <div><div class="row"><b class="small sp">01_CONSISTENCY_REFERENCES.txt</b><button type="button" class="sm" id="e-copy-s6-ref">Copiar</button></div>
                    <pre class="copybox" style="max-height:220px;font-size:11px;overflow:auto">${esc(r.txt_references || '')}</pre>
                  </div>
                  <div><div class="row"><b class="small sp">02_FLOW_PROMPTS.txt (${val.total_blocos || 0} cenas == ${val.total_blocos || 0} blocos SRT)</b><button type="button" class="sm" id="e-copy-s6-flw">Copiar</button></div>
                    <pre class="copybox" style="max-height:220px;font-size:11px;overflow:auto">${esc(r.txt_flow || '')}</pre>
                  </div>
                </div>
                <div style="margin-top:8px"><div class="row"><b class="small sp">04_RESUMO_VALIDACAO.txt</b></div>
                  <pre class="copybox" style="max-height:160px;font-size:11px;overflow:auto">${esc(r.txt_resumo || '')}</pre>
                </div>
              </details>
            </div>`;
          }
          if ($('#e-copy-s6-edicao')) $('#e-copy-s6-edicao').onclick = (ev) => { ev.stopPropagation(); copiar(r.prompt_edicao_studio || ''); toast('📋 Prompt de Edição copiado!'); };
          if ($('#e-copy-s6-ref')) $('#e-copy-s6-ref').onclick = () => copiar(r.txt_references || '');
          if ($('#e-copy-s6-flw')) $('#e-copy-s6-flw').onclick = () => copiar(r.txt_flow || '');
          if ($('#e-copy-s6-guia')) $('#e-copy-s6-guia').onclick = () => copiar(r.txt_pedido_guia_tags || '');
          if ($('#e-s6-to-step7')) $('#e-s6-to-step7').onclick = () => {
            S.estStep7Aberto = true;
            atualizarVisibilidadeEtapas();
            $('#e-step7-card')?.scrollIntoView({behavior: 'smooth', block: 'center'});
            executarPasso7(false);
          };
          toast(`Passo 6 concluído! Salvo em ${r.pasta_arquivos_video || 'D:\\ARQUIVOS DE VIDEOS'} com Prompt de Edição!`);
        } catch (e) {
          setStep('p6', 'erro', e.message || 'Erro na Skill 6');
          addLog(`✕ [Passo 6] Erro na Skill 6: ${e.message || e}`, 'erro');
          throw e;
        } finally { if (btn) { btn.disabled = false; btn.textContent = t0; } }
      });
    }

    // ---- GERENCIAMENTO DO "TEU ACERVO" (1º DOS 12 BANCOS REAIS) ----
    const carregarTeuAcervoUI = async () => {
      const box = $('#e-acervo-list-box');
      const badge = $('#e-acervo-count-badge');
      if (!box) return;
      try {
        const cid = $('#e-canal')?.value || S.estCanal || '';
        const r = await api(`/api/antigravity/acervo-listar?canal_id=${encodeURIComponent(cid)}`);
        const itens = r.itens || [];
        const totBanco = r.total_banco_local_geral || itens.length;
        if (badge) {
          badge.textContent = `📁 Teu Acervo (${itens.length} anexados · ${totBanco} no Banco Local)`;
        }
        if (!itens.length) {
          box.innerHTML = `<span class="mut">Nenhum arquivo anexado manualmente ainda em <code>D:\\BANCO DE DADOS\\Teu_Acervo</code> (${totBanco} mídias disponíveis em <code>D:\\BANCO DE DADOS</code>). Selecione vídeos ou fotos acima para priorizar nas cenas!</span>`;
          return;
        }
        box.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
          ${itens.slice(0, 24).map(it => `<span class="pill ok" style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px">
            <span>${it.tipo === 'video' ? '🎥' : '📷'} <b>${esc(it.nome)}</b>${it.tags ? ` <small class="mut">[${esc(it.tags)}]</small>` : ''} <small class="mut">(${it.tamanho_kb || 0} KB)</small></span>
            <button type="button" class="sm danger" data-del-acervo="${esc(it.nome)}" style="padding:0 5px;font-size:10px;line-height:1.2" title="Remover do Teu Acervo">×</button>
          </span>`).join('')}
        </div>`;
        $$('[data-del-acervo]', box).forEach(b => b.onclick = () => safe(async () => {
          await api('/api/antigravity/acervo-remover', {json: {nome: b.dataset.delAcervo}});
          toast('🗑️ Arquivo removido do Teu Acervo.');
          carregarTeuAcervoUI();
        }));
      } catch (_e) {
        box.textContent = 'Pasta D:\\BANCO DE DADOS\\Teu_Acervo pronta para receber seus vídeos e fotos.';
      }
    };
    carregarTeuAcervoUI();
    if ($('#e-acervo-refresh-btn')) {
      $('#e-acervo-refresh-btn').onclick = () => carregarTeuAcervoUI();
    }
    if ($('#e-acervo-upload-btn')) {
      $('#e-acervo-upload-btn').onclick = () => safe(async () => {
        const inp = $('#e-acervo-files');
        const files = inp && inp.files ? [...inp.files] : [];
        if (!files.length) throw new Error('Selecione pelo menos 1 vídeo (.mp4, .mov, .webm) ou foto (.jpg, .png, .webp) para anexar ao Teu Acervo.');
        const btn = $('#e-acervo-upload-btn');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = `⏳ Anexando ${files.length} arquivo(s)…`;
        try {
          const fd = new FormData();
          files.forEach(f => fd.append('arquivos', f));
          fd.append('tags', ($('#e-acervo-tags')?.value || '').trim());
          fd.append('canal_id', $('#e-canal')?.value || S.estCanal || '');
          const r = await api('/api/antigravity/acervo-upload', {method: 'POST', body: fd});
          if (inp) inp.value = '';
          toast(`✅ ${(r.salvos || []).length} arquivo(s) anexado(s) ao Teu Acervo com prioridade #1!`);
          addLog(`✓ [Teu Acervo] ${(r.salvos || []).length} mídia(s) anexada(s) em ${r.pasta || 'D:\\BANCO DE DADOS\\Teu_Acervo'}`, 'ok');
          await carregarTeuAcervoUI();
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
        }
      });
    }

    const executarBuscaVideosReaisStep6 = async () => {
      const srtVal = ($('#e-srt-raw')?.value || S.estSrtTexto || '').trim();
      if (!srtVal && !S.estJobId) {
        throw new Error('Gere/baixe o SRT primeiro no Passo 5 ou cole o conteúdo .srt na caixa do Passo 6.');
      }
      const btn = $('#e-run-vidreal');
      const t0 = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Analisando os 12 Bancos (Teu Acervo, Pexels, Pixabay, YouTube, NASA, Google Earth, Freepik, Coverr, Unsplash, Openverse, Google, Wikipédia)…';
      }
      setStep('p6', 'rodando', 'Analisando os 12 bancos oficiais de imagens e vídeos reais por bloco do SRT…');
      addLog('▶ [Passo 6] Analisando os 12 bancos de mídias reais (Teu Acervo, Pexels, Pixabay, YouTube, NASA, Google Earth, Freepik, Coverr, Unsplash, Openverse, Google, Wikipédia)…', 'info');
      try {
        const r = await api('/api/antigravity/buscar-videos-reais-srt', {
          json: {
            srt_texto: srtVal,
            job_id: S.estJobId || '',
            titulo: $('#e-tit')?.value.trim() || '',
            canal_id: $('#e-canal')?.value || '',
            canal_nome: chObj ? (chObj.nome || '') : '',
          }
        });
        S.estMidiasReais = r;
        if (r && r.srt_texto && !S.estSrtTexto) {
          S.estSrtTexto = r.srt_texto;
          if ($('#e-srt-raw')) $('#e-srt-raw').value = r.srt_texto;
        }
        S.estStep7Aberto = true;
        const cenas = r.cenas || [];
        const qtdVid = r.videos_reais_selecionados ?? cenas.length;
        const bancos12 = r.bancos_12_analise || [];
        setStep('p6', 'ok', `${cenas.length} blocos SRT mapeados nos 12 bancos (${qtdVid} vídeos .mp4 reais · 0% repetição)`);
        addLog(`✓ [Passo 6] 12/12 bancos reais analisados para ${cenas.length} blocos do SRT (${qtdVid} vídeos .mp4 · Pool de ${r.pool_videos_disponiveis || cenas.length} mídias únicas sem repetição)`, 'ok');
        const out = $('#e-step6-out');
        if (out) {
          out.style.display = '';
          out.innerHTML = `<div class="card" style="border:1px solid #10b981;background:rgba(16,185,129,.08)">
            <div class="row" style="gap:8px;flex-wrap:wrap">
              <b class="sp" style="color:#6ee7b7">🌍 Análise dos 12 Bancos de Imagens & Vídeos Reais Concluída (${cenas.length} blocos SRT · Salvas em D:\\BANCO DE DADOS)</b>
              <span class="pill ok">✅ 12/12 Bancos Verificados</span>
              <span class="pill ok">🎥 ${qtdVid}/${cenas.length} Vídeos .MP4 Únicos</span>
              <span class="pill ok">📁 Teu Acervo (${r.midias_teu_acervo_disponiveis || 0}) + Banco Local (${r.midias_banco_local_disponiveis || 0})</span>
              <button type="button" class="sm pri" id="e-vr-to-step7" style="background:#059669;border-color:#10b981">🚀 Criar e Abrir Agora no DarkPlanner Studio (Passo 7)</button>
            </div>
            ${bancos12.length ? `<div class="grid g4" style="gap:6px;margin-top:8px">
              ${bancos12.map((b, bi) => `<div class="row small" style="padding:5px 8px;border-radius:6px;background:#0c1016;border:1px solid var(--line);gap:6px">
                <span class="pill ok" style="font-size:10px">#${bi + 1}</span>
                <b class="sp" style="color:#e6edf3;font-size:11.5px">${esc(b.nome)}</b>
                <span class="pill ${b.resultados_encontrados > 0 ? 'ok' : ''}" style="font-size:10px">${b.resultados_encontrados || 0} achados</span>
              </div>`).join('')}
            </div>` : ''}
            <details style="margin-top:8px"><summary class="small" style="cursor:pointer;color:#6ee7b7;font-weight:600">👁 Ver tabela das ${cenas.length} cenas reais + Acesso Direto aos 12 Bancos por Cena</summary>
              <div style="max-height:360px;overflow:auto;margin-top:8px">
                <table class="tbl"><thead><tr><th>Cena</th><th>Tempo</th><th>Narração (SRT)</th><th>Busca Visual (EN)</th><th>Mídias Selecionadas</th><th>Abrir nos 12 Bancos Reais</th></tr></thead>
                <tbody>
                  ${cenas.map(c => {
                    const l12 = c.links_12_bancos || {};
                    return `<tr>
                      <td><b>#${c.scene_index}</b></td>
                      <td class="small mut">${esc(c.start)}<br>${esc(c.end)}</td>
                      <td class="small">${esc(c.texto)}</td>
                      <td class="small"><code>${esc(c.query_en)}</code></td>
                      <td class="small">${(c.resultados || []).length ? c.resultados.slice(0, 4).map(m => `<a href="${esc(m.url || m.pagina || '#')}" target="_blank" class="pill ok" style="display:inline-block;margin:2px">${esc(m.fonte)} (${esc(m.tipo)})</a>`).join(' ') : '<span class="mut">Usar links ao lado ➔</span>'}</td>
                      <td class="small">
                        <div style="display:flex;gap:3px;flex-wrap:wrap;min-width:250px">
                          ${[
                            ['Pexels', l12.pexels || c.pexels_url],
                            ['Pixabay', l12.pixabay],
                            ['YouTube', l12.youtube],
                            ['NASA', l12.nasa],
                            ['Google Earth', l12.google_earth],
                            ['Freepik', l12.freepik],
                            ['Coverr', l12.coverr],
                            ['Unsplash', l12.unsplash],
                            ['Openverse', l12.openverse],
                            ['Google', l12.google],
                            ['Wikipédia', l12.wikipedia],
                          ].filter(([, u]) => u).map(([nm, u]) => `<a class="btn sm" href="${esc(u)}" target="_blank" style="padding:2px 6px;font-size:10px">${esc(nm)}</a>`).join('')}
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody></table>
              </div>
            </details>
          </div>`;
        }
        if ($('#e-vr-to-step7')) $('#e-vr-to-step7').onclick = () => {
          S.estStep7Aberto = true;
          atualizarVisibilidadeEtapas();
          $('#e-step7-card')?.scrollIntoView({behavior: 'smooth', block: 'center'});
          executarPasso7(false);
        };
        toast(`Análise dos 12 bancos concluída para ${cenas.length} blocos do SRT!`);
        return r;
      } catch (e) {
        setStep('p6', 'erro', e.message || 'Erro ao buscar mídias reais nos 12 bancos');
        addLog(`✕ [Passo 6] Erro: ${e.message || e}`, 'erro');
        throw e;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = t0; }
      }
    };

    if ($('#e-run-vidreal')) {
      $('#e-run-vidreal').onclick = () => safe(() => executarBuscaVideosReaisStep6());
    }

    const lerEdicaoConfig = () => {
      const predef = $('#e-ed-predef')?.value || S.estEdPredef || 'sys_tudo';
      const densidade_destaques = $('#e-ed-destaques')?.value || S.estEdDestaques || 'equilibrado';
      const estilo_legenda = $('#e-ed-leg-estilo')?.value || '';
      const look = $('#e-ed-look')?.value || 'original';
      const mostrar_legenda = $('#e-ed-mostrar-leg') ? !!$('#e-ed-mostrar-leg').checked : true;
      const usar_sfx = $('#e-ed-usar-sfx') ? !!$('#e-ed-usar-sfx').checked : true;
      const rawCustom = ($('#e-ed-custom')?.value || S.estEdCustom || '').trim();
      const instrucoes_custom = sanitizarInstrucoesEdicaoPorCanal(rawCustom);
      if ($('#e-ed-custom') && $('#e-ed-custom').value !== instrucoes_custom) {
        $('#e-ed-custom').value = instrucoes_custom;
      }
      S.estEdPredef = predef;
      S.estEdDestaques = densidade_destaques;
      S.estEdMostrarLeg = mostrar_legenda;
      S.estEdUsarSfx = usar_sfx;
      S.estEdCustom = instrucoes_custom;
      return {predef, densidade_destaques, estilo_legenda, look, mostrar_legenda, usar_sfx, instrucoes_custom};
    };

    if ($('#e-aplicar-edicao-agora')) {
      $('#e-aplicar-edicao-agora').onclick = () => safe(async () => {
        const tit = $('#e-tit')?.value.trim();
        if (!tit) throw new Error('Informe o Título do vídeo acima (nome do projeto no Studio) para aplicar a edição ao vivo.');
        const cfg = lerEdicaoConfig();
        const btn = $('#e-aplicar-edicao-agora');
        const t0 = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Aplicando no Studio…';
        addLog(`▶ Aplicando edição no projeto "${tit}" do Studio (Predefinição: ${cfg.predef}, Destaques: ${cfg.densidade_destaques})…`, 'info');
        try {
          const r = await api('/api/darkplanner/aplicar-edicao-studio', {
            json: {titulo: tit, edicao_config: cfg}
          });
          addLog(`✓ Edição aplicada ao vivo no Studio! Templates: ${r.templates_aplicados || 0} · Legendas/Destaques: ${r.legendas_e_destaques || 0}`, 'ok');
          toast(`Edição aplicada no Studio! (${r.templates_aplicados || 0} templates documentais + ${r.legendas_e_destaques || 0} legendas/destaques)`);
        } finally {
          btn.disabled = false;
          btn.textContent = t0;
        }
      });
    }

    if ($('#e-ver-prompt-v8-real')) {
      $('#e-ver-prompt-v8-real').onclick = () => safe(async () => {
        const box = $('#e-prompt-v8-real-box');
        if (!box) return;
        const cid = $('#e-canal')?.value || '';
        const tit = $('#e-tit')?.value.trim() || '';
        const cfg = lerEdicaoConfig();
        const r = await api('/api/antigravity/prompt-video-real-v8', {
          json: {canal_id: cid, titulo: tit, instrucoes_edicao_custom: cfg.instrucoes_custom}
        });
        box.style.display = '';
        box.innerHTML = `<div class="card" style="margin:0;border:1px solid #34d399;background:rgba(6,78,59,.25)">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <b class="sp" style="color:#6ee7b7">📜 Master Video Generator Prompt V8.0 (Padrão Grandes Canais + Suas Regras) — Canal: ${esc(r.canal_nome || '')}</b>
            <button type="button" class="sm pri" id="e-save-prompt-v8-canal" style="background:#059669;border-color:#34d399">💾 Salvar como Prompt Mestre Oficial deste Canal no DarkPlanner</button>
            <button type="button" class="sm" id="e-copy-prompt-v8-real">📋 Copiar Prompt V8.0</button>
          </div>
          <textarea id="e-txt-prompt-v8-real" style="min-height:220px;font-family:monospace;font-size:11.5px;line-height:1.45">${esc(r.prompt || '')}</textarea>
        </div>`;
        if ($('#e-copy-prompt-v8-real')) {
          $('#e-copy-prompt-v8-real').onclick = () => copiar($('#e-txt-prompt-v8-real')?.value || r.prompt || '');
        }
        if ($('#e-save-prompt-v8-canal')) {
          $('#e-save-prompt-v8-canal').onclick = () => safe(async () => {
            if (!cid) throw new Error('Selecione um canal primeiro.');
            const cfgSave = lerEdicaoConfig();
            addLog(`▶ Salvando Master Video Generator Prompt V8.0 (Padrão Grandes Canais + Personalização) no canal "${r.canal_nome}"…`, 'info');
            await api('/api/antigravity/prompt-video-real-v8', {
              json: {canal_id: cid, titulo: tit, instrucoes_edicao_custom: cfgSave.instrucoes_custom, salvar_no_canal: true}
            });
            S.channels = await api('/api/channels');
            addLog(`✓ Master Prompt V8.0 salvo e vinculado ao canal "${r.canal_nome}" no DarkPlanner!`, 'ok');
            toast(`Master Prompt V8.0 salvo no canal ${r.canal_nome}!`);
          });
        }
      });
    }

    // ---- Passo 7: Criar e Abrir Projeto AUTOMATICAMENTE no App DarkPlanner Desktop (Sem Chat Manual)
    if ($('#e-open-dp-only')) {
      $('#e-open-dp-only').onclick = () => safe(async () => {
        addLog('▶ Abrindo e focando aplicativo DarkPlanner Desktop…', 'info');
        const r = await api('/api/darkplanner/acao', {json: {acao: 'abrir_app'}});
        addLog('✓ ' + (r.msg || 'DarkPlanner Desktop aberto'), 'ok');
        toast(r.msg);
      });
    }

    const executarPasso7 = (enviarJobsDireto = false) => safe(async () => {
      if (S._executandoPasso7Agora) {
        toast('⏳ Aguarde: o projeto e o Chat do DarkPlanner já estão sendo abertos com pausa segura para não duplicar nem travar!');
        return;
      }
      const tit = $('#e-tit')?.value.trim();
      if (!tit) throw new Error('Preencha o Título do vídeo acima para criar o projeto com o nome do título no DarkPlanner.');
      S._executandoPasso7Agora = true;
      const srtVal = ($('#e-srt-raw')?.value || S.estSrtTexto || '').trim();
      const rotVal = ($('#e-rot')?.value || S.estRoteiro || '').trim();
      if (!S.estSkillModo) {
        if (S.estSkill6Pacote) {
          S.estSkillModo = sugestaoCanal.modo === 'skill5_img' ? 'skill5_img' : 'skill6';
        } else if (S.estMidiasReais) {
          S.estSkillModo = 'video_real';
        } else {
          S.estSkillModo = sugestaoCanal.modo || 'skill6';
        }
      }
      const skModo = S.estSkillModo;
      const ehReal = skModo === 'video_real';
      const cfgEd = lerEdicaoConfig();
      const btn = enviarJobsDireto ? $('#e-run-step7-jobs') : $('#e-run-step7');
      const t0 = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Enviando Diretamente no Chat do DarkPlanner Desktop…';
      }
      const infoModDp7 = window.obterInfoModeloChatDp(S.estChatDpOpcao || 'flash_high');
      const chatOpcaoDp = infoModDp7.opt;
      const labelModeloDp = infoModDp7.completo;
      // Minimiza o painel de Chat da Fábrica Dark e tira o foco do input ANTES de abrir/focar o DarkPlanner Desktop (`Dark Planner.exe`),
      // impedindo que qualquer janela da Fábrica Dark intercepte o pacote da Etapa 7!
      if ($('#fd-dp-chat-input')) $('#fd-dp-chat-input').blur();
      S.dpMonitorMinimizado = true;
      if (typeof window.renderizarMonitorProcessoDpUI === 'function') window.renderizarMonitorProcessoDpUI();

      setStep('p7', 'rodando', `⏳ Etapa 7: Abrindo DarkPlanner Desktop (Dark Planner.exe) e iniciando produção (${labelModeloDp})…`, 15);
      window.registrarPassoProcessoDp({
        titulo: tit,
        canal_nome: chObj ? (chObj.nome || '') : '',
        duracao_min: Number($('#e-dur')?.value || S.estDur || 20),
        chat_modelo_opcao: chatOpcaoDp,
        stepKey: 'p7',
        stepStatus: 'rodando',
        detalhe: `Enviando pacote para o DarkPlanner Desktop (\`Dark Planner.exe\` · \`${labelModeloDp}\`) e iniciando geração…`,
        acao_tecnica: 'conectar_darkplanner',
        progresso_pct: 86,
        abrirJanela: false,
      });
      addLog(`▶ [Etapa 7 · Direto no Chat] Enviando projeto diretamente no Chat do DarkPlanner Desktop (${labelModeloDp}) e iniciando produção de "${tit}"…`, 'info');
      const montarPromptChatDarkPlannerFallback = (rObj = {}) => {
        const chNome = chObj ? (chObj.nome || '') : '';
        const nBlocos = S.estTotalBlocosSrt || ((srtVal.match(/\n\n/g) || []).length + 1);
        const blocoFinal100Img = ehCanal100Img ? `\n\n==================================================================\n🚨 REGRA OBRIGATÓRIA FINAL DO CANAL (${chNome.toUpperCase()}) — 100% IMAGEM ESTÁTICA ([flow][i][16:9])\n==================================================================\n1. **FORMATO OBRIGATÓRIO 100% IMAGEM (\`[flow][i][16:9]\`):** O canal **${chNome}** é **100% IMAGEM ESTÁTICA (\`100% STILL IMAGES\`)**!\n2. **PROIBIDO GERAR VÍDEO (\`[v]\` ou \`[iv]\`):** É terminantemente proibido gerar cenas em vídeo (\`[v]\` ou \`[iv]\`) para este canal. Todíssimas as cenas (${nBlocos} blocos do SRT = ${nBlocos} imagens 16:9) e todas as referências de consistência (\`[01]..[N]\`) DEVEM ser geradas **100% como IMAGENS (\`[flow][i][16:9]\`, \`type="image"\`)**.\n3. **EDIÇÃO OBRIGATÓRIA NO DARKPLANNER STUDIO (100% IMAGENS COM MOVIMENTO & SINCRONIA 1:1):** Na montagem da timeline no Studio, aguarde todos os prompts serem gerados, anexe o áudio e o SRT único com pausa de 3-4s, garanta que a quantidade de cenas na timeline seja EXATAMENTE igual à quantidade de blocos do SRT (${nBlocos} cenas == ${nBlocos} blocos SRT, sem colocar referências \`[01]..[N]\` na timeline) e aplique **movimento contínuo de câmera (Ken Burns / zoom in / zoom out / pan suave) em 100% das imagens**.` : '';
        const blocoFinalFlowIv = (!ehCanal100Img && ehCanalFlowIv) ? `\n\n==================================================================\n🎬 REGRA OBRIGATÓRIA DO CANAL (${chNome.toUpperCase()}) — IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW ([flow][iv][16:9] / [flow][v][16:9])\n==================================================================\n1. **MODO VISUAL DO CANAL (NÃO É 100% IMAGEM):** O canal **${chNome}** utiliza **IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW (\`[flow][iv][16:9]\` / \`[flow][v][16:9]\`)**!\n2. **AGUARDAR GERAÇÃO -> ANEXAR COM PAUSA -> SINCRONIZAR 1:1 -> EDITAR:** Aguarde 100% dos ${nBlocos} prompts terminarem de ser gerados no Creator. Assim que terminarem, anexe o Áudio MP3 e o SRT único (\`_srtsynctempo.srt\`) com uma pausa de 3 a 4 segundos (time mais lento para dar tempo de processar), envie para o Studio mantendo **EXATAMENTE ${nBlocos} cenas == ${nBlocos} blocos SRT (1:1, excluindo as imagens de referência \`[01]..[N]\` da timeline)** e execute imediatamente o Prompt de Edição abaixo.` : '';

        if (rObj && rObj.mensagem_chat) {
          if (ehCanal100Img && !rObj.mensagem_chat.includes('REGRA OBRIGATÓRIA FINAL DO CANAL')) {
            return rObj.mensagem_chat.trimEnd() + blocoFinal100Img;
          }
          if (!ehCanal100Img && ehCanalFlowIv && !rObj.mensagem_chat.includes('IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW')) {
            return rObj.mensagem_chat.trimEnd() + blocoFinalFlowIv;
          }
          return rObj.mensagem_chat;
        }
        const pVeo = typeof window.obterPayloadVeoFaixas === 'function' ? window.obterPayloadVeoFaixas() : {primeiros_blocos: 60, primeiros_min_s: 2, primeiros_max_s: 4, resto_min_s: 4, resto_max_s: 8};
        const slugAlvo = (S.estSkill6Pacote || {}).slug || tit.toLowerCase().replace(/[^\w\-]+/g, '_').slice(0, 60);
        const pastaPadrao = `C:\\Users\\leona\\Downloads\\DarkPlanner\\creator\\${slugAlvo}`;
        const pastaArqVid = rObj.pasta_arquivos_video || `D:\\ARQUIVOS DE VIDEOS\\${tit}`;
        const jidAudio = S.estJobId || '';
        const listaMidias = ((S.estMidiasReais || {}).cenas || []).map((c, idx) =>
          `  - Cena ${String(idx + 1).padStart(3, '0')} (${c.inicio ?? 0}s - ${c.fim ?? 0}s): ${c.midia?.arquivo_local || c.midia?.titulo || c.termo_busca || c.texto || ''}`
        ).slice(0, 80).join('\n');
        const listaPromptsIa = ((S.estSkill6Pacote || {}).cenas || []).map((c, idx) =>
          `[${String(idx + 1).padStart(3, '0')}] ${c.prompt_flow || c.prompt || c.texto || ''}`
        ).slice(0, 80).join('\n');

        if (ehReal) {
          return `# MONTAGEM E EDIÇÃO IMEDIATA NO DARKPLANNER STUDIO (100% VÍDEOS E FOTOS REAIS) — ${tit}
- **Nome do Projeto no Studio:** \`${tit}\`
- **Canal:** \`${chNome}\`
- **Canais de Referência Oficiais:** \`USA Severe Weather\` (https://www.youtube.com/@USASevereWeather) & \`Weather Field Report\` (https://www.youtube.com/@WeatherFieldReport)
- **Pasta Organizada de Todos os Arquivos do Vídeo:** \`${pastaArqVid}\`
- **Pasta do Projeto no DarkPlanner:** \`${rObj.creator_dir || pastaPadrao}\`
- **Banco de Dados de Mídias Reais:** \`D:\\BANCO DE DADOS\`
- **Job ID do Áudio / SRT Editado:** \`${jidAudio || 'último áudio gerado'}\`
- **Regra do SRT Tempo VEO Aplicada (SOMENTE 1 SRT):** Primeiros ${pVeo.primeiros_blocos} blocos de ${pVeo.primeiros_min_s} a ${pVeo.primeiros_max_s}s + demais blocos de ${pVeo.resto_min_s} a ${pVeo.resto_max_s}s (Quebrado por frases — ${nBlocos} blocos == ${nBlocos} cenas 1:1)
- **Predefinição Documental:** \`${cfgEd.predefinicao || 'pemuip9b05'}\` · **Destaques:** \`${cfgEd.densidade_destaques || 'equilibrado'}\` · **Look:** \`${cfgEd.look || 'original'}\`

## O QUE VOCÊ DEVE FAZER AGORA NO DARKPLANNER STUDIO (EDITAR IMEDIATAMENTE):
1. Como este vídeo é de **Vídeo e Imagens Reais**, **INICIE A EDIÇÃO IMEDIATAMENTE NO DARKPLANNER STUDIO** (projeto **\`${tit}\`**).
2. Ao anexar o áudio MP3 (\`audio.mp3\`) e o SRT Tempo VEO único (\`srtsynctempo_editado.srt\`), aguarde **3 a 4 segundos de pausa** para o Studio processar antes de sincronizar as cenas.
3. Garanta **SINCRONIA 1:1 ESTRITA**: a quantidade de cenas na timeline V1 deve ser **EXATAMENTE IGUAL à quantidade de blocos do SRT (${nBlocos} cenas == ${nBlocos} blocos SRT)**.
4. Na timeline V1, posicione 1:1 os vídeos e fotos reais salvos em \`D:\\BANCO DE DADOS\` e \`midias_reais\` (0 repetição de arquivos, 00:00–03:00 exclusivamente cenas reais de impacto climático/desastres no padrão \`@USASevereWeather\` e \`@WeatherFieldReport\`).
5. Aplique a predefinição \`${cfgEd.predefinicao || 'pemuip9b05'}\`, destaques \`${cfgEd.densidade_destaques || 'equilibrado'}\` e SFX documentais.
${cfgEd.instrucoes_custom ? `\n## PROMPT DE EDIÇÃO DO CANAL (09_PROMPT_EDICAO_STUDIO.txt):\n${cfgEd.instrucoes_custom}\n` : ''}${listaMidias ? `\n## MAPA DAS CENAS REAIS (1:1 COM SRT):\n${listaMidias}` : ''}`;
        }

        const listaTagsRefsAuto = ((S.estSkill6Pacote || {}).referencias || []).map((r, idx) => {
          const numStr = r.ref_num || String(idx + 1).padStart(2, '0');
          if (r.guia_tag_line) return r.guia_tag_line;
          const pref = ['CHARACTER', 'GROUP'].includes(String(r.type || '').toUpperCase()) ? `[personagem:${numStr}]` : `[ingrediente:${numStr}]`;
          return `${pref}[flow][i][16:9] ${(r.image_prompt_en || r.canonical_name || '').trim()}`;
        }).filter(Boolean).join('\n');

        return `# PRODUÇÃO AUTOMÁTICA NO DARKPLANNER DESKTOP${ehCanal100Img ? ' (100% IMAGEM — [flow][i][16:9])' : (ehCanalFlowIv ? ' (IMAGENS E VÍDEOS GERADOS PELO FLOW — [flow][iv][16:9])' : '')} — ${tit}
- **Nome do Projeto (Creator & Studio):** \`${tit}\`${rObj.creator_project_id ? ` (ID pré-criado: \`${rObj.creator_project_id}\`)` : ''}
- **Canal:** \`${chNome}\`${ehCanal100Img ? `\n- **Modo Visual Obrigatório do Canal (\`${chNome}\`):** \`100% IMAGEM ESTÁTICA ([flow][i][16:9] — PROIBIDO GERAR VÍDEO [v] OU [iv])\`` : (ehCanalFlowIv ? `\n- **Modo Visual Obrigatório do Canal (\`${chNome}\`):** \`IMAGENS E VÍDEOS GERADOS PELO GOOGLE FLOW ([flow][iv][16:9] / [flow][v][16:9] — NÃO É 100% IMAGEM)\`` : '')}
- **Pasta Organizada de Todos os Arquivos do Vídeo:** \`${pastaArqVid}\`
- **Pasta Completa do Projeto (\`output_path\`):** \`${rObj.creator_dir || pastaPadrao}\`
- **Lote Unificado Automático (\`[personagem:01]\`/\`[ingrediente:02]\` + ${nBlocos} cenas vinculadas junto do prompt):** \`${rObj.creator_dir || pastaPadrao}\\00_PEDIDO_PRONTO_GUIA_DE_TAGS.txt\`
- **Job ID do Áudio / SRT Editado:** \`${jidAudio || 'último áudio gerado'}\`
- **Regra do SRT Tempo VEO Aplicada (SOMENTE 1 SRT):** Primeiros ${pVeo.primeiros_blocos} blocos de ${pVeo.primeiros_min_s} a ${pVeo.primeiros_max_s}s + demais blocos de ${pVeo.resto_min_s} a ${pVeo.resto_max_s}s (Quebrado por frases — ${nBlocos} blocos == ${nBlocos} cenas 1:1)

## 🚨 REGRA ABSOLUTA DE VINCULAÇÃO 100% AUTOMÁTICA DAS REFERÊNCIAS \`[01]..[N]\` (ZERO ETAPA MANUAL!):
- **PROIBIDO** pedir para o usuário subir imagens manualmente, clicar em \`Ingredientes -> Novo pacote -> Adicionar imagens -> Importar pro projeto\` ou pausar esperando \`"pronto"\`!
- Use o pacote pré-importado no projeto **\`${tit}\`** OU gere e vincule automaticamente as referências \`[01]..[N]\` **junto com os prompts** usando \`00_PEDIDO_PRONTO_GUIA_DE_TAGS.txt\` (\`[personagem:01][flow][i][16:9]\` / \`[ingrediente:02][flow][i][16:9]\` + cenas, igual ao canal \`O Estrategista Oculto\`)!${listaTagsRefsAuto ? `\n\n### TAGS AUTOMÁTICAS DE REFERÊNCIA JUNTO DO PROMPT:\n\`\`\`text\n${listaTagsRefsAuto}\n\`\`\`` : ''}

## O QUE VOCÊ DEVE FAZER AGORA NO DARKPLANNER DESKTOP (EXECUÇÃO 100% AUTOMÁTICA — SEM PAUSAR):
1. **PASSO 1 — VINCULAR REFERÊNCIAS AUTOMATICAMENTE JUNTO DO PROMPT E GERAR AS ${nBlocos} CENAS NO CREATOR:** Use os Ingredientes já pré-importados no projeto ou dispare \`00_PEDIDO_PRONTO_GUIA_DE_TAGS.txt\` (\`[personagem:01]\`/\`[ingrediente:02]\` + \`02_FLOW_PROMPTS.txt\`) e **AGUARDE todas as ${nBlocos} cenas terminarem de ser geradas primeiro!**
2. **PASSO 2 — ANEXAR ÁUDIO E SRT COM PAUSA MAIS LENTA (3 A 4 SEGUNDOS):** Assim que os prompts forem gerados, anexe o áudio MP3 (\`audio.mp3\`) e o **ÚNICO arquivo SRT Tempo VEO** (\`srtsynctempo_editado.srt\` — ${nBlocos} blocos quebrados por frase) aguardando **3 a 4 segundos entre cada ação** para dar tempo de carregar sem travar.
3. **PASSO 3 — SINCRONIA 1:1 OBRIGATÓRIA NO STUDIO (${nBlocos} CENAS == ${nBlocos} BLOCOS SRT):** Ao levar para o DarkPlanner Studio, a **quantidade de cenas na timeline DEVE SER EXATAMENTE A MESMA quantidade de blocos do SRT (${nBlocos} cenas == ${nBlocos} blocos SRT)**. **NÃO coloque os itens de referência (\`[personagem:XX]\`/\`[ingrediente:XX]\`) como cenas na timeline**!
4. **PASSO 4 — EXECUTAR O PROMPT DE EDIÇÃO COMPLETO (\`09_PROMPT_EDICAO_STUDIO.txt\`):** ${ehCanal100Img ? `Gere 100% das ${nBlocos} cenas exclusivamente como **IMAGENS ESTÁTICAS (\`[flow][i][16:9]\`, \`type="image"\`)** e monte a timeline no Studio aplicando movimento contínuo (Ken Burns) em 100% das imagens com a predefinição \`${cfgEd.predefinicao || 'pemuip9b05'}\`.` : `Gere as imagens e vídeos pelo Google Flow (\`[flow][iv][16:9]\` / \`[flow][v][16:9]\`) e, assim que terminarem de gerar, monte e edite automaticamente a timeline no DarkPlanner Studio com a predefinição \`${cfgEd.predefinicao || 'pemuip9b05'}\` seguindo o Prompt de Edição abaixo.`}
${(rObj.prompt_edicao_studio || cfgEd.instrucoes_custom) ? `\n## PROMPT DE EDIÇÃO DO STUDIO (09_PROMPT_EDICAO_STUDIO.txt — EXECUTAR ASSIM QUE TERMINAR DE GERAR):\n${rObj.prompt_edicao_studio || cfgEd.instrucoes_custom}\n` : ''}${listaPromptsIa ? `\n## PROMPTS DAS CENAS (02_FLOW_PROMPTS — EXATAMENTE ${nBlocos} CENAS 1:1 COM SRT):\n${listaPromptsIa}` : ''}${blocoFinal100Img}${blocoFinalFlowIv}`;
      };

      const renderizarBlocoPromptChatDp = (promptTxt, tituloBox = '💬 Prompt Enviado Diretamente no Chat do DarkPlanner Desktop') => `
        <details style="margin-top:10px;padding:10px 12px;border-radius:10px;background:#0d1218;border:1px solid #10b981">
          <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap">
            <b style="color:#6ee7b7;font-size:12.5px">${tituloBox}</b>
            <span class="pill ok" style="font-size:10px">${esc(labelModeloDp)}</span>
          </summary>
          <div style="margin-top:8px">
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <button type="button" class="sm pri" id="e-step7-copy-prompt-dp">📋 Copiar Prompt p/ Chat</button>
              <button type="button" class="sm" id="e-step7-send-prompt-dp" style="border-color:#10b981;color:#6ee7b7;font-weight:700">💬 Enviar Direto no Chat do DarkPlanner Desktop</button>
            </div>
            <textarea id="e-step7-prompt-chat-txt" readonly style="width:100%;min-height:135px;font-size:11.5px;font-family:monospace;background:#0a0d12;color:#e2e8f0;border:1px solid var(--line);border-radius:8px;padding:8px">${esc(promptTxt)}</textarea>
          </div>
        </details>`;

      const bindBotoesPromptChatDp = promptTxt => {
        if ($('#e-step7-copy-prompt-dp')) {
          $('#e-step7-copy-prompt-dp').onclick = () => {
            copiar($('#e-step7-prompt-chat-txt')?.value || promptTxt);
            toast('📋 Prompt copiado!');
          };
        }
        if ($('#e-step7-send-prompt-dp')) {
          $('#e-step7-send-prompt-dp').onclick = () => safe(async () => {
            const btnSend = $('#e-step7-send-prompt-dp');
            const txtOrig = btnSend ? btnSend.textContent : '';
            if (btnSend) {
              btnSend.disabled = true;
              btnSend.textContent = '⏳ Enviando direto no Chat do DarkPlanner…';
            }
            try {
              const pTxt = $('#e-step7-prompt-chat-txt')?.value || promptTxt;
              const res = await api('/api/darkplanner/acao', {
                json: {
                  acao: 'enviar_chat',
                  titulo: tit,
                  mensagem: pTxt,
                  auto_enviar: true,
                  nova_conversa: true,
                  chat_modelo_opcao: chatOpcaoDp,
                  forcar_reenvio: true,
                }
              });
              toast(res.msg || '💬 Enviado diretamente no Chat do DarkPlanner Desktop!');
            } finally {
              if (btnSend) {
                btnSend.disabled = false;
                btnSend.textContent = txtOrig || '💬 Enviar Direto no Chat do DarkPlanner Desktop';
              }
            }
          });
        }
      };

      try {
        const r = await api('/api/darkplanner/criar-projeto-studio', {
          json: {
            titulo: tit,
            canal_id: $('#e-canal')?.value || '',
            vid: S.estVideoId || '',
            roteiro: rotVal,
            srt_texto: srtVal,
            job_id: S.estJobId || '',
            skill_modo: skModo,
            skill6_slug: (S.estSkill6Pacote || {}).slug || '',
            pacote_skill6: S.estSkill6Pacote || {},
            midias_reais: S.estMidiasReais || {},
            edicao_config: cfgEd,
            instrucoes_edicao_custom: cfgEd.instrucoes_custom,
            abrir_exe: true,
            abrir_chat: true,
            auto_enviar_chat: true,
            enviar_jobs_direto: Boolean(enviarJobsDireto),
            apenas_pelo_chat: !enviarJobsDireto,
            chat_modelo_opcao: chatOpcaoDp,
          }
        });
        const liveSt = r.live_studio || {};
        try { carregarStatusApiDesktop(true); } catch (_e) {}
        const verif = r.verificacao_anti_repeticao || liveSt.auditoria_anti_repeticao || {};
        const promptChatFinal = montarPromptChatDarkPlannerFallback(r);
        const promptEdicaoTxt = r.prompt_edicao_studio || (S.estSkill6Pacote || {}).prompt_edicao_studio || cfgEd.instrucoes_custom || '';
        const stInicial7 = r.status_etapa7 || {};
        S.estUltSpId7 = r.sp_id || r.projeto_id || '';
        const convRealAberta = Boolean(r.conversa_criada_real_dp || r.chat_colado);
        const nomeCanalStep7 = chObj ? (chObj.nome || '') : '';
        const ehGtaStep7 = /gta|à la une|a la une/i.test(nomeCanalStep7)
          || String($('#e-canal')?.value || '').toLowerCase() === 'a8068857-d56f-4aba-baf3-ea2b7ebda5bb'
          || /\bgta\b|rockstar/i.test(r.titulo || tit || '');
        window.registrarPassoProcessoDp({
          sp_id: S.estUltSpId7,
          titulo: r.titulo || tit,
          canal_nome: nomeCanalStep7,
          duracao_min: Number($('#e-dur')?.value || S.estDur || 20),
          chat_modelo_opcao: chatOpcaoDp,
          stepKey: 'p7',
          stepStatus: 'rodando',
          detalhe: stInicial7.etapa_atual || `Projeto \`${r.titulo || tit}\` enviado direto no Chat com \`${r.cenas_total || 0}\` cenas 1:1 com o SRT`,
          acao_tecnica: stInicial7.acao_tecnica || 'criar_projeto',
          total_cenas: r.cenas_total || stInicial7.total_cenas || 0,
          cenas_prontas: stInicial7.cenas_prontas || 0,
          jobs_rodando: stInicial7.jobs_rodando || 0,
          jobs_erros: stInicial7.jobs_erros || 0,
          historico_acoes: stInicial7.historico_acoes || [],
          pasta_arquivos_video: r.pasta_arquivos_video || '',
          conversa_id: r.conversa_id || '',
          conversa_criada_real_dp: convRealAberta,
          progresso_pct: 89,
        });
        const step7Details = $('#e-step7-card');
        if (step7Details) step7Details.open = true;
        const out = $('#e-step7-out');
        if (out) {
          out.style.display = '';
          const badgeConvHtml = convRealAberta
            ? `<span id="e-step7-conv-pill" class="pill ok">💬 Enviado Direto no Chat DP (${esc(r.conversa_id || 'Ativo')})</span>`
            : ((r.aguardando_pc || r.vinculado_nuvem)
              ? `<span id="e-step7-conv-pill" class="pill" style="border-color:#38bdf8;color:#7dd3fc">🌐 Será enviado direto no Chat do seu PC (${esc(r.conversa_id || 'Fila')})</span>`
              : `<span id="e-step7-conv-pill" class="pill warn">⚠️ Aguardando foco do Chat no DarkPlanner Desktop</span>
                 <button type="button" class="sm pri" id="e-step7-btn-criar-conv-dp" style="background:#0284c7;border-color:#38bdf8;color:#fff;font-weight:700">💬 Abrir & Enviar Direto no Chat DP</button>`);
          out.innerHTML = `
          <div id="e-step7-min-bar" class="fd-min-bar" style="display:none;margin-bottom:8px">
            <span id="e-step7-min-badge" class="pill warn" style="font-size:10.5px"><span class="dp-cyan-spin" style="width:10px;height:10px;margin-right:4px"></span>EM PRODUÇÃO</span>
            <b style="color:#f8fafc;font-size:12.5px" class="sp" id="e-step7-min-txt">🎬 "${esc(r.titulo || tit)}" (${r.cenas_total || 0} cenas 1:1)</b>
            <button type="button" class="sm" id="e-step7-btn-open-mon-min" style="border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700">💬 Chat ↔ DarkPlanner</button>
            <button type="button" class="sm pri" id="e-step7-btn-exp-card">📂 Abrir e Ver Processo</button>
          </div>
          <div id="e-step7-main-card" class="card" style="border:1.5px solid #f59e0b;background:rgba(245,158,11,.08)">
            <div class="row" style="gap:8px;flex-wrap:wrap">
              <b id="e-step7-bg-title" class="sp" style="color:#fde68a">⏳ Etapa 7 Enviada Diretamente no Chat do DarkPlanner: "${esc(r.titulo || tit)}"…</b>
              <span class="pill" style="background:rgba(16,185,129,.18);color:#6ee7b7;border:1px solid #10b981">💬 Envio Direto no Chat</span>
              ${r.aguardando_pc || r.vinculado_nuvem
                ? `<span class="pill" style="background:rgba(59,130,246,.2);color:#93c5fd;border:1px solid #3b82f6">🌐 Vinculado ao seu PC (Fila Nuvem)</span>`
                : ''}
              <span class="pill ok">🤖 ${esc(infoModDp7.curto)}</span>
              <button type="button" class="sm" id="e-step7-btn-open-mon" style="border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700">💬 Chat ↔ DarkPlanner (Ajustar)</button>
              <button type="button" class="sm" id="e-step7-btn-min-card" style="border-color:#22d3ee;color:#67e8f9;font-weight:700" title="Minimiza todo este projeto gerado para uma linha compacta — clique em Abrir e Ver Processo quando quiser inspecionar!">— Minimizar Projeto</button>
            </div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
              ${badgeConvHtml}
              <span class="pill ok">🎯 Sincronia 1:1 (${r.cenas_total || 0} cenas == ${r.cenas_total || 0} blocos SRT)</span>
              ${r.eh_video_real && verif.verificado_antes_de_montar
                ? `<span class="pill ok">🛡️ ${verif.arquivos_unicos_md5 || r.midias_reais_baixadas || 0} Cortes Únicos</span>`
                : ''}
              ${ehGtaStep7 ? `<span class="pill ok" style="border-color:#10b981;color:#6ee7b7">🎮 Rockstar Official Fair-Use (fr-FR · s/ Copyright)</span>` : ''}
            </div>
            <div style="margin-top:8px;padding:10px 12px;border-radius:8px;background:#0a0e14;border:1px solid rgba(245,158,11,.45)">
              <div class="row" style="justify-content:space-between;margin-bottom:6px;gap:8px;flex-wrap:wrap">
                <span id="e-step7-bg-status" style="font-size:12.5px;color:#fef3c7;font-weight:600">⏳ ${esc(stInicial7.etapa_atual || 'Aguardando 100% das cenas e edição terminarem no DarkPlanner Desktop…')}</span>
                <span id="e-step7-bg-pct" class="pill" style="font-weight:700;color:#fde68a">18%</span>
              </div>
              <div style="width:100%;height:10px;border-radius:999px;background:#1e293b;overflow:hidden">
                <div id="e-step7-bg-bar" style="width:18%;height:100%;background:linear-gradient(90deg,#f59e0b,#10b981);transition:width .4s ease"></div>
              </div>
              <!-- PAINEL DE 3 LINHAS ESTILO CHAT DARKPLANNER AO VIVO -->
              <div id="e-step7-dp-live-inline" style="margin-top:8px;padding:8px 11px;border-radius:8px;background:#14171f;border:1px solid #262a36;display:flex;flex-direction:column;gap:4px;font-size:12px">
                <div style="display:flex;align-items:center;gap:8px;color:#e2e8f0">
                  <span class="dp-cyan-spin" id="e-step7-dp-spin1"></span>
                  <span id="e-step7-dp-r1">${esc(stInicial7.etapa_atual || `0 de ${r.cenas_total || 0} vídeos/cenas prontos`)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;color:#cbd5e1;font-family:monospace">
                  <span class="dp-cyan-spin" id="e-step7-dp-spin2"></span>
                  <code id="e-step7-dp-r2" style="color:#67e8f9">${esc(stInicial7.acao_tecnica || 'criar_projeto')}</code>
                </div>
                <div style="display:flex;align-items:center;gap:8px;color:#94a3b8">
                  <span class="dp-cyan-spin" id="e-step7-dp-spin3"></span>
                  <span id="e-step7-dp-r3">trabalhando... 1s</span>
                </div>
              </div>
              <div class="row" style="margin-top:6px;justify-content:space-between;flex-wrap:wrap;gap:8px">
                <span class="small mut">💡 Só marca como Concluído quando <b>100% das cenas e edição</b> terminarem no DarkPlanner! Use <b>💬 Chat ↔ DarkPlanner</b> para mudar estilos, funções ou corrigir erros.</span>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button type="button" class="sm" id="e-step7-pause-dp" style="border-color:#f59e0b;color:#fde68a;font-weight:700">⏸ Pausar Conversa / Processo</button>
                  <button type="button" class="sm" id="e-step7-force-complete-dp" style="border-color:#10b981;color:#6ee7b7">✅ Liberar / Marcar Etapa 7 Concluída Agora</button>
                </div>
              </div>
            </div>
            <div class="small" style="margin-top:8px;padding:6px 10px;border-radius:6px;background:rgba(6,78,59,.35);border:1px solid rgba(16,185,129,.45);color:#a7f3d0">
              📂 <b>Pasta Organizada do Vídeo:</b> <code>${esc(r.pasta_arquivos_video || `D:\\ARQUIVOS DE VIDEOS\\${tit}`)}</code>
              <div class="mut" style="margin-top:2px">Salvos: Roteiro TXT · Áudio MP3 · <b>1 Único SRT Tempo (Quebra por Frases)</b> · Thumbnail PNG · Prompt Mestre · <b>Prompt de Edição (09_PROMPT_EDICAO_STUDIO.txt)</b></div>
            </div>
            <div class="small" style="margin-top:6px">📂 Pasta no DarkPlanner: <code>${esc(r.creator_dir || '')}</code>${r.eh_video_real ? ` · 💾 Banco de Dados: <code>D:\\BANCO DE DADOS</code>` : ''}</div>
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="pri" id="e-step7-resync-app">💬 Enviar Direto no Chat do DarkPlanner</button>
              ${ehGtaStep7 ? `<button type="button" class="sm pri" id="e-step7-btn-gta-rockstar" style="background:#059669;border-color:#10b981;color:#fff;font-weight:700">🎮 Regularizar Rockstar s/ Copyright (FR)</button>` : ''}
              ${r.eh_video_real ? `<button type="button" class="sm" id="e-step7-verify-dedup" style="border-color:#10b981;color:#6ee7b7">🛡️ Verificar Anti-Repetição</button>` : ''}
              <button type="button" class="sm" id="e-step7-apply-ed">🎬 Aplicar Edição no Studio</button>
              <button type="button" class="sm" id="e-step7-focus-dp">🖥️ Abrir Janela DarkPlanner</button>
              <button type="button" class="sm pri" id="e-step7-concluir-now" style="margin-left:auto">✅ Concluir Vídeo</button>
            </div>
            ${promptEdicaoTxt ? `<details style="margin-top:10px;padding:10px 12px;border-radius:10px;background:#0d1218;border:1px solid rgba(16,185,129,.45)">
              <summary class="row" style="cursor:pointer;gap:8px;flex-wrap:wrap">
                <b style="color:#6ee7b7;font-size:12.5px">🎬 Prompt de Edição Completo deste Vídeo (<code>09_PROMPT_EDICAO_STUDIO.txt</code>)</b>
                <button type="button" class="sm pri" id="e-step7-copy-prompt-edicao">📋 Copiar Prompt de Edição</button>
              </summary>
              <textarea id="e-step7-prompt-edicao-txt" readonly style="margin-top:8px;width:100%;min-height:130px;font-size:11.5px;font-family:monospace;background:#0a0d12;color:#d1fae5;border:1px solid var(--line);border-radius:8px;padding:8px">${esc(promptEdicaoTxt)}</textarea>
            </details>` : ''}
            ${renderizarBlocoPromptChatDp(promptChatFinal)}
          </div>`;
          bindBotoesPromptChatDp(promptChatFinal);
          const alternarMinStep7 = (minimizar) => {
            const minBar = $('#e-step7-min-bar');
            const mainCard = $('#e-step7-main-card');
            if (minBar) minBar.style.display = minimizar ? 'flex' : 'none';
            if (mainCard) mainCard.style.display = minimizar ? 'none' : '';
          };
          if ($('#e-step7-btn-min-card')) $('#e-step7-btn-min-card').onclick = () => alternarMinStep7(true);
          if ($('#e-step7-btn-exp-card')) $('#e-step7-btn-exp-card').onclick = () => alternarMinStep7(false);
          if ($('#e-step7-btn-open-mon')) $('#e-step7-btn-open-mon').onclick = () => window.abrirMonitorProcessoDp();
          if ($('#e-step7-btn-open-mon-min')) $('#e-step7-btn-open-mon-min').onclick = () => window.abrirMonitorProcessoDp();
          if ($('#e-step7-btn-criar-conv-dp')) {
            $('#e-step7-btn-criar-conv-dp').onclick = () => window.preencherSugestaoChatOpDp('criar_conversa_dp', {
              abrirDrawer: true,
            });
          }
          if ($('#e-step7-btn-gta-rockstar')) {
            $('#e-step7-btn-gta-rockstar').onclick = () => window.preencherSugestaoChatOpDp('regularizar_gta_rockstar', {
              abrirDrawer: true,
            });
          }
          if ($('#e-step7-copy-prompt-edicao')) {
            $('#e-step7-copy-prompt-edicao').onclick = (ev) => {
              ev.stopPropagation();
              copiar($('#e-step7-prompt-edicao-txt')?.value || promptEdicaoTxt);
              toast('📋 Prompt de Edição copiado!');
            };
          }
        }
        if ($('#e-step7-verify-dedup')) {
          $('#e-step7-verify-dedup').onclick = () => safe(async () => {
            const b = $('#e-step7-verify-dedup');
            const tOld = b.textContent;
            b.disabled = true;
            b.textContent = '⏳ Auditando c/ Gemini Flash Turbo + 0% repetição no canal…';
            addLog(`▶ Executando Verificação Rápida Multimodal & Anti-Repetição no Canal para "${r.titulo || tit}"…`, 'info');
            try {
              const resV = await api('/api/darkplanner/verificar-sem-repeticao', {
                json: {
                  titulo: r.titulo || tit,
                  srt_texto: srtVal,
                  atualizar_studio: true,
                  edicao_config: cfgEd,
                  canal_id: $('#e-canal')?.value || S.estCanal || '',
                  canal_nome: chObj ? (chObj.nome || '') : '',
                  conferir_visual_ia: true,
                }
              });
              const vf = resV.verificacao || {};
              const histVids = vf.historico_videos_anteriores_canal || 0;
              addLog(`✓ Verificação concluída: ${vf.arquivos_unicos_md5 || 0} arquivos únicos (${vf.total_videos_mp4 || 0} vídeos .mp4, 0 repetições no vídeo e contra ${histVids} vídeos anteriores do canal)!`, 'ok');
              toast(`✅ Verificado (Gemini Flash Turbo): ${vf.total_videos_mp4 || 0} vídeos .mp4 únicos e 0% repetição no canal!`);
            } finally {
              b.disabled = false;
              b.textContent = tOld;
            }
          });
        }
        if ($('#e-step7-concluir-now')) {
          $('#e-step7-concluir-now').onclick = () => window.concluirVideoEstudio(false);
        }
        if ($('#e-step7-resync-app')) {
          $('#e-step7-resync-app').onclick = () => executarPasso7(false);
        }
        if ($('#e-step7-apply-ed')) {
          $('#e-step7-apply-ed').onclick = () => {
            if ($('#e-aplicar-edicao-agora')) $('#e-aplicar-edicao-agora').click();
          };
        }
        if ($('#e-step7-focus-dp')) {
          $('#e-step7-focus-dp').onclick = () => safe(async () => {
            const res = await api('/api/darkplanner/acao', {json: {acao: 'abrir_app'}});
            toast(res.msg || 'Janela do DarkPlanner aberta!');
          });
        }

        // Monitora em tempo real até o DarkPlanner Desktop concluir tudo (Etapa 7 só finaliza quando terminar lá!)
        const spIdMon = r.sp_id || r.projeto_id || '';
        const cpIdMon = r.creator_project_id || '';
        let liberadoManual = false;
        let pausadoManual = false;
        if ($('#e-step7-pause-dp')) {
          $('#e-step7-pause-dp').onclick = async () => {
            pausadoManual = true;
            await window.pausarProcessoChatOpDp({
              sp_id: spIdMon,
              nome_projeto: r.titulo || tit,
            });
          };
        }
        if ($('#e-step7-force-complete-dp')) {
          $('#e-step7-force-complete-dp').onclick = async () => {
            liberadoManual = true;
            try {
              await api('/api/darkplanner/status-etapa7', {
                json: {acao: 'concluir', sp_id: spIdMon, creator_project_id: cpIdMon, nome_projeto: r.titulo || tit}
              });
            } catch (_eM) {}
          };
        }

        let ultimoSt7 = r.status_etapa7 || null;
        const tIniWait = Date.now();
        while (!liberadoManual && !pausadoManual && (Date.now() - tIniWait) < 3600000) {
          await new Promise(resW => setTimeout(resW, 2500));
          if (pausadoManual) break;
          let st7 = null;
          try {
            st7 = await api(`/api/darkplanner/status-etapa7?sp_id=${encodeURIComponent(spIdMon)}&creator_project_id=${encodeURIComponent(cpIdMon)}&nome_projeto=${encodeURIComponent(r.titulo || tit)}`);
          } catch (_ePoll) {}
          if (!st7) continue;
          ultimoSt7 = st7;

          if (st7.pausado || st7.acao_tecnica === 'pausado_usuario') {
            pausadoManual = true;
            break;
          }

          const pctNow = Math.max(18, Math.min(100, Number(st7.progresso_pct || 25)));
          const msgNow = st7.etapa_atual || 'Produzindo diretamente no Chat do DarkPlanner Desktop…';
          const totCn = Number(st7.total_cenas || r.cenas_total || 0);
          const rawPrtCn = Number(st7.cenas_prontas || 0);
          const prtCn = totCn > 0 ? Math.min(totCn, rawPrtCn) : rawPrtCn;
          const rodCn = Number(st7.jobs_rodando || 0);
          const errCn = Number(st7.jobs_erros || 0);
          const segDec = Math.max(1, Number(st7.segundos_decorridos || Math.round((Date.now() - tIniWait) / 1000)));
          const acaoTec = st7.acao_tecnica || 'listar_jobs';
          const linha1Txt = (totCn > 0 && (prtCn > 0 || rodCn > 0))
            ? `${prtCn} de ${totCn} vídeos/cenas prontos (${rodCn} na fila/gerando, ${errCn} erros)`
            : msgNow;

          setStep('p7', 'rodando', `⏳ Etapa 7 (Direto no Chat DP): ${msgNow}`, pctNow);
          window.registrarPassoProcessoDp({
            titulo: r.titulo || tit,
            canal_nome: chObj ? (chObj.nome || '') : '',
            chat_modelo_opcao: chatOpcaoDp,
            stepKey: 'p7',
            stepStatus: 'rodando',
            detalhe: msgNow,
            linha1_progresso: linha1Txt,
            acao_tecnica: acaoTec,
            cenas_prontas: prtCn,
            total_cenas: totCn,
            jobs_rodando: rodCn,
            jobs_erros: errCn,
            historico_acoes: st7.historico_acoes || [],
            pasta_arquivos_video: r.pasta_arquivos_video || '',
            conversa_id: r.conversa_id || '',
            progresso_pct: Math.min(99, Math.round(86 + (pctNow * 0.13))),
          });
          if ($('#e-step7-bg-bar')) $('#e-step7-bg-bar').style.width = `${pctNow}%`;
          if ($('#e-step7-bg-pct')) $('#e-step7-bg-pct').textContent = `${pctNow}%`;
          if ($('#e-step7-bg-status')) $('#e-step7-bg-status').textContent = `⏳ ${msgNow}`;
          if ($('#e-step7-dp-r1')) $('#e-step7-dp-r1').textContent = linha1Txt;
          if ($('#e-step7-dp-r2')) $('#e-step7-dp-r2').textContent = acaoTec;
          if ($('#e-step7-dp-r3')) $('#e-step7-dp-r3').textContent = `trabalhando... ${fmtT(segDec)}`;
          if ($('#e-step7-min-txt')) $('#e-step7-min-txt').textContent = `🎬 "${r.titulo || tit}" — ${linha1Txt} (${pctNow}%)`;

          if (st7.concluido_dp || st7.em_andamento === false) {
            break;
          }
        }

        if (pausadoManual || (ultimoSt7 && (ultimoSt7.pausado || ultimoSt7.acao_tecnica === 'pausado_usuario'))) {
          const msgPausaDp = '⏸ Conversa e processo pausados pelo usuário. Abra o Chat ↔ DarkPlanner para ajustar ou retomar quando quiser!';
          if ($('#e-step7-main-card')) {
            $('#e-step7-main-card').style.border = '1.5px solid #f59e0b';
            $('#e-step7-main-card').style.background = 'rgba(245,158,11,.08)';
          }
          if ($('#e-step7-bg-title')) {
            $('#e-step7-bg-title').style.color = '#fde68a';
            $('#e-step7-bg-title').textContent = `⏸ Etapa 7 Pausada pelo Usuário: "${r.titulo || tit}"`;
          }
          if ($('#e-step7-bg-status')) {
            $('#e-step7-bg-status').style.color = '#fde68a';
            $('#e-step7-bg-status').textContent = msgPausaDp;
          }
          if ($('#e-step7-min-badge')) {
            $('#e-step7-min-badge').className = 'pill warn';
            $('#e-step7-min-badge').textContent = '⏸ PAUSADO';
          }
          window.registrarPassoProcessoDp({
            titulo: r.titulo || tit,
            stepKey: 'p7',
            stepStatus: 'pausado',
            detalhe: msgPausaDp,
            acao_tecnica: 'pausado_usuario',
          });
          addLog(`⏸ [Etapa 7] Pausada pelo usuário: "${r.titulo || tit}"`, 'info');
          return;
        }

        if (!liberadoManual && (!ultimoSt7 || !ultimoSt7.concluido_dp)) {
          const msgErroDp = (ultimoSt7 && (ultimoSt7.erro || ultimoSt7.etapa_atual)) || 'DarkPlanner Desktop não concluiu a execução da Etapa 7.';
          if ($('#e-step7-main-card')) {
            $('#e-step7-main-card').style.border = '1.5px solid #ef4444';
            $('#e-step7-main-card').style.background = 'rgba(239,68,68,.10)';
          }
          if ($('#e-step7-bg-title')) {
            $('#e-step7-bg-title').style.color = '#fca5a5';
            $('#e-step7-bg-title').textContent = `⚠️ Etapa 7 Pendente no DarkPlanner Desktop: "${r.titulo || tit}"`;
          }
          if ($('#e-step7-bg-bar')) $('#e-step7-bg-bar').style.background = '#ef4444';
          if ($('#e-step7-bg-status')) {
            $('#e-step7-bg-status').style.color = '#fecaca';
            $('#e-step7-bg-status').textContent = `⚠️ ${msgErroDp}`;
          }
          if ($('#e-step7-min-badge')) {
            $('#e-step7-min-badge').className = 'pill err';
            $('#e-step7-min-badge').textContent = '⚠️ PENDENTE';
          }
          window.registrarPassoProcessoDp({
            titulo: r.titulo || tit,
            stepKey: 'p7',
            stepStatus: 'erro',
            detalhe: msgErroDp,
            acao_tecnica: 'erro_etapa7',
          });
          setStep('p7', 'erro', msgErroDp);
          addLog(`✕ [Etapa 7] Não concluída no DarkPlanner Desktop: ${msgErroDp}`, 'erro');
          toast(`⚠️ Etapa 7 não concluída no DarkPlanner: ${msgErroDp}`, true);
          return;
        }

        // Agora sim: tudo concluído no DarkPlanner Desktop -> Marca Etapa 7 como 100% Concluída!
        if ($('#e-step7-main-card')) {
          $('#e-step7-main-card').style.border = '1.5px solid #10b981';
          $('#e-step7-main-card').style.background = 'rgba(16,185,129,.08)';
        }
        if ($('#e-step7-bg-title')) {
          $('#e-step7-bg-title').style.color = '#6ee7b7';
          $('#e-step7-bg-title').textContent = `✅ Etapa 7 100% Concluída no DarkPlanner Desktop: "${r.titulo || tit}"!`;
        }
        if ($('#e-step7-bg-bar')) $('#e-step7-bg-bar').style.width = '100%';
        if ($('#e-step7-bg-pct')) $('#e-step7-bg-pct').textContent = '100%';
        if ($('#e-step7-bg-status')) {
          $('#e-step7-bg-status').style.color = '#6ee7b7';
          $('#e-step7-bg-status').textContent = `✅ Todo o projeto foi enviado e concluído diretamente no Chat do DarkPlanner Desktop! Você pode clicar em "— Minimizar Projeto" acima e reabrir quando quiser.`;
        }
        if ($('#e-step7-dp-live-inline')) {
          $('#e-step7-dp-live-inline').innerHTML = `<div style="color:#6ee7b7;font-weight:700">✅ Produção 100% concluída (${(ultimoSt7 && ultimoSt7.cenas_prontas) || r.cenas_total || 0} cenas sincronizadas 1:1 no Studio · Modelo ${esc(infoModDp7.curto)})</div>`;
        }
        if ($('#e-step7-min-badge')) {
          $('#e-step7-min-badge').className = 'pill ok';
          $('#e-step7-min-badge').textContent = '✅ 100% CONCLUÍDO';
        }
        if ($('#e-step7-min-txt')) {
          $('#e-step7-min-txt').textContent = `🎬 Projeto Gerado: "${r.titulo || tit}" (100% Concluído)`;
        }
        if ($('#e-step7-force-complete-dp')) $('#e-step7-force-complete-dp').style.display = 'none';

        window.registrarPassoProcessoDp({
          titulo: r.titulo || tit,
          canal_nome: chObj ? (chObj.nome || '') : '',
          chat_modelo_opcao: chatOpcaoDp,
          stepKey: 'p7',
          stepStatus: 'ok',
          detalhe: `Projeto \`${r.titulo || tit}\` 100% concluído e sincronizado 1:1 no DarkPlanner Studio (\`${r.pasta_arquivos_video || ''}\`)`,
          acao_tecnica: 'concluido',
          cenas_prontas: (ultimoSt7 && ultimoSt7.cenas_prontas) || r.cenas_total || 0,
          total_cenas: (ultimoSt7 && ultimoSt7.total_cenas) || r.cenas_total || 0,
          progresso_pct: 100,
          concluirProjeto: true,
        });
        setStep('p7', 'ok', `✅ Tudo concluído direto no Chat do DarkPlanner Desktop ("${r.titulo || tit}")!`);
        addLog(`✓ [Etapa 7] Projeto "${r.titulo || tit}" 100% concluído direto no Chat do DarkPlanner Desktop!`, 'ok');
        toast('✅ Etapa 7 concluída direto no Chat do DarkPlanner Desktop!');
      } catch (e) {
        setStep('p7', 'erro', e.message || 'Erro ao criar projeto no DarkPlanner');
        addLog(`✕ [Passo 7] Erro: ${e.message || e}`, 'erro');
        const promptEmergencia = montarPromptChatDarkPlannerFallback({});
        const step7Details = $('#e-step7-card');
        if (step7Details) step7Details.open = true;
        const out = $('#e-step7-out');
        if (out) {
          out.style.display = '';
          out.innerHTML = `<div class="card" style="border:1.5px solid #f59e0b;background:rgba(245,158,11,.12)">
            <div class="row" style="gap:8px;flex-wrap:wrap">
              <b class="sp" style="color:#fde68a">⚠️ Aviso na integração automática (${esc(e.message || 'Erro')}) — Use o Prompt Pronto abaixo no Chat do DarkPlanner Desktop!</b>
              <button type="button" class="sm pri" id="e-step7-retry-err">🔄 Tentar Novamente</button>
            </div>
            <div class="small" style="color:#fef3c7;margin-top:4px">Mesmo se ocorrer qualquer falha ao exportar, o prompt abaixo já contém todas as informações do seu vídeo para enviar direto no Chat do DarkPlanner Desktop:</div>
            ${renderizarBlocoPromptChatDp(promptEmergencia, '📋 Prompt Pronto de Contingência — Enviar Direto no Chat do DarkPlanner Desktop (Antigravity)')}
          </div>`;
          bindBotoesPromptChatDp(promptEmergencia);
          if ($('#e-step7-retry-err')) {
            $('#e-step7-retry-err').onclick = () => executarPasso7(false);
          }
          out.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
        throw e;
      } finally {
        S._executandoPasso7Agora = false;
        if (btn) { btn.disabled = false; btn.textContent = t0; }
      }
    });

    if ($('#e-run-step7')) $('#e-run-step7').onclick = () => executarPasso7(false);
    if ($('#e-run-step7-jobs')) $('#e-run-step7-jobs').onclick = () => executarPasso7(true);

    // ---- MARCAR VÍDEO COMO CONCLUÍDO (OU PUBLICADO) + INICIAR PRÓXIMO VÍDEO ----
    window.concluirVideoEstudio = async function (publicado = false) {
      return safe(async () => {
        const tit = ($('#e-tit')?.value || S.estTitulo || '').trim() || 'Vídeo Concluído';
        const cid = $('#e-canal')?.value || S.estCanal || '';
        const rot = ($('#e-rot')?.value || S.estRoteiro || '').trim();
        addLog(`▶ Marcando vídeo "${tit}" como ${publicado ? 'CONCLUÍDO E PUBLICADO' : '100% CONCLUÍDO'}…`, 'info');
        const r = await api('/api/videos/concluir', {
          json: {
            vid: S.estVideoId || '',
            canal_id: cid,
            titulo: tit,
            roteiro: rot,
            concluido: true,
            publicado: publicado ? true : undefined,
          }
        });
        // Assim que o vídeo é salvo como concluído no banco, limpamos imediatamente o estado do vídeo anterior
        // (roteiro, ESTRUTURA APROVADA, áudio MP3, SRT, Job ID e ID do vídeo) para que o próximo vídeo não sofra interferência!
        limparArtefatosVideoAnterior(false);
        S.estUltimoTituloV8 = '';
        S.estUltimaDuracaoV8 = 0;
        if (typeof window._resetAudioLeitorLocal === 'function') window._resetAudioLeitorLocal();
        if ($('#e-dp-vid')) $('#e-dp-vid').value = '';
        if ($('#e-vid-status-pill')) {
          $('#e-vid-status-pill').className = 'pill ok';
          $('#e-vid-status-pill').textContent = publicado ? '📢 CONCLUÍDO E PUBLICADO (Pronto p/ Próximo)' : '✅ CONCLUÍDO (Pronto p/ Próximo)';
        }
        if ($('#est-live-panel')) {
          $('#est-live-panel').style.borderColor = '#10b981';
        }
        if ($('#est-concluido-banner')) {
          $('#est-concluido-banner').style.display = '';
          $('#est-concluido-banner').innerHTML = `<div class="row" style="gap:8px;flex-wrap:wrap">
            <b class="sp">🎉 ${esc(r.msg || 'Vídeo marcado como 100% CONCLUÍDO!')} — Campos, roteiro e áudio anteriores limpos automaticamente para o próximo vídeo!</b>
            <button type="button" class="sm pri" onclick="window.iniciarProximoVideoEstudio()" style="background:#0284c7;border-color:#38bdf8">🆕 Novo Vídeo Limpo</button>
            <button type="button" class="sm" onclick="go('videos','${esc(cid)}')">📂 Ver em Vídeos</button>
          </div>`;
        }
        if (window.carregarListaVideosCriados) window.carregarListaVideosCriados(true);
        addLog(`✓ ${r.msg || 'Vídeo marcado como 100% CONCLUÍDO!'} — Campos, estrutura e áudio resetados para você já iniciar o próximo vídeo sem interferência!`, 'ok');
        toast('✅ Vídeo Concluído! Campos e áudio resetados para o próximo vídeo.');
      });
    };

    window.iniciarProximoVideoEstudio = function () {
      S.estVideoId = '';
      S.estTitulo = '';
      S.estRoteiro = '';
      S.estUltimaRespostaV8Limpa = '';
      S.estEstruturaV8 = '';
      S.estSrtTexto = '';
      S.estJobId = '';
      S.estMp3Url = '';
      S.estTotalBlocosSrt = 0;
      S.estUltimoHashRoteiroAudio = '';
      S.estUltimoTituloV8 = '';
      S.estUltimaDuracaoV8 = 0;
      S.estAudio = false;
      S.estV8ChatHist = [];
      S.estPacoteSkill6 = null;
      S.estSkill6Pacote = null;
      S.estPacoteReal = null;
      S.estMidiasReais = null;
      S.estPacoteViral = null;
      S.estSkillModo = '';
      S.estStep45Aberto = false;
      S.estStep6Aberto = false;
      S.estStep7Aberto = false;
      S.estConcluido = false;
      S.estLiveSteps = null;
      S.estLiveLog = [
        {nivel: 'info', t: `[${new Date().toLocaleTimeString('pt-BR')}] 🆕 Campos limpos! Pronto para produzir o próximo vídeo novo.`}
      ];
      toast('🆕 Campos limpos! Pronto para o próximo vídeo.');
      estudioView();
    };

    ['#e-concluir-video-top', '#e-concluir-video-bar', '#e-concluir-video-step7', '#e-concluir-video-side'].forEach(sel => {
      if ($(sel)) $(sel).onclick = () => window.concluirVideoEstudio(false);
    });
    if ($('#e-publicar-video-side')) {
      $('#e-publicar-video-side').onclick = () => window.concluirVideoEstudio(true);
    }
    ['#e-novo-video-top', '#e-reset-video-side'].forEach(sel => {
      if ($(sel)) $(sel).onclick = () => window.iniciarProximoVideoEstudio();
    });

    if ($('#e-ver-videos-criados-top')) {
      $('#e-ver-videos-criados-top').onclick = () => {
        const dr = $('#e-videos-criados-drawer');
        if (!dr) return;
        const abrir = dr.style.display === 'none';
        dr.style.display = abrir ? '' : 'none';
        if (abrir && window.carregarListaVideosCriados) window.carregarListaVideosCriados();
      };
    }
    if ($('#e-videos-criados-close')) {
      $('#e-videos-criados-close').onclick = () => {
        if ($('#e-videos-criados-drawer')) $('#e-videos-criados-drawer').style.display = 'none';
      };
    }
    ['#e-videos-criados-refresh', '#e-side-vc-refresh'].forEach(sel => {
      if ($(sel)) $(sel).onclick = () => { if (window.carregarListaVideosCriados) window.carregarListaVideosCriados(true); };
    });
    if (window.carregarListaVideosCriados) {
      setTimeout(() => window.carregarListaVideosCriados(), 150);
    }

    $$('.est-radio .opt').forEach(l => l.onclick = () => { $$('.opt', l.parentNode).forEach(x => x.classList.remove('on')); l.classList.add('on'); });
    $$('.leg-opt').forEach(l => l.onclick = () => { $$('.leg-opt').forEach(x => x.classList.remove('on')); l.classList.add('on'); });
    if ($('#e-canal')) $('#e-canal').onchange = () => {
      S.estCanal = $('#e-canal').value;
      S.estUltimoCanalAuto = '';
      S.estSkillModo = '';
      S.estVideoId = '';
      S.estS6Style = '';
      S.estS6Epoca = '';
      S.estEdCustom = '';
      S.estYoutubeCloneUrl = '';
      S.estYoutubeCloneUrl1 = undefined;
      S.estYoutubeCloneUrl2 = undefined;
      S.estYoutubeCloneUrl3 = undefined;
      S.estYoutubeCloneAtivo = null;
      S.estSkill6Pacote = null;
      S.estMidiasReais = null;
      S.estPacoteReal = null;
      S.estOp = ler();
      estudioView();
    };
    function ler() {
      return {
        modo: ($('input[name=e-modo]:checked') || {}).value || 'normal',
        noticia_horas: Number($('#e-horas')?.value || 48),
        noticia_canais: Boolean($('#e-canais')?.checked),
        prompt_mestre_id: $('#e-dp-prompt') ? $('#e-dp-prompt').value : '',
      };
    }
    // ---- áudio próprio + legenda + leitor de tempo de fala
    let durAudio = 0, srtTexto = '';
    const ppm = Number(S.settings.palavras_por_minuto || 145), segC = Number(S.settings.segundos_por_cena || 8);
    const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    function leitor() {
      const txt = ($('#e-rot')?.value || '').trim() || srtTexto, pal = txt ? txt.split(/\s+/).length : 0;
      const seg = durAudio || pal / ppm * 60;
      if ($('#e-pal')) $('#e-pal').textContent = `${pal.toLocaleString('pt-BR')} palavras`;
      if ($('#e-min')) $('#e-min').textContent = pal || durAudio ? `≈ ${(seg / 60).toFixed(1).replace('.', ',')} min de vídeo` : '';
      if ($('#e-leitor')) $('#e-leitor').style.display = pal || durAudio ? '' : 'none';
      if ($('#l-tempo')) $('#l-tempo').textContent = mmss(seg);
      if ($('#l-pal')) $('#l-pal').textContent = pal.toLocaleString('pt-BR');
      if ($('#l-ppm')) $('#l-ppm').textContent = durAudio && pal ? Math.round(pal / (durAudio / 60)) : ppm;
      if ($('#l-cenas')) $('#l-cenas').textContent = '~' + Math.max(1, Math.round(seg / segC));
      if ($('#l-origem')) $('#l-origem').textContent = durAudio ? 'medido pelo seu áudio' : 'estimado pelo roteiro e pela velocidade da voz';
      // NUNCA sobrescrever #e-dur com a contagem do roteiro parcial; a duração desejada em minutos é soberana!
    }
    window._resetAudioLeitorLocal = () => {
      durAudio = 0;
      srtTexto = '';
      leitor();
    };
    if ($('#e-rot')) {
      $('#e-rot').oninput = leitor;
      $('#e-rot').onpaste = () => setTimeout(() => {
        if (!$('#e-rot')) return;
        const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro($('#e-rot').value) : limparCaracteresEspeciaisV8($('#e-rot').value);
        if (limpo && limpo !== $('#e-rot').value) {
          $('#e-rot').value = limpo;
          S.estRoteiro = limpo;
          leitor();
        }
      }, 20);
    }
    if ($('#e-rot-clean-btn')) {
      $('#e-rot-clean-btn').onclick = () => {
        if (!$('#e-rot')) return;
        const limpo = typeof window.limparApenasRoteiro === 'function' ? window.limparApenasRoteiro($('#e-rot').value) : limparCaracteresEspeciaisV8($('#e-rot').value);
        $('#e-rot').value = limpo;
        S.estRoteiro = limpo;
        leitor();
        toast('🧹 Roteiro limpo! Todas as marcações [00:00], [000] e blocos foram removidas.');
      };
    }
    $$('input[name=e-modo]').forEach(r => r.onchange = () => {
      const n = r.value === 'noticia';
      if ($('#e-not-box')) $('#e-not-box').style.display = n ? '' : 'none';
      if ($('#e-tit-lbl')) $('#e-tit-lbl').textContent = n ? 'Assunto da notícia (vira o título)' : 'Título';
      if ($('#e-tit')) $('#e-tit').placeholder = n ? 'Ex.: Apuração do segundo turno pausada pelo TSE' : 'Ex.: O mistério do voo que sumiu por 37 anos';
    });
    $$('[data-narr]').forEach(b => b.onclick = () => {
      S.estAudio = b.dataset.narr === 'audio';
      $$('[data-narr]').forEach(x => x.classList.toggle('on', x === b));
      if ($('#e-audio-box')) $('#e-audio-box').style.display = S.estAudio ? '' : 'none';
      $$('.e-so-ia').forEach(x => x.style.display = S.estAudio ? 'none' : '');
      if ($('#e-rot-lbl')) $('#e-rot-lbl').textContent = S.estAudio ? 'Roteiro (opcional — vem da legenda .srt ou do áudio)' : 'Roteiro (apenas texto falado limpo)';
      if (!S.estAudio) { durAudio = 0; srtTexto = ''; }
      leitor();
    });
    function pegarAudio(f) {
      if (!f) return;
      const dt = new DataTransfer(); dt.items.add(f); $('#e-audio').files = dt.files;
      $('#e-a-nome').textContent = '✓ ' + f.name; $('#e-arq-a').classList.add('ok');
      const a = new Audio(URL.createObjectURL(f)); a.onloadedmetadata = () => { durAudio = a.duration || 0; leitor(); };
      if (!$('#e-tit').value.trim()) $('#e-tit').value = f.name.replace(/\.[^.]+$/, '');
      setStep('p4', 'ok', `Áudio MP3 carregado (${f.name})`);
      addLog(`✓ [Passo 4] Áudio MP3 carregado: ${f.name}`, 'ok');
    }
    async function pegarSrt(f) {
      if (!f) return;
      const dt = new DataTransfer(); dt.items.add(f); $('#e-srt').files = dt.files;
      $('#e-s-nome').textContent = '✓ ' + f.name; $('#e-arq-s').classList.add('ok');
      const t = await f.text();
      S.estSrtTexto = t;
      if ($('#e-srt-raw')) $('#e-srt-raw').value = t;
      const nBlocos = (t.match(/-->/g) || []).length;
      S.estTotalBlocosSrt = nBlocos;
      if ($('#e-srt-badge')) $('#e-srt-badge').textContent = `✓ SRT pronto (${nBlocos} blocos)`;
      srtTexto = t.split(/\r?\n/).filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.includes('-->')).join(' ');
      leitor();
      setStep('p5', 'ok', `SRT Tempo VEO pronto (${nBlocos} blocos — ${f.name})`);
      addLog(`✓ [Passo 5] Legenda SRT carregada: ${f.name} (${nBlocos} blocos)`, 'ok');
    }
    if ($('#e-audio')) $('#e-audio').onchange = () => pegarAudio($('#e-audio').files[0]);
    if ($('#e-srt')) $('#e-srt').onchange = () => pegarSrt($('#e-srt').files[0]);
    if ($('#e-open-dp-audiogen')) {
      $('#e-open-dp-audiogen').onclick = () => {
        if (typeof window.abrirModalAudioGeneratorDP === 'function') {
          let rotRaw = ($('#e-rot') ? $('#e-rot').value.trim() : '') || (($('#e-v8-modo')?.value === 'roteiro_completo' && $('#e-v8-txt')) ? $('#e-v8-txt').textContent.trim() : '');
          if (typeof window.limparApenasRoteiro === 'function') {
            rotRaw = window.limparApenasRoteiro(rotRaw);
            if ($('#e-rot') && $('#e-rot').value.trim()) {
              $('#e-rot').value = rotRaw;
              $('#e-rot').dispatchEvent(new Event('input'));
            }
          }
          setStep('p4', 'rodando', 'Gerando áudio MP3 no DarkPlanner (/audio-generator)…');
          addLog('▶ [Passo 4] Abrindo Gerador de Áudio do DarkPlanner (/audio-generator) com roteiro limpo…', 'info');
          window.abrirModalAudioGeneratorDP({
            canal_id: $('#e-canal') ? $('#e-canal').value : '',
            vid: $('#e-dp-vid') ? $('#e-dp-vid').value : (S.estVideoId || ''),
            titulo: $('#e-tit') ? $('#e-tit').value.trim() : '',
            roteiro: rotRaw,
            onUsarNoEstudio: async ({mp3Url, srtTexto: srtFinal, nome, jobId, totalBlocos}) => {
              const btnTabAudio = $('[data-narr="audio"]');
              if (btnTabAudio) btnTabAudio.click();
              if (jobId) S.estJobId = jobId;
              if (mp3Url) S.estMp3Url = mp3Url;
              if (totalBlocos) S.estTotalBlocosSrt = totalBlocos;
              S.estStep6Aberto = true;
              if (srtFinal) {
                S.estSrtTexto = srtFinal;
                if ($('#e-srt-raw')) $('#e-srt-raw').value = srtFinal;
                const srtFile = new File([srtFinal], (nome || 'legenda_veo') + '.srt', {type: 'text/plain'});
                pegarSrt(srtFile).catch(() => {});
              }
              // Marca imediatamente os Passos 4 e 5 como concluídos e abre o Passo 6 sem travar o fechamento da janela
              setStep('p4', 'ok', `Áudio MP3 gerado e baixado (Job ${jobId || 'OK'})`);
              setStep('p5', 'ok', `SRT Tempo VEO (Quebra por Frase) pronto (${totalBlocos || S.estTotalBlocosSrt || 0} blocos)`);
              atualizarVisibilidadeEtapas();
              addLog(`✓ [Passos 4 e 5] Áudio MP3 e SRT Tempo VEO (${totalBlocos || S.estTotalBlocosSrt || 0} blocos) prontos para o Passo 6!`, 'ok');
              if ($('#e-step6-card')) {
                setTimeout(() => $('#e-step6-card').scrollIntoView({behavior: 'smooth', block: 'center'}), 180);
                toast('✅ Áudio MP3 e SRT prontos! Agora no Passo 6 marque sua Skill e clique em Executar.');
              }
              if (mp3Url) {
                fetch(mp3Url).then(async rMp3 => {
                  if (rMp3.ok) {
                    const blob = await rMp3.blob();
                    const mp3File = new File([blob], (nome || 'audio_darkplanner') + '.mp3', {type: 'audio/mpeg'});
                    pegarAudio(mp3File);
                  }
                }).catch(() => {});
              }
            }
          });
        }
      };
    }

    // ---- Detecção Automática de Áudio MP3 e SRT Baixados (Foto 1)
    window.detectarAudioSrtAutomatico = async function (silencioso = false) {
      const btn = $('#e-auto-detect-audio');
      const t0 = btn ? btn.textContent : '';
      if (btn && !silencioso) {
        btn.disabled = true;
        btn.textContent = '⏳ Buscando áudio e SRT baixados…';
      }
      try {
        const tit = ($('#e-tit')?.value || '').trim();
        const vid = $('#e-dp-vid')?.value || S.estVideoId || '';
        const cid = $('#e-canal')?.value || '';
        const jid = S.estJobId || '';
        const r = await api(`/api/darkplanner/audio/detectar-baixado?titulo=${encodeURIComponent(tit)}&vid=${encodeURIComponent(vid)}&canal_id=${encodeURIComponent(cid)}&job_id=${encodeURIComponent(jid)}`);
        const temMp3 = Boolean(r && (r.mp3_pronto || r.encontrado_mp3));
        const temSrt = Boolean(r && (r.srt_pronto || r.encontrado_srt || r.srt_texto));
        if (r && (r.detectado || temMp3 || temSrt)) {
          const btnTabAudio = $('[data-narr="audio"]');
          if (btnTabAudio && !S.estAudio) btnTabAudio.click();
          if (r.job_id) S.estJobId = r.job_id;
          S.estStep6Aberto = true;
          const nmBase = r.nome || tit || 'audio_darkplanner';
          if (r.srt_texto) {
            S.estSrtTexto = r.srt_texto;
            if ($('#e-srt-raw')) $('#e-srt-raw').value = r.srt_texto;
            const srtFile = new File([r.srt_texto], (r.srt_nome || `${nmBase}.srt`), {type: 'text/plain'});
            await pegarSrt(srtFile);
          }
          if (r.mp3_url) {
            S.estMp3Url = r.mp3_url;
            fetch(r.mp3_url).then(async rMp3 => {
              if (rMp3.ok) {
                const blob = await rMp3.blob();
                const mp3File = new File([blob], (r.mp3_nome || `${nmBase}.mp3`), {type: 'audio/mpeg'});
                pegarAudio(mp3File);
              }
            }).catch(() => {});
          }
          if (temMp3) {
            setStep('p4', 'ok', `Áudio MP3 detectado automaticamente (${nmBase}.mp3 · ${r.origem || 'DarkPlanner'})`);
          }
          if (temSrt) {
            const nBl = r.total_blocos || r.total_blocos_srt || S.estTotalBlocosSrt || 0;
            setStep('p5', 'ok', `SRT detectado automaticamente (${nBl} blocos · ${nmBase}.srt)`);
          }
          atualizarVisibilidadeEtapas();
          if (!silencioso) {
            addLog(`✓ [Auto-Detecção Passos 4 & 5] Áudio MP3 e SRT (${r.total_blocos || S.estTotalBlocosSrt || 0} blocos) detectados e vinculados automaticamente (${r.origem || 'DarkPlanner'})!`, 'ok');
            toast('✓ Áudio MP3 e legenda SRT detectados e vinculados automaticamente!');
          }
          return true;
        } else if (!silencioso) {
          addLog('ℹ Nenhum áudio/SRT recente encontrado ainda no DarkPlanner ou na pasta Downloads.', 'info');
          toast('Nenhum áudio ou SRT baixado recentemente foi encontrado ainda.');
        }
      } catch (e) {
        if (!silencioso) addLog(`✕ Erro ao detectar áudio/SRT: ${e.message || e}`, 'erro');
      } finally {
        if (btn && !silencioso) {
          btn.disabled = false;
          btn.textContent = t0 || '🔄 Detectar Áudio e SRT Baixados';
        }
      }
      return false;
    };

    if ($('#e-auto-detect-audio')) {
      $('#e-auto-detect-audio').onclick = () => window.detectarAudioSrtAutomatico(false);
    }

    // Monitoramento automático em segundo plano: só executa se não estiver gerando áudio via backend agora e tiver um job ativo do vídeo atual
    if (S.estAutoAudioWatcher) clearInterval(S.estAutoAudioWatcher);
    S.estAutoAudioWatcher = setInterval(async () => {
      if (S.view !== 'estudio' || S._gerandoAudioBackendAgora || S.estConcluido) return;
      if (!S.estJobId && !($('#e-tit')?.value || '').trim()) return;
      const st4 = (S.estLiveSteps || []).find(p => p.id === 'p4');
      const st5 = (S.estLiveSteps || []).find(p => p.id === 'p5');
      if (st4 && st4.status === 'rodando' && S.estJobId) {
        await window.detectarAudioSrtAutomatico(true);
      } else if (st4 && st4.status === 'ok' && st5 && st5.status !== 'ok' && !S.estSrtTexto && S.estJobId) {
        await window.detectarAudioSrtAutomatico(true);
      }
    }, 4500);
    const caixa = $('#e-audio-box');
    if (caixa) {
      caixa.ondragover = e => { e.preventDefault(); caixa.classList.add('sobre'); };
      caixa.ondragleave = () => caixa.classList.remove('sobre');
      caixa.ondrop = e => {
        e.preventDefault(); caixa.classList.remove('sobre');
        [...e.dataTransfer.files].forEach(f => /\.srt$/i.test(f.name) ? pegarSrt(f) : pegarAudio(f));
      };
    }

    // ---- VÍNCULO DE ATÉ 3 VÍDEOS OU CANAIS DE REFERÊNCIA NO BACKEND (EXCLUSIVO POR CANAL) ----
    const executarVinculoReferenciaBackend = (forcar = false) => safe(async () => {
      const u1 = ($('#e-yt-clone-url')?.value || '').trim();
      const u2 = ($('#e-yt-clone-url-2')?.value || '').trim();
      const u3 = ($('#e-yt-clone-url-3')?.value || '').trim();
      const urls = [u1, u2, u3].filter(Boolean);
      if (!urls.length) {
        toast('Cole pelo menos 1 link de vídeo ou @canal do YouTube para analisar e vincular a este canal.');
        $('#e-yt-clone-url')?.focus();
        return;
      }
      S.estYoutubeCloneUrl1 = u1;
      S.estYoutubeCloneUrl2 = u2;
      S.estYoutubeCloneUrl3 = u3;
      const urlJoined = urls.join(' ||| ');
      S.estYoutubeCloneUrl = urlJoined;
      const btn = $('#e-yt-clone-run');
      const stSpan = $('#e-yt-clone-bg-status');
      const t0 = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = `⏳ Analisando ${urls.length} ref(s)…`;
      }
      if (stSpan) {
        stSpan.textContent = `⏳ Analisando ${urls.length} referência(s) e vinculando DNA exclusivamente ao canal ${chObj.nome || ''}…`;
      }
      addLog(`⚙️ [Backend] Analisando ${urls.length} referência(s) (${urls.join(' · ')}) e vinculando DNA visual/narrativo exclusivamente ao canal "${chObj.nome || ''}"…`, 'info');
      try {
        const canalId = $('#e-canal')?.value || '';
        const vid = S.estVideoId || ($('#e-dp-vid')?.value || '');
        const res = await api('/api/youtube-cloner/analisar', {
          json: {
            youtube_url: urlJoined,
            urls,
            canal_id: canalId,
            instrucoes: '',
            qtd_frames: 10,
            forcar: true,
          }
        });
        if (res && res.yt_id) {
          await api('/api/youtube-cloner/aplicar', {
            json: {
              yt_id: res.yt_id,
              canal_id: canalId,
              vid,
              salvar_no_canal: true,
            }
          });
        }
        try {
          S.channels = await api('/api/channels');
        } catch (_eCh) {}
        S.estYoutubeCloneAtivo = res;
        const ev = res.estilo_visual_dna || {};
        const styleLimpo = limparTermosRecomecoDeClone(ev.STYLE_DNA || '');
        if ($('#e-s6-style') && styleLimpo) {
          $('#e-s6-style').value = styleLimpo;
          S.estS6Style = styleLimpo;
        }
        await carregarAvatarThumbCanal();
        const qtdAn = res.total_referencias_analisadas || urls.length;
        const nomeEst = limparTermosRecomecoDeClone(ev.nome_estilo || res.video_info?.titulo || 'DNA Combinado');
        if (stSpan) {
          stSpan.textContent = `✅ ${qtdAn} referência(s) analisada(s) ("${nomeEst}") e vinculada(s) exclusivamente ao canal ${chObj.nome || ''}!`;
        }
        addLog(`✓ [Backend] ${qtdAn} referência(s) analisada(s) — Estilo "${nomeEst}" vinculado exclusivamente ao canal "${chObj.nome || ''}"!`, 'ok');
        toast(`✅ ${qtdAn} referência(s) vinculada(s) exclusivamente ao canal ${chObj.nome || ''}!`);
      } catch (e) {
        if (stSpan) stSpan.textContent = `✕ Erro ao analisar referências: ${e.message || e}`;
        throw e;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = t0 || '⚡ Analisar Referências';
        }
      }
    });

    if ($('#e-yt-clone-run')) {
      $('#e-yt-clone-run').onclick = () => executarVinculoReferenciaBackend(true);
    }
    if ($('#e-yt-clone-unlink')) {
      $('#e-yt-clone-unlink').onclick = () => safe(async () => {
        const canalId = $('#e-canal')?.value || S.estCanal || '';
        const btnU = $('#e-yt-clone-unlink');
        if (btnU) { btnU.disabled = true; btnU.textContent = '⏳…'; }
        try {
          await api('/api/youtube-cloner/desvincular', {json: {canal_id: canalId}});
          S.estYoutubeCloneUrl = '';
          S.estYoutubeCloneUrl1 = '';
          S.estYoutubeCloneUrl2 = '';
          S.estYoutubeCloneUrl3 = '';
          S.estYoutubeCloneAtivo = null;
          S.estEdCustom = '';
          S.estS6Style = '';
          if ($('#e-yt-clone-url')) $('#e-yt-clone-url').value = '';
          if ($('#e-yt-clone-url-2')) $('#e-yt-clone-url-2').value = '';
          if ($('#e-yt-clone-url-3')) $('#e-yt-clone-url-3').value = '';
          try { S.channels = await api('/api/channels'); } catch (_e) {}
          toast(`🗑️ Referências desvinculadas do canal ${chObj.nome || ''}!`);
          estudioView();
        } finally {
          if (btnU) { btnU.disabled = false; btnU.textContent = '🗑️ Desvincular'; }
        }
      });
    }
  };

  // ---------------------------------------------------------------- acompanhar
  window.acompanharView = async function (vid) {
    pararTimer();
    vid = vid || S.estVid; S.estVid = vid;
    if (!vid) return go('estudio');
    const v = await api(`/api/videos/${vid}`);
    main.innerHTML = `<div class="row"><button class="sm" id="a-voltar">← Estúdio</button><span class="sp"></span><button class="sm" id="a-capcut">🎬 Exportar para CapCut</button><button class="sm" id="a-abrir-v">Abrir no modo manual</button></div>
    <h1 style="margin-top:10px">${esc(v.titulo)}</h1><p class="sub">Acompanhar geração</p>
    <div class="card est-topo">
      <div class="row"><div class="est-pct" id="a-pct">0%</div><div class="sp"><div class="bar grande"><i id="a-bar" style="width:0%"></i></div>
        <div class="row small mut" style="margin-top:6px"><span id="a-estado">—</span><span class="sp"></span><span id="a-tempo"></span></div></div></div>
      <div class="row" style="margin-top:12px" id="a-btns"></div>
    </div>
    <div id="a-final"></div>
    <div class="grid est-grid2">
      <div class="card"><h3>Etapas</h3><ol class="est-steps" id="a-steps"></ol></div>
      <div class="card"><div class="row"><h3 class="sp" style="margin:0">Detalhes</h3><label class="small" style="margin:0;color:var(--txt)"><input type="checkbox" id="a-auto" checked> rolar sozinho</label><button class="sm" id="a-copiar">Copiar</button></div>
        <div class="est-log" id="a-log"></div></div>
    </div>`;
    $('#a-voltar').onclick = () => go('estudio');
    $('#a-abrir-v').onclick = () => go('video', vid);
    $('#a-capcut').onclick = () => safe(async () => {
      $('#a-capcut').disabled = true; toast('Montando a pasta para o CapCut…');
      try {
        const r = await api(`/api/estudio/${vid}/capcut`, {json: {}});
        toast('Pasta aberta: ' + r.pasta + (r.faltam.length ? ` (faltam ${r.faltam.length} cena(s) ainda não montadas)` : ''));
      } finally { $('#a-capcut').disabled = false; }
    });
    let ultimoLog = '', ultimoFinal = '';
    async function tick() {
      if (S.view !== 'acompanhar' || S.estVid !== vid) return pararTimer();
      let st;
      try { st = await api(`/api/estudio/${vid}/status`); } catch { return; }
      $('#a-pct').textContent = `${Math.floor(st.progresso)}%`;
      $('#a-bar').style.width = `${st.progresso}%`;
      $('#a-bar').className = st.erro && !st.rodando ? 'bad' : (st.pausado ? 'warn' : '');
      const atual = st.etapas.find(e => e.status === 'rodando');
      $('#a-estado').textContent = st.rodando ? (st.pausado ? '⏸ Pausado' : `${atual ? atual.nome : 'Trabalhando'}${atual && atual.msg ? ' — ' + atual.msg : ''}`)
        : st.erro ? `Parou: ${st.erro}` : (st.resultado && st.resultado.entrega ? '✓ Vídeo pronto' : (st.existe ? 'Parado — clique em Continuar' : 'Ainda não começou'));
      S.estUltimo = {st, em: Date.now()};
      desenharTempo();
      $('#a-btns').innerHTML = st.rodando
        ? (st.pausado ? '<button class="pri" data-ac="continuar">▶ Continuar</button>' : '<button data-ac="pausar">⏸ Pausar</button>') + '<button class="danger" data-ac="parar">■ Parar</button>'
        : `<button class="pri" data-ac="continuar">${st.resultado && st.resultado.entrega ? '↻ Rodar de novo o que faltar' : '▶ Continuar de onde parou'}</button>
           <select id="a-ref" style="width:auto"><option value="">Refazer a partir de…</option>${st.etapas.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('')}</select>`;
      $$('[data-ac]').forEach(b => b.onclick = () => safe(async () => {
        if (b.dataset.ac === 'parar' && !confirmar()) return;
        await api(`/api/estudio/${vid}/${b.dataset.ac}`, {json: {}}); tick();
      }));
      $('#a-ref') && ($('#a-ref').onchange = () => safe(async () => {
        const k = $('#a-ref').value; if (!k) return;
        await api(`/api/estudio/${vid}/iniciar`, {json: {refazer: [k]}}); tick();
      }));
      $('#a-steps').innerHTML = st.etapas.map((e, i) => `<li class="st-${e.status}"><span class="ic">${e.status === 'rodando' ? `<span class="spin"></span>` : ICONE[e.status] || '○'}</span>
        <div class="sp"><div class="row"><b class="sp">${i + 1}. ${esc(e.nome)}</b>${e.status === 'rodando' ? `<span class="small mut">${e.pct || 0}%</span>` : ''}</div>
        ${e.msg ? `<div class="small mut">${esc(e.msg)}</div>` : ''}${e.status === 'rodando' ? `<div class="bar"><i style="width:${e.pct || 0}%"></i></div>` : ''}</div></li>`).join('');
      const txt = st.log.map(l => `<div class="lg-${l.nivel}">${esc(l.t)}</div>`).join('');
      if (txt !== ultimoLog) {
        ultimoLog = txt; $('#a-log').innerHTML = txt || '<span class="mut">—</span>';
        if ($('#a-auto').checked) $('#a-log').scrollTop = 1e9;
      }
      $('#a-copiar').onclick = () => copiar(st.log.map(l => l.t).join('\n'));
      const fim = st.resultado && st.resultado.entrega ? JSON.stringify(st.resultado) : '';
      if (fim !== ultimoFinal) { ultimoFinal = fim; $('#a-final').innerHTML = fim ? cartaoFinal(vid, st.resultado) : ''; ligarFinal(vid); }
    }
    // contagem ao vivo: anda de segundo em segundo entre uma consulta e outra
    function desenharTempo() {
      const u = S.estUltimo; if (!u || !$('#a-tempo')) return;
      const st = u.st, dt = (Date.now() - u.em) / 1000;
      if (!st.rodando) { $('#a-tempo').textContent = ''; return; }
      const total = (st.decorrido_total || st.decorrido || 0) + (st.pausado ? 0 : dt);
      const partes = [`gerando há ${fmtT(total)}`];
      if (st.decorrido_etapa != null) partes.push(`nesta etapa ${fmtT(st.decorrido_etapa + (st.pausado ? 0 : dt))}`);
      if (st.eta != null && !st.pausado) {
        const falta = Math.max(0, st.eta - dt);
        const fim = new Date(Date.now() + falta * 1000).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        partes.push(`faltam ~${fmtT(falta)} (termina por volta de ${fim})`);
      } else if (!st.pausado) partes.push('calculando o tempo…');
      $('#a-tempo').textContent = partes.join(' · ');
    }
    if (S.estRelogio) clearInterval(S.estRelogio);
    S.estRelogio = setInterval(() => { if (S.view !== 'acompanhar') { clearInterval(S.estRelogio); S.estRelogio = null; return; } desenharTempo(); }, 1000);
    function confirmar() { return window.confirm('Parar a geração? O que já foi feito fica guardado e você pode continuar depois.'); }
    await tick();
    S.estTimer = setInterval(tick, 1500);
  };

  function cartaoFinal(vid, r) {
    const qa = r.qa || {}, m = r.midia || {}, fin = qa.final || {};
    const avisos = [...(qa.problemas || []), ...(qa.checks || [])];
    return `<div class="card est-pronto"><div class="grid g2">
      <div><video src="/api/videos/${vid}/arquivo/final.mp4?t=${Date.now()}" controls preload="metadata" style="width:100%;border-radius:10px;background:#000"></video></div>
      <div><h3>✓ Vídeo pronto</h3>
        <div class="small mut">${fin.resolucao || ''} · ${fmtT(fin.duracao)} · ${m.videos || 0} vídeos e ${m.fotos || 0} fotos</div>
        <p class="small">${avisos.length ? '⚠ ' + avisos.map(esc).join('<br>⚠ ') : '✓ Revisão automática: nenhuma cena preta ou quebrada.'}</p>
        ${r.thumb ? `<img src="/api/estudio/${vid}/thumb?t=${Date.now()}" style="width:100%;max-width:360px;border-radius:8px;border:1px solid var(--line)">` : ''}
        <div class="row" style="margin-top:10px"><button class="pri" id="f-pasta">📂 Abrir pasta de entrega</button>
          <a class="btn" href="/api/videos/${vid}/arquivo/final.mp4?baixar=1">Baixar MP4</a>
          <a class="btn" href="/api/videos/${vid}/pacote">Pacote CapCut</a></div>
        <p class="small mut">Na pasta: o MP4, legendas.srt, descricao-youtube.txt (títulos, descrição, tags, capítulos), thumbnail.png, créditos, roteiro e relatório.</p>
      </div></div></div>`;
  }
  function ligarFinal(vid) {
    const b = $('#f-pasta'); if (!b) return;
    b.onclick = () => safe(async () => { const r = await api(`/api/estudio/${vid}/abrir_entrega`, {json: {}}); toast('Pasta: ' + r.pasta); });
  }

  // ---- CENTRAL DE VÍDEOS E PROJETOS CRIADOS (VER CORTES, EDITAR ROTEIRO/SRT, TROCAR CENAS E REFAZER) ----
  window.abrirPastaProjetoCriado = (pasta, titulo = '', vid = '', slug = '') => safe(async () => {
    if (!pasta && !titulo && !vid && !slug) return toast('Este projeto ainda não possui pasta física gerada.', true);
    const r = await api('/api/projetos-criados/abrir-pasta', {json: {pasta, titulo, vid, slug}});
    if (!r.ok) return toast(r.erro || 'Não foi possível abrir a pasta.', true);
    if (r.modo_remoto && r.download_zip_url) {
      return window.baixarArquivoModoRemoto(r.download_zip_url, null, 'Projeto_FabricaDark.zip');
    }
    toast('📂 Pasta aberta no Windows Explorer!');
  });

  window.carregarProjetoCriadoNoEstudio = (titulo, vid = '', slug = '') => safe(async () => {
    toast('⏳ Reabrindo projeto completo no Estúdio 1 Clique…');
    const det = await api('/api/projetos-criados/detalhe', {json: {titulo, vid, slug}});
    if (!det || !det.ok) return toast((det && det.erro) || 'Não foi possível carregar este vídeo.', true);

    fecharModal();
    S.estTitulo = det.titulo || titulo;
    S.estVideoId = det.vid || vid || '';
    const durVal = Number(det.duracao_minutos || 10);
    S.estDur = durVal;
    S.estDuracao = durVal;

    // Sincronizar canal pelo ID ou pelo nome se existir
    const listCh = S.estCanaisLista || S.channels || [];
    if (det.canal_id && listCh.some(c => String(c.id) === String(det.canal_id))) {
      S.estCanal = det.canal_id;
    } else if (det.canal_nome && Array.isArray(listCh)) {
      const chMatch = listCh.find(c => (c.nome || '').toLowerCase() === String(det.canal_nome).toLowerCase());
      if (chMatch) S.estCanal = chMatch.id;
    }

    S.estRoteiro = det.roteiro || '';
    S.estSrtTexto = det.srt_texto || '';
    S.estSrtEdited = det.srt_texto || '';
    const nBlocos = Number(det.blocos_srt || (det.cenas ? det.cenas.length : 0));
    S.estTotalBlocosSrt = nBlocos;
    S.estSrtBlocos = nBlocos;

    const urlMp3 = det.mp3_url || ((det.pasta && det.mp3_nome)
      ? `/api/projetos-criados/midia-arquivo?pasta=${encodeURIComponent(det.pasta)}&arquivo=${encodeURIComponent(det.mp3_nome)}`
      : '');
    S.estMp3Url = urlMp3;
    S.estAudioDownloaded = Boolean(urlMp3 || det.mp3_nome || det.srt_texto);
    S.estSkillModo = det.modo_skill || (det.tipo === 'studio' ? 'video_real' : 'skill6');
    S.estStudioPredef = det.predefinicao || 'grandes_canais';
    S.estFlowPrompts = det.flow_prompts || '';

    if (det.pacote_viral && typeof det.pacote_viral === 'object') {
      S.estPacoteViral = det.pacote_viral;
    }
    if (det.skill6_pacote && typeof det.skill6_pacote === 'object') {
      S.estSkill6Pacote = det.skill6_pacote;
    }

    const midiasMapped = Array.isArray(det.cenas) ? det.cenas.map(c => ({
      index: c.index,
      start: c.start,
      end: c.end,
      text: c.text,
      query_en: c.query_en,
      media_type: c.media_type,
      source: 'pasta_studio',
      local_path: c.caminho,
      title: c.arquivo,
      preview_url: (det.pasta && c.arquivo)
        ? `/api/projetos-criados/midia-arquivo?pasta=${encodeURIComponent(det.pasta)}&arquivo=${encodeURIComponent('midias/' + c.arquivo)}`
        : '',
    })) : [];
    S.estMidiasReais = midiasMapped;

    if (midiasMapped.length || det.flow_prompts) {
      S.estPromptsResult = {
        ok: true,
        modo_skill: S.estSkillModo,
        total_blocos_srt: nBlocos || midiasMapped.length,
        flow_prompts_txt: det.flow_prompts || '',
        total_flow_prompts: midiasMapped.length || nBlocos,
        midias_reais: midiasMapped,
        predefinicao_templates: det.predefinicao || 'grandes_canais',
      };
    }

    // Abre todas as etapas no Estúdio para edição imediata
    S.estDesbloqueado = 7;
    S.estMostrarTudo = true;
    S.estStep45Aberto = true;
    S.estStep6Aberto = true;
    S.estStep7Aberto = true;
    S.estV8Result = {
      ok: true,
      acao: 'ROTEIRO_COMPLETO',
      resposta: det.roteiro || '',
      roteiro_limpo: det.roteiro || '',
      descricao_viral: det.descricao_viral || '',
      pacote_viral: det.pacote_viral || S.estPacoteViral || null,
      metricas: {
        duracao_minutos: durVal,
        palavras_alvo: (det.roteiro || '').trim().split(/\s+/).filter(Boolean).length || (durVal * 145),
        blocos_recomendados: Math.max(3, Math.round(durVal / 3)),
        ppm: 145,
      }
    };

    toast(`📂 Projeto "${det.titulo}" reaberto no Estúdio 1 Clique com Roteiro, Áudio, SRT, Thumbnails e Cenas!`);
    if (S.view === 'estudio') {
      await renderEstudio();
    } else {
      await go('estudio');
    }
  });

  window.verificarProjetoCriadoModal = (titulo, vid = '', slug = '', canal_id = '') => safe(async () => {
    toast('⚡ Verificando em modo Turbo (Roteiro, MP3, SRT, Visão Multimodal e 0% Repetição no Canal)…');
    const r = await api('/api/projetos-criados/verificar', {
      json: {titulo, vid, slug, canal_id: canal_id || S.estCanal || '', auto_reparar: true}
    });
    if (!r || !r.ok) return toast((r && r.erro) || 'Não foi possível verificar este projeto.', true);

    const checks = Array.isArray(r.checks) && r.checks.length
      ? r.checks
      : (Array.isArray(r.itens_verificados) ? r.itens_verificados.map(i => ({nome: i.etapa, ok: Boolean(i.ok), detalhe: i.detalhe || ''})) : []);
    const reparos = Array.isArray(r.reparos_executados) ? r.reparos_executados : (Array.isArray(r.correcoes_aplicadas) ? r.correcoes_aplicadas : []);
    const det = r.detalhe || r.detalhe_projeto || {};
    const antiRep = r.anti_repeticao_canal || {};
    const saudavel = r.saudavel !== undefined ? Boolean(r.saudavel) : Boolean(r.aprovado_100);
    const resumoOk = r.resumo_ok || `${checks.filter(c => c.ok).length}/${checks.length}`;

    modal(`
      <div style="max-width:780px;width:92vw">
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div class="sp">
            <h3 style="margin:0;color:#f8fafc">⚡ Verificação de Inteligência · Gemini Flash Turbo</h3>
            <div class="small mut" style="margin-top:3px">
              🎬 <b style="color:#38bdf8">${esc(r.titulo || titulo)}</b> · 📺 Canal: <b>${esc(r.canal_nome || det.canal_nome || '—')}</b> · Status: <b style="color:${saudavel ? '#4ade80' : '#fbbf24'}">${esc(resumoOk)} itens OK</b>
            </div>
          </div>
          <button type="button" class="sm" onclick="fecharModal()">✖ Fechar</button>
        </div>

        <div class="kcard" style="margin-bottom:10px;border-color:rgba(34,211,238,.5);background:rgba(8,51,68,.45);color:#cffafe;font-size:12px">
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <span>⚡ <b>Inteligência Ativa:</b> <code style="color:#67e8f9">${esc(r.modelo_ia_utilizado || 'gemini-3.5-flash-lite')}</code></span>
            <span class="sp"></span>
            <span>🛡️ <b>Histórico Anti-Repetição do Canal:</b> <b>${Number(antiRep.videos_anteriores_verificados || 0)}</b> vídeo(s) anterior(es) olhado(s) · <b>${Number(antiRep.midias_bloqueadas_historico || 0)}</b> imagens/vídeos bloqueados · <b>0% repetição</b></span>
          </div>
        </div>

        ${reparos.length ? `
          <div class="kcard" style="margin-bottom:10px;border-color:#22c55e;background:rgba(34,197,94,.08);color:#bbf7d0;font-size:12px">
            🛠️ <b>Auto-Reparos Executados Automaticamente:</b>
            <ul style="margin:4px 0 0 18px;padding:0">${reparos.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
        ` : ''}

        <div style="display:grid;gap:6px;margin-bottom:12px">
          ${checks.map(c => `
            <div class="kcard" style="margin:0;padding:8px 10px;border-color:${c.ok ? 'rgba(34,197,94,.35)' : 'rgba(251,191,36,.45)'};background:rgba(15,23,42,.75)">
              <div class="row" style="gap:8px">
                <span style="font-size:15px">${c.ok ? '✅' : '⚠️'}</span>
                <b style="font-size:12.5px;color:${c.ok ? '#f8fafc' : '#fde68a'}">${esc(c.nome)}</b>
                <span class="sp"></span>
                <span class="small" style="color:${c.ok ? '#86efac' : '#fca5a5'}">${esc(c.detalhe)}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="row" style="gap:8px;flex-wrap:wrap">
          <button type="button" class="pri" id="verif-btn-reabrir" style="background:#0284c7;border-color:#38bdf8;color:#fff;font-weight:700">📂 Reabrir Completo no Estúdio 1 Clique</button>
          <button type="button" class="sm pri" id="verif-btn-cortes" style="background:#7c3aed;border-color:#a855f7;color:#fff;font-weight:700">🎬 Ver Cortes / Editar e Refazer</button>
          <button type="button" class="sm pri" id="verif-btn-reenviar-dp" style="background:#16a34a;border-color:#22c55e;color:#fff;font-weight:700">💬 Reenviar para Chat DarkPlanner</button>
          ${det.pasta ? `<button type="button" class="sm" id="verif-btn-pasta">📂 Abrir Pasta</button>` : ''}
          <button type="button" class="sm" id="verif-btn-deletar" style="border-color:rgba(248,113,113,.45);color:#fca5a5">🗑️ Deletar Projeto</button>
        </div>
      </div>
    `);

    if ($('#verif-btn-reabrir')) {
      $('#verif-btn-reabrir').onclick = () => window.carregarProjetoCriadoNoEstudio(r.titulo || titulo, det.vid || vid, det.slug || slug);
    }
    if ($('#verif-btn-cortes')) {
      $('#verif-btn-cortes').onclick = () => window.abrirModalEditarVideoCriado(r.titulo || titulo, det.vid || vid, det.slug || slug);
    }
    if ($('#verif-btn-pasta') && det.pasta) {
      $('#verif-btn-pasta').onclick = () => window.abrirPastaProjetoCriado(det.pasta);
    }
    if ($('#verif-btn-deletar')) {
      $('#verif-btn-deletar').onclick = () => window.deletarProjetoCriadoConfirmado(r.titulo || titulo, det.vid || vid, det.slug || slug, det.pasta || '');
    }
    if ($('#verif-btn-reenviar-dp')) {
      $('#verif-btn-reenviar-dp').onclick = () => safe(async () => {
        const b = $('#verif-btn-reenviar-dp');
        b.disabled = true;
        b.textContent = '⏳ Enviando para o Chat DarkPlanner…';
        try {
          const resp = await api('/api/darkplanner/criar-projeto-desktop', {
            json: {
              titulo: r.titulo || titulo,
              canal_id: det.canal_id || canal_id || S.estCanal || '',
              canal_nome: r.canal_nome || det.canal_nome || 'Cappito Vital',
              roteiro: det.roteiro || '',
              srt_texto: det.srt_texto || '',
              modo_skill: det.modo_skill || 'skill6',
              predefinicao_templates: det.predefinicao || 'grandes_canais',
              enviar_chat: true,
              auto_enter: true,
              chat_modelo_opcao: S.estChatDpOpcao || 'flash_high',
            }
          });
          if (!resp.ok) return toast(resp.erro || 'Erro ao enviar para o DarkPlanner.', true);
          toast('🚀 Projeto reenviado com sucesso para o Chat do DarkPlanner Desktop!');
        } finally {
          b.disabled = false;
          b.textContent = '💬 Reenviar para Chat DarkPlanner';
        }
      });
    }
    if (window.carregarListaVideosCriados) window.carregarListaVideosCriados(false);
  });

  window.deletarProjetoCriadoConfirmado = (titulo, vid = '', slug = '', pasta = '', semConfirm = false) => safe(async () => {
    if (!semConfirm && !confirm(`🗑️ Tem certeza que deseja DELETAR o projeto "${titulo}" da lista e apagar a pasta de arquivos correspondente?`)) {
      return;
    }
    const r = await api('/api/projetos-criados/deletar', {
      json: {titulo, vid, slug, pasta, apagar_arquivos: true}
    });
    if (!r || !r.ok) return toast((r && r.erro) || 'Erro ao deletar projeto.', true);

    if (Array.isArray(S.filaProducao)) {
      const norm = String(titulo || '').trim().toLowerCase();
      S.filaProducao = S.filaProducao.filter(x => String(x.titulo || '').trim().toLowerCase() !== norm);
      try {
        localStorage.setItem('fd_fila_producao_v1', JSON.stringify(S.filaProducao.slice(-30)));
      } catch (_e) {}
    }

    fecharModal();
    toast(`🗑️ Projeto "${titulo}" deletado com sucesso!`);
    if (window.carregarListaVideosCriados) await window.carregarListaVideosCriados(false);
  });

  window.carregarListaVideosCriados = async (mostrarToast = false) => {
    try {
      const r = await api('/api/projetos-criados');
      const itens = (r && r.itens) || [];
      S.projetosCriadosCache = itens;

      const btnTop = $('#e-ver-videos-criados-top');
      if (btnTop) {
        btnTop.textContent = `🎬 Ver Vídeos Criados (${itens.length}) — Reabrir / Verificar / Deletar`;
      }

      // Renderiza no drawer superior
      const elList = $('#e-videos-criados-list');
      if (elList) {
        if (!itens.length) {
          elList.innerHTML = `<div class="small mut">Nenhum vídeo criado encontrado ainda.</div>`;
        } else {
          elList.innerHTML = `<div style="display:grid;gap:8px">${itens.map((it, idx) => {
            const ehReal = it.modo_skill === 'video_real' || it.tipo === 'studio';
            const aud = it.auditoria || {};
            const semRep = aud.repeticoes_restantes === 0 && (it.videos_mp4 || 0) > 0;
            return `<div class="kcard" style="margin:0;border-color:${ehReal ? '#38bdf8' : '#10b981'};background:rgba(15,23,42,.75)">
              <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-start">
                <div class="sp">
                  <div class="row" style="gap:6px;flex-wrap:wrap">
                    <b style="font-size:14px;color:#f8fafc">${esc(it.titulo)}</b>
                    <span class="pill" style="border-color:${ehReal ? '#38bdf8' : '#10b981'};color:${ehReal ? '#7dd3fc' : '#6ee7b7'}">${ehReal ? '🎬 Studio Vídeo Real' : '🎯 Skill 6 / Creator'}</span>
                    ${it.concluido ? '<span class="pill ok">✅ Concluído</span>' : '<span class="pill warn">⏳ Em Produção</span>'}
                    ${semRep ? '<span class="pill ok" title="Todos os cortes verificados por MD5 sem nenhuma repetição">🛡️ 0 Repetições</span>' : ''}
                  </div>
                  <div class="small mut" style="margin-top:4px">
                    📺 Canal: <b style="color:#cbd5e1">${esc(it.canal_nome || '—')}</b> ·
                    ⏱️ ~<b>${it.duracao_minutos || 10} min</b> (${(it.palavras_roteiro || 0).toLocaleString('pt-BR')} palavras) ·
                    🎙 MP3: <b style="color:${it.tem_mp3 ? '#4ade80' : '#f87171'}">${it.tem_mp3 ? 'Sim' : 'Não'}</b> ·
                    📄 SRT: <b>${it.blocos_srt || 0} blocos</b> ·
                    🎞 Cortes: <b style="color:#38bdf8">${it.videos_mp4 || 0} vídeos .MP4</b>${it.fotos_jpg ? ` + ${it.fotos_jpg} fotos` : ''}
                  </div>
                </div>
                <div class="row" style="gap:6px;flex-wrap:wrap">
                  <button type="button" class="sm pri" data-vc-load="${idx}" style="background:#0284c7;border-color:#38bdf8;color:#fff;font-weight:700" title="Reabrir projeto completo no Estúdio 1 Clique">📂 Reabrir</button>
                  <button type="button" class="sm" data-vc-verif="${idx}" style="border-color:#34d399;color:#6ee7b7;font-weight:700" title="Verificar novamente integridade de Roteiro, MP3, SRT, Thumbs e Cenas">🔍 Verificar Novamente</button>
                  <button type="button" class="sm pri" data-vc-modal="${idx}" style="background:#059669;border-color:#10b981;color:#fff;font-weight:700">🎬 Cortes / Editar e Refazer</button>
                  ${it.pasta ? `<button type="button" class="sm" data-vc-dir="${idx}" title="Abrir pasta dos arquivos no Windows">📂 Pasta</button>` : ''}
                  <button type="button" class="sm" data-vc-del="${idx}" style="border-color:rgba(248,113,113,.45);color:#fca5a5" title="Deletar projeto da lista e limpar arquivos">🗑️ Deletar</button>
                </div>
              </div>
            </div>`;
          }).join('')}</div>`;

          $$('[data-vc-modal]', elList).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcModal)];
            if (it) window.abrirModalEditarVideoCriado(it.titulo, it.vid, it.slug);
          });
          $$('[data-vc-load]', elList).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcLoad)];
            if (it) window.carregarProjetoCriadoNoEstudio(it.titulo, it.vid, it.slug);
          });
          $$('[data-vc-verif]', elList).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcVerif)];
            if (it) window.verificarProjetoCriadoModal(it.titulo, it.vid, it.slug);
          });
          $$('[data-vc-dir]', elList).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcDir)];
            if (it && it.pasta) window.abrirPastaProjetoCriado(it.pasta);
          });
          $$('[data-vc-del]', elList).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcDel)];
            if (it) window.deletarProjetoCriadoConfirmado(it.titulo, it.vid, it.slug, it.pasta);
          });
        }
      }

      // Renderiza no card da coluna direita do Estúdio
      const elSide = $('#e-side-videos-criados');
      if (elSide) {
        if (!itens.length) {
          elSide.innerHTML = `<div class="small mut">Nenhum vídeo criado encontrado ainda.</div>`;
        } else {
          elSide.innerHTML = `<div style="display:grid;gap:6px">${itens.slice(0, 10).map((it, idx) => {
            return `<div class="kcard" style="margin:0;padding:8px;border-color:rgba(16,185,129,.35);background:rgba(15,23,42,.6)">
              <div style="font-weight:700;color:#f1f5f9;font-size:12.5px;line-height:1.3">${esc(it.titulo)}</div>
              <div class="small mut" style="margin:3px 0 6px;font-size:11px">
                ${esc(it.canal_nome || 'Canal')} · ~${it.duracao_minutos || 10}m · <b style="color:#38bdf8">${it.videos_mp4 || 0} .MP4</b> · ${it.blocos_srt || 0} SRT
              </div>
              <div class="row" style="gap:4px;flex-wrap:wrap">
                <button type="button" class="sm pri" data-vcs-load="${idx}" style="background:#0284c7;border-color:#38bdf8;color:#fff;padding:3px 7px;font-size:11px" title="Reabrir no Estúdio 1 Clique">📂 Reabrir</button>
                <button type="button" class="sm" data-vcs-verif="${idx}" style="border-color:#34d399;color:#6ee7b7;padding:3px 7px;font-size:11px" title="Verificar novamente">🔍 Verificar</button>
                <button type="button" class="sm pri" data-vcs-modal="${idx}" style="background:#059669;border-color:#10b981;color:#fff;padding:3px 7px;font-size:11px">🎬 Cortes / Refazer</button>
                ${it.pasta ? `<button type="button" class="sm" data-vcs-dir="${idx}" style="padding:3px 7px;font-size:11px" title="Abrir pasta">📂</button>` : ''}
                <button type="button" class="sm" data-vcs-del="${idx}" style="border-color:rgba(248,113,113,.45);color:#fca5a5;padding:3px 7px;font-size:11px" title="Deletar projeto">🗑️</button>
              </div>
            </div>`;
          }).join('')}</div>`;

          $$('[data-vcs-modal]', elSide).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcsModal)];
            if (it) window.abrirModalEditarVideoCriado(it.titulo, it.vid, it.slug);
          });
          $$('[data-vcs-load]', elSide).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcsLoad)];
            if (it) window.carregarProjetoCriadoNoEstudio(it.titulo, it.vid, it.slug);
          });
          $$('[data-vcs-verif]', elSide).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcsVerif)];
            if (it) window.verificarProjetoCriadoModal(it.titulo, it.vid, it.slug);
          });
          $$('[data-vcs-dir]', elSide).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcsDir)];
            if (it && it.pasta) window.abrirPastaProjetoCriado(it.pasta);
          });
          $$('[data-vcs-del]', elSide).forEach(b => b.onclick = () => {
            const it = itens[Number(b.dataset.vcsDel)];
            if (it) window.deletarProjetoCriadoConfirmado(it.titulo, it.vid, it.slug, it.pasta);
          });
        }
      }

      if (mostrarToast) toast(`✅ ${itens.length} vídeo(s) criado(s) encontrado(s)!`);
      return itens;
    } catch (e) {
      if (mostrarToast) toast('Erro ao carregar vídeos criados: ' + e.message, true);
      return [];
    }
  };

  window.abrirModalEditarVideoCriado = (titulo, vid = '', slug = '') => safe(async () => {
    toast('⏳ Carregando detalhes, cortes e roteiro do vídeo…');
    const det = await api('/api/projetos-criados/detalhe', {json: {titulo, vid, slug}});
    if (!det || !det.ok) return toast((det && det.erro) || 'Erro ao abrir detalhes do vídeo.', true);

    const cenas = Array.isArray(det.cenas) ? det.cenas : [];
    const nMp4 = cenas.filter(c => c.media_type === 'video').length;
    const nJpg = cenas.filter(c => c.media_type !== 'video').length;
    const urlMp3 = (det.pasta && det.mp3_nome)
      ? `/api/projetos-criados/midia-arquivo?pasta=${encodeURIComponent(det.pasta)}&arquivo=${encodeURIComponent(det.mp3_nome)}`
      : '';

    modal(`
      <div style="max-width:1040px;width:94vw">
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div class="sp">
            <h3 style="margin:0;color:#f8fafc">🎬 Editar / Refazer Vídeo Criado: <span style="color:#38bdf8">${esc(det.titulo)}</span></h3>
            <div class="small mut" style="margin-top:3px">
              📺 Canal: <b>${esc(det.canal_nome || '—')}</b> ·
              ⏱️ Duração: <b>~${det.duracao_minutos || 10} min</b> ·
              📄 Blocos SRT: <b>${det.blocos_srt || cenas.length}</b> ·
              🎞 Cortes na pasta: <b style="color:#4ade80">${nMp4} vídeos .MP4</b>${nJpg ? ` + ${nJpg} fotos` : ''}
            </div>
          </div>
          <button type="button" class="sm pri" id="mvc-load-estudio" style="background:#0284c7;border-color:#38bdf8;color:#fff;font-weight:700">📂 Reabrir no Estúdio 1 Clique</button>
          <button type="button" class="sm" id="mvc-verif-proj" style="border-color:#34d399;color:#6ee7b7;font-weight:700">🔍 Verificar Novamente</button>
          ${det.pasta ? `<button type="button" class="sm" id="mvc-open-dir">📂 Abrir Pasta</button>` : ''}
          <button type="button" class="sm" id="mvc-del-proj" style="border-color:rgba(248,113,113,.45);color:#fca5a5">🗑️ Deletar</button>
          <button type="button" class="sm" onclick="fecharModal()">✖ Fechar</button>
        </div>

        ${urlMp3 ? `
        <div class="kcard" style="margin-bottom:10px;padding:8px 12px;border-color:#38bdf8;background:rgba(2,132,199,.08)">
          <div class="row" style="gap:10px;flex-wrap:wrap">
            <b class="small" style="color:#7dd3fc">🎙 Narração Oficial do Vídeo (${esc(det.mp3_nome)}):</b>
            <audio controls preload="metadata" src="${urlMp3}" style="height:32px;flex:1;min-width:220px"></audio>
          </div>
        </div>` : ''}

        <!-- ABAS DO EDITOR DE VÍDEO CRIADO -->
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px;border-bottom:1px solid var(--line);padding-bottom:8px">
          <button type="button" class="sm pri" data-mvc-tab="cortes" id="mvc-tab-btn-cortes">🎞 1. Ver e Trocar Cortes de Cenas (${cenas.length})</button>
          <button type="button" class="sm" data-mvc-tab="roteiro" id="mvc-tab-btn-roteiro">📝 2. Editar Roteiro Limpo e Legenda .SRT</button>
          <button type="button" class="sm" data-mvc-tab="refazer" id="mvc-tab-btn-refazer" style="border-color:#22c55e;color:#4ade80;font-weight:700">🚀 3. Refazer / Remontar no DarkPlanner Studio</button>
        </div>

        <!-- ABA 1: CORTES E CENAS -->
        <div id="mvc-pane-cortes">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <input id="mvc-busca-cena" placeholder="🔎 Filtrar cena por número (#001), trecho falado ou palavra-chave…" style="flex:1;min-width:220px">
            <select id="mvc-limite-cenas" style="width:auto">
              <option value="30">Mostrar 30 cenas</option>
              <option value="60">Mostrar 60 cenas</option>
              <option value="120">Mostrar 120 cenas</option>
              <option value="9999">Mostrar todas (${cenas.length})</option>
            </select>
            <button type="button" class="sm pri" id="mvc-verificar-rep" style="background:#059669;border-color:#10b981;color:#fff;font-weight:700" title="Verifica todos os arquivos por hash MD5, garante prioridade para vídeos .MP4 e substitui qualquer corte repetido">🛡️ Verificar e Eliminar Qualquer Repetição</button>
          </div>
          <div class="small mut" style="margin-bottom:8px">💡 Abaixo estão os cortes sincronizados com cada bloco da legenda. Para <b>trocar apenas 1 corte específico</b>, ajuste o termo de busca em inglês daquela cena e clique em <b>🔄 Trocar Corte (.MP4)</b>:</div>
          <div id="mvc-cenas-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:10px;max-height:54vh;overflow-y:auto;padding-right:4px"></div>
        </div>

        <!-- ABA 2: ROTEIRO E SRT -->
        <div id="mvc-pane-roteiro" style="display:none">
          <div class="grid g2" style="gap:10px">
            <div class="f" style="margin:0">
              <label>📝 Roteiro Limpo (<code>00_ROTEIRO_LIMPO.txt</code>)</label>
              <textarea id="mvc-txt-roteiro" style="min-height:260px;font-family:monospace;font-size:12px">${esc(det.roteiro || '')}</textarea>
            </div>
            <div class="f" style="margin:0">
              <label>⏱️ Legenda Sincronizada (<code>01_LEGENDA_SINCRONIZADA.srt</code>)</label>
              <textarea id="mvc-txt-srt" style="min-height:260px;font-family:monospace;font-size:12px">${esc(det.srt_texto || '')}</textarea>
            </div>
          </div>
          <div class="f" style="margin-top:8px">
            <label>🔥 Descrição SEO, Tags e Prompt de Thumbnail Viral (<code>05_DESCRICAO_TAGS_THUMB_VIRAL.txt</code>)</label>
            <textarea id="mvc-txt-desc" style="min-height:110px;font-family:monospace;font-size:12px">${esc(det.descricao_viral || '')}</textarea>
          </div>
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
            <button type="button" class="pri" id="mvc-salvar-textos" style="background:#059669;border-color:#10b981;color:#fff;font-weight:700">💾 Salvar Alterações nos Arquivos do Projeto</button>
            <button type="button" class="sm" id="mvc-roteiro-para-estudio" style="border-color:#38bdf8;color:#7dd3fc;font-weight:700">💬 Abrir no Estúdio para Pedir à IA Refazer o Roteiro</button>
          </div>
        </div>

        <!-- ABA 3: REFAZER / REMONTAR NO STUDIO -->
        <div id="mvc-pane-refazer" style="display:none">
          <div class="kcard" style="border-color:#22c55e;background:rgba(34,197,94,.06)">
            <h4 style="margin:0 0 8px;color:#4ade80">🚀 Refazer ou Remontar este Vídeo no DarkPlanner Studio</h4>
            <div class="small mut" style="margin-bottom:10px">Você pode alterar o estilo de edição (proporção de Templates vs. Cortes Puros), revisar os vídeos sem repetição e remontar o projeto direto no <b>DarkPlanner Studio</b>:</div>
            <div class="grid g2" style="gap:10px">
              <div class="f" style="margin:0">
                <label>📊 Predefinição de Templates Documentais</label>
                <select id="mvc-refazer-predef">
                  <option value="grandes_canais" ${(det.predefinicao || 'grandes_canais') === 'grandes_canais' ? 'selected' : ''}>🏆 Grandes Canais Documentais (25% Templates + 75% Cortes Puros)</option>
                  <option value="equilibrado_10" ${det.predefinicao === 'equilibrado_10' ? 'selected' : ''}>🎬 Mais Vídeo Puro (10% Templates + 90% Cortes Puros)</option>
                  <option value="intenso_40" ${det.predefinicao === 'intenso_40' ? 'selected' : ''}>📊 Explicativo Intenso (40% Templates + 60% Cortes Puros)</option>
                  <option value="puro_0" ${det.predefinicao === 'puro_0' ? 'selected' : ''}>🎥 100% Cortes de Vídeo Puros (0% Templates)</option>
                </select>
              </div>
              <div class="f" style="margin:0">
                <label>🔄 Opção de Mídias (.MP4)</label>
                <select id="mvc-refazer-forcar">
                  <option value="0" selected>⚡ Manter os cortes .MP4 atuais (Apenas verificar 0 repetição + remontar edição)</option>
                  <option value="1">🌐 Baixar novos cortes .MP4 do zero para todas as cenas (Sem repetição)</option>
                </select>
              </div>
            </div>
            <div class="f" style="margin-top:8px">
              <label>💬 Instrução Extra de Edição para o Studio (Opcional)</label>
              <input id="mvc-refazer-instrucao" placeholder="Ex.: Priorizar cortes rápidos nos primeiros 2 minutos, legenda amarela documentário…">
            </div>
            <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">
              <button type="button" class="pri" id="mvc-btn-remontar-studio" style="background:#16a34a;border-color:#22c55e;color:#fff;font-weight:700">🚀 Remontar Agora no DarkPlanner Studio (Sem Repetição)</button>
              <button type="button" class="sm pri" id="mvc-btn-reenviar-chat" style="background:#059669;border-color:#10b981;color:#fff;font-weight:700">💬 Reenviar Comando de Montagem no Chat DarkPlanner</button>
            </div>
            <div id="mvc-refazer-status" class="small" style="margin-top:10px"></div>
          </div>
        </div>
      </div>
    `);

    // Eventos do cabeçalho do modal
    if ($('#mvc-load-estudio')) {
      $('#mvc-load-estudio').onclick = () => window.carregarProjetoCriadoNoEstudio(det.titulo, det.vid, det.slug);
    }
    if ($('#mvc-verif-proj')) {
      $('#mvc-verif-proj').onclick = () => window.verificarProjetoCriadoModal(det.titulo, det.vid, det.slug);
    }
    if ($('#mvc-del-proj')) {
      $('#mvc-del-proj').onclick = () => window.deletarProjetoCriadoConfirmado(det.titulo, det.vid, det.slug, det.pasta);
    }
    if ($('#mvc-roteiro-para-estudio')) {
      $('#mvc-roteiro-para-estudio').onclick = () => window.carregarProjetoCriadoNoEstudio(det.titulo, det.vid, det.slug);
    }
    if ($('#mvc-open-dir')) {
      $('#mvc-open-dir').onclick = () => window.abrirPastaProjetoCriado(det.pasta);
    }

    // Alternância de abas
    $$('[data-mvc-tab]').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.mvcTab;
        $$('[data-mvc-tab]').forEach(b => b.classList.toggle('pri', b.dataset.mvcTab === tab));
        ['cortes', 'roteiro', 'refazer'].forEach(k => {
          const p = $(`#mvc-pane-${k}`);
          if (p) p.style.display = (k === tab) ? '' : 'none';
        });
      };
    });

    // Renderizar grid de cenas (Aba 1)
    function desenharCenasModal() {
      const grid = $('#mvc-cenas-grid');
      if (!grid) return;
      const q = ($('#mvc-busca-cena')?.value || '').trim().toLowerCase();
      const lim = Number($('#mvc-limite-cenas')?.value || 30);

      const filtradas = cenas.filter(c => {
        if (!q) return true;
        const sIdx = `#${String(c.index).padStart(3, '0')} cena ${c.index}`;
        return sIdx.includes(q) || String(c.text || '').toLowerCase().includes(q) || String(c.query_en || '').toLowerCase().includes(q) || String(c.arquivo || '').toLowerCase().includes(q);
      });

      if (!filtradas.length) {
        grid.innerHTML = `<div class="small mut">Nenhuma cena encontrada para este filtro.</div>`;
        return;
      }

      grid.innerHTML = filtradas.slice(0, lim).map(c => {
        const urlMidia = (det.pasta && c.arquivo)
          ? `/api/projetos-criados/midia-arquivo?pasta=${encodeURIComponent(det.pasta)}&arquivo=${encodeURIComponent('midias/' + c.arquivo)}&t=${c._ts || 1}`
          : '';
        const ehVid = c.media_type === 'video' || String(c.arquivo || '').toLowerCase().endsWith('.mp4');
        return `<div class="kcard" id="mvc-card-cena-${c.index}" style="margin:0;padding:8px;border-color:${ehVid ? 'rgba(56,189,248,.4)' : 'rgba(251,191,36,.4)'};background:rgba(15,23,42,.85)">
          <div class="row" style="gap:6px;margin-bottom:6px">
            <b style="color:#38bdf8;font-size:12.5px">#${String(c.index).padStart(3, '0')}</b>
            <span class="small mut" style="font-size:11px">${esc(c.start || '')} → ${esc(c.end || '')}</span>
            <span class="sp"></span>
            <span class="pill" style="font-size:10px;padding:1px 6px;border-color:${ehVid ? '#22c55e' : '#f59e0b'};color:${ehVid ? '#4ade80' : '#fbbf24'}">${ehVid ? '🎬 .MP4' : '🖼 .JPG'} · ${c.tamanho_kb || 0} KB</span>
          </div>
          ${urlMidia ? (ehVid
            ? `<video id="mvc-vid-${c.index}" src="${urlMidia}" controls preload="metadata" muted style="width:100%;height:148px;object-fit:cover;border-radius:6px;background:#000;margin-bottom:6px"></video>`
            : `<img id="mvc-vid-${c.index}" src="${urlMidia}" style="width:100%;height:148px;object-fit:cover;border-radius:6px;background:#000;margin-bottom:6px">`
          ) : `<div class="small mut" style="height:100px;display:flex;align-items:center;justify-content:center;background:#000;border-radius:6px;margin-bottom:6px">Sem arquivo na pasta</div>`}
          <div class="small" style="font-size:11.5px;color:#e2e8f0;line-height:1.35;margin-bottom:6px;max-height:48px;overflow-y:auto" title="${esc(c.text || '')}">"${esc(c.text || '—')}"</div>
          <div class="row" style="gap:4px">
            <input id="mvc-q-${c.index}" value="${esc(c.query_en || '')}" placeholder="Busca em inglês (ex: phoenix highway dust storm)" style="flex:1;font-size:11.5px;padding:4px 6px">
            <button type="button" class="sm pri" data-mvc-trocar="${c.index}" style="background:#0284c7;border-color:#38bdf8;color:#fff;font-size:11px;padding:4px 8px;white-space:nowrap" title="Baixar outro vídeo .MP4 inédito (sem repetição) para esta cena">🔄 Trocar Corte</button>
          </div>
        </div>`;
      }).join('');

      $$('[data-mvc-trocar]', grid).forEach(btn => {
        btn.onclick = () => safe(async () => {
          const idxCena = Number(btn.dataset.mvcTrocar);
          const inpQ = $(`#mvc-q-${idxCena}`);
          const termo = (inpQ ? inpQ.value : '').trim();
          const txtOrig = btn.textContent;
          btn.disabled = true;
          btn.textContent = '⏳ Baixando .MP4…';
          try {
            const r = await api('/api/projetos-criados/trocar-corte-cena', {
              json: {titulo: det.titulo, scene_index: idxCena, termo_busca: termo}
            });
            if (!r.ok) {
              toast(r.erro || 'Não foi possível trocar este corte.', true);
              return;
            }
            const cObj = cenas.find(x => Number(x.index) === idxCena);
            if (cObj) {
              cObj.arquivo = r.arquivo;
              cObj.media_type = 'video';
              cObj.tamanho_kb = r.tamanho_kb;
              cObj.query_en = r.query_usada || termo;
              cObj._ts = Date.now();
            }
            toast(`✅ Cena #${String(idxCena).padStart(3, '0')} trocada por novo vídeo .MP4 (${r.tamanho_kb} KB) sem repetição!`);
            desenharCenasModal();
          } finally {
            btn.disabled = false;
            btn.textContent = txtOrig;
          }
        });
      });
    }

    if ($('#mvc-busca-cena')) $('#mvc-busca-cena').oninput = desenharCenasModal;
    if ($('#mvc-limite-cenas')) $('#mvc-limite-cenas').onchange = desenharCenasModal;
    desenharCenasModal();

    // Botão Verificar e Eliminar Qualquer Repetição (Aba 1)
    if ($('#mvc-verificar-rep')) {
      $('#mvc-verificar-rep').onclick = () => safe(async () => {
        const b = $('#mvc-verificar-rep');
        const tOrig = b.textContent;
        b.disabled = true;
        b.textContent = '⏳ Verificando c/ Gemini Flash Turbo + 0% repetição no canal…';
        try {
          const r = await api('/api/darkplanner/studio-aplicar-midias-reais', {
            json: {
              titulo: det.titulo,
              canal_id: det.canal_id || '',
              canal_nome: det.canal_nome || 'Cappito Vital',
              srt_texto: ($('#mvc-txt-srt')?.value || det.srt_texto || ''),
              roteiro: ($('#mvc-txt-roteiro')?.value || det.roteiro || ''),
              predefinicao_templates: $('#mvc-refazer-predef')?.value || det.predefinicao || 'grandes_canais',
              forcar_redownload: false,
              conferir_visual_ia: true,
            }
          });
          if (!r.ok) return toast(r.erro || 'Erro ao verificar mídias.', true);
          const aud = r.auditoria_anti_repeticao || {};
          toast(`🛡️ Verificação concluída! ${aud.videos_mp4 || r.videos_mp4 || 0} vídeos .MP4 únicos · ${aud.duplicados_substituidos || 0} repetidos trocados · 0% repetição no canal!`);
          window.abrirModalEditarVideoCriado(det.titulo, det.vid, det.slug);
        } finally {
          b.disabled = false;
          b.textContent = tOrig;
        }
      });
    }

    // Botão Salvar Roteiro / SRT / Descrição (Aba 2)
    if ($('#mvc-salvar-textos')) {
      $('#mvc-salvar-textos').onclick = () => safe(async () => {
        const b = $('#mvc-salvar-textos');
        b.disabled = true;
        b.textContent = '⏳ Salvando…';
        try {
          const novoRot = $('#mvc-txt-roteiro')?.value || '';
          const novoSrt = $('#mvc-txt-srt')?.value || '';
          const novaDesc = $('#mvc-txt-desc')?.value || '';
          const r = await api('/api/projetos-criados/salvar-edicao', {
            json: {
              titulo: det.titulo,
              vid: det.vid,
              pasta: det.pasta,
              roteiro: novoRot,
              srt_texto: novoSrt,
              descricao_viral: novaDesc,
            }
          });
          if (!r.ok) return toast(r.erro || 'Erro ao salvar alterações.', true);
          det.roteiro = novoRot;
          det.srt_texto = novoSrt;
          det.descricao_viral = novaDesc;
          toast('💾 Roteiro, SRT e Descrição salvos com sucesso nos arquivos do projeto!');
          if (window.carregarListaVideosCriados) window.carregarListaVideosCriados();
        } finally {
          b.disabled = false;
          b.textContent = '💾 Salvar Alterações nos Arquivos do Projeto';
        }
      });
    }

    // Botão Remontar Agora no DarkPlanner Studio (Aba 3)
    if ($('#mvc-btn-remontar-studio')) {
      $('#mvc-btn-remontar-studio').onclick = () => safe(async () => {
        const b = $('#mvc-btn-remontar-studio');
        const stBox = $('#mvc-refazer-status');
        b.disabled = true;
        b.textContent = '⏳ Remontando vídeo no DarkPlanner Studio (Modo Turbo + 0% Repetição no Canal)…';
        if (stBox) stBox.innerHTML = `<span style="color:#fbbf24">⏳ Aplicando direção de edição, verificando mídias em Modo Turbo (0% repetição no canal) e atualizando projeto no DarkPlanner Studio…</span>`;
        try {
          const forcar = ($('#mvc-refazer-forcar')?.value === '1');
          const predef = $('#mvc-refazer-predef')?.value || 'grandes_canais';
          const instr = ($('#mvc-refazer-instrucao')?.value || '').trim();
          const r = await api('/api/darkplanner/studio-aplicar-midias-reais', {
            json: {
              titulo: det.titulo,
              canal_id: det.canal_id || '',
              canal_nome: det.canal_nome || 'Cappito Vital',
              srt_texto: ($('#mvc-txt-srt')?.value || det.srt_texto || ''),
              roteiro: ($('#mvc-txt-roteiro')?.value || det.roteiro || ''),
              predefinicao_templates: predef,
              forcar_redownload: forcar,
              instrucao_usuario: instr,
              conferir_visual_ia: true,
            }
          });
          if (!r.ok) {
            if (stBox) stBox.innerHTML = `<span style="color:#f87171">❌ ${esc(r.erro || 'Falha ao remontar')}</span>`;
            return toast(r.erro || 'Falha ao remontar no Studio.', true);
          }
          const aud = r.auditoria_anti_repeticao || {};
          if (stBox) {
            stBox.innerHTML = `<div class="kcard" style="border-color:#22c55e;background:rgba(34,197,94,.1);color:#bbf7d0">
              ✅ <b>Vídeo remontado com sucesso no DarkPlanner Studio (0% Repetição no Canal)!</b><br>
              • Cenas Sincronizadas: <b>${r.cenas_sincronizadas || 0}</b> · Vídeos .MP4: <b>${r.videos_mp4 || 0}</b> · Hashes únicos: <b>${aud.arquivos_unicos_hash || r.videos_mp4 || 0}</b> · Repetições no vídeo/canal: <b>${aud.repeticoes_restantes ?? 0}</b><br>
              • Templates documentais aplicados: <b>${r.templates_aplicados || 0} (${r.pct_templates_real || 0}%)</b> + Cortes puros: <b>${r.cortes_puros || 0}</b>
            </div>`;
          }
          toast('✅ Vídeo remontado com sucesso no DarkPlanner Studio!');
          if (window.carregarListaVideosCriados) window.carregarListaVideosCriados();
        } finally {
          b.disabled = false;
          b.textContent = '🚀 Remontar Agora no DarkPlanner Studio (Sem Repetição)';
        }
      });
    }

    // Botão Reenviar Comando no Chat DarkPlanner (Aba 3)
    if ($('#mvc-btn-reenviar-chat')) {
      $('#mvc-btn-reenviar-chat').onclick = () => safe(async () => {
        const b = $('#mvc-btn-reenviar-chat');
        b.disabled = true;
        b.textContent = '⏳ Enviando no Chat DarkPlanner…';
        try {
          const r = await api('/api/darkplanner/criar-projeto-desktop', {
            json: {
              titulo: det.titulo,
              canal_id: det.canal_id || '',
              canal_nome: det.canal_nome || 'Cappito Vital',
              roteiro: ($('#mvc-txt-roteiro')?.value || det.roteiro || ''),
              srt_texto: ($('#mvc-txt-srt')?.value || det.srt_texto || ''),
              modo_skill: det.modo_skill || 'video_real',
              predefinicao_templates: $('#mvc-refazer-predef')?.value || det.predefinicao || 'grandes_canais',
              enviar_chat: true,
              auto_enter: true,
              chat_modelo_opcao: S.estChatDpOpcao || 'flash_high',
            }
          });
          if (!r.ok) return toast(r.erro || 'Erro ao enviar para o DarkPlanner.', true);
          toast('🚀 Projeto atualizado e enviado no Chat do DarkPlanner!');
        } finally {
          b.disabled = false;
          b.textContent = '💬 Reenviar Comando de Montagem no Chat DarkPlanner';
        }
      });
    }
  });

  // menu
  const nav = $('#nav');
  if (nav && !nav.querySelector('[data-view="estudio"]')) {
    const a = document.createElement('a'); a.dataset.view = 'estudio'; a.className = 'nav-destaque'; a.textContent = '⚡ Estúdio 1 clique';
    nav.insertBefore(a, nav.firstChild);
    a.onclick = () => go('estudio');
  }
  const btnSideDp = $('#btn-side-dp');
  if (btnSideDp && btnSideDp.parentElement) {
    if (!$('#btn-side-proc-dp')) {
      const btnProcSide = document.createElement('button');
      btnProcSide.type = 'button';
      btnProcSide.className = 'sm';
      btnProcSide.id = 'btn-side-proc-dp';
      btnProcSide.style.cssText = 'width:100%;justify-content:center;padding:8px 10px;font-size:12.5px;background:#14171f;border-color:rgba(34,211,238,.45);color:#67e8f9;font-weight:700';
      btnProcSide.textContent = '💬 Chat Fábrica Dark';
      btnProcSide.title = 'Chat da automação Fábrica Dark: parar projeto, corrigir erros nas etapas, analisar canais, ajustar roteiros e configurar estilos/formatos';
      btnSideDp.parentElement.insertBefore(btnProcSide, btnSideDp);
    }
    if (!$('#btn-side-dl-update')) {
      const btnDlSys = document.createElement('button');
      btnDlSys.type = 'button';
      btnDlSys.className = 'sm';
      btnDlSys.id = 'btn-side-dl-update';
      btnDlSys.style.cssText = 'width:100%;justify-content:center;padding:8px 10px;font-size:12px;background:#0f172a;border-color:#38bdf8;color:#7dd3fc;font-weight:700';
      btnDlSys.textContent = '⬇️ Baixar Atualização (.zip)';
      btnDlSys.title = 'Baixa o PACOTE_ATUALIZACAO_ANTIGRAVITY_MAQUINA_LEO.zip atualizado direto para o seu PC';
      btnSideDp.parentElement.insertBefore(btnDlSys, btnSideDp);
    }
  }
  if ($('#btn-side-proc-dp')) {
    $('#btn-side-proc-dp').textContent = '💬 Chat Fábrica Dark';
    $('#btn-side-proc-dp').onclick = () => window.abrirMonitorProcessoDp();
  }
  if ($('#btn-side-dl-update')) {
    $('#btn-side-dl-update').onclick = () => window.baixarPacoteSistemaZip();
  }
  setTimeout(() => {
    try {
      window.garantirMonitorProcessoDpUI();
      window.renderizarMonitorProcessoDpUI();
    } catch (_eInitDp) {}
  }, 120);
  if ($('#btn-side-ytcloner')) {
    $('#btn-side-ytcloner').onclick = () => {
      if (S.view !== 'estudio') {
        go('estudio');
        setTimeout(() => {
          const card = $('#e-yt-cloner-card');
          if (card) card.scrollIntoView({behavior: 'smooth', block: 'center'});
          $('#e-yt-clone-url')?.focus();
        }, 350);
      } else {
        const card = $('#e-yt-cloner-card');
        if (card) card.scrollIntoView({behavior: 'smooth', block: 'center'});
        $('#e-yt-clone-url')?.focus();
      }
    };
  }
})();

