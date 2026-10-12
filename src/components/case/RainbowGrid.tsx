import s from "./blocks.module.css";

// Rainbow sheet: one row per observation, one column per participant, a filled cell when we saw it happen.
const PALETTE = ["#ea9999", "#f9cb9c", "#ffe599", "#a2c4c9", "#a4c2f4", "#8e7cc3", "#c27ba0"];

export default function RainbowGrid({ people, groups }: {
  people: string[];
  groups: { title: string; rows: { label: string; hits: string[] }[] }[];
}) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.rainbow}>
        <table>
          <thead>
            <tr>
              <th />
              {people.map((p) => <th key={p} scope="col">{p}</th>)}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.title}>
              <tr className={s.rainbowGroup}><th colSpan={people.length + 1} scope="colgroup">{g.title}</th></tr>
              {g.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {people.map((p, i) => (
                    <td key={p}>
                      {r.hits.includes(p) && <span style={{ background: PALETTE[i % PALETTE.length] }} aria-label="observed" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </figure>
  );
}
