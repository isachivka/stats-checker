import last from 'lodash/last';
import random from 'lodash/random';
import findIndex from 'lodash/findIndex';
import inRange from 'lodash/inRange';

function getBranchIndexByChance(r, branches) {
  return findIndex(branches, (branch) => {
    return inRange(r, branch.min, branch.max + 1);
  })
}

export default  function allocateEvents(distribution, events) {
  return distribution.map((experiment) => {
    const expBranches = [...new Array(experiment.length)].map(() => []);
    events.forEach((event) => {
      const max = last(experiment).max;
      const r = random(0, max);
      const index = getBranchIndexByChance(r, experiment);
      expBranches[index].push(event);
    });
    return expBranches;
  })
}
