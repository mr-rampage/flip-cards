export {requestDeckCycle}
import {autoUnsubscribe} from "./mixins.mjs";
import {
    cycleByTagName,
    filter,
    handleEventByTagName,
    requestDataset,
    respondDataset,
    toggleNext
} from "./dom-utils.mjs";

const requestDeckCycle = (element) => requestDataset(element, 'definitions').split(',').map(item => item.trim())
customElements.define('flip-deck', class extends autoUnsubscribe(HTMLElement) {
    connectedCallback() {
        const tags = this.dataset.tags.split(',').map(item => item.trim())
        const byTags = card => tags.some(tag => card.dataset.tags.toLowerCase().includes(tag.toLowerCase()))
        const cycle = filter(cycleByTagName(this, 'flip-card'), byTags)
        toggleNext(this, cycle)
        this.addEventListener('done', handleEventByTagName('flip-card', () => toggleNext(this, cycle)))
        respondDataset(this, 'cycle')
    }
})

