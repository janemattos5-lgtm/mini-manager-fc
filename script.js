// ===== OS TIMES DA LIGA =====
const times = [
  {
    nome: "Leões FC",
    tatica: "equilibrado",
    jogadores: [
      { nome: "Rafael", posicao: "GOL", forca: 78 },
      { nome: "Bruno", posicao: "ZAG", forca: 80 },
      { nome: "Diego", posicao: "MEI", forca: 85 },
      { nome: "Thiago", posicao: "MEI", forca: 76 },
      { nome: "Lucas", posicao: "ATA", forca: 88 }
    ]
  },
  {
    nome: "Águias United",
    tatica: "equilibrado",
    jogadores: [
      { nome: "Marcos", posicao: "GOL", forca: 72 },
      { nome: "André", posicao: "ZAG", forca: 70 },
      { nome: "Felipe", posicao: "MEI", forca: 74 },
      { nome: "Caio", posicao: "MEI", forca: 68 },
      { nome: "Pedro", posicao: "ATA", forca: 79 }
    ]
  },
  {
    nome: "Tubarões EC",
    tatica: "ofensivo",
    jogadores: [
      { nome: "Henrique", posicao: "GOL", forca: 75 },
      { nome: "Gustavo", posicao: "ZAG", forca: 77 },
      { nome: "Mateus", posicao: "MEI", forca: 79 },
      { nome: "Vitor", posicao: "MEI", forca: 73 },
      { nome: "Renan", posicao: "ATA", forca: 82 }
    ]
  },
  {
    nome: "Lobos AC",
    tatica: "defensivo",
    jogadores: [
      { nome: "Sérgio", posicao: "GOL", forca: 80 },
      { nome: "Otávio", posicao: "ZAG", forca: 82 },
      { nome: "Daniel", posicao: "MEI", forca: 72 },
      { nome: "Igor", posicao: "MEI", forca: 70 },
      { nome: "Fábio", posicao: "ATA", forca: 74 }
    ]
  }
];

const meuTime = times[0];

// ===== REGRAS DO MERCADO (NOVO) =====
const DINHEIRO_INICIAL = 100;
const MIN_JOGADORES = 5;
const MAX_JOGADORES = 7;
const PREMIOS = [60, 40, 25, 15]; // prêmio do 1º, 2º, 3º e 4º lugar

meuTime.dinheiro = DINHEIRO_INICIAL;

// Jogadores livres, que você pode contratar
let mercado = [
  { nome: "Gabriel", posicao: "GOL", forca: 86 },
  { nome: "Paulo", posicao: "GOL", forca: 70 },
  { nome: "Leandro", posicao: "ZAG", forca: 84 },
  { nome: "Rodrigo", posicao: "ZAG", forca: 75 },
  { nome: "Arthur", posicao: "MEI", forca: 90 },
  { nome: "Júlio", posicao: "MEI", forca: 72 },
  { nome: "Kaique", posicao: "ATA", forca: 92 },
  { nome: "Wesley", posicao: "ATA", forca: 78 }
];

// ===== AS TÁTICAS =====
const TATICAS = {
  defensivo:   { ataque: -10, defesa: 10,  chances: 4 },
  equilibrado: { ataque: 0,   defesa: 0,   chances: 6 },
  ofensivo:    { ataque: 10,  defesa: -10, chances: 8 }
};

// ===== CALENDÁRIO =====
const rodadas = [
  [[0, 1], [2, 3]],
  [[2, 0], [3, 1]],
  [[0, 3], [1, 2]]
];

let rodadaAtual = 0;
let ultimosResultados = [];

// ===== SALVAR E CARREGAR =====
const CHAVE_SALVAMENTO = "miniManagerFC";

function salvarJogo() {
  const dados = {
    times: times,
    rodadaAtual: rodadaAtual,
    ultimosResultados: ultimosResultados,
    mercado: mercado          // NOVO: o mercado também é salvo
  };
  localStorage.setItem(CHAVE_SALVAMENTO, JSON.stringify(dados));
}

function carregarJogo() {
  const texto = localStorage.getItem(CHAVE_SALVAMENTO);
  if (texto === null) {
    return false;
  }

  const dados = JSON.parse(texto);

  for (let i = 0; i < times.length; i++) {
    Object.assign(times[i], dados.times[i]);
  }
  rodadaAtual = dados.rodadaAtual;
  ultimosResultados = dados.ultimosResultados;

  // Jogos salvos antes do mercado existir não têm essa parte
  if (dados.mercado) {
    mercado = dados.mercado;
  }

  return true;
}

// ===== CÁLCULOS =====

function media(jogadores) {
  let soma = 0;
  for (const jogador of jogadores) {
    soma = soma + jogador.forca;
  }
  return Math.round(soma / jogadores.length);
}

function forcaAtaque(time) {
  const atacantes = time.jogadores.filter(j => j.posicao === "MEI" || j.posicao === "ATA");
  return media(atacantes);
}

function forcaDefesa(time) {
  const defensores = time.jogadores.filter(j => j.posicao === "GOL" || j.posicao === "ZAG" || j.posicao === "MEI");
  return media(defensores);
}

