import { mergeAttributes, Node } from '@tiptap/core'
import type { BlockMenuItemStorage } from '../../extensions/block-menu/menu'
import type { NodeMarkdownStorage } from '../../extensions/markdown'
import { renderIconFont } from '../../utils/icons'
import MetricView from './view'

export interface MetricOptions {
  HTMLAttributes: Record<string, any>
  dictionary: {
    name: string
  }
}

/** 指标节点 */
export const Metric = Node.create<MetricOptions>({
  name: 'metric',
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
        name: '指标',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="metric"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'metric' })]
  },

  addNodeView() {
    return MetricView
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
            icon: renderIconFont({ type: 'icon-a-zhibiaomoxing1' }),
            keywords: 'metric,指标,zb',
            action: (editor: any) =>
              editor.chain().insertContent({ type: this.name }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage
  },
})
