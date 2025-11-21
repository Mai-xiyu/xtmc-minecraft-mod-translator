export default {
    template: `
        <div class="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-cyber-dark/50 z-0"></div>
            <div class="relative z-10">
                <h1 class="text-9xl font-bold text-cyber-primary font-pixel glitch-text" data-text="404">404</h1>
                <div class="space-y-4 mt-8">
                    <h2 class="text-3xl font-bold text-white font-pixel">{{ $t('notfound.title') }}</h2>
                    <p class="text-gray-400 max-w-md mx-auto font-tech">{{ $t('notfound.desc') }}</p>
                </div>
                <router-link to="/" class="inline-block mt-8 px-8 py-3 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black transition rounded-none uppercase tracking-widest font-pixel text-xs relative group overflow-hidden">
                    <span class="relative z-10">{{ $t('notfound.back') }}</span>
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </router-link>
            </div>
        </div>
    `
}
