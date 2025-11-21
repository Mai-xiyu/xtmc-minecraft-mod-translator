import { API_BASE } from '../config.js';

export default {
    template: `
        <div class="max-w-4xl mx-auto space-y-8">
            <h2 class="text-3xl font-bold text-cyber-primary font-pixel glitch-text" :data-text="$t('stats.title')">{{ $t('stats.title') }}</h2>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-cyber-dark p-8 rounded-none border border-cyber-primary/20 hover:border-cyber-primary transition group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-cyber-primary/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <div class="text-center relative z-10">
                        <div class="text-6xl font-bold text-cyber-primary mb-2 font-pixel glitch-text" :data-text="stats.visits || 0">{{ stats.visits || 0 }}</div>
                        <div class="text-xl text-gray-400 font-tech uppercase tracking-widest">{{ $t('stats.visits') }}</div>
                    </div>
                </div>
                
                <div class="bg-cyber-dark p-8 rounded-none border border-cyber-secondary/20 hover:border-cyber-secondary transition group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-cyber-secondary/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <div class="text-center relative z-10">
                        <div class="text-6xl font-bold text-cyber-secondary mb-2 font-pixel glitch-text" :data-text="stats.usage || 0">{{ stats.usage || 0 }}</div>
                        <div class="text-xl text-gray-400 font-tech uppercase tracking-widest">{{ $t('stats.usage') }}</div>
                    </div>
                </div>
            </div>

            <!-- Info Card -->
            <div class="bg-cyber-dark p-6 rounded-none border border-gray-700 relative">
                <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gray-500"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gray-500"></div>
                <h3 class="text-xl font-bold text-white mb-4 font-pixel">{{ $t('stats.info_title') }}</h3>
                <ul class="space-y-2 text-gray-400 font-tech">
                    <li class="flex items-center gap-2">
                        <span class="text-cyber-primary">>></span> {{ $t('stats.info_visits') }}
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-cyber-primary">>></span> {{ $t('stats.info_usage') }}
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-cyber-primary">>></span> {{ $t('stats.info_lang') }}
                    </li>
                </ul>
            </div>

            <!-- Refresh Button -->
            <div class="text-center">
                <button @click="loadStats" class="bg-cyber-primary text-black font-bold py-2 px-6 rounded-none hover:bg-white hover:scale-105 transition font-pixel text-xs uppercase tracking-widest relative overflow-hidden group">
                    <span class="relative z-10">{{ $t('stats.refresh') }}</span>
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
        </div>
    `,
    data() {
        return {
            stats: {
                visits: 0,
                usage: 0
            }
        };
    },
    mounted() {
        this.loadStats();
    },
    methods: {
        async loadStats() {
            try {
                const response = await fetch(`${API_BASE}/stats`);
                if (response.ok) {
                    this.stats = await response.json();
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
    }
};
