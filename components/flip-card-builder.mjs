import {autoUnsubscribe} from "./mixins.mjs";
import "./input-definition.mjs"
import "./input-tag.mjs"

export {addCardToDeck}

const ADD_CARD_EVENT = "add-card"

function addCardToDeck(deck) {
    if (deck.tagName.toLowerCase() !== "flip-deck") return
    document.body.addEventListener(ADD_CARD_EVENT, ({target, detail: card}) => {
        if (target.tagName.toLowerCase() !== "flip-card-builder") return
        deck.append(card)
    })
}

const inPlacePairwise = (xs, x, idx) => {
    if (idx % 2 === 0) 
        xs.push([x]) 
    else 
        xs.at(-1).push(x)
    return xs
}

customElements.define('flip-card-builder', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
                <fieldset class="tags">
                  <legend>Tags</legend>
                  <input-tag></input-tag>
                </fieldset>
                <fieldset class="definitions">
                  <legend>Definitions</legend>
                  <input-definition></input-definition>
                </fieldset>
                <input type="submit" value="Create card" />
            </form>
        `
    }

    connectedCallback() {
        super.connectedCallback?.()

        this.shadowRoot.addEventListener('submit', e => e.preventDefault())
        this.shadowRoot.addEventListener('submit', () => {
            const tags = Array
                .from(inputTag.querySelectorAll('li'))
                .map(li => li.textContent)
                .join(' ')

            const definitions = Array
                .from(inputDefinitions.querySelectorAll('dt, dd'))
                .map(element => element.innerHTML)
                .reduce(inPlacePairwise, [])
                .map(([type, definition]) => `<flip-definition data-type="${type}">${definition}</flip-definition>`)
                .join('\n')

            const card = `<flip-card data-tags="${tags}">${definitions}</flip-card>`

            const template = document.createElement("template")
            template.innerHTML = card

            this.dispatchEvent(new CustomEvent(ADD_CARD_EVENT, {
                detail: template.content.cloneNode(true), bubbles: true, composed: true
            }))
        })
    }
})
