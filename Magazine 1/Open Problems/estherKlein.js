class EstherKleinSimulation {
    async start(container, params, savedState) {
        this.container = container;
        this.gridSize = params[0] || 30;
        this.figurePoints = params[1] || 4;
        this.totalPoints = params[2] || 5;
        this.maxDistributionAttempts = params[3] || 10;
        this.initialPoints = params[4] || savedState || null;

        const style = document.createElement("style");
        style.innerText = `
            .eksimulationinteractiveelement {
                color: rgba(${ielightmainrgb.substring(4, ielightmainrgb.length - 1)}, 0.5);
            }
            .dark .eksimulationinteractiveelement {
                color: rgba(${iedarkmainrgb.substring(4, iedarkmainrgb.length - 1)}, 0.5);
            }
            .eksimulationdraggablepoint {
                position: absolute;
                width: 20px;
                height: 20px;
                background-color: ${ielightcontrastrgb};
                border-radius: 50%;
                cursor: grab;
                user-select: none;
                transform: translate(-50%, -50%);
            }
            .dark .eksimulationdraggablepoint {
                background-color: ${iedarkcontrastrgb};
            }
            .grid-line {
                stroke: currentColor;
                stroke-width: 0.5;
            }
            .connection-line {
                stroke: ${ielightmainrgb}; /* rgb(${ielightmainrgb
            .substring(4, ielightmainrgb.length - 1)
            .split(", ")
            .map((n) => parseInt(n) / 2)
            .join(", ")}) */
                stroke-width: 5;
            }
            .dark .connection-line {
                stroke: ${iedarkmainrgb};
            }
            .error.connection-line {
                stroke: rgb(255, 0, 0) !important;
            }
        `;
        document.head.appendChild(style);

        this.container.classList.add("relative", "w-full", "h-full");

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.classList.add("absolute", "w-full", "h-full", "eksimulationinteractiveelement");
        this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        container.appendChild(this.svg);

        this.points = [];
        this.createGrid();
        this.addEventListeners();

        if (this.initialPoints) {
            const { startX, startY } = this.getCenter(this.initialPoints);
            this.initialPoints.forEach((p, i) => {
                const point = document.createElement("div");
                point.classList.add("eksimulationdraggablepoint");
                point.style.left = `${(startX + p[0]) * this.gridSize}px`;
                point.style.top = `${(startY + p[1]) * this.gridSize}px`;
                point.dataset.index = i;
                point.addEventListener("mousedown", this.startDrag.bind(this, point));
                this.points.push(point);
                this.container.appendChild(point);
            });
        } else {
            this.createPoints();
            this.checkConfiguration(this.maxDistributionAttempts);
        }

        this.resize();
    }

    getCenter(points) {
        let minX = 100000000;
        let minY = 100000000;
        let maxX = -100000000;
        let maxY = -100000000;
        points.forEach((point) => {
            if (point[0] < minX) minX = point[0];
            if (point[1] < minY) minY = point[1];
            if (point[0] > maxX) maxX = point[0];
            if (point[1] > maxY) maxY = point[1];
        });
        const containerRect = this.container.getBoundingClientRect();
        const maxW = Math.floor(containerRect.width / this.gridSize);
        const maxH = Math.floor(containerRect.height / this.gridSize);
        const startX = Math.round((maxW - (1 + maxX - minX)) / 2) - minX;
        const startY = Math.round((maxH - (1 + maxY - minY)) / 2) - minY;
        return { startX, startY };
    }

    resize() {
        this.svg.innerHTML = "";
        this.createGrid();

        const occupiedPositions = [];

        const { startX, startY } = this.getCenter(this.points.map((point) => [Math.round(parseFloat(point.style.left) / this.gridSize), Math.round(parseFloat(point.style.top) / this.gridSize)]));
        this.points.forEach((point) => {
            const x = parseFloat(point.style.left);
            const y = parseFloat(point.style.top);
            const newX = startX * this.gridSize + x;
            const newY = startY * this.gridSize + y;
            point.style.left = `${newX}px`;
            point.style.top = `${newY}px`;
            occupiedPositions.push(`${newX},${newY}`);
        });

        this.points.forEach((point) => {
            const containerRect = this.container.getBoundingClientRect();
            const x = parseFloat(point.style.left);
            const y = parseFloat(point.style.top);

            occupiedPositions.splice(occupiedPositions.indexOf(`${Math.round(x)},${Math.round(y)}`), 1);

            let snappedX = Math.max(Math.min(Math.round(x / this.gridSize) * this.gridSize, Math.floor(containerRect.width / this.gridSize) * this.gridSize), 0);
            let snappedY = Math.max(Math.min(Math.round(y / this.gridSize) * this.gridSize, Math.floor(containerRect.height / this.gridSize) * this.gridSize), 0);

            let targetPosition = `${snappedX},${snappedY}`;

            if (occupiedPositions.includes(targetPosition)) {
                let closestFreeSpot = this.findClosestFreeSpot(snappedX, snappedY, occupiedPositions, containerRect);
                snappedX = closestFreeSpot.x;
                snappedY = closestFreeSpot.y;
                targetPosition = `${snappedX},${snappedY}`;
            }

            occupiedPositions.push(targetPosition);
            point.style.left = `${snappedX}px`;
            point.style.top = `${snappedY}px`;
        });
        this.checkConfiguration();
    }

    findClosestFreeSpot(snappedX, snappedY, occupiedPositions, containerRect) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: -1, dy: -1 }
        ];

        const isWithinBounds = (x, y) => x >= 0 && x <= Math.floor(containerRect.width / this.gridSize) * this.gridSize && y >= 0 && y <= Math.floor(containerRect.height / this.gridSize) * this.gridSize;

        const queue = [{ x: snappedX, y: snappedY, distance: 0 }];
        const visited = new Set([`${snappedX},${snappedY}`]);

        while (queue.length > 0) {
            const { x, y, distance } = queue.shift();

            for (let d of directions) {
                const newX = x + d.dx * this.gridSize;
                const newY = y + d.dy * this.gridSize;
                const newPosition = `${newX},${newY}`;

                if (isWithinBounds(newX, newY) && !visited.has(newPosition)) {
                    visited.add(newPosition);

                    if (!occupiedPositions.includes(newPosition)) {
                        return { x: newX, y: newY };
                    }

                    queue.push({ x: newX, y: newY, distance: distance + 1 });
                }
            }
        }

        return { x: snappedX, y: snappedY };
    }

    createGrid() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        for (let x = 0; x <= width; x += this.gridSize) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.classList.add("grid-line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", 0);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height);
            this.svg.appendChild(line);
        }

        for (let y = 0; y <= height; y += this.gridSize) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.classList.add("grid-line");
            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width);
            line.setAttribute("y2", y);
            this.svg.appendChild(line);
        }
    }

    createPoints() {
        const availablePositions = [];
        const containerRect = this.container.getBoundingClientRect();

        for (let x = 2 * this.gridSize; x < containerRect.width - 2 * this.gridSize; x += this.gridSize) {
            for (let y = 2 * this.gridSize; y < containerRect.height - 2 * this.gridSize; y += this.gridSize) {
                availablePositions.push({ x, y });
            }
        }

        for (let i = 1; i <= this.totalPoints; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const position = availablePositions.splice(randomIndex, 1)[0];

            const point = document.createElement("div");
            point.classList.add("eksimulationdraggablepoint");
            point.style.left = `${position.x}px`;
            point.style.top = `${position.y}px`;
            point.dataset.index = i;
            point.addEventListener("mousedown", this.startDrag.bind(this, point));
            this.points.push(point);
            this.container.appendChild(point);
        }
    }

    addEventListeners() {
        document.addEventListener("mousemove", this.drag.bind(this));
        document.addEventListener("mouseup", this.endDrag.bind(this));
        window.addEventListener("resize", () => this.resize());
    }

    startDrag(point, event) {
        this.draggingPoint = point;
    }

    drag(event) {
        if (!this.draggingPoint) return;

        const containerRect = this.container.getBoundingClientRect();
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        const snappedX = Math.max(Math.min(Math.round(x / this.gridSize) * this.gridSize, Math.floor(containerRect.width / this.gridSize) * this.gridSize), 0);
        const snappedY = Math.max(Math.min(Math.round(y / this.gridSize) * this.gridSize, Math.floor(containerRect.height / this.gridSize) * this.gridSize), 0);

        const targetPosition = `${snappedX},${snappedY}`;
        const isOccupied = this.points.some((point) => {
            const pointPosition = `${parseInt(point.style.left)},${parseInt(point.style.top)}`;
            return pointPosition === targetPosition;
        });

        if (!isOccupied) {
            this.draggingPoint.style.left = `${snappedX}px`;
            this.draggingPoint.style.top = `${snappedY}px`;

            this.checkConfiguration();
        }
    }

    endDrag() {
        if (this.draggingPoint) {
            this.draggingPoint = null;
            if (this.saveData) {
                this.saveData(
                    this.points.map((point) => {
                        return [parseFloat(point.style.left) / this.gridSize, parseFloat(point.style.top) / this.gridSize];
                    })
                );
            }
        }
    }

    checkConfiguration(ensureValid = 0) {
        const positions = this.points.map((point) => {
            return {
                x: parseInt(point.style.left) / this.gridSize,
                y: parseInt(point.style.top) / this.gridSize
            };
        });

        this.svg.querySelectorAll("line.connection-line").forEach((line) => line.remove());

        let collinearPoints = this.isCollinear(positions);
        if (collinearPoints.length > 0) {
            if (ensureValid > 0) {
                this.points.forEach((point) => point.remove());
                this.points = [];
                this.createPoints();
                this.checkConfiguration(ensureValid - 1);
            } else {
                collinearPoints.forEach((group) => {
                    for (let i = 0; i < group.length - 1; i++) {
                        this.drawLine(
                            { x: group[i].x * this.gridSize, y: group[i].y * this.gridSize },
                            {
                                x: group[i + 1].x * this.gridSize,
                                y: group[i + 1].y * this.gridSize
                            },
                            true
                        );
                    }
                });
            }
        } else {
            const convexHull = this.getConvexHull(positions);
            for (let i = 0; i < convexHull.length; i++) {
                const start = convexHull[i];
                const end = convexHull[(i + 1) % convexHull.length];
                this.drawLine({ x: start.x * this.gridSize, y: start.y * this.gridSize }, { x: end.x * this.gridSize, y: end.y * this.gridSize });
            }
        }
    }

    isCollinear(positions) {
        let collinearGroups = [];
        for (let i = 0; i < positions.length - 2; i++) {
            for (let j = i + 1; j < positions.length - 1; j++) {
                for (let k = j + 1; k < positions.length; k++) {
                    const a = positions[i];
                    const b = positions[j];
                    const c = positions[k];
                    if ((b.y - a.y) * (c.x - b.x) === (c.y - b.y) * (b.x - a.x)) {
                        collinearGroups.push([a, b, c]);
                    }
                }
            }
        }
        return collinearGroups;
    }

    drawLine(start, end, error = false) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.classList.add("connection-line");
        if (error) line.classList.add("error");
        line.setAttribute("x1", start.x);
        line.setAttribute("y1", start.y);
        line.setAttribute("x2", end.x);
        line.setAttribute("y2", end.y);
        this.svg.appendChild(line);
    }

    getConvexHull(points) {
        const combinations = this.getPermutations(points, this.figurePoints);
        let maxArea = 0;
        let bestCombination = [];

        for (const combination of combinations) {
            if (this.isConvex(combination)) {
                if (this.totalPoints >= 10) return combination;
                const area = this.calculateArea(combination);
                if (area > maxArea) {
                    maxArea = area;
                    bestCombination = combination;
                }
            }
        }
        return bestCombination;
    }

    getPermutations(points, figurePoints) {
        const result = [];
        const permute = (arr, m = [], seen = new Set()) => {
            if (m.length === figurePoints) {
                const key = m.map((p) => `${p.x},${p.y}`).join("|");
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push([...m]);
                }
                return;
            }
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr, m.concat(next), seen);
            }
        };
        permute(points);
        return result;
    }

    calculateArea(points) {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += Math.abs(points[i].x * points[j].y - points[j].x * points[i].y);
        }
        return area / 2;
    }

    isConvex(points) {
        if (points.length < 3) return false;

        const TWO_PI = 2 * Math.PI;
        let old_x = points[points.length - 2].x;
        let old_y = points[points.length - 2].y;
        let new_x = points[points.length - 1].x;
        let new_y = points[points.length - 1].y;
        let new_direction = Math.atan2(new_y - old_y, new_x - old_x);
        let angle_sum = 0.0;
        let orientation = 0;

        for (let i = 0; i < points.length; i++) {
            old_x = new_x;
            old_y = new_y;
            const p = points[i];
            new_x = p.x;
            new_y = p.y;
            const old_direction = new_direction;
            new_direction = Math.atan2(new_y - old_y, new_x - old_x);
            if (old_x === new_x && old_y === new_y) return false;

            let angle = new_direction - old_direction;
            if (angle <= -Math.PI) angle += TWO_PI;
            else if (angle > Math.PI) angle -= TWO_PI;

            if (i === 0) {
                if (angle === 0.0) return false;
                orientation = angle > 0.0 ? 1.0 : -1.0;
            } else {
                if (orientation * angle <= 0.0) return false;
            }

            angle_sum += angle;
        }

        return Math.abs(Math.round(angle_sum / TWO_PI)) === 1;
    }
}
