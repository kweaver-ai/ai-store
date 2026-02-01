import { mergeAttributes, Node } from '@tiptap/core'
import type { BlockMenuItemStorage } from '../../extensions/block-menu/menu'
import type { NodeMarkdownStorage } from '../../extensions/markdown'
import { renderIconFont } from '../../utils/icons'
import KnowledgeView from './view'

export interface KnowledgeOptions {
  HTMLAttributes: Record<string, any>
  dictionary: {
    name: string
  }
}

/** 知识网络节点 */
export const Knowledge = Node.create<KnowledgeOptions>({
  name: 'knowledge',
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
        name: '业务知识网络',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="knowledge"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'knowledge' })]
  },

  addNodeView() {
    return KnowledgeView
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
            icon: renderIconFont({ type: 'icon-yewuzhishiwangluo' }),
            keywords: 'knowledge,card,zs,network,zswl',
            action: (editor: any) =>
              editor.chain().insertContent({ type: this.name }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage
  },
})
