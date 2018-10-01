const methods = Object.freeze({
    "bw": bw,
    "colored": colored
});

function run() {
    const select = document.getElementById("method");
    const value = select.value;
    const method = methods[value];
    if (typeof method === "undefined") return;
    generate(null, method);
}