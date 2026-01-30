import { Button, Card, message, Space } from 'antd'
import type React from 'react'
import { useState } from 'react'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import TiptapEditor from '@/components/TiptapEditor'
import styles from './index.module.less'

const EditorPage: React.FC = () => {
  const [content, setContent] = useState(`# Welcome to Tiptap Editor

This is a **rich text editor** built with [Tiptap 3.0](https://tiptap.dev/).

## Features

- ✨ **Markdown Support**: Write in markdown and see it rendered
- 🎨 **Rich Formatting**: Bold, *italic*, ~~strikethrough~~, and more
- 📝 **Lists**: Bullet lists, numbered lists, and task lists
- 🔗 **Links**: [Add links](https://tiptap.dev) easily
- 💻 **Code Blocks**: With syntax highlighting

\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`

:::mermaid
graph TD
  A[Start] --> B[Stop]
:::

## Try it out!

Start typing below or use the \`/\` command to insert blocks.

- [ ] Try the task list
- [ ] Use the floating menu to format text
- [ ] Insert a table or image

`)

  const [markdown, setMarkdown] = useState(content)
  const [readOnly, setReadOnly] = useState(false)

  const handleUpdate = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
    message.success('Markdown copied to clipboard!')
  }

  const handleClear = () => {
    setContent('')
    setMarkdown('')
    message.info('Editor cleared')
  }

  return (
    <div className={styles.editorPage}>
      <div className={styles.header}>
        <h1>Tiptap 3.0 Editor Demo</h1>
        <Space>
          <Button onClick={() => setReadOnly(!readOnly)}>
            {readOnly ? 'Edit Mode' : 'Read Only'}
          </Button>
          <Button onClick={handleCopy}>Copy Markdown</Button>
          <Button danger onClick={handleClear}>
            Clear
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <Card title="Editor" className={styles.editorCard}>
          <ScrollBarContainer className="h-full pr-2 tiptap-scroll-container">
            <TiptapEditor
              content={content}
              onUpdate={handleUpdate}
              readOnly={readOnly}
              placeholder="Type / to see commands..."
            />
          </ScrollBarContainer>
        </Card>

        <Card title="Markdown Output" className={styles.markdownCard}>
          <ScrollBarContainer className="h-full pl-8 pr-2">
            <pre className={styles.markdownPre}>{markdown}</pre>
          </ScrollBarContainer>
        </Card>
      </div>
    </div>
  )
}

export default EditorPage
