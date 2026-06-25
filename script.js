// ─── Conjuntos de caracteres ─────────────────────────────────────

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMS  = '0123456789';
const SYMS  = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIG = /[O0Il1]/g; // caracteres visualmente ambíguos

// ─── Referências ao DOM ──────────────────────────────────────────

const $ = id => document.getElementById(id);

const elOutput = $('output');
const elLen    = $('len-range');
const elLenVal = $('len-val');
const elGenBtn = $('gen-btn');
const elCopy   = $('copy-btn');
const elToast  = $('toast');
const bars     = [1, 2, 3, 4].map(i => $('sb' + i));
const elSLabel = $('strength-label');

// ─── Configuração do medidor de força ───────────────────────────

const SCOLORS = ['#ff6b6b', '#ffca6f', '#6fffc4', '#7c6fff'];
const SLABELS = ['Fraca', 'Média', 'Forte', 'Muito forte'];

// ─── Funções principais ──────────────────────────────────────────

/**
 * Monta o conjunto de caracteres com base nas opções marcadas.
 * @returns {string} String com todos os caracteres permitidos.
 */
function charset() {
  let cs = '';
  if ($('opt-upper').checked) cs += UPPER;
  if ($('opt-lower').checked) cs += LOWER;
  if ($('opt-num').checked)   cs += NUMS;
  if ($('opt-sym').checked)   cs += SYMS;
  if ($('opt-noamb').checked) cs = cs.replace(AMBIG, '');
  return cs;
}

/**
 * Gera uma senha aleatória criptograficamente segura
 * usando crypto.getRandomValues().
 */
function generate() {
  const len = parseInt(elLen.value);
  const cs  = charset();

  if (!cs) {
    elOutput.textContent = 'Selecione pelo menos um tipo';
    updateStrength('');
    return;
  }

  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr, v => cs[v % cs.length]).join('');

  elOutput.textContent = pwd;
  updateStrength(pwd);
}

/**
 * Calcula um score de 0 a 3 para a força da senha.
 * @param {string} pwd
 * @returns {number} -1 (inválida) | 0 (fraca) | 1 | 2 | 3 (muito forte)
 */
function score(pwd) {
  const invalid = ['Clique em gerar senha', 'Selecione pelo menos um tipo'];
  if (!pwd || invalid.includes(pwd)) return -1;

  let s = 0;
  if (pwd.length >= 8)                            s++;
  if (pwd.length >= 16)                           s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))    s++;
  if (/[0-9]/.test(pwd))                          s++;
  if (/[^A-Za-z0-9]/.test(pwd))                  s++;

  if (s <= 1) return 0;
  if (s === 2) return 1;
  if (s <= 4) return 2;
  return 3;
}

/**
 * Atualiza as barras e o rótulo do medidor de força.
 * @param {string} pwd
 */
function updateStrength(pwd) {
  const s = score(pwd);

  bars.forEach((bar, i) => {
    bar.style.background = (s >= 0 && i <= s) ? SCOLORS[s] : 'var(--border)';
  });

  elSLabel.textContent = s >= 0 ? SLABELS[s] : '';
  elSLabel.style.color = s >= 0 ? SCOLORS[s] : 'var(--muted)';
}

// ─── Eventos ─────────────────────────────────────────────────────

// Slider de comprimento: atualiza o valor exibido e regenera se já há senha
elLen.addEventListener('input', () => {
  elLenVal.textContent = elLen.value;
  const cur = elOutput.textContent;
  if (cur !== 'Clique em gerar senha' && cur !== 'Selecione pelo menos um tipo') {
    generate();
  }
});

// Botão principal: gerar senha
elGenBtn.addEventListener('click', generate);

// Botão copiar: copia a senha para a área de transferência
elCopy.addEventListener('click', () => {
  const txt = elOutput.textContent;
  const invalid = ['Clique em gerar senha', 'Selecione pelo menos um tipo'];
  if (!txt || invalid.includes(txt)) return;

  navigator.clipboard.writeText(txt).then(() => {
    elToast.textContent = '✓ copiado para área de transferência';
    setTimeout(() => { elToast.textContent = ''; }, 2200);
  });
});

// Botões de perfil rápido: aplicam configurações predefinidas e geram
document.querySelectorAll('.btn-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    elLen.value = btn.dataset.len;
    elLenVal.textContent = btn.dataset.len;

    $('opt-upper').checked = btn.dataset.upper === 'true';
    $('opt-lower').checked = btn.dataset.lower === 'true';
    $('opt-num').checked   = btn.dataset.num   === 'true';
    $('opt-sym').checked   = btn.dataset.sym   === 'true';

    generate();
  });
});

// ─── Inicialização ───────────────────────────────────────────────

generate();