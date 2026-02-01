import { Extension } from '@tiptap/core'
import { DragHandlePlugin, defaultComputePositionConfig } from '@tiptap/extension-drag-handle'
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state'
import tippy, { type Instance } from 'tippy.js'
import { icon } from '../../utils/icons'
import { renderMenu } from '../../utils/menu'

export interface DragHandleOptions {
  items: Array<string | '|'>
  nested?: any
  computePositionConfig?: any
}

export const CustomDragHandle = Extension.create<DragHandleOptions>({
  name: 'customDragHandle',

  addOptions() {
    return {
      items: [
        'copyBlock',
        'deleteBlock',
        '|',
        'paragraph',
        'heading1',
        'heading2',
        'heading3',
        '|',
        'orderedList',
        'bulletList',
        'taskList',
        '|',
        'blockquote',
        'codeBlock',
      ],
      nested: false,
      computePositionConfig: {},
    }
  },

  addStorage() {
    return {
      node: null as any,
      pos: -1,
    }
  },

  addProseMirrorPlugins() {
    const { editor, options, storage } = this

    const element = document.createElement('div')
    element.classList.add('dip-prose-mirror-cm')

    // 获取滚动容器
    const getScrollContainer = (): HTMLElement | null => {
      let scrollContainer: HTMLElement | null = editor.view.dom.parentElement
      while (scrollContainer) {
        if (scrollContainer.classList.contains('tiptap-scroll-container')) {
          return scrollContainer
        }
        const style = window.getComputedStyle(scrollContainer)
        if (/(auto|scroll)/.test(style.overflow + style.overflowY)) {
          return scrollContainer
        }
        scrollContainer = scrollContainer.parentElement
      }
      return null
    }

    // 检查节点是否在容器可见区域内
    const checkNodeVisibility = (): boolean => {
      if (!storage.node || storage.pos === -1) {
        return false
      }

      const scrollContainer = getScrollContainer()
      if (!scrollContainer) {
        return true // 如果没有找到滚动容器，默认显示
      }

      const nodeDOM = editor.view.nodeDOM(storage.pos) as HTMLElement
      if (!nodeDOM) {
        return false
      }

      // getBoundingClientRect() 返回的是相对于视口（viewport）的位置
      // 所以可以直接比较节点和容器的位置来判断可见性
      const containerRect = scrollContainer.getBoundingClientRect()
      const nodeRect = nodeDOM.getBoundingClientRect()

      // 检查节点是否在容器的可见区域内（允许部分可见）
      // getBoundingClientRect() 返回的是相对于视口的位置，可以直接比较
      const isVisible =
        nodeRect.top > containerRect.top && // 节点底部在容器顶部下方
        nodeRect.left > containerRect.left // 节点右边界在容器左边界右侧

      return isVisible
    }

    // 更新 element 的可见性
    const updateElementVisibility = () => {
      requestAnimationFrame(() => {
        const isVisible = checkNodeVisibility()
        if (isVisible) {
          element.style.opacity = '1'
        } else {
          element.style.opacity = '0'
        }
      })
    }

    // Plus button
    const plus = document.createElement('div')
    plus.innerHTML = icon('plus')
    plus.classList.add('dip-prose-mirror-cm-plus')
    plus.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()

      const { node, pos } = storage

      if (node && pos !== -1) {
        // The pos from onNodeChange is the absolute start of the node.
        // We want to insert AFTER the node, so we use pos + node.nodeSize.
        const targetPos = pos + node.nodeSize
        const docSize = editor.state.doc.content.size
        const safeInsertPos = Math.min(targetPos, docSize)

        editor
          .chain()
          .insertContentAt(safeInsertPos, { type: 'paragraph' })
          .setTextSelection(safeInsertPos + 1)
          .focus()
          .run()
      }
    })

    // Drag handle
    const drag = document.createElement('div')
    drag.innerHTML = icon('drag')
    drag.classList.add('dip-prose-mirror-cm-drag')
    drag.setAttribute('data-drag-handle', '') // Required by official extension

    let menuInstance: Instance | undefined

    drag.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()

      if (menuInstance) {
        menuInstance.destroy()
        menuInstance = undefined
        return
      }

      const { node, pos } = storage

      if (!node || pos === -1) return

      // Use the provided position directly as it's the node start position from onNodeChange
      // Ensure the position is within valid range [0, doc.content.size]
      const docSize = editor.state.doc.content.size
      const safePos = Math.max(0, Math.min(pos, docSize))

      if (safePos > docSize) return

      // Select the node before showing menu
      try {
        const selection = NodeSelection.create(editor.state.doc, safePos)
        editor.view.dispatch(editor.state.tr.setSelection(selection))

        const root = document.createElement('div')
        root.classList.add('dip-prose-mirror-cm-menu')

        const resolvedPos = editor.state.doc.resolve(safePos)

        // 根据节点类型过滤菜单项
        let filteredItems = options.items
        const nodeType = node.type.name

        // 分割线只保留复制和删除
        if (nodeType === 'horizontalRule') {
          filteredItems = ['copyBlock', 'deleteBlock']
        }

        renderMenu({
          editor,
          root,
          active: { node, pos: resolvedPos },
          selection,
          items: filteredItems,
          onClose: () => {
            if (menuInstance) {
              menuInstance.destroy()
              menuInstance = undefined
            }
          },
        })

        menuInstance = tippy(document.body, {
          appendTo: () => document.body,
          getReferenceClientRect: () => drag.getBoundingClientRect(),
          content: root,
          arrow: false,
          interactive: true,
          showOnCreate: true,
          theme: 'dip-prose-mirror',
          animation: 'shift-away',
          trigger: 'manual',
          placement: 'left-start',
          maxWidth: 'none',
          offset: [0, 35],
          zIndex: 999,
          onHide: () => {
            menuInstance = undefined
          },
        })
      } catch (error) {
        console.error('[CustomDragHandle] Failed to create selection or render menu', error)
      }
    })

    element.append(plus)
    element.append(drag)

    // Normalize nested options to match what the plugin expects
    let nestedOptions: any
    if (options.nested === true) {
      nestedOptions = {
        enabled: true,
        rules: [],
        defaultRules: true,
        edgeDetection: { edges: ['left', 'top'], threshold: 12, strength: 500 },
      }
    } else if (typeof options.nested === 'object' && options.nested !== null) {
      nestedOptions = {
        enabled: true,
        rules: options.nested.rules ?? [],
        defaultRules: options.nested.defaultRules ?? true,
        allowedContainers: options.nested.allowedContainers,
        edgeDetection: options.nested.edgeDetection ?? {
          edges: ['left', 'top'],
          threshold: 12,
          strength: 500,
        },
      }
    } else {
      nestedOptions = {
        enabled: false,
        rules: [],
        defaultRules: true,
        edgeDetection: { edges: [], threshold: 0, strength: 0 },
      }
    }

    const pluginResult = DragHandlePlugin({
      editor,
      element,
      computePositionConfig: {
        ...defaultComputePositionConfig,
        ...options.computePositionConfig,
      },
      nestedOptions,
      onNodeChange: ({ node, pos }) => {
        storage.node = node
        storage.pos = pos
        // 节点变化时更新可见性
        updateElementVisibility()
      },
    })

    // 监听滚动事件，在滚动时也检测可见性
    const scrollContainer = getScrollContainer()
    let scrollHandler: (() => void) | undefined

    if (scrollContainer) {
      scrollHandler = () => {
        updateElementVisibility()
      }
      scrollContainer.addEventListener('scroll', scrollHandler, { passive: true })
    }

    // 创建辅助插件来管理滚动事件监听器的清理
    const plugins = [pluginResult.plugin]

    if (scrollHandler && scrollContainer) {
      const handler = scrollHandler
      const container = scrollContainer
      const cleanupPlugin = new Plugin({
        key: new PluginKey('customDragHandle-cleanup'),
        view: () => ({
          destroy: () => {
            container.removeEventListener('scroll', handler)
          },
        }),
      })
      plugins.push(cleanupPlugin)
    }

    return plugins
  },
})
