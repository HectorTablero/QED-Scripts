class KenKen {
    async start(container, params, savedState) {
        this.puzzle = params[0] || { size: 4, cages: [] };
        this.size = this.puzzle.size;
        if (savedState) {
            this.grid = savedState;
        } else {
            this.grid = [];
            for (let i = 0; i < this.size; i++) {
                this.grid.push(new Array(this.size).fill(""));
            }
        }
        this.cellCage = [];
        for (let i = 0; i < this.size; i++) {
            this.cellCage.push(new Array(this.size).fill(null));
        }
        if (this.puzzle.cages) {
            this.puzzle.cages.forEach((cage, idx) => {
                for (let [r, c] of cage.cells) {
                    this.cellCage[r][c] = idx;
                }
            });
        }
        this.container = container;
        this.container.classList.add("flex", "flex-col", "justify-center");
        const style = document.createElement("style");
        style.innerText = `
      .iekenken { border-color: ${ielightmainrgb}; }
      .dark .iekenken { border-color: ${iedarkmainrgb}; }
      .iekenken input { width: 100%; height: 100%; border: none; outline: none; text-align: center; background-color: transparent; }
      .cage-label { position: absolute; top: 2px; left: 2px; font-size: 0.6em; font-weight: bold; pointer-events: none; }
      .error { background-color: rgba(255, 0, 0, 0.3); }
      .valid { background-color: rgba(0, 255, 0, 0.3); }
    `;
        this.container.appendChild(style);
        this.createKenKen();
        this.resize();
        this.checkSolution();
        window.addEventListener("resize", () => this.resize());
    }
    getBorderStyle(row, col) {
        const cageId = this.cellCage[row][col];
        const thick = "3px";
        const thin = "1px";
        const top = row === 0 || this.cellCage[row - 1][col] !== cageId ? thick : thin;
        const left = col === 0 || this.cellCage[row][col - 1] !== cageId ? thick : thin;
        const right = col === this.size - 1 || this.cellCage[row][col + 1] !== cageId ? thick : thin;
        const bottom = row === this.size - 1 || this.cellCage[row + 1][col] !== cageId ? thick : thin;
        return `border-top-width: ${top}; border-right-width: ${right}; border-bottom-width: ${bottom}; border-left-width: ${left}; border-style: solid;`;
    }
    getCageLabel(row, col) {
        if (!this.puzzle.cages) return "";
        for (let cage of this.puzzle.cages) {
            if (!cage.cells.some(([r, c]) => r === row && c === col)) continue;
            let minRow = Infinity,
                minCol = Infinity;
            for (let [r, c] of cage.cells) {
                if (r < minRow || (r === minRow && c < minCol)) {
                    minRow = r;
                    minCol = c;
                }
            }
            if (row === minRow && col === minCol) {
                return cage.operation ? `${cage.target}${cage.operation}` : `${cage.target}`;
            }
        }
        return "";
    }
    createKenKen() {
        this.outerKenKen = document.createElement("div");
        this.outerKenKen.className = "flex w-full h-full justify-center items-center";
        this.kenkenContainer = document.createElement("div");
        this.kenkenContainer.className = "flex flex-col";
        for (let row = 0; row < this.size; row++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "flex";
            for (let col = 0; col < this.size; col++) {
                const cellDiv = document.createElement("div");
                cellDiv.className = "iekenken relative";
                cellDiv.style.cssText = this.getBorderStyle(row, col) + " flex: 1; aspect-ratio: 1; position: relative; box-sizing: border-box;";
                const input = document.createElement("input");
                input.type = "text";
                input.value = this.grid[row][col];
                input.maxLength = 2;
                input.className = "w-full h-full text-center";
                input.dataset.row = row;
                input.dataset.col = col;
                input.addEventListener("input", (e) => this.handleInput(e));
                input.addEventListener("keydown", (e) => this.handleKeyDown(e));
                cellDiv.appendChild(input);
                const labelText = this.getCageLabel(row, col);
                if (labelText) {
                    const labelDiv = document.createElement("div");
                    labelDiv.className = "cage-label";
                    labelDiv.innerText = labelText;
                    cellDiv.appendChild(labelDiv);
                }
                rowDiv.appendChild(cellDiv);
            }
            this.kenkenContainer.appendChild(rowDiv);
        }
        this.outerKenKen.appendChild(this.kenkenContainer);
        this.container.appendChild(this.outerKenKen);
    }
    handleInput(event) {
        const input = event.target;
        input.value = input.value.replace(/[^0-9]/g, "");
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        this.grid[row][col] = input.value;
        this.checkSolution();
        this.saveData(this.grid);
    }
    handleKeyDown(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        let newRow = row;
        let newCol = col;
        switch (event.key) {
            case "ArrowUp":
                newRow = row > 0 ? row - 1 : row;
                break;
            case "ArrowDown":
                newRow = row < this.size - 1 ? row + 1 : row;
                break;
            case "ArrowLeft":
                newCol = col > 0 ? col - 1 : col;
                break;
            case "ArrowRight":
                newCol = col < this.size - 1 ? col + 1 : col;
                break;
            default:
                return;
        }
        const newInput = this.kenkenContainer.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newInput) {
            newInput.focus();
            newInput.select();
        }
    }
    checkSolution() {
        let isComplete = true;
        let valid = true;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                const num = parseInt(value);
                if (value === "" || isNaN(num) || num < 1 || num > this.size) {
                    isComplete = false;
                }
            }
        }
        for (let i = 0; i < this.size; i++) {
            let seen = new Set();
            for (let j = 0; j < this.size; j++) {
                const num = parseInt(this.grid[i][j]);
                if (!isNaN(num)) {
                    if (seen.has(num)) valid = false;
                    seen.add(num);
                }
            }
        }
        for (let j = 0; j < this.size; j++) {
            let seen = new Set();
            for (let i = 0; i < this.size; i++) {
                const num = parseInt(this.grid[i][j]);
                if (!isNaN(num)) {
                    if (seen.has(num)) valid = false;
                    seen.add(num);
                }
            }
        }
        if (this.puzzle.cages) {
            for (let cage of this.puzzle.cages) {
                let cageValues = [];
                let cageComplete = true;
                for (let [r, c] of cage.cells) {
                    const value = this.grid[r][c];
                    if (value === "" || isNaN(parseInt(value))) {
                        cageComplete = false;
                        break;
                    }
                    cageValues.push(parseInt(value));
                }
                if (cageComplete) {
                    let cageValid = false;
                    switch (cage.operation) {
                        case "+":
                            cageValid = cageValues.reduce((a, b) => a + b, 0) === cage.target;
                            break;
                        case "-":
                            if (cageValues.length === 2) cageValid = Math.abs(cageValues[0] - cageValues[1]) === cage.target;
                            break;
                        case "*":
                        case "×":
                            cageValid = cageValues.reduce((a, b) => a * b, 1) === cage.target;
                            break;
                        case "/":
                            if (cageValues.length === 2) {
                                let a = cageValues[0],
                                    b = cageValues[1];
                                cageValid = a / b === cage.target || b / a === cage.target;
                            }
                            break;
                        default:
                            if (cageValues.length === 1) cageValid = cageValues[0] === cage.target;
                            break;
                    }
                    if (!cageValid) valid = false;
                }
            }
        }
        this.kenkenContainer.querySelectorAll("input").forEach((input) => {
            input.classList.remove("error", "valid");
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            const value = this.grid[row][col];
            const num = parseInt(value);
            if (value !== "" && !isNaN(num) && num >= 1 && num <= this.size) {
                input.classList.add("valid");
            } else {
                input.classList.add("error");
            }
        });
        if (isComplete && valid) {
            this.kenkenContainer.querySelectorAll("input").forEach((input) => {
                input.disabled = true;
            });
        }
    }
    resize() {
        const cellSize = Math.min(this.outerKenKen.clientWidth / this.size, this.outerKenKen.clientHeight / this.size);
        this.kenkenContainer.style.width = this.size * cellSize - 32 + "px";
        Array.from(this.kenkenContainer.children).forEach((rowDiv) => {
            rowDiv.style.height = cellSize - 32 / this.size + "px";
        });
        const fontSize = cellSize * 0.75;
        this.kenkenContainer.querySelectorAll("input").forEach((input) => {
            input.style.fontSize = `${fontSize}px`;
        });
    }
    saveData(state) {
        if (window.saveState) {
            window.saveState(state);
        }
    }
}
