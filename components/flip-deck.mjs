import {autoUnsubscribe} from "./mixins.mjs";
import {createElementFromString} from "./dom-utils.mjs";

function createDefinitionsByType(cards, types) {
    const selector = createElementFromString('<input type="radio" name="selected-card" />')

    return cards
        .flatMap(card => Array.from(card.querySelectorAll(types)))
        .map(definition => {
            const clone = definition.cloneNode(true)
            clone.setAttribute('part', 'definition')
            return clone
        })
        .flatMap(clone => [selector.cloneNode(true), clone])
}

customElements.define('flip-deck', class extends autoUnsubscribe(HTMLElement) {
    
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = `
        <style>
            [type="radio"] {
                display: none;
                
                + flip-definition {
                    display: none;
                }
                
                &:checked + flip-definition {
                    display: block;
                    user-select: none;
                }
            }
        </style>
        `
    }
    
    connectedCallback() {
        const tags = this.dataset.tags.split(' ').map(tag => `flip-card[data-tags~="${tag.trim()}"]`).join(',');
        const types= this.dataset.definitions.split(' ').map(definition => `flip-definition[data-type="${definition.trim()}"]`).join(',')
        const cards = Array.from(document.querySelectorAll(tags))
        const definitions = createDefinitionsByType(cards, types)
        this.shadowRoot.append(...definitions)
        
        this.addEventListener('click', () => {
            const selected = this.shadowRoot.querySelector(':checked')
            const next = selected.nextElementSibling.nextElementSibling
            if (next)
                next.checked = true
            else {
                console.info('done!')
                this.#reset()
            }
        })
        
        const firstCard = this.shadowRoot.querySelector('[type="radio"]')
        if (firstCard)
            firstCard.checked = true
    }
    
    #reset() {
        this.shadowRoot.querySelectorAll('[name="selected-card"], [part="definition"]')
            .forEach(element => element.remove())
        this.parentElement.insertBefore(this, this.nextSibling);
    }
})

