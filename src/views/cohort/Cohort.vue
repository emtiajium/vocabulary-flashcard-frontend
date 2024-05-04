<template>
    <ion-page>
        <firecracker-header header-title="My Cohort" content-id="cohort" menu-id="cohort-menu" />
        <ion-content :fullscreen="true" id="cohort">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <spinner v-if="!isReady" />

                    <network-error v-if="isNetworkError && isReady" />

                    <view v-if="isReady && !isNetworkError && isTheUserAlone()">
                        <ion-card-header>
                            <ion-card-subtitle class="ion-text-center email-container">
                                Looks like you are the only member of your group. If you want to create a group with
                                your friends, please email the app admin at
                                <a href="mailto:271emtiaj@gmail.com?subject=Cohort Creation!">271emtiaj@gmail.com</a>
                                with the cohort's name and all members' emails.
                            </ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content class="display-flex ion-justify-content-center">
                            <img src="/assets/icon/diversity.svg" alt="Cohort" class="empty-cohort-icon" />
                        </ion-card-content>
                    </view>

                    <ion-card v-if="isReady && !isNetworkError && !isTheUserAlone()" class="margin-top-unset">
                        <ion-card-title class="display-flex ion-justify-content-center name-container">
                            {{ cohort.name }}
                        </ion-card-title>
                    </ion-card>

                    <view v-if="isReady && !isNetworkError && !isTheUserAlone()">
                        <view v-for="user in cohort.users" :key="user.username">
                            <ion-card>
                                <ion-card-content>
                                    <ion-row>
                                        <ion-col sizeXs="4" sizeSm="4" sizeMd="6" sizeLg="6" sizeXl="6" class="avatar">
                                            <img
                                                :src="
                                                    user.profilePictureUrl ||
                                                    `https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y`
                                                "
                                                :alt="`${user.name}'s avatar`"
                                                class="rounded-circle ion-padding"
                                                width="100"
                                            />
                                        </ion-col>
                                        <ion-col
                                            sizeXs="8"
                                            sizeSm="8"
                                            sizeMd="6"
                                            sizeLg="6"
                                            sizeXl="6"
                                            class="profile-info"
                                        >
                                            <ion-card-subtitle class="ion-text-capitalize">
                                                {{ user.name }}
                                            </ion-card-subtitle>
                                            <ion-card-subtitle class="ion-padding-top">
                                                {{ user.username }}
                                            </ion-card-subtitle>
                                        </ion-col>
                                    </ion-row>
                                </ion-card-content>
                            </ion-card>
                        </view>

                        <ion-card-header>
                            <ion-card-subtitle class="ion-text-center email-container">
                                Please <a href="mailto:271emtiaj@gmail.com?subject=Cohort Modification!">email</a> the
                                app admin if you want to add new members or remove existing members with the cohort's
                                name and all members' emails.
                            </ion-card-subtitle>
                        </ion-card-header>
                    </view>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Spinner from '@/views/shared/Spinner.vue';
import Cohort from '@/domains/Cohort';
import {
    IonCard,
    IonCardContent,
    IonContent,
    IonPage,
    IonCardTitle,
    IonCardSubtitle,
    IonRow,
    IonCol,
    IonCardHeader,
} from '@ionic/vue';
import FirecrackerHeader from '@/views/shared/FirecrackerHeader.vue';
import NetworkError from '@/views/shared/NetworkError.vue';
import HttpHandler from '@/utils/HttpHandler';

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
    async ionViewDidEnter() {
        await this.init();
    },
    ionViewWillLeave() {
        this.clean();
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
        clean(): void {
            this.isReady = false;
            this.isNetworkError = false;
            this.cohort = {} as Cohort;
        },
    },
});
</script>

<style scoped>
.name-container {
    padding-top: calc(var(--ion-padding) / 2);
    padding-bottom: calc(var(--ion-padding) / 2);
}
.avatar {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
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
