import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageBlockView from './ImageBlockView.vue'

export const ImageBlock = Node.create({
  name: 'imageBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: ''
      },
      caption: {
        default: ''
      },
      width: {
        default: '100%'
      },
      alignment: {
        default: 'center'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageBlockView)
  },

  addCommands() {
    return {
      setImageBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

