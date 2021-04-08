import last from 'lodash/last';

export default function generateDistribution(exp) {
  return exp.map(branches => {
    return branches.reduce((acc, branch) => {
      if (acc.length === 0) {
        acc.push({ min: 0, max: branch - 1 })
      } else {
        const prev = last(acc).max;
        acc.push({ min: prev + 1, max: prev + branch });
      }

      return acc;
    }, []);
  })
}
