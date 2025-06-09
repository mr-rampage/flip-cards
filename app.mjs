const cardBuilder = document.body.querySelector('flip-card-builder')
const deck = document.body.querySelector('flip-deck')

if (cardBuilder) {
    const addCardToDeck = (deck) => ({ detail: cardTemplate }) => {
        if (!(cardTemplate instanceof HTMLTemplateElement)) return
        const card = cardTemplate.content.cloneNode(true)
        deck.append(card)
    }

    cardBuilder.addEventListener('input', addCardToDeck(deck))
}