class Crossword {
    async start(container, params, savedState) {
        this.solution = params[0] || [[" "]];
        this.width = this.solution[0].length;
        this.height = this.solution.length;
        if (savedState) this.grid = savedState;
        else {
            this.grid = [];
            for (let i = 0; i < this.height; i++) {
                this.grid.push(Array(this.width).fill(" "));
            }
        }
        this.container = container;
        this.container.classList.add("flex", "flex-col", "justify-center");
        const style = document.createElement("style");
        style.innerText = `
            .iecrossword {
                border-color: ${ielightmainrgb};
            }
            .dark .iecrossword {
                border-color: ${iedarkmainrgb};
            }
        `;
        this.container.appendChild(style);
        this.createCrossword();
        this.resize();
        this.checkSolution();

        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        const size = Math.min(this.outerCrossword.clientWidth / this.width, this.outerCrossword.clientHeight / this.height);
        this.crosswordContainer.style.width = this.width * size - 32 + "px";
        this.crosswordContainer.childNodes.forEach((row) => {
            row.style.height = size - 32 / this.width + "px";
        });
        const fontSize = size * 0.75;
        this.crosswordContainer.querySelectorAll("input").forEach((input) => {
            input.style.fontSize = `${fontSize}px`;
        });
    }

    createCrossword() {
        this.outerCrossword = document.createElement("div");
        this.outerCrossword.className = "flex w-full h-full justify-center items-center";
        this.crosswordContainer = document.createElement("div");
        this.crosswordContainer.className = "flex flex-col items-center";

        this.solution.forEach((row, rowIndex) => {
            const r = document.createElement("div");
            r.className = "w-full flex justify-center";
            row.forEach((cell, colIndex) => {
                const c = document.createElement("div");
                c.className = "w-full h-full p-0";
                c.style.aspectRatio = 1;
                if (cell !== " ") {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = this.grid[rowIndex][colIndex];
                    if (input.value === " ") input.value = "";
                    if (cell.split("-")[1]) input.placeholder = cell.split("-")[1];
                    input.maxLength = 1;
                    input.className = `w-full h-full text-center bg-${ielightbgclass} dark:bg-${iedarkbgclass} border iecrossword`;
                    input.style.textTransform = "uppercase";
                    input.dataset.row = rowIndex;
                    input.dataset.col = colIndex;
                    input.addEventListener("input", (e) => this.handleInput(e));
                    input.addEventListener("keydown", (e) => this.handleKeyDown(e));
                    c.appendChild(input);
                }
                r.appendChild(c);
            });
            this.crosswordContainer.appendChild(r);
        });

        this.outerCrossword.appendChild(this.crosswordContainer);
        this.container.appendChild(this.outerCrossword);
    }

    handleInput(event) {
        const input = event.target;
        input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
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
                newRow = row < this.height - 1 ? row + 1 : row;
                break;
            case "ArrowLeft":
                newCol = col > 0 ? col - 1 : col;
                break;
            case "ArrowRight":
                newCol = col < this.width - 1 ? col + 1 : col;
                break;
            default:
                return;
        }

        if (this.solution[newRow][newCol] !== " ") {
            const newInput = this.crosswordContainer.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
            if (newInput) newInput.select();
        }
    }

    checkSolution() {
        let isComplete = true;
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = this.solution[row][col].split("-")[0];
                if (cell !== " " && cell.toUpperCase() !== this.grid[row][col].toUpperCase()) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }

        if (isComplete) {
            this.crosswordContainer.querySelectorAll("input").forEach((input) => {
                input.disabled = true;
            });
        }
    }
}
