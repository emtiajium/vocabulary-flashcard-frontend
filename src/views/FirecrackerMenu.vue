<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <ion-content>
            <div class="profile ion-padding-bottom">
                <img :src="profilePictureUrl" alt="Avatar" class="rounded-circle ion-padding" width="100" />
                <div class="ion-padding-start">
                    <strong class="item-text">{{ fullName }}</strong>
                    <br />
                    <span class="ion-padding-top item-text">{{ username }}</span>
                </div>
            </div>
            <ion-list>
                <ion-item button @click="$router.push('/vocabularies')"> Vocabularies </ion-item>
                <ion-item>My Cohort</ion-item>
                <ion-item>Sign Out</ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonItem, IonList, IonMenu, menuController } from '@ionic/vue';
import NativeStorage from '@/utils/NativeStorage';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        IonContent,
        IonItem,
        IonList,
        IonMenu,
    },
    props: ['contentId', 'menuId'],
    data() {
        return {
            profilePictureUrl: '',
            username: '',
            fullName: '',
        };
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        this.profilePictureUrl = user.profilePictureUrl as string;
        this.username = user.username as string;
        this.fullName = `${user.firstname?.trim()} ${(user.lastname || '').trim()}`.trim();
    },
    methods: {
        toggleMenu() {
            menuController.enable(true, this.menuId);
            menuController.open(this.menuId);
        },
    },
});
</script>

<style scoped>
.profile {
    background-color: #2e8b57;
}
.rounded-circle {
    border-radius: 50%;
}
.item-text {
    color: #ffffff;
}
</style>
