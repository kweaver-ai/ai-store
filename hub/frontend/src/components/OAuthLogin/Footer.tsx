function Footer() {
  const handleClickUserAgreement = () => {
    window.open('/Agreement/UserAgreement/ServiceAgreement-CN.html')
  }

  const handleClickPrivacy = () => {
    window.open('/Agreement/Privacy/Privacy-CN.html')
  }

  return (
    <div className="mt-1.5 flex items-center justify-center gap-0.5 text-[13px] text-[rgba(127,131,145,0.7)]">
      <div>登录即表示同意</div>
      <div
        className="text-[rgba(52,97,236,0.75)] cursor-pointer hover:text-[#3461ec]"
        onClick={handleClickUserAgreement}
      >
        用户协议
      </div>
      <div>、</div>
      <div
        className="text-[rgba(52,97,236,0.75)] cursor-pointer hover:text-[#3461ec]"
        onClick={handleClickPrivacy}
      >
        隐私政策
      </div>
    </div>
  )
}

export default Footer
