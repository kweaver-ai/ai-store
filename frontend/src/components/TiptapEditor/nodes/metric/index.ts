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
      metrics: {
        default: [],
        parseHTML: (element) => {
          const metricsAttr = element.getAttribute('data-metrics')
          if (metricsAttr) {
            try {
              const parsed = JSON.parse(metricsAttr)
              // 确保只保留 id 和 name
              if (Array.isArray(parsed)) {
                return parsed.map((item: any) => ({
                  id: item.id || '',
                  name: item.name || '',
                }))
              }
              return []
            } catch {
              return []
            }
          }
          return []
        },
        renderHTML: (attributes) => {
          const metrics = attributes.metrics
          if (!Array.isArray(metrics) || metrics.length === 0) {
            return {}
          }
          // 只保存 id 和 name
          const simplified = metrics.map((item: any) => ({
            id: item.id || '',
            name: item.name || '',
          }))
          return {
            'data-metrics': JSON.stringify(simplified),
          }
        },
      },
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
            // 从 markdown 属性中解析 metrics 数组
            const attrs: any = {}
            if (node.attributes?.metrics) {
              try {
                const parsed = JSON.parse(node.attributes.metrics)
                if (Array.isArray(parsed)) {
                  attrs.metrics = parsed.map((item: any) => ({
                    id: item.id || '',
                    name: item.name || '',
                  }))
                } else {
                  attrs.metrics = []
                }
              } catch {
                attrs.metrics = []
              }
            } else {
              attrs.metrics = []
            }
            state.addNode(type, attrs)
          },
        },
        serializer: {
          match: (node) => node.type.name === this.name,
          apply: (state: any, node: any) => {
            // 将 metrics 数组转换为 JSON 字符串，以便在 markdown 中正确序列化
            const attributes: Record<string, string> = {}
            if (Array.isArray(node.attrs.metrics) && node.attrs.metrics.length > 0) {
              attributes.metrics = JSON.stringify(node.attrs.metrics)
            }
            state.addNode({
              type: 'leafDirective',
              name: this.name,
              attributes,
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
