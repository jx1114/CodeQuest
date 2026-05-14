interface CertificateArtworkProps {
  userName: string
  languageName: string
  totalChapters: number
  certificateId: string
  issuedAt: string
  className?: string
}

export default function CertificateArtwork({
  userName,
  languageName,
  totalChapters,
  certificateId,
  issuedAt,
  className = "",
}: CertificateArtworkProps) {
  const issuedDate = new Date(issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-[#f6efe3] shadow-[0_30px_80px_rgba(67,44,18,0.24)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,236,187,0.45),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,248,232,0.15))]" />
      <div className="absolute inset-4 rounded-[22px] border border-[#d7b36d]/45" />

      <svg viewBox="0 0 1400 990" className="relative h-auto w-full text-[#5a3a1b]" role="img" aria-label="Certificate of completion">
        <defs>
          <linearGradient id="certificateGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="28%" stopColor="#e6b85c" />
            <stop offset="58%" stopColor="#c98d2f" />
            <stop offset="100%" stopColor="#8f5a16" />
          </linearGradient>
          <linearGradient id="certificateRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff6c8" />
            <stop offset="48%" stopColor="#f0c24e" />
            <stop offset="100%" stopColor="#b87918" />
          </linearGradient>
          <radialGradient id="sealGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff4c9" />
            <stop offset="52%" stopColor="#efc54f" />
            <stop offset="100%" stopColor="#be861c" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#8b611c" floodOpacity="0.18" />
          </filter>
          <path
            id="cornerLeaf"
            d="M0 0 C20 8, 26 30, 10 42 C-3 52, -20 36, -13 18 C-8 6, -1 2, 0 0 Z"
          />
          <g id="leafCluster">
            <g transform="translate(0 0)"><use href="#cornerLeaf" fill="#d49b3a" transform="rotate(-32 0 0) scale(0.95)" /></g>
            <g transform="translate(26 16)"><use href="#cornerLeaf" fill="#c7892f" transform="rotate(18 0 0) scale(0.88)" /></g>
            <g transform="translate(50 0)"><use href="#cornerLeaf" fill="#e4b452" transform="rotate(-8 0 0) scale(0.8)" /></g>
            <g transform="translate(76 20)"><use href="#cornerLeaf" fill="#b87822" transform="rotate(28 0 0) scale(0.76)" /></g>
            <g transform="translate(100 4)"><use href="#cornerLeaf" fill="#ddb14c" transform="rotate(10 0 0) scale(0.74)" /></g>
          </g>
        </defs>

        <rect x="20" y="20" width="1360" height="950" rx="18" fill="#fbf7ef" />
        <rect x="36" y="36" width="1328" height="918" rx="14" fill="none" stroke="url(#certificateGold)" strokeWidth="3" />
        <rect x="52" y="52" width="1296" height="886" rx="10" fill="none" stroke="#d9b063" strokeWidth="1.5" opacity="0.85" />

        <g opacity="0.95" filter="url(#softShadow)">
          <g transform="translate(48 48)"><use href="#leafCluster" /></g>
          <g transform="translate(1352 48) scale(-1 1)"><use href="#leafCluster" /></g>
          <g transform="translate(48 942) scale(1 -1)"><use href="#leafCluster" /></g>
          <g transform="translate(1352 942) scale(-1 -1)"><use href="#leafCluster" /></g>
        </g>

        <g opacity="0.9">
          <path d="M120 110 C210 80, 300 80, 390 110" fill="none" stroke="url(#certificateGold)" strokeWidth="3" />
          <path d="M1010 110 C1100 80, 1190 80, 1280 110" fill="none" stroke="url(#certificateGold)" strokeWidth="3" />
          <path d="M120 880 C210 910, 300 910, 390 880" fill="none" stroke="url(#certificateGold)" strokeWidth="3" />
          <path d="M1010 880 C1100 910, 1190 910, 1280 880" fill="none" stroke="url(#certificateGold)" strokeWidth="3" />
        </g>

        <g transform="translate(700 120)">
          <circle r="26" fill="#fff9df" stroke="url(#certificateGold)" strokeWidth="4" />
          <circle r="10" fill="url(#certificateGold)" />
          <path d="M0 -58 L10 -30 L38 -30 L16 -12 L26 16 L0 0 L-26 16 L-16 -12 L-38 -30 L-10 -30 Z" fill="url(#certificateGold)" opacity="0.9" />
        </g>

        <text x="700" y="220" textAnchor="middle" fill="#4d3116" fontFamily="Georgia, 'Times New Roman', serif" fontSize="86" fontWeight="700" letterSpacing="5">
          CERTIFICATE
        </text>
        <text x="700" y="274" textAnchor="middle" fill="#6f4c22" fontFamily="Georgia, 'Times New Roman', serif" fontSize="31" fontWeight="600" letterSpacing="8">
          OF COMPLETION
        </text>

        <path d="M420 326 H980" stroke="url(#certificateGold)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="420" cy="326" r="4.5" fill="url(#certificateGold)" />
        <circle cx="980" cy="326" r="4.5" fill="url(#certificateGold)" />

        <text x="700" y="385" textAnchor="middle" fill="#7a562c" fontFamily="Georgia, 'Times New Roman', serif" fontSize="25" fontWeight="500" letterSpacing="3">
          THIS CERTIFICATE IS PRESENTED TO
        </text>

        <text
          x="700"
          y="490"
          textAnchor="middle"
          fill="url(#certificateGold)"
          fontFamily="'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive"
          fontSize="92"
          fontWeight="500"
          style={{ filter: "drop-shadow(0px 2px 0px rgba(124,79,21,0.14))" }}
        >
          {userName}
        </text>

        <path d="M260 520 H1140" stroke="url(#certificateGold)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <circle cx="260" cy="520" r="3.5" fill="url(#certificateGold)" />
        <circle cx="1140" cy="520" r="3.5" fill="url(#certificateGold)" />

        <text x="700" y="582" textAnchor="middle" fill="#5e4220" fontFamily="Georgia, 'Times New Roman', serif" fontSize="25" letterSpacing="1.8">
          FOR SUCCESSFULLY COMPLETING COURSE
        </text>
        <text x="700" y="635" textAnchor="middle" fill="#2c5f9e" fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fontWeight="700" letterSpacing="1.4">
          {languageName}
        </text>
        <text x="700" y="680" textAnchor="middle" fill="#75512a" fontFamily="Georgia, 'Times New Roman', serif" fontSize="20" letterSpacing="1.5">
          THIS CERTIFIES A DEMONSTRATED MASTERY OF THE CODEQUEST CURRICULUM
        </text>

        <g transform="translate(700 760)">
          <circle cx="0" cy="0" r="66" fill="url(#sealGradient)" stroke="#d19a39" strokeWidth="6" />
          <circle cx="0" cy="0" r="50" fill="none" stroke="#fff3c9" strokeWidth="3" opacity="0.7" />
          <path d="M-18 22 L-10 98 L0 74 L10 98 L18 22" fill="url(#certificateRibbon)" />
          <path d="M18 22 L47 78 L20 70 L8 98" fill="url(#certificateRibbon)" />
          <path d="M-18 22 L-47 78 L-20 70 L-8 98" fill="url(#certificateRibbon)" />
        </g>

        {/* Signatures removed per design request */}

        <text x="700" y="900" textAnchor="middle" fill="#8c734f" fontFamily="Georgia, 'Times New Roman', serif" fontSize="17" letterSpacing="1.2">
          Issued on {issuedDate}
        </text>
      </svg>
    </div>
  )
}