async function analyze() {

    const input = document
        .getElementById("input")
        .value;

    const lines = input
        .split("\n")
        .map(x => x.trim())
        .filter(x => x);

    try {

        document.getElementById("result").innerHTML =
            "<h3>Loading...</h3>";

        const response = await fetch(
            "http://localhost:5000/bfhl",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: lines
                })
            }
        );

        const data = await response.json();

        let html = "";

        html += `
            <div class="card">
                <h2>Summary</h2>
                <p>Total Trees: ${data.summary.total_trees}</p>
                <p>Total Cycles: ${data.summary.total_cycles}</p>
                <p>Largest Tree Root: ${data.summary.largest_tree_root}</p>
            </div>
        `;

        html += `
            <div class="card">
                <h2>Invalid Entries</h2>
                <pre>${JSON.stringify(data.invalid_entries, null, 2)}</pre>
            </div>
        `;

        html += `
            <div class="card">
                <h2>Duplicate Edges</h2>
                <pre>${JSON.stringify(data.duplicate_edges, null, 2)}</pre>
            </div>
        `;

        html += `
            <div class="card">
                <h2>Hierarchies</h2>
                <pre>${JSON.stringify(data.hierarchies, null, 2)}</pre>
            </div>
        `;

        document.getElementById("result").innerHTML = html;

    } catch (error) {

        document.getElementById("result").innerHTML =
            "<h3 style='color:red'>Failed to connect to API</h3>";
    }
}