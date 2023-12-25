class Graph {
    constructor() {
        // map of vert objects with metadata.
        this.nodes = {};
        // List of 2-tuples with indices into nodes.
        this.edges = [];
    }

    addNode(id, node = {}) {
        this.nodes[id] = node;
    }

    addEdge(id1, id2) {
        // sort edge:
        if (id1 > id2) {
            let temp = id1;
            id1 = id2;
            id2 = temp;
        }
        this.edges.push([id1, id2]);
    }

    removeNode(id) {
        // Remove all edges that contain node:
        this.edges = this.edges.filter((edge) => {
            return edge[0] != id && edge[1] != id;
        });
    }

    hasNode(id) {
        return this.nodes.hasOwnProperty(id);
    }

    removeEdge(id1, id2) {
        // sort edge:
        if (id1 > id2) {
            let temp = id1;
            id1 = id2;
            id2 = temp;
        }
        this.edges = this.edges.filter((edge) => {
            return edge[0] != id1 || edge[1] != id2;
        });
    }

    replaceEdgeWithNode(id1, id2, newId, node = {}) {
        // sort edge:
        if (id1 > id2) {
            let temp = id1;
            id1 = id2;
            id2 = temp;
        }
        let meanX = (this.nodes[id1].x + this.nodes[id2].x) / 2;
        let meanY = (this.nodes[id1].y + this.nodes[id2].y) / 2;
        node.x = meanX;
        node.y = meanY;
        this.addNode(newId, node);
        this.addEdge(id1, newId);
        this.addEdge(id2, newId);
        this.removeEdge(id1, id2);
    }

    collapseNodes(id1, id2) {
        if (id1 > id2) {
            let temp = id1;
            id1 = id2;
            id2 = temp;
        }
        // Get all neighbors of id2:
        let neighbors = this.getNeighbors(id2);
        // Attach edges from id2 to id1:
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] == id1) {
                continue;
            }
            this.addEdge(id1, neighbors[i]);
        }
        // Remove id2:
        this.removeNode(id1);
    }

    getNeighbors(id) {
        return this.edges.filter((edge) => {
            return edge[0] == id || edge[1] == id;
        }).map((edge) => {
            return edge[0] == id ? edge[1] : edge[0];
        });
    }

    hasEdge(id1, id2) {
        // sort edge:
        if (id1 > id2) {
            let temp = id1;
            id1 = id2;
            id2 = temp;
        }
        return this.edges.some((edge) => {
            return edge[0] == id1 && edge[1] == id2;
        });
    }
}

class PointCloud {
    constructor() {
        this.g = new Graph();
    }

    insertLoop(numPoints, radius = 100, centerX = 0, centerY = 0) {
        //  Create a loop of points.
        // Current point count:
        let currentCount = Object.keys(this.g.nodes).length;
        for (let i = 0; i < numPoints; i++) {
            this.g.addNode(currentCount + i, {
                x: cos(i / numPoints * TWO_PI) * radius + centerX,
                y: sin(i / numPoints * TWO_PI) * radius + centerY
            });
            this.g.addEdge(currentCount + i, currentCount + (i + 1) % numPoints);
        }
    }

