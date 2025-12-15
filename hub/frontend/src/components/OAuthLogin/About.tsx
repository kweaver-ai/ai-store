import { useEffect, useState } from 'react'

function About() {
  const [version, setVersion] = useState<string>('')

  const getVersion = async () => {
    // 可以根据实际需求获取版本信息
    // 这里先使用固定值
    const v = '1.0.0'
    setVersion(v)
  }

  useEffect(() => {
    getVersion()
  }, [])

  return (
    <div className="flex items-center justify-center text-xs text-[#7f8391]">
      <div>版本信息 {version}</div>
      <div className="mx-0.5 h-0.5 border-r border-[#7f8391]" />
      <div>沪ICP备09089247号-9</div>
    </div>
  )
}

export default About
