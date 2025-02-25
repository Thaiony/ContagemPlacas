function alterarEstoque(id, delta, cm) {
    const input = document.getElementById(id);
    let valor = parseInt(input.value) + delta;
    if (valor < 0) valor = 0;
    input.value = valor;
    const codigo = id.split('_')[1];
    atualizarValor(codigo, cm);
    salvarDados(); // Salva os dados após cada alteração
}

function atualizarValor(codigo, cm) {
    const estoqueS = document.getElementById(`estoqueS_${codigo}`).value;
    const estoqueT = document.getElementById(`estoqueT_${codigo}`).value;
    const valorTotal = estoqueS * cm;
    document.getElementById(`valor_${codigo}`).innerText = 
        `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    atualizarTotal();
}

function atualizarTotal() {
    let totalValor = 0;
    let subtotalS = 0;
    let subtotalT = 0;

    document.querySelectorAll('tbody tr:not(.subtotal)').forEach(tr => {
        // Soma estoques
        const estoqueS = parseInt(tr.querySelector('input[id^="estoqueS_"]')?.value) || 0;
        const estoqueT = parseInt(tr.querySelector('input[id^="estoqueT_"]')?.value) || 0;
        subtotalS += estoqueS;
        subtotalT += estoqueT;

        // Soma valor
        const valor = parseFloat(tr.querySelector('td[id^="valor_"]')?.innerText
            .replace('R$', '')
            .replace('.', '')
            .replace(',', '.')
            .trim()) || 0;
        totalValor += valor;
    });

    // Atualiza subtotais
    document.getElementById('subtotal_estoqueS').innerText = subtotalS;
    document.getElementById('subtotal_estoqueT').innerText = subtotalT;

    // Atualiza total geral
    document.getElementById('total_valor_estoqueS').innerText = 
        `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

function exportarTxt() {
    let texto = 'Código\tDescrição\tCM\tEstoque S\tEstoque T\tValor Estoque S\n';
    document.querySelectorAll('tbody tr').forEach(tr => {
        const codigo = tr.children[0].innerText;
        const descricao = tr.children[1].innerText;
        const cm = tr.children[2].innerText;
        const estoqueS = tr.children[3].querySelector('input').value;
        const estoqueT = tr.children[4].querySelector('input').value;
        const valorEstoqueS = tr.children[5].innerText;
        texto += `${codigo}\t${descricao}\t${cm}\t${estoqueS}\t${estoqueT}\t${valorEstoqueS}\n`;
    });
    const blob = new Blob([texto], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventario.txt';
    link.click();
}

function exportarExcel() {
    // Criar array com os dados
    const dados = [];
    
    // Adicionar cabeçalho
    dados.push(['Código', 'Descrição', 'CM', 'Estoque S', 'Estoque T', 'Valor Estoque S']);
    
    // Adicionar dados das linhas
    document.querySelectorAll('tbody tr').forEach(tr => {
        const linha = [
            tr.children[0].innerText,                          // Código
            tr.children[1].innerText,                          // Descrição
            tr.children[2].innerText,                          // CM
            tr.children[3].querySelector('input').value,       // Estoque S
            tr.children[4].querySelector('input').value,       // Estoque T
            tr.children[5].innerText                           // Valor Estoque S
        ];
        dados.push(linha);
    });

    // Adicionar linha do total
    const totalValor = document.getElementById('total_valor_estoqueS').innerText;
    dados.push(['', '', '', '', 'Total:', totalValor]);

    // Criar planilha
    const ws = XLSX.utils.aoa_to_sheet(dados);

    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventário");

    // Gerar arquivo Excel
    XLSX.writeFile(wb, "inventario_placas.xlsx");
}

// Função para salvar os dados no localStorage
function salvarDados() {
    const dados = {};
    document.querySelectorAll('tbody tr:not(.subtotal)').forEach(tr => {
        const codigo = tr.children[0].innerText;
        dados[codigo] = {
            estoqueS: document.getElementById(`estoqueS_${codigo}`)?.value || '0',
            estoqueT: document.getElementById(`estoqueT_${codigo}`)?.value || '0',
            valor: document.getElementById(`valor_${codigo}`)?.innerText || 'R$ 0,00'
        };
    });
    localStorage.setItem('dadosInventario', JSON.stringify(dados));
}

// Função para carregar os dados do localStorage
function carregarDados() {
    const dados = JSON.parse(localStorage.getItem('dadosInventario')) || {};
    Object.keys(dados).forEach(codigo => {
        const item = dados[codigo];
        if (document.getElementById(`estoqueS_${codigo}`)) {
            document.getElementById(`estoqueS_${codigo}`).value = item.estoqueS;
            document.getElementById(`estoqueT_${codigo}`).value = item.estoqueT;
            document.getElementById(`valor_${codigo}`).innerText = item.valor;
        }
    });
    atualizarTotal(); // Atualiza os totais após carregar os dados
}

// Adicione um event listener para carregar os dados quando a página carregar
document.addEventListener('DOMContentLoaded', carregarDados);

function limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        localStorage.removeItem('dadosInventario');
        document.querySelectorAll('tbody tr:not(.subtotal)').forEach(tr => {
            const codigo = tr.children[0].innerText;
            if (document.getElementById(`estoqueS_${codigo}`)) {
                document.getElementById(`estoqueS_${codigo}`).value = '0';
                document.getElementById(`estoqueT_${codigo}`).value = '0';
                document.getElementById(`valor_${codigo}`).innerText = 'R$ 0,00';
            }
        });
        atualizarTotal();
    }
}
