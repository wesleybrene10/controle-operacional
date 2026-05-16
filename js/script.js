// ELEMENTOS
const cronometro = document.getElementById("cronometro");

const btnIniciar = document.getElementById("btnIniciar");
const btnFinalizar = document.getElementById("btnFinalizar");

const tipoAtividade = document.getElementById("tipoAtividade");
const numeroProcesso = document.getElementById("numeroProcesso");

const historicoBody = document.getElementById("historicoBody");

// PROCESSOS
const totalProcessos = document.getElementById("totalProcessos");
const mediaProcessos = document.getElementById("mediaProcessos");
const tempoTotal = document.getElementById("tempoTotal");
const ultimoProcesso = document.getElementById("ultimoProcesso");

// PAUSAS
const tempoPausa = document.getElementById("tempoPausa");
const tempoAlmoco = document.getElementById("tempoAlmoco");
const tempoFalha = document.getElementById("tempoFalha");
const totalPausas = document.getElementById("totalPausas");

// VARIÁVEIS
let segundos = 0;
let intervalo = null;
let rodando = false;

// LOTES
let lotes = [];
let loteAtual = 0;

// DADOS
let dados = {
    processos: [],
    pausas: [],

    totalTempoProcessos: 0,

    totalTempoPausa: 0,
    totalTempoAlmoco: 0,
    totalTempoFalha: 0
};

// FORMATAR TEMPO
function formatarTempo(segundosTotais){

    let horas = Math.floor(segundosTotais / 3600);

    let minutos = Math.floor(
        (segundosTotais % 3600) / 60
    );

    let segundos = segundosTotais % 60;

    horas = String(horas).padStart(2, "0");
    minutos = String(minutos).padStart(2, "0");
    segundos = String(segundos).padStart(2, "0");

    return `${horas}:${minutos}:${segundos}`;
}

// ATUALIZAR CRONÔMETRO
function atualizarCronometro(){

    segundos++;

    cronometro.innerText =
        formatarTempo(segundos);

}

// INICIAR
btnIniciar.addEventListener("click", () => {

    if(rodando) return;

    const tipo = tipoAtividade.value;

    // PROCESSO
    if(tipo === "processamento"){

        const numero =
            numeroProcesso.value.trim();

        // CAMPO VAZIO
        if(numero === ""){
            alert("Digite o número do processo.");
            return;
        }

        // DUPLICADO
        const processoExiste =
            dados.processos.some(
                item => item.processo === numero
            );

        if(processoExiste){

            alert(
                "Este processo já foi contabilizado."
            );

            return;
        }

    }

    rodando = true;

    intervalo = setInterval(
        atualizarCronometro,
        1000
    );

});

// FINALIZAR
btnFinalizar.addEventListener("click", () => {

    if(!rodando){
        alert("Nenhuma atividade iniciada.");
        return;
    }

    clearInterval(intervalo);

    rodando = false;

    const tipo = tipoAtividade.value;

    const processo =
        numeroProcesso.value || "---";

    // PROCESSAMENTO
    if(tipo === "processamento"){

        dados.processos.push({
            processo: processo,
            tempo: segundos
        });

        dados.totalTempoProcessos += segundos;

        atualizarCardProcessos();

    }

    // PAUSA
    else if(tipo === "pausa"){

        dados.pausas.push({
            tipo: "Pausa",
            tempo: segundos
        });

        dados.totalTempoPausa += segundos;

        atualizarCardPausas();

    }

    // ALMOÇO
    else if(tipo === "almoco"){

        dados.pausas.push({
            tipo: "Almoço",
            tempo: segundos
        });

        dados.totalTempoAlmoco += segundos;

        atualizarCardPausas();

    }

    // FALHA
    else if(tipo === "falha"){

        dados.pausas.push({
            tipo: "Falha sistêmica",
            tempo: segundos
        });

        dados.totalTempoFalha += segundos;

        atualizarCardPausas();

    }

    adicionarHistorico(
        processo,
        tipo,
        segundos
    );

    salvarDados();

    // RESET
    segundos = 0;

    cronometro.innerText = "00:00:00";

    numeroProcesso.value = "";

});

// HISTÓRICO
function adicionarHistorico(
    processo,
    tipo,
    tempo
){

    let nomeTipo = "";

    if(tipo === "processamento"){
        nomeTipo = "Processamento";
    }

    if(tipo === "pausa"){
        nomeTipo = "Pausa";
    }

    if(tipo === "almoco"){
        nomeTipo = "Almoço";
    }

    if(tipo === "falha"){
        nomeTipo = "Falha sistêmica";
    }

    adicionarAoLote({
        processo: processo,
        tipo: nomeTipo,
        tempo: tempo
    });

}

