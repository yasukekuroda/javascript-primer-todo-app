import { render } from "./view/html-util.js";
import { TodoListView } from "./view/TodoListView.js";
import { TodoItemModel } from "./model/TodoItemModel.js";
import { TodoListModel } from "./model/TodoListModel.js";

export class App {
    #todoListView = new TodoListView();
    #todoListModel = new TodoListModel([]);

    formElement;
    formInputElement;
    todoListElement;
    todoCountElement;
    constructor({ formElement, formInputElement, todoListElement, todoCountElement }) {
        this.formElement = formElement;
        this.formInputElement = formInputElement;
        this.todoCountElement = todoCountElement;
        this.todoListElement = todoListElement;
    }

    /**
     * [リスナー関数] Todo追加時にCallされる
     * 処理内容： モデルを更新する.
     * @param {string} title
     */
    #handleAdd = (title) => {
        this.#todoListModel.addTodo(new TodoItemModel({ title, completed: false }));
    };

    /**
     * [リスナー関数] Todo更新時にCallされる
     * 処理内容： モデルを更新する.
     * @param {{ id:number, completed: boolean }}
     */
    #handleUpdate = ({ id, completed }) => {
        this.#todoListModel.updateTodo({ id, completed });
    };

    /**
     * [リスナー関数] Todo削除時にCallされる
     * 処理内容： モデルを更新する.
     * @param {{ id: number }}
     */
    #handleDelete = ({ id }) => {
        this.#todoListModel.deleteTodo({ id });
    };


    /**
     * [リスナー関数] フォーム送信した際にCallされる
     * 処理内容： モデルを更新する.
     * @param {Event} event
     */
    #handleSubmit = (event) => {
        event.preventDefault();
        const inputElement = this.formInputElement;
        this.#handleAdd(inputElement.value);
        inputElement.value = "";
    };

    /**
     * [リスナー関数] モデル(=TodoListModel)の状態を変更した際にCallされる
     * 処理内容： Viewを再構築する(=更新後Modelを元にTodoを画面表示する)。
     */
    #handleChange = () => {
        const newTodoListElement = this.#todoListView.createListElement(this.#todoListModel.getTodoItems(), {
            onUpdateTodo: ({ id, completed }) => {
                this.#handleUpdate({ id, completed });
            },
            onDeleteTodo: ({ id }) => {
                this.#handleDelete({ id });
            }
        });
        render(newTodoListElement, this.todoListElement);
        this.todoCountElement.textContent = `Todoアイテム数: ${this.#todoListModel.getTotalCount()}`;
    };

    /**
     * アプリとDOMの紐づけを登録する関数
     */
    mount() {
        this.formElement.addEventListener("submit", this.#handleSubmit);
        this.#todoListModel.onChange(this.#handleChange);
    }

    /**
     * アプリとDOMの紐づけを解除する関数
     */
    unmount() {
        this.formElement.removeEventListener("submit", this.#handleSubmit);
        this.#todoListModel.offChange(this.#handleChange);
    }
}
