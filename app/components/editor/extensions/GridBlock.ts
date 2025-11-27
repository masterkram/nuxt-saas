import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import GridBlockView from './GridBlockView.vue'

export const GridBlock = Node.create({
  name: 'gridBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      columns: {
        default: 2
      },
      gap: {
        default: 4
      },
      items: {
        default: []
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="grid-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'grid-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(GridBlockView)
  },

  addCommands() {
    return {
      setGridBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

