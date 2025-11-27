import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import QuizBlockView from './QuizBlockView.vue'

export const QuizBlock = Node.create({
  name: 'quizBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      title: {
        default: 'Quiz'
      },
      questions: {
        default: []
      },
      required: {
        default: false
      },
      showResults: {
        default: true
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quiz-block"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quiz-block' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(QuizBlockView)
  },

  addCommands() {
    return {
      setQuizBlock: (attributes: any) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes
        })
      }
    }
  }
})

