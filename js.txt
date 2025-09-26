// --- Configurações IndexedDB ---
const DB_NAME = 'SistemaFinanceiroDB';
const DB_VERSION = 4; // aumente a versão para criar nova store contas
const STORE_LANCAMENTOS = 'lancamentos';
const STORE_CATEGORIAS = 'categorias';
const STORE_CLIENTES = 'clientes';
const STORE_CONTAS = 'contas';

let db;

// Abrir banco IndexedDB com upgrade para novas stores
function abrirDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = e => reject(e.target.error);
    request.onsuccess = e => {
      db = e.target.result;
      resolve(db);
    };

    request.onupgradeneeded = e => {
      db = e.target.result;

      if (!db.objectStoreNames.contains(STORE_LANCAMENTOS)) {
        db.createObjectStore(STORE_LANCAMENTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIAS)) {
        db.createObjectStore(STORE_CATEGORIAS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CLIENTES)) {
        db.createObjectStore(STORE_CLIENTES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONTAS)) {
        db.createObjectStore(STORE_CONTAS, { keyPath: 'id' });
      }
    };
  });
}

// --- Utilitários ---
function gerarId() {
  return String(Date.now()) + Math.floor(Math.random() * 1000);
}

function formatReal(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// --- Funções Lançamentos ---
function adicionarLancamento(lancamento) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LANCAMENTOS, 'readwrite');
    const store = tx.objectStore(STORE_LANCAMENTOS);
    const request = store.add(lancamento);

    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

function atualizarLancamento(lancamento) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LANCAMENTOS, 'readwrite');
    const store = tx.objectStore(STORE_LANCAMENTOS);
    const request = store.put(lancamento);

    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

function removerLancamento(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LANCAMENTOS, 'readwrite');
    const store = tx.objectStore(STORE_LANCAMENTOS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

function listarLancamentos() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LANCAMENTOS, 'readonly');
    const store = tx.objectStore(STORE_LANCAMENTOS);
    const request = store.getAll();

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

// --- Funções Categorias ---
function adicionarCategoria(categoria) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CATEGORIAS, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIAS);
    const request = store.add(categoria);

    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

function listarCategorias() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CATEGORIAS, 'readonly');
    const store = tx.objectStore(STORE_CATEGORIAS);
    const request = store.getAll();

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

function removerCategoria(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CATEGORIAS, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIAS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = e => reject(e.target.error);
  });
}

// --- Funções Clientes ---
function adicionarCliente(cliente) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CLIENTES, 'readwrite');
    const store = tx.objectStore(STORE_CLIENTES);
    const req = store.add(cliente);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

function listarClientes() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CLIENTES, 'readonly');
    const store = tx.objectStore(STORE_CLIENTES);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}

function atualizarCliente(cliente) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CLIENTES, 'readwrite');
    const store = tx.objectStore(STORE_CLIENTES);
    const req = store.put(cliente);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

function removerCliente(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CLIENTES, 'readwrite');
    const store = tx.objectStore(STORE_CLIENTES);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

// --- Funções Contas ---
function adicionarConta(conta) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CONTAS, 'readwrite');
    const store = tx.objectStore(STORE_CONTAS);
    const req = store.add(conta);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

function listarContas() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CONTAS, 'readonly');
    const store = tx.objectStore(STORE_CONTAS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}

function atualizarConta(conta) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CONTAS, 'readwrite');
    const store = tx.objectStore(STORE_CONTAS);
    const req = store.put(conta);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

