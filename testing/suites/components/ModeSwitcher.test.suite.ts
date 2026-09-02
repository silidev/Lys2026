import React from 'react';
import { render } from '@testing-library/react';
import sinon from 'sinon';
import ModeSwitcher from '../../../components/ModeSwitcher.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';

const FILE_PATH = 'testing/suites/components/ModeSwitcher.test.suite.ts';

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testHighlightsActiveMode = async (_user: User) => {
    const { rerender, container } = renderWithProvider(React.createElement(ModeSwitcher, { mode: "shop", onModeChange: () => {} }));
    const shopButton = container.querySelector<HTMLButtonElement>('#mode-tab-shop');
    const homeButton = container.querySelector<HTMLButtonElement>('#mode-tab-home');

    assertEquals(!!shopButton, true, "Shop button should exist");
    assertEquals(!!homeButton, true, "Home button should exist");

    assertEquals(shopButton!.classList.contains('bg-orange-600'), true, "Shop button should be active");
    assertEquals(homeButton!.classList.contains('bg-orange-600'), false, "Home button should not be active");
    assertEquals(shopButton!.getAttribute('aria-selected'), 'true', "Shop button aria-selected should be true");

    rerender(React.createElement(LocalizationProvider, null, React.createElement(LongPressProvider, null, React.createElement(ModeSwitcher, { mode: "home", onModeChange: () => {} }))));
    assertEquals(shopButton!.classList.contains('bg-orange-600'), false, "Shop button should be inactive after rerender");
    assertEquals(homeButton!.classList.contains('bg-orange-600'), true, "Home button should be active after rerender");
    assertEquals(homeButton!.getAttribute('aria-selected'), 'true', "Home button aria-selected should be true");
};

const testCallsOnModeChange = async (user: User) => {
    const onModeChange = sinon.spy();
    const { container } = renderWithProvider(React.createElement(ModeSwitcher, { mode: "shop", onModeChange: onModeChange }));

    const homeButton = container.querySelector<HTMLButtonElement>('#mode-tab-home');
    assertEquals(!!homeButton, true, "Home button should exist");
    await user.click(homeButton!);
    assertEquals(onModeChange.calledOnceWith('home'), true, "onModeChange should be called with 'home'");

    const shopButton = container.querySelector<HTMLButtonElement>('#mode-tab-shop');
    assertEquals(!!shopButton, true, "Shop button should exist");
    await user.click(shopButton!);
    assertEquals(onModeChange.calledWith('shop'), true, "onModeChange should be called with 'shop'");
};

export function modeSwitcherTestSuite() {
    const SUITE_NAME = modeSwitcherTestSuite.name;
    return [
        runComponentTest('ModeSwitcher: highlights the active mode button', testHighlightsActiveMode, SUITE_NAME, FILE_PATH),
        runComponentTest('ModeSwitcher: calls onModeChange with the correct mode when a button is clicked', testCallsOnModeChange, SUITE_NAME, FILE_PATH),
    ];
}