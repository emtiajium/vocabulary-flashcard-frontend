<template>
    <ion-page>
        <firecracker-header header-title="My Cohort" content-id="cohort" menu-id="cohort-menu" />
        <ion-content :fullscreen="true" id="cohort">
            <ion-row class="display-flex ion-justify-content-center">
                <ion-col sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                    <div v-if="!isReady" role="status" aria-label="Loading cohort">
                        <ion-card class="margin-top-unset" aria-hidden="true">
                            <ion-card-title class="display-flex ion-justify-content-center name-container">
                                <skeleton-text width="45%" height="calc(var(--text-lg) * var(--leading-snug))" />
                            </ion-card-title>
                        </ion-card>

                        <ion-card v-for="index in 3" :key="index" aria-hidden="true">
                            <ion-card-content>
                                <ion-row>
                                    <ion-col sizeXs="4" sizeSm="4" sizeMd="6" sizeLg="6" sizeXl="6" class="avatar">
                                        <div class="avatar-skeleton">
                                            <skeleton-text width="100%" height="100%" border-radius="50%" />
                                        </div>
                                    </ion-col>
                                    <ion-col
                                        sizeXs="8"
                                        sizeSm="8"
                                        sizeMd="6"
                                        sizeLg="6"
                                        sizeXl="6"
                                        class="profile-info"
                                    >
                                        <ion-card-subtitle class="profile-skeleton-line">
                                            <skeleton-text width="65%" height="var(--text-sm)" />
                                        </ion-card-subtitle>
                                        <ion-card-subtitle class="ion-padding-top profile-skeleton-line">
                                            <skeleton-text width="85%" height="var(--text-sm)" />
                                        </ion-card-subtitle>
                                    </ion-col>
                                </ion-row>
                            </ion-card-content>
                        </ion-card>

                        <ion-card-header class="cohort-skeleton-footer" aria-hidden="true">
                            <skeleton-text width="90%" height="var(--text-sm)" />
                            <skeleton-text width="75%" height="var(--text-sm)" />
                        </ion-card-header>
                    </div>

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
                            <lottie-animation
                                class="empty-cohort-icon"
                                :animation-data="cohortWaitingAnimation"
                                :loop="true"
                            >
                                <template #fallback>
                                    <img src="/assets/icon/diversity.svg" alt="Cohort" />
                                </template>
                            </lottie-animation>
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
import SkeletonText from '@/views/shared/SkeletonText.vue';
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
import LottieAnimation from '@/media/LottieAnimation.vue';
import cohortWaiting from '@/media/lottie/cohort-waiting.json';

export default defineComponent({
    name: 'Cohort',
    components: {
        NetworkError,
        FirecrackerHeader,
        SkeletonText,
        LottieAnimation,
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
            cohortWaitingAnimation: cohortWaiting,
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
    color: var(--ion-color-primary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-lg);
}
.avatar {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
.avatar img {
    border: 1px solid var(--app-border-color);
}
.profile-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}
.avatar-skeleton {
    width: min(100px, 100%);
    aspect-ratio: 1;
    flex-shrink: 0;
    padding: var(--ion-padding);
    border: 1px solid var(--app-border-color);
    border-radius: 50%;
    box-sizing: border-box;
}
.profile-skeleton-line {
    width: 100%;
    min-height: calc(var(--text-sm) * var(--leading-normal));
    display: flex;
    align-items: center;
}
.profile-skeleton-line.ion-padding-top {
    min-height: calc(var(--text-sm) * var(--leading-normal) + var(--ion-padding));
}
.cohort-skeleton-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
}
.empty-cohort-icon {
    width: min(160px, 50%);
}
</style>
