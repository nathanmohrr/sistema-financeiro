# Fase 1 – Colocar Login e Dados na Nuvem com Firebase

Objetivo: sem complicar. Você vai ter cadastro/login e salvar dados na nuvem (Firestore). Depois, todo PC com internet pode acessar com o mesmo login.

## Passo 0 – Criar projeto no Firebase
- https://firebase.google.com → Console → Add project → siga os passos.

## Passo 1 – Habilitar Auth (Email/Password)
- Build → Authentication → Sign-in method → ative Email/Password.

## Passo 2 – Criar Firestore
- Build → Firestore Database → Create database → Production mode.

## Passo 3 – Pegar a Config do App Web
- Project settings (engrenagem) → Your apps → Web → registre um app → copie as chaves (apiKey, authDomain…).

Crie um arquivo `config.json` na raiz do projeto com este formato (NÃO suba para Git):
```json
{
  "firebase": {
    "apiKey": "SUA_API_KEY",
    "authDomain": "seu-app.firebaseapp.com",
    "projectId": "seu-app",
    "storageBucket": "seu-app.appspot.com",
    "messagingSenderId": "",
    "appId": ""
  }
}
```

Se preferir, use `config.sample.json` (modelo) e depois copie para `config.json` com seus valores reais.

## Passo 4 – Regras de segurança (isolando cada empresa)
Cole as regras abaixo em Firestore → Rules → Publish. Elas permitem que cada usuário acesse apenas documentos onde `empresaId` bate com o dele.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function userEmpresa() {
      // Vamos guardar empresaId no documento do usuário em /users/{uid}
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.empresaId;
    }

    // Regra padrão por coleção: exige auth e empresaId igual
    match /{collection}/{docId} {
      allow read, write: if isSignedIn() && resource.data.empresaId == userEmpresa();
    }

    // Coleção users: cada usuário pode ler/escrever seu próprio perfil
    match /users/{uid} {
      allow read, write: if isSignedIn() && uid == request.auth.uid;
    }
  }
}
```

Estratégia simples:
- Ao criar a conta do primeiro usuário da empresa, você cria um doc em `users/{uid}` com `{ empresaId: 'uma-uuid-da-empresa' }`.
- Todo documento das suas coleções (produtos, vendas, lancamentos, etc.) deve ter o campo `empresaId` com esse valor.

## Passo 5 – Adicionar Firebase no `index.html`
Adicione antes do seu script principal estes 3 scripts CDN do Firebase (Auth + Firestore):

```html
<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js"></script>
<script>
(async function(){
  // Carrega config.json
  const resp = await fetch('config.json');
  const cfg = await resp.json();

  // Inicializa Firebase
  firebase.initializeApp(cfg.firebase);
  window.auth = firebase.auth();
  window.db = firebase.firestore();

  // Observa login
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Aqui você pode esconder tela de login e mostrar o app
      console.log('Logado como:', user.email);
      // Exemplo: garantir perfil
      const userRef = db.collection('users').doc(user.uid);
      const snap = await userRef.get();
      if (!snap.exists) {
        // Se for o primeiro usuário, gere um empresaId e salve
        const empresaId = crypto.randomUUID();
        await userRef.set({ empresaId, email: user.email, createdAt: new Date().toISOString() });
      }
      window.currentUser = user;
    } else {
      console.log('Não logado');
      window.currentUser = null;
    }
  });
})();
</script>
```

## Passo 6 – Tela de login simples
No seu `index.html`, crie um bloco de login (form com email e senha) e dois botões: “Criar conta” e “Entrar”. Exemplos:

```html
<form id="loginForm">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="senha" placeholder="Senha" required>
  <button type="submit">Entrar</button>
  <button type="button" id="criarConta">Criar conta</button>
</form>
<script>
// Entrar
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  await auth.signInWithEmailAndPassword(email, senha);
});
// Criar conta
document.getElementById('criarConta').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  await auth.createUserWithEmailAndPassword(email, senha);
});
</script>
```

Depois do login, esconda o formulário e mostre seu app. Se sair (`auth.signOut()`), mostre o login de novo.

## Passo 7 – Salvando/ lendo dados no Firestore
Regra de ouro: toda coleção deve ter `empresaId`.

- Exemplo: salvar um produto
```js
const empresaId = (await db.collection('users').doc(currentUser.uid).get()).data().empresaId;
await db.collection('produtos').add({ nome, preco, estoque, empresaId, createdAt: new Date().toISOString() });
```

- Exemplo: listar produtos da empresa
```js
const empresaId = (await db.collection('users').doc(currentUser.uid).get()).data().empresaId;
const snap = await db.collection('produtos').where('empresaId','==',empresaId).get();
const produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

Dica: crie uma pequena camada `DataService` para concentrar estas chamadas, facilitando a troca do IndexedDB para Firestore.

## Passo 8 – PWA (opcional, mas útil)
- Adicione `manifest.webmanifest` com nome, ícones.
- Adicione `service-worker.js` simples para cache estático.
- No `index.html`, referencie o manifest: `<link rel="manifest" href="manifest.webmanifest">`.
- No Chrome/Edge, aparecerá “Instalar aplicativo”.

---

Pronto! Com isso você já tem login e dados na nuvem. Quando quiser o instalador tradicional, siga a Fase 2.

## Validação rápida (agora)

1) CRUD básico
- Entre no app, faça login e crie 1–2 produtos (ou outro módulo).
- No Console → Firestore → coleção usada (ex.: `produtos`), verifique se cada doc tem `empresaId`.

2) Isolamento por empresa
- Saia e crie outro usuário (email diferente).
- Entre com ele: a lista não deve mostrar os docs do primeiro usuário.

3) Dois usuários na mesma empresa (opcional)
- No Firestore, abra `users/{uid}` do usuário “dono” e copie o `empresaId`.
- Abra `users/{uid}` do segundo usuário e cole o mesmo `empresaId`.
- Recarregue o app logado como o segundo usuário: ambos verão os mesmos dados.

Notas
- As regras bloqueiam mudar `empresaId` via app e exigem que ele exista no payload ao criar.
- A alteração direta em `users/{uid}` pelo Console é administrativa e não passa pelas regras.
