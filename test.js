import {readFileSync} from 'fs';
import {resolve} from 'path';
import test from 'ava';
import detect from '.';

const filename = resolve(__dirname, 'fixtures', 'module.js');
const src = readFileSync(filename, 'utf8');

test('like the detective module, but for CommonJS + imports', t => {
	t.deepEqual(detect(src, {plugins: ['asyncFunctions']}), [
		'path', 'object-assign', 'object-assign',
		'./foo', './blah', 'lodash', 'defaults',
		'side-effects', 'b'
	]);
});

test('empty file', t => {
	t.deepEqual(detect(''), []);
});
