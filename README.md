# 🎯 Adivinhe o Número

Um jogo interativo desenvolvido com **HTML, CSS e JavaScript**, onde o jogador precisa descobrir um número secreto entre 1 e 100.

O jogo fornece dicas informando se o número escolhido é **maior ou menor** que o número secreto. Quanto menos tentativas forem necessárias, maior será a pontuação.

---

## 🎮 Demonstração

O projeto possui uma interface moderna, responsiva e adaptada para:

- 💻 Computadores
- 💻 Notebooks
- 📱 Smartphones
- 📱 Tablets

---

## ✨ Funcionalidades

- 🎯 Número secreto gerado aleatoriamente a cada rodada
- 🔢 Números entre 1 e 100
- 💡 Sistema de dicas
- ⬆️ Indicação quando o número secreto é maior
- ⬇️ Indicação quando o número secreto é menor
- 🏆 Sistema de pontuação
- 👤 Identificação do jogador pelo nome
- 📊 Ranking dos melhores jogadores
- 💾 Ranking salvo no navegador
- 🔄 Sistema de novas rodadas
- 📱 Design totalmente responsivo
- ✨ Animações e efeitos visuais
- ⌨️ Suporte à tecla Enter para realizar tentativas

---

## 🏆 Sistema de Pontuação

O jogador começa com **1000 pontos**.

A cada tentativa incorreta, são descontados **50 pontos**.

| Tentativas | Pontuação |
|------------|-----------|
| 1 | 1000 |
| 2 | 950 |
| 3 | 900 |
| 4 | 850 |
| 5 | 800 |
| 10 | 550 |
| 15+ | 100 |

Quanto menos tentativas você utilizar, melhor será sua posição no ranking.

---

## 💾 Ranking

O ranking utiliza o **LocalStorage** do navegador.

Isso permite que os resultados permaneçam salvos mesmo depois de:

- Atualizar a página
- Fechar o navegador
- Iniciar uma nova rodada

O jogo mantém os **10 melhores resultados**.

> O ranking é armazenado localmente no navegador e não é compartilhado entre diferentes dispositivos.

---

## 🕹️ Como jogar

### 1. Digite seu nome

Informe o nome que será utilizado no ranking.

### 2. Escolha um número

Digite um número entre:

```text
1 e 100
