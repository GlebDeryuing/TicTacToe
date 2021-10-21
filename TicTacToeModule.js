var TicTacToe = (function() {
    var stepCount = false, // false - ход крестиков, true - ноликов
        arrValue = [], // массив с полем: пустыми полями, крестиками и ноликами
        mode = 0, // режим игры (задается при запуске/после завершения игры)
        start = true; // переменная, отвечающая за первый запуск (true - да, false - нет)
    // заполняем массив поля пустыми клетками
    for (var y = 0; y < 3; y++) {
        arrValue.push([]);
        for (var x = 0; x < 3; x++) {
            arrValue[y].push(0);
        }
    }

    //заполняем массив поля пустыми клетками, отрисовываем поле, 
    function newGame() {
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                arrValue[x][y] = 0;
            }
        }
        stepCount = false;
        load();
    }
    // -1 - X, 1 - O
    function cl(x, y) {
        if (!arrValue[y][x]) {
            if (stepCount && mode === 2) {
                arrValue[y][x] = 1;
                stepCount = false;
            } else {
                arrValue[y][x] = -1;
                stepCount = true;
                if (mode === 1) {
                    load();
                    if (freeCount() && whoWin() === 0) {
                        stepCount = false;
                        setTimeout(AI, 200);
                    }
                } else if (mode === 0) {
                    load();
                    if (freeCount() && whoWin() === 0) {
                        stepCount = false;
                        setTimeout(easyAI, 200);
                    }
                }
            }
        }
        load();
    }

    function changeMode(num) {
        mode = num;
        newGame();
    }

    //возвращает число свободных клеток на поле
    function freeCount() {
        var counter = 0;
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                if (arrValue[y][x] === 0) counter++;
            }
        }
        return counter;
    }

    //простой режим, ставит в первую свободную клетку
    function easyAI() {
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                if (arrValue[y][x] === 0) {
                    arrValue[y][x] = 1;
                    return load();
                }
            }
        }
    }

    // сложный режим
    function AI() {
        //если центральная свободна, то ставим туда (самая выгодная позиция, блокирующая 4 из 8 возможных выигрышных комбинаций)
        if (arrValue[1][1] === 0) {
            arrValue[1][1] = 1;
            return load();
        }
        var winCombination = []; //массив объектов, анализируемых далее
        for (var i = 0; i < 3; i++) {
            var val = 0,
                free = 0;
            for (var j = 0; j < 3; j++) {
                if (arrValue[j][i] != 0) {
                    val += arrValue[j][i];
                } else {
                    free++;
                }
            }
            winCombination.push({ type: 'str', id: i, value: val, free: free }) //добавляем все строки (тип строка, айди - номер, вэлью - сумма значений, фри - кол-во свободных клеток)
        }
        for (var j = 0; j < 3; j++) {
            var val = 0,
                free = 0;
            for (var i = 0; i < 3; i++) {
                if (arrValue[j][i] != 0) {
                    val += arrValue[j][i];
                } else {
                    free++;
                }
            }
            winCombination.push({ type: 'col', id: j, value: val, free: free }) //добавляем все столбцы аналогично строкам
        }
        //вручную добавляем обе диагонали аналогично
        var freefirstdiag = 0,
            freeseconddiag = 0;
        if (arrValue[0][0] === 0) freefirstdiag++;
        if (arrValue[2][0] === 0) freeseconddiag++;
        if (arrValue[1][1] === 0) {
            freefirstdiag++;
            freeseconddiag++;
        }
        if (arrValue[0][2] === 0) freeseconddiag++;
        if (arrValue[2][2] === 0) freefirstdiag++;

        var firstdiag = {
                type: 'diag',
                id: 0,
                value: arrValue[0][0] + arrValue[1][1] + arrValue[2][2],
                free: freefirstdiag
            },
            seconddiag = {
                type: 'diag',
                id: 1,
                value: arrValue[2][0] + arrValue[1][1] + arrValue[0][2],
                free: freeseconddiag
            };
        winCombination.push(firstdiag, seconddiag);
        var minobj = winCombination[0],
            winobj = null;
        for (var i = 0; i < 8; i++) { //ищем самую проигрышную строку
            var temp = winCombination[i];
            if (temp.free && temp.value < minobj.value) {
                minobj = temp;
            }
            if (temp.value === 2) { //или победную
                winobj = temp;
            }
        }
        if (minobj.value > -2) { //если самая проигрышная не дает победы сопернику, то ищем самую выигрышную
            for (var i = 0; i < 8; i++) {
                var temp = winCombination[i];
                if (temp.free && temp.value > minobj.value) {
                    minobj = temp;
                }
            }
        }
        if (winobj != null) {
            minobj = winobj;
        }
        var X, Y; //вычисляем координаты свободной клетки в самой проигрышной(выигрышной/победной) строке
        if (minobj.type === "str") {
            for (var j = 0; j < 3; j++) {
                if (arrValue[j][minobj.id] === 0) {
                    X = j;
                    Y = minobj.id;
                }
            }
        } else if (minobj.type === "col") {
            for (var i = 0; i < 3; i++) {
                if (arrValue[minobj.id][i] === 0) {
                    X = minobj.id;
                    Y = i;
                }
            }
        } else if (minobj.type === "diag") {
            if (arrValue[1][1] === 0) {
                X = 1;
                Y = 1;
            } else if (minobj.id === 0) {
                if (arrValue[2][2] === 0) {
                    X = 2;
                } else {
                    X = 0;
                }
                Y = X;
            } else {
                if (arrValue[2][0] === 0) {
                    X = 2;
                    Y = 0;
                } else {
                    X = 0;
                    Y = 2;
                }
            }
        }
        arrValue[Number(X)][Number(Y)] = 1; //o
        return load();
    }



    function whoWin() { // -1 - X, 1 - O, 3 - ничья
        if (arrValue[0][0] !== 0 && (arrValue[0][0] === arrValue[0][1] && arrValue[0][0] === arrValue[0][2]) || // 1 строка
            (arrValue[0][0] === arrValue[1][0] && arrValue[0][0] === arrValue[2][0]) || // 1 стоблец
            (arrValue[0][0] === arrValue[1][1] && arrValue[2][2] === arrValue[0][0])) // 1 диагональ
            return arrValue[0][0];
        else if (arrValue[1][1] !== 0 && (arrValue[1][0] === arrValue[1][1] && arrValue[1][0] === arrValue[1][2]) || // 2 строка
            (arrValue[0][1] === arrValue[1][1] && arrValue[0][1] === arrValue[2][1]) || // 2 стоблец
            (arrValue[0][2] === arrValue[1][1] && arrValue[2][0] === arrValue[1][1])) // 2 диагональ
            return arrValue[1][1];
        else if (arrValue[2][2] !== 0 && (arrValue[2][2] === arrValue[0][2] && arrValue[2][2] === arrValue[1][2]) || // 3 стоблец
            (arrValue[2][2] === arrValue[2][0] && arrValue[2][2] === arrValue[2][1])) // 3 строка
            return arrValue[2][2];
        else {
            isFree = false;
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    if (arrValue[x][y] === 0) isFree = true;
                }
            }
            if (isFree) return 0;
            else return 3;
        }

    }

    //отрисовка поля
    function load() {
        var code = '<div class="field">';
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                code += '<div onclick="TicTacToe.click(' + x + ', ' + y +
                    ');">';
                if (arrValue[y][x] === -1) {
                    code += 'x';
                } else if (arrValue[y][x] === 1) {
                    code += 'o';
                }
                code += '</div>';
            }
        }
        code += '</div>';
        document.body.innerHTML = code;
        var winner = whoWin(); //если есть победитель/это первый запуск, то +отрисовка стартового экрана
        if (winner != 0 || start) {
            var text;
            start = false;
            if (winner === 3) {
                text = "Draw!";
            } else if (winner === 1) {
                text = "O win!";
            } else if (winner === -1) {
                text = "X win!";
            } else text = "Choose game mode"
            code += '<div class="win">' + text +
                '<div class=mode0 onclick="TicTacToe.changeMode(0);">1 player<br><font size="3">(easy)</font></div>' +
                '<div class=mode1 onclick="TicTacToe.changeMode(1);">1 player<br><font size="3">(hard)</font></div>' +
                '<div class=mode2 onclick="TicTacToe.changeMode(2);">2 players</div></div>';
        }
        document.body.innerHTML = code;
    }
    return {
        click: cl,
        load: load,
        newgame: newGame,
        changeMode: changeMode
    };
}())