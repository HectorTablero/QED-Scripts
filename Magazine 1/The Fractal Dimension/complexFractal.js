class ComplexFractal {
    async start(container, params, savedState) {
        this.type = params[0] || "mandelbrot";
        this.animationDuration = params[1] || 100;
        this.maxIterations = params[2] || 100;
        this.maxColors = params[3] || 16;
        this.z = params[4] || 2;
        this.re = params[5] || -0.15;
        this.im = params[6] || 0.66;
        this.counter = 0;
        this.minColorsAdded = 8;
        this.colorsAdded = this.minColorsAdded;
        this.cache = [];
        if (document.documentElement.classList.contains("dark"))
            this.colors = this.getColorGradient(
                iedarkbgrgb
                    .substring(4, iedarkbgrgb.length - 1)
                    .split(", ")
                    .map((n) => parseInt(n))
                    .concat(0),
                iedarkmainrgb
                    .substring(4, iedarkmainrgb.length - 1)
                    .split(", ")
                    .map((n) => parseInt(n))
                    .concat(1)
            );
        else
            this.colors = this.getColorGradient(
                ielightbgrgb
                    .substring(4, ielightbgrgb.length - 1)
                    .split(", ")
                    .map((n) => parseInt(n))
                    .concat(0),
                ielightmainrgb
                    .substring(4, ielightmainrgb.length - 1)
                    .split(", ")
                    .map((n) => parseInt(n) / 2)
                    .concat(1)
            );

        const style = document.createElement("style");
        style.innerText = `
        .complexfractalinteractiveelement input[type=number]::-webkit-inner-spin-button,
        .complexfractalinteractiveelement input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
        }

        .complexfractalinteractiveelement input[type=number] {
            opacity: 0.7;
            transition: opacity .2s;
        }

        .complexfractalinteractiveelement input[type=number]:hover {
            opacity: 1;
        }
        
        .complexfractalinteractiveelement input[type=range] {
            -webkit-appearance: none;
            height: 8px;
            background: ${ielightbgrgb}; /* Track color */
            border-radius: 5px;
            opacity: 0.7;
            transition: opacity .2s;
            width: 50%;
        }

        .complexfractalinteractiveelement input[type=range]:hover {
            opacity: 1;
        }

        .complexfractalinteractiveelement input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: ${ielightmainrgb}; /* Thumb color */
            border-radius: 50%;
            border-width: 1px;
            border-color: #6b7280;
            cursor: pointer;
        }

        .complexfractalinteractiveelement input[type=range]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: ${ielightmainrgb}; /* Thumb color */
            border-radius: 50%;
            border-width: 1px;
            border-color: #6b7280;
            cursor: pointer;
        }

        .complexfractalinteractiveelement input[type=range]::-ms-thumb {
            width: 16px;
            height: 16px;
            background: ${ielightmainrgb}; /* Thumb color */
            border-radius: 50%;
            border-width: 1px;
            border-color: #6b7280;
            cursor: pointer;
        }

        .dark .complexfractalinteractiveelement input[type=range] {
            background: ${iedarkbgrgb}; /* Dark track color */
        }

        .dark .complexfractalinteractiveelement input[type=range]::-webkit-slider-thumb {
            background: ${iedarkmainrgb}; /* Thumb color for dark theme */
        }

        .dark .complexfractalinteractiveelement input[type=range]::-moz-range-thumb {
            background: ${iedarkmainrgb}; /* Thumb color for dark theme */
        }

        .dark .complexfractalinteractiveelement input[type=range]::-ms-thumb {
            background: ${iedarkmainrgb}; /* Thumb color for dark theme */
        }`;
        container.appendChild(style);
        container.classList.add("w-full", "h-full", "relative");

        this.canvas = document.createElement("canvas");
        this.canvas.className = "w-full h-full rounded-md";
        this.ctx = this.canvas.getContext("2d");
        container.appendChild(this.canvas);

        if (this.type === "julia") {
            this.createSliders(container);
        }

        window.addEventListener("resize", () => this.resizeCanvas());
        window.addEventListener("on-theme-change", () => this.resizeCanvas());

        if (this.type === "mandelbrot") {
            this.fn = this.mandelbrot;
        } else if (this.type === "julia") {
            this.fn = this.julia;
        }

        this.resizeCanvas();
    }

    createSliders(container) {
        const sliderContainer = document.createElement("div");
        sliderContainer.className = "complexfractalinteractiveelement absolute flex space-x-4 w-full justify-evenly top-0 left-0 p-2 rounded-md";
        sliderContainer.style.zIndex = 10;
        container.appendChild(sliderContainer);

        const createSlider = (labelText, min, max, step, value, onInput) => {
            const div = document.createElement("div");
            div.className = "flex space-x-2 items-center";
            div.style.width = "33%";
            sliderContainer.appendChild(div);

            const label = document.createElement("label");
            label.innerText = labelText;
            div.appendChild(label);

            const slider = document.createElement("input");
            slider.className = `rounded-md border border-${ielightmainclass} dark:border-${iedarkmainclass} bg-${ielightbgclass} dark:bg-${iedarkbgclass}`;
            slider.type = "range";
            slider.min = min;
            slider.max = max;
            slider.step = step;
            slider.value = value;
            slider.addEventListener("input", (e) => {
                onInput(e.target.value);
                input.value = e.target.value;
                this.resizeCanvas();
            });
            div.appendChild(slider);

            const input = document.createElement("input");
            input.className = `rounded-md border border-${ielightmainclass} dark:border-${iedarkmainclass} bg-${ielightbgclass} dark:bg-${iedarkbgclass} text-center`;
            input.type = "number";
            input.min = min;
            input.max = max;
            input.step = step;
            input.value = value;
            input.style.width = "50px";
            input.style.outline = "none";
            input.addEventListener("input", (e) => {
                onInput(e.target.value);
                slider.value = e.target.value;
                this.resizeCanvas();
            });
            div.appendChild(input);

            return { slider, input };
        };

        createSlider("Z:", 2, 10, 1, this.z, (value) => (this.z = parseInt(value)));
        createSlider("Re:", -2, 2, 0.01, this.re, (value) => (this.re = parseFloat(value)));
        createSlider("Im:", -2, 2, 0.01, this.im, (value) => (this.im = parseFloat(value)));
    }

    async main() {
        if (this.counter < this.animationDuration) {
            const ticksPerColor = Math.floor(this.animationDuration / (this.maxColors - this.minColorsAdded));
            if (this.colorsAdded < this.maxColors && this.counter % ticksPerColor === 0) {
                this.colorsAdded++;
                if (document.documentElement.classList.contains("dark"))
                    this.colors = this.getColorGradient(
                        iedarkbgrgb
                            .substring(4, iedarkbgrgb.length - 1)
                            .split(", ")
                            .map((n) => parseInt(n))
                            .concat(0),
                        iedarkmainrgb
                            .substring(4, iedarkmainrgb.length - 1)
                            .split(", ")
                            .map((n) => parseInt(n))
                            .concat(1)
                    );
                else
                    this.colors = this.getColorGradient(
                        ielightbgrgb
                            .substring(4, ielightbgrgb.length - 1)
                            .split(", ")
                            .map((n) => parseInt(n))
                            .concat(0),
                        ielightmainrgb
                            .substring(4, ielightmainrgb.length - 1)
                            .split(", ")
                            .map((n) => parseInt(n) / 2)
                            .concat(1)
                    );
                this.drawFractal(true);
            }
        } else if (this.counter === this.animationDuration) {
            this.colorsAdded = this.maxColors;
            this.cache = [];
        }
        this.counter++;
    }

    mandelbrot(c) {
        let z = { x: 0, y: 0 },
            n = 0,
            p,
            d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + c.x,
                y: p.y + c.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < this.maxIterations);
        return [n, d <= 2];
    }

    julia(c) {
        let z = { x: c.x, y: c.y },
            n = 0,
            p,
            d;
        do {
            p = this.complexPow(z, this.z);
            z = {
                x: p.x + this.re,
                y: p.y + this.im
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < this.maxIterations);
        return [n, d <= 2];
    }

    complexPow(z, power) {
        let r = Math.sqrt(z.x * z.x + z.y * z.y);
        let theta = Math.atan2(z.y, z.x);
        r = Math.pow(r, power);
        theta *= power;
        return {
            x: r * Math.cos(theta),
            y: r * Math.sin(theta)
        };
    }

    drawFractal(cache = false) {
        const REAL_SET = this.type === "mandelbrot" ? { start: -2.2, end: 1.2 } : { start: -2.2, end: 2.2 };
        const IMAGINARY_SET = { start: -2.2, end: 2.2 };

        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let m, isSet;
                if (this.cache[i] && this.cache[i][j]) {
                    [m, isSet] = this.cache[i][j];
                } else {
                    const complex = {
                        x: REAL_SET.start + (i / width) * (REAL_SET.end - REAL_SET.start),
                        y: IMAGINARY_SET.start + (j / height) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
                    };

                    [m, isSet] = this.fn(complex);
                }
                if (cache) {
                    if (!this.cache[i]) this.cache[i] = Array(height);
                    this.cache[i][j] = [m, isSet];
                }

                const color = this.colors[isSet ? 0 : (m % (this.colors.length - 1)) + 1] || [0, 0, 0];

                const pixelIndex = (i + j * width) * 4;
                data[pixelIndex] = color[0];
                data[pixelIndex + 1] = color[1];
                data[pixelIndex + 2] = color[2];
                data[pixelIndex + 3] = color[3];
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    resizeCanvas() {
        setTimeout(() => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            if (document.documentElement.classList.contains("dark"))
                this.colors = this.getColorGradient(
                    iedarkbgrgb
                        .substring(4, iedarkbgrgb.length - 1)
                        .split(", ")
                        .map((n) => parseInt(n))
                        .concat(0),
                    iedarkmainrgb
                        .substring(4, iedarkmainrgb.length - 1)
                        .split(", ")
                        .map((n) => parseInt(n))
                        .concat(1)
                );
            else
                this.colors = this.getColorGradient(
                    ielightbgrgb
                        .substring(4, ielightbgrgb.length - 1)
                        .split(", ")
                        .map((n) => parseInt(n))
                        .concat(0),
                    ielightmainrgb
                        .substring(4, ielightmainrgb.length - 1)
                        .split(", ")
                        .map((n) => parseInt(n) / 2)
                        .concat(1)
                );
            this.cache = [];
            this.drawFractal();
        }, 5);
    }

    getColorGradient(startColor, endColor) {
        return Array.from({ length: Math.max(this.colorsAdded, 1) }, (_, i) => [Math.round(startColor[0] + (endColor[0] - startColor[0]) * (i / (this.colorsAdded - 1))), Math.round(startColor[1] + (endColor[1] - startColor[1]) * (i / (this.colorsAdded - 1))), Math.round(startColor[2] + (endColor[2] - startColor[2]) * (i / (this.colorsAdded - 1))), Math.round((startColor[3] + (endColor[3] - startColor[3]) * (i / (this.colorsAdded - 1))) * 255)]);
    }
}
