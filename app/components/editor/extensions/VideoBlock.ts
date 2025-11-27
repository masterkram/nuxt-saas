import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VideoBlockView from './VideoBlockView.vue'

export const VideoBlock = Node.create({
  name: 'videoBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      type: {
        default: 'url' // 'url' or 'embed'
      },
      caption: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'video-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoBlockView)
  },

  addCommands() {
    return {
      setVideoBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

