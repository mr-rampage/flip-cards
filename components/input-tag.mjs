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
        <div>
            <label for="tag">Tag</label>
            <input type="text" id="tag" name="tag" pattern="^\\S+$" title="A tag must be a word or hyphenated word" required/>
            <button>Add Tag</button>
        </div>`

        const tag = shadowRoot.querySelector('#tag')
        const addTag = shadowRoot.querySelector('button')
        
        const tags = new Set()
        addTag.addEventListener('click', e => {
            tags.add(tag.value)
            list.innerHTML = render(tags)
            tag.value = ''
        })
    }
    
})