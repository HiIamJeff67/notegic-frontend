# Website

> 本延伸工作草稿以 [website.md](website.md) 為基礎，並於 2026-10-16 對照前端原始碼進行檢視。原始大綱未經修改。本文件尚未接到公開的 Website 頁面，也不代表內容已可直接發布。
>
> **Editorial notes** 與最後的審查附錄是提供給作者的備註，不應呈現在公開頁面。原始碼中看得到某個控制項，不代表每項操作都已通過正式環境或後端驗證。未來功能描述的是專案擁有者提出的方向，不是已發布的功能，也不構成交付承諾。

## Editorial assessment

這份大綱的順序很合適：先介紹產品，再解釋概念、展示介面，最後涵蓋設定與支援。最主要的改善方向，是把元件清單轉化成協助使用者完成實際工作的指南。

- Explain what a user can accomplish before introducing every object or button.
- Separate the content hierarchy from the automation model. A Station is not simply another kind of shelf.
- Give each workflow an entry point, prerequisites, actions, expected result, and a short recovery path.
- Distinguish browser-local customization, pending changes, and account-backed content. Do not describe all of them as either universally synchronized or entirely local.
- Separate available functionality from the owner's development priorities. The existence of an interface, enum, or editor does not establish a released service guarantee.
- Keep Website documentation focused on the application. Authentication headers, endpoint schemas, and integration contracts belong in the separate API section.
- Prefer a small demonstration with a visible outcome over a long tour of controls without context.

以下保留原始大綱的五個主要分類，並補上首次使用流程、權限、資料安全、問題排查與發布前檢查。自動化項目的編號已修正，原文的「AL」則按上下文理解為「AI」。

## Beginning

### Demonstration

一開始應示範一項完整且常見的工作：建立工作空間、整理參考資料、撰寫結構化筆記，再透過側欄回到該筆記。示範應協助使用者理解介面與自身工作之間的關係。

以下是建議製作的媒體，並非目前已存在的素材：

1. **A short orientation video:** show the Dashboard, structured storage, a Block Pack, and the automation area. End with the saved result rather than a promotional screen.
2. **An annotated workspace screenshot:** identify the sidebar, content area, item path, and contextual actions. Use synthetic names and non-sensitive content.
3. **A note-taking walkthrough:** create a Root Shelf, add a Sub Shelf, open a Block Pack, and edit a few blocks.
4. **An automation walkthrough:** configure a small routine with a harmless task, then explain the difference between its definition and an execution record. Record this only after the complete execution workflow has been verified.
5. **Focused follow-up videos:** collaboration, file previews, dependency editing, and settings. Each should answer one question.

每支影片都應附上簡短的文字替代說明，描述操作與結果。螢幕截圖需要有意義的替代文字與圖說，不應要求使用者必須先看影片，才能找到必要的操作指引。

> **Editorial note:** 應展示所記錄版本中實際存在的控制項；示意圖則要明確標示為示意圖。媒體中不可暴露個人電子郵件地址、權杖、私人文件、通知內容或包含憑證的 URL，也不可讓佔位用影片看起來像是已可觀看的教學。

### Big picture

#### What can this app do?

Notegic 將結構化筆記、參考資料與可設定的自動化整合於同一個應用程式。Shelves 用來組織內容；Block Packs 承載可編輯的文件；Materials 提供參考資料；Stations 與 Routines 則用來組織自動化工作。

