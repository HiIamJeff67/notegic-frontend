// Generated from apps/web/src/pages/document/website/sources/website.md; run npm run generate:website-guide.
import media0 from "@assets/document/images/dashboard-overview.png?url";
import media1 from "@assets/document/images/widgets-defaults-picker.jpg?url";
import media2 from "@assets/document/images/widgets-clock-settings.jpg?url";
import media3 from "@assets/document/images/widgets-timer-duration.jpg?url";
import media4 from "@assets/document/images/widgets-todo-usage.jpg?url";
import media5 from "@assets/document/images/widgets-calendar.jpg?url";
import media6 from "@assets/document/images/widgets-scratch-pad-editing.jpg?url";
import media7 from "@assets/document/images/widgets-scratch-pad-preview.jpg?url";
import media8 from "@assets/document/images/dashboard-layout-editing.jpg?url";
import media9 from "@assets/document/images/widgets-item-menu.jpg?url";
import media10 from "@assets/document/images/sidebar-overview.jpg?url";
import media11 from "@assets/document/videos/sidebar-navigation.gif?url";
import media12 from "@assets/document/images/editor-block-menu.jpg?url";
import media13 from "@assets/document/images/editor-diagram-preview.jpg?url";
import media14 from "@assets/document/images/editor-diagram-code.jpg?url";
import media15 from "@assets/document/videos/sharing-and-permissions.gif?url";
import media16 from "@assets/document/images/routines-overview.jpg?url";
import media17 from "@assets/document/images/routines-chart-picker.jpg?url";
import media18 from "@assets/document/images/station-create-form.jpg?url";
import media19 from "@assets/document/images/routine-create-form.jpg?url";
import media20 from "@assets/document/images/routine-schedule-picker.jpg?url";
import media21 from "@assets/document/videos/routine-dependencies.gif?url";
import media22 from "@assets/document/images/preferences-appearance.jpg?url";
import media23 from "@assets/document/images/preferences-editor.jpg?url";
import media24 from "@assets/document/videos/settings-presentation.gif?url";
import {
  ArticleImage,
  ArticleVideo,
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphHeader,
  ArticleSubParagraphContent,
} from "@/components/commons/Article/Article";
import CodeExamplePanel from "@/components/panels/CodeExamplePanel/CodeExamplePanel";
const WebsiteContent = () => (
  <>
    <p>
      {
        "Write and organize notes, keep reference files, collaborate, and manage recurring work in Notegic."
      }
    </p>
    <ArticleSubParagraph id="website-beginning" level={1} separatorFullWidth>
      <ArticleSubParagraphHeader as="h3" level={0} className="text-xl">
        {"Beginning"}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <ArticleSubParagraph
          id="website-demonstration"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Demonstration"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Dashboard provides widgets, the Sidebar organizes notes and files, and Routines manages automated work. The examples below use a research project."
              }
            </p>
            <ArticleImage
              src={media0}
              alt="Example Dashboard with Clock, Timer, To-do list, Calendar, and Scratch Pad widgets"
              caption="Image 01 — Dashboard overview"
              width={1600}
              height={1200}
            />

            <p>
              {"This is a customized example layout. See "}
              <ArticleLink href="#website-widgets">{"Widgets"}</ArticleLink>
              {" to add and arrange your own tools."}
            </p>
            <ArticleVideo
              src="https://www.youtube-nocookie.com/embed/pH21Od0Io58?playsinline=1&rel=0"
              href="https://youtu.be/pH21Od0Io58"
              title="Workspace Overview"
              caption="Video 01 — Workspace Overview"
            />
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-big-picture"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Big picture"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <ArticleSubParagraph
              id="website-what-can-this-app-do"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"What can this app do?"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Organize separate projects and place documents and reference files in suitable categories. Documents can contain headings, lists, tables, code, formulas, and diagrams alongside ordinary text. These individual units are called Blocks; together, they form a document called a Block Pack."
                  }
                </p>
                <p>
                  {
                    "Collaborate on documents in a Root Shelf you have permission to access. For recurring work, create a Routine in a Station and add individual Routine Tasks. The website separates configuration from execution records so you can check both what you configured and what actually happened."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-why-this-app"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Why this app?"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "When information is scattered across files, notes, and tools, it can be difficult to trace a source or return to unfinished work. In Notegic, begin by giving each piece of content a clear location and purpose, then add the workflow you need."
                  }
                </p>
                <p>
                  {
                    "For example, keep an original research PDF as a Material and write your observations and summary in a Block Pack. They are related but serve different purposes: one preserves the reference source, while the other is a document you continue to revise."
                  }
                </p>
                <p>
                  {
                    "This structure supports learning notes, research materials, project documentation, and team knowledge that accumulate over time."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-how-can-we-get-started"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"How can we get started?"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>{"Use a small project for your first session:"}</p>
                <ol className="space-y-2 pl-5 list-decimal" start={1}>
                  <li>
                    {
                      "Sign in and enter your workspace through Dashboard or the Sidebar."
                    }
                  </li>
                  <li>
                    {
                      "In the Sidebar's Root Shelves area, select the add button and create a Root Shelf named Research Project."
                    }
                  </li>
                  <li>
                    {
                      "Open that Root Shelf's actions menu and add a Sub Shelf, such as Topic Notes."
                    }
                  </li>
                  <li>
                    {
                      "Open the Sub Shelf's actions menu, choose Block pack from the Items submenu, and name the new document Research Summary."
                    }
                  </li>
                  <li>
                    {
                      "Open the document and add a heading, a short summary, and a list of questions to investigate."
                    }
                  </li>
                  <li>
                    {
                      "Navigate elsewhere through the Sidebar, then return to the same Block Pack to confirm that you can find it again."
                    }
                  </li>
                  <li>
                    {
                      "Before leaving, check for loading, synchronization errors, or pending changes."
                    }
                  </li>
                </ol>
                <p>
                  {
                    "On desktop, item actions are usually available from the right-click menu. If an expected action is missing, check whether you selected a Root Shelf, Sub Shelf, or document, and whether your account has the required permission."
                  }
                </p>
                <ArticleVideo
                  src="https://www.youtube-nocookie.com/embed/s05mQsBdZ9Q?playsinline=1&rel=0"
                  href="https://youtu.be/s05mQsBdZ9Q"
                  title="Create and Organize Your First Note"
                  caption="Video 02 — Create and Organize Your First Note"
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-future-development"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Future development"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "The following are planned directions, rather than currently available features or commitments to specific release dates. See "
              }
              <ArticleLink href="/document#versions">{"Versions"}</ArticleLink>
              {" for published changes and recent plans."}
            </p>
            <ArticleSubParagraph
              id="website-ai-rag-in-routine-tasks"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"AI & RAG in routine tasks"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "We want automated work to make better use of existing notes and reference content, reducing the need to enter the same context repeatedly. Future AI and retrieval features will be guided by practical information-management and workflow needs."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-mcp-and-tool-calling"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"MCP and tool calling"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "We are exploring ways to connect conversations with tool actions more naturally. Alongside producing answers, the aim is to help people understand the proposed actions and the content they may affect."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-chat-ai-and-note-assist-ai"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Chat AI and note assist AI"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Future conversation interfaces will work more closely with Notegic's note structure, making it easier to turn conversation results into formatted, editable content."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-more-components-for-learning-and-researching"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"More components for learning and researching"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "We are exploring additional content types for learning and research."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-currently-working-on"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Currently working on"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Our current focus is AI integration and conversation interfaces that work with Notegic's note structure. We also continue to improve consistency, documentation, and scheduling across existing features."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
    <ArticleSubParagraph id="website-component" level={1} separatorFullWidth>
      <ArticleSubParagraphHeader as="h3" level={0} className="text-xl">
        {"Component"}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <ArticleSubParagraph id="notegic-model" level={2} separatorFullWidth>
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Structured storage"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Storage organizes content hierarchically, with separate roles for categories, editable documents, and reference files. A simple research project might look like this:"
              }
            </p>
            <CodeExamplePanel
              code={{
                text: "Research Project (Root Shelf)\n└─ Topic Notes (Sub Shelf)\n   ├─ Research Summary (Block Pack)\n   │  └─ Headings, paragraphs, lists, and other Blocks\n   └─ Reference Report (Material)",
              }}
            />
            <p>
              {
                "This example illustrates how the content types work together. Available creation and movement options depend on the current menu."
              }
            </p>
            <ArticleSubParagraph id="root-shelves" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Root Shelf"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Root Shelf is the outermost category for a project or collection. It can contain Sub Shelves for organizing notes and reference files. Access to the collection is managed through its Root Shelf."
                  }
                </p>
                <p>
                  {
                    "For example, keep personal research and team projects in separate Root Shelves. Names that describe their purpose are easier to recognize than names such as Folder 1."
                  }
                </p>
                <p>
                  {
                    "To create one, select the add button beside Shelves in the Sidebar, enter a name, and confirm. You can then expand it or open its actions menu to add categories, rename it, or use management actions you have permission to perform."
                  }
                </p>
                <p>
                  {
                    "Delete, leave, and transfer ownership are separate actions. Deleting affects the resource, leaving removes your membership, and transferring ownership changes who manages it. Read the resource name and scope in the confirmation before proceeding."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="sub-shelves" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Sub Shelf"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Sub Shelf is a category within a project and can contain further levels. Organize by topic, such as Methods, Cases, and References, or by stage, such as To Read, In Progress, and Completed. Add categories when you need them rather than creating an empty hierarchy in advance."
                  }
                </p>
                <p>
                  {
                    "Add the first Sub Shelf from the Root Shelf's actions menu. From a Sub Shelf's menu, add another Sub Shelf, a Block Pack, or a Material. An extra category does not create an independent set of permissions; check the owning Root Shelf when sharing with others."
                  }
                </p>
                <p>
                  {
                    "After moving an item, check the Sidebar and item path to confirm its location. If something seems missing, check for collapsed categories before creating another copy."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="block-packs" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Block Pack"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Block Pack is a document you write in Notegic. Open it to enter text, arrange paragraphs, and add other Block types. Use it for research summaries, meeting notes, project descriptions, or notes you expect to revise."
                  }
                </p>
                <p>
                  {
                    "Give each Block Pack a clear name so you can recognize it in the Sidebar and item path. Reading width and font size are display preferences, separate from the document's content."
                  }
                </p>
                <p>
                  {
                    "Before collaborating, confirm that the other person has access to the owning Root Shelf. Sending a document URL does not grant permission."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="materials" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Material"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Material holds a reference file, such as a PDF report, image, audio file, or video. Use Material to retain and view a source file, and Block Pack to write and revise your own content."
                  }
                </p>
                <p>
                  {
                    "Keep the original research report in a Material and summarize its key points in a Block Pack. This preserves the distinction between the source and your observations and makes it easier to return to the original."
                  }
                </p>
                <p>
                  {
                    "Preview availability depends on the file type, content, and browser support. Uploading or opening a file does not automatically turn it into an editable document or run AI analysis."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="blocks" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Block"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Block is a unit of document content. Paragraphs, headings, tables, and other types each support editing and arrangement suited to their content."
                  }
                </p>
                <p>
                  {
                    "Start with a small structure: a heading, a summary paragraph, and a list of next steps are usually easier to maintain than many different Block types added at once."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="integration-patterns"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Automation"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Automation arranges what to do, when to do it, and which steps must come first. The website separates two kinds of information:"
              }
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                {
                  "Definitions: the workflow, tasks, and dependencies you configure."
                }
              </li>
              <li>
                {
                  "Records: what happened during an execution and its final status."
                }
              </li>
            </ul>
            <p>
              {
                "Changing a definition does not mean it has run successfully, and a schedule alone does not confirm that a result exists."
              }
            </p>
            <ArticleSubParagraph id="stations" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Station"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Station groups related automated work. For example, use one Station for research preparation and another for project maintenance. Choose the appropriate Station before adding work so you can find and manage it later."
                  }
                </p>
                <p>
                  {
                    "Station permissions are managed separately from Root Shelf permissions. Being able to read a note does not give someone permission to manage every related automated workflow."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="routines" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Routine defines a workflow, including its name, description, schedule, and tasks. Weekly Research Review might be a Routine; whether it ran successfully this week belongs to a separate execution record. Editing a Routine changes its configuration for subsequent work, rather than rewriting past results."
                  }
                </p>
                <p>
                  {
                    "Choose a name that explains its purpose and add a description where useful. When scheduling, check the recurrence, start and end conditions, and displayed timezone. Review these settings again if you change the time."
                  }
                </p>
                <p>
                  {
                    "Creating a Routine does not mean its tasks have completed. Check the execution records for actual results."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="routine-tasks"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine Task"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Routine Task is an individual action within a Routine. Each task has a purpose and the required inputs, with priority and attempt settings where provided."
                  }
                </p>
                <p>
                  {
                    "Decide which resource the task should act on and what it should do, then select the purpose and enter the inputs. Use a descriptive name, such as Create This Week's Summary, rather than Task 1."
                  }
                </p>
                <p>
                  {
                    "Use non-critical test content when configuring a task for the first time. Confirm the affected resources before testing update or deletion actions in an important project."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="routine-task-dependencies"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine Task dependencies"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Dependencies specify which step must wait for another. If B uses content created by A, arrange A first and make B depend on it. The graph represents this with a connection from A to B."
                  }
                </p>
                <p>
                  {
                    "Connect tasks within the same Routine only where a real ordering requirement exists, and avoid cycles. Check both the connections and the saving state: an unsynchronized or invalid change is not a confirmed execution condition."
                  }
                </p>
                <p>
                  {
                    "If a prerequisite fails or does not run, inspect the records and statuses. An arrow alone does not guarantee that a later task will execute."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="routine-tags" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine Tag"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Routine Tags categorize Routines so you can view related work together. A tag is not a task; creating or applying one does not execute work."
                  }
                </p>
                <p>
                  {
                    "Use tags for purposes or work areas such as Research Preparation, Weekly Review, or Project Maintenance. When filtering, remember that untagged Routines may be hidden too."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-future-not-implemented"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Future (not implemented)"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Learning Card and Exam are content types still being explored and are not currently available operations in this guide."
              }
            </p>
            <p>
              {
                "Learning Cards aim to support repeated practice with information, while Exams are a possible way to assess learning. Their fields, operation, and release scope are not finalized. You do not need to prepare data or change existing notes for them."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
    <ArticleSubParagraph
      id="website-user-interface"
      level={1}
      separatorFullWidth
    >
      <ArticleSubParagraphHeader as="h3" level={0} className="text-xl">
        {"User Interface"}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <ArticleSubParagraph
          id="website-dashboard"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Dashboard"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Dashboard is your working home page. Add clocks, timers, tasks, and notes to see useful information when you open the website. These tools do not change document organization in the Sidebar. Use Shelves for notes and Routines for automation."
              }
            </p>
            <ArticleSubParagraph
              id="website-header-background-image"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Header background image"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "In Dashboard layout editing mode, the header displays an option to change the background. Choose an image, adjust its crop and position, and check the preview before confirming. Changing this background does not require changes to notes or Station settings."
                  }
                </p>
                <p>
                  {
                    "Dashboard backgrounds and personal layouts belong to the current browser. Do not expect them to appear automatically in another browser or device; clearing website data may remove them."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-widgets"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Widgets"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A Widget is a small tool on Dashboard. Choose a built-in tool and adjust its position and size without writing code. Each tool has different controls; the sections below explain its purpose and how to add, edit, and save it."
                  }
                </p>
                <ArticleSubParagraph
                  id="website-defaults"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Defaults"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Defaults refers to tools already available to add, rather than tools that all appear automatically on first use. The picker groups basic tools and guidance content so you can choose what you need."
                      }
                    </p>
                    <ArticleImage
                      src={media1}
                      alt="Widget picker showing Clock and Timer previews and the Guides group"
                      caption="Image 02 — Widget picker"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "Previews help you recognize tools; they are not interactive versions of the widgets. Select an item to add it to Dashboard. You can add more later without arranging the entire page at once."
                      }
                    </p>
                    <ArticleSubParagraph
                      id="website-clock"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Clock"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Place a clock where you need to check the time, including the time in another region. After adding it, check its timezone, which may differ from your location."
                          }
                        </p>
                        <p>{"Open Edit from the Widget menu to adjust:"}</p>
                        <ul className="space-y-2 pl-5 list-disc">
                          <li>
                            {
                              "Timezone: the region displayed by this clock. It does not change a Routine's scheduling timezone."
                            }
                          </li>
                          <li>
                            {
                              "Clock style: an appearance such as traditional, minimal, or modern."
                            }
                          </li>
                          <li>
                            {
                              "Digital time: whether to show hours, minutes, and seconds alongside the clock face."
                            }
                          </li>
                          <li>
                            {
                              "Region name: whether to show the selected region and timezone."
                            }
                          </li>
                          <li>
                            {
                              "Text size: separate sizes for the digital time and region information."
                            }
                          </li>
                        </ul>
                        <ArticleImage
                          src={media2}
                          alt="Clock settings with timezone, style, digital time, region name, and text-size controls"
                          caption="Image 03 — Clock settings"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "If the time differs from what you expect, check the timezone before changing your computer's clock. If labels are crowded, increase the Widget's size or reduce its text size."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-timer"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Timer"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Use the timer to count down a work session, such as thirty minutes of reading before organizing notes. Starting it does not create a Routine or automatically carry out a task."
                          }
                        </p>
                        <p>{"The main controls are:"}</p>
                        <ol className="space-y-2 pl-5 list-decimal" start={1}>
                          <li>
                            {
                              "Before starting, select Edit to adjust hours, minutes, and seconds. Select Save to keep the duration or Cancel to discard the change."
                            }
                          </li>
                          <li>{"Select Start to begin the countdown."}</li>
                          <li>
                            {
                              "Select Pause to stop temporarily, then Resume to continue."
                            }
                          </li>
                          <li>
                            {
                              "Select Reset to return to the configured starting duration, rather than the time remaining when you paused."
                            }
                          </li>
                        </ol>
                        <ArticleImage
                          src={media3}
                          alt="Timer duration editor with hours, minutes, seconds, Save, and Cancel"
                          caption="Image 04 — Timer duration"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "Edit within the timer changes its duration. Edit in the Widget menu changes its appearance, such as the size of the countdown and controls. The quiet-mode setting hides controls; it is not a guarantee about audible alerts."
                          }
                        </p>
                        <p>
                          {
                            "If controls are missing, check quiet mode in the Widget settings. Do not rely on the timer as a background alarm: closing the page, reloading, or browser restrictions on background activity may interrupt it or prevent a reminder."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-to-do-list"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"To-do list"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Use a to-do list for a few things you want to complete today. It does not create automated tasks, and checking an item does not trigger a Routine."
                          }
                        </p>
                        <p>{"To begin:"}</p>
                        <ol className="space-y-2 pl-5 list-decimal" start={1}>
                          <li>
                            {
                              "Select the list title and give it a recognizable name, such as This Week's Research."
                            }
                          </li>
                          <li>{"Select Add new item and enter the task."}</li>
                          <li>
                            {
                              "Drag the handle on the left of a row to change its position."
                            }
                          </li>
                          <li>
                            {
                              "Check an item's box when finished; its text changes to the completed style."
                            }
                          </li>
                          <li>
                            {
                              "Select Save changes within the list to save edits. Text appearing on screen does not by itself confirm that it has been saved."
                            }
                          </li>
                        </ol>
                        <p>
                          {
                            "Hover over a row to reveal actions such as adding a link or removing the item. Links can point to reading sources or related pages. Check unfamiliar external URLs before opening them."
                          }
                        </p>
                        <ArticleImage
                          src={media4}
                          alt="Unsaved to-do list with items, checkboxes, drag handles, links, removal, an add-item control, and Save changes"
                          caption="Image 05 — To-do list controls"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "The example is still being edited, so Save changes is visible. Use that button after completing your changes."
                          }
                        </p>
                        <p>
                          {
                            "Widget appearance settings adjust the title font, item font, and row height. For longer content, increase the Widget size or adjust its text size rather than deleting useful text to make it fit."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-calendar"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Calendar"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Use Calendar to check dates or select a date while planning. Change the month and year with the menus or arrows, then select the date you need."
                          }
                        </p>
                        <ArticleImage
                          src={media5}
                          alt="Calendar with month and year controls, navigation arrows, a complete date grid, and a selected date"
                          caption="Image 06 — Calendar navigation"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "This Widget is not currently an event manager. Selecting a date does not create an event, modify a Routine, or add a reminder. Configure a Routine's schedule to set execution times."
                          }
                        </p>
                        <p>
                          {
                            "Calendar does not have the same dedicated appearance panel as Clock, but you can move it and adjust supported sizes in Dashboard layout editing mode."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-scratch-pad"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Scratch Pad"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Scratch Pad is a Dashboard note for brief ideas, next steps, and reminders. Select its content to edit; leaving the text area returns it to reading mode."
                          }
                        </p>
                        <p>
                          {
                            "It supports Markdown for basic formatting such as headings, lists, and bold text. For example, enter "
                          }
                          <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">
                            {"# Research Notes"}
                          </code>
                          {" as a heading and start lines with "}
                          <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">
                            {"-"}
                          </code>
                          {
                            " to list work to organize. Editing shows the source syntax; reading mode displays the formatted result."
                          }
                        </p>
                        <ArticleImage
                          src={media6}
                          alt="Scratch Pad editing mode with Markdown heading, bold and list syntax, widget controls, and Save changes"
                          caption="Image 07 — Scratch Pad editing"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "Select Save changes within the note after editing. Returning to preview by clicking elsewhere is separate from saving. Appearance settings can adjust text size to suit the Widget's dimensions."
                          }
                        </p>
                        <ArticleImage
                          src={media7}
                          alt="The same Scratch Pad note rendered as a heading and list"
                          caption="Image 08 — Scratch Pad preview"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "Scratch Pad content stays in the current browser and is not a document for team collaboration. Move content that needs long-term storage, sharing, or fuller organization into a Block Pack."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-getting-started"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Getting started"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "This is a paginated checklist for getting started. Expand each item to read the instructions and check it when you finish. The count below shows progress on the current page, and the arrows switch pages."
                          }
                        </p>
                        <p>
                          {
                            "Checking an item records your own progress; it does not create data for you. After checking Create a Category, you still need to create it in the Sidebar. If you have already completed an action, you can return and check it afterward."
                          }
                        </p>
                        <p>
                          {
                            "You can complete the first page and continue with your own work. The checklist does not require you to learn every automation feature at once."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-walkthrough-video"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Walkthrough video"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Watch Workspace Overview directly in this Widget for a tour of notes, reference files, and routines. Select play to load the video; use the player controls to pause, seek, or enter full screen. You can also "
                          }
                          <a
                            className="underline underline-offset-4 hover:text-primary"
                            href="https://youtu.be/pH21Od0Io58"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {"watch Workspace Overview on YouTube"}
                          </a>
                          {"."}
                        </p>
                        <p>
                          {
                            "Getting started and Walkthrough video are guidance content and may span the workspace width, unlike smaller clocks. Neither currently has the standard Widget appearance panel."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-usage"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Usage"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Distinguish three kinds of Widget changes: moving the tool on the page, changing its appearance, and editing its content. They have different controls and may use different save buttons."
                      }
                    </p>
                    <ArticleSubParagraph
                      id="website-add-a-widget"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Add a widget"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Select the pencil icon at the bottom right of Dashboard to edit the layout. Add, width, and completion controls appear, along with controls around the Widgets."
                          }
                        </p>
                        <p>
                          {
                            "Select the plus button at the bottom right to open the picker and add a tool. If an empty grid area with a plus sign appears, you can add one there too. New tools may be outside the current view, so scroll down if needed."
                          }
                        </p>
                        <p>
                          {
                            "Add one or two tools first, then arrange the page gradually so it remains clear what you are changing."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-move-and-resize"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Move and resize"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "In layout editing mode, drag tools to allowed positions and use their bottom-right handles to resize them. Widgets follow the grid and supported sizes; not every tool can take any width or height."
                          }
                        </p>
                        <ArticleImage
                          src={media8}
                          alt="Clock being dragged on Dashboard, with an empty origin and a pale destination preview with a white outline"
                          caption="Image 09 — Widget drag destination"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "The example shows a drag before release. The pale area is a proposed destination, rather than a newly added Widget. Release the tool, confirm its position, then save the layout."
                          }
                        </p>
                        <p>
                          {
                            "A limited set of sizes may be intentional. Clocks, calendars, and longer to-do lists support sizes suited to their content."
                          }
                        </p>
                        <p>
                          {
                            "The narrow/wide control at the bottom right changes the available width of Dashboard, rather than a single Widget's font or size. Identify which level needs adjusting when the layout feels crowded."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-edit-a-widget"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Edit a widget"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "During layout editing, a Widget's three-dot menu shows its available actions. Tools with dedicated settings provide Edit; other tools may offer different options."
                          }
                        </p>
                        <ArticleImage
                          src={media9}
                          alt="To-do Widget actions menu with Edit and Delete"
                          caption="Image 10 — Widget actions menu"
                          width={1600}
                          height={1200}
                        />

                        <p>
                          {
                            "Use the settings described for each tool above. These are separate from changing the timer duration or typing into a to-do list. Close the appearance panel when finished, then complete and save Dashboard layout editing."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-save-your-changes"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Save your changes"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "After arranging positions and sizes, select the checkmark at the bottom right of Dashboard to save the layout and leave editing mode. You can then use timers and enter content without accidentally dragging the whole tool."
                          }
                        </p>
                        <p>
                          {
                            "To-do list and Scratch Pad also have their own Save changes controls. Save Dashboard after moving tools, and save the individual tool after editing its content."
                          }
                        </p>
                        <p>
                          {
                            "This data is stored in the current browser. Do not expect the full Dashboard to follow you after clearing website data, changing browsers, or switching devices. Keep important documents in a location suited to long-term storage."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                    <ArticleSubParagraph
                      id="website-remove-a-widget"
                      level={3}
                      separatorFullWidth
                    >
                      <ArticleSubParagraphHeader
                        as="h6"
                        level={0}
                        className="text-base"
                      >
                        {"Remove a widget"}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent level={1}>
                        <p>
                          {
                            "Before removal, check for notes or tasks you want to keep. Delete in the Widget menu removes the whole tool, rather than closing settings or removing one task row."
                          }
                        </p>
                        <p>
                          {
                            "Save anything you may still need elsewhere first. Do not assume that a removed Dashboard Widget can always be recovered from Trash."
                          }
                        </p>
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-customized"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Customized"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "This refers to possible future custom Widgets or other extensions and is not currently implemented. This guide does not provide steps for installing community components, uploading tools, or writing Widget code."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-other-interactive-ui-components"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Other interactive UI components"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Controls can act on a layout, a component's content, or an entire resource. Check their scope before using them: deleting a Widget and deleting a document have different effects."
                  }
                </p>
                <p>
                  {
                    "Some controls are temporarily disabled while saving or loading. Wait for the result rather than submitting repeatedly because the page has not changed immediately."
                  }
                </p>
                <p>
                  {
                    "On narrow screens, the Sidebar and some controls collapse. Open the Sidebar when you need to navigate. If the view is crowded, adjust density or text size in preferences."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph id="website-sidebar" level={2} separatorFullWidth>
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Sidebar"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Use the Sidebar to find documents and switch pages. Dashboard and Routines are at the top, content categories and Stations are in the middle, and documentation, Trash, feedback, and account actions are below."
              }
            </p>
            <p>
              {
                "Collapse it on narrower screens or when you need more space for content, then reopen it to navigate. Collapsing the Sidebar does not delete data or remove you from a project."
              }
            </p>
            <ArticleImage
              src={media10}
              alt="Expanded Sidebar with page navigation, Shelves, Stations, and account actions, alongside a narrow portion of Dashboard"
              caption="Image 11 — Sidebar overview"
              width={1600}
              height={1200}
            />

            <ArticleImage
              src={media11}
              alt="Expanding a Shelf and subcategories to inspect the document hierarchy and item hints"
              caption="GIF 01 — Sidebar navigation"
              width={1600}
              height={1200}
              animated
            />

            <ArticleSubParagraph
              id="website-structured-storage-area"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Structured storage area"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Expand a Root Shelf and its Sub Shelves to find documents and reference files. Check for collapsed categories when an item is missing. If different projects contain documents with the same name, check the parent category before opening one."
                  }
                </p>
                <p>
                  {
                    "On desktop, right-click an item to open its menu. Available options depend on the item:"
                  }
                </p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {
                      "Root Shelf: add a Sub Shelf, rename the collection, or find membership and ownership actions."
                    }
                  </li>
                  <li>
                    {
                      "Sub Shelf: add another Sub Shelf; for documents and files, open the Items submenu and select Block pack or Material."
                    }
                  </li>
                  <li>
                    {
                      "Documents and files: open, rename, or use other actions your permissions allow."
                    }
                  </li>
                </ul>
                <p>
                  {
                    "If an option is missing, check where you right-clicked. A document and its parent category have different menus."
                  }
                </p>
                <p>
                  {
                    "When renaming, finish and confirm the new name before moving the item or performing another action. You do not need to delete and recreate it; that would create a different resource."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-automation-area"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Automation area"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Stations is for finding automated work, rather than another folder group for notes. Expand a Station to view Routines, or use Routine Tags to organize work by purpose."
                  }
                </p>
                <p>
                  {
                    "On the Routines page, you can choose which Stations to display. If work seems missing, check Station and tag filters before creating it again."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-document-trash-and-report-area"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Document, Trash, and Report area"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {
                      "Document: read website guides, API documentation, versions, and other public information."
                    }
                  </li>
                  <li>
                    {
                      "Trash: view listed deleted items and find resources by name or type."
                    }
                  </li>
                  <li>
                    {
                      "Report: open feedback to report a problem or suggest a feature."
                    }
                  </li>
                </ul>
                <p>
                  {
                    "Trash currently focuses on viewing and searching. A listed item does not guarantee that the website can restore it. Save important content before deleting it."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-user-information"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"User information"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The bottom of the Sidebar shows the signed-in account and connection information. If a project seems missing after switching accounts, check that you are using the intended identity."
                  }
                </p>
                <p>
                  {
                    "Display names and avatars help identify people; they do not determine resource ownership. Changing your profile does not grant access to other projects."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-settings-and-logout"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Settings and logout"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Open account settings for personal information, API keys, and security. Open preferences for themes, fonts, editor behavior, and notifications. Distinguish changes to the account itself from changes to how you view and use the website."
                  }
                </p>
                <p>
                  {
                    "Depending on screen size and settings, these areas may open as a full page or side sheet. They are different presentations of the same account's settings."
                  }
                </p>
                <p>
                  {
                    "Before signing out, check for saving or synchronization notices. Signing out does not force every pending change to upload and is not a backup of local content."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-notification"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Notification"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Select the notification control to open the list. The unread count indicates unseen messages. Open a message to read its details and use the available actions to update its read state."
                  }
                </p>
                <p>
                  {
                    "Wait when the list is loading. An empty state means that no messages are listed; a failure means that the connection or request needs attention. If a message becomes unread again, its read state may not have saved. Check again rather than resetting the account."
                  }
                </p>
                <p>
                  {
                    "In-app notifications, temporary feedback messages, and browser notifications are different. Browser notifications require permission, and permission alone does not guarantee that every message will arrive in the background."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-block-pack-editor"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Block pack editor"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <ArticleSubParagraph
              id="website-block-based-editor-introduction"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Block-based editor introduction"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Open a Block Pack from the Sidebar and wait for it to load before typing. Empty areas prompt you to type or use "
                  }
                  <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">
                    {"/"}
                  </code>
                  {
                    " to open the command menu. You can write first and organize later without deciding the entire document's formatting in advance."
                  }
                </p>
                <p>
                  {
                    "Documents consist of Blocks. Each paragraph, heading, or table has its own content and actions, allowing you to move one part without cutting and pasting the whole document."
                  }
                </p>
                <ArticleSubParagraph
                  id="website-insert-a-block"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Insert a block"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {"Type "}
                      <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">
                        {"/"}
                      </code>
                      {
                        " at an editable position to view the available types. Select an item directly, or continue typing its name to narrow the list and choose with the keyboard or mouse."
                      }
                    </p>
                    <ArticleImage
                      src={media12}
                      alt="Block insertion menu in a note template, showing headings, quotes, and lists"
                      caption="Image 12 — Block insertion menu"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "This image and the next two Diagram images use the task template editor to demonstrate Blocks. Templates and ordinary documents use the same block structure, although the standard Block Pack editor may provide additional menu items. Confirming template content and creating a task are separate steps, explained in the Payload editor section."
                      }
                    </p>
                    <p>
                      {
                        "Lists, diagrams, and calendars in this menu are document Blocks, rather than Dashboard Widgets or automation settings. Inserting a calendar in a document does not create a Routine schedule."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-headings-and-lists"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Headings and lists"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Use headings to divide sections and paragraphs to explain them. Begin with a main heading for the topic, then use smaller headings for questions, evidence, and conclusions. Heading levels define document structure as well as appearance."
                      }
                    </p>
                    <p>
                      {
                        "Choose lists by purpose: bullets for points without a fixed order, numbered lists for sequences, and checklists for tracking completion. Collapsible lists or headings can hold longer supporting material without expanding everything into the main text."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-tables-and-code"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Tables and code"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Tables help compare sources, viewpoints, and questions to investigate. Decide what each column should answer before entering data, rather than filling cells with long passages."
                      }
                    </p>
                    <p>
                      {
                        "Code blocks preserve precise formatting for snippets and commands. Code recorded in a document does not execute simply because it is displayed. Remove credentials or private information before sharing."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-math-and-diagrams"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Math and diagrams"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Formulas can appear in their own Blocks or within text. Use a separate formula for an expression that needs its own space, and inline formulas when explaining a symbol within a sentence."
                      }
                    </p>
                    <p>
                      {
                        "Diagram renders Mermaid text as a diagram. This simple example contains Start and Stop nodes:"
                      }
                    </p>
                    <ArticleImage
                      src={media13}
                      alt="Mermaid diagram preview with an arrow connecting Start and Stop"
                      caption="Image 13 — Diagram preview"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "Double-click the diagram to open its source editor, make changes, and select OK to finish. The example uses:"
                      }
                    </p>
                    <CodeExamplePanel
                      code={{ mermaid: "graph TD\n    A[Start] --> B[Stop]" }}
                    />
                    <ArticleImage
                      src={media14}
                      alt="Diagram source editor with the Mermaid text, preview, and OK control"
                      caption="Image 14 — Diagram source editor"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "Document arrows illustrate ideas; they do not control Routines. Use the dependency graph editor described later to configure task ordering. Both views contain nodes and connections, but serve different purposes."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-images-and-other-media"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Images and other media"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "The insertion menu also provides images, video, audio, and files. These are document media Blocks. Follow the fields shown for each Block to provide a supported source."
                      }
                    </p>
                    <p>
                      {
                        "If external media fails to load, check that the source remains accessible and that your account has permission. Do not use private signed URLs or temporary download links as permanent sources for public content."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-arrange-your-content"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Arrange your content"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>{"A research summary can begin with three parts:"}</p>
                    <ol className="space-y-2 pl-5 list-decimal" start={1}>
                      <li>{"A heading for the research topic."}</li>
                      <li>
                        {
                          "Paragraphs describing your current understanding and key observations."
                        }
                      </li>
                      <li>
                        {"A list of questions to investigate and next steps."}
                      </li>
                    </ol>
                    <p>
                      {
                        "Use a Block's drag handle to change its position. To edit text, select its content instead. If handles are missing, check the relevant editor preference."
                      }
                    </p>
                    <p>
                      {
                        "Font size and reading width are separate display preferences. Adjust the view for comfortable reading rather than breaking document text into unusual short lines to fit the window."
                      }
                    </p>
                    <ArticleVideo
                      src="https://www.youtube-nocookie.com/embed/sloOOtnHToM?playsinline=1&rel=0"
                      href="https://youtu.be/sloOOtnHToM"
                      title="Edit Notes with Tables, Code, and Diagrams"
                      caption="Video 03 — Edit Notes with Tables, Code, and Diagrams"
                    />
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-sharing-and-collaborating"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Sharing and collaborating"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Before inviting someone to work on a document, identify its Root Shelf and check their access through the member or sharing controls. The participant control above a document provides collaboration information, but seeing someone there and granting editing access are different actions."
                  }
                </p>
                <p>
                  {
                    "Send the document URL to help others find it; the URL itself does not grant permission. If someone cannot open it, check that they are signed in with the correct account and belong to the appropriate Root Shelf."
                  }
                </p>
                <p>
                  {
                    "During collaboration, watch connection and synchronization feedback. Preserve your current work before handling a synchronization error rather than repeatedly reloading."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-permission-and-access-control"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Permission and access control"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Reading, editing, managing members, and transferring ownership are different levels of access. Grant what the person needs for the work. Available roles and actions depend on the sharing interface."
                  }
                </p>
                <p>
                  {
                    "If a document opens but cannot be edited, check whether access is read-only. The account may have reading permission without editing permission. Ask a resource owner or authorized manager to change access rather than sharing an account or API key."
                  }
                </p>
                <p>
                  {
                    "Root Shelf and Station permissions are separate. Document collaboration does not grant automation management access. Do not share accounts or API keys to bypass permission boundaries."
                  }
                </p>
                <ArticleImage
                  src={media15}
                  alt="Opening participants and Sharing overview to inspect Permission and Status fields"
                  caption="GIF 02 — Sharing and permissions"
                  width={1600}
                  height={1200}
                  animated
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-editor-topbar"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Editor topbar"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The topbar provides the document name, participants, and import and export actions. Hover over an unfamiliar icon to read its hint. Import and export act in opposite directions, so check the action before selecting a file."
                  }
                </p>
                <ArticleSubParagraph
                  id="website-import"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Import"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Import reads a supported file into the current document as editable content, rather than preserving it as an attachment. Available formats include Markdown, plain text, HTML, and JSON that matches the document structure."
                      }
                    </p>
                    <p>{"For a first import:"}</p>
                    <ol className="space-y-2 pl-5 list-decimal" start={1}>
                      <li>
                        {
                          "Create an empty Block Pack rather than testing on an important note."
                        }
                      </li>
                      <li>
                        {"Open the import menu and select a supported file."}
                      </li>
                      <li>
                        {
                          "Wait for the result, then check headings, lists, tables, and paragraph order."
                        }
                      </li>
                      <li>
                        {
                          "Confirm that the content is suitable for editing before adding your own notes."
                        }
                      </li>
                    </ol>
                    <p>
                      {
                        "To keep an original file for reference, use Material. An imported document may not retain every aspect of the source file's layout or behavior."
                      }
                    </p>
                    <p>
                      {
                        "JSON must follow the structure accepted by the editor; arbitrary JSON data cannot necessarily become a document. If a file is not recognized, check its format and content rather than changing its extension to bypass validation."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-export"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Export"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Export downloads the current document in another format. Choose according to its intended use:"
                      }
                    </p>
                    <ul className="space-y-2 pl-5 list-disc">
                      <li>
                        {
                          "For the main text, use plain text without expecting the full layout."
                        }
                      </li>
                      <li>
                        {
                          "For further work in text tools, consider Markdown and check the conversion of special Blocks."
                        }
                      </li>
                      <li>
                        {
                          "For a reading copy, choose PDF and inspect pagination and appearance."
                        }
                      </li>
                      <li>
                        {
                          "For another document tool, choose HTML, DOCX, or structured JSON as appropriate and check compatibility."
                        }
                      </li>
                    </ul>
                    <p>
                      {
                        "Not every Block looks identical in every format. Open the downloaded file and inspect tables, formulas, diagrams, and media before sharing or archiving it."
                      }
                    </p>
                    <p>
                      {
                        "An exported copy is not a complete workspace backup, and not every export format can be imported again."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-editor-item-path"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Editor item path"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The path below the name shows the document's Root Shelf and Sub Shelf. If two documents are both named Research Summary, use the path to identify their projects."
                  }
                </p>
                <p>
                  {
                    "The path identifies location and supports navigation; it is neither a permission control nor a local file-system location. Check it again after reorganizing categories."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-connection-and-saving-feedback"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Connection and saving feedback"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "When editing is unavailable, distinguish the possible causes:"
                  }
                </p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {
                      "Still loading: wait for the document to be ready rather than repeatedly refreshing."
                    }
                  </li>
                  <li>
                    {"Open but read-only: check your editing permission."}
                  </li>
                  <li>
                    {
                      "Synchronization error: preserve your work, check the connection, and follow the available recovery actions."
                    }
                  </li>
                </ul>
                <p>
                  {
                    "If the interface requests resynchronization, read the confirmation and use an available export method to preserve important content where possible. Do not clear website data or reset local state while changes remain unconfirmed."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-material-viewer"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Material viewer"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <ArticleSubParagraph
              id="website-file-holder-introduction"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"File holder introduction"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Open a Material to view its reference file. The website displays an image, audiovisual, PDF, or text preview according to its type. Read the source and write your summary separately in a Block Pack."
                  }
                </p>
                <p>
                  {
                    "The name may appear before the content loads. For large files or slower connections, distinguish loading, unsupported content, and errors before deciding what to do. An empty view does not necessarily mean you need to create another Material."
                  }
                </p>
                <p>{"To add your first reference file:"}</p>
                <ol className="space-y-2 pl-5 list-decimal" start={1}>
                  <li>
                    {
                      "Open Items in a Sub Shelf's actions menu and select Material."
                    }
                  </li>
                  <li>
                    {
                      "Open the new Material, choose Import from the File menu, and select or drag in a file."
                    }
                  </li>
                  <li>
                    {
                      "Wait for import confirmation, then check the preview and item path."
                    }
                  </li>
                  <li>
                    {
                      "To write reading notes, create a separate Block Pack in the same or a related category."
                    }
                  </li>
                </ol>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-supported-file-types"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Supported file types"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The preview interface covers the following types. This list describes preview capabilities, rather than upload limits or file-size requirements:"
                  }
                </p>
                <div
                  role="region"
                  aria-label="Preview type"
                  tabIndex={0}
                  className="max-w-full overflow-x-auto"
                >
                  <table className="w-full min-w-80 border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="border-b border-border px-3 py-2 font-semibold"
                        >
                          {"Preview type"}
                        </th>
                        <th
                          scope="col"
                          className="border-b border-border px-3 py-2 font-semibold"
                        >
                          {"Supported formats"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"Image"}
                        </td>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"PNG, JPG/JPEG, GIF, SVG, WebP"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"Video"}
                        </td>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"MP4, WebM"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"Audio"}
                        </td>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"MP3"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"Document"}
                        </td>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"PDF"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"Text"}
                        </td>
                        <td className="border-b border-border/50 px-3 py-2 align-top">
                          {"JSON, Markdown, plain text, HTML"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ArticleSubParagraph
                  id="website-read-the-preview"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Read the preview"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "View images and PDFs directly, and use the provided playback controls for audio and video. Text previews display the file's contents, such as JSON, HTML, or Markdown source, rather than converting it into a Block Pack."
                      }
                    </p>
                    <p>
                      {
                        "Visible HTML tags or Markdown syntax therefore do not necessarily indicate a display error. Use Block Pack for an editable document. HTML in a text preview does not run as a web page."
                      }
                    </p>
                    <p>
                      {
                        "Audio and video playback also depend on browser decoding support. Files with the same extension may preview differently because of their encoding or condition."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-when-a-preview-does-not-load"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"When a preview does not load"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Check three things first: whether the type appears in the preview list, whether the network is working, and whether the original file opens elsewhere. Different encodings can affect videos even when their extensions match."
                      }
                    </p>
                    <p>
                      {
                        "If downloading is available and permitted, inspect the original in a suitable application. Changing an extension does not make the website understand a file, and a preview failure is not a reason to delete the only source copy."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-viewer-topbar"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Viewer topbar"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The viewer topbar shows the Material's information and available actions. Check its name and type before proceeding, especially when files in different locations have the same name."
                  }
                </p>
                <p>
                  {
                    "PDF previews provide zoom, page navigation, highlighting, text, and drawing tools. After adding annotations, choose Save annotations from the File menu to write them into the Material's PDF, or choose Download annotated PDF to download a copy. Wait for saving to succeed before leaving; annotations appearing on the page do not by themselves confirm that they have been saved."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-viewer-item-path"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Viewer item path"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Use the path to identify the Material's location and return to its categories. Keeping reports and related summaries in nearby categories makes it easier to move between them."
                  }
                </p>
                <ArticleVideo
                  src="https://www.youtube-nocookie.com/embed/xQ77zM2-PxM?playsinline=1&rel=0"
                  href="https://youtu.be/xQ77zM2-PxM"
                  title="Import and Read a PDF"
                  caption="Video 04 — Import and Read a PDF"
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-routine-overviewer"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Routine overviewer"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "This page brings together the time rail, charts, workflow definitions, and execution records. Start by deciding whether you need a task's configuration or the result of a particular execution, then choose the corresponding view."
              }
            </p>
            <ArticleImage
              src={media16}
              alt="Routines overview for My First Station, including scope counts, the time rail, and charts"
              caption="Image 15 — Routines overview"
              width={1600}
              height={1200}
            />

            <p>
              {
                "The example uses My First Station, which has no Routines, so the time rail shows No routines. Charts below may still show workspace-wide statistics; do not interpret every number as belonging to that Station."
              }
            </p>
            <ArticleSubParagraph
              id="website-scope-and-filters"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Scope and filters"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-choose-what-to-show"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Choose what to show"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "The counts and selection controls at the top help identify the visible Stations, Routines, and tags. Open the relevant control, select the items you need, and apply the selection."
                      }
                    </p>
                    <p>
                      {
                        "For example, keep only the Station for a research project when you want to focus on that work. Stations hidden by the filter have not been deleted; filtering changes only what you currently see."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-find-a-missing-routine"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Find a missing routine"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Check that its Station is visible, then review tag and time filters. Untagged Routines may also be filtered out, so selecting only a few tags does not show every workflow in the account."
                      }
                    </p>
                    <p>
                      {
                        "Tables may have their own conditions. Selecting the correct Station at the top does not clear a table's time or purpose filters. Check both."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-overview-background-image"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Overview background image"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The background changes the page's appearance, rather than tasks or execution times. If you set a background URL through a Station form, save that form. This is a different action from choosing a local Dashboard background."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-time-rail"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Time rail"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-change-the-visible-time-range"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Change the visible time range"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Choose a daily, weekly, or monthly scale. A shorter range shows nearby detail; a longer range helps you see the distribution of work. Date controls change the displayed period, and Today returns the view to the current date."
                      }
                    </p>
                    <p>
                      {
                        "These controls change the visible time range, rather than a Routine's start or end time. Edit the Routine's settings to change its schedule."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-read-a-scheduled-item"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Read a scheduled item"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Identify the item's Station, Routine, and date, then compare its time and timezone with the configuration. A position on the time rail shows when work is scheduled, rather than whether it has completed."
                      }
                    </p>
                    <p>
                      {
                        "Check execution records below to confirm success or failure. For recurring work, match the correct date so you do not mistake another execution's result for this one."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-charts"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Charts"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-add-and-choose-a-chart"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Add and choose a chart"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "If there are no charts, select Add charts in the chart area or use the add-chart control above. The picker groups options by overview, Routine, and Routine Task, with statistics for different questions:"
                      }
                    </p>
                    <ul className="space-y-2 pl-5 list-disc">
                      <li>{"Totals: overall counts of related resources."}</li>
                      <li>
                        {
                          "Workflow status: the distribution of Routines by status."
                        }
                      </li>
                      <li>{"Recurrence: the periods used by workflows."}</li>
                      <li>
                        {
                          "Scheduled start and end times: the distribution of schedules over time."
                        }
                      </li>
                      <li>
                        {
                          "Task purpose: the distribution of Routine Task purposes."
                        }
                      </li>
                    </ul>
                    <ArticleImage
                      src={media17}
                      alt="Add chart picker with Overall and Routine previews and Added indicators"
                      caption="Image 16 — Chart picker"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "The charts in the picker are previews for recognizing a style, rather than actual account statistics. Add a chart before reviewing the data it loads."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-read-and-manage-charts"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Read and manage charts"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Each chart has its own title and available metrics. Overview, Routine, and task charts may measure different populations. Do not assume every chart follows the same filters. Check titles and time ranges before comparing numbers."
                      }
                    </p>
                    <p>
                      {
                        "Use a chart's metric menu to change the view, or its removal control when it is no longer needed. Removing a chart does not delete Routines or execution records."
                      }
                    </p>
                    <p>
                      {
                        "An empty chart may mean no data matches the filters, that data is loading, or that an error occurred. Check lists and records before drawing conclusions from an unexpected chart."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-table"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine table"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This table shows workflow definitions. Rows include the Routine, Station, status, schedule, tags, and task information, helping you identify where work belongs, when it is scheduled, and which steps it contains."
                  }
                </p>
                <p>
                  {
                    "Use start and end time filters to find work, and check whether unscheduled items are included. If an item disappears after changing a time filter, inspect that condition before creating it again."
                  }
                </p>
                <p>
                  {
                    "Open the row's details or Inspector to change the workflow. Current settings are not the result of the latest execution; use the next record table to investigate a particular run."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-execution-record-table"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine execution record table"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This table shows individual Routine executions. Find the workflow and scheduled time, then review its status, task counts, and completion information. Use available status filters to narrow the list and open the relevant record."
                  }
                </p>
                <p>
                  {
                    "The current definition may have changed since an execution. When investigating past behavior, preserve the relevant record information rather than assuming today's settings describe what ran then."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-task-table"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine task table"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This table lists task definitions, including name, Station, purpose, and owning Routine. Filter by purpose or workflow to find a step, then use its actions to inspect or edit it."
                  }
                </p>
                <p>
                  {
                    "For similar task names, check the workflow and purpose. Open the task details or Payload editor to see its inputs rather than inferring the affected document from its name alone."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-task-record-table"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine task record table"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This table shows individual task execution attempts. If a Routine does not produce the expected result, identify which task and attempt encountered a problem."
                  }
                </p>
                <p>
                  {
                    "Use available status, schedule, and other filters, then open the details. Distinguish no matching records, loading, and read failures rather than treating all three as evidence that a task did not run."
                  }
                </p>
                <p>
                  {
                    "An execution record is not an editable task definition. Change future work through task settings. When reporting a problem, retain the execution time and visible error information needed to identify that attempt."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-create-your-first-routine"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Create your first routine"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Start with test data and a single task. Understanding one simple step makes it easier to diagnose problems than adding a schedule, many tasks, and multiple dependencies at once."
                  }
                </p>
                <ArticleSubParagraph
                  id="website-create-a-station"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Create a station"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Select the add button beside Stations in the Sidebar and enter a name. Use a description to explain the work. Icons and backgrounds help identify the Station but are not execution requirements."
                      }
                    </p>
                    <ArticleImage
                      src={media18}
                      alt="Create station form with name, description, icon, and background URL fields"
                      caption="Image 17 — Station creation form"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "Confirm that the new Station appears in the Sidebar, then add a Routine from its menu. This helps avoid creating work in another project with a similar name."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-configure-a-routine"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Configure a routine"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "The Routine form requires a name and provides description, execution timeout, schedule, recurrence, and pinning options:"
                      }
                    </p>
                    <ul className="space-y-2 pl-5 list-disc">
                      <li>
                        {
                          "Name and description: explain what the workflow does."
                        }
                      </li>
                      <li>
                        {
                          "Execution timeout: how long the work is allowed to run, rather than how often it repeats."
                        }
                      </li>
                      <li>
                        {
                          "Custom schedule: enable it to set start and end times. Without a custom schedule or recurrence, the workflow starts when activated. To pause work, deactivate it rather than leaving dates blank."
                        }
                      </li>
                      <li>
                        {
                          "Recurrence: whether to repeat and the daily, weekly, monthly, or other options provided by the interface."
                        }
                      </li>
                      <li>
                        {
                          "Pinning: makes the Routine easier to identify or access, rather than setting execution order."
                        }
                      </li>
                    </ul>
                    <ArticleImage
                      src={media19}
                      alt="Create routine form with name, description, timeout, custom schedule, recurrence, and pinning"
                      caption="Image 18 — Routine creation form"
                      width={1600}
                      height={1200}
                    />
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-choose-dates-and-times"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Choose dates and times"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "After enabling a custom schedule, open the start and end pickers, select dates, and check hours and minutes. End conditions must satisfy the current recurrence's rules. Correct validation messages before submitting."
                      }
                    </p>
                    <ArticleImage
                      src={media20}
                      alt="Routine start-time picker with month, date, 12H/24H, hour, and minute controls"
                      caption="Image 19 — Routine date and time picker"
                      width={1600}
                      height={1200}
                    />

                    <p>
                      {
                        "After saving, check the timezone in the Routine's details. A displayed date does not mean every workflow uses the timezone you expect. If you are only exploring the form, cancel rather than creating work that may execute."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-add-a-task-and-check-the-result"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Add a task and check the result"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>{"When ready to create the workflow:"}</p>
                    <ol className="space-y-2 pl-5 list-decimal" start={1}>
                      <li>
                        {
                          "Create or select a Station you have permission to manage."
                        }
                      </li>
                      <li>
                        {
                          "Create a Routine from the Station's actions and enter a meaningful name and description."
                        }
                      </li>
                      <li>
                        {
                          "If scheduling is needed, configure its period and times and check the timezone."
                        }
                      </li>
                      <li>
                        {
                          "Add a task to the Routine, select its purpose, and provide test resources as inputs."
                        }
                      </li>
                      <li>
                        {
                          "Open the Routine's graph, add a Start node from the add menu, and connect it to the first task. Confirm that the intended Start node is active."
                        }
                      </li>
                      <li>
                        {
                          "Select Save to save the graph and check that no unsaved changes or validation errors remain."
                        }
                      </li>
                      <li>
                        {
                          "Review the schedule and timezone, then activate the Routine using Resume in the toolbar or Active in the Inspector. If the interface requires a future start time, correct the schedule before activating it again."
                        }
                      </li>
                      <li>
                        {
                          "After execution, review the Routine and task records and open the actual content created or updated to confirm the result."
                        }
                      </li>
                    </ol>
                    <p>
                      {
                        "Once a single task is working, add another task and its dependencies. This makes it easier to distinguish input problems from scheduling or ordering problems."
                      }
                    </p>
                    <ArticleVideo
                      src="https://www.youtube-nocookie.com/embed/H2PQbdqwrq0?playsinline=1&rel=0"
                      href="https://youtu.be/H2PQbdqwrq0"
                      title="Schedule a Routine and Check Its Results"
                      caption="Video 05 — Schedule a Routine and Check Its Results"
                    />

                    <p>
                      {
                        "Main interactions play at 1.75x speed. The waiting interval plays at 4x, marked by "
                      }
                      <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">
                        {">> 4x"}
                      </code>
                      {
                        ". The reference clock at the bottom right follows the recorded time to help compare it with the schedule."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-inspector"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Inspector"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Inspector opens an item's details without leaving the main work area. Choose Open in inspector from a Station or Routine menu to review its settings. Tasks and tags also have dedicated panels."
              }
            </p>
            <p>
              {
                "Check the name before editing. Similar-looking panels may change different things, such as a Station's name, a Routine's schedule, or a task's inputs."
              }
            </p>
            <ArticleSubParagraph
              id="website-station-inspector"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Station inspector"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Review and edit the Station's name, description, icon, and background. Use the name for identification and the description for its purpose or team context, rather than including every task's details."
                  }
                </p>
                <p>
                  {
                    "Station appearance and identification are separate from Routine schedules. To change execution times, edit the relevant Routine."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-inspector"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine inspector"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Review the Routine's name, description, status, schedule, timeout, and timezone. Active determines whether the workflow is enabled and is separate from its current execution status. For a weekly execution time, check the period and scheduled time; for allowed execution duration, check the timeout."
                  }
                </p>
                <p>
                  {
                    "Save as directed by the form and check the result. Correct field validation messages rather than repeatedly submitting the same settings."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-task-inspector"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine task inspector"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Review the task name, purpose, inputs, priority, and attempt settings. Check Payload to change the target resource; check dependencies to change ordering requirements."
                  }
                </p>
                <p>
                  {
                    "Priority, attempts, and dependencies are different settings. If one step must follow another, configure the dependency rather than expressing it only through names or list order."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-routine-tag-inspector"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Routine tag inspector"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Edit the tag's name, color, and icon. A purpose such as Research Preparation makes a useful name. Colors and icons help recognition but do not change execution order or permissions."
                  }
                </p>
                <p>
                  {
                    "Read-only information in any Inspector is for reference. Do not edit identifiers manually to solve a problem. If actions are unavailable, check permissions, connection, and loading state."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-routine-task-dependency-graph-editor"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Routine task dependency graph editor"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "This graph configures work, rather than illustrating a note. It contains Start nodes and Routine Task nodes that perform actions. Connections define entry points and ordering requirements. Confirm the current Routine before editing so you do not confuse steps from different workflows."
              }
            </p>
            <ArticleSubParagraph
              id="website-read-the-graph"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Read the graph"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "For work that prepares data before processing and organizing it, the order might be:"
                  }
                </p>
                <CodeExamplePanel
                  code={{
                    text: "Start → Task A: Prepare data → Task B: Process data → Task C: Organize results",
                  }}
                />
                <p>
                  {
                    "The workflow enters A from Start, B depends on A, and C depends on B. A node being farther left does not by itself make it run first; connection direction matters. Start nodes can connect to subsequent nodes but cannot accept incoming connections."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-create-a-dependency"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Create a dependency"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>{"To configure a simple sequence:"}</p>
                <ol className="space-y-2 pl-5 list-decimal" start={1}>
                  <li>
                    {"Confirm that both tasks belong to the current Routine."}
                  </li>
                  <li>
                    {
                      "Decide which task is the prerequisite and which depends on it."
                    }
                  </li>
                  <li>
                    {
                      "Use the add-dependency action or graph connection controls to connect the prerequisite to the dependent task."
                    }
                  </li>
                  <li>
                    {
                      "Check the direction and any cycle or validation messages."
                    }
                  </li>
                  <li>
                    {
                      "Check saving and synchronization to confirm that the change has completed, rather than merely appearing on the canvas."
                    }
                  </li>
                </ol>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-check-saving-and-sync"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Check saving and sync"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "A visible connection is not necessarily saved to the server. After adjusting nodes or connections, select Save in the toolbar and confirm success. Saving, local drafts, pending synchronization, and validation failures require different responses."
                  }
                </p>
                <p>
                  {
                    "For pending synchronization, check the connection and use the available retry action. For validation failures, correct relationships such as self-dependencies or cycles. Do not clear website data while an unsynchronized local draft remains."
                  }
                </p>
                <p>
                  {
                    "Reload, retry, reset, and export are different actions. Export provides a copy of the current graph data, rather than execution results. Do not assume reset reverses all previously submitted changes. Check the current state before using an action, especially when you only intend to adjust node positions."
                  }
                </p>
                <p>
                  {
                    "Removing a connection changes an ordering relationship; deleting a task affects a workflow step. Confirm which item you selected before proceeding."
                  }
                </p>
                <ArticleImage
                  src={media21}
                  alt="Inspecting nodes in an existing Routine graph and zooming and panning the canvas"
                  caption="GIF 03 — Routine dependencies"
                  width={1600}
                  height={1200}
                  animated
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-routine-task-payload-editor"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Routine task payload editor"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "A Payload supplies the data a task needs for its action. Creating a document requires a destination, name, and content; querying resources requires a target. Choose the purpose first, then configure its inputs rather than preparing JSON before deciding which task it belongs to."
              }
            </p>
            <ArticleSubParagraph
              id="website-use-a-form"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Use a form"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Some creation and update purposes have dedicated forms, including category, Block Pack, and Routine actions. Use them to select targets and enter data. Where a template editor is provided, configure the content to generate."
                  }
                </p>
                <p>
                  {
                    "Check a target's project as well as its name. Documents with identical names may be different resources. Valid fields alone do not confirm that you selected the intended target."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-use-json"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Use JSON"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Other purposes may provide a JSON editor. Follow the fields required by the chosen purpose rather than copying another task's inputs unchanged. Correct JSON syntax is only the first check; the target must exist, permissions must allow the action, and values must follow the relevant rules."
                  }
                </p>
                <p>
                  {
                    "Website forms and the public API may support different operations. Consult the API documentation for programmatic integration rather than assuming every website purpose is a public endpoint."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-confirm-and-save"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Confirm and save"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>{"Configure inputs in this order:"}</p>
                <ol className="space-y-2 pl-5 list-decimal" start={1}>
                  <li>
                    {"Select the task purpose and open its input editor."}
                  </li>
                  <li>{"Select or enter the correct target resources."}</li>
                  <li>
                    {
                      "Complete required content and review previews and validation messages."
                    }
                  </li>
                  <li>
                    {
                      "Confirm the input editor's content and return to the task form."
                    }
                  </li>
                  <li>
                    {
                      "Complete task creation or saving and check the final result."
                    }
                  </li>
                </ol>
                <p>
                  {
                    "Confirming the Payload editor does not necessarily save the whole task. Finish the outer task form as well. If you change the purpose, check whether the previous inputs still apply."
                  }
                </p>
                <p>
                  {
                    "Reopen the same task to review its saved inputs against the purpose and target. Use test data for shared examples rather than publishing Payloads that contain credentials or private content."
                  }
                </p>
                <ArticleVideo
                  src="https://www.youtube-nocookie.com/embed/CvWLjJelp9A?playsinline=1&rel=0"
                  href="https://youtu.be/CvWLjJelp9A"
                  title="Set Up a Document Creation Task"
                  caption="Video 06 — Set Up a Document Creation Task"
                />

                <p>
                  {"For scheduling and execution results, see "}
                  <ArticleLink href="#website-add-a-task-and-check-the-result">
                    {"Add a task and check the result"}
                  </ArticleLink>
                  {"."}
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph id="website-dialogs" level={2} separatorFullWidth>
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Dialogs"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "Dialogs are used to create resources, adjust settings, edit inputs, and confirm deletion. Check the title, target name, and scope before filling in fields."
              }
            </p>
            <p>{"The usual sequence is:"}</p>
            <ol className="space-y-2 pl-5 list-decimal" start={1}>
              <li>{"Open the dialog from the relevant resource's actions."}</li>
              <li>
                {
                  "Complete required fields and review format and validation messages."
                }
              </li>
              <li>
                {
                  "Submit once and wait for the result rather than repeatedly confirming."
                }
              </li>
              <li>
                {
                  "Return to the main view and check the new item or changed result."
                }
              </li>
            </ol>
            <p>
              {
                "Canceling or closing a dialog has different effects depending on the interface. Check for drafts or unsaved-change notices rather than assuming that closing always preserves content."
              }
            </p>
            <p>
              {
                "Deletion, leaving shared resources, transferring ownership, and resetting an account have different consequences. Read each confirmation. If confirmation text is required, understand the scope before entering it."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
    <ArticleSubParagraph id="website-settings" level={1} separatorFullWidth>
      <ArticleSubParagraphHeader as="h3" level={0} className="text-xl">
        {"Settings"}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p>
          {
            "Use account settings for personal details, sign-in methods, and keys. Use preferences for themes, display, editing behavior, and notifications."
          }
        </p>
        <p>
          {
            "Open them from the account or settings menu at the bottom of the Sidebar. Field names may vary with the interface language, but their purposes remain the same. Some preferences apply immediately; profile and other forms may require saving. Check the controls in the current section."
          }
        </p>
        <ArticleSubParagraph
          id="website-account-settings"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Account settings"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <ArticleSubParagraph
              id="website-profile-and-account-information"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Profile and account information"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-personal-profile"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Personal profile"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Edit the avatar, cover, biography, and other profile fields provided by the interface. Check the crop preview after selecting an image, save the form after changing text, and confirm the updated result."
                      }
                    </p>
                    <p>
                      {
                        "Not every field is required. Before sharing your screen or a screenshot, check for birthdays, locations, or personal details you do not want to disclose."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-account-identity"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Account identity"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Account information identifies the account and provides editable fields such as display name and status. A display name helps others recognize you; it is separate from the sign-in email address and resource ownership."
                      }
                    </p>
                    <p>
                      {
                        "Read-only fields help you identify the account rather than provide settings to edit manually. Use the appropriate account modification flow to change a sign-in email or password. Changing a display name does not change how you sign in."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph id="api-keys" level={3} separatorFullWidth>
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"API keys"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "You do not need an API key to use the website. Manage keys in "
                  }
                  <ArticleLink href="/app/setting/account#api-keys">
                    {"account settings"}
                  </ArticleLink>
                  {" when an external application or tool needs integration."}
                </p>
                <ArticleSubParagraph
                  id="website-create-a-key"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Create a key"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Decide the purpose and use a recognizable name, such as the application or environment that will use it. When the key is displayed, follow the instructions to copy it to trusted credential storage. Do not assume that the full value will remain available after closing the view."
                      }
                    </p>
                    <p>
                      {
                        "Keep it out of frontend code, URLs, public notes, and screenshots. An API key allows programmatic requests with your authority; it is not a document link to share with collaborators."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="api-key-management"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Review and revoke"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Check names and purposes before revoking unused keys. A program using a revoked key may stop working. For replacement, arrange the application's update rather than only deleting the old key on the website."
                      }
                    </p>
                    <p>
                      {
                        "If you suspect exposure, stop sharing the key and follow the "
                      }
                      <ArticleLink href="/document#quick-start">
                        {"API key guidance"}
                      </ArticleLink>
                      {
                        ". Describe the purpose and error in a support report without including the key itself."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-upgrade-and-quotas"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Upgrade and quotas"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Review plans, usage, and limits here. If creation reaches a limit, inspect current usage before deciding whether to remove unnecessary content or consider another plan."
                  }
                </p>
                <p>
                  {
                    "Storage, resource counts, and task execution usage are separate limits. Available storage does not mean every action is unlimited. Follow the message for the particular action and the information shown in your account."
                  }
                </p>
                <p>
                  {
                    "Check your account for current plans, entitlements, and available upgrade actions."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-security"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Security"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "To verify an email address, begin with the corresponding security action, obtain the code as directed, and enter it to confirm. Check which account or address the verification concerns so you do not mix codes from different flows."
                  }
                </p>
                <p>
                  {
                    "Enter verification codes only in a trusted verification view you opened intentionally. Do not send them to other people or include them in support reports. If sending is subject to a waiting period, wait before requesting another code."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-linked-sign-in-and-recovery-methods"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Linked sign-in and recovery methods"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This area covers linked sign-in methods and account contact or recovery information. Read the instructions for backup email addresses, phone numbers, and sign-in providers separately. Adding contact information does not create another account."
                  }
                </p>
                <p>
                  {
                    "Complete verification where a code is required; a filled field does not mean linking has succeeded. Linking a sign-in provider may open that service for confirmation. Check the selected identity before proceeding."
                  }
                </p>
                <p>
                  {
                    "Before changing sign-in methods, confirm that you can still access the same account afterward. Do not assume linking changes transfer projects, merge accounts, or revoke all existing access."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-account-modification"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Account modification"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "These actions can substantially change an account. Consider each separately:"
                  }
                </p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {
                      "Change email: affects account information or sign-in flows, rather than only the display name."
                    }
                  </li>
                  <li>
                    {
                      "Change password: start from a trusted page and complete the required verification."
                    }
                  </li>
                  <li>
                    {
                      "Reset account: may affect data and settings; read the scope of the specific action."
                    }
                  </li>
                  <li>
                    {
                      "Delete account: first confirm that you no longer need the account and its content, then address shared resources, important documents, and integrations."
                    }
                  </li>
                </ul>
                <p>
                  {
                    "Account reset and deletion are not routine fixes for display or loading issues. Save important work and consider effects on shared resources, collaborators, and integrations before proceeding. Do not assume recovery will be available afterward."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-preference-settings"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Preference settings"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {"Use "}
              <ArticleLink href="/app/setting/preferences">
                {"preferences"}
              </ArticleLink>
              {
                " to adjust how you use the website. These are mainly choices for the current browser, rather than changes for every collaborator. Do not expect all preferences to synchronize automatically to another browser."
              }
            </p>
            <ArticleSubParagraph
              id="website-appearance"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Appearance"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Adjust the theme, interface language, density, and motion according to your needs:"
                  }
                </p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {"For unsuitable colors or contrast, try another theme."}
                  </li>
                  <li>
                    {
                      "To change labels in buttons and menus, change the interface language. This does not translate your documents."
                    }
                  </li>
                  <li>
                    {
                      "To fit more information on screen, try a compact density; use a more spacious option if the view feels crowded."
                    }
                  </li>
                  <li>{"To limit animations, enable reduced motion."}</li>
                  <li>
                    {
                      "For subtle interaction responses, review the feedback options. Their effect also depends on device support."
                    }
                  </li>
                </ul>
                <ArticleImage
                  src={media22}
                  alt="Appearance preferences for theme, interface language, density, reduced motion, and interaction feedback"
                  caption="Image 20 — Appearance preferences"
                  width={1600}
                  height={1200}
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-dashboard-1"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Dashboard"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Choose whether to control Dashboard width manually. Automatic mode adapts to the current screen; consider manual control when you want a fixed wider or narrower arrangement."
                  }
                </p>
                <p>
                  {
                    "This differs from moving a Widget. Use this preference for the whole workspace width, and resize the individual tool on Dashboard when you want a larger clock."
                  }
                </p>
                <p>
                  {
                    "Before resetting Dashboard options, check whether the action affects local layouts or component content. Resetting preferences and deleting account documents are separate actions."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-editor"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Editor"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Editor preferences combine reading options and interaction tools. Open a test document and compare settings individually:"
                  }
                </p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    {
                      "Page width: choose a narrow, standard, or wider reading area. Try a narrower width if long paragraphs are hard to follow."
                    }
                  </li>
                  <li>
                    {
                      "Text size: adjust editor text on the current device for comfortable reading, rather than changing every paragraph into a heading."
                    }
                  </li>
                  <li>
                    {
                      "Word wrap: fit long lines to the available width rather than extending them horizontally."
                    }
                  </li>
                  <li>
                    {
                      "Spellcheck: use browser-provided checking, whose results depend on browser language and settings."
                    }
                  </li>
                  <li>
                    {
                      "Block drag handles: choose whether to show the controls used to move or manage Blocks."
                    }
                  </li>
                </ul>
                <ArticleImage
                  src={media23}
                  alt="Editor preferences for page width, text size, wrapping, spellcheck, and Block drag handles"
                  caption="Image 21 — Editor preferences"
                  width={1600}
                  height={1200}
                />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-offline-and-local-data"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Offline and local data"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-understand-local-storage"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Understand local storage"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "This area shows website storage usage reported by the browser, including cached documents, backgrounds, and attachments. It describes this browser's data, rather than account-wide cloud capacity or shared storage across devices."
                      }
                    </p>
                    <p>
                      {
                        "Local data, offline queues, and attachment caches control different things: retaining working data in the browser, queuing offline changes for reconnection, and keeping some attachments for later access. Enabling one does not make every feature available offline."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-reconnect-safely"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Reconnect safely"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "When returning after being offline, check for pending synchronization and errors before creating data again. Be especially careful with an action that was submitted but has not returned a result."
                      }
                    </p>
                    <p>
                      {
                        "Sharing, permission changes, and some management actions require server confirmation. A visible note does not mean every operation can complete offline."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-clean-up-carefully"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Clean up carefully"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Cleanup schedules and cache actions affect local data. First save important Dashboard content, check for unsynchronized changes, and read which data will be removed. Do not clear all website data as the first response to a loading problem."
                      }
                    </p>
                    <p>
                      {
                        "Review diagnostic data for private content before providing it to support. Downloaded data is not necessarily safe to publish or sufficient to restore the whole workspace."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-privacy"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Privacy"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <ArticleSubParagraph
                  id="website-start-page-and-previews"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Start page and previews"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Choose Dashboard or Routines as the start page according to your main work. Hiding preview titles reduces the note names shown in switchers and previews. Check the result before sharing your screen."
                      }
                    </p>
                    <p>
                      {
                        "This does not anonymize the whole website. Review the screen before recording or sharing to avoid exposing document text, members, or other private information."
                      }
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                <ArticleSubParagraph
                  id="website-clipboard-protection"
                  level={3}
                  separatorFullWidth
                >
                  <ArticleSubParagraphHeader
                    as="h6"
                    level={0}
                    className="text-base"
                  >
                    {"Clipboard protection"}
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent level={1}>
                    <p>
                      {
                        "Clipboard protection provides configurable matching rules for supported sensitive-text handling. Test a custom rule with sample text first. Correct invalid or duplicate rules according to the message shown."
                      }
                    </p>
                    <p>
                      {
                        "Reorder rules or remove unused entries as needed. This tool cannot guarantee detection of every secret and does not change account or document permissions. Review content before pasting into chats, public documents, or support reports. Check on-screen content separately when recording or sharing your screen."
                      }
                    </p>
                    <p>
                      {"See the "}
                      <ArticleLink href="/document#privacy-policy">
                        {"Privacy Policy"}
                      </ArticleLink>
                      {" and "}
                      <ArticleLink href="/eula">{"EULA"}</ArticleLink>
                      {" for data handling and terms of use."}
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-browser-permissions"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Browser permissions"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "This area shows browser permission states for listed capabilities such as notifications, clipboard access, persistent storage, and location. A listed capability does not mean every feature uses it."
                  }
                </p>
                <p>
                  {
                    "Allowed, denied, awaiting a prompt, and unavailable for querying are different states. If querying is unsupported, check browser support rather than repeatedly requesting access. You do not need to grant every permission to read notes."
                  }
                </p>
                <p>
                  {
                    "Grant permissions when you need the corresponding feature. After a denial, you may need to change the browser's site settings and refresh the displayed state. Browser permissions are separate from Root Shelf and Station membership permissions."
                  }
                </p>
                <p>
                  {
                    "Permission to retain browser data is not a substitute for backups. Clearing website data or losing a device may still affect local content."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-feedback"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Feedback"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "The feedback form provides categories for problems, feature requests, and other comments. Choose a type and write a short title. In the description, explain your goal, the steps you took, and what you observed."
                  }
                </p>
                <p>
                  {
                    "Wait for the submission result instead of selecting the same control repeatedly. If sending fails, preserve your text and follow the message. Reports include the current page location and basic browser environment information to help reproduce the issue. You do not need to add account credentials or every internal diagnostic detail."
                  }
                </p>
                <p>
                  {
                    "Before attaching images, hide private names, content, keys, and verification codes. Do not attach a whole private document or browser database simply to provide more information."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-notifications"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"Notifications"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Configure the desktop notifications, work reminders, and synchronization feedback provided by the interface separately. If a message is missing, first identify whether you expected an in-app message, temporary feedback, or a desktop notification that requires browser permission."
                  }
                </p>
                <p>
                  {
                    "Quiet hours have start and end times for periods when you want fewer interruptions. Check their range after editing; this does not change a Routine's schedule."
                  }
                </p>
                <p>
                  {
                    "A notification is a prompt, rather than proof of completion. Check the notification list or execution records for important work instead of concluding that nothing ran because no alert appeared."
                  }
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
            <ArticleSubParagraph
              id="website-about"
              level={3}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader
                as="h5"
                level={0}
                className="text-base"
              >
                {"About"}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent level={1}>
                <p>
                  {
                    "Review the displayed version information and the actions for copying or resetting preferences."
                  }
                </p>
                <p>
                  {
                    "Copying preferences places settings data on the clipboard; it does not export all notes, attachments, or Dashboard content. Review it before sending to support. Resetting changes personal options, so record settings you want to keep rather than using reset as a routine troubleshooting step."
                  }
                </p>
                <p>
                  {"See "}
                  <ArticleLink href="/document#versions">
                    {"Versions"}
                  </ArticleLink>
                  {" for feature changes and the "}
                  <ArticleLink href="/eula">{"EULA"}</ArticleLink>
                  {" for license terms."}
                </p>
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-full-page-and-sheet-presentation"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Full-page and sheet presentation"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "On supported screen sizes, the settings view can switch between a full page and a side sheet. Use a full page to review many settings, or a sheet for a small change while keeping the main work in view."
              }
            </p>
            <p>
              {
                "Complete any required form confirmation before switching presentation. Some settings apply immediately and others require saving; do not assume every section behaves the same way."
              }
            </p>
            <ArticleImage
              src={media24}
              alt="Switching preferences between a full page and side sheet, including theme and reading-width changes, and ending on the full page"
              caption="GIF 04 — Settings presentation switch"
              width={1600}
              height={1200}
              animated
            />
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
    <ArticleSubParagraph
      id="website-contact-support"
      level={1}
      separatorFullWidth
    >
      <ArticleSubParagraphHeader as="h3" level={0} className="text-xl">
        {"Contact & Support"}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <ArticleSubParagraph
          id="website-find-the-right-information"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Find the right information"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>{"Choose an entry point according to your goal:"}</p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                {
                  "For website operation, read the relevant interface or settings section in this guide."
                }
              </li>
              <li>
                {"For programmatic integration, see the "}
                <ArticleLink href="/document#gateway">
                  {"API documentation"}
                </ArticleLink>
                {" and "}
                <ArticleLink href="/document#quick-start">
                  {"API key guidance"}
                </ArticleLink>
                {"."}
              </li>
              <li>
                {"For released changes, see "}
                <ArticleLink href="/document#versions">
                  {"Versions"}
                </ArticleLink>
                {"."}
              </li>
              <li>
                {
                  "To report a problem or suggest a feature, use Report in the Sidebar or Feedback in preferences."
                }
              </li>
            </ul>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-before-reporting-a-problem"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Before reporting a problem"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>{"Begin with checks that preserve your data:"}</p>
            <ol className="space-y-2 pl-5 list-decimal" start={1}>
              <li>
                {
                  "Confirm the signed-in account, selected resource, and active filters."
                }
              </li>
              <li>
                {"Check connection, loading, and visible error messages."}
              </li>
              <li>
                {
                  "For access problems, ask a resource owner to check membership and roles."
                }
              </li>
              <li>
                {
                  "Record the time and the actions immediately before the issue."
                }
              </li>
              <li>
                {
                  "Preserve unsaved or unsynchronized content before taking further recovery steps."
                }
              </li>
            </ol>
            <p>
              {
                "Do not begin by clearing website data, resetting an account, or deleting a resource. These actions can remove local content and make the issue harder to investigate."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph
          id="website-a-useful-problem-report"
          level={2}
          separatorFullWidth
        >
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"A useful problem report"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <p>
              {
                "A report does not need to be highly technical. Explain how someone can reproduce the issue. For example, I cannot type after opening a particular document is more useful than It is broken. Use this template and fill in what you know:"
              }
            </p>
            <CodeExamplePanel
              code={{
                text: "Page or feature:\nWhat you were trying to do:\nExpected result:\nActual result:\nSteps to reproduce:\nBrowser and operating system:\nTime and timezone:\nOn-screen error message:\nScreenshot or recording with sensitive information hidden, if available:",
              }}
            />
            <p>
              {
                "Share only the information needed for investigation. Provide document URLs, resource identifiers, or file content only when necessary and through a trusted support channel. Do not include API keys, passwords, verification codes, session information, or private signed links."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
        <ArticleSubParagraph id="q-and-a" level={2} separatorFullWidth>
          <ArticleSubParagraphHeader as="h4" level={0} className="text-lg">
            {"Common situations"}
          </ArticleSubParagraphHeader>
          <ArticleSubParagraphContent level={1}>
            <ul className="space-y-2 pl-5 list-disc">
              <li>
                {
                  "Missing document: check the Root Shelf, collapsed categories, account permissions, and applicable Trash entries before creating a duplicate."
                }
              </li>
              <li>
                {
                  "Editor unavailable: check read-only access, loading state, and synchronization errors."
                }
              </li>
              <li>
                {
                  "Material preview unavailable: check the file type, connection, and loading result. If downloading is available, inspect the source in an appropriate application."
                }
              </li>
              <li>
                {
                  "Unexpected automation result: inspect the correct Routine and task execution records, including time range and inputs."
                }
              </li>
              <li>
                {
                  "Different layout in another browser: distinguish browser-local customization from shared account data; not every setting synchronizes."
                }
              </li>
              <li>
                {
                  "Unclear action result: inspect lists and status before retrying, particularly for creation, deletion, or other data-changing actions."
                }
              </li>
            </ul>
            <p>
              {
                "If these checks do not resolve the issue, report reproducible steps and appropriately redacted screenshots or recordings. You do not need to expose your entire private workspace."
              }
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  </>
);
export default WebsiteContent;
