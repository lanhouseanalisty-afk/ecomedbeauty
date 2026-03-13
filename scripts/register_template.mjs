import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://hxdfbwptgtthaqddneyr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZGZid3B0Z3R0aGFxZGRuZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk5ODksImV4cCI6MjA4NDc3NTk4OX0.rXq8BNh1vARTYhD8VZLF4yWrFkE4XW2r5gRrr8Jnc6c'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const templateContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: auto;">
    <h1 style="text-align: center; font-size: 1.2rem; margin-bottom: 2rem;">TERMO DE COMODATO E RESPONSABILIDADE PELA GUARDA E USO DE EQUIPAMENTO</h1>

    <p style="text-align: justify; font-style: italic; margin-left: 20%; margin-bottom: 2rem;">
        O presente instrumento (simplesmente denominado "TERMO" e/ou "CONTRATO", conforme possa ser o caso) é assinado, nesta data, pelo COMODATÁRIO que fará uso do equipamento disponibilizado pela COMODANTE, para os fins aqui previstos de acordo com os termos e condições a seguir especificados.
    </p>

    <p><strong>COMODANTE:</strong> SKINSTORE S.A., pessoa jurídica devidamente constituída sob o regime de sociedade anônima, de acordo com as leis da República Federativa do Brasil, com sede localizada na Avenida Marginal, nº 666, Parque São George, Cotia/SP, CEP 06708 030, inscrita no CNPJ/ME sob nº. 12.979.552/0001-72, por este ato denominada simplesmente COMODANTE;</p>

    <p><strong>COMODATÁRIO(A):</strong><br>
    <strong>Nome:</strong> {{NOME_COLABORADOR}}<br>
    <strong>CPF:</strong> {{CPF_COLABORADOR}}<br>
    doravante designada simplesmente COMODATÁRIO(A);</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DO OBJETO DO INSTRUMENTO</h2>
    <p><strong>Cláusula 1ª.</strong> O presente termo tem como OBJETO, a transferência, neste momento, pela COMODANTE ao COMODATÁRIO, dos direitos de uso e gozo do equipamento de informática, descrito a seguir, que se encontra em perfeitas condições físicas e operacionais:</p>

    <p><strong>Modelo:</strong></p>
    <p><strong>Parágrafo primeiro.</strong> {{EQUIPAMENTO_COLABORADOR}}</p>
    <p><strong>Parágrafo segundo.</strong> O valor de mercado do aparelho é de R$ 3.000,00 em data: {{DATA}} valor esse conhecido, reconhecido e livremente acatado pelas partes.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DAS OBRIGAÇÕES</h2>
    <p><strong>Cláusula 2ª.</strong> O COMODATÁRIO deverá conservar o equipamento em local apropriado, de acordo com as normas técnicas e especificações do fabricante, tornando-se, a partir da transferência da posse do equipamento, o único responsável por quaisquer avarias e danos advindos do mau uso, imperícia, imprudência ou negligência, bem como quaisquer danos acidentais ou porventura propositais.</p>

    <p><strong>Cláusula 3ª.</strong> A COMODANTE é a responsável pela manutenção técnica do equipamento, devendo o COMODATÁRIO comunicar imediatamente à COMODANTE os eventuais defeitos encontrados e entregar o equipamento para inspeção e/ou manutenção imediatamente, sempre que necessário e/ou requisitado pela COMODANTE.</p>

    <p><strong>Cláusula 4ª.</strong> A COMODANTE poderá, a qualquer tempo, fiscalizar e vistoriar o equipamento. Sempre que solicitado pela COMODANTE, o COMODATÁRIO deverá comprovar o estado do equipamento mediante envio de evidências, como fotos e vídeos. Tal fiscalização não eximirá o COMODATÁRIO das responsabilidades aqui assumidas.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DESCONTO PELO MAU USO</h2>
    <p><strong>Cláusula 5ª.</strong> Ficando constatada qualquer violação ao dever de conservação previsto na clausula 2ª, a COMODANTE fica autorizada, a título de compensação, a descontar do pagamento do COMODATÁRIO os valores que eventualmente tenha despendido para realizar a manutenção do equipamento prejudicado pelo mau uso do COMODATÁRIO.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DA DEVOLUÇÃO</h2>
    <p><strong>Cláusula 6ª.</strong> O COMODATÁRIO deverá devolver o equipamento à COMODANTE após o encerramento, por qualquer motivo, dos trabalhos prestados à COMODANTE e/ou, simplesmente, sempre que solicitado por esta, nas mesmas condições em que estava quando o recebeu, em perfeitas condições de uso, respondendo pelos danos ou prejuízos causados.</p>

    <p><strong>Cláusula 7ª.</strong> A devolução deverá se dar no prazo a ser estabelecido pela COMODANTE, que concederá prazo de pelo menos 48 horas corridas para a entrega do equipamento e, mais, nas perfeitas condições acima previstas. Caso o dia final da entrega caia em dia não útil, considerando a localização e atividade da sede da empresa, a entrega poderá ser realizada impreterivelmente no dia útil subsequente. A devolução do equipamento fora do prazo ou fora das condições de conservação será caracterizada como infração contratual, ensejando as penalidades previstas neste instrumento.</p>

    <p><strong>Cláusula 8ª.</strong> Para os COMODATÁRIOS que prestam serviços internamente, ou seja, na mesma localidade que a empresa COMODANTE, o equipamento deverá obrigatoriamente ser devolvido no próprio escritório físico da empresa.</p>

    <p><strong>Cláusula 9ª.</strong> Para os COMODATÁRIOS que prestam serviços externamente, de outra localidade, o equipamento deverá obrigatoriamente ser devolvido através dos meios logísticos que serão informados e disponibilizados pelo pessoal da COMODANTE.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DA RESCISÃO</h2>
    <p><strong>Cláusula 10ª.</strong> O COMODATÁRIO declara ciência e reconhece que o presente instrumento poderá ser rescindido a qualquer momento, sem qualquer ônus, por qualquer motivo, a exclusivo critério da COMODANTE, para que o equipamento retorne a sua origem.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DA DURAÇÃO</h2>
    <p><strong>Cláusula 11ª.</strong> Este contrato terá a duração necessária para que sejam realizadas as atividades mencionadas na Cláusula 1ª.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DA MULTA</h2>
    <p><strong>Cláusula 12ª.</strong> Havendo infração contratual, a COMODATÁRIA pagará à COMODANTE multa de natureza não compensatória em valor correspondente a 10% (dez por cento) do valor de mercado do equipamento, previsto no parágrafo segundo da cláusula 1ª deste instrumento, atualizada monetariamente com base na variação do IGP-M/FGV – Índice Geral de Preços do Mercado, ou outro índice que o substitua, desde a data da infração até a data de pagamento da penalidade, sem prejuízo de reparação por perdas e danos.</p>

    <p><strong>Parágrafo primeiro.</strong> As Partes acordam que a cobrança da penalidade estabelecida neste Contrato será realizada mediante simples comunicação por escrito, não havendo necessidade da notificação para a constituição da outra Parte em mora, nos termos do Artigo 397 do Código Civil.</p>

    <p><strong>Parágrafo segundo.</strong> A COMODANTE fica autorizada, a título de compensação, a descontar do pagamento do COMODATÁRIO os valores calculados e aplicados como multa por infração contratual.</p>

    <p><strong>Parágrafo terceiro.</strong> Não existindo a possibilidade de compensação satisfatória pela COMODANTE, assistirá a esta o direito de cobrar judicialmente tais obrigações e qualquer importância do COMODATÁRIO, servindo, para tanto, o presente instrumento como título executivo extrajudicial.</p>

    <p><strong>Parágrafo quarto.</strong> Ainda, o COMODATÁRIO deverá ressarcir a COMODANTE o valor das horas que forem despendidas por seus advogados e prepostos, além de despesas judiciais e administrativas eventualmente suportadas pela COMODANTE em virtude de infração contratual cometida pelo COMODATÁRIO.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">CONDIÇÕES GERAIS</h2>
    <p><strong>Cláusula 13ª.</strong> O presente termo passa a vigorar a partir da sua assinatura e representa o acordo integral entre as partes quanto à sua matéria, superando e substituindo qualquer outro acordo entre as partes, seja verbal ou por escrito, a respeito das obrigações e direitos nele estabelecidos, somente podendo ser modificado ou aditado por meio de instrumentos escritos, firmados pelos representantes legais de ambas as partes, observando-se a legislação aplicável.</p>

    <p><strong>Cláusula 14ª.</strong> No caso de qualquer disposição deste contrato conflitar com a lei segundo a qual o presente deva ser interpretado, ou se qualquer disposição for considerada inválida por um juízo, essa disposição será considerada como retificada para refletir o mais proximamente possível as intenções originais das partes. O restante do documento permanecerá em pleno vigor e efeito.</p>

    <p><strong>Cláusula 15ª.</strong> A tolerância à infração de qualquer cláusula ou condição do presente instrumento, por qualquer das partes contratantes, bem como as disposições legais, não implica em modificação no disposto neste instrumento, e não significará um permissivo a violações subsequentes, permanecendo o mesmo em vigor, não importando, ainda, em renúncia de direitos, não induzindo a novação ou precedente, e não gerando qualquer direito à parte infratora;</p>

    <p><strong>Cláusula 16ª.</strong> O presente contrato e o cumprimento das obrigações nele previstas serão regidos pelas leis da República Federativa do Brasil e interpretados de acordo com suas disposições.</p>

    <h2 style="font-size: 1.1rem; margin-top: 2rem;">DO FORO</h2>
    <p><strong>Cláusula 17ª.</strong> Para dirimir quaisquer controvérsias oriundas do CONTRATO, fica eleito o foro da comarca de COTIA/SP;</p>

    <p>Por estarem os termos assim justos e contratados, sendo reconhecidas e ratificadas todas as disposições acima, o COMODANTE assina o presente instrumento, em duas vias de igual teor, na presença de 2 (duas) testemunhas.</p>

    <p>Cotia, {{DATA}}.</p>

    <div style="margin-top: 3rem; text-align: center;">
        <p>__________________________________<br>
        ASSINATURA DO COMODANTE<br>
        Gleice Silva<br>
        RG: 33.155.672-8</p>
    </div>

    <div style="margin-top: 3rem; text-align: center;">
        <p>___________________________________<br>
        ASSINATURA DO COMODATÁRIO<br>
        {{NOME_COLABORADOR}}<br>
        CPF: {{CPF_COLABORADOR}}</p>
    </div>

    <div style="margin-top: 3rem; text-align: center;">
        <p>____________________________________<br>
        ASSINATURA DA TESTEMUNHA<br>
        Marcelo Ravagni<br>
        RG: 23.811.142-8</p>
    </div>

    <div style="margin-top: 4rem; font-size: 0.7rem; color: #666; text-align: justify; line-height: 1.2;">
        ESTA LAUDA TRATA-SE DE PARTE INTEGRANTE DO “TERMO DE COMODATO E RESPONSABILIDADE PELA GUARDA E USO DE EQUIPAMENTO” REFERENTE AO EQUIPAMENTO DISPONIBILIZADO PELA SKINSTORE S.A. AO COMODATÁRIO SIGNATÁRIO. O DOCUMENTO POSSUI 04 PÁGINAS EM SUA INTEGRALIDADE E, NA HIPÓTESE DE ESTAR DESTACADA DO RESTANTE DO DOCUMENTO, ESTA PÁGINA NÃO POSSUIRÁ VALOR ALGUM.
    </div>
</div>
`

async function run() {
    console.log('Deactivating existing templates...')
    await supabase.from('contract_templates')
        .update({ active: false })
        .eq('name', 'Termo de Responsabilidade')

    console.log('Inserting new template...')
    const { data, error } = await supabase.from('contract_templates').insert([{
        name: 'Termo de Responsabilidade',
        description: 'Modelo oficial extraído do PDF Termo_de_Comodato.pdf',
        content: templateContent,
        category: 'RH',
        active: true
    }]).select()

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Template registered successfully:', data[0].id)
    }
}

run()
