/**
 * @jest-environment jsdom
 */
import Alert from '@/utils/Alert';
import { alertController } from '@ionic/vue';

jest.mock('@ionic/vue', () => ({
    __esModule: true,
    alertController: { create: jest.fn() },
}));

interface AlertButtonShape {
    text: string;
    role?: string;
    handler?: () => Promise<void>;
}

interface AlertOptions {
    header?: string;
    message: string;
    buttons: AlertButtonShape[];
}

const alertControllerMock = alertController as unknown as { create: jest.Mock };

/** The options the component was last asked to create an alert with. */
const lastAlert = (): AlertOptions => alertControllerMock.create.mock.calls.at(-1)[0];

let present: jest.Mock;

beforeEach(() => {
    present = jest.fn().mockResolvedValue(undefined);
    alertControllerMock.create.mockReset();
    alertControllerMock.create.mockResolvedValue({ present });
});

describe('Alert', () => {
    describe('WHEN a confirm is presented', () => {
        it('SHOULD offer to go ahead or back out, defaulting to Yes and No', async () => {
            await Alert.presentConfirm({ message: 'Remove it?', onConfirm: jest.fn() });

            const { buttons, message } = lastAlert();

            expect(message).toBe('Remove it?');
            expect(buttons.map((button) => button.text)).toEqual(['No', 'Yes']);
            expect(present).toHaveBeenCalled();
        });

        it('SHOULD let the caller word the buttons', async () => {
            await Alert.presentConfirm({
                message: 'Update it?',
                confirmLabel: 'Update',
                cancelLabel: 'Cancel',
                onConfirm: jest.fn(),
            });

            expect(lastAlert().buttons.map((button) => button.text)).toEqual(['Cancel', 'Update']);
        });

        it('SHOULD carry a title WHEN one is given', async () => {
            await Alert.presentConfirm({ header: 'Careful', message: 'Remove it?', onConfirm: jest.fn() });

            expect(lastAlert().header).toBe('Careful');
        });
    });

    describe('WHEN the user answers', () => {
        it('SHOULD run the confirm handler WHEN going ahead', async () => {
            const onConfirm = jest.fn().mockResolvedValue(undefined);

            await Alert.presentConfirm({ message: 'Remove it?', onConfirm });
            await lastAlert().buttons[1].handler?.();

            expect(onConfirm).toHaveBeenCalledTimes(1);
        });

        it('SHOULD run the cancel handler WHEN one is given', async () => {
            const onCancel = jest.fn().mockResolvedValue(undefined);

            await Alert.presentConfirm({ message: 'Remove it?', onConfirm: jest.fn(), onCancel });
            await lastAlert().buttons[0].handler?.();

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('SHOULD not require a cancel handler', async () => {
            await Alert.presentConfirm({ message: 'Remove it?', onConfirm: jest.fn() });

            await expect(lastAlert().buttons[0].handler?.()).resolves.toBeUndefined();
        });

        it('SHOULD dismiss through the cancel role so the alert knows which button was used', async () => {
            await Alert.presentConfirm({ message: 'Remove it?', onConfirm: jest.fn() });

            expect(lastAlert().buttons[0].role).toBe('cancel');
        });
    });

    describe('WHEN the action destroys something', () => {
        it('SHOULD mark the confirm button as destructive', async () => {
            await Alert.presentConfirm({ message: 'Delete your account?', destructive: true, onConfirm: jest.fn() });

            expect(lastAlert().buttons[1].role).toBe('destructive');
        });

        it('SHOULD leave a harmless confirm unmarked', async () => {
            await Alert.presentConfirm({ message: 'Update it?', onConfirm: jest.fn() });

            expect(lastAlert().buttons[1].role).toBeUndefined();
        });
    });
});
