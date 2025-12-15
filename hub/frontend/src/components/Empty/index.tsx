import { memo } from 'react'
import empty from '@/assets/images/empty.svg'

/**
 * 空 样式组件
 * @interface IEmpty
 * @param {string} iconSrc 图标路径
 * @param {React.ReactElement} desc 描述文字
 */
interface IEmpty
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iconSrc?: any
  iconHeight?: any
  desc?: React.ReactElement | string
  subDesc?: React.ReactElement | string
  children?: React.ReactElement
}

const Empty: React.FC<IEmpty> = ({
  iconSrc = empty,
  iconHeight = 144,
  desc = '抱歉，没有找到相关内容',
  subDesc,
  children,
}) => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-y-3">
      <img
        src={iconSrc}
        alt=""
        style={{ height: iconHeight, maxHeight: iconHeight }}
      />
      <div className="leading-none font-medium text-black">{desc}</div>
      {subDesc && (
        <div className="leading-none font-normal text-gray-500">{subDesc}</div>
      )}
      {children}
    </div>
  )
}
export default memo(Empty)
