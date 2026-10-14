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
const newRoundButton = document.getElementById("newRoundButton");
const refreshRankingButton = document.getElementById("refreshRanking");
const messageElement = document.getElementById("message");
const attemptsElement = document.getElementById("attempts");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const roundElement = document.getElementById("round");
const rankingList = document.getElementById("rankingList");

function startGame() {
    secretNumber = Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER;
    attempts = 0;
    score = INITIAL_POINTS;
    gameFinished = false;

    attemptsElement.textContent = attempts;
    scoreElement.textContent = score;
    roundElement.textContent = round;

    messageElement.textContent = "Digite um número entre 1 e 100.";
    messageElement.className = "message";

    guessInput.value = "";
    guessInput.disabled = false;
    guessButton.disabled = false;
    newRoundButton.hidden = true;
}

async function submitGuess() {
    if (gameFinished) return;

    const nome = playerNameInput.value.trim();
    const valor = guessInput.value.trim();
    const palpite = Number(valor);

    if (!nome) {
        messageElement.textContent = "Digite seu nome antes de jogar.";
        playerNameInput.focus();
        return;
    }

    if (
        valor === "" ||
        !Number.isInteger(palpite) ||
        palpite < MIN_NUMBER ||
        palpite > MAX_NUMBER
    ) {
        messageElement.textContent = "Digite um número inteiro entre 1 e 100.";
        guessInput.focus();
        return;
    }

    attempts++;
    attemptsElement.textContent = attempts;

    if (palpite === secretNumber) {
        gameFinished = true;

        messageElement.textContent =
            `Parabéns, ${nome}! Você acertou em ${attempts} tentativa(s)!`;
        messageElement.className = "message success";

        guessInput.disabled = true;
        guessButton.disabled = true;
        newRoundButton.hidden = false;

        await saveScore(nome, score, attempts);
        return;
    }

    score = Math.max(
        100,
        INITIAL_POINTS - attempts * POINTS_LOST_PER_MISS
    );

    scoreElement.textContent = score;

    if (palpite < secretNumber) {
        messageElement.textContent = "O número secreto é MAIOR. Tente novamente!";
    } else {
        messageElement.textContent = "O número secreto é MENOR. Tente novamente!";
    }

    messageElement.className = "message";
    guessInput.value = "";
    guessInput.focus();
}

async function loadRanking() {
    rankingList.innerHTML = "<li>Carregando ranking...</li>";

    try {
        const response = await fetch("/api/ranking");

        if (!response.ok) {
            throw new Error("Falha ao consultar o ranking.");
        }

        const ranking = await response.json();
        rankingList.innerHTML = "";

        if (!Array.isArray(ranking) || ranking.length === 0) {
            rankingList.innerHTML =
                "<li>Ainda não há pontuações registradas.</li>";
            bestScoreElement.textContent = "—";
            return;
        }

        ranking.forEach((jogador, index) => {
            const item = document.createElement("li");
            const nome = document.createElement("span");
            const pontos = document.createElement("strong");

            nome.textContent = `${index + 1}. ${jogador.nome}`;
            pontos.textContent = `${jogador.pontuacao} pts`;

            item.append(nome, pontos);
            rankingList.appendChild(item);
        });

        const nomeAtual = playerNameInput.value.trim().toLowerCase();

        const pontuacoesPessoais = ranking
            .filter(jogador => jogador.nome.toLowerCase() === nomeAtual)
            .map(jogador => Number(jogador.pontuacao));

        bestScoreElement.textContent = pontuacoesPessoais.length
            ? Math.max(...pontuacoesPessoais)
            : "—";

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        rankingList.innerHTML =
            "<li>Não foi possível carregar o ranking.</li>";
    }
}

async function saveScore(nome, pontuacao, tentativas) {
    messageElement.textContent = "Salvando pontuação...";

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
            throw new Error("Falha ao salvar pontuação.");
        }

        messageElement.textContent =
            "Pontuação salva no ranking global!";

        await loadRanking();

    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);

        messageElement.textContent =
            "Você acertou, mas não foi possível salvar a pontuação.";
    }
}

function nextRound() {
    round++;
    startGame();
}

guessButton.addEventListener("click", submitGuess);
newRoundButton.addEventListener("click", nextRound);
refreshRankingButton.addEventListener("click", loadRanking);

guessInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        submitGuess();
    }
});

playerNameInput.addEventListener("change", loadRanking);

startGame();
loadRanking();