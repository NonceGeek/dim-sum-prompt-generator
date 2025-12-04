"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

const models = {
  chatgpt: "https://chatgpt.com/",
  deepseek: "https://chat.deepseek.com/",
  gemini: "https://gemini.google.com/",
  yuanbao: "https://yuanbao.tencent.com/",
};
const templates = [
  {
    name: "粤语例句生成器",
    prompt: "{data}, 这里是从词典中拿到的粤语词汇，请基于这个词条生成 10 条粤语例句。注意每句话要标注上拼音。",
    adapted_models: ["chatgpt", "deepseek", "yuanbao"],
  },
  {
    name: "粤语配图小作文",
    prompt: "{data}, 这里是从词典中拿到的粤语词汇，请基于这个词条生成一段小故事配套一个说明图片。",
    adapted_models: ["chatgpt", "deepseek", "yuanbao"],
  },
];

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  // Modal state for Arweave image loading
  const [showArweaveModal, setShowArweaveModal] = useState(false);
  const [arweaveId, setArweaveId] = useState("MMvC6uvJySsxo7p7peL3IoenhgJF3wwYSR2YVpSQi_M");

  // Corpus item state
  const [corpusItem, setCorpusItem] = useState<any>(null);

  // Generated prompt state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  // Function to fetch corpus item from backend
  const fetchCorpusItem = useCallback(async (uniqueId: string) => {
    try {
      const response = await fetch(`https://backend.aidimsum.com/corpus_item?unique_id=${uniqueId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch corpus item: ${response.statusText}`);
      }
      const data = await response.json();

      // get category from backend with data.category curl -X GET "https://backend.aidimsum.com/corpus_category?name=zyzd"
      const categoryResponse = await fetch(`https://backend.aidimsum.com/corpus_category?name=${data[0].category}`);
      if (!categoryResponse.ok) {
        throw new Error(`Failed to fetch corpus category: ${categoryResponse.statusText}`);
      }
      const categoryData = await categoryResponse.json();
      console.log("Corpus item data:", data[0]);
      console.log("Corpus category data:", categoryData[0]);
      // replace the data.category with categoryData
      data[0].category = categoryData[0];

      return data;
    } catch (error) {
      console.error("Error fetching corpus item:", error);
      alert("无法加载语料数据，请检查 unique_id 是否正确");
      return null;
    }
  }, []);

  const handleRandomTemplate = () => {
    const randomIndex = Math.floor(Math.random() * templates.length);
    selectTemplate(templates[randomIndex]);
  };

  // Function to get nested property value from object
  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return "";
      }
    }
    return value != null ? String(value) : "";
  };

  // Function to generate prompt by replacing placeholders
  const generatePrompt = () => {
    if (!corpusItem) {
      alert("请先加载语料数据");
      return;
    }

    let prompt = selectedTemplate.prompt;

    // Replace {data} with stringified corpusItem
    prompt = prompt.replace(/\{data\}/g, JSON.stringify(corpusItem, null, 2) || "");

    // Replace nested placeholders like {data.note.context.meaning}
    const nestedPlaceholderRegex = /\{data\.([^}]+)\}/g;
    prompt = prompt.replace(nestedPlaceholderRegex, (match, path) => {
      const value = getNestedValue(corpusItem, path);
      return value || match; // Return original if not found
    });

    setGeneratedPrompt(prompt);
  };

  const selectTemplate = (template: (typeof templates)[0]) => {
    setSelectedTemplate(template);
  };

  const loadPicFromArweave = () => {
    setShowArweaveModal(true);
  };

  const closeArweaveModal = () => {
    setShowArweaveModal(false);
    setArweaveId("MMvC6uvJySsxo7p7peL3IoenhgJF3wwYSR2YVpSQi_M");
  };

  const loadArweaveImage = useCallback(
    async (urlArId?: string) => {
      const idToUse = urlArId || arweaveId.trim();

      if (!idToUse) {
        alert("请输入有效的 Arweave ID");
        return;
      }

      try {
        // Create Arweave URL
        const arweaveUrl = `https://arweave.net/${idToUse}`;

        // Test if the image loads successfully
        const testImage = new Image();
        await new Promise((resolve, reject) => {
          testImage.onload = resolve;
          testImage.onerror = reject;
          testImage.src = arweaveUrl;
        });

        // Create a new template from the Arweave image
        const newTemplate = {
          name: `讲D乜？`,
          prompt: "",
          adapted_models: [],
          image: arweaveUrl,
          active: true,
        } as (typeof templates)[0] & { image: string };

        // Set as selected template
        setSelectedTemplate(newTemplate);

        // Close modal if it was opened manually
        if (!urlArId) {
          closeArweaveModal();
        }

        // Update arweaveId state if loaded from URL
        if (urlArId) {
          setArweaveId(urlArId);
        }
      } catch (error) {
        console.error("Error loading Arweave image:", error);
        alert("无法加载该 Arweave 图片，请检查 ID 是否正确");
      }
    },
    [arweaveId],
  );

  // Check for ar_id URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const arId = urlParams.get("ar_id");

    if (arId) {
      // Load the Arweave image automatically
      loadArweaveImage(arId);

      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("ar_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, [loadArweaveImage]);

  // Check for unique_id URL parameter on component mount to fetch corpus item
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uniqueId = urlParams.get("unique_id") || "6e29005d-31ed-42d6-be17-baab39b07fa1";

    // Fetch corpus item from backend
    (async () => {
      const data = await fetchCorpusItem(uniqueId);
      console.log("Corpus item data:", data);
      if (data && data[0]) {
        setCorpusItem(data[0]);
      }
    })();
  }, [fetchCorpusItem]);

  // Recursive function to render JSON values
  const renderValue = (value: any, depth: number = 0): React.ReactNode => {
    // Try to parse if it's a JSON string
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return renderValue(parsed, depth);
      } catch {
        // Not JSON, return as string
        return <span className="text-xs text-gray-800">{value}</span>;
      }
    }

    // Handle objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return (
        <div className={`space-y-1 ${depth > 0 ? "ml-4 mt-1" : ""}`}>
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <span className="text-xs font-medium text-gray-600">{key}：</span>
              {renderValue(val, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      // Check if array contains only primitives (not objects or arrays)
      const hasComplexItems = value.some(
        item => typeof item === "object" && item !== null && (Array.isArray(item) || Object.keys(item).length > 0),
      );

      // If array contains only primitives, show it as a compact string
      if (!hasComplexItems) {
        return <span className="text-xs text-gray-800">[{value.join(", ")}]</span>;
      }

      // If array contains objects or nested structures, expand it
      return (
        <div className={`space-y-1 ${depth > 0 ? "ml-4 mt-1" : ""}`}>
          {value.map((item, index) => (
            <div key={index}>
              <span className="text-xs font-medium text-gray-600">[{index}]：</span>
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    // Handle primitives (number, boolean, null)
    return <span className="text-xs text-gray-800">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-[#e6e9ea] font-sans">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dim Sum Prompt Generator</h1>
        <p className="text-gray-600 text-sm">从语料到 Prompt！</p>
      </header>

      {/* Corpus Item Display */}
      {corpusItem && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">语料内容</h2>
            <div className="space-y-3">
              {corpusItem.category && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">分类：</span>
                  <span className="text-sm text-gray-800">{corpusItem.category.nickname}</span>
                  {/* {corpusItem.category.description && (
                    <span className="text-xs text-gray-500 ml-2">({corpusItem.category.description})</span>
                  )} */}
                </div>
              )}
              {corpusItem.data && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">索引（data）：{corpusItem.data}</span>
                </div>
              )}
              {corpusItem.note && (
                <div className="space-y-2 mt-2 pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-600 block">内容（note）：</span>
                  {Object.entries(
                    typeof corpusItem.note === "string" ? JSON.parse(corpusItem.note) : corpusItem.note,
                  ).map(([key, value]) => (
                    <div key={key} className="ml-4">
                      <span className="text-xs font-medium text-gray-600">{key}：</span>
                      {renderValue(value)}
                    </div>
                  ))}
                </div>
              )}
              {corpusItem.unique_id && (
                <div>
                  <span className="text-xs text-gray-500">ID: {corpusItem.unique_id}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Template Gallery */}
      <div className="px-4 mb-8">
        <header className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">加载 Prompt 模板</h1>
        </header>
        <div className="flex justify-center flex-wrap gap-4 pb-2">
          {templates.map((template, index) => (
            <div
              key={index}
              className={`flex-shrink-0 min-w-[200px] max-w-[300px] rounded-lg cursor-pointer border-2 transition-all p-4 bg-white hover:shadow-md ${
                selectedTemplate.name === template.name ? "border-blue-500 shadow-md" : "border-gray-200"
              }`}
              onClick={() => selectTemplate(template)}
            >
              <h3 className="text-sm font-bold text-gray-800 mb-2">{template.name}</h3>
              {template.adapted_models && template.adapted_models.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.adapted_models.map((model, modelIndex) => (
                    <span key={modelIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div
            className="flex-shrink-0 min-w-[200px] max-w-[300px] rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer text-black text-sm hover:bg-gray-100 transition-colors p-4"
            onClick={handleRandomTemplate}
          >
            随机一张
          </div>
          <div
            className="flex-shrink-0 min-w-[200px] max-w-[300px] rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer text-black text-sm hover:bg-gray-100 transition-colors p-4"
            onClick={loadPicFromArweave}
          >
            Load 自 AR
          </div>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Prompt 编辑器</h2>
          <div className="space-y-4">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">模板名称：</label>
              <div className="text-lg font-medium text-gray-800">{selectedTemplate.name}</div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Prompt：</label>
              <textarea
                value={selectedTemplate.prompt}
                onChange={e => {
                  setSelectedTemplate({ ...selectedTemplate, prompt: e.target.value });
                }}
                className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-black"
                placeholder="输入你的 Prompt..."
              />
              <p className="text-xs text-gray-500 mt-1">提示：使用 {"{data}"} 作为占位符，它将被替换为语料数据；</p>
              <p className="text-xs text-gray-500 mt-1">
                也可以使用更复杂的匹配方案，例如用 {"{data.note.context.meaning}"} 表示语料的释义。
              </p>
              <div className="mt-3">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6" onClick={generatePrompt}>
                  生成 Prompt
                </Button>
              </div>
            </div>

            {/* Adapted Models */}
            {selectedTemplate.adapted_models && selectedTemplate.adapted_models.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">适配模型：</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.adapted_models.map((model, index) => (
                    <span key={index} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">生成的 Prompt</h2>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-4"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedPrompt);
                    alert("Prompt 已复制到剪贴板！");
                  } catch (error) {
                    console.error("Failed to copy:", error);
                    alert("复制失败，请手动复制");
                  }
                }}
              >
                复制 Prompt
              </Button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-x-auto">
                {generatedPrompt}
              </pre>
            </div>

            {/* Model Links */}
            {selectedTemplate.adapted_models && selectedTemplate.adapted_models.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-semibold text-gray-600 mb-2">在以下模型中打开：</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.adapted_models.map((model, index) => {
                    const modelUrl = models[model as keyof typeof models];
                    return modelUrl ? (
                      <a
                        key={index}
                        href={modelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        {model}
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      <footer className="text-center text-sm text-black pb-8">
        <div className="space-x-4">
          <a
            href="https://leeduckgo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            个人主页
          </a>
          <span>Twitter:</span>
          <a
            href="https://x.com/0xleeduckgo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            0xleeduckgo
          </a>
        </div>
        <div className="mt-2 space-x-4">
          <a
            href="https://aidimsum.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            AI 点心实验室
          </a>
          {/* <span>打赏：</span>
          <a
            href="https://lab.magiconch.com/nbnhhsh/sponsor.png"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            二维码
          </a> */}
        </div>
      </footer>

      {/* Arweave Image Loading Modal */}
      {showArweaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">从 Arweave 加载 Prompt 模板</h3>
              <button onClick={closeArweaveModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Arweave ID:</label>
              <Input
                type="text"
                placeholder="请输入 Arweave ID"
                value={arweaveId}
                onChange={e => setArweaveId(e.target.value)}
                className="w-full"
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    loadArweaveImage();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">模板将从 https://arweave.net/[your-id] 加载</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={closeArweaveModal} className="px-4 text-black">
                取消
              </Button>
              <Button
                onClick={() => loadArweaveImage()}
                disabled={!arweaveId.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                加载模板
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
