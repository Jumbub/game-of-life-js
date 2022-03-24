import { run } from './graphics/loop.js';
import { parseNumberOrDefault } from './parseNumberOrDefault.js';

const params = new URLSearchParams(location.search);
const resizable = params.get('resizable') !== 'false';
const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), Infinity);
const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

const width = resizable ? innerWidth : 2560;
const height = resizable ? innerHeight : 1440;

run(width, height, resizable, maxGenerations, 1000 / rendersPerSecond);
