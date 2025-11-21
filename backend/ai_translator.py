"""
AI Translation Module for Bytecode Translation
Supports: DeepSeek, OpenAI, Claude, Gemini
"""
import json
import httpx
import os
from typing import List, Dict


def get_http_proxy():
    """Get HTTP/HTTPS proxy, filtering out unsupported socks proxies"""
    # Check environment variables
    https_proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    http_proxy = os.environ.get('HTTP_PROXY') or os.environ.get('http_proxy')
    
    # Prefer HTTPS proxy, only use if it's http/https scheme
    if https_proxy and (https_proxy.startswith('http://') or https_proxy.startswith('https://')):
        return https_proxy
    
    if http_proxy and (http_proxy.startswith('http://') or http_proxy.startswith('https://')):
        return http_proxy
    
    return None


class AITranslator:
    """Base class for AI translation"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Get only HTTP/HTTPS proxy, ignore socks
        proxy = get_http_proxy()
        # Create client with higher limits for concurrent requests
        limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
        # Create client with or without proxy
        if proxy:
            self.client = httpx.AsyncClient(timeout=60.0, proxy=proxy, limits=limits)
        else:
            self.client = httpx.AsyncClient(timeout=60.0, limits=limits)
    
    def _should_translate(self, text: str) -> bool:
        """Check if text should be translated - STRICT: only obvious user messages"""
        if not text or len(text) < 4:  # Minimum 4 characters
            return False
        
        # Must contain at least 2 letters (to skip single letter + numbers)
        letter_count = sum(1 for c in text if c.isalpha())
        if letter_count < 2:
            return False
        
        # Skip obvious technical strings
        skip_patterns = [
            # Package/class names
            text.startswith("net.") or text.startswith("com.") or text.startswith("org."),
            text.startswith("java.") or text.startswith("javax.") or text.startswith("mojang."),
            text.startswith("forge.") or text.startswith("minecraft.") or text.startswith("mixin."),
            
            # File paths and extensions
            "/" in text or "\\" in text,
            any(text.endswith(ext) for ext in [".class", ".java", ".png", ".json", ".jar", 
                                                ".properties", ".xml", ".txt", ".cfg", ".lang",
                                                ".mcmeta", ".yml", ".yaml", ".toml", ".mod",
                                                ".ogg", ".wav", ".nbt", ".dat"]),
            
            # Java internals
            text.startswith("L") and text.endswith(";"),
            text in ["V", "I", "Z", "B", "S", "C", "D", "F", "J", "L"],
            text.startswith("(") and ")" in text,
            "<init>" in text or "<clinit>" in text,
            text.startswith("["),
            "$" in text,  # Inner classes
            "<" in text and ">" in text,  # Generics/HTML
            
            # Java keywords and common variables
            text in ["Code", "LineNumberTable", "LocalVariableTable", "SourceFile", "Signature", 
                    "InnerClasses", "EnclosingMethod", "Exceptions", "ConstantValue", "Deprecated",
                    "RuntimeVisibleAnnotations", "StackMapTable", "BootstrapMethods", "MethodParameters",
                    "this", "super", "null", "true", "false", "void", "int", "boolean", "String"],
            
            # Naming patterns
            any(text[i].islower() and text[i+1].isupper() for i in range(len(text)-1)) and " " not in text,  # camelCase
            text.islower() and "_" in text and " " not in text,  # snake_case (likely modid)
            text.isupper() and "_" in text and " " not in text,  # CONSTANT_CASE
            text.isupper() and " " not in text and len(text) < 20,  # All caps without space
            
            # Resource locations and registry
            ":" in text and " " not in text,  # namespace:path
            text.startswith("@"),  # Annotations
            text.startswith("{") or text.endswith("}"),  # NBT-like
            
            # Technical patterns
            "." in text and " " not in text and any(c.isdigit() for c in text),  # Version numbers
            text.startswith("#"),  # Hex colors or comments
            "=" in text and " " not in text,  # Assignments
            
            # Single word lowercase (likely variable/method)
            " " not in text and text.islower() and not any(c.isupper() for c in text),
        ]
        
        # Additional positive checks - must have at least one to proceed
        positive_patterns = [
            " " in text,  # Contains space (likely sentence)
            text[0].isupper() and any(c in text for c in [" ", ".", "!", "?"]),  # Starts capital with punctuation
        ]
        
        return not any(skip_patterns) and any(positive_patterns)
    
    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """Translate a batch of texts"""
        raise NotImplementedError
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


class DeepSeekTranslator(AITranslator):
    """DeepSeek AI Translator"""
    
    API_URL = "https://api.deepseek.com/v1/chat/completions"
    
    def get_lang_name(self, lang_code: str) -> str:
        lang_map = {
            "zh_cn": "Simplified Chinese",
            "zh_tw": "Traditional Chinese",
            "en_us": "English",
            "ja_jp": "Japanese",
            "de_de": "German",
            "es_es": "Spanish",
            "fr_fr": "French",
            "ru_ru": "Russian",
            "pt_br": "Brazilian Portuguese",
            "ko_kr": "Korean",
            "it_it": "Italian"
        }
        return lang_map.get(lang_code.lower(), "English")
    
    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """Translate texts using DeepSeek API"""
        if not texts:
            return []
        
        # Filter out technical strings
        filtered_texts = []
        indices = []
        for i, text in enumerate(texts):
            if self._should_translate(text):
                filtered_texts.append(text)
                indices.append(i)
        
        if not filtered_texts:
            return texts
        
        target_lang_name = self.get_lang_name(target_lang)
        
        # Build prompt
        texts_json = json.dumps(filtered_texts, ensure_ascii=False, indent=2)
        prompt = f"""You are a professional Minecraft mod translator. Translate the following strings to {target_lang_name}.

