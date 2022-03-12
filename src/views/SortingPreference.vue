<template>
    <ion-popover :is-open="isSettingsPopoverOpened" @didDismiss="closeSettingsPopover" css-class="settings-popover">
        <ion-list lines="none" class="container">
            <ion-radio-group :value="selectedSort" @ionChange="setSelectedOption($event)">
                <ion-list-header class="title-container">
                    <ion-label class="title"> Sorting Preference </ion-label>
                    <ion-button shape="round" size="small" color="warning" class="close" @click="closeSettingsPopover">
                        <font-awesome-icon :icon="faTimesCircle" class="close-icon" />
                    </ion-button>
                </ion-list-header>

                <ion-item>
                    <ion-card-subtitle> Date created (newest first) </ion-card-subtitle>
                    <ion-radio slot="end" value="createdAt_DESC" />
                </ion-item>
                <ion-item>
                    <ion-card-subtitle> Date created (oldest first) </ion-card-subtitle>
                    <ion-radio slot="end" value="createdAt_ASC" />
                </ion-item>
                <ion-item>
                    <ion-card-subtitle> Date updated (newest first) </ion-card-subtitle>
                    <ion-radio slot="end" value="updatedAt_DESC" />
                </ion-item>
                <ion-item>
                    <ion-card-subtitle> Date updated (oldest first) </ion-card-subtitle>
                    <ion-radio slot="end" value="updatedAt_ASC" />
                </ion-item>
                <ion-item>
                    <ion-card-subtitle> Word (alphabetically first) </ion-card-subtitle>
                    <ion-radio slot="end" value="word_ASC" />
                </ion-item>
                <ion-item>
                    <ion-card-subtitle> Word (alphabetically last) </ion-card-subtitle>
                    <ion-radio slot="end" value="word_DESC" />
                </ion-item>
            </ion-radio-group>

            <ion-item class="apply-button-container">
                <ion-button color="success" fill="solid" size="default" class="apply-button" @click="onApplyingSort">
                    Apply
                </ion-button>
            </ion-item>
        </ion-list>
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
    IonCardSubtitle,
    IonButton,
} from '@ionic/vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'SortingPreference',
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
    height: 100vh !important;
    position: relative;
}
.apply-button-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}
.apply-button {
    margin-top: 20px;
    margin-bottom: 15px;
    width: 100vw;
}
.title-container {
    margin-top: 15px;
    margin-bottom: 15px;
}
.title {
    width: 80vw;
}
.close {
    width: 20vw;
}
.close-icon {
    font-size: 20px;
}
</style>