Website 指南說明如何透過應用程式使用這些功能。第三方開發者應透過 [API reference](/document#gateway) 了解支援的整合操作，而不是假設每項應用程式功能都有公開的 API 端點。

#### Why this app?

預期的工作流程是讓相關知識與可重複執行的工作保持連結。Notegic 不會將參考檔案、可編輯筆記與自動化定義視為可互換的物件，而是賦予它們各自明確的角色。

例如，研究工作空間可以包含參考用的 Materials，以及彙整這些資料的 Block Pack；另一方面，自動化工作空間則可以包含明確設定了任務與相依關係的 Routine。這些是內容組織方式的例子，並不代表應用程式會自動理解或處理每一份上傳的參考資料。

實際的好處是結構更加清晰：使用者能辨識資訊應放在哪裡、目前正在編輯哪份文件，以及正在變更哪一項自動化定義。

> **Editorial note:** 應透過實際示範的工作流程說明產品定位。避免在沒有佐證的情況下，宣稱產品比具名競爭對手更快、更安全、更重視隱私或功能更強。若沒有已發布版本的依據，不應把 AI 輔助、無人值守執行或所有功能皆可離線使用宣傳為現有能力。

#### How can we get started?

首次使用可依照以下流程：

1. Sign in and open the Dashboard.
2. Create a Root Shelf for a project or area of work.
3. Add a Sub Shelf to organize one topic within it.
4. Create a Block Pack and add a title, a paragraph, and a short list.
5. Add or open a reference Material through the available storage controls.
6. Use the sidebar and item path to return to the document.
7. Before closing the session, check any visible saving, connection, or synchronization feedback.

應先從整理內容開始，再進一步設定自動化。單純閱讀本指南或了解應用程式，不需要 API key；API keys 用於整合，不是登入的替代方式。

#### First-session expectations

成功的首次使用體驗，應讓使用者建立一套能理解的內容結構，以及一份之後能再次找到的文件，而不需要先設定所有偏好、建立自動化，或理解 API。

如果某項操作無法使用，應先檢查是否選取了正確的資源，以及目前帳號是否具備所需權限。不要為了繞過載入或同步問題而反覆重新建立相同內容。

### Future development

原始大綱列出以下可能的發展方向：

- AI and retrieval-augmented generation (RAG) in Routine Tasks.
- Model Context Protocol (MCP) and tool calling.
- Conversational AI and note assistance.
- Additional components for learning and research.

這些構想必須與已發布功能的操作說明分開。介紹未來功能時，應先說明希望為使用者帶來的成果，再引入實作相關術語。

例如，未來的 RAG 工作流程需要說明可檢索哪些資源、適用誰的存取權限，以及使用者如何檢視作為依據的參考資料。Tool calling 則需要清楚界定可執行哪些操作，以及何時需要確認。這些是未來文件應具備的說明，不是對目前應用程式能力的陳述。

> **Editorial note:** 專案擁有者將某個方向列入工作大綱，不代表已自動同意公開所有細節。只能發布明確核准放入公開 Versions 區塊的內容，不應自行補入交付日期、供應商名稱、定價、隱私保證，或尚未公布的產品／平台規劃。

### Currently working on

專案擁有者目前提出的優先方向，是與 AI／RAG 相關的 Routine Tasks，以及既有功能的改善。僅憑前端檢視，無法確認這些工作的發布狀態或完成百分比。

若要發布本節，應保持簡短，並連結至已核准的 [Versions section](/document#versions)。避免另外維護一份可能與其矛盾的詳細路線圖。功能正式發布並完成文件說明之前，使用者應以文件中標示為目前可用的流程為準。

## Component

### Structured storage

內容模型區分了組織結構、可編輯文件與參考檔案：

```text
Root Shelf
└─ Sub Shelves
   ├─ Block Packs
   │  └─ Blocks
   └─ Materials
```

這是概念上的示例，不代表每種物件都能放在任何層級。最終操作說明應展示應用程式實際提供的建立與移動控制項。

#### Root Shelf

Root Shelf 是相關內容及其成員資格或存取權限範圍的最上層邊界。當不同專案或群組需要不同的擁有權與存取安排時，應使用不同的 Root Shelves。

應為 Root Shelf 取一個能讓協作者清楚理解用途的名稱。分享內容前，應檢查內容所屬 Root Shelf 的成員與權限，而不是假設只要取得文件連結就能存取。

#### Sub Shelf

Sub Shelf 用來整理 Root Shelf 內的內容，可以依主題、工作階段或參考資料集合進行分組，而不必建立另一個最上層工作空間邊界。

應透過畫面上的階層結構與項目路徑，確認項目所屬位置。除非應用程式明確支援，否則不應將階層內的項目移動描述為建立獨立的權限邊界。

#### Block Pack

Block Pack 是由有序 Blocks 組成的可編輯文件，用於撰寫與編排筆記，而不只是檔案附件。

研究摘要、專案筆記，或其他適合以結構化內容呈現的文件，都可以使用 Block Pack。應調整名稱，讓使用者能在側欄辨識其用途；邀請他人共同編輯前，也應先確認其所屬的 Root Shelf。

#### Material

Material 是附有中繼資料，並依支援類型提供相應預覽的參考檔案。原始文件、圖片、音訊、影片，以及其他應與可編輯筆記分開保存的參考資料，都可以使用 Materials。

Material 的預覽不等同於可編輯的 Block Pack。上傳檔案不代表該檔案會被轉換為可編輯的 Blocks、由 AI 建立索引，或透過公開 API 提供存取。

#### Block

Block 是 Block Pack 內的內容單位。不同類型的 Blocks 支援不同的撰寫與呈現方式。介紹特殊內容類型之前，應先用簡短的編輯範例說明常見 Blocks。

> **Editorial note:** 原始儲存項目清單沒有列出 Blocks，但若要說明以 Blocks 為基礎的編輯器，就需要補上這個概念。在概念模型中，應將其放在 Block Packs 之下，而不是與 Root Shelves 並列為另一種工作空間邊界。

### Automation

自動化模型關注的是工作的執行，而不是 Shelves 的巢狀結構：

```text
Station → Routines → Routine Tasks
                        └─ Task dependencies

Routine definitions → Routine execution records
Task definitions    → Task execution records
Routine Tags        → Labels associated with routines
```

#### Station

Station 提供組織自動化相關資源與存取權限的範圍。檢視或變更 Routines 之前，應先選取對應的 Station。

Station 的存取權限應與 Root Shelf 的存取權限分開說明，不應讓使用者以為開啟某個 Shelf，就會自動取得管理其他無關 Station 的權限。

#### Routine

Routine 定義可重複執行的工作流程及其排程設定，並不等同於該流程的某一次執行。

啟用或變更 Routine 前，應檢查其任務、相依關係、目標資源，以及介面提供的排程欄位。應透過執行紀錄確認實際執行情況，而不是只根據定義就推定執行成功。

> **Verify before publishing:** 應確認支援的排程形式、顯示時區、排程變更後的行為，以及停用或暫停 Routine 時的行為。僅憑前端存在相關介面，無法證明瀏覽器關閉後是否仍會繼續執行。

#### Routine Task

Routine Task 描述 Routine 內的一項操作；purpose 用來識別操作類型，payload 則提供所需的輸入資料。

學習時應使用規模小且不具破壞性的任務，並在儲存前確認目標資源與 payload。任務定義、一次執行嘗試與成功結果，是不同的概念。

#### Routine Task dependencies

相依關係用來表達任務之間的順序。在目前的圖形表示中，從任務 A 指向任務 B 的箭頭，表示 A 是前置任務，B 是依賴 A 的任務。

相依關係不應形成循環，也不應連接不同 Routines 中互不相關的任務。畫面上畫出一條連線，本身不代表關係已儲存，也不代表任務已執行。

> **Verify before publishing:** 應記錄服務在失敗、重試、取消或跳過前置任務時的實際行為，不應僅根據圖形外觀推論這些執行保證。

#### Routine Tag

Routine Tags 是用來組織與尋找 Routines 的標籤。Tag 不是任務，本身也不會排程或執行工作。

應說明移除標籤關聯與刪除 Routine 之間的差別，並且只介紹所記錄版本中實際存在的篩選或管理控制項。

### Future (not implemented)

Learning Cards、Exams 與其他學習／研究元件，是原始大綱中的構想，不屬於本草稿所說明的現有可用元件。

任何經核准可公開提及的內容，都應集中在 Versions 區塊。不要為這些構想編造建立步驟、評量行為、評分承諾或資料流程。

## User Interface

### Dashboard

Dashboard 是可自行設定的起始頁面。其版面配置與 Widgets 協助使用者安排個人工作介面，不應與側欄中的內容階層混為一談。

#### Header background image

使用介面提供的圖片控制項選擇或調整頁首背景。文件應說明畫面上的選取、裁切／位置調整控制項，以及確認操作。

Dashboard 的自訂內容儲存於目前瀏覽器，不應暗示上傳的背景或版面配置會隨帳號自動同步至其他瀏覽器或裝置。清除網站資料可能會移除本機的自訂設定。

#### Widgets

進入介面提供的版面編輯模式後，新增 Widget，並在允許的網格範圍內移動或調整大小，最後確認版面配置。應說明如何返回一般操作模式，以免使用者在使用 Widget 時意外移動它。

前端登錄的 Widgets 包含時鐘、計時器、待辦事項、行事曆、Scratch Pad 與指南相關元件。對於該版本實際開放的每一種 Widget，應說明其用途、可編輯欄位、儲存行為與尺寸限制。

不應將本機的 Widget 內容與版面配置描述為帳號文件的備份。Scratch Pad 或待辦事項 Widget，也不等同於可以直接互換的 Block Pack 或 Routine Task。

#### Other interactive UI components

應區分版面控制、Widget 本身的操作、情境選單與通知；對於會儲存資料的操作，也應展示載入中與確認結果的狀態。

在窄螢幕下，應示範如何開啟側欄並找到主要控制項，而不依賴桌面版配置。若密度與動態效果設定會明顯改變呈現方式，也應加以說明。

> **Editorial note:** 大綱中的「Local storage」，在公開文案中應改成「儲存在此瀏覽器」。避免公開儲存鍵值、資料庫資料表，或與特定實作有關的持久化操作指引。

### Sidebar

#### Structured storage area

展開 Shelf 的階層結構，尋找 Sub Shelf、Block Pack 或 Material。應搭配項目的圖示與名稱辨識其類型。只有在目前選單確實提供相關操作，且使用者具備權限時，才介紹建立、重新命名、移動或刪除功能。

#### Automation area

Stations、Routines 與 Routine Tags 屬於自動化模型，其導覽方式應與巢狀 Shelves 分開說明。

> **Editorial note:** Automation 之下原本的「Nested shelves structured」，應改為 Station／Routine 的導覽模型。Shelf 的巢狀結構屬於結構化儲存的範疇。

#### Document, Trash, and Report area

- **Document** opens the unified Website and API documentation. There is no separate tutorial page or tutorial redirect.
- **Trash** presents deleted entries with the search and resource-type filters available in the interface.
- **Report** provides an entry point for product feedback or a problem report; explain the submitted information before asking users to send it.

目前檢視到的 Trash 頁面是搜尋／列表介面，無法據此確認已有還原或永久刪除流程。不要發布尚未驗證的還原按鈕、保留期間或相關保證。

#### User information

應說明目前帳號身分顯示在哪裡，以及如何辨識當前登入的帳號。不要讓使用者以為變更顯示名稱會轉移擁有權或變更權限。

#### Settings and logout

Account 與 Preferences 設定可採完整頁面或 Sheet 的形式呈現。此處先介紹呈現方式的選擇，詳細說明則保留在 Settings 區塊。

登出前，應檢查畫面上待處理變更或同步狀態的提示。不要宣稱登出會上傳所有尚未同步的工作，也不要保證會刪除瀏覽器中的每一份本機副本。

#### Notification

透過通知控制項查看應用程式內訊息、檢視詳細內容，並區分已讀與未讀項目。目前前端包含通知讀取、未讀數量、詳細檢視與已讀狀態操作，不只是空的鈴鐺圖示。

應說明無通知、載入中與載入失敗的狀態。如果已讀狀態無法儲存，應提醒使用者再次確認，而不是把暫時的畫面變化當成伺服器已確認更新。

應用程式內通知、暫時性的 Toast 訊息與瀏覽器通知，是不同的管道。取得瀏覽器權限，不代表支援電子郵件、推播傳送，或保證背景通知一定送達。

### Block pack editor

#### Block-based editor introduction

從儲存階層中開啟 Block Pack，新增與編輯其插入選單提供的 Block 類型，並使用現有的 Block 控制項編排內容。

先從標題、段落與清單開始，再透過以任務為導向的範例介紹特殊內容。應區分文件內容的變更，以及編輯器寬度、字體大小等本機顯示偏好設定。

#### Sharing and collaborating

透過參與者／存取控制項，了解文件的協作範圍。分享連結前，應確認預期的協作者已透過文件所屬的 Root Shelf 取得存取權限。

單純開啟連結不會自行授予存取權。如果其他使用者無法開啟或編輯文件，應檢查帳號、Root Shelf 成員資格、指派角色與連線狀態，而不是反覆傳送相同連結。

#### Permission and access control

應依資源實際支援的角色，說明各自可執行的操作，並區分檢視、編輯、成員管理與擁有權轉移。Root Shelf 與 Station 的權限不能被描述成可互換的同一套角色系統。

唯讀編輯器是一種合理狀態，不一定代表故障。應說明如何向資源擁有者或有權限的管理員申請所需存取權。

> **Verify before publishing:** 應對照目前介面行為與正式合約，確認確切角色名稱及允許的操作。不要僅憑協作控制項，就承諾支援公開匿名分享、多人離線編輯後的合併，或端對端加密。

#### Topbar buttons

應說明標題／中繼資料控制項、參與者控制項、匯入選單與匯出選單。辨識截圖中只有圖示的按鈕時，應使用其工具提示或無障礙標籤。

目前匯出選單提供 Markdown、HTML、純文字、JSON、PDF 與 DOCX。這只能確認選單提供這些選項，不代表可無損轉換，也不代表所有 Block 類型的輸出都完全一致。應提醒使用者先檢查匯出結果，再將其用於封存或傳送給他人。

匯入說明需要提供已驗證的支援格式清單，並明確說明匯入內容是追加至既有內容，還是取代原有內容。不要假設每種可匯出的格式都能匯入。

#### Item path

透過項目路徑辨識所屬 Shelf，並在階層內導覽。清楚可讀的路徑有助於區分名稱相似的文件，不應將路徑標籤描述為分享權限或備份位置。

#### Connection and saving feedback

應說明畫面上可見的載入中、唯讀、同步錯誤與重新同步狀態。遇到同步警告時，不要把反覆重新載入、清除網站資料或建立重複副本當成第一個處理步驟。

若需要復原，應盡可能透過現有且安全的匯出方式保留目前工作，再依編輯器實際提供的操作處理。將重新同步推薦為通用解法前，應先說明它會造成的影響。

### Material viewer

#### File holder introduction

Material viewer 會依檔案類型，以適合的預覽方式顯示已儲存的參考資料。檔案中繼資料、能否提供預覽，以及檔案內容是不同的事情：看得到檔名，不保證能成功載入預覽。

#### Supported file types

目前檢視到的預覽類型判斷涵蓋以下格式：

| Preview | Types handled by the frontend |
| --- | --- |
| Image | PNG, JPG/JPEG, GIF, SVG, WebP |
| Video | MP4, WebM |
| Audio | MP3 |
| Document | PDF |
| Text | JSON, Markdown, plain text, HTML |

文字預覽顯示的是文字內容；支援 HTML 不代表提供可執行的託管網頁，目前的 Markdown 預覽也不代表會呈現格式化的 Markdown。瀏覽器對編解碼器的支援，以及檔案內容是否有效，仍可能影響媒體播放。

不支援預覽或預覽失敗，不一定代表檔案損壞。若介面提供下載操作且權限允許，可以下載檔案。不要承諾提供可編輯的 Office 文件預覽，或所有媒體格式之間的通用轉換。

#### Topbar buttons and item path

應說明目前選取的 Material 實際提供哪些中繼資料與檔案操作，並透過項目路徑辨識其在儲存階層中的位置。檔案操作與編輯器的匯入操作必須清楚區分。

> **Verify before publishing:** 支援預覽不等同於允許上傳。應使用具代表性的檔案，確認上傳限制、檔案下載行為，以及各瀏覽器可能存在的限制。

### Routine overviewer

Routine overview 整合了定義、排程資訊、圖表與執行紀錄。說明時應先交代目前選取的 Station 與篩選範圍，讓使用者理解每個數量、資料列與圖表代表什麼。

#### Header background image

應將背景編輯控制項與自動化設定分開說明。變更背景屬於外觀自訂，不會因此變更 Routine 或其排程。

#### Time rail

透過 Time rail 檢視其呈現的排程資訊。應說明畫面上的時間範圍、時區，以及計畫中的排程位置與已完成執行之間的差別。

不要將排程項目描述為工作已成功執行的證明。實際結果應以執行紀錄為準。

#### Charts

解讀圖表前，應先說明所選範圍、指標與時間區間。若介面提供圖表選擇或版面控制項，應示範如何新增、變更或移除圖表，同時避免讓使用者以為這些操作會改變底層的自動化設定。

空白圖表可能是所選範圍、沒有符合條件的紀錄，或載入失敗所致，不應直接解讀為完全沒有活動。

#### Routine table

Routine table 列出工作流程的定義。應先說明可見欄位與資料列操作，再示範如何選取 Routine 進行檢視或管理。定義本身的狀態，不能與其最近一次執行的結果混為一談。

#### Routine execution record table

Routine records 描述各次執行嘗試。應說明畫面上的狀態與時間欄位，以及使用者如何檢視某次執行。說明編輯操作時，也應在概念上區分定義與過去的執行紀錄。

#### Routine task table

任務表格呈現所選範圍內已設定的步驟。應說明任務 purpose、可編輯的輸入、相依關係，以及開啟 Inspector 或 Payload editor 的控制項。

#### Routine task record table

Task records 描述個別的執行嘗試，應用來調查特定結果，而不是當作可編輯的任務定義替代品。

> **Verify before publishing:** 紀錄保留期間、更新行為、確切狀態含義、重試次數的計算方式、排程保證與配額計算，都需要由產品／服務的權責來源確認。不要發布猜測的公式或內部診斷細節。

### Inspector

Inspector 呈現目前選取的資源及其可用操作，但它不是另一個儲存容器。介紹欄位前，應先說明目前選取的是哪一種資源。

- **Station:** identity, visible membership/access information, and available Station actions.
- **Routine:** workflow definition, schedule controls, and available lifecycle actions.
- **Routine Task:** purpose, payload entry point, dependencies, and the editable properties exposed by the form.
- **Routine Tag:** label information and the association or management actions actually offered.

每種 Inspector 都應區分可編輯的值與唯讀資訊，並說明確認操作，以及使用者如何得知變更已成功。不要指示使用者修改唯讀識別碼來解決問題。

### Routine task graph dependency editor

選取 Routine，並透過介面提供的操作開啟相依關係編輯器。新增或移除連線前，應先檢查現有任務。

1. Identify the preceding task and the dependent task.
2. Create or adjust a connection using the graph's controls.
3. Review any validation feedback, including cycles or invalid task relationships.
4. Apply or synchronize the change through the available save action.
5. Confirm the resulting relationship before relying on the next execution.

前端有處理本機相依關係草稿的機制。本機草稿不應被描述成已由伺服器確認的相依關係。應說明等待儲存與儲存失敗的提示；當草稿可能是唯一剩餘副本時，不要建議清除瀏覽器資料。

> **Editorial note:** 應以一張附註解的截圖，呈現實際工具列標籤、儲存流程與連線方向。在把這些以操作意圖為主的描述改成精確的按鈕指示之前，應先對照已部署的介面驗證完整流程。

### Routine task payload editor

Payload editor 用來設定任務所選 purpose 的輸入。部分 purpose 提供結構化表單，其餘則使用 JSON 編輯器。看得到編輯器，不代表服務會接受所有可能的操作或 payload。

儲存前，應確認任務 purpose、目標資源與必填欄位。如果輸入 JSON，應遵循編輯器提供的格式與驗證提示。用於分享或支援的範例，不應包含機密或敏感內容。

變更 purpose 可能會改變預期的 payload 結構。應重新檢查輸入，不要假設原本的 payload 仍然有效。若介面提供範本或動態值，應根據已驗證的行為，說明支援的語法、預覽行為與求值時機，而不是自行編造範例。

學習時應使用不會造成損害的範例資源。對於會變更或刪除內容的自動化，應給予與手動執行同類操作相同程度的注意。

### Dialogs

對話框應依使用者的操作意圖來說明，而不是列成一份鉅細靡遺的實作元件目錄：

- Creating a shelf, Station, Routine, task, tag, or widget.
- Renaming or editing an existing resource.
- Managing membership or access where authorized.
- Selecting a reference, configuring a payload, or editing dependencies.
- Importing/exporting content through offered controls.
- Reporting feedback and reviewing notification details.
- Confirming deletion, account reset, or other sensitive actions.

每個已記錄的流程，都應展示入口、必填欄位、驗證訊息、等待處理狀態、確認結果，以及 Cancel 的影響。不要假設每個編輯器在對話框關閉時，都會捨棄本機草稿。

破壞性操作在視覺與文字上都應與一般變更明確區分。確認對話框應說明影響範圍；文件所承諾的復原能力，不能超過產品實際提供的能力。

## Settings

### Account settings

Account settings 涵蓋帳號身分、存取與敏感操作，與用來自訂瀏覽器顯示方式的偏好設定不同。

#### Profile and account information

應說明使用者看到的可編輯個人資料欄位與唯讀帳號資訊。變更個人資料不等於轉移共享資源的擁有權。

#### API keys

進行整合時，應參考 [API key instructions](/document#quick-start)。建立具有名稱的 Key，在密鑰顯示時複製，並儲存於可信任的伺服器或 CLI 密鑰管理工具。可透過現有的 Key 管理控制項檢視與撤銷 Keys。

不要將 Key 放入前端程式碼、公開截圖、瀏覽器 URL 或支援工單。撤銷 Key 可能影響仍使用它的整合，應有計畫地更新這些整合。

#### Upgrade and quota information

只應說明目前帳號實際可用的方案、使用量與操作。畫面上出現 Upgrade 區塊，不代表已提供結帳、付款變更、退款，或特定額度的配額提升。

> **Verify before publishing:** 應確認方案名稱、價格、計費行為、可用權益上限，以及升級控制項是否啟用。與其重複記錄可能過時的數值，更適合連結至已核准的產品資訊。

#### Security and linked sign-in methods

應說明目前介面提供的安全控制與帳號連結選項，並描述敏感操作需要的驗證碼確認或其他額外驗證。

未確認控制項的確切影響範圍前，不要宣稱它會變更所有使用中的工作階段、撤銷所有整合用 Keys，或提供特定的身分驗證保證。

#### Account modification and destructive operations

帳號重設、電子郵件／密碼變更與帳號刪除，需要分別說明。每項可用操作都應交代會變更什麼、保留或移除什麼、需要何種驗證，以及可能影響哪些協作者或整合。

不要建議以帳號重設來排查一般介面問題。應使用明確警告，並在發布逐步操作說明前，先取得對刪除／復原行為的正式確認。

### Preference settings

Preferences 用於自訂介面與瀏覽器行為。應說明各組設定的保存範圍，而不是承諾每項偏好都會隨帳號在不同瀏覽器之間同步。

#### Appearance

應說明可用的主題、密度、字體排版與動態效果選項，並清楚表達這些偏好改變的是呈現方式，而不是共享資源的權限或內容。

#### Dashboard

應說明 Dashboard 的自訂選項，包括版面配置與瀏覽器本機內容的保存方式，並區分重設 Dashboard 偏好與刪除帳號筆記的差別。

#### Editor

應說明可用的編輯器寬度、字體大小、自動換行、拼字檢查與 Block 操作把手偏好。顯示方式的變更，不會將文件轉換成另一種內容格式。

#### Offline and local data

應說明哪些內容可保留在本機、哪些提示表示仍有待處理的工作，以及哪些操作需要連線。不要承諾所有應用程式或自動化功能都能離線使用。

清除網站資料、重設本機狀態或使用復原操作之前，應先檢查待處理變更，並透過適當且可用的匯出方式保留重要工作。本機診斷資料／資料庫下載可能包含敏感內容，也不一定是可攜或完整的備份。

#### Privacy

應說明實際存在的控制項，並連結至已核准的 [Privacy and policy](/document#privacy-policy) 與 [EULA](/eula)。不要在 Website 指南中額外加入安全性、資料保留或加密方面的承諾。

#### Browser permissions

應說明應用程式請求的權限，以及拒絕權限會如何影響相關功能。瀏覽器權限設定與 Root Shelf 成員資格、Station 權限是不同的事情。

#### Feedback

應說明如何提交實用且已遮蔽敏感資訊的回報。不要預設要求使用者附上原始瀏覽器資料庫、工作階段資訊或私人文件。

#### Notifications

應區分應用程式內通知偏好、瀏覽器權限與暫時性的 Toast 訊息，並且只記錄已驗證的傳送管道與設定。

#### About

應說明使用者可在哪裡找到現有的產品／版本與授權資訊。版本歷史應保留在 Versions 區塊，而不是複製到多個設定說明中。

### Full-page and sheet presentation

設定可以完整頁面或 Sheet 呈現，但呈現方式不應讓使用者以為，相同帳號操作會因開啟位置不同而有不同意義。

應記錄使用者如何切換呈現模式並返回原本工作，也應明確說明特定表單是立即儲存、需要確認，還是會保留未完成草稿；不要將單一表單的行為套用到所有設定。

## Contact & Support

### Find the right information

- Use Website documentation for application workflows.
- Use the API section for integration contracts and request/response questions.
- Use Versions for approved release changes and future direction.
- Use the application's Contact or Report entry points for questions or a reproducible problem.

不要發布未經核准的回覆時間承諾或支援管道。

### Before reporting a problem

1. Note the affected screen, resource type, and visible error message.
2. Check the selected account/resource and whether the action requires different access.
3. Check connectivity and visible pending/synchronization state.
4. Record a short reproduction using non-sensitive example content where possible.
5. Avoid repeatedly submitting an action whose result is uncertain, especially if it creates, changes, or deletes content.

不要把清除瀏覽器資料、重設帳號或刪除資源當成例行的第一步排查方式。這些操作可能移除僅存在本機的工作，或破壞有用的問題證據。

### A useful problem report

```text
Screen or workflow:
What I expected:
What happened:
Steps to reproduce:
Browser and operating system:
Approximate time and timezone:
Visible error text:
Redacted screenshot or short recording, if useful:
```

只有在支援管道可信任且資訊確有必要時，才提供文件 URL 或資源識別碼。應移除私人名稱、檔案內容、API keys、驗證碼、工作階段資料與帶簽章的下載連結。

### Common situations

- **A resource cannot be found:** check its location, selected scope, account, and access. Check Trash where applicable without assuming restoration is available.
- **An editor is read-only:** check access and the current loading/connection state before treating it as a broken editor.
- **A Material cannot be previewed:** check the documented preview types, connection, and any available authorized download action.
- **An automation result is unexpected:** inspect the correct Routine and task execution records, not only the current definition or a chart.
- **Local customization differs in another browser:** browser-local settings and widgets should not be assumed to synchronize automatically.
- **A save or synchronization state is uncertain:** avoid duplicate submissions and preserve local work before attempting a destructive recovery action.

## Editorial review and publication checklist

本節不是公開 Website 文案，而是記錄將延伸大綱整理成準確、易於維護的指南所需完成的工作。

### Priority gaps to close

1. **First-session clarity:** verify the exact create/open actions and make one short example the primary onboarding path.
2. **Storage boundaries:** identify which preferences, backgrounds, widgets, drafts, and content are browser-local or account-backed without exposing internal schemas.
3. **Permission matrix:** confirm resource-specific role names and actions; distinguish Root Shelf access from Station access.
4. **Automation semantics:** verify scheduling, timezones, lifecycle actions, records, retries, and usage calculations with the authoritative service contract.
5. **Potentially misleading controls:** review Trash recovery, upgrade/payment controls, security options, and any disabled or placeholder UI before describing complete workflows.
6. **Publication scope:** obtain approval for each future-facing feature. Keep unannounced plans and internal technical work out of public copy.

### Release checks

- [ ] Complete the first-session workflow against the release being documented.
- [ ] Verify critical workflows with both editable and read-only access where applicable.
- [ ] Confirm preview types using representative files, including a failed/unsupported preview.
- [ ] Verify import and export behavior rather than relying only on menu entries.
- [ ] Confirm which local data survives reload and which data is lost by clearing site storage.
- [ ] Verify graph draft/save/recovery feedback with a harmless example Routine.
- [ ] Confirm actual settings labels and disabled-state explanations.
- [ ] Approve future-feature wording and remove unapproved roadmap details.
- [ ] Replace media proposals with reviewed assets, captions, and text alternatives.
- [ ] Check narrow viewports, keyboard access, readable contrast, and layout zoom.
- [ ] Check all document links and ensure no entry opens the removed tutorial page.
- [ ] Remove editorial notes and source-review links from public rendering.

### Frontend evidence used for this draft

以下連結是供作者審查的參考資料，不是公開操作說明，也不是已部署服務行為的證明：

- [Website composition](../../apps/web/src/pages/document/Website.tsx) and [current Website sections](../../apps/web/src/pages/document/website/).
- [Application sidebar](../../apps/web/src/components/sidebar/AppSidebar/AppSidebar.tsx).
- [Dashboard](../../apps/web/src/pages/app/dashboard/DashboardPage.tsx), [widget registry](../../apps/web/src/components/widgets/basic/basic.ts), and [widget persistence conventions](../conventions/09-widgets.md).
- [Block Pack editor](../../apps/web/src/components/core/BlockPackEditor/BlockPackEditorContent.tsx).
- [Material preview dispatch](../../apps/web/src/components/core/MaterialViewer/MaterialViewer.tsx) and [text preview behavior](../../apps/web/src/components/core/MaterialViewer/MaterialTextViewerContent.tsx).
- [Routine overview](../../apps/web/src/components/core/RoutineOverviewer/RoutineOverviewerContent.tsx) and [scope controls](../../apps/web/src/components/core/RoutineOverviewer/RoutineScopeBar/RoutineScopeBar.tsx).
- [Dependency graph](../../apps/web/src/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor.tsx) and [payload editor selection](../../apps/web/src/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/RoutineTaskPayloadEditor.tsx).
- [Notification panel](../../apps/web/src/components/popovers/NotificationPopover.tsx).
- [Account settings](../../apps/web/src/pages/app/setting/account/AccountSettingsPage.tsx) and [preference settings](../../apps/web/src/pages/app/setting/preferences/PreferencesPage.tsx).
- [Current Trash interface](../../apps/web/src/pages/app/trash/TrashPage.tsx).

### Preparing the reviewed Markdown for Article

本草稿沒有實作 Markdown 匯入系統。首次發布時，可使用現有的 Article 元件手動組合已審查的內容；若更新變得頻繁，再依相同內容結構加入建置階段的轉換流程。

- Treat the initial `# Website` as document metadata/the Website title, not a second page-level heading inside the existing Document page.
- Map `##` groups and deeper headings to the Article section tree, with meaningful HTML heading levels rather than only different font sizes.
- Generate stable, unique anchors and sidebar entries from the same section tree. Keep Website anchors distinct from API anchors.
- Preserve paragraph, list, table, inline-code, and fenced-code semantics. Do not interpret code examples as markup.
- Publish images and videos from approved, accessible asset locations; do not rely on raw links into a private repository.
- Define a video notation before conversion. Require controls, captions or a text alternative, and avoid autoplay that carries essential information.
- Validate link and media URLs. Raw scripts, arbitrary HTML, and unrestricted embeds must not become an execution path.
- Exclude editorial sections deliberately before publication. Do not rely on their names or visual styling to keep internal review notes private.
- Keep Website content independent of the API contract generator and backend implementation documents.
