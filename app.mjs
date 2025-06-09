const navigator = globalThis.navigator;
if (navigator.storage?.persist) {
    navigator.storage.persist().then((persistent) => {
        if (persistent) {
            console.log("Storage will not be cleared except by explicit user action");
        } else {
            console.log("Storage may be cleared by the UA under storage pressure.");
        }
    });
}

const cardBuilder = document.body.querySelector('flip-card-builder')
const deck = document.body.querySelector('flip-deck')

if (cardBuilder) {
    const addCardToDeck = (deck) => ({detail: cardTemplate}) => {
        if (!(cardTemplate instanceof HTMLTemplateElement)) return
        const card = cardTemplate.content.cloneNode(true)
        deck.append(card)
    }

    cardBuilder.addEventListener('input', addCardToDeck(deck))
}