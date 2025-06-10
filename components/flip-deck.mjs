import {autoUnsubscribe} from "./mixins.mjs";
import {createElementFromString} from "./dom-utils.mjs";

function cloneDefinitions(card, types) {
    const selector = createElementFromString('<input type="radio" name="displayed-definition" />')

    return Array.from(card.querySelectorAll(types))
        .map(definition => definition.cloneNode(true))
        .flatMap(clone => [selector.cloneNode(true), clone])
}

function getCardSelector(tags) {
    return tags
        .split(' ')
        .map(tag => `flip-card[data-tags~="${tag.trim()}"]`).join(',');
}

function getDefinitionSelector(definitions) {
    return definitions
        .split(' ')
        .map(definition => `flip-definition[data-type="${definition.trim()}"]`).join(',')
}

function cloneCards(deck) {
    const tags = getCardSelector(deck.dataset.tags ?? "")
    const types = getDefinitionSelector(deck.dataset.definitions ?? "")

    return Array.from(deck.querySelectorAll(tags))
        .map(card => {
            const clone = card.cloneNode(false)
            const definitions = cloneDefinitions(card, types)
            clone.append(...definitions)
            return clone
        })
        .filter(card => card.children.length > 0)
}

function findNextCardSelector(card) {
    const nextCard = card.nextElementSibling
    return nextCard?.querySelector('[type="radio"]')
}

function findNextSelector(root) {
    const currentDefinition = root.querySelector('[type="radio"]:checked')
    const nextSelector = currentDefinition.nextElementSibling.nextElementSibling
    return nextSelector ?? findNextCardSelector(currentDefinition.closest('flip-card'))
}

customElements.define('flip-deck', class extends autoUnsubscribe(HTMLElement) {

    constructor() {
        super()
        const shadowRoot = this.attachShadow({mode: 'open'})
        shadowRoot.innerHTML = `
        <style>
            flip-card {
                display: none;
                user-select: none;
                
                &:has([name="displayed-definition"]:checked) {
                    display: block;
                }
                
                [name="displayed-definition"] {
                    display: none;
                    
                    + flip-definition {
                        display: none;
                    }
                    
                    &:checked + flip-definition {
                        display: block;
                    }
                }
            }
        </style>
        `
    }

    connectedCallback() {
        this.shadowRoot
            .append(...(cloneCards(this)))

        this.shadowRoot
            .querySelectorAll('flip-card')
            .forEach(card => card.setAttribute('part', 'card'))

        this.shadowRoot
            .querySelectorAll('flip-definition')
            .forEach(card => card.setAttribute('part', 'definition'))

        this.addEventListener('click', () => {
            const next = findNextSelector(this.shadowRoot)
            if (next) {
                next.checked = true
            } else {
                console.info('done!')
                this.#reset()
            }
        })

        const firstCard = this.shadowRoot
            .querySelector('[type="radio"]')
        if (firstCard) firstCard.checked = true
    }

    #reset() {
        this.shadowRoot
            .querySelectorAll('flip-card')
            .forEach(element => element.remove())

        this.parentElement
            .insertBefore(this, this.nextSibling);
    }
})

