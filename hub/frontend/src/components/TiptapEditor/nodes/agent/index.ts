import { mergeAttributes, Node } from '@tiptap/core'
import type { BlockMenuItemStorage } from '../../extensions/block-menu/menu'
import type { NodeMarkdownStorage } from '../../extensions/markdown'
import { renderIconFont } from '../../utils/icons'
import AgentView from './view'

export interface AgentOptions {
  HTMLAttributes: Record<string, any>
  dictionary: {
    name: string
  }
}

/** 智能体节点 */
export const Agent = Node.create<AgentOptions>({
  name: 'agent',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: '' },
      name: { default: '' },
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: '决策智能体',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="agent"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'agent' })]
  },

  addNodeView() {
    return AgentView
  },

  addStorage() {
    return {
      markdown: {
        parser: {
          match: (node) => node.type === 'leafDirective' && node.name === this.name,
          apply: (state: any, node: any, type: any) => {
            state.addNode(type, node.attributes)
          },
        },
        serializer: {
          match: (node) => node.type.name === this.name,
          apply: (state: any, node: any) => {
            state.addNode({
              type: 'leafDirective',
              name: this.name,
              attributes: node.attrs,
            })
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: renderIconFont({ type: 'icon-Agent' }),
            keywords: 'agent,智能体,agent,zn',
            action: (editor: any) =>
              editor.chain().insertContent({ type: this.name }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage
  },
})
