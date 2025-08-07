import { Button, CloseButton, Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel, Field, Fieldset, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel, Switch, Tab, TabGroup, TabList, TabPanel, TabPanels, Textarea } from "@headlessui/react";
import { ArrowDownTrayIcon, ArrowPathIcon, ArrowRightIcon, ArrowsPointingOutIcon, ArrowUpTrayIcon, CheckIcon, ChevronDownIcon, InformationCircleIcon, KeyIcon, PlayIcon, PlusIcon, SparklesIcon, TrashIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useEffect, useState, useSyncExternalStore } from "react";
import { downloadFile } from "./utils.js";

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
    editable: "",
    noneditable: "",
  }]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (originalTexts.some(text => text.editable || text.noneditable)) {
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
    if (running) {
      setTimeout(() => {
        setRunning(false);
      }, 2000);
    }
  }, [running]);

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
              {originalTexts.map(({ id, editable, noneditable }) => (
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
                            text.id === id ? { ...text, noneditable: e.target.value } : text
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
                            text.id === id ? { ...text, editable: e.target.value } : text
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
                        { id: crypto.randomUUID(), editable: "", noneditable: "" },
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
                              return { id: crypto.randomUUID(), editable: data.editable || "", noneditable: data.noneditable || "" };
                            } catch (error) {
                              console.error("Invalid JSON line:", line);
                              return { id: crypto.randomUUID(), editable: "", noneditable: "" };
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
            localStorage.setItem("apiKey", newApiKey);
            dispatchEvent(new Event("storage"));
          }}>
            <KeyIcon className="size-4" />
            <span>Change API key</span>
          </Button>}
        </div>
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Result</h2>
            <Button className="flex justify-center items-center space-x-2 font-medium text-sm rounded-lg p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5" onClick={() => {
            }}>
              <ArrowDownTrayIcon className="size-4" />
            </Button>
          </div>
          <TabGroup className="space-y-2">
            <TabPanels>
              {originalTexts.map(({ id, editable, noneditable }) => (
                <TabPanel key={id}>
                  <div className="space-x-2 flex items-center">
                    <Fieldset className="space-y-2 flex-1">
                      {noneditable && <Field>
                        <Textarea
                          className={clsx(
                            'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                          )}
                          rows={6}
                          value={noneditable}
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
                          value={editable}
                          disabled
                          required
                        />
                      </Field>
                    </Fieldset>
                    <ArrowRightIcon className="size-4" />
                    <Fieldset className="space-y-2 flex-1">
                      {noneditable && <Field>
                        <Textarea
                          className={clsx(
                            'block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                          )}
                          rows={6}
                          value={noneditable}
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
                          value={editable}
                          disabled
                          required
                        />
                      </Field>
                    </Fieldset>
                  </div>
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
          <div className="divide-y divide-white/5 rounded-lg bg-white/5">
            <Disclosure as="div" className="p-4" defaultOpen>
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm/6 font-medium group-data-hover:text-neutral-200/80">
                  Privacy evaluation
                </span>
                <ChevronDownIcon className="size-5 fill-white/60 group-data-hover:fill-white/50 group-data-open:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-neutral-200/50">
                If you're unhappy with your purchase, we'll refund you in full.
              </DisclosurePanel>
            </Disclosure>
            <Disclosure as="div" className="p-4" defaultOpen>
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm/6 font-medium group-data-hover:text-neutral-200/80">
                  Utility evaluation
                </span>
                <ChevronDownIcon className="size-5 fill-white/60 group-data-hover:fill-white/50 group-data-open:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-neutral-200/50">No.</DisclosurePanel>
            </Disclosure>
          </div>
        </div>
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
              {originalTexts.map(({ id, editable, noneditable }, index) => (
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
                          text.id === id ? { ...text, noneditable: e.target.value } : text
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
                          text.id === id ? { ...text, editable: e.target.value } : text
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
                    editable: text.editable,
                    noneditable: text.noneditable,
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