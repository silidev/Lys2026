import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../../hooks/useTheme.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const FILE_PATH = 'testing/suites/hooks/useTheme.test.suite.ts';

const testDefaultTheme = async (_user: User) => {
    const { result } = renderHook(() => useTheme());
    assertEquals(result.current[0], 'dark');
    assertEquals(document.documentElement.classList.contains('dark'), true, "Document should have 'dark' class");
};

const testSetLightTheme = async (_user: User) => {
    const { result } = renderHook(() => useTheme());
    act(() => {
        result.current[1]('light');
    });
    assertEquals(result.current[0], 'light');
    assertEquals(document.documentElement.classList.contains('dark'), false, "Document should not have 'dark' class");
};

const testRespectSystemTheme = async (user: User, mockStorage: MockStorageService) => {
    mockStorage.setItem('theme', 'system');
    const { result } = renderHook(() => useTheme());
    assertEquals(result.current[0], 'system');
    // The helper stubs matchMedia to be dark (matches: true)
    assertEquals(document.documentElement.classList.contains('dark'), true, "Document should have 'dark' class for system theme");
};

export function useThemeTestSuite() {
    const SUITE_NAME = useThemeTestSuite.name;
    return [
        runComponentTest('useTheme: should default to "dark" theme', testDefaultTheme, SUITE_NAME, FILE_PATH),
        runComponentTest('useTheme: should set theme to "light"', testSetLightTheme, SUITE_NAME, FILE_PATH),
        runComponentTest('useTheme: should respect "system" theme preference', testRespectSystemTheme, SUITE_NAME, FILE_PATH),
    ];
}