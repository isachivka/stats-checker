import abTest from 'ab-test-result';
import BigNumber from 'bignumber.js';

// function calcConfidenceCorrection(test) {
//   let confidence = test.challengerVisits / (test.challengerVisits + test.controlVisits);
//   return confidence;
// }

// https://stackoverflow.com/questions/8816729/javascript-equivalent-for-inverse-normal-function-eg-excels-normsinv-or-nor
function NormSInv(p) {
  var a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
  var a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
  var b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
  var b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03;
  var c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
  var c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03;
  var d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;
  var p_low = 0.02425, p_high = 1 - p_low;
  var q, r;
  var retVal;
  if ((p < 0) || (p > 1))
  {
    alert("NormSInv: Argument out of range.");
    retVal = 0;
  }
  else if (p < p_low)
  {
    q = Math.sqrt(-2 * Math.log(p));
    retVal = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  else if (p <= p_high)
  {
    q = p - 0.5;
    r = q * q;
    retVal = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  }
  else
  {
    q = Math.sqrt(-2 * Math.log(1 - p));
    retVal = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  return retVal;
}

window.NormSInv = NormSInv;

function calcSize(test, confidence) {
  const A_visits = new BigNumber(test.controlVisits);
  const A_conversions = new BigNumber(test.controlConversions);
  const B_visits = new BigNumber(test.challengerVisits);
  const B_conversions = new BigNumber(test.challengerConversions);
  const Z_score = NormSInv(1 - confidence);
  const avgRate = (A_conversions + B_conversions) / (A_visits + B_visits);
  const sizeProportion = test.controlVisits / test.challengerVisits;
  const sampleSize = ( (((avgRate*(1 - avgRate)*(1 + sizeProportion)) ** 0.5) * Z_score) ** 2) / ((A_conversions/A_visits - B_conversions/B_visits) ** 2);
  const sizeMultiplier = Math.max(0, (sampleSize - B_visits)/B_visits);
  return {
    sampleSize,
    sizeMultiplier
  }
}

function calcConfidenceIntervals(test, confidence) {
  const A_visits = new BigNumber(test.controlVisits);
  const A_conversions = new BigNumber(test.controlConversions);
  const B_visits = new BigNumber(test.challengerVisits);
  const B_conversions = new BigNumber(test.challengerConversions);
  const Z_score = NormSInv(1 - confidence);
  const A_lowlim = (A_conversions / A_visits) - Z_score * (A_conversions * (A_visits - A_conversions) / A_visits ** 3) ** 0.5;
  const A_uplim = (A_conversions / A_visits) + Z_score * (A_conversions * (A_visits - A_conversions) / A_visits ** 3) ** 0.5;
  const B_lowlim = (B_conversions / B_visits) - Z_score * (B_conversions * (B_visits - B_conversions) / B_visits ** 3) ** 0.5;
  const B_uplim = (B_conversions / B_visits) + Z_score * (B_conversions * (B_visits - B_conversions) / B_visits ** 3) ** 0.5;
  return {
    A_lowlim,
    A_uplim,
    B_lowlim,
    B_uplim,
    Overlap : Math.max(0, Math.min(A_uplim, B_uplim) - Math.max(A_lowlim, B_lowlim)) / Math.min(A_uplim - A_lowlim, B_uplim - B_lowlim)
  }
}

export default function generatePValues(table) {
  return table.map((experiment) => {
    return experiment.map((branchEvents, i) => {
      const otherBranches = experiment.filter((_, k) => k !== i);
      const otherBranchesSum = {
        total: otherBranches.reduce((acc, branch) => acc + branch.total, 0),
        stats: otherBranches.reduce((acc, branch) => {
          if (!acc) {
            return branch.stats;
          }

          return acc.map((stat, i) => stat + branch.stats[i]);
        }, undefined),
      };
      return {
        ...branchEvents,
        stats: branchEvents.stats.map((stat, j) => {
          const data = {
            controlVisits: otherBranchesSum.total,
            controlConversions: otherBranchesSum.stats[j],
            challengerVisits: branchEvents.total,
            challengerConversions: stat,
          };
          const conf = 0.05 / experiment.length;
          const size = calcSize(data, conf);
          const intervals = calcConfidenceIntervals(data, conf);
          const statistic = abTest.calcResult(data, conf);
          return {
            count: stat,
            statistic: {
              ...statistic,
              statistics: {
                ...statistic.statistics,
                pValue: 1 - statistic.statistics.pValue
              },
              size,
              intervals,
              conf,
            },
          };
        }),
      }
    })
  })
}
