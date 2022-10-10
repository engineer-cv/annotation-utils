import Vue from "vue";
import Router from "vue-router";
import Annotate from "@/views/Annotate.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "annotate",
            component: Annotate,
        },
    ],
});
