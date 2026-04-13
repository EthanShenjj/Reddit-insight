from openai import OpenAI
import os
import google.generativeai as genai
import anthropic

class LLMService:
    def __init__(self):
        # Default environment variables for fallback
        self.default_api_key = os.getenv("OPENAI_API_KEY")
        self.default_base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.default_model = os.getenv("LLM_MODEL", "gpt-4o")
        
        # We don't initialize a single client in __init__ anymore, 
        # as it may change per request from the UI.
        self.openai_client = None
        if self.default_api_key:
            self.openai_client = OpenAI(api_key=self.default_api_key, base_url=self.default_base_url)

    def analyze_pain_points(self, data_context, query, data_coverage_time=None, llm_config=None):
        """
        Calls LLM to analyze the provided Reddit data.
        llm_config is expected to be a dictionary from the UI (provider, apiKey, model, baseUrl, etc.)
        """
        system_prompt = (
            "你是一个资深产品发现（Product Discovery）分析师。你的任务是从非结构化的 Reddit 讨论中挖掘用户痛点。\n\n"
            "请根据提供的数据，输出一份结构化的《用户痛点分析报告》。报告必须包含以下部分：\n"
            "0. **报告头部信息**：必须包含“分析对象”和“数据覆盖时间”两行。\n"
            "1. **核心痛点归类**：将痛点分为“功能缺失”、“体验糟糕”、“价格昂改”、“学习成本高”等维度。\n"
            "2. **场景还原**：用简洁的语言描述用户在什么具体场景下产生了抱怨。\n"
            "3. **现有权宜之计 (Workarounds)**：用户目前是如何临时解决这些问题的？\n"
            "4. **情绪与强度**：根据点赞数和语气，评估该需求的优先级（P0-P3）。\n"
            "5. **机会点建议**：基于痛点，如果你是产品经理，你会如何改进？\n\n"
            "请使用 Markdown 表格形式展示痛点列表。\n"
            "严禁输出“分析日期”字段；只能输出“数据覆盖时间”。"
        )
        
        coverage_text = data_coverage_time or "未知（源数据未提供可解析时间）"
        user_prompt = (
            f"以下是关于 '{query}' 的 Reddit 讨论数据：\n\n"
            f"{data_context}\n\n"
            f"系统已计算的数据覆盖时间：{coverage_text}\n\n"
            "请开始分析并输出 Markdown 报告。"
        )
        
        provider = llm_config.get('provider', 'openai') if llm_config else 'openai'
        api_key = llm_config.get('apiKey') if llm_config else self.default_api_key
        model = llm_config.get('model') if llm_config else self.default_model
        base_url = llm_config.get('baseUrl') if llm_config else self.default_base_url
        temperature = llm_config.get('temperature', 0.7) if llm_config else 0.7

        try:
            if provider == 'gemini':
                return self._call_gemini(api_key, model, temperature, system_prompt, user_prompt)
            elif provider == 'anthropic':
                return self._call_anthropic(api_key, model, temperature, system_prompt, user_prompt)
            else: # openai or custom
                return self._call_openai(api_key, model, base_url, temperature, system_prompt, user_prompt)
        except Exception as e:
            print(f"Error calling {provider}: {e}")
            return f"Error analyzing data with {provider}: {e}"

    def _call_openai(self, api_key, model, base_url, temperature, system_prompt, user_prompt):
        client = OpenAI(api_key=api_key, base_url=base_url)
        
        # OpenAI o1 models (o1-preview, o1-mini) only support temperature=1
        if model.lower().startswith('o1'):
            temperature = 1.0
            
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content

    def _call_gemini(self, api_key, model, temperature, system_prompt, user_prompt):
        genai.configure(api_key=api_key)
        # Gemini-1.5 models support system_instruction
        gemini_model = genai.GenerativeModel(
            model_name=model,
            system_instruction=system_prompt,
            generation_config={"temperature": temperature}
        )
        response = gemini_model.generate_content(user_prompt)
        return response.text

    def _call_anthropic(self, api_key, model, temperature, system_prompt, user_prompt):
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return message.content[0].text
