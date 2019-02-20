import Vue from 'vue'

const data = {
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,
}

function elementDrag(e, element) {    
    e = e || window.event
    e.preventDefault()

    data.pos1 = data.pos3 - e.clientX
    data.pos2 = data.pos4 - e.clientY
    data.pos3 = e.clientX
    data.pos4 = e.clientY
    element.style.top = (element.offsetTop - data.pos2) + 'px'
    element.style.left = (element.offsetLeft - data.pos1) + 'px'
}

function closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
}

function dragMouseDown(e, element) {
    e = e || window.event
    e.preventDefault();
    
    data.pos3 = e.clientX
    data.pos4 = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = (e) => elementDrag(e, element)
}


export default Vue.directive('draggable', {
    inserted: function (el, binding, vnode) {
        let d_el = el;
        
        let draggable_zone = vnode.children.find(ch => ch.data.ref === 'draggable-area');
        
        if (draggable_zone) d_el = draggable_zone.elm;
        
        d_el.addEventListener('mousedown', e=> {
            vnode.context.$emit('moved')
            dragMouseDown(e, el)
        })
    }
})