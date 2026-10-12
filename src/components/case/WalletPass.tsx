import s from "./blocks.module.css";

type Field = { label: string; value: string };

// An Apple Wallet event ticket, drawn from the pass's own pass.json and images:
// blurred background, logo and header up top, then the primary and secondary fields, then the QR.
export default function WalletPass({ bg, logo, logoText, header, primary, secondary, qr, labelColor = "#fff", stage }: {
  bg: string; logo: string; logoText: string; header: Field; primary: Field; secondary: Field; qr: string; labelColor?: string; stage?: string;
}) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.passStage} style={{ background: stage }}>
        <div className={s.pass} style={{ color: labelColor }}>
          <div className={s.passBg} style={{ backgroundImage: `url(${bg})` }} aria-hidden />
          <div className={s.passTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className={s.passLogo} />
            <span className={s.passLogoText}>{logoText}</span>
            <span className={s.passHeader}><small>{header.label}</small>{header.value}</span>
          </div>
          <div className={s.passPrimary}><small>{primary.label}</small>{primary.value}</div>
          <div className={s.passSecondary}><small>{secondary.label}</small>{secondary.value}</div>
          <div className={s.passQr}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Check-in QR code" />
          </div>
        </div>
      </div>
    </figure>
  );
}
