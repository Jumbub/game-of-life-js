import { benchAll } from './benchmark/all/benchAll';
import { benchTest } from './benchmark/benchTest';
import { random } from './random';
import { test } from './test/test';

const params = new URLSearchParams(location.search);
if (params.get('test')) test();
else if (params.get('benchmark')) benchTest();
else if (params.get('benchmark_all')) benchAll();
else random();
