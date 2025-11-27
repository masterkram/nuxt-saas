import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ConfirmBlockView from './ConfirmBlockView.vue'

export const ConfirmBlock = Node.create({
  name: 'confirmBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      title: {
        default: 'Confirmation Required'
      },
      message: {
        default: 'I confirm that I have read and understood this information.'
      },
      required: {
        default: true
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="confirm-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'confirm-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(ConfirmBlockView)
  },

  addCommands() {
    return {
      setConfirmBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