function calcularTime(time) {
  const tatica = TATICAS[time.tatica];
  return {
    ataque: forcaAtaque(time) + tatica.ataque,
    defesa: forcaDefesa(time) + tatica.defesa,
    chances: tatica.chances
  };
}

function calcularGols(atacante, defensor) {
  let chanceDeGol = (atacante.ataque - defensor.defesa / 2) / 2;
  if (chanceDeGol < 5) {
    chanceDeGol = 5;
  }
  let gols = 0;
  for (let i = 0; i < atacante.chances; i++) {
    if (Math.random() * 100 < chanceDeGol) {
      gols++;
    }
  }
  return gols;
}

// ===== MERCADO (NOVO) =====

// Preço de compra: quanto mais forte, mais caro (mínimo de R$ 10 mi)
function preco(jogador) {
  // Math.max escolhe o MAIOR dos dois números
  return Math.max(10, (jogador.forca - 60) * 2);
}

// Preço de venda: 80% do preço de compra
function precoVenda(jogador) {
  return Math.round(preco(jogador) * 0.8);
}

function mostrarMensagem(texto) {
  document.getElementById("mensagem").textContent = texto;
}

function comprar(indice) {
  const jogador = mercado[indice];
  const valor = preco(jogador);

  // Regra 1: elenco cheio?
  if (meuTime.jogadores.length >= MAX_JOGADORES) {
    mostrarMensagem("Elenco cheio (máximo 7). Venda alguém primeiro.");
    return; // "return" para a função aqui mesmo
  }

  // Regra 2: tem dinheiro?
  if (meuTime.dinheiro < valor) {
    mostrarMensagem("Dinheiro insuficiente para contratar " + jogador.nome + ".");
    return;
  }

  meuTime.dinheiro -= valor;          // paga
  mercado.splice(indice, 1);          // .splice tira o jogador do mercado
  meuTime.jogadores.push(jogador);    // e coloca no seu time

  mostrarMensagem("Você contratou " + jogador.nome + "!");
  salvarJogo();
  atualizarTela();
}

function vender(indice) {
  const jogador = meuTime.jogadores[indice];

  // Regra 1: mínimo de jogadores
  if (meuTime.jogadores.length <= MIN_JOGADORES) {
    mostrarMensagem("Seu time precisa ter pelo menos 5 jogadores. Contrate alguém antes de vender.");
    return;
  }

  // Regra 2: não pode ficar sem ninguém numa posição
  const mesmaPosicao = meuTime.jogadores.filter(j => j.posicao === jogador.posicao);
  if (mesmaPosicao.length === 1) {
    mostrarMensagem("Você não pode ficar sem nenhum " + jogador.posicao + ".");
    return;
  }

  meuTime.dinheiro += precoVenda(jogador);   // recebe o dinheiro
  meuTime.jogadores.splice(indice, 1);       // tira do seu time
  mercado.push(jogador);                     // e coloca no mercado

  mostrarMensagem("Você vendeu " + jogador.nome + ".");
  salvarJogo();
  atualizarTela();
}

// ===== TEMPORADA =====

function zerarTabela() {
  for (const time of times) {
    time.pontos = 0;
    time.jogos = 0;
    time.vitorias = 0;
    time.empates = 0;
    time.derrotas = 0;
    time.golsPro = 0;
    time.golsContra = 0;
  }
  rodadaAtual = 0;
  ultimosResultados = [];
}

function registrarResultado(time, golsFeitos, golsSofridos) {
  time.jogos++;
  time.golsPro += golsFeitos;
  time.golsContra += golsSofridos;

  if (golsFeitos > golsSofridos) {
    time.vitorias++;
    time.pontos += 3;
  } else if (golsFeitos === golsSofridos) {
    time.empates++;
    time.pontos += 1;
  } else {
    time.derrotas++;
  }
}

function jogarPartida(casa, fora) {
  const dadosCasa = calcularTime(casa);
  const dadosFora = calcularTime(fora);

  const golsCasa = calcularGols(dadosCasa, dadosFora);
  const golsFora = calcularGols(dadosFora, dadosCasa);

  registrarResultado(casa, golsCasa, golsFora);
  registrarResultado(fora, golsFora, golsCasa);

  return casa.nome + " " + golsCasa + " x " + golsFora + " " + fora.nome;
}

function jogarRodada() {
  ultimosResultados = [];

  for (const jogo of rodadas[rodadaAtual]) {
    const casa = times[jogo[0]];
    const fora = times[jogo[1]];
    ultimosResultados.push(jogarPartida(casa, fora));
  }

  rodadaAtual++;

  // NOVO: fim da temporada? Paga o prêmio conforme a posição
  if (rodadaAtual === rodadas.length) {
    const posicao = ordenarTabela().indexOf(meuTime); // 0 = 1º lugar
    meuTime.dinheiro += PREMIOS[posicao];
  }

  mostrarMensagem("");
  salvarJogo();
  atualizarTela();
}

