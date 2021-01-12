"use strict";
class AudioFiles {
    constructor() {
        this.knock = new Audio('knock.mp3'); // https://freesound.org/people/deleted_user_877451/sounds/66113/
    }
    playKnock() {
        this.knock.play();
    }
}
const audioFiles = new AudioFiles();
class Board {
    constructor(targets) {
        this.targets = targets;
        this.numbersAreHidden = false;
        this._toggleNumberVisibilityTimer = () => { };
        this.sizeX = 0;
        this.sizeY = 0;
        const ctx = ui.elements.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('ctx is undefined');
        }
        this.ctx = ctx;
    }
    getContext() {
        return this.ctx;
    }
    mouseMove(x, y) {
        if (this.targets.findTarget(x, y)) {
            ui.elements.canvas.classList.add('pointer');
        }
        else {
            ui.elements.canvas.classList.remove('pointer');
        }
    }
    clear() {
        this.ctx.clearRect(0, 0, this.sizeX, this.sizeY);
    }
    draw() {
        this.clear();
        this.targets.drawAll(this.numbersAreHidden);
    }
    findFreeSpot() {
        const dist = RADIUS + RADIUS * 0.1;
        let counter = 0;
        while (true) {
            counter += 1;
            if (counter > 1000) {
                throw new Error('Couldnt find free spot');
            }
            const centerX = getRandomArbitrary(0, this.sizeX);
            const centerY = getRandomArbitrary(0, this.sizeY);
            if (centerX - dist < 0 ||
                centerX + DIST > this.sizeX ||
                centerY - DIST < 0 ||
                centerY + dist > this.sizeY) {
                continue;
            }
            if (this.targets.doesCollide(centerX, centerY)) {
                continue;
            }
            return [centerX, centerY];
        }
    }
    setNumberVisibility(isVisible, delay) {
        this._toggleNumberVisibilityTimer();
        this._toggleNumberVisibilityTimer = timers.setTimeout(() => {
            this.numbersAreHidden = !isVisible;
            this.draw();
        }, delay * 1000);
    }
    setup() {
        this.sizeX = ui.elements.canvasWrapper.clientWidth;
        this.sizeY = ui.elements.canvasWrapper.clientHeight;
        ui.elements.canvas.width = this.sizeX;
        ui.elements.canvas.height = this.sizeY;
    }
}
class Circle {
    constructor(ctx, centerX, centerY, text, color) {
        this.ctx = ctx;
        this._object = undefined;
        this.centerX = centerX;
        this.centerY = centerY;
        this.text = text;
        this.color = color;
    }
    draw(hideNumbers) {
        this._object = new Path2D();
        this.ctx.beginPath();
        this._object.arc(this.centerX, this.centerY, RADIUS, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill(this._object);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#003300';
        this.ctx.stroke(this._object);
        this.ctx.fillStyle = 'black';
        if (!hideNumbers) {
            this.ctx.font = `${FONTSIZE}px sans-serif`;
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.text, this.centerX, this.centerY);
        }
    }
    isInPath(x, y) {
        if (!this._object) {
            throw new Error('path is undefined');
        }
        return this.ctx.isPointInPath(this._object, x, y);
    }
}
class Game {
    constructor(board, targets, gameConfig, onFinish) {
        this.stats = new Stats(gameConfig);
        this.board = board;
        this.targets = targets;
        this.gameConfig = gameConfig;
        this.symbolGenerator = initializeSymbolGenerator(this.gameConfig.symbolGenerator);
        this._autoAddNumberTimer = () => { };
        this.lives = gameConfig.lives || 0;
        this.onFinish = onFinish;
    }
    start() {
        this.board.clear();
        COLORS.sort(() => 0.5 - Math.random());
        this.board.setup();
        for (let i = 0; i < this.gameConfig.amount; i++) {
            this.addNumber();
        }
        this.board.draw();
        const enableShowButton = this.gameConfig.enableShowButton;
        if (enableShowButton) {
            ui.show('showButton');
        }
        if (this.gameConfig.hideNumbersAfter) {
            this.board.setNumberVisibility(false, this.gameConfig.hideNumbersAfter);
        }
        if (this.gameConfig.lives) {
            ui.show('lives');
            this.updateLives();
        }
        this.resetAutoAddNumberTimer();
    }
    addNumber() {
        const [centerX, centerY] = this.board.findFreeSpot();
        if (this.symbolGenerator.isLast()) {
            return;
        }
        const nextNumber = this.symbolGenerator.next();
        this.targets.add(new Circle(this.board.getContext(), centerX, centerY, String(nextNumber), this.symbolGenerator.getColor()));
    }
    resetAutoAddNumberTimer() {
        if (this.gameConfig.autoAddNumberInterval) {
            this._autoAddNumberTimer();
            this._autoAddNumberTimer = timers.setInterval(() => {
                this.addNumber();
                this.board.draw();
            }, this.gameConfig.autoAddNumberInterval * 1000);
        }
    }
    updateLives() {
        ui.elements.livesValue.innerHTML = String(this.lives);
    }
    endGame(isFinished) {
        this.stats.finish(ui.elements.store.checked);
        this.onFinish(this.stats, isFinished);
    }
    onClick(target) {
        if (this.gameConfig.hideAfterFirstClick) {
            this.board.setNumberVisibility(false, 0);
        }
        if (!target) {
            // Click missed the targets
            audioFiles.playKnock();
            return;
        }
        this.stats.click();
        const targetIsCurrent = this.targets.tapTarget(target);
        if (targetIsCurrent) {
            // Click hit correct target
            this.stats.foundNumber(target.text);
            if (this.targets.allTargetsReached()) {
                this.endGame(true);
            }
            else if (this.gameConfig.addNumberOnTargetHit) {
                this.addNumber();
            }
            this.board.draw();
        }
        else {
            // Click hit wrong target
            this.resetAutoAddNumberTimer();
            audioFiles.playKnock();
            if (this.gameConfig.lives) {
                if (this.lives === 0) {
                    this.endGame(true);
                    return;
                }
                else {
                    this.lives -= 1;
                    this.updateLives();
                }
            }
            if (this.gameConfig.addNumberOnMisclick) {
                this.addNumber();
                this.board.draw();
            }
            if (this.gameConfig.showNumbersOnMisclick) {
                this.board.setNumberVisibility(true, 0);
                this.board.setNumberVisibility(false, this.gameConfig.showNumbersOnMisclick);
            }
        }
    }
    onClickShow() {
        if (this.gameConfig.enableShowButton) {
            this.addNumber();
            this.board.setNumberVisibility(true, 0);
            this.board.setNumberVisibility(false, this.gameConfig.enableShowButton);
        }
    }
}
function getPredefinedGame(type, difficulty) {
    const predefinedGames = {
        clearTheBoard: {
            easy: {
                gameType: 'clearTheBoard',
                difficulty: 'easy',
                amount: 5,
                autoAddNumberInterval: 5,
                hideNumbersAfter: 3,
                hideAfterFirstClick: true,
                enableShowButton: 3,
                symbolGenerator: { type: 'NumericAsc' },
            },
            medium: {
                gameType: 'clearTheBoard',
                difficulty: 'medium',
                amount: 10,
                addNumberOnMisclick: true,
                autoAddNumberInterval: 4,
                hideNumbersAfter: 4,
                hideAfterFirstClick: true,
                enableShowButton: 3,
                symbolGenerator: { type: 'NumericAsc' },
            },
            hard: {
                gameType: 'clearTheBoard',
                difficulty: 'hard',
                amount: 10,
                addNumberOnMisclick: true,
                autoAddNumberInterval: 3,
                hideNumbersAfter: 3,
                hideAfterFirstClick: true,
                enableShowButton: 2,
                symbolGenerator: { type: 'NumericAsc' },
            },
        },
        memory: {
            easy: {
                gameType: 'memory',
                difficulty: 'easy',
                amount: 5,
                hideAfterFirstClick: true,
                symbolGenerator: { type: 'NumericAsc' },
            },
            medium: {
                gameType: 'memory',
                difficulty: 'medium',
                amount: 7,
                hideAfterFirstClick: true,
                symbolGenerator: { type: 'NumericAsc' },
            },
            hard: {
                gameType: 'memory',
                difficulty: 'hard',
                amount: 10,
                hideAfterFirstClick: true,
                symbolGenerator: { type: 'NumericAsc' },
            },
        },
        invisibleNumbers: {
            easy: {
                gameType: 'invisibleNumbers',
                difficulty: 'easy',
                amount: 3,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 3,
                showNumbersOnMisclick: 2,
                symbolGenerator: { type: 'NumericAsc' },
                lives: 5,
            },
            medium: {
                gameType: 'invisibleNumbers',
                difficulty: 'medium',
                amount: 4,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 2,
                showNumbersOnMisclick: 1,
                symbolGenerator: { type: 'NumericAsc' },
                lives: 3,
            },
            hard: {
                gameType: 'invisibleNumbers',
                difficulty: 'hard',
                amount: 3,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 1,
                enableShowButton: 2,
                autoAddNumberInterval: 10,
                lives: 2,
                symbolGenerator: { type: 'NumericAsc' },
            },
        },
        speed: {
            easy: {
                gameType: 'speed',
                difficulty: 'easy',
                amount: 10,
                symbolGenerator: { type: 'NumericAsc' },
            },
            medium: {
                gameType: 'speed',
                difficulty: 'medium',
                amount: 20,
                symbolGenerator: { type: 'NumericDesc', start: 20 },
            },
            hard: {
                gameType: 'speed',
                difficulty: 'hard',
                amount: 20,
                symbolGenerator: { type: 'MixAsc' },
            },
        },
    };
    const gameTypes = predefinedGames[type];
    if (!gameTypes) {
        throw new Error(`Config with gameType "${type}" not found`);
    }
    const gameConfig = gameTypes[difficulty];
    if (!gameConfig) {
        throw new Error(`Config with difficulty "${difficulty}" not found`);
    }
    return gameConfig;
}
const FONTSIZE = 26;
const RADIUS = 25;
const DIST = RADIUS + RADIUS * 0.1;
const COLORS = [
    // https://coolors.co/a86282-9a75a3-7998af-71afbb-6ac1c8-d3dcad-e9c6af-fab6ad-f6958e-f07270
    '#A86282',
    '#9A75A3',
    '#7998AF',
    '#71AFBB',
    '#6AC1C8',
    '#D3DCAD',
    '#E9C6AF',
    '#FAB6AD',
    '#F6958E',
    '#F07270',
];
class Main {
    init() {
        ui.setScreen('newGame');
        ui.elements.abort.addEventListener('click', () => {
            timers.clearAll();
            ui.setScreen('newGame');
            this.game.endGame(false);
        });
        ui.elements.startGameContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON') {
                const gameType = target.dataset.type;
                const difficulty = target.dataset.difficulty;
                this.startGame(getPredefinedGame(gameType, difficulty));
            }
        });
        ui.elements.canvas.addEventListener('mousedown', (e) => {
            const circle = this.targets.findTarget(e.offsetX, e.offsetY);
            this.game.onClick(circle);
        });
        ui.elements.showButton.addEventListener('click', () => this.game.onClickShow());
        ui.elements.canvas.addEventListener('mousemove', (e) => this.board.mouseMove(e.offsetX, e.offsetY));
        ui.elements.back.addEventListener('click', () => {
            timers.clearAll();
            ui.setScreen('newGame');
        });
        ui.elements.newGame.addEventListener('click', () => {
            this.startGame(this.game.gameConfig);
        });
        ui.elements.clipboard.addEventListener('click', () => this.copyToClipboard());
        ui.elements.customGame.addEventListener('click', () => {
            ui.setScreen('customGame');
        });
        ui.elements.startCustomGame.addEventListener('click', () => {
            this.createCustomGame();
        });
        ui.elements.loadExistingConfig.addEventListener('change', (e) => {
            this.loadExistingConfig(e);
        });
    }
    endGame(stats, isFinished) {
        timers.clearAll();
        if (isFinished) {
            this.showResults(stats);
        }
    }
    showResults(stats) {
        ui.elements.finishGameCode.innerHTML = stats.print();
        ui.setScreen('finishGame');
    }
    startGame(gameConfig) {
        if (window.innerWidth < 1000) {
            document.documentElement.requestFullscreen();
        }
        timers.clearAll();
        ui.setScreen('game');
        this.targets = new Targets();
        this.board = new Board(this.targets);
        this.game = new Game(this.board, this.targets, gameConfig, (s, i) => this.endGame(s, i));
        this.game.start();
    }
    copyToClipboard() {
        const stats = Stats.statsToCsv();
        if (!stats) {
            alert('No stats present');
            return;
        }
        navigator.clipboard
            .writeText(stats)
            .then(() => alert('Text copied to clipboard.'))
            .catch((e) => {
            console.error(e);
            alert('Stats could not be copied to clipboard');
        });
    }
    createCustomGame() {
        const gameConfig = {
            gameType: 'custom',
            difficulty: 'unknown',
            symbolGenerator: {
                type: 'AlphaAsc',
            },
            amount: parseInt(ui.readInput('amount')),
            addNumberOnMisclick: ui.readCheckbox('addNumberOnMisclick'),
            addNumberOnTargetHit: ui.readCheckbox('addNumberOnTargetHit'),
            autoAddNumberInterval: parseInt(ui.readInput('autoAddNumberInterval')),
            hideAfterFirstClick: ui.readCheckbox('hideAfterFirstClick'),
            hideNumbersAfter: parseInt(ui.readInput('hideNumbersAfter')),
            showNumbersOnMisclick: parseInt(ui.readInput('showNumbersOnMisclick')),
            enableShowButton: parseInt(ui.readInput('enableShowButton')),
            lives: parseInt(ui.readInput('lives')),
        };
        this.startGame(gameConfig);
    }
    loadExistingConfig(e) {
        const target = e.target;
        const option = target.options[target.selectedIndex];
        const gameType = option.dataset.type;
        const difficulty = option.dataset.difficulty;
        const config = getPredefinedGame(gameType, difficulty);
        ui.writeInput('amount', config.amount);
        ui.writeInput('autoAddNumberInterval', config.autoAddNumberInterval);
        ui.writeInput('hideNumbersAfter', config.hideNumbersAfter);
        ui.writeInput('showNumbersOnMisclick', config.showNumbersOnMisclick);
        ui.writeInput('enableShowButton', config.enableShowButton);
        ui.writeInput('lives', config.lives);
        ui.writeCheckbox('addNumberOnMisclick', config.addNumberOnMisclick);
        ui.writeCheckbox('addNumberOnTargetHit', config.addNumberOnTargetHit);
        ui.writeCheckbox('hideAfterFirstClick', config.hideAfterFirstClick);
    }
}
function getCurrentTimestamp() {
    return new Date().getTime();
}
// https://stackoverflow.com/a/45309555
function median(values) {
    if (values.length === 0)
        return 0;
    values = [...values].sort(function (a, b) {
        return a - b;
    });
    const half = Math.floor(values.length / 2);
    if (values.length % 2)
        return values[half];
    return (values[half - 1] + values[half]) / 2.0;
}
class Stats {
    constructor(gameConfig) {
        const now = getCurrentTimestamp();
        this.start = now;
        this.end = now;
        this.startCurrent = now;
        this.clicks = 0;
        this.correctClicks = 0;
        this.intervals = [];
        this.gameConfig = gameConfig;
    }
    static statsToCsv() {
        const columns = [
            'gameConfig.gameType',
            'gameConfig.difficulty',
            'stats.start',
            'stats.end',
            'stats.clicks',
            'stats.correctClicks',
            'intervals.average',
            'intervals.median',
            'intervals.min',
            'intervals.max',
        ];
        const s = localStorage.getItem('stats');
        if (!s) {
            return '';
        }
        const stats = JSON.parse(s);
        let output = columns.map((s) => s.split('.')[1]).join(';') + '\n';
        for (const [gameType, games] of Object.entries(stats.games)) {
            for (const game of games) {
                for (const col of columns) {
                    const [obj, prop] = col.split('.');
                    let value;
                    if (obj === 'intervals') {
                        if (prop === 'average') {
                            value = (game.intervals.reduce((a, b) => a + b.duration, 0) /
                                game.intervals.length).toFixed(1);
                        }
                        else if (prop === 'max') {
                            value = Math.max(...game.intervals.map((i) => i.duration));
                        }
                        else if (prop === 'min') {
                            value = Math.min(...game.intervals.map((i) => i.duration));
                        }
                        else if (prop === 'median') {
                            value = median(game.intervals.map((i) => i.duration));
                        }
                    }
                    else {
                        // @ts-ignore
                        value = game[obj][prop];
                    }
                    output += value + ';';
                }
                output += '\n';
            }
        }
        return output.trim();
    }
    click() {
        this.clicks += 1;
    }
    foundNumber(number) {
        this.correctClicks += 1;
        const now = getCurrentTimestamp();
        this.intervals.push({ number, duration: now - this.startCurrent });
        this.startCurrent = now;
    }
    store() {
        const s = localStorage.getItem('stats');
        const currentStats = s ? JSON.parse(s) : { games: {} };
        const gameType = this.gameConfig.gameType;
        if (!currentStats.games[gameType]) {
            currentStats.games[gameType] = [];
        }
        const newEntry = {
            gameConfig: this.gameConfig,
            stats: {
                start: this.start,
                end: this.end,
                clicks: this.clicks,
                correctClicks: this.correctClicks,
            },
            intervals: this.intervals,
        };
        currentStats.games[gameType || 'unkownType'].push(newEntry);
        localStorage.setItem('stats', JSON.stringify(currentStats));
    }
    finish(store) {
        this.end = getCurrentTimestamp();
        if (store) {
            this.store();
        }
    }
    print() {
        let res = '';
        res += `
Misclicks: ${this.clicks - this.correctClicks}
Numbers cleared: ${this.correctClicks}
Total duraction: ${((this.end - this.start) / 1000).toFixed(1)} sec

`;
        for (const int of this.intervals) {
            res += `${int.number}: ${(int.duration / 1000).toFixed(1)} sec\n`;
        }
        const opts = {
            height: 6,
            format: function (x, i) {
                return (x / 1000).toFixed(2);
            },
        };
        return res;
    }
}
function getAlphabet(limit) {
    let a = '';
    for (let i = 9; ++i < 36;) {
        a += i.toString(36);
    }
    return a.slice(0, limit).toUpperCase().split('');
}
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
class NumericAsc {
    constructor() {
        this._current = 0;
    }
    isLast() {
        return false;
    }
    next() {
        if (!this.isLast()) {
            this._current += 1;
        }
        return String(this._current);
    }
    getColor() {
        return COLORS[this._current % 10];
    }
}
class NumericDesc {
    constructor(config) {
        this._current = config.start + 1;
    }
    isLast() {
        return this._current === 1;
    }
    next() {
        if (!this.isLast()) {
            this._current -= 1;
        }
        return String(this._current);
    }
    getColor() {
        return COLORS[this._current % 10];
    }
}
class AlphaAsc {
    constructor() {
        this._current = -1; // 0 'equals 'a'
    }
    isLast() {
        return this._current === 25;
    }
    next() {
        if (!this.isLast()) {
            this._current += 1;
        }
        return (this._current + 10).toString(36).toUpperCase();
    }
    getColor() {
        return COLORS[this._current % 10];
    }
}
class AlphaDesc {
    constructor(config) {
        this._current = config.startLetter.toLowerCase().charCodeAt(0) - 96;
    }
    isLast() {
        return this._current === 0;
    }
    next() {
        if (!this.isLast()) {
            this._current -= 1;
        }
        return (this._current + 10).toString(36).toUpperCase();
    }
    getColor() {
        return COLORS[this._current % 10];
    }
}
class MixAsc {
    constructor() {
        this._series = [];
        const alpha = getAlphabet(36);
        alpha.forEach((letter, i) => {
            this._series.push(String(i));
            this._series.push(letter);
        });
        this._current = 0;
    }
    isLast() {
        return this._current + 1 === this._series.length;
    }
    next() {
        if (!this.isLast()) {
            this._current += 1;
        }
        return this._series[this._current];
    }
    getColor() {
        return COLORS[this._current % 10];
    }
}
function initializeSymbolGenerator(cfg) {
    switch (cfg.type) {
        case 'NumericAsc':
            return new NumericAsc();
        case 'NumericDesc':
            return new NumericDesc(cfg);
        case 'AlphaAsc':
            return new AlphaAsc();
        case 'AlphaDesc':
            return new AlphaDesc(cfg);
        case 'MixAsc':
            return new MixAsc();
    }
}
class Targets {
    constructor() {
        this._targets = [];
    }
    add(circle) {
        this._targets.push(circle);
    }
    forEach(callback) {
        for (const target of this._targets) {
            const abort = callback(target.centerX, target.centerY, target.text);
            if (abort) {
                return;
            }
        }
    }
    findTarget(x, y) {
        return this._targets.find((target) => target.isInPath(x, y));
    }
    tapTarget(target) {
        const targetisCurrent = this._targets[0].text === target.text;
        if (targetisCurrent) {
            this._targets.shift();
        }
        return targetisCurrent;
    }
    isCurrentTarget(target) {
        return this._targets.indexOf(target) === 0;
    }
    allTargetsReached() {
        return this._targets.length === 0;
    }
    drawAll(numbersAreHidden) {
        for (const target of this._targets) {
            target.draw(numbersAreHidden);
        }
    }
    doesCollide(centerX, centerY) {
        let doesCollide = false;
        this.forEach((x, y) => {
            if (!(centerX < x - DIST * 2 || centerX > x + DIST * 2) &&
                !(centerY < y - DIST * 2 || centerY > y + DIST * 2)) {
                doesCollide = true;
                return true;
            }
        });
        return doesCollide;
    }
}
class Timers {
    constructor() {
        this._timers = new Set();
    }
    _clear(id) {
        clearTimeout(id);
        this._timers.delete(id);
    }
    setTimeout(callback, ms) {
        if (ms === 0) {
            callback();
            return () => { };
        }
        const timeoutId = setTimeout(() => {
            callback();
            this._timers.delete(timeoutId);
        }, ms);
        this._timers.add(timeoutId);
        return () => this._clear(timeoutId);
    }
    setInterval(callback, ms) {
        if (ms === 0) {
            callback();
            return () => { };
        }
        const intervalId = setInterval(callback, ms);
        this._timers.add(intervalId);
        return () => this._clear(intervalId);
    }
    clearAll() {
        this._timers.forEach(clearTimeout);
        this._timers = new Set();
        // clearTimeout can be used for both setTimeout and setInterval
    }
}
// Singleton, no need for separate instances
const timers = new Timers();
function getElementByClass(className) {
    const el = document.getElementsByClassName(className)[0];
    if (!el) {
        throw new Error(`.${className} not found`);
    }
    return el;
}
function getElementByName(name) {
    const el = document.getElementsByName(name)[0];
    if (!el) {
        throw new Error(`Element with name "${name} not found`);
    }
    return el;
}
class UI {
    constructor() {
        this.elements = {
            canvasWrapper: getElementByClass('canvas-wrapper'),
            canvas: getElementByClass('canvas'),
            finishGameCode: getElementByClass('finish-game-code'),
            showButton: getElementByClass('show'),
            abort: getElementByClass('abort'),
            lives: getElementByClass('lives'),
            livesValue: getElementByClass('lives-value'),
            newGame: getElementByClass('new-game'),
            store: getElementByClass('store'),
            clipboard: getElementByClass('clipboard'),
            startGameContainer: getElementByClass('start-game-container'),
            back: getElementByClass('back'),
            customGame: getElementByClass('custom-game'),
            startCustomGame: getElementByClass('start-custom-game'),
            loadExistingConfig: getElementByClass('load-existing-config'),
        };
        this.screens = {
            newGame: getElementByClass('new-game-screen'),
            finishGame: getElementByClass('finish-game-screen'),
            game: getElementByClass('game-screen'),
            customGame: getElementByClass('custom-game-screen'),
        };
        this._display = {};
    }
    setScreen(screenName) {
        Object.entries(this.screens).forEach(([name, el]) => {
            el.style.display = name === screenName ? 'Flex' : 'none';
        });
    }
    show(key) {
        this.elements[key].style.display = this._display[key] || 'block';
    }
    hide(key) {
        this._display[key] = window.getComputedStyle(this.elements[key], null).display;
        this.elements[key].style.display = 'none';
    }
    readInput(name) {
        const el = getElementByName(name);
        return el.value;
    }
    writeInput(name, value) {
        const el = getElementByName(name);
        el.value = String(value !== undefined ? value : '');
    }
    readCheckbox(name) {
        const el = getElementByName(name);
        return el.checked;
    }
    writeCheckbox(name, value) {
        const el = getElementByName(name);
        el.checked = value || false;
    }
}
const ui = new UI();
