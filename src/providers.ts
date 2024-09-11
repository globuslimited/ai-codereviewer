import { experimental_createProviderRegistry } from "ai";
import { openai } from "@ai-sdk/openai";

export const providerRegistry = experimental_createProviderRegistry({
    openai
});