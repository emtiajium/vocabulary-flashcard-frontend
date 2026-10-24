<template>
    <ion-page>
        <firecracker-header
            :header-title="headerTitle"
            content-id="leitner-box-items"
            menu-id="leitner-box-items-menu"
            type="BACK"
        />
        <ion-content :fullscreen="true" id="leitner-box-items">
            <spinner v-if="showSpinner && !isNetworkError" />

            <view v-if="shouldShowEmptyState">
                <ion-card-subtitle class="ion-padding ion-text-center">
                    Things are pretty quiet right now.
                </ion-card-subtitle>

                <view class="display-flex ion-justify-content-center ion-padding-bottom">
                    <lottie-animation class="empty-state-animation" :animation-data="emptyStateAnimation">
                        <template #fallback>
                            <font-awesome-icon :icon="faGlassCheers" class="firecracker-primary-color-icon-large" />
                        </template>
                    </lottie-animation>
                </view>

                <ion-card-subtitle v-if="box === '1' && totalItems === 0" class="ion-padding ion-text-center">
                    <span class="link-container">
                        But beginning the journey with Leitner System is super easy. All you need to do is create a
                        flashcard by pressing the
                        <font-awesome-icon :icon="faHeartRegular" class="leitner-icon" /> icon on the
                        <router-link to="/vocabularies"> vocabulary card </router-link>. After that, the vocabulary will
                        immediately place into the "{{ headerTitle }}".
                    </span>
                </ion-card-subtitle>

                <ion-card-subtitle v-if="box !== '1' && totalItems > 0" class="ion-padding ion-text-center">
                    <span v-if="!singleLeitnerItemEarlierToBoxAppearanceDate?.vocabulary">
                        Items will only appear when it is the right time.
                    </span>
                    <span v-if="singleLeitnerItemEarlierToBoxAppearanceDate?.vocabulary">
                        Items will only appear when it is the right time. For example, the vocabulary "{{
                            singleLeitnerItemEarlierToBoxAppearanceDate.vocabulary.word
                        }}" will appear on
                        {{ format(singleLeitnerItemEarlierToBoxAppearanceDate.boxAppearanceDate, 'LLLL, dd') }}.
                    </span>
                </ion-card-subtitle>
            </view>

            <ion-row
                v-for="boxItem in boxItems"
                :key="boxItem.vocabularyId"
                class="display-flex ion-justify-content-center item-container"
            >
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <ion-card class="margin-top-bottom-unset">
                        <ion-card-header>
                            <ion-card-title class="display-flex ion-justify-content-center capitalize">
                                {{ boxItem.word }}
                            </ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-row
                                class="display-flex ion-justify-content-center ion-align-items-center capitalize ion-margin-top"
                            >
                                <font-awesome-icon :icon="faCalendarAlt" class="firecracker-primary-color-icon" />
                                <span class="updated-at ion-padding-start ion-padding-end">
                                    {{ format(boxItem.updatedAt, 'MMMM dd, yyyy') }}
                                </span>
                                <font-awesome-icon :icon="faClock" class="firecracker-primary-color-icon" />
                                <span class="updated-at ion-padding-start">
                                    {{ format(boxItem.updatedAt, 'hh:mm aa') }}
                                </span>
                            </ion-row>

                            <ion-row class="item-actions ion-justify-content-center ion-padding-top">
                                <ion-button
                                    v-if="!isFirstBox()"
                                    aria-label="Move to the previous box"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="warning"
                                    @click="moveBackward(boxItem.vocabularyId)"
                                >
                                    <font-awesome-icon :icon="faArrowLeft" />
                                </ion-button>
                                <ion-button
                                    v-if="!isLastBox()"
                                    aria-label="Move to the next box"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="primary"
                                    @click="moveForward(boxItem.vocabularyId)"
                                >
                                    <font-awesome-icon :icon="faArrowRight" />
                                </ion-button>
                                <ion-button
                                    aria-label="View vocabulary details"
                                    fill="outline"
                                    size="small"
                                    shape="round"
                                    :strong="true"
                                    color="fern-green"
                                    class="item-actions__details"
                                    @click="seeMore(boxItem.vocabularyId, boxItem.word)"
                                >
                                    <font-awesome-icon :icon="faUnlockAlt" />
                                </ion-button>
                            </ion-row>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>

            <ion-col
                v-if="!allQuietOnTheWesternFront && singleLeitnerItemEarlierToBoxAppearanceDate?.vocabulary"
                sizeXs="12"
                sizeSm="12"
                sizeMd="8"
                sizeLg="6"
                sizeXl="6"
            >
                <ion-card-subtitle class="ion-padding-start ion-padding-end ion-padding-bottom ion-text-center">
                    Other items will only appear when it is the right time. For example, the vocabulary "{{
                        singleLeitnerItemEarlierToBoxAppearanceDate.vocabulary.word
                    }}" will appear on
                    {{ format(singleLeitnerItemEarlierToBoxAppearanceDate.boxAppearanceDate, 'LLLL, dd') }}.
                </ion-card-subtitle>
            </ion-col>

            <network-error v-if="isNetworkError" />

            <ion-infinite-scroll
                @ionInfinite="renderBoxItems($event)"
                threshold="100px"
                id="infinite-scroll"
                :disabled="isDisabled"
            >
                <spinner />
            </ion-infinite-scroll>
        </ion-content>

        <!-- Decorative: the toast already reports the move, this only marks the
             word as mastered. It is re-mounted through `masteredFeedbackKey`. -->
        <div v-if="hasMasteredFeedback" class="mastered-feedback">
            <lottie-animation
                :key="masteredFeedbackKey"
                class="mastered-feedback__animation"
                :animation-data="masteredAnimation"
                :loop="false"
                @complete="onMasteredFeedbackComplete"
            />
        </div>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonInfiniteScroll,
    IonPage,
    IonRow,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import LottieAnimation from '@/media/LottieAnimation.vue';
