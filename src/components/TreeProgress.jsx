// src/components/TreeProgress.jsx

import { AnimatePresence, motion } from 'framer-motion'

const STAGES = [
  { min: 0,    label: 'Seed 🌱'           },
  { min: 0.25, label: 'Sprout 🌿'         },
  { min: 0.50, label: 'Small Tree 🌳'     },
  { min: 0.75, label: 'Blooming Tree 🌸'  },
  { min: 1.00, label: 'Full Sakura 🌸🌸' },
]

function getStageIndex(progress) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (progress >= STAGES[i].min) return i
  }
  return 0
}

// ── Shared entry / exit variants ──────────────────────────────────────────────

const ctnV = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
  exit:   { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}
const drawV = {
  hidden: { pathLength: 0, opacity: 0 },
  show:   { pathLength: 1, opacity: 1, transition: { duration: 0.42, ease: 'easeInOut' } },
  exit:   { pathLength: 0, opacity: 0, transition: { duration: 0.17, ease: 'easeIn'   } },
}
const bloomV = {
  hidden: { scale: 0, opacity: 0 },
  show:   { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 340, damping: 12, mass: 0.55 } },
  exit:   { scale: 0, opacity: 0, transition: { duration: 0.13, ease: 'easeIn' } },
}
const popV = {
  hidden: { scale: 0, opacity: 0, rotate: -25 },
  show:   { scale: 1, opacity: 1, rotate:   0, transition: { type: 'spring', stiffness: 420, damping: 11 } },
  exit:   { scale: 0, opacity: 0, rotate:  25, transition: { duration: 0.11 } },
}
const fadeV = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.22 } },
  exit:   { opacity: 0, transition: { duration: 0.11 } },
}

const tb = (o = 'center') => ({ style: { transformBox: 'fill-box', transformOrigin: o } })

// ── All idle CSS keyframes ─────────────────────────────────────────────────────

const KF = `
  @keyframes seed-beat   { 0%,100%{transform:scale(1)}35%{transform:scale(1.14)}55%{transform:scale(0.94)}72%{transform:scale(1.07)} }
  @keyframes crack-jolt  { 0%,80%,100%{transform:rotate(0deg) translateX(0)}85%{transform:rotate(-5deg) translateX(-1.5px)}93%{transform:rotate(5deg) translateX(1.5px)} }
  @keyframes soil-burst  { 0%{transform:translateY(0) scale(1.3);opacity:0}14%{opacity:1}100%{transform:translateY(-36px) scale(0.2);opacity:0} }
  @keyframes sparkle     { 0%,100%{transform:scale(0) rotate(0deg);opacity:0}45%{transform:scale(1.5) rotate(170deg);opacity:1}78%{transform:scale(0.6) rotate(300deg);opacity:0.4} }
  @keyframes stem-sway   { 0%,100%{transform:rotate(-6deg)}50%{transform:rotate(7deg)} }
  @keyframes lf-flutter  { 0%,100%{transform:rotate(-35deg) scaleY(1)}50%{transform:rotate(-20deg) scaleY(0.78)} }
  @keyframes rf-flutter  { 0%,100%{transform:rotate(35deg) scaleY(1)}50%{transform:rotate(20deg) scaleY(0.78)} }
  @keyframes bud-throb   { 0%,100%{transform:scale(1)}38%{transform:scale(1.26)}62%{transform:scale(0.92)} }
  @keyframes trunk-rock  { 0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(3deg)} }
  @keyframes crown-drift { 0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(4deg) translateY(-6px)} }
  @keyframes blob-a      { 0%,100%{transform:scale(1)}50%{transform:scale(1.1)} }
  @keyframes blob-b      { 0%,100%{transform:scale(1.08)}50%{transform:scale(0.92)} }
  @keyframes tree-sway   { 0%,100%{transform:rotate(-1.8deg)}50%{transform:rotate(2.2deg)} }
  @keyframes bloom-rise  { 0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.035) translateY(-5px)} }
  @keyframes clust-a     { 0%,100%{transform:scale(1)}45%{transform:scale(1.09)}72%{transform:scale(0.96)} }
  @keyframes clust-b     { 0%,100%{transform:scale(1.07)}45%{transform:scale(0.91)}72%{transform:scale(1.08)} }
  @keyframes star-wink   { 0%,100%{transform:scale(0) rotate(-20deg);opacity:0}50%{transform:scale(1.3) rotate(25deg);opacity:1} }
`

