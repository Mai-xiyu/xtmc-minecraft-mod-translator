import { API_BASE } from '../config.js';

export default {
    template: `
        <div class="max-w-6xl mx-auto space-y-8">
            <h2 class="text-3xl font-bold text-cyber-primary font-pixel glitch-text" :data-text="$t('bytecode.title')">{{ $t('bytecode.title') }}</h2>
            <p class="text-gray-400 font-tech">{{ $t('bytecode.desc') }}</p>

            <!-- Controls -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-cyber-dark p-6 rounded border border-cyber-primary/20 relative">
                <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyber-primary"></div>

                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('bytecode.upload') }}</label>
                    <input ref="fileInput" type="file" multiple accept=".jar" @change="handleFiles" :disabled="processing" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-cyber-primary file:text-black hover:file:bg-white hover:file:text-cyber-primary transition disabled:opacity-50 font-tech cursor-pointer"/>
                </div>
                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('bytecode.select_lang') }}</label>
                    <select v-model="targetLang" :disabled="processing" class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-2 text-white disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono">
                        <option value="zh_cn">中文 (Chinese)</option>
                        <option value="en_us">English</option>
                        <option value="ja_jp">日本語 (Japanese)</option>
                        <option value="de_de">Deutsch (German)</option>
                        <option value="es_es">Español (Spanish)</option>
                        <option value="fr_fr">Français (French)</option>
                        <option value="ru_ru">Русский (Russian)</option>
                        <option value="pt_br">Português (Portuguese)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('bytecode.select_ai') }}</label>
                    <select v-model="selectedAI" :disabled="processing" class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-2 text-white disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono">
                        <option value="Deepseek">Deepseek</option>
                        <option value="Claude">Claude</option>
                        <option value="OpenAI">OpenAI (GPT-4o-mini)</option>
                        <option value="Gemini">Gemini</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('lang.api_key') }}</label>
                    <input v-model="apiKey" type="password" :disabled="processing" placeholder="sk-..." class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-2 text-white placeholder-gray-600 disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono"/>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button @click="startProcessing" :disabled="!canStart" class="bg-cyber-primary text-black font-bold py-3 px-6 rounded-none hover:bg-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed font-pixel text-xs uppercase tracking-widest relative overflow-hidden group">
                    <span class="relative z-10">{{ processing ? $t('bytecode.processing') : $t('bytecode.start_processing') }} ({{ pendingFiles.length }})</span>
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <button v-if="files.length > 0 && !processing" @click="clearAll" class="bg-gray-800 text-white font-bold py-3 px-6 rounded-none hover:bg-gray-700 hover:scale-105 transition font-pixel text-xs uppercase tracking-widest border border-gray-600">
                    {{ $t('bytecode.clear_all') }}
                </button>
            </div>

            <!-- Files List -->
            <div v-if="files.length > 0" class="space-y-4">
                <div class="flex justify-between items-center border-b border-cyber-primary/30 pb-2">
                    <h3 class="text-xl font-bold text-cyber-primary font-pixel">{{ $t('bytecode.files') }} ({{ files.length }})</h3>
                    <span class="text-gray-400 text-sm font-mono">
                        {{ $t('bytecode.pending') }}: <span class="text-white">{{ pendingCount }}</span> | {{ $t('bytecode.processing_count') }}: <span class="text-yellow-400">{{ processingCount }}</span> | {{ $t('bytecode.completed') }}: <span class="text-green-400">{{ completedCount }}</span> | {{ $t('bytecode.failed') }}: <span class="text-red-400">{{ failedCount }}</span>
                    </span>
                </div>
                <div v-for="file in files" :key="file.id" class="bg-cyber-dark/80 p-4 rounded-none border border-gray-700 hover:border-cyber-primary/50 transition group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-gray-700 group-hover:bg-cyber-primary transition-colors"></div>
                    <div class="flex justify-between items-center mb-2 pl-2">
                        <div class="flex-1">
                            <span class="text-white font-mono">{{ file.name }}</span>
                            <span v-if="file.size" class="text-gray-500 text-xs ml-2 font-mono">({{ formatFileSize(file.size) }})</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-none text-xs font-pixel uppercase" :class="getStatusClass(file.status)">
                                {{ getStatusText(file.status) }}
                            </span>
                            <button v-if="file.status === 'pending' || file.status === 'failed'" @click="removeFile(file.id)" class="text-red-500 hover:text-red-400 transition hover:scale-110" title="Remove">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div v-if="file.status === 'queued' || file.status === 'processing'" class="mt-2 pl-2">
                        <div class="bg-black rounded-none h-2 border border-gray-700">
                            <div class="bg-cyber-primary h-full transition-all duration-300" :style="{width: file.progress + '%'}"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 font-mono">
                            <span v-if="file.progress > 0">{{ file.progress }}% - </span>
                            <span v-if="file.currentBatch && file.totalBatches">Batch {{ file.currentBatch }}/{{ file.totalBatches }}</span>
                            <span v-if="file.etaSeconds > 0"> - ETA: {{ formatETA(file.etaSeconds) }}</span>
                            <span v-if="!file.currentBatch"> - {{ file.statusMessage || (file.status === 'queued' ? 'Waiting in queue...' : 'Processing...') }}</span>
                        </p>
                    </div>
                    <div v-if="file.status === 'failed'" class="mt-2 pl-2">
                        <p class="text-xs text-red-400 font-mono">{{ file.errorMessage }}</p>
                        <button @click="retryFile(file.id)" class="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-none hover:bg-yellow-700 transition text-sm font-pixel text-xs">
                            {{ $t('bytecode.retry') }}
                        </button>
                    </div>
                    
                    <!-- Review Translation Results -->
                    <div v-if="file.status === 'review'" class="mt-2 pl-2">
                        <div class="bg-cyber-dark/50 border border-cyber-secondary/30 rounded p-3">
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-cyber-secondary font-pixel text-xs">
                                    {{ $t('bytecode.review_title') }}: {{ Object.keys(file.selectedTranslations || {}).length }}/{{ (file.translationPairs || []).length }} {{ $t('bytecode.selected') }}
                                </p>
                                <div class="flex gap-2">
                                    <button @click="toggleReview(file.id)" class="text-xs text-cyber-primary hover:text-white transition font-tech">
                                        {{ file.showReview ? $t('bytecode.hide_review') : $t('bytecode.show_review') }}
                                    </button>
                                    <button @click="selectAllTranslations(file.id)" class="text-xs text-green-400 hover:text-green-300 transition font-tech">
                                        {{ $t('bytecode.select_all') }}
                                    </button>
                                    <button @click="deselectAllTranslations(file.id)" class="text-xs text-gray-400 hover:text-gray-300 transition font-tech">
                                        {{ $t('bytecode.deselect_all') }}
                                    </button>
                                </div>
                            </div>
                            
                            <div v-if="file.showReview" class="mt-3 max-h-96 overflow-y-auto space-y-2 border-t border-gray-700 pt-2">
                                <div v-for="(pair, index) in file.translationPairs" :key="index" 
                                     class="flex items-start gap-2 p-2 bg-black/30 rounded hover:bg-black/50 transition">
                                    <input 
                                        type="checkbox"
                                        :id="'trans-' + file.id + '-' + index"
                                        v-model="file.selectedTranslations[pair.original]"
                                        :true-value="pair.translated"
                                        :false-value="undefined"
                                        class="mt-1 w-4 h-4 accent-cyber-secondary cursor-pointer flex-shrink-0"
                                    />
                                    <label :for="'trans-' + file.id + '-' + index" class="flex-1 cursor-pointer">
                                        <div class="text-gray-400 text-xs font-mono mb-1">
                                            <span class="text-gray-600">原文:</span> {{ pair.original }}
                                        </div>
                                        <div class="text-cyber-secondary text-xs font-mono">
                                            <span class="text-gray-600">译文:</span> {{ pair.translated }}
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mt-3 flex gap-2">
                                <button @click="applyTranslations(file.id)" 
                                        :disabled="Object.keys(file.selectedTranslations || {}).length === 0"
                                        class="bg-cyber-secondary text-black px-4 py-2 rounded-none hover:bg-white transition font-pixel text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                                    {{ $t('bytecode.apply_translations') }}
                                </button>
                                <button @click="rejectTranslations(file.id)" 
                                        class="bg-red-600 text-white px-4 py-2 rounded-none hover:bg-red-700 transition font-pixel text-xs">
                                    {{ $t('bytecode.reject_all') }}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button v-if="file.status === 'completed'" @click="downloadFile(file.id)" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-none hover:bg-green-700 transition ml-2">
                        <span class="inline-flex items-center gap-2 font-pixel text-xs">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            {{ $t('bytecode.download') }} translated_{{ file.name }}
                        </span>
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="files.length === 0" class="text-center py-12 bg-cyber-dark rounded border border-gray-800">
                <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-gray-500">{{ $t('bytecode.empty_state') }}</p>
            </div>
        </div>
    `,
    data() {
        return {
            files: [],
            targetLang: 'zh_cn',
            selectedAI: 'Deepseek',
            apiKey: '',
            processing: false,
            pollInterval: null
        };
    },
    computed: {
        canStart() {
            return this.pendingFiles.length > 0 && !this.processing && this.apiKey.trim() !== '';
        },
        pendingFiles() {
            return this.files.filter(f => f.status === 'pending');
        },
        pendingCount() {
            return this.files.filter(f => f.status === 'pending').length;
        },
        processingCount() {
            return this.files.filter(f => f.status === 'queued' || f.status === 'processing').length;
        },
        completedCount() {
            return this.files.filter(f => f.status === 'completed').length;
        },
        failedCount() {
            return this.files.filter(f => f.status === 'failed').length;
        }
    },
    methods: {
        handleFiles(event) {
            const newFiles = Array.from(event.target.files).map((file) => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                file: file,
                status: 'pending',
                taskId: null,
                statusMessage: '',
                errorMessage: '',
                progress: 0,
                currentBatch: 0,
                totalBatches: 0,
                etaSeconds: 0,
                translationPairs: [],  // Store translation results
                selectedTranslations: {},  // Track user selections
                showReview: false  // Toggle review panel
            }));
            this.files.push(...newFiles);
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },

        removeFile(fileId) {
            const index = this.files.findIndex(f => f.id === fileId);
            if (index !== -1) {
                this.files.splice(index, 1);
            }
        },

        clearAll() {
            if (confirm(this.$t('bytecode.confirm_clear'))) {
                this.files = [];
            }
        },

        retryFile(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                file.status = 'pending';
                file.taskId = null;
                file.errorMessage = '';
                file.statusMessage = '';
                file.translationPairs = [];
                file.selectedTranslations = {};
            }
        },

        toggleReview(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                file.showReview = !file.showReview;
            }
        },

        selectAllTranslations(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file && file.translationPairs) {
                file.selectedTranslations = {};
                file.translationPairs.forEach(pair => {
                    file.selectedTranslations[pair.original] = pair.translated;
                });
            }
        },

        deselectAllTranslations(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                file.selectedTranslations = {};
            }
        },

        async applyTranslations(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (!file || !file.taskId) return;

            const selectedCount = Object.keys(file.selectedTranslations).length;
            if (selectedCount === 0) {
                alert(this.$t('bytecode.no_selection'));
                return;
            }

            try {
                file.status = 'processing';
                file.statusMessage = `Applying ${selectedCount} translations...`;

                const formData = new FormData();
                formData.append('task_id', file.taskId);
                formData.append('selected_translations', JSON.stringify(file.selectedTranslations));

                const response = await fetch(`${API_BASE}/translate/bytecode/apply`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Failed to apply translations: ${response.statusText}`);
                }

                // Refresh status
                setTimeout(() => this.checkFileStatus(file), 1000);

            } catch (error) {
                console.error('Apply error:', error);
                file.status = 'failed';
                file.errorMessage = error.message;
            }
        },

        rejectTranslations(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file && confirm(this.$t('bytecode.confirm_reject'))) {
                file.status = 'pending';
                file.taskId = null;
                file.translationPairs = [];
                file.selectedTranslations = {};
            }
        },

        async checkFileStatus(file) {
            if (!file.taskId) return;
            
            try {
                const response = await fetch(`${API_BASE}/translate/bytecode/status/${file.taskId}`);
                if (response.ok) {
                    const status = await response.json();
                    file.status = status.status;
                    file.progress = status.progress || 0;
                    file.currentBatch = status.current_batch || 0;
                    file.totalBatches = status.total_batches || 0;
                    file.etaSeconds = status.eta_seconds || 0;

                    if (status.status === 'failed') {
                        file.errorMessage = status.error || 'Processing failed';
                    } else if (status.status === 'review') {
                        // Translation completed, show review UI
                        file.translationPairs = status.translation_pairs || [];
                        file.selectedTranslations = {};
                        // Auto-select all by default
                        file.translationPairs.forEach(pair => {
                            file.selectedTranslations[pair.original] = pair.translated;
                        });
                    } else if (status.status === 'completed') {
                        file.statusMessage = 'Ready for download';
                    }
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        },

        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },

        formatETA(seconds) {
            if (seconds < 60) return `${seconds}s`;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        },

        getStatusText(status) {
            const statusMap = {
                'pending': this.$t('bytecode.status_pending'),
                'queued': this.$t('bytecode.status_queued'),
                'processing': this.$t('bytecode.status_processing'),
                'review': this.$t('bytecode.status_review'),
                'completed': this.$t('bytecode.status_completed'),
                'failed': this.$t('bytecode.status_failed')
            };
            return statusMap[status] || status;
        },

        getStatusClass(status) {
            const classes = {
                'pending': 'bg-gray-700 text-gray-300',
                'queued': 'bg-yellow-600 text-white',
                'processing': 'bg-blue-600 text-white',
                'review': 'bg-cyber-secondary text-black',
                'completed': 'bg-green-600 text-white',
                'failed': 'bg-red-600 text-white'
            };
            return classes[status] || classes['pending'];
        },

        async startProcessing() {
            if (!this.canStart) return;

            if (!this.apiKey.trim()) {
                alert(this.$t('lang.api_key_required'));
                return;
            }

            this.processing = true;

            // Upload all pending files
            for (const file of this.pendingFiles) {
                try {
                    file.status = 'queued';
                    file.statusMessage = 'Uploading...';

                    const formData = new FormData();
                    formData.append('file', file.file);
                    formData.append('target_lang', this.targetLang);
                    formData.append('ai_model', this.selectedAI);
                    formData.append('api_key', this.apiKey);

                    const response = await fetch(`${API_BASE}/translate/bytecode`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const result = await response.json();
                    file.taskId = result.task_id;
                    file.statusMessage = 'Queued for processing';

                } catch (error) {
                    console.error('Upload error:', error);
                    file.status = 'failed';
                    file.errorMessage = error.message;
                }
            }

            // Start polling for status updates
            this.startPolling();
        },

        startPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
            }

            this.pollInterval = setInterval(async () => {
                let hasActiveTask = false;

                for (const file of this.files) {
                    if (file.taskId && (file.status === 'queued' || file.status === 'processing')) {
                        hasActiveTask = true;
                        await this.checkFileStatus(file);
                    }
                }

                // Stop polling if no active tasks
                if (!hasActiveTask) {
                    this.stopPolling();
                }
            }, 2000);
        },

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
            this.processing = false;
        },

        async downloadFile(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (!file || !file.taskId) return;

            try {
                const response = await fetch(`${API_BASE}/translate/bytecode/download/${file.taskId}`);
                if (!response.ok) {
                    throw new Error('Download failed');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `translated_${file.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download error:', error);
                alert('Failed to download file: ' + error.message);
            }
        }
    },
    beforeUnmount() {
        this.stopPolling();
    }
};
