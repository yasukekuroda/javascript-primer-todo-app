# todo-app-javascript

[Todoアプリ · JavaScript Primer](https://jsprimer.net/use-case/todoapp/) を元に、MVCアーキテクチャで実装したTodoアプリケーションです。

## アーキテクチャ設計
### Model
Modelはアプリケーションのデータとその状態を管理します。以下の2つのクラスで構成されています。

- `TodoItemModel`
  - 個々のTodoアイテムを表現するクラスです。
  - Todoアイテムの状態（例: タイトル、完了状態）を保持します。

- `TodoListModel`
  - Todoアイテムのリストを管理するクラスです。
  - Todoアイテムの追加、削除、更新などの操作を提供します。
  - `EventEmitter`を継承しており、状態の変更を通知する仕組みを持っています。

### View
- `TodoItemView`
  - 単一のTodoアイテムを描画するためのクラスです。

- `TodoListView`
  - Todoリスト全体を描画するためのクラスです。
  - 各Todoアイテムを描画し、リスト全体を管理します。

- `html-util.js`
  - DOM操作を簡略化するためのユーティリティ関数を提供します。


### Controller

`App`クラスがコントローラとして機能します。以下の役割を持ちます。

- Controllerがユーザー操作(Todo追加、更新、削除)を検知し、Model更新を指示します。
- ControllerがModelの変更イベントを検知し、View再構築(Todoの画面表示)を指示します。

### ファイル構成
```
index.html           # アプリケーションのHTML
index.js             # エントリーポイント
src/
  App.js             # コントローラ
  EventEmitter.js    # イベント通知の仕組み
  model/
    TodoItemModel.js # TodoアイテムのModel
    TodoListModel.js # TodoリストのModel
  view/
    html-util.js     # DOM操作ユーティリティ
    TodoItemView.js  # TodoアイテムのView
    TodoListView.js  # TodoリストのView
```

### UML図

```mermaid
classDiagram
    direction TB

    %% Entry Point
    class Index_js {
        <<Entry Point>>
    }

    %% Controller / Mediator
    class App {
        -todoListModel: TodoListModel
        -todoListView: TodoListView
        +mount()
        +unmount()
        -#handleAdd(title)
        -#handleUpdate(id, completed)
        -#handleDelete(id)
        -#handleChange()
    }

    %% Models
    class EventEmitter {
        -listeners: Set
        +addEventListener(type, listener)
        +emit(type, data)
        +removeEventListener(type, listener)
    }

    class TodoListModel {
        -items: TodoItemModel[]
        +getTodoItems()
        +getTotalCount()
        +addTodo(item)
        +updateTodo(id, completed)
        +deleteTodo(id)
        +onChange(listener)
    }

    class TodoItemModel {
        +id: number
        +title: string
        +completed: boolean
    }

    %% Views
    class TodoListView {
        +createListElement(todoItems, callbacks)
    }

    class TodoItemView {
        +createItemElement(todoItem, callbacks)
    }

    %% Utilities
    class html_util {
        <<Utility>>
        +element(strings)
        +render(element, container)
    }

    %% Relationships
    Index_js ..> App : instantiates & mounts
    App *-- TodoListModel : manages state
    App *-- TodoListView : manages rendering
    TodoListModel --|> EventEmitter : inherits
    TodoListModel "1" *-- "many" TodoItemModel : contains
    TodoListView ..> TodoItemView : uses
    App ..> html_util : uses for DOM mounting
    TodoListView ..> html_util : uses for element creation
```

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant View as DOM (View)
    participant App as App (Controller)
    participant Model as TodoListModel

    Note right of User: Todo追加フロー
    User->>View: Todoタイトルを入力してSubmit
    View->>App: submitイベント発火
    App->>Model: addTodo(newItem)
    Note over Model: 内部状態を更新
    Model->>App: "change" イベント通知 (EventEmitter)
    App->>Model: getTodoItems() で最新データを取得
    App->>App: TodoListView を使って新しいDOMを構築
    App->>View: View再構築を指示し、新しいTodoを表示

    Note right of User: Todo更新フロー
    User->>View: Todoのチェックボックスをクリック
    View->>App: onUpdateTodo コールバック発火
    App->>Model: updateTodo({ id, completed })
    Note over Model: 内部状態を更新
    Model->>App: "change" イベント通知 (EventEmitter)
    App->>Model: getTodoItems() で最新データを取得
    App->>App: TodoListView を使って新しいDOMを構築
    App->>View: View再構築を指示し、新しいTodoを表示

    Note right of User: Todo削除フロー
    User->>View: 削除ボタン(x)をクリック
    View->>App: onDeleteTodo コールバック発火
    App->>Model: deleteTodo({ id })
    Note over Model: 内部状態を更新
    Model->>App: "change" イベント通知 (EventEmitter)
    App->>Model: getTodoItems() で最新データを取得
    App->>App: TodoListView を使って新しいDOMを構築
    App->>View: View再構築を指示し、新しいTodoを表示
```