<template>
    <ion-popover :is-open="isPopoverOpened" @didDismiss="closeSettingsPopover" class="settings-popover">
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
                            <ion-toggle
                                justify="space-between"
                                :checked="innerVocabularySearchCoverage[option]"
                                :disabled="value.isDisabled"
                                @ionChange="setSearchingOption(option, $event.detail.checked)"
                            >
                                {{ value.label }}
                            </ion-toggle>
                        </ion-item>
                    </div>
                </ion-accordion>

                <ion-accordion value="second" class="ion-padding-bottom">
                    <ion-item slot="header" lines="inset">
                        <ion-card-subtitle> Filtering Preference </ion-card-subtitle>
                    </ion-item>
                    <div slot="content">
                        <ion-item lines="none">
                            <ion-toggle
                                justify="space-between"
                                :checked="innerFetchNotHavingDefinitionOnly"
                                @ionChange="
                                    setSelectedFiltering('innerFetchNotHavingDefinitionOnly', $event.detail.checked)
                                "
                            >
                                Show only draft vocab
                            </ion-toggle>
                        </ion-item>

                        <ion-item lines="none">
                            <ion-toggle
                                justify="space-between"
                                :checked="innerFetchFlashcard"
                                @ionChange="setSelectedFiltering('innerFetchFlashcard', $event.detail.checked)"
                            >
                                Show flashcard in boxes
                            </ion-toggle>
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
                                <ion-radio justify="space-between" :value="value">
                                    {{ label }}
                                </ion-radio>
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
            isPopoverOpened: true,
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
        };
    },
    props: [
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
    mounted() {
        this.setCurrentSettings();
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
ion-popover::part(content) {
    top: 0 !important;
    left: unset !important;
    right: 0 !important;
    border-radius: unset !important;
}
.settings-popover {
    --width: 295px;
    --height: 100vh;
    --height: 100svh;
    --max-height: 100vh;
    --max-height: 100svh;
}
.header-container {
    height: var(--vocab-settings-header-height);
    background-color: var(--ion-toolbar-background);
}
.title {
    width: 80vw;
    color: var(--ion-toolbar-color);
}
.close {
    width: 20vw;
}
.close-icon {
    font-size: 1.25rem;
    color: var(--ion-toolbar-color);
}
.contents-container {
    --app-height: 100vh;
    --app-height: 100svh;
    display: block;
    height: calc(var(--app-height) - var(--vocab-settings-header-height) - var(--vocab-settings-footer-height));
    overflow-y: auto;
    background-color: var(--ion-item-background);
}
ion-accordion {
    background-color: var(--ion-item-background);
}
.footer-container {
    height: var(--vocab-settings-footer-height);
    background-color: var(--ion-item-background);
    padding-right: var(--ion-padding);
}
.apply-button {
    width: 100vw;
    margin-inline: unset;
}
</style>