    frame() {
        let springK = 0.01;
        let maxForce = 0.3;
        let restoringForce = 130;
        let springDist = 0.1;
        let brownianForce = 0.01;
        // Each point repels each other point.
        // Each point has a spring (Hooke's law) to its neighbors.

        // Repulsion force between all points. Because it's a
        // symmetrical force, we only need to calculate it once for
        // each pair of points, so we can use a nested loop that skips
        // the bottom triangle.
        let collapsibleNodePairs = [];
        for (let i in this.g.nodes) {
            let node1 = this.g.nodes[i];
            for (let j in this.g.nodes) {
                if (j <= i) {
                    continue;
                }
                let node2 = this.g.nodes[j];
                let dx = node1.x - node2.x;
                let dy = node1.y - node2.y;
                let dist = sqrt(dx * dx + dy * dy);
                let force = restoringForce / (dist * dist);
                force = force > maxForce ? maxForce : force;

                let old1X = node1.x;
                let old1Y = node1.y;
                let old2X = node2.x;
                let old2Y = node2.y;
                node1.x += force * dx / dist;
                node1.x = isNaN(node1.x) ? old1X : node1.x;
                node1.y += force * dy / dist;
                node1.y = isNaN(node1.y) ? old1Y : node1.y;
                node2.x -= force * dx / dist;
                node2.x = isNaN(node2.x) ? old2X : node2.x;
                node2.y -= force * dy / dist;
                node2.y = isNaN(node2.y) ? old2Y : node2.y;

                // If the distance between the two nodes is too small,
                if (dist < 2) {
                    // Collapse:
                    // this.g.collapseNodes(i, j);
                    collapsibleNodePairs.push([i, j]);
                    // return;
                } else if (dist < 6) {
                    // add edge:
                    // Confirm edge doesn't already exist:
                    if (!this.g.hasEdge(i, j)) {
                        this.g.addEdge(i, j);
                    }
                }
            }
        }

        // Spring force.
        let addedNode = false;
        for (let i in this.g.nodes) {
            let node1 = this.g.nodes[i];
            let neighbors = this.g.getNeighbors(i);
            for (let j = 0; j < neighbors.length; j++) {
                let node2 = this.g.nodes[neighbors[j]];
                if (!node2) {
                    break;
                }
                let dx = node1.x - node2.x;
                let dy = node1.y - node2.y;
                let dist = sqrt(dx * dx + dy * dy);
                if (dist > 100) {
                    continue;
                }
                let force = springK * (dist - springDist);
                // Cap force at 0.1.
                // force = force > maxForce ? maxForce : force;
                let old1X = node1.x;
                let old1Y = node1.y;
                let old2X = node2.x;
                let old2Y = node2.y;

                node1.x -= force * dx / dist;
                node1.x = isNaN(node1.x) ? old1X : node1.x;
                node1.y -= force * dy / dist;
                node1.y = isNaN(node1.y) ? old1Y : node1.y;
                node2.x += force * dx / dist;
                node2.x = isNaN(node2.x) ? old2X : node2.x;
                node2.y += force * dy / dist;
                node2.y = isNaN(node2.y) ? old2Y : node2.y;

                // If the distance between the two nodes is too large,
                // replace the edge with a new node.
                if (dist > 15 && addedNode == false) {
                    let newNodeId = Object.keys(this.g.nodes).length;
                    // Confirm edge still exists:
                    if (this.g.hasEdge(i, neighbors[j])) {
                        this.g.replaceEdgeWithNode(i, neighbors[j], newNodeId);
                        addedNode = true;
                    }
                }
            }
        }

        // Brownian:
        for (let i in this.g.nodes) {
            let node = this.g.nodes[i];
            node.x += random(-brownianForce, brownianForce);
            node.y += random(-brownianForce, brownianForce);
        }

        // Block nodes from the sides of the screen:
        const border = 40;
        let removableNodes = [];
        for (let i in this.g.nodes) {
            let node = this.g.nodes[i];
            if (node.x < border) {
                node.x = border + 1;
                // remove node:
                removableNodes.push(i);
            } else if (node.x > width - border) {
                node.x = width - border - 1;
                // remove node:
                removableNodes.push(i);
            }
            if (node.y < border) {
                node.y = border + 1;
                // remove node:
                removableNodes.push(i);
            } else if (node.y > height - border) {
                node.y = height - border - 1;
                // remove node:
                removableNodes.push(i);
            }
        }


        // Collapse nodes:
        for (let i = 0; i < collapsibleNodePairs.length; i++) {
            fill(255, 0, 0);
            noStroke();
            ellipse(10, 10, 10, 10);
            this.g.collapseNodes(collapsibleNodePairs[i][0], collapsibleNodePairs[i][1]);
        }

        // Remove nodes if too many;
        const thresh = 700;
        if (Object.keys(this.g.nodes).length > thresh) {
            fill(255, 0, 0);
            noStroke();
            ellipse(10, 20, 10, 10);
            pc.g.removeNode(Object.keys(pc.g.nodes).slice(-1))
        }
    }

    draw() {
        const sinFreqColoring = 0.001;
        // Loop over object key/vals in g.nodes.
        for (let id in this.g.nodes) {
            let node = this.g.nodes[id];
            // noStroke();
            fill(200 + 55 * sin(sinFreqColoring * id), 200 + 55 * cos(sinFreqColoring * id), 200 + 55 * sin(sinFreqColoring * (id + 100)));
            stroke(200 + 55 * sin(sinFreqColoring * id), 200 + 55 * cos(sinFreqColoring * id), 200 + 55 * sin(sinFreqColoring * (id + 100)));
            // ellipse(node.x, node.y, 5, 5);
            // Get out-edge neighbors:
            // List of IDs.
            let inNeighbors = this.g.getNeighbors(id);
            strokeWeight(5);
            for (let i = 0; i < inNeighbors.length; i++) {
                let neighbor = this.g.nodes[inNeighbors[i]];
                if (!neighbor) {
                    break;
                }
                line(node.x, node.y, neighbor.x, neighbor.y);
            }
        }
    }
}

let pc;
window.pc = pc;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    stroke(255);
    strokeWeight(1);
    noFill();
    frameRate(30);
    pc = new PointCloud();
    pc.insertLoop(49, 100, width / 2, height / 2);
}

function draw() {
    background(0, 20);
    pc.frame();
    pc.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    pc.insertLoop(10, 40, mouseX, mouseY);
}