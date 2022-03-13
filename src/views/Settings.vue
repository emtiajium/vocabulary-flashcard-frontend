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
                <ion-list lines="none" class="sorting-preference-container">
                    <ion-list-header lines="inset">
                        <ion-card-subtitle> Sorting Preference </ion-card-subtitle>
                    </ion-list-header>

                    <ion-radio-group :value="selectedSort" @ionChange="setSelectedOption($event)">
                        <ion-item>
                            <ion-label> Date created (newest first) </ion-label>
                            <ion-radio slot="end" value="createdAt_DESC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date created (oldest first) </ion-label>
                            <ion-radio slot="end" value="createdAt_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date updated (newest first) </ion-label>
                            <ion-radio slot="end" value="updatedAt_DESC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Date updated (oldest first) </ion-label>
                            <ion-radio slot="end" value="updatedAt_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Word (alphabetically first) </ion-label>
                            <ion-radio slot="end" value="word_ASC" />
                        </ion-item>
                        <ion-item>
                            <ion-label> Word (alphabetically last) </ion-label>
                            <ion-radio slot="end" value="word_DESC" />
                        </ion-item>
                    </ion-radio-group>
                </ion-list>
            </view>

            <ion-list-header class="footer-container">
                <ion-button color="success" fill="solid" class="apply-button" @click="onApplyingSort">
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
    },
    data() {
        return {
            faTimesCircle,
            selectedOption: this.selectedSort,
        };
    },
    props: ['isSettingsPopoverOpened', 'selectedSort', 'closeSettingsPopover', 'onChangeSort', 'applySorting'],
    methods: {
        async onApplyingSort(): Promise<void> {
            this.onChangeSort(this.selectedOption);
            this.closeSettingsPopover();
            await this.applySorting();
        },

        setSelectedOption(event: CustomEvent): void {
            this.selectedOption = event.detail.value;
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
