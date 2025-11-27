import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ButtonBlockView from './ButtonBlockView.vue'

export const ButtonBlock = Node.create({
  name: 'buttonBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      label: {
        default: 'Button'
      },
      url: {
        default: ''
      },
      color: {
        default: 'primary'
      },
      variant: {
        default: 'solid'
      },
      size: {
        default: 'md'
      },
      alignment: {
        default: 'left'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="button-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'button-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(ButtonBlockView)
  },

  addCommands() {
    return {
      setButtonBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

