import { memo } from 'react';
import generateEvent from './generateEvents';
import generateDistribution from './generateDistribution';
import allocateEvents from './alocateEvents';
import generateTable from './generateTable';
import generatePValues from './generatePValues';
import Table from './Table';

const cRate = [
  21,
  3
];

function Generator(props) {
  const { count, config } = props;
  const events = generateEvent(count, cRate);
  const distribution = generateDistribution(config);
  const allocation = allocateEvents(distribution, events);
  const table = generateTable(allocation, cRate)
  const resultTable = generatePValues(table);

  return <Table table={resultTable} />;
}

export default memo(Generator);
