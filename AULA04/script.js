(function () {
    'use strict';

    const displayResultado = document.getElementById('resultado');
    const displayExpressao = document.getElementById('expressao');

    let valorAtual = '0';
    let valorAnterior = null;
    let operadorAtual = null;
    let reiniciarNoProximoNumero = false;

    function formatar(valor) {
        if (valor === null || valor === undefined) return '';
        const numero = typeof valor === 'number' ? valor : parseFloat(valor);
        if (!isFinite(numero)) return 'Erro';

        const texto = numero.toString();
        if (texto.includes('e')) return texto;

        const [inteira, decimal] = texto.split('.');
        const inteiraFormatada = parseInt(inteira, 10).toLocaleString('pt-BR');
        return decimal !== undefined ? `${inteiraFormatada},${decimal}` : inteiraFormatada;
    }

    function simboloOperador(op) {
        return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
    }

    function atualizarDisplay() {
        displayResultado.textContent = formatar(valorAtual);

        if (operadorAtual !== null && valorAnterior !== null) {
            displayExpressao.textContent =
                `${formatar(valorAnterior)} ${simboloOperador(operadorAtual)}`;
        } else {
            displayExpressao.innerHTML = '&nbsp;';
        }
    }

    function inserirNumero(numero) {
        if (reiniciarNoProximoNumero) {
            valorAtual = numero;
            reiniciarNoProximoNumero = false;
        } else {
            valorAtual = valorAtual === '0' ? numero : valorAtual + numero;
        }
        atualizarDisplay();
    }

    function inserirDecimal() {
        if (reiniciarNoProximoNumero) {
            valorAtual = '0.';
            reiniciarNoProximoNumero = false;
        } else if (!valorAtual.includes('.')) {
            valorAtual += '.';
        }
        atualizarDisplay();
    }

    function calcular(a, b, op) {
        const x = parseFloat(a);
        const y = parseFloat(b);
        switch (op) {
            case '+': return x + y;
            case '-': return x - y;
            case '*': return x * y;
            case '/': return y === 0 ? NaN : x / y;
            default:  return y;
        }
    }

    function removerDestaqueOperadores() {
        document.querySelectorAll('.tecla-operador').forEach(t => t.classList.remove('ativo'));
    }

    function destacarOperador(op) {
        removerDestaqueOperadores();
        const tecla = document.querySelector(`.tecla-operador[data-operator="${op}"]`);
        if (tecla) tecla.classList.add('ativo');
    }

    function aplicarOperador(novoOperador) {
        if (operadorAtual !== null && !reiniciarNoProximoNumero) {
            const resultado = calcular(valorAnterior, valorAtual, operadorAtual);
            if (!isFinite(resultado)) {
                limparTudo();
                valorAtual = 'Erro';
                atualizarDisplay();
                return;
            }
            valorAnterior = resultado.toString();
            valorAtual = resultado.toString();
        } else {
            valorAnterior = valorAtual;
        }

        operadorAtual = novoOperador;
        reiniciarNoProximoNumero = true;
        destacarOperador(novoOperador);
        atualizarDisplay();
    }

    function executarIgual() {
        if (operadorAtual === null || valorAnterior === null) return;

        const resultado = calcular(valorAnterior, valorAtual, operadorAtual);
        if (!isFinite(resultado)) {
            limparTudo();
            valorAtual = 'Erro';
        } else {
            valorAtual = resultado.toString();
            valorAnterior = null;
            operadorAtual = null;
            reiniciarNoProximoNumero = true;
        }
        removerDestaqueOperadores();
        atualizarDisplay();
    }

    function limparTudo() {
        valorAtual = '0';
        valorAnterior = null;
        operadorAtual = null;
        reiniciarNoProximoNumero = false;
        removerDestaqueOperadores();
        atualizarDisplay();
    }

    function trocarSinal() {
        if (valorAtual === '0' || valorAtual === 'Erro') return;
        valorAtual = valorAtual.startsWith('-') ? valorAtual.slice(1) : '-' + valorAtual;
        atualizarDisplay();
    }

    function aplicarPercentual() {
        const numero = parseFloat(valorAtual);
        if (!isFinite(numero)) return;
        valorAtual = (numero / 100).toString();
        atualizarDisplay();
    }

    // Clique nas teclas
    document.querySelectorAll('.tecla').forEach(tecla => {
        tecla.addEventListener('click', () => {
            const numero = tecla.dataset.number;
            const operador = tecla.dataset.operator;
            const acao = tecla.dataset.action;

            if (numero !== undefined) inserirNumero(numero);
            else if (operador !== undefined) aplicarOperador(operador);
            else if (acao === 'equals') executarIgual();
            else if (acao === 'clear') limparTudo();
            else if (acao === 'sign') trocarSinal();
            else if (acao === 'percent') aplicarPercentual();
            else if (acao === 'decimal') inserirDecimal();
        });
    });

    // Suporte a teclado
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') inserirNumero(e.key);
        else if (['+', '-', '*', '/'].includes(e.key)) aplicarOperador(e.key);
        else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); executarIgual(); }
        else if (e.key === 'Escape') limparTudo();
        else if (e.key === '.' || e.key === ',') inserirDecimal();
        else if (e.key === '%') aplicarPercentual();
        else if (e.key === 'Backspace') {
            if (reiniciarNoProximoNumero || valorAtual === 'Erro') { limparTudo(); return; }
            valorAtual = valorAtual.length > 1 ? valorAtual.slice(0, -1) : '0';
            atualizarDisplay();
        }
    });

    atualizarDisplay();
})();