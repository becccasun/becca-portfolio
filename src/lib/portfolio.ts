// Where Rebecca's portfolio rebuild lives (~/rebecca-portfolio). Its case studies and
// Play page are linked from here; point NEXT_PUBLIC_PORTFOLIO_URL at the deployed site
// when it ships.
export const PORTFOLIO_URL = (process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3008").replace(/\/$/, "");
