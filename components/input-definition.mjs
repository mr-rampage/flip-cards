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
        <form>
            <label for="type">Type</label>
            <input type="text" id="type" name="type" pattern="^\\S+$" title="A definition type must be a word or hyphenated word" required/>
            <label for="render">Display as</label>
            <select id="render" name="render" required>
                <option value='html' selected>HTML</option>
                <option value='text'>Text</option>
                <option value='audio'>Audio</option>
            </select>
            <label for="definition">Definition</label>
            <textarea id="definition" name="definition" required></textarea>
            <input type="submit" value="Add Tag" />
        </form>`

        shadowRoot.addEventListener('input', e => e.stopImmediatePropagation())
        shadowRoot.addEventListener('change', e => e.stopImmediatePropagation())
        
        const form = shadowRoot.querySelector('form')
        
        form.addEventListener('submit', e => e.preventDefault())

        const definitions = new Map()
        form.addEventListener('submit', () => {
            const formData = new FormData(form)
            definitions.set(formData.get('type'), formData.get('definition'))
            list.innerHTML = render(definitions)
        })

        form.addEventListener('submit', () => form.reset())
    }

})