import type { LottieAnimationData } from '@/media/lottie/types';
import emptyFlashcards from '@/media/lottie/empty-flashcards.json';
import waitingForReview from '@/media/lottie/waiting-for-review.json';
import mastered from '@/media/lottie/mastered.json';
import LeitnerBoxItem from '@/domains/LeitnerBoxItem';
import HttpHandler from '@/utils/HttpHandler';
import Pagination from '@/domains/Pagination';
import { Components } from '@ionic/core/components';
import Spinner from '@/views/shared/Spinner.vue';
import NetworkError from '@/views/shared/NetworkError.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faCalendarAlt,
    faClock,
    faGlassCheers,
    faUnlockAlt,
    faArrowLeft,
    faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Toast from '@/utils/Toast';
import MappedLeitnerBoxWithDays from '@/domains/MappedLeitnerBoxWithDays';
import NativeStorage from '@/utils/NativeStorage';
import LeitnerBoxItemSearchResult, {
    SingleLeitnerItemEarlierToBoxAppearanceDate,
} from '@/domains/LeitnerBoxItemSearchResult';
import { FirecrackerError } from '@/domains/FirecrackerError';
import { format } from 'date-fns';
import { filter, findIndex, isEmpty, uniqBy } from 'lodash';

interface Payload {
    pagination: Pagination;
}

type IonInfiniteScrollType = Components.IonInfiniteScroll;

