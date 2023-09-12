interface PromptLike {
    /**
     * Based on file name.
     */
    id: string

    /**
     * File where the prompt comes from (if any).
     */
    filename?: string

    /**
     * Something like "Summarize children", show in UI.
     */
    title: string

    /**
     * Longer description of the prompt. Shows in UI grayed-out.
     */
    description?: string

    /**
     * The text of the prompt JS source code.
     */
    jsSource: string

    /**
     * The actual text of the prompt template.
     * Only used for system prompts.
     */
    text: string
}

interface PromptTemplate extends PromptLike {
    /**
     * Which model to use.
     *
     * @default gpt-4
     */
    model?: "gpt-4" | "gpt-4-32k" | "gpt-3.5-turbo" | string

    /**
     * Temperature to use. Higher temperature means more hallucination/creativity.
     * Range 0.0-2.0.
     *
     * @default 0.2
     */
    temperature?: number

    /**
     * When to stop producing output.
     *
     * @default 800
     */
    maxTokens?: number

    /**
     * Only applies when children are ...
     */
    children?: "present" | "absent"

    /**
     * Indicates which fragment the prompt applies to. `root` uses the root fragment instead of the current.
     */
    context?: "current" | "root"

    /**
     * Where the text generated by the prompt goes:
     * - replaces the current file ("file")
     * - replaces the current fragment ("fragment")
     * - replaces children of the current fragment ("children")
     * - is shown to the user ("nothing")
     */
    replaces: "file" | "fragment" | "children" | "nothing"

    /**
     * If this is `["a", "b.c"]` then the prompt will include values of variables:
     * `@prompt`, `@prompt.a`, `@prompt.b`, `@prompt.b.c`
     * TODO implement this
     *
     * @example ["summarize"]
     * @example ["code.ts.node"]
     */
    categories?: string[]

    /**
     * Don't show it to the user in lists. Template `system.*` are automatically unlisted.
     */
    unlisted?: boolean

    /**
     * Set if this is a system prompt.
     */
    isSystem?: boolean

    /**
     * Template identifiers for the system prompts (concatenated). Defaults to `system` if not found.
     */
    system?: string | string[]

    /**
     * File extension this prompt applies to; if present. Defaults to `.md`.
     */
    input?: string

    /**
     * Output file extension like '.py', '.test.js' or a pattern like 'test_*.py'.
     *
     * If present, the generate text will serialized in a file `./{md-base-file-name}{output}`.
     * Ensure that your generated file is unique by using longer extension like `.mytool.py`.
     */
    output?: string

    /**
     * Name of link to `output`
     */
    outputLinkName?: string

    /**
     * Content type of the `output` fenced section in the AI generation log.
     * Defaults to the output file extension or `markdown`.
     */
    outputContentType?: string

    /**
     * Specifies a folder to create output files into
     */
    outputFolder?: string

    /**
     * If true, include `subtreePre`, `subtreePost`, and possibly `outputPre` and `outputPost` variables.
     */
    prePost?: boolean

    /**
     * This prompt emits a VALID, INVALID answer in the output and will be suggested for auditing
     * operations.
     */
    audit?: boolean
}

interface FileType extends PromptLike {
    /**
     * Pattern for the file type.
     * Always uses '/' as path separator.
     * If there is no '/' in the pattern, '**\/' is prepended.
     * This docstring sometimes uses '\/' for '/' to avoid finishing the doc-comment!
     *
     * @example "*.coarch.md", "*.{tsx,ts}", "client/**\/*.ts"
     */
    glob: string

    /**
     * Patterns of files to exclude if any.
     * Some files (including `node_modules`) are globally excluded.
     */
    globExclude?: string

    /**
     * File type to use in ``` markdown fences.
     *
     * @example "js", "ts", "c", "cpp", "markdown", "python", "text"
     */
    language: string

    /**
     * Single-line comment syntax to use in the file.
     * Default depends on `language`, or "#" if unknown.
     *
     * @example "#", "//", "--"
     */
    lineComment?: string

    /**
     * Whether to try to extract a tree structure of fragments when parsing.
     * Currently only works for "markdown" language.
     */
    tree?: boolean
}

/**
 * Represent a file linked from a .coarch document.
 */
interface LinkedFile {
    /**
     * If file is linked through `[foo](./path/to/file)` then this is "foo"
     */
    label: string

    /**
     * Name of the file, relative to project root.
     */
    filename: string

    /**
     * Content of the file.
     */
    content: string

    /**
     * Either built-in, or user-defined file type.
     */
    // TODO filetype: FileType
}

/**
 * A set of text extracted from the context of the prompt execution
 */
interface ExpansionVariables {
    /**
     * Used to delimit multi-line strings.
     * `fence(X)` is preferred (equivalent to `` $`${env.fence}\n${X}\n${env.fence}` ``)
     */
    fence: string

    /**
     * Extract heading text
     */
    heading: string
    /**
     * Extract heading sub title
     */
    subheading: string

    /**
     * Full text of the current fragment
     */
    fragment: string
    /**
     * Immediate descendants of the current fragment, without the whole tree
     */
    children: string

    /**
     * Content of the generated file from the last prompt execution.
     * This variable is empty for multi-file output.
     */
    output: string

    outputPre: string
    outputPost: string

    subtree: string
    subtreePre: string
    subtreePost: string

    // this needs some love
    refChildren: string

    /**
     * Current file
     */
    file: LinkedFile

    /**
     * List of linked files parsed in context
     */
    links: LinkedFile[]

    /**
     * List of files pointing to this fragment
     */
    parents: LinkedFile[]

    /**
     * If the contents of this variable occurs in output, an error message will be shown to the user.
     */
    error: string

    /**
     * Prompt execution options specified in the UI
     */
    promptOptions: {
        /**
         * Ignore existing output
         */
        ignoreOutput?: boolean
    } & Record<string, string | boolean>

    /**
     * current prompt template
     */
    template: PromptTemplate

    /**
     * User defined variables
     */
    vars: Record<string, string>
}

type MakeOptional<T, P extends keyof T> = Partial<Pick<T, P>> & Omit<T, P>

type PromptArgs = MakeOptional<
    Omit<PromptTemplate, "text" | "id" | "jsSource">,
    "replaces"
>

type StringLike = string | LinkedFile | LinkedFile[]

// keep in sync with prompt_type.d.ts
interface PromptContext {
    text(body: string): void
    $(strings: TemplateStringsArray, ...args: any[]): void
    prompt(options: PromptArgs): void
    systemPrompt(options: PromptArgs): void
    fence(body: StringLike): void
    def(name: string, body: StringLike): void
    defFiles(files: LinkedFile[]): void
    env: ExpansionVariables
}
