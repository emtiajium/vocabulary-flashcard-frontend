<template>
    <ion-page>
        <firecracker-header header-title="My Cohort" content-id="cohort" menu-id="cohort-menu" />
        <ion-content id="cohort">
            <ion-card v-if="!isReady">
                <ion-card-content>
                    <spinner />
                </ion-card-content>
            </ion-card>

            <ion-card v-if="isReady && cohort.users.length === 1">
                <ion-card-content>
                    <empty-container
                        v-if="isReady && cohort.users.length === 1"
                        message="Looks like you are the only member of your group. Please let us know if you would like to create your own group."
                    />
                </ion-card-content>
            </ion-card>

            <ion-card v-if="isReady && cohort.users.length > 1">
                <ion-card-content>
                    <ion-card-title class="display-flex ion-justify-content-center"> {{ cohort.name }} </ion-card-title>
                </ion-card-content>
            </ion-card>

            <view v-if="isReady && cohort.users.length > 1">
                <view v-for="user in cohort.users" :key="user.username">
                    <ion-card>
                        <ion-card-content>
                            <ion-grid>
                                <ion-row>
                                    <ion-col size="4">
                                        <img
                                            :src="
                                                user.profilePictureUrl ||
                                                `https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y`
                                            "
                                            alt="Avatar"
                                            class="rounded-circle ion-padding"
                                            width="100"
                                        />
                                    </ion-col>
                                    <ion-col size="8" class="profile-info">
                                        <ion-card-subtitle class="ion-text-capitalize">
                                            {{ `${user.firstname.trim()} ${(user.lastname || '').trim()}`.trim() }}
                                        </ion-card-subtitle>
                                        <ion-card-subtitle class="ion-padding-top">
                                            {{ user.username }}
                                        </ion-card-subtitle>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-card-content>
                    </ion-card>
                </view>
            </view>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/Spinner.vue';
import Cohort from '@/domains/Cohort';
import EmptyContainer from '@/views/EmptyContainer.vue';
import {
    IonCard,
    IonCardContent,
    IonContent,
    IonPage,
    IonCardTitle,
    IonCardSubtitle,
    IonGrid,
    IonRow,
    IonCol,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import HttpHandler from '../utils/HttpHandler';
import NativeStorage from '../utils/NativeStorage';

export default defineComponent({
    name: 'Cohort',
    components: {
        FirecrackerHeader,
        EmptyContainer,
        Spinner,
        IonPage,
        IonContent,
        IonCard,
        IonCardContent,
        IonCardTitle,
        IonCardSubtitle,
        IonGrid,
        IonRow,
        IonCol,
    },
    data() {
        return {
            isReady: false,
            cohort: {} as Cohort,
        };
    },
    async mounted() {
        const cohortId = await NativeStorage.getCohortId();
        this.cohort = (await HttpHandler.get<Cohort>(`/v1/cohorts/${cohortId}`)) as Cohort;
        this.isReady = true;
    },
});
</script>

<style scoped>
.profile-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}
</style>
