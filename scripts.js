function alterarEstoque(id, delta, cm) {
    const input = document.getElementById(id);
    let valor = parseInt(input.value) + delta;
    if (valor < 0) valor = 0;
    input.value = valor;
    const codigo = id.split('_')[1];
    atualizarValor(codigo, cm);
}

function atualizarValor(codigo, cm) {
    const estoqueS = document.getElementById(`estoqueS_${codigo}`).value;
    const estoqueT = document.getElementById(`estoqueT_${codigo}`).value;
    const valorTotal = estoqueS * cm;
    document.getElementById(`valor_${codigo}`).innerText = `R$ ${valorTotal.toFixed(2)}`;
    atualizarTotal();
}

function atualizarTotal() {
    let total = 0;
    document.querySelectorAll('tbody tr').forEach(tr => {
        const valor = parseFloat(tr.querySelector('td[id^="valor_"]').innerText.replace('R$', '').replace(',', '.'));
        total += isNaN(valor) ? 0 : valor;
    });
    document.getElementById('total_valor_estoqueS').innerText = `R$ ${total.toFixed(2)}`;
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
