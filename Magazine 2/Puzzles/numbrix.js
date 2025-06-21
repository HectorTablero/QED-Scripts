class Numbrix {
    async start(container, params, savedState) {
        this.given = params[0];
        this.height = this.given.length;
        this.width = this.given[0].length;
        if (savedState) {
            this.grid = savedState;
        } else {
            this.grid = [];
            for (let r = 0; r < this.height; r++) {
                this.grid.push([]);
                for (let c = 0; c < this.width; c++) {
                    this.grid[r].push(this.given[r][c]);
                }
            }
        }
        this.container = container;
        this.container.classList.add("flex", "flex-col", "justify-center");
        const style = document.createElement("style");
        style.innerText = `
      .ienumbrix { border-color: ${ielightmainrgb}; }
      .dark .ienumbrix { border-color: ${iedarkmainrgb}; }
      .numbrix-fixed { font-weight: bold; background-color: #ddd; }
      .ienumbrix input { width: 100%; height: 100%; border: none; outline: none; text-align: center; background-color: inherit; }
    `;
        this.container.appendChild(style);
        this.createNumbrix();
        this.resize();
        this.checkSolution();
        window.addEventListener("resize", () => this.resize());
    }
    createNumbrix() {
        this.outerNumbrix = document.createElement("div");
        this.outerNumbrix.className = "flex w-full h-full justify-center items-center";
        this.numbrixContainer = document.createElement("div");
        this.numbrixContainer.className = "flex flex-col";
        for (let r = 0; r < this.height; r++) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "flex";
            for (let c = 0; c < this.width; c++) {
                const cellDiv = document.createElement("div");
                cellDiv.className = "ienumbrix iecrossword relative";
                let top = r === 0 ? "2px" : "1px";
                let left = c === 0 ? "2px" : "1px";
                let right = c === this.width - 1 ? "2px" : "1px";
                let bottom = r === this.height - 1 ? "2px" : "1px";
                cellDiv.style.cssText = `border-top-width: ${top}; border-right-width: ${right}; border-bottom-width: ${bottom}; border-left-width: ${left}; border-style: solid; flex: 1; aspect-ratio: 1; position: relative; box-sizing: border-box;`;
                const input = document.createElement("input");
                input.type = "text";
                input.value = this.grid[r][c] === 0 ? "" : this.grid[r][c];
                input.maxLength = ("" + this.width * this.height).length;
                input.className = "w-full h-full text-center";
                input.dataset.row = r;
                input.dataset.col = c;
                if (this.given[r][c] !== 0) {
                    input.disabled = true;
                    input.classList.add("numbrix-fixed");
                }
                input.addEventListener("input", (e) => this.handleInput(e));
                input.addEventListener("keydown", (e) => this.handleKeyDown(e));
                cellDiv.appendChild(input);
                rowDiv.appendChild(cellDiv);
            }
            this.numbrixContainer.appendChild(rowDiv);
        }
        this.outerNumbrix.appendChild(this.numbrixContainer);
        this.container.appendChild(this.outerNumbrix);
    }
    handleInput(e) {
        const input = e.target;
        input.value = input.value.replace(/[^0-9]/g, "");
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        this.grid[r][c] = input.value === "" ? 0 : parseInt(input.value);
        this.checkSolution();
        this.saveData(this.grid);
    }
    handleKeyDown(e) {
        const input = e.target;
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        let nr = r,
            nc = c;
        switch (e.key) {
            case "ArrowUp":
                nr = r > 0 ? r - 1 : r;
                break;
            case "ArrowDown":
                nr = r < this.height - 1 ? r + 1 : r;
                break;
            case "ArrowLeft":
                nc = c > 0 ? c - 1 : c;
                break;
            case "ArrowRight":
                nc = c < this.width - 1 ? c + 1 : c;
                break;
            default:
                return;
        }
        const newInput = this.numbrixContainer.querySelector(`input[data-row="${nr}"][data-col="${nc}"]`);
        if (newInput) {
            newInput.focus();
            newInput.select();
        }
    }
    checkSolution() {
        let isComplete = true;
        const total = this.width * this.height;
        let positions = {};
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const val = this.grid[r][c];
                if (val === 0 || isNaN(val) || val < 1 || val > total) {
                    isComplete = false;
                } else {
                    positions[val] = [r, c];
                }
            }
        }
        for (let num = 1; num <= total; num++) {
            if (!(num in positions)) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            for (let num = 1; num < total; num++) {
                let pos1 = positions[num],
                    pos2 = positions[num + 1];
                if (!pos1 || !pos2 || Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]) !== 1) {
                    isComplete = false;
                    break;
                }
            }
        }
        if (isComplete) {
            this.numbrixContainer.querySelectorAll("input").forEach((input) => {
                input.disabled = true;
            });
        }
    }
    resize() {
        const cellSize = Math.min(this.outerNumbrix.clientWidth / this.width, this.outerNumbrix.clientHeight / this.height);
        this.numbrixContainer.style.width = this.width * cellSize - 32 + "px";
        Array.from(this.numbrixContainer.children).forEach((rowDiv) => {
            rowDiv.style.height = cellSize - 32 / this.width + "px";
        });
        const fontSize = cellSize * 0.75;
        this.numbrixContainer.querySelectorAll("input").forEach((input) => {
            input.style.fontSize = `${fontSize}px`;
        });
    }
    saveData(state) {
        if (window.saveState) {
            window.saveState(state);
        }
    }
}