// ── SVG root wrapper ───────────────────────────────────────────────────────────

const SVGRoot = ({ viewBox, children }) => (
  <motion.svg
    viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full"
    variants={ctnV} initial="hidden" animate="show" exit="exit"
  >
    <defs><style>{KF}</style></defs>
    {children}
  </motion.svg>
)

// ── Stage 0 · Seed 🌱 ─────────────────────────────────────────────────────────

function SeedSVG() {
  return (
    <SVGRoot viewBox="0 0 120 140">
      <motion.ellipse cx="60" cy="118" rx="38" ry="10" fill="#c8a97a" opacity="0.5" variants={fadeV} />

      {[{cx:45,cy:114,r:2},{cx:57,cy:117,r:1.5},{cx:68,cy:113,r:2.5},{cx:74,cy:116,r:1.8},{cx:52,cy:115,r:1.5}]
        .map((p,i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r}
            fill={i%2===0?'#c8a060':'#ddb870'}
            style={{animation:`soil-burst ${1.7+i*0.14}s ${1.2+i*0.55}s ease-out infinite`,transformBox:'fill-box',transformOrigin:'center'}} />
        ))}

      <motion.ellipse cx="60" cy="100" rx="18" ry="22" fill="#8B5E3C" variants={bloomV} {...tb('center bottom')}
        style={{animation:'seed-beat 1.35s 0.8s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
      <motion.ellipse cx="53" cy="90" rx="5" ry="7" fill="#a87a52" opacity="0.6" variants={fadeV} />

      <motion.circle cx="60" cy="100" r="25" fill="none" stroke="#d4a050" strokeWidth="1.8" variants={fadeV}
        style={{animation:'seed-beat 1.35s 0.8s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center',opacity:0.28}} />

      {[{x:32,y:86,s:'11',d:'2.0s',del:'1.5s'},{x:81,y:81,s:'9',d:'2.3s',del:'2.2s'},{x:70,y:70,s:'8',d:'2.1s',del:'3.0s'},{x:44,y:72,s:'9',d:'1.9s',del:'3.8s'}].map((s,i)=>(
        <motion.text key={i} x={s.x} y={s.y} fontSize={s.s} fill="#f0c060" textAnchor="middle"
          variants={popV} {...tb('center')}
          style={{animation:`sparkle ${s.d} ${s.del} ease-in-out infinite`,transformBox:'fill-box',transformOrigin:'center'}}>✦</motion.text>
      ))}

      <motion.path d="M60 80 Q63 73 60 66" stroke="#5a3a1a" strokeWidth="1.5" strokeLinecap="round"
        variants={drawV}
        style={{animation:'crack-jolt 2.6s 1.4s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'60px 73px'}} />
      <motion.path d="M60 66 Q56 60 59 54" stroke="#4a7c59" strokeWidth="1.5" strokeLinecap="round"
        variants={drawV}
        style={{animation:'crack-jolt 2.6s 1.9s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'60px 60px'}} />

      <motion.ellipse cx="57" cy="52" rx="4" ry="6" fill="#6aab7a" transform="rotate(-20 57 52)"
        variants={bloomV} {...tb('center bottom')}
        style={{animation:'lf-flutter 1.85s 1.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'57px 58px'}} />
    </SVGRoot>
  )
}

// ── Stage 1 · Sprout 🌿 ───────────────────────────────────────────────────────

function SproutSVG() {
  return (
    <SVGRoot viewBox="0 0 120 160">
      <motion.ellipse cx="60" cy="138" rx="38" ry="10" fill="#c8a97a" opacity="0.5" variants={fadeV} />

      <motion.path d="M60 130 Q58 105 60 80" stroke="#5a8a4a" strokeWidth="4" strokeLinecap="round"
        variants={drawV}
        style={{animation:'stem-sway 2.0s 0.9s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'60px 130px'}} />

      <motion.ellipse cx="44" cy="100" rx="16" ry="8" fill="#6aab5a" transform="rotate(-35 44 100)"
        variants={bloomV} {...tb('right center')}
        style={{animation:'lf-flutter 1.8s 1.1s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'56px 100px'}} />
      <motion.path d="M55 107 Q49 101 40 96" stroke="#4a8a3a" strokeWidth="1" strokeLinecap="round" opacity="0.6" variants={fadeV} />

      <motion.ellipse cx="76" cy="96" rx="16" ry="8" fill="#7ec46a" transform="rotate(35 76 96)"
        variants={bloomV} {...tb('left center')}
        style={{animation:'rf-flutter 1.8s 1.65s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'64px 96px'}} />
      <motion.path d="M65 103 Q71 97 79 94" stroke="#4a8a3a" strokeWidth="1" strokeLinecap="round" opacity="0.6" variants={fadeV} />

      <motion.ellipse cx="60" cy="76" rx="8" ry="10" fill="#f9a8c2" variants={bloomV} {...tb('center bottom')}
        style={{animation:'bud-throb 1.15s 0.85s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'60px 76px'}} />
      <motion.ellipse cx="60" cy="72" rx="5" ry="6" fill="#f4c6d6" variants={bloomV} {...tb('center bottom')}
        style={{animation:'bud-throb 1.15s 1.15s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'60px 72px'}} />

      {[{x:70,y:66,s:'10',d:'1.8s',del:'1.4s'},{x:47,y:63,s:'8',d:'2.1s',del:'2.2s'},{x:67,y:57,s:'7',d:'1.9s',del:'3.1s'}].map((s,i)=>(
        <motion.text key={i} x={s.x} y={s.y} fontSize={s.s} fill="#ffb0d0" textAnchor="middle"
          variants={popV} {...tb('center')}
          style={{animation:`sparkle ${s.d} ${s.del} ease-in-out infinite`,transformBox:'fill-box',transformOrigin:'center'}}>✦</motion.text>
      ))}
    </SVGRoot>
  )
}

// ── Stage 2 · Small Tree 🌳 ───────────────────────────────────────────────────

function SmallTreeSVG() {
  return (
    <SVGRoot viewBox="0 0 160 200">
      <motion.ellipse cx="80" cy="182" rx="48" ry="12" fill="#c8a97a" opacity="0.5" variants={fadeV} />

      <motion.path d="M80 178 Q76 150 78 120" stroke="#7a5230" strokeWidth="10" strokeLinecap="round"
        variants={drawV}
        style={{animation:'trunk-rock 3.2s 1.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'80px 178px'}} />
      <motion.path d="M78 138 Q58 128 44 118" stroke="#7a5230" strokeWidth="6" strokeLinecap="round"
        variants={drawV}
        style={{animation:'trunk-rock 3.0s 1.6s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'78px 138px'}} />
      <motion.path d="M79 132 Q100 122 114 112" stroke="#8a6240" strokeWidth="6" strokeLinecap="round"
        variants={drawV}
        style={{animation:'trunk-rock 3.0s 2.2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'79px 132px'}} />

      <g style={{animation:'crown-drift 3.8s 1.2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'80px 140px'}}>
        <motion.ellipse cx="80" cy="96" rx="50" ry="44" fill="#aad49a" variants={bloomV} {...tb('center bottom')} />
        <motion.circle cx="60" cy="82" r="18" fill="#f9b8ce" opacity="0.75" variants={bloomV} {...tb('center')}
          style={{animation:'blob-a 2.5s 1.3s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
        <motion.circle cx="98" cy="78" r="16" fill="#f4c6d6" opacity="0.7"  variants={bloomV} {...tb('center')}
          style={{animation:'blob-b 2.3s 1.9s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
        <motion.circle cx="80" cy="68" r="14" fill="#fddde8" opacity="0.8"  variants={bloomV} {...tb('center')}
          style={{animation:'blob-a 2.1s 2.5s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
      </g>
    </SVGRoot>
  )
}

// ── Stage 3 · Blooming Tree 🌸 ────────────────────────────────────────────────

function BloomingSVG() {
  return (
    <SVGRoot viewBox="0 0 200 230">
      <motion.ellipse cx="100" cy="212" rx="60" ry="14" fill="#c8a97a" opacity="0.5" variants={fadeV} />

      <g style={{animation:'tree-sway 4.2s 1.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'100px 212px'}}>
        <motion.path d="M100 208 Q94 175 97 140" stroke="#7a5230" strokeWidth="13" strokeLinecap="round" variants={drawV} />
        <motion.path d="M97 158 Q70 145 48 128"  stroke="#7a5230" strokeWidth="7"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M98 150 Q128 138 152 122" stroke="#8a6240" strokeWidth="7"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M99 144 Q102 125 100 108" stroke="#7a5230" strokeWidth="6"  strokeLinecap="round" variants={drawV} />

        <g style={{animation:'bloom-rise 4.8s 1.2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'100px 140px'}}>
          <motion.ellipse cx="100" cy="88" rx="70" ry="56" fill="#f9c8d8" opacity="0.6" variants={bloomV} {...tb('center bottom')} />
          <motion.circle cx="58"  cy="105" r="32" fill="#f4a8c2" opacity="0.85" variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.7s 1.4s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="142" cy="100" r="30" fill="#f9b8ce" opacity="0.80" variants={bloomV} {...tb('center')}
            style={{animation:'clust-b 3.0s 2.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="100" cy="74"  r="34" fill="#fddde8" opacity="0.90" variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.5s 2.5s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="72"  cy="72"  r="22" fill="#f9a8c2" opacity="0.80" variants={bloomV} {...tb('center')}
            style={{animation:'clust-b 2.2s 3.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="128" cy="68"  r="22" fill="#f4c6d6" opacity="0.75" variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.4s 3.5s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
        </g>
      </g>

      {[{x:30,y:115,s:'12',d:'2.1s',del:'1.8s'},{x:168,y:108,s:'10',d:'2.5s',del:'2.7s'},{x:100,y:40,s:'13',d:'2.0s',del:'3.5s'}].map((s,i)=>(
        <motion.text key={i} x={s.x} y={s.y} fontSize={s.s} fill="#f9a8c2" textAnchor="middle"
          variants={popV} {...tb('center')}
          style={{animation:`star-wink ${s.d} ${s.del} ease-in-out infinite`,transformBox:'fill-box',transformOrigin:'center'}}>✦</motion.text>
      ))}
    </SVGRoot>
  )
}

// ── Stage 4 · Full Sakura 🌸🌸 ────────────────────────────────────────────────

function FullSVG() {
  return (
    <SVGRoot viewBox="0 0 220 250">
      <motion.ellipse cx="110" cy="232" rx="68" ry="14" fill="#c8a97a" opacity="0.5" variants={fadeV} />

      <g style={{animation:'tree-sway 5.0s 1.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'110px 232px'}}>
        <motion.path d="M110 228 Q103 192 106 152" stroke="#7a5230" strokeWidth="15" strokeLinecap="round" variants={drawV} />
        <motion.path d="M106 172 Q74 158  44 138"  stroke="#7a5230" strokeWidth="8"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M107 162 Q82  148  62 130"  stroke="#8a6240" strokeWidth="7"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M108 158 Q136 144 158 126"  stroke="#8a6240" strokeWidth="7"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M109 168 Q143 155 172 138"  stroke="#7a5230" strokeWidth="8"  strokeLinecap="round" variants={drawV} />
        <motion.path d="M108 154 Q112 132 110 112"  stroke="#7a5230" strokeWidth="6"  strokeLinecap="round" variants={drawV} />

        <g style={{animation:'bloom-rise 5.5s 1.2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'110px 150px'}}>
          <motion.ellipse cx="110" cy="90"  rx="88" ry="70" fill="#fce8f0" opacity="0.55" variants={bloomV} {...tb('center bottom')} />
          <motion.circle cx="110" cy="62" r="42" fill="#fddde8" opacity="0.9"  variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 3.2s 1.4s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="64"  cy="88" r="36" fill="#f9b8ce" opacity="0.88" variants={bloomV} {...tb('center')}
            style={{animation:'clust-b 3.0s 2.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="156" cy="84" r="36" fill="#f4a8c2" opacity="0.85" variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.8s 2.5s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="88"  cy="58" r="28" fill="#f9c8d8" opacity="0.9"  variants={bloomV} {...tb('center')}
            style={{animation:'clust-b 2.6s 3.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="132" cy="55" r="28" fill="#f9b0ca" opacity="0.88" variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.5s 3.4s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="40"  cy="108" r="26" fill="#f4c6d6" opacity="0.8"  variants={bloomV} {...tb('center')}
            style={{animation:'clust-b 2.3s 3.8s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="180" cy="104" r="26" fill="#f9a8c2" opacity="0.8"  variants={bloomV} {...tb('center')}
            style={{animation:'clust-a 2.2s 4.2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />

          <motion.circle cx="110" cy="44" r="18" fill="#fff0f5" opacity="0.95" variants={bloomV} {...tb('center')} />
          <motion.circle cx="90"  cy="46" r="5"  fill="#fff"    opacity="0.9"  variants={bloomV} {...tb('center')}
            style={{animation:'star-wink 2.5s 2.0s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="84"  cy="50" r="4"  fill="#fce4ee" opacity="0.85" variants={bloomV} {...tb('center')} />
          <motion.circle cx="96"  cy="50" r="4"  fill="#fce4ee" opacity="0.85" variants={bloomV} {...tb('center')} />
          <motion.circle cx="130" cy="42" r="5"  fill="#fff"    opacity="0.9"  variants={bloomV} {...tb('center')}
            style={{animation:'star-wink 2.3s 2.8s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'center'}} />
          <motion.circle cx="124" cy="46" r="4"  fill="#fce4ee" opacity="0.85" variants={bloomV} {...tb('center')} />
          <motion.circle cx="136" cy="46" r="4"  fill="#fce4ee" opacity="0.85" variants={bloomV} {...tb('center')} />
        </g>
      </g>

      {[{x:22,y:130,s:'13',d:'2.2s',del:'1.7s'},{x:198,y:118,s:'11',d:'2.6s',del:'2.7s'},{x:110,y:20,s:'15',d:'2.0s',del:'3.4s'},{x:50,y:172,s:'10',d:'2.4s',del:'4.1s'},{x:172,y:168,s:'9',d:'2.1s',del:'4.9s'}].map((s,i)=>(
        <motion.text key={i} x={s.x} y={s.y} fontSize={s.s} fill="#f9a8c2" textAnchor="middle"
          variants={popV} {...tb('center')}
          style={{animation:`star-wink ${s.d} ${s.del} ease-in-out infinite`,transformBox:'fill-box',transformOrigin:'center'}}>✦</motion.text>
      ))}
    </SVGRoot>
  )
}

// ── Stage mapping ─────────────────────────────────────────────────────────────

const STAGE_SVGS = [SeedSVG, SproutSVG, SmallTreeSVG, BloomingSVG, FullSVG]
const STAGE_KEYS = ['seed', 'sprout', 'small', 'blooming', 'full']

// ── Falling petals (stage 2 = few small, 3 = medium, 4 = abundant) ────────────

const PETAL_CFG = {
  2: [
    { left:'28%', delay:2.0, dur:2.7, anim:'petal-a', w:7,  h:5  },
    { left:'60%', delay:3.2, dur:3.1, anim:'petal-b', w:6,  h:4  },
    { left:'74%', delay:4.3, dur:2.9, anim:'petal-c', w:7,  h:5  },
  ],
  3: [
    { left:'7%',  delay:0,    dur:3.2, anim:'petal-a', w:10, h:7 },
    { left:'25%', delay:0.8,  dur:2.8, anim:'petal-b', w:9,  h:6 },
    { left:'45%', delay:1.6,  dur:3.5, anim:'petal-c', w:10, h:7 },
    { left:'65%', delay:0.4,  dur:2.6, anim:'petal-a', w:11, h:7 },
    { left:'82%', delay:1.3,  dur:3.1, anim:'petal-b', w:9,  h:6 },
    { left:'53%', delay:2.2,  dur:2.9, anim:'petal-c', w:10, h:7 },
  ],
  4: [
    { left:'4%',  delay:0,    dur:3.0, anim:'petal-a', w:12, h:8 },
    { left:'16%', delay:0.55, dur:2.7, anim:'petal-b', w:10, h:6 },
    { left:'30%', delay:1.25, dur:3.4, anim:'petal-c', w:11, h:7 },
    { left:'44%', delay:0.3,  dur:2.5, anim:'petal-a', w:9,  h:6 },
    { left:'57%', delay:1.85, dur:3.2, anim:'petal-b', w:12, h:8 },
    { left:'70%', delay:0.85, dur:2.8, anim:'petal-c', w:10, h:6 },
    { left:'84%', delay:2.35, dur:3.1, anim:'petal-a', w:11, h:7 },
    { left:'38%', delay:3.0,  dur:2.9, anim:'petal-b', w:9,  h:6 },
    { left:'67%', delay:3.6,  dur:3.3, anim:'petal-c', w:10, h:7 },
  ],
}
const PETAL_COLORS = ['#f9b8ce','#fddde8','#fce4ee']

function FallingPetals({ stageIdx }) {
  const cfg = PETAL_CFG[stageIdx] || []
  if (!cfg.length) return null
  return (
    <>
      <style>{`
        @keyframes petal-a{0%{transform:translateY(-12px) translateX(0) rotate(0deg);opacity:0}8%{opacity:.9}55%{transform:translateY(95px) translateX(16px) rotate(230deg);opacity:.7}100%{transform:translateY(210px) translateX(-8px) rotate(420deg);opacity:0}}
        @keyframes petal-b{0%{transform:translateY(-12px) translateX(0) rotate(0deg);opacity:0}8%{opacity:.9}55%{transform:translateY(85px) translateX(-18px) rotate(-200deg);opacity:.7}100%{transform:translateY(200px) translateX(10px) rotate(-390deg);opacity:0}}
        @keyframes petal-c{0%{transform:translateY(-12px) translateX(4px) rotate(0deg);opacity:0}8%{opacity:.85}55%{transform:translateY(80px) translateX(-4px) rotate(130deg);opacity:.65}100%{transform:translateY(195px) translateX(14px) rotate(320deg);opacity:0}}
      `}</style>
      {cfg.map((p,i) => (
        <span key={i} style={{
          position:      'absolute',
          top:           4,
          left:          p.left,
          width:         p.w,
          height:        p.h,
          borderRadius:  '50%',
          background:    PETAL_COLORS[i % 3],
          animation:     `${p.anim} ${p.dur}s ${p.delay}s ease-in infinite`,
          pointerEvents: 'none',
          zIndex:        10,
        }} />
      ))}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TreeProgress({ currentAmount, targetAmount }) {
  const progress  = targetAmount > 0 ? currentAmount / targetAmount : 0
  const clamped   = Math.min(progress, 1)
  const stageIdx  = getStageIndex(clamped)
  const stage     = STAGES[stageIdx]
  const pct       = Math.round(clamped * 100)
  const StageComp = STAGE_SVGS[stageIdx]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 overflow-hidden">
        {stageIdx >= 2 && <FallingPetals stageIdx={stageIdx} />}

        <AnimatePresence mode="wait">
          <StageComp key={STAGE_KEYS[stageIdx]} />
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stage.label}
          className="text-sm font-semibold text-sakura-500"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {stage.label}
        </motion.p>
      </AnimatePresence>

      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>₱{currentAmount.toLocaleString()} saved</span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 bg-sakura-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sakura-400 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">
          Goal: ₱{targetAmount.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
