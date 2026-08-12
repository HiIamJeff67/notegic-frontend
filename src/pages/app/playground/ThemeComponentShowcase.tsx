import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellIcon,
  BoldIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  CodeIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  FileIcon,
  HomeIcon,
  ItalicIcon,
  LaptopIcon,
  MailIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  UnderlineIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  email: z.string().email("Enter a valid email."),
  mode: z.string().min(1),
});

const sections = [
  {
    id: "buttons",
    title: "Buttons",
    description: "Button, button group, toggle, and toggle group states.",
  },
  {
    id: "inputs",
    title: "Inputs",
    description:
      "Form fields, labels, input groups, textarea, checkbox, switch, and slider.",
  },
  {
    id: "selection",
    title: "Selection",
    description: "Select, calendar, tabs, and command surfaces.",
  },
  {
    id: "overlays",
    title: "Overlays",
    description: "Dialog, sheet, popover, hover card, tooltip, and toast.",
  },
  {
    id: "menus",
    title: "Menus",
    description: "Dropdown menu, context menu, and menubar interactions.",
  },
  {
    id: "content",
    title: "Content",
    description:
      "Card, table, breadcrumb, marker, aspect ratio, separator, skeleton, and spinner.",
  },
  {
    id: "layout",
    title: "Layout",
    description:
      "Resizable panels, collapsible content, and sidebar primitives.",
  },
] as const;

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;

function ComponentSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-border py-10">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {id}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function DemoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-4 text-sm font-medium">{title}</div>
      {children}
    </div>
  );
}

