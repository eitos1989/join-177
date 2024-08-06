/**
 * Lädt und fügt HTML-Inhalte in Elemente mit dem Attribut 'w3-include-html' ein.
 * 
 * Diese Funktion sucht nach allen Elementen im DOM, die das Attribut 'w3-include-html' besitzen,
 * und lädt den Inhalt der angegebenen HTML-Datei über eine Fetch-Anfrage. Der geladene Inhalt wird 
 * in das entsprechende Element eingefügt. Wenn die Anfrage fehlschlägt, wird ein Fehlertext angezeigt.
 * 
 * @async
 * @function
 */
async function includeContainerForBoardSidelHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html"); 
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}
