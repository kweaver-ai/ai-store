function Footer() {
  return (
    <div className="mt-1.5 flex items-center justify-center gap-0.5 text-[13px] text-[rgba(127,131,145,0.7)]">
      <div>登录即表示同意</div>
      <a
        href="/Agreement/UserAgreement/ServiceAgreement-CN.html"
        className="text-[rgba(52,97,236,0.75)] hover:text-[#3461ec]"
        target="_blank"
        rel="noopener noreferrer"
      >
        用户协议
      </a>
      <div>、</div>
      <a
        href="/Agreement/Privacy/Privacy-CN.html"
        className="text-[rgba(52,97,236,0.75)] hover:text-[#3461ec]"
        target="_blank"
        rel="noopener noreferrer"
      >
        隐私政策
      </a>
    </div>
  )
}

export default Footer
