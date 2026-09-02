const FILE_PATH = 'testing/suites/common/hooks/usePrevious.test.suite.ts';
import { renderHook } from '@testing-library/react';
import { usePrevious } from '../../../../common/hooks/effects/usePrevious.ts';
import { runComponentTest } from '../../../helpers.ts';
import { assertEquals } from '../../../../common/testing/services/tests/helpers.ts';

const testUsePreviousHook = () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 0 },
    });

    assertEquals(result.current, undefined, "Initial previous value should be undefined");

    rerender({ value: 1 });
    assertEquals(result.current, 0, "Previous value should be 0");

    rerender({ value: 2 });
    assertEquals(result.current, 1, "Previous value should be 1");
    
    rerender({ value: 2 });
    assertEquals(result.current, 2, "Previous value should be 2 when value is the same");
};

export function usePreviousTestSuite() {
    const SUITE_NAME = usePreviousTestSuite.name;
    return [
        runComponentTest('usePrevious: should return the previous value of a prop', testUsePreviousHook, SUITE_NAME, FILE_PATH),
    ];
}
