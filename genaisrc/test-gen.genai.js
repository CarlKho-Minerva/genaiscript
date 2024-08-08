script({
    title: "unit test generator",
    system: ["system", "system.typescript", "system.files"],
    tools: ["fs_find_files", "fs_read_file"],
})

const code = def("CODE", env.files)

// const { text: keywords } = await runPrompt(_ => {
//     const file = _.def("FILE", env.files)
//     _.$`You are an expert TypeScript developer.
// Extract the list of exported functions and classes in ${file},
// as a comma separate list of keywords. Be concise.`
// }, { model: "gpt-3.5-turbo" })
// const relevantTests = await retrieval.vectorSearch(keywords, testFiles)
// const tests = def("TESTS", relevantTests)

$`## Step 1

For each file in ${code}, 
generate a plan to test the source code in each file

- use input test files from packages/sample/src/rag/*
- only generate tests for files in ${code}

## Step 2

For each generate test, implement the TypeScript source code in a test file with suffix ".genai.test.ts"
in the same folder as the source file.


- use "describe", "test", "beforeEach" from the "node:test" test runner framework

${fence('import test, { beforeEach, describe } from "node:test"', "js")}

- use "assert" from node:assert/strict (default export)
- the test title should describe the tested function
- you must implement the body of each test. THIS IS IMPORTANT.
- do not use mocks
- if you need to create files, place them under a "temp" folder
- use Partial<T> to declare a partial type of a type T
- do NOT generate negative test cases
`
