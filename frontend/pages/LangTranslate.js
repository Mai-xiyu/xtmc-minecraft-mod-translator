import { API_BASE } from '../config.js';

export default {
    template: `
        <div class="max-w-6xl mx-auto space-y-8">
            <h2 class="text-3xl font-bold text-cyber-primary font-pixel glitch-text" :data-text="$t('lang.title')">{{ $t('lang.title') }}</h2>
            
            <!-- Info Box -->
            <div class="bg-cyber-dark/50 border border-cyber-primary/30 rounded p-4 text-sm text-gray-300 relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full bg-cyber-primary/50"></div>
                <div class="flex items-start gap-3 relative z-10">
                    <svg class="w-5 h-5 text-cyber-primary flex-shrink-0 mt-0.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <p class="font-semibold text-cyber-primary mb-1 font-pixel text-xs">{{ $t('lang.info_title') }}</p>
                        <p class="text-gray-400 font-tech">{{ $t('lang.info_desc') }}</p>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cyber-dark p-6 rounded border border-cyber-primary/20 relative">
                <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyber-primary"></div>

                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('lang.upload') }}</label>
                    <input ref="fileInput" type="file" multiple accept=".json,.lang,.jar" @change="handleFiles" :disabled="processing" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-cyber-primary file:text-black hover:file:bg-white hover:file:text-cyber-primary transition disabled:opacity-50 font-tech cursor-pointer"/>
                    <p class="text-xs text-gray-500 mt-1 font-mono">{{ $t('lang.upload_hint') }}</p>
                </div>
                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('lang.select_lang') }}</label>
                    <select v-model="targetLang" :disabled="processing" class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-2 text-white disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono">
                        <option value="zh_cn">简体中文 (zh_cn)</option>
                        <option value="zh_tw">繁體中文 (zh_tw)</option>
                        <option value="en_us">English (en_us)</option>
                        <option value="ja_jp">日本語 (ja_jp)</option>
                        <option value="de_de">Deutsch (de_de)</option>
                        <option value="es_es">Español (es_es)</option>
                        <option value="fr_fr">Français (fr_fr)</option>
                        <option value="ru_ru">Русский (ru_ru)</option>
                        <option value="pt_br">Português (pt_br)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-cyber-primary mb-1 font-pixel text-xs">{{ $t('lang.select_ai') }}</label>
                    <select v-model="selectedAI" :disabled="processing" class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-2 text-white disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono">
                        <option value="Deepseek">Deepseek</option>
                        <option value="Claude">Claude</option>
                        <option value="OpenAI">OpenAI (GPT-4o-mini)</option>
                        <option value="Gemini">Gemini</option>
                    </select>
                </div>
            </div>

            <!-- API Key Input -->
            <div class="bg-cyber-dark p-6 rounded border border-cyber-primary/20 relative">
                <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyber-primary"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyber-primary"></div>
                <label class="block text-sm text-cyber-primary mb-2 font-pixel text-xs">{{ $t('lang.api_key') }}</label>
                <input v-model="apiKey" type="password" :disabled="processing" :placeholder="$t('lang.api_key_placeholder')" class="w-full bg-black/50 border border-cyber-primary/30 rounded-none p-3 text-white disabled:opacity-50 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none font-mono"/>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button @click="startTranslation" :disabled="!canStart" class="bg-cyber-primary text-black font-bold py-3 px-6 rounded-none hover:bg-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed font-pixel text-xs uppercase tracking-widest relative overflow-hidden group">
                    <span class="relative z-10">{{ processing ? $t('lang.processing') : $t('lang.start') }}</span>
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <button v-if="processing" @click="cancelTranslation" class="bg-red-600 text-white font-bold py-3 px-6 rounded-none hover:bg-red-700 hover:scale-105 transition font-pixel text-xs uppercase tracking-widest border border-red-500">
                    {{ $t('lang.cancel') }}
                </button>
                <button v-if="files.length > 0 && !processing" @click="clearAll" class="bg-gray-800 text-white font-bold py-3 px-6 rounded-none hover:bg-gray-700 hover:scale-105 transition font-pixel text-xs uppercase tracking-widest border border-gray-600">
                    {{ $t('lang.clear_all') }}
                </button>
                <button v-if="completedCount > 0 && !processing" @click="resetCompleted" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-none hover:bg-blue-700 hover:scale-105 transition font-pixel text-xs uppercase tracking-widest border border-blue-500">
                    {{ $t('lang.reset') }}
                </button>
            </div>

            <!-- Files List -->
            <div v-if="files.length > 0" class="space-y-4">
                <div class="flex justify-between items-center border-b border-cyber-primary/30 pb-2">
                    <h3 class="text-xl font-bold text-cyber-primary font-pixel">{{ $t('lang.files_list') }} ({{ files.length }})</h3>
                    <span class="text-gray-400 text-sm font-mono">
                        {{ $t('lang.pending') }}: <span class="text-white">{{ pendingCount }}</span> | {{ $t('lang.processing_count') }}: <span class="text-yellow-400">{{ processingCount }}</span> | {{ $t('lang.completed') }}: <span class="text-green-400">{{ completedCount }}</span> | {{ $t('lang.failed') }}: <span class="text-red-400">{{ failedCount }}</span>
                    </span>
                </div>
                <div v-for="file in files" :key="file.id" class="bg-cyber-dark/80 p-4 rounded-none border border-gray-700 hover:border-cyber-primary/50 transition group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-gray-700 group-hover:bg-cyber-primary transition-colors"></div>
                    <div class="flex justify-between items-center mb-2 pl-2">
                        <div class="flex-1">
                            <span class="text-white font-mono" :class="{'text-green-400 font-bold': file.isRepackagedJar}">{{ file.name }}</span>
                            <span v-if="file.size" class="text-gray-500 text-xs ml-2 font-mono">({{ formatFileSize(file.size) }})</span>
                            <span v-if="!file.isRepackagedJar" class="text-cyan-400 text-xs ml-2 font-mono">→ .{{ file.outputFormat }}</span>
                            <span v-if="file.isRepackagedJar" class="text-green-400 text-xs ml-2 font-semibold font-pixel">📦 Repackaged JAR</span>
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
                    <div v-if="file.status === 'processing'" class="mt-2">
                        <div class="bg-black rounded-full h-2">
                            <div class="bg-cyber-primary h-2 rounded-full transition-all" :style="{width: file.progress + '%'}"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{{ file.progressText }}</p>
                    </div>
                    <div v-if="file.status === 'failed'" class="mt-2">
                        <p class="text-xs text-red-400">{{ file.errorMessage }}</p>
                        <button @click="retryFile(file.id)" class="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm">
                            {{ $t('lang.retry') }}
                        </button>
                    </div>
                    <button v-if="file.status === 'completed' && file.outputBlob" @click="downloadFile(file)" class="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        <span class="inline-flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            {{ $t('lang.download') }} {{ file.outputName }}
                        </span>
                    </button>
                </div>
            </div>

            <!-- Download All Button -->
            <div v-if="completedCount > 0 && completedCount === files.length" class="text-center">
                <button @click="downloadAll" class="bg-green-600 text-white font-bold py-3 px-8 rounded hover:bg-green-700 transition">
                    {{ $t('lang.download_all') }}
                </button>
            </div>

            <!-- JAR File Selection Modal -->
            <div v-if="jarSelectionModal.show" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50" @click.self="closeJarModal">
                <div class="bg-cyber-dark border border-cyber-primary rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-cyber-primary">{{ $t('lang.jar_selection_title') }}</h3>
                        <button @click="closeJarModal" class="text-gray-400 hover:text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-gray-400 mb-4">{{ jarSelectionModal.availableFiles.length }} {{ $t('lang.files_list') }} {{ $t('lang.jar_selection_desc') }} <span class="text-white font-mono">{{ jarSelectionModal.jarName }}</span></p>
                    
                    <div class="space-y-2 mb-6">
                        <div v-for="(file, index) in jarSelectionModal.availableFiles" :key="index" 
                             class="flex items-center gap-3 p-3 bg-black/50 rounded border border-gray-700 hover:border-cyber-primary/50 transition">
                            <input type="checkbox" :id="'jar-file-' + index" v-model="file.selected" 
                                   class="w-4 h-4 text-cyber-primary bg-gray-700 border-gray-600 rounded focus:ring-cyber-primary">
                            <label :for="'jar-file-' + index" class="flex-1 cursor-pointer">
                                <span class="text-white font-mono">{{ file.modName }}/{{ file.fileName }}</span>
                                <span class="text-gray-500 text-xs ml-2">({{ formatFileSize(file.size) }})</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button @click="selectAllJarFiles" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                            {{ $t('lang.select_all') }}
                        </button>
                        <button @click="deselectAllJarFiles" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
                            {{ $t('lang.deselect_all') }}
                        </button>
                        <button @click="confirmJarSelection" class="flex-1 bg-cyber-primary text-black font-bold py-2 px-4 rounded hover:bg-white transition">
                            {{ $t('lang.confirm_selection') }} ({{ selectedJarFilesCount }})
                        </button>
                    </div>
                </div>
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
            cancelRequested: false,
            jarSelectionModal: {
                show: false,
                jarName: '',
                jarFile: null,
                availableFiles: [],
                originalZip: null
            }
        };
    },
    computed: {
        canStart() {
            return this.files.length > 0 && this.apiKey && !this.processing && this.pendingCount > 0;
        },
        completedCount() {
            return this.files.filter(f => f.status === 'completed').length;
        },
        pendingCount() {
            return this.files.filter(f => f.status === 'pending').length;
        },
        processingCount() {
            return this.files.filter(f => f.status === 'processing').length;
        },
        failedCount() {
            return this.files.filter(f => f.status === 'failed').length;
        },
        selectedJarFilesCount() {
            return this.jarSelectionModal.availableFiles.filter(f => f.selected).length;
        }
    },
    methods: {
        async handleFiles(event) {
            const uploadedFiles = Array.from(event.target.files);
            
            for (const file of uploadedFiles) {
                if (file.name.endsWith('.jar')) {
                    // Handle JAR file - show selection dialog
                    try {
                        await this.showJarSelectionDialog(file);
                    } catch (error) {
                        console.error(`Failed to process ${file.name}:`, error);
                        // Add error file entry
                        this.files.push({
                            id: Date.now() + Math.random(),
                            name: file.name,
                            size: file.size,
                            file: file,
                            outputFormat: 'json',
                            status: 'failed',
                            progress: 0,
                            progressText: '',
                            outputBlob: null,
                            outputName: '',
                            errorMessage: `Failed to process JAR: ${error.message}`
                        });
                    }
                } else {
                    // Regular file
                    const isLangFile = file.name.endsWith('.lang');
                    const outputFormat = isLangFile ? 'lang' : 'json';
                    
                    this.files.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        file: file,
                        outputFormat: outputFormat,
                        status: 'pending',
                        progress: 0,
                        progressText: '',
                        outputBlob: null,
                        outputName: '',
                        errorMessage: ''
                    });
                }
            }
            
            // Clear input so same file can be added again
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },

        // Extract language files from JAR
        async extractLangFilesFromJar(jarFile) {
            const zip = await JSZip.loadAsync(jarFile);
            const langFiles = [];
            
            // Store the original ZIP for later repackaging
            const jarId = 'jar_' + Date.now() + '_' + Math.random();
            
            // Find all files in assets/*/lang/ directories
            const langFilePattern = /^assets\/[^\/]+\/lang\/[^\/]+\.(json|lang)$/;
            
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir && langFilePattern.test(path)) {
                    const content = await zipEntry.async('string');
                    const fileName = path.split('/').pop();
                    const modName = path.split('/')[1]; // Extract mod name from path
                    
                    // Create a virtual file
                    const blob = new Blob([content], { type: 'text/plain' });
                    const file = new File([blob], fileName, { type: 'text/plain' });
                    
                    const isLangFile = fileName.endsWith('.lang');
                    const outputFormat = isLangFile ? 'lang' : 'json';
                    
                    langFiles.push({
                        id: Date.now() + Math.random(),
                        name: `[${jarFile.name}] ${modName}/${fileName}`,
                        originalName: fileName,
                        size: content.length,
                        file: file,
                        outputFormat: outputFormat,
                        status: 'pending',
                        progress: 0,
                        progressText: '',
                        outputBlob: null,
                        outputName: '',
                        errorMessage: '',
                        jarSource: jarFile.name,
                        jarSourceId: jarId,
                        jarPath: path,
                        modName: modName,
                        originalZip: zip // Store reference to original ZIP
                    });
                }
            }
            
            if (langFiles.length === 0) {
                throw new Error('No language files found in assets/*/lang/ directories');
            }
            
            return langFiles;
        },

        removeFile(fileId) {
            const index = this.files.findIndex(f => f.id === fileId);
            if (index !== -1) {
                this.files.splice(index, 1);
            }
        },

        clearAll() {
            if (confirm(this.$t('lang.confirm_clear'))) {
                this.files = [];
            }
        },

        resetCompleted() {
            this.files.forEach(file => {
                if (file.status === 'completed') {
                    file.status = 'pending';
                    file.progress = 0;
                    file.progressText = '';
                    file.outputBlob = null;
                    file.errorMessage = '';
                }
            });
        },

        retryFile(fileId) {
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                file.status = 'pending';
                file.progress = 0;
                file.progressText = '';
                file.errorMessage = '';
            }
        },

        cancelTranslation() {
            if (confirm(this.$t('lang.confirm_cancel'))) {
                this.cancelRequested = true;
            }
        },

        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },

        getStatusText(status) {
            const statusMap = {
                'pending': this.$t('lang.status_pending'),
                'processing': this.$t('lang.status_processing'),
                'completed': this.$t('lang.status_completed'),
                'failed': this.$t('lang.status_failed'),
                'cancelled': this.$t('lang.status_cancelled')
            };
            return statusMap[status] || status;
        },

        async startTranslation() {
            if (!this.canStart) return;
            
            this.processing = true;
            this.cancelRequested = false;
            
            // Process each file
            for (const fileInfo of this.files) {
                // Check for cancellation
                if (this.cancelRequested) {
                    if (fileInfo.status === 'processing') {
                        fileInfo.status = 'cancelled';
                        fileInfo.progressText = 'Cancelled by user';
                    }
                    break;
                }
                
                if (fileInfo.status !== 'pending') continue;
                
                try {
                    fileInfo.status = 'processing';
                    fileInfo.progress = 0;
                    fileInfo.progressText = 'Reading file...';
                    fileInfo.errorMessage = '';
                    
                    const content = await this.readFileContent(fileInfo.file);
                    const isJson = fileInfo.name.endsWith('.json');
                    
                    // Validate file format (skip for extracted JAR files)
                    const isFromJar = fileInfo.jarSource !== undefined;
                    if (!isJson && !fileInfo.name.endsWith('.lang') && !isFromJar) {
                        throw new Error('Invalid file format. Only .json, .lang, and .jar files are supported.');
                    }
                    
                    // Parse content
                    let translations = {};
                    if (isJson) {
                        try {
                            translations = JSON.parse(content);
                            if (typeof translations !== 'object' || Array.isArray(translations)) {
                                throw new Error('JSON file must contain an object');
                            }
                        } catch (e) {
                            throw new Error(`Invalid JSON format: ${e.message}`);
                        }
                    } else {
                        // Parse .lang file
                        const lines = content.split('\n');
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
                                const equalIndex = trimmed.indexOf('=');
                                if (equalIndex > 0) {
                                    const key = trimmed.substring(0, equalIndex).trim();
                                    const value = trimmed.substring(equalIndex + 1).trim();
                                    if (key && value) {
                                        translations[key] = value;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Check if file has content
                    const entries = Object.entries(translations);
                    if (entries.length === 0) {
                        throw new Error('No translation entries found in file');
                    }
                    
                    fileInfo.progressText = `Found ${entries.length} entries. Starting translation...`;
                    
                    const translatedTexts = [];
                    const maxTokensPerBatch = this.getMaxTokensPerBatch();
                    
                    // Dynamic batching based on token count
                    let i = 0;
                    let batchCount = 0;
                    
                    while (i < entries.length) {
                        // Check for cancellation
                        if (this.cancelRequested) {
                            throw new Error('Translation cancelled by user');
                        }
                        
                        // Build batch with token limit
                        const batch = [];
                        let currentTokens = 100; // Base prompt tokens
                        
                        while (i < entries.length && batch.length < 100) { // Max 100 items per batch
                            const text = entries[i][1];
                            const textTokens = this.estimateTokens(text);
                            
                            // Check if adding this text would exceed limit
                            if (currentTokens + textTokens > maxTokensPerBatch && batch.length > 0) {
                                break; // Start new batch
                            }
                            
                            batch.push([entries[i][0], text]);
                            currentTokens += textTokens;
                            i++;
                        }
                        
                        if (batch.length === 0) {
                            // Single text is too long, process it alone with truncation warning
                            const [key, text] = entries[i];
                            console.warn(`Text at key "${key}" is very long (${this.estimateTokens(text)} tokens), may fail`);
                            batch.push([key, text]);
                            i++;
                        }
                        
                        batchCount++;
                        const textsToTranslate = batch.map(([_, text]) => text);
                        const estimatedBatchCount = Math.ceil(entries.length / (i / batchCount));
                        
                        fileInfo.progressText = `Translating batch ${batchCount}/${estimatedBatchCount} (${batch.length} texts, ~${currentTokens} tokens)...`;
                        
                        try {
                            const translated = await this.translateBatch(textsToTranslate);
                            translatedTexts.push(...translated);
                        } catch (apiError) {
                            // If token error, retry with smaller batch
                            if (apiError.message.includes('token') || apiError.message.includes('length')) {
                                console.warn('Token limit hit, retrying with smaller batch...');
                                // Retry with half the batch size
                                const halfBatch = batch.slice(0, Math.ceil(batch.length / 2));
                                const textsHalf = halfBatch.map(([_, text]) => text);
                                try {
                                    const translatedHalf = await this.translateBatch(textsHalf);
                                    translatedTexts.push(...translatedHalf);
                                    // Add back the second half for next iteration
                                    i -= (batch.length - halfBatch.length);
                                } catch (retryError) {
                                    throw new Error(`API Error (even after retry): ${retryError.message}`);
                                }
                            } else {
                                throw new Error(`API Error: ${apiError.message}`);
                            }
                        }
                        
                        fileInfo.progress = Math.round((i / entries.length) * 100);
                        fileInfo.progressText = `Translated ${i}/${entries.length} texts`;
                        
                        // Small delay to prevent rate limiting
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                    // Create output
                    const outputTranslations = {};
                    entries.forEach(([key, _], index) => {
                        outputTranslations[key] = translatedTexts[index] || entries[index][1];
                    });
                    
                    // Generate output file based on input format
                    let outputContent;
                    let outputExt;
                    
                    if (fileInfo.outputFormat === 'lang') {
                        // Generate .lang file (same format as input)
                        outputExt = '.lang';
                        outputContent = Object.entries(outputTranslations)
                            .map(([key, value]) => `${key}=${value}`)
                            .join('\n');
                    } else {
                        // Generate .json file (same format as input)
                        outputExt = '.json';
                        outputContent = JSON.stringify(outputTranslations, null, 2);
                    }
                    
                    // Create blob
                    const blob = new Blob([outputContent], { type: 'text/plain' });
                    fileInfo.outputBlob = blob;
                    fileInfo.outputName = `${this.targetLang}${outputExt}`;
                    fileInfo.outputContent = outputContent; // Store content for JAR repackaging
                    fileInfo.status = 'completed';
                    fileInfo.progress = 100;
                    fileInfo.progressText = `Completed! (${entries.length} entries translated)`;
                    
                    // Check if all files from the same JAR are completed and repackage
                    if (fileInfo.jarSourceId) {
                        await this.checkAndRepackageJar(fileInfo.jarSourceId);
                    }
                    
                } catch (error) {
                    console.error('Translation error:', error);
                    fileInfo.status = 'failed';
                    fileInfo.errorMessage = error.message || 'Unknown error occurred';
                    fileInfo.progressText = 'Failed';
                }
            }
            
            this.processing = false;
            this.cancelRequested = false;
        },

        // Check if all files from a JAR are completed and repackage
        async checkAndRepackageJar(jarId) {
            const jarFiles = this.files.filter(f => f.jarSourceId === jarId);
            const allCompleted = jarFiles.every(f => f.status === 'completed');
            
            if (!allCompleted || jarFiles.length === 0) {
                return; // Not all files are completed yet
            }
            
            // Check if already repackaged
            if (this.files.some(f => f.repackagedJarId === jarId)) {
                return; // Already created the repackaged JAR
            }
            
            try {
                // Get the original ZIP from the first file
                const originalZip = jarFiles[0].originalZip;
                if (!originalZip) {
                    console.error('Original ZIP not found');
                    return;
                }
                
                // Clone the original ZIP
                const newZip = new JSZip();
                
                // Copy all files from original JAR
                for (const [path, zipEntry] of Object.entries(originalZip.files)) {
                    if (!zipEntry.dir) {
                        const content = await zipEntry.async('blob');
                        newZip.file(path, content);
                    }
                }
                
                // Replace translated language files
                for (const file of jarFiles) {
                    if (file.outputContent && file.jarPath) {
                        newZip.file(file.jarPath, file.outputContent);
                    }
                }
                
                // Generate the new JAR
                const jarBlob = await newZip.generateAsync({ 
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });
                
                // Add a virtual "repackaged JAR" entry to the files list
                const jarName = jarFiles[0].jarSource;
                const baseName = jarName.replace(/\.jar$/i, '');
                
                this.files.push({
                    id: Date.now() + Math.random(),
                    name: `${baseName}_${this.targetLang}.jar`,
                    size: jarBlob.size,
                    file: null,
                    outputFormat: 'jar',
                    status: 'completed',
                    progress: 100,
                    progressText: `Repackaged JAR with ${jarFiles.length} translated language files`,
                    outputBlob: jarBlob,
                    outputName: `${baseName}_${this.targetLang}.jar`,
                    errorMessage: '',
                    repackagedJarId: jarId,
                    isRepackagedJar: true
                });
                
                console.log(`Successfully repackaged JAR: ${jarName}`);
                
            } catch (error) {
                console.error('Failed to repackage JAR:', error);
            }
        },

        // Estimate tokens (rough: 1 token ≈ 4 characters)
        estimateTokens(text) {
            return Math.ceil(text.length / 4);
        },

        // Get max tokens per batch based on AI model
        getMaxTokensPerBatch() {
            const limits = {
                'Deepseek': 4000,     // Conservative limit
                'OpenAI': 3000,       // GPT-4o-mini input limit (leave room for output)
                'Claude': 4000,       // Haiku limit
                'Gemini': 6000        // Gemini Pro limit
            };
            return limits[this.selectedAI] || 3000;
        },

        async translateBatch(texts) {
            if (!texts || texts.length === 0) {
                return [];
            }

            const targetLangName = {
                'zh_cn': 'Simplified Chinese',
                'zh_tw': 'Traditional Chinese',
                'en_us': 'English',
                'ja_jp': 'Japanese',
                'de_de': 'German',
                'es_es': 'Spanish',
                'fr_fr': 'French',
                'ru_ru': 'Russian',
                'pt_br': 'Brazilian Portuguese'
            }[this.targetLang] || this.targetLang;

            const prompt = `You are a professional Minecraft mod translator. Translate the following texts to ${targetLangName}. Keep the same format and special characters (like %s, %d, §, color codes). Return ONLY the translations separated by newlines, without any explanations, numbering, or extra text.

Texts to translate:
${texts.join('\n')}

Translations:`;

            let translated;
            
            try {
                switch (this.selectedAI) {
                    case 'Deepseek':
                        translated = await this.callDeepseek(prompt);
                        break;
                    case 'OpenAI':
                        translated = await this.callOpenAI(prompt);
                        break;
                    case 'Claude':
                        translated = await this.callClaude(prompt);
                        break;
                    case 'Gemini':
                        translated = await this.callGemini(prompt);
                        break;
                    default:
                        throw new Error('Unknown AI model selected');
                }
            } catch (error) {
                throw new Error(`API call failed: ${error.message}`);
            }
            
            if (!translated) {
                throw new Error('Empty response from AI API');
            }
            
            const lines = translated.split('\n').filter(line => line.trim());
            
            // Ensure we have the right number of translations
            if (lines.length < texts.length) {
                console.warn(`Expected ${texts.length} translations but got ${lines.length}`);
                // Pad with original texts if needed
                while (lines.length < texts.length) {
                    lines.push(texts[lines.length]);
                }
            }
            
            return lines.slice(0, texts.length);
        },

        async callDeepseek(prompt) {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3
                })
            });
            
            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
        },

        async callOpenAI(prompt) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
        },

        async callClaude(prompt) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 4096,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Claude API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.content[0].text.trim();
        },

        async callGemini(prompt) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        },

        readFileContent(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        },

        downloadFile(fileInfo) {
            const url = URL.createObjectURL(fileInfo.outputBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileInfo.outputName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        async downloadAll() {
            // Use JSZip to create a zip file
            if (typeof JSZip === 'undefined') {
                alert('JSZip library not loaded');
                return;
            }
            
            const zip = new JSZip();
            
            for (const file of this.files) {
                if (file.status === 'completed' && file.outputBlob) {
                    zip.file(file.outputName, file.outputBlob);
                }
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'translated_files.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        async showJarSelectionDialog(jarFile) {
            // Extract available files from JAR
            const zip = await JSZip.loadAsync(jarFile);
            const availableFiles = [];
            
            const jarId = 'jar_' + Date.now() + '_' + Math.random();
            const langFilePattern = /^assets\/[^\/]+\/lang\/[^\/]+\.(json|lang)$/;
            
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir && langFilePattern.test(path)) {
                    const content = await zipEntry.async('string');
                    const fileName = path.split('/').pop();
                    const modName = path.split('/')[1];
                    
                    availableFiles.push({
                        selected: true, // Default: all selected
                        path: path,
                        fileName: fileName,
                        modName: modName,
                        size: content.length,
                        content: content,
                        isLangFile: fileName.endsWith('.lang')
                    });
                }
            }
            
            if (availableFiles.length === 0) {
                throw new Error('No language files found in assets/*/lang/ directories');
            }
            
            // Show modal
            this.jarSelectionModal = {
                show: true,
                jarName: jarFile.name,
                jarFile: jarFile,
                jarId: jarId,
                availableFiles: availableFiles,
                originalZip: zip
            };
        },
        
        closeJarModal() {
            this.jarSelectionModal.show = false;
        },
        
        selectAllJarFiles() {
            this.jarSelectionModal.availableFiles.forEach(file => {
                file.selected = true;
            });
        },
        
        deselectAllJarFiles() {
            this.jarSelectionModal.availableFiles.forEach(file => {
                file.selected = false;
            });
        },
        
        confirmJarSelection() {
            const selectedFiles = this.jarSelectionModal.availableFiles.filter(f => f.selected);
            
            if (selectedFiles.length === 0) {
                alert(this.$t('lang.no_files_selected') || 'Please select at least one file');
                return;
            }
            
            // Add selected files to the queue
            selectedFiles.forEach(fileInfo => {
                const blob = new Blob([fileInfo.content], { type: 'text/plain' });
                const file = new File([blob], fileInfo.fileName, { type: 'text/plain' });
                
                const outputFormat = fileInfo.isLangFile ? 'lang' : 'json';
                
                this.files.push({
                    id: Date.now() + Math.random(),
                    name: `[${this.jarSelectionModal.jarName}] ${fileInfo.modName}/${fileInfo.fileName}`,
                    originalName: fileInfo.fileName,
                    size: fileInfo.size,
                    file: file,
                    outputFormat: outputFormat,
                    status: 'pending',
                    progress: 0,
                    progressText: '',
                    outputBlob: null,
                    outputName: '',
                    errorMessage: '',
                    jarSource: this.jarSelectionModal.jarName,
                    jarSourceId: this.jarSelectionModal.jarId,
                    jarPath: fileInfo.path,
                    modName: fileInfo.modName,
                    originalZip: this.jarSelectionModal.originalZip
                });
            });
            
            // Close modal
            this.closeJarModal();
        },

        getStatusClass(status) {
            const classes = {
                'pending': 'bg-gray-700 text-gray-300',
                'processing': 'bg-blue-600 text-white',
                'completed': 'bg-green-600 text-white',
                'failed': 'bg-red-600 text-white'
            };
            return classes[status] || classes['pending'];
        }
    }
};
