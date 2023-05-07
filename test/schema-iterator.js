import {iterate} from '../src/schema/iterate.js';
import unionsIntersectionsRecursion from
  './fixtures/unions-intersections-recursion.js';

describe('schemaIterator', function () {
  it('iterator iterates', function () {
    const result = iterate(unionsIntersectionsRecursion);
    console.log('result', result);
  });
});
