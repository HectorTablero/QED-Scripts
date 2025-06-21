class SierpinskiFractal {
    async start(container, params, savedState) {
        this.depth = params[0] || 5;
        this.splitDuration = params[1] || 25;
        this.pauseDuration = params[2] || 75;
        this.counter = -this.pauseDuration;

        container.classList.add("p-8");

        this.canvas = document.createElement("canvas");
        this.canvas.className = "sierpinskiInteractiveElement w-full h-full";
        this.ctx = this.canvas.getContext("2d");
        container.appendChild(this.canvas);

        window.addEventListener("resize", () => this.resizeCanvas());
        window.addEventListener("on-theme-change", () => this.resizeCanvas());

        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx.fillStyle = document.documentElement.classList.contains("dark") ? iedarkbgrgb : ielightbgrgb;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.counter >= 0) this.drawFractal(Math.min(Math.floor(this.counter / (this.splitDuration + this.pauseDuration)) + 1, this.depth));
    }

    drawTriangle(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - (size * Math.sqrt(3)) / 2);
        this.ctx.lineTo(x + size / 2, y);
        this.ctx.lineTo(x + size, y - (size * Math.sqrt(3)) / 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawFractal(layer) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = height - (height - (size * Math.sqrt(3)) / 2) / 2;

        this.ctx.fillStyle = document.documentElement.classList.contains("dark") ? iedarkbgrgb : ielightbgrgb;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = document.documentElement.classList.contains("dark") ? iedarkmainrgb : ielightmainrgb;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + size / 2, y - (size * Math.sqrt(3)) / 2);
        this.ctx.lineTo(x + size, y);
        this.ctx.closePath();
        this.ctx.fill();

        this.drawSierpinski(x, y, size, 1, layer);
    }

    drawSierpinski(x, y, size, layer, max) {
        const alpha = layer === max ? Math.min((this.counter % (this.splitDuration + this.pauseDuration)) / this.splitDuration, 1) : 1;
        this.drawTriangle(x + size / 4, y, size / 2, document.documentElement.classList.contains("dark") ? "rgba" + iedarkbgrgb.substring(3, iedarkbgrgb.length - 1) + ", " + alpha + ")" : "rgba" + ielightbgrgb.substring(3, ielightbgrgb.length - 1) + ", " + alpha + ")");
        if (layer < max) {
            this.drawSierpinski(x, y, size / 2, layer + 1, max);
            this.drawSierpinski(x + size / 2, y, size / 2, layer + 1, max);
            this.drawSierpinski(x + size / 4, y - (size * Math.sqrt(3)) / 4, size / 2, layer + 1, max);
        }
    }

    async main() {
        const layer = Math.floor(this.counter / (this.splitDuration + this.pauseDuration)) + 1;
        if (this.counter >= 0) {
            if (layer <= this.depth) {
                this.drawFractal(layer);
            } else if (this.counter >= (this.depth - 1) * (this.splitDuration + this.pauseDuration) + 2.5 * this.pauseDuration) {
                const tick = this.counter - (this.depth - 1) * (this.splitDuration + this.pauseDuration) - 2.5 * this.pauseDuration;
                if (tick < this.pauseDuration * 2) this.canvas.style.opacity = `${100 - Math.min(tick / this.pauseDuration, 1) * 100}%`;
                else this.reset();
            }
        } else {
            const width = this.canvas.width;
            const height = this.canvas.height;
            const size = Math.min(width, height);
            const x = (width - size) / 2;
            const y = height - (height - (size * Math.sqrt(3)) / 2) / 2;
            const alpha = 1 + this.counter / this.pauseDuration;
            this.ctx.fillStyle = document.documentElement.classList.contains("dark") ? "rgba" + iedarkmainrgb.substring(3, iedarkmainrgb.length - 1) + ", " + alpha + ")" : "rgba" + ielightmainrgb.substring(3, ielightmainrgb.length - 1) + ", " + alpha + ")";
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + size / 2, y - (size * Math.sqrt(3)) / 2);
            this.ctx.lineTo(x + size, y);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.counter++;
    }
}
