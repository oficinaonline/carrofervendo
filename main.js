const form = document.getElementById("diagnostic-form");
const resultadoEl = document.getElementById("resultado");

function sanitize(text) {
  return String(text || "").trim();
}

function contains(text, ...terms) {
  const t = text.toLowerCase();
  return terms.some(term => t.includes(term.toLowerCase()));
}

function estimateCosts() {
  return {
    radiador: { low: "R$ 80–150 (limpeza), R$ 250–600 (troca)" , labor: "R$ 150–350" },
    reservatorio: { low: "R$ 80–250", labor: "R$ 80–180" },
    mangueiras: { low: "R$ 30–120 cada", labor: "R$ 120–250" },
    valvula: { mid: "R$ 120–350", labor: "R$ 180–350" },
    sensor: { low: "R$ 80–250", labor: "R$ 100–220" },
    bomba: { mid: "R$ 250–600", labor: "R$ 300–600" },
    ventoinha: { mid: "R$ 250–700 (conjunto), R$ 60–180 (relé/cebolão)", labor: "R$ 150–350" },
    junta: { high: "R$ 450–1.500 (peças + retífica)", labor: "R$ 800–2.000" }
  };
}

function gerarDiagnostico(dados) {
  const causas = [];
  const explicacoes = [];
  const checklist = { dono: [], mecanico: [], imediato: [] };
  const solucoes = [];
  const riscos = [];

  const sintomasTxt = dados.sintomas;
  const perdaAlta = dados.perdaAgua === "sim_1x_dia" || dados.perdaAgua === "sim_apos_esquentar";
  const perdaModerada = dados.perdaAgua === "sim_1x_semana";
  const soAgua = dados.corLiquido === "apenas_agua";
  const liquidoSujo = dados.corLiquido === "escuro_sujo" || dados.aparenciaLiquido === "borra";
  const liquidoOleoso = dados.aparenciaLiquido === "oleoso";
  const ventoinhaNaoAciona = dados.ventoinhaAciona === "nao";
  const ventoinhaSempre = dados.ventoinhaAciona === "sim_tempo_todo";
  const fumaçaConstante = dados.fumacaBranca === "sim_semparar";
  const luzTemp = dados.luzesPainel === "temp" || dados.luzesPainel === "ambas";
  const luzInjecao = dados.luzesPainel === "injecao" || dados.luzesPainel === "ambas";

  const tempStr = dados.tempPainel.toLowerCase();
  const tempAltaPainel =
    contains(tempStr, "vermelho", "acima", "100", "110", "120") ||
    contains(sintomasTxt, "ferve", "fervendo", "superaquece", "superaquec");

  // 1) Itens simples / externos

  // Reservatório / tampa
  if (
    dados.vazamentosVisiveis === "reservatorio" ||
    contains(sintomasTxt, "tampa", "reservatório borbulha", "joga água fora")
  ) {
    causas.push("Reservatório de expansão ou tampa com vedação deficiente");
    explicacoes.push(
      "Com tampa cansada ou reservatório trincado, o sistema não segura pressão. A água ferve mais cedo, o nível sobe e pode jogar líquido para fora, simulando superaquecimento."
    );
    checklist.dono.push(
      "Verificar se há rachaduras no reservatório e se há marcas de vazamento ao redor da tampa após rodar com o carro quente."
    );
    checklist.mecanico.push(
      "Testar o reservatório e a tampa com bomba de pressão para verificar se o sistema mantém a pressão especificada."
    );
    solucoes.push("Substituir reservatório e tampa por peças novas de boa qualidade (evitar peças universais de baixa qualidade).");
  }

  // Vazamentos em mangueiras
  if (
    dados.vazamentosVisiveis === "mangueiras" ||
    contains(sintomasTxt, "mangueira rasgada", "mangueira furada", "abraçadeira")
  ) {
    causas.push("Vazamento em mangueiras ou abraçadeiras do sistema de arrefecimento");
    explicacoes.push(
      "Mangueiras ressecadas ou abraçadeiras frouxas permitem fuga de líquido, gerando perda de água e entrada de ar no sistema, o que favorece superaquecimento."
    );
    checklist.dono.push(
      "Com o motor frio, apertar levemente as mangueiras principais verificando rachaduras aparentes ou marcas de vazamento nas conexões."
    );
    checklist.mecanico.push(
      "Pressurizar o sistema e inspecionar todas as mangueiras, conexões e abraçadeiras, substituindo as que apresentarem desgaste."
    );
    solucoes.push("Trocar as mangueiras ressecadas e abraçadeiras danificadas, completar com aditivo adequado e remover o ar do sistema.");
  }

  // Radiador
  if (
    dados.vazamentosVisiveis === "radiador" ||
    liquidoSujo ||
    contains(sintomasTxt, "radiador entupido", "radiador sujo")
  ) {
    causas.push("Radiador parcial ou totalmente obstruído / com vazamentos");
    explicacoes.push(
      "Com radiador entupido ou com muitas aletas deformadas, a troca térmica fica comprometida, a ventoinha trabalha mais tempo e a temperatura tende a subir, principalmente em trânsito."
    );
    checklist.dono.push(
      "Observar se o radiador está com muitas aletas amassadas ou com áreas úmidas/oxidada na parte frontal."
    );
    checklist.mecanico.push(
      "Testar fluxo de passagem de líquido, verificar vazão e avaliar necessidade de desobstrução química ou troca do radiador."
    );
    solucoes.push(
      "Realizar limpeza e desobstrução do radiador ou substituição completa, seguida de limpeza de sistema e troca do líquido de arrefecimento."
    );
  }

  // 2) Controle de temperatura (ventoinha, sensor, válvula, relés)

  // Ventoinha / relé / cebolão
  if (ventoinhaNaoAciona || contains(sintomasTxt, "ventoinha não arma", "ventoinha nao arma")) {
    causas.push("Falha na ventoinha, relé ou cebolão/sensor de acionamento");
    explicacoes.push(
      "Se a ventoinha não entra em funcionamento, principalmente em trânsito, o radiador não consegue dissipar o calor gerado pelo motor, levando ao superaquecimento."
    );
    checklist.dono.push(
      "Parado em segurança, deixar o motor atingir temperatura de trabalho e observar se a ventoinha entra em funcionamento pelo menos 1 ou 2 vezes."
    );
    checklist.mecanico.push(
      "Verificar fusíveis, relés, chicote, motor da ventoinha e o sensor/cebolão de temperatura, testando o acionamento direto."
    );
    solucoes.push(
      "Substituir o componente defeituoso (ventoinha, relé, fusível ou sensor/cebolão) e conferir o correto acionamento na temperatura especificada."
    );
  } else if (ventoinhaSempre) {
    causas.push("Ventoinha acionando em excesso (possível defeito em sensor ou estratégia da injeção)");
    explicacoes.push(
      "Quando a ventoinha fica ligada quase o tempo todo, pode haver problema no sensor de temperatura, mau contato no chicote ou compensação da injeção devido a leitura incorreta."
    );
    checklist.mecanico.push(
      "Ler parâmetros em scanner, comparar temperatura real com a informada pela ECU e testar o sensor de temperatura do motor."
    );
    solucoes.push(
      "Corrigir falha no sensor de temperatura ou chicote, e, se necessário, atualizar parâmetros da injeção via scanner."
    );
  }

  // Válvula termostática
  if (
    contains(sintomasTxt, "demora a esquentar", "só esquenta no trânsito") ||
    contains(sintomasTxt, "não esquenta", "sem aquecimento interno")
  ) {
    causas.push("Válvula termostática travada aberta ou removida");
    explicacoes.push(
      "Com a válvula travada aberta ou removida, o motor leva muito tempo para atingir a temperatura ideal e pode trabalhar fora da faixa correta, prejudicando consumo e desgaste."
    );
    checklist.dono.push(
      "Perceber se a temperatura demora demais para chegar na faixa normal em uso leve, principalmente em dias frios."
    );
    checklist.mecanico.push(
      "Remover a válvula termostática para inspeção, testar abertura em banho maria e substituir se estiver travada."
    );
    solucoes.push(
      "Instalar válvula termostática nova e correta para o modelo, garantindo funcionamento na temperatura de abertura especificada."
    );
  }

  if (
    tempAltaPainel ||
    contains(sintomasTxt, "superaquece", "ferve", "passa do meio", "vai pro vermelho")
  ) {
    causas.push("Válvula termostática travada fechada ou com abertura atrasada");
    explicacoes.push(
      "Se a válvula não abre na temperatura correta, o fluxo para o radiador é restringido, o que faz a temperatura subir rapidamente, principalmente em uso pesado ou estrada."
    );
    checklist.mecanico.push(
      "Testar a válvula termostática fora do motor, verificando temperatura de abertura e curso total do componente."
    );
    solucoes.push(
      "Substituir a válvula termostática por peça nova e de boa procedência, e trocar o líquido de arrefecimento após o serviço."
    );
  }

  // Sensor de temperatura / indicação no painel
  if (luzTemp || luzInjecao || contains(sintomasTxt, "marcador louco", "marcador doido")) {
    causas.push("Sensor de temperatura do motor ou indicação no painel com leitura incorreta");
    explicacoes.push(
      "Quando o sensor envia sinais errados, a central pode enriquecer a mistura, acionar a ventoinha fora de hora ou acender luz de temperatura sem que haja superaquecimento real."
    );
    checklist.mecanico.push(
      "Comparar temperatura real do motor (termômetro infravermelho/OBD) com a informação do painel e da ECU em scanner automotivo."
    );
    solucoes.push(
      "Substituir o sensor de temperatura defeituoso, reparar chicote ou painel, e apagar códigos de falha após o reparo."
    );
  }

  // 3) Circulação de líquido (bomba d’água, ar no sistema, aquecedor interno)

  // Bomba d’água
  if (
    contains(sintomasTxt, "barulho na correia", "chiado", "ronco na bomba") ||
    contains(sintomasTxt, "não circula", "mangueira gelada", "sem circulação", "sem retorno no reservatório")
  ) {
    causas.push("Bomba d’água com vazamento, folga ou pás danificadas");
    explicacoes.push(
      "Com a bomba d’água desgastada, a circulação do líquido é reduzida ou inexistente. Isso faz com que o motor aqueça rápido e o radiador permaneça relativamente frio."
    );
    checklist.dono.push(
      "Observar se há ruído anormal na região da correia e se existe vazamento de líquido na parte frontal do motor."
    );
    checklist.mecanico.push(
      "Inspecionar visualmente a bomba, verificar folga no eixo, checar vazamentos pelo furo de alívio e, se necessário, remover para análise."
    );
    solucoes.push(
      "Substituir a bomba d’água (preferencialmente junto com correia e tensores, quando aplicável) e completar o sistema com aditivo correto."
    );
  }

  // Ar no sistema / aquecedor interno
  if (contains(sintomasTxt, "borbulha", "borbulhamento", "gorgolejo")) {
    causas.push("Excesso de ar no sistema de arrefecimento");
    explicacoes.push(
      "A presença de bolsas de ar impede a circulação uniforme do líquido, causando pontos quentes, barulho de borbulhamento e oscilações na temperatura."
    );
    checklist.dono.push(
      "Verificar se o nível baixa após rodar e se aparece barulho de água circulando atrás do painel."
    );
    checklist.mecanico.push(
      "Realizar procedimento completo de sangria, usando pontos de respiro específicos do modelo, com o carro em rampa se necessário."
    );
    solucoes.push(
      "Sangrar o sistema corretamente após corrigir vazamentos, garantindo que só haja líquido (e não ar) nas galerias do motor."
    );
  }

  // 4) Itens mais graves (junta do cabeçote, vazamentos internos)

  const suspeitaJunta =
    liquidoOleoso ||
    fumaçaConstante ||
    contains(sintomasTxt, "mistura óleo e água", "óleo no reservatório", "maionese na tampa") ||
    (perdaAlta && dados.vazamentosVisiveis === "nenhum");

  if (suspeitaJunta) {
    causas.push("Possível queima da junta do cabeçote ou trincas internas");
    explicacoes.push(
      "Quando a junta do cabeçote queima, ocorre passagem de compressão para o sistema de arrefecimento ou mistura entre óleo e líquido. Isso gera perda de água, superaquecimento, fumaça branca constante e contaminação do óleo ou do aditivo."
    );
    checklist.dono.push(
      "Verificar se há 'maionese' (creme claro) na tampa de óleo ou no pescador da vareta, e se o nível do reservatório baixa mesmo sem vazamento externo."
    );
    checklist.mecanico.push(
      "Realizar teste de pressão no sistema, teste de presença de CO₂ no líquido de arrefecimento e ensaio de compressão/pressão de cilindros."
    );
    solucoes.push(
      "Se confirmado, remover cabeçote, fazer retífica (planeza, teste de trinca, troca de retentores) e substituir junta, parafusos e vedadores do sistema."
    );
    riscos.push(
      "Rodar com junta queimada pode causar superaquecimento severo, empenamento definitivo do cabeçote, travamento do motor e contaminação grave do óleo."
    );
  }

  // Vazamentos internos (aquecedor / radiador interno)
  if (dados.vazamentosVisiveis === "interno_carpete") {
    causas.push("Vazamento no radiador do ar quente / serpentina interna");
    explicacoes.push(
      "Quando o radiador interno fura, o líquido de arrefecimento escapa para dentro do habitáculo, deixando o carpete úmido e com cheiro adocicado."
    );
    checklist.dono.push(
      "Verificar se há embaçamento excessivo do para-brisa com cheiro adocicado e umidade constante no carpete, principalmente do lado do passageiro."
    );
    checklist.mecanico.push(
      "Isolar o circuito do ar quente, testar o radiador interno e substituir se houver fuga de líquido."
    );
    solucoes.push(
      "Substituir o radiador interno defeituoso e completar o sistema com aditivo apropriado, sangrando o sistema após o reparo."
    );
  }

  // Se nenhuma causa específica foi detectada, adicionar análise geral
  if (causas.length === 0) {
    causas.push("Necessidade de avaliação geral do sistema de arrefecimento");
    explicacoes.push(
      "Pelos dados informados não há um único componente claramente responsável. É provável que exista combinação de desgaste em mais de um ponto do sistema."
    );
    checklist.mecanico.push(
      "Verificar pressão do sistema, estado do radiador, funcionamento da ventoinha, válvula termostática, bomba d’água, tampa do reservatório e possíveis vazamentos internos."
    );
    solucoes.push(
      "Executar diagnóstico completo do sistema de arrefecimento, corrigindo cada ponto de vazamento ou restrição e, em seguida, realizar limpeza e troca completa do líquido."
    );
  }

  // Riscos gerais
  if (tempAltaPainel || luzTemp || perdaAlta) {
    riscos.push(
      "Superaquecimento progressivo com risco de empenamento de cabeçote, queima de junta e até travamento do motor."
    );
  }
  if (liquidoSujo || soAgua) {
    riscos.push(
      "Corrosão interna de galerias do bloco, radiador, bomba d’água e sensores, aumentando custo futuro de reparo."
    );
  }

  const custos = estimateCosts();

  const html = `
    <p><span class="tag">Análise técnica</span></p>
    <p><strong>Veículo:</strong> ${dados.modeloAno} | <strong>Motor:</strong> ${dados.tipoMotor}</p>
    <p><strong>Condições relatadas:</strong> temperatura "${dados.tempPainel}", problema ocorre em: ${dados.quandoOcorre.replace(
      "_",
      " "
    )}, perda de água: ${dados.perdaAgua.replace(/_/g, " ")}</p>

    <h3>1. Diagnóstico técnico (do mais simples ao mais grave)</h3>
    <ul>
      ${causas.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h3>2. Explicação de cada possível causa</h3>
    <ul>
      ${explicacoes.map(e => `<li>${e}</li>`).join("")}
    </ul>

    <h3>3. Checklist de verificação</h3>
    <p><strong>Você pode conferir:</strong></p>
    <ul>
      ${checklist.dono.map(i => `<li>${i}</li>`).join("") || "<li>Sem verificações simples adicionais além das já feitas.</li>"}
    </ul>
    <p><strong>Para o mecânico verificar:</strong></p>
    <ul>
      ${checklist.mecanico.map(i => `<li>${i}</li>`).join("")}
    </ul>
    <p><strong>Exige atenção imediata:</strong></p>
    <ul>
      ${riscos.length
        ? riscos.map(r => `<li>${r}</li>`).join("")
        : "<li>Mesmo sem sinal de falha grave, o sistema deve ser mantido em perfeito estado para evitar danos futuros.</li>"}
    </ul>

    <h3>4. Soluções recomendadas e prioridades</h3>
    <ul>
      ${solucoes.map(s => `<li>${s}</li>`).join("")}
    </ul>

    <h3>5. Faixa de custos estimada (Brasil)</h3>
    <ul>
      <li class="cost-low"><strong>Baixo custo:</strong> teste de tampa/reservatório, pequenas mangueiras, sensor de temperatura, sangria e troca de líquido.
        <br><em>Peças:</em> cerca de ${custos.reservatorio.low}, sensor ${custos.sensor.low}. Mão de obra: R$ 100–250.</li>
      <li class="cost-mid"><strong>Médio custo:</strong> radiador, bomba d’água, válvula termostática, ventoinha/relés.
        <br><em>Radiador:</em> ${custos.radiador.low}, <em>bomba d’água:</em> ${custos.bomba.mid}, <em>ventoinha:</em> ${custos.ventoinha.mid}. Mão de obra: R$ 250–700.</li>
      <li class="cost-high"><strong>Alto custo:</strong> junta de cabeçote queimada, trincas ou danos internos.
        <br><em>Junta/cabeçote:</em> ${custos.junta.high}. Mão de obra + retífica: facilmente acima de R$ 2.000 em muitos casos.</li>
    </ul>

    <p><strong>6. Próximo passo:</strong> Deseja prosseguir com o diagnóstico? Se sim, descreva todos os sintomas do veículo.</p>
  `;

  return html;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const dados = {
    modeloAno: sanitize(document.getElementById("modeloAno").value),
    tipoMotor: sanitize(document.getElementById("tipoMotor").value),
    tempPainel: sanitize(document.getElementById("tempPainel").value),
    quandoOcorre: document.getElementById("quandoOcorre").value,
    perdaAgua: document.getElementById("perdaAgua").value,
    ventoinhaAciona: document.getElementById("ventoinhaAciona").value,
    corLiquido: document.getElementById("corLiquido").value,
    aparenciaLiquido: document.getElementById("aparenciaLiquido").value,
    vazamentosVisiveis: document.getElementById("vazamentosVisiveis").value,
    fumacaBranca: document.getElementById("fumacaBranca").value,
    cheirosBarulhos: document.getElementById("cheirosBarulhos").value,
    luzesPainel: document.getElementById("luzesPainel").value,
    historico: sanitize(document.getElementById("historico").value),
    sintomas: sanitize(document.getElementById("sintomas").value)
  };

  resultadoEl.innerHTML = gerarDiagnostico(dados);
});