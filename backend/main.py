import asyncio
import json
import os
import shutil
import struct
import zipfile
import aiofiles
import time
from typing import List, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

from ai_translator import get_translator

# Configuration
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
STATS_FILE = "stats.json"
QUEUE_MAX_SIZE = 20
MAX_CONCURRENT_BATCHES = 5  # Number of translation batches to process concurrently

# Task storage
bytecode_tasks = {}
task_counter = 0

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Stats management
def load_stats():
    if not os.path.exists(STATS_FILE):
        return {"visits": 0, "usage": 0}
    with open(STATS_FILE, "r") as f:
        return json.load(f)

def save_stats(stats):
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f)

def increment_stat(key):
    stats = load_stats()
    stats[key] = stats.get(key, 0) + 1
    save_stats(stats)

# Global Queue
processing_queue = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)

# Cleanup settings
CLEANUP_INTERVAL = 3600  # Check every hour
MAX_FILE_AGE = 3600  # Delete files older than 2 hours

def cleanup_old_files():
    """Clean up old files from uploads and outputs directories"""
    import time
    current_time = time.time()
    cleaned_count = 0
    
    for directory in [UPLOAD_DIR, OUTPUT_DIR]:
        if not os.path.exists(directory):
            continue
            
        for filename in os.listdir(directory):
            filepath = os.path.join(directory, filename)
            try:
                # Check if file is older than MAX_FILE_AGE
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    if file_age > MAX_FILE_AGE:
                        os.remove(filepath)
                        cleaned_count += 1
                        print(f"Cleaned up old file: {filename}")
            except Exception as e:
                print(f"Error cleaning up {filename}: {e}")
    
    if cleaned_count > 0:
        print(f"Cleanup completed: removed {cleaned_count} old files")
    
    return cleaned_count

async def periodic_cleanup():
    """Periodically clean up old files"""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL)
        cleanup_old_files()

# Java Class File Constants
CONSTANT_Utf8 = 1
CONSTANT_Integer = 3
CONSTANT_Float = 4
CONSTANT_Long = 5
CONSTANT_Double = 6
CONSTANT_Class = 7
CONSTANT_String = 8
CONSTANT_Fieldref = 9
CONSTANT_Methodref = 10
CONSTANT_InterfaceMethodref = 11
CONSTANT_NameAndType = 12
CONSTANT_MethodHandle = 15
CONSTANT_MethodType = 16
CONSTANT_InvokeDynamic = 18


