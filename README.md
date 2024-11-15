# AI Code Reviewer

AI Code Reviewer is a GitHub Action that leverages various AI language models, including OpenAI's GPT-4, to provide intelligent feedback and suggestions on
your pull requests. This powerful tool supports multiple AI providers and models, offering flexible code review options. It helps improve code quality and saves developers time by automating the code
review process with advanced AI capabilities.

## Features

-   Reviews pull requests using various AI language models, including OpenAI's GPT-4.
-   Provides intelligent comments and suggestions for improving your code.
-   Supports multiple AI providers and models for flexible code review options.
-   Filters out files that match specified exclude patterns.
-   Easy to set up and integrate into your GitHub workflow.

## Setup

1. To use this GitHub Action, you need an API key for the provider and model of your choice. If you don't have one, sign up for an API key at the respective provider's website.

2. Add the API key as a GitHub Secret in your repository with the appropriate name (e.g., `OPENAI_API_KEY` for OpenAI). You can find more information about GitHub Secrets [here](https://docs.github.com/en/actions/reference/encrypted-secrets).

3. Create a `.github/workflows/main.yml` file in your repository and add the following content:

```yaml
name: AI Code Reviewer

on:
    pull_request:
        types:
            - opened
            - synchronize
permissions: write-all
jobs:
    review:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout Repo
              uses: actions/checkout@v3

            - name: AI Code Reviewer
              uses: globuslimited/ai-code-reviewer@main
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }} # Optional: only if using OpenAI models
                  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }} # Optional: only if using Anthropic models
                  GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }} # Optional: only if using Google models
              with:
                  model: "openai:gpt-4o"
                  exclude: "**/*.json, **/*.md" # Optional: exclude patterns separated by commas
```

4. Customize the `exclude` input if you want to ignore certain file patterns from being reviewed.

5. Commit the changes to your repository, and AI Code Reviewer will start working on your future pull requests.

## How It Works

The AI Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, and sends code chunks to
the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
