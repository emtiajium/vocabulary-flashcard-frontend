<template>
    <ion-card class="flow-container">
        <ion-card-content>
            <div class="flow-header">
                <ion-card-subtitle id="leitner-flow-title" class="flow-title">
                    How the Leitner System Works
                </ion-card-subtitle>
                <ion-badge color="primary" class="flow-badge">
                    {{ currentBoxDayLabel }}
                </ion-badge>
            </div>

            <p class="flow-hint">See how a word moves between boxes as you remember or forget it.</p>

            <div ref="boxes" class="flow-boxes">
                <ion-row
                    class="boxes-grid display-flex ion-justify-content-center"
                    role="list"
                    aria-labelledby="leitner-flow-title"
                >
                    <ion-col
                        v-for="box in boxes"
                        :key="box.number"
                        sizeXs="6"
                        sizeSm="4"
                        sizeMd="3"
                        sizeLg="3"
                        sizeXl="2"
                        role="listitem"
                        :aria-current="box.number === currentBox ? 'step' : undefined"
                    >
                        <div
                            class="box-item"
                            :class="{
                                active: box.number === currentBox,
                                mastered: currentBox === lastBox && box.number === lastBox,
                            }"
                        >
                            <ion-card class="transparent box-card">
                                <empty-box-icon
                                    class="box-icon"
                                    :color-variable="`--leitner-box-${box.number}`"
                                    aria-hidden="true"
                                    focusable="false"
                                />
                                <span class="box-day-text">{{ box.dayLabel }}</span>
                                <span class="box-schedule-text">{{ box.dueText }}</span>
                            </ion-card>

                            <!-- Decorative confirmation of the payoff the copy describes.
                                 It overlays the tile so it cannot shift the layout. -->
                            <div v-if="isMastered && box.number === lastBox" class="mastered-celebration">
                                <lottie-animation
                                    class="mastered-celebration__animation"
                                    :animation-data="masteredAnimation"
                                    :loop="true"
                                />
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- Decorative: the status banner already says which box holds the word.
                     This is a miniature flashcard that shows it actually travelling there. -->
                <span v-if="hasWordChip" class="word-chip" :style="wordChipStyle" aria-hidden="true" />
            </div>

            <ion-row>
                <ion-col size="12" size-sm="4">
                    <ion-button
                        expand="block"
                        color="success"
                        aria-label="Remembered, move this word forward one box"
                        :disabled="currentBox === lastBox"
                        @click="moveForward"
                    >
                        <font-awesome-icon :icon="faArrowRight" class="ion-padding-end" aria-hidden="true" />
                        Remembered
                    </ion-button>
                </ion-col>

                <ion-col size="12" size-sm="4">
                    <ion-button
                        expand="block"
                        color="warning"
                        aria-label="Forgot, move this word back one box"
                        :disabled="currentBox === firstBox"
                        @click="moveBackward"
                    >
                        <font-awesome-icon :icon="faArrowLeft" class="ion-padding-end" aria-hidden="true" />
                        Forgot
                    </ion-button>
                </ion-col>

                <ion-col size="12" size-sm="4">
                    <ion-button
                        expand="block"
                        color="lightest"
                        aria-label="Reset, move this word back to Box 1"
                        @click="resetFlow"
                    >
                        <font-awesome-icon :icon="faRefresh" class="ion-padding-end" aria-hidden="true" />
                        Reset
                    </ion-button>
                </ion-col>
            </ion-row>

            <p class="status-banner" :class="statusType" role="status">
                {{ statusMessage }}
            </p>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardSubtitle, IonCol, IonRow } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft, faArrowRight, faRefresh } from '@fortawesome/free-solid-svg-icons';
import EmptyBoxIcon from '@/media/EmptyBoxIcon.vue';
import LottieAnimation from '@/media/LottieAnimation.vue';
import mastered from '@/media/lottie/mastered.json';
import MappedLeitnerBoxWithDays, { MappedLeitnerBoxWithDueText } from '@/domains/MappedLeitnerBoxWithDays';

type StatusType = 'forward' | 'backward' | 'info';

interface LeitnerBoxView {
    number: number;
    dayLabel: string;
    dueText: string;
}

const boxNumbers = [1, 2, 3, 4, 5];

