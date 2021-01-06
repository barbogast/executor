"use strict";
class Board {
    constructor(targets) {
        this.targets = targets;
        this.numbersAreHidden = false;
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
    registerOnClickHandler(callback) {
        ui.elements.canvas.addEventListener('click', (e) => callback(this.targets.findTarget(e.offsetX, e.offsetY)));
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
        timers.setTimeout(() => {
            this.numbersAreHidden = !isVisible;
            this.draw();
        }, delay * 1000);
    }
    setup() {
        this.sizeX = ui.elements.canvasWrapper.clientWidth;
        this.sizeY = ui.elements.canvasWrapper.clientHeight;
        ui.elements.canvas.width = this.sizeX;
        ui.elements.canvas.height = this.sizeY;
        ui.elements.canvas.addEventListener('mousemove', (e) => this.mouseMove(e.offsetX, e.offsetY));
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
        this.stats = new Stats();
        this.board = board;
        this.targets = targets;
        this.gameConfig = gameConfig;
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
        this.board.registerOnClickHandler((circle) => this.onClick(circle));
        if (this.gameConfig.enableShowButton) {
            ui.show('showButton');
        }
        ui.elements.showButton.addEventListener('click', () => {
            this.addNumber();
            this.board.setNumberVisibility(true, 0);
            this.board.setNumberVisibility(false, 2);
        });
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
        if (this.gameConfig.symbolGenerator.isLast()) {
            return;
        }
        const nextNumber = this.gameConfig.symbolGenerator.next();
        this.targets.add(new Circle(this.board.getContext(), centerX, centerY, String(nextNumber), this.gameConfig.symbolGenerator.getColor()));
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
    finishGame() {
        this.stats.finish();
        this.onFinish(this.stats);
    }
    onClick(target) {
        if (this.gameConfig.hideAfterFirstClick) {
            this.board.setNumberVisibility(false, 0);
        }
        if (!target) {
            // Click missed the targets
            return;
        }
        this.stats.click();
        const targetIsCurrent = this.targets.tapTarget(target);
        if (targetIsCurrent) {
            // Click hit correct target
            this.stats.foundNumber(target.text);
            if (this.targets.allTargetsReached()) {
                this.finishGame();
            }
            else if (this.gameConfig.addNumberOnTargetHit) {
                this.addNumber();
            }
            this.board.draw();
        }
        else {
            // Click hit wrong target
            this.resetAutoAddNumberTimer();
            if (this.gameConfig.lives) {
                if (this.lives === 0) {
                    this.finishGame();
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
function getPredefinedGame(type, difficulty) {
    const predefinedGames = {
        clearTheBoard: {
            easy: {
                amount: 5,
                autoAddNumberInterval: 5,
                hideNumbersAfter: 3,
                hideAfterFirstClick: true,
                enableShowButton: true,
                symbolGenerator: new NumericAsc(),
            },
            middle: {
                amount: 10,
                addNumberOnMisclick: true,
                autoAddNumberInterval: 4,
                hideNumbersAfter: 4,
                hideAfterFirstClick: true,
                enableShowButton: true,
                symbolGenerator: new NumericAsc(),
            },
            hard: {
                amount: 20,
                addNumberOnMisclick: true,
                autoAddNumberInterval: 3,
                hideNumbersAfter: 5,
                hideAfterFirstClick: true,
                enableShowButton: true,
                symbolGenerator: new MixAsc(),
            },
        },
        memory: {
            easy: {
                amount: 5,
                hideNumbersAfter: 3,
                hideAfterFirstClick: true,
                symbolGenerator: new NumericAsc(),
            },
            middle: {
                amount: 10,
                addNumberOnMisclick: false,
                hideAfterFirstClick: true,
                symbolGenerator: new NumericAsc(),
            },
            hard: {
                amount: 10,
                addNumberOnMisclick: true,
                autoAddNumberInterval: 5,
                hideNumbersAfter: 5,
                hideAfterFirstClick: true,
                symbolGenerator: new NumericAsc(),
            },
        },
        invisibleNumbers: {
            easy: {
                amount: 3,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 3,
                showNumbersOnMisclick: 2,
                symbolGenerator: new NumericAsc(),
                lives: 5,
            },
            middle: {
                amount: 4,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 2,
                showNumbersOnMisclick: 1,
                symbolGenerator: new NumericAsc(),
                lives: 3,
            },
            hard: {
                amount: 3,
                addNumberOnTargetHit: true,
                hideNumbersAfter: 1,
                enableShowButton: true,
                autoAddNumberInterval: 10,
                lives: 2,
                symbolGenerator: new NumericAsc(),
            },
        },
        speed: {
            easy: {
                amount: 10,
                symbolGenerator: new NumericAsc(),
            },
            middle: {
                amount: 20,
                symbolGenerator: new NumericDesc(20),
            },
            hard: {
                amount: 20,
                symbolGenerator: new MixAsc(),
            },
        },
    };
    return predefinedGames[type][difficulty];
}
class Main {
    init() {
        ui.setScreen('newGame');
        ui.elements.abort.addEventListener('click', () => {
            timers.clearAll();
            ui.setScreen('newGame');
        });
        ui.screens.newGame.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON') {
                const gameType = target.dataset.type;
                const difficulty = target.dataset.difficulty;
                this.startGame(getPredefinedGame(gameType, difficulty));
            }
        });
    }
    endGame(stats) {
        ui.elements.finishGameCode.innerHTML = stats.print();
        timers.clearAll();
        ui.setScreen('finishGame');
        ui.elements.newGame.addEventListener('click', () => {
            timers.clearAll();
            ui.setScreen('newGame');
        });
    }
    startGame(gameConfig) {
        if (window.innerWidth < 1000) {
            document.documentElement.requestFullscreen();
        }
        timers.clearAll();
        ui.setScreen('game');
        const targets = new Targets();
        const board = new Board(targets);
        const game = new Game(board, targets, gameConfig, (stats) => this.endGame(stats));
        game.start();
    }
}
function getCurrentTimestamp() {
    return new Date().getTime();
}
class Stats {
    constructor() {
        const now = getCurrentTimestamp();
        this.start = now;
        this.end = now;
        this.startCurrent = now;
        this.clicks = 0;
        this.correctClicks = 0;
        this.intervals = [];
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
    finish() {
        this.end = getCurrentTimestamp();
    }
    print() {
        let res = '';
        res += `
Total duraction: ${(this.end - this.start) / 1000} sec
Misclicks: ${this.clicks - this.correctClicks}

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
    constructor(start) {
        this._current = start + 1;
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
    constructor(startLetter) {
        this._current = startLetter.toLowerCase().charCodeAt(0) - 96;
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
            return;
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
function getElement(className) {
    const el = document.getElementsByClassName(className)[0];
    if (!el) {
        throw new Error(`.${className} not found`);
    }
    return el;
}
class UI {
    constructor() {
        this.elements = {
            canvasWrapper: getElement('canvas-wrapper'),
            canvas: getElement('canvas'),
            finishGameCode: getElement('finish-game-code'),
            showButton: getElement('show'),
            abort: getElement('abort'),
            lives: getElement('lives'),
            livesValue: getElement('lives-value'),
            newGame: getElement('new-game'),
        };
        this.screens = {
            newGame: getElement('new-game-screen'),
            finishGame: getElement('finish-game-screen'),
            game: getElement('game-screen'),
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
}
const ui = new UI();
