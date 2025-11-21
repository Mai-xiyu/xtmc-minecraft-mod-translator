import { API_BASE } from '../config.js';

export default {
    template: `
        <div class="max-w-6xl mx-auto space-y-8">
            <h2 class="text-3xl font-bold text-cyber-primary">{{ $t('bytecode.title') }}</h2>

            <!-- Controls -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cyber-dark p-6 rounded border border-cyber-primary/20">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">{{ $t('bytecode.upload') }}</label>
                    <input type="file" multiple accept=".jar" @change="handleFiles" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyber-primary file:text-black hover:file:bg-white transition"/>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">{{ $t('bytecode.select_lang') }}</label>
                    <select v-model="targetLang" class="w-full bg-black border border-gray-700 rounded p-2 text-white">
                        <option value="zh">中文 (Chinese)</option>
                        <option value="en">English</option>
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="ru">Русский (Russian)</option>
                        <option value="pt">Português (Portuguese)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">{{ $t('bytecode.select_ai') }}</label>
                    <select v-model="selectedAI" class="w-full bg-black border border-gray-700 rounded p-2 text-white">
                        <option value="Deepseek">Deepseek</option>
                        <option value="Claude">Claude</option>
                        <option value="OpenAI">OpenAI (GPT-4)</option>
                        <option value="Gemini">Gemini</option>
                    </select>
                </div>
            </div>

            <!-- API Key Input -->
            <div class="bg-cyber-dark p-6 rounded border border-cyber-primary/20">
                <label class="block text-sm text-gray-400 mb-2">API Key ({{ selectedAI }})</label>
                <div class="flex gap-4">
                    <input 
                        v-model="apiKey" 
                        type="password" 
                        placeholder="输入您的 API Key..."
                        class="flex-grow bg-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-cyber-primary"
                    />
                    <button 
                        @click="startProcessing" 
                        :disabled="!canStartProcessing"
                        class="px-8 py-3 bg-cyber-primary text-black font-bold rounded hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Start Processing ({{ uploadedFiles.length }})
                    </button>
                </div>
            </div>

            <!-- Processing Queue -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Queued/Processing -->
                <div class="bg-cyber-dark p-6 rounded border border-gray-800">
                    <h3 class="text-lg font-bold mb-4 text-yellow-500">Processing Queue ({{ processingTasks.length }})</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        <div v-for="task in processingTasks" :key="task.task_id"
                             class="p-3 bg-black rounded border border-yellow-500/30">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-300 truncate">{{ task.filename }}</span>
                                <span class="text-xs px-2 py-1 rounded" 
                                      :class="getStatusClass(task.status)">
                                    {{ task.status }}
                                </span>
                            </div>
                            <div v-if="task.status === 'processing'" class="mt-2">
                                <div class="w-full bg-gray-800 rounded-full h-1">
                                    <div class="bg-yellow-500 h-1 rounded-full animate-pulse" style="width: 60%"></div>
                                </div>
                            </div>
                        </div>
                        <div v-if="processingTasks.length === 0" class="text-center text-gray-500 py-8">
                            No files in queue
                        </div>
                    </div>
                </div>

                <!-- Completed -->
                <div class="bg-cyber-dark p-6 rounded border border-gray-800">
                    <h3 class="text-lg font-bold mb-4 text-green-500">Completed ({{ completedTasks.length }})</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        <div v-for="task in completedTasks" :key="task.task_id"
                             class="p-3 bg-black rounded border border-green-500/30">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-300 truncate">{{ task.filename }}</span>
                                <button @click="downloadFile(task.task_id)"
                                        class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500 transition">
                                    Download
                                </button>
                            </div>
                        </div>
                        <div v-if="completedTasks.length === 0" class="text-center text-gray-500 py-8">
                            No completed files yet
                        </div>
                    </div>
                </div>
            </div>

            <!-- Uploaded Files (Pending) -->
            <div v-if="uploadedFiles.length > 0 && !hasStartedProcessing" class="bg-cyber-dark p-6 rounded border border-gray-800">
                <h3 class="text-lg font-bold mb-4 text-cyber-primary">Uploaded Files ({{ uploadedFiles.length }})</h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    <div v-for="(file, index) in uploadedFiles" :key="index" 
                         class="flex justify-between items-center p-3 bg-black rounded border border-gray-800">
                        <span class="text-sm text-gray-300 truncate">{{ file.name }}</span>
                        <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            targetLang: 'zh',
            selectedAI: 'Deepseek',
            apiKey: '',
            uploadedFiles: [],
            tasks: [],  // All tasks
            pollInterval: null,
            hasStartedProcessing: false
        }
    },
    computed: {
        canStartProcessing() {
            return this.uploadedFiles.length > 0 && this.apiKey.trim().length > 0 && !this.hasStartedProcessing;
        },
        processingTasks() {
            return this.tasks.filter(t => ['queued', 'processing'].includes(t.status));
        },
        completedTasks() {
            return this.tasks.filter(t => t.status === 'completed');
        }
    },
    methods: {
        handleFiles(event) {
            this.uploadedFiles = Array.from(event.target.files);
            this.hasStartedProcessing = false;
        },
        
        async startProcessing() {
            if (!this.canStartProcessing) return;
            
            this.hasStartedProcessing = true;
            
            // Upload all files one by one
            for (const file of this.uploadedFiles) {
                await this.uploadFile(file);
            }
            
            // Start polling
            this.startPolling();
        },
        
        async uploadFile(file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('target_lang', this.targetLang);
            formData.append('ai_model', this.selectedAI);
            formData.append('api_key', this.apiKey);
            
            try {
                const response = await fetch(`${API_BASE}/translate/bytecode`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) throw new Error('Upload failed');
                
                const data = await response.json();
                this.tasks.push({
                    task_id: data.task_id,
                    filename: file.name,
                    status: data.status
                });
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        },
        
        startPolling() {
            if (this.pollInterval) clearInterval(this.pollInterval);
            
            this.pollInterval = setInterval(async () => {
                for (const task of this.tasks) {
                    if (task.status === 'completed' || task.status === 'failed') continue;
                    
                    try {
                        const response = await fetch(`${API_BASE}/translate/bytecode/status/${task.task_id}`);
                        if (!response.ok) continue;
                        
                        const data = await response.json();
                        task.status = data.status;
                        task.filename = data.filename || task.filename;
                        task.output_path = data.output_path;
                    } catch (error) {
                        console.error('Polling error:', error);
                    }
                }
                
                // Stop polling if all tasks are done
                if (this.tasks.every(t => ['completed', 'failed'].includes(t.status))) {
                    clearInterval(this.pollInterval);
                }
            }, 2000);
        },
        
        downloadFile(taskId) {
            window.location.href = `${API_BASE}/translate/bytecode/download/${taskId}`;
        },
        
        getStatusClass(status) {
            const classes = {
                'queued': 'bg-gray-700 text-gray-300',
                'processing': 'bg-yellow-600 text-white',
                'completed': 'bg-green-600 text-white',
                'failed': 'bg-red-600 text-white'
            };
            return classes[status] || 'bg-gray-700 text-gray-300';
        },
        
        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    },
    beforeUnmount() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}
