<template>
    <!-- All credit goes to Google -->
    <div class="qJTHM" data-new-gr-c-s-check-loaded="14.1086.0" data-gr-ext-installed="">
        <div id="container" class="haAclf" style="padding: 2px 10px">
            <div
                tabindex="0"
                role="button"
                aria-labelledby="button-label"
                class="nsm7Bb-HzV7m-LgbsSe hJDwNd-SxQuSe MFS4be-JaPV2b-Ia7Qfc MFS4be-Ia7Qfc uaxL4e-RbRzK"
            >
                <div class="nsm7Bb-HzV7m-LgbsSe-MJoBVe"></div>
                <div class="nsm7Bb-HzV7m-LgbsSe-bN97Pc-sM5MNb">
                    <div class="nsm7Bb-HzV7m-LgbsSe-Bz112c-haAclf">
                        <div class="nsm7Bb-HzV7m-LgbsSe-Bz112c">
                            <google-icon />
                        </div>
                    </div>
                    <span class="nsm7Bb-HzV7m-LgbsSe-BPrWId">Continue with Google</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GoogleIcon from '@/media/GoogleIcon.vue';

export default defineComponent({
    name: 'ContinueWithGoogle',
    components: { GoogleIcon },
});
</script>

<style scoped></style>
