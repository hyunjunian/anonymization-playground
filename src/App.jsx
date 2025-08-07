import { Button, Field, Listbox, ListboxButton, ListboxOption, ListboxOptions, Tab, TabGroup, TabList, TabPanel, TabPanels, Textarea } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useState } from "react";

const originalTextMethods = [
  "Single text",
  "With non-editable text",
  ".jsonl file",
]

function App() {
  const [originalTextMethod, setOriginalTextMethod] = useState(originalTextMethods[0]);
  const [originalTexts, setOriginalTexts] = useState([{
    id: crypto.randomUUID(),
    editable: "",
    noneditable: "",
  }]);

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <h2 className="text-neutral-200/50">Original Text</h2>
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
                  {originalTextMethod === "With non-editable text" && <Field>
                    <Textarea
                      className={clsx(
                        'mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
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
                        'mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6',
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
                    />
                  </Field>
                </TabPanel>
              ))}
            </TabPanels>
            <TabList className="flex">
              {originalTexts.map(({ id }, index) => (
                <Tab
                  className="rounded-lg px-3 py-1 text-sm/6 font-medium focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10"
                  key={id}
                >
                  {index + 1}
                </Tab>
              ))}
              <Button onClick={() => {
                setOriginalTexts((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), editable: "", noneditable: "" },
                ]);
              }}>
                <PlusIcon className="size-4" />
              </Button>
            </TabList>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}

export default App;