class ClassFileModifier:
    def __init__(self, data):
        self.data = data
        self.pos = 0
        self.constant_pool = []
        self.rest_of_file = b""

    def read_u1(self):
        val = self.data[self.pos]
        self.pos += 1
        return val

    def read_u2(self):
        val = struct.unpack(">H", self.data[self.pos:self.pos+2])[0]
        self.pos += 2
        return val

    def read_u4(self):
        val = struct.unpack(">I", self.data[self.pos:self.pos+4])[0]
        self.pos += 4
        return val

    def read_bytes(self, n):
        val = self.data[self.pos:self.pos+n]
        self.pos += n
        return val

    def parse(self):
        magic = self.read_u4()
        if magic != 0xCAFEBABE:
            raise ValueError("Not a valid Java class file")

        minor_version = self.read_u2()
        major_version = self.read_u2()
        constant_pool_count = self.read_u2()

        self.constant_pool = [None]

        i = 1
        while i < constant_pool_count:
            tag = self.read_u1()
            
            if tag == CONSTANT_Utf8:
                length = self.read_u2()
                bytes_val = self.read_bytes(length)
                self.constant_pool.append({"tag": tag, "bytes": bytes_val})
            elif tag in [CONSTANT_Integer, CONSTANT_Float]:
                val = self.read_u4()
                self.constant_pool.append({"tag": tag, "value": val})
            elif tag in [CONSTANT_Long, CONSTANT_Double]:
                val = self.read_bytes(8)
                self.constant_pool.append({"tag": tag, "value": val})
                self.constant_pool.append(None)
                i += 1
            elif tag in [CONSTANT_Class, CONSTANT_String, CONSTANT_MethodType]:
                index = self.read_u2()
                self.constant_pool.append({"tag": tag, "index": index})
            elif tag in [CONSTANT_Fieldref, CONSTANT_Methodref, CONSTANT_InterfaceMethodref, CONSTANT_NameAndType]:
                index1 = self.read_u2()
                index2 = self.read_u2()
                self.constant_pool.append({"tag": tag, "index1": index1, "index2": index2})
            elif tag == CONSTANT_MethodHandle:
                ref_kind = self.read_u1()
                ref_index = self.read_u2()
                self.constant_pool.append({"tag": tag, "ref_kind": ref_kind, "ref_index": ref_index})
            elif tag == CONSTANT_InvokeDynamic:
                bootstrap_method_attr_index = self.read_u2()
                name_and_type_index = self.read_u2()
                self.constant_pool.append({
                    "tag": tag,
                    "bootstrap_method_attr_index": bootstrap_method_attr_index,
                    "name_and_type_index": name_and_type_index
                })
            else:
                raise ValueError(f"Unknown constant pool tag: {tag}")
            
            i += 1

        self.rest_of_file = self.data[self.pos:]

    def modify_utf8_strings(self, modifier_func):
        """Modify UTF-8 strings in constant pool"""
        for i, entry in enumerate(self.constant_pool):
            if entry and entry.get("tag") == CONSTANT_Utf8:
                try:
                    original_str = entry["bytes"].decode("utf-8")
                    modified_str = modifier_func(original_str)
                    entry["bytes"] = modified_str.encode("utf-8")
                except:
                    pass

    def build(self):
        """Rebuild the class file"""
        output = bytearray()
        
        # Magic number
        output.extend(struct.pack(">I", 0xCAFEBABE))
        
        # Version
        output.extend(self.data[4:8])
        
        # Constant pool count
        output.extend(struct.pack(">H", len(self.constant_pool)))
        
        # Constant pool
        for entry in self.constant_pool[1:]:
            if entry is None:
                continue
                
            tag = entry["tag"]
            output.append(tag)
            
            if tag == CONSTANT_Utf8:
                bytes_val = entry["bytes"]
                output.extend(struct.pack(">H", len(bytes_val)))
                output.extend(bytes_val)
            elif tag in [CONSTANT_Integer, CONSTANT_Float]:
                output.extend(struct.pack(">I", entry["value"]))
            elif tag in [CONSTANT_Long, CONSTANT_Double]:
                output.extend(entry["value"])
            elif tag in [CONSTANT_Class, CONSTANT_String, CONSTANT_MethodType]:
                output.extend(struct.pack(">H", entry["index"]))
            elif tag in [CONSTANT_Fieldref, CONSTANT_Methodref, CONSTANT_InterfaceMethodref, CONSTANT_NameAndType]:
                output.extend(struct.pack(">H", entry["index1"]))
                output.extend(struct.pack(">H", entry["index2"]))
            elif tag == CONSTANT_MethodHandle:
                output.append(entry["ref_kind"])
                output.extend(struct.pack(">H", entry["ref_index"]))
            elif tag == CONSTANT_InvokeDynamic:
                output.extend(struct.pack(">H", entry["bootstrap_method_attr_index"]))
                output.extend(struct.pack(">H", entry["name_and_type_index"]))
        
        # Rest of file
        output.extend(self.rest_of_file)
        
        return bytes(output)


