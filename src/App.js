import React, { useCallback, useMemo, useRef, useState } from 'react';
import random from 'lodash/random';
import abTest from 'ab-test-result';

const conf = 0.05 / 2;

const useInput = (init) => {
  const [val, setVal] = useState(init);
  const onChange = useCallback((e) => {
    setVal(e.target.value);
  }, [setVal]);

  return [val, onChange];
}

const ranges = [
  0.025,
  0.03,
  0.04,
];

const Run = React.memo((props) => {
  const { percent, count, launches } = props.run;
  const experiments = useMemo(() => {
    const runs = [];
    for (let launchN = 0; launchN < launches; launchN++) {
      const branches = [
        { positive: 0, negative: 0 },
        { positive: 0, negative: 0 },
      ];

      const positiveCount = count * percent / 100;

      for (let i = 0; i < positiveCount; i++) {
        branches[random(0, 1)].positive += 1;
      }

      const negativeCount = count - positiveCount;

      for (let i = 0; i < negativeCount; i++) {
        branches[random(0, 1)].negative += 1;
      }

      runs.push(branches);
    }

    return runs;
  }, [percent, count]);

  const pValues = useMemo(() => {
    return experiments.map((experiment) => {
      const data = {
        controlVisits: experiment[0].negative + experiment[0].positive,
        controlConversions: experiment[0].positive,
        challengerVisits: experiment[1].negative + experiment[1].positive,
        challengerConversions: experiment[1].positive,
      };
      const statistic = abTest.calcResult(data, conf);
      const pValue = 1 - statistic.statistics.pValue;
      return pValue
    });
  }, [experiments])

  const pValuesDistribution = useMemo(() => {
    const distribution = ranges.reduce((acc, range) => {
      let countInRange = 0;

      pValues.forEach((pVal) => {
        if (pVal <= range || pVal >= 1 - range) {
          countInRange += 1;
        }
      })

      acc[range] = (countInRange / launches * 100).toFixed(2) + '%';

      return acc;
    }, {});

    return distribution;
  }, [pValues, launches]);

  console.log(pValuesDistribution);

  return null;
})

export default function App() {
  const runIndex = useRef(0);
  const [percent, onChangePercent] = useInput(3);
  const [count, onChangeCount] = useInput(100000);
  const [launches, onChangeLaunches] = useInput(1000);
  const [database, setDb] = useState([]);

  const onClickRun = useCallback(() => {
    setDb([
      ...database,
      {
        id: runIndex.current,
        percent,
        count,
        launches,
      },
    ]);
    runIndex.current++;
  }, [database, setDb, percent, count, launches]);

  return (
    <>
      <div>
        <div><input type="text" onChange={onChangePercent} value={percent} /> %</div>
        <div><input type="text" onChange={onChangeCount} value={count} /> count</div>
        <div><input type="text" onChange={onChangeLaunches} value={launches} /> launches</div>
        <button onClick={onClickRun}>Run</button>
      </div>
      {database.map((run) => (
        <Run key={run.id} run={run} />
      ))}
    </>
  );
}
