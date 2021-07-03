<template>
    <view v-for="(item, index) in placeholderItems" :key="item">
        <ion-grid>
            <ion-row>
                <ion-col size="8">
                    <ion-textarea
                        autoGrow="true"
                        inputmode="text"
                        :value="items[index] || ''"
                        @keyup="insertItem($event.target.value, index)"
                    ></ion-textarea>
                </ion-col>
                <ion-col size="4">
                    <ion-row class="action-buttons">
                        <ion-item lines="none">
                            <ion-button
                                v-show="
                                    items.length > 0 &&
                                    index === placeholderItems.length - 1 &&
                                    items[index]?.length > 0
                                "
                                color="success"
                                @click="onAddMoreItem"
                            >
                                <font-awesome-icon :icon="faPlusCircle" />
                            </ion-button>
                            <ion-button
                                v-show="items.length > 0 && items[index]?.length > 0"
                                color="danger"
                                @click="onRemoveLastItem(index)"
                            >
                                <font-awesome-icon :icon="faMinusCircle" />
                            </ion-button>
                        </ion-item>
                    </ion-row>
                </ion-col>
            </ion-row>
        </ion-grid>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTextarea, IonItem, IonButton, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { v4 as uuidV4 } from 'uuid';
import * as _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
    name: 'AddRemoveMultipleItems',
    components: {
        IonTextarea,
        IonItem,
        IonButton,
        IonGrid,
        IonRow,
        IonCol,
        FontAwesomeIcon,
    },
    props: ['existingItems'],
    data() {
        const placeholderItems = _.fill(_.times(this.existingItems?.length || 1), uuidV4());
        return {
            faPlusCircle,
            faMinusCircle,
            placeholderItems,
            items: (this.existingItems || []) as string[],
        };
    },
    methods: {
        insertItem(item: string, index: number) {
            if (!item) {
                this.removeItem(index);
            } else {
                this.items[index] = item.trim();
            }
        },
        onAddMoreItem() {
            this.placeholderItems.push(uuidV4());
        },
        removeItem(removableIndex: number) {
            this.items = this.items.filter((word, index) => index !== removableIndex);
        },
        onRemoveLastItem(removableIndex: number) {
            if (removableIndex !== 0) {
                this.placeholderItems.pop();
            }
            this.removeItem(removableIndex);
        },
        getItems() {
            return this.items.filter((item) => item.length > 0);
        },
        clear() {
            this.items = [];
            this.placeholderItems = [uuidV4()];
        },
    },
});
</script>

<style scoped>
.action-buttons {
    display: flex;
    justify-content: flex-end;
}
</style>
