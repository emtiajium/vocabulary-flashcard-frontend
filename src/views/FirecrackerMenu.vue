<template>
    <ion-menu side="start" :menu-id="menuId" :content-id="contentId">
        <ion-content>
            <div class="profile ion-padding-bottom">
                <img :src="profilePictureUrl" alt="Avatar" class="rounded-circle ion-padding" width="100" />
                <div class="ion-padding-start">
                    <strong class="item-text ion-text-capitalize">{{ fullName }}</strong>
                    <br />
                    <span class="ion-padding-top item-text">{{ username }}</span>
                </div>
            </div>
            <ion-list>
                <ion-item button @click="$router.push('/vocabularies')">
                    <font-awesome-icon :icon="faBook" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Vocabularies </ion-label>
                </ion-item>
                <ion-item button @click="$router.push('/cohort')">
                    <font-awesome-icon :icon="faUsers" class="menu-icon" />
                    <ion-label class="ion-padding-start"> My Cohort </ion-label>
                </ion-item>
                <ion-item button @click="signOut">
                    <font-awesome-icon :icon="faSignOutAlt" class="menu-icon" />
                    <ion-label class="ion-padding-start"> Sign Out </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonContent, IonItem, IonList, IonMenu, menuController, IonLabel } from '@ionic/vue';
import NativeStorage from '@/utils/NativeStorage';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faUsers, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'FirecrackerMenu',
    components: {
        IonContent,
        IonItem,
        IonList,
        IonMenu,
        IonLabel,
        FontAwesomeIcon,
    },
    props: ['contentId', 'menuId'],
    data() {
        return {
            profilePictureUrl: '',
            username: '',
            fullName: '',
            faBook,
            faUsers,
            faSignOutAlt,
        };
    },
    async mounted() {
        const user = await NativeStorage.getAuthorizedUser();
        this.profilePictureUrl =
            user.profilePictureUrl || `https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y`;
        this.username = user.username as string;
        this.fullName = `${user.firstname?.trim()} ${(user.lastname || '').trim()}`.trim();
    },
    methods: {
        toggleMenu() {
            menuController.enable(true, this.menuId);
            menuController.open(this.menuId);
        },
        async signOut() {
            await NativeStorage.removeAuthorizedUser();
            await menuController.close();
            await this.$router.push('/sign-in');
        },
    },
});
</script>

<style scoped>
.profile {
    background-color: #2e8b57;
}
.item-text {
    color: #ffffff;
}
.menu-icon {
    color: #2e8b57;
}
</style>
