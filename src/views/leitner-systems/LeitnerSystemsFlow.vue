<template>
    <ion-card class="flow-container">
        <ion-card-content>
            <div class="flow-header">
                <ion-card-subtitle id="leitner-flow-title" class="flow-title"> Leitner System Flow </ion-card-subtitle>
                <ion-badge color="primary" class="flow-badge">
                    {{ currentBoxDayLabel }}
                </ion-badge>
            </div>

            <p class="flow-hint">
                Each review moves a word a single box at a time. Use the controls below to follow it.
            </p>

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
                        <ion-card class="box-card">
                            <empty-box-icon
                                class="box-icon"
                                :color-variable="`--leitner-box-${box.number}`"
                                aria-hidden="true"
                                focusable="false"
                            />
                            <span class="box-day-text">{{ box.dayLabel }}</span>
                            <span class="box-schedule-text">Due {{ box.dueText }}</span>
                        </ion-card>
                    </div>
                </ion-col>
            </ion-row>

            <ion-row class="action-row">
                <ion-col size="12" size-sm="5">
                    <ion-button
                        expand="block"
                        color="success"
                        aria-label="I know this word, move it forward one box"
                        :disabled="currentBox === lastBox"
                        @click="moveForward"
                    >
                        <font-awesome-icon :icon="faArrowRight" class="ion-padding-end" />
                        I Know
                    </ion-button>
                </ion-col>

                <ion-col size="12" size-sm="5">
                    <ion-button
                        expand="block"
                        color="warning"
                        aria-label="I forgot this word, move it back one box"
                        :disabled="currentBox === firstBox"
                        @click="moveBackward"
                    >
                        <font-awesome-icon :icon="faArrowLeft" class="ion-padding-end" />
                        I Forgot
                    </ion-button>
                </ion-col>

                <ion-col size="12" size-sm="2">
                    <ion-button expand="block" color="medium" aria-label="Reset the word to Box 1" @click="resetFlow">
                        <font-awesome-icon :icon="faRefresh" />
                    </ion-button>
                </ion-col>
            </ion-row>

            <p class="status-banner" :class="statusType" role="status" aria-live="polite">
                {{ statusMessage }}
            </p>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardSubtitle, IonCol, IonRow } from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft, faArrowRight, faRefresh } from '@fortawesome/free-solid-svg-icons';
import EmptyBoxIcon from '@/media/EmptyBoxIcon.vue';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';

type StatusType = 'forward' | 'backward' | 'info';

interface LeitnerBoxView {
    number: number;
    dayLabel: string;
    dueText: string;
}

// Mirrors the backend LeitnerBoxAppearanceDifference / LeitnerBoxType definitions.
const BOX_NUMBERS = [1, 2, 3, 4, 5];
const BOX_DUE_TEXT: Record<number, string> = {
    1: 'today',
    2: 'in 1 day',
    3: 'in 2 days',
    4: 'in 3 days',
    5: 'any time',
};

export default defineComponent({
    name: 'LeitnerSystemsFlow',
    components: {
        EmptyBoxIcon,
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
            firstBox: BOX_NUMBERS[0],
            lastBox: BOX_NUMBERS[BOX_NUMBERS.length - 1],
            currentBox: BOX_NUMBERS[0],
            statusType: 'info' as StatusType,
            statusMessage:
                'This word starts in Box 1 (Day 1). Press "I Know" to move it forward or "I Forgot" to move it back.',
        };
    },
    computed: {
        currentBoxDayLabel(): string {
            return this.dayLabel(this.currentBox);
        },
        boxes(): LeitnerBoxView[] {
            return BOX_NUMBERS.map((number) => {
                return {
                    number,
                    dayLabel: MappedLeitnerBoxWithDays[`BOX_${number}`],
                    dueText: BOX_DUE_TEXT[number],
                };
            });
        },
    },
    methods: {
        dayLabel(box: number): string {
            return MappedLeitnerBoxWithDays[`BOX_${box}`];
        },

        moveForward(): void {
            if (this.currentBox >= this.lastBox) {
                return;
            }
            const previousBox = this.currentBox;
            this.currentBox += 1;
            this.statusType = 'forward';
            if (this.currentBox === this.lastBox) {
                this.statusMessage = `The word advanced from Box ${previousBox} to Box ${this.currentBox} (${this.currentBoxDayLabel}) and is now mastered. It stays due any time.`;
            } else {
                this.statusMessage = `The word advanced from Box ${previousBox} to Box ${this.currentBox} (${
                    this.currentBoxDayLabel
                }). Next review is due ${BOX_DUE_TEXT[this.currentBox]}.`;
            }
        },

        moveBackward(): void {
            if (this.currentBox <= this.firstBox) {
                return;
            }
            this.currentBox -= 1;
            this.statusType = 'backward';
            this.statusMessage = `The word moved back from the current box to the previous one and is ready to review again.`;
        },

        resetFlow(): void {
            this.currentBox = this.firstBox;
            this.statusType = 'info';
            this.statusMessage = 'Reset to Box 1 (Day 1). The word is due today.';
        },
    },
});
</script>

<style scoped>
ion-card.flow-container {
    --background: var(--app-surface, var(--ion-color-card));
    width: 100%;
    margin: var(--space-sm) auto;
    border: 1px solid var(--app-border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: visible;
}

ion-card.flow-container ion-card-content {
    width: 100%;
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

.box-item {
    display: flex;
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
    font-size: var(--text-2xs);
    color: var(--ion-text-color-step-300);
}

.action-row {
    margin-top: var(--space-xs);
}

.status-banner {
    margin: var(--space-sm) 0 0;
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
    .box-card {
        transition: none;
    }
}
</style>
