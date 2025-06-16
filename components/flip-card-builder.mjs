import {autoUnsubscribe} from "./mixins.mjs";
import "./input-definition.mjs"
import "./input-tag.mjs"
import {createElementFromString} from "./dom-utils.mjs";

export {addCardToDeck}

const ADD_CARD_EVENT = "add-card"

function addCardToDeck(deck) {
    if (deck.tagName.toLowerCase() !== "flip-deck") return
    document.body.addEventListener(ADD_CARD_EVENT, ({target, detail: card}) => {
        if (target.tagName.toLowerCase() !== "flip-card-builder") return
        deck.append(card)
    })
}

customElements.define('flip-card-builder', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
                <fieldset class="tags">
                  <legend>Tags</legend>
                  <input-tag name="tags"></input-tag>
                </fieldset>
                <fieldset class="definitions">
                  <legend>Definitions</legend>
                  <input-definition name="definitions"></input-definition>
                </fieldset>
                <input type="submit" value="Create card" />
            </form>
        `
    }

    connectedCallback() {
        super.connectedCallback?.()

        let inputTag = this.shadowRoot.querySelector('input-tag')
        let inputDefinitions = this.shadowRoot.querySelector('input-definition')

        this.shadowRoot.addEventListener('submit', e => e.preventDefault())
        this.shadowRoot.addEventListener('submit', () => {
            if (!inputTag.checkValidity())
            {
                inputTag.reportValidity()
                return
            }
            
            if (!inputDefinitions.checkValidity())
            {
                inputDefinitions.reportValidity()
                return
            }
            
            const tags = inputTag.value.join(' ')

            const definitions = 
                inputDefinitions.value
                .map(([type, definition]) => `<flip-definition data-type="${type}">${definition}</flip-definition>`)
                .join('\n')

            const card = createElementFromString(`<flip-card data-tags="${tags}">${definitions}</flip-card>`)

            this.dispatchEvent(new CustomEvent(ADD_CARD_EVENT, {
                detail: card, bubbles: true, composed: true
            }))
        })
    }
})
