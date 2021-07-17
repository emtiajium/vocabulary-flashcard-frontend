<template>
    <ion-page>
        <firecracker-header header-title="My Cohort" content-id="cohort" menu-id="cohort-menu" />
        <ion-content id="cohort">
            <spinner v-if="!isReady" />

            <network-error v-if="isNetworkError && isReady" />

            <ion-card v-if="isReady && !isNetworkError && isTheUserAlone()">
                <ion-card-header>
                    <ion-card-subtitle class="ion-text-center">
                        Looks like you are the only member of your group. Please let us know if you would like to create
                        your own group.
                    </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content class="display-flex ion-justify-content-center">
                    <img src="/assets/icon/diversity.svg" alt="Cohort" class="empty-cohort-icon" />
                </ion-card-content>
            </ion-card>

            <ion-card v-if="isReady && !isNetworkError && !isTheUserAlone()">
                <ion-card-content>
                    <ion-card-title class="display-flex ion-justify-content-center"> {{ cohort.name }} </ion-card-title>
                </ion-card-content>
            </ion-card>

            <view v-if="isReady && !isNetworkError && !isTheUserAlone()">
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
                                            {{ user.name }}
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
    IonCardHeader,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/FirecrackerHeader.vue';
import NetworkError from '@/views/NetworkError.vue';
import HttpHandler from '@/utils/HttpHandler';
import Route from '@/domains/Route';

export default defineComponent({
    name: 'Cohort',
    components: {
        NetworkError,
        FirecrackerHeader,
        Spinner,
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
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
            isNetworkError: false,
            cohort: {} as Cohort,
        };
    },
    watch: {
        // TODO try Ionic framework lifecycle hook(s)
        '$route.name': 'reload',
    },
    async mounted() {
        await this.init();
    },
    methods: {
        async init(): Promise<void> {
            try {
                this.cohort = (await HttpHandler.get<Cohort>(`/v1/cohorts/self`)) as Cohort;
                this.isNetworkError = false;
            } catch (error) {
                this.isNetworkError = true;
            } finally {
                this.isReady = true;
            }
        },
        isTheUserAlone(): boolean {
            return this.cohort?.users?.length === 1;
        },
        async reload(): Promise<void> {
            if (this.$route.name === Route.DisplayCohort) {
                this.clean();
                await this.init();
            }
        },
        clean(): void {
            this.isReady = false;
            this.isNetworkError = false;
            this.cohort = {} as Cohort;
        },
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
.empty-cohort-icon {
    max-width: 15%;
}
</style>