function removerConta(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CONTAS, 'readwrite');
    const store = tx.objectStore(STORE_CONTAS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

// --- DOM e variáveis ---
const form = document.getElementById('formLancamento');
const lista = document.getElementById('listaLancamentos');
const saldoEl = document.getElementById('saldo');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const formCategoria = document.getElementById('formCategoria');
const inputCategoria = document.getElementById('inputCategoria');
const listaCategorias = document.getElementById('listaCategorias');

const formCliente = document.getElementById('formCliente');
const listaClientes = document.getElementById('listaClientes');
const btnCancelarCliente = document.getElementById('btnCancelarCliente');

const formConta = document.getElementById('formConta');
const listaContas = document.getElementById('listaContas');
const btnCancelarConta = document.getElementById('btnCancelarConta');

let lancamentos = [];
let categorias = [];
let clientes = [];
let contas = [];

let editId = null;
let editClienteId = null;
let editContaId = null;

// --- Funções interface ---

// SALDO - calcula saldo geral (receitas - despesas)
function calcularSaldo() {
  let receitas = 0;
  let despesas = 0;
  for (const l of lancamentos) {
    if (l.tipo === 'receita') receitas += Number(l.valor);
    else despesas += Number(l.valor);
  }
  const saldo = receitas - despesas;
  saldoEl.textContent = 'Saldo: ' + formatReal(saldo);
}

// RENDER tabela lançamentos
function renderTabela() {
  lista.innerHTML = '';
  const copia = [...lancamentos].sort((a, b) => (b.data || 0) - (a.data || 0));
  for (const l of copia) {
    const tr = document.createElement('tr');

    const dt = l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '';
    tr.innerHTML = `
      <td>${dt}</td>
      <td>${escapeHtml(l.descricao)}</td>
      <td>${escapeHtml(l.categoria || 'Geral')}</td>
      <td>${formatReal(Number(l.valor))}</td>
      <td>${l.tipo}</td>
      <td>
        <div class="actions-btn">
          <button onclick="editar('${l.id}')" class="btn btn-sm btn-outline-primary me-1">✏️</button>
          <button class="btn btn-sm btn-outline-danger" onclick="remover('${l.id}')">🗑️</button>
        </div>
      </td>
    `;
    lista.appendChild(tr);
  }
  calcularSaldo();
}

function limparEdicao() {
  editId = null;
  form.reset();
  btnSalvar.textContent = 'Adicionar';
  btnCancelar.style.display = 'none';
}

window.editar = function (id) {
  const item = lancamentos.find(x => x.id === id);
  if (!item) return;
  editId = item.id;
  form.descricao.value = item.descricao;
  form.valor.value = item.valor;
  form.tipo.value = item.tipo;
  form.data.value = item.data ? new Date(item.data).toISOString().slice(0, 10) : '';
  form.categoria.value = item.categoria || 'Geral';
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.remover = async function (id) {
  if (!confirm('Remover este lançamento?')) return;
  await removerLancamento(id);
  lancamentos = lancamentos.filter(x => x.id !== id);
  renderTabela();
};

// --- Categorias ---
function renderCategorias() {
  listaCategorias.innerHTML = '';
  categorias.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = cat.nome;

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.onclick = async () => {
      if (confirm(`Excluir categoria "${cat.nome}"?`)) {
        await removerCategoria(cat.id);
        categorias = categorias.filter(c => c.id !== cat.id);
        renderCategorias();
        popularSelectCategorias();
      }
    };

    li.appendChild(btnExcluir);
    listaCategorias.appendChild(li);
  });
}

function popularSelectCategorias() {
  const select = document.getElementById('categoria');
  select.innerHTML = '';
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.nome;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
  // Garante categoria padrão "Geral"
  if (!categorias.find(c => c.nome === 'Geral')) {
    const geral = document.createElement('option');
    geral.value = 'Geral';
    geral.textContent = 'Geral';
    select.insertBefore(geral, select.firstChild);
  }
}

// --- Clientes ---
function renderClientes() {
  listaClientes.innerHTML = '';
  for (const cliente of clientes) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${escapeHtml(cliente.nome)}</td>
      <td>${escapeHtml(cliente.cpf)}</td>
      <td>${escapeHtml(cliente.telefone || '')}</td>
      <td>${escapeHtml(cliente.rua || '')}${cliente.numero ? ', ' + escapeHtml(cliente.numero) : ''}${cliente.bairro ? ' - ' + escapeHtml(cliente.bairro) : ''}</td>
      <td>${escapeHtml(cliente.cidade || '')}</td>
      <td class="actions-btn">
        <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${cliente.id}')">✏️</button>
        <button class="btn btn-sm btn-outline-danger" onclick="removerClienteConfirm('${cliente.id}')">🗑️</button>
      </td>
    `;

    listaClientes.appendChild(tr);
  }
}

function limparEdicaoCliente() {
  editClienteId = null;
  formCliente.reset();
  btnCancelarCliente.style.display = 'none';
  document.getElementById('btnSalvarCliente').textContent = 'Adicionar Cliente';
}

window.editarCliente = function (id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;

  editClienteId = cliente.id;
  formCliente.clienteNome.value = cliente.nome;
  formCliente.clienteCPF.value = cliente.cpf;
  formCliente.clienteTelefone.value = cliente.telefone || '';
  formCliente.clienteRua.value = cliente.rua || '';
  formCliente.clienteNumero.value = cliente.numero || '';
  formCliente.clienteBairro.value = cliente.bairro || '';
  formCliente.clienteCidade.value = cliente.cidade || '';
  formCliente.clienteCEP.value = cliente.cep || '';

  btnCancelarCliente.style.display = 'inline-block';
  document.getElementById('btnSalvarCliente').textContent = 'Salvar alterações';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.removerClienteConfirm = async function (id) {
  if (!confirm('Remover este cliente?')) return;
  await removerCliente(id);
  clientes = clientes.filter(c => c.id !== id);
  renderClientes();
};

// --- Contas ---
function renderContas() {
  listaContas.innerHTML = '';
  for (const conta of contas) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${escapeHtml(conta.nome)}</td>
      <td>${formatReal(conta.saldoInicial)}</td>
      <td class="actions-btn">
        <button class="btn btn-sm btn-outline-primary" onclick="editarConta('${conta.id}')">✏️</button>
        <button class="btn btn-sm btn-outline-danger" onclick="removerContaConfirm('${conta.id}')">🗑️</button>
      </td>
    `;

    listaContas.appendChild(tr);
  }
}

