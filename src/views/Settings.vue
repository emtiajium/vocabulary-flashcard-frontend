<template>
    <ion-popover :is-open="isSettingsPopoverOpened" @didDismiss="closeSettingsPopover" css-class="settings-popover">
        <ion-content class="container">
            <ion-list-header class="header-container">
                <ion-card-title class="title"> Settings </ion-card-title>
                <ion-button shape="round" size="small" color="warning" class="close" @click="closeSettingsPopover">
                    <font-awesome-icon :icon="faTimesCircle" class="close-icon" />
                </ion-button>
            </ion-list-header>

            <view class="contents-container">
                <ion-list lines="none">
                    <ion-list-header lines="inset">
                        <ion-card-subtitle> Sorting Preference </ion-card-subtitle>
                    </ion-list-header>

                    <ion-radio-group :value="selectedSort" @ionChange="setSelectedOption($event)">
                        <ion-item v-for="(label, value) in sortingOptions" :key="value">
                            <ion-label> {{ label }} </ion-label>
                            <ion-radio slot="end" :value="value" />
                        </ion-item>
                    </ion-radio-group>
                </ion-list>

                <ion-list lines="none">
                    <ion-list-header lines="inset">
                        <ion-card-subtitle> Filtering Preference </ion-card-subtitle>
                    </ion-list-header>

                    <ion-item>
                        <ion-label> Without definition only </ion-label>
                        <ion-toggle
                            slot="end"
                            :checked="isSetHavingEmptyDefinition"
                            @ionChange="setSelectedFiltering($event.detail.checked)"
                        />
                    </ion-item>
                </ion-list>
            </view>

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
    IonList,
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
} from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'Settings',
    components: {
        FontAwesomeIcon,
        IonPopover,
        IonList,
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
                word_DESC: 'Word (alphabetically first)',
            },
            selectedSortingOption: this.selectedSort,
            isSetHavingEmptyDefinition: this.fetchNotHavingDefinitionOnly,
        };
    },
    props: [
        'isSettingsPopoverOpened',
        'selectedSort',
        'closeSettingsPopover',
        'onChangeSort',
        'applySettings',
        'fetchNotHavingDefinitionOnly',
        'onChangeFetchNotHavingDefinitionOnly',
    ],
    methods: {
        async onApplyingSettings(): Promise<void> {
            this.onChangeSort(this.selectedSortingOption);
            this.onChangeFetchNotHavingDefinitionOnly(this.isSetHavingEmptyDefinition);
            this.closeSettingsPopover();
            await this.applySettings();
        },

        setSelectedOption(event: CustomEvent): void {
            this.selectedSortingOption = event.detail.value;
        },

        setSelectedFiltering(isChecked: boolean): void {
            this.isSetHavingEmptyDefinition = isChecked;
        },
    },
});
</script>

<style scoped>
.container {
    height: 100vh;
}
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
    height: calc(100vh - 124px); /* 124 = 62 + 62; 62 = toolbar's height */
    overflow-y: auto;
    background-color: var(--ion-item-background);
}
.footer-container {
    height: 62px;
    background-color: var(--ion-item-background);
    padding-right: 16px;
}
.apply-button {
    width: 100vw;
    margin-inline: unset;
}
</style>
