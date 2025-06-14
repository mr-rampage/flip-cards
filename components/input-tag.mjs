import {autoUnsubscribe} from "./mixins.mjs";
import {disableSubmitOnFormChange} from "./dom-utils.mjs";

function render(tags) {
    return Array.from(tags)
        .map(tag => `<li>${tag}</li>`)
        .join('')
}
customElements.define('input-tag', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        
        const list = document.createElement('ul')
        this.replaceChildren(list)
        
        const shadowRoot = this.attachShadow({ mode: 'closed' })
        shadowRoot.innerHTML = `
        <slot></slot>
        <form>
            <label for="tag">Tag</label>
            <input type="text" id="tag" name="tag" pattern="^\\S+$" title="A tag must be a word or hyphenated word" required/>
            <input type="submit" value="Add Tag" disabled/>
        </form>`

        shadowRoot.addEventListener('input', e => e.stopImmediatePropagation())

        const form = shadowRoot.querySelector('form')
        
        disableSubmitOnFormChange(form)
        form.addEventListener('submit', e => e.preventDefault())

        
        const tags = new Set()
        form.addEventListener('submit', () => {
            const formData = new FormData(form)
            tags.add(formData.get('tag'))
            list.innerHTML = render(tags)
        })
        
        form.addEventListener('submit', () => {
            form.reset()
            disableSubmitOnFormChange(form)
        })
    }
    
})