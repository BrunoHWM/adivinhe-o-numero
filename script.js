
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const INITIAL_POINTS = 1000;
const POINTS_LOST_PER_MISS = 50;

let secretNumber;
let attempts = 0;
let score = INITIAL_POINTS;
let round = 1;
let gameFinished = false;

const playerNameInput = document.getElementById("playerName");
const guessInput = document.getElementById("guess");
const guessButton = document.getElementById("guessButton");
const newGameButton = document.getElementById("newGameButton");
const messageElement = document.getElementById("message");
const attemptsElement = document.getElementById("attempts");
const scoreElement = document.getElementById("possiblePoints");
const bestScoreElement = document.getElementById("bestScore");
const roundElement = document.getElementById("roundNumber");
const rankingList = document.getElementById("rankingList");

function showMessage(title, description, type = "") {
    messageElement.className = `message ${type}`.trim();

    const strong = messageElement.querySelector("strong");
    const paragraph = messageElement.querySelector("p");

    if (strong && paragraph) {
        strong.textContent = title;
        paragraph.textContent = description;
    } else {
        messageElement.textContent = `${title} ${description}`;
    }
}

function startGame() {
    secretNumber = Math.floor(
        Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)
    ) + MIN_NUMBER;

    attempts = 0;
    score = INITIAL_POINTS;
    gameFinished = false;

    attemptsElement.textContent = attempts;
    scoreElement.textContent = score;
    roundElement.textContent = round;

    guessInput.value = "";
    guessInput.disabled = false;
    guessButton.disabled = false;
    newGameButton.hidden = true;

    showMessage(
        "Pronto para começar?",
        "Digite um palpite entre 1 e 100."
    );

    guessInput.focus();
}

async function submitGuess() {
    if (gameFinished) return;

    const nome = playerNameInput.value.trim();
    const valor = guessInput.value.trim();
    const palpite = Number(valor);

    if (!nome) {
        showMessage("Falta seu nome!", "Digite seu nome antes de jogar.");
        playerNameInput.focus();
        return;
    }

    if (
        valor === "" ||
        !Number.isInteger(palpite) ||
        palpite < MIN_NUMBER ||
        palpite > MAX_NUMBER
    ) {
        showMessage(
            "Palpite inválido!",
            "Digite um número inteiro entre 1 e 100."
        );
        guessInput.focus();
        return;
    }

    attempts++;
    attemptsElement.textContent = attempts;

    if (palpite === secretNumber) {
        gameFinished = true;

        guessInput.disabled = true;
        guessButton.disabled = true;
        newGameButton.hidden = false;

        showMessage(
            `Parabéns, ${nome}!`,
            `Você acertou em ${attempts} tentativa(s)!`,
            "success"
        );

        await saveScore(nome, score, attempts);
        return;
    }

    score = Math.max(
        100,
        INITIAL_POINTS - attempts * POINTS_LOST_PER_MISS
    );

    scoreElement.textContent = score;

    if (palpite < secretNumber) {
        showMessage("Quase lá!", "O número secreto é MAIOR. Tente novamente.");
    } else {
        showMessage("Quase lá!", "O número secreto é MENOR. Tente novamente.");
    }

    guessInput.value = "";
    guessInput.focus();
}

async function loadRanking() {
    rankingList.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Carregando ranking...";
    rankingList.appendChild(loading);

    try {
        const response = await fetch("/api/ranking", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const ranking = await response.json();

        rankingList.replaceChildren();

        if (!Array.isArray(ranking) || ranking.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Ainda não há pontuações registradas.";
            rankingList.appendChild(empty);
            bestScoreElement.textContent = "0";
            return;
        }

        ranking.forEach((jogador, index) => {
            const item = document.createElement("div");
            item.className = "ranking-item";

            const position = document.createElement("span");
            position.className = "ranking-position";
            position.textContent = `${index + 1}º`;

            const name = document.createElement("span");
            name.className = "ranking-name";
            name.textContent = jogador.nome;

            const points = document.createElement("strong");
            points.className = "ranking-score";
            points.textContent = `${jogador.pontuacao} pts`;

            item.append(position, name, points);
            rankingList.appendChild(item);
        });

        const nomeAtual = playerNameInput.value.trim().toLowerCase();

        const pontuacoes = ranking
            .filter(jogador =>
                jogador.nome.toLowerCase() === nomeAtual
            )
            .map(jogador => Number(jogador.pontuacao));

        bestScoreElement.textContent = pontuacoes.length
            ? Math.max(...pontuacoes)
            : "0";

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);

        rankingList.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "Não foi possível carregar o ranking. Tente novamente mais tarde.";

        rankingList.appendChild(errorMessage);
    }
}

async function saveScore(nome, pontuacao, tentativas) {
    showMessage(
        "Salvando resultado...",
        "Aguarde enquanto registramos sua pontuação."
    );

    try {
        const response = await fetch("/api/ranking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                pontuacao,
                tentativas
            })
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || `Erro HTTP ${response.status}`);
        }

        showMessage(
            "Pontuação registrada!",
            "Seu resultado foi enviado ao ranking global.",
            "success"
        );

        await loadRanking();

    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);

        showMessage(
            "Você acertou!",
            "Não foi possível salvar a pontuação. Verifique a conexão e tente novamente."
        );
    }
}

function nextRound() {
    round++;
    startGame();
}

guessButton.addEventListener("click", submitGuess);
newGameButton.addEventListener("click", nextRound);

guessInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        submitGuess();
    }
});

playerNameInput.addEventListener("change", loadRanking);

startGame();
loadRanking();
