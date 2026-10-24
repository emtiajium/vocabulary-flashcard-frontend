/**
 * @jest-environment jsdom
 */
import { defineComponent } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import LeitnerSystemsFlow from '@/views/leitner-systems/LeitnerSystemsFlow.vue';

jest.mock('@ionic/vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');
    const IonStub = define({ template: '<div><slot /></div>' });

    return {
        IonBadge: IonStub,
        IonButton: IonStub,
        IonCard: IonStub,
        IonCardContent: IonStub,
        IonCardSubtitle: IonStub,
        IonCol: IonStub,
        IonRow: IonStub,
    };
});

jest.mock('@fortawesome/vue-fontawesome', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, FontAwesomeIcon: define({ template: '<i />' }) };
});

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
    __esModule: true,
    faArrowLeft: {},
    faArrowRight: {},
    faRefresh: {},
}));

jest.mock('@/media/EmptyBoxIcon.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ template: '<div class="box-icon" />' }) };
});

jest.mock('@/media/LottieAnimation.vue', () => {
    const { defineComponent: define } = jest.requireActual('vue');

    return { __esModule: true, default: define({ name: 'LottieAnimation', template: '<div class="lottie-stub" />' }) };
});

interface LeitnerSystemsFlowVm {
    currentBox: number;
    firstBox: number;
    lastBox: number;
    wordChip: { x: number; y: number };
    hasWordChip: boolean;
    statusMessage: string;
    positionWordChip(): void;
    moveForward(): void;
    moveBackward(): void;
    resetFlow(): void;
}

const vm = (wrapper: VueWrapper): LeitnerSystemsFlowVm => wrapper.vm as unknown as LeitnerSystemsFlowVm;

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
    ({
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        x: left,
        y: top,
        toJSON: () => ({}),
    } as DOMRect);

const mountedWrappers: VueWrapper[] = [];

const mountView = (): VueWrapper => {
    const wrapper = mount(LeitnerSystemsFlow);
    mountedWrappers.push(wrapper);

    // jsdom reports every box at 0x0, so lay the flow out by hand: five 60px
    // tiles inside a 300px shell.
    const shell = wrapper.find('.flow-boxes').element as HTMLElement;
    shell.getBoundingClientRect = (): DOMRect => rect(0, 0, 300, 200);

    wrapper.findAll('.box-item').forEach((tile, index) => {
        const element = tile.element as HTMLElement;
        element.getBoundingClientRect = (): DOMRect => rect(index * 60, 0, 60, 100);

        // The card is centred on the box icon, so lay that out too.
        const icon = tile.find('.box-icon').element as HTMLElement;
        icon.getBoundingClientRect = (): DOMRect => rect(index * 60 + 10, 6, 40, 30);
    });

    return wrapper;
};

describe('Leitner systems flow (integration)', () => {
    afterEach(() => {
        while (mountedWrappers.length) {
            mountedWrappers.pop()?.unmount();
        }
    });

    describe('WHEN the flow is shown', () => {
        it('SHOULD park the word inside the first box', () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();

            expect(vm(wrapper).hasWordChip).toBe(true);
            expect(vm(wrapper).wordChip).toEqual({ x: 30, y: 21 });
        });

        it('SHOULD keep the travelling card decorative', async () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();
            await wrapper.vm.$nextTick();

            const chip = wrapper.find('.word-chip');
            expect(chip.exists()).toBe(true);
            expect(chip.attributes('aria-hidden')).toBe('true');
        });
    });

    describe('WHEN the word is remembered', () => {
        it('SHOULD move the word to the next box', async () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();

            vm(wrapper).moveForward();
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).currentBox).toBe(2);
            expect(vm(wrapper).wordChip).toEqual({ x: 90, y: 21 });
            expect(vm(wrapper).statusMessage).toContain('moved from Box 1 to Box 2');
        });

        it('SHOULD celebrate once the final box is reached', async () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();

            for (let index = 0; index < 4; index += 1) {
                vm(wrapper).moveForward();
                // eslint-disable-next-line no-await-in-loop
                await wrapper.vm.$nextTick();
            }

            expect(vm(wrapper).currentBox).toBe(vm(wrapper).lastBox);
            expect(vm(wrapper).statusMessage).toContain('mastered it');
            expect(wrapper.find('.mastered-celebration').exists()).toBe(true);
        });

        it('SHOULD stop at the final box', () => {
            const wrapper = mountView();
            vm(wrapper).currentBox = vm(wrapper).lastBox;

            vm(wrapper).moveForward();

            expect(vm(wrapper).currentBox).toBe(vm(wrapper).lastBox);
        });
    });

    describe('WHEN the word is forgotten', () => {
        it('SHOULD move the word back a box', async () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();
            vm(wrapper).currentBox = 3;

            vm(wrapper).moveBackward();
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).currentBox).toBe(2);
            expect(vm(wrapper).wordChip).toEqual({ x: 90, y: 21 });
        });

        it('SHOULD stop at the first box', () => {
            const wrapper = mountView();

            vm(wrapper).moveBackward();

            expect(vm(wrapper).currentBox).toBe(vm(wrapper).firstBox);
        });
    });

    describe('WHEN the flow is reset', () => {
        it('SHOULD send the word back to the first box', async () => {
            const wrapper = mountView();
            vm(wrapper).positionWordChip();
            vm(wrapper).currentBox = 4;

            vm(wrapper).resetFlow();
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(vm(wrapper).currentBox).toBe(vm(wrapper).firstBox);
            expect(vm(wrapper).wordChip).toEqual({ x: 30, y: 21 });
        });
    });
});
