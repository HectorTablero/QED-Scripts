class VanKochFractal {
    async start(container, params, savedState) {
        this.depth = params[0] || 5;
        this.splitDuration = params[1] || 25;
        this.pauseDuration = params[2] || 75;
        this.counter = -this.pauseDuration;

        const style = document.createElement("style");
        style.innerText = `
        .vkfractalinteractiveelement {
            color: ${ielightmainrgb};
        }
        .dark .vkfractalinteractiveelement {
            color: ${iedarkmainrgb};
        }
        `;
        container.appendChild(style);
        container.classList.add("p-8", "w-full", "h-full");

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.classList.add("w-full", "h-full", "vkfractalinteractiveelement");
        this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.svg.setAttribute("viewBox", "0 -25 100 50");
        this.svg.setAttribute("stroke", "currentColor");
        this.svg.setAttribute("strokeWidth", "10");
        this.svg.setAttribute("fill", "none");
        container.appendChild(this.svg);

        this.initialLine();
    }

    initialLine() {
        const line = this.createLine(10, 10, 90, 10);
        line.setAttribute("data-target-x1", 10);
        line.setAttribute("data-target-y1", 10);
        line.setAttribute("data-target-x2", 90);
        line.setAttribute("data-target-y2", 10);
        this.svg.appendChild(line);
    }

    createLine(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke-linecap", "round");
        return line;
    }

    async main() {
        const layer = Math.floor(this.counter / (this.splitDuration + this.pauseDuration)) + 1;
        if (this.counter >= 0 && layer <= this.depth) {
            const ticks = this.counter % (this.splitDuration + this.pauseDuration);
            if (ticks === 0) {
                this.divideLines(layer);
            } else if (ticks <= this.splitDuration) {
                const progress = ticks / this.splitDuration;
                this.animateLines(progress, layer);
            }
        } else if (this.counter >= (this.depth - 1) * (this.splitDuration + this.pauseDuration) + 2.5 * this.pauseDuration) {
            const tick = Math.floor(this.counter - (this.depth - 1) * (this.splitDuration + this.pauseDuration) - 2.5 * this.pauseDuration);
            if (tick === 0)
                this.svg.childNodes.forEach((element) => {
                    element.setAttribute("data-target-y1", 10);
                    element.setAttribute("data-target-y2", 10);
                });
            else if (tick - 1 <= this.splitDuration) this.animateLines(tick / this.splitDuration);
            else if (tick === this.splitDuration + 2) {
                this.svg.innerHTML = "";
                this.initialLine();
            } else if (tick > this.splitDuration + this.pauseDuration / 2 && tick <= 2 * this.splitDuration + this.pauseDuration / 2) {
                this.svg.style.opacity = `${100 - ((tick - this.splitDuration - this.pauseDuration / 2) * 100) / this.splitDuration}%`;
            } else if (tick >= 2 * this.splitDuration + this.pauseDuration) this.reset();
        } else if (this.counter < 0) {
            this.svg.style.opacity = `${101 + this.counter}%`;
        }
        this.counter++;
    }

    divideLines() {
        const newLines = [];

        this.svg.childNodes.forEach((line) => {
            const x1 = parseFloat(line.getAttribute("x1"));
            const y1 = parseFloat(line.getAttribute("y1"));
            const x2 = parseFloat(line.getAttribute("x2"));
            const y2 = parseFloat(line.getAttribute("y2"));

            const dx = x2 - x1;
            const dy = y2 - y1;

            const xA = x1 + dx / 3;
            const yA = y1 + dy / 3;
            const xB = x1 + (2 * dx) / 3;
            const yB = y1 + (2 * dy) / 3;

            const xC = xA + (xB - xA) * Math.cos(-Math.PI / 3) - (yB - yA) * Math.sin(-Math.PI / 3);
            const yC = yA + (xB - xA) * Math.sin(-Math.PI / 3) + (yB - yA) * Math.cos(-Math.PI / 3);

            const xM = (x1 + x2) / 2;
            const yM = (y1 + y2) / 2;

            const line1 = this.createLine(x1, y1, xA, yA);
            line1.setAttribute("data-target-x1", x1);
            line1.setAttribute("data-target-y1", y1);
            line1.setAttribute("data-target-x2", xA);
            line1.setAttribute("data-target-y2", yA);
            newLines.push(line1);
            const line2 = this.createLine(xA, yA, xM, yM);
            line2.setAttribute("data-target-x1", xA);
            line2.setAttribute("data-target-y1", yA);
            line2.setAttribute("data-target-x2", xC);
            line2.setAttribute("data-target-y2", yC);
            newLines.push(line2);
            const line3 = this.createLine(xM, yM, xB, yB);
            line3.setAttribute("data-target-x1", xC);
            line3.setAttribute("data-target-y1", yC);
            line3.setAttribute("data-target-x2", xB);
            line3.setAttribute("data-target-y2", yB);
            newLines.push(line3);
            const line4 = this.createLine(xB, yB, x2, y2);
            line4.setAttribute("data-target-x1", xB);
            line4.setAttribute("data-target-y1", yB);
            line4.setAttribute("data-target-x2", x2);
            line4.setAttribute("data-target-y2", y2);
            newLines.push(line4);
        });

        this.svg.innerHTML = "";
        newLines.forEach((newLine) => this.svg.appendChild(newLine));
    }

    animateLines(progress) {
        this.svg.childNodes.forEach((element) => {
            const x1 = parseFloat(element.getAttribute("x1"));
            const y1 = parseFloat(element.getAttribute("y1"));
            const x2 = parseFloat(element.getAttribute("x2"));
            const y2 = parseFloat(element.getAttribute("y2"));
            const xt1 = parseFloat(element.getAttribute("data-target-x1"));
            const yt1 = parseFloat(element.getAttribute("data-target-y1"));
            const xt2 = parseFloat(element.getAttribute("data-target-x2"));
            const yt2 = parseFloat(element.getAttribute("data-target-y2"));

            if (progress <= 1) {
                element.setAttribute("x1", x1 + (xt1 - x1) * progress);
                element.setAttribute("y1", y1 + (yt1 - y1) * progress);
                element.setAttribute("x2", x2 + (xt2 - x2) * progress);
                element.setAttribute("y2", y2 + (yt2 - y2) * progress);
            }
        });
    }
}
