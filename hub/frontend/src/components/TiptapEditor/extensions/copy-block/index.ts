import { Extension } from '@tiptap/core'
import type { ClickMenuItemStorage } from '../../types'
import { icon } from '../../utils/icons'
import { serializeForClipboard } from '../../utils/serialize'

/** 复制节点 */
export const CopyBlock = Extension.create({
  name: 'copyBlock',

  addOptions() {
    return {
      dictionary: {
        name: '复制',
      },
    }
  },

  addStorage() {
    return {
      clickMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon('code'),
            action: (editor: any, { selection }: any) => {
              const slice = selection.content()
              const { text } = serializeForClipboard(editor.view, slice)
              navigator.clipboard.writeText(text)
            },
          },
        ],
      },
    } satisfies ClickMenuItemStorage
  },
})
