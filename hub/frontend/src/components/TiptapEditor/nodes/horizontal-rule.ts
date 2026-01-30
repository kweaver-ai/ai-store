import {
  HorizontalRule as THorizontalRule,
  type HorizontalRuleOptions as THorizontalRuleOptions,
} from '@tiptap/extension-horizontal-rule'
import type { BlockMenuItemStorage } from '../types'
import { icon } from '../utils/icons'

export interface HorizontalRuleOptions extends THorizontalRuleOptions {
  dictionary: {
    name: string
  }
}

export const HorizontalRule = THorizontalRule.extend<HorizontalRuleOptions>({
  name: 'horizontalRule',
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      nextNodeType: 'paragraph heading',
      dictionary: {
        name: '分割线',
      },
    }
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: (node: any) => node.type === 'thematicBreak',
          apply: (state: any, _node: any, type: any) => {
            state.addNode(type)
          },
        },
        serializer: {
          match: (node: any) => node.type.name === this.name,
          apply: (state: any) => {
            state.addNode({
              type: 'thematicBreak',
            })
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon('hr'),
            keywords: 'horizontalrule,hr,hx,fgx',
            action: (editor: any) => editor.chain().setHorizontalRule().focus().run(),
          },
        ],
      },
    } satisfies BlockMenuItemStorage
  },
})