function PlaygroundNav() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-4 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-sm">
        <div className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
          Components
        </div>
        <nav className="grid gap-1">
          {sections.map(section => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="group rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="flex items-center justify-between gap-3">
                <span>{section.title}</span>
                <span className="hidden text-xs text-muted-foreground group-hover:inline">
                  #{section.id}
                </span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function ButtonsSection() {
  const [pressed, setPressed] = useState(false);

  return (
    <ComponentSection
      id="buttons"
      title="Buttons"
      description="Primary command styles and grouped controls should shift with theme tokens."
    >
      <DemoPanel title="Button variants">
        <div className="flex flex-wrap gap-3">
          {buttonVariants.map(variant => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          <Button size="icon" aria-label="Icon button">
            <PlusIcon />
          </Button>
        </div>
      </DemoPanel>

      <DemoPanel title="Button group">
        <div className="flex flex-wrap gap-4">
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="Bold">
              <BoldIcon />
            </Button>
            <Button variant="outline" size="icon" aria-label="Italic">
              <ItalicIcon />
            </Button>
            <Button variant="outline" size="icon" aria-label="Underline">
              <UnderlineIcon />
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <ButtonGroupText>
              <MailIcon />
              Invite
            </ButtonGroupText>
            <Button variant="outline">Send</Button>
            <ButtonGroupSeparator />
            <Button variant="outline" size="icon" aria-label="More">
              <ChevronDownIcon />
            </Button>
          </ButtonGroup>
        </div>
      </DemoPanel>

      <DemoPanel title="Toggle controls">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle pressed={pressed} onPressedChange={setPressed}>
            <StarIcon />
            Favorite
          </Toggle>
          <ToggleGroup type="multiple" defaultValue={["bold"]}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </DemoPanel>
    </ComponentSection>
  );
}

function InputsSection() {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [sliderValue, setSliderValue] = useState([42]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "theme@notezy.app",
      mode: "balanced",
    },
  });

  return (
    <ComponentSection
      id="inputs"
      title="Inputs"
      description="Field chrome, invalid states, and control accents should all come from shared variables."
    >
      <DemoPanel title="Form primitives">
        <Form {...form}>
          <form className="grid max-w-xl gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="theme@notezy.app" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used to preview label, description, and input tokens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="focused">Focused</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="ambient">Ambient</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DemoPanel>

      <DemoPanel title="Inputs and labels">
        <div className="grid max-w-2xl gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="playground-title">Title</Label>
            <Input id="playground-title" placeholder="Daily planning" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="playground-disabled">Disabled</Label>
            <Input
              id="playground-disabled"
              disabled
              value="Locked field"
              readOnly
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="playground-note">Note</Label>
            <Textarea
              id="playground-note"
              placeholder="Theme preview copy..."
            />
          </div>
        </div>
      </DemoPanel>

      <DemoPanel title="Input group">
        <div className="grid max-w-2xl gap-3">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search components" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Search">
                <CommandShortcut>⌘K</CommandShortcut>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupAddon align="block-start">
              <InputGroupText>
                <CodeIcon />
                Implementation notes
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupTextarea placeholder="Textarea inside input group" />
          </InputGroup>
        </div>
      </DemoPanel>

      <DemoPanel title="Checkbox, switch, and slider">
        <div className="grid max-w-xl gap-5">
          <div className="flex items-center gap-3">
            <Checkbox
              id="theme-checkbox"
              checked={checked}
              onCheckedChange={value => setChecked(value === true)}
            />
            <Label htmlFor="theme-checkbox">Use theme accent for checks</Label>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
            <Label htmlFor="theme-switch">Adaptive surfaces</Label>
            <Switch
              id="theme-switch"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Contrast preview</span>
              <span className="text-muted-foreground">{sliderValue[0]}%</span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
            />
          </div>
        </div>
      </DemoPanel>
    </ComponentSection>
  );
}

function SelectionSection() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <ComponentSection
      id="selection"
      title="Selection"
      description="Selection components expose popover, active, selected, and focus tokens."
    >
      <DemoPanel title="Select">
        <Select defaultValue="standard">
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Themes</SelectLabel>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
              <SelectItem value="phoenix">Phoenix</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="pearl">Pearl</SelectItem>
              <SelectItem value="sakura">Sakura</SelectItem>
              <SelectItem value="citrus">Citrus</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </DemoPanel>

      <DemoPanel title="Calendar and tabs">
        <div className="grid gap-4 xl:grid-cols-[auto_1fr]">
          <Calendar
            mode="single"
            selected={new Date(2026, 6, 7)}
            className="rounded-md border border-border"
          />
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="states">States</TabsTrigger>
            </TabsList>
            <TabsContent
              value="preview"
              className="rounded-md border border-border p-4"
            >
              <p className="text-sm text-muted-foreground">
                Tab content should use card and muted foreground tokens without
                extra overrides.
              </p>
            </TabsContent>
            <TabsContent
              value="tokens"
              className="rounded-md border border-border p-4"
            >
              <p className="text-sm text-muted-foreground">
                Use this area to compare selected, hover, and inactive tab
                states.
              </p>
            </TabsContent>
            <TabsContent
              value="states"
              className="rounded-md border border-border p-4"
            >
              <p className="text-sm text-muted-foreground">
                Focus rings and active backgrounds should stay legible.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DemoPanel>

      <DemoPanel title="Command">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <Command className="rounded-lg border border-border">
            <CommandInput placeholder="Search commands..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem value="create-note">
                  <FileIcon />
                  Create note
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem value="open-settings">
                  <SettingsIcon />
                  Open settings
                  <CommandShortcut>⌘,</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Navigation">
                <CommandItem value="dashboard">
                  <HomeIcon />
                  Dashboard
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <Button variant="outline" onClick={() => setCommandOpen(true)}>
            Open dialog
          </Button>
        </div>
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Search playground..." />
          <CommandList>
            <CommandGroup heading="Sections">
              {sections.map(section => (
                <CommandItem key={section.id} value={section.id}>
                  <SparklesIcon />
                  {section.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </DemoPanel>
    </ComponentSection>
  );
}

function OverlaysSection() {
  return (
    <ComponentSection
      id="overlays"
      title="Overlays"
      description="Overlay surfaces should inherit popover, dialog, border, and foreground tokens."
    >
      <DemoPanel title="Dialog and sheet">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Theme preview dialog</DialogTitle>
                <DialogDescription>
                  Dialog content should not need per-dialog color overrides.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="dialog-name">Name</Label>
                <Input id="dialog-name" defaultValue="Standard theme" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Save</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Theme controls</SheetTitle>
                <SheetDescription>
                  Sheet colors should match dialog and popover surfaces.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 px-4">
                <Label htmlFor="sheet-density">Density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger id="sheet-density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Apply</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </DemoPanel>

      <DemoPanel title="Popover, hover card, tooltip, and toast">
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="grid gap-2">
                  <h3 className="font-medium">Popover surface</h3>
                  <p className="text-sm text-muted-foreground">
                    Useful for checking popover background and border contrast.
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover card</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Theme Author</h3>
                    <p className="text-sm text-muted-foreground">
                      Hover cards should read clearly over the app surface.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Tooltip">
                  <BellIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notification tooltip</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              onClick={() =>
                toast.success("Theme toast", {
                  description:
                    "Sonner uses the same background and border tokens.",
                })
              }
            >
              Show toast
            </Button>
          </div>
        </TooltipProvider>
      </DemoPanel>
    </ComponentSection>
  );
}

function MenusSection() {
  return (
    <ComponentSection
      id="menus"
      title="Menus"
      description="Menus exercise popover colors, selected rows, shortcuts, separators, and nested content."
    >
      <DemoPanel title="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Account
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Show sidebar
            </DropdownMenuCheckboxItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value="standard">
                  <DropdownMenuRadioItem value="standard">
                    Standard
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="forest">
                    Forest
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="neon">
                    Neon
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="phoenix">
                    Phoenix
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pearl">
                    Pearl
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoPanel>

      <DemoPanel title="Context menu">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-36 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            Right click this preview area
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuLabel>Block actions</ContextMenuLabel>
            <ContextMenuItem>
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked>
              Show metadata
            </ContextMenuCheckboxItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuRadioGroup value="today">
                  <ContextMenuRadioItem value="today">
                    Today
                  </ContextMenuRadioItem>
                  <ContextMenuRadioItem value="later">
                    Later
                  </ContextMenuRadioItem>
                </ContextMenuRadioGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      </DemoPanel>

      <DemoPanel title="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Actions</MenubarLabel>
              <MenubarItem>
                New Note
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Import</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Markdown</MenubarItem>
                  <MenubarItem>PDF</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>Show sidebar</MenubarCheckboxItem>
              <MenubarRadioGroup value="comfortable">
                <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
                <MenubarRadioItem value="comfortable">
                  Comfortable
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </DemoPanel>
    </ComponentSection>
  );
}

function ContentSection() {
  return (
    <ComponentSection
      id="content"
      title="Content"
      description="Static content components make spacing, muted text, borders, and loading states easy to compare."
    >
      <DemoPanel title="Card">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Routine snapshot</CardTitle>
            <CardDescription>
              Card surfaces should sit cleanly on the page background.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                View
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>18 / 24</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Focus score</span>
                <span>82%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Open routine</Button>
          </CardFooter>
        </Card>
      </DemoPanel>

      <DemoPanel title="Table">
        <Table>
          <TableCaption>Theme token inventory.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">primary</TableCell>
              <TableCell>Buttons and selected states</TableCell>
              <TableCell className="text-right">Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">accent</TableCell>
              <TableCell>Hover and secondary emphasis</TableCell>
              <TableCell className="text-right">Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">muted</TableCell>
              <TableCell>Subtle surfaces</TableCell>
              <TableCell className="text-right">Active</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">3</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </DemoPanel>

      <DemoPanel title="Breadcrumb, marker, aspect ratio, separator">
        <div className="grid gap-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Playground</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-2">
            <Marker>
              <MarkerIcon>
                <CheckIcon />
              </MarkerIcon>
              <MarkerContent>Default marker content</MarkerContent>
            </Marker>
            <Marker variant="separator">
              <MarkerContent>Separator marker</MarkerContent>
            </Marker>
            <Marker variant="border">
              <MarkerIcon>
                <CircleIcon />
              </MarkerIcon>
              <MarkerContent>Border marker content</MarkerContent>
            </Marker>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <AspectRatio
              ratio={16 / 9}
              className="overflow-hidden rounded-md border border-border bg-muted"
            >
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                16:9 media surface
              </div>
            </AspectRatio>
            <Separator
              orientation="vertical"
              className="hidden h-full md:block"
            />
          </div>
        </div>
      </DemoPanel>

      <DemoPanel title="Skeleton and spinner">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner />
            Loading theme preview
          </div>
        </div>
      </DemoPanel>
    </ComponentSection>
  );
}

function LayoutSection() {
  const [open, setOpen] = useState(true);

  return (
    <ComponentSection
      id="layout"
      title="Layout"
      description="Layout primitives check borders, resize handles, sidebar tokens, and collapsed states."
    >
      <DemoPanel title="Resizable panels">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-40 rounded-md border border-border"
        >
          <ResizablePanel defaultSize={35}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Navigation
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              Detail panel
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DemoPanel>

      <DemoPanel title="Collapsible">
        <Collapsible open={open} onOpenChange={setOpen} className="max-w-xl">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-medium">Advanced theme tokens</div>
              <div className="text-sm text-muted-foreground">
                Toggle the content area to inspect transitions.
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle collapsible"
              >
                <ChevronDownIcon />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2 rounded-md border border-border p-3 text-sm text-muted-foreground">
            Sidebar, chart, and popover tokens can be expanded here as the theme
            system grows.
          </CollapsibleContent>
        </Collapsible>
      </DemoPanel>

      <DemoPanel title="Sidebar">
        <div className="h-72 overflow-hidden rounded-md border border-border">
          <SidebarProvider className="h-full min-h-0">
            <Sidebar collapsible="none">
              <SidebarHeader>
                <SidebarInput placeholder="Search workspace" />
              </SidebarHeader>
              <SidebarSeparator />
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>
                          <HomeIcon />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <CalendarIcon />
                          <span>Routines</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>12</SidebarMenuBadge>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <SettingsIcon />
                          <span>Settings</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              Preferences
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LaptopIcon />
                      <span>Standard Theme</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <main className="flex min-w-0 flex-1 flex-col bg-background">
              <div className="flex h-12 items-center gap-2 border-b border-border px-3">
                <SidebarTrigger>
                  <PanelLeftIcon />
                </SidebarTrigger>
                <span className="text-sm font-medium">Sidebar preview</span>
              </div>
              <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
                Sidebar content area
              </div>
            </main>
          </SidebarProvider>
        </div>
      </DemoPanel>
    </ComponentSection>
  );
}

export function ThemeComponentShowcase() {
  return (
    <div className="h-full min-h-0 overflow-y-scroll overscroll-contain bg-canvas text-foreground [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/60 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <PlaygroundNav />
        <main className="min-w-0 flex-1">
          <header className="pb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <MenuIcon className="size-4" />
              <span>Theme playground</span>
            </div>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">
                  ShadCN Theme Surface
                </h1>
                <p className="mt-3 text-muted-foreground">
                  A scrollable component sheet for tuning globals.css tokens
                  against every shared UI primitive in the project.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Playground ready", {
                    description:
                      "Use this page while adjusting theme variables.",
                  })
                }
              >
                <DownloadIcon />
                Test toast
              </Button>
            </div>
          </header>

          <ButtonsSection />
          <InputsSection />
          <SelectionSection />
          <OverlaysSection />
          <MenusSection />
          <ContentSection />
          <LayoutSection />
        </main>
      </div>
    </div>
  );
}
