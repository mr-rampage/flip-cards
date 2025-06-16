import {autoUnsubscribe} from "./mixins.mjs";

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
        
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = `
        <slot></slot>
        <form>
            <label for="tag">Tag</label>
            <input type="text" id="tag" name="tag" pattern="^\\S+$" title="A tag must be a word or hyphenated word" required/>
            <input type="submit" value="Add Tag" />
        </form>`

        const form = shadowRoot.querySelector('form')
        
        form.addEventListener('click', e => form.submit())
        
        const tags = new Set()
        form.addEventListener('submit', e => {
            e.preventDefault()
            const formData = new FormData(form)
            tags.add(formData.get('tag'))
            list.innerHTML = render(tags)
            form.reset()
        })
    }
    
})