export default defineComponent({
    name: 'LeitnerSystemsFlow',
    components: {
        EmptyBoxIcon,
        LottieAnimation,
        IonBadge,
        IonButton,
        IonCard,
        IonCardContent,
        IonCardSubtitle,
        IonCol,
        IonRow,
        FontAwesomeIcon,
    },
    data() {
        return {
            faArrowLeft,
            faArrowRight,
            faRefresh,
            firstBox: boxNumbers[0],
            lastBox: boxNumbers[boxNumbers.length - 1],
            currentBox: boxNumbers[0],
            masteredAnimation: mastered,
            statusType: 'info' as StatusType,
            statusMessage: 'Your word starts in Box 1. Select "Remembered" or "Forgot" to see what happens next.',
            wordChip: { x: 0, y: 0 } as { x: number; y: number },
            hasWordChip: false,
            boxesObserver: null as ResizeObserver | null,
        };
    },
    computed: {
        isMastered(): boolean {
            return this.currentBox === this.lastBox;
        },
        wordChipStyle(): Record<string, string> {
            // One transform: place the chip on the tile and centre it on that point.
            return { transform: `translate(${this.wordChip.x}px, ${this.wordChip.y}px) translate(-50%, -50%)` };
        },
        currentBoxDayLabel(): string {
            return this.dayLabel(this.currentBox);
        },
        boxes(): LeitnerBoxView[] {
            return boxNumbers.map((number) => {
                return {
                    number,
                    dayLabel: MappedLeitnerBoxWithDays[`BOX_${number}`],
                    dueText: MappedLeitnerBoxWithDueText[`BOX_${number}`],
                };
            });
        },
    },
    methods: {
        dayLabel(box: number): string {
            return MappedLeitnerBoxWithDays[`BOX_${box}`];
        },

        /**
         * Parks the miniature flashcard inside the box it now belongs to. The
         * tiles sit inside the shell, so the position survives scrolling and only
         * has to be recomputed when the row is laid out again.
         */
        positionWordChip(): void {
            const shell = this.$refs.boxes as HTMLElement | undefined;
            const tile = shell?.querySelectorAll<HTMLElement>('.box-item')[this.currentBox - 1];

            if (!shell || !tile) {
                return;
            }

            const shellRect = shell.getBoundingClientRect();
            const tileRect = tile.getBoundingClientRect();

            // A collapsed explainer measures 0: the observer fires once it is shown.
            if (!tileRect.width) {
                return;
            }

            // Centre on the empty box itself, so the card looks placed *in* the box
            // rather than pinned to the tile. Fall back to the tile when the icon
            // has not been laid out (or is absent).
            const iconRect = tile.querySelector<HTMLElement>('.box-icon')?.getBoundingClientRect();
            const anchor = iconRect?.width ? iconRect : tileRect;

            this.wordChip = {
                x: Math.round(anchor.left - shellRect.left + anchor.width / 2),
                y: Math.round(anchor.top - shellRect.top + anchor.height / 2),
            };
            this.hasWordChip = true;
        },

        settleWordChip(): void {
            this.$nextTick(() => {
                this.positionWordChip();
            });
        },

        /**
         * The active tile lifts a couple of pixels on a transition, which moves its
         * icon after the card has already been parked. Re-parking when that settles
         * keeps the card centred on the box rather than a few pixels below it.
         */
        handleBoxTransition(event: TransitionEvent): void {
            const target = event.target as HTMLElement | null;
            if (event.propertyName === 'transform' && target?.classList.contains('box-card')) {
                this.positionWordChip();
            }
        },

        moveForward(): void {
            if (this.currentBox >= this.lastBox) {
                return;
            }
            const previousBox = this.currentBox;
            this.currentBox += 1;
            this.statusType = 'forward';
            if (this.currentBox === this.lastBox) {
                this.statusMessage = `Excellent! Your word has reached the final box. You've mastered it!`;
            } else {
                this.statusMessage = `Well done! Your word moved from Box ${previousBox} to Box ${
                    this.currentBox
                }. Review it again ${MappedLeitnerBoxWithDueText[`BOX_${this.currentBox}`].replace('Due ', '')}.`;
            }
            this.settleWordChip();
        },

        moveBackward(): void {
            if (this.currentBox <= this.firstBox) {
                return;
            }
            this.currentBox -= 1;
            this.statusType = 'backward';
            this.statusMessage = `Your word moved back to Box ${this.currentBox}. Keep practising! You'll get there.`;
            this.settleWordChip();
        },

        resetFlow(): void {
            this.currentBox = this.firstBox;
            this.statusType = 'info';
            this.statusMessage = `Back to Box 1! Your word is ready to review.`;
            this.settleWordChip();
        },
    },
    mounted() {
        // The explainer can be collapsed or reflowed, so follow the shell's box
        // instead of trusting a single measurement.
        const shell = this.$refs.boxes as HTMLElement | undefined;

        if (typeof ResizeObserver !== 'undefined') {
            this.boxesObserver = markRaw(
                new ResizeObserver(() => {
                    this.positionWordChip();
                }),
            );

            if (shell) {
                this.boxesObserver.observe(shell);
            }
        }

        shell?.addEventListener('transitionend', this.handleBoxTransition);
        this.positionWordChip();
    },
    beforeUnmount() {
        this.boxesObserver?.disconnect();
        (this.$refs.boxes as HTMLElement | undefined)?.removeEventListener('transitionend', this.handleBoxTransition);
    },
});
</script>