// CARD PROCESSOS
function atualizarCardProcessos(){

    totalProcessos.innerText =
        dados.processos.length;

    tempoTotal.innerText =
        formatarTempo(
            dados.totalTempoProcessos
        );

    const media = Math.floor(
        dados.totalTempoProcessos /
        dados.processos.length
    );

    mediaProcessos.innerText =
        formatarTempo(media);

    ultimoProcesso.innerText =
        dados.processos[
            dados.processos.length - 1
        ].processo;

}

// CARD PAUSAS
function atualizarCardPausas(){

    tempoPausa.innerText =
        formatarTempo(
            dados.totalTempoPausa
        );

    tempoAlmoco.innerText =
        formatarTempo(
            dados.totalTempoAlmoco
        );

    tempoFalha.innerText =
        formatarTempo(
            dados.totalTempoFalha
        );

    const total =
        dados.totalTempoPausa +
        dados.totalTempoAlmoco +
        dados.totalTempoFalha;

    totalPausas.innerText =
        formatarTempo(total);

}

// SALVAR
function salvarDados(){

    localStorage.setItem(
        "controleOperacional",
        JSON.stringify(dados)
    );

}

// CARREGAR
function carregarDados(){

    const dadosSalvos =
        localStorage.getItem(
            "controleOperacional"
        );

    if(!dadosSalvos) return;

    dados = JSON.parse(dadosSalvos);

    atualizarCardProcessos();

    atualizarCardPausas();

}

// RESETAR DIA
document
.getElementById("btnResetar")
.addEventListener("click", () => {

    const confirmar = confirm(
        "Deseja reiniciar o dia?"
    );

    if(!confirmar) return;

    localStorage.removeItem(
        "controleOperacional"
    );

    localStorage.removeItem(
        "lotesHistorico"
    );

    location.reload();

});

// DESABILITAR PROCESSO
tipoAtividade.addEventListener("change", () => {

    if(
        tipoAtividade.value === "processamento"
    ){

        numeroProcesso.disabled = false;

        numeroProcesso.placeholder =
            "Digite o número do processo";

    }

    else{

        numeroProcesso.disabled = true;

        numeroProcesso.value = "";

        numeroProcesso.placeholder =
            "Não necessário";

    }

});

// =======================
// LOTES HISTÓRICO
// =======================

// CRIAR LOTE
function criarNovoLote(){

    lotes.push([]);

    loteAtual = lotes.length - 1;

    renderizarAbas();

}

// ADICIONAR LOTE
function adicionarAoLote(item){

    // SEM LOTE
    if(lotes.length === 0){
        criarNovoLote();
    }

    let lote = lotes[loteAtual];

    // LIMITE 10
    if(lote.length >= 10){

        criarNovoLote();

        lote = lotes[loteAtual];

    }

    lote.push(item);

    salvarLotes();

    renderizarHistorico();

    renderizarAbas();

}

// ABAS
function renderizarAbas(){

    const abas =
        document.getElementById(
            "abasHistorico"
        );

    abas.innerHTML = "";

    lotes.forEach((lote, index) => {

        const aba =
            document.createElement("div");

        aba.classList.add("aba");

        if(index === loteAtual){
            aba.classList.add("ativa");
        }

        aba.innerText =
            `Lote ${index + 1} (${lote.length})`;

        aba.addEventListener("click", () => {

            loteAtual = index;

            renderizarHistorico();

            renderizarAbas();

        });

        abas.appendChild(aba);

    });

}

// HISTÓRICO
function renderizarHistorico(){

    historicoBody.innerHTML = "";

    if(!lotes[loteAtual]) return;

    lotes[loteAtual]
    .slice()
    .reverse()
    .forEach(item => {

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>${item.processo}</td>
            <td>${item.tipo}</td>
            <td>${formatarTempo(item.tempo)}</td>
        `;

        historicoBody.appendChild(linha);

    });

}

// SALVAR LOTES
function salvarLotes(){

    localStorage.setItem(
        "lotesHistorico",
        JSON.stringify(lotes)
    );

}

// CARREGAR LOTES
function carregarLotes(){

    const dadosSalvos =
        localStorage.getItem(
            "lotesHistorico"
        );

    if(!dadosSalvos) return;

    lotes = JSON.parse(dadosSalvos);

    loteAtual = lotes.length - 1;

    renderizarAbas();

    renderizarHistorico();

}

// INICIAR SISTEMA
carregarDados();
carregarLotes();
// ACEITAR SOMENTE NÚMEROS
numeroProcesso.addEventListener("input", () => {

    numeroProcesso.value =
        numeroProcesso.value.replace(/\D/g, "");

});