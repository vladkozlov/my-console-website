import Vue from 'vue'

const data = {
    pos1: 0,
    pos2: 0,
    pos3: 0,
    pos4: 0,
}


export default Vue.directive('draggable', {
    inserted: function (el, binding, vnode) {
        let d_el = el;
        
        let draggable_vnode = vnode.children.find(ch => ch.data.ref === 'draggable-area');
        
        if (draggable_vnode) {
            d_el = draggable_vnode.elm;
        }
        
        function dragMouseDown(e) {
            // console.log(e)
            e = e || window.event
            e.preventDefault();
            
            data.pos3 = e.clientX
            data.pos4 = e.clientY
            document.onmouseup = closeDragElement
            document.onmousemove = elementDrag
        }
        
        function elementDrag(e) {
            // console.log('elementDrag');
            
            e = e || window.event
            e.preventDefault()
        
            data.pos1 = data.pos3 - e.clientX
            data.pos2 = data.pos4 - e.clientY
            data.pos3 = e.clientX
            data.pos4 = e.clientY
            el.style.top = (el.offsetTop - data.pos2) + 'px'
            el.style.left = (el.offsetLeft - data.pos1) + 'px'
        }
        
        function closeDragElement() {
            // console.log('closeDragElement')
            document.onmouseup = null
            document.onmousemove = null
        }

        d_el.addEventListener('mousedown', e=> dragMouseDown(e))
    }
})