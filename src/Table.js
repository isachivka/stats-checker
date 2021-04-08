import round from 'lodash/round';

export default function Table(props) {
  const { table } = props;

  return (
    <>
      {table.map(experiment => (
        <>
          <tr><td colSpan={7}><hr/></td></tr>
          {experiment.map(branch => (
            <tr>
              <td>{branch.total}</td>
              {branch.stats.map((stat) => (
                <>
                  <td>
                    {round(stat.count / branch.total * 100, 2)}%
                    <br/>
                    ({stat.count})
                  </td>
                  <td>
                    p: {round(stat.statistic.statistics.pValue, 2)} vs {stat.statistic.conf}<br/>
                    Required sample size {round(stat.statistic.size.sampleSize, 2)}; <br/>
                    needs x{round(stat.statistic.size.sizeMultiplier, 2)} more time
                  </td>
                  <td>
                    {round(stat.statistic.intervals.A_lowlim * 100, 2)}%-{round(stat.statistic.intervals.A_uplim * 100, 2)}% <br/>
                    {round(stat.statistic.intervals.B_lowlim * 100, 2)}%-{round(stat.statistic.intervals.B_uplim * 100, 2)}% <br/>
                    overlap: {round(stat.statistic.intervals.Overlap * 100, 2)}%
                  </td>
                </>
              ))}
            </tr>
          ))}
        </>
      ))}
    </>
  )
}
