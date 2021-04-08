export default function generateTable(allocation, cRate) {
  return allocation.map(experiment => {
    return experiment.map(branchEvents => {
      return {
        total: branchEvents.length,
        stats: cRate.map((_, i) => {
          return branchEvents.filter(event => event[i] === true).length;
        }),
      };
    });
  });
}
