class CantorFractal {
    async start(container, params, savedState) {
        this.depth = params[0] || 5;
        this.splitDuration = params[1] || 25;
        this.pauseDuration = params[2] || 75;
        this.counter = -this.pauseDuration;
        const tempContainer = document.createElement("div");
        tempContainer.className = "flex w-full h-full items-center justify-center";
        container.appendChild(tempContainer);
        this.container = document.createElement("div");
        this.container.className = "flex flex-col items-center justify-center w-full h-full transition-all space-y-2 p-8";
        tempContainer.appendChild(this.container);
        this.layers = [];
        for (let i = 0; i < this.depth; i++) {
            const layer = document.createElement("div");
            layer.className = "flex w-full h-full opacity-0 transition-opacity duration-500";
            this.container.appendChild(layer);
            this.layers.push(layer);
            const block = document.createElement("div");
            block.className = `bg-${ielightmainclass} dark:bg-${iedarkmainclass}`;
            block.style.flex = 2;
            block.style.borderRadius = "0.375rem";
            block.setAttribute("data-block", "");
            layer.appendChild(block);
        }
        this.layers[0].classList.remove("opacity-0");

        window.addEventListener("resize", () => {
            this.container.style.height = `${this.container.offsetWidth / 2.8}px`;
        });

        this.container.style.height = `${this.container.offsetWidth / 2.8}px`;
    }

    async main() {
        const layer = Math.floor(this.counter / (this.splitDuration + this.pauseDuration)) + 1;
        if (this.counter >= 0 && layer < this.depth) {
            const ticks = this.counter % (this.splitDuration + this.pauseDuration);
            if (ticks === 0) {
                this.layers[layer].classList.remove("opacity-0");
                for (let i = layer; i < this.depth; i++) {
                    let j = 0;
                    while (j < this.layers[i].children.length) {
                        const element = this.layers[i].children[j];
                        if (element.dataset.empty === "") {
                            element.style.flex = parseInt(element.style.flex) * 3;
                        } else {
                            element.style.borderTopLeftRadius = "0";
                            element.style.borderBottomLeftRadius = "0";
                            element.style.borderTopRightRadius = "0.375rem";
                            element.style.borderBottomRightRadius = "0.375rem";
                            const div1 = document.createElement("div");
                            div1.className = `bg-${ielightmainclass} dark:bg-${iedarkmainclass}`;
                            div1.style.borderTopLeftRadius = "0.375rem";
                            div1.style.borderBottomLeftRadius = "0.375rem";
                            div1.style.flex = 2;
                            div1.setAttribute("data-block", "");
                            this.layers[i].insertBefore(div1, element);
                            const div2 = document.createElement("div");
                            div2.className = `bg-${ielightmainclass} dark:bg-${iedarkmainclass}`;
                            div2.style.borderTopRightRadius = "0.375rem";
                            div2.style.borderBottomRightRadius = "0.375rem";
                            div2.style.flex = 1;
                            div2.setAttribute("data-shrink", "");
                            div2.setAttribute("data-empty", "");
                            this.layers[i].insertBefore(div2, element);
                            const div3 = document.createElement("div");
                            div3.style.flex = 0;
                            div3.setAttribute("data-grow", "");
                            div3.setAttribute("data-empty", "");
                            this.layers[i].insertBefore(div3, element);
                            const div4 = document.createElement("div");
                            div4.style.flex = 0;
                            div4.setAttribute("data-grow", "");
                            div4.setAttribute("data-empty", "");
                            this.layers[i].insertBefore(div4, element);
                            const div5 = document.createElement("div");
                            div5.className = `bg-${ielightmainclass} dark:bg-${iedarkmainclass}`;
                            div5.style.borderTopLeftRadius = "0.375rem";
                            div5.style.borderBottomLeftRadius = "0.375rem";
                            div5.style.flex = 1;
                            div5.setAttribute("data-shrink", "");
                            div5.setAttribute("data-empty", "");
                            this.layers[i].insertBefore(div5, element);
                            j += 5;
                        }
                        j++;
                    }
                }
            } else if (ticks <= this.splitDuration) {
                const progress = ticks / this.splitDuration;
                this.container.querySelectorAll("[data-grow]").forEach((element) => {
                    element.style.flex = progress;
                    if (ticks === this.splitDuration) element.removeAttribute("data-grow");
                });
                this.container.querySelectorAll("[data-shrink]").forEach((element) => {
                    element.style.flex = 1 - progress;
                    if (ticks === this.splitDuration) element.remove();
                });
                if (ticks === this.splitDuration)
                    this.container.querySelectorAll("[data-block]").forEach((element) => {
                        element.style.borderTopLeftRadius = "0.375rem";
                        element.style.borderBottomLeftRadius = "0.375rem";
                        element.style.borderTopRightRadius = "0.375rem";
                        element.style.borderBottomRightRadius = "0.375rem";
                    });
            }
        } else if (this.counter >= (this.depth - 1) * (this.splitDuration + this.pauseDuration) + 2.5 * this.pauseDuration) {
            const tick = Math.floor((this.counter - (this.depth - 1) * (this.splitDuration + this.pauseDuration) - 2.5 * this.pauseDuration) / this.splitDuration);
            if (tick < this.depth) this.layers[this.depth - 1 - tick].classList.add("opacity-0");
            else if (tick === this.depth + 2) this.reset();
        }
        this.counter++;
    }
}