function limparEdicaoConta() {
  editContaId = null;
  formConta.reset();
  btnCancelarConta.style.display = 'none';
  document.getElementById('btnSalvarConta').textContent = 'Adicionar Conta';
}

window.editarConta = function (id) {
  const conta = contas.find(c => c.id === id);
  if (!conta) return;

  editContaId = conta.id;
  formConta.contaNome.value = conta.nome;
  formConta.contaSaldoInicial.value = conta.saldoInicial;

  btnCancelarConta.style.display = 'inline-block';
  document.getElementById('btnSalvarConta').textContent = 'Salvar alterações';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.removerContaConfirm = async function (id) {
  if (!confirm('Remover esta conta?')) return;
  await removerConta(id);
  contas = contas.filter(c => c.id !== id);
  renderContas();
};

// --- Eventos Formulários ---

// Form Lançamentos
form.addEventListener('submit', async e => {
  e.preventDefault();

  const descricao = form.descricao.value.trim();
  const valor = Number(form.valor.value);
  const tipo = form.tipo.value;
  const data = form.data.value ? new Date(form.data.value).getTime() : null;
  const categoria = form.categoria.value || 'Geral';

  if (!descricao || !valor || !tipo) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  if (editId) {
    // Editar
    const lancamento = { id: editId, descricao, valor, tipo, data, categoria };
    await atualizarLancamento(lancamento);
    lancamentos = lancamentos.map(l => (l.id === editId ? lancamento : l));
  } else {
    // Adicionar
    const lancamento = { id: gerarId(), descricao, valor, tipo, data, categoria };
    await adicionarLancamento(lancamento);
    lancamentos.push(lancamento);
  }

  limparEdicao();
  renderTabela();
});

// Cancelar edição lançamento
btnCancelar.addEventListener('click', e => {
  e.preventDefault();
  limparEdicao();
});

// Form Categorias
formCategoria.addEventListener('submit', async e => {
  e.preventDefault();
  const nome = inputCategoria.value.trim();
  if (!nome) {
    alert('Informe o nome da categoria!');
    return;
  }
  if (categorias.find(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    alert('Categoria já existe!');
    return;
  }
  const categoria = { id: gerarId(), nome };
  await adicionarCategoria(categoria);
  categorias.push(categoria);
  inputCategoria.value = '';
  renderCategorias();
  popularSelectCategorias();
});

// Form Clientes
formCliente.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = formCliente.clienteNome.value.trim();
  const cpf = formCliente.clienteCPF.value.trim();
  const telefone = formCliente.clienteTelefone.value.trim();
  const rua = formCliente.clienteRua.value.trim();
  const numero = formCliente.clienteNumero.value.trim();
  const bairro = formCliente.clienteBairro.value.trim();
  const cidade = formCliente.clienteCidade.value.trim();
  const cep = formCliente.clienteCEP.value.trim();

  if (!nome || !cpf) {
    alert('Nome e CPF são obrigatórios!');
    return;
  }

  if (editClienteId) {
    const cliente = { id: editClienteId, nome, cpf, telefone, rua, numero, bairro, cidade, cep };
    await atualizarCliente(cliente);
    clientes = clientes.map(c => (c.id === editClienteId ? cliente : c));
  } else {
    const cliente = { id: gerarId(), nome, cpf, telefone, rua, numero, bairro, cidade, cep };
    await adicionarCliente(cliente);
    clientes.push(cliente);
  }

  limparEdicaoCliente();
  renderClientes();
});

// Cancelar edição cliente
btnCancelarCliente.addEventListener('click', e => {
  e.preventDefault();
  limparEdicaoCliente();
});

// Form Contas
formConta.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = formConta.contaNome.value.trim();
  const saldoInicial = Number(formConta.contaSaldoInicial.value);

  if (!nome) {
    alert('Informe o nome da conta!');
    return;
  }
  if (isNaN(saldoInicial) || saldoInicial < 0) {
    alert('Saldo inicial inválido!');
    return;
  }

  if (editContaId) {
    const conta = { id: editContaId, nome, saldoInicial };
    await atualizarConta(conta);
    contas = contas.map(c => (c.id === editContaId ? conta : c));
  } else {
    const conta = { id: gerarId(), nome, saldoInicial };
    await adicionarConta(conta);
    contas.push(conta);
  }

  limparEdicaoConta();
  renderContas();
});

// Cancelar edição conta
btnCancelarConta.addEventListener('click', e => {
  e.preventDefault();
  limparEdicaoConta();
});

// --- Inicialização ---
async function carregarDados() {
  await abrirDB();

  lancamentos = await listarLancamentos();
  categorias = await listarCategorias();
  clientes = await listarClientes();
  contas = await listarContas();

  // Se não tiver categoria Geral, cria uma
  if (!categorias.find(c => c.nome === 'Geral')) {
    const geral = { id: gerarId(), nome: 'Geral' };
    await adicionarCategoria(geral);
    categorias.push(geral);
  }

  renderTabela();
  renderCategorias();
  popularSelectCategorias();
  renderClientes();
  renderContas();
}

window.onload = () => {
  carregarDados();
};
