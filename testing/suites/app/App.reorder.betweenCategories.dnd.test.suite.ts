import React from 'react';
import { render } from '@testing-library/react';
import { waitFor, within, fireEvent } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { MockDataTransfer } from '../../mocks/dataTransfer.mock.ts';
import type { ShoppingListData } from '../../../types.ts';
import { ensureShowCheckedItemsIsChecked } from '../../accessors.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const FILE_PATH = 'testing/suites/app/App.reorder.betweenCategories.dnd.test.suite.ts';

// Helper function to set up the test environment
const setupDnDTest = async (user: User, mockStorage: MockStorageService, initialData: ShoppingListData) => {
    mockStorage.setItem('shopping-list-data', initialData);
    const { container } = render(React.createElement(App));
    
    await ensureShowCheckedItemsIsChecked(user, container);
    const shopTab = container.querySelector<HTMLButtonElement>('#mode-tab-shop');
    assertEquals(!!shopTab, true, "Shop tab should exist");
    await user.click(shopTab!);

    return { container };
};

const testMoveWithDragAndDrop = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: '1', name: 'Apples', amount: '1' }],
        shopCategories: [
            {id: 's1', name: 'Fruit', itemIds: ['1']},
            {id: 's2', name: 'Veggies', itemIds: []},
        ],
        homeCategories: [],
    };
    const { container } = await setupDnDTest(user, mockStorage, initialData);
    
    const fruitCategory = await waitFor(() => within(container).getByRole('heading', { name: 'Fruit' }).closest('section')!);
    const veggiesCategory = await waitFor(() => within(container).getByRole('heading', { name: 'Veggies' }).closest('section')!);
    const applesItem = within(fruitCategory).getByText('Apples').closest('li')!;
    
    assertEquals(!!within(fruitCategory).getByText('Apples'), true, "Apples should be in fruit category initially");
    assertEquals(within(veggiesCategory).queryByText('Apples'), null, "Apples should not be in veggies category initially");

    const dataTransfer = new MockDataTransfer();
    dataTransfer.setData('application/json', JSON.stringify({ itemId: '1', categoryId: 's1', index: 0 }));
    
    const dragStartEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(applesItem, dragStartEvent);

    fireEvent.dragOver(veggiesCategory);

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(veggiesCategory, dropEvent);

    await waitFor(() => {
        assertEquals(within(fruitCategory).queryByText('Apples'), null, "Apples should not be in fruit category after drop");
        assertEquals(!!within(veggiesCategory).getByText('Apples'), true, "Apples should be in veggies category after drop");
    });

    const storedData = mockStorage.getItem<ShoppingListData>('shopping-list-data');
    assertEquals(!!storedData, true, "Stored data should exist");
    if (storedData) {
        assertEquals(storedData.shopCategories[0].itemIds, []);
        assertEquals(storedData.shopCategories[1].itemIds, ['1']);
    }
};

const testMoveByDroppingOnItem = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [
            { id: '1', name: 'Apples', amount: '1' },
            { id: '2', name: 'Carrots', amount: '1' },
        ],
        shopCategories: [
            {id: 's1', name: 'Fruit', itemIds: ['1']},
            {id: 's2', name: 'Veggies', itemIds: ['2']},
        ],
        homeCategories: [],
    };
    const { container } = await setupDnDTest(user, mockStorage, initialData);

    const fruitCategory = await waitFor(() => within(container).getByRole('heading', { name: 'Fruit' }).closest('section')!);
    const veggiesCategory = await waitFor(() => within(container).getByRole('heading', { name: 'Veggies' }).closest('section')!);
    const applesItem = within(fruitCategory).getByText('Apples').closest('li')!;
    const carrotsItem = within(veggiesCategory).getByText('Carrots').closest('li')!;
    
    const dataTransfer = new MockDataTransfer();
    dataTransfer.setData('application/json', JSON.stringify({ itemId: '1', categoryId: 's1', index: 0 }));

    const dragStartEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(applesItem, dragStartEvent);

    fireEvent.dragOver(carrotsItem);

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(carrotsItem, dropEvent);

    await waitFor(() => {
        const veggieItems = within(veggiesCategory).getAllByRole('listitem');
        assertEquals(!!within(veggieItems[0]).getByText('Apples'), true, "Apples should be first item in veggies");
        assertEquals(!!within(veggieItems[1]).getByText('Carrots'), true, "Carrots should be second item in veggies");
    });

    const storedData = mockStorage.getItem<ShoppingListData>('shopping-list-data');
    assertEquals(!!storedData, true, "Stored data should exist");
    if (storedData) {
        assertEquals(storedData.shopCategories[0].itemIds, []);
        assertEquals(storedData.shopCategories[1].itemIds, ['1', '2']);
    }
};

export function appReorderBetweenCategoriesDndTestSuite() {
    const SUITE_NAME = appReorderBetweenCategoriesDndTestSuite.name;
    return [
        runComponentTest('App Reorder DnD: should move an item to a different category via drag and drop', testMoveWithDragAndDrop, SUITE_NAME, FILE_PATH),
        runComponentTest('App Reorder DnD: should move an item by dropping on another item', testMoveByDroppingOnItem, SUITE_NAME, FILE_PATH),
    ];
}