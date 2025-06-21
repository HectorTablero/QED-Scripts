class Sounds {
    async start(container, params, savedState) {
        this.notes = params;
        this.container = container;
        this.container.classList.add("flex", "flex-wrap", "items-center", "justify-center", "py-1");
        this.container.style.alignContent = "center";
        this.notes.forEach((note) => {
            this.container.appendChild(this.createButtonWithSVG(note[0], note[1]));
        });
    }

    createButtonWithSVG(label, frequency) {
        const button = document.createElement("button");
        button.className = `flex items-center font-semibold sm:text-xl mx-2 my-2 px-2 py-1 rounded-lg shadow-md bg-${ielightbgclass} border-2 border-${ielightmainclass} text-${ielightmainclass} dark:bg-${iedarkbgclass} dark:border-${iedarkmainclass} dark:text-${iedarkmainclass}`;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 180 500");
        svg.setAttribute("class", "h-6 sm:h-8 mr-2");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 175.944 420.581 C 175.944 464.27 136.493 499.686 87.827 499.686 C 39.161 499.686 -0.29 464.27 -0.29 420.581 C -0.29 376.89 39.161 341.469 87.827 341.469 C 111.871 341.469 133.669 350.122 149.565 364.145 L 149.565 0.472 L 175.944 0.472 C 175.944 0.472 175.944 0.544 175.944 0.681 C 175.944 4.064 175.944 420.581 175.944 420.581 Z");
        path.setAttribute("fill", "currentColor");

        svg.appendChild(path);
        button.appendChild(svg);
        button.appendChild(document.createTextNode(label));

        button.onclick = () => this.playFrequency(frequency);

        return button;
    }

    playFrequency(frequency) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        const attackTime = 0.25;
        const releaseTime = 0.25;
        const duration = 0.5;
        const maxVolume = 0.25;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(maxVolume, audioContext.currentTime + attackTime);
        gainNode.gain.setValueAtTime(maxVolume, audioContext.currentTime + attackTime + duration);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + attackTime + duration + releaseTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + attackTime + duration + releaseTime);
    }
}