CRITICAL RULES - DO NOT TRANSLATE:
1. MOD IDs (e.g., "examplemod", "my_mod", lowercase with underscores)
2. Mod Names when used as identifiers
3. Java package names (e.g., "com.example.mod")
4. Mixin addresses and class paths
5. Technical constants, variable names, method names
6. Resource locations (format: namespace:path)
7. File paths and extensions
8. Code syntax elements ($, @, brackets, etc.)
9. NBT tags and data structure keys
10. Registry names and identifiers

ONLY TRANSLATE:
- User-facing text (GUI labels, buttons, tooltips)
- In-game messages and descriptions
- Item/block display names (when clearly user-facing)
- Help text and instructions

OTHER RULES:
- Keep color codes like §a, §c, etc.
- Preserve placeholders like %s, %d, {{0}}, etc.
- Maintain JSON format exactly
- If unsure whether to translate, DON'T translate it

Input strings (JSON array):
{texts_json}

Output only the translated JSON array, nothing else."""

        try:
            response = await self.client.post(
                self.API_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "You are a professional Minecraft mod translator."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"DeepSeek API error: {response.status_code} {response.text}")
            
            result = response.json()
            translated_text = result["choices"][0]["message"]["content"].strip()
            
            # Extract JSON array from response
            translated_text = translated_text.strip()
            if translated_text.startswith("```json"):
                translated_text = translated_text[7:]
            if translated_text.startswith("```"):
                translated_text = translated_text[3:]
            if translated_text.endswith("```"):
                translated_text = translated_text[:-3]
            translated_text = translated_text.strip()
            
            translated_list = json.loads(translated_text)
            
            # Merge back
            result_texts = texts.copy()
            for i, idx in enumerate(indices):
                if i < len(translated_list):
                    result_texts[idx] = translated_list[i]
            
            return result_texts
            
        except Exception as e:
            print(f"DeepSeek translation error: {e}")
            return texts


class OpenAITranslator(AITranslator):
    """OpenAI GPT Translator"""
    
    API_URL = "https://api.openai.com/v1/chat/completions"
    
    def get_lang_name(self, lang_code: str) -> str:
        lang_map = {
            "zh_cn": "Simplified Chinese",
            "zh_tw": "Traditional Chinese",
            "en_us": "English",
            "ja_jp": "Japanese",
            "de_de": "German",
            "es_es": "Spanish",
            "fr_fr": "French",
            "ru_ru": "Russian",
            "pt_br": "Brazilian Portuguese",
            "ko_kr": "Korean",
            "it_it": "Italian"
        }
        return lang_map.get(lang_code.lower(), "English")
    
    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """Translate texts using OpenAI GPT-4o-mini"""
        if not texts:
            return []
        
        filtered_texts = []
        indices = []
        for i, text in enumerate(texts):
            if self._should_translate(text):
                filtered_texts.append(text)
                indices.append(i)
        
        if not filtered_texts:
            return texts
        
        target_lang_name = self.get_lang_name(target_lang)
        texts_json = json.dumps(filtered_texts, ensure_ascii=False, indent=2)
        
        prompt = f"""Translate the following Minecraft mod strings to {target_lang_name}.

