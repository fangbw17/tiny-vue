import {h} from '../../src/runtime-core'

describe('h', () => {
    test('should return vnode', () => {
        expect(h('div', {}, "this is div"));
      });
})