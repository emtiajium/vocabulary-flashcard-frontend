<template>
    <ion-popover :is-open="isSettingsPopoverOpened" @didDismiss="closeSettingsPopover" css-class="settings-popover">
        <ion-content class="settings-container">
            <ion-list-header class="header-container">
                <ion-card-title class="title"> Settings </ion-card-title>
                <ion-button shape="round" size="small" color="primary" class="close" @click="closeSettingsPopover">
                    <font-awesome-icon :icon="faTimesCircle" class="close-icon" />
                </ion-button>
            </ion-list-header>

            <ion-accordion-group class="contents-container" :multiple="true" :value="['first']">
                <ion-accordion value="first" class="ion-padding-bottom">
                    <ion-item slot="header" lines="inset">
                        <ion-card-subtitle> Searching Preference </ion-card-subtitle>
                    </ion-item>

                    <div slot="content">
                        <ion-item v-for="(value, option) in searchingOptions" :key="option" lines="none">
                            <ion-label> {{ value.label }} </ion-label>
                            <ion-toggle
                                slot="end"
                                :checked="innerVocabularySearchCoverage[option]"
                                :disabled="value.isDisabled"
                                @ionChange="setSearchingOption(option, $event.detail.checked)"
                            />
                        </ion-item>
                    </div>
                </ion-accordion>

                <ion-accordion value="second" class="ion-padding-bottom">
                    <ion-item slot="header" lines="inset">
                        <ion-card-subtitle> Filtering Preference </ion-card-subtitle>
                    </ion-item>
                    <div slot="content">
                        <ion-item lines="none">
                            <ion-label> Show only draft vocab </ion-label>
                            <ion-toggle
                                slot="end"
                                :checked="innerFetchNotHavingDefinitionOnly"
                                @ionChange="
                                    setSelectedFiltering('innerFetchNotHavingDefinitionOnly', $event.detail.checked)
                                "
                            />
                        </ion-item>

                        <ion-item lines="none">
                            <ion-label> Show flashcard in boxes </ion-label>
                            <ion-toggle
                                slot="end"
                                :checked="innerFetchFlashcard"
                                @ionChange="setSelectedFiltering('innerFetchFlashcard', $event.detail.checked)"
                            />
                        </ion-item>
                    </div>
                </ion-accordion>

                <ion-accordion value="third" class="ion-padding-bottom">
                    <ion-item slot="header" lines="inset">
                        <ion-card-subtitle> Sorting Preference </ion-card-subtitle>
                    </ion-item>
                    <div slot="content">
                        <ion-radio-group
                            :value="innerSelectedSort"
                            @ionChange="setSelectedSortingOption($event.detail.value)"
                        >
                            <ion-item v-for="(label, value) in sortingOptions" :key="value" lines="none">
                                <ion-label> {{ label }} </ion-label>
                                <ion-radio slot="end" :value="value" />
                            </ion-item>
                        </ion-radio-group>
                    </div>
                </ion-accordion>
            </ion-accordion-group>

            <ion-list-header class="footer-container">
                <ion-button color="success" fill="solid" class="apply-button" @click="onApplyingSettings">
                    Apply
                </ion-button>
            </ion-list-header>
        </ion-content>
    </ion-popover>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPopover,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    IonListHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonContent,
    IonToggle,
    IonAccordionGroup,
    IonAccordion,
} from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'Settings',
    components: {
        FontAwesomeIcon,
        IonPopover,
        IonItem,
        IonLabel,
        IonRadioGroup,
        IonRadio,
        IonListHeader,
        IonCardSubtitle,
        IonButton,
        IonCardTitle,
        IonContent,
        IonToggle,
        IonAccordionGroup,
        IonAccordion,
    },
    data() {
        return {
            faTimesCircle,
            sortingOptions: {
                createdAt_DESC: 'Date created (newest first)',
                createdAt_ASC: 'Date created (oldest first)',
                updatedAt_DESC: 'Date updated (newest first)',
                updatedAt_ASC: 'Date updated (oldest first)',
                word_ASC: 'Word (alphabetically first)',
                word_DESC: 'Word (alphabetically last)',
            },
            innerSelectedSort: this.selectedSort,
            innerFetchNotHavingDefinitionOnly: this.fetchNotHavingDefinitionOnly,
            innerFetchFlashcard: this.fetchFlashcard,
            searchingOptions: {
                word: { label: 'Word', isDisabled: true },
                meaning: { label: 'Meaning', isDisabled: false },
                examples: { label: 'Example', isDisabled: false },
                notes: { label: 'Note', isDisabled: false },
                linkerWords: { label: 'Relatable word', isDisabled: false },
                genericNotes: { label: 'Generic note', isDisabled: false },
            },
            innerVocabularySearchCoverage: this.vocabularySearchCoverage,
            setAppHeight: (): void => {
                // reading material: https://ilxanlar.medium.com/you-shouldnt-rely-on-css-100vh-and-here-s-why-1b4721e74487
                // had to do it because the apply  button doesn't show when I browse the "web" app using "Android mobile"
                document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
            },
        };
    },
    props: [
        'isSettingsPopoverOpened',
        'selectedSort',
        'closeSettingsPopover',
        'onChangeSort',
        'applySettings',
        'fetchNotHavingDefinitionOnly',
        'fetchFlashcard',
        'onChangeFetchNotHavingDefinitionOnly',
        'onChangeFetchFlashcard',
        'vocabularySearchCoverage',
        'onChangeSearchingCoverage',
    ],
    watch: {
        isSettingsPopoverOpened(newValue: boolean, oldValue: boolean): void {
            const isOpen = newValue && !oldValue;
            if (isOpen) {
                this.setCurrentSettings();
            }
        },
    },
    mounted(): void {
        window.addEventListener('resize', this.setAppHeight);
        this.setAppHeight();
    },
    beforeUnmount(): void {
        window.removeEventListener('resize', this.setAppHeight);
    },
    methods: {
        async onApplyingSettings(): Promise<void> {
            this.onChangeSort(this.innerSelectedSort);
            this.onChangeFetchNotHavingDefinitionOnly(this.innerFetchNotHavingDefinitionOnly);
            this.onChangeFetchFlashcard(this.innerFetchFlashcard);
            this.onChangeSearchingCoverage(this.innerVocabularySearchCoverage);
            this.closeSettingsPopover();
            await this.applySettings();
        },

        setSelectedSortingOption(innerSelectedSort: string): void {
            this.innerSelectedSort = innerSelectedSort;
        },

        setSelectedFiltering(
            type: 'innerFetchNotHavingDefinitionOnly' | 'innerFetchFlashcard',
            isChecked: boolean,
        ): void {
            this[type] = isChecked;
        },

        setSearchingOption(property: string, isChecked: boolean): void {
            this.innerVocabularySearchCoverage[property] = isChecked;
        },

        setCurrentSettings(): void {
            this.setSelectedSortingOption(this.selectedSort);
            this.setSelectedFiltering('innerFetchNotHavingDefinitionOnly', this.fetchNotHavingDefinitionOnly);
            this.setSelectedFiltering('innerFetchFlashcard', this.fetchFlashcard);
            Object.keys(this.vocabularySearchCoverage).forEach((key) => {
                this.setSearchingOption(key, this.vocabularySearchCoverage[key]);
            });
        },
    },
});
</script>

<style scoped>
.header-container {
    height: 62px; /* toolbar's height */
    background-color: var(--ion-toolbar-background);
}
.title {
    width: 80vw;
    color: var(--ion-color-white);
}
.close {
    width: 20vw;
}
.close-icon {
    font-size: 20px;
    color: var(--ion-color-white);
}
.contents-container {
    display: block;
    height: calc(var(--app-height) - 124px); /* 124 = 62 + 62; 62 = toolbar's height */
    overflow-y: auto;
    background-color: var(--ion-item-background);
}
ion-accordion {
    background-color: var(--ion-item-background);
}
.footer-container {
    height: 62px;
    background-color: var(--ion-item-background);
    padding-right: var(--ion-padding);
}
.apply-button {
    width: 100vw;
    margin-inline: unset;
}
</style>