CRITICAL - DO NOT TRANSLATE:
1. MOD IDs (lowercase_with_underscores)
2. Mod Names as identifiers
3. Java packages (com.example.mod)
4. Mixin addresses and class paths
5. Technical constants, variables, methods
6. Resource locations (namespace:path)
7. File paths and code elements
8. Registry names and NBT tags

ONLY TRANSLATE:
- User-facing GUI text
- In-game messages
- Tooltips and descriptions

Preserve color codes (§a, §c) and placeholders (%s, {{0}}).
Output only JSON array.

Input:
{texts_json}"""

        try:
            response = await self.client.post(
                self.API_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a Minecraft mod translator."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.status_code} {response.text}")
            
            result = response.json()
            translated_text = result["choices"][0]["message"]["content"].strip()
            
            # Clean response
            if translated_text.startswith("```json"):
                translated_text = translated_text[7:]
            if translated_text.startswith("```"):
                translated_text = translated_text[3:]
            if translated_text.endswith("```"):
                translated_text = translated_text[:-3]
            translated_text = translated_text.strip()
            
            translated_list = json.loads(translated_text)
            
            result_texts = texts.copy()
            for i, idx in enumerate(indices):
                if i < len(translated_list):
                    result_texts[idx] = translated_list[i]
            
            return result_texts
            
        except Exception as e:
            print(f"OpenAI translation error: {e}")
            return texts
    
class ClaudeTranslator(AITranslator):
    """Anthropic Claude Translator"""
    
    API_URL = "https://api.anthropic.com/v1/messages"
    
    def get_lang_name(self, lang_code: str) -> str:
        lang_map = {
            "zh_cn": "Simplified Chinese",
            "zh_tw": "Traditional Chinese",
            "en_us": "English",
            "ja_jp": "Japanese",
            "de_de": "German",
            "es_es": "Spanish",
            "fr_fr": "French",
            "ru_ru": "Russian",
            "pt_br": "Brazilian Portuguese",
            "ko_kr": "Korean",
            "it_it": "Italian"
        }
        return lang_map.get(lang_code.lower(), "English")
    
    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """Translate texts using Claude Haiku"""
        if not texts:
            return []
        
        filtered_texts = []
        indices = []
        for i, text in enumerate(texts):
            if self._should_translate(text):
                filtered_texts.append(text)
                indices.append(i)
        
        if not filtered_texts:
            return texts
        
        target_lang_name = self.get_lang_name(target_lang)
        texts_json = json.dumps(filtered_texts, ensure_ascii=False, indent=2)
        
        prompt = f"""Translate these Minecraft mod strings to {target_lang_name}.

CRITICAL - DO NOT TRANSLATE:
1. MOD IDs, Java packages, Mixin paths
2. Technical identifiers and constants
3. Resource locations (namespace:path)
4. Registry names, NBT tags, code elements

