if (!localStorage.getItem("splash")) {
    localStorage.setItem("splash", true);
    document.location = "./about";
}

var terms = await fetch('https://ccoverheid.nl/harmonisator/api.php/records/term?include=schemaName,UID,label,definition,sourceLD&order=sorting')
                    .then(rs => rs.json()).then(rs => rs.records);
terms = terms.map(function (term) {
    return {
        "Schema": term.schemaName,
        "UID": term.UID,
        "Label": term.label,
        "Definitie": "bla " + term.definition,
        "Documentatie": term.sourceLD
    };
});

var triples = await fetch ('triples.json').then(rs => rs.json()).then(rs => rs.triples);

renderResults(terms, triples);
renderSchemas(terms);

function filter(val) {
    val = val.toLowerCase();
    var filteredTerms;
    if (val.indexOf("schema:") !== -1) {
        val = val.replace(/schema:/, "");
        filteredTerms = terms.filter(function (term) {
            return term.Schema.toLowerCase().indexOf(val) !== -1;
        });
    } else {
        filteredTerms = terms.filter(function (term) {
            return term.Label.toLowerCase().indexOf(val) !== -1 ||
                term.Definitie.toLowerCase().indexOf(val) !== -1;
        });
    }
    document.getElementById("resultaten").style.display = "block";
    document.getElementById("schemas").style.display = "none"
    renderResults(filteredTerms, triples);
}

function renderResults(terms, triples) {
    let html = terms.map(function (term) {
        let data = {
            term: term,
            attributes: triples.filter(function (triple) {
                return triple.Term1 === term.Label &&
                       triple.Relatie === "... heeft kenmerk ..."
            }).map(function (triple) {
                return triple.Term2;
            })
        };
        return tmpl("resultaat_template", data);
    });
    document.getElementById("resultaten").innerHTML = html.join("");
    let filters = document.querySelectorAll("[data-filter]");
    for (var i = 0; i < filters.length; i++) {
        let val = filters[i].dataset.filter;
        filters[i].onclick = function () {
            document.getElementById('vind-termen').value = val;
            filter(val);
        };
    }
}

function renderSchemas(terms) {
    let html = terms.map(function (term) {
        return term.Schema;
    }).filter(function (value, index, self) {
        return self.indexOf(value) === index;
    }).map(function (schema) {
        return tmpl("schema_template", {schema: schema});
    });
    document.getElementById("schemas").innerHTML = html.join("");
    let filters = document.querySelectorAll("[data-filter]");
    for (var i = 0; i < filters.length; i++) {
        let val = filters[i].dataset.filter;
        filters[i].onclick = function () {
            document.getElementById('vind-termen').value = val;
            filter(val);
        };
    }
}

document.getElementById('vind-termen').onkeyup = function (e) {
    let val = e.target.value;
    filter(val);
};