export default defineComponent({
    name: 'LeitnerBoxItems',
    components: {
        FirecrackerHeader,
        LottieAnimation,
        Spinner,
        NetworkError,
        IonContent,
        IonPage,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonInfiniteScroll,
        IonCardContent,
        IonRow,
        IonCol,
        IonButton,
        FontAwesomeIcon,
    },
    data() {
        const box = this.$route.params.box.toString();
        return {
            box,
            totalItems: Number.parseInt(this.$route.params.count.toString(), 10),
            mappedBoxWithDays: MappedLeitnerBoxWithDays,
            boxItems: [] as LeitnerBoxItem[],
            singleLeitnerItemEarlierToBoxAppearanceDate: {} as SingleLeitnerItemEarlierToBoxAppearanceDate,
            showSpinner: false,
            pageNumber: 1,
            pageSize: 10,
            isDisabled: false,
            allQuietOnTheWesternFront: false,
            isNetworkError: false,
            emptyFlashcardsAnimation: emptyFlashcards,
            waitingForReviewAnimation: waitingForReview,
            masteredAnimation: mastered,
            hasMasteredFeedback: false,
            isMasteredFeedbackPlaying: false,
            masteredFeedbackKey: 0,
            faUnlockAlt,
            faGlassCheers,
            faClock,
            faCalendarAlt,
            faHeartRegular,
            faArrowLeft,
            faArrowRight,
            headerTitle: `${MappedLeitnerBoxWithDays[`BOX_${box}`]} Box` || '',
        };
    },
    computed: {
        /**
         * An empty Box 1 means "you have no flashcards yet", anything else means
         * "there is nothing due right now" — two different messages that deserve
         * two different illustrations.
         */
        emptyStateAnimation(): LottieAnimationData {
            return this.box === '1' && this.totalItems === 0
                ? this.emptyFlashcardsAnimation
                : this.waitingForReviewAnimation;
        },

        /**
         * Mastering the last vocabulary of a box empties it, so the empty state
         * would otherwise appear on top of the celebration. It waits for the
         * celebration to finish instead.
         */
        shouldShowEmptyState(): boolean {
            return this.allQuietOnTheWesternFront && !this.isNetworkError && !this.isMasteredFeedbackPlaying;
        },
    },
    async ionViewDidEnter() {
        if (!this.boxItems.length || this.isNetworkError || (await NativeStorage.getShouldReloadLeitnerItems())) {
            await this.refresh();
            NativeStorage.removeShouldReloadLeitnerItems().catch().finally();
        }
        this.assertRefreshWord().finally();
    },
    methods: {
        format,
        clean(): void {
            this.showSpinner = false;
            this.boxItems = [] as LeitnerBoxItem[];
            this.singleLeitnerItemEarlierToBoxAppearanceDate = {} as SingleLeitnerItemEarlierToBoxAppearanceDate;
            this.pageNumber = 1;
            this.isDisabled = false;
            this.allQuietOnTheWesternFront = false;
            this.isNetworkError = false;
            this.hasMasteredFeedback = false;
            this.isMasteredFeedbackPlaying = false;
            this.masteredFeedbackKey = 0;
        },

        async findBoxItems(): Promise<LeitnerBoxItemSearchResult> {
            const payload: Payload = {
                pagination: {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                },
            };
            let searchResult;
            try {
                searchResult = await HttpHandler.post<Payload, LeitnerBoxItemSearchResult>(
                    `/v1/leitner-systems/items/${this.box}`,
                    payload,
                );
                this.isNetworkError = false;
            } catch {
                this.isNetworkError = true;
                searchResult = { results: [], total: 0 };
            }
            return searchResult as LeitnerBoxItemSearchResult;
        },

        async renderBoxItems(event?: CustomEvent<void>): Promise<void> {
            const { results, total, singleLeitnerItemEarlierToBoxAppearanceDate } = await this.findBoxItems();
            this.singleLeitnerItemEarlierToBoxAppearanceDate = singleLeitnerItemEarlierToBoxAppearanceDate;
            if (!total) {
                this.allQuietOnTheWesternFront = true;
            }
            // workaround
            // after moving an item to the next box
            // this.refresh() is not being executed
            // and as this.pageNumber is re-calculated
            // there is a chance of getting an item that has been retrieved earlier
            this.boxItems = uniqBy(this.boxItems.concat(results), 'vocabularyId');
            this.pageNumber += 1;
            this.isDisabled = this.boxItems.length >= total;
            if (event?.target) {
                // eslint-disable-next-line no-param-reassign
                ((event as CustomEvent).target as unknown as IonInfiniteScrollType).disabled = this.isDisabled;
                await ((event as CustomEvent).target as unknown as IonInfiniteScrollType).complete();
            }
        },

        async refresh(): Promise<void> {
            this.clean();
            this.showSpinner = true;
            await this.renderBoxItems();
            this.showSpinner = false;
        },

        async seeMore(id: string, word: string): Promise<void> {
            await this.$router.push(`/vocabulary/read/${id}/${word}/${true}`);
        },

        isFirstBox(): boolean {
            return Number.parseInt(this.box, 10) === 1;
        },

        isLastBox(): boolean {
            return Number.parseInt(this.box, 10) === 5;
        },

        async moveForward(vocabularyId: string): Promise<void> {
            if (!this.isLastBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/forward/${vocabularyId}`);
                    await Toast.present(
                        `The vocabulary has been moved to ${
                            MappedLeitnerBoxWithDays[`BOX_${Number.parseInt(this.box, 10) + 1}`]
                        } box`,
                        'success',
                    );
                    if (this.isMovingIntoMastery()) {
                        // Claimed before the item is kicked out, so the empty state
                        // that follows never renders in the same pass as the burst.
                        this.playMasteredFeedback();
                    }
                    await this.onKickingOutItem(vocabularyId);
                } catch (error) {
                    await Toast.present((error as FirecrackerError).message, 'error');
                }
            }
        },

        /**
         * Moving a word forward out of the fourth box lands it in the final one,
         * which the Leitner System treats as mastered.
         */
        isMovingIntoMastery(): boolean {
            return Number.parseInt(this.box, 10) === 4;
        },

        playMasteredFeedback(): void {
            this.hasMasteredFeedback = true;
            this.isMasteredFeedbackPlaying = true;
            this.masteredFeedbackKey += 1;
        },

        onMasteredFeedbackComplete(): void {
            this.isMasteredFeedbackPlaying = false;
        },

        async moveBackward(vocabularyId: string): Promise<void> {
            if (!this.isFirstBox()) {
                try {
                    await HttpHandler.put(`/v1/leitner-systems/backward/${vocabularyId}`);
                    await Toast.present(
                        `The vocabulary has been moved back to ${
                            MappedLeitnerBoxWithDays[`BOX_${Number.parseInt(this.box, 10) - 1}`]
                        } box`,
                        'info',
                    );
                    await this.onKickingOutItem(vocabularyId);
                } catch (error) {
                    await Toast.present((error as FirecrackerError).message, 'error');
                }
            }
        },

        async onKickingOutItem(vocabularyId: string): Promise<void> {
            this.totalItems -= 1;
            this.boxItems = filter(this.boxItems, (boxItem) => {
                return boxItem.vocabularyId !== vocabularyId;
            });
            if (this.pageNumber * this.pageSize > this.boxItems.length) {
                this.pageNumber = this.pageNumber > 1 ? this.pageNumber - 1 : 1;
                await this.renderBoxItems();
            }
        },

        async assertRefreshWord(): Promise<void> {
            NativeStorage.getUpdatedVocabulary()
                .then((updatedVocabulary) => {
                    if (!isEmpty(updatedVocabulary)) {
                        this.updateWord(updatedVocabulary.id, updatedVocabulary.word);
                    }
                })
                .catch();
        },

        updateWord(vocabularyId: string, word: string): void {
            const itemIndex = findIndex(this.boxItems, (boxItem) => {
                return boxItem.vocabularyId === vocabularyId;
            });
            if (itemIndex !== -1) {
                this.boxItems[itemIndex].word = word;
            }
        },
    },
});
</script>

<style scoped>
.empty-state-animation {
    width: min(160px, 50%);
}

/* Keep the reduced-motion fallback at the size the FontAwesome icon used to have. */
.empty-state-animation :deep(.lottie-animation__fallback) {
    font-size: clamp(3rem, 9vw, 4.5rem);
}

.empty-state-animation :deep(.lottie-animation__fallback svg) {
    width: 1em;
    height: 1em;
}

.mastered-feedback {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.mastered-feedback__animation {
    width: min(180px, 50%);
}

.updated-at {
    padding-top: unset;
    padding-bottom: unset;
    opacity: inherit;
    color: var(--ion-text-color-step-300);
    font-weight: var(--font-weight-medium);
}

ion-card-header {
    padding-bottom: var(--space-2xs);
}

ion-card-content {
    padding-top: var(--space-2xs);
    padding-bottom: var(--space-sm);
}

.item-container:last-of-type {
    margin-bottom: calc(var(--ion-margin) / 2);
}

/* The actions under each word: 44px targets, spaced well apart so a thumb
   cannot easily land on the neighbouring button. */
.item-actions {
    gap: var(--space-md);
}

.item-container ion-button {
    width: 44px;
    height: 44px;
    margin: 0;
    --padding-start: 0;
    --padding-end: 0;
}

/* The arrows change which box the word lives in; keep the details action away
   from them so it is not hit by mistake. */
.item-container ion-button.item-actions__details {
    margin-inline-start: var(--space-md);
}

.leitner-icon {
    color: var(--ion-color-primary);
    padding-left: calc(var(--ion-padding) / 2);
    padding-right: calc(var(--ion-padding) / 2);
}
</style>