async def process_jar(jar_path: str, target_lang: str, ai_model: str, api_key: str, task_id: str = None, return_translations: bool = False, selected_translations: dict = None):
    """Process a JAR file and translate class file strings
    
    Args:
        return_translations: If True, return translation pairs instead of writing files
        selected_translations: Dict of {original: translated} for user-confirmed translations
    """
    temp_extract_dir = f"{jar_path}_extracted"
    os.makedirs(temp_extract_dir, exist_ok=True)
    
    translator = None
    
    try:
        # If selected_translations provided, skip translation and apply directly
        if selected_translations:
            translation_map = selected_translations
        else:
            # Get translator instance
            translator = get_translator(ai_model, api_key)
        
        # Extract JAR
        with zipfile.ZipFile(jar_path, 'r') as zip_ref:
            zip_ref.extractall(temp_extract_dir)
        
        # Collect all strings from all class files first (always needed)
        all_strings = []
        class_files_info = []
        
        for root, dirs, files in os.walk(temp_extract_dir):
            for file in files:
                if file.endswith('.class'):
                    class_path = os.path.join(root, file)
                    
                    try:
                        with open(class_path, 'rb') as f:
                            class_data = f.read()
                        
                        modifier = ClassFileModifier(class_data)
                        modifier.parse()
                        
                        # Extract strings
                        strings_in_class = []
                        for entry in modifier.constant_pool:
                            if entry and entry.get("tag") == CONSTANT_Utf8:
                                try:
                                    text = entry["bytes"].decode("utf-8")
                                    strings_in_class.append(text)
                                except:
                                    strings_in_class.append(None)
                            else:
                                strings_in_class.append(None)
                        
                        class_files_info.append({
                            "path": class_path,
                            "modifier": modifier,
                            "strings": strings_in_class
                        })
                        
                        all_strings.extend([s for s in strings_in_class if s is not None])
                        
                    except Exception as e:
                        print(f"Failed to parse {class_path}: {e}")
                        continue
        
        # If we have translations to apply, skip the translation process
        if not selected_translations:
            # Translate all strings in batches
            if all_strings:
                # Split into batches of 50 strings
                batch_size = 50
                total_batches = (len(all_strings) + batch_size - 1) // batch_size
                
                # Update total batches info and start time
                start_time = time.time()
                if task_id and task_id in bytecode_tasks:
                    bytecode_tasks[task_id]["total_batches"] = total_batches
                    bytecode_tasks[task_id]["start_time"] = start_time
                
                # Prepare all batches
                batches = []
                for i in range(0, len(all_strings), batch_size):
                    batch = all_strings[i:i + batch_size]
                    batches.append((i // batch_size + 1, batch))
                
                # Concurrent translation with controlled parallelism
                max_concurrent = MAX_CONCURRENT_BATCHES  # Process multiple batches at once
                translated_all = []
                completed_batches = 0
                
                print(f"Starting parallel translation: {total_batches} batches, {max_concurrent} concurrent")
                
                async def translate_with_progress(batch_num, batch):
                    nonlocal completed_batches
                    result = await translator.translate_batch(batch, target_lang)
                    completed_batches += 1
                    
                    # Calculate ETA
                    if task_id and task_id in bytecode_tasks:
                        elapsed_time = time.time() - start_time
                        avg_time_per_batch = elapsed_time / completed_batches
                        remaining_batches = total_batches - completed_batches
                        eta_seconds = int(avg_time_per_batch * remaining_batches)
                        
                        bytecode_tasks[task_id]["current_batch"] = completed_batches
                        bytecode_tasks[task_id]["progress"] = int((completed_batches / total_batches) * 100)
                        bytecode_tasks[task_id]["eta_seconds"] = eta_seconds
                    
                    print(f"Completed batch {completed_batches}/{total_batches}")
                    return (batch_num, result)
                
                # Process batches in chunks with controlled concurrency
                for chunk_start in range(0, len(batches), max_concurrent):
                    chunk = batches[chunk_start:chunk_start + max_concurrent]
                    tasks = [translate_with_progress(batch_num, batch) for batch_num, batch in chunk]
                    chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # Handle results and errors
                    for result in chunk_results:
                        if isinstance(result, Exception):
                            print(f"Batch translation error: {result}")
                            # Use original text on error
                            translated_all.extend(batches[len(translated_all) // batch_size][1])
                        else:
                            _, translated = result
                            translated_all.extend(translated)
                
                # Build translation map
                translation_map = {}
                for orig, trans in zip(all_strings, translated_all):
                    translation_map[orig] = trans
                
                # If return_translations mode, return the translation pairs for user confirmation
                if return_translations:
                    # Cleanup
                    shutil.rmtree(temp_extract_dir)
                    if translator:
                        await translator.close()
                    
                    # Return translation pairs
                    # Include all strings that pass filter, mark whether they changed
                    translation_pairs = [
                        {
                            "original": orig, 
                            "translated": trans, 
                            "index": idx,
                            "changed": orig != trans
                        }
                        for idx, (orig, trans) in enumerate(zip(all_strings, translated_all))
                    ]
                    
                    # Count how many actually changed
                    changed_count = sum(1 for pair in translation_pairs if pair["changed"])
                    
                    return {
                        "translation_pairs": translation_pairs,
                        "total_strings": len(all_strings),
                        "changed_strings": changed_count
                    }
        
        # Apply translations to class files
        for class_info in class_files_info:
                modifier = class_info["modifier"]
                
                # Apply translations
                for i, entry in enumerate(modifier.constant_pool):
                    if entry and entry.get("tag") == CONSTANT_Utf8:
                        try:
                            original_text = entry["bytes"].decode("utf-8")
                            if original_text in translation_map:
                                translated_text = translation_map[original_text]
                                entry["bytes"] = translated_text.encode("utf-8")
                        except:
                            pass
                
                # Write modified class
                modified_data = modifier.build()
                with open(class_info["path"], 'wb') as f:
                    f.write(modified_data)
        
        # Repackage JAR
        output_jar = os.path.join(OUTPUT_DIR, f"translated_{os.path.basename(jar_path)}")
        
        with zipfile.ZipFile(output_jar, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_extract_dir)
                    zipf.write(file_path, arcname)
        
        # Cleanup
        shutil.rmtree(temp_extract_dir)
        
        # Close translator
        if translator:
            await translator.close()
        
        return output_jar
    
    except Exception as e:
        if os.path.exists(temp_extract_dir):
            shutil.rmtree(temp_extract_dir)
        if translator:
            await translator.close()
        raise e


async def worker():
    """Background worker to process tasks"""
    while True:
        task = await processing_queue.get()
        task_id, task_type, future = task
        
        try:
            if task_type == "bytecode":
                task_info = bytecode_tasks[task_id]
                task_info["status"] = "processing"
                
                # Get return_translations flag
                return_translations = task_info.get("return_translations", False)
                
                result = await process_jar(
                    task_info["file_location"],
                    task_info["target_lang"],
                    task_info["ai_model"],
                    task_info["api_key"],
                    task_id,  # Pass task_id for progress tracking
                    return_translations=return_translations
                )
                
                if result:
                    if return_translations and isinstance(result, dict):
                        # Translation pairs returned for review
                        task_info["status"] = "review"
                        task_info["translation_pairs"] = result.get("translation_pairs", [])
                        task_info["total_strings"] = result.get("total_strings", 0)
                        task_info["changed_strings"] = result.get("changed_strings", 0)
                    else:
                        # Direct output (old behavior)
                        task_info["status"] = "completed"
                        task_info["output_path"] = result
                else:
                    task_info["status"] = "failed"
                    task_info["error"] = "Processing failed"
                
                if not future.done():
                    future.set_result(result)
                    
        except Exception as e:
            if task_type == "bytecode" and task_id in bytecode_tasks:
                bytecode_tasks[task_id]["status"] = "failed"
                bytecode_tasks[task_id]["error"] = str(e)
            
            if not future.done():
                future.set_exception(e)
        finally:
            processing_queue.task_done()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting background worker and cleanup task...")
    asyncio.create_task(worker())
    asyncio.create_task(periodic_cleanup())
    # Clean up old files on startup
    cleanup_old_files()
    yield
    # Shutdown
    print("Shutting down...")


# FastAPI App
app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    increment_stat("visits")
    return {"message": "XTMC Translate API", "version": "1.0"}


@app.get("/stats")
async def get_stats():
    """Get usage statistics"""
    return load_stats()


@app.post("/translate/bytecode")
async def translate_bytecode(
    file: UploadFile = File(...),
    target_lang: str = Form("zh_cn"),
    ai_model: str = Form("Deepseek"),
    api_key: str = Form("")
):
    """Translate JAR bytecode (queue-based)"""
    global task_counter
    increment_stat("usage")
    
    if not api_key:
        raise HTTPException(status_code=400, detail="API key is required")
    
    task_id = f"bytecode_{task_counter}"
    task_counter += 1
    
    # Save uploaded file
    file_location = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")
    async with aiofiles.open(file_location, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Create task record
    bytecode_tasks[task_id] = {
        "status": "queued",
        "filename": file.filename,
        "file_location": file_location,
        "target_lang": target_lang,
        "ai_model": ai_model,
        "api_key": api_key,
        "progress": 0,
        "total_batches": 0,
        "current_batch": 0,
        "eta_seconds": 0,
        "start_time": 0,
        "translation_pairs": [],  # Store translation results for review
        "return_translations": True  # Flag to return translations instead of直接applying
    }
    
    # Add to queue
    loop = asyncio.get_event_loop()
    future = loop.create_future()
    
    try:
        processing_queue.put_nowait((task_id, "bytecode", future))
    except asyncio.QueueFull:
        bytecode_tasks[task_id]["status"] = "failed"
        bytecode_tasks[task_id]["error"] = "Queue is full"
        raise HTTPException(status_code=503, detail="Queue is full. Please try again later.")
    
    return {"task_id": task_id, "status": "queued", "filename": file.filename}


@app.post("/translate/bytecode/apply")
async def apply_bytecode_translation(
    task_id: str = Form(...),
    selected_translations: str = Form("{}")  # JSON object of {original: translated}
):
    """Apply user-confirmed translations and generate JAR file"""
    if task_id not in bytecode_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = bytecode_tasks[task_id]
    
    if task_info["status"] != "review":
        raise HTTPException(status_code=400, detail="Task is not in review state")
    
    # Parse selected translations
    try:
        import json as json_lib
        translation_map = json_lib.loads(selected_translations)
    except:
        raise HTTPException(status_code=400, detail="Invalid selected_translations format")
    
    if not translation_map:
        raise HTTPException(status_code=400, detail="No translations selected")
    
    try:
        # Apply translations
        result = await process_jar(
            task_info["file_location"],
            task_info["target_lang"],
            task_info["ai_model"],
            task_info["api_key"],
            task_id,
            return_translations=False,
            selected_translations=translation_map
        )
        
        task_info["status"] = "completed"
        task_info["output_path"] = result
        
        return {"status": "success", "message": "Translations applied successfully"}
    
    except Exception as e:
        task_info["status"] = "failed"
        task_info["error"] = str(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translate/bytecode/preview")
async def preview_bytecode_strings(
    file: UploadFile = File(...),
    target_lang: str = Form("zh_cn"),
    ai_model: str = Form("Deepseek")
):
    """Preview strings that will be translated from JAR bytecode"""
    global task_counter
    
    task_id = f"preview_{task_counter}"
    task_counter += 1
    
    # Save uploaded file temporarily
    file_location = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")
    async with aiofiles.open(file_location, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    try:
        # Extract strings in preview mode
        result = await process_jar(
            file_location,
            target_lang,
            ai_model,
            "",  # No API key needed for preview
            task_id,
            preview_mode=True
        )
        
        # Clean up the uploaded file
        if os.path.exists(file_location):
            os.remove(file_location)
        
        return {
            "task_id": task_id,
            "filename": file.filename,
            "strings": result["strings"],
            "total": result["total"]
        }
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/translate/bytecode/status/{task_id}")
async def get_bytecode_status(task_id: str):
    """Get status of a bytecode translation task"""
    if task_id not in bytecode_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return bytecode_tasks[task_id]


@app.get("/translate/bytecode/download/{task_id}")
async def download_bytecode(task_id: str):
    """Download translated JAR file"""
    if task_id not in bytecode_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = bytecode_tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Task not completed yet")
    
    output_path = task.get("output_path")
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    return FileResponse(output_path, filename=f"translated_{task['filename']}")


@app.get("/translate/bytecode/list")
async def list_bytecode_tasks():
    """List all bytecode translation tasks"""
    return list(bytecode_tasks.values())


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
