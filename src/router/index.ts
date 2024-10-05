import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

// Define the routes with types
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/SolarSystem.vue')
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes
});

// Export the router
export default router;
