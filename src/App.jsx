import { Button, CloseButton, Dialog, DialogPanel, DialogTitle, Field, Fieldset, Listbox, ListboxButton, ListboxOption, ListboxOptions, Menu, MenuButton, MenuItem, MenuItems, Tab, TabGroup, TabList, TabPanel, TabPanels, Textarea } from "@headlessui/react";
import { ArrowDownIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowUpTrayIcon, CheckIcon, ChevronDownIcon, PlusIcon, SparklesIcon, TrashIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useEffect, useState } from "react";

const originalTextMethods = [
  "Single text",
  "With non-editable text",
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
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = true;
    };
    addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (running) {
      setTimeout(() => {
        setRunning(false);
      }, 2000); // Simulate a delay for the evaluation
    }
  }, [running]);

  return (
    <>
      <div className="flex-1 grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h2 className="text-neutral-200/50">Original text</h2>
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
                    {originalTextMethod === "With non-editable text" && <Field>
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
                <MenuButton className="rounded-lg px-2 py-1 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5">
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
                    }}>
                      <ArrowUpTrayIcon className="size-4" />
                      Upload jsonl file
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
              <Button className="rounded-lg px-2 py-1 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/5" onClick={() => setIsOpen(true)}>
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
          <p className="rounded-lg bg-white/5 p-4 text-sm/6 text-neutral-200/50">
            {privacyEvaluationMethod === "General author profiling" && "We will have the language model infer a total of eight pieces of personal information."}
            {privacyEvaluationMethod === "Personal QA" && "Results for Personal QA will be displayed here."}
          </p>
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
          <p className="rounded-lg bg-white/5 p-4 text-sm/6">
            {utilityEvaluationMethod === "Naive LM as a judge" && "Results for Naive LM as a judge will be displayed here."}
            {utilityEvaluationMethod === "Utility QA" && "Results for Utility QA will be displayed here."}
            {utilityEvaluationMethod === "Text as a prompt" && "Results for Text as a prompt will be displayed here."}
          </p>
        </div>
        <Button className="sm:col-span-3 flex justify-center items-center space-x-2 font-medium text-sm bg-white/5 rounded-lg p-2 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white/25 data-hover:bg-white/10" onClick={() => {
          setRunning(true);
        }} disabled={running}>
          <span>{running ? "Running..." : "Run"}</span>
          {running ? <ArrowPathIcon className="size-4 animate-spin" /> : <ArrowDownIcon className="size-4" />}
        </Button>
      </div>
      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-xl rounded-xl space-y-4 bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
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
                        setOriginalTexts((prev) => prev.filter((text) => text.id !== id));
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                  {originalTextMethod === "With non-editable text" && <Field>
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
              <div className="flex justify-end">
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