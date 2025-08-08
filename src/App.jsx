import { Button, CloseButton, Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel, Field, Fieldset, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel, Switch, Tab, TabGroup, TabList, TabPanel, TabPanels, Textarea } from "@headlessui/react";
import { ArrowDownTrayIcon, ArrowPathIcon, ArrowRightIcon, ArrowsPointingOutIcon, ArrowUpTrayIcon, CheckIcon, ChevronDownIcon, InformationCircleIcon, KeyIcon, PlayIcon, PlusIcon, SparklesIcon, TrashIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { downloadFile, getResults } from "./utils.js";

const INFO = {
  originalTextInfo: "This is the original text that will be evaluated for privacy and utility. You can add multiple texts, and each text can have editable and non-editable parts.",
  "Single turn": "This method evaluates a single piece of text, which can be either editable or non-editable.",
  "Multi turn": "This method evaluates a piece of text that includes both editable and non-editable parts, allowing for a more comprehensive analysis.",
  "General author profiling": "This method evaluates the text for general author profiling, inferring 8 types of personal information such as age, gender, and location.",
  "Personal QA": "This method evaluates the text by asking specific questions about the author, such as their interests and preferences.",
  "Naive LM as a judge": "This method uses a naive language model to judge the utility of the text based on its coherence and relevance.",
  "Utility QA": "This method evaluates the text by asking questions about its content, assessing how well it serves its intended purpose.",
  "Text as a prompt": "This method uses the text as a prompt for generating new content, evaluating its utility based on the quality of the generated output.",
};

const originalTextMethods = [
  "Single turn",
  "Multi turn",
];

const privacyEvaluationMethods = [
  "General author profiling",
  "Personal QA",
];

const utilityEvaluationMethods = [
  "Naive LM as a judge",
  "Utility QA",
  "Text as a prompt",
];

function App() {
  const apiKey = useSyncExternalStore(
    (onStoreChange) => {
      const handleStorageChange = () => onStoreChange();
      addEventListener("storage", handleStorageChange);
      return () => removeEventListener("storage", handleStorageChange);
    },
    () => localStorage.getItem("apiKey") || "",
  );
  const showGuide = useSyncExternalStore(
    (onStoreChange) => {
      const handleStorageChange = () => onStoreChange();
      addEventListener("storage", handleStorageChange);
      return () => removeEventListener("storage", handleStorageChange);
    },
    () => localStorage.getItem("showGuide") === "true",
  );

  const [originalTextMethod, setOriginalTextMethod] = useState(originalTextMethods[0]);
  const [privacyEvaluationMethod, setPrivacyEvaluationMethod] = useState(privacyEvaluationMethods[0]);
  const [utilityEvaluationMethod, setUtilityEvaluationMethod] = useState(utilityEvaluationMethods[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [originalTexts, setOriginalTexts] = useState([{
    id: crypto.randomUUID(),
    text: "I'm male, 33 years old, living in Seoul South Korea.",
    context: "",
  }]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const evaluationResults = useMemo(() => {
    if (!results) return;
    const map = {
      "total": { sum: 0, count: 0 },
      "income": { sum: 0, count: 0 },
      "education": { sum: 0, count: 0 },
      "pobp": { sum: 0, count: 0 },
      "location": { sum: 0, count: 0 },
      "married": { sum: 0, count: 0 },
      "gender": { sum: 0, count: 0 },
      "age": { sum: 0, count: 0 },
      "occupation": { sum: 0, count: 0 },
    };
    results.forEach((result) => {
      Object.entries(result.texts[1].privacy).forEach(([key, value]) => {
        map[key].sum += value.score?.[0] || 0;
        map[key].count += 1;
        map.total.sum += value.score?.[0] || 0;
        map.total.count += 1;
      });
    });
    return map;
  }, [results]);

  useEffect(() => {
    if (originalTexts.some(text => text.text || text.context)) {
      const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = true;
      };
      addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [originalTexts]);

  useEffect(() => {
    if (!running) return;
    if (originalTexts.some(text => !text.text)) {
      alert("Please fill in all editable texts before running.");
      setRunning(false);
      return;
    }
    (async () => {
      const results = originalTexts.map(({ id, text, context }) => ({
        id,
        context,
        texts: [{ text }],
      }));
      const newResults = await getResults({ results, apiKey });
      setResults(newResults);
      setRunning(false);
    })();
  }, [running, apiKey, originalTexts]);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium">Anonymization Playground</h1>
        <Field className="flex items-center space-x-2 text-neutral-200/50 text-sm">
          <Switch
            checked={showGuide}
            onChange={(value) => {
              if (value) {
                localStorage.setItem("showGuide", value.toString());
              } else {
                localStorage.removeItem("showGuide");
              }
              dispatchEvent(new Event("storage"));
            }}
            className="group relative flex h-4 w-8 cursor-pointer rounded-full bg-white/10 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none inline-block size-2 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-4"
            />
          </Switch>
          <Label>Show guide</Label>
        </Field>
      </div>
      <div className="flex-1 grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-neutral-200/50">Original text</h2>
            <Popover>
              <PopoverButton className="block text-sm/6 font-semibold text-neutral-200/50 focus:outline-none data-active:text-neutral-200 data-focus:outline data-focus:outline-white data-hover:text-neutral-200">
                <InformationCircleIcon className="size-4" />
              </PopoverButton>
              <PopoverPanel
                transition
                anchor="bottom"
                className="p-4 border border-white/5 w-xs rounded-lg bg-neutral-800 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-0"
              >
                <p>{INFO.originalTextInfo}</p>
              </PopoverPanel>
            </Popover>
          </div>
          <Listbox value={originalTextMethod} onChange={setOriginalTextMethod}>
            <ListboxButton
              className={clsx(
                'relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6',
                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              )}
            >
              {originalTextMethod}
              <ChevronDownIcon
                className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                'w-(--button-width) rounded-xl border border-white/5 bg-neutral-800 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                'transition duration-100 ease-in data-leave:data-closed:opacity-0'
              )}
            >
              {originalTextMethods.map((method) => (
                <ListboxOption
                  key={method}
                  value={method}
                  className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                >
                  <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                  <div className="text-sm/6">{method}</div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
          <TabGroup className="space-y-2">
            <TabPanels>
              {originalTexts.map(({ id, text: editable, context: noneditable }) => (
                <TabPanel key={id}>
                  <Fieldset className="space-y-2">
                    {originalTextMethod === "Multi turn" && <Field>
                      <Textarea
                        className={clsx(
                          'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                          'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                        rows={6}
                        placeholder="Type non-editable text..."
                        value={noneditable}
                        onChange={(e) => {
                          setOriginalTexts((prev) => prev.map((text) =>
                            text.id === id ? { ...text, context: e.target.value } : text
                          ));
                        }}
                      />
                    </Field>}
                    <Field>
                      <Textarea
                        className={clsx(
                          'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                          'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                        rows={3}
                        placeholder="Type editable text..."
                        value={editable}
                        onChange={(e) => {
                          setOriginalTexts((prev) => prev.map((text) =>
                            text.id === id ? { ...text, text: e.target.value } : text
                          ));
                        }}
                        required
                      />
                    </Field>
                  </Fieldset>
                </TabPanel>
              ))}
            </TabPanels>
            <div className="flex">
              <TabList className="flex flex-1 overflow-x-auto">
                {originalTexts.map(({ id }, index) => (
                  <Tab
                    className="rounded-lg px-3 py-1 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10"
                    key={id}
                  >
                    {index + 1}
                  </Tab>
                ))}
              </TabList>
              <Menu>
                <MenuButton className="rounded-lg p-2 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5">
                  <PlusIcon className="size-4" />
                </MenuButton>
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="origin-top-right rounded-xl border border-white/5 bg-neutral-800 p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                >
                  <MenuItem>
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10" onClick={() => {
                      setOriginalTexts((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), text: "", context: "" },
                      ]);
                    }}>
                      <PlusIcon className="size-4" />
                      Add blank text
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10" onClick={() => {
                    }}>
                      <SparklesIcon className="size-4" />
                      Generate with LM
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10" onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = ".jsonl";
                      fileInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target.result;
                          const lines = content.split("\n").filter(line => line.trim());
                          const newTexts = lines.map((line) => {
                            try {
                              const data = JSON.parse(line);
                              return { id: crypto.randomUUID(), text: data.text || "", context: data.context || "" };
                            } catch (error) {
                              console.error("Invalid JSON line:", line);
                              return { id: crypto.randomUUID(), text: "", context: "" };
                            }
                          });
                          setOriginalTexts((prev) => [...prev, ...newTexts]);
                        };
                        reader.readAsText(file);
                      };
                      fileInput.click();
                    }}>
                      <ArrowUpTrayIcon className="size-4" />
                      Upload jsonl file
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
              <Button className="rounded-lg p-2 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5" onClick={() => setIsOpen(true)}>
                <ArrowsPointingOutIcon className="size-4" />
              </Button>
            </div>
          </TabGroup>
        </div>
        <div className="space-y-2">
          <h2 className="text-neutral-200/50">Privacy evaluation</h2>
          <Listbox value={privacyEvaluationMethod} onChange={setPrivacyEvaluationMethod}>
            <ListboxButton
              className={clsx(
                'relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6',
                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              )}
            >
              {privacyEvaluationMethod}
              <ChevronDownIcon
                className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                'w-(--button-width) rounded-xl border border-white/5 bg-neutral-800 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                'transition duration-100 ease-in data-leave:data-closed:opacity-0'
              )}
            >
              {privacyEvaluationMethods.map((method) => (
                <ListboxOption
                  key={method}
                  value={method}
                  className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                >
                  <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                  <div className="text-sm/6">{method}</div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
          {showGuide && <p className="rounded-lg bg-white/5 p-4 text-sm/6 text-neutral-200/50">
            {INFO[privacyEvaluationMethod] || "Select a privacy evaluation method to see the details."}
          </p>}
        </div>
        <div className="space-y-2">
          <h2 className="text-neutral-200/50">Utility evaluation</h2>
          <Listbox value={utilityEvaluationMethod} onChange={setUtilityEvaluationMethod}>
            <ListboxButton
              className={clsx(
                'relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6',
                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              )}
            >
              {utilityEvaluationMethod}
              <ChevronDownIcon
                className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                'w-(--button-width) rounded-xl border border-white/5 bg-neutral-800 p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                'transition duration-100 ease-in data-leave:data-closed:opacity-0'
              )}
            >
              {utilityEvaluationMethods.map((method) => (
                <ListboxOption
                  key={method}
                  value={method}
                  className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                >
                  <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                  <div className="text-sm/6">{method}</div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
          {showGuide && <p className="rounded-lg bg-white/5 p-4 text-sm/6 text-neutral-200/50">
            {INFO[utilityEvaluationMethod] || "Select a utility evaluation method to see the details."}
          </p>}
        </div>
        <div className="sm:col-span-3 space-x-2 flex border-b border-white/5 pb-4">
          <Button className="flex-1 flex justify-center items-center space-x-2 font-medium text-sm bg-white/5 rounded-lg px-4 py-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10" onClick={() => {
            if (results.length > 0 && !confirm("Results will be cleared. Do you want to continue?")) return;
            if (!apiKey) {
              const newApiKey = prompt("Please enter your OpenAI API key:");
              if (!newApiKey) return alert("API key is required to run.");
              localStorage.setItem("apiKey", newApiKey);
              dispatchEvent(new Event("storage"));
            }
            setRunning(true);
          }} disabled={running}>
            {running ? <ArrowPathIcon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
            <span>{running ? "Running..." : "Run"}</span>
          </Button>
          {!running && apiKey && <Button className="flex justify-center items-center space-x-2 font-medium text-sm bg-white/5 rounded-lg px-4 py-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10" onClick={() => {
            const newApiKey = prompt("Please enter your new OpenAI API key:", apiKey || "");
            if (newApiKey === null) return;
            if (!newApiKey) return localStorage.removeItem("apiKey");
            localStorage.setItem("apiKey", newApiKey);
            dispatchEvent(new Event("storage"));
          }}>
            <KeyIcon className="size-4" />
            <span>Change API key</span>
          </Button>}
        </div>
        {results.length > 0 && (
          <>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Result</h2>
                <Button className="flex justify-center items-center space-x-2 font-medium text-sm rounded-lg p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5" onClick={() => {
                  downloadFile("results.jsonl", results.map((result) => {
                    delete result.id;
                    return JSON.stringify(result);
                  }).join("\n"));
                }}>
                  <ArrowDownTrayIcon className="size-4" />
                </Button>
              </div>
              <TabGroup className="space-y-2">
                <TabPanels>
                  {results.map(({ id, context, texts }) => (
                    <TabPanel key={id} className="space-x-2 flex">
                      {texts.map((text, index) => (<Fragment key={index}>
                        <Fieldset className="space-y-2 flex-1">
                          {context && <Field>
                            <Textarea
                              className={clsx(
                                'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                              )}
                              rows={6}
                              value={context}
                              disabled
                            />
                          </Field>}
                          <Field>
                            <Textarea
                              className={clsx(
                                'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                                'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                              )}
                              rows={3}
                              value={text.text}
                              disabled
                              required
                            />
                          </Field>
                          <dl className="divide-y divide-white/10 text-sm/6 tabular-nums">
                            {Object.entries(text.privacy).map(([key, value]) => value.confidence < 3 && index === 0 ? null : (
                              <div className="flex items-center py-2 space-x-4" key={key}>
                                <dt className="font-medium">{key}</dt>
                                <dd className={clsx("text-right flex-1 text-neutral-200/50", { "text-red-500/50": index > 0 && value.score[0] === 1 })}>{value.value[0]}</dd>
                                <dd className="text-neutral-200/50">{value.confidence}</dd>
                              </div>
                            ))}
                          </dl>
                          <dl className="divide-y divide-white/10 text-sm/6 tabular-nums">
                            {Object.entries(text.utility).map(([key, value]) => (
                              <div className="flex items-center py-2 space-x-4" key={key}>
                                <dt className="font-medium">{key}</dt>
                                <dd className="text-right flex-1 text-neutral-200/50">{value.score}</dd>
                              </div>
                            ))}
                          </dl>
                        </Fieldset>
                        {index !== texts.length - 1 && <ArrowRightIcon className="size-4 mt-4" />}
                      </Fragment>))}
                    </TabPanel>
                  ))}
                </TabPanels>
                <TabList className="flex flex-1 overflow-x-auto">
                  {originalTexts.map(({ id }, index) => (
                    <Tab
                      className="rounded-lg px-3 py-1 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10"
                      key={id}
                    >
                      {index + 1}
                    </Tab>
                  ))}
                </TabList>
              </TabGroup>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Evaluation result</h2>
                <Button className="flex justify-center items-center space-x-2 font-medium text-sm rounded-lg p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5" onClick={() => {
                }}>
                  <ArrowDownTrayIcon className="size-4" />
                </Button>
              </div>
              <dl className="divide-y divide-white/10 text-sm/6 tabular-nums">
                <div className="flex items-center py-2 space-x-2 font-medium">
                  <dt className="flex-1">Privacy</dt>
                  <dd className="text-neutral-200/50 text-sm/6">1</dd>
                  <ArrowRightIcon className="text-neutral-200/50 size-4" />
                  <dd className="text-neutral-200/50 text-sm/6">{evaluationResults.total.sum / evaluationResults.total.count}</dd>
                </div>
                {Object.entries(evaluationResults).map(([key, { sum, count }]) => key !== "total" && count ? (
                  <div className="flex items-center py-2 pl-4 space-x-2 text-sm/6" key={key}>
                    <dt className="flex-1">{key}</dt>
                    <dd className="text-neutral-200/50">1</dd>
                    <ArrowRightIcon className="text-neutral-200/50 size-4" />
                    <dd className="text-neutral-200/50">{sum / count}</dd>
                  </div>
                ) : null)}
              </dl>
              <dl className="divide-y divide-white/10 text-sm/6 tabular-nums">
                <div className="flex items-center py-2 space-x-2 font-medium">
                  <dt className="flex-1">Utility</dt>
                  {/* <dd className="text-neutral-200/50 text-sm/6">1</dd>
                  <ArrowRightIcon className="text-neutral-200/50 size-4" />
                  <dd className="text-neutral-200/50 text-sm/6">0.4</dd> */}
                </div>
                <div className="flex items-center py-2 pl-4 space-x-2 text-sm/6">
                  <dt className="flex-1">readability</dt>
                  <dd className="text-neutral-200/50">1</dd>
                  <ArrowRightIcon className="text-neutral-200/50 size-4" />
                  <dd className="text-neutral-200/50">{results.map((result) => result.texts[1].utility.readability.score).reduce((a, b) => a + b, 0) / results.length}</dd>
                </div>
                <div className="flex items-center py-2 pl-4 space-x-2 text-sm/6">
                  <dt className="flex-1">meaning</dt>
                  <dd className="text-neutral-200/50">1</dd>
                  <ArrowRightIcon className="text-neutral-200/50 size-4" />
                  <dd className="text-neutral-200/50">{results.map((result) => result.texts[1].utility.meaning.score).reduce((a, b) => a + b, 0) / results.length}</dd>
                </div>
                <div className="flex items-center py-2 pl-4 space-x-2 text-sm/6">
                  <dt className="flex-1">hallucinations</dt>
                  <dd className="text-neutral-200/50">1</dd>
                  <ArrowRightIcon className="text-neutral-200/50 size-4" />
                  <dd className="text-neutral-200/50">{results.map((result) => result.texts[1].utility.hallucinations.score).reduce((a, b) => a + b, 0) / results.length}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="border border-white/5 w-full max-w-xl rounded-xl space-y-4 bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium">
                Original texts
              </DialogTitle>
              {originalTexts.map(({ id, text: editable, context: noneditable }, index) => (
                <Fieldset className="space-y-2" key={id}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Text {index + 1}</h4>
                    <Button
                      className="rounded-lg p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10"
                      onClick={() => {
                        if (originalTexts.length <= 1) return alert("At least one text is required.");
                        setOriginalTexts((prev) => prev.length > 1 ? prev.filter((text) => text.id !== id) : prev);
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                  {originalTextMethod === "Multi turn" && <Field>
                    <Textarea
                      className={clsx(
                        'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                      )}
                      rows={6}
                      placeholder="Non-editable text..."
                      value={noneditable}
                      onChange={(e) => {
                        setOriginalTexts((prev) => prev.map((text) =>
                          text.id === id ? { ...text, context: e.target.value } : text
                        ));
                      }}
                    />
                  </Field>}
                  <Field>
                    <Textarea
                      className={clsx(
                        'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                      )}
                      rows={3}
                      placeholder="Editable text..."
                      value={editable}
                      onChange={(e) => {
                        setOriginalTexts((prev) => prev.map((text) =>
                          text.id === id ? { ...text, text: e.target.value } : text
                        ));
                      }}
                      required
                    />
                  </Field>
                </Fieldset>
              ))}
              <div className="flex justify-end space-x-2">
                <Button className="flex items-center space-x-2 font-medium text-sm bg-white/5 rounded-lg px-4 p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10" onClick={() => {
                  const jsonlData = originalTexts.map(text => JSON.stringify({
                    editable: text.text,
                    noneditable: text.context,
                  })).join("\n");
                  downloadFile("original_texts.jsonl", jsonlData);
                }}>
                  <ArrowDownTrayIcon className="size-4" />
                  <span>Download as jsonl</span>
                </Button>
                <CloseButton
                  className="font-medium text-sm bg-white/5 rounded-lg px-4 p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10"
                >
                  Close
                </CloseButton>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default App;