<style scoped>
ion-card.flow-container {
    --background: var(--app-surface, var(--ion-color-card));
    width: 100%;
    margin: var(--space-md) auto;
    border: 1px solid var(--app-border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: visible;
}

.flow-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
    padding-bottom: var(--space-xs);
    margin-bottom: var(--space-md);
    border-bottom: 1px solid var(--app-border-color);
}

.flow-title {
    margin: 0;
    font-weight: var(--font-weight-bold);
}

.flow-badge {
    white-space: nowrap;
}

.flow-hint {
    margin: 0 0 var(--space-md);
    font-size: var(--text-sm);
    color: var(--ion-text-color-step-300);
}

.boxes-grid {
    margin: 0 0 var(--space-md);
}

.flow-boxes {
    position: relative;
}

/* A miniature flashcard that travels between boxes. It is deliberately much
   smaller than the box icon it rests in, and inverts the palette so it reads as
   a card sitting *in* the box rather than an overlay fighting it. */
.word-chip {
    --chip-width: clamp(12px, 3.4vw, 17px);
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: var(--chip-width);
    height: calc(var(--chip-width) * 1.3);
    border-radius: calc(var(--chip-width) * 0.2);
    background: var(--ion-color-primary-contrast);
    border: max(1px, calc(var(--chip-width) * 0.09)) solid var(--ion-color-primary);
    box-shadow: 0 0 0 2px var(--app-surface, var(--ion-color-card)), var(--shadow-sm);
    pointer-events: none;
    transition: transform var(--duration-slow) var(--ease-emphasized);
}

/* Two ruled lines suggest the text on the card without needing copy. */
.word-chip::before,
.word-chip::after {
    content: '';
    position: absolute;
    left: 20%;
    height: max(1px, calc(var(--chip-width) * 0.08));
    border-radius: var(--radius-pill);
    background: var(--ion-color-primary);
}

.word-chip::before {
    top: 30%;
    width: 60%;
}

.word-chip::after {
    top: 56%;
    width: 40%;
}

.box-item {
    display: flex;
    position: relative;
}

.mastered-celebration {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.mastered-celebration__animation {
    width: min(84px, 100%);
}

ion-card.box-card {
    --background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xs);
    width: 100%;
    margin: 0;
    padding: var(--space-xs);
    text-align: center;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xs);
    transition: transform var(--duration-base) var(--ease-standard),
        box-shadow var(--duration-base) var(--ease-standard);
}

.box-item.active .box-card {
    --background: rgba(var(--ion-color-primary-rgb), 0.08);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.box-item.mastered .box-card {
    --background: rgba(var(--ion-color-success-rgb), 0.12);
}

.box-icon {
    width: clamp(2rem, 8vw, 3rem);
    height: auto;
}

.box-day-text {
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--ion-color-primary);
}

.box-schedule-text {
    font-size: var(--text-xs);
    color: var(--ion-text-color-step-300);
}

.status-banner {
    margin: var(--space-md) 0 0;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
    text-align: center;
}

.status-banner.forward {
    background: rgba(var(--ion-color-success-rgb), 0.12);
    border: 1px solid rgba(var(--ion-color-success-rgb), 0.25);
    color: var(--ion-color-success-shade);
}

.status-banner.backward {
    background: rgba(var(--ion-color-warning-rgb), 0.15);
    border: 1px solid rgba(var(--ion-color-warning-rgb), 0.3);
    color: var(--ion-color-warning-shade);
}

.status-banner.info {
    background: rgba(var(--ion-color-primary-rgb), 0.08);
    border: 1px solid rgba(var(--ion-color-primary-rgb), 0.2);
    color: var(--ion-color-primary);
}

@media (prefers-reduced-motion: reduce) {
    .box-card,
    .word-chip {
        transition: none;
    }
}
</style>
