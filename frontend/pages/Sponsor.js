export default {
    template: `
        <div class="max-w-4xl mx-auto text-center space-y-12 py-10">
            <h2 class="text-4xl font-bold text-cyber-primary mb-8 font-pixel glitch-text" :data-text="$t('sponsor.title')">{{ $t('sponsor.title') }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- WeChat -->
                <div class="bg-cyber-dark p-4 rounded-none border border-green-500/50 transform hover:scale-105 transition duration-300 relative group">
                    <div class="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src="https://raw.githubusercontent.com/Mai-xiyu/Minecraft_AI/refs/heads/master/resources/wechat.png" class="aspect-square object-contain mb-4 w-full border border-green-500/30" alt="WeChat QR">
                    <p class="text-green-400 font-bold font-pixel">{{ $t('sponsor.wechat') }}</p>
                </div>

                <!-- Alipay -->
                <div class="bg-cyber-dark p-4 rounded-none border border-blue-500/50 transform hover:scale-105 transition duration-300 relative group">
                    <div class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src="https://raw.githubusercontent.com/Mai-xiyu/Minecraft_AI/refs/heads/master/resources/alipay.png" class="aspect-square object-contain mb-4 w-full bg-white rounded-none border border-blue-500/30" alt="Alipay QR">
                    <p class="text-blue-400 font-bold font-pixel">{{ $t('sponsor.alipay') }}</p>
                </div>

                <!-- Afdian -->
                <a href="https://afdian.com/a/xiyu114514" target="_blank" class="bg-cyber-dark p-4 rounded-none border border-purple-500/50 transform hover:scale-105 transition duration-300 flex flex-col justify-center items-center text-white hover:bg-purple-900/20 relative group">
                    <div class="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="text-6xl mb-4 animate-bounce">⚡</div>
                    <p class="font-bold text-purple-400 font-pixel">{{ $t('sponsor.afdian') }}</p>
                </a>
            </div>

            <!-- Ad -->
            <div class="mt-16 p-8 border-2 border-dashed border-cyber-accent rounded-none bg-cyber-accent/10 relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-full h-1 bg-cyber-accent animate-scanline"></div>
                <p class="text-2xl text-cyber-accent font-bold mb-2 font-pixel glitch-text" data-text="ADVERTISEMENT">ADVERTISEMENT</p>
                <p class="text-xl text-white font-tech">{{ $t('sponsor.ad') }}</p>
                <a href="http://www.xtmc.xyz" target="_blank" class="inline-block mt-4 px-6 py-2 bg-cyber-accent text-black font-bold rounded-none hover:bg-white hover:scale-110 transition font-pixel text-xs uppercase tracking-widest">Visit Now</a>
            </div>
        </div>
    `
}