// O elenco e o dinheiro CONTINUAM na nova temporada
function novaTemporada() {
  zerarTabela();
  mostrarMensagem("");
  salvarJogo();
  atualizarTela();
}

// ===== TELA =====

function mostrarMeuTime() {
  const dados = calcularTime(meuTime);

  document.getElementById("meu-nome").textContent = meuTime.nome;
  document.getElementById("meu-dinheiro").textContent = meuTime.dinheiro;
  document.getElementById("meu-ataque").textContent = dados.ataque;
  document.getElementById("meu-defesa").textContent = dados.defesa;
  document.getElementById("minha-tatica").value = meuTime.tatica;

  const lista = document.getElementById("meus-jogadores");
  lista.innerHTML = "";

  for (let i = 0; i < meuTime.jogadores.length; i++) {
    const jogador = meuTime.jogadores[i];
    const item = document.createElement("li");

    item.innerHTML = `
      <span>${jogador.posicao} ${jogador.nome} <span class="nota">${jogador.forca}</span></span>
      <button class="btn-pequeno btn-vender">Vender R$ ${precoVenda(jogador)}</button>
    `;

    // querySelector encontra o botão DENTRO deste item
    item.querySelector("button").addEventListener("click", function () {
      vender(i);
    });

    lista.appendChild(item);
  }
}

// NOVO: mostra a lista do mercado com os botões de compra
function mostrarMercado() {
  const lista = document.getElementById("mercado");
  lista.innerHTML = "";

  for (let i = 0; i < mercado.length; i++) {
    const jogador = mercado[i];
    const item = document.createElement("li");

    item.innerHTML = `
      <span>${jogador.posicao} ${jogador.nome} <span class="nota">${jogador.forca}</span></span>
      <button class="btn-pequeno">Comprar R$ ${preco(jogador)}</button>
    `;

    item.querySelector("button").addEventListener("click", function () {
      comprar(i);
    });

    lista.appendChild(item);
  }
}

function ordenarTabela() {
  return [...times].sort(function (a, b) {
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos;
    }
    return (b.golsPro - b.golsContra) - (a.golsPro - a.golsContra);
  });
}

function mostrarTabela() {
  const corpo = document.getElementById("tabela");
  corpo.innerHTML = "";

  const ordenados = ordenarTabela();

  for (let i = 0; i < ordenados.length; i++) {
    const time = ordenados[i];
    const saldo = time.golsPro - time.golsContra;

    const linha = document.createElement("tr");
    if (time === meuTime) {
      linha.classList.add("meu-time");
    }

    linha.innerHTML = `
      <td>${i + 1}</td>
      <td class="nome-time">${time.nome}</td>
      <td>${time.pontos}</td>
      <td>${time.jogos}</td>
      <td>${time.vitorias}</td>
      <td>${time.empates}</td>
      <td>${time.derrotas}</td>
      <td>${saldo}</td>
    `;
    corpo.appendChild(linha);
  }
}

function mostrarResultados() {
  const lista = document.getElementById("resultados");
  lista.innerHTML = "";

  for (const texto of ultimosResultados) {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.appendChild(item);
  }

  const titulo = document.getElementById("titulo-rodada");
  if (rodadaAtual > 0) {
    titulo.textContent = "Resultados da rodada " + rodadaAtual;
  } else {
    titulo.textContent = "";
  }

  const campeao = document.getElementById("campeao");
  if (rodadaAtual === rodadas.length) {
    const tabela = ordenarTabela();
    const posicao = tabela.indexOf(meuTime);
    campeao.innerHTML =
      "Campeão: " + tabela[0].nome + "!<br>" +
      "Seu time ficou em " + (posicao + 1) + "º e ganhou R$ " + PREMIOS[posicao] + " mi de prêmio.";
  } else {
    campeao.textContent = "";
  }
}

function atualizarBotao() {
  const botao = document.getElementById("btn-rodada");
  if (rodadaAtual < rodadas.length) {
    botao.textContent = "Jogar rodada " + (rodadaAtual + 1);
  } else {
    botao.textContent = "Nova temporada";
  }
}

function atualizarTela() {
  mostrarMeuTime();
  mostrarTabela();
  mostrarResultados();
  mostrarMercado();   // NOVO
  atualizarBotao();
}

// ===== INÍCIO =====

if (carregarJogo() === false) {
  zerarTabela();
}
atualizarTela();

document.getElementById("minha-tatica").addEventListener("change", function () {
  meuTime.tatica = document.getElementById("minha-tatica").value;
  salvarJogo();
  mostrarMeuTime();
});

document.getElementById("btn-rodada").addEventListener("click", function () {
  if (rodadaAtual < rodadas.length) {
    jogarRodada();
  } else {
    novaTemporada();
  }
});

// NOVO: apaga o jogo salvo e recarrega a página
document.getElementById("btn-reset").addEventListener("click", function () {
  if (confirm("Apagar todo o progresso e começar do zero?")) {
    localStorage.removeItem(CHAVE_SALVAMENTO);
    location.reload();
  }
});
