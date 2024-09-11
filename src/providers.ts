import { experimental_createProviderRegistry } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export const providerRegistry = experimental_createProviderRegistry({
    openai,
    anthropic,
    google
});