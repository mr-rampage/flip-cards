import {autoUnsubscribe} from "./mixins.mjs";

function render(definitions) {
    return definitions
        .entries()
        .map(([type, definition]) => `<dt>${type}</dt><dd>${definition}</dd>`)
        .toArray()
        .join('')
}
customElements.define('input-definition', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        
        const list = document.createElement('dl')
        this.replaceChildren(list)
        
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = `
        <slot></slot>
        <div>
            <label for="type">Type</label>
            <input type="text" id="type" name="type" pattern="^\\S+$" title="A definition type must be a word or hyphenated word" required/>
            <label for="definition">Definition</label>
            <textarea id="definition" name="definition" required></textarea>
            <button>Add Definition</button>
        </div>`

        shadowRoot.addEventListener('input', e => e.stopImmediatePropagation())
        shadowRoot.addEventListener('change', e => e.stopImmediatePropagation())
        
        const addDefinition = shadowRoot.querySelector('button')
        const type = shadowRoot.querySelector('#type')
        const definition = shadowRoot.querySelector('#definition')
        
        const definitions = new Map()
        addDefinition.addEventListener('click', e => {
            if (!type.checkValidity()) {
                type.reportValidity()
                return
            }
            if (!definition.checkValidity()) {
                definition.reportValidity()
                return
            }
            definitions.set(type.value, definition.value)
            list.innerHTML = render(definitions)
            type.value = ''
            definition.value = ''
        })
    }

})
