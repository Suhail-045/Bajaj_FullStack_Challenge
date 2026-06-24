const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

function hasCycle(node, graph, visited, recStack) {
    visited.add(node);
    recStack.add(node);

    for (const child of (graph[node] || [])) {
        if (!visited.has(child)) {
            if (hasCycle(child, graph, visited, recStack)) {
                return true;
            }
        } else if (recStack.has(child)) {
            return true;
        }
    }

    recStack.delete(node);
    return false;
}

function buildTree(node, graph) {
    const result = {};

    for (const child of (graph[node] || [])) {
        result[child] = buildTree(child, graph);
    }

    return result;
}

function calculateDepth(node, graph) {
    const children = graph[node] || [];

    if (children.length === 0) {
        return 1;
    }

    let maxDepth = 0;

    for (const child of children) {
        maxDepth = Math.max(maxDepth, calculateDepth(child, graph));
    }

    return maxDepth + 1;
}

app.post("/bfhl", (req, res) => {
    const data = req.body.data || [];

    const invalid_entries = [];
    const duplicate_edges = [];

    const graph = {};
    const childParent = {};

    const seenEdges = new Set();
    const duplicateRecorded = new Set();

    for (let item of data) {
        const edge = String(item).trim();

        // validate format
        if (!/^[A-Z]->[A-Z]$/.test(edge)) {
            invalid_entries.push(item);
            continue;
        }

        const [parent, child] = edge.split("->");

        // self loop invalid
        if (parent === child) {
            invalid_entries.push(item);
            continue;
        }

        // duplicate edge
        if (seenEdges.has(edge)) {
            if (!duplicateRecorded.has(edge)) {
                duplicate_edges.push(edge);
                duplicateRecorded.add(edge);
            }
            continue;
        }

        seenEdges.add(edge);

        // multi-parent rule
        if (childParent[child]) {
            continue;
        }

        childParent[child] = parent;

        if (!graph[parent]) graph[parent] = [];
        if (!graph[child]) graph[child] = [];

        graph[parent].push(child);
    }

    const allNodes = new Set();

    Object.keys(graph).forEach(parent => {
        allNodes.add(parent);

        graph[parent].forEach(child => {
            allNodes.add(child);
        });
    });

    let roots = [];

    allNodes.forEach(node => {
        if (!childParent[node]) {
            roots.push(node);
        }
    });

    const hierarchies = [];
    const processed = new Set();

    let totalTrees = 0;
    let totalCycles = 0;

    let largestDepth = -1;
    let largestRoot = "";

    // Process normal rooted trees
    for (const root of roots) {

        if (processed.has(root)) continue;

        const visited = new Set();
        const recStack = new Set();

        const cycle = hasCycle(root, graph, visited, recStack);

        visited.forEach(v => processed.add(v));

        if (cycle) {
            totalCycles++;

            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });

        } else {

            const tree = {};
            tree[root] = buildTree(root, graph);

            const depth = calculateDepth(root, graph);

            totalTrees++;

            if (
                depth > largestDepth ||
                (depth === largestDepth && root < largestRoot)
            ) {
                largestDepth = depth;
                largestRoot = root;
            }

            hierarchies.push({
                root,
                tree,
                depth
            });
        }
    }

    // Process remaining disconnected cycle groups
    for (const node of allNodes) {

        if (processed.has(node)) continue;

        const visited = new Set();
        const recStack = new Set();

        const cycle = hasCycle(node, graph, visited, recStack);

        visited.forEach(v => processed.add(v));

        if (cycle) {

            totalCycles++;

            const root = [...visited].sort()[0];

            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
        }
    }

    res.json({
        user_id: "suhailkumar_04052005",
        email_id: "suhail1362.be23@chitkara.edu.in",
        college_roll_number: "2310991362",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: totalTrees,
            total_cycles: totalCycles,
            largest_tree_root: largestRoot
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});