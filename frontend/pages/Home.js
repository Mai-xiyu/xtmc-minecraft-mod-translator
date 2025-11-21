import { API_BASE } from '../config.js';

export default {
    template: `
        <div class="space-y-12">
            <section class="text-center py-20 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-cyber-primary/10 to-transparent pointer-events-none"></div>
                <h1 class="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary animate-pulse font-pixel glitch" :data-text="$t('home.title')">
                    {{ $t('home.title') }}
                </h1>
                <p class="text-xl text-gray-400 mb-8 font-tech tracking-wide">{{ $t('home.subtitle') }}</p>
                <p class="max-w-2xl mx-auto text-gray-300 leading-relaxed font-tech text-lg">
                    {{ $t('home.desc') }}
                </p>
            </section>

            <section class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div class="bg-cyber-dark border border-cyber-primary/30 p-8 rounded-lg text-center hover:border-cyber-primary transition duration-500 group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-primary"></div>
                    <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-primary"></div>
                    <h3 class="text-2xl text-gray-400 mb-2 font-tech">{{ $t('home.visits') }}</h3>
                    <div class="text-4xl md:text-5xl font-pixel text-cyber-primary group-hover:scale-110 transition transform mt-4">{{ stats.visits }}</div>
                </div>
                <div class="bg-cyber-dark border border-cyber-secondary/30 p-8 rounded-lg text-center hover:border-cyber-secondary transition duration-500 group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-secondary"></div>
                    <div class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-secondary"></div>
                    <h3 class="text-2xl text-gray-400 mb-2 font-tech">{{ $t('home.usage') }}</h3>
                    <div class="text-4xl md:text-5xl font-pixel text-cyber-secondary group-hover:scale-110 transition transform mt-4">{{ stats.usage }}</div>
                </div>
            </section>

            <!-- Features Introduction -->
            <section class="max-w-4xl mx-auto space-y-6">
                <h2 class="text-3xl font-bold text-cyber-primary text-center mb-8 font-pixel">{{ $t('home.features_title') }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-cyber-dark border border-gray-700 p-6 rounded-lg hover:border-cyber-primary/50 transition group hover:bg-cyber-primary/5">
                        <div class="flex items-center gap-3 mb-3">
                            <svg class="w-8 h-8 text-cyber-primary group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                            </svg>
                            <h3 class="text-xl font-semibold text-white font-tech">{{ $t('home.feature1_title') }}</h3>
                        </div>
                        <p class="text-gray-400 font-tech">{{ $t('home.feature1_desc') }}</p>
                    </div>
                    <div class="bg-cyber-dark border border-gray-700 p-6 rounded-lg hover:border-cyber-primary/50 transition group hover:bg-cyber-secondary/5">
                        <div class="flex items-center gap-3 mb-3">
                            <svg class="w-8 h-8 text-cyber-secondary group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                            </svg>
                            <h3 class="text-xl font-semibold text-white font-tech">{{ $t('home.feature2_title') }}</h3>
                        </div>
                        <p class="text-gray-400 font-tech">{{ $t('home.feature2_desc') }}</p>
                    </div>
                    <div class="bg-cyber-dark border border-gray-700 p-6 rounded-lg hover:border-cyber-primary/50 transition group hover:bg-cyber-accent/5">
                        <div class="flex items-center gap-3 mb-3">
                            <svg class="w-8 h-8 text-green-400 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <h3 class="text-xl font-semibold text-white font-tech">{{ $t('home.feature3_title') }}</h3>
                        </div>
                        <p class="text-gray-400 font-tech">{{ $t('home.feature3_desc') }}</p>
                    </div>
                    <div class="bg-cyber-dark border border-gray-700 p-6 rounded-lg hover:border-cyber-primary/50 transition group hover:bg-cyber-secondary/5">
                        <div class="flex items-center gap-3 mb-3">
                            <svg class="w-8 h-8 text-blue-400 group-hover:rotate-180 transition duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <h3 class="text-xl font-semibold text-white font-tech">{{ $t('home.feature4_title') }}</h3>
                        </div>
                        <p class="text-gray-400 font-tech">{{ $t('home.feature4_desc') }}</p>
                    </div>
                </div>
            </section>

            <!-- Disclaimer -->
            <section class="max-w-4xl mx-auto">
                <div class="bg-cyber-dark/50 border border-red-900/50 rounded-lg p-6 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                    <div class="flex items-start gap-4 relative z-10">
                        <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div>
                            <h3 class="text-xl font-bold text-red-500 mb-3 font-pixel">{{ $t('home.disclaimer_title') }}</h3>
                            <div class="text-gray-300 space-y-2 font-tech">
                                <p>{{ $t('home.disclaimer_1') }}</p>
                                <p>{{ $t('home.disclaimer_2') }}</p>
                                <p>{{ $t('home.disclaimer_3') }}</p>
                                <p class="text-orange-400 font-semibold">{{ $t('home.disclaimer_4') }}</p>
                                <p class="text-red-400 font-semibold mt-4 border-t border-red-900/30 pt-2">{{ $t('home.disclaimer_5') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `,
    data() {
        return {
            stats: { visits: 0, usage: 0 }
        }
    },
    methods: {
        animateValue(key, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                // Ease out cubic (smoother, less aggressive start)
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                this.stats[key] = Math.floor(start + (end - start) * easeProgress);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    this.stats[key] = end;
                }
            };
            window.requestAnimationFrame(step);
        }
    },
    async mounted() {
        try {
            const res = await fetch(`${API_BASE}/stats`);
            if (res.ok) {
                const targetStats = await res.json();
                // Increased duration to 3.5s for slower animation
                this.animateValue('visits', 0, targetStats.visits || 0, 3500);
                this.animateValue('usage', 0, targetStats.usage || 0, 3500);
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    }
}
