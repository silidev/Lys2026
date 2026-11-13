const FILE_PATH =
    'testing/suites/services/backupParse.test.suite.ts';
import {
    parseBackupText,
} from '../../../common/services/backupService.ts';
import { runLogicTest } from '../../helpers.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const testParseBackupRejectsInvalidAndWarnsUnknown = () => {
    const fn =
        testParseBackupRejectsInvalidAndWarnsUnknown.name;
    const ctx = `${fn} in ${FILE_PATH}`;

    const badJson = parseBackupText('{not valid');
    assertEquals(badJson.ok, false, `${ctx}: invalid JSON`);

    const badItemType = parseBackupText(
        JSON.stringify({
            items: [
                { id: '1', name: 'Milk', isUrgent: 'yes' },
            ],
            shopCategories: [],
            homeCategories: [],
        })
    );
    assertEquals(
        badItemType.ok,
        false,
        `${ctx}: bad isUrgent`
    );

    const withUnknown = parseBackupText(
        JSON.stringify({
            extraRoot: 123,
            items: [
                {
                    id: '1',
                    name: 'Milk',
                    isRush: true,
                    isUrgent: true,
                },
            ],
            shopCategories: [
                {
                    id: 's1',
                    name: 'Fridge',
                    itemIds: ['1'],
                    icon: 'cold',
                },
            ],
            homeCategories: [
                { id: 'h1', name: 'Fridge', itemIds: ['1'] },
            ],
        })
    );
    assertEquals(
        withUnknown.ok,
        true,
        `${ctx}: valid with warn`
    );
    if ('data' in withUnknown) {
        assertEquals(
            withUnknown.warnings.length,
            3,
            `${ctx}: 3 warning categories`
        );
        assertEquals(
            'isRush' in withUnknown.data.items[0],
            false,
            `${ctx}: unknown item key stripped`
        );
        assertEquals(
            withUnknown.data.items[0].isUrgent,
            true,
            `${ctx}: known isUrgent kept`
        );
    }
};

export function backupParseTestSuite() {
    const SUITE = backupParseTestSuite.name;
    return [
        runLogicTest(
            'Backup Parse: rejects invalid & warns unknown',
            testParseBackupRejectsInvalidAndWarnsUnknown,
            SUITE,
            FILE_PATH
        ),
    ];
}
