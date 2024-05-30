const stateFrom = document.getElementById('stateFrom');
const stateTo = document.getElementById('stateTo');
const letterInput = document.getElementById('letterInput');

const formalLanguage = document.getElementById('formalLanguage');
const table = document.getElementById('table');

const graph = document.getElementById('graph');
const convertButton =  document.getElementById('convertButton');

// nfa= {
//     "transitions": [
//     q0 :  { a : ['q0' , 'q1'], b : ['q0'] } , 
//     q1 :  { b : ['q2']}
// ],
//     "alphabet": [
//         "a",
//         "b"
//     ],
//     "states": [
//         "q0",
//         "q1",
//         "q2"
//     ]
// }


let nfa = {
    transitions: {
        q0: { a: ['q0', 'q1'], b: ['q0'] },
        q1: { b: ['q2'] },
        q2: {}
    },
    alphabet: ['a', 'b'],
    states: ['q0', 'q1', 'q2']
};
update(nfa);



function addTransition(fa) {
    if (!letterInput.value) { return }
    if (!fa.transitions[stateFrom.value]) {
        fa.transitions[stateFrom.value] = {};
    }

    if (!fa.transitions[stateFrom.value][letterInput.value]) {
        fa.transitions[stateFrom.value][letterInput.value] = [];
    }

    if (!fa.transitions[stateFrom.value][letterInput.value].includes(stateTo.value)) {
        fa.transitions[stateFrom.value][letterInput.value].push(stateTo.value);
        if (!fa.alphabet.includes(letterInput.value)) { fa.alphabet.push(letterInput.value) }
        if (!fa.states.includes(stateFrom.value)) { fa.states.push(stateFrom.value) }
        if (!fa.states.includes(stateTo.value)) { fa.states.push(stateTo.value) }

    }
    update(fa);
    console.log(nfa);
}

function clearTransitions() {
    nfa = {
        transitions: {},
        alphabet: [],
        states: []
    }

    update(nfa);
    convertButton.innerHTML = 'NFA'

}

function setFormalLanguage(fa) {
    formalLanguage.innerHTML = '';
    Object.keys(fa.transitions).forEach(keyState => {
        Object.keys(fa.transitions[keyState]).forEach(input => {
            fa.transitions[keyState][input].forEach(targetState => {
                formalLanguage.innerHTML += `<div>T(${keyState} , ${input}) = ${targetState}</div>`
            })
        })
    })
}

function setTable(fa) {
    table.innerHTML = '';
    const tableHeader = document.createElement("tr");
    tableHeader.innerHTML = '<td>table</td>';
    fa.alphabet.forEach(letter => {
        tableHeader.innerHTML += `<td>${letter}</td>`
    });
    table.appendChild(tableHeader);

    Object.keys(fa.transitions).forEach(keyState => {
        const transitionRow = document.createElement("tr");
        transitionRow.innerHTML += `<td> ${keyState} </td>`;

        fa.alphabet.forEach(letter => {
            if (fa.transitions[keyState][letter]) {

                const targetStateBox = document.createElement("td");


                fa.transitions[keyState][letter].forEach(targetState => {
                    targetStateBox.innerHTML += `${targetState} `;
                })
                transitionRow.appendChild(targetStateBox);

            } else {
                transitionRow.innerHTML += `<td> - </td>`;
            }

            table.appendChild(transitionRow);
        });
    })
}

function setGraph(fa) {
    graph.innerHTML = '';
    const nodes = new vis.DataSet(fa.states.map(state => ({
        id: state,
        label: state,
    })));

    const edges = new vis.DataSet();

    Object.keys(fa.transitions).forEach(fromState => {
        fa.alphabet.forEach(symbol => {
            const toStates = fa.transitions[fromState][symbol];
            if (Array.isArray(toStates)) {
                toStates.forEach(toState => {
                    edges.add({
                        from: fromState,
                        to: toState,
                        label: symbol
                    });
                });
            } else if (toStates) {
                edges.add({
                    from: fromState,
                    to: toStates,
                    label: symbol
                });
            }
        });
    });

    // Define options for the graph layout
    const options = {
        manipulation: false
    };

    // Initialize the graph
    let graphData = { nodes: nodes, edges: edges };
    let graphNetwork = new vis.Network(graph, graphData, options);

}

function update(fa) {
    setFormalLanguage(fa);
    setTable(fa);
    setGraph(fa)
}

function setToString(set) {
    return `{${[...set].sort().join(',')}}`;
}

function getTransitions(stateSet, symbol, nfa) {
    const resultSet = new Set();
    stateSet.forEach(state => {
        if (nfa.transitions[state] && nfa.transitions[state][symbol]) {
            nfa.transitions[state][symbol].forEach(target => resultSet.add(target));
        }
    });
    return resultSet;
}

function nfaToDfa(nfa) {
    const dfa = {
        transitions: {},
        alphabet: nfa.alphabet,
        states: []
    };

    const startState = new Set([nfa.states[0]]);
    const unprocessedStates = [startState];
    const processedStates = new Set();

    while (unprocessedStates.length > 0) {
        const currentSet = unprocessedStates.pop();
        const currentStateString = setToString(currentSet);

        if (!processedStates.has(currentStateString)) {
            processedStates.add(currentStateString);
            dfa.states.push(currentStateString);

            dfa.transitions[currentStateString] = {};

            nfa.alphabet.forEach(symbol => {
                const nextStateSet = getTransitions(currentSet, symbol, nfa);
                if (nextStateSet.size > 0) {
                    const nextStateString = setToString(nextStateSet);
                    if (!dfa.transitions[currentStateString][symbol]) {
                        dfa.transitions[currentStateString][symbol] = [];
                    }
                    dfa.transitions[currentStateString][symbol].push(nextStateString);

                    if (!processedStates.has(nextStateString)) {
                        unprocessedStates.push(nextStateSet);
                    }
                }
            });
        }
    }

    console.log(dfa);
    convertButton.innerHTML = 'DFA'
    update(dfa);
}