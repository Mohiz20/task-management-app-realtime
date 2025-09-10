import { createGlobalStyle, keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

export default createGlobalStyle`
  :root{
    --bg:#0b0f14; --card:#121821; --muted:#93a1b0; --text:#e6eef8;
    --primary:#62a1ff; --danger:#ff6b6b; --success:#58d38c;
    --ring:#2d4463; --shadow:0 8px 20px rgba(0,0,0,.25);
    --border:#233244; --hover:#1f2a36;
  }

  [data-theme="light"] {
    --bg:#ffffff; --card:#f8fafc; --muted:#64748b; --text:#0f172a;
    --primary:#3b82f6; --danger:#ef4444; --success:#22c55e;
    --ring:#cbd5e1; --shadow:0 8px 20px rgba(0,0,0,.1);
    --border:#e2e8f0; --hover:#f1f5f9;
  }

  *{box-sizing:border-box}
  html,body,#root{height:100%}
  body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;background:var(--bg);color:var(--text);transition:background-color 0.3s ease, color 0.3s ease;}
  a{color:inherit;text-decoration:none}
  button{font:inherit}
  input,select,textarea{font:inherit}

  /* Interaction defaults */
  :where(button,[role="button"],.button){ cursor: pointer; }
  :where(button,input,select,textarea){
    transition: border-color .2s ease, box-shadow .2s ease,
                background-color .2s ease, color .2s ease,
                transform .12s ease;
  }
  :where(input,select,textarea):focus-visible{
    outline: none;
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 40%, transparent);
  }

  /* Subtle appear animation helper */
  .appear{ animation: ${fadeIn} .25s ease both; }

  @media (prefers-reduced-motion: reduce){
    *{ animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important }
  }
`
