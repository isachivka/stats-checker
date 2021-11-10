import { useMemo, useState, useCallback } from 'react';
import { v4 } from 'uuid';
import Generator from './Generator';

function _App() {
  const [runner, toggle] = useState([]);
  const [count, setCount] = useState(100);
  const [experimentsText, setExperiments] = useState(`[

[50, 50]

]`);

  const experiments = useMemo(() => {
    try {
      return JSON.parse(experimentsText);
    } catch (e) {
      return [[100]];
    }
  }, [experimentsText]);

  const onChange = useCallback((e) => {
    setCount(+e.target.value);
  }, [setCount])

  const onChangeExp = useCallback((e) => {
    setExperiments(e.target.value);
  }, [setExperiments]);

  const onRun = useCallback(() => {
    toggle([{ count, experiments, id: v4() }, ...runner]);
  }, [toggle, runner, count, experiments]);

  const onClear = useCallback(() => {
    toggle([]);
  });

  const onRerun = useCallback(() => {
    toggle([{ count, experiments, id: v4() }]);
  })

  // const events = useMemo(() => {
  //   return generateEvent(count, config);
  // }, [count, experiments]);
  //
  // const exp = useMemo(() => {
  //   return generateDistribution(experiments);
  // }, [experiments]);
  //
  // const allocation = useMemo(() => {
  //   return allocateEvents(exp, events);
  // }, [exp, events]);
  //
  // const table = useMemo(() => {
  //   return allocation;
  // }, [allocation]);

  return (
    <>
      <div>
        <input type="text" value={count} onChange={onChange} />
      </div>
      <div>
        <textarea value={experimentsText} onChange={onChangeExp} />
      </div>
      <div>
        <button onClick={onRun}>run</button>
        <button onClick={onClear}>clear</button>
        <button onClick={onRerun}>rerun</button>
      </div>

      <hr />

      <table>
        <tbody>
          {runner.map(run => (
            <Generator count={run.count} config={run.experiments} key={run.id} id={run.id} />
          ))}
        </tbody>
      </table>

      {/*<table>*/}
      {/*  <tbody>*/}
      {/*    <tr>*/}
      {/*      <td>%</td>*/}
      {/*      <td>count</td>*/}
      {/*      {config.map((chance) => (*/}
      {/*        <td key={chance}>event ({chance}%)</td>*/}
      {/*      ))}*/}
      {/*    </tr>*/}
      {/*    {allocation.map((experiment, i) => (*/}
      {/*      <>*/}
      {/*        <tr><td colSpan={4}><hr/></td></tr>*/}
      {/*        {experiment.map((branchEvents, k) => (*/}
      {/*          <Experiment*/}
      {/*            index={k}*/}
      {/*            experiment={experiment}*/}
      {/*            events={branchEvents}*/}
      {/*            exp={experiments[i][k]}*/}
      {/*          />*/}
      {/*        ))}*/}
      {/*      </>*/}
      {/*    ))}*/}
      {/*  </tbody>*/}
      {/*</table>*/}
    </>
  );
}

export default _App;