ONLY TRANSLATE user-facing text.
Preserve color codes (§) and placeholders (%s, {{0}}).
Output only JSON array.

{texts_json}"""

        try:
            response = await self.client.post(
                self.API_URL,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 4096,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Claude API error: {response.status_code} {response.text}")
            
            result = response.json()
            translated_text = result["content"][0]["text"].strip()
            
            # Clean response
            if translated_text.startswith("```json"):
                translated_text = translated_text[7:]
            if translated_text.startswith("```"):
                translated_text = translated_text[3:]
            if translated_text.endswith("```"):
                translated_text = translated_text[:-3]
            translated_text = translated_text.strip()
            
            translated_list = json.loads(translated_text)
            
            result_texts = texts.copy()
            for i, idx in enumerate(indices):
                if i < len(translated_list):
                    result_texts[idx] = translated_list[i]
            
            return result_texts
            
        except Exception as e:
            print(f"Claude translation error: {e}")
            return texts
    
class GeminiTranslator(AITranslator):
    """Google Gemini Translator"""
    
    def get_api_url(self) -> str:
        return f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
    
    def get_lang_name(self, lang_code: str) -> str:
        lang_map = {
            "zh_cn": "Simplified Chinese",
            "zh_tw": "Traditional Chinese",
            "en_us": "English",
            "ja_jp": "Japanese",
            "de_de": "German",
            "es_es": "Spanish",
            "fr_fr": "French",
            "ru_ru": "Russian",
            "pt_br": "Brazilian Portuguese",
            "ko_kr": "Korean",
            "it_it": "Italian"
        }
        return lang_map.get(lang_code.lower(), "English")
    
    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """Translate texts using Gemini Pro"""
        if not texts:
            return []
        
        filtered_texts = []
        indices = []
        for i, text in enumerate(texts):
            if self._should_translate(text):
                filtered_texts.append(text)
                indices.append(i)
        
        if not filtered_texts:
            return texts
        
        target_lang_name = self.get_lang_name(target_lang)
        texts_json = json.dumps(filtered_texts, ensure_ascii=False, indent=2)
        
        prompt = f"""Translate these Minecraft mod strings to {target_lang_name}.

CRITICAL - DO NOT TRANSLATE:
1. MOD IDs (lowercase_with_underscores)
2. Java packages and Mixin paths
3. Technical identifiers, registry names
4. Resource locations (namespace:path)
5. Code elements and constants

ONLY TRANSLATE user-facing text.
Preserve color codes and placeholders.
Output only JSON array.

{texts_json}"""

        try:
            response = await self.client.post(
                self.get_api_url(),
                headers={
                    "Content-Type": "application/json"
                },
                json={
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 8192
                    }
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.status_code} {response.text}")
            
            result = response.json()
            translated_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Clean response
            if translated_text.startswith("```json"):
                translated_text = translated_text[7:]
            if translated_text.startswith("```"):
                translated_text = translated_text[3:]
            if translated_text.endswith("```"):
                translated_text = translated_text[:-3]
            translated_text = translated_text.strip()
            
            translated_list = json.loads(translated_text)
            
            result_texts = texts.copy()
            for i, idx in enumerate(indices):
                if i < len(translated_list):
                    result_texts[idx] = translated_list[i]
            
            return result_texts
            
        except Exception as e:
            print(f"Gemini translation error: {e}")
            return texts
    
def get_translator(ai_model: str, api_key: str) -> AITranslator:
    """Factory function to get appropriate translator"""
    translators = {
        "Deepseek": DeepSeekTranslator,
        "OpenAI": OpenAITranslator,
        "Claude": ClaudeTranslator,
        "Gemini": GeminiTranslator
    }
    
    translator_class = translators.get(ai_model)
    if not translator_class:
        raise ValueError(f"Unsupported AI model: {ai_model}")
    
    return translator_class(api